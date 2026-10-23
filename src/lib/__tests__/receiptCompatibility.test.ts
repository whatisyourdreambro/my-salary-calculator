import { afterEach, describe, expect, it, vi } from "vitest";
import { createContactHandler } from "@/lib/server/contactHandler";
import { createFixedFeedbackHandler } from "@/lib/server/fixedFeedbackHandler";
import { createOpinionHandler } from "@/lib/server/opinionHandler";
import { createReactionHandler } from "@/lib/server/reactionHandler";
import { CONTACT_RECEIPT_LOOKUP } from "@/lib/server/contactSql";
import { FIXED_FEEDBACK_RECEIPT_LOOKUP } from "@/lib/server/fixedFeedbackSql";
import { OPINION_RECEIPT_LOOKUP } from "@/lib/server/opinionSql";
import { REACTION_RECEIPT_LOOKUP } from "@/lib/server/reactionSql";
import { PARTICIPATION_HEALTH_SQL, type ParticipationBindings } from "@/lib/server/participationRuntime";
import { feedbackPayloadHash, type FeedbackDatabase, type FeedbackStatement } from "@/lib/server/feedbackStorage";
import { normalizeReceiptRequest, RECEIPT_V1 } from "@/lib/server/receiptContracts";
import { FIXED_FEEDBACK_CONFIG } from "@/lib/fixedFeedbackContract";

const now = Date.parse("2026-10-23T00:01:00Z"), seconds = now / 1000;
const id = "21926472-c435-4fe1-87c2-67d735a302bf";
const body = "Synthetic\nprivate text";
const cases = [
  { module: "contact", create: createContactHandler, lookup: CONTACT_RECEIPT_LOOKUP, version: "contact-v1", column: "consent_version", path: "/api/contact",
    payload: { submissionId: id, type: "explanation", pagePath: "/", body, inquiryConsent: true },
    canonical: ["explanation", "/", body, null, false, "contact-v1"], changed: { body: "Changed" } },
  { module: "feedback", create: createFixedFeedbackHandler, lookup: FIXED_FEEDBACK_RECEIPT_LOOKUP, version: "fixed-feedback-v1", column: "consent_version", path: "/api/feedback",
    payload: { submissionId: id, target: "samsung_bonus", vote: "confusing", reason: "source_date", feedbackConsent: true },
    canonical: ["samsung_bonus", "/calc/samsung-bonus", "confusing", "source_date", "fixed-feedback-v1"], changed: { reason: "input_method" } },
  { module: "opinion", create: createOpinionHandler, lookup: OPINION_RECEIPT_LOOKUP, version: "private-opinion-v1", column: "contract_version", path: "/api/participation/opinions",
    payload: { submissionId: id, contractVersion: "private-opinion-v1", target: "samsung_bonus", body, inquiryConsent: true },
    canonical: ["samsung_bonus", body, true, "private-opinion-v1"], changed: { body: "Changed" } },
  { module: "reaction", create: createReactionHandler, lookup: REACTION_RECEIPT_LOOKUP, version: "public-reaction-v1", column: "contract_version", path: "/api/participation/reactions",
    payload: { submissionId: id, contractVersion: "public-reaction-v1", target: "samsung_bonus", vote: "confusing", reason: "source_date", publicAggregateConsent: true },
    canonical: ["samsung_bonus", "confusing", "source_date", true, "public-reaction-v1"], changed: { reason: "input_method" } },
] as const;
type Case = (typeof cases)[number];
type Statement = FeedbackStatement & { sql: string; values: (string | number | null)[] };
function request(item: Case, payload: unknown = item.payload) {
  return new Request(`https://www.moneysalary.com${item.path}`, { method: "POST", headers: {
    origin: "https://www.moneysalary.com", "content-type": "application/json", "cf-connecting-ip": "192.0.2.1",
  }, body: JSON.stringify(payload) });
}
async function fixture(item: Case, options: { missing?: boolean; finalOnly?: boolean; inserted?: boolean; override?: Record<string, unknown> } = {}) {
  const row = { payload_hash: await feedbackPayloadHash(JSON.stringify(item.canonical)), [item.column]: item.version,
    expires_at: seconds + 1, ...options.override };
  const db: FeedbackDatabase = {
    prepare(sql) { return { sql, values: [], bind(...values) { this.values = values; return this; } } as Statement; },
    batch: vi.fn(async (statements: FeedbackStatement[]) => {
      if (statements.length === 1) {
        const sql = (statements[0] as Statement).sql;
        if (sql === PARTICIPATION_HEALTH_SQL) return [{ success: true, meta: {}, results: [{ last_cleanup_at: seconds }] }];
        expect(sql).toBe(item.lookup);
        return [{ success: true, meta: { changes: 0 }, results: options.missing || options.finalOnly ? [] : [row] }];
      }
      // A concurrent deployment inserted this retained receipt after the lookup.
      return statements.map((_, index) => ({ success: true, meta: { changes: options.inserted && index < statements.length - 1 ? 1 : 0 }, results: index === statements.length - 1 ? [row] : [] }));
    }),
  };
  const bindings: ParticipationBindings = { FEEDBACK_DB: db, FEEDBACK_RATE_LIMIT_SECRET: "synthetic-test-secret-at-least-32-characters",
    PARTICIPATION_REACTIONS_ENABLED: "1", PARTICIPATION_OPINIONS_ENABLED: "1" };
  return { row, db, bindings };
}
afterEach(() => vi.restoreAllMocks());

