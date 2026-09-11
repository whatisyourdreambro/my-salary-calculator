// src/lib/__tests__/wageConversion.test.ts
//
// S2-1 "계산 정확성 3건" (docs/next-upgrade-plan-2026-09-11.md §3) 회귀 가드.
//   SI-07: 퀵 계산기 표시 공식 = compute (복리·근로소득세 간이·퇴직금 간이)
import { describe, expect, it } from "vitest";

import { getCalculatorBySlug } from "@/lib/simpleCalculators";

function run(slug: string, overrides: Record<string, number> = {}) {
  const def = getCalculatorBySlug(slug);
  if (!def) throw new Error(`calculator not found: ${slug}`);
  const input: Record<string, number> = {};
  for (const f of def.fields) input[f.name] = f.defaultValue;
  return { def, result: def.compute({ ...input, ...overrides }) };
}

function secondaryValues(result: { secondary?: { value: number }[] }) {
  return (result.secondary ?? []).map((s) => s.value);
}

// ─────────────────────────────────────────────────────────────
// SI-07 — 표시 공식이 compute 와 같은 산식을 말해야 한다 (출력은 불변)
// ─────────────────────────────────────────────────────────────
describe("SI-07 — 퀵 계산기 표시 공식 = compute", () => {
  it("compound-interest-quick: 월복리 + 월 적립 연금항 (finance.futureValue)", () => {
    const { def, result } = run("compound-interest-quick");
    expect(def.formula).toContain("월수익률 r = 연 수익률 ÷ 12");
    expect(def.formula).toContain("원금 × (1+r)ⁿ + 월 적립금 × ((1+r)ⁿ − 1) ÷ r");
    expect(def.formula).toContain("r = 0 이면 원금 + 월 적립금 × n");
    expect(def.formula).not.toContain("연수익률)^년수");
    // 기본값(1,000만·월 50만·연 7%·20년) 출력 불변
    expect(result.primary.value).toBe(300850718);
    expect(secondaryValues(result)).toEqual([130000000, 170850718]);
  });

  it("earned-income-tax-quick: 연 과세표준 재구성 → 누진세율 − 세액공제 → ÷ 12", () => {
    const { def, result } = run("earned-income-tax-quick");
    const formula = def.formula ?? "";
    for (const phrase of [
      "연 총급여 = 월 급여 × 12",
      "근로소득공제",
      "인적공제(150만원 × 본인 포함 가족 수)",
      "연금보험료공제(총급여 × 4.75%, 기준소득월액 상한 적용)",
      "특별공제 근사",
      "2026 누진세율",
      "근로소득세액공제",
      "월 원천징수 추정 = 결정세액 ÷ 12",
    ]) {
      expect(formula).toContain(phrase);
    }
    expect(formula.endsWith("(지방소득세 10% 별도)")).toBe(true);
    // compute 는 간이세액표 비율을 쓰지 않는다 — 옛 문구가 되살아나면 실패
    expect(formula).not.toContain("간이세액표 비율");
    expect(def.caveats?.join("\n") ?? "").not.toContain("간이세액표 기반 단순 시뮬");
    // 기본값(월 400만·가족 1명) 출력 불변 — 2026-09-12 편집 전 실측 고정
    expect(result.primary.value).toBe(190125);
    expect(secondaryValues(result)).toEqual([19013, 2281500, 228150, 28010000]);
  });

  it("severance-pay-quick: 월급 × 근속연수 간이식 + 정밀 계산기 안내", () => {
    const { def, result } = run("severance-pay-quick");
    expect(def.formula).toContain("퇴직금 ≈ 최근 3개월 평균 월급 × 근속연수");
    expect(def.formula).toContain("실제는 1일 평균임금 × 30일 × 재직일수 ÷ 365");
    expect(def.formula).not.toContain("http");
    expect(def.formula).not.toContain("/tools/");
    const caveats = def.caveats ?? [];
    expect(caveats.some((c) => c.includes("1~2% 낮게") && c.includes("/tools/finance/severance"))).toBe(
      true
    );
    // 기본값(월 350만·5년) 출력 불변
    expect(result.primary.value).toBe(17500000);
  });
});
