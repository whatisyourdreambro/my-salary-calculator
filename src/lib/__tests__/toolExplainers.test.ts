// 도구·재미 페이지 맨 아래 설명 글 (2026-11-13 lens-meta-F10, 운영자 질문 2 승인).
// - 대상은 검증 의견이 고른 6곳뿐(재미용 /fun 17쪽 제외), 쪽마다 보이는 글자 300~600자.
// - 렌더 위치는 그 쪽의 마지막 광고 뒤 — 광고 위 높이 불변.
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

let currentPath = "/";
vi.mock("next/navigation", () => ({ usePathname: () => currentPath }));

import ToolExplainerSection from "@/components/ToolExplainerSection";
import { TOOL_EXPLAINERS, getToolExplainer } from "@/lib/toolExplainers";

const PAGES: Record<string, { file: string; adTags: string[] }> = {
  "/global": { file: "src/app/global/page.tsx", adTags: ["<PageFooterAds", "<GuideMidAd"] },
  "/mbti-salary": { file: "src/app/mbti-salary/page.tsx", adTags: ["<PageFooterAds", "<GuideMidAd"] },
  "/lotto": { file: "src/app/lotto/page.tsx", adTags: ["<PageFooterAds", "<CalcResultAd"] },
  "/fortune-2026": { file: "src/app/fortune-2026/page.tsx", adTags: ["<PageFooterAds", "<GuideMidAd"] },
  "/tools/math": { file: "src/app/tools/layout.tsx", adTags: ["<HomeTopAd", "<InArticleAd", "<CoupangBanner"] },
  "/company/simulator": { file: "src/app/company/layout.tsx", adTags: ["<PageFooterAds"] },
};

const visibleText = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'").replace(/&amp;/g, "&");

describe("lens-meta-F10 도구 설명 글", () => {
  it("대상은 6곳뿐이다", () => {
    expect(Object.keys(TOOL_EXPLAINERS).sort()).toEqual(Object.keys(PAGES).sort());
  });

  it.each(Object.keys(PAGES))("%s: 본문 300~600자, 링크 없음", (path) => {
    const e = getToolExplainer(path)!;
    const chars = e.paragraphs.join("").length;
    expect(chars, path).toBeGreaterThanOrEqual(300);
    expect(chars, path).toBeLessThanOrEqual(600);
    const html = renderToStaticMarkup(createElement(ToolExplainerSection, { path }));
    expect(html).toContain(`<h2`);
    expect(html).not.toContain("<a ");
    expect(visibleText(html)).toContain(e.paragraphs[0]);
  });

  it.each(Object.entries(PAGES))("%s: 마지막 광고 뒤에서만 렌더한다", (_path, { file, adTags }) => {
    const src = readFileSync(file, "utf8");
    const at = src.indexOf("<ToolExplainerSection");
    expect(at, file).toBeGreaterThan(-1);
    expect(src.split("<ToolExplainerSection").length - 1, file).toBe(1);
    for (const tag of adTags) expect(src.lastIndexOf(tag), `${file} ${tag}`).toBeLessThan(at);
    expect(src.lastIndexOf("Ad "), file).toBeLessThan(at);
    expect(src.lastIndexOf("Ads "), file).toBeLessThan(at);
  });

  it("레이아웃에 둔 경우 등록 경로에서만 렌더한다(같은 레이아웃의 다른 쪽은 그대로)", () => {
    currentPath = "/tools/math";
    expect(renderToStaticMarkup(createElement(ToolExplainerSection))).toContain("퍼센트·단위 계산은");
    for (const other of ["/tools/math/percent", "/tools/finance/bonus", "/company/compare", "/company"]) {
      currentPath = other;
      expect(renderToStaticMarkup(createElement(ToolExplainerSection)), other).toBe("");
    }
    currentPath = "/company/simulator";
    expect(renderToStaticMarkup(createElement(ToolExplainerSection))).toContain("중소기업·대기업 실수령액");
  });

  it("로또 확률은 45개 중 6개 조합 수와 같다", () => {
    let c = 1;
    for (let i = 0; i < 6; i++) c = (c * (45 - i)) / (i + 1);
    expect(c).toBe(8_145_060);
    expect(getToolExplainer("/lotto")!.paragraphs[0]).toContain("8,145,060분의 1");
  });
});
