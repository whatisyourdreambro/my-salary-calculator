// src/lib/__tests__/yearEndBelowLastAdBlocks.test.ts
//
// B30 (SEO-07-b, 운영자 승인 2026-11-01 8번) — 연말정산 시즌 블록은 모두 페이지의 마지막 광고보다 아래에만 붙는다.
//   1) /year-end-tax-preview: 최근 개통일 표·메뉴 경로·활용 가이드 링크(TS-06)가 모든 광고 표시보다 아래이고,
//      표의 날짜는 광고 위 FAQ 문장과 같다(국세청 발표, 대한민국 정책브리핑 기사로 2026-11-01 확인).
//   2) /year-end-tax-2027: 세제개편안 정부안 블록·시즌 도구 더 보기·질문형 FAQ 가 모든 광고 표시보다 아래이고,
//      광고 위 뉴스 목록(YEAR_END_NEWS)은 문구 그대로다. 정부안 블록은 '국회 의결 전' 확인일을 날짜로 보여 준다.
//   3) 정부안 행 문구는 재정경제부 「2026년 세제개편안」 상세본(2026-08-03)의 현행/개정안 표와 같다.
import { createElement, type AnchorHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/AppLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement("a", props),
}));
vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: () => createElement("div", { "data-test-ad": "home-top" }),
  GuideMidAd: () => createElement("div", { "data-test-ad": "guide" }),
  InArticleAd: () => createElement("div", { "data-test-ad": "in-article" }),
  CalcResultAd: () => createElement("div", { "data-test-ad": "result" }),
  MultiplexAd: () => createElement("div", { "data-test-ad": "multiplex" }),
}));
vi.mock("@/components/affiliate/AffiliateSlot", () => ({
  OfferSlot: () => createElement("div", { "data-test-ad": "offer" }),
  default: () => null,
}));
vi.mock("@/components/ShareSection", () => ({ default: () => createElement("div", { "data-test": "share" }) }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => createElement("div", { "data-test": "related" }) }));
vi.mock("@/components/YearEndTaxCluster", () => ({ default: () => null }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));

import PreviewPage from "@/app/year-end-tax-preview/page";
import HubPage from "@/app/year-end-tax-2027/page";
import { YEAR_END_NEWS, YEAR_END_REFORM_2027 } from "@/data/yearEndTaxHub";
import { YEAR_END_HUB_DATED_FAQS } from "@/lib/yearEndDatedFaqs";

