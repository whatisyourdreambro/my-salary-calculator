// /dashboard 저장값 형태 검사·저장소 오류 게이트 (2026-09-25 감사 B3 · CLIENT-11)
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { FINANCIAL_DATA_KEY, isStoredFinancialData } from "@/lib/storedFinancialData";

describe("isStoredFinancialData", () => {
  it("accepts an object whose sections are each undefined or an object", () => {
    expect(isStoredFinancialData({ lastUpdated: "2026-09-25T00:00:00.000Z" })).toBe(true);
    expect(isStoredFinancialData({
      salary: { annualSalary: 50_000_000, monthlyNet: 3_500_000 },
      severance: { estimatedAmount: 1 },
      rank: { rank: 30 },
      futureSalary: { finalSalary: 1 },
      homeLoan: { anything: true },
      lastUpdated: "x",
    })).toBe(true);
  });

  it("rejects non-objects, arrays and null", () => {
    for (const value of [null, undefined, 0, "text", true, [], [{ salary: {} }]]) {
      expect(isStoredFinancialData(value), JSON.stringify(value)).toBe(false);
    }
  });

  it("rejects a section that is not a plain object", () => {
    for (const key of ["salary", "severance", "rank", "futureSalary"]) {
      for (const bad of [null, 1, "x", [], true]) {
        expect(isStoredFinancialData({ [key]: bad }), `${key}=${JSON.stringify(bad)}`).toBe(false);
      }
    }
  });
});

describe("dashboard page storage handling", () => {
  const src = readFileSync(path.resolve(process.cwd(), "src/app/dashboard/page.tsx"), "utf8");

  it("validates the parsed value before rendering it", () => {
    expect(src).toContain("if (isStoredFinancialData(parsed)) setDashboardData(parsed);");
    expect(src).not.toContain("setDashboardData(JSON.parse(");
  });

  it("every removeItem is guarded so a blocked storage cannot reach error.tsx", () => {
    const calls = src.match(/localStorage\.removeItem\(/g) ?? [];
    const guarded = src.match(/try \{ localStorage\.removeItem\(FINANCIAL_DATA_KEY\); \} catch \{/g) ?? [];
    expect(calls.length).toBe(2);
    expect(guarded.length).toBe(calls.length);
  });

  it("uses the shared storage key", () => {
    expect(FINANCIAL_DATA_KEY).toBe("moneysalary-financial-data");
    expect(src).not.toContain('"moneysalary-financial-data"');
  });
});
