// N2-simple-calc-01 (2026-11-15 감사 → 같은 날 수정) — batch1 간이 계산기와 enrichments.ts 사실 정정 고정.
// 광고 위 문구는 같은 폭이나 더 좁게가 원칙이라, 바뀐 화면 문구는 글자 종류(한글·숫자·공백·그 밖)별로 종전과 견준다
// (줄 수와 광고 위치는 통합 단계의 실측 스윕이 확인한다).
import { describe, expect, it } from "vitest";
import { getCalculatorBySlug } from "@/lib/simpleCalculators";
import { validateSimpleCalculatorInputs } from "@/lib/simpleCalculatorShare";
import type { CalculatorDef } from "@/lib/simpleCalculators/types";
import { withholdingIncomeTax2026 } from "@/lib/withholdingTaxTable2026";

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

// 광고 위 문구: 글자 종류별로 종전보다 많지 않아야 한다(줄 수는 통합 단계의 실측 스윕이 확인).
const kinds = (s: string) => ({
  hangul: [...s].filter((ch) => /[가-힣]/.test(ch)).length,
  digit: [...s].filter((ch) => /[0-9]/.test(ch)).length,
  space: [...s].filter((ch) => ch === " ").length,
  other: [...s].filter((ch) => !/[가-힣0-9 ]/.test(ch)).length,
});
const notWider = (now: string, was: string, what: string) => {
  const a = kinds(now);
  const b = kinds(was);
  for (const k of ["hangul", "digit", "space", "other"] as const) expect(a[k], `${what} ${k}`).toBeLessThanOrEqual(b[k]);
};

