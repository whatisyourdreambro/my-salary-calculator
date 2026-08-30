// src/app/salary-db/listed/top-raise/page.tsx
//
// 연봉 인상률 TOP 100 — DART 공시 기반 (2026-08-30 승인 배치).
// 데이터·가드는 src/lib/salary-data/dartRanking.ts 단일 소스.
// 광고는 salary-db/layout.tsx 상속 — 광고 코드 없음.

import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import MetricRankingView, { fmtManwon } from "../MetricRankingView";
import {
  topRaiseRows,
  raiseEligibleCount,
  DART_RANKING_YEAR,
} from "@/lib/salary-data/dartRanking";

export const dynamic = "force-static";

const PATH = "/salary-db/listed/top-raise";
const top1 = topRaiseRows[0];

export const metadata: Metadata = buildPageMetadata({
  title: `연봉 인상률 TOP ${topRaiseRows.length} — 상장사 공시 기준 (${DART_RANKING_YEAR})`,
  description: `전년 대비 평균연봉 인상률이 가장 높은 상장사 TOP ${topRaiseRows.length}. DART 사업보고서 공시 원값 기준(비교 가능 ${raiseEligibleCount.toLocaleString("ko-KR")}곳), 직원 수 급변 기업 제외 — 추정 0.`,
  path: PATH,
  keywords: ["연봉 인상률 높은 기업", "연봉 인상률 순위", "상장사 연봉 인상", "연봉 많이 오른 회사"],
});

export default function TopRaisePage() {
  return (
    <MetricRankingView
      cfg={{
        path: PATH,
        h1: `연봉 인상률 TOP ${topRaiseRows.length}`,
        heroLead: (
          <>
            {DART_RANKING_YEAR} 사업연도 공시 평균연봉이 전년(2024) 대비 가장 많이 오른 상장사
            순위입니다. 비교 가능한 상장사 {raiseEligibleCount.toLocaleString("ko-KR")}곳 기준이며,
            1위는 <strong className="text-navy">{top1.nameKo}</strong>(
            {top1.raisePct != null && top1.raisePct >= 0 ? `+${top1.raisePct}` : top1.raisePct}%,{" "}
            {fmtManwon(top1.prevSalaryManwon ?? 0)} → {fmtManwon(top1.avgSalaryManwon)})입니다.
            합병·분할로 직원 수가 30% 넘게 변한 회사는 왜곡 방지를 위해 제외했습니다.
          </>
        ),
        valueHeader: "인상률(전년比)",
        renderValue: (row) => (
          <>
            {row.raisePct != null && row.raisePct >= 0 ? `+${row.raisePct}` : row.raisePct}%
            {row.prevSalaryManwon != null && (
              <span className="ml-1 text-xs font-normal text-faint-blue">
                ({fmtManwon(row.prevSalaryManwon)}→)
              </span>
            )}
          </>
        ),
        faqItems: [
          {
            question: "연봉 인상률이 가장 높은 상장사는 어디인가요?",
            answer: `${DART_RANKING_YEAR} 공시 기준 ${top1.nameKo}로, 전년 대비 ${
              top1.raisePct != null && top1.raisePct >= 0 ? `+${top1.raisePct}` : top1.raisePct
            }%(${fmtManwon(top1.prevSalaryManwon ?? 0)} → ${fmtManwon(top1.avgSalaryManwon)}) 올랐습니다.`,
          },
          {
            question: "인상률은 어떻게 계산하나요?",
            answer: `각 회사의 ${DART_RANKING_YEAR} 사업보고서 공시 평균연봉을 2024 사업연도 공시값과 비교한 증감률입니다. 두 해 모두 공시가 있는 상장사만 비교하며, 직원 수가 30% 넘게 변한 회사(합병·분할 등)는 평균값 왜곡을 막기 위해 제외합니다.`,
          },
          {
            question: "인상률이 높으면 좋은 회사인가요?",
            answer: "평균연봉 인상은 임금 인상 외에 성과급 지급 시점, 고연봉 인력 채용, 인력 구조 변화로도 발생합니다. 절대 연봉 수준·근속연수와 함께 보는 것이 정확합니다.",
          },
        ],
        methodologyExtra: `인상률은 2024 공시 대비 증감률로, 두 해 공시가 모두 있는 ${raiseEligibleCount.toLocaleString("ko-KR")}곳을 비교했고 직원 수 ±30% 초과 변동 회사는 제외했습니다.`,
        datasetName: `상장사 연봉 인상률 TOP ${topRaiseRows.length} (${DART_RANKING_YEAR})`,
        rows: topRaiseRows,
      }}
    />
  );
}
