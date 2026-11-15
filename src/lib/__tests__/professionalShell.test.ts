import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const location = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => location.pathname, useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "light", resolvedTheme: "light", setTheme: vi.fn() }) }));
vi.mock("@/components/AppLink", () => ({ default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) }));
vi.mock("@/components/FavoritesButton", () => ({ default: () => createElement("button", null, "Save this page"), loadFavorites: () => [], FAVORITES_EVENT: "favorites" }));
vi.mock("@/app/en/EnglishSalaryCalculator", () => ({ default: () => createElement("div", { id: "calculator" }, createElement("input", { "aria-label": "Annual gross salary", defaultValue: 60000000 })) }));
vi.mock("@/components/AdPlacement", () => ({ HomeTopAd: () => createElement("aside", { "data-ad": "home-top" }), GuideMidAd: () => createElement("aside", { "data-ad": "guide-mid" }) }));

import Footer from "@/components/Footer";
import MobileDropdown from "@/components/header/MobileDropdown";
import Header from "@/components/Header";
import HeroBadge from "@/components/HeroBadge";
import EnLandingClient from "@/app/en/EnLandingClient";
import { navConfig, type DropdownItem } from "@/components/header/navConfig";
// 1/1 요율 전환 가드(infra-b02-F01, 2026-11-15) — 테스트는 currentRates 를 import 해도 된다(컴포넌트는 금지: HeroBadge 는
// HomeClient 클라이언트 그래프, structuredData 는 클라이언트 모듈 7곳이 import). 포인터가 2027 이 되면 배지·JSON-LD 리터럴을
// 같은 통합에서 바꾸기 전까지 아래 두 단언이 실패한다(런북 docs/next-upgrade-plan-2026-09-11.md P-6 ①).
import { CURRENT_RATES_YEAR } from "@/config/currentRates";
import { webApplicationLd } from "@/lib/structuredData";

