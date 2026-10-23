import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/server/cloudflareBindings", () => ({ cloudflareBindings: () => ({}) }));
import * as reactionRoute from "@/app/api/participation/reactions/route";
import * as summaryRoute from "@/app/api/participation/summary/route";
import { handleReactionPost } from "@/lib/server/reactionHandler";
import { handleParticipationSummaryGet } from "@/lib/server/participationSummaryHandler";
import { runParticipationMaintenance } from "@/lib/server/participationMaintenance";
import maintenanceWorker from "../../../workers/participation-maintenance";
import { PARTICIPATION_MAINTENANCE_SQL } from "@/lib/server/participationMaintenanceSql";
import { PARTICIPATION_SUMMARY_SQL, REACTION_RECEIPT_LOOKUP, REACTION_SQL } from "@/lib/server/reactionSql";
import { PARTICIPATION_HEALTH_SQL, type ParticipationBindings } from "@/lib/server/participationRuntime";
import type { FeedbackDatabase, FeedbackResult, FeedbackStatement } from "@/lib/server/feedbackStorage";

const now = Date.parse("2026-10-23T00:01:00Z");
const seconds = Math.floor(now / 1000);
const id = "21926472-c435-4fe1-87c2-67d735a302bf";
const input = { submissionId: id, contractVersion: "public-reaction-v1", target: "samsung_bonus", vote: "helpful", reason: null, publicAggregateConsent: true };
const snapshot = { contract_version: input.contractVersion, generated_at: seconds, window_days: 28, total: 10, helpful: 8, confusing: 2 };
type Statement = FeedbackStatement & { sql: string; values: (string | number | null)[] };
function storage(row: Record<string, unknown> | null = snapshot, cleanup: unknown = seconds) {
  let saved: string | undefined;
  const db: FeedbackDatabase = {
    prepare(sql) { return { sql, values: [], bind(...values) { this.values = values; return this; } } as Statement; },
    batch: vi.fn(async (items: FeedbackStatement[]): Promise<FeedbackResult[]> => {
      const statements = items as Statement[];
      if (statements.length === 1) {
        const sql = statements[0].sql;
        const results = sql === PARTICIPATION_HEALTH_SQL ? [{ last_cleanup_at: cleanup }]
          : sql === PARTICIPATION_SUMMARY_SQL ? row ? [row] : []
          : sql === REACTION_RECEIPT_LOOKUP && saved ? [{ payload_hash: saved, contract_version: input.contractVersion }] : [];
        return [{ success: true, meta: {}, results }];
      }
      if (statements.length === 4) {
        const duplicate = !!saved;
        saved ??= statements[1].values[1] as string;
        return statements.map((_item, index) => ({ success: true, meta: { changes: index < 3 && !duplicate ? 1 : 0 }, results: index === 3 ? [{ payload_hash: saved, contract_version: input.contractVersion }] : [] }));
      }
      return statements.map(() => ({ success: true, meta: { changes: 1 }, results: [] }));
    }),
  };
  const bindings: ParticipationBindings = { FEEDBACK_DB: db, FEEDBACK_RATE_LIMIT_SECRET: "test-only-long-secret-for-reactions-123456789", PARTICIPATION_REACTIONS_ENABLED: "1", PARTICIPATION_SUMMARY_ENABLED: "1" };
  return { db, bindings };
}
function request(value: unknown = input, headers: Record<string, string> = {}) {
  return new Request("https://www.moneysalary.com/api/participation/reactions", { method: "POST", headers: { origin: "https://www.moneysalary.com", "content-type": "application/json", "cf-connecting-ip": "192.0.2.1", ...headers }, body: JSON.stringify(value) });
}
function summary(query = "target=samsung_bonus") { return new Request(`https://www.moneysalary.com/api/participation/summary?${query}`); }
afterEach(() => vi.restoreAllMocks());

