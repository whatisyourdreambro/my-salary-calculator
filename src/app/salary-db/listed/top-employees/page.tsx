// src/app/salary-db/listed/top-employees/page.tsx
//
// 직원 수 TOP 100 — DART 공시 기반 (2026-08-30 승인 배치).
// 광고는 salary-db/layout.tsx 상속 — 광고 코드 없음.

import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import MetricRankingView, { fmtManwon } from "../MetricRankingView";
import {
  topEmployeesRows,
  LISTED_TOTAL,
  DART_RANKING_YEAR,
} from "@/lib/salary-data/dartRanking";

export const dynamic = "force-static";

const PATH = "/salary-db/listed/top-employees";
const top1 = topEmployeesRows[0];

export const metadata: Metadata = buildPageMetadata({
  title: `직원 수 TOP ${topEmployeesRows.length} — 가장 큰 상장사 (${DART_RANKING_YEAR} 공시)`,
  description: `직원 수가 가장 많은 상장사 TOP ${topEmployeesRows.length}. DART 사업보고서 공시 기준(상장사 ${LISTED_TOTAL.toLocaleString("ko-KR")}곳) — 고용 규모와 평균연봉을 함께 확인하세요.`,
  path: PATH,
  keywords: ["직원 수 많은 회사", "대기업 직원 수", "고용 규모 순위", "상장사 직원 수"],
});

export default function TopEmployeesPage() {
  return (
    <MetricRankingView
      cfg={{
        path: PATH,
        h1: `직원 수 TOP ${topEmployeesRows.length}`,
        heroLead: (
          <>
            고용 규모가 가장 큰 상장사 순위입니다. {DART_RANKING_YEAR} 사업보고서 공시 기준
            상장사 {LISTED_TOTAL.toLocaleString("ko-KR")}곳 중 1위는{" "}
            <strong className="text-navy">{top1.nameKo}</strong>(
            {top1.employeeCount.toLocaleString("ko-KR")}명, 평균연봉{" "}
            {fmtManwon(top1.avgSalaryManwon)})입니다. 직원 수는 채용 기회의 규모이기도 합니다.
          </>
        ),
        valueHeader: "직원 수",
        renderValue: (row) => `${row.employeeCount.toLocaleString("ko-KR")}명`,
        faqItems: [
          {
            question: "직원 수가 가장 많은 상장사는 어디인가요?",
            answer: `${DART_RANKING_YEAR} 공시 기준 ${top1.nameKo}로, 직원 ${top1.employeeCount.toLocaleString("ko-KR")}명입니다 (평균연봉 ${fmtManwon(top1.avgSalaryManwon)}).`,
          },
          {
            question: "직원 수는 어떤 기준인가요?",
            answer: "DART 사업보고서 「직원 등의 현황」에 공시된 직원 수(등기임원 제외)로, 기간제 근로자 포함 범위는 회사 공시에 따릅니다.",
          },
          {
            question: "직원 수가 많으면 연봉도 높나요?",
            answer: "반드시 그렇지는 않습니다. 고용 규모와 평균연봉은 업종 특성에 따라 다르며, 표의 평균연봉 열과 업종별 순위 페이지에서 함께 비교할 수 있습니다.",
          },
        ],
        methodologyExtra: "직원 수 기준 내림차순 순위입니다.",
        datasetName: `상장사 직원 수 TOP ${topEmployeesRows.length} (${DART_RANKING_YEAR})`,
        rows: topEmployeesRows,
      }}
    />
  );
}
