// /insights/bonus-payout-history-2026/data.csv — 리포트 원본 데이터(성과급 실지급률) CSV 내려받기.
// rss-companies.xml 패턴(정적 GET) — 빌드 시 프리렌더, BOM 포함(엑셀 한글), 공개 캐시.
// 직렬화·열 정의는 ../../_lib/reportDatasets.ts 단일 소스 (2026-09-05).
// ★middleware matcher 제외 등재 필수 — curl·pandas UA 가 403 나지 않도록.

import { buildBonusCsv, csvResponse } from "../../_lib/reportDatasets";

export const dynamic = "force-static";

export async function GET() {
  return csvResponse(buildBonusCsv(), "moneysalary-bonus-payout-history-2026.csv");
}
