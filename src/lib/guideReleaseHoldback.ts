// src/lib/guideReleaseHoldback.ts
//
// 새 가이드 공개 보류 목록 (R4, 2026-09-26) — 새로 발행한 가이드가 "이미 있던 페이지"의 자동 목록에
// 끼어들어 광고 위 높이를 바꾸지 않게 한다.
//
// 왜: 관련 글 추천(rankRelatedGuides)과 최신 목록은 점수가 같으면 최신 날짜 순이다. 새 가이드는 발행일이 가장
// 최신이라 기존 페이지의 자동 목록 맨 앞에 들어간다.
//   - 기존 가이드 상세: 관련 글 3편(CalcResultAd·HomeTopAd·레이아웃 푸터 광고 위)·관련 글 6편(HomeTopAd 위)
//   - /calc/[slug] 계산기 200여 쪽: 함께 볼 가이드 3편(HomeTopAd·레이아웃 광고 위)
//   - 가이드 카테고리 허브: 최신 5편(GuideMidAd 위)·전체 목록(레이아웃 푸터 광고 위)
//   - 메인 편집 추천 8편(GuideMidAd·MultiplexAd 위)
//   - /guides 목록 첫 6장(GuideMidAd 위 — 최신순이라 새 가이드가 첫 줄을 차지한다)
// 제목·설명 길이가 다르면 카드 높이가 바뀌어 광고가 밀린다(R4 리뷰 실측: 55개 경로 중 47곳에서 광고가 아래로
// 최대 121px 이동). 2026-08-16 수익 급락 이후 규칙(광고 위 높이 불변)에 따라, 여기 적힌 가이드는 공개(URL·sitemap·
// RSS·IndexNow·사이트 검색)는 그대로 하되 기존 페이지의 자동 목록 후보에서만 뺀다. 새 가이드 페이지끼리는 서로의
// 관련 글에 그대로 보인다(새 페이지라 기준 광고 위치가 없다).
//
// 해제: 운영자가 광고 위치 변화(경로·폭별 목록은 R4 manifest)를 승인하면 슬러그를 지운다. 지우는 배포에서 위 목록이
// 한꺼번에 바뀌므로 광고 위치 재측정(adpos, 320~1280px)과 함께 한다. 명시 연결(explicitSlugs)로 직접 건 링크는
// 사람이 고른 것이라 보류하지 않는다.

export const RELEASE_HOLDBACK_SLUGS: ReadonlySet<string> = new Set([
  // guides-2027-policy (src/lib/guides/policy-2027-guides.ts)
  "changes-2027-worker-checklist",
  "marriage-birth-cash-support-2027",
  "basic-pension-reform-2027",
  // guides-pay-season (src/lib/guides/pay-season-howto-2026.ts)
  "civil-servant-net-pay-2026",
  "civil-servant-performance-bonus-2026",
  "lotto-prize-tax",
  "seollal-bonus-tax-2027",
  // 10/9 삼성 소식 (src/lib/guides/semiconductor-bonus-news-2026-10.ts) — 운영자 답 5(2026-10-08), 광고 하향 0 조건
  "samsung-ds-special-bonus-details-oct-2026",
]);

export function isReleaseHeldBack(slug: string): boolean {
  return RELEASE_HOLDBACK_SLUGS.has(slug);
}

/**
 * 자동 목록 후보에서 보류 가이드를 뺀다.
 * currentSlug 가 보류 가이드 자신이면(새 페이지) 후보를 그대로 둔다 — 새 가이드끼리는 서로 추천한다.
 */
export function withoutHeldBackGuides<T extends { slug: string }>(
  guides: readonly T[],
  currentSlug?: string,
): T[] {
  if (currentSlug !== undefined && RELEASE_HOLDBACK_SLUGS.has(currentSlug)) return [...guides];
  return guides.filter((g) => !RELEASE_HOLDBACK_SLUGS.has(g.slug));
}
