// SE-04 (2026-10-22 작성, 2026-11-01 B30 이식) — 연말정산 허브의 광고 위 목록은 행 수 고정 + 허브 맨 끝 질문형 FAQ 배치 회귀.
// 광고 위 목록(연말정산 허브 뉴스·캘린더·단계)에 행을 덧붙이면 아래 광고가 밀린다(2026-08-16 규칙).
// 새 소식은 가장 오래된 행과 폭을 맞춰 교체하고, 행 수를 바꿔야 하면 실측 스윕으로 광고 위 높이 불변을 먼저 증명한다.
// (원본 커밋 28f2c0ac2 의 성과급 허브 행 수 단언은 이 패키지 범위 밖이라 옮기지 않았다 — 성과급 허브는 B27 이 고친다.)
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import YearEndDatedFaq from "@/components/YearEndDatedFaq";
import { YEAR_END_CALENDAR, YEAR_END_NEWS, YEAR_END_STEPS } from "@/data/yearEndTaxHub";
import {
  YEAR_END_HUB_DATED_FAQS,
  YEAR_END_HUB_DATED_FAQ_BASIS,
  YEAR_END_HUB_DATED_FAQ_CHECKED_LABEL,
  YEAR_END_HUB_DATED_FAQ_CHECKED_ON,
} from "@/lib/yearEndDatedFaqs";

describe("광고 위 시즌 목록 행 수 고정", () => {
  it("연말정산 허브 — 뉴스 3행·캘린더 7행·단계 5개(단계별 항목 수 고정)", () => {
    expect(YEAR_END_NEWS.length).toBe(3);
    expect(YEAR_END_CALENDAR.length).toBe(7);
    expect(YEAR_END_STEPS.length).toBe(5);
    expect(YEAR_END_STEPS.map((s) => s.entries.length)).toEqual([3, 4, 3, 3, 3]);
  });
});

describe("연말정산 허브 맨 끝 질문형 FAQ (SE-04)", () => {
  const src = readFileSync(resolve(process.cwd(), "src/app/year-end-tax-2027/page.tsx"), "utf8");
  const AD_TAG = /<(HomeTopAd|InArticleAd|CalcResultAd|GuideMidAd|MultiplexAd|Display2Ad|CoupangBanner|OfferSlot)\b/g;

  it("3문항(빈 배열 금지)이고 모든 광고 태그·시즌 도구 더 보기보다 아래다", () => {
    expect(YEAR_END_HUB_DATED_FAQS.length).toBe(3);
    const at = src.indexOf("<YearEndDatedFaq");
    expect(at).toBeGreaterThan(-1);
    const ads = [...src.matchAll(AD_TAG)].map((m) => m.index ?? Infinity);
    expect(ads.length).toBeGreaterThanOrEqual(4);
    for (const a of ads) expect(a).toBeLessThan(at);
    expect(src.indexOf("YEAR_END_MORE_TOOLS.map")).toBeLessThan(at);
  });

  it("FAQPage 는 하나 — 기존 FAQS 와 합치고, 광고 위 FAQS 와 질문이 겹치지 않는다", () => {
    expect(src.match(/faqLd\(/g)).toHaveLength(1);
    expect(src).toContain("faqLd([...FAQS, ...YEAR_END_HUB_DATED_FAQS])");
    const faqsBlock = src.slice(src.indexOf("const FAQS = ["), src.indexOf("];", src.indexOf("const FAQS = [")));
    for (const f of YEAR_END_HUB_DATED_FAQS) expect(faqsBlock).not.toContain(f.question);
  });

  it("보이는 내용 = JSON-LD 문항(같은 배열), 확인일·근거 표기", () => {
    const html = renderToStaticMarkup(
      createElement(YearEndDatedFaq, {
        items: YEAR_END_HUB_DATED_FAQS,
        headingId: "hub-dated-faq",
        checkedOn: YEAR_END_HUB_DATED_FAQ_CHECKED_ON,
        checkedLabel: YEAR_END_HUB_DATED_FAQ_CHECKED_LABEL,
        basis: YEAR_END_HUB_DATED_FAQ_BASIS,
      }),
    );
    expect(html).toContain('dateTime="2026-11-01"');
    expect(html).toContain("2026년 11월 1일</time> 국가법령정보센터 현행 조문과 국세청 발표로 확인한 내용입니다.");
    for (const f of YEAR_END_HUB_DATED_FAQS) {
      expect(html).toContain(f.question);
      expect(html).toContain(f.answer);
    }
  });

  it("사실 — 제137조 제1항(2월분 급여)·제4항(10만원 초과, 2~4월분 분납)·최근 3년 간소화 개통일, 2027년 날짜 추정 없음", () => {
    const [when, split, open] = YEAR_END_HUB_DATED_FAQS.map((f) => f.answer);
    expect(when).toContain("2027년 2월분 급여를 지급할 때");
    expect(when).toContain("소득세법 제137조 제1항");
    expect(when).toContain("회사마다 다르니");
    expect(split).toContain("10만원을 넘으면");
    expect(split).toContain("2월분부터 4월분 급여를 지급할 때까지 나누어 원천징수할 수 있습니다(소득세법 제137조 제4항)");
    expect(open).toContain("2024년 1월 15일, 2025년 1월 15일, 2026년 1월 15일");
    expect(open).not.toMatch(/2027년 1월 \d+일/);
  });
});
