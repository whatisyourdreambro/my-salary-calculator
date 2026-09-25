// TaxLogic 입력 가드 회귀 테스트 — 2026-09-25 CALC-12 (batch B10).
//
// 종전 calculateSalary2026 은 연봉 <= 0 만 막아 NaN·Infinity 가 그대로 전파됐고(전 항목 NaN),
// 월급 전액이 비과세인 극소 연봉(연 5만·20만)에도 국민연금 하한(월 41만 기준)을 매겨
// 실수령이 음수(-15,304원·-2,804원)로 나왔다. 정상 입력의 산출값은 바뀌지 않아야 한다.
import { describe, expect, it } from "vitest";

import { calculateSalary2026, type TaxResult } from "@/lib/TaxLogic";
import { INSURANCE_RATES_2026 } from "@/lib/taxConstants2026";
import { generateAnnualSalaryTableData2026 } from "@/lib/generateData2026";

const FIELDS: (keyof TaxResult)[] = [
  "nationalPension",
  "healthInsurance",
  "longTermCare",
  "employmentInsurance",
  "incomeTax",
  "localIncomeTax",
  "totalDeductions",
  "netPay",
];

function expectFinite(r: TaxResult) {
  for (const k of FIELDS) expect(Number.isFinite(r[k]), k).toBe(true);
}

describe("calculateSalary2026 — 비유한 입력", () => {
  it("연봉 NaN·Infinity·-Infinity 는 전 항목 0", () => {
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const r = calculateSalary2026(bad);
      expectFinite(r);
      for (const k of FIELDS) expect(r[k], k).toBe(0);
    }
  });

  it("비과세 NaN·Infinity·음수는 0 으로 본다", () => {
    const zero = calculateSalary2026(50_000_000, 0, 1, 0);
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, -200_000]) {
      const r = calculateSalary2026(50_000_000, bad, 1, 0);
      expectFinite(r);
      expect(r).toEqual(zero);
    }
  });

  it("부양가족 NaN·Infinity·0 은 1명(본인)으로 본다", () => {
    const one = calculateSalary2026(50_000_000, 200_000, 1, 0);
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, 0, -3]) {
      const r = calculateSalary2026(50_000_000, 200_000, bad, 0);
      expectFinite(r);
      expect(r).toEqual(one);
    }
  });

  it("자녀 NaN·Infinity 는 0명으로 본다", () => {
    const none = calculateSalary2026(50_000_000, 200_000, 1, 0);
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY]) {
      const r = calculateSalary2026(50_000_000, 200_000, 1, bad);
      expectFinite(r);
      expect(r).toEqual(none);
    }
  });
});

describe("calculateSalary2026 — 극소 연봉 (월급 ≤ 비과세)", () => {
  it.each([50_000, 200_000])("연봉 %i원: NaN 없음·실수령 ≥ 0·연금 0", (annual) => {
    const r = calculateSalary2026(annual);
    expectFinite(r);
    expect(r.netPay).toBeGreaterThanOrEqual(0);
    expect(r.nationalPension).toBe(0);
    expect(r.healthInsurance).toBe(0);
    expect(r.incomeTax).toBe(0);
    // 공제가 0 이므로 실수령 = 월급(원 미만 절사)
    expect(r.netPay).toBe(Math.floor(annual / 12));
  });

  it("월 과세 보수가 조금이라도 있으면 국민연금 하한(월 41만 기준)은 그대로 적용", () => {
    // 연 300만 = 월 25만, 비과세 20만 → 과세 보수 5만 → 하한 41만 × 4.75% = 19,475 → 10원 절사
    // (2026 요율 명시 — 기본값은 현행 요율 포인터라 1/1 전환 뒤에도 이 리터럴이 유지되도록, N3)
    const r = calculateSalary2026(3_000_000, 200_000, 1, 0, INSURANCE_RATES_2026);
    expect(r.nationalPension).toBe(19_470);
    expect(r.netPay).toBeGreaterThan(0);
  });
});

describe("calculateSalary2026 — 유효 격자 불변", () => {
  it("/table/2026 177행이 전부 유한·양수이고 연봉에 대해 단조 증가", () => {
    const rows = generateAnnualSalaryTableData2026();
    expect(rows.length).toBe(177);
    for (let i = 0; i < rows.length; i++) {
      expect(Number.isFinite(rows[i].monthlyNet)).toBe(true);
      expect(rows[i].monthlyNet).toBeGreaterThan(0);
      if (i > 0) expect(rows[i].monthlyNet).toBeGreaterThan(rows[i - 1].monthlyNet);
    }
  });
});
