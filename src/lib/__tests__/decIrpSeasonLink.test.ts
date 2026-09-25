// 12월 '막차 공제' 링크 회귀 가드 (2026-09-25 수익 추천 #10 — docs/revenue-recommendations-2026-09-25.md)
//
// 배경: 연금계좌(IRP·연금저축) 세액공제는 12/31 까지 납입한 금액만 그해 공제에 들어가(소득세법 제59조의3·
// 국세청 근로소득 연금계좌 세액공제 안내 — 연 900만원, 연금저축은 600만원까지) 사람들이 실제로 움직이는 달이
// 12월뿐인데, 12월 시즌 링크 묶음에 이 계산기로 가는 링크가 없었다.
//   1) DEC 세트(헤더 시즌 메뉴 SEASON_TOP_DEC · 표 페이지 SEASONAL_LINKS_DEC)에서 체크리스트 자리를
//      /tools/finance/irp 로 교체 — 헤더·표 블록 항목 수 불변. 체크리스트는 헤더에서 빠지고 푸터로 옮겨 간다:
//      58b8876d 의 DEC 에서는 헤더 전용 상단 항목이 dedup 으로 SEASON_REST 푸터(order 21)를 가려 DEC 푸터에
//      없었고(27개), 교체 후 order 21 이 살아나 DEC 푸터 28개가 된다 ('푸터로 계속 도달'은 틀린 서술 — 정정).
//   2) SeasonalLinks 는 표 layout 의 PageFooterAds 위 블록 — 새 제목·설명은 교체 전 문구보다 길지 않다.
//   3) 검색 칩 DEC 세트에는 이미 'IRP' 칩이 있다(변경 없음, 7개 유지).
//   4) 연말정산 허브 히어로의 '12월 31일에 마감' 을 같은 글자 인라인 링크로 — 첫 광고(GuideMid) 위 높이 불변.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement, type AnchorHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { HEADER_SEASON_MAX, SEASON_TOP_DEC, buildSeasonLinks } from "@/config/seasonLinks";
import { SEASONAL_LINKS_DEC } from "@/app/table/2026/SeasonalLinks";

