// N2-simple-calc-03 (2026-11-15 감사 → 같은 날 수정) — enrichments-ext-a.ts 의 접힌 FAQ 답 사실 고정.
// 모두 닫힌 <details> 안의 글이라 기본 화면 높이는 그대로이고, FAQPage 구조화 데이터가 같은 글을 따라간다.
import { describe, expect, it } from "vitest";
import { getCalculatorBySlug } from "@/lib/simpleCalculators";

const faqAnswers = (slug: string) => {
  const c = getCalculatorBySlug(slug);
  if (!c) throw new Error(`missing calculator ${slug}`);
  return (c.faqs ?? []).map((f) => f.a);
};

describe("simple-calc-b02-F03 — RL-10 이 설명을 209 ÷ 48 기준으로 옮긴 뒤 FAQ 가 '설명의 4.345주'를 가리키지 않는다", () => {
  it("연봉→시급·주급 첫 FAQ 는 달력상 평균 4.345주(365 ÷ 7 ÷ 12)라고 쓴다", () => {
    for (const slug of ["yearly-to-hourly", "weekly-pay"]) {
      const first = faqAnswers(slug)[0];
      expect(first, slug).toContain("달력상 평균 4.345주(365 ÷ 7 ÷ 12)");
      expect(first, slug).not.toContain("설명의 4.345주");
      // 설명(메타 스니펫)은 RL-10 문구 그대로 — 4.345주는 FAQ 만 설명한다
      expect(getCalculatorBySlug(slug)?.explanation, slug).not.toContain("4.345");
    }
  });
});

describe("simple-calc-b02-F01 — 2027년 최저임금은 계약 시점이 아니라 2027-01-01 이후 일한 기간에 적용 (최저임금법 제6조·제10조)", () => {
  it("연봉→시급 FAQ '2027년 최저임금과 비교하려면'은 일한 기간으로 나눠 비교하라고 한다", () => {
    const c = getCalculatorBySlug("yearly-to-hourly");
    const item = (c?.faqs ?? []).find((f) => f.q === "2027년 최저임금과 비교하려면 어떻게 하나요?");
    expect(item).toBeDefined();
    const a = item?.a ?? "";
    expect(a).not.toContain("계약 시작 시점이 2026년이면");
    expect(a).toContain("2027년 1월 1일 이후 일한 기간은 10,700원");
    expect(a).toContain("2026년에 일한 기간은 10,320원");
    // 최저임금위원회 결정현황(2026-11-15 확인): 2027년 시급 10,700원·월 2,236,300원(209시간)·결정 고시 2026-08-05
    expect(a).toContain("시급 10,700원, 월 환산액 2,236,300원(209시간 기준)으로 2026년 8월 5일 고시");
    expect(10_700 * 209).toBe(2_236_300);
  });
});

// 감사 아이디어 ideas[0] (시즌: 2027 주휴수당·최저 주급 검색 12~1월) — 기존 닫힌 FAQ 답 끝에만 덧붙인다(닫힌 높이 불변).
describe("2027 최저임금 숫자 — 주휴수당·주급 접힌 FAQ (최저임금위원회 결정현황 2027: 시급 10,700원·월 2,236,300원, 고시 2026-08-05)", () => {
  it("주휴수당 FAQ: 85,600원·372,717원은 이 계산기 compute 값", () => {
    const c = getCalculatorBySlug("holiday-allowance-quick");
    const a = (c?.faqs ?? []).find((f) => f.q === "주휴수당을 포함한 2026년 최저 월급은 얼마인가요?")?.a ?? "";
    expect(a).toContain("2027년 1월 1일부터는 2026년 8월 5일 고시된 시급 10,700원이 적용되어");
    expect(a).toContain("주 1회 주휴수당은 85,600원, 월 환산분은 372,717원");
    const r = c!.compute({ hourly: 10_700 });
    expect(r.primary.value).toBe(85_600);
    expect(r.secondary?.[0]?.value).toBe(372_717);
  });
  it("주급 FAQ: 2,236,300원 → 주급 513,600원·일급 102,720원은 이 계산기 compute 값", () => {
    const c = getCalculatorBySlug("weekly-pay");
    const a = (c?.faqs ?? []).find((f) => f.q === "2026년 최저임금 월급을 넣으면 주급은 얼마인가요?")?.a ?? "";
    expect(a).toContain("주급 513,600원, 주 5일 기준 일급 102,720원");
    const r = c!.compute({ monthly: 2_236_300 });
    expect(r.primary.value).toBe(513_600);
    expect(r.secondary?.[0]?.value).toBe(102_720);
  });
});
