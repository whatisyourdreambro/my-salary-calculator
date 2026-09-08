import { afterEach, describe, expect, it, vi } from "vitest";
import { handleContactPost } from "@/lib/server/contactHandler";
import { CONTACT_SQL } from "@/lib/server/contactSql";
import * as contactRoute from "@/app/api/contact/route";
import {
  CONTACT_RETENTION_SECONDS, FEEDBACK_WINDOW_SECONDS, feedbackRateKey, getFeedbackBindings, normalizeFeedbackPath,
  type FeedbackBindings, type FeedbackDatabase, type FeedbackResult, type FeedbackStatement,
} from "@/lib/server/feedbackStorage";

const now = Date.parse("2026-09-08T15:01:00Z");
const id = "21926472-c435-4fe1-87c2-67d735a302bf";
const secret = "test-only-not-a-real-secret-value-123456789";
const input = { submissionId: id, type: "explanation", pagePath: "/", body: "성과급도 연봉에 포함하나요?", inquiryConsent: true };

function request(value: unknown = input, headers: Record<string, string> = {}, url = "https://www.moneysalary.com/api/contact") {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://www.moneysalary.com", "cf-connecting-ip": "192.0.2.1", ...headers },
    body: JSON.stringify(value),
  });
}

type Statement = FeedbackStatement & { sql: string; values: (string | number | null)[] };
function storage() {
  let savedHash: string | undefined;
  const db: FeedbackDatabase = {
    prepare(sql) {
      const statement: Statement = {
        sql, values: [],
        bind(...values) { this.values = values; return this; },
      };
      return statement;
    },
    batch: vi.fn(async (statements: FeedbackStatement[]): Promise<FeedbackResult[]> => {
      const insert = statements[1] as Statement;
      const replay = savedHash !== undefined;
      savedHash ??= insert.values[1] as string;
      return [
        { success: true, meta: { changes: replay ? 0 : 1 }, results: [] },
        { success: true, meta: { changes: replay ? 0 : 1 }, results: [] },
        { success: true, meta: { changes: 0 }, results: [{ payload_hash: savedHash }] },
      ];
    }),
  };
  return { db, bindings: { FEEDBACK_DB: db, FEEDBACK_RATE_LIMIT_SECRET: secret } satisfies FeedbackBindings };
}

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe("private contact API validation", () => {
  it.each([
    ["missing origin", { origin: "" }, 403, "INVALID_ORIGIN"],
    ["cross-site origin", { origin: "https://example.com" }, 403, "INVALID_ORIGIN"],
    ["cross-site fetch", { "sec-fetch-site": "cross-site" }, 403, "INVALID_ORIGIN"],
    ["form media", { "content-type": "application/x-www-form-urlencoded" }, 415, "UNSUPPORTED_MEDIA_TYPE"],
    ["compressed payload", { "content-encoding": "gzip" }, 415, "UNSUPPORTED_MEDIA_TYPE"],
    ["large declared payload", { "content-length": "4097" }, 413, "PAYLOAD_TOO_LARGE"],
  ])("rejects %s before storing", async (_label, headers, status, code) => {
    const { db, bindings } = storage();
    const result = await handleContactPost(request(input, headers as Record<string, string>), bindings, now);
    expect(result.status).toBe(status);
    expect(await result.json()).toEqual({ ok: false, error: code });
    expect(db.batch).not.toHaveBeenCalled();
  });

  it.each([
    null, [], { ...input, extra: "private value" }, { ...input, submissionId: "bad" },
    { ...input, type: "public_comment" }, { ...input, body: " " },
    { ...input, body: "x".repeat(501) }, { ...input, body: "<script>alert(1)</script>" },
    { ...input, body: "bad\u0000value" },
    { ...input, pagePath: "https://example.com" }, { ...input, pagePath: "/?salary=60000000" },
    { ...input, pagePath: "/" + "x".repeat(200) }, { ...input, replyConsent: "true" },
  ])("rejects an invalid input without reflecting its content: %#", async value => {
    const { db, bindings } = storage();
    const result = await handleContactPost(request(value), bindings, now);
    expect(result.status).toBe(400);
    expect((await result.json()).ok).toBe(false);
    expect(db.batch).not.toHaveBeenCalled();
  });

  it.each([
    [{ ...input, inquiryConsent: false }, "CONSENT_REQUIRED"],
    [{ ...input, inquiryConsent: "true" }, "CONSENT_REQUIRED"],
    [{ ...input, replyEmail: "name@example.com" }, "REPLY_CONSENT_REQUIRED"],
    [{ ...input, replyEmail: "invalid", replyConsent: true }, "INVALID_REPLY_EMAIL"],
    [{ ...input, replyEmail: "a@example.com\r\nBcc: x@example.com", replyConsent: true }, "INVALID_REPLY_EMAIL"],
    [{ ...input, replyEmail: "a".repeat(255), replyConsent: true }, "INVALID_REPLY_EMAIL"],
    [{ ...input, replyEmail: ".name@example.com", replyConsent: true }, "INVALID_REPLY_EMAIL"],
    [{ ...input, replyEmail: "name..last@example.com", replyConsent: true }, "INVALID_REPLY_EMAIL"],
  ])("requires the appropriate consent and validates email: %#", async (value, code) => {
    const { db, bindings } = storage();
    const result = await handleContactPost(request(value), bindings, now);
    expect(result.status).toBe(400);
    expect(await result.json()).toEqual({ ok: false, error: code });
    expect(db.batch).not.toHaveBeenCalled();
  });

  it("limits actual stream bytes even without Content-Length", async () => {
    const { db, bindings } = storage();
    const result = await handleContactPost(request({ ...input, body: "가".repeat(2000) }), bindings, now);
    expect(result.status).toBe(413);
    expect(db.batch).not.toHaveBeenCalled();
  });

  it("rejects broken JSON", async () => {
    const { bindings } = storage();
    const result = await handleContactPost(new Request("https://www.moneysalary.com/api/contact", {
      method: "POST", headers: { origin: "https://www.moneysalary.com", "content-type": "application/json" }, body: "{",
    }), bindings, now);
    expect(await result.json()).toEqual({ ok: false, error: "INVALID_REQUEST" });
  });

  it("requires an explicitly configured matching preview origin", async () => {
    const { bindings } = storage();
    const preview = "https://feature.example.pages.dev";
    expect((await handleContactPost(request(input, { origin: preview }, `${preview}/api/contact`), bindings, now)).status).toBe(403);
    expect((await handleContactPost(request(input, { origin: preview }, `${preview}/api/contact`), { ...bindings, FEEDBACK_ALLOWED_ORIGIN: preview }, now)).status).toBe(201);
  });
});

