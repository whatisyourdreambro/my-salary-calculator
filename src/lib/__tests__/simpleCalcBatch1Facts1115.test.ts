// N2-simple-calc-01 (2026-11-15 감사 → 같은 날 수정) — batch1 간이 계산기와 enrichments.ts 사실 정정 고정.
// 광고 위 문구는 같은 폭이나 더 좁게가 원칙이라, 바뀐 화면 문구는 글자 종류(한글·숫자·공백·그 밖)별로 종전과 견준다
// (줄 수와 광고 위치는 통합 단계의 실측 스윕이 확인한다).
import { describe, expect, it } from "vitest";
import { getCalculatorBySlug } from "@/lib/simpleCalculators";
import { validateSimpleCalculatorInputs } from "@/lib/simpleCalculatorShare";
import type { CalculatorDef } from "@/lib/simpleCalculators/types";

const calc = (slug: string): CalculatorDef => {
  const c = getCalculatorBySlug(slug);
  if (!c) throw new Error(`missing calculator ${slug}`);
  return c;
};
const defaults = (c: CalculatorDef) => Object.fromEntries(c.fields.map((f) => [f.name, f.defaultValue])) as Record<string, number>;

describe("simple-calc-b01-F02 — 대출 기간 0년은 계산 불가로 막고 0.5년은 그대로 계산", () => {
  it.each([
    ["loan-monthly-payment", "월 상환액"],
    ["loan-total-interest", "총 이자"],
  ])("%s: years 0 → 검증 실패(공유·결과 표시 안 함), 0.5 → 정상, 기본값 결과 불변", (slug, label) => {
    const c = calc(slug);
    const d = defaults(c);
    expect(validateSimpleCalculatorInputs({ ...d, years: 0 }, c)).toBeNull();
    const zero = c.compute({ ...d, years: 0 });
    expect(zero.primary.label).toBe(label);
    expect(Number.isNaN(zero.primary.value)).toBe(true);
    expect(validateSimpleCalculatorInputs({ ...d, years: 0.5 }, c)).not.toBeNull();
    expect(c.compute({ ...d, years: 0.5 }).primary.value).toBeGreaterThan(0);
  });
  it("기본값 출력은 종전과 같다 (1억·4%·10년 / 30년)", () => {
    const m = calc("loan-monthly-payment");
    expect(m.compute(defaults(m)).primary.value).toBe(1012451);
    const t = calc("loan-total-interest");
    expect(t.compute(defaults(t)).primary.value).toBe(71869506);
  });
});
