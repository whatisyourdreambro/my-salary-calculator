import { describe, expect, it } from "vitest";
import { calcSamsungBonusNet, computeDivisionPool, DIVISIONS } from "@/app/calc/samsung-bonus/model";
import { computePersonalBonus } from "@/app/calc/samsung-bonus/personalBonus";
import {
  calculateScenario, readSavedScenarios, sameScenario, SCENARIO_MODEL,
  serializeScenarios, validateScenarioInputs, type ScenarioInputs,
} from "@/app/calc/samsung-bonus/scenarioStorage";

const inputs: ScenarioInputs = {
  d: "memory", s: 80_000_000, p: 350, y: 2026, o1: 50, ac: 0, ins: true,
  counts: Object.fromEntries(DIVISIONS.map(d => [d.id, d.defaultCount])),
  ratios: Object.fromEntries(DIVISIONS.map(d => [d.id, d.defaultRatio])),
};
const savedAt = Date.UTC(2026, 9, 19);

describe("Samsung explicit local comparisons", () => {
  it("round-trips every assumption including custom headcounts, weights and zero inputs", () => {
    const custom = { ...inputs, d: "foundry", p: 0, o1: 0, ac: 25, ins: false, y: 2030,
      counts: { memory: 12345, common: 20000, foundry: 0 }, ratios: { memory: 1, common: .7, foundry: 0 } };
    const stored = readSavedScenarios(serializeScenarios([{ savedAt, inputs: custom }]));
    expect(stored).toEqual({ cases: [{ savedAt, inputs: custom }], rejected: false });
    expect(calculateScenario(stored.cases[0].inputs).totalGrossWon).toBe(0);
    expect(sameScenario(inputs, { ...inputs, counts: { foundry: inputs.counts.foundry, common: inputs.counts.common, memory: inputs.counts.memory } })).toBe(true);
  });

  it("rejects partial, non-finite, out-of-range and incompatible stored inputs", () => {
    for (const invalid of [
      null, { ...inputs, d: "unknown" }, { ...inputs, s: 0 }, { ...inputs, s: Infinity },
      { ...inputs, y: 2036 }, { ...inputs, o1: 51 }, { ...inputs, ac: -1 },
      { ...inputs, p: NaN }, { ...inputs, ins: "true" },
      { ...inputs, counts: { memory: 1 } }, { ...inputs, ratios: { memory: 0, common: 0, foundry: 0 } },
      { ...inputs, counts: { memory: 0, common: 0, foundry: 0 } },
      { ...inputs, counts: { ...inputs.counts, foundry: 1.5 } },
    ]) expect(validateScenarioInputs(invalid)).toBeNull();
    for (const raw of ["{bad", "x".repeat(50_001), "null", JSON.stringify({ version: 1, model: "old-tax", cases: [{ savedAt, inputs }] }),
      JSON.stringify({ version: 2, model: SCENARIO_MODEL, cases: [] })]) {
      expect(readSavedScenarios(raw)).toEqual({ cases: [], rejected: true });
    }
    expect(readSavedScenarios(null)).toEqual({ cases: [], rejected: false });
  });

  it("bounds storage to three distinct cases and retains only complete valid entries", () => {
    const cases = [0, 1, 2].map(n => ({ savedAt: savedAt + n, inputs: { ...inputs, p: 350 + n } }));
    expect(readSavedScenarios(serializeScenarios(cases)).cases).toHaveLength(3);
    expect(() => serializeScenarios([...cases, cases[0]])).toThrow();
    expect(readSavedScenarios(JSON.stringify({ version: 1, model: SCENARIO_MODEL, cases: [cases[0], { savedAt: "yesterday", inputs }, cases[0]] }))).toEqual({ cases: [cases[0]], rejected: true });
  });

  it("uses the same personal calculation for all divisions, years and tax assumptions", () => {
    for (const division of DIVISIONS) for (const year of [2026, 2029, 2035]) for (const ins of [true, false]) {
      const scenario = { ...inputs, d: division.id, y: year, p: 150, ins, ac: 20 };
      const pool = computeDivisionPool(150, scenario.counts, scenario.ratios, year >= 2029);
      const row = pool.perDivision.find(d => d.id === division.id)!;
      const result = calculateScenario(scenario);
      expect(result).toEqual({ division: row.label, ...computePersonalBonus(scenario.s, row, scenario.o1, scenario.ac, scenario.ins) });
      const gross = scenario.s * .5 + (row.buPart + row.saPart) * (scenario.s / 80_000_000) * 10000;
      expect(result.totalGrossWon).toBeCloseTo(gross, 5);
      expect(result.netWon).toBeCloseTo(calcSamsungBonusNet(scenario.s, gross, scenario.ac, scenario.ins).net, 5);
      expect(result.totalGrossWon).toBeGreaterThanOrEqual(result.netWon);
    }
  });
});
