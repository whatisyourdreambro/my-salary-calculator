// src/app/tools/finance/severance/legalSeverance.test.ts
//
// /tools/finance/severance '법정 퇴직금 자동계산' 모드가 정본 엔진 calculateSeverancePay 와
// 같은 값을 내는지 고정한다 (A31 · 2026-09-28 감사 S03). 종전 인라인 포크(월급 × 개월수 ÷ 12)는
// 상여금·연차수당을 빼먹어 상여금 받는 사람의 퇴직금을 약 25% 적게 보여 줬다.
import { afterEach, describe, expect, it } from "vitest";

import { calculateSeverancePay } from "@/lib/severanceCalculator";
import {
  calcLegalSeveranceResult,
  DEFAULT_END_DATE,
  DEFAULT_START_DATE,
  type LegalSeveranceInput,
} from "./legalSeverance";

/** 페이지와 같은 방식(3개월 모두 평균 월급)으로 정본을 직접 부른다. */
const canonical = (i: LegalSeveranceInput) =>
  calculateSeverancePay(
    i.startDate,
    i.endDate,
    [i.monthlySalary, i.monthlySalary, i.monthlySalary],
    i.annualBonus,
    i.annualLeavePay
  );

/** 종전 포크 calcLegalSeverance — 비교용으로만 남긴다. */
const legacyFork = (monthlySalary: number, totalMonths: number) =>
  totalMonths < 12 ? 0 : Math.round(monthlySalary * (totalMonths / 12));

const expectSameAsCanonical = (input: LegalSeveranceInput) => {
  const page = calcLegalSeveranceResult(input);
  const ref = canonical(input);
  expect(page.severancePay).toBe(ref.estimatedSeverancePay);
  expect(page.tax).toBe(ref.incomeTax);
  expect(page.localTax).toBe(ref.localTax);
  expect(page.totalTax).toBe(ref.incomeTax + ref.localTax);
  // 결과 카드 행(세전 − 소득세 − 지방세)과 원 단위로 맞춘 값 — 정본 반올림과는 최대 1원 차
  expect(page.netPay).toBe(page.severancePay - page.tax - page.localTax);
  expect(Math.abs(page.netPay - ref.netSeverancePay)).toBeLessThanOrEqual(1);
  return page;
};

describe("상여금·연차수당 받는 사람 — 정본 calculateSeverancePay 와 일치", () => {
  it("감사 S03 사례: 월 400만원 · 5년 · 상여금 1,600만원 · 연차수당 100만원 → 26,509,083원 (포크 20,000,000원, −24.6%)", () => {
    const input = {
      startDate: "2021-10-01",
      endDate: "2026-09-30",
      monthlySalary: 4_000_000,
      annualBonus: 16_000_000,
      annualLeavePay: 1_000_000,
    };
    const r = expectSameAsCanonical(input);
    expect(r.severancePay).toBe(26_509_083);
    expect(r.tax).toBe(565_545);
    expect(r.localTax).toBe(56_554);
    expect(r.netPay).toBe(25_886_984);

    const fork = legacyFork(4_000_000, 60);
    expect(fork).toBe(20_000_000);
    expect((fork - r.severancePay) / r.severancePay).toBeCloseTo(-0.2455, 3);
  });

  it.each([
    // [입사일, 퇴사일(마지막 근무일), 월 급여, 연간 상여금, 연차수당]
    ["2016-03-02", "2026-09-30", 5_500_000, 22_000_000, 1_800_000], // 10년+ · 상여 400%
    ["2019-01-02", "2026-12-31", 3_200_000, 6_400_000, 640_000], // 연말 퇴사 · 92일 창
    ["2023-03-01", "2026-02-28", 2_800_000, 4_200_000, 0], // 2월 말 퇴사 · 90일 창
    ["2001-07-01", "2026-06-30", 8_000_000, 48_000_000, 3_000_000], // 25년 · 근속공제 20년 초과 구간
    ["2024-02-29", "2026-05-31", 4_100_000, 12_300_000, 410_000], // 윤일 입사 · 월말 퇴사
  ])("%s ~ %s · 월 %i · 상여 %i · 연차 %i", (startDate, endDate, monthlySalary, annualBonus, annualLeavePay) => {
    const input = {
      startDate: startDate as string,
      endDate: endDate as string,
      monthlySalary: monthlySalary as number,
      annualBonus: annualBonus as number,
      annualLeavePay: annualLeavePay as number,
    };
    const withBonus = expectSameAsCanonical(input);
    const withoutBonus = expectSameAsCanonical({ ...input, annualBonus: 0, annualLeavePay: 0 });
    if ((annualBonus as number) + (annualLeavePay as number) > 0) {
      expect(withBonus.severancePay).toBeGreaterThan(withoutBonus.severancePay);
    }
  });

  it("상여금·연차수당은 연간 총액의 3/12 만 평균임금에 들어간다", () => {
    const base = {
      startDate: "2021-10-01",
      endDate: "2026-09-30",
      monthlySalary: 4_000_000,
      annualBonus: 0,
      annualLeavePay: 0,
    };
    // 연간 상여금 1,200만원 = 월 급여 3개월치에 300만원(= 1,200만 × 3/12)을 더한 것과 같다
    const bonus = calcLegalSeveranceResult({ ...base, annualBonus: 12_000_000 });
    const sameWage = canonical({ ...base }).estimatedSeverancePay;
    const plus3m = calculateSeverancePay(base.startDate, base.endDate, [7_000_000, 4_000_000, 4_000_000]);
    expect(bonus.severancePay).toBe(plus3m.estimatedSeverancePay);
    expect(bonus.severancePay).toBeGreaterThan(sameWage);
    // 연차수당도 같은 3/12 규칙
    const leave = calcLegalSeveranceResult({ ...base, annualLeavePay: 12_000_000 });
    expect(leave.severancePay).toBe(bonus.severancePay);
  });
});