const lastAdIndex = (html: string) => {
  const at = [...html.matchAll(/data-test-ad="[^"]+"/g)].map((m) => m.index ?? -1);
  expect(at.length).toBeGreaterThanOrEqual(4);
  return Math.max(...at);
};
const visible = (html: string) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
const jsonLd = (html: string) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => {
    const parsed = JSON.parse(m[1]) as unknown;
    return (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[];
  });

describe("/year-end-tax-preview — 최근 개통일 표는 마지막 광고 아래", () => {
  const html = visible(renderToStaticMarkup(createElement(PreviewPage)));
  const lastAd = lastAdIndex(html);

  it("표·메뉴 경로·가이드 링크가 모든 광고 표시와 공유 블록보다 아래다", () => {
    const section = html.indexOf('id="open-history-heading"');
    expect(section).toBeGreaterThan(lastAd);
    expect(html.indexOf('data-test="share"')).toBeLessThan(section);
    const guideLink = html.indexOf('href="/guides/hometax-year-end-preview-2026"');
    expect(guideLink).toBeGreaterThan(lastAd);
    expect(html.indexOf("편리한 연말정산")).toBeGreaterThan(lastAd);
    // 광고 위에는 이 표·링크가 없다
    expect(html.slice(0, lastAd)).not.toContain("open-history");
    expect(html.slice(0, lastAd)).not.toContain("/guides/hometax-year-end-preview-2026");
  });

  it("행은 국세청 발표 개통일 3개(정책브리핑 확인)이고 제목의 연수는 행 수와 같다", () => {
    const rows = [...html.matchAll(/<tr class="border-b border-canvas-200\/60[^"]*"><td[^>]*>([^<]+)<\/td><td[^>]*>([^<]+)<\/td><td[^>]*>([^<]+)<\/td><\/tr>/g)].map(
      (m) => [m[1], m[2], m[3]],
    );
    expect(rows).toEqual([
      ["2023년 귀속", "2023년 10월 31일", "국세청 발표(대한민국 정책브리핑)"],
      ["2024년 귀속", "2024년 11월 15일", "국세청 발표(대한민국 정책브리핑)"],
      ["2025년 귀속", "2025년 11월 5일", "국세청 발표(대한민국 정책브리핑)"],
    ]);
    expect(html).toContain(`최근 ${rows.length}년 연말정산 미리보기 개통일`);
    // 2026년 귀속 개통일은 국세청 보도자료 전에는 넣지 않는다 (2026-11-01 현재 미발표)
    expect(html).not.toMatch(/2026년 1[01]월 \d+일/);
  });

  it("표의 날짜는 광고 위 FAQ 문장(국세청 발표 최근 3년)과 같다", () => {
    const above = html.slice(0, lastAd);
    for (const d of ["2023년 10월 31일", "2024년 11월 15일", "2025년 11월 5일"]) expect(above).toContain(d);
  });
});

describe("/year-end-tax-2027 — 정부안 블록·시즌 도구·질문형 FAQ 는 마지막 광고 아래", () => {
  const raw = renderToStaticMarkup(createElement(HubPage));
  const html = visible(raw);
  const lastAd = lastAdIndex(html);

  it("세 블록 모두 마지막 광고(멀티플렉스)보다 아래이고 순서는 정부안 → 관련 계산기 → 도구 → FAQ", () => {
    expect(html.slice(lastAd, lastAd + 40)).toContain('data-test-ad="multiplex"');
    const reform = html.indexOf('id="reform-2027-heading"');
    const related = html.indexOf('data-test="related"');
    const tools = html.indexOf('id="more-tools-heading"');
    const faq = html.indexOf('id="hub-dated-faq"');
    for (const at of [reform, related, tools, faq]) expect(at).toBeGreaterThan(lastAd);
    expect(reform).toBeLessThan(related);
    expect(related).toBeLessThan(tools);
    expect(tools).toBeLessThan(faq);
  });

  it("광고 위 뉴스 목록은 3행 문구 그대로다 (광고 위 변경 없음)", () => {
    expect(YEAR_END_NEWS).toEqual([
      { date: "2026-01", text: "2026년 귀속부터 신용카드 기본공제 한도가 자녀 수(최대 2명분)에 따라 상향 적용" },
      { date: "2026-01", text: "출산·보육수당 비과세 한도 자녀 1인당 월 20만원 적용" },
      { date: "2026-08", text: "2026 세제개편안 발표 — 국회 통과 시 2027년 소득분부터 적용(올해 정산 무관)" },
    ]);
    const above = html.slice(0, lastAd);
    for (const n of YEAR_END_NEWS) expect(above).toContain(n.text);
    expect(above).not.toContain("reform-2027-heading");
    expect(above).not.toContain("more-tools-heading");
    expect(above).not.toContain("hub-dated-faq");
  });

  it("정부안 블록은 발표일·국무회의 확정일·국회 의결 전 확인일을 날짜로 보여 준다", () => {
    expect(YEAR_END_REFORM_2027.announced).toBe("2026-08-03");
    expect(YEAR_END_REFORM_2027.confirmed).toBe("2026-09-01");
    expect(YEAR_END_REFORM_2027.statusCheckedOn).toBe("2026-11-01");
    const block = html.slice(html.indexOf('id="reform-2027-heading"'), html.indexOf('data-test="related"'));
    expect(block).toContain('<time dateTime="2026-08-03">2026년 8월 3일</time>');
    expect(block).toContain('<time dateTime="2026-09-01">9월 1일</time>');
    expect(block).toContain('<time dateTime="2026-11-01">2026년 11월 1일</time> 확인 기준 아직 국회');
    expect(block).toContain("의결 전입니다");
    expect(block).toContain("올해(2026년 귀속)");
  });

  it("정부안 행은 상세본의 현행/개정안 표와 같다 (5행)", () => {
    const rows = Object.fromEntries(YEAR_END_REFORM_2027.rows.map((r) => [r.item, r]));
    expect(Object.keys(rows)).toEqual([
      "신용카드 대중교통 사용분",
      "신용카드 추가공제 한도",
      "월세 세액공제",
      "부양가족 기본공제 소득요건",
      "혼인세액공제",
    ]);
    expect(rows["신용카드 대중교통 사용분"].plan).toContain("신용 15%·체크 30%");
    expect(rows["신용카드 추가공제 한도"].now).toBe("총급여 7천만원 이하 300만원·초과 200만원");
    expect(rows["신용카드 추가공제 한도"].plan).toContain("200만원·100만원");
    expect(rows["월세 세액공제"].now).toBe("월세 연 1,000만원 한도, 15%(총급여 5,500만원 이하 17%)");
    expect(rows["월세 세액공제"].plan).toBe("월세 연 1,200만원 한도, 청년(15~34세)은 17%");
    expect(rows["부양가족 기본공제 소득요건"].plan).toBe("300만원(총급여 750만원) 이하");
    expect(rows["혼인세액공제"].plan).toBe("적용기한 연장 없이 종료, 재정지원으로 전환");
    const block = html.slice(html.indexOf('id="reform-2027-heading"'), html.indexOf('data-test="related"'));
    for (const r of YEAR_END_REFORM_2027.rows) expect(block).toContain(r.plan);
  });

  it("FAQPage 는 하나이고 맨 끝 질문형 FAQ 3문항을 포함한다", () => {
    const faqPages = jsonLd(raw).filter((d) => d["@type"] === "FAQPage");
    expect(faqPages).toHaveLength(1);
    const names = (faqPages[0].mainEntity as { name: string }[]).map((e) => e.name);
    for (const f of YEAR_END_HUB_DATED_FAQS) expect(names).toContain(f.question);
  });
});
