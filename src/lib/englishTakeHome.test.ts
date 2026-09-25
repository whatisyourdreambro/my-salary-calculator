import { describe, expect, it } from "vitest";
import { calculateSalary2026 } from "./TaxLogic";
import { calculateEnglishTakeHome } from "./englishTakeHome";
import { INSURANCE_RATES_2026 } from "./taxConstants2026";
import { CURRENT_INSURANCE_RATES } from "@/config/currentRates";

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
    // 2026 요율 고정 원 단위 검산값 (2026-09-25 N3 — 영문 계산기 기본값은 현행 요율 포인터라 리터럴은 2026 명시 호출에 둔다)
    const pinned = calculateSalary2026(60_000_000, 200_000, 1, 0, INSURANCE_RATES_2026);
    expect(pinned.nationalPension).toBe(228_000);
    expect(pinned.healthInsurance).toBe(172_560);
    expect(pinned.longTermCare).toBe(22_670);
    expect(pinned.employmentInsurance).toBe(43_200);
    // 월급여액 4,800,000원(500만 - 비과세 20만) · 1인 → 간이세액표 4,800~4,820천원 칸 307,420원
    expect(pinned.incomeTax).toBe(307_420);
    expect(pinned.localIncomeTax).toBe(30_740);
    expect(pinned.totalDeductions).toBe(804_590);
    expect(pinned.netPay).toBe(4_195_410);

    // 영문 계산기(현행 요율) — 같은 산식을 현행 요율로 독립 검산 (보험료 10원 절사, 소득세는 요율과 무관한 표 금액)
    const result = calculateEnglishTakeHome(base)!;
    const r = CURRENT_INSURANCE_RATES;
    const floor10 = (v: number) => Math.floor(Math.round(v) / 10) * 10;
    const pension = floor10(4_800_000 * r.NATIONAL_PENSION);
    const health = floor10(4_800_000 * r.HEALTH_INSURANCE);
    const care = floor10(health * r.LONG_TERM_CARE_RATIO);
    const employment = floor10(4_800_000 * r.EMPLOYMENT_INSURANCE);
    expect(result.nationalPension).toBe(pension);
    expect(result.healthInsurance).toBe(health);
    expect(result.longTermCare).toBe(care);
    expect(result.employmentInsurance).toBe(employment);
    expect(result.incomeTax).toBe(307_420);
    expect(result.localIncomeTax).toBe(30_740);
    const total = pension + health + care + employment + 307_420 + 30_740;
    expect(result.totalDeductions).toBe(total);
    expect(result.netPay).toBe(5_000_000 - total);
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
