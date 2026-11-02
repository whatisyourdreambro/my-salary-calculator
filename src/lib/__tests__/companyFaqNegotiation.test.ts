// 회사 FAQ '연봉 협상' 답변 문구·가이드 링크 고정 (2026-09-29 CM-19)
// - '동종사 {회사} 시니어 평균' 비문 → '본 페이지의 {회사} 시니어 평균(…)과 동종사 연봉 자료'
// - 답변 속 '연봉 협상의 비밀' 은 화면에서만 가이드 정본 경로로 링크, FAQPage JSON-LD 는 평문 그대로
// 답변은 기본으로 닫힌 <details> 안이라 닫힌 상태 높이·광고 위치는 바뀌지 않는다.
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/AppLink", () => ({
  default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children),
}));

import CompanyFaq from "@/components/CompanyFaq";
import { buildCompanyFaq } from "@/lib/companyFaqItems";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { faqLd } from "@/lib/structuredData";

function negotiationItem(id: string) {
  const company = companyRepository.getById(id)!;
  const items = buildCompanyFaq(company);
  const item = items.find((i) => i.question.includes("연봉 협상"));
  if (!item) throw new Error("missing negotiation FAQ");
  return { company, items, item };
}

describe("CM-19 회사 FAQ 연봉 협상 답변", () => {
  it("비문 '동종사 {회사} 시니어 평균' 이 없고 본 페이지 시니어 평균과 동종사 자료를 나눠 말한다", () => {
    for (const company of companyRepository.getAll()) {
      const item = buildCompanyFaq(company).find((i) => i.question.includes("연봉 협상"));
      if (!item) continue;
      expect(item.answer).not.toContain(`동종사 ${company.name.ko} 시니어`);
      expect(item.answer).toContain(`1) 본 페이지의 ${company.name.ko} 시니어 평균(`);
      expect(item.answer).toContain(")과 동종사 연봉 자료, 2) 본인 직무의 시장 평균");
    }
  });

  it("화면 답변에서만 '연봉 협상의 비밀' 이 가이드 정본 경로로 링크되고, 답변은 닫힌 details 안", () => {
    const { company, items } = negotiationItem("samsung-electronics");
    const html = renderToStaticMarkup(createElement(CompanyFaq, { companyName: company.name.ko, items }));
    expect(html).toContain('href="/guides/salary-negotiation-secret"');
    expect(html).toMatch(/<a[^>]*href="\/guides\/salary-negotiation-secret"[^>]*>연봉 협상의 비밀<\/a>/);
    expect(html).not.toMatch(/<details[^>]*\sopen/);
  });

  it("FAQPage JSON-LD 답변은 평문(링크 없음)이고 화면 답변과 같은 문장", () => {
    const { items, item } = negotiationItem("samsung-electronics");
    const json = JSON.stringify(faqLd(items));
    expect(json).toContain(item.answer.replace(/"/g, '\\"'));
    expect(json).not.toContain("salary-negotiation-secret");
  });
});
