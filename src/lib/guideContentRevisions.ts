// src/lib/guideContentRevisions.ts
//
// 검증된 가이드 본문·보강 정정일. 상세 화면, OG, Article, 사이트맵에 같은 날짜를 쓴다.
// 상세 렌더에만 파생 날짜를 전달하고 정본 guide.modifiedDate는 변경하지 않는다.
// 목록·관련 글 정렬(guideDiscovery), RSS 순서는 getGuideModifiedDate를 그대로 사용한다.
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
