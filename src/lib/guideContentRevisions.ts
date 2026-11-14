// src/lib/guideContentRevisions.ts
//
// 검증된 가이드 본문·보강 정정일. 상세 화면, OG, Article, 사이트맵에 같은 날짜를 쓴다.
// 상세 렌더에만 파생 날짜를 전달하고 정본 guide.modifiedDate는 변경하지 않는다.
// 목록·관련 글 정렬(guideDiscovery)만 getGuideModifiedDate를 그대로 사용한다. rss.xml 은 사이트맵 lastmod 와 같은
// getGuideSitemapDate(이 날짜 + 광고 아래 보강의 사이트맵 전용 날짜, guideSitemapDates.ts)를 쓴다(lens-crawl-F02, 2026-11-13).
// 표: 일시적 2주택 처분 기한 개정 4편(guideContentRevisions.twoHomeLaw.ts) + 2026-11-01 사실 정정 묶음
//   (guideContentRevisions.factFix1101.ts) + R1 재착지 1편(guideContentRevisions.relandR1.ts — 쿠팡 야간 가이드. R1 원장이 함께 넣었던
//   '수정 칩 있는' 10편은 칩 숫자가 바뀌며 광고가 내려가 2026-11-15 에 사이트맵 전용 표 guideSitemapDates.ts 로 옮겼다).
//   같은 글이 둘 이상에 있으면 늦은 날짜(mergeLatest).
// ★ 이미 '수정' 칩이 떠 있는 글에 행을 더하면 칩의 날짜 숫자가 바뀐다 = 광고 위 변경. 게시 전에 화면 폭 320~460px 를 1px 단위로,
//   수화 후와 첫 화면(수화 전) 둘 다 가드 스윕으로 재서 광고 아래 이동이 0 인 글만 넣는다. 갱신이 광고 아래에만 있거나 스윕에서
//   한 곳이라도 내려가면 사이트맵 전용 표가 기본이다(실측과 규칙: guideContentRevisions.relandR1.ts·guideSitemapDates.ts 머리 주석).
// ★ 10/15 날짜 정정 묶음(71aec38e2 계열)이 이 파일을 새로 만들며 들어오면 add/add 충돌이 난다 — 그쪽 파일을 그대로 쓰고
//   mergeLatest(...) 인자에 GUIDE_CONTENT_REVISED_TWO_HOME_LAW·GUIDE_CONTENT_REVISED_FACT_FIX_1101 을 더하면 된다
//   (sitemap.ts·verify-sitemap.ts·page.tsx 줄은 그쪽과 같다).
// modifiedDate 보다 이르면 무시된다(max). 서버 전용(클라이언트 번들에 싣지 않는다).
import { getGuideModifiedDate } from "./guideDates";
import { GUIDE_CONTENT_REVISED_FACT_FIX_1101 } from "./guideContentRevisions.factFix1101";
import { GUIDE_CONTENT_REVISED_RELAND_R1 } from "./guideContentRevisions.relandR1";
import { GUIDE_CONTENT_REVISED_TWO_HOME_LAW } from "./guideContentRevisions.twoHomeLaw";

/** 여러 정정일 표를 합친다 — 같은 글이 둘 이상에 있으면 늦은 날짜 */
function mergeLatest(...tables: Readonly<Record<string, string>>[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const table of tables) {
    for (const [slug, day] of Object.entries(table)) {
      if (!out[slug] || day > out[slug]) out[slug] = day;
    }
  }
  return out;
}

export const GUIDE_CONTENT_REVISED: Readonly<Record<string, string>> = mergeLatest(
  GUIDE_CONTENT_REVISED_TWO_HOME_LAW,
  GUIDE_CONTENT_REVISED_FACT_FIX_1101,
  GUIDE_CONTENT_REVISED_RELAND_R1,
);

/** 가이드의 마지막 내용 수정일 = max(modifiedDate ?? publishedDate, 본문 정정일) */
export function getGuideContentDate(guide: { slug: string; publishedDate: string; modifiedDate?: string }): string {
  const base = getGuideModifiedDate(guide);
  const revised = GUIDE_CONTENT_REVISED[guide.slug];
  return revised && revised > base ? revised : base;
}
