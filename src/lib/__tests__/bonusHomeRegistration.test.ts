// /calc/bonus-home-plan 등재 회귀 (2026-09-27) — 헤더 검색·관련 계산기·사이트맵·원장에만 등재하고,
// /calc 디렉터리·다른 페이지의 관련 계산기·가이드 역링크·성과급 허브(23종 문구)는 바꾸지 않는다.
// 예외 1건(2026-09-28, S18): 성과급 허브(/calc/bonus-calculators)의 마지막 광고 아래 정적 링크 한 줄 —
// calc/layout.tsx 맨 끝의 CalcAfterAdsLink 가 렌더한다. 허브 레지스트리(BONUS_CALCS, '23종')는 그대로다.
import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { getDedicatedCalculatorEntries, searchEntries, searchIndex } from "@/lib/searchIndex";
import { getRelatedCalculators } from "@/lib/relatedCalculators";
import { CALC_TO_GUIDES, STATIC_CALC_CARDS } from "@/lib/crossLink";
import { BONUS_CALCS } from "@/data/bonusCalcHub";
import CalcAfterAdsLink, { CALC_AFTER_ADS_LINKS, calcAfterAdsLinkFor } from "@/components/CalcAfterAdsLink";

const nav = vi.hoisted(() => ({ pathname: null as string | null }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));

const HREF = "/calc/bonus-home-plan";
const HUB = "/calc/bonus-calculators";
const ROOT = process.cwd();
const APP_DIR = path.resolve(ROOT, "src/app");

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

// S18(2026-09-28): 사이트맵에만 있고 크롤 가능한 내부 링크가 0개이던 문제 — 허브 광고 아래 한 줄로만 푼다.
describe("성과급 허브 마지막 광고 아래 정적 링크(S18)", () => {
  const render = (pathname: string | null) => {
    nav.pathname = pathname;
    return renderToStaticMarkup(createElement(CalcAfterAdsLink));
  };

  it("링크 출처는 성과급 허브 한 곳뿐", () => {
    const sources = [...CALC_AFTER_ADS_LINKS].filter(([, item]) => item.href === HREF).map(([from]) => from);
    expect(sources).toEqual([HUB]);
  });

  it("허브 서버 HTML 에 <a href> 로 들어간다(끝 슬래시도 같은 결과)", () => {
    const html = render(HUB);
    expect(html).toContain(`href="${HREF}"`);
    expect(html).toContain(">성과급 내 집 마련 계산기</a>");
    expect(html).toContain('data-msy-module="calc-after-ads"');
    expect(html.match(/<a /g)).toHaveLength(1);
    expect(render(`${HUB}/`)).toBe(html);
  });

  it("다른 경로에서는 아무것도 렌더하지 않는다", () => {
    for (const p of [HREF, "/calc", "/calc/samsung-bonus", "/calc/sk-hynix-bonus", "/calc/bonus-calculators-x", "/", null]) {
      expect(render(p), String(p)).toBe("");
      expect(calcAfterAdsLinkFor(p), String(p)).toBeNull();
    }
  });

  it("calc/layout.tsx 맨 끝(광고 블록·공유 fallback 뒤)에서만 렌더하고, 허브 page.tsx 에는 링크를 두지 않는다", () => {
    const layout = fs.readFileSync(path.join(APP_DIR, "calc/layout.tsx"), "utf8");
    const at = layout.indexOf("<CalcAfterAdsLink />");
    expect(at).toBeGreaterThan(-1);
    expect(layout.indexOf("<CalcAfterAdsLink", at + 1)).toBe(-1);
    for (const tag of ["<InArticleAd", "<CoupangBanner", "<HomeTopAd", "<AutoShareSection", "<FloatingShareBar"]) {
      expect(layout.lastIndexOf(tag), tag).toBeGreaterThan(-1);
      expect(layout.lastIndexOf(tag), tag).toBeLessThan(at);
    }
    // 뒤따르는 JSX 형제 없음 — 기존 요소의 자동광고 CSS 경로(nth-child) 불변
    expect(layout.slice(at + "<CalcAfterAdsLink />".length).replace(/\s+/g, "")).toBe("</>);}");
    const hub = fs.readFileSync(path.join(APP_DIR, "calc/bonus-calculators/page.tsx"), "utf8");
    expect(hub).not.toContain(HREF);
  });

  it("렌더되는 소스 중 이 URL 을 담은 파일은 사이트맵과 CalcAfterAdsLink 뿐(자기 라우트·테스트 제외)", () => {
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const abs = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === "__tests__" || abs === path.join(APP_DIR, "calc/bonus-home-plan")) continue;
          walk(abs);
        } else if (/\.(tsx?|json|md)$/.test(entry.name) && fs.readFileSync(abs, "utf8").includes(HREF)) {
          hits.push(path.relative(ROOT, abs).split(path.sep).join("/"));
        }
      }
    };
    for (const d of ["src/app", "src/components", "src/data", "src/config", "src/lib/guides"]) walk(path.resolve(ROOT, d));
    expect(hits.sort()).toEqual(["src/app/sitemap.ts", "src/components/CalcAfterAdsLink.tsx"]);
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
