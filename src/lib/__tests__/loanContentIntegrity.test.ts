import { createElement, type AnchorHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/AppLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement("a", props),
}));
vi.mock("@/components/calculators/LoanCalculator", () => ({
  default: () => createElement("div", { "data-calculator": "loan" }),
}));
vi.mock("@/components/calculators/real-estate/DsrCalculator", () => ({
  default: () => createElement("div", { "data-calculator": "dsr" }),
}));
vi.mock("@/components/HomeLoanSimulator", () => ({
  default: () => createElement("div", { "data-calculator": "home-loan" }),
}));
vi.mock("@/components/AdPlacement", () => ({
  CalcResultAd: () => createElement("div", { "data-test-ad": "result" }),
  GuideMidAd: () => createElement("div", { "data-test-ad": "guide" }),
  MultiplexAd: () => createElement("div", { "data-test-ad": "multiplex" }),
}));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/PageFooterAds", () => ({ default: () => null }));
vi.mock("@/components/ShareSection", () => ({ default: () => null }));

import LoanPage, { metadata as loanMetadata } from "@/app/tools/loan/page";
import DsrPage, { metadata as dsrMetadata } from "@/app/tools/real-estate/dsr/page";
import HomeLoanPage from "@/app/home-loan/page";

function visibleContent(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
}

function structuredItems(html: string): Record<string, unknown>[] {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(match => JSON.parse(match[1]) as Record<string, unknown>);
}

describe("loan copy matches the implemented calculators", () => {
  it("explains the fixed input-rate model and verifies the hypothetical payment example", () => {
    const html = renderToStaticMarkup(createElement(LoanPage));
    const content = visibleContent(html);
    expect(loanMetadata.alternates?.canonical).toBe("https://www.moneysalary.com/tools/loan");
    expect(loanMetadata.description).toContain("입력한 금리가 만기까지 유지");
    expect(JSON.stringify(loanMetadata) + html).not.toMatch(/기준금리 2\.75%|7월 16일|인상 반영/);
    expect(content).toContain("첫 달 납입금");
    expect(content).toContain("마지막 달에는 이자와 대출 원금 전액");
    expect(content).toContain("수수료·거치기간·중도상환·기간 중 금리 변경은 포함하지 않습니다");

    const payment = (annualRate: number) => {
      const r = annualRate / 100 / 12;
      return 300_000_000 * r / (1 - (1 + r) ** -360);
    };
    const before = payment(4);
    const after = payment(4.25);
    for (const value of [before, after, after - before]) {
      expect(content).toContain(`${Math.round(value).toLocaleString("ko-KR")}원`);
    }
    expect(content).toContain(`약 ${Math.round((after - before) * 360 / 10_000).toLocaleString("ko-KR")}만원`);
    expect(content).toContain("금리 전망이 아닙니다");
    expect(content.match(/data-test-ad="result"/g)).toHaveLength(1);
    expect(content.indexOf('data-test-ad="result"')).toBeGreaterThan(content.indexOf('data-calculator="loan"'));
  });

  it("keeps DSR metadata, visible FAQ and structured FAQ on the same annual-input contract", () => {
    const html = renderToStaticMarkup(createElement(DsrPage));
    const content = visibleContent(html);
    expect(dsrMetadata.alternates?.canonical).toBe("https://www.moneysalary.com/tools/real-estate/dsr");
    expect(dsrMetadata.description).toContain("연간 원금·이자 상환액");
    expect(JSON.stringify(dsrMetadata) + html).not.toMatch(/한도 자동 산정|추가 대출 가능 영역|3~6개월|5~15%|40% 규제/);
    const faq = structuredItems(html).find(item => item["@type"] === "FAQPage");
    const questions = faq?.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
    expect(questions).toHaveLength(8);
    for (const question of questions) {
      expect(content).toContain(question.name);
      expect(content).toContain(question.acceptedAnswer.text);
    }
    expect(content).toContain("1,000만원, 연간 이자 200만원이면 24%");
    expect(content).toContain("대출 잔액과 1년 동안 상환하는 원금은 서로 다릅니다");
    expect(content).toContain("지역·금리·상환 기간을 입력하는 항목이 없으며");
    expect(content.match(/data-test-ad="result"/g)).toHaveLength(1);
    expect(content.match(/data-test-ad="guide"/g)).toHaveLength(1);
  });

  it("describes the same DSR destination accurately from both loan pages", () => {
    for (const page of [LoanPage, HomeLoanPage]) {
      const html = renderToStaticMarkup(createElement(page));
      const dsrLinks = [...visibleContent(html).matchAll(/<a\b[^>]*href="\/tools\/real-estate\/dsr"[^>]*>([\s\S]*?)<\/a>/g)];
      expect(dsrLinks.length).toBeGreaterThan(0);
      for (const link of dsrLinks) {
        expect(link[1]).toContain("DSR 비율 계산기");
        expect(link[1]).not.toMatch(/한도 예시|심사용 금리로|한도 계산기/);
      }
      expect(html).not.toContain("한도 예시를 별도로");
    }
    const homeHtml = renderToStaticMarkup(createElement(HomeLoanPage));
    expect(homeHtml).toContain('href="https://www.fsc.go.kr/po020201/85518"');
    expect(homeHtml).toContain("954,831원");
    expect(homeHtml).toContain("2,459,699원");
  });
});
