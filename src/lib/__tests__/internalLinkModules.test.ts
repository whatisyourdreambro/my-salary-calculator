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

/** 모듈 파일 → 기대 data-msy-module id (≤30종 — GA4 position 측정기준 카디널리티, 아래 MAX_MODULE_IDS 주석) */
const MODULES: Record<string, string[]> = {
  "src/components/CompanyIndustryRank.tsx": ["industry-rank"],
  "src/components/RelatedCompanies.tsx": ["related-companies"],
  "src/components/CompanyConnections.tsx": ["company-connections"],
  "src/components/BonusClusterLinks.tsx": ["bonus-cluster"],
  "src/components/YearEndTaxCluster.tsx": ["year-end-cluster"],
  "src/components/SiblingHubsNav.tsx": ["sibling-hubs"],
  "src/components/ListedSalaryBandTable.tsx": ["listed-band"],
  // 2026-09-11 S1-0/S1-2: 계산기 결과 핀·성과급 22쪽 결과 직하(광고 아래) 링크
  "src/components/SimpleCalculatorView.tsx": ["calc-next-pins"],
  "src/components/BonusNextLinks.tsx": ["bonus-next-links"],
  // 2026-09-12 S2-2: 회사 표 '연 실수령' 셀 → /salary 리포트 hop (행당 1, 높이 0)
  "src/components/CompanySalaryTable.tsx": ["company-salary-net"],
  "src/app/job/[slug]/page.tsx": [
    "job-related-calc",
    "job-companies",
    "job-pay-table",
    "job-siblings",
  ],
  // 2026-09-25 B19(e) — 리포트 P1 '삼성 계산기·성과급 모음·기업 연봉 후속 링크 계측 확인'에서
  // 추적이 없던 후속 링크 모듈(속성만 추가, 높이·마크업 무변경)
  "src/app/calc/samsung-bonus/page.tsx": ["samsung-related"],
  "src/app/calc/bonus-calculators/page.tsx": [
    "bonus-hub-calcs",
    "bonus-hub-calendar",
    "bonus-hub-news",
    "bonus-hub-tools",
  ],
  "src/components/CompanyBonusCalculatorLink.tsx": ["company-bonus-calc"],
  "src/components/CompanyDisclosedSalary.tsx": ["company-disclosed"],
  "src/components/CompanySalaryGroupNotice.tsx": ["company-group-peers"],
  "src/components/CompanyNarrative.tsx": ["company-narrative"],
  "src/components/CompanyInsights.tsx": ["company-insights"],
  "src/components/CompanyFaq.tsx": ["company-faq"],
  "src/app/salary-db/[id]/CompanyDetailClient.tsx": ["company-savings-goal"],
};

/**
 * 리포트 P1 대상 3개 화면의 '후속 링크' 파일 전부 — 각 파일은 data-msy-module(위임 계측) 또는
 * trackGuideCTAClick(직접 계측) 중 정확히 하나로 클릭이 잡혀야 한다. 새 링크 모듈을 이 화면에
 * 추가하면 여기에도 등재할 것.
 */
const P1_FOLLOW_UP_FILES: Record<string, string[]> = {
  "/calc/samsung-bonus": [
    "src/app/calc/samsung-bonus/page.tsx",
    "src/app/calc/samsung-bonus/shared.tsx", // ResultNextLinks — onClick 직접 계측
    "src/components/RelatedCalculators.tsx",
  ],
  "/calc/bonus-calculators": [
    "src/app/calc/bonus-calculators/page.tsx",
    "src/components/RelatedCalculators.tsx",
  ],
  "/salary-db/[id]": [
    "src/app/salary-db/[id]/SamsungCompanySummaryLinks.tsx", // onClick 직접 계측(module_view 짝)
    "src/app/salary-db/[id]/CompanyDetailClient.tsx",
    "src/components/CompanySalaryTable.tsx",
    "src/components/CompanyDisclosedSalary.tsx",
    "src/components/CompanySalaryGroupNotice.tsx",
    "src/components/CompanyBonusCalculatorLink.tsx",
    "src/components/CompanyNarrative.tsx",
    "src/components/CompanyInsights.tsx",
    "src/components/CompanyIndustryRank.tsx",
    "src/components/CompanyConnections.tsx",
    "src/components/CompanyFaq.tsx",
    "src/components/RelatedCompanies.tsx",
    "src/components/RelatedCalculators.tsx",
  ],
};
const CHILD_LINK_WRAPPERS = new Set(["src/app/salary-db/[id]/SamsungCompanySummaryLinks.tsx"]);

/** 이미 onClick 으로 guide_cta_click 을 직접 보내는 모듈 — 속성을 주면 2중 집계 */
const SELF_TRACKED = [
  "src/components/RelatedCalculators.tsx",
  "src/components/NextActions.tsx",
  "src/components/RelatedGuides.tsx",
  "src/app/calc/samsung-bonus/shared.tsx",
];

// 2026-09-25: 15 → 30. GA4 이벤트 범위 맞춤 측정기준의 절삭 기준은 일 고유값 500개라
// position(모듈 id + 광고 슬롯 id + CTA 위치 + 제휴 배치 2종)이 수십 종이어도 (other) 로 묶이지 않는다.
const MAX_MODULE_IDS = 30;
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

  it("모듈 id 총 종류가 30개 이하이고 파일 간에 겹치지 않는다", () => {
    const fileOf = new Map<string, string>();
    for (const file of Object.keys(MODULES)) {
      for (const m of read(file).matchAll(ATTR_RE)) {
        // 같은 id 가 두 파일에 있으면 모듈 귀속이 섞인다. 한 파일의 분기별 반복
        // (CompanyBonusCalculatorLink 의 두 렌더 분기 등)은 같은 모듈이라 허용.
        expect(fileOf.get(m[1]) ?? file, `${m[1]} 가 ${fileOf.get(m[1])} 와 ${file} 에 중복`).toBe(file);
        fileOf.set(m[1], file);
      }
    }
    expect(fileOf.size).toBeLessThanOrEqual(MAX_MODULE_IDS);
    // 선언된 기대값과 실제 스캔값이 일치 (누락·초과 없음)
    expect([...fileOf.keys()].sort()).toEqual(Object.values(MODULES).flat().sort());
  });

  it("리포트 P1 3개 화면의 후속 링크 파일은 위임 또는 직접 계측 중 정확히 하나로 잡힌다", () => {
    for (const [route, files] of Object.entries(P1_FOLLOW_UP_FILES)) {
      for (const file of files) {
        const src = read(file);
        // 링크를 children 으로 받아 감싸기만 하는 계측 래퍼는 href 가 파일에 없다
        if (!CHILD_LINK_WRAPPERS.has(file)) {
          expect(src, `${route}: ${file} 에 내부 링크가 없음 — 목록 정리 필요`).toMatch(/href=/);
        }
        const delegated = src.includes("data-msy-module=");
        const direct = src.includes("trackGuideCTAClick(");
        expect(delegated !== direct, `${route}: ${file} delegated=${delegated} direct=${direct}`).toBe(true);
      }
    }
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