describe("simple-calc-b01-F01 — 근로소득세 간편 계산 = 2026 별표2 간이세액표 엔진 (홈 연봉 계산기와 같은 withholdingIncomeTax2026)", () => {
  const eit = () => calc("earned-income-tax-quick");
  it.each([
    [1_500_000, 1, 8_920],
    [3_000_000, 2, 56_850],
    [3_500_000, 3, 62_460],
    [4_000_000, 1, 195_960],
    [4_000_000, 3, 109_590],
    [10_000_000, 1, 1_507_400],
  ])("월 %i원·가족 %i명 → 월 원천징수 %i원 (= 엔진, 자녀 0명)", (monthly, dependents, expected) => {
    const r = eit().compute({ monthly, dependents });
    expect(r.primary.value).toBe(withholdingIncomeTax2026(monthly, dependents, 0));
    expect(r.primary.value).toBe(expected);
    const local = Math.round(expected * 0.1);
    expect((r.secondary ?? []).map((x) => x.value)).toEqual([local, expected * 12, local * 12, expected + local]);
  });
  it("결과 줄 구성 4줄 유지, 라벨은 종전과 같거나 짧고 안내문은 더 짧다 (결과 칸, CalcResultAd 위)", () => {
    const r = eit().compute({ monthly: 4_000_000, dependents: 1 });
    expect(r.primary.label).toBe("월 원천징수 추정");
    const labels = (r.secondary ?? []).map((x) => x.label);
    expect(labels).toEqual(["월 지방소득세 (소득세의 10%)", "연 원천징수 합계", "연 지방소득세 합계", "월 세금 합계"]);
    const was = ["월 지방소득세 (소득세의 10%)", "연 결정세액 추정", "연 지방소득세 추정", "연 과세표준 추정"];
    labels.forEach((l, i) => notWider(l, was[i], `label ${i}`));
    // 안내문은 한글 47자 → 28자로 줄고 숫자·기호가 늘어 글자 종류별 비교가 맞지 않는다 — 보수적 폭 추정(한글 0.92em·숫자 0.62em·
    // 공백 0.27em·그 밖 0.9em)으로 견준다. 사이트 글꼴(Pretendard 서브셋) 실측: 46.61em → 40.07em (wght 400).
    const est = (t: string) => { const k = kinds(t); return k.hangul * 0.92 + k.digit * 0.62 + k.space * 0.27 + k.other * 0.9; };
    expect(est(r.note ?? "")).toBeLessThan(est("간이세액표 근사 — 실제 원천징수는 회사 신고 방식에 따라 상이. 비과세 항목·공제 신청 내역에 따라 달라질 수 있습니다."));
    // 숫자 줄: 기본값에서 자릿수가 같거나 적다 (종전 19,013 / 2,281,500 / 228,150 / 28,010,000)
    expect((r.secondary ?? []).map((x) => String(x.value).length)).toEqual([5, 7, 6, 6]);
  });
  it("FAQ4·유의사항·본문 숫자가 새 계산과 같고, 광고 위 문구는 종전보다 넓지 않다", () => {
    const c = eit();
    const faq4 = c.faqs?.[3]?.a ?? "";
    expect(faq4).toContain("109,590원");
    expect(faq4).toContain("195,960원");
    expect(faq4).toContain("86,370원");
    expect(faq4).not.toContain("근사치");
    expect(c.caveats?.[0]).toBe("결과는 간이세액표의 월 원천징수액이며, 연말정산 결정세액은 실제 공제 내역에 따라 이와 달라집니다.");
    notWider(c.caveats?.[0] ?? "", "국세청 간이세액표 원본을 조회하지 않고 산정 구조를 근사한 값이라, 같은 월급이라도 실제 표의 금액과 차이가 날 수 있습니다.", "caveat 1");
    const paras = (c.details ?? "").split("\n\n");
    expect(paras[1]).toContain("월 원천징수 추정은 195,960원, 월 지방소득세(소득세의 10%)는 19,596원입니다.");
    expect(paras[1]).toContain("연 원천징수 합계 2,351,520원, 연 지방소득세 합계 235,152원이고 월 세금 합계는 215,556원입니다.");
    notWider(
      paras[1],
      "기본 입력값 월 급여 4,000,000원, 부양가족 수 1명을 넣으면 월 원천징수 추정은 190,125원, 월 지방소득세(소득세의 10%)는 19,013원입니다. 연 단위로는 연 과세표준 추정 28,010,000원에 연 결정세액 추정 2,281,500원, 연 지방소득세 추정 228,150원이 나옵니다.",
      "details p2"
    );
    expect(paras[2]).toContain("2026년 2월 27일 개정된 소득세법 시행령 별표2의 표 금액을 쓰고");
    expect(paras[2]).not.toContain("근사치이고");
    // 공식: 줄 수와 줄마다 글자 수가 종전 가장 긴 줄보다 짧다 (계산 공식 블록, InArticleAd 위)
    const lines = (c.formula ?? "").split("\n");
    expect(lines.length).toBeLessThanOrEqual(3);
    for (const l of lines) expect([...l].length).toBeLessThan(90);
  });
  it("메타 재료(설명문)·제목·설명은 그대로 — calcDescriptionFreeze 대상 아님", () => {
    const c = eit();
    expect(c.description).toBe("월 급여 → 간이세액표 기반 원천징수액");
    expect(c.explanation?.startsWith("근로소득세는 매월 급여에서 원천징수되는 세금으로, 간이세액표(국세청 고시) 기준")).toBe(true);
  });
});

describe("simple-calc-b04-F01 (2)(3) 주휴수당 계산 유의사항·본문 — 주 40시간 미만은 주 소정근로시간 기준 (광고 위, 더 좁게)", () => {
  it("유의사항 1·본문 마지막 단락", () => {
    const c = calc("holiday-allowance-quick");
    const was = "하루 8시간 근무를 전제로 시급에 8을 곱하므로, 주 4일 6시간 근무처럼 1일 소정근로시간이 다르면 그 시간에 맞춰 직접 환산해야 합니다.";
    expect(c.caveats?.[0]).toBe("하루 8시간 근무를 전제로 시급에 8을 곱하므로, 주 40시간 미만 근무라면 주 소정근로시간÷40×8시간분으로 직접 환산해야 합니다.");
    // 한글·공백은 줄고 숫자·기호가 늘어 글자 종류별 비교 대신 실측 폭: 53.11em → 51.27em (wght 400)
    expect(kinds(c.caveats?.[0] ?? "").hangul).toBeLessThan(kinds(was).hangul);
    expect(c.details).toContain("주 소정근로시간의 5분의 1로 다시 계산해야");
    expect(c.details).not.toContain("1주 평균 1일 소정근로시간");
    notWider("주 소정근로시간의 5분의 1로 다시 계산해야", "1주 평균 1일 소정근로시간으로 다시 계산해야", "holiday details");
    // 4.8시간 예: 주 24시간 ÷ 5 = 24 ÷ 40 × 8
    expect(24 / 5).toBe((24 / 40) * 8);
  });
});
