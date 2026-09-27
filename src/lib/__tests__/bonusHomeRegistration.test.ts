// /calc/bonus-home-plan 등재 회귀 (2026-09-27) — 헤더 검색·관련 계산기·사이트맵·원장에만 등재하고,
// /calc 디렉터리·다른 페이지의 관련 계산기·가이드 역링크·성과급 허브(23종 문구)는 바꾸지 않는다.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getDedicatedCalculatorEntries, searchEntries, searchIndex } from "@/lib/searchIndex";
import { getRelatedCalculators } from "@/lib/relatedCalculators";
import { CALC_TO_GUIDES, STATIC_CALC_CARDS } from "@/lib/crossLink";
import { BONUS_CALCS } from "@/data/bonusCalcHub";

const HREF = "/calc/bonus-home-plan";
const APP_DIR = path.resolve(process.cwd(), "src/app");

function staticRoutes(dir = APP_DIR, segs: string[] = []): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith("_") || entry.name === "api" || entry.name.startsWith("[")) continue;
    const next = entry.name.startsWith("(") ? segs : [...segs, entry.name];
    out.push(...staticRoutes(path.join(dir, entry.name), next));
  }
  if (fs.existsSync(path.join(dir, "page.tsx"))) out.push(`/${segs.join("/")}`);
  return out;
}

describe("헤더 검색", () => {
  it("검색 인덱스에 한 번, 설계 문구 그대로", () => {
    const hits = searchIndex.filter((e) => e.href === HREF);
    expect(hits).toEqual([
      { title: "성과급 내 집 마련 계산기", href: HREF, category: "계산기", description: "삼성·SK 성과급 5년 누적 + 동탄·평택·이천 집값·DSR", priority: 1 },
    ]);
    expect(searchEntries("성과급 내 집")[0].href).toBe(HREF);
  });
  it("/calc 디렉터리 목록(getDedicatedCalculatorEntries)에는 넣지 않는다", () => {
    expect(getDedicatedCalculatorEntries().some((e) => e.href === HREF)).toBe(false);
  });
});

describe("관련 계산기", () => {
  it("이 페이지는 성과급 → 부동산 순서로 4개, 자기 자신 제외", () => {
    const got = getRelatedCalculators(HREF).map((i) => i.path);
    expect(got).toHaveLength(4);
    expect(got).not.toContain(HREF);
    expect(got[0]).toBe("/calc/bonus-calculators");
  });
  it("다른 어떤 페이지의 관련 계산기에도 새로 나타나지 않는다(카탈로그 무변경)", () => {
    const routes = staticRoutes();
    expect(routes.length).toBeGreaterThan(150);
    for (const r of routes) {
      if (r === HREF) continue;
      expect(getRelatedCalculators(r, 8).some((i) => i.path === HREF), r).toBe(false);
    }
  });
});

describe("가이드 역링크·성과급 허브", () => {
  it("STATIC_CALC_CARDS 카드만 두고 CALC_TO_GUIDES 매핑은 없다(가이드 페이지 무변경)", () => {
    expect(STATIC_CALC_CARDS["bonus-home-plan"]).toMatchObject({ slug: "bonus-home-plan", title: "성과급 내 집 마련 계산기" });
    expect(CALC_TO_GUIDES["bonus-home-plan"]).toBeUndefined();
  });
  it("성과급 허브 레지스트리(BONUS_CALCS — 사이트 전역 '23종' 문구)에 넣지 않는다", () => {
    expect(BONUS_CALCS.some((c) => `/calc/${c.slug}` === HREF)).toBe(false);
  });
});

describe("사이트맵·URL 원장", () => {
  it("정적 목록 + ROUTE_OVERRIDES(monthly) + 원장 기록", () => {
    const src = fs.readFileSync(path.join(APP_DIR, "sitemap.ts"), "utf8");
    expect(src.match(/'\/calc\/bonus-home-plan',/g)?.length).toBe(1);
    expect(src).toMatch(/'\/calc\/bonus-home-plan': \{ lastModified: new Date\('2026-09-27'\), changeFrequency: 'monthly' \}/);
    const ledger = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "scripts/url-ledger.snapshot.json"), "utf8"));
    expect(ledger.sitemap).toContain(HREF);
  });
});
