// src/app/salary-db/listed/top-raise/page.tsx
//
// 연봉 인상률 TOP 100 — DART 공시 기반 (2026-08-30 승인 배치).
// 데이터·가드는 src/lib/salary-data/dartRanking.ts 단일 소스.
// 광고는 salary-db/layout.tsx 상속 — 광고 코드 없음.
// DATA-07 (2026-09-25): 최저임금 미달 연도 제외 + 이상치(+100% 초과·직원 50명 미만) 분리 —
// 인용 자산이라 날짜 붙은 정정 메모를 방법론에 남기고, 이상치 목록은 페이지 최하단(방법론 안)에만.

import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import MetricRankingView, { fmtManwon } from "../MetricRankingView";
import {
  topRaiseRows,
  topRaiseOutlierRows,
  raiseEligibleCount,
  DART_RANKING_YEAR,
  RAISE_PREV_YEAR,
  RAISE_OUTLIER_MAX_PCT,
  RAISE_MIN_EMPLOYEES,
  MIN_WAGE_ANNUAL_MANWON,
} from "@/lib/salary-data/dartRanking";

export const dynamic = "force-static";

const PATH = "/salary-db/listed/top-raise";
const top1 = topRaiseRows[0];
/** 정정 메모 날짜 — 순위 기준 변경일 (조용한 변경 금지 — 인용 자산) */
const CORRECTION_DATE = "2026-09-25";

const pct = (v?: number) => (v != null && v >= 0 ? `+${v}` : `${v}`);
const minWageLabel = (year: string) =>
  `${Math.round(MIN_WAGE_ANNUAL_MANWON[year]).toLocaleString("ko-KR")}만원`;

export const metadata: Metadata = buildPageMetadata({
  title: `연봉 인상률 TOP ${topRaiseRows.length} — 상장사 공시 기준 (${DART_RANKING_YEAR})`,
  description: `전년 대비 평균연봉 인상률이 가장 높은 상장사 TOP ${topRaiseRows.length}. DART 사업보고서 공시 원값 기준(비교 가능 ${raiseEligibleCount.toLocaleString("ko-KR")}곳), 직원 수 급변·최저임금 미달·이상치 제외 — 추정 0.`,
  path: PATH,
  keywords: ["연봉 인상률 높은 기업", "연봉 인상률 순위", "상장사 연봉 인상", "연봉 많이 오른 회사"],
});

