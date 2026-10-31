import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Compose the real root/calc layouts and route components. Only framework
// plumbing and live-service slots are inert; the main and skip-link markup is real.
vi.mock("next/font/local", () => ({ default: () => ({ variable: "local-font-fixture" }) }));
vi.mock("next/navigation", () => ({ usePathname: () => "/calc/child-deduction", useSearchParams: () => new URLSearchParams() }));
vi.mock("@/app/providers", () => ({ NextThemesProvider: ({ children }: { children: ReactNode }) => children }));
vi.mock("@/components/AdPlacement", () => Object.fromEntries(
  ["CalcResultAd", "GuideMidAd", "InArticleAd", "HomeTopAd"].map(name => [name, () => null]),
));
vi.mock("@/components/LiveServices", () => ({ default: () => null }));
vi.mock("@/components/KakaoScript", () => ({ default: () => null }));
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));
vi.mock("@/components/affiliate/AffiliateSlot", () => ({ OfferSlot: () => null }));
vi.mock("@/components/Header", () => ({ default: () => createElement("header", null, "Header") }));
vi.mock("@/components/Footer", () => ({ default: () => createElement("footer", null, "Footer") }));
vi.mock("@/components/ShareSection", () => ({ default: () => null }));
vi.mock("@/components/AutoShareSection", () => ({ default: () => null }));
vi.mock("@/components/FloatingShareBar", () => ({ default: () => null }));
vi.mock("@/hooks/useCalculatorMeasurement", () => ({ useCalculatorMeasurement: () => ({ inputProps: {}, resultRef: null }) }));

import RootLayout from "./layout";
import CalcLayout from "./calc/layout";
import ChildDeductionPage from "./calc/child-deduction/page";
import DualIncomeYearEndPage from "./calc/dual-income-year-end/page";
import YearEndTaxPage from "./year-end-tax/page";

const fetchTrap = vi.fn(() => { throw new Error("Network is prohibited in landmark SSR tests"); });
beforeAll(() => {
  vi.stubEnv("NEXT_PUBLIC_ADS_DISABLED", "1");
  vi.stubEnv("MSY_QA_MODE", "1");
  vi.stubGlobal("fetch", fetchTrap);
});
afterAll(() => {
  expect(fetchTrap).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("tax calculator main landmark within the real shared layouts", () => {
  it.each([
    { route: "/calc/child-deduction", page: ChildDeductionPage, calcLayout: true },
    { route: "/calc/dual-income-year-end", page: DualIncomeYearEndPage, calcLayout: true },
    { route: "/year-end-tax", page: YearEndTaxPage, calcLayout: false },
  ])("$route retains one main landmark and the existing skip destination", ({ page, calcLayout }) => {
    const content = createElement(page);
    const child = calcLayout ? createElement(CalcLayout, null, content) : content;
    const html = renderToStaticMarkup(createElement(RootLayout, null, child));
    // Scripts are data in this non-rendering assertion, never executed.
    const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    expect(markup.match(/<main\b[^>]*>/g)).toEqual(['<main id="main-content" class="flex-grow w-full">']);
    expect(markup.match(/<\/main>/g)).toHaveLength(1);
    expect(markup.match(/\bid="main-content"/g)).toHaveLength(1);
    expect(markup).toContain('href="#main-content"');
    expect(markup.match(/<h1\b/g)).toHaveLength(1);
    expect(markup).not.toMatch(/\brole="main"/);
  });
});