describe.each(cases)("$module retained v1 contract compatibility", item => {
  it("accepts the explicit current v1 and preserves the original canonical hash and retention", async () => {
    const { db, bindings } = await fixture(item, { finalOnly: true, inserted: true });
    const result = await item.create()(request(item, { ...item.payload, contractVersion: item.version }), bindings, now);
    expect(result.status).toBe(201);
    const write = vi.mocked(db.batch).mock.calls.find(([statements]) => statements.length > 1)![0][1] as Statement;
    expect(write.values[1]).toBe(await feedbackPayloadHash(JSON.stringify(item.canonical)));
    expect(write.values).toContain(item.version);
    expect(write.values.at(-1)).toBe(seconds + 90 * 86400);
  });
  it("replays a stored v1 even when v1 is no longer admitted for new writes", async () => {
    const { db, bindings, row } = await fixture(item);
    const before = { ...row };
    const admit = vi.fn(() => false);
    const payload = { ...item.payload, submissionId: id.toUpperCase(), contractVersion: item.version,
      ...("body" in item.payload ? { body: ` ${body.replace(/\n/g, "\r\n")} ` } : {}) };
    const result = await item.create(admit)(request(item, payload), bindings, now);
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ ok: true, receiptId: id, duplicate: true });
    expect(admit).not.toHaveBeenCalled();
    expect(db.batch).toHaveBeenCalledTimes(1);
    expect((vi.mocked(db.batch).mock.calls[0][0][0] as Statement).values).toEqual([id]);
    expect(row).toEqual(before);
  });
  it("requires fresh consent for an absent v1 receipt after new-write admission changes", async () => {
    const { db, bindings } = await fixture(item, { missing: true });
    const result = await item.create(() => false)(request(item), bindings, now);
    expect(result.status).toBe(400);
    expect(await result.json()).toEqual({ ok: false, error: "CONTRACT_CHANGED" });
    expect(db.batch).toHaveBeenCalledTimes(1);
  });
  it("never treats an unknown or synthetic future request version as approved history", async () => {
    const { db, bindings } = await fixture(item);
    for (const contractVersion of ["unknown", item.version.replace(/1$/, "0"), item.version.replace(/1$/, "2"), null]) {
      const result = await item.create()(request(item, { ...item.payload, contractVersion }), bindings, now);
      expect(result.status).toBe(400);
      expect(await result.json()).toEqual({ ok: false, error: "INVALID_REQUEST" });
    }
    expect(db.batch).not.toHaveBeenCalled();
  });
  it("conflicts on changed content without updating the accepted receipt", async () => {
    const { db, bindings } = await fixture(item);
    const result = await item.create(() => false)(request(item, { ...item.payload, ...item.changed }), bindings, now);
    expect(result.status).toBe(409);
    expect(await result.json()).toEqual({ ok: false, error: "RECEIPT_CONFLICT" });
    expect(db.batch).toHaveBeenCalledTimes(1);
  });
  it.each([[-1, 409], [0, 409], [1, 200]])("enforces receipt expiry at now%+i", async (offset, status) => {
    const { db, bindings } = await fixture(item, { override: { expires_at: seconds + offset } });
    expect((await item.create()(request(item), bindings, now)).status).toBe(status);
    expect(db.batch).toHaveBeenCalledTimes(1);
  });
  it.each([undefined, null, "1792713661", 0, -1, 1.5, Number.NaN])("fails closed for invalid expiry %s", async expires_at => {
    const { bindings } = await fixture(item, { override: { expires_at } });
    expect((await item.create()(request(item), bindings, now)).status).toBe(503);
  });
  it("fails closed for an unknown stored contract without reflecting private data", async () => {
    const { bindings } = await fixture(item, { override: { [item.column]: "unapproved-contract" } });
    const log = vi.spyOn(console, "log"), error = vi.spyOn(console, "error");
    const result = await item.create()(request(item), bindings, now);
    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ ok: false, error: "UNAVAILABLE" });
    expect(log).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled();
  });
  it.each([
    [{}, 200], [{ expires_at: seconds }, 409], [{ expires_at: "bad" }, 503],
    [{ payload_hash: "0".repeat(64) }, 409], [{ payload_hash: "bad" }, 503],
  ])("validates the final atomic receipt as well as the initial lookup: %#", async (override, status) => {
    const { bindings } = await fixture(item, { finalOnly: true, override });
    expect((await item.create()(request(item), bindings, now)).status).toBe(status);
  });
  it("rejects an unknown contract in the final atomic receipt", async () => {
    const { bindings } = await fixture(item, { finalOnly: true, override: { [item.column]: "unapproved-contract" } });
    expect((await item.create()(request(item), bindings, now)).status).toBe(503);
  });
});

it("freezes the four real v1 names and keeps public feedback configuration out of historical normalization", () => {
  expect(Object.values(RECEIPT_V1).sort()).toEqual(["contact-v1", "fixed-feedback-v1", "private-opinion-v1", "public-reaction-v1"]);
  const config = FIXED_FEEDBACK_CONFIG.samsung_bonus;
  const oldPath = config.path, oldReason = config.reasons[0].value;
  try {
    Reflect.set(config, "path", "/changed-current-ui");
    Reflect.set(config.reasons[0], "value", "new_current_reason");
    const historical = normalizeReceiptRequest("feedback", { ...cases[1].payload, reason: "input_method" });
    expect(historical).toMatchObject({ pagePath: "/calc/samsung-bonus", reason: "input_method", contractVersion: "fixed-feedback-v1" });
    const reaction = normalizeReceiptRequest("reaction", { ...cases[3].payload, reason: "input_method" });
    expect(reaction).toMatchObject({ reason: "input_method", contractVersion: "public-reaction-v1" });
  } finally { Reflect.set(config, "path", oldPath); Reflect.set(config.reasons[0], "value", oldReason); }
});
