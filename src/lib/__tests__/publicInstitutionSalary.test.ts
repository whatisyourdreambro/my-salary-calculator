import { describe, expect, it } from "vitest";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { calculatePublicInstitutionSalary, parsePublicSalaryAmount, type PublicInstitutionSalaryInput } from "@/lib/publicInstitutionSalary";

const input: PublicInstitutionSalaryInput = { annualPay: 50_000_000, additionalBonus: 0, nonTaxableMonthly: 200_000, dependents: 1, children: 0, pensionSystem: "national" };

describe("public institution personal salary estimates", () => {
  it("keeps the main salary model without inventing institution-specific rates", () => {
    const result = calculatePublicInstitutionSalary(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.monthlyIncludingBonus).toEqual(calculateSalary2026(50_000_000, 200_000, 1, 0));
    expect(result.annualBonusNetIncrease).toBe(0);
  });

  it("adds extra bonus once and compares annualised net amounts", () => {
    const result = calculatePublicInstitutionSalary({ ...input, additionalBonus: 10_000_000 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.grossAnnual).toBe(60_000_000);
    expect(result.annualNetEstimate).toBe(calculateSalary2026(60_000_000, 200_000, 1, 0).netPay * 12);
    expect(result.annualBonusNetIncrease).toBeGreaterThan(0);
    expect(result.annualBonusNetIncrease).toBeLessThan(10_000_000);
    expect(result.annualNetEstimate - result.monthlyBeforeBonus.netPay * 12).toBe(result.annualBonusNetIncrease);
  });

  it("does not substitute the national pension model for other schemes", () => {
    expect(calculatePublicInstitutionSalary({ ...input, pensionSystem: "other" }).ok).toBe(false);
  });

  it.each([
    { annualPay: NaN }, { annualPay: Infinity }, { annualPay: -1 }, { annualPay: 1.5 },
    { annualPay: 1_000_000_000, additionalBonus: 1 }, { additionalBonus: -10 },
    { nonTaxableMonthly: 5_000_000 }, { dependents: 0 }, { dependents: 1.5 },
    { dependents: 21 }, { children: 1 }, { children: -1 },
  ])("rejects invalid inputs without showing a stale or fabricated result: %o", (patch) => {
    expect(calculatePublicInstitutionSalary({ ...input, ...patch }).ok).toBe(false);
  });

  it("supports a zero-pay scenario and rejects a negative net from tiny pension-insured pay", () => {
    const zero = calculatePublicInstitutionSalary({ ...input, annualPay: 0, nonTaxableMonthly: 0 });
    expect(zero.ok && zero.annualNetEstimate).toBe(0);
    expect(calculatePublicInstitutionSalary({ ...input, annualPay: 1, nonTaxableMonthly: 0 }).ok).toBe(false);
  });

  it("validates family counts while retaining personal deduction effects", () => {
    const withFamily = calculatePublicInstitutionSalary({ ...input, dependents: 3, children: 2 });
    const alone = calculatePublicInstitutionSalary(input);
    expect(withFamily.ok && alone.ok && withFamily.monthlyIncludingBonus.netPay > alone.monthlyIncludingBonus.netPay).toBe(true);
  });
});

describe("won input parsing", () => {
  it.each(["", "-100", "1e8", "50,00", "50만원", "123.5", "1,000,000,001"])("rejects %s", (value) => {
    expect(parsePublicSalaryAmount(value)).toBeNull();
  });
  it("accepts unformatted or correctly grouped won amounts", () => {
    expect(parsePublicSalaryAmount("50,000,000")).toBe(50_000_000);
    expect(parsePublicSalaryAmount("50000000")).toBe(50_000_000);
    expect(parsePublicSalaryAmount(" 0 ")).toBe(0);
  });
});
