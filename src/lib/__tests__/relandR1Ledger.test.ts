// src/lib/__tests__/relandR1Ledger.test.ts
//
// R1 재착지 원장(2026-11-03, 통합 가지 claude/reland-r1-1102) 가드.
// - 가이드 정정일 표(guideContentRevisions.relandR1.ts)는 이미 수정일이 있어 히어로 '수정' 칩이 떠 있는 글만 담는다 —
//   수정일이 없는 글을 넣으면 GuideMidAd 위에 새 칩(광고 위 UI)이 생긴다. 칩은 날짜 숫자만 바뀐다.
// - 같은 기준일을 리터럴로 쓰는 곳(sitemap.ts ROUTE_OVERRIDES 두 줄, 원장 두 항목, 추석 페이지 수정일 3곳)이 상수와 같다 —
//   게시일에 날짜를 옮길 때 한 곳만 옮기는 실수를 막는다(src/config/relandR1Push.ts 머리 주석).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { RELAND_R1_PUSH } from "@/config/relandR1Push";
import { GUIDE_CONTENT_REVISED_RELAND_R1 } from "@/lib/guideContentRevisions.relandR1";
import { GUIDE_CONTENT_REVISED, getGuideContentDate } from "@/lib/guideContentRevisions";
import { koGuides } from "@/lib/guidesContent";

const readSrc = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
const TODAY_KST = new Date(Date.now() + 9 * 3_600_000).toISOString().slice(0, 10);

const SLUGS = [
  "career-break-financial-plan",
  "comprehensive-income-tax-2026",
  "coupang-fulfillment-night-pay-2026",
  "first-home-2026-strategy",
  "isa-account-guide",
  "kai-salary-2026",
  "minimum-wage-impact-2026",
  "performance-pay-complete-2026",
  "retirement-planning-30s",
  "us-treasury-bond",
  "year-end-tax-2026",
];

describe("R1 재착지 가이드 정정일 — 기존 수정 칩의 날짜 숫자만", () => {
  it("표는 11편, 값은 모두 R1 원장 기준일이고 미래가 아니다", () => {
    expect(Object.keys(GUIDE_CONTENT_REVISED_RELAND_R1).sort()).toEqual(SLUGS);
    for (const slug of SLUGS) expect(GUIDE_CONTENT_REVISED_RELAND_R1[slug], slug).toBe(RELAND_R1_PUSH);
    expect(RELAND_R1_PUSH <= TODAY_KST).toBe(true);
  });

  it("11편 모두 이미 수정일이 있어 새 칩이 생기지 않고, 칩 날짜는 같은 글자 수로 기준일이 된다", () => {
    for (const slug of SLUGS) {
      const guide = koGuides.find((g) => g.slug === slug);
      expect(guide, slug).toBeDefined();
      expect(guide!.modifiedDate, slug).toBeDefined();
      expect(guide!.modifiedDate, slug).not.toBe(guide!.publishedDate);
      expect(guide!.modifiedDate!.length, slug).toBe(RELAND_R1_PUSH.length);
      expect(GUIDE_CONTENT_REVISED[slug], slug).toBe(RELAND_R1_PUSH);
      expect(getGuideContentDate(guide!), slug).toBe(RELAND_R1_PUSH);
    }
  });
});

describe("R1 원장 기준일 리터럴 동기화 — 설 상여 계산기·추석 상여 페이지", () => {
  const midnight = `new Date('${RELAND_R1_PUSH}T00:00:00+09:00')`;

  it("sitemap.ts ROUTE_OVERRIDES 두 줄이 기준일이다", () => {
    const sitemap = readSrc("src/app/sitemap.ts");
    expect(sitemap).toContain(`'/calc/holiday-bonus': { lastModified: ${midnight} }`);
    expect(sitemap).toContain(`'/chuseok-bonus-2026': { lastModified: ${midnight} }`);
  });

  it("콘텐츠 검토 원장 두 항목의 contentDate 가 기준일이다", () => {
    const ledger = JSON.parse(readSrc("scripts/sitemap-content-reviews.json")) as {
      routes: Record<string, { contentDate: string }>;
    };
    expect(ledger.routes["/calc/holiday-bonus"]?.contentDate).toBe(RELAND_R1_PUSH);
    expect(ledger.routes["/chuseok-bonus-2026"]?.contentDate).toBe(RELAND_R1_PUSH);
  });

  it("추석 페이지 화면·OG·Article 수정일이 기준일이다", () => {
    const page = readSrc("src/app/chuseok-bonus-2026/page.tsx");
    expect(page).toContain(`modifiedTime: "${RELAND_R1_PUSH}"`);
    expect(page).toContain(`modifiedDate: "${RELAND_R1_PUSH}"`);
    expect(page).toContain(`updatedDate="${RELAND_R1_PUSH}"`);
  });
});
