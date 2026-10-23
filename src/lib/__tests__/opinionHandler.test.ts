import { afterEach, describe, expect, it, vi } from "vitest";
import * as route from "@/app/api/participation/opinions/route";
import { handleOpinionPost, OPINION_RETENTION_SECONDS } from "@/lib/server/opinionHandler";
import { OPINION_RECEIPT_LOOKUP, OPINION_SQL } from "@/lib/server/opinionSql";
import { hasFreshParticipationCleanup, PARTICIPATION_HEALTH_SQL, PARTICIPATION_HEALTH_MAX_AGE_SECONDS, type ParticipationBindings } from "@/lib/server/participationRuntime";
import { feedbackPayloadHash, type FeedbackDatabase, type FeedbackResult, type FeedbackStatement } from "@/lib/server/feedbackStorage";
import { contentIssue } from "@/lib/contentModeration";

const now = Date.parse("2026-10-23T00:01:00Z");
const seconds = Math.floor(now / 1000);
const id = "21926472-c435-4fe1-87c2-67d735a302bf";
const input = { submissionId: id, contractVersion: "private-opinion-v1", target: "samsung_bonus", body: "공제 설명이 어려워요", inquiryConsent: true };
type Statement = FeedbackStatement & { sql: string; values: (string | number | null)[] };
function storage(cleanup: unknown = seconds, saved?: string) {
  let hash = saved;
  const db: FeedbackDatabase = {
    prepare(sql) { return { sql, values: [], bind(...values) { this.values = values; return this; } } as Statement; },
    batch: vi.fn(async (items: FeedbackStatement[]): Promise<FeedbackResult[]> => {
      const statements = items as Statement[];
      if (statements[0].sql === PARTICIPATION_HEALTH_SQL) return [{ success: true, meta: {}, results: cleanup === null ? [] : [{ last_cleanup_at: cleanup }] }];
      if (statements[0].sql === OPINION_RECEIPT_LOOKUP) return [{ success: true, meta: {}, results: hash ? [{ payload_hash: hash, contract_version: input.contractVersion }] : [] }];
      const duplicate = hash !== undefined;
      hash ??= statements[1].values[1] as string;
      return [0, 1, 2, 3].map(index => ({ success: true, meta: { changes: index < 3 && !duplicate ? 1 : 0 }, results: index === 3 ? [{ payload_hash: hash, contract_version: input.contractVersion }] : [] }));
    }),
  };
  const bindings: ParticipationBindings = { FEEDBACK_DB: db, FEEDBACK_RATE_LIMIT_SECRET: "test-only-long-secret-for-private-opinions-123", PARTICIPATION_OPINIONS_ENABLED: "1" };
  return { db, bindings };
}
function request(value: unknown = input, headers: Record<string, string> = {}) {
  return new Request("https://www.moneysalary.com/api/participation/opinions", { method: "POST", headers: { origin: "https://www.moneysalary.com", "content-type": "application/json", "cf-connecting-ip": "192.0.2.1", ...headers }, body: JSON.stringify(value) });
}
afterEach(() => { vi.restoreAllMocks(); });

describe("private opinion release gate and bounded validation", () => {
  it("exposes POST only and is unavailable by default", async () => {
    expect(Object.keys(route).sort()).toEqual(["POST", "dynamic"]);
    expect((await route.POST(request())).status).toBe(503);
    const { db, bindings } = storage();
    for (const enabled of [undefined, "true", "0"]) expect((await handleOpinionPost(request(), { ...bindings, PARTICIPATION_OPINIONS_ENABLED: enabled }, now)).status).toBe(503);
    expect(db.batch).not.toHaveBeenCalled();
  });
  it.each([
    [{ origin: "https://example.com" }, 403], [{ "sec-fetch-site": "cross-site" }, 403],
    [{ "content-type": "text/plain" }, 415], [{ "content-encoding": "gzip" }, 415],
    [{ "content-length": "2049" }, 413], [{ "cf-connecting-ip": "", "x-forwarded-for": "192.0.2.1" }, 503],
  ])("rejects bad transport without database access: %#", async (headers, status) => {
    const { db, bindings } = storage();
    expect((await handleOpinionPost(request(input, headers as Record<string, string>), bindings, now)).status).toBe(status);
    expect(db.batch).not.toHaveBeenCalled();
  });
  it.each([null, [], { ...input, target: "__proto__" }, { ...input, target: "other" }, { ...input, body: "가".repeat(201) }, { ...input, body: " " }, { ...input, contractVersion: "feedback-v1" }, { ...input, replyEmail: "x@example.com" }, { ...input, inquiryConsent: false }])("rejects invalid contracts: %#", async value => {
    const { db, bindings } = storage();
    expect((await handleOpinionPost(request(value), bindings, now)).status).toBe(400);
    expect(db.batch).not.toHaveBeenCalled();
  });
  it("limits actual streamed bytes", async () => {
    const { db, bindings } = storage();
    expect((await handleOpinionPost(request({ ...input, body: "가".repeat(1000) }), bindings, now)).status).toBe(413);
    expect(db.batch).not.toHaveBeenCalled();
  });
  it.each([null, 0, seconds + 1, seconds - PARTICIPATION_HEALTH_MAX_AGE_SECONDS, seconds - PARTICIPATION_HEALTH_MAX_AGE_SECONDS - 1, "123", 1.5])("fails closed for missing, invalid, future or stale cleanup: %#", async cleanup => {
    const { db, bindings } = storage(cleanup);
    expect((await handleOpinionPost(request(), bindings, now)).status).toBe(503);
    expect(vi.mocked(db.batch).mock.calls.every(([statements]) => statements.length === 1)).toBe(true);
  });
  it.each([[PARTICIPATION_HEALTH_MAX_AGE_SECONDS - 1, true], [PARTICIPATION_HEALTH_MAX_AGE_SECONDS, false], [PARTICIPATION_HEALTH_MAX_AGE_SECONDS + 1, false]])("requires cleanup age %i to be strictly below 26 hours", async (age, fresh) => {
    const { db } = storage(seconds - Number(age));
    expect(await hasFreshParticipationCleanup(db, seconds)).toBe(fresh);
  });
});

