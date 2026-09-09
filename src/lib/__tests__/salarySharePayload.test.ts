import { describe, expect, it } from "vitest";
import { calculateNetSalary } from "@/lib/calculator";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { calculatePartTimeSalary } from "@/lib/freelancerCalculator";
import { decodeSalarySharePayload, decodeSharedSalary, encodeSalarySharePayload, validateSalarySharePayload } from "@/lib/salarySharePayload";

const old = { annualSalary: 50_000_000, nonTaxableAmount: 200_000, dependents: 1, children: 0 };
const regular = { ...old, v: 1, taxYear: 2026, incomeType: "regular" };
const token = (data: unknown) => btoa(JSON.stringify(data));
describe("bounded salary share payloads", () => {
  it("preserves the exact legacy calculation for complete existing links, including encoded padding", () => {
    const decoded = decodeSharedSalary(encodeURIComponent(token(old)));
    expect(decoded?.monthlyNet).toBe(calculateNetSalary(old.annualSalary, old.nonTaxableAmount * 12, 1, 0,
      { isSmeYouth: false, disabledDependents: 0, seniorDependents: 0 }).monthlyNet);
    expect(decoded?.modelLabel).toContain("기존 공유");
  });
  it("reproduces the current home model exactly, and declares it independently of legacy rounding", () => {
    for (const annualSalary of [30_000_000, 50_000_000, 72_000_001, 120_000_000]) {
      const encoded = encodeSalarySharePayload({ ...regular, annualSalary });
      expect(encoded).not.toMatch(/[+/=]/);
      expect(decodeSharedSalary(encoded!)?.monthlyNet).toBe(calculateSalary2026(annualSalary, 200_000, 1, 0).netPay);
    }
    expect(decodeSharedSalary(token(old))?.monthlyNet).not.toBe(decodeSharedSalary(token(regular))?.monthlyNet);
  });
  it.each(["freelancer", "part_time"] as const)("reproduces %s monthly income without silently applying the regular employee model", (incomeType) => {
    const payload = { v: 1, taxYear: 2026, incomeType, monthlyIncome: 3_000_000 };
    const result = decodeSharedSalary(encodeSalarySharePayload(payload)!);
    expect(result?.monthlyNet).toBe(calculatePartTimeSalary(3_000_000, incomeType).netPay);
    expect(result?.annualSalary).toBe(36_000_000);
    expect(result?.regular).toBe(false);
  });
  it.each([null, [], {}, { annualSalary: 50_000_000 }, { ...old, annualSalary: "50000000" },
    { ...old, children: true }, { ...old, dependents: 1.5 }, { ...old, annualSalary: -1 },
    { ...old, annualSalary: 1e20 }, { ...old, name: "extra private data" }, { ...regular, v: 2 },
    { ...regular, taxYear: 2027 }, { ...regular, incomeType: "unknown" },
    { v: 1, taxYear: 2026, incomeType: "freelancer", monthlyIncome: 3e6, annualSalary: 36e6 }])("rejects wrong shapes/types/versions without coercion", (data) => {
    expect(decodeSharedSalary(token(data))).toBeNull();
  });
  it("rejects nonfinite and oversized payloads without attempting a result", () => {
    expect(validateSalarySharePayload({ ...old, annualSalary: Infinity })).toBeNull();
    expect(decodeSharedSalary("A".repeat(2049))).toBeNull();
    expect(decodeSharedSalary("%broken")).toBeNull();
    expect(decodeSharedSalary(btoa('{"annualSalary":1e999,"nonTaxableAmount":0,"dependents":1,"children":0}'))).toBeNull();
  });
  it("enforces new relationship limits while retaining old independently selected finite conditions", () => {
    expect(decodeSalarySharePayload(token({ ...old, children: 2 }))).not.toBeNull();
    expect(encodeSalarySharePayload({ ...regular, children: 2 })).toBeNull();
    expect(encodeSalarySharePayload({ ...regular, nonTaxableAmount: 5_000_000 })).toBeNull();
  });
});
