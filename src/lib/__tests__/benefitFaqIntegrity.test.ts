// 근로장려금·육아휴직·실업급여 3쪽 FAQPage JSON-LD = 화면 FAQ 회귀 가드 (2026-09-25 B15 META-02)
//
// 종전에는 page.tsx 의 FAQ_ITEMS(JSON-LD)와 *Content.tsx 의 화면 FAQ 가 서로 다른 배열이었고,
// 화면 답변은 클릭 전에는 DOM 에 없었다(`open === i && (...)`) — 마크업 15문항이 본문 어디에도
// 없던 상태. 이제 각 페이지의 faq.ts 한 배열이 둘 다를 만든다.
//   1) SSR 결과의 FAQPage 모든 질문·답변 문자열이 스크립트 밖 본문에 있다.
//   2) 접힌 답변도 DOM 에 있되 hidden 이다 (접힌 높이 불변 — 육아휴직·실업급여는 FAQ 가
//      GuideMidAd 위라 높이가 바뀌면 광고가 밀린다).
//   3) 문항 수 5개 유지 (문항 추가 = 광고 위 높이 증가).
//   4) faq.ts 는 'use client' 가 아니다 (클라이언트 모듈 const 는 서버 page 에서 client reference 가 된다).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement, type AnchorHTMLAttributes, type FunctionComponent, type InputHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/AppLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement("a", props),
}));
vi.mock("@/components/NumberInput", () => ({
  default: (props: InputHTMLAttributes<HTMLInputElement>) => createElement("input", props),
}));
vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: () => createElement("div", { "data-test-ad": "home-top" }),
  InArticleAd: () => createElement("div", { "data-test-ad": "in-article" }),
  CalcResultAd: () => createElement("div", { "data-test-ad": "result" }),
  GuideMidAd: () => createElement("div", { "data-test-ad": "guide" }),
}));
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/ShareSection", () => ({ default: () => null }));

import EarnedIncomeCreditPage from "@/app/earned-income-credit/page";
import ParentalLeavePage from "@/app/parental-leave/page";
import UnemploymentBenefitPage from "@/app/unemployment-benefit/page";
import { EARNED_INCOME_CREDIT_FAQ } from "@/app/earned-income-credit/faq";
import { PARENTAL_LEAVE_FAQ } from "@/app/parental-leave/faq";
import { UNEMPLOYMENT_BENEFIT_FAQ } from "@/app/unemployment-benefit/faq";
import type { FaqItem } from "@/lib/structuredData";

const readSrc = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");

function visibleContent(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
}

/** React SSR 텍스트 이스케이프 복원 — JSON-LD 원문과 같은 문자열로 비교하기 위함 */
function decodeEntities(s: string) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function structuredItems(html: string): Record<string, unknown>[] {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(match => JSON.parse(match[1]) as Record<string, unknown>);
}

const PAGES: {
  route: string;
  page: FunctionComponent;
  faq: FaqItem[];
  dir: string;
  content: string;
  faqAboveGuideMidAd: boolean;
}[] = [
  {
    route: "/earned-income-credit",
    page: EarnedIncomeCreditPage,
    faq: EARNED_INCOME_CREDIT_FAQ,
    dir: "src/app/earned-income-credit",
    content: "EarnedIncomeCreditContent.tsx",
    faqAboveGuideMidAd: false,
  },
  {
    route: "/parental-leave",
    page: ParentalLeavePage,
    faq: PARENTAL_LEAVE_FAQ,
    dir: "src/app/parental-leave",
    content: "ParentalLeaveContent.tsx",
    faqAboveGuideMidAd: true,
  },
  {
    route: "/unemployment-benefit",
    page: UnemploymentBenefitPage,
    faq: UNEMPLOYMENT_BENEFIT_FAQ,
    dir: "src/app/unemployment-benefit",
    content: "UnemploymentBenefitContent.tsx",
    faqAboveGuideMidAd: true,
  },
];

