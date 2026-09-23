// 2026-09-23 Worker CPU 한도(1102) 대응 — edge SSR 경로에서만 헤더 메가메뉴 패널을
// 하이드레이션 뒤 렌더한다. 프리렌더 페이지의 SSR 링크(크롤 경로)는 그대로여야 한다.
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const location = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => location.pathname, useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "light", resolvedTheme: "light", setTheme: vi.fn() }) }));
vi.mock("@/components/AppLink", () => ({ default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) }));
vi.mock("@/components/FavoritesButton", () => ({ default: () => createElement("button", null, "Save this page"), loadFavorites: () => [], FAVORITES_EVENT: "favorites" }));

import Header from "@/components/Header";
import { navConfig } from "@/components/header/navConfig";
import { isEdgeRenderedPath } from "@/lib/edgeRenderedPaths";

const firstDropdownHref = navConfig.find((item) => item.type === "dropdown")!.items[0].href;

describe("isEdgeRenderedPath", () => {
  it("matches only the edge-rendered detail routes, not their static hubs", () => {
    expect(isEdgeRenderedPath("/share/eyJhIjo1MDAwMDAwMH0")).toBe(true);
    expect(isEdgeRenderedPath("/glossary/%EA%B5%AD%EB%AF%BC%EC%97%B0%EA%B8%88")).toBe(true);
    expect(isEdgeRenderedPath("/qna/연봉-5000만원")).toBe(true);
    // 허브·프리렌더 페이지·2세그먼트 이상(전역 정적 404 가 서빙됨)·빈 값은 전부 false
    for (const staticPath of ["/", "/glossary", "/qna", "/glossary/", "/glossary/a/b", "/qna/a/b", "/share/a/b", "/calc/samsung-bonus", "/salary/50000000", "/company/compare", "/en", "/en/glossary/x", null, undefined]) {
      expect(isEdgeRenderedPath(staticPath)).toBe(false);
    }
  });
});

describe("Header mega-menu SSR", () => {
  it("keeps every dropdown link in server HTML on prerendered pages", () => {
    location.pathname = "/calc/samsung-bonus";
    const html = renderToStaticMarkup(createElement(Header));
    expect(html).toContain(`href="${firstDropdownHref}"`);
    const hrefs = new Set([...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]));
    for (const item of navConfig) {
      if (item.type === "dropdown") for (const link of item.items) expect(hrefs.has(link.href)).toBe(true);
    }
  });

  it("defers dropdown panel contents on edge-rendered pages while keeping triggers and panel ids", () => {
    location.pathname = "/glossary/%EA%B5%AD%EB%AF%BC%EC%97%B0%EA%B8%88";
    const html = renderToStaticMarkup(createElement(Header));
    expect(html).not.toContain(`href="${firstDropdownHref}"`);
    // 트리거·패널 골격은 남는다: aria-controls 가 가리키는 id 가 모두 존재
    const controls = [...html.matchAll(/aria-controls="([^"]+)"/g)].map((match) => match[1]);
    expect(controls.length).toBeGreaterThan(navConfig.filter((item) => item.type === "dropdown").length);
    for (const id of controls) expect(html).toContain(`id="${id}"`);
    expect(html).toContain('id="mobile-nav-menu"');
    expect(html).toContain('aria-label="메뉴 열기"');
    // 상단 바의 직접 링크(드롭다운이 아닌 항목)는 SSR 유지
    for (const item of navConfig) if (item.type === "link") expect(html).toContain(`href="${item.href}"`);
    // 프리렌더 페이지 대비 SSR 바이트가 크게 준다(패널 ~330KB 가 빠짐)
    location.pathname = "/calc/samsung-bonus";
    const fullHtml = renderToStaticMarkup(createElement(Header));
    expect(html.length).toBeLessThan(fullHtml.length / 3);
  });
});
