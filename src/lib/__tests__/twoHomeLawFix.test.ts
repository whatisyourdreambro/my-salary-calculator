// 일시적 2주택 처분 기한 개정(소득세법 시행령 제155조 제1항·부칙 제2조, 대통령령 제36737호 2026-10-01 시행) 반영 가드.
// - 정정은 가이드 4편의 마지막 광고(guides/layout.tsx PageFooterAds) 아래 보강에만 있다 — 본문(광고 위)에는 넣지 않는다.
// - 보강에는 기한(2년/3년)·조건(두 주택 모두 조정대상지역)·적용 시점(8/4 취득·10/1 양도)·경과 규정(8/3 이전 취득·계약금)·출처가 있어야 한다.
// - 검증된 별도 정정일(guideContentRevisions)을 상세 화면·OG·사이트맵·Article에 전달하며 정본 날짜·추천 순서는 유지한다.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { GUIDE_FACT_FIX_1101_PUSH } from "@/config/guideFactFixPush";
import { TWO_HOME_LAW_FIX_PUSH } from "@/config/twoHomeLawFixPush";
import { GUIDE_CONTENT_REVISED_TWO_HOME_LAW } from "@/lib/guideContentRevisions.twoHomeLaw";
import { getGuideContentDate } from "@/lib/guideContentRevisions";
import { getGuideModifiedDate } from "@/lib/guideDates";
import { koGuides } from "@/lib/guidesContent";
import { guideSupplements } from "@/lib/guides/supplements";
import { guideSupplementsTwoHomeLaw } from "@/lib/guides/supplements-two-home-law";

const SLUGS = [
  "one-home-capital-gains-12eok-2026",
  "property-downsizing-1home-2026",
  "real-estate-capital-gains-2026",
  "temp-two-home-3year-rule-2026",
] as const;

/** 슬러그별 본문 정정일 — 광고 아래 보강만 받은 글은 10/6 푸시일, 2026-11-01 묶음(STR-07)에서 광고 위 제목·본문 문장까지 고친 글은 그 푸시일 */
const EXPECTED_REVISION: Readonly<Record<(typeof SLUGS)[number], string>> = {
  "one-home-capital-gains-12eok-2026": TWO_HOME_LAW_FIX_PUSH,
  "property-downsizing-1home-2026": TWO_HOME_LAW_FIX_PUSH,
  "real-estate-capital-gains-2026": TWO_HOME_LAW_FIX_PUSH,
  "temp-two-home-3year-rule-2026": GUIDE_FACT_FIX_1101_PUSH,
};

const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

