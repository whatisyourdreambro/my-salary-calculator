// src/lib/relatedGuides.ts
//
// 서버 전용 헬퍼 — 가이드 cross-link 후보를 점수화해 선별하고, content(본문)를
// 제외한 가벼운 메타데이터(RelatedGuideItem)만 반환한다.
//
// 목적: RelatedGuides(클라이언트 컴포넌트)가 guides 전체 배열(본문 ~888KB 포함)을
// 직접 import 하던 것을 제거. 서버 페이지에서 이 함수를 호출해 결과만 props 로
// 넘기면, 가이드 본문이 클라이언트 번들(First Load JS)에 실리지 않는다.
// (이 모듈은 guides 를 import 하므로 반드시 서버 컴포넌트/페이지에서만 호출할 것)

import { koGuides } from "@/lib/guidesContent";
import type { Guide } from "@/lib/guidesData";
import { rankRelatedGuides } from "@/lib/guideDiscovery";

export interface RelatedGuideItem {
  slug: string;
  title: string;
  description: string;
  category: string;
  level: Guide["level"];
}

interface GetRelatedGuidesOptions {
  currentSlug: string;
  category?: string;
  tags?: string[];
  limit?: number;
  /**
   * 명시적 가이드 슬러그 우선 — cross-link 매핑(crossLink.ts)에서 전달.
   * 명시 슬러그를 우선 채우고, 부족분은 score 기반 자동 추천으로 보충.
   */
  explicitSlugs?: string[];
}

function toItem(g: Guide): RelatedGuideItem {
  return {
    slug: g.slug,
    title: g.title,
    description: g.description,
    category: g.category,
    level: g.level,
  };
}

export function getRelatedGuides({
  currentSlug,
  category,
  tags,
  limit = 6,
  explicitSlugs,
}: GetRelatedGuidesOptions): RelatedGuideItem[] {
  // 링크 대상은 /guides/*이므로 한국어 후보만 사용하고 중복 slug를 제외한다.
  const explicit = [...new Set(explicitSlugs ?? [])]
    .map((slug) => koGuides.find((g) => g.slug === slug && g.slug !== currentSlug))
    .filter((g): g is Guide => Boolean(g));

  const explicitSlugSet = new Set(explicit.map((g) => g.slug));
  const fallback = rankRelatedGuides(koGuides, { currentSlug, category, tags })
    .filter((g) => !explicitSlugSet.has(g.slug));

  return [...explicit, ...fallback].slice(0, limit).map(toItem);
}
