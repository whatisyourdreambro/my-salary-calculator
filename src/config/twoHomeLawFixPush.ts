// src/config/twoHomeLawFixPush.ts
//
// 일시적 2주택 처분 기한 개정 반영 푸시일(KST 달력일) — 소득세법 시행령 제155조 제1항·부칙 제2조
// (대통령령 제36737호, 2026. 9. 30. 공포, 2026. 10. 1. 시행) 내용을 가이드 4편의 마지막 광고 아래 보강
// (src/lib/guides/supplements-two-home-law.ts)에 넣은 푸시가 main 에 들어간 날.
// 쓰는 곳: 그 4편의 사이트맵 lastmod·Article dateModified(src/lib/guideContentRevisions.twoHomeLaw.ts).
// 화면 날짜(히어로 수정 칩·하단 상자)·목록 정렬·og article:modified_time 은 바꾸지 않는다.
//
// 기본값 2026-10-11 = 런북(moneysalary-ops/2026-10/deploy-runbook-2026-10.md)이 이 정정을 실을 수 있는 가장 이른 날:
//   10/9 까지는 광고 아래 새 섹션 금지(10/2 절 '광고 아래 새 섹션(10/9 뒤)'), 10/9 는 푸시 없음(P0 14일 판독),
//   10/10 은 W2 한 번만, 10/11 은 빈 날(A15 10/1 보류).
// 규칙: 푸시가 다른 날 나가면 이 값만 실제 푸시일로 고친다. 미래 날짜를 남기지 않는다(10/15 뒤 verify-sitemap 미래 lastmod 게이트 MI-18).
// 10/15 날짜 정정 묶음(deployDates2026Oct.ts)이 들어온 뒤 그 파일로 옮겨도 된다.

/** 일시적 2주택 처분 기한(조정대상지역 2년) 개정 반영 — 가이드 4편 광고 아래 보강 */
export const TWO_HOME_LAW_FIX_PUSH = "2026-10-11";