describe("기본값 (페이지 첫 화면·서버 렌더)", () => {
  const defaults = {
    startDate: DEFAULT_START_DATE,
    endDate: DEFAULT_END_DATE,
    monthlySalary: 4_000_000,
    annualBonus: 0,
    annualLeavePay: 0,
  };
  const originalTz = process.env.TZ;
  afterEach(() => {
    process.env.TZ = originalTz;
  });

  it("정확히 5년 근속 · 월 400만원 → 세전 19,575,938원 · 세후 19,279,133원", () => {
    expect(DEFAULT_START_DATE).toBe("2021-10-01");
    expect(DEFAULT_END_DATE).toBe("2026-09-30");
    const r = expectSameAsCanonical(defaults);
    expect(r.severancePay).toBe(19_575_938);
    expect(r.totalTax).toBe(296_805);
    expect(r.netPay).toBe(19_279_133);
  });

  it("빌드 서버(UTC)와 브라우저(KST·미국) 시간대에서 결과가 같다 — 하이드레이션 불일치 방지", () => {
    const results = ["UTC", "Asia/Seoul", "America/Los_Angeles"].map((tz) => {
      process.env.TZ = tz;
      return calcLegalSeveranceResult(defaults);
    });
    expect(results[1]).toEqual(results[0]);
    expect(results[2]).toEqual(results[0]);
  });
});

describe("경계·입력 방어", () => {
  const base = {
    startDate: "2021-10-01",
    endDate: "2026-09-30",
    monthlySalary: 4_000_000,
    annualBonus: 16_000_000,
    annualLeavePay: 1_000_000,
  };
  const zero = { severancePay: 0, tax: 0, localTax: 0, totalTax: 0, netPay: 0, effectiveRate: 0 };

  it("계속근로 1년 미만은 0원 (1주년 기념일 = 퇴직일이면 1년)", () => {
    expect(calcLegalSeveranceResult({ ...base, startDate: "2025-10-01", endDate: "2026-09-29" })).toEqual(zero);
    expect(calcLegalSeveranceResult({ ...base, startDate: "2025-10-01", endDate: "2026-09-30" }).severancePay).toBeGreaterThan(0);
  });

  it("퇴사일이 입사일보다 빠르거나 날짜가 비면 0원", () => {
    expect(calcLegalSeveranceResult({ ...base, startDate: "2026-09-30", endDate: "2021-10-01" })).toEqual(zero);
    expect(calcLegalSeveranceResult({ ...base, endDate: "" })).toEqual(zero);
    expect(calcLegalSeveranceResult({ ...base, startDate: "" })).toEqual(zero);
  });

  it("음수·NaN 입력은 0 으로 본다 (NaN원 표시 방지)", () => {
    const clean = calcLegalSeveranceResult({ ...base, annualBonus: 0, annualLeavePay: 0 });
    expect(calcLegalSeveranceResult({ ...base, annualBonus: -5_000_000, annualLeavePay: Number.NaN })).toEqual(clean);
    expect(calcLegalSeveranceResult({ ...base, monthlySalary: Number.NaN })).toEqual(zero);
    expect(calcLegalSeveranceResult({ ...base, monthlySalary: -1 })).toEqual(zero);
  });

  it("실효세율 = (소득세 + 지방소득세) ÷ 세전 퇴직금", () => {
    const r = calcLegalSeveranceResult(base);
    expect(r.effectiveRate).toBeCloseTo((r.totalTax / r.severancePay) * 100, 10);
  });
});
