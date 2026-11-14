// src/config/relandR1Push.ts
//
// 운영자 2026-11-01 승인 7번(10월 미배포분 소규모 재착지) R1 묶음(RL-01~RL-07, 통합 가지 claude/reland-r1-1102)의
// 원장 기준일(KST 달력일) — 통합 원장 단계를 마친 날.
// 쓰는 곳:
//   - src/lib/guideContentRevisions.relandR1.ts — 화면 날짜까지 올리는 가이드 1편(쿠팡 야간 가이드: 광고 위 제목·TL;DR·본문 정정)
//     → 그 글의 상세 화면 날짜(히어로 수정·하단 마지막 내용 수정)·OG·사이트맵 lastmod·Article dateModified.
//   - src/lib/guideSitemapDates.ts — 사이트맵 lastmod·rss.xml pubDate 만 올리는 가이드 36편: '수정' 칩이 없는 광고 아래 보강 26편과
//     이미 '수정' 칩(2026.10.03)이 있는 10편. 이 10편은 R1 원장(d48f17877)이 위 표에 넣었다가, 칩 숫자가 2026.11.03 으로 바뀌자
//     화면 폭 440~445px 에서 제목 아래 광고가 24px 내려가(가드 스윕 실측) 2026-11-15 에 옮겼다. 화면·OG·Article 날짜는 운영 값
//     2026-10-03 그대로다(실측과 규칙은 두 파일 머리 주석).
// 같은 날짜를 리터럴로 쓰는 곳(정적 판정 때문에 상수를 못 씀): src/app/sitemap.ts ROUTE_OVERRIDES 의 /calc/holiday-bonus·
//   /chuseok-bonus-2026, scripts/sitemap-content-reviews.json 그 두 항목의 contentDate, src/app/chuseok-bonus-2026/page.tsx 수정일 3곳.
//   테스트가 고정한 리터럴: relandR1Ledger.test.ts 와 guideRevisionDates.test.ts 의 R1_LEDGER_DAY(위 10편의 사이트맵 날짜).
// 정본 modifiedDate 는 올리지 않는다 — 목록·관련 글 순서 불변(광고 위 카드 불변, 이유는 src/config/guideFactFixPush.ts 머리 주석).
// 규칙: 게시일에 날짜를 옮길 때는 이 값과 위 리터럴을 함께 옮긴다. 미래 날짜를 남기지 않는다(verify-sitemap 미래 lastmod 게이트,
//   guideSpec 미래 날짜 금지).

/** R1 재착지(RL-01·RL-02 가이드 보강·정정, RL-05 설·추석 접힌 FAQ) 원장 기준일 */
export const RELAND_R1_PUSH = "2026-11-03";
