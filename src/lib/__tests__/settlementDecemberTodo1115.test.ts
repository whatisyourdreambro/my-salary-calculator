// /year-end-tax-settlement-2026 — '12월에 할 일 — 날짜순' 표 (2026-11-15 SEASONB, app-pages ideas[4]).
// 운영자 결정 2번(2026-11-13): 마지막 광고 아래 새 표·링크 줄 허용. 이 페이지의 마지막 광고는 MultiplexAd 이고
// 그 뒤에는 TopicNextSteps 뿐이다 — 표는 MultiplexAd 와 TopicNextSteps 사이에만 둔다.
// 날짜는 발표·조문으로 확인한 것만(2026-11-15): 미리보기 10/28~12/18(국세청 2026-10-23 안내), 간소화 '2027년 1월 개통 예정'
// (같은 안내, 개통일 미발표 — 날짜를 추정하지 않는다), 연금계좌 600·900만원(소득세법 제59조의3 제1항),
// 회사 제출·정산(소득세법 제140조 제1항·제137조 제1항). 쪽 날짜 필드(PublishedMeta 2026-10-19, 광고 위)는 건드리지 않는다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/ShareSection", () => ({ default: () => null }));
vi.mock("@/components/YearEndTaxCluster", () => ({ default: () => null }));
vi.mock("@/components/PublishedMeta", () => ({ default: () => null }));
vi.mock("@/components/TopicNextSteps", () => ({ default: () => createElement("div", { "data-test": "topic-next-steps" }) }));

import YearEndTaxSettlement2026Page from "@/app/year-end-tax-settlement-2026/page";

const FILE = "src/app/year-end-tax-settlement-2026/page.tsx";
const AD_TAG = /<(HomeTopAd|InArticleAd|CalcResultAd|GuideMidAd|MultiplexAd|Display2Ad|CoupangBanner|OfferSlot)\b/g;

describe("/year-end-tax-settlement-2026 — 12월 할 일 날짜표 (SEASONB ideas[4])", () => {
  const src = readFileSync(resolve(process.cwd(), FILE), "utf8");
  const html = renderToStaticMarkup(createElement(YearEndTaxSettlement2026Page));
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

  it("소스에서 모든 광고 태그보다 아래, TopicNextSteps 보다 위", () => {
    const at = src.indexOf('aria-labelledby="december-todo"');
    expect(at).toBeGreaterThan(-1);
    const ads = [...src.matchAll(AD_TAG)].map((m) => m.index ?? Infinity);
    expect(ads.length).toBeGreaterThanOrEqual(6);
    for (const a of ads) expect(a).toBeLessThan(at);
    expect(at).toBeLessThan(src.indexOf("<TopicNextSteps"));
  });

  it("SSR DOM 에서 마지막 광고(멀티플렉스) 뒤, TopicNextSteps 앞", () => {
    const block = html.indexOf('id="december-todo"');
    const lastAd = html.lastIndexOf("data-test-ad=");
    expect(html.slice(lastAd, lastAd + 30)).toContain("multiplex");
    expect(lastAd).toBeLessThan(block);
    expect(block).toBeLessThan(html.indexOf('data-test="topic-next-steps"'));
  });

  it("다섯 줄 — 발표·조문으로 확인한 날짜만, 기준일 표기", () => {
    expect(html).toContain('<time dateTime="2026-11-15">2026년 11월 15일</time>');
    for (const t of [
      "12월 18일(금)까지",
      "운영 기간 10월 28일~12월 18일(국세청 2026년 10월 23일 안내)",
      "12월 31일(목)까지",
      "연금저축 600만원, IRP 합산 900만원 한도(소득세법 제59조의3)",
      // 리뷰 2026-11-15: 법정 기준은 12월 31일 납입분이지만 금융회사 입금 마감 시각은 회사마다 다르다
      "금융회사마다 연말 입금 마감 시각이 다르니 미리 확인",
      "신용카드 사용액·의료비·기부금도 이날까지 쓰고 낸 금액이 2026년 귀속분",
      "연말정산 간소화 서비스 개통 예정(국세청 2026년 10월 23일 안내) — 개통일은 국세청 공지로 확인",
      "2월분 급여에서 정산(소득세법 제137조·제140조)",
    ]) {
      expect(text).toContain(t);
    }
    const block = src.slice(src.indexOf("const DECEMBER_TODO"), src.indexOf("const FAQ_ITEMS"));
    // 간소화 개통일을 추정하지 않는다
    expect(block).not.toMatch(/2027년 1월 \d+일/);
  });

  it("링크는 있는 페이지 4곳", () => {
    const block = src.slice(src.indexOf("const DECEMBER_TODO"), src.indexOf("const FAQ_ITEMS"));
    const hrefs = [...block.matchAll(/href: "([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(["/year-end-tax-preview", "/tools/finance/irp", "/year-end-tax-checklist", "/year-end-tax"]);
  });

  it("날짜와 요일이 맞는다 (2026-12-18 금, 2026-12-31 목)", () => {
    expect(new Date(Date.UTC(2026, 11, 18)).getUTCDay()).toBe(5);
    expect(new Date(Date.UTC(2026, 11, 31)).getUTCDay()).toBe(4);
  });

  it("광고 위 쪽 날짜 필드(2026-10-19)는 그대로", () => {
    expect(src).toContain('modifiedTime: "2026-10-19T00:00:00+09:00"');
    expect(src).toContain('updatedDate="2026-10-19"');
  });
});