describe("explicit public reaction consent", () => {
  it("keeps routes and each module closed by default", async () => {
    expect(Object.keys(reactionRoute).sort()).toEqual(["POST", "dynamic"]);
    expect(Object.keys(summaryRoute).sort()).toEqual(["GET", "dynamic"]);
    expect((await reactionRoute.POST(request())).status).toBe(503);
    expect((await summaryRoute.GET(summary())).status).toBe(503);
    const { db, bindings } = storage();
    expect((await handleReactionPost(request(), { ...bindings, PARTICIPATION_REACTIONS_ENABLED: "0" }, now)).status).toBe(503);
    expect((await handleParticipationSummaryGet(summary(), { ...bindings, PARTICIPATION_SUMMARY_ENABLED: "0" }, now)).status).toBe(503);
    expect(db.batch).not.toHaveBeenCalled();
  });
  it.each([
    { ...input, publicAggregateConsent: false }, { ...input, publicAggregateConsent: undefined, feedbackConsent: true },
    { ...input, contractVersion: "fixed-feedback-v1" }, { ...input, body: "private text" },
    { ...input, target: "__proto__" }, { ...input, vote: "other" }, { ...input, reason: "source_date" },
    { ...input, vote: "confusing", reason: null }, { ...input, vote: "confusing", reason: "forecast_status" },
  ])("rejects old consent, free text and cross-target reasons before storage: %#", async value => {
    const { db, bindings } = storage();
    expect((await handleReactionPost(request(value), bindings, now)).status).toBe(400);
    expect(db.batch).not.toHaveBeenCalled();
  });
  it.each([[{ origin: "https://example.com" }, 403], [{ "content-type": "text/plain" }, 415], [{ "content-encoding": "gzip" }, 415], [{ "content-length": "1025" }, 413], [{ "cf-connecting-ip": "" }, 503]])("bounds transport and trusted IP: %#", async (headers, status) => {
    const { db, bindings } = storage();
    expect((await handleReactionPost(request(input, headers as Record<string, string>), bindings, now)).status).toBe(status);
    expect(db.batch).not.toHaveBeenCalled();
  });
  it("preserves fixed reason, counts accepted responses once, and confirms normalized replay", async () => {
    const { db, bindings } = storage();
    const value = { ...input, vote: "confusing", reason: "input_method" };
    expect((await handleReactionPost(request(value), bindings, now)).status).toBe(201);
    const statements = vi.mocked(db.batch).mock.calls.find(([items]) => items.length === 4)![0] as Statement[];
    expect(statements.map(item => item.sql)).toEqual(Object.values(REACTION_SQL));
    expect(statements[1].values.slice(2)).toEqual([input.target, "confusing", "input_method", input.contractVersion, seconds, seconds + 90 * 86400]);
    expect(JSON.stringify(statements)).not.toContain("192.0.2.1");
    expect((await handleReactionPost(request({ ...value, submissionId: id.toUpperCase() }), bindings, now)).status).toBe(200);
    expect((await handleReactionPost(request(input), bindings, now)).status).toBe(409);
    expect(vi.mocked(db.batch).mock.calls.filter(([items]) => items.length === 4)).toHaveLength(1);
  });
  it.each([26 * 3600, 26 * 3600 + 1])("rejects new writes when cleanup is %i seconds old", async age => {
    const { db, bindings } = storage(snapshot, seconds - age);
    expect((await handleReactionPost(request(), bindings, now)).status).toBe(503);
    expect(vi.mocked(db.batch).mock.calls.every(([items]) => items.length === 1)).toBe(true);
  });
  it("reports an atomic refusal without a false receipt", async () => {
    const { db, bindings } = storage();
    const original = vi.mocked(db.batch).getMockImplementation()!;
    vi.mocked(db.batch).mockImplementation(async items => items.length === 4 ? items.map(() => ({ success: true, meta: { changes: 0 }, results: [] })) : original(items));
    expect((await handleReactionPost(request(), bindings, now)).status).toBe(429);
  });
});

