// src/lib/guideContentRevisions.twoHomeLaw.ts
//
// 일시적 2주택 처분 기한 개정(소득세법 시행령 대통령령 제36737호, 2026-10-01 시행) 보강을 받은 가이드 4편의 본문 정정일.
// 보강 본문은 src/lib/guides/supplements-two-home-law.ts — 이 표의 슬러그와 그 맵의 키가 같아야 한다(twoHomeLawFix.test.ts).
// guideContentRevisions.ts 가 읽는다(상세 화면·OG·사이트맵 lastmod·Article dateModified 공통).
// 10/15 날짜 정정 묶음이 같은 이름의 guideContentRevisions.ts 를 가져오면, 그쪽 mergeLatest 인자에 이 표를 더한다.
// 값: 마지막 광고 아래 보강만 받은 글은 그 푸시일(TWO_HOME_LAW_FIX_PUSH, 10/6). 2026-11-01 묶음(PKG-23 STR-07)에서
//   광고 위 제목·본문 문장까지 원칙 3년/조정 두 채 2년으로 고친 글은 그 푸시일(GUIDE_FACT_FIX_1101_PUSH).
import { GUIDE_FACT_FIX_1101_PUSH } from "@/config/guideFactFixPush";
import { TWO_HOME_LAW_FIX_PUSH } from "@/config/twoHomeLawFixPush";

export const GUIDE_CONTENT_REVISED_TWO_HOME_LAW: Readonly<Record<string, string>> = {
  "one-home-capital-gains-12eok-2026": TWO_HOME_LAW_FIX_PUSH,
  "property-downsizing-1home-2026": GUIDE_FACT_FIX_1101_PUSH, // 절차 목록 2. 큰 집 원칙 3년 내 매도 (STR-07 D1)
  "real-estate-capital-gains-2026": GUIDE_FACT_FIX_1101_PUSH, // Step 3 신규 취득 후 원칙 3년 내 (STR-07 R1)
  "temp-two-home-3year-rule-2026": GUIDE_FACT_FIX_1101_PUSH, // 제목 T1·검색 설명 T2·본문 T3~T6 원칙 3년·3단계 근거 없는 수치 삭제 (STR-07) · 목록 ② 1년 요건(종전 취득 → 신규 취득) 정정 (R2-FOLLOWUPS)
};
