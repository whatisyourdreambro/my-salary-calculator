// src/config/relandR1Push.ts
//
// 운영자 2026-11-01 승인 7번(10월 미배포분 소규모 재착지) R1 묶음(RL-01~RL-07, 통합 가지 claude/reland-r1-1102)의
// 원장 기준일(KST 달력일) — 통합 원장 단계를 마친 날.
// 쓰는 곳: src/lib/guideContentRevisions.relandR1.ts (광고 아래 보강·같은 폭 정정으로 사실 문장이 바뀌고 이미 '수정' 칩이 있는 가이드 11편)
//   → 그 글의 상세 화면 날짜(히어로 수정·하단 마지막 내용 수정)·OG·사이트맵 lastmod·Article dateModified.
// 같은 날짜를 리터럴로 쓰는 곳(정적 판정 때문에 상수를 못 씀): src/app/sitemap.ts ROUTE_OVERRIDES 의 /calc/holiday-bonus·
//   /chuseok-bonus-2026, scripts/sitemap-content-reviews.json 그 두 항목의 contentDate, src/app/chuseok-bonus-2026/page.tsx 수정일 3곳.
// 정본 modifiedDate 는 올리지 않는다 — 목록·관련 글 순서 불변(광고 위 카드 불변, 이유는 src/config/guideFactFixPush.ts 머리 주석).
// 규칙: 게시일에 날짜를 옮길 때는 이 값과 위 리터럴을 함께 옮긴다. 미래 날짜를 남기지 않는다(verify-sitemap 미래 lastmod 게이트,
//   guideSpec 미래 날짜 금지).

/** R1 재착지(RL-01·RL-02 가이드 보강·정정, RL-05 설·추석 접힌 FAQ) 원장 기준일 */
export const RELAND_R1_PUSH = "2026-11-03";
