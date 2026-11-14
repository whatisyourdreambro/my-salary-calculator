// src/lib/__tests__/relandR1Ledger.test.ts
//
// R1 재착지 원장(2026-11-03, 통합 가지 claude/reland-r1-1102) 가드.
// - 가이드 정정일 표(guideContentRevisions.relandR1.ts)는 화면 날짜까지 올리는 글만 담는다. 지금은 쿠팡 야간 가이드 1편 —
//   광고 위 제목·TL;DR·본문을 실제로 고쳤고, 이미 수정일이 있어 칩은 날짜 숫자만 바뀌며, 가드 스윕에서 광고가 위로만 움직였다.
//   수정일이 없는 글을 넣으면 GuideMidAd 위에 새 칩(광고 위 UI)이 생긴다.
// - 2026-11-15 (ads-01): R1 원장이 함께 넣었던 '수정 칩 있는' 10편은 칩 숫자가 2026.10.03 → 2026.11.03 으로 바뀌자 화면 폭
//   440~445px 에서 제목 아래 광고가 모두 24px 내려가(가드 스윕 실측) 표에서 뺐다. 그 10편은 화면·OG·Article 날짜가 운영 값
//   2026-10-03 그대로이고, 사이트맵 lastmod·rss.xml pubDate 만 사이트맵 전용 행(guideSitemapDates.ts)으로 2026-11-03 이다.
//   이미 떠 있는 '수정' 날짜의 숫자를 바꾸는 것은 광고 위 변경이다 — 아래 10편 검사가 실패하면 기대값을 고치기 전에
//   guideSitemapDates.ts 머리 주석 ★ 의 스윕 규칙(320~460px 1px 단위, 수화 후·첫 화면, 광고 아래 이동 0)을 먼저 확인한다.
// - 같은 기준일을 리터럴로 쓰는 곳(sitemap.ts ROUTE_OVERRIDES 두 줄, 원장 두 항목, 추석 페이지 수정일 3곳)이 상수와 같다 —
//   게시일에 날짜를 옮길 때 한 곳만 옮기는 실수를 막는다(src/config/relandR1Push.ts 머리 주석).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { RELAND_R1_PUSH } from "@/config/relandR1Push";
import { GUIDE_CONTENT_REVISED_RELAND_R1 } from "@/lib/guideContentRevisions.relandR1";
import { GUIDE_CONTENT_REVISED, getGuideContentDate } from "@/lib/guideContentRevisions";
import { GUIDE_SITEMAP_ONLY_REVISED, getGuideSitemapDate } from "@/lib/guideSitemapDates";
import { koGuides } from "@/lib/guidesContent";

const readSrc = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
const TODAY_KST = new Date(Date.now() + 9 * 3_600_000).toISOString().slice(0, 10);

// 화면 날짜까지 R1 기준일인 글 = 본문 정정일 표의 전체 행
const CONTENT_REVISED_SLUGS = ["coupang-fulfillment-night-pay-2026"];

// 화면 날짜는 운영 값 그대로, 사이트맵·RSS 날짜만 R1 기준일인 글 (2026-11-15, ads-01)
const SITEMAP_ONLY_SLUGS = [
  "career-break-financial-plan",
  "comprehensive-income-tax-2026",
  "first-home-2026-strategy",
  "isa-account-guide",
  "kai-salary-2026",
  "minimum-wage-impact-2026",
  "performance-pay-complete-2026",
  "retirement-planning-30s",
  "us-treasury-bond",
  "year-end-tax-2026",
];
// 운영(326b54383, 내용 d2fcc8720)이 지금 이 10편에 보여 주는 날짜 — 히어로 '수정' 칩·하단 '마지막 내용 수정'·OG modified_time·
// Article dateModified 모두. 정본 modifiedDate 와 같은 값이다.
const PRODUCTION_SCREEN_DATE = "2026-10-03";
// R1 이 이 글들의 내용을 실제로 고친 날(원장일). 사이트맵 lastmod·rss.xml pubDate 는 이 날이다 — 더 늦은 날이나 게시일로 옮기지 않는다.
const R1_LEDGER_DAY = "2026-11-03";

