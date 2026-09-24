// 회사 페이지 로드맵 차트 지연 마운트 게이트 (2026-09-25 감사 B3 · PERF-03 · CLIENT-01):
//  - recharts 차트는 첫 광고(CalcResultAd) 아래 고정 h-[300px] 박스 안에서만, 뷰포트 근처에서 마운트.
//  - 박스 크기·pulse 자리표시·dynamic import 유지, framer 재도입 금지(salary-db motion 금지).
//  - 오류 경계는 차트 하나만 감싸고 광고는 감싸지 않는다. 대체 화면은 문구만.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const src = readFileSync(path.resolve(process.cwd(), "src/app/salary-db/[id]/CompanyDetailClient.tsx"), "utf8");

const AD_COMPONENT = /<(CalcResultAd|InArticleAd|HomeTopAd|GuideMidAd|Display2Ad|MultiplexAd|PageFooterAds|CoupangBanner|AdPlacement|ResultAd)\b/;

describe("CompanyDetailClient roadmap chart", () => {
  it("keeps the fixed 300px box, the pulse placeholder and the dynamic import", () => {
    expect(src).toContain('<div ref={box} className="h-[300px] w-full">');
    expect(src).toContain("animate-pulse");
    expect(src).toContain('dynamic(() => import("./SalaryRoadmapChart")');
    expect(src).toMatch(/ssr: false/);
    expect(src).not.toMatch(/framer-motion|from "motion/);
  });

  it("mounts the chart only after the near-viewport gate fires", () => {
    expect(src).toContain("watchNearViewport(box.current, () => setNear(true))");
    expect(src).toMatch(/\{near \? \(/);
    expect(src).toContain(") : <ChartPulse />}");
  });

  it("wraps only the chart in one IslandBoundary with a text-only fallback", () => {
    const blocks = [...src.matchAll(/<IslandBoundary\b[\s\S]*?<\/IslandBoundary>/g)].map((m) => m[0]);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toContain("<SalaryRoadmapChart data={data} />");
    expect(blocks[0]).not.toMatch(AD_COMPONENT);
    expect(blocks[0]).not.toContain("href=");
  });

  it("the chart stays below the first ad (no new UI above CalcResultAd)", () => {
    const ad = src.indexOf("<CalcResultAd />");
    expect(ad).toBeGreaterThan(0);
    expect(ad).toBeLessThan(src.indexOf("<DeferredRoadmapChart data={salaryData} />"));
    expect(src.match(/<CalcResultAd \/>/g)).toHaveLength(1);
  });
});