vi.mock("@/components/AppLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement("a", props),
}));
vi.mock("@/components/AdPlacement", () => ({
  GuideMidAd: () => createElement("div", { "data-test-ad": "guide" }),
  InArticleAd: () => createElement("div", { "data-test-ad": "in-article" }),
  MultiplexAd: () => createElement("div", { "data-test-ad": "multiplex" }),
  CalcResultAd: () => createElement("div", { "data-test-ad": "result" }),
}));
vi.mock("@/components/affiliate/AffiliateSlot", () => ({ OfferSlot: () => null, default: () => null }));
vi.mock("@/components/ShareSection", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/YearEndTaxCluster", () => ({ default: () => null }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const IRP = "/tools/finance/irp";
const CHECKLIST = "/year-end-tax-checklist";

describe("DEC 헤더 시즌 메뉴 (SEASON_TOP_DEC)", () => {
  it("IRP·연금저축 계산기가 체크리스트 자리(5번째)에 SEASON 배지로 들어가고 항목 수는 그대로다", () => {
    expect(SEASON_TOP_DEC).toHaveLength(8);
    expect(SEASON_TOP_DEC.filter((l) => l.header)).toHaveLength(7);
    expect(SEASON_TOP_DEC[4].href).toBe(IRP);
    expect(SEASON_TOP_DEC[4].header?.badge).toBe("SEASON");
    expect(SEASON_TOP_DEC[4].footer).toBeUndefined();
    expect(SEASON_TOP_DEC.map((l) => l.href)).not.toContain(CHECKLIST);
  });

  it("헤더 항목 12개(≤ HEADER_SEASON_MAX) 그대로, 체크리스트는 헤더에서 빠지고 푸터 order 21 로 새로 노출", () => {
    const links = buildSeasonLinks("DEC");
    const header = links.filter((l) => l.header).map((l) => l.href);
    expect(header).toHaveLength(12);
    expect(header.length).toBeLessThanOrEqual(HEADER_SEASON_MAX);
    expect(header).toContain(IRP);
    expect(header).not.toContain(CHECKLIST);
    const footer = links.filter((l) => l.footer).map((l) => l.href);
    expect(footer).toContain(CHECKLIST);
    // 살아난 것은 SEASON_REST 의 푸터 항목(order 21) — 상단 블록에는 체크리스트가 없다
    expect(links.find((l) => l.href === CHECKLIST)?.footer?.order).toBe(21);
    // 종부세 납부(12/1~15)와 겹치는 재산세 푸터는 유지
    expect(footer).toContain("/property-holding-tax-2026");
  });

  it("설명은 확인된 사실만 — 12/31 납입분·연 900만 한도", () => {
    const d = SEASON_TOP_DEC[4].header?.description ?? "";
    expect(d).toContain("12/31");
    expect(d).toContain("900만");
    expect(d).not.toMatch(/148|16\.5|13\.2/); // 환급액·공제율 수치는 계산기 본문에서만
  });
});

describe("DEC 표 페이지 시즌 블록 (SEASONAL_LINKS_DEC)", () => {
  it("6개 유지 — 체크리스트 자리를 IRP 계산기로", () => {
    expect(SEASONAL_LINKS_DEC.links).toHaveLength(6);
    const hrefs = SEASONAL_LINKS_DEC.links.map((l) => l.href);
    expect(hrefs[4]).toBe(IRP);
    expect(hrefs).not.toContain(CHECKLIST);
    expect(new Set(hrefs).size).toBe(6);
  });

  it("PageFooterAds 위 블록 — 새 제목·설명은 교체 전 문구보다 길지 않다", () => {
    const item = SEASONAL_LINKS_DEC.links[4];
    // 교체 전(2026-09-05 사전 제작분)
    const before = { title: "연말정산 체크리스트", description: "12.31 마감 전 놓치기 쉬운 공제 항목 점검" };
    expect(item.description.length).toBeLessThanOrEqual(before.description.length);
    // 제목은 두 자 길지만 한 줄 폭(가장 긴 기존 제목 '연말정산 2027 총정리 허브 (2026년 귀속)')보다 한참 짧다
    const longest = Math.max(...SEASONAL_LINKS_DEC.links.filter((l) => l.href !== IRP).map((l) => l.title.length));
    expect(item.title.length).toBeLessThan(longest);
    expect(item.title.length).toBeLessThanOrEqual(before.title.length + 2);
  });
});

describe("대상 라우트·검색 칩", () => {
  it("/tools/finance/irp 는 실존 라우트", () => {
    expect(existsSync(resolve(process.cwd(), "src/app/tools/finance/irp/page.tsx"))).toBe(true);
  });

  it("검색 칩 DEC 세트에는 이미 'IRP' 가 있다 — 7개 유지", () => {
    const m = read("src/components/header/HeaderSearch.tsx").match(/^\s*DEC:\s*\[([^\]]*)\]/m);
    expect(m).not.toBeNull();
    const chips = [...m![1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
    expect(chips).toHaveLength(7);
    expect(chips).toContain("IRP");
  });
});

describe("연말정산 허브 히어로 '12월 31일에 마감' → IRP 계산기", () => {
  it("첫 광고(GuideMid) 위 문단 글자는 그대로, 그 구절만 인라인 링크", async () => {
    const mod = await import("@/app/year-end-tax-2027/page");
    const html = renderToStaticMarkup(createElement(mod.default));
    const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
    const firstAd = visible.indexOf("data-test-ad=");
    expect(visible.slice(firstAd, firstAd + 30)).toContain('data-test-ad="guide"');
    const hero = visible.slice(0, firstAd);
    const link = hero.match(/<a [^>]*href="\/tools\/finance\/irp"[^>]*>([^<]*)<\/a>/);
    expect(link, "히어로에 IRP 링크 없음").not.toBeNull();
    expect(link![1]).toBe("12월 31일에 마감");
    expect(link![0]).toContain("font-bold");
    // 문단 텍스트는 교체 전과 한 글자도 다르지 않다 (높이 불변)
    const para = hero.match(/<p class="speakable-summary[^"]*">([\s\S]*?)<\/p>/);
    expect(para).not.toBeNull();
    expect(para![1].replace(/<[^>]+>/g, "")).toBe(
      "2026년 1~12월 소득에 대한 연말정산을 2027년 1~2월에 합니다. 공제 지출은 12월 31일에 마감되므로, 지금 예상 환급액을 계산하고 남은 기간의 절세 액션을 챙기는 것이 환급액을 가르는 핵심입니다. 아래 로드맵을 시기 순서대로 따라가면 됩니다.",
    );
  });
});
