// R4 CONTENT2 (2026-11-18) N2-lib-13 1단계 (= N2-lib-07 5단계, lib-b10-F03) — /tools/deposit 접힌 FAQ.
// 조세특례제한법 제89조의3 (법률 제21223호, 2026-01-01 시행): 2026년 이후 가입한 조합등예탁금 이자는
// 제1항에 따라 2026년 가입분 5%, 2027년 이후 가입분 9%로 분리과세하고, 제2항에 따라 제88조의5 제2항 제1호의
// 거주자(대통령령으로 정하는 조합의 조합원 또는 직전 과세기간 총급여 7천만원 / 종합소득금액 6천만원 이하)가
// 2028년까지 가입한 예탁금 이자만 계속 비과세(농어촌특별세 1.4%)다. 자세한 설명은 광고 위치에 영향이 없는
// 닫힌 <details> 답변에 둔다(운영자 승인 2026-11-17, 질문 원문 owner-questions-raw.md N2-lib-13).
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getToolContent } from "@/lib/toolContent";
import ToolFaqSection from "@/components/tool/ToolFaqSection";

describe("N2-lib-13 /tools/deposit FAQ — 조합예탁금 2026 과세 규칙", () => {
  const content = getToolContent("/tools/deposit");

  it("the 이자소득세 FAQ answer explains who keeps the exemption and the 5%/9% rates", () => {
    const faq = content!.faqs.find((f) => f.question === "이자소득세는 언제 떼나요?");
    expect(faq).toBeDefined();
    expect(faq!.answer).toContain("농·어·임업인 조합원이거나 직전 해 총급여 7,000만원(종합소득금액 6,000만원) 이하");
    expect(faq!.answer).toContain("2028년까지 가입하면 이자소득세가 면제되고 농어촌특별세 1.4%만");
    expect(faq!.answer).toContain("2026년 가입분 5%, 2027년 이후 가입분 9%로 분리과세");
    expect(faq!.answer).toContain("조세특례제한법 제89조의3");
    // 원래 답변은 앞부분에 그대로 남는다
    expect(faq!.answer.startsWith("만기 해지 시점에 금융기관이 15.4%를 원천징수한 뒤 나머지를 지급합니다.")).toBe(true);
  });

  it("FAQ answers render inside closed <details> (no open attribute), so the ads below do not move", () => {
    const html = renderToStaticMarkup(createElement(ToolFaqSection, { faqs: content!.faqs }));
    expect(html).toContain("조세특례제한법 제89조의3");
    expect(html).toMatch(/<details[^>]*>/);
    expect(html).not.toMatch(/<details[^>]*\sopen/);
  });
});
