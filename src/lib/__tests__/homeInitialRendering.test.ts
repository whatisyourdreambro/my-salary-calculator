import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// Isolate the home's mounting boundaries; tool internals have their own tests.
vi.mock("next/dynamic", () => ({ default: () => function DynamicPlaceholder() { return createElement("div", { "data-dynamic-placeholder": true }); } }));
vi.mock("@/components/AppLink", () => ({ default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) }));
vi.mock("@/components/AdPlacement", () => ({
  HomeTopAd: () => createElement("aside", { "data-slot-position": "home-top" }),
  Display2Ad: () => createElement("aside", { "data-slot-position": "display2" }),
  GuideMidAd: () => createElement("aside", { "data-slot-position": "guide-mid" }),
  MultiplexAd: () => createElement("aside", { "data-slot-position": "multiplex" }),
}));

import HomeClient from "@/app/HomeClient";
import HomeToolsSection from "@/components/home/HomeToolsSection";
import DeferredSection from "@/components/DeferredSection";
import SocialProof from "@/components/SocialProof";
import GuideCategories from "@/components/GuideCategories";
import TrafficEnginesNav from "@/components/home/TrafficEnginesNav";

const renderHome = () => renderToStaticMarkup(createElement(HomeClient, {
  featuredGuides: createElement("section", null, "Featured guides slot"),
  socialProof: createElement(SocialProof),
  guideCategories: createElement(GuideCategories),
  toolsSection: createElement(HomeToolsSection),
  trafficEngines: createElement(TrafficEnginesNav),
}));

describe("Korean home initial rendering", () => {
  it("keeps the heading, calculator anchor and discovery content in visible server HTML", () => {
    const html = renderHome();
    expect(html).toContain("2026 연봉 계산기");
    expect(html).toContain('href="#calculator-section"');
    expect(html).toContain("내 연봉 실수령액 계산");
    expect(html).toContain("결과를 읽는 세 가지 기준");
    expect(html).toContain("어디부터 알아볼까요?");
    expect(html).toContain("회사·직업·산업·지역별 연봉");
    expect(html).not.toMatch(/opacity:0(?:[;"}]|$)/);
    expect(html).not.toContain("translateY(24px)");
  });

  it("preserves all ten tool destinations without opacity-zero entrance wrappers", () => {
    const html = renderToStaticMarkup(createElement(HomeToolsSection));
    const destinations = [...html.matchAll(/href="([^"]+)"/g)].map(match => match[1]);
    expect(destinations).toEqual([
      "/?tab=salary#calculator-section", "/?tab=severance#calculator-section",
      "/?tab=freelancer#calculator-section", "/?tab=exchange#calculator-section",
      "/year-end-tax", "/fun/salary-slip", "/?tab=future#calculator-section",
      "/company/compare", "/?tab=rank#calculator-section", "/tools",
    ]);
    expect(html).not.toContain("opacity:0");
  });

  it("retains the original advertising boundary order and mounts the primary calculator immediately", () => {
    const html = renderHome();
    expect([...html.matchAll(/data-slot-position="([^"]+)"/g)].map(match => match[1])).toEqual(["home-top", "display2", "guide-mid", "multiplex"]);
    const primary = html.slice(html.indexOf('id="calculator-section"'), html.indexOf('data-slot-position="display2"'));
    expect(primary).toContain("data-dynamic-placeholder");
    expect(primary).not.toContain("data-deferred-section");
    expect(html).toContain('id="home-loan-calculator"');
    expect(html).toContain('id="home-deposit-calculator"');
  });

  it("does not execute deferred children during server rendering and keeps a keyboard/noscript fallback", () => {
    const child = vi.fn(() => createElement("input", { defaultValue: "example" }));
    const html = renderToStaticMarkup(createElement(DeferredSection, {
      id: "optional-calculator", label: "선택 계산기", minHeight: 640, fallbackHref: "/tools/loan",
    }, createElement(child)));
    expect(child).not.toHaveBeenCalled();
    expect(html).toContain('data-load-state="deferred"');
    expect(html).toContain("min-height:640px");
    expect(html).toContain('type="button"');
    expect(html).toContain("선택 계산기 열기");
    expect(html).toContain('<noscript>');
    expect(html).toContain('href="/tools/loan"');
  });
});
