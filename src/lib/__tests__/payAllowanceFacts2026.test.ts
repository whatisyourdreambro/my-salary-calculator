// 봉급표 페이지 수당 사실 고정 (RL-09 재착지 2026-11-15 — 10월 3f5f1a397·34a3ede5f·fb216d08b, PT-01·PT-02·MISSED-pay-1·2)
//
// 원문 대조 2026-11-15, 법제처 국가법령정보센터 공무원수당 등에 관한 규정 현행(대통령령 제36728호, 2026-10-02 시행):
//  - 별표 15 직급보조비(개정 2026. 9. 29.): 경찰·소방 열 경장·순경(소방교·소방사) 175,000 / 경사(소방장) 180,000 /
//    경감·경위(소방경·소방위) 185,000원 → 경찰 봉급표의 '월 17.5만원'은 순경~경장급이다 (경사 포함 아님).
//  - 별표 2 정근수당(개정 2025. 1. 3.): 2년 미만 월봉급액의 10% ~ 10년 이상 50% — 0% 구간은 없다. 지급은 1월·7월(제7조).
//  - 별표 11 특수업무수당(개정 2026. 9. 29.) 다목 교직수당: 교사 등 월 250,000원 정액 — 경력·직무 조건이 아니다.
// 광고 위 목록 문구(같은 폭·더 짧은 교체)는 커밋마다 따로 고정한다 — 광고 이동 스윕에서 한 커밋만 되돌릴 수 있게.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CIVIL_JEONGGEUN_RATE_2026,
  CIVIL_POSITION_ALLOWANCE_2026,
  CIVIL_TEACHER_ALLOWANCE_2026,
} from "@/lib/civilServantAllowances2026";

const read = (p: string) => readFileSync(p, "utf8");

describe("경찰 직급보조비 적용 계급 (PT-01)", () => {
  it("정본 상수: 순경·경장 175,000 / 경사 180,000 / 경위·경감 185,000", () => {
    expect(CIVIL_POSITION_ALLOWANCE_2026.policeFire).toEqual([175_000, 175_000, 180_000, 185_000, 185_000]);
  });

  it("경찰 봉급표 FAQ 의 순경 직급보조비(월 17.5만원)는 순경 값과 같다", () => {
    expect(CIVIL_POSITION_ALLOWANCE_2026.policeFire[0]).toBe(175_000);
    expect(read("src/app/police-pay-2026/page.tsx")).toContain("직급보조비(월 17.5만원)");
  });
});

describe("정근수당 지급률 (PT-02)", () => {
  it("정본 상수: 첫 구간 2년 미만 10%, 마지막 10년 이상 50%", () => {
    expect(CIVIL_JEONGGEUN_RATE_2026[0]).toEqual({ underYears: 2, pct: 10 });
    expect(CIVIL_JEONGGEUN_RATE_2026[CIVIL_JEONGGEUN_RATE_2026.length - 1].pct).toBe(50);
  });

  it("공무원 봉급표 접힌 FAQ 는 10~50%(재직 2년 미만 10%)로 쓴다", () => {
    const src = read("src/app/civil-servant-pay-2026/page.tsx");
    expect(src).toContain("근무연수에 따라 월봉급액의 10~50%(재직 2년 미만 10%)가 대표적입니다.");
    expect(src).not.toContain("월봉급액의 0~50%가");
  });
});

describe("교사 호봉표 교직수당 (MISSED-pay-1·2)", () => {
  it("정본 상수: 교직수당 월 250,000원", () => {
    expect(CIVIL_TEACHER_ALLOWANCE_2026.teaching).toBe(250_000);
  });

  it("접힌 FAQ 는 교직수당 금액을 정본 상수(월 25만원)로 쓴다", () => {
    const src = read("src/app/teacher-pay-2026/page.tsx");
    expect(src).toContain("·교직수당(월 ${CIVIL_TEACHER_ALLOWANCE_2026.teaching / 10000}만원)·담임수당");
  });
});
