import { describe, expect, it } from "vitest";
import { calculateSalary2026 } from "./TaxLogic";
import { calculateEnglishTakeHome } from "./englishTakeHome";

const base = { annualSalary: 60_000_000, nonTaxableMonthly: 200_000, dependents: 1, children: 0 };

describe("English take-home uses the Korean home model", () => {
  it.each([
    base,
    { ...base, annualSalary: 35_500_000 },
    { ...base, annualSalary: 72_000_000, dependents: 4, children: 2 },
    { ...base, annualSalary: 123_000_000, dependents: 5, children: 3 },
    { ...base, annualSalary: 1_000_000_000, nonTaxableMonthly: 0 },
  ])("preserves every deduction and monthly result of the canonical model", (inputs) => {
    expect(calculateEnglishTakeHome(inputs)).toEqual(calculateSalary2026(inputs.annualSalary, inputs.nonTaxableMonthly, inputs.dependents, inputs.children));
  });
  it("checks a KRW 60M worked example independently", () => {
    const result = calculateEnglishTakeHome(base)!;
    expect(result.nationalPension).toBe(228_000);
    expect(result.healthInsurance).toBe(172_560);
    expect(result.longTermCare).toBe(22_670);
    expect(result.employmentInsurance).toBe(43_200);
    expect(result.incomeTax).toBe(349_170);
    expect(result.localIncomeTax).toBe(34_910);
    expect(result.totalDeductions).toBe(850_510);
    expect(result.netPay).toBe(4_149_490);
  });
  it("allows zero only with a consistent zero exemption and never displays negative model pay", () => {
    expect(calculateEnglishTakeHome({ ...base, annualSalary: 0, nonTaxableMonthly: 0 })?.netPay).toBe(0);
    expect(calculateEnglishTakeHome({ ...base, annualSalary: 1_000, nonTaxableMonthly: 0 })).toBeNull();
  });
  it.each([
    { annualSalary: NaN }, { annualSalary: -1 }, { annualSalary: 1_000_000_001 }, { annualSalary: 60_000_000.5 },
    { nonTaxableMonthly: 5_000_001 }, { nonTaxableMonthly: -1 }, { dependents: 0 }, { dependents: 12 },
    { dependents: 1.5 }, { children: 1 }, { children: -1 }, { dependents: 11, children: 11 },
  ])("rejects an inconsistent current input instead of showing a retained result", (change) => {
    expect(calculateEnglishTakeHome({ ...base, ...change })).toBeNull();
  });
});