/** 순위에서 뺀 이상치 목록 — 접힌 details (방법론 섹션 안, 본문 광고 전부의 아래) */
function OutlierList() {
  if (topRaiseOutlierRows.length === 0) return null;
  return (
    <details className="mt-3 rounded-xl border border-canvas-200 bg-white p-4">
      <summary className="cursor-pointer text-xs font-bold text-navy">
        순위에서 뺀 이상치 {topRaiseOutlierRows.length}곳 보기 (인상률 +{RAISE_OUTLIER_MAX_PCT}% 초과 또는 직원{" "}
        {RAISE_MIN_EMPLOYEES}명 미만)
      </summary>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-xs min-w-[480px]">
          <thead>
            <tr className="border-b border-canvas-200 text-left text-faint-blue">
              <th className="py-1.5 pr-3 font-bold">회사</th>
              <th className="py-1.5 pr-3 font-bold">인상률(전년比)</th>
              <th className="py-1.5 pr-3 font-bold">직원 수</th>
              <th className="py-1.5 font-bold">제외 사유</th>
            </tr>
          </thead>
          <tbody>
            {topRaiseOutlierRows.map((row) => (
              <tr key={row.stockCode || row.nameKo} className="border-b border-canvas-200/60">
                <td className="py-1.5 pr-3 font-bold text-navy">{row.nameKo}</td>
                <td className="py-1.5 pr-3 tabular-nums text-muted-blue">
                  {pct(row.raisePct)}% ({fmtManwon(row.prevSalaryManwon ?? 0)}→{fmtManwon(row.avgSalaryManwon)})
                </td>
                <td className="py-1.5 pr-3 tabular-nums text-muted-blue">
                  {row.employeeCount.toLocaleString("ko-KR")}명
                </td>
                <td className="py-1.5 text-muted-blue">{row.outlierReason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs leading-6 text-muted-blue">
        스톡옵션 행사·부분연도 근무·소수 인원 효과로 평균이 크게 튀는 경우라 순위와 인용문에서 뺐습니다.
        공시 원값 자체는 그대로 표기합니다.
      </p>
    </details>
  );
}

export default function TopRaisePage() {
  return (
    <MetricRankingView
      cfg={{
        path: PATH,
        h1: `연봉 인상률 TOP ${topRaiseRows.length}`,
        heroLead: (
          <>
            {DART_RANKING_YEAR} 사업연도 공시 평균연봉이 전년({RAISE_PREV_YEAR}) 대비 가장 많이 오른 상장사
            순위입니다. 비교 가능한 상장사 {raiseEligibleCount.toLocaleString("ko-KR")}곳 기준이며,
            1위는 <strong className="text-navy">{top1.nameKo}</strong>(
            {pct(top1.raisePct)}%,{" "}
            {fmtManwon(top1.prevSalaryManwon ?? 0)} → {fmtManwon(top1.avgSalaryManwon)})입니다.
            직원 수 급변·최저임금 미달 등 왜곡 가능성이 큰 회사는 순위에서 뺐습니다.
          </>
        ),
        valueHeader: "인상률(전년比)",
        renderValue: (row) => (
          <>
            {pct(row.raisePct)}%
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
            answer: `${DART_RANKING_YEAR} 공시 기준 ${top1.nameKo}로, 전년 대비 ${pct(top1.raisePct)}%(${fmtManwon(
              top1.prevSalaryManwon ?? 0
            )} → ${fmtManwon(top1.avgSalaryManwon)}) 올랐습니다.`,
          },
          {
            question: "인상률은 어떻게 계산하나요?",
            answer: `각 회사의 ${DART_RANKING_YEAR} 사업보고서 공시 평균연봉을 ${RAISE_PREV_YEAR} 사업연도 공시값과 비교한 증감률입니다. 두 해 모두 공시가 있는 상장사만 비교하며, 직원 수가 30% 넘게 변한 회사(합병·분할 등)와 두 해 중 한 해라도 평균연봉이 그해 연간 최저임금 환산액(${RAISE_PREV_YEAR}년 ${minWageLabel(
              RAISE_PREV_YEAR
            )}·${DART_RANKING_YEAR}년 ${minWageLabel(
              DART_RANKING_YEAR
            )}, 시급×209시간×12)보다 낮은 회사(부분연도·단시간 인력 혼입 신호)는 제외합니다. 인상률 +${RAISE_OUTLIER_MAX_PCT}% 초과 또는 직원 ${RAISE_MIN_EMPLOYEES}명 미만은 이상치로 보고 순위에서 빼 페이지 하단에 따로 표시합니다(${CORRECTION_DATE} 기준 변경).`,
          },
          {
            question: "인상률이 높으면 좋은 회사인가요?",
            answer: "평균연봉 인상은 임금 인상 외에 성과급 지급 시점, 고연봉 인력 채용, 인력 구조 변화로도 발생합니다. 절대 연봉 수준·근속연수와 함께 보는 것이 정확합니다.",
          },
        ],
        methodologyExtra: `인상률은 ${RAISE_PREV_YEAR} 공시 대비 증감률입니다. 두 해 공시가 모두 있고 직원 수 변동 ±30% 이내이며 두 해 평균연봉이 그해 연간 최저임금 환산액(${minWageLabel(
          RAISE_PREV_YEAR
        )}·${minWageLabel(DART_RANKING_YEAR)}) 이상인 회사 중 이상치(+${RAISE_OUTLIER_MAX_PCT}% 초과·직원 ${RAISE_MIN_EMPLOYEES}명 미만)를 뺀 ${raiseEligibleCount.toLocaleString(
          "ko-KR"
        )}곳을 비교했습니다. [${CORRECTION_DATE} 정정] 종전 순위는 직원 수 급변만 걸러, 전년 평균이 최저임금 환산액에 못 미치는 회사와 이상치가 상위를 차지했습니다. 이들을 순위·인용문에서 빼고 이상치는 아래 목록에 따로 표시합니다.`,
        methodologyAppendix: <OutlierList />,
        datasetName: `상장사 연봉 인상률 TOP ${topRaiseRows.length} (${DART_RANKING_YEAR})`,
        rows: topRaiseRows,
        // R2 B4 (2026-08-31) — 데이터 변수 기반 인용문 (하드코딩 금지). 순위 행(top1)만 사용 — 이상치 인용 금지
        citation: {
          quote: `${DART_RANKING_YEAR} 사업연도 DART 공시 기준 평균연봉 인상률 1위 상장사는 ${top1.nameKo}로, 전년 대비 ${pct(top1.raisePct)}%(${fmtManwon(top1.prevSalaryManwon ?? 0)} → ${fmtManwon(top1.avgSalaryManwon)}) 올랐다. 비교 가능한 상장사 ${raiseEligibleCount.toLocaleString("ko-KR")}곳 기준이며 직원 수 급변·최저임금 미달·이상치 기업은 제외했다.`,
          quoteId: "top-raise-no1",
        },
      }}
    />
  );
}
