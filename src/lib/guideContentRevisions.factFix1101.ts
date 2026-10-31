// src/lib/guideContentRevisions.factFix1101.ts
//
// 2026-11-01 가이드 사실 정정 묶음(PKG-23)으로 제목·본문 문장이 바뀐 글의 본문 정정일(일시적 2주택 4편 제외 —
// 그 글들은 guideContentRevisions.twoHomeLaw.ts 가 같은 푸시일 상수로 맡는다).
// guideContentRevisions.ts 가 mergeLatest 로 합친다(상세 화면 날짜·OG·사이트맵 lastmod·Article dateModified 공통).
// 정본 modifiedDate 를 올리지 않는 이유는 src/config/guideFactFixPush.ts 머리 주석 — 목록·관련 글 순서 불변(광고 위 카드 불변).
// 값 규칙: 그 글의 제목·설명·본문·보강 문장이 실제로 바뀐 묶음만 넣는다. 서버 전용(클라이언트 번들에 싣지 않는다).
import { GUIDE_FACT_FIX_1101_PUSH } from "@/config/guideFactFixPush";

export const GUIDE_CONTENT_REVISED_FACT_FIX_1101: Readonly<Record<string, string>> = {
  // 계산기가 표준세액공제 13만원 방식과 비교해 낮은 결정세액을 쓴다는 문장(CALC-02, 엔진은 PKG-10)·2,500만원 행 229,438원
  "standard-vs-special-deduction-2026": GUIDE_FACT_FIX_1101_PUSH,
};
