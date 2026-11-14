// 광고 아래 보강의 사이트맵 전용 날짜 (lens-meta-F01, 운영자 승인 2026-11-13)
//
// 화면·OG·Article 날짜(getGuideContentDate)는 그대로 두고 사이트맵 lastmod 만 보강을 고친 날로 올린다.
// 그래야 게시 8단계 IndexNow(사이트맵 (loc, lastmod) 차이)가 보강한 글을 네이버·빙에 알린다.
// 2026-11-15 (ads-01): 이미 '수정' 칩이 있는 R1 10편도 이 표에 있다 — 칩 숫자를 바꾸면 화면 폭 440~445px 에서 광고가 24px 내려가
// (가드 스윕 실측) 화면 날짜는 운영 값 그대로 둔다. 그 10편의 두 날짜 고정은 relandR1Ledger.test.ts.
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";
import { guideSupplements } from "@/lib/guides/supplements";
import { getGuideContentDate } from "@/lib/guideContentRevisions";
import { GUIDE_SITEMAP_ONLY_REVISED, getGuideSitemapDate } from "@/lib/guideSitemapDates";

const TODAY_KST = new Date(Date.now() + 9 * 3_600_000).toISOString().slice(0, 10);
const bySlug = new Map(koGuides.map((g) => [g.slug, g]));
// 링크 한 줄만 받은 보강 — 날짜를 올리지 않는다(lens-meta-F01 검증).
const LINK_ONLY = new Set([
  "etf-beginner", "basic-pension-65-2026", "health-insurance-2026-guide", "retirement-planning", "public-company-salary-ranking-2026",
]);
// 광고 아래 보강이 없는 행 — 이름과 이유를 적은 예외만 허용한다 (2026-11-15, ads-01).
// 이 표의 행은 원래 '마지막 광고 아래 보강을 고친 날'이다. 보강 없이 행을 둘 수 있는 경우는 하나뿐이다: 광고 위 같은 폭 사실 정정을
// 받았지만 이미 떠 있는 '수정' 칩의 숫자를 바꾸면 광고가 내려가서 화면 날짜를 올리지 못한 글. 그 밖의 행은 모두 보강이 있어야 한다.
const NO_SUPPLEMENT_ROWS: Readonly<Record<string, string>> = {
  // R1 RL-02: TL;DR·카드·Article 설명 '금리 인하 시기' → '금리 변동 시기'(같은 폭). 광고 아래 보강은 받지 않았다.
  "us-treasury-bond":
    "R1 RL-02 광고 위 같은 폭 정정만 받았다. 칩을 2026.11.03 으로 바꾸면 화면 폭 440~441px 에서 제목 아래 광고가 24px 내려가 화면 날짜는 2026.10.03 그대로 둔다",
};

describe("guideSitemapDates — 광고 아래 보강의 사이트맵 전용 날짜", () => {
  it("모든 행은 실제 가이드 슬러그·광고 아래 보강이 있는 글(이름 붙인 예외 제외)·YYYY-MM-DD·오늘(KST) 이전", () => {
    for (const [slug, day] of Object.entries(GUIDE_SITEMAP_ONLY_REVISED)) {
      expect(bySlug.has(slug), slug).toBe(true);
      if (slug in NO_SUPPLEMENT_ROWS) {
        expect(guideSupplements[slug], `${slug}: 보강이 생겼으면 예외 목록에서 뺀다`).toBeFalsy();
      } else {
        expect(guideSupplements[slug], slug).toBeTruthy();
      }
      expect(day, slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10), slug).toBe(day);
      expect(day <= TODAY_KST, slug).toBe(true);
      expect(LINK_ONLY.has(slug), slug).toBe(false);
    }
  });

  it("보강 없는 행의 예외는 1편뿐이고, 이유가 있으며, 표에 실제로 있는 '수정 칩 있는' 글이다", () => {
    expect(Object.keys(NO_SUPPLEMENT_ROWS)).toEqual(["us-treasury-bond"]);
    for (const [slug, reason] of Object.entries(NO_SUPPLEMENT_ROWS)) {
      expect(slug in GUIDE_SITEMAP_ONLY_REVISED, `${slug}: 표에 없는 예외`).toBe(true);
      expect(reason.length, slug).toBeGreaterThanOrEqual(20);
      // 칩 없는 글에 보강도 없이 사이트맵 날짜만 올리는 행은 허용하지 않는다
      const guide = bySlug.get(slug)!;
      expect(guide.modifiedDate, slug).toBeDefined();
      expect(getGuideContentDate(guide), slug).not.toBe(guide.publishedDate);
    }
  });

  it("행은 사이트맵 날짜만 올린다 — 화면·OG·Article 날짜(getGuideContentDate)보다 늦고, 칩 없는 글은 칩이 생기지 않는다", () => {
    for (const slug of Object.keys(GUIDE_SITEMAP_ONLY_REVISED)) {
      const guide = bySlug.get(slug)!;
      const content = getGuideContentDate(guide);
      expect(getGuideSitemapDate(guide), slug).toBe(GUIDE_SITEMAP_ONLY_REVISED[slug]);
      expect(GUIDE_SITEMAP_ONLY_REVISED[slug] > content, `${slug}: 효과 없는 행`).toBe(true);
      // 칩은 내용 수정일 ≠ 발행일일 때만 붙는다(GuidePageClient). modifiedDate 가 없는 글은 계속 칩이 없다.
      if (!guide.modifiedDate) expect(content, slug).toBe(guide.publishedDate);
    }
    // 표에 없는 글은 종전과 같다
    for (const guide of koGuides.filter((g) => !(g.slug in GUIDE_SITEMAP_ONLY_REVISED))) {
      expect(getGuideSitemapDate(guide), guide.slug).toBe(getGuideContentDate(guide));
    }
  });

  it("보강이 있는 칩 없는 글은 모두 행이 있거나 링크 한 줄 보강이다 — 보강을 더하고 날짜를 잊지 않게", () => {
    const missing = Object.keys(guideSupplements).filter((slug) => {
      const guide = bySlug.get(slug);
      if (!guide) return false;
      return getGuideContentDate(guide) === guide.publishedDate && !(slug in GUIDE_SITEMAP_ONLY_REVISED) && !LINK_ONLY.has(slug);
    });
    expect(missing).toEqual([]);
  });

  it("실제 sitemap() 이 행의 날짜를 lastmod 로 낸다", () => {
    const source = `globalThis.fetch = () => { throw new Error('Network forbidden in sitemap fixture'); };
      const sitemap = require('./src/app/sitemap.ts').default;
      const { GUIDE_SITEMAP_ONLY_REVISED: rows } = require('./src/lib/guideSitemapDates.ts');
      const paths = new Set(Object.keys(rows).map(slug => 'https://www.moneysalary.com/guides/' + slug));
      console.log(JSON.stringify(sitemap().filter(item => paths.has(item.url)).map(item => ({ url: item.url, date: item.lastModified }))));`;
    const rows = JSON.parse(execFileSync(process.execPath, ["--import", "tsx", "-e", source], {
      cwd: process.cwd(), encoding: "utf8", timeout: 30_000, maxBuffer: 1024 * 1024,
    })) as Array<{ url: string; date: string }>;
    expect(rows).toHaveLength(Object.keys(GUIDE_SITEMAP_ONLY_REVISED).length);
    for (const { url, date } of rows) {
      const slug = url.slice("https://www.moneysalary.com/guides/".length);
      expect(date, slug).toBe(GUIDE_SITEMAP_ONLY_REVISED[slug]);
    }
  }, 35_000);
});
