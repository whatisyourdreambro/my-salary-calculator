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
    // 리뷰(2026-11-15): 검증 문구의 소정근로시간÷40×8시간분으로 는 띄어쓰기 없는 한 덩어리(약 13em)라 keep-all 줄바꿈에서
    // 폭 약 18.3~21em(뷰포트 약 380~420px, 390·393·412px 폰 포함) 유의사항이 3줄 → 4줄로 늘어 아래 광고를 밀 수 있었다.
    // 같은 값(÷40×8 = ÷5)을 본문과 같은 말로 써 10~42em 전 구간에서 줄 수가 종전보다 많아지지 않게 했다(53.11em → 48.87em).
    expect(c.caveats?.[0]).toBe("하루 8시간 근무를 전제로 시급에 8을 곱하므로, 주 40시간 미만 근무라면 주 소정근로시간의 5분의 1로 직접 환산해야 합니다.");
    expect(c.caveats?.[0]).not.toContain("÷40×8");
    // 한글 52→47·공백 19→17, 숫자만 5→6 — 보수적 폭 추정(한글 0.92em·숫자 0.62em·공백 0.27em·그 밖 0.9em)으로도 더 좁다
    const est = (t: string) => { const k = kinds(t); return k.hangul * 0.92 + k.digit * 0.62 + k.space * 0.27 + k.other * 0.9; };
    expect(est(c.caveats?.[0] ?? "")).toBeLessThan(est(was));
    expect(kinds(c.caveats?.[0] ?? "").hangul).toBeLessThan(kinds(was).hangul);
    expect(c.details).toContain("주 소정근로시간의 5분의 1로 다시 계산해야");
    expect(c.details).not.toContain("1주 평균 1일 소정근로시간");
    notWider("주 소정근로시간의 5분의 1로 다시 계산해야", "1주 평균 1일 소정근로시간으로 다시 계산해야", "holiday details");
    // 4.8시간 예: 주 24시간 ÷ 5 = 24 ÷ 40 × 8
    expect(24 / 5).toBe((24 / 40) * 8);
  });
});

describe("simple-calc-b04-F08 (2)(3) 내 연봉 가능 대출액 유의사항·본문 — 수도권·규제지역 주담대 스트레스 금리 3% (광고 위, 더 좁게)", () => {
  it("유의사항 1·본문 3단락, 출처는 정확히 2개", () => {
    const c = calc("loan-affordability");
    expect(c.caveats?.[0]).toContain("스트레스 금리 1.50%(수도권·규제지역 주담대 3%)");
    expect(c.caveats?.[0]).not.toContain("2025년 7월 이후 은행 심사 한도");
    expect(c.details).toContain("1.50%(수도권·규제지역 주담대 3%, 지방 주담대 0.75%)");
    expect(c.details).not.toContain("1.50%(지방 주택담보대출은 0.75%)");
    expect(c.sources).toHaveLength(2);
    // 실측 폭(wght 400): 유의사항 70.51em → 68.40em. 한글 수는 줄었다.
    expect(kinds(c.caveats?.[0] ?? "").hangul).toBeLessThan(64);
    // 리뷰(2026-11-15): 본문 3단락은 전체 폭이 좁아져도 keep-all 줄바꿈에서 폭 약 19.6~20.3em(뷰포트 약 384~394px — 390·393px 폰)과
    // 약 28.8~30.8em 에서 한 줄 늘었다. 스트레스 금리를 앞으로 옮기고 한도를 산정하므로 를 얹으므로 로 줄여 전 구간에서 줄 수가 종전 이하.
    const p3 = (c.details ?? "").split("\n\n")[2] ?? "";
    expect(p3).toContain("실제 금리에 스트레스 금리 1.50%(수도권·규제지역 주담대 3%, 지방 주담대 0.75%)를 얹으므로, 예상 금리 칸에 그 값을 더해야 은행 계산에 가까워집니다.");
    // 기호(·%())가 3개 늘고 한글·공백이 줄어 글자 종류별 비교 대신 보수적 폭 추정으로 견준다(실측 169.32em → 160.00em).
    const wasP3 =
      "40%는 금융위원회가 2021년 10월 가계부채 관리 강화방안에서 정한 차주단위 DSR 규제비율로 은행권 40%, 제2금융권은 2022년 1월부터 50%가 적용됩니다. 여기에 2025년 7월 1일부터 시행된 3단계 스트레스 DSR은 변동·혼합·주기형 대출의 DSR을 계산할 때 실제 금리에 1.50%(지방 주택담보대출은 0.75%)의 스트레스 금리를 얹어 한도를 산정하므로, 예상 금리 칸에 스트레스 금리를 더한 값을 넣어야 은행 계산에 가까워집니다.";
    const est = (t: string) => { const k = kinds(t); return k.hangul * 0.92 + k.digit * 0.62 + k.space * 0.27 + k.other * 0.9; };
    expect(est(p3)).toBeLessThan(est(wasP3));
    expect(kinds(p3).hangul).toBeLessThan(kinds(wasP3).hangul);
    expect(kinds(p3).space).toBeLessThan(kinds(wasP3).space);
  });
});

