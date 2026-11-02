// src/lib/__tests__/chuseokKef2026Faq.test.ts
//
// RL-05 (2026-11-02, 10월 4f253e73 TS-19 의 FAQ 부분만 재반영) — /chuseok-bonus-2026 접힌 FAQ[0] 에 2026 경총 추석 조사.
// 근거: 한국경영자총협회 2026년 추석 휴무·상여금 조사(전국 5인 이상 601개사, 2026-09-17 발표) — 한국경제 2026-09-17 보도
//   (지급 계획 61.0%, 300인 이상 66.7%, 300인 미만 60.3%, 전년 대비 2.0%p 감소). 사업주단체 조사의 언론 보도라 허용 출처.
// 광고 아래 경총 목록·다음 시즌 링크 섹션(10월 커밋의 나머지)은 운영자 질문 2(동결 기간 새 구역) 몫이라 이 페이지에 없다.
import { createElement, type AnchorHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/AppLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement("a", props),
}));
vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: () => createElement("div", { "data-test-ad": "home-top" }),
  InArticleAd: () => createElement("div", { "data-test-ad": "in-article" }),
  CalcResultAd: () => createElement("div", { "data-test-ad": "result" }),
  GuideMidAd: () => createElement("div", { "data-test-ad": "guide" }),
  MultiplexAd: () => createElement("div", { "data-test-ad": "multiplex" }),
}));
vi.mock("@/components/CoupangBanner", () => ({ default: () => createElement("div", { "data-test-ad": "coupang" }) }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => createElement("div", { "data-test": "related" }) }));
vi.mock("@/components/ShareButtons", () => ({ default: () => null }));
vi.mock("@/components/TopicNextSteps", () => ({ default: () => null }));
vi.mock("@/app/chuseok-bonus-2026/Client", () => ({ default: () => createElement("div", { "data-test": "calc" }) }));

import ChuseokBonusPage from "@/app/chuseok-bonus-2026/page";

const QUESTION = "2026년 추석 상여금 평균은 얼마인가요?";
const html = renderToStaticMarkup(createElement(ChuseokBonusPage));
const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
const faqAnswers = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .flatMap((m) => {
    const parsed = JSON.parse(m[1]) as unknown;
    return (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[];
  })
  .filter((d) => d["@type"] === "FAQPage")
  .flatMap((d) => d.mainEntity as { name: string; acceptedAnswer: { text: string } }[]);

describe("/chuseok-bonus-2026 FAQ[0] — 2026 경총 추석 조사 (RL-05, TS-19 FAQ 부분)", () => {
  const first = faqAnswers.find((q) => q.name === QUESTION);

  it("FAQPage 의 첫 질문 답에 경총 수치와 발표일·표본이 있다", () => {
    expect(first, "FAQPage 에 질문이 없다").toBeDefined();
    for (const part of [
      "한국경영자총협회 조사(5인 이상 601개사, 2026년 9월 17일 발표)",
      "추석 상여금 지급 계획 기업이 61.0%(300인 이상 66.7%, 300인 미만 60.3%)",
      "전년보다 2.0%p 줄었습니다",
      "이 페이지의 규모별 평균 금액은 사람인 2025년 조사 기준입니다",
    ]) {
      expect(first!.acceptedAnswer.text, part).toContain(part);
    }
  });

  it("발표 뒤 갱신 약속과 '가장 최근 조사' 단정이 FAQ 에서 빠졌다", () => {
    expect(first!.acceptedAnswer.text).not.toContain("발표되면 이 페이지를 갱신합니다");
    expect(first!.acceptedAnswer.text).not.toContain("가장 최근 조사");
  });

  it("화면 FAQ 는 질문 문구 그대로, 기본 닫힌 details 안이고 GuideMidAd 아래다", () => {
    const summaryAt = visible.indexOf(QUESTION);
    expect(summaryAt).toBeGreaterThan(visible.indexOf('data-test-ad="guide"'));
    const detailsOpen = visible.lastIndexOf("<details", summaryAt);
    expect(detailsOpen).toBeGreaterThan(-1);
    expect(visible.slice(detailsOpen, visible.indexOf(">", detailsOpen))).not.toMatch(/\bopen\b/);
    expect(visible).toContain("61.0%(300인 이상 66.7%, 300인 미만 60.3%)");
  });

  it("광고 아래 새 구역(경총 목록·다음 시즌 링크)은 이 묶음에 없다", () => {
    expect(visible).not.toContain("2026년 추석 상여금 지급 계획 — 경총 조사");
    expect(visible).not.toContain("추석 다음 시즌 준비");
  });
});