describe("Professional shell and home contracts", () => {
  it.each(["/", "/en"])("keeps all five footer link groups available in server HTML on %s", (pathname) => {
    location.pathname = pathname;
    const html = renderToStaticMarkup(createElement(Footer));
    expect([...html.matchAll(/<details\b/g)]).toHaveLength(5);
    expect(html).toContain(pathname === "/en" ? 'lang="en"' : 'lang="ko"');
    expect(html).toContain(pathname === "/en" ? 'href="/en/contact"' : 'href="/contact"');
    expect(html).toContain('aria-label="Money Salary');
    expect(html).not.toMatch(/가장 정확|100가지|공식 인증/);
    if (pathname === "/en") {
      const destinations = [...html.matchAll(/href="([^"]+)"/g)].map(match => match[1]);
      expect(destinations.filter(href => href !== "/" && !href.startsWith("/en"))).toEqual([]);
    }
  });

  it("opens the current mobile category and connects its control to an SSR panel", () => {
    const item: DropdownItem = { type: "dropdown", name: "Calculators", items: [
      { name: "Current tool", href: "/en/tools/loan" }, { name: "Other tool", href: "/en/tools/bonus" },
    ] };
    const html = renderToStaticMarkup(createElement(MobileDropdown, { item, pathname: "/en/tools/loan", onClose: vi.fn(), locale: "en" }));
    const target = /aria-controls="([^"]+)"/.exec(html)?.[1];
    expect(target).toBeTruthy();
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain(`id="${target}"`);
    expect(html).toContain('href="/en/tools/loan" aria-current="page"');
    expect(html).toContain('href="/en/tools/bonus"');
    const other = renderToStaticMarkup(createElement(MobileDropdown, { item, pathname: "/en/guides", onClose: vi.fn(), locale: "en" }));
    expect(other).toContain('aria-expanded="false"');
    expect(other).toContain('href="/en/tools/loan"');
  });

  it.each(["/", "/en"])("keeps native menu/search triggers and server navigation without an entrance animation on %s", (pathname) => {
    location.pathname = pathname;
    const html = renderToStaticMarkup(createElement(Header));
    expect(html).toContain('aria-controls="mobile-nav-menu"');
    expect(html).toContain('id="mobile-nav-menu"');
    const searchLabel = pathname === "/en" ? "Open search" : "검색 열기";
    const searchTriggers = [...html.matchAll(/<button\b[^>]*aria-label="([^"]+)"[^>]*>[\s\S]*?<\/button>/g)]
      .filter(match => match[1] === searchLabel).map(match => match[0]);
    expect(searchTriggers).toHaveLength(1);
    expect(searchTriggers[0]).toContain(pathname === "/en" ? ">Search</span>" : ">검색</span>");
    expect(searchTriggers[0]).toContain('aria-haspopup="dialog"');
    expect(searchTriggers[0]).toContain('aria-expanded="false"');
    expect(html).toContain(pathname === "/en" ? 'href="/en/guides"' : 'href="/guides"');
    expect(html).not.toContain("header-slide-in");
    expect(html).not.toContain("backdrop-filter");
  });

  it("keeps the English primary input and ad order, with explicit assumptions and preserved destinations", () => {
    location.pathname = "/en";
    const html = renderToStaticMarkup(createElement(EnLandingClient, { guides: [] }));
    expect([...html.matchAll(/<h1\b/g)]).toHaveLength(1);
    expect(html).toContain("Korea Salary Calculator 2026");
    expect(html).toContain('href="#calculator"');
    expect(html).toContain('aria-label="Annual gross salary"');
    expect(html.indexOf('id="calculator"')).toBeLessThan(html.indexOf('data-ad="home-top"'));
    expect([...html.matchAll(/data-ad="([^"]+)"/g)].map(match => match[1])).toEqual(["home-top", "guide-mid"]);
    expect(html).toContain('href="/en/help#salary"');
    expect(html).toContain('href="/en/dashboard"');
    expect(html).toContain("not a payslip");
  });

  it("keeps the Korean hero context deterministic instead of making seasonal or speed claims", () => {
    const html = renderToStaticMarkup(createElement(HeroBadge));
    expect(html).toContain(`${CURRENT_RATES_YEAR} 계산 기준`);
    expect(html).not.toMatch(/5초|100\+|즉시 반영|시즌/);
  });

  it("names the current rate year in the home WebApplication JSON-LD", () => {
    expect(webApplicationLd({ dateModified: new Date("2026-11-15T00:00:00+09:00") }).description).toContain(`${CURRENT_RATES_YEAR}년 최신 세법 기준`);
  });

  it("offers the checklist in both Korean menus with a current-page indicator and keeps English navigation local", () => {
    location.pathname = "/money-check";
    const html = renderToStaticMarkup(createElement(Header));
    const shortcuts = [...html.matchAll(/<a\b[^>]*href="\/money-check"[^>]*>/g)].map(match => match[0]).filter(anchor => anchor.includes('data-msy-module="header-money-check"'));
    expect(shortcuts).toHaveLength(2);
    for (const shortcut of shortcuts) {
      expect(shortcut).toContain('aria-current="page"');
      expect(shortcut).toContain('data-msy-module="header-money-check"');
    }
    expect(renderToStaticMarkup(createElement(Footer))).toContain('href="/money-check"');
    location.pathname = "/en";
    expect(renderToStaticMarkup(createElement(Header))).not.toContain('href="/money-check"');
  });

  it("exposes the work clock in the top-level menu and closed mobile header without changing the English shell", () => {
    expect(navConfig.find(item => item.name === "월급 시계")).toMatchObject({ type: "link", href: "/work-clock" });
    location.pathname = "/work-clock";
    const html = renderToStaticMarkup(createElement(Header));
    const shortcuts = [...html.matchAll(/<a\b[^>]*href="\/work-clock"[^>]*>/g)].map(match => match[0]).filter(anchor => anchor.includes('data-msy-module="header-work-clock"'));
    expect(shortcuts).toHaveLength(3);
    for (const shortcut of shortcuts) expect(shortcut).toContain('aria-current="page"');
    const closedHeader = html.slice(0, html.indexOf("</header>"));
    expect(closedHeader).toContain('data-msy-module="header-work-clock"');
    expect(closedHeader).toContain('aria-label="검색 열기"');
    expect(closedHeader).toContain('aria-label="메뉴 열기"');
    location.pathname = "/en";
    const english = renderToStaticMarkup(createElement(Header));
    expect(english).not.toContain('href="/work-clock"');
    expect(english).toContain('href="/en/dashboard"');
  });
});
