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

// 2026-10-05 감사 code20-01·code37-04 — 토지 농어촌특별세 0.2% (농어촌특별세법 제5조 제1항 제6호: 표준세율을 2%로
// 적용한 취득세액의 10%. 85㎡ 이하 면제는 서민주택에만 — 같은 법 제4조). 토지 합계 4.6% = 4% + 교육세 0.4% + 농특세 0.2%.
describe("calcAcquisitionTax — 토지 농특세", () => {
  it("5억 토지: 2,000만 + 200만 + 100만 = 2,300만 (종전 2,200만)", () => {
    for (const isOver85 of [false, true]) {
      for (const isFirst of [true, false]) {
        const r = calcAcquisitionTax(500_000_000, isFirst, "land", isOver85);
        expect(r.tax).toBe(20_000_000);
        expect(r.localEdu).toBe(2_000_000);
        expect(r.agriSpecial).toBe(1_000_000);
        expect(r.total).toBe(23_000_000);
      }
    }
  });
  it("주택은 종전대로 — 85㎡ 이하 0, 초과 0.2%·중과 0.6%", () => {
    expect(calcAcquisitionTax(500_000_000, true, "single", false).agriSpecial).toBe(0);
    expect(calcAcquisitionTax(500_000_000, true, "single", true).agriSpecial).toBe(1_000_000);
    expect(calcAcquisitionTax(1_000_000_000, false, "apt", true).agriSpecial).toBe(6_000_000);
  });
  it("결과 라벨·안내문 — 토지는 면적과 무관하게 0.2%, 안내문 글자 수 원문 이하", () => {
    const page = readFileSync(resolve(process.cwd(), "src/app/tools/real-estate/acquisition-tax/page.tsx"), "utf8");
    expect(page).toContain('propType === "land"\n ? "농어촌특별세 (0.2%)"'.replace(/\n/g, page.includes("\r\n") ? "\r\n" : "\n"));
    const before = "농어촌특별세는 전용면적 85㎡ 초과 주택에만 부과되며 85㎡ 이하는 면제됩니다.";
    const after = "농어촌특별세는 토지와 85㎡ 초과 주택에만 부과되며 85㎡ 이하는 면제됩니다.";
    expect(page).toContain(after);
    const hangul = (s: string) => [...s].filter((c) => /[가-힣]/.test(c)).length;
    const other = (s: string) => [...s].filter((c) => !/[가-힣]/.test(c)).length;
    expect(hangul(after)).toBeLessThanOrEqual(hangul(before));
    expect(other(after)).toBeLessThanOrEqual(other(before));
    const content = readFileSync(resolve(process.cwd(), "src/lib/toolContent.ts"), "utf8");
    expect(content).toContain("그리고 토지와 85㎡ 초과 주택에는 농어촌특별세 0.2%가 더해지며");
    expect(content).toContain("토지는 면적과 관계없이 취득가액의 0.2%");
  });
});
