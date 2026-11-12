// 간이 계산기 202쪽 '이 계산기와 함께 보면 좋은 가이드' 카드의 자동 보충(fallback) 고정 — 2026-11-13 lens-links-F04 Part A.
//
// calc/[slug]/page.tsx 는 getRelatedGuides 를 category·tags 없이 부른다. 명시 가이드(crossLink CALC_TO_GUIDES)가
// 3편 미만이면 나머지는 '최신 modifiedDate → slug' 순 보충으로 채워져, 오늘은 주제와 상관없이 아래 3편이 들어간다.
// ★이 카드는 HomeTopAd 와 calc 레이아웃 광고 위에서 렌더된다(202쪽). 새 가이드나 날짜가 바뀐 가이드가 보충 순서에
//   끼면 202쪽의 카드 글 길이·줄 수가 모르는 사이에 바뀌어 광고가 움직인다. 그래서 바꾸려면 먼저 가드 폭 스윕
//   (320~1440px)을 돌리고, 그 결과를 운영자에게 보인 뒤 이 고정값을 고친다. 주제별 카드로 바꾸는 진짜 수정
//   (Part B, CALC_TO_GUIDES 보강)은 운영자 답을 받아 2월 구조 작업 때 한다. 새 가이드는 RELEASE_HOLDBACK_SLUGS 로 막는다.
import { describe, expect, it } from "vitest";
import { getRelatedGuides } from "@/lib/relatedGuides";
import { getCalcRelatedGuideSlugs } from "@/lib/crossLink";
import { getAllSlugs } from "@/lib/simpleCalculators";

const FALLBACK_ORDER = [
  "auto-loan-vs-lease-2026",
  "bonus-property-sell-same-year-2026",
  "bonus-split-payout-1000-saving-2026",
] as const;

// 카드에 그대로 찍히는 글자 — 바뀌면 202쪽 광고 위 카드 높이가 달라질 수 있다.
const FALLBACK_CARDS = {
  "auto-loan-vs-lease-2026": {
    title: "자동차 할부 vs 리스 vs 일시불: 30대 자동차 구매 전략",
    description: "차량 5천만 기준 할부·리스·일시불 3년 누적 비용 비교. 회사 운영자·개인사업자별 추천.",
    category: "기초",
    level: "초급",
  },
  "bonus-property-sell-same-year-2026": {
    title: "성과급 + 부동산 양도 동시 — 종합 세금 점검 필수",
    description: "근로소득(성과급) 종합과세 + 부동산 분류과세 별도. 건보료 정산에도 반영. 1주택 비과세 + 80% 공제 시 5억 양도차익 약 200만, 성과급 5,000만 + 합산 약 2,700만.",
    category: "부동산",
    level: "고급",
  },
  "bonus-split-payout-1000-saving-2026": {
    title: "성과급 1억 분할 지급 — 1년 vs 2년 세금 비교",
    description: "일시 지급 한계세율 vs 2년 분할 세금 비교. 절감액은 귀속연도별 상이. 인사·임원과 분할 협상 시 잔류 조건 확인.",
    category: "세금",
    level: "중급",
  },
} as const;

const cardsFor = (slug: string) =>
  getRelatedGuides({ currentSlug: `__calc-${slug}`, explicitSlugs: getCalcRelatedGuideSlugs(slug), limit: 3 });

describe("간이 계산기 관련 가이드 자동 보충 고정 (lens-links-F04 Part A)", () => {
  const slugs = getAllSlugs();

  it("계산기 202개 — 늘거나 줄면 이 고정과 스윕 범위를 다시 본다", () => {
    expect(slugs.length).toBe(202);
  });

  it("명시 가이드 다음 칸은 늘 같은 보충 순서의 앞부분이다", () => {
    const drift: string[] = [];
    for (const slug of slugs) {
      const explicit = getCalcRelatedGuideSlugs(slug);
      const filled = cardsFor(slug).map((g) => g.slug).filter((s) => !explicit.includes(s));
      const expected = FALLBACK_ORDER.filter((s) => !explicit.includes(s)).slice(0, filled.length);
      if (JSON.stringify(filled) !== JSON.stringify(expected)) drift.push(`${slug}: ${filled.join(",")}`);
      expect(cardsFor(slug)).toHaveLength(3);
    }
    expect(drift, "보충 카드가 바뀌었다 — 가드 스윕 후에만 이 고정을 고친다").toEqual([]);
  });

  it("보충 카드 3편의 제목·설명·분류·난이도 글자가 그대로다", () => {
    const seen = new Map<string, unknown>();
    for (const slug of slugs) {
      const explicit = getCalcRelatedGuideSlugs(slug);
      for (const card of cardsFor(slug)) if (!explicit.includes(card.slug)) seen.set(card.slug, card);
    }
    expect([...seen.keys()].sort()).toEqual([...FALLBACK_ORDER].sort());
    for (const slug of FALLBACK_ORDER) {
      expect(seen.get(slug), slug).toEqual({ slug, ...FALLBACK_CARDS[slug] });
    }
  });
});