describe("simple-calc-b04-F09 (2) 주택담보대출 월 상환액 유의사항·본문·출처 — 보금자리론 2026-11-09 공시 (광고 위, 더 좁게)", () => {
  it("유의사항 3·본문 3단락·출처 제목", () => {
    const c = calc("mortgage-monthly-quick");
    expect(c.caveats?.[2]).toBe("기본값 금리 4%는 예시이며, 2026년 11월 9일 공시 기준 보금자리론 30년 만기 금리는 u-보금자리론 연 5.30%, 아낌e-보금자리론 연 5.20%입니다.");
    expect(c.details).toContain("2026년 11월 9일 공시 기준 u-보금자리론이 만기 10년 연 5.10%부터 50년 연 5.40%, 아낌e-보금자리론이 10년 연 5.00%부터 50년 연 5.30%이며");
    expect(c.details).not.toContain("2026년 9월 1일 공시");
    expect(c.sources?.[0]).toEqual({ title: "한국주택금융공사 — 보금자리론 금리안내(2026년 11월 공시)", url: "https://www.hf.go.kr/ko/sub01/sub01_01_04.do" });
    expect(c.sources).toHaveLength(2);
    notWider(c.sources?.[0]?.title ?? "", "한국주택금융공사 — 보금자리론 금리안내(2026년 9월 1일 공시)", "source title");
  });
});

describe("simple-calc-b04-F12 복리 계산 설명 — 근거 없는 워런 버핏 인용 삭제 (광고 위, 더 짧게, 메타 불변)", () => {
  it("설명문", () => {
    const c = calc("compound-interest-quick");
    expect(c.explanation).not.toContain("워런 버핏");
    expect(c.explanation).toContain("흔히 '세계 8대 불가사의'로 불리며, 연 7% 복리로 10년이면 원금 2배");
    notWider("흔히 '세계 8대 불가사의'로 불리며,", "워런 버핏도 '복리는 세계 8대 불가사의'라 칭했으며,", "compound explanation");
  });
});

// lens-meta-M01: 간이 계산기는 화면에 날짜가 없고 사이트맵 lastmod 는 CalculatorDef.publishedAt 하나만 읽는다(sitemap.ts).
// N2-simple-calc-01 이 사실을 고친 계산기는 실제로 고친 날(2026-11-15 KST)을 단다. 기간 0년 가드만 들어간 두 대출 계산기는 제외.
describe("N2-simple-calc-01 날짜 손잡이 — 고친 계산기의 publishedAt", () => {
  it("실제 수정일 2026-11-15, 미래 날짜 아님", () => {
    for (const slug of [
      "earned-income-tax-quick",
      "holiday-allowance-quick",
      "annual-leave-pay-quick",
      "property-tax-quick",
      "loan-affordability",
      "vat-quick",
      "compound-interest-quick",
      "mortgage-monthly-quick",
    ]) {
      const c = calc(slug);
      expect(c.publishedAt, slug).toBe("2026-11-15");
      expect(new Date(`${c.publishedAt}T00:00:00+09:00`).getTime(), slug).toBeLessThanOrEqual(Date.now());
    }
    for (const slug of ["loan-monthly-payment", "loan-total-interest"]) expect(calc(slug).publishedAt, slug).toBeUndefined();
  });
});

// 감사 아이디어 ideas[2] — 같은 별표2 엔진을 쓰는 홈 연봉 계산기(비과세·8~20세 자녀 입력)로 잇는 문장. 기존 닫힌 FAQ 답 끝에만.
describe("근로소득세 간편 계산 접힌 FAQ — 비과세·자녀 입력은 홈 연봉 실수령액 계산기로", () => {
  it("FAQ2 답 끝 한 문장 (출산지원금·자녀학자금 문구는 넣지 않는다 — childcareAllowanceWording1102)", () => {
    const a = calc("earned-income-tax-quick").faqs?.[1]?.a ?? "";
    expect(a).toContain("비과세 수당과 8세 이상 20세 이하 자녀 수까지 넣어 같은 간이세액표로 원천징수액을 보려면 사이트 홈의 연봉 실수령액 계산기를 이용하세요.");
    expect(a).not.toContain("출산지원금");
    expect(a).not.toContain("자녀학자금");
  });
});
