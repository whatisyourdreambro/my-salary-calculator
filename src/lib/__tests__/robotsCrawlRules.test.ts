// robots.txt 크롤 규칙 회귀 테스트 (G1, 2026-11-01).
// Next 가 /robots.txt 를 쓸 때 쓰는 직렬화기로 실제 본문을 만들고, 저장소의 robots 판정기
// (scripts/trend-radar — 최장 일치·동률 Allow·와일드카드)로 경로마다 허용 여부를 확인한다.
// 홈 탭 주소(/?tab=)와 가이드 검색(/guides?q=·/en/guides?q=)만 크롤에서 빠지고, 광고 봇 그룹과
// /, /_next/, /api/og, 색인 페이지는 그대로 열려 있어야 한다.
import type { MetadataRoute } from "next";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import { evaluate, parseRobots, selectRules } from "../../../scripts/trend-radar/lib/robots.mjs";

const require = createRequire(import.meta.url);
const { resolveRobots } = require("next/dist/build/webpack/loaders/metadata/resolve-route-data") as {
  resolveRobots: (data: MetadataRoute.Robots) => string;
};

const config = robots();
const text = resolveRobots(config);
const groups = parseRobots(text);
const ruleGroups = [config.rules].flat();

const PARAM_LINES = ["Disallow: /?tab=", "Disallow: /guides?q=", "Disallow: /en/guides?q="];
const SEARCH_BOTS = ["Googlebot", "Googlebot-Image", "Bingbot", "NaverBot", "Yeti", "Daum", "*"];
const AD_BOTS = ["AdsBot-Google", "AdsBot-Google-Mobile", "Mediapartners-Google"];

/** robots.txt 본문에서 그 User-Agent 줄이 속한 그룹의 줄 전체. */
function groupLines(agent: string): string[] {
  const block = text.split("\n\n").find((part) => part.split("\n").includes(`User-Agent: ${agent}`));
  return block ? block.split("\n") : [];
}

const allowed = (agent: string, path: string) => evaluate(selectRules(groups, agent), path).allowed;

describe("robots.txt 매개변수 주소 크롤 제외 (G1)", () => {
  it.each(SEARCH_BOTS)("새 세 줄이 검색 봇 그룹의 실제 robots.txt 줄로 나온다: %s", (agent) => {
    const lines = groupLines(agent);
    expect(lines, agent).toContain(`User-Agent: ${agent}`);
    expect(lines).toEqual(expect.arrayContaining(PARAM_LINES));
    expect(lines).toEqual(expect.arrayContaining(["Allow: /", "Allow: /_next/", "Allow: /api/og"]));
    // 너무 넓은 패턴(모든 경로의 ?tab=·?q=, 쿼리 전체, 가이드 전체) 금지.
    for (const wide of ["Disallow: /*?tab=", "Disallow: /*?", "Disallow: /*?q=", "Disallow: /guides", "Disallow: /en/guides", "Disallow: /_next/", "Disallow: /api/og"]) {
      expect(lines).not.toContain(wide);
    }
  });

  it.each(["Googlebot", "Yeti", "Bingbot", "Daum", "*", "SomeNewSearchBot"])("홈 탭·가이드 검색 변형만 막힌다: %s", (agent) => {
    for (const path of [
      "/?tab=salary",
      "/?tab=future&salary=50000000",
      "/?tab=severance&utm_source=embed&utm_medium=widget",
      "/guides?q=%EC%84%B8%EA%B8%88",
      "/en/guides?q=tax",
    ]) {
      expect(allowed(agent, path), `${agent} ${path}`).toBe(false);
    }
  });

  it.each(["Googlebot", "Googlebot-Image", "Yeti", "Bingbot", "Daum", "*", "SomeNewSearchBot"])("/, /_next/, /api/og 와 색인 페이지는 열려 있다: %s", (agent) => {
    for (const path of [
      "/",
      "/_next/static/chunks/main.js",
      "/_next/static/css/app.css",
      "/api/og",
      "/api/og?type=company&name=%EC%82%BC%EC%84%B1%EC%A0%84%EC%9E%90",
      "/?utm_source=pwa&utm_medium=homescreen",
      "/?utm_source=copy&utm_medium=share",
      "/guides",
      "/en/guides",
      "/guides/year-end-tax-guide-2026",
      "/guides/category/tax",
      "/guides?category=tax",
      "/en/guides/chip-stock-tax-guide",
      "/salary-db/samsung-electronics",
      "/calc/samsung-bonus",
      "/monthly/3000000",
    ]) {
      expect(allowed(agent, path), `${agent} ${path}`).toBe(true);
    }
  });

  it("기존 차단(/private/·/api/·/widget/·/adgk/)은 유지된다", () => {
    for (const path of ["/private/x", "/api/feedback", "/widget/severance", "/adgk/ag/g/c"]) {
      expect(allowed("Googlebot", path), path).toBe(false);
      expect(allowed("*", path), path).toBe(false);
    }
  });

  it.each(AD_BOTS)("광고 봇 그룹은 '/' 허용만 두고 새 줄을 받지 않는다: %s", (agent) => {
    const lines = groupLines(agent);
    expect(lines).toContain("Allow: /");
    expect(lines.filter((line) => line.startsWith("Disallow"))).toEqual([]);
    for (const path of ["/", "/?tab=salary", "/guides?q=tax", "/en/guides?q=tax", "/calc/samsung-bonus"]) {
      expect(allowed(agent, path), `${agent} ${path}`).toBe(true);
    }
  });

  it("광고 봇 그룹 객체는 그대로다", () => {
    const adGroup = ruleGroups.find((group) => [group.userAgent].flat().includes("Mediapartners-Google"));
    expect(adGroup).toEqual({ userAgent: AD_BOTS, allow: "/" });
  });
});
