// src/lib/__tests__/yearEndDatedFaqs.test.ts
//
// SEASON-15 (2026-09-26) — 정밀 계산기 4쪽의 날짜 박힌 FAQ: 마지막 광고보다 아래·FAQPage JSON-LD 합침·수치 정본 상수 파생.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import YearEndDatedFaq from "@/components/YearEndDatedFaq";
import {
  CARD_DATED_FAQS,
  DONATION_DATED_FAQS,
  MEDICAL_DATED_FAQS,
  RENT_DATED_FAQS,
  YEAR_END_DATED_FAQ_CHECKED_ON,
  YEAR_END_DATED_FAQ_HEADING,
} from "@/lib/yearEndDatedFaqs";

const PAGES: Array<[string, string, readonly { question: string; answer: string }[]]> = [
  ["src/app/credit-card-deduction-2026/page.tsx", "CARD_DATED_FAQS", CARD_DATED_FAQS],
  ["src/app/medical-tax-credit-2026/page.tsx", "MEDICAL_DATED_FAQS", MEDICAL_DATED_FAQS],
  ["src/app/rent-tax-credit-2026/page.tsx", "RENT_DATED_FAQS", RENT_DATED_FAQS],
  ["src/app/donation-tax-credit-2026/page.tsx", "DONATION_DATED_FAQS", DONATION_DATED_FAQS],
];
const AD_TAG = /<(HomeTopAd|InArticleAd|CalcResultAd|GuideMidAd|MultiplexAd|Display2Ad|CoupangBanner|OfferSlot)\b/g;

describe("날짜 박힌 FAQ 배치 (SEASON-15)", () => {
  for (const [file, name, items] of PAGES) {
    it(`${file}: 모든 광고 태그보다 아래이고 FAQPage 에 합쳐진다`, () => {
      const src = readFileSync(resolve(process.cwd(), file), "utf8");
      const at = src.indexOf(`<YearEndDatedFaq items={${name}}`);
      expect(at).toBeGreaterThan(-1);
      const ads = [...src.matchAll(AD_TAG)].map((m) => m.index ?? Infinity);
      expect(ads.length).toBeGreaterThanOrEqual(5);
      for (const a of ads) expect(a).toBeLessThan(at);
      expect(src).toContain(`faqLd([...FAQS.map((f) => ({ question: f.q, answer: f.a })), ...${name}])`);
      // 기존 FAQS 배열(광고 위)에는 덧붙이지 않았다
      const faqsBlock = src.slice(src.indexOf("const FAQS = ["), src.indexOf("];", src.indexOf("const FAQS = [")));
      for (const f of items) expect(faqsBlock).not.toContain(f.question);
      expect(items.length).toBeGreaterThanOrEqual(1);
      for (const f of items) expect(f.answer).not.toMatch(/NaN|undefined|\d\.\d{3,}/);
    });
  }

  it("블록은 날짜·제목을 보여 주고 문항을 전부 렌더한다", () => {
    const html = renderToStaticMarkup(createElement(YearEndDatedFaq, { items: RENT_DATED_FAQS, headingId: "x" }));
    expect(html).toContain(`dateTime="${YEAR_END_DATED_FAQ_CHECKED_ON}"`);
    expect(html).toContain(YEAR_END_DATED_FAQ_HEADING);
    for (const f of RENT_DATED_FAQS) expect(html).toContain(f.question);
  });
});

describe("날짜 박힌 FAQ 수치 (2026년 귀속 현행 vs 정부안)", () => {
  const all = [...CARD_DATED_FAQS, ...RENT_DATED_FAQS, ...DONATION_DATED_FAQS, ...MEDICAL_DATED_FAQS]
    .map((f) => f.answer)
    .join("\n");

  it("월세 — 2026년 귀속 1,000만원, 1,200만원·청년 17% 는 정부안(2027년 지급분)", () => {
    expect(all).toContain("2026년에 낸 월세는 연 1,000만원까지 인정됩니다");
    expect(all).toContain("1,200만원으로 늘리고 15~34세 청년에게 17%를 적용하는 내용은 2026년 8월 3일 발표된 세제개편안(정부안)");
    expect(all).toContain("기준시가 4억원 이하");
  });

  it("카드 — 2026년 사용분 대중교통 40%·25% 문턱·자녀 한도", () => {
    expect(all).toContain("40% 공제율이 적용됩니다");
    expect(all).toContain("총급여의 25%(최저사용금액)");
    expect(all).toContain("총급여 7,000만원 이하 300만원(자녀 1명 350만원·2명 이상 400만원), 초과 250만원(275만원·300만원)");
  });

  it("고향사랑 — 20만원 기부 시 소득세 약 130,909원·지방세 포함 약 144,000원, 체감 44%", () => {
    expect(all).toContain("약 130,909원");
    expect(all).toContain("약 144,000원");
    expect(all).toContain("그다음 20만원까지 44%");
    expect(all).toContain("그 초과분 16.5%");
  });

  it("의료비 — 안경 1명당 연 50만원·실손보험금 차감", () => {
    expect(all).toContain("1명당 연 50만원");
    expect(all).toContain("실손의료보험금만큼은 공제 대상 의료비에서 뺍니다");
  });
});
