import { describe, expect, it } from "vitest";
import type { StoredFinancialData } from "@/app/types";
import { calculateDTI, calculateHealthScore, calculateSavingRate } from "@/lib/dashboardAnalysis";

const complete: StoredFinancialData = {
  lastUpdated: "2026-09-09T00:00:00Z",
  salary: { annualSalary: 60_000_000, monthlyNet: 4_000_000, payBasis: "annual", severanceType: "separate",
    nonTaxableAmount: 200_000, dependents: 1, children: 0, monthlyExpenses: 2_000_000 },
  homeLoan: { monthlyPayment: 0, loanSuggestion: "" },
  rank: { annualSalary: 60_000_000, rank: 20, condition: "", median: 0, average: 0 },
  futureSalary: { years: 5, finalSalary: 80_000_000, totalIncrease: 20_000_000 },
};

describe("dashboard unknown inputs", () => {
  it("does not treat missing loan data as a debt-free score", () => {
    const data = { ...complete, homeLoan: undefined };
    expect(calculateDTI(data)).toBeNull();
    expect(calculateHealthScore(data)).toMatchObject({ score: null });
    expect(calculateHealthScore(data).missing).toContain("주택대출 월 상환액");
  });
  it("preserves an explicitly stored zero repayment and zero expense", () => {
    expect(calculateDTI(complete)).toBe(0);
    expect(calculateHealthScore(complete).score).not.toBeNull();
    expect(calculateSavingRate({ ...complete, salary: { ...complete.salary!, monthlyExpenses: 0 } })).toBe(100);
  });
  it.each(["salary", "rank", "futureSalary"] as const)("withholds a score when %s is absent", field => {
    expect(calculateHealthScore({ ...complete, [field]: undefined }).score).toBeNull();
  });
  it("supports older saved salary records with no optional monthly expenses", () => {
    const legacy = { ...complete, salary: { ...complete.salary!, monthlyExpenses: undefined } };
    expect(calculateSavingRate(legacy)).toBeNull();
    expect(calculateHealthScore(legacy).score).toBeNull();
    expect(legacy.salary.annualSalary).toBe(60_000_000);
  });
  it.each([NaN, Infinity, -1])("does not certify invalid repayment %s", monthlyPayment => {
    const data = { ...complete, homeLoan: { monthlyPayment, loanSuggestion: "" } };
    expect(calculateDTI(data)).toBeNull();
    expect(calculateHealthScore(data).score).toBeNull();
  });
  it("computes only the saved loan's ratio to gross monthly salary", () => {
    expect(calculateDTI({ ...complete, homeLoan: { monthlyPayment: 1_000_000, loanSuggestion: "" } })).toBe(20);
  });
  it("does not combine a rank from a different salary into a definitive score", () => {
    expect(calculateHealthScore({ ...complete, rank: { ...complete.rank!, annualSalary: 50_000_000 } }).score).toBeNull();
  });
  it("accepts a finite zero percentile rather than treating it as missing", () => {
    const outcome = calculateHealthScore({ ...complete, rank: { ...complete.rank!, rank: 0 } });
    expect(outcome.missing).toEqual([]);
    expect(outcome.score).not.toBeNull();
  });
});
