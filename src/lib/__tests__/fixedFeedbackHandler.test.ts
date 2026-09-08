import { afterEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";
import { FIXED_FEEDBACK_CONFIG, FIXED_FEEDBACK_TARGETS } from "@/lib/fixedFeedbackContract";
import { FIXED_FEEDBACK_RETENTION_SECONDS, handleFixedFeedbackPost } from "@/lib/server/fixedFeedbackHandler";
import { handleContactPost } from "@/lib/server/contactHandler";
import { FIXED_FEEDBACK_SQL } from "@/lib/server/fixedFeedbackSql";
import { CONTACT_SQL } from "@/lib/server/contactSql";
import * as route from "@/app/api/feedback/route";
import { feedbackRateKey, type FeedbackBindings, type FeedbackDatabase, type FeedbackResult, type FeedbackStatement } from "@/lib/server/feedbackStorage";

const now = Date.parse("2026-09-08T15:01:00Z");
const id = "21926472-c435-4fe1-87c2-67d735a302bf";
const secret = "test-only-not-a-real-secret-value-123456789";
const input = { submissionId: id, target: "samsung_bonus", vote: "helpful", reason: null, feedbackConsent: true };
const contactInput = { submissionId: id, type: "explanation", pagePath: "/", body: "Synthetic private inquiry", inquiryConsent: true };
const uuid = (number: number) => `21926472-c435-4fe1-87c2-${String(number).padStart(12, "0")}`;

function request(value: unknown = input, headers: Record<string, string> = {}, url = "https://www.moneysalary.com/api/feedback") {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://www.moneysalary.com", "cf-connecting-ip": "192.0.2.1", ...headers },
    body: JSON.stringify(value),
  });
}

