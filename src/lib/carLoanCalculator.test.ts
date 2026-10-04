import { describe, expect, it } from "vitest";
import { calculateCarLoan } from "./carLoanCalculator";

describe("car loan repayment", () => {
  const input = { annualSalary: 60_000_000, loanTerm: 5, interestRate: 0 };

  it("repays the principal at zero interest", () => {
    expect(calculateCarLoan(30_000_000, input)).toEqual({
      monthlyPayment: 500_000,
      totalInterest: 0,
      totalPayment: 30_000_000,
    });
  });

  it("keeps unsupported negative interest and nonpositive terms or principal at zero", () => {
    for (const [principal, overrides] of [
      [30_000_000, { interestRate: -1 }],
      [30_000_000, { loanTerm: 0 }],
      [30_000_000, { loanTerm: -1 }],
      [0, {}],
      [-1, {}],
    ] as const) {
      expect(calculateCarLoan(principal, { ...input, ...overrides })).toEqual({
        monthlyPayment: 0, totalInterest: 0, totalPayment: 0,
      });
    }
  });

  it("preserves the ordinary positive-rate repayment", () => {
    expect(calculateCarLoan(30_000_000, { ...input, interestRate: 5.5 })).toEqual({
      monthlyPayment: 573_035,
      totalInterest: 4_382_092,
      totalPayment: 34_382_092,
    });
  });
});
