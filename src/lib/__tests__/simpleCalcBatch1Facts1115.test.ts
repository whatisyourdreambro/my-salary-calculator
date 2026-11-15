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

const faq = (slug: string, i: number) => calc(slug).faqs?.[i]?.a ?? "";

describe("N2-simple-calc-01 접힌 FAQ 사실 정정 (닫힌 details — 기본 높이 불변, FAQPage 가 같은 글을 따라감)", () => {
  it("simple-calc-b04-F01 주휴: 주 4일 6시간은 4.8시간분 (근로기준법 시행령 별표2 — 4주 소정근로시간 ÷ 통상근로자 소정근로일수)", () => {
    const a = faq("holiday-allowance-quick", 1);
    expect(a).toContain("24 ÷ 40 × 8 = 4.8시간분 주휴수당");
    expect(a).not.toContain("6시간분 주휴수당");
  });
  it("simple-calc-b04-F02 통상임금: 고정성 요건 폐기 (대법원 2024. 12. 19. 2020다247190 전원합의체)", () => {
    const a = faq("annual-leave-pay-quick", 1);
    expect(a).toContain("2020다247190");
    expect(a).not.toContain("고정성을 갖춘다면");
  });
  it("simple-calc-b04-M01 1년 미만 연차 11일은 1년이 끝나면 소멸 (근로기준법 제60조 제7항)", () => {
    const a = faq("annual-leave-pay-quick", 2);
    expect(a).toContain("제60조 제7항");
    expect(a).toContain("입사 후 2년 동안 생기는 연차는 최대 26일(11+15)");
    expect(a).not.toContain("입사 첫해는 최대 26일");
  });
  it("simple-calc-b04-F03 재산세: 6월 1일 현재 사실상 소유자, 6월 1일 잔금이면 매수자 (지방세법 제107조)", () => {
    const a = faq("property-tax-quick", 0);
    expect(a).toContain("6월 2일 이후");
    expect(a).toContain("사실상 소유한 사람");
    expect(a).not.toContain("등기부상 소유자");
  });
  it("simple-calc-b04-F11 부가세: 예정신고 환급세액은 조기환급이 아니면 확정신고 때 정산 (부가가치세법 제59조)", () => {
    const a = faq("vat-quick", 2);
    expect(a).not.toContain("예정신고(4월/10월) 시 가능");
    expect(a).toContain("확정신고(1월/7월) 기한이 지난 뒤 30일 이내");
    expect(a.startsWith("매입세액이 매출세액보다 큰 경우(영세율 수출, 신규 설비투자 등) 환급 대상입니다.")).toBe(true);
  });
  it("simple-calc-b04-F08 스트레스 DSR: 수도권·규제지역 주담대 3% (2025-10-16) 와 7% 예시값 = 계산기 결과", () => {
    const a = faq("loan-affordability", 3);
    expect(a).toContain("2025년 10월 16일부터 3%");
    expect(a).toContain("250,512,613원");
    const c = calc("loan-affordability");
    expect(c.compute({ yearly: 50_000_000, rate: 7 }).primary.value).toBe(250_512_613);
  });
  it("simple-calc-b04-F09 보금자리론: 한국주택금융공사 2026-11-09 공시 금리 (2026-11-15 hf.go.kr 확인)", () => {
    const a = faq("mortgage-monthly-quick", 3);
    expect(a).toContain("2026년 11월 9일 u-보금자리론 기준금리는 만기 10년 연 5.10%, 15년 5.20%, 20년 5.25%, 30년 5.30%, 40년 5.35%, 50년 5.40%");
    expect(a).not.toContain("2026년 9월 1일");
  });
});