type Statement = FeedbackStatement & { sql: string; values: (string | number | null)[] };
// Stateful transaction double for handler decisions. The Python test executes actual SQL.
function storage() {
  const receipts = { contact: new Map<string, string>(), feedback: new Map<string, string>() };
  const rates = new Map<string, number>();
  const db: FeedbackDatabase = {
    prepare(sql) {
      const statement: Statement = { sql, values: [], bind(...values) { this.values = values; return this; } };
      return statement;
    },
    batch: vi.fn(async (raw: FeedbackStatement[]): Promise<FeedbackResult[]> => {
      const [reserve, insert] = raw as Statement[];
      const table = insert.sql === CONTACT_SQL.insertInquiry ? receipts.contact : receipts.feedback;
      const [key, , receiptId, limit] = reserve.values;
      const previous = table.get(receiptId as string);
      const accepted = previous === undefined && (rates.get(key as string) ?? 0) < Number(limit);
      if (accepted) {
        rates.set(key as string, (rates.get(key as string) ?? 0) + 1);
        table.set(receiptId as string, insert.values[1] as string);
      }
      const hash = table.get(receiptId as string);
      return [
        { success: true, meta: { changes: accepted ? 1 : 0 }, results: [] },
        { success: true, meta: { changes: accepted ? 1 : 0 }, results: [] },
        { success: true, meta: { changes: 0 }, results: hash === undefined ? [] : [{ payload_hash: hash }] },
      ];
    }),
  };
  return { db, rates, receipts, bindings: { FEEDBACK_DB: db, FEEDBACK_RATE_LIMIT_SECRET: secret } satisfies FeedbackBindings };
}

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe("fixed feedback request boundary", () => {
  it.each([
    ["missing origin", { origin: "" }, 403],
    ["cross-site origin", { origin: "https://example.com" }, 403],
    ["cross-site fetch", { "sec-fetch-site": "cross-site" }, 403],
    ["form media", { "content-type": "application/x-www-form-urlencoded" }, 415],
    ["compressed body", { "content-encoding": "gzip" }, 415],
    ["declared oversize", { "content-length": "1025" }, 413],
    ["invalid length", { "content-length": "-1" }, 413],
  ])("rejects %s without storing", async (_label, headers, status) => {
    const { db, bindings } = storage();
    const result = await handleFixedFeedbackPost(request(input, headers as Record<string, string>), bindings, now);
    expect(result.status).toBe(status);
    expect(db.batch).not.toHaveBeenCalled();
    expect(result.headers.get("cache-control")).toBe("private, no-store");
  });

  it.each([
    null, [], "text", { ...input, submissionId: "not-uuid" },
    { ...input, target: "all_pages" }, { ...input, target: "__proto__" },
    { ...input, target: "/calc/samsung-bonus" }, { ...input, vote: "yes" },
    { ...input, reason: "input_method" }, { ...input, reason: undefined },
    { ...input, vote: "confusing", reason: null },
    { ...input, vote: "confusing", reason: "salary_basis" },
    { ...input, vote: "confusing", reason: "my free text" },
    { ...input, vote: "confusing", reason: ["input_method"] },
    { ...input, body: "private text" }, { ...input, email: "private@example.com" },
    { ...input, amount: 60000000 }, { ...input, pagePath: "/?salary=60000000" },
    { ...input, clientId: "analytics-id" },
  ])("rejects unsupported and sensitive payload fields: %#", async value => {
    const { db, bindings } = storage();
    const result = await handleFixedFeedbackPost(request(value), bindings, now);
    expect(result.status).toBe(400);
    expect(await result.json()).toEqual({ ok: false, error: "INVALID_REQUEST" });
    expect(db.batch).not.toHaveBeenCalled();
  });

  it.each([false, "true", undefined, 1])("requires explicit processing consent: %s", async consent => {
    const { db, bindings } = storage();
    const result = await handleFixedFeedbackPost(request({ ...input, feedbackConsent: consent }), bindings, now);
    expect(await result.json()).toEqual({ ok: false, error: "CONSENT_REQUIRED" });
    expect(db.batch).not.toHaveBeenCalled();
  });

  it("bounds actual UTF-8 bytes even with a misleading small length", async () => {
    const { db, bindings } = storage();
    const result = await handleFixedFeedbackPost(request({ ...input, reason: "가".repeat(400) }, { "content-length": "1" }), bindings, now);
    expect(result.status).toBe(413);
    expect(db.batch).not.toHaveBeenCalled();
  });

  it.each(["{", new Uint8Array([0xff, 0xfe])])("rejects malformed JSON/UTF-8 without reflection: %#", async body => {
    const { db, bindings } = storage();
    const result = await handleFixedFeedbackPost(new Request("https://www.moneysalary.com/api/feedback", {
      method: "POST", headers: { origin: "https://www.moneysalary.com", "content-type": "application/json" }, body,
    }), bindings, now);
    expect(result.status).toBe(400);
    expect(await result.json()).toEqual({ ok: false, error: "INVALID_REQUEST" });
    expect(db.batch).not.toHaveBeenCalled();
  });

  it("requires the configured exact preview origin and request host", async () => {
    const { bindings } = storage();
    const preview = "https://test-branch.example.pages.dev";
    const previewRequest = () => request(input, { origin: preview }, `${preview}/api/feedback`);
    expect((await handleFixedFeedbackPost(previewRequest(), bindings, now)).status).toBe(403);
    expect((await handleFixedFeedbackPost(previewRequest(), { ...bindings, FEEDBACK_ALLOWED_ORIGIN: preview }, now)).status).toBe(201);
    expect((await handleFixedFeedbackPost(request(input, { origin: preview }), { ...bindings, FEEDBACK_ALLOWED_ORIGIN: preview }, now)).status).toBe(403);
    expect((await handleFixedFeedbackPost(request(), { ...bindings, FEEDBACK_ALLOWED_ORIGIN: preview + "/" }, now)).status).toBe(503);
  });

  it.each(FIXED_FEEDBACK_TARGETS)("accepts only the configured reasons and server path for %s", async target => {
    for (const reason of FIXED_FEEDBACK_CONFIG[target].reasons) {
      const { db, bindings } = storage();
      const result = await handleFixedFeedbackPost(request({ ...input, target, vote: "confusing", reason: reason.value }), bindings, now);
      expect(result.status).toBe(201);
      const insert = vi.mocked(db.batch).mock.calls[0][0][1] as Statement;
      expect(insert.values.slice(2, 6)).toEqual([target, FIXED_FEEDBACK_CONFIG[target].path, "confusing", reason.value]);
    }
  });
});