describe("private contact persistence and failure handling", () => {
  it("the actual Edge route has no public read method and fails closed when unconfigured", async () => {
    vi.stubEnv("FEEDBACK_DB", undefined);
    vi.stubEnv("FEEDBACK_RATE_LIMIT_SECRET", undefined);
    vi.stubEnv("FEEDBACK_ALLOWED_ORIGIN", undefined);
    expect(Object.keys(contactRoute).sort()).toEqual(["POST", "dynamic", "runtime"]);
    expect(contactRoute.runtime).toBe("edge");
    expect(contactRoute.dynamic).toBe("force-dynamic");
    const result = await contactRoute.POST(request());
    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ ok: false, error: "UNAVAILABLE" });
  });

  it.each([{}, { FEEDBACK_RATE_LIMIT_SECRET: secret }, { FEEDBACK_RATE_LIMIT_SECRET: "short" }])("fails closed for missing storage or secret: %#", async bindings => {
    expect((await handleContactPost(request(), bindings, now)).status).toBe(503);
  });

  it("rejects an absent or short secret even when the DB exists", async () => {
    const { db } = storage();
    expect((await handleContactPost(request(), { FEEDBACK_DB: db }, now)).status).toBe(503);
    expect((await handleContactPost(request(), { FEEDBACK_DB: db, FEEDBACK_RATE_LIMIT_SECRET: "short" }, now)).status).toBe(503);
    expect(db.batch).not.toHaveBeenCalled();
  });

  it("does not trust X-Forwarded-For when Cloudflare's IP is missing", async () => {
    const { db, bindings } = storage();
    const result = await handleContactPost(request(input, { "cf-connecting-ip": "", "x-forwarded-for": "192.0.2.1" }), bindings, now);
    expect(result.status).toBe(503);
    expect(db.batch).not.toHaveBeenCalled();
  });

  it("persists privately, only confirms after the transaction, and does not log", async () => {
    const { db, bindings } = storage();
    const log = vi.spyOn(console, "log");
    const error = vi.spyOn(console, "error");
    const result = await handleContactPost(request({ ...input, replyEmail: " name@example.com ", replyConsent: true }), bindings, now);
    expect(result.status).toBe(201);
    expect(await result.json()).toEqual({ ok: true, receiptId: id, duplicate: false });
    expect(result.headers.get("cache-control")).toBe("private, no-store");
    expect(result.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    const statements = vi.mocked(db.batch).mock.calls[0][0] as Statement[];
    expect(statements.map(s => s.sql)).toEqual([CONTACT_SQL.reserveRate, CONTACT_SQL.insertInquiry, CONTACT_SQL.receipt]);
    expect(statements[1].values).toEqual([
      id, expect.stringMatching(/^[a-f0-9]{64}$/), "explanation", "/", input.body,
      "name@example.com", 1, "contact-v1", Math.floor(now / 1000), Math.floor(now / 1000) + CONTACT_RETENTION_SECONDS,
    ]);
    expect(JSON.stringify(statements)).not.toContain("192.0.2.1");
    expect(statements[0].values[0]).toMatch(/^[a-f0-9]{64}$/);
    expect(log).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("accepts an anonymous inquiry and normalizes an empty email to null", async () => {
    const { db, bindings } = storage();
    expect((await handleContactPost(request({ ...input, replyEmail: "  ", replyConsent: false }), bindings, now)).status).toBe(201);
    const insert = vi.mocked(db.batch).mock.calls[0][0][1] as Statement;
    expect(insert.values.slice(5, 7)).toEqual([null, 0]);
  });

  it("stores evidence/business URLs as private plain text without fetching them", async () => {
    const { db, bindings } = storage();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const body = "근거 https://example.com/source 와 사용처 www.example.com 을 확인해 주세요.";
    const result = await handleContactPost(request({ ...input, body }), bindings, now);
    expect(result.status).toBe(201);
    const insert = vi.mocked(db.batch).mock.calls[0][0][1] as Statement;
    expect(insert.values[4]).toBe(body);
    expect(await result.json()).toEqual({ ok: true, receiptId: id, duplicate: false });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns the same receipt for a normalized replay without updating the inquiry", async () => {
    const { bindings } = storage();
    await handleContactPost(request(), bindings, now);
    const replay = await handleContactPost(request({ ...input, submissionId: id.toUpperCase(), body: ` ${input.body} ` }), bindings, now + 1000);
    expect(replay.status).toBe(200);
    expect(await replay.json()).toEqual({ ok: true, receiptId: id, duplicate: true });
  });

  it("rejects a receipt reused with different body or reply details", async () => {
    const { bindings } = storage();
    await handleContactPost(request(), bindings, now);
    for (const changed of [{ ...input, body: "Different question" }, { ...input, replyEmail: "new@example.com", replyConsent: true }]) {
      const result = await handleContactPost(request(changed), bindings, now);
      expect(result.status).toBe(409);
      expect(await result.json()).toEqual({ ok: false, error: "RECEIPT_CONFLICT" });
    }
  });

  it("reports a real exhausted reservation as 429 with a bounded retry time", async () => {
    const { db, bindings } = storage();
    vi.mocked(db.batch).mockResolvedValue(Array.from({ length: 3 }, () => ({ success: true, meta: { changes: 0 }, results: [] })));
    const result = await handleContactPost(request(), bindings, now);
    expect(result.status).toBe(429);
    expect(Number(result.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(Number(result.headers.get("retry-after"))).toBeLessThanOrEqual(FEEDBACK_WINDOW_SECONDS);
  });

  it.each(["throw", "unsuccessful", "missing receipt"])("does not claim success when persistence is uncertain: %s", async kind => {
    const { db, bindings } = storage();
    const error = vi.spyOn(console, "error");
    if (kind === "throw") vi.mocked(db.batch).mockRejectedValue(new Error(`private SQL ${input.body}`));
    else vi.mocked(db.batch).mockResolvedValue(Array.from({ length: 3 }, () => ({ success: kind !== "unsuccessful", meta: { changes: 1 }, results: [] })));
    const result = await handleContactPost(request(), bindings, now);
    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ ok: false, error: "UNAVAILABLE" });
    expect(error).not.toHaveBeenCalled();
  });
});

describe("feedback privacy primitives", () => {
  it("rotates the anonymous rate key by time window, IP and secret", async () => {
    const key = await feedbackRateKey(secret, "192.0.2.1", 600);
    expect(key).toMatch(/^[a-f0-9]{64}$/);
    expect(key).not.toBe(await feedbackRateKey(secret, "192.0.2.1", 1200));
    expect(key).not.toBe(await feedbackRateKey(secret, "192.0.2.2", 600));
    expect(key).not.toBe(await feedbackRateKey(secret + "changed", "192.0.2.1", 600));
  });

  it.each([
    ["/share/secret-payload", "/share/[redacted]"], ["/salary/60000000", "/salary/[amount]"],
    ["/salary/6000-manwon", "/salary/[amount]"], ["/guides", "/guides"],
    ["//evil.example", null], ["/a/../b", null], ["/%2Fexample.com", null], ["/%5cevil", null], ["/%00", null],
    ["/guides#salary=10", null], ["/%zz", null],
  ])("normalizes or rejects path %s", (value, expected) => {
    expect(normalizeFeedbackPath(value)).toBe(expected);
  });

  it("reads environment bindings at request time rather than capturing a build value", () => {
    vi.stubEnv("FEEDBACK_RATE_LIMIT_SECRET", "first-test-value");
    expect(getFeedbackBindings().FEEDBACK_RATE_LIMIT_SECRET).toBe("first-test-value");
    vi.stubEnv("FEEDBACK_RATE_LIMIT_SECRET", "second-test-value");
    expect(getFeedbackBindings().FEEDBACK_RATE_LIMIT_SECRET).toBe("second-test-value");
  });
});
