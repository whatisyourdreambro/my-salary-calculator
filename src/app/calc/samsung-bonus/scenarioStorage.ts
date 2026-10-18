import { computeDivisionPool, DIVISIONS, getThreshold } from "./model";
import { OPI1_MAX_RATE } from "./opiData";
import { computePersonalBonus } from "./personalBonus";
import type { SamsungShareState } from "./shareState";

export const SCENARIO_STORAGE_KEY = "moneysalary:samsung-bonus:scenarios:v1";
export const SCENARIO_MODEL = "samsung-2026-tax-v1";
export const MAX_SAVED_SCENARIOS = 3;
export type ScenarioInputs = SamsungShareState & {
  counts: Record<string, number>;
  ratios: Record<string, number>;
};
export type SavedScenario = { savedAt: number; inputs: ScenarioInputs };

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function number(value: unknown, min: number, max: number, integer = false): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max && (!integer || Number.isInteger(value));
}

/** Accept only complete, bounded inputs. Never restore a partially corrupt case. */
export function validateScenarioInputs(value: unknown): ScenarioInputs | null {
  if (!record(value) || !DIVISIONS.some(d => d.id === value.d) ||
    !number(value.s, 1, 9_999_999_999, true) || !number(value.p, 0, 10_000) ||
    !number(value.y, 2026, 2035, true) || !number(value.o1, 0, OPI1_MAX_RATE, true) ||
    !number(value.ac, 0, 50, true) || typeof value.ins !== "boolean" ||
    !record(value.counts) || !record(value.ratios)) return null;
  const counts: Record<string, number> = {}, ratios: Record<string, number> = {};
  for (const { id } of DIVISIONS) {
    const count = value.counts[id], ratio = value.ratios[id];
    if (!number(count, 0, 1_000_000_000, true) || !number(ratio, 0, 1_000_000)) return null;
    counts[id] = count; ratios[id] = ratio;
  }
  if (!Object.values(counts).some(v => v > 0) || !Object.values(ratios).some(v => v > 0)) return null;
  return { d: value.d as string, s: value.s, p: value.p, y: value.y, o1: value.o1, ac: value.ac, ins: value.ins, counts, ratios };
}

export function readSavedScenarios(raw: string | null): { cases: SavedScenario[]; rejected: boolean } {
  if (raw === null) return { cases: [], rejected: false };
  const invalid = { cases: [], rejected: true };
  if (raw.length > 50_000) return invalid;
  try {
    const data: unknown = JSON.parse(raw);
    if (!record(data) || data.version !== 1 || data.model !== SCENARIO_MODEL || !Array.isArray(data.cases) || data.cases.length > MAX_SAVED_SCENARIOS) return invalid;
    const cases: SavedScenario[] = [];
    let rejected = false;
    for (const entry of data.cases) {
      if (!record(entry) || !number(entry.savedAt, 1, 4_102_444_800_000, true)) { rejected = true; continue; }
      const inputs = validateScenarioInputs(entry.inputs);
      if (!inputs) { rejected = true; continue; }
      if (cases.some(c => sameScenario(c.inputs, inputs))) { rejected = true; continue; }
      cases.push({ savedAt: entry.savedAt, inputs });
    }
    return { cases, rejected };
  } catch { return invalid; }
}

export function sameScenario(a: ScenarioInputs, b: ScenarioInputs): boolean {
  return (["d", "s", "p", "y", "o1", "ac", "ins"] as const).every(key => a[key] === b[key]) &&
    DIVISIONS.every(({ id }) => a.counts[id] === b.counts[id] && a.ratios[id] === b.ratios[id]);
}

export function serializeScenarios(cases: SavedScenario[]): string {
  if (cases.length > MAX_SAVED_SCENARIOS || cases.some(c => !validateScenarioInputs(c.inputs) || !number(c.savedAt, 1, 4_102_444_800_000, true))) throw new Error("Invalid saved scenarios");
  return JSON.stringify({ version: 1, model: SCENARIO_MODEL, cases });
}

export function calculateScenario(inputs: ScenarioInputs) {
  const pool = computeDivisionPool(inputs.p, inputs.counts, inputs.ratios, inputs.p >= getThreshold(inputs.y));
  const division = pool.perDivision.find(d => d.id === inputs.d)!;
  return { division: division.label, ...computePersonalBonus(inputs.s, division, inputs.o1, inputs.ac, inputs.ins) };
}
