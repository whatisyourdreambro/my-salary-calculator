// src/config/guideFactFixPush.ts
//
// 2026-11-01 가이드 사실 정정 묶음(PKG-23) 푸시일(KST 달력일).
// 쓰는 곳: 이 묶음으로 제목·본문 문장이 바뀐 가이드의 본문 정정일 표
//   - src/lib/guideContentRevisions.twoHomeLaw.ts (일시적 2주택 처분 기한 — 제목·본문 원칙 3년/조정 두 채 2년, STR-07)
//   - src/lib/guideContentRevisions.factFix1101.ts (표준세액공제 비교 문장 CALC-02 — 아동수당 DATA-02 는 문구만 고치고 표에는 아직 없음,
//     이유는 그 파일 머리 주석)
//   → 그 글의 상세 화면 날짜(히어로 수정·하단 마지막 내용 수정)·OG·사이트맵 lastmod·Article dateModified.
// 정본 modifiedDate 는 올리지 않는다: modifiedDate(guideDiscovery compareGuideDates)는 /guides 최신순 첫 카드·홈 편집 추천·
//   가이드 관련 글 3편·계산기 함께 볼 가이드의 동점 순서를 정해서, 올리면 그 목록의 카드가 바뀌어 광고 위 높이가 달라진다
//   (2026-11-01 계산: 아동수당·표준세액공제 두 편만 올려도 자동 목록 500경로 중 290곳이 바뀜 — 가이드 86·계산기 202·/guides·홈).
// 규칙: 푸시가 다른 날 나가면 이 값만 실제 푸시일로 고친다. 미래 날짜를 남기지 않는다(verify-sitemap 미래 lastmod 게이트,
//   guideSpec 키퍼 미래 날짜 금지).

/** 2026-11-01 가이드 사실 정정 묶음(아동수당 2026 지급 연령·일시적 2주택 2년 기한·표준세액공제 비교) 푸시일 */
export const GUIDE_FACT_FIX_1101_PUSH = "2026-11-01";
