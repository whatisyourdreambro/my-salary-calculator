// 가이드 히어로 '수정' 날짜 줄 — 9/27 빌드(4ef59a4b2) 배치 유지 가드 (2026-10-05, 감사 code51-01)
//
// 352451886(10/4 배포)이 55편에 modifiedDate 를 처음 넣어 제목 아래 발행 줄에 '수정 2026.10.03' 이 붙었다.
// 이 줄은 첫 본문 광고(GuideMidAd) 위라 모바일에서 줄이 늘면 광고가 모두 내려간다.
// 히어로에 수정일이 보이는 가이드는 9/27 빌드와 같은 41편이어야 한다. 수정일 자체(JSON-LD·OG·사이트맵·RSS·
// 광고 아래 '마지막 내용 수정')는 그대로 둔다. 히어로 표시 방식을 바꿀 때는 폭 점검 후 이 목록과
// src/lib/guideHeroDates.ts 를 같은 커밋에서 고친다.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));
vi.mock("@/components/AdPlacement", () => ({
  GuideMidAd: () => null, HomeTopAd: () => null, InArticleAd: () => null,
  MultiplexAd: () => null, SidebarAd: () => null,
}));
vi.mock("@/components/ShareButtons", () => ({ default: () => null }));
vi.mock("@/components/FavoritesButton", () => ({ default: () => null }));
vi.mock("@/components/guides/TableOfContents", () => ({ default: () => null }));
vi.mock("@/components/affiliate/AffiliateSlot", () => ({ OfferSlot: () => null }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));

import { koGuides } from "@/lib/guidesContent";
import { getGuideModifiedDate } from "@/lib/guideDates";
import { GUIDE_HERO_MODIFIED_HIDDEN, showGuideHeroModified } from "@/lib/guideHeroDates";
import GuidePageClient from "@/app/guides/[slug]/GuidePageClient";

/** 4ef59a4b2 의 guidesMeta.generated.ts 에서 히어로에 수정일이 보이던 한국어 가이드 (수정일 ≠ 발행일) */
const HERO_MODIFIED_BASELINE_0927: readonly string[] = [
  "annual-leave-refund-2026",
  "bonus-1eok-net-payment-2026",
  "bonus-5000-net-payment-2026",
  "bonus-health-4-percent-2026",
  "bonus-payout-timing-2026",
  "bonus-retire-impact-severance-2026",
  "bonus-tax-rate",
  "bonus-vs-incentive-vs-allowance-2026",
  "child-education-deduction-limit-2026",
  "couple-split-bonus-year-2026",
  "credit-card-deduction-30-40-strategy-2026",
  "earned-income-deduction-2026",
  "executive-severance-limit-2026",
  "first-home-buyer-loan",
  "four-insurance-ceiling-summary-2026",
  "housing-subscription-25man-deduction-2026",
  "implant-dental-medical-deduction-2026",
  "incentive-split-payout-2026",
  "income-tax-8-step-bracket-2026",
  "insurance-100man-limit-2026",
  "it-rsu-vs-cash-bonus-2026",
  "kakao-rsu-tax-saving-2026",
  "lg-hyundai-posco-bonus-2026",
  "lgensol-wage-negotiation-2026",
  "marriage-tax-benefits-2026",
  "medical-edu-donation-limits-2026",
  "newlywed-asset-tax-saving-2026",
  "newlywed-deduction-first-year-2026",
  "nurse-salary",
  "one-home-prop-tax-12eok-2026",
  "overtime-proof-claim-2026",
  "parent-support-deduction-integration-2026",
  "postpartum-medical-deduction-200man-2026",
  "salary-guide-2026",
  "salary-peak-system",
  "samsung-opi-tai-complete-2026",
  "sk-hynix-ps-history-2026-prospect",
  "standard-vs-special-deduction-2026",
  "wage-delayed-claim-2026",
  "year-end-tax-13-tips-2026",
  "year-end-tax-refund-secrets-2026",
];

describe("가이드 히어로 수정일 — 9/27 배치", () => {
  it("히어로에 수정일이 보이는 가이드는 9/27 빌드의 41편과 같다", () => {
    const shown = koGuides.filter((g) => showGuideHeroModified(g)).map((g) => g.slug).sort();
    expect(shown).toEqual([...HERO_MODIFIED_BASELINE_0927].sort());
  });

  it("숨김 목록 55편은 실제 가이드이고 수정일(화면 밖 신호용)을 그대로 가진다", () => {
    expect(GUIDE_HERO_MODIFIED_HIDDEN.size).toBe(55);
    const bySlug = new Map(koGuides.map((g) => [g.slug, g]));
    for (const slug of GUIDE_HERO_MODIFIED_HIDDEN) {
      const g = bySlug.get(slug);
      expect(g, slug).toBeDefined();
      expect(getGuideModifiedDate(g!), slug).not.toBe(g!.publishedDate);
      expect(HERO_MODIFIED_BASELINE_0927, slug).not.toContain(slug);
    }
  });

  it("숨김 가이드는 히어로에 수정일이 없고, 광고 아래 마지막 내용 수정 줄에는 남는다", () => {
    const g = koGuides.find((x) => x.slug === "year-end-tax-2026")!;
    const html = renderToStaticMarkup(createElement(GuidePageClient, {
      guide: g, relatedGuides: [], showHeroModified: showGuideHeroModified(g),
    }));
    const modified = getGuideModifiedDate(g);
    expect(modified).toBe("2026-10-03");
    expect(html).not.toContain("<span>수정 <time");
    expect(html).toMatch(new RegExp(`<time datetime="${modified}">`, "i"));
    expect(html).toContain("마지막 내용 수정");
  });

  it("9/27 부터 수정일이 보이던 가이드는 그대로 표시한다", () => {
    const g = koGuides.find((x) => x.slug === HERO_MODIFIED_BASELINE_0927[0])!;
    const html = renderToStaticMarkup(createElement(GuidePageClient, {
      guide: g, relatedGuides: [], showHeroModified: showGuideHeroModified(g),
    }));
    expect(html).toContain("<span>수정 <time");
  });
});