describe("public summary is an explicitly consented, thresholded snapshot", () => {
  it("returns coherent counts and aggregate generation time without private or cleanup fields", async () => {
    const { db, bindings } = storage({ ...snapshot, private_body: "never returned", reason: "never returned", last_cleanup_at: seconds - 123 });
    const result = await handleParticipationSummaryGet(summary(), bindings, now);
    expect(await result.json()).toEqual({ ok: true, visible: true, total: 10, helpful: 8, confusing: 2, windowDays: 28, generatedAt: seconds });
    expect(result.headers.get("cache-control")).toBe("no-store");
    expect(vi.mocked(db.batch).mock.calls.flat().flat().every(item => !String((item as Statement).sql).includes("helpfulness_feedback"))).toBe(true);
  });
  it.each([null, { ...snapshot, total: 9, helpful: 7 }, { ...snapshot, generated_at: seconds - 26 * 3600 }, { ...snapshot, generated_at: seconds - 26 * 3600 - 1 }])("hides low-sample, missing and stale snapshots without timestamps: %#", async row => {
    const { bindings } = storage(row);
    expect(await (await handleParticipationSummaryGet(summary(), bindings, now)).json()).toEqual({ ok: true, visible: false });
  });
  it("still exposes a coherent snapshot one second before the 26-hour boundary", async () => {
    const generatedAt = seconds - 26 * 3600 + 1;
    const { bindings } = storage({ ...snapshot, generated_at: generatedAt });
    expect(await (await handleParticipationSummaryGet(summary(), bindings, now)).json()).toEqual({
      ok: true, visible: true, total: 10, helpful: 8, confusing: 2, windowDays: 28, generatedAt,
    });
  });
  it.each([
    { ...snapshot, generated_at: seconds + 1 }, { ...snapshot, generated_at: "123" },
    { ...snapshot, total: 11 }, { ...snapshot, helpful: -1, confusing: 11 }, { ...snapshot, total: 10.5 },
    { ...snapshot, total: "10" }, { ...snapshot, window_days: 90 }, { ...snapshot, contract_version: "fixed-feedback-v1" },
  ])("fails closed for incoherent snapshot data: %#", async row => {
    const { bindings } = storage(row);
    expect((await handleParticipationSummaryGet(summary(), bindings, now)).status).toBe(503);
  });
  it.each(["", "target=other", "target=samsung_bonus&target=samsung_company", "target=samsung_bonus&salary=100"])("rejects unsupported query shapes: %s", async query => {
    const { db, bindings } = storage();
    expect((await handleParticipationSummaryGet(summary(query), bindings, now)).status).toBe(400);
    expect(db.batch).not.toHaveBeenCalled();
  });
  it.each([26 * 3600, 26 * 3600 + 1])("hides even a fresh snapshot when cleanup is %i seconds old", async age => {
    const { bindings } = storage(snapshot, seconds - age);
    expect((await handleParticipationSummaryGet(summary(), bindings, now)).status).toBe(503);
  });
});

describe("scheduled cleanup and snapshot maintenance", () => {
  it("is separately gated and has no public maintenance endpoint", async () => {
    const { db } = storage();
    expect(await runParticipationMaintenance({ FEEDBACK_DB: db }, now)).toEqual({ ok: false });
    expect(db.batch).not.toHaveBeenCalled();
    expect(maintenanceWorker.fetch().status).toBe(404);
    await expect(maintenanceWorker.scheduled({}, {})).resolves.toBeUndefined();
    await expect(maintenanceWorker.scheduled({}, { PARTICIPATION_MAINTENANCE_ENABLED: "1" })).rejects.toThrow("Participation maintenance unavailable");
  });
  it("deletes expired data and snapshots all three targets before committing health in one transaction", async () => {
    const { db } = storage();
    expect(await runParticipationMaintenance({ FEEDBACK_DB: db, PARTICIPATION_MAINTENANCE_ENABLED: "1" }, now)).toEqual({ ok: true });
    expect(db.batch).toHaveBeenCalledTimes(1);
    const statements = vi.mocked(db.batch).mock.calls[0][0] as Statement[];
    expect(statements).toHaveLength(10);
    expect(statements.at(-1)?.sql).toBe(PARTICIPATION_MAINTENANCE_SQL.health);
    expect(statements.at(-1)?.values).toEqual([seconds]);
    const snapshots = statements.filter(item => item.sql === PARTICIPATION_MAINTENANCE_SQL.snapshot);
    expect(snapshots.map(item => item.values[0])).toEqual(["samsung_bonus", "civil_pay_2027", "samsung_company"]);
    expect(snapshots[0].values.slice(3)).toEqual([seconds - 28 * 86400, seconds, seconds]);
    expect(PARTICIPATION_MAINTENANCE_SQL.snapshot).not.toContain("helpfulness_feedback");
    expect(PARTICIPATION_MAINTENANCE_SQL.snapshot).not.toContain("private_opinions");
  });
  it("returns only a fixed failure state and never logs private SQL exceptions", async () => {
    const { db } = storage();
    const error = vi.spyOn(console, "error");
    vi.mocked(db.batch).mockRejectedValue(new Error("synthetic private SQL parameters"));
    expect(await runParticipationMaintenance({ FEEDBACK_DB: db, PARTICIPATION_MAINTENANCE_ENABLED: "1" }, now)).toEqual({ ok: false });
    expect(error).not.toHaveBeenCalled();
  });
});