describe("일시적 2주택 처분 기한 개정 — 광고 아래 보강", () => {
  it("보강 4편이 guideSupplements 에 합쳐져 있고 다른 슬러그는 없다", () => {
    expect(Object.keys(guideSupplementsTwoHomeLaw).sort()).toEqual([...SLUGS]);
    for (const slug of SLUGS) expect(guideSupplements[slug], slug).toBe(guideSupplementsTwoHomeLaw[slug]);
  });

  it("4편 모두 실제 한국어 가이드이고, 본문(광고 위)에는 개정 문구를 넣지 않았다", () => {
    for (const slug of SLUGS) {
      const guide = koGuides.find((g) => g.slug === slug);
      expect(guide, slug).toBeDefined();
      expect(guide!.content, slug).not.toContain("36737");
      expect(guide!.title + guide!.description, slug).not.toContain("36737");
    }
  });

  it("각 보강은 기한·조건·적용 시점·경과 규정·출처를 담는다", () => {
    for (const slug of SLUGS) {
      const t = text(guideSupplementsTwoHomeLaw[slug]);
      expect(t, slug).toContain("대통령령 제36737호");
      expect(t, slug).toContain("10월 1일");
      expect(t, slug).toMatch(/2년/);
      expect(t, slug).toMatch(/3년/);
      expect(t, slug).toContain("조정대상지역");
      expect(t, slug).toContain("2026년 8월 4일 이후");
      expect(t, slug).toContain("8월 3일 이전");
      expect(t, slug).toContain("계약금");
      expect(t, slug).toContain("증명서류");
      expect(t, slug).toContain("제155조 제1항");
      expect(t, slug).toContain("부칙 제2조");
    }
  });

  it("FAQ 헤더를 쓰지 않는다(FAQPage 항목 수 불변)·이모지 헤더 없음", () => {
    for (const slug of SLUGS) {
      const html = guideSupplementsTwoHomeLaw[slug];
      expect(html, slug).not.toMatch(/자주 묻는 질문/);
      for (const m of html.matchAll(/<h2>(.*?)<\/h2>/g)) expect(m[1], slug).not.toMatch(/\p{Extended_Pictographic}/u);
    }
  });

  it("안내 3편의 본편 링크 대상이 실재한다", () => {
    const hrefs = Object.values(guideSupplementsTwoHomeLaw).flatMap((h) => [...h.matchAll(/href="(\/guides\/[^"]+)"/g)].map((m) => m[1]));
    expect(hrefs.length).toBe(3);
    for (const href of hrefs) expect(koGuides.some((g) => `/guides/${g.slug}` === href), href).toBe(true);
  });

  it("guides/layout.tsx 는 보강을 PageFooterAds 뒤에서만 렌더한다", () => {
    const layout = readFileSync("src/app/guides/layout.tsx", "utf8");
    const ads = layout.indexOf("<PageFooterAds");
    const supp = layout.indexOf("<GuideSupplement");
    expect(ads).toBeGreaterThan(0);
    expect(supp).toBeGreaterThan(ads);
  });
});

describe("일시적 2주택 처분 기한 개정 — 날짜", () => {
  it("푸시일 상수는 실재 날짜이고 법 시행일(2026-10-01) 이후다", () => {
    expect(TWO_HOME_LAW_FIX_PUSH).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(`${TWO_HOME_LAW_FIX_PUSH}T00:00:00Z`).toISOString().slice(0, 10)).toBe(TWO_HOME_LAW_FIX_PUSH);
    expect(TWO_HOME_LAW_FIX_PUSH >= "2026-10-01").toBe(true);
  });

  it("날짜 표는 보강 4편과 같은 슬러그이고, 4편의 본문 정정일은 max(modifiedDate, 그 글의 푸시일) 이다", () => {
    expect(Object.keys(GUIDE_CONTENT_REVISED_TWO_HOME_LAW).sort()).toEqual([...SLUGS]);
    expect({ ...GUIDE_CONTENT_REVISED_TWO_HOME_LAW }).toEqual(EXPECTED_REVISION);
    for (const slug of SLUGS) {
      const guide = koGuides.find((g) => g.slug === slug)!;
      const base = getGuideModifiedDate(guide);
      const revised = EXPECTED_REVISION[slug];
      expect(getGuideContentDate(guide), slug).toBe(base > revised ? base : revised);
    }
  });

  it("2026-11-01 묶음 푸시일 상수는 실재 날짜이고 보강 푸시일(10/6) 뒤다 — 정본 modifiedDate 는 그대로 둔다", () => {
    expect(GUIDE_FACT_FIX_1101_PUSH).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(`${GUIDE_FACT_FIX_1101_PUSH}T00:00:00Z`).toISOString().slice(0, 10)).toBe(GUIDE_FACT_FIX_1101_PUSH);
    expect(GUIDE_FACT_FIX_1101_PUSH > TWO_HOME_LAW_FIX_PUSH).toBe(true);
    // modifiedDate 를 올리면 목록·관련 글 동점 순서가 바뀌어 광고 위 카드가 달라진다(guideFactFixPush.ts) — 날짜는 정정일 표로만
    const temp = koGuides.find((g) => g.slug === "temp-two-home-3year-rule-2026")!;
    expect(temp.modifiedDate).toBeUndefined();
  });
});
