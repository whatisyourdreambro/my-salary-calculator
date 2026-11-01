// src/lib/guideContentRevisions.factFix1101.ts
//
// 2026-11-01 가이드 사실 정정 묶음(PKG-23)으로 제목·본문 문장이 바뀐 글의 본문 정정일(일시적 2주택 4편 제외 —
// 그 4편은 guideContentRevisions.twoHomeLaw.ts 가 맡고, 이 묶음에서 문장이 바뀐 글만 같은 푸시일 상수를 쓴다).
// guideContentRevisions.ts 가 mergeLatest 로 합친다(상세 화면 날짜·OG·사이트맵 lastmod·Article dateModified 공통).
// 정본 modifiedDate 를 올리지 않는 이유는 src/config/guideFactFixPush.ts 머리 주석 — 목록·관련 글 순서 불변(광고 위 카드 불변).
// 값 규칙: 그 글의 제목·설명·본문·보강 문장이 실제로 바뀐 묶음만 넣는다. 서버 전용(클라이언트 번들에 싣지 않는다).
// 아동수당(child-support-100-2026, DATA-02)은 제목·설명·본문을 고쳤지만 아직 넣지 않았다: 그 글은 수정일이 없어 히어로에
//   '수정' 칩이 없고, 여기 넣으면 GuideMidAd 위에 새 칩이 생긴다(광고 위 UI 추가). 실측 스윕에서 광고 하향 0 을 확인한 뒤 한 줄로 더한다.
import { GUIDE_FACT_FIX_1101_PUSH } from "@/config/guideFactFixPush";

export const GUIDE_CONTENT_REVISED_FACT_FIX_1101: Readonly<Record<string, string>> = {
  // 계산기가 표준세액공제 13만원 방식과 비교해 낮은 결정세액을 쓴다는 문장(CALC-02, 엔진은 PKG-10)·2,500만원 행 229,438원
  "standard-vs-special-deduction-2026": GUIDE_FACT_FIX_1101_PUSH,
  // 같은 CALC-02 후속(R2-FOLLOWUPS): 표가 '계산기와 같은 엔진'이라던 문장을 '계산기 엔진으로 낸 특별공제 방식 값'으로,
  // 리드의 3,000만원 값을 계산기가 고르는 표준세액공제 방식(약 9만원) 먼저로. 이미 수정일(9/26)이 있어 칩은 날짜만 바뀐다.
  "housing-subscription-25man-deduction-2026": GUIDE_FACT_FIX_1101_PUSH,
};
