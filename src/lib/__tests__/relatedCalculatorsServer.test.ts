// 2026-11-15 N2-perf-02 (lens-perf-F10) — RelatedCalculators 서버 컴포넌트 전환 가드.
// 예전에는 "use client" 라 이 컴포넌트를 그리는 서버 파일 90여 곳의 라우트에서도 컴포넌트·추천 목록·아이콘 JS 를 내려받아 하이드레이션했다.
// 지금은 훅·onClick 이 없고, 클릭은 section 의 모듈 속성(related-calc)을 루트 InternalLinkTracker 가 위임으로 잡는다.
// (1) 소스: 클라이언트 지시어·훅·직접 계측이 다시 들어오지 않는다.
// (2) 이벤트 동치: 위임 경로(trackInternalLinkClick)가 예전 onClick(trackGuideCTAClick + destTemplate)과 같은 guide_cta_click 을 보낸다.
// (3) 마크업: 서버 HTML 은 section 의 속성 하나 말고 예전과 같다(전환 때 예전 소스와 1:1 비교 통과, 여기서는 구조를 고정).
// (4) 경로를 모르는 래퍼 RelatedCalculatorsAuto 는 tools/layout 한 곳에서만 쓴다.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

// 합성 방문자로 이벤트 페이로드만 비교한다(실제 차단 판정은 liveAds.test.ts 몫). 네트워크 요청 없음.
vi.mock("@/lib/liveAds", () => ({ canRequestLiveAds: () => true }));

import RelatedCalculators from "@/components/RelatedCalculators";
import { destTemplate, trackGuideCTAClick, trackInternalLinkClick } from "@/lib/analytics";
import { CATEGORY_RECOMMENDATIONS, getRelatedCalculators } from "@/lib/relatedCalculators";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8").replace(/\r\n/g, "\n");
const stripComments = (src: string) =>
  src.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

afterEach(() => vi.unstubAllGlobals());

describe("RelatedCalculators 는 서버 컴포넌트다", () => {
  const code = stripComments(read("src/components/RelatedCalculators.tsx"));

  it("클라이언트 지시어·usePathname·onClick·직접 계측이 없다", () => {
    expect(code).not.toMatch(/["']use client["']/);
    expect(code).not.toContain("usePathname");
    expect(code).not.toContain("next/navigation");
    expect(code).not.toMatch(/\bon[A-Z][a-zA-Z]*=/);
    expect(code).not.toContain("trackGuideCTAClick");
    expect(code).not.toContain("@/lib/analytics");
    expect(code).toMatch(/\bcurrentPath: string;/);
  });

  it("모듈 속성 related-calc 은 section 에 정확히 하나", () => {
    expect(code.match(/data-msy-module="related-calc"/g)).toHaveLength(1);
    expect(code).toContain('<section data-msy-module="related-calc" className={`my-12 ${className}`}>');
    expect(code.match(/data-msy-module=/g)).toHaveLength(1);
  });
});

describe("위임 계측은 예전 onClick 과 같은 guide_cta_click 을 보낸다", () => {
  function capture(fn: () => void) {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag, location: { href: "https://www.moneysalary.com/salary-db/samsung-electronics" } });
    vi.stubGlobal("location", { pathname: "/salary-db/samsung-electronics" });
    vi.stubGlobal("document", { referrer: "" });
    fn();
    vi.unstubAllGlobals();
    return gtag.mock.calls;
  }

  it("추천 목록의 목적지 템플릿마다 한 경로씩 — 이벤트명·slug·position·dest_tpl·page_path 동일", () => {
    const byTemplate = new Map<string, string>();
    for (const list of Object.values(CATEGORY_RECOMMENDATIONS)) {
      for (const item of list) if (!byTemplate.has(destTemplate(item.path))) byTemplate.set(destTemplate(item.path), item.path);
    }
    expect(byTemplate.size).toBeGreaterThanOrEqual(3);
    for (const path of byTemplate.values()) {
      const delegated = capture(() => trackInternalLinkClick(path, "related-calc"));
      const direct = capture(() => trackGuideCTAClick(path, "related-calc", undefined, destTemplate(path)));
      expect(delegated, path).toHaveLength(1);
      expect(delegated, path).toEqual(direct);
      expect(delegated[0][1]).toBe("guide_cta_click");
      expect(delegated[0][2]).toMatchObject({ position: "related-calc", dest_tpl: destTemplate(path) });
    }
  });
});

describe("서버 HTML 구조", () => {
  it("/salary-db/samsung-electronics: section 속성 하나 + 예전과 같은 카드 4개", () => {
    const path = "/salary-db/samsung-electronics";
    const html = renderToStaticMarkup(createElement(RelatedCalculators, { currentPath: path }));
    const items = getRelatedCalculators(path, 4);
    expect(items).toHaveLength(4);
    expect(html.startsWith('<section data-msy-module="related-calc" class="my-12 "><h2 class="text-lg font-black text-navy mb-4 px-1">이런 계산기도 함께 보세요</h2><div class="grid grid-cols-2 md:grid-cols-4 gap-3">')).toBe(true);
    expect(html.match(/data-msy-module=/g)).toHaveLength(1);
    expect([...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1])).toEqual(items.map((i) => i.path));
    expect(html.match(/class="group flex flex-col gap-2 p-4 rounded-2xl bg-white border border-canvas-200 hover:border-electric hover:bg-electric-5 transition-all"/g)).toHaveLength(4);
    expect(html).not.toMatch(/onclick/i);
  });

  it("추천이 없으면 예전처럼 아무것도 그리지 않는다 (속성만 남는 빈 section 없음)", () => {
    const html = renderToStaticMarkup(createElement(RelatedCalculators, { currentPath: "/", limit: 0 }));
    expect(html).toBe("");
  });
});

describe("RelatedCalculatorsAuto 는 tools/layout 한 곳에서만", () => {
  it("usePathname 래퍼를 가져오는 파일은 src/app/tools/layout.tsx 뿐", () => {
    const users: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) {
          if (name !== "__tests__") walk(full);
        } else if (/\.(tsx?|mts)$/.test(name) && /from ["'][^"']*\/RelatedCalculatorsAuto["']/.test(readFileSync(full, "utf8"))) {
          users.push(full.replace(/\\/g, "/").replace(/^.*?\/src\//, "src/"));
        }
      }
    };
    walk(resolve(process.cwd(), "src"));
    expect(users.sort()).toEqual(["src/app/tools/layout.tsx"]);
    // 레이아웃은 래퍼를 같은 이름으로 가져와 광고 사이 JSX 줄(<RelatedCalculators />)을 bda78b0da 그대로 둔다
    const layout = read("src/app/tools/layout.tsx");
    expect(layout).toContain('import RelatedCalculators from "@/components/RelatedCalculatorsAuto";');
    expect(layout).not.toContain('from "@/components/RelatedCalculators";');
    expect(layout).toMatch(/<InArticleAd \/>\s*<\/div>\s*<RelatedCalculators \/>\s*<div className="my-6">\s*<CoupangBanner/);
    const auto = read("src/components/RelatedCalculatorsAuto.tsx");
    expect(auto).toContain('"use client";');
    expect(auto).toContain('<RelatedCalculators currentPath={pathname || "/"} />');
  });
});
