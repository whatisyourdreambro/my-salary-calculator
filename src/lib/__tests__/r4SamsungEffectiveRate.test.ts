// /calc/samsung-bonus 본문 '실효세율 20~40%' -> '20~50%' (R4 SAMSUNG, N2-calc-07 calc-04-F14, 2026-11-18)
//
// 기본값(영업이익 350조, 연봉 8,000만원, OPI1 기본 지급률, 4대보험 적용)에서 계산기의 실효세율은 메모리 45.5%·공통 44.0%·
// 파운드리 41.2% 로 이미 40% 를 넘는다. 숫자 '4' -> '5' 는 사이트 글꼴에서 더 좁다(0.44px).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { computeDivisionPool, defaultDivisionCounts, defaultDivisionRatios, FIXED_OPI1_RATE } from "@/app/calc/samsung-bonus/model";
import { computePersonalBonus } from "@/app/calc/samsung-bonus/personalBonus";
import { DEFAULT_BONUS_CREDIT_RATE } from "@/lib/bonusTaxCalc";

const page = readFileSync(resolve(process.cwd(), "src/app/calc/samsung-bonus/page.tsx"), "utf8");

describe("삼성 성과급 본문 실효세율 범위 (N2-calc-07 calc-04-F14)", () => {
  it("문장은 20~50%", () => {
    expect(page).toContain("가정에 따라 실효세율 20~50% 범위로 달라지므로");
    expect(page).not.toContain("20~40%");
  });

  it("기본값 세 사업부의 실효세율이 40% 를 넘고 50% 안이다", () => {
    const pool = computeDivisionPool(350, defaultDivisionCounts(), defaultDivisionRatios(), true);
    const rates = pool.perDivision.map((d) => computePersonalBonus(80_000_000, d, FIXED_OPI1_RATE, DEFAULT_BONUS_CREDIT_RATE, true).effRate);
    for (const r of rates) {
      expect(r).toBeGreaterThan(40);
      expect(r).toBeLessThan(50);
    }
  });
});