describe("private opinion moderation, receipts and storage", () => {
  it.each([["씨.발", "CONTENT_NOT_ALLOWED"], ["ㅅ\u200bㅂ", "CONTENT_NOT_ALLOWED"], ["f.u.c.k", "CONTENT_NOT_ALLOWED"], ["010-1234-5678", "PERSONAL_DATA_NOT_ALLOWED"], ["www.example.com", "PERSONAL_DATA_NOT_ALLOWED"], ["<b>hello</b>", "INVALID_REQUEST"]])("rejects content without writes, logs or outbound calls: %#", async (body, error) => {
    const { db, bindings } = storage();
    const log = vi.spyOn(console, "log");
    const errors = vi.spyOn(console, "error");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await handleOpinionPost(request({ ...input, body }), bindings, now);
    expect(await result.json()).toEqual({ ok: false, error });
    expect(db.batch).toHaveBeenCalledTimes(1);
    expect((vi.mocked(db.batch).mock.calls[0][0][0] as Statement).values).toEqual([id]);
    expect(log).not.toHaveBeenCalled(); expect(errors).not.toHaveBeenCalled(); expect(fetchSpy).not.toHaveBeenCalled();
  });
  it("stores accepted content privately with separate consent and 90-day expiry", async () => {
    const { db, bindings } = storage();
    const result = await handleOpinionPost(request(), bindings, now);
    expect(result.status).toBe(201);
    expect(await result.json()).toEqual({ ok: true, receiptId: id, duplicate: false });
    expect(result.headers.get("cache-control")).toBe("private, no-store");
    const statements = vi.mocked(db.batch).mock.calls.find(([items]) => items.length === 4)![0] as Statement[];
    expect(statements.map(item => item.sql)).toEqual(Object.values(OPINION_SQL));
    expect(statements[1].values).toEqual([id, expect.stringMatching(/^[a-f0-9]{64}$/), input.target, input.body, input.contractVersion, "ko-input-v3", seconds, seconds + OPINION_RETENTION_SECONDS]);
    expect(JSON.stringify(statements)).not.toContain("192.0.2.1");
    const again = await handleOpinionPost(request({ ...input, body: ` ${input.body} ` }), bindings, now);
    expect(again.status).toBe(200);
    const conflict = await handleOpinionPost(request({ ...input, body: "수정한 내용" }), bindings, now);
    expect(conflict.status).toBe(409);
    expect(vi.mocked(db.batch).mock.calls.filter(([items]) => items.length === 4)).toHaveLength(1);
  });
  it("confirms an already accepted unchanged receipt without applying a newer policy or creating a write", async () => {
    const body = "씨발";
    const hash = await feedbackPayloadHash(JSON.stringify([input.target, body, true, input.contractVersion]));
    const { db, bindings } = storage(null, hash);
    expect((await handleOpinionPost(request({ ...input, body }), bindings, now)).status).toBe(200);
    expect(db.batch).toHaveBeenCalledTimes(1);
  });
  it("replays an unchanged bare-domain opinion accepted under policy v2 before applying v3", async () => {
    const body = "example.dev";
    expect(contentIssue(body, "opinion")).toBe("PERSONAL_DATA_NOT_ALLOWED");
    const hash = await feedbackPayloadHash(JSON.stringify([input.target, body, true, input.contractVersion]));
    const { db, bindings } = storage(null, hash);
    const result = await handleOpinionPost(request({ ...input, body }), bindings, now);
    expect(await result.json()).toEqual({ ok: true, receiptId: id, duplicate: true });
    expect(db.batch).toHaveBeenCalledTimes(1);
  });
  it("returns 429 when the atomic daily or IP limit refuses a new write", async () => {
    const { db, bindings } = storage();
    const original = vi.mocked(db.batch).getMockImplementation()!;
    vi.mocked(db.batch).mockImplementation(async items => items.length === 4 ? items.map(() => ({ success: true, meta: { changes: 0 }, results: [] })) : original(items));
    expect((await handleOpinionPost(request(), bindings, now)).status).toBe(429);
  });
  it("does not expose a database error or claim an uncertain receipt", async () => {
    const { db, bindings } = storage();
    const error = vi.spyOn(console, "error");
    vi.mocked(db.batch).mockRejectedValue(new Error(`synthetic private SQL ${input.body}`));
    const result = await handleOpinionPost(request(), bindings, now);
    expect(await result.json()).toEqual({ ok: false, error: "UNAVAILABLE" });
    expect(error).not.toHaveBeenCalled();
  });
});
