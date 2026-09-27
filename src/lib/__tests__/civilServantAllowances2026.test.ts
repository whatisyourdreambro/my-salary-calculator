// 공무원 수당·기여금 정본(civilServantAllowances2026.ts) 법령 스냅샷 고정 (2026-09-27, 공무원 월급 실수령액 계산기)
//
// 기대값은 법제처 DRF 현행 본문(공무원수당 등에 관한 규정 대통령령 제36015호 2026-01-02, 공무원연금법 제67조,
// 소득세법 제12조제3호러목)과 인사혁신처장 고시(2026-04-30, 기준소득월액 평균액 5,950,000원)를 손으로 옮긴 값이다.
// 1월 수당 규정 개정·4월 평균액 고시 때 원문과 다시 대조한 뒤에만 바꿀 것.

import { describe, expect, it } from "vitest";
import {
  CIVIL_FAMILY_ALLOWANCE_2026,
  CIVIL_HAZARD_ALLOWANCE_2026,
  CIVIL_HOLIDAY_BONUS_RATE_2026,
  CIVIL_JEONGGEUN_ADDON_2026,
  CIVIL_JEONGGEUN_ADDON_EXTRA_2026,
  CIVIL_JEONGGEUN_RATE_2026,
  CIVIL_MEAL_ALLOWANCE_2026,
  CIVIL_MEAL_NONTAX_CAP_2026,
  CIVIL_OVERTIME_2026,
  CIVIL_PENSION_2026,
  CIVIL_POSITION_ALLOWANCE_2026,
  CIVIL_TEACHER_ALLOWANCE_2026,
} from "@/lib/civilServantAllowances2026";
import { HAZARD_ALLOWANCE_2026, POSITION_ALLOWANCE_2026, TEACHER_ALLOWANCE_2026 } from "@/lib/civilServantPay";

