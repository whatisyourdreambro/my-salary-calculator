import { describe, expect, it } from "vitest";
import {
  CIVIL_PAY_BASIS_VERSION, CIVIL_PAY_GRADES, CIVIL_PAY_HANDOFF_KEY as key,
  CIVIL_PAY_HANDOFF_TTL_MS as ttl, CIVIL_PAY_SOURCES, civilPaySelectionInput,
  consumeCivilPayHandoff, isCivilPaySelection, isCivilPayResultReady, writeCivilPayHandoff,
  type CivilPayOccupation, type CivilPaySelection,
} from "@/lib/civilPayHandoff";
import { CIVIL_DEFAULT_INPUT, CIVIL_KIND_PRESETS, CIVIL_RANKS, civilHobongOptions, computeCivilNetPay } from "@/lib/civilServantNetPay";
import { POLICE_FIRE_RANK_LABELS, POLICE_RANK_ROWS_2026 } from "@/lib/civilServantPay";
import { createCalculationMeasurement, type CalculationEvent } from "@/lib/calculationMeasurement";

const now = 1_800_000_000_000;
function storage() {
  const data = new Map<string, string>();
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); }, removeItem: (key: string) => { data.delete(key); } };
}
const selection: CivilPaySelection = {
  source: "/firefighter-pay-2026", occupation: "fire", gradeId: "fire-sobanggyo",
  step: 3, payYear: 2026, basisVersion: CIVIL_PAY_BASIS_VERSION,
};

