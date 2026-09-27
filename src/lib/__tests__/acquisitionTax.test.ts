// 취득세 산식 추출 회귀 (2026-09-27) — /tools/real-estate/acquisition-tax 페이지 안에 있던 calcAcquisitionTax 를
// src/lib/acquisitionTax.ts 로 옮기고(산식 무변경) /calc/bonus-home-plan 이 재사용한다.
// 고정값은 지방세법 §11①8 주택 유상취득 세율(6억 이하 1%, 6억~9억 (가액×2/3억−3)%, 9억 초과 3%)과
// 지방교육세 = 취득세액 × 10%(표준세율 주택) 로 손계산했다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { calcAcquisitionTax } from "@/lib/acquisitionTax";

describe("calcAcquisitionTax — 1주택·아파트·85㎡ 이하 고정값", () => {
  it("5억: 1% → 500만 + 지방교육세 50만 = 550만", () => {
    const r = calcAcquisitionTax(500_000_000, true, "apt", false);
    expect(r.tax).toBe(5_000_000);
    expect(r.localEdu).toBe(500_000);
    expect(r.agriSpecial).toBe(0);
    expect(r.total).toBe(5_500_000);
  });

  it("7.5억: (7.5×2/3 − 3) = 2% → 1,500만 + 150만", () => {
    const r = calcAcquisitionTax(750_000_000, true, "apt", false);
    expect(r.taxRate).toBeCloseTo(2, 10);
    expect(r.tax).toBe(15_000_000);
    expect(r.localEdu).toBe(1_500_000);
    expect(r.total).toBe(16_500_000);
  });

  it("10억: 3% → 3,000만 + 300만", () => {
    const r = calcAcquisitionTax(1_000_000_000, true, "apt", false);
    expect(r.tax).toBe(30_000_000);
    expect(r.localEdu).toBe(3_000_000);
    expect(r.total).toBe(33_000_000);
  });

  it("85㎡ 초과면 농특세 0.2% 가 붙고, 2주택 중과(8%)는 지방교육세 0.4%·농특세 0.6% (페이지와 같은 분기)", () => {
    expect(calcAcquisitionTax(500_000_000, true, "apt", true).agriSpecial).toBe(1_000_000);
    const heavy = calcAcquisitionTax(1_000_000_000, false, "apt", false);
    expect(heavy.tax).toBe(80_000_000);
    expect(heavy.localEdu).toBe(4_000_000);
    expect(heavy.total).toBe(84_000_000);
  });

  it("취득세 페이지는 lib 산식을 import 하고 로컬 사본을 두지 않는다", () => {
    const page = readFileSync(resolve(process.cwd(), "src/app/tools/real-estate/acquisition-tax/page.tsx"), "utf8");
    expect(page).toContain('import { calcAcquisitionTax } from "@/lib/acquisitionTax";');
    expect(page).not.toMatch(/function calcAcquisitionTax\(/);
  });
});