describe("R1 재착지 가이드 정정일 — 화면 날짜까지 올리는 글은 쿠팡 야간 가이드 1편", () => {
  it("표는 1편, 값은 R1 원장 기준일이고 미래가 아니다", () => {
    expect(Object.keys(GUIDE_CONTENT_REVISED_RELAND_R1).sort()).toEqual(CONTENT_REVISED_SLUGS);
    for (const slug of CONTENT_REVISED_SLUGS) expect(GUIDE_CONTENT_REVISED_RELAND_R1[slug], slug).toBe(RELAND_R1_PUSH);
    expect(RELAND_R1_PUSH <= TODAY_KST).toBe(true);
  });

  it("그 글은 이미 수정일이 있어 새 칩이 생기지 않고, 칩 날짜는 같은 글자 수로 기준일이 된다", () => {
    for (const slug of CONTENT_REVISED_SLUGS) {
      const guide = koGuides.find((g) => g.slug === slug);
      expect(guide, slug).toBeDefined();
      expect(guide!.modifiedDate, slug).toBeDefined();
      expect(guide!.modifiedDate, slug).not.toBe(guide!.publishedDate);
      expect(guide!.modifiedDate!.length, slug).toBe(RELAND_R1_PUSH.length);
      expect(GUIDE_CONTENT_REVISED[slug], slug).toBe(RELAND_R1_PUSH);
      expect(getGuideContentDate(guide!), slug).toBe(RELAND_R1_PUSH);
      // 사이트맵 날짜도 본문 정정일에서 온다 — 사이트맵 전용 행은 두지 않는다
      expect(slug in GUIDE_SITEMAP_ONLY_REVISED, slug).toBe(false);
      expect(getGuideSitemapDate(guide!), slug).toBe(RELAND_R1_PUSH);
    }
  });
});

describe("R1 재착지 '수정 칩 있는' 10편 — 화면 날짜는 운영 값, 사이트맵·RSS 날짜만 R1 원장일 (ads-01)", () => {
  it("두 목록은 겹치지 않고, 합치면 R1 원장이 날짜를 올린 가이드 11편이다", () => {
    expect(SITEMAP_ONLY_SLUGS).toHaveLength(10);
    expect(new Set([...CONTENT_REVISED_SLUGS, ...SITEMAP_ONLY_SLUGS]).size).toBe(11);
  });

  it("10편은 R1 본문 정정일 행이 없고, 화면 날짜(getGuideContentDate)가 운영 값 2026-10-03 그대로다", () => {
    for (const slug of SITEMAP_ONLY_SLUGS) {
      const guide = koGuides.find((g) => g.slug === slug);
      expect(guide, slug).toBeDefined();
      expect(slug in GUIDE_CONTENT_REVISED_RELAND_R1, slug).toBe(false);
      expect(GUIDE_CONTENT_REVISED[slug], slug).toBeUndefined();
      // 칩은 계속 떠 있고(수정일 ≠ 발행일) 날짜 숫자가 운영과 같다
      expect(guide!.modifiedDate, slug).toBe(PRODUCTION_SCREEN_DATE);
      expect(guide!.modifiedDate, slug).not.toBe(guide!.publishedDate);
      expect(getGuideContentDate(guide!), slug).toBe(PRODUCTION_SCREEN_DATE);
    }
  });

  it("10편은 사이트맵 전용 행이 R1 기준일이고, 사이트맵·RSS 날짜(getGuideSitemapDate)는 2026-11-03 이다", () => {
    for (const slug of SITEMAP_ONLY_SLUGS) {
      const guide = koGuides.find((g) => g.slug === slug);
      expect(guide, slug).toBeDefined();
      expect(GUIDE_SITEMAP_ONLY_REVISED[slug], slug).toBe(RELAND_R1_PUSH);
      expect(getGuideSitemapDate(guide!), slug).toBe(R1_LEDGER_DAY);
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
