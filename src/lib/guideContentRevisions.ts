// src/lib/guideContentRevisions.ts
//
// 가이드 본문 정정일 — 히어로 '수정' 칩이 생기지 않는 별도 필드(10/15 날짜 정정 묶음과 같은 이름·같은 API).
// 쓰는 곳: 사이트맵 lastmod(sitemap.ts guideUrls, verify-sitemap 기대값)와 Article dateModified(guides/[slug]/page.tsx)
// — 화면에 그려지지 않는 신호만. og article:modified_time 은 10/15 묶음 리뷰 결론대로 modifiedDate 그대로 둔다.
// 화면 날짜(히어로 발행/수정 줄, 본문 하단 기준·출처 상자)와 목록·관련 글 정렬(guideDiscovery), RSS 순서는
// getGuideModifiedDate 그대로 둔다(modifiedDate 를 바꾸면 광고 위 날짜 폭과 /guides 목록 순서가 바뀐다).
// 지금 표는 일시적 2주택 처분 기한 개정 보강 4편뿐이다(guideContentRevisions.twoHomeLaw.ts).
// ★ 10/15 날짜 정정 묶음(71aec38e2 계열)이 이 파일을 새로 만들며 들어오면 add/add 충돌이 난다 — 그쪽 파일을 그대로 쓰고
//   mergeLatest(...) 인자에 GUIDE_CONTENT_REVISED_TWO_HOME_LAW 를 더하면 된다(sitemap.ts·verify-sitemap.ts·page.tsx 줄은 그쪽과 같다).
// modifiedDate 보다 이르면 무시된다(max). 서버 전용(클라이언트 번들에 싣지 않는다).
import { getGuideModifiedDate } from "./guideDates";
import { GUIDE_CONTENT_REVISED_TWO_HOME_LAW } from "./guideContentRevisions.twoHomeLaw";

export const GUIDE_CONTENT_REVISED: Readonly<Record<string, string>> = { ...GUIDE_CONTENT_REVISED_TWO_HOME_LAW };

/** 가이드의 마지막 내용 수정일 = max(modifiedDate ?? publishedDate, 본문 정정일) */
export function getGuideContentDate(guide: { slug: string; publishedDate: string; modifiedDate?: string }): string {
  const base = getGuideModifiedDate(guide);
  const revised = GUIDE_CONTENT_REVISED[guide.slug];
  return revised && revised > base ? revised : base;
}
