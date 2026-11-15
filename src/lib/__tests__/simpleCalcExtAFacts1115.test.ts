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
