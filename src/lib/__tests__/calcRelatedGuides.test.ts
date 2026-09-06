// /calc 마지막 광고 아래 가이드 모듈 회귀 가드 (2026-09-06)
//
// 두 가지를 지킨다:
//  (1) 위치 — 모듈은 layout 의 <HomeTopAd /> **아래**여야 한다. 광고 위 UI 삽입은
//      2026-08-16 수익 급락 규칙에 저촉되고, ad-audit --diff 의 rule 7 은 diff 가
//      남아 있는 동안만 잡아 주므로 영구 가드가 따로 필요하다.
//  (2) 목록 정합 — CURATED_STATIC_CALC_SLUGS 가 파일시스템·CALC_TO_GUIDES·
//      simpleCalculators 셋과 어긋나면 링크가 조용히 사라지거나 /calc/[slug] 에서
//      RelatedGuides 가 두 번 렌더된다.
//
// jsdom 없음 — 소스 스캔 (adFillEvents.test.ts 와 같은 방식).

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CALC_TO_GUIDES } from "@/lib/crossLink";
import { getCalculatorBySlug } from "@/lib/simpleCalculators";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const LAYOUT = read("src/app/calc/layout.tsx");
const MODULE = read("src/app/calc/CalcRelatedGuides.tsx");
/** 주석 줄 제거 — 이 파일들의 주석은 규칙 자체를 인용하므로 그대로 스캔하면 오탐 */
const stripComments = (src: string) =>
  src
    .split("\n")
    .filter((l) => !/^\s*(\/\/|\/\*|\*|\{\s*\/\*)/.test(l))
    .join("\n");
const MODULE_CODE = stripComments(MODULE);

/** layout 의 CURATED_STATIC_CALC_SLUGS 리터럴을 파싱 */
const listed: string[] = (() => {
  const m = LAYOUT.match(/const CURATED_STATIC_CALC_SLUGS = \[([\s\S]*?)\] as const;/);
  if (!m) throw new Error("CURATED_STATIC_CALC_SLUGS 배열을 찾지 못함");
  return [...m[1].matchAll(/"([a-z0-9-]+)"/g)].map((x) => x[1]);
})();

/** 정적 /calc 라우트 폴더 (동적 [slug] 제외) */
const staticCalcRoutes = readdirSync(resolve(process.cwd(), "src/app/calc"), {
  withFileTypes: true,
})
  .filter(
    (d) =>
      d.isDirectory() &&
      d.name !== "[slug]" &&
      existsSync(resolve(process.cwd(), `src/app/calc/${d.name}/page.tsx`)),
  )
  .map((d) => d.name);

describe("/calc 가이드 모듈 — 광고 아래 위치", () => {
  it("layout 에서 CalcRelatedGuides 가 HomeTopAd 뒤에 온다", () => {
    const ad = LAYOUT.indexOf("<HomeTopAd />");
    const mod = LAYOUT.indexOf("<CalcRelatedGuides");
    expect(ad, "layout 에 HomeTopAd 없음").toBeGreaterThan(-1);
    expect(mod, "layout 에 CalcRelatedGuides 없음").toBeGreaterThan(-1);
    expect(mod, "가이드 모듈이 광고 위에 있다 — 광고 위 UI 삽입 금지").toBeGreaterThan(ad);
  });

  it("모듈은 광고 컴포넌트를 직접 렌더하지 않는다", () => {
    expect(MODULE_CODE).not.toMatch(
      /<(HomeTopAd|CalcResultAd|GuideMidAd|InArticleAd|SidebarAd|MultiplexAd|Display2Ad|PageFooterAds|CoupangBanner)\b/,
    );
  });

  it("모듈은 pathname 으로만 고르고 2중 집계를 만들지 않는다", () => {
    expect(MODULE_CODE).toContain("usePathname");
    // RelatedGuides 는 자체 onClick(trackGuideCTAClick) 을 가진 SELF_TRACKED 모듈
    expect(MODULE_CODE).not.toContain("data-msy-module");
  });
});

describe("/calc 가이드 모듈 — 목록 정합", () => {
  it("모든 항목이 실재하는 정적 /calc 라우트다", () => {
    for (const slug of listed) {
      expect(staticCalcRoutes, `${slug}: src/app/calc/${slug}/page.tsx 없음`).toContain(slug);
    }
  });

  it("모든 항목이 CALC_TO_GUIDES 큐레이션을 갖는다", () => {
    for (const slug of listed) {
      expect(CALC_TO_GUIDES[slug]?.length, `${slug}: 큐레이션 가이드 0`).toBeGreaterThan(0);
    }
  });

  it("simpleCalculators(동적 /calc/[slug]) 와 겹치지 않는다 — 2중 렌더 방지", () => {
    for (const slug of listed) {
      expect(getCalculatorBySlug(slug), `${slug}: /calc/[slug] 가 이미 RelatedGuides 렌더`).toBeUndefined();
    }
  });

  it("자격을 갖춘 정적 라우트가 누락되지 않았다", () => {
    const eligible = staticCalcRoutes.filter(
      (s) => (CALC_TO_GUIDES[s]?.length ?? 0) > 0 && !getCalculatorBySlug(s),
    );
    expect([...listed].sort()).toEqual([...eligible].sort());
  });

  it("자기 자신을 가리키는 가이드가 없고 중복도 없다", () => {
    for (const slug of listed) {
      const g = CALC_TO_GUIDES[slug];
      expect(new Set(g).size, `${slug}: 중복 가이드 slug`).toBe(g.length);
    }
    expect(new Set(listed).size).toBe(listed.length);
  });
});
