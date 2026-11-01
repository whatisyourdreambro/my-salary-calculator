// robots.txt 크롤 규칙 회귀 테스트 (G1, 2026-11-01 · 통합 수정 2026-11-02).
// Next 가 /robots.txt 를 쓸 때 쓰는 직렬화기로 실제 본문을 만들고, 저장소의 robots 판정기
// (scripts/trend-radar — 최장 일치·동률 Allow·와일드카드)로 경로마다 허용 여부를 확인한다.
// 홈 탭 주소(/?tab=)와 가이드 검색(/guides?q=·/en/guides?q=)은 구글 크롤러 그룹에서만 빠진다
// (운영자 승인 2026-11-01 구글 개선 1번 '구글 크롤에서 빼기'). 네이버(유입의 대부분)·Bing·Daum·
// DuckDuckBot·Applebot·* 그룹 줄은 G1 이전과 같고, 광고 봇 그룹과 /, /_next/, /api/og, 색인 페이지는
// 그대로 열려 있어야 한다.
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
// 검색 봇 그룹이 함께 쓰는 줄(G1 이전 corePathAllow + corePathDisallow 그대로).
const CORE_RULE_LINES = [
  "Allow: /",
  "Allow: /_next/",
  "Allow: /api/og",
  "Disallow: /private/",
  "Disallow: /api/",
  "Disallow: /widget/",
  "Disallow: /adgk/",
];
const GOOGLE_BOTS = ["Googlebot", "Googlebot-Image", "Googlebot-News"];
// 승인 범위 밖 — 세 줄을 받지 않는다.
const OTHER_SEARCH_BOTS = ["Bingbot", "NaverBot", "Yeti", "Daum", "DuckDuckBot", "Applebot", "*"];
const AD_BOTS = ["AdsBot-Google", "AdsBot-Google-Mobile", "Mediapartners-Google"];
const PARAM_PATHS = [
  "/?tab=salary",
  "/?tab=future&salary=50000000",
  "/?tab=severance&utm_source=embed&utm_medium=widget",
  "/guides?q=%EC%84%B8%EA%B8%88",
  "/en/guides?q=tax",
];
// 너무 넓은 패턴(모든 경로의 ?tab=·?q=, 쿼리 전체, 가이드 전체)과 렌더링 필수 경로 차단 금지.
const WIDE_LINES = ["Disallow: /*?tab=", "Disallow: /*?", "Disallow: /*?q=", "Disallow: /guides", "Disallow: /en/guides", "Disallow: /_next/", "Disallow: /api/og", "Disallow: /"];

/** robots.txt 본문에서 그 User-Agent 줄이 속한 그룹의 줄 전체. */
function groupLines(agent: string): string[] {
  const block = text.split("\n\n").find((part) => part.split("\n").includes(`User-Agent: ${agent}`));
  return block ? block.split("\n") : [];
}

const allowed = (agent: string, path: string) => evaluate(selectRules(groups, agent), path).allowed;

describe("robots.txt 매개변수 주소 크롤 제외 — 구글 그룹 전용 (G1)", () => {
  it.each(GOOGLE_BOTS)("구글 그룹에는 /adgk/ 와 새 세 줄이 실제 robots.txt 줄로 나온다: %s", (agent) => {
    const lines = groupLines(agent);
    expect(lines, agent).toContain(`User-Agent: ${agent}`);
    expect(lines).toContain("Disallow: /adgk/");
    expect(lines).toEqual(expect.arrayContaining(PARAM_LINES));
    expect(lines).toEqual(expect.arrayContaining(["Allow: /", "Allow: /_next/", "Allow: /api/og"]));
    for (const wide of WIDE_LINES) expect(lines).not.toContain(wide);
  });

  it.each(OTHER_SEARCH_BOTS)("네이버·Bing·Daum·DuckDuckBot·Applebot·* 그룹은 /adgk/ 만 두고 세 줄을 받지 않는다: %s", (agent) => {
    const lines = groupLines(agent);
    expect(lines, agent).toContain(`User-Agent: ${agent}`);
    expect(lines).toContain("Disallow: /adgk/");
    for (const line of PARAM_LINES) expect(lines, `${agent} ${line}`).not.toContain(line);
    for (const wide of WIDE_LINES) expect(lines).not.toContain(wide);
  });

  it("그룹 줄 전체: 구글 그룹만 세 줄이 더해지고 나머지 검색 봇 그룹은 G1 이전과 같다", () => {
    expect(groupLines("Googlebot")).toEqual([
      "User-Agent: Googlebot",
      "User-Agent: Googlebot-Image",
      "User-Agent: Googlebot-News",
      ...CORE_RULE_LINES,
      ...PARAM_LINES,
    ]);
    expect(groupLines("DuckDuckBot")).toEqual(["User-Agent: DuckDuckBot", "User-Agent: Applebot", ...CORE_RULE_LINES]);
    expect(groupLines("Bingbot")).toEqual(["User-Agent: Bingbot", ...CORE_RULE_LINES, "Crawl-delay: 10"]);
    expect(groupLines("Yeti")).toEqual(["User-Agent: NaverBot", "User-Agent: Yeti", "User-Agent: Daum", ...CORE_RULE_LINES, "Crawl-delay: 5"]);
    expect(groupLines("*")).toEqual(["User-Agent: *", ...CORE_RULE_LINES, "Crawl-delay: 10"]);
  });

  it.each(GOOGLE_BOTS)("구글 크롤러에게는 홈 탭·가이드 검색 변형이 막힌다: %s", (agent) => {
    for (const path of PARAM_PATHS) {
      expect(allowed(agent, path), `${agent} ${path}`).toBe(false);
    }
  });

  it.each([...OTHER_SEARCH_BOTS, "SomeNewSearchBot"])("다른 검색 봇에게는 홈 탭·가이드 검색 변형이 G1 이전처럼 열려 있다: %s", (agent) => {
    for (const path of PARAM_PATHS) {
      expect(allowed(agent, path), `${agent} ${path}`).toBe(true);
    }
  });

  it.each([...GOOGLE_BOTS, ...OTHER_SEARCH_BOTS, "SomeNewSearchBot"])("/, /_next/, /api/og 와 색인 페이지는 열려 있다: %s", (agent) => {
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

  it.each([...GOOGLE_BOTS, ...OTHER_SEARCH_BOTS])("기존 차단(/private/·/api/·/widget/·/adgk/)은 유지된다: %s", (agent) => {
    for (const path of ["/private/x", "/api/feedback", "/widget/severance", "/adgk/ag/g/c"]) {
      expect(allowed(agent, path), `${agent} ${path}`).toBe(false);
    }
  });

  it.each(AD_BOTS)("광고 봇 그룹은 '/' 허용만 두고 새 줄을 받지 않는다: %s", (agent) => {
    const lines = groupLines(agent);
    expect(lines).toEqual([...AD_BOTS.map((bot) => `User-Agent: ${bot}`), "Allow: /"]);
    for (const path of ["/", "/?tab=salary", "/guides?q=tax", "/en/guides?q=tax", "/calc/samsung-bonus", "/adgk/ag/g/c"]) {
      expect(allowed(agent, path), `${agent} ${path}`).toBe(true);
    }
  });

  it("광고 봇 그룹 객체는 그대로다", () => {
    const adGroup = ruleGroups.find((group) => [group.userAgent].flat().includes("Mediapartners-Google"));
    expect(adGroup).toEqual({ userAgent: AD_BOTS, allow: "/" });
  });
});
