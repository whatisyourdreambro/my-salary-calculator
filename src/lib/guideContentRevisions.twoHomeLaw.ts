// src/lib/guideContentRevisions.twoHomeLaw.ts
//
// 일시적 2주택 처분 기한 개정(소득세법 시행령 대통령령 제36737호, 2026-10-01 시행) 보강을 받은 가이드 4편의 본문 정정일.
// 보강 본문은 src/lib/guides/supplements-two-home-law.ts — 이 표의 슬러그와 그 맵의 키가 같아야 한다(twoHomeLawFix.test.ts).
// guideContentRevisions.ts 가 읽는다(사이트맵 lastmod·Article dateModified — 화면 날짜·og 수정일은 그대로).
// 10/15 날짜 정정 묶음이 같은 이름의 guideContentRevisions.ts 를 가져오면, 그쪽 mergeLatest 인자에 이 표를 더한다.
import { TWO_HOME_LAW_FIX_PUSH } from "@/config/twoHomeLawFixPush";

export const GUIDE_CONTENT_REVISED_TWO_HOME_LAW: Readonly<Record<string, string>> = {
  "one-home-capital-gains-12eok-2026": TWO_HOME_LAW_FIX_PUSH,
  "property-downsizing-1home-2026": TWO_HOME_LAW_FIX_PUSH,
  "real-estate-capital-gains-2026": TWO_HOME_LAW_FIX_PUSH,
  "temp-two-home-3year-rule-2026": TWO_HOME_LAW_FIX_PUSH,
};
