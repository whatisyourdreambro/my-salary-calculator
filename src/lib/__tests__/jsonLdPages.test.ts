// G3 (2026-11-01 운영자 승인 '구글 개선' 4번) — 바뀐 페이지의 실제 JSON-LD 출력 가드 (순수 SSR, 광고·계산기·공유는 모킹).
//  - 홈 WebApplication·삼성/현대차/성과급 세금 계산기 SoftwareApplication dateModified = 사이트맵 lastmod 와 같은 함수
//    (staticRouteLastModified)의 한국 시각 ISO. 삼성은 화면 '페이지 수정일'과 같은 날이다.
//  - 봉급표 5쪽 Dataset license = 사이트 인용 정책 URL(/insights#citation-policy).
//  - 모든 <script type="application/ld+json"> 는 그대로 JSON.parse 된다(이스케이프 후에도 유효한 JSON).
import { createElement, type AnchorHTMLAttributes, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/components/AppLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement("a", props),
}));
vi.mock("@/components/AdPlacement", () => {
  const ad = (name: string) => {
    const MockAd = () => createElement("div", { "data-test-ad": name });
    MockAd.displayName = `MockAd(${name})`;
    return MockAd;
  };
  return {
    HomeTopAd: ad("home-top"), CalcResultAd: ad("calc-result"), InArticleAd: ad("in-article"), GuideMidAd: ad("guide-mid"),
    MultiplexAd: ad("multiplex"), SidebarAd: ad("sidebar"), Display2Ad: ad("display-2"),
  };
});
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));
vi.mock("@/components/ShareButtons", () => ({ default: () => null }));
vi.mock("@/components/FavoritesButton", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/CitationCopyButton", () => ({ default: () => null }));
vi.mock("@/components/BonusClusterLinks", () => ({ default: () => null }));
vi.mock("@/components/BonusNextLinks", () => ({ default: () => null }));
vi.mock("@/app/calc/samsung-bonus/Client", () => ({ default: () => null }));
vi.mock("@/app/calc/samsung-bonus/TaiCalculator", () => ({ default: () => null }));
vi.mock("@/app/calc/hyundai-bonus/Client", () => ({ default: () => null }));
vi.mock("@/app/calc/year-end-bonus/Client", () => ({ default: () => null }));
vi.mock("@/app/military-pay-2026/SavingsCalc", () => ({ default: () => null }));
vi.mock("@/app/HomeClient", () => ({ default: () => null }));
vi.mock("@/components/home/HomeSeoSection", () => ({ default: () => null }));
vi.mock("@/components/FeaturedGuides", () => ({ default: () => null }));
vi.mock("@/components/SocialProof", () => ({ default: () => null }));
vi.mock("@/components/GuideCategories", () => ({ default: () => null }));
vi.mock("@/components/home/HomeToolsSection", () => ({ default: () => null }));
vi.mock("@/components/home/TrafficEnginesNav", () => ({ default: () => null }));
vi.mock("@/components/FloatingShareBar", () => ({ default: () => null }));
vi.mock("@/components/AutoShareSection", () => ({ default: () => null }));

import HomePage from "@/app/page";
import SamsungPage from "@/app/calc/samsung-bonus/page";
import HyundaiPage from "@/app/calc/hyundai-bonus/page";
import YearEndBonusPage from "@/app/calc/year-end-bonus/page";
import CivilPage from "@/app/civil-servant-pay-2026/page";
import PolicePage from "@/app/police-pay-2026/page";
import FirePage from "@/app/firefighter-pay-2026/page";
import MilitaryPage from "@/app/military-pay-2026/page";
import TeacherPage from "@/app/teacher-pay-2026/page";
import { staticRouteLastModified } from "@/app/sitemap";
import { STATIC_LAST_MODIFIED_ISO, toKstIsoDateTime } from "@/config/siteDates";
import { CITATION_POLICY_URL } from "@/lib/citationPolicy";

type Ld = Record<string, unknown>;

function render(Page: ComponentType): { html: string; ld: Ld[] } {
  const html = renderToStaticMarkup(createElement(Page));
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]) as Ld);
  for (const item of ld) expect(item["@context"]).toBe("https://schema.org");
  return { html, ld };
}

const ofType = (ld: Ld[], type: string) => ld.filter((item) => item["@type"] === type);

describe("앱 JSON-LD dateModified = 사이트맵 lastmod (렌더 결과)", () => {
  it("홈 WebApplication 은 사이트맵 홈 날짜(10/19)이고 7/16 이 아니다", () => {
    const { ld } = render(HomePage);
    const apps = ofType(ld, "WebApplication");
    expect(apps).toHaveLength(1);
    expect(apps[0].dateModified).toBe(toKstIsoDateTime(staticRouteLastModified("/")));
    expect(apps[0].dateModified).toBe("2026-10-19T00:00:00+09:00");
    expect(String(apps[0].dateModified).startsWith(STATIC_LAST_MODIFIED_ISO)).toBe(false);
    expect(apps[0].datePublished).toBe("2024-12-01");
  });

  it("삼성 성과급 SoftwareApplication 은 사이트맵 날짜이고 화면 '페이지 수정일'과 같은 날이다", () => {
    const { html, ld } = render(SamsungPage);
    const apps = ofType(ld, "SoftwareApplication");
    expect(apps).toHaveLength(1);
    expect(apps[0].dateModified).toBe(toKstIsoDateTime(staticRouteLastModified("/calc/samsung-bonus")));
    const shown = html.match(/페이지 수정일: <time dateTime="(\d{4}-\d{2}-\d{2})">/)?.[1];
    expect(shown).toBeDefined();
    expect(String(apps[0].dateModified).slice(0, 10)).toBe(shown);
  });

  it.each([
    ["/calc/hyundai-bonus", HyundaiPage],
    ["/calc/year-end-bonus", YearEndBonusPage],
  ] as const)("%s SoftwareApplication 은 사이트맵 날짜(종전 문자열 9/19·9/9 대신)", (route, Page) => {
    const apps = ofType(render(Page).ld, "SoftwareApplication");
    expect(apps).toHaveLength(1);
    expect(apps[0].dateModified).toBe(toKstIsoDateTime(staticRouteLastModified(route)));
    expect(apps[0].dateModified).not.toMatch(/^2026-09-(?:19|09)/);
  });
});

describe("봉급표 Dataset license = 사이트 인용 정책 (렌더 결과)", () => {
  it.each([
    ["/civil-servant-pay-2026", CivilPage],
    ["/police-pay-2026", PolicePage],
    ["/firefighter-pay-2026", FirePage],
    ["/military-pay-2026", MilitaryPage],
    ["/teacher-pay-2026", TeacherPage],
  ] as const)("%s", (route, Page) => {
    const datasets = ofType(render(Page).ld, "Dataset");
    expect(datasets).toHaveLength(1);
    expect(datasets[0].license).toBe(CITATION_POLICY_URL);
    expect(CITATION_POLICY_URL).toBe("https://www.moneysalary.com/insights#citation-policy");
    expect(datasets[0].url).toBe(`https://www.moneysalary.com${route}`);
  });
});
