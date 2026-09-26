// src/lib/guides/trend-briefs.ts
//
// 공식 발표 해설(트렌드 브리프) 집계 — 2026-09-26 R5 publisher 신설. 처음엔 비어 있다.
// 월별 파일 src/lib/guides/trend-briefs-YYYY-MM.ts 는 scripts/trend-publish/render.ts 만 만든다.
// render.ts 가 아래 두 표식 바로 뒤에 import 한 줄과 spread 한 줄을 끼운다 — ★손으로 고치지 말 것.
// 발행은 운영자의 브리프별 승인('발행 <slug>')을 받은 scripts/trend-publish/publish-approved.mjs 만,
// 철회는 '철회 <slug>' → 항목 제거 + 허브로 308. 런북: docs/trend-publishing-runbook.md
// 브리프는 태그 공식발표해설(TREND_BRIEF_TAG)을 달고, 홈 추천(FeaturedGuides) 최근 슬롯에는 들어가지 않는다.
import type { Guide } from "@/lib/guidesData";
// @trend-imports

export const trendBriefGuides: Guide[] = [
  // @trend-spread
];
