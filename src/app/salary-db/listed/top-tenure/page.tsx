// src/app/salary-db/listed/top-tenure/page.tsx
//
// 평균 근속연수 TOP 100 — DART 공시 기반 (2026-08-30 승인 배치).
// 광고는 salary-db/layout.tsx 상속 — 광고 코드 없음.

import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import MetricRankingView, { fmtManwon } from "../MetricRankingView";
import {
  topTenureRows,
  tenureEligibleCount,
  DART_RANKING_YEAR,
} from "@/lib/salary-data/dartRanking";

export const dynamic = "force-static";

const PATH = "/salary-db/listed/top-tenure";
const top1 = topTenureRows[0];

const fmtYears = (y?: number) => (y != null ? `${Math.round(y * 10) / 10}년` : "—");

export const metadata: Metadata = buildPageMetadata({
  title: `평균 근속연수 TOP ${topTenureRows.length} — 오래 다니는 회사 (${DART_RANKING_YEAR} 공시)`,
  description: `직원 평균 근속연수가 가장 긴 상장사 TOP ${topTenureRows.length}. DART 사업보고서 공시 기준(근속 공시 ${tenureEligibleCount.toLocaleString("ko-KR")}곳) — 정년까지 다니기 좋은 회사를 데이터로 확인하세요.`,
  path: PATH,
  keywords: ["근속연수 긴 회사", "평균 근속연수 순위", "오래 다니는 회사", "정년 보장 회사"],
});

export default function TopTenurePage() {
  return (
    <MetricRankingView
      cfg={{
        path: PATH,
        h1: `평균 근속연수 TOP ${topTenureRows.length}`,
        heroLead: (
          <>
            직원들이 가장 오래 다니는 상장사 순위입니다. {DART_RANKING_YEAR} 사업보고서에 평균
            근속연수를 공시한 상장사 {tenureEligibleCount.toLocaleString("ko-KR")}곳 기준이며,
            1위는 <strong className="text-navy">{top1.nameKo}</strong>(
            {fmtYears(top1.avgTenureYears)}, 평균연봉 {fmtManwon(top1.avgSalaryManwon)})입니다.
            근속이 길수록 고용 안정성·복지 만족도가 높은 경향이 있습니다.
          </>
        ),
        valueHeader: "평균 근속",
        renderValue: (row) => fmtYears(row.avgTenureYears),
        faqItems: [
          {
            question: "평균 근속연수가 가장 긴 상장사는 어디인가요?",
            answer: `${DART_RANKING_YEAR} 공시 기준 ${top1.nameKo}로, 평균 근속 ${fmtYears(top1.avgTenureYears)}입니다 (평균연봉 ${fmtManwon(top1.avgSalaryManwon)}).`,
          },
          {
            question: "근속연수는 어떤 데이터인가요?",
            answer: "각 회사가 DART 사업보고서 「직원 등의 현황」에 공시한 직원 평균 근속연수입니다. 회사별로 산정 범위(기간제 포함 여부 등)가 다를 수 있어 공시 원문 기준으로 표기합니다.",
          },
          {
            question: "근속연수가 길면 무조건 좋은 회사인가요?",
            answer: "근속이 길면 고용 안정성이 높다는 신호지만, 신규 채용이 적거나 연공서열 문화가 강한 경우도 있습니다. 평균연봉·인상률과 함께 비교하는 것이 좋습니다.",
          },
        ],
        methodologyExtra: `근속연수를 공시한 ${tenureEligibleCount.toLocaleString("ko-KR")}곳 기준입니다.`,
        datasetName: `상장사 평균 근속연수 TOP ${topTenureRows.length} (${DART_RANKING_YEAR})`,
        rows: topTenureRows,
      }}
    />
  );
}