describe("2026 police/fire table handoff", () => {
  it("does not count restoration or pre-confirmation input as success, then counts one confirmed visible result", () => {
    const events: CalculationEvent[] = [];
    const measure = createCalculationMeasurement(event => events.push(event));
    const path = "/calc/civil-servant-net-pay";
    const kind = "civil_servant_net_pay";
    const result = computeCivilNetPay({ ...CIVIL_DEFAULT_INPUT, ...CIVIL_KIND_PRESETS.fire });
    measure.visit(path);
    expect(measure.result(path, kind, { valid: isCivilPayResultReady(true, true, result), visible: true, userResult: false })).toBe(false);
    measure.interact(path, kind, true); // Editing family/years before accepting assumptions.
    expect(measure.result(path, kind, { valid: isCivilPayResultReady(true, true, result), visible: true, userResult: true })).toBe(false);
    expect(events.some(event => event.name === "calc_success")).toBe(false);
    expect(measure.result(path, kind, { valid: isCivilPayResultReady(false, true, result), visible: false, userResult: true })).toBe(false);
    expect(measure.result(path, kind, { valid: isCivilPayResultReady(false, true, result), visible: true, userResult: true })).toBe(true);
    measure.result(path, kind, { valid: true, visible: true, userResult: true });
    expect(events.filter(event => event.name === "calc_success")).toHaveLength(1);
    expect(isCivilPayResultReady(false, false, result)).toBe(false);
    expect(isCivilPayResultReady(false, true, { ...result, net: NaN })).toBe(false);
  });
  it("maps all 50 source cells to the same label, step and basic pay in the destination engine", () => {
    let checked = 0;
    for (const occupation of ["police", "fire"] as CivilPayOccupation[]) {
      for (const grade of CIVIL_PAY_GRADES[occupation]) {
        const column = POLICE_FIRE_RANK_LABELS.findIndex(labels => labels[occupation] === grade.label) + 1;
        expect(column).toBeGreaterThan(0);
        expect(CIVIL_RANKS[occupation][grade.engineRank]).toBe(grade.label);
        for (const row of POLICE_RANK_ROWS_2026) {
          const item = { ...selection, occupation, source: CIVIL_PAY_SOURCES[occupation], gradeId: grade.id, step: row[0] };
          const input = civilPaySelectionInput(item)!;
          expect(isCivilPaySelection(item)).toBe(true);
          expect(civilHobongOptions(input.kind, input.rank)).toContain(input.hobong);
          const result = computeCivilNetPay({ ...CIVIL_DEFAULT_INPUT, ...CIVIL_KIND_PRESETS[input.kind], ...input });
          expect(result.rankLabel).toBe(grade.label);
          expect(result.pay).toBe(row[column]);
          const store = storage();
          expect(writeCivilPayHandoff(item, item.source, store, now)).toBe(true);
          expect(consumeCivilPayHandoff(store, now + 1)).toEqual({ status: "accepted", selection: item });
          checked++;
        }
      }
    }
    expect(checked).toBe(50);
  });
  it.each([
    {}, { ...selection, step: 0 }, { ...selection, step: 6 }, { ...selection, step: 1.5 },
    { ...selection, step: "3" }, { ...selection, step: NaN }, { ...selection, step: Infinity },
    { ...selection, gradeId: 1 }, { ...selection, gradeId: "police-gyeongjang" },
    { ...selection, occupation: "teacher" }, { ...selection, payYear: 2027 },
    { ...selection, basisVersion: "new-basis" }, { ...selection, source: "/civil-servant-pay-2027" },
    { ...selection, salary: 2290400 }, { ...selection, children: 2 }, { ...selection, rank: 1 },
  ])("rejects unsupported selection rather than clamping: %j", invalid => {
    const store = storage();
    store.setItem(key, "stale");
    expect(isCivilPaySelection(invalid)).toBe(false);
    expect(writeCivilPayHandoff(invalid, selection.source, store, now)).toBe(false);
    expect(store.getItem(key)).toBeNull();
  });
  it("requires the actual source pathname and consumes once without changing other storage", () => {
    const store = storage();
    store.setItem("other", "keep");
    expect(writeCivilPayHandoff(selection, "/", store, now)).toBe(false);
    expect(writeCivilPayHandoff(selection, selection.source, store, now)).toBe(true);
    expect(consumeCivilPayHandoff(store, now)).toEqual({ status: "accepted", selection });
    expect(consumeCivilPayHandoff(store, now)).toEqual({ status: "absent" });
    expect(store.getItem("other")).toBe("keep");
  });
  it("expires exactly at ten minutes", () => {
    const store = storage();
    writeCivilPayHandoff(selection, selection.source, store, now);
    expect(consumeCivilPayHandoff(store, now + ttl - 1).status).toBe("accepted");
    writeCivilPayHandoff(selection, selection.source, store, now);
    expect(consumeCivilPayHandoff(store, now + ttl)).toEqual({ status: "rejected", reason: "expired" });
    expect(store.getItem(key)).toBeNull();
  });
  it.each([{ version: 2 }, { createdAt: now + 1 }, { expiresAt: now + ttl + 1 }, { extra: "not accepted" }])("rejects malformed envelopes %j", change => {
    const store = storage();
    writeCivilPayHandoff(selection, selection.source, store, now);
    store.setItem(key, JSON.stringify({ ...JSON.parse(store.getItem(key)!), ...change }));
    expect(consumeCivilPayHandoff(store, now)).toEqual({ status: "rejected", reason: "invalid" });
    expect(store.getItem(key)).toBeNull();
  });
  it("rejects corrupted/oversized payloads, blocked reads/removals and failed writes", () => {
    const store = storage();
    for (const raw of ["{broken", "x".repeat(2049), "null", "[]"]) {
      store.setItem(key, raw);
      expect(consumeCivilPayHandoff(store, now)).toEqual({ status: "rejected", reason: "invalid" });
    }
    const denied = () => { throw new Error("blocked"); };
    for (const method of ["getItem", "removeItem"] as const) {
      expect(consumeCivilPayHandoff({ ...store, [method]: denied }, now)).toEqual({ status: "rejected", reason: "storage_unavailable" });
    }
    expect(writeCivilPayHandoff(selection, selection.source, { ...store, setItem: denied }, now)).toBe(false);
  });
});
