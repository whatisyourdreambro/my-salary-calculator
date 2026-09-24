// src/lib/__tests__/severanceMonthEnd.test.ts
//
// 퇴직금 평균임금 산정기간·1년 요건 회귀 가드 (2026-09-25 감사 CALC-04).
// 평균임금 = 퇴직일(마지막 근무일 다음 날) 이전 3개월 임금 ÷ 그 기간의 총일수
// (근로기준법 §2①6, 고용노동부 퇴직금 계산기 예제: 퇴직일 9/16 → 6/16~9/15 = 92일).
// growth-proposals P2 가 이 엔진을 재사용하므로 일수·금액을 숫자로 고정한다.
import { afterEach, describe, expect, it } from "vitest";

import { calculateSeverancePay } from "@/lib/severanceCalculator";

const START = "2016-06-01";
const WAGE = [3_000_000, 3_000_000, 3_000_000];
const TOTAL = 9_000_000;

/** 평균임금에서 산정기간 일수를 역산한다 (반올림 오차 없이 일치하는지 확인). */
const dailyWageFor = (days: number) => Math.round(TOTAL / days);

describe("평균임금 산정기간 — 퇴직일(마지막 근무일 + 1일) 이전 3개월", () => {
  it.each([
    // [마지막 근무일, 기대 일수, 산정기간]
    ["2026-02-28", 90, "2025-12-01~2026-02-28"],
    ["2026-04-30", 89, "2026-02-01~2026-04-30"],
    ["2026-05-31", 92, "2026-03-01~2026-05-31"],
    ["2026-07-31", 92, "2026-05-01~2026-07-31"],
    ["2026-12-31", 92, "2026-10-01~2026-12-31"],
  ])("월말 퇴사 %s → %i일 (%s)", (lastDay, days) => {
    const r = calculateSeverancePay(START, lastDay as string, WAGE);
    expect(r.averageDailyWage).toBe(dailyWageFor(days as number));
  });

  it("월 중간 퇴사는 종전과 같다 (5/15 → 2/16~5/15 = 89일)", () => {
    const r = calculateSeverancePay(START, "2026-05-15", WAGE);
    expect(r.averageDailyWage).toBe(dailyWageFor(89));
  });

  it("퇴직일 − 3개월에 같은 날짜가 없으면 말일부터, 2월만 3/1부터 센다 (고용노동부 계산기와 동일)", () => {
    // 마지막 근무일 7/30 → 퇴직일 7/31 → 4/31 없음 → 4/30~7/30 = 92일
    expect(calculateSeverancePay(START, "2026-07-30", WAGE).averageDailyWage).toBe(dailyWageFor(92));
    // 마지막 근무일 5/30 → 퇴직일 5/31 → 2/31 없음 → 3/1~5/30 = 91일
    expect(calculateSeverancePay(START, "2026-05-30", WAGE).averageDailyWage).toBe(dailyWageFor(91));
    // 윤년: 마지막 근무일 2028-05-28 → 퇴직일 5/29 → 2/29 있음 → 2/29~5/28 = 90일
    expect(calculateSeverancePay(START, "2028-05-28", WAGE).averageDailyWage).toBe(dailyWageFor(90));
  });

  it("10년 근속 5/31 퇴사 · 월 400만원 → 퇴직금 39,151,876원 (종전 40,471,602원)", () => {
    const r = calculateSeverancePay("2016-06-01", "2026-05-31", [4_000_000, 4_000_000, 4_000_000]);
    expect(r.totalDaysOfEmployment).toBe(3652);
    expect(r.averageDailyWage).toBe(Math.round(12_000_000 / 92));
    expect(r.estimatedSeverancePay).toBe(39_151_876);
  });
});

describe("퇴직금 1년 요건 — 1주년 기념일 기준", () => {
  const pay = (start: string, lastDay: string) =>
    calculateSeverancePay(start, lastDay, WAGE).estimatedSeverancePay;

  it("윤일을 지나는 365일 근속은 하루 모자라 요건 미충족", () => {
    // 2027-03-01 입사 → 1주년 2028-03-01 → 2028-02-29 까지 일해야 1년
    expect(pay("2027-03-01", "2028-02-28")).toBe(0);
    expect(pay("2027-03-01", "2028-02-29")).toBeGreaterThan(0);
  });

  it("윤일이 없는 정확히 1년은 충족", () => {
    expect(pay("2025-03-01", "2026-02-28")).toBeGreaterThan(0);
    expect(pay("2025-09-25", "2026-09-24")).toBeGreaterThan(0);
    expect(pay("2025-09-25", "2026-09-23")).toBe(0);
  });

  it("2/29 입사자의 1주년은 다음 해 3/1 (2/28 까지 근무하면 충족)", () => {
    expect(pay("2024-02-29", "2025-02-27")).toBe(0);
    expect(pay("2024-02-29", "2025-02-28")).toBeGreaterThan(0);
  });

  it("잘못된 날짜·역순 기간은 0", () => {
    expect(pay("", "2026-05-31")).toBe(0);
    expect(pay("2026-05-31", "2025-05-31")).toBe(0);
    expect(pay("2025-02-30", "2026-05-31")).toBe(0);
  });
});

describe("시간대와 무관", () => {
  const originalTz = process.env.TZ;
  afterEach(() => {
    if (originalTz === undefined) delete process.env.TZ;
    else process.env.TZ = originalTz;
  });

  it.each(["America/Los_Angeles", "Asia/Seoul", "UTC"])("%s 에서도 같은 일수·금액", (tz) => {
    process.env.TZ = tz;
    const r = calculateSeverancePay("2016-06-01", "2026-05-31", [4_000_000, 4_000_000, 4_000_000]);
    expect(r.averageDailyWage).toBe(Math.round(12_000_000 / 92));
    expect(r.estimatedSeverancePay).toBe(39_151_876);
    expect(calculateSeverancePay("2027-03-01", "2028-02-28", WAGE).estimatedSeverancePay).toBe(0);
    expect(calculateSeverancePay(START, "2026-02-28", WAGE).averageDailyWage).toBe(dailyWageFor(90));
  });
});
