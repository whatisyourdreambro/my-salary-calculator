// 서버 컴포넌트 링크 모듈 클릭 계측 회귀 가드 (2026-09-05, 10배 계획 retention-pv-6)
//
// 배경: RelatedCompanies·CompanyIndustryRank 등 회사·직업 페이지 링크 모듈은 서버 컴포넌트라
// onClick 이 없어 guide_cta_click 이 0건이었다. 루트 레이아웃의 InternalLinkTracker 가
// document 클릭 위임으로 [data-msy-module] 안의 내부 링크를 기존 guide_cta_click(position=모듈)
// 으로 보낸다. 모듈 속성이 빠지거나 새 이벤트명이 생기면(9/7 'position' 측정기준 밖) 계측이 끊기므로
// 소스를 스캔한다 (adFillEvents.test.ts 와 같은 방식 — jsdom 없음).

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

/** 모듈 파일 → 기대 data-msy-module id (≤15종 유지 — GA4 position 측정기준 카디널리티) */
const MODULES: Record<string, string[]> = {
  "src/components/CompanyIndustryRank.tsx": ["industry-rank"],
  "src/components/RelatedCompanies.tsx": ["related-companies"],
  "src/components/CompanyConnections.tsx": ["company-connections"],
  "src/components/BonusClusterLinks.tsx": ["bonus-cluster"],
  "src/components/YearEndTaxCluster.tsx": ["year-end-cluster"],
  "src/components/SiblingHubsNav.tsx": ["sibling-hubs"],
  "src/components/ListedSalaryBandTable.tsx": ["listed-band"],
  "src/app/job/[slug]/page.tsx": [
    "job-related-calc",
    "job-companies",
    "job-pay-table",
    "job-siblings",
  ],
};

/** 이미 onClick 으로 guide_cta_click 을 직접 보내는 모듈 — 속성을 주면 2중 집계 */
const SELF_TRACKED = [
  "src/components/RelatedCalculators.tsx",
  "src/components/NextActions.tsx",
  "src/components/RelatedGuides.tsx",
  "src/app/calc/samsung-bonus/shared.tsx",
];

const MAX_MODULE_IDS = 15;
const ATTR_RE = /data-msy-module="([a-z0-9-]+)"/g;

describe("내부 링크 모듈 계측", () => {
  it("각 링크 모듈 파일이 기대한 data-msy-module id 를 가진다", () => {
    for (const [file, ids] of Object.entries(MODULES)) {
      const src = read(file);
      for (const id of ids) {
        expect(src, `${file} 에 data-msy-module="${id}" 가 없음`).toContain(
          `data-msy-module="${id}"`,
        );
      }
    }
  });

  it("모듈 id 총 종류가 15개 이하이고 서로 겹치지 않는다", () => {
    const all: string[] = [];
    for (const file of Object.keys(MODULES)) {
      for (const m of read(file).matchAll(ATTR_RE)) all.push(m[1]);
    }
    const distinct = new Set(all);
    expect(distinct.size).toBeLessThanOrEqual(MAX_MODULE_IDS);
    // 같은 id 가 두 파일에 있으면 모듈 귀속이 섞인다
    expect(all.length).toBe(distinct.size);
    // 선언된 기대값과 실제 스캔값이 일치 (누락·초과 없음)
    expect([...distinct].sort()).toEqual(Object.values(MODULES).flat().sort());
  });

  it("이미 onClick 계측 중인 모듈에는 data-msy-module 이 없다 (2중 집계 방지)", () => {
    for (const file of SELF_TRACKED) {
      const src = read(file);
      expect(src).toContain("trackGuideCTAClick(");
      expect(src, `${file} 은 data-msy-module 을 가지면 안 됨`).not.toContain(
        "data-msy-module",
      );
    }
  });

  it("InternalLinkTracker 는 루트 레이아웃에 마운트되고 기존 guide_cta_click 만 재사용한다", () => {
    const layout = read("src/app/layout.tsx");
    expect(layout).toContain('import InternalLinkTracker from "@/components/InternalLinkTracker";');
    expect(layout).toContain("<InternalLinkTracker />");

    const tracker = read("src/components/InternalLinkTracker.tsx");
    expect(tracker.startsWith('"use client";')).toBe(true);
    expect(tracker).toContain('document.addEventListener("click", onClick)');
    expect(tracker).toContain('document.removeEventListener("click", onClick)');
    expect(tracker).toContain('href.startsWith("/")');
    expect(tracker).toContain("trackInternalLinkClick(");
    // 새 이벤트명 금지 — position 측정기준(9/7 등록)으로 분해되도록 guide_cta_click 유지
    expect(tracker).not.toContain("trackEvent(");
    expect(tracker).not.toContain("internal_link_click");

    const analytics = read("src/lib/analytics.ts");
    const fnIdx = analytics.indexOf("export function trackInternalLinkClick(");
    expect(fnIdx).toBeGreaterThan(-1);
    expect(analytics.slice(fnIdx, fnIdx + 200)).toContain("trackGuideCTAClick(href, moduleId)");
    expect(analytics).not.toContain("internal_link_click");
  });
});