describe("benefit calculator FAQPage markup matches the visible FAQ (B15 META-02)", () => {
  for (const p of PAGES) {
    describe(p.route, () => {
      const html = renderToStaticMarkup(createElement(p.page));
      const content = visibleContent(html);
      const decoded = decodeEntities(content);

      it("emits exactly one FAQPage built from faq.ts, with the same 5 items", () => {
        const faqs = structuredItems(html).filter(item => item["@type"] === "FAQPage");
        expect(faqs).toHaveLength(1);
        const entities = faqs[0].mainEntity as { name: string; acceptedAnswer: { text: string } }[];
        expect(p.faq).toHaveLength(5);
        expect(entities.map(e => ({ question: e.name, answer: e.acceptedAnswer.text }))).toEqual(p.faq);
      });

      it("renders every FAQPage question and answer string in the non-script body", () => {
        const entities = structuredItems(html)
          .find(item => item["@type"] === "FAQPage")!
          .mainEntity as { name: string; acceptedAnswer: { text: string } }[];
        for (const e of entities) {
          expect(decoded, e.name).toContain(e.name);
          expect(decoded, e.name).toContain(e.acceptedAnswer.text);
        }
      });

      it("keeps collapsed answers in the DOM with the hidden attribute (collapsed height unchanged)", () => {
        for (const item of p.faq) {
          const at = decoded.indexOf(item.answer);
          expect(at, item.question).toBeGreaterThan(-1);
          const openTag = decoded.slice(decoded.lastIndexOf("<div", at), at);
          expect(openTag, item.question).toMatch(/^<div\b[^>]*\bhidden=""[^>]*>\s*$/);
        }
        // 초기 상태에서 펼쳐진 답변은 없다
        expect(content.match(/aria-expanded="true"/g) ?? []).toHaveLength(0);
        expect(content.match(/aria-expanded="false"/g) ?? []).toHaveLength(5);
      });

      it("keeps the FAQ block in its current position relative to GuideMidAd", () => {
        const firstQuestion = decoded.indexOf(p.faq[0].question);
        const guideAd = decoded.indexOf('data-test-ad="guide"');
        expect(guideAd).toBeGreaterThan(-1);
        if (p.faqAboveGuideMidAd) expect(firstQuestion).toBeLessThan(guideAd);
        else expect(firstQuestion).toBeGreaterThan(guideAd);
      });

      it("uses a non-client faq.ts module as the single source for both page.tsx and the Content file", () => {
        const faqSrc = readSrc(`${p.dir}/faq.ts`);
        expect(faqSrc).not.toMatch(/^\s*["']use client["']/m);
        const pageSrc = readSrc(`${p.dir}/page.tsx`);
        expect(pageSrc).toMatch(/from "\.\/faq"/);
        expect(pageSrc).not.toMatch(/\bFAQ_ITEMS\b/);
        const contentSrc = readSrc(`${p.dir}/${p.content}`);
        expect(contentSrc).toMatch(/from "\.\/faq"/);
        // 조건부 렌더(`open === i && (`)로 답변을 DOM 에서 빼는 회귀 금지
        expect(contentSrc).not.toMatch(/(?:openFaq|expandedFaq) === i && \(/);
      });
    });
  }
});

// FAQ 사실 확인 중 같은 페이지 본문에서 발견한 같은 사실의 오기 — 글자 폭이 같은(또는 한 자 짧은)
// 범위에서만 정정했다 (2026-09-25 B15). 출처: call.nts.go.kr·korea.kr(기한 후 95% 지급),
// easylaw.go.kr(육아기 근로시간 단축 최대 3년 · 구직급여 1년 미만 120일),
// korea.kr(출산전후휴가 상한 220만원 · 배우자 출산휴가 9/18 개정).
describe("benefit pages keep the verified facts that the FAQ now states", () => {
  const render = (page: FunctionComponent) =>
    decodeEntities(visibleContent(renderToStaticMarkup(createElement(page))));

  it("근로장려금 기한 후 신청 감액은 5% (10% 아님)", () => {
    const body = render(EarnedIncomeCreditPage);
    expect(body).toContain("지급액의 5% 감액 적용");
    expect(body).not.toMatch(/10%\s*(?:가\s*)?감액/);
  });

  it("육아기 근로시간 단축 기간은 최대 3년", () => {
    const body = render(ParentalLeavePage);
    expect(body).toContain("최대 3년");
    expect(body).not.toContain("최대 2년");
  });

  // 2026-09-18 시행 남녀고용평등법 개정 — 출산예정일 50일 전부터 사용 가능
  // (korea.kr 148970585, moel.go.kr 보도자료 news_seq=19964). 종전 출산일로부터 120일 이내만은 틀린 안내.
  it("배우자 출산휴가 FAQ 는 2026-09-18 개정(출산예정일 50일 전부터) 기준", () => {
    const item = PARENTAL_LEAVE_FAQ.find(f => f.question === "배우자 출산휴가는 얼마나 되나요?");
    expect(item).toBeDefined();
    expect(item!.answer).toContain("출산예정일 50일 전부터 출산 후 120일 이내");
    expect(item!.answer).toContain("20일");
    expect(item!.answer).not.toContain("출산일로부터 120일 이내");
  });

  // 2026년 출산전후휴가 급여 상한 월 220만원 (korea.kr 148957375, 고용노동부 고시)
  it("출산전후휴가 급여 상한은 2026년 월 220만원", () => {
    const body = render(ParentalLeavePage);
    expect(body).toContain("상한 월 220만원");
    expect(body).not.toContain("210만원");
  });

  // 육아기 근로시간 단축 급여: 매주 최초 10시간 단축분 통상임금 100%(상한 250만원)
  // (korea.kr 148957375, easylaw csmSeq=1380). 종전 비교표의 단축 5시간 100%는 옛 기준.
  it("육아기 근로시간 단축 비교표는 최초 주 10시간 100% 기준", () => {
    const body = render(ParentalLeavePage);
    expect(body).toContain("주 10시간 100%");
    expect(body).not.toContain("5시간 100%");
  });

  it("구직급여 소정급여일수: 피보험기간 1년 미만은 연령 무관 120일", () => {
    const src = readSrc("src/app/unemployment-benefit/UnemploymentBenefitContent.tsx");
    expect(src).toMatch(/label: "1년 미만 \(12개월 미만\)", days: \{ under50: 120, over50: 120 \}/);
    expect(src).toMatch(/days: \{ under50: 240, over50: 270 \}/);
  });
});
