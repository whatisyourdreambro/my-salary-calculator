// src/lib/__tests__/funPageContracts.test.ts
//
// /fun·소형 페이지 회귀 가드 (2026-09-25 감사 B17 — GATE-06·PERF-11·META-16).
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/dynamic", () => ({ default: () => function DynamicPlaceholder() { return createElement("div", { "data-dynamic-placeholder": true }); } }));
vi.mock("@/components/AppLink", () => ({ default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) }));
vi.mock("@/components/AdPlacement", () => ({
  InArticleAd: () => createElement("aside", { "data-ad": "in-article" }),
  SidebarAd: () => createElement("aside", { "data-ad": "sidebar" }),
  GuideMidAd: () => createElement("aside", { "data-ad": "guide-mid" }),
}));
vi.mock("@/components/PageFooterAds", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/ResultSharePanel", () => ({ default: () => null }));

import CarLoanPage from "@/app/car-loan/page";
import RankClient from "@/app/fun/rank/RankClient";
import FortunePage from "@/app/fun/fortune/page";
import { metadata as salaryBattleMetadata } from "@/app/fun/salary-battle/layout";

const FUN_DIR = "src/app/fun";
const funSources = readdirSync(FUN_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .flatMap((entry) => ["layout.tsx", "page.tsx"].map((file) => `${FUN_DIR}/${entry.name}/${file}`))
  .filter((file) => existsSync(file))
  .map((file) => [file, readFileSync(file, "utf8")] as const);

describe("/fun structured data names", () => {
  const appNames = funSources.flatMap(([file, source]) =>
    [...source.matchAll(/"@type": "(?:SoftwareApplication|VideoGame|WebApplication|Quiz)",\s*"name": "([^"]+)"/g)].map(
      (match) => [file, match[1], source] as const
    )
  );

  it("finds the /fun application JSON-LD blocks", () => {
    expect(appNames.length).toBeGreaterThanOrEqual(12);
  });

  it.each(appNames.map(([file, name, source]) => [file, name, source]))("%s names the app in Korean like its title", (_file, name, source) => {
    expect(name).toMatch(/^[가-힣0-9]/);
    expect(name).toMatch(/[가-힣]/);
    const title = /title: ["']([^"']+)["']/.exec(source)?.[1];
    if (title && /^(?:SoftwareApplication|VideoGame)$/.test(/"@type": "(\w+)"/.exec(source)?.[1] ?? "")) {
      expect(title.split(" - ")[0]).toBe(name);
    }
  });
});

describe("/fun/salary-battle spelling", () => {
  it("uses the standard spelling 워라밸 in metadata and UI", () => {
    const title = (salaryBattleMetadata.title as { absolute: string }).absolute;
    expect(title).toContain("워라밸");
    expect(JSON.stringify(salaryBattleMetadata)).not.toContain("워라벨");
    expect(readFileSync(`${FUN_DIR}/salary-battle/SalaryBattleClient.tsx`, "utf8")).not.toContain("워라벨");
  });
});

describe("hero H1 is visible in server HTML", () => {
  it.each([
    ["/car-loan", CarLoanPage],
    ["/fun/rank", RankClient],
    ["/fun/fortune", FortunePage],
  ])("%s does not ship the H1 wrapper at opacity:0", (_route, Page) => {
    const html = renderToStaticMarkup(createElement(Page));
    const beforeH1 = html.slice(0, html.indexOf("<h1"));
    expect(html.indexOf("<h1")).toBeGreaterThan(0);
    expect(beforeH1).not.toMatch(/opacity:\s*0(?:[;"}]|$)/);
    expect(beforeH1).not.toContain("translateY(20px)");
  });
});

describe("/fun/flappy high score", () => {
  // 스페이스바 시작은 첫 렌더 클로저(highScore state=0)를 쓰므로 비교·갱신은 ref 로만 한다
  const source = readFileSync(`${FUN_DIR}/flappy/page.tsx`, "utf8");
  const gameOver = /const gameOver = \(\) => \{([\s\S]*?)\n \};/.exec(source)?.[1] ?? "";

  it("compares against the ref that the load effect fills", () => {
    expect(gameOver).toContain("scoreRef.current > highScoreRef.current");
    expect(gameOver).toContain("highScoreRef.current = scoreRef.current");
    expect(gameOver).not.toMatch(/>\s*highScore\b/);
    expect(source).toMatch(/highScoreRef\.current = saved;/);
  });
});