describe("fixed feedback persistence", () => {
  it("has only the actual Edge POST route and fails closed without bindings", async () => {
    vi.stubEnv("FEEDBACK_DB", undefined);
    vi.stubEnv("FEEDBACK_RATE_LIMIT_SECRET", undefined);
    vi.stubEnv("FEEDBACK_ALLOWED_ORIGIN", undefined);
    expect(Object.keys(route).sort()).toEqual(["POST", "dynamic", "runtime"]);
    expect(route.runtime).toBe("edge");
    expect(route.dynamic).toBe("force-dynamic");
    const result = await route.POST(request());
    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ ok: false, error: "UNAVAILABLE" });
  });

  it("requires DB, adequate secret and trusted IP, without forwarding fallback", async () => {
    const { db, bindings } = storage();
    for (const config of [{}, { FEEDBACK_RATE_LIMIT_SECRET: secret }, { FEEDBACK_DB: db }, { ...bindings, FEEDBACK_RATE_LIMIT_SECRET: "short" }]) {
      expect((await handleFixedFeedbackPost(request(), config, now)).status).toBe(503);
    }
    for (const ip of ["", "999.0.0.1", "invalid"]) {
      expect((await handleFixedFeedbackPost(request(input, { "cf-connecting-ip": ip, "x-forwarded-for": "192.0.2.1" }), bindings, now)).status).toBe(503);
    }
    expect(db.batch).not.toHaveBeenCalled();
  });

  it("confirms only a persisted receipt with fixed fields, no IP/log/network exposure", async () => {
    const { db, bindings } = storage();
    const log = vi.spyOn(console, "log");
    const error = vi.spyOn(console, "error");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await handleFixedFeedbackPost(request(), bindings, now);
    expect(result.status).toBe(201);
    expect(await result.json()).toEqual({ ok: true, receiptId: id, duplicate: false });
    expect(result.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(result.headers.get("x-content-type-options")).toBe("nosniff");
    const statements = vi.mocked(db.batch).mock.calls[0][0] as Statement[];
    expect(statements.map(s => s.sql)).toEqual([FIXED_FEEDBACK_SQL.reserveRate, FIXED_FEEDBACK_SQL.insertFeedback, FIXED_FEEDBACK_SQL.receipt]);
    expect(statements[1].values).toEqual([
      id, expect.stringMatching(/^[a-f0-9]{64}$/), "samsung_bonus", "/calc/samsung-bonus", "helpful", null,
      "fixed-feedback-v1", Math.floor(now / 1000), Math.floor(now / 1000) + FIXED_FEEDBACK_RETENTION_SECONDS,
    ]);
    expect(JSON.stringify(statements)).not.toContain("192.0.2.1");
    expect(log).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("waits for the database transaction before returning a success", async () => {
    const { db, bindings } = storage();
    const actualBatch = db.batch;
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    db.batch = async statements => { await gate; return actualBatch(statements); };
    let resolved = false;
    const result = handleFixedFeedbackPost(request(), bindings, now).then(value => { resolved = true; return value; });
    await new Promise(resolve => setTimeout(resolve, 5));
    expect(resolved).toBe(false);
    release();
    expect((await result).status).toBe(201);
  });

  it("normalizes UUID case and replays without another rate reservation", async () => {
    const { bindings, rates, receipts } = storage();
    await handleFixedFeedbackPost(request(), bindings, now);
    const replay = await handleFixedFeedbackPost(request({ ...input, submissionId: id.toUpperCase() }), bindings, now);
    expect(replay.status).toBe(200);
    expect(await replay.json()).toEqual({ ok: true, receiptId: id, duplicate: true });
    expect([...rates.values()]).toEqual([1]);
    expect(receipts.feedback.size).toBe(1);
  });

  it("rejects changed target/vote/reason for a previously stored receipt", async () => {
    const { bindings, rates } = storage();
    await handleFixedFeedbackPost(request({ ...input, vote: "confusing", reason: "source_date" }), bindings, now);
    for (const changed of [input, { ...input, target: "civil_pay_2027", vote: "confusing", reason: "source_date" }, { ...input, vote: "confusing", reason: "input_method" }]) {
      const result = await handleFixedFeedbackPost(request(changed), bindings, now);
      expect(result.status).toBe(409);
      expect(await result.json()).toEqual({ ok: false, error: "RECEIPT_CONFLICT" });
    }
    expect([...rates.values()]).toEqual([1]);
  });

  it("isolates real handler contact/feedback quotas and preserves existing default HMAC", async () => {
    const { bindings, rates, receipts } = storage();
    const legacyContactKey = createHmac("sha256", secret).update(["contact", "600", "192.0.2.1"].join("\0")).digest("hex");
    expect(await feedbackRateKey(secret, "192.0.2.1", 600)).toBe(legacyContactKey);
    expect(await feedbackRateKey(secret, "192.0.2.1", 600)).toBe(await feedbackRateKey(secret, "192.0.2.1", 600, "contact"));
    expect(await feedbackRateKey(secret, "192.0.2.1", 600)).not.toBe(await feedbackRateKey(secret, "192.0.2.1", 600, "feedback"));
    for (let n = 1; n <= 5; n++) {
      expect((await handleContactPost(request({ ...contactInput, submissionId: uuid(n) }, {}, "https://www.moneysalary.com/api/contact"), bindings, now)).status).toBe(201);
    }
    expect((await handleContactPost(request({ ...contactInput, submissionId: uuid(6) }, {}, "https://www.moneysalary.com/api/contact"), bindings, now)).status).toBe(429);
    for (let n = 1; n <= 5; n++) {
      expect((await handleFixedFeedbackPost(request({ ...input, submissionId: uuid(n) }), bindings, now)).status).toBe(201);
    }
    const limited = await handleFixedFeedbackPost(request({ ...input, submissionId: uuid(6) }), bindings, now);
    expect(limited.status).toBe(429);
    expect(await limited.json()).toEqual({ ok: false, error: "RATE_LIMITED" });
    expect(Number(limited.headers.get("retry-after"))).toBe(540);
    expect(receipts.contact.size).toBe(5);
    expect(receipts.feedback.size).toBe(5);
    expect([...rates.values()]).toEqual([5, 5]);
    expect((await handleFixedFeedbackPost(request({ ...input, submissionId: uuid(1) }), bindings, now)).status).toBe(200);
    expect((await handleFixedFeedbackPost(request({ ...input, submissionId: uuid(6) }), bindings, now + 600000)).status).toBe(201);
  });

  it.each(["throw", "unsuccessful", "missing receipt", "short batch", "malformed results"])("returns 503 without sensitive error logging when persistence is uncertain: %s", async kind => {
    const { db, bindings } = storage();
    const error = vi.spyOn(console, "error");
    if (kind === "throw") vi.mocked(db.batch).mockRejectedValue(new Error("private database diagnostic"));
    else if (kind === "short batch") vi.mocked(db.batch).mockResolvedValue([]);
    else vi.mocked(db.batch).mockResolvedValue(Array.from({ length: 3 }, () => ({ success: kind !== "unsuccessful", meta: { changes: 1 }, results: kind === "malformed results" ? undefined : [] })) as unknown as FeedbackResult[]);
    const result = await handleFixedFeedbackPost(request(), bindings, now);
    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ ok: false, error: "UNAVAILABLE" });
    expect(error).not.toHaveBeenCalled();
  });
});
