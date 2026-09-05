// 연관 계산기 추천망 회귀 가드 (2026-09-05, L14')
//
// 배경: 연말정산 도구 7종을 tax 카테고리 끝에 붙였더니 limit=4 규칙상 어떤 페이지에서도
// 렌더되지 않았다(리뷰 실측). 전용 yearEnd 카테고리를 두고 시즌 페이지만 우선 소비하게 했다.
// 이 테스트는 (1) 시즌 페이지가 실제로 공제 도구를 받는지, (2) tax 우선 페이지의 기존 4종이
// 변하지 않았는지 고정한다.

import { describe, expect, it } from "vitest";
import { getRelatedCalculators } from "@/lib/relatedCalculators";

const paths = (p: string, limit = 4) => getRelatedCalculators(p, limit).map((i) => i.path);

const YEAR_END_TOOLS = [
  "/year-end-tax",
  "/credit-card-deduction-2026",
  "/rent-tax-credit-2026",
  "/medical-tax-credit-2026",
  "/donation-tax-credit-2026",
  "/calc/dual-income-year-end",
  "/calc/dependent-check",
  "/calc/child-deduction",
];

describe("연말정산 클러스터 추천(yearEnd)", () => {
  it("허브 /year-end-tax-2027 는 공제·판정 도구 4종을 받는다", () => {
    const got = paths("/year-end-tax-2027");
    expect(got).toHaveLength(4);
    for (const p of got) expect(YEAR_END_TOOLS).toContain(p);
  });

  it("R2 3종·공제 계산기는 서로를 추천하고 자기 자신은 제외한다", () => {
    for (const self of [
      "/calc/dual-income-year-end",
      "/calc/dependent-check",
      "/calc/child-deduction",
      "/credit-card-deduction-2026",
      "/medical-tax-credit-2026",
    ]) {
      const got = paths(self);
      expect(got).toHaveLength(4);
      expect(got).not.toContain(self);
      expect(got.filter((p) => YEAR_END_TOOLS.includes(p)).length).toBeGreaterThanOrEqual(3);
    }
  });

  it("tax 우선 페이지의 기존 추천 4종은 변하지 않는다 (yearEnd 도구가 섞이지 않음)", () => {
    expect(paths("/income-tax-2026")).toEqual([
      "/health-insurance-fee-2026",
      "/year-end-tax",
      "/tools/finance/bonus",
      "/tools/finance/freelance-tax",
    ]);
    const bonus = paths("/calc/samsung-bonus");
    expect(bonus).toHaveLength(4);
    expect(bonus.filter((p) => YEAR_END_TOOLS.includes(p) && p !== "/year-end-tax")).toHaveLength(0);
  });
});