describe("공무원수당 등에 관한 규정 2026 스냅샷", () => {
  it("정액급식비 월 16만원(제18조)·식사대 비과세 한도 월 20만원(소득세법 제12조제3호러목)", () => {
    expect(CIVIL_MEAL_ALLOWANCE_2026).toBe(160_000);
    expect(CIVIL_MEAL_NONTAX_CAP_2026).toBe(200_000);
    expect(CIVIL_MEAL_ALLOWANCE_2026).toBeLessThanOrEqual(CIVIL_MEAL_NONTAX_CAP_2026);
  });

  it("직급보조비(별표 15) — 일반직 9~5급·경찰소방 순경~경감·교사 0·병 0", () => {
    expect(CIVIL_POSITION_ALLOWANCE_2026.general).toEqual([175_000, 175_000, 180_000, 185_000, 250_000]);
    expect(CIVIL_POSITION_ALLOWANCE_2026.policeFire).toEqual([175_000, 175_000, 180_000, 185_000, 185_000]);
    expect(CIVIL_POSITION_ALLOWANCE_2026.teacher).toBe(0);
    expect(CIVIL_POSITION_ALLOWANCE_2026.soldier).toBe(0);
  });

  it("기존 봉급표 페이지의 직급보조비 표(civilServantPay.POSITION_ALLOWANCE_2026)와 겹치는 급수가 같다", () => {
    const byGrade = Object.fromEntries(POSITION_ALLOWANCE_2026.map((row) => [row.grade, row.amount]));
    const [g9, g8, g7, g6, g5] = CIVIL_POSITION_ALLOWANCE_2026.general;
    expect(byGrade["8·9급"]).toBe(g9);
    expect(byGrade["8·9급"]).toBe(g8);
    expect(byGrade["7급"]).toBe(g7);
    expect(byGrade["6급"]).toBe(g6);
    expect(byGrade["5급"]).toBe(g5);
  });

  it("가족수당(별표 5) 금액과 부양가족 4명 상한", () => {
    expect(CIVIL_FAMILY_ALLOWANCE_2026).toEqual({
      spouse: 40_000,
      otherEach: 20_000,
      firstChild: 50_000,
      secondChild: 80_000,
      thirdPlusChild: 120_000,
      maxDependents: 4,
    });
  });

  it("정근수당 지급률(별표 2 제1호)·가산금(제2호, 전 공무원 열)·추가 가산금", () => {
    expect(CIVIL_JEONGGEUN_RATE_2026.map((row) => [row.underYears, row.pct])).toEqual([
      [2, 10],
      [5, 20],
      [6, 25],
      [7, 30],
      [8, 35],
      [9, 40],
      [10, 45],
      [Number.POSITIVE_INFINITY, 50],
    ]);
    expect(CIVIL_JEONGGEUN_ADDON_2026.map((row) => [row.underYears, row.amount])).toEqual([
      [5, 30_000],
      [10, 50_000],
      [15, 60_000],
      [20, 80_000],
      [Number.POSITIVE_INFINITY, 100_000],
    ]);
    expect(CIVIL_JEONGGEUN_ADDON_EXTRA_2026).toEqual({ from20: 10_000, from25: 30_000 });
  });

  it("명절휴가비 월봉급액 60%(제18조의3)", () => {
    expect(CIVIL_HOLIDAY_BONUS_RATE_2026).toBe(0.6);
  });

  it("교직수당 25만·담임 20만·보직교사 15만(별표 11 다목) — 기존 교원 수당 표와 같다", () => {
    expect(CIVIL_TEACHER_ALLOWANCE_2026).toEqual({ teaching: 250_000, homeroom: 200_000, headTeacher: 150_000 });
    expect(CIVIL_TEACHER_ALLOWANCE_2026.homeroom).toBe(TEACHER_ALLOWANCE_2026.homeroom);
    expect(CIVIL_TEACHER_ALLOWANCE_2026.headTeacher).toBe(TEACHER_ALLOWANCE_2026.headTeacher);
  });

  it("위험근무수당 갑종 6만(별표 8) + 가산금 2만(별표 9 비고) = 기존 표기 8만원", () => {
    expect(CIVIL_HAZARD_ALLOWANCE_2026).toEqual({ gap: 60_000, eul: 50_000, byeong: 40_000, surcharge: 20_000 });
    expect(CIVIL_HAZARD_ALLOWANCE_2026.gap + CIVIL_HAZARD_ALLOWANCE_2026.surcharge).toBe(HAZARD_ALLOWANCE_2026);
    expect(HAZARD_ALLOWANCE_2026).toBe(80_000);
  });

  it("시간외근무수당(제15조제2항·별표 12) 비율·기준호봉·정액분 10시간", () => {
    expect(CIVIL_OVERTIME_2026.rateLow).toBe(0.6);
    expect(CIVIL_OVERTIME_2026.rateBase).toBe(0.55);
    expect(CIVIL_OVERTIME_2026.divisor).toBe(209);
    expect(CIVIL_OVERTIME_2026.premium).toBe(1.5);
    expect(CIVIL_OVERTIME_2026.generalBaseHobong).toBe(10);
    expect(CIVIL_OVERTIME_2026.policeFireEntryBaseHobong).toBe(9);
    expect(CIVIL_OVERTIME_2026.policeFireBaseHobong).toBe(10);
    expect(CIVIL_OVERTIME_2026.teacherBase.map((row) => [row.maxHobong, row.base])).toEqual([
      [19, 18],
      [29, 21],
      [Number.POSITIVE_INFINITY, 23],
    ]);
    expect(CIVIL_OVERTIME_2026.flatHours).toBe(10);
  });

  it("공무원연금 기여금 9%·상한 = 평균액 5,950,000원 × 160% = 9,520,000원·36년 초과 면제(연금법 제67조)", () => {
    expect(CIVIL_PENSION_2026.rate).toBe(0.09);
    expect(CIVIL_PENSION_2026.avgBaseIncome).toBe(5_950_000);
    expect(CIVIL_PENSION_2026.capMultiplier).toBe(1.6);
    expect(CIVIL_PENSION_2026.cap).toBe(Math.round(CIVIL_PENSION_2026.avgBaseIncome * CIVIL_PENSION_2026.capMultiplier));
    expect(CIVIL_PENSION_2026.cap).toBe(9_520_000);
    expect(CIVIL_PENSION_2026.maxYears).toBe(36);
  });
});
