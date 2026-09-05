// /insights/listed-avg-salary-top100-2026/data.json — 리포트 원본 데이터(공시 평균연봉 TOP 100) JSON.
// CSV 와 같은 행 + 메타(license·temporalCoverage·citation·열 설명) 봉투.
// 직렬화는 ../../_lib/reportDatasets.ts 단일 소스 (2026-09-05).

import { buildListedJson, jsonResponse } from "../../_lib/reportDatasets";

export const dynamic = "force-static";

export async function GET() {
  return jsonResponse(buildListedJson());
}
