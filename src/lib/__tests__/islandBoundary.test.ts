// 섬 오류 경계 게이트 (2026-09-25 감사 B3 · CLIENT-01):
//  1) 정상일 때는 DOM 을 추가하지 않는다(children 그대로) — 광고 오프셋 불변.
//  2) 오류 뒤에는 fallback 만 그린다(자리 크기 className 유지, 단독 경로는 전체 로드 <a>).
//  3) 홈에서 감싸는 곳은 월급 시계·대출/적금 계산기뿐(회사 로드맵 차트는 companyRoadmapDefer.test.ts).
//     광고 컴포넌트와 광고를 품은 CalculatorTabs(ResultAd 포함, 승인 A14 대기)는 감싸지 않는다.
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import IslandBoundary, { IslandFallback } from "@/components/IslandBoundary";

const read = (p: string) => readFileSync(path.resolve(process.cwd(), p), "utf8");

describe("IslandBoundary", () => {
  it("renders children unchanged (no wrapper element)", () => {
    const html = renderToStaticMarkup(
      createElement(IslandBoundary, { name: "t", fallback: createElement("p", null, "fallback") }, createElement("span", { id: "island" }, "ok")),
    );
    expect(html).toBe('<span id="island">ok</span>');
  });

  it("switches to the fallback after an error and only then", () => {
    const fallback = createElement("p", null, "fallback");
    const child = createElement("span", null, "child");
    const boundary = new IslandBoundary({ name: "t", fallback, children: child });
    expect(boundary.render()).toBe(child);
    boundary.state = IslandBoundary.getDerivedStateFromError();
    expect(boundary.state).toEqual({ failed: true });
    expect(boundary.render()).toBe(fallback);
  });

  it("IslandFallback keeps the slot class and links with a full-load anchor", () => {
    const html = renderToStaticMarkup(createElement(IslandFallback, {
      className: "min-h-[560px]", message: "불러오지 못했습니다.", href: "/tools/loan", linkLabel: "대출 이자 계산기 페이지에서 계산하기",
    }));
    expect(html).toContain('class="min-h-[560px]"');
    expect(html).toContain('role="status"');
    expect(html).toContain('<a href="/tools/loan"');
    expect(html).toContain("불러오지 못했습니다.");
  });

  it("IslandFallback without a link renders text only (company chart)", () => {
    const html = renderToStaticMarkup(createElement(IslandFallback, { className: "h-full", message: "차트를 불러오지 못했습니다." }));
    expect(html).not.toContain("<a ");
  });
});

/** 광고 컴포넌트 또는 광고를 품은 트리 */
const AD_COMPONENT = /<(CalcResultAd|InArticleAd|HomeTopAd|GuideMidAd|Display2Ad|MultiplexAd|PageFooterAds|CoupangBanner|AdPlacement|ResultAd|CalculatorTabs)\b/;

/** 각 <IslandBoundary ...>...</IslandBoundary> 블록의 본문을 뽑는다. */
const boundaryBlocks = (src: string) => {
  const blocks: string[] = [];
  for (const m of src.matchAll(/<IslandBoundary\b[\s\S]*?<\/IslandBoundary>/g)) blocks.push(m[0]);
  return blocks;
};

describe("IslandBoundary placement on the home page (ad-safe)", () => {
  const wrapped: Record<string, { island: RegExp; href: string }> = {
    "src/components/home/HomeWorkClockSection.tsx": { island: /<WorkClockClient mode="home" \/>/, href: 'href="/work-clock"' },
    "src/components/home/DeferredHomeCalculator.tsx": { island: /<Component \/>/, href: "href={href}" },
  };

  for (const [file, { island, href }] of Object.entries(wrapped)) {
    it(`${file}: wraps only its island, never an ad`, () => {
      const blocks = boundaryBlocks(read(file));
      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toMatch(island);
      expect(blocks[0]).not.toMatch(AD_COMPONENT);
      expect(blocks[0]).toContain(href);
    });
  }

  it("HomeClient (CalculatorTabs with ResultAd) and SalaryCalculator are not wrapped (A14 pending)", () => {
    for (const file of ["src/app/HomeClient.tsx", "src/components/CalculatorTabs.tsx", "src/components/SalaryCalculator.tsx"]) {
      expect(read(file), file).not.toContain("IslandBoundary");
    }
  });
});
