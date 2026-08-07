// src/components/CompanyUniqueStats.tsx
//
// 회사 페이지 — 회사 고유 심층 지표 카드 (server component, SEO 텍스트).
// 전 회사 공통 치환 템플릿이 아니라, 회사마다 실제 값이 달라지는 4개 지표
// (전국 순위 · 실질 시급 · 복지 가치 · 누적 소득)를 기존 데이터 필드만으로
// 계산해 thin content 판정을 깨는 고유 신호를 추가한다.
// 데이터가 없는 지표는 카드 자체를 렌더하지 않는다 (추정 문구 금지).

import { Trophy, Clock, Gift, TrendingUp } from "lucide-react";
import type { CompanyProfile } from "@/types/company";
import {
  getOverallRank,
  getRealHourlyWage,
  getBenefitsValue,
  getCumulativeIncome,
  formatSalaryKorean,
  industryLabelKo,
} from "@/lib/companyContentBuilder";

function fmt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}

/** ±N% 표기 — 양수면 + 붙임 */
function signedPercent(p: number) {
  return p >= 0 ? `+${p}%` : `${p}%`;
}

export default function CompanyUniqueStats({
  company,
}: {
  company: CompanyProfile;
}) {
  const koName = company.name.ko;
  const overallRank = getOverallRank(company);
  const hourlyWage = getRealHourlyWage(company);
  const benefitsValue = getBenefitsValue(company);
  const cumulativeIncome = getCumulativeIncome(company);

  // 렌더할 카드가 하나도 없으면 섹션 자체를 생략
  if (!overallRank && !hourlyWage && !benefitsValue && !cumulativeIncome) {
    return null;
  }

  const industryKo = industryLabelKo(company.industry);
  const lastPoint = cumulativeIncome?.[cumulativeIncome.length - 1];

  // 복지 가치 업종 비교는 회사별 데이터 완성도 차이(어떤 회사는 14개 항목에
  // 금액이 있고 어떤 회사는 1개뿐)로 극단값이 나올 수 있다 — 실제 격차가
  // 아니라 수집 밀도 차이인 구간(+300% 초과 / −80% 미만)은 비교 표시를
  // 생략하고 합산액만 노출한다. (2026-08-07 전수 스캔: 극단 9개사 확인)
  const showBenefitsComparison =
    benefitsValue !== null &&
    benefitsValue.diffPercent !== null &&
    benefitsValue.industryAvg !== null &&
    benefitsValue.diffPercent <= 300 &&
    benefitsValue.diffPercent >= -80;

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-navy dark:text-canvas-50 mb-2">
          {koName} 심층 지표 — 전국 순위·실질 시급·복지·누적 소득
        </h2>
        <p className="text-sm text-muted-blue dark:text-canvas-300">
          머니샐러리 연봉 DB 전체 회사 데이터에서 {koName}의 위치를 실제 수치로
          계산한 결과입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. 전국 연봉 순위 */}
        {overallRank && (
          <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-electric mb-2 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              전국 연봉 순위
            </p>
            <p className="text-2xl font-black text-navy dark:text-canvas-50 mb-1">
              {fmt(overallRank.total)}개사 중 {fmt(overallRank.rank)}위
            </p>
            <p className="text-sm font-bold text-electric mb-2">
              상위 {overallRank.percentile}%
            </p>
            <p className="text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
              머니샐러리 연봉 DB 전체 {fmt(overallRank.total)}개 회사의 신입
              영끌 연봉(기본급+평균 인센티브) 기준으로 {koName}은(는) 상위{" "}
              {overallRank.percentile}% 구간에 위치합니다.
            </p>
          </div>
        )}

        {/* 2. 실질 시급 */}
        {hourlyWage && (
          <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-electric mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              실질 시급 환산
            </p>
            <p className="text-2xl font-black text-navy dark:text-canvas-50 mb-1">
              시급 약 {fmt(hourlyWage.hourly)}원
            </p>
            {hourlyWage.diffPercent !== null && (
              <p
                className={`text-sm font-bold mb-2 ${
                  hourlyWage.diffPercent >= 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {industryKo} 평균 대비 {signedPercent(hourlyWage.diffPercent)}
              </p>
            )}
            <p className="text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
              신입 영끌 연봉을 주 실근무 {hourlyWage.weeklyRealHours}시간 ×
              52주로 나눈 실질 시급으로
              {hourlyWage.industryAvgHourly !== null &&
              hourlyWage.diffPercent !== null
                ? `, ${industryKo} 업종 평균 시급 약 ${fmt(hourlyWage.industryAvgHourly)}원 대비 ${signedPercent(hourlyWage.diffPercent)} 수준입니다.`
                : ", 야근이 많을수록 명목 연봉 대비 낮아지는 체감 지표입니다."}
            </p>
          </div>
        )}

        {/* 3. 연봉 외 복지 가치 */}
        {benefitsValue && (
          <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-electric mb-2 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5" />
              연봉 외 복지 가치
            </p>
            <p className="text-2xl font-black text-navy dark:text-canvas-50 mb-1">
              연 {formatSalaryKorean(benefitsValue.totalAnnualValue)} 상당
            </p>
            {showBenefitsComparison && benefitsValue.diffPercent !== null && (
              <p
                className={`text-sm font-bold mb-2 ${
                  benefitsValue.diffPercent >= 0
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {industryKo} 평균 대비 {signedPercent(benefitsValue.diffPercent)}
              </p>
            )}
            <p className="text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
              {koName} 복지 {benefitsValue.totalItems}개 항목 중, 위 연봉표에
              이미 포함된 성과급·주식보상을 빼고 금액 환산이 가능한{" "}
              {benefitsValue.countedItems}개를 합산한 연 환산액으로
              {showBenefitsComparison &&
              benefitsValue.industryAvg !== null &&
              benefitsValue.diffPercent !== null
                ? `, ${industryKo} 업종 평균(연 ${formatSalaryKorean(benefitsValue.industryAvg)}) 대비 ${signedPercent(benefitsValue.diffPercent)} 수준입니다.`
                : ", 연봉 협상 시 총보상 비교에 활용할 수 있습니다."}{" "}
              학자금처럼 지원 대상 조건이 있는 항목도 포함된 값입니다.
            </p>
          </div>
        )}

        {/* 4. 입사 15년 누적 소득 */}
        {cumulativeIncome && lastPoint && (
          <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-electric mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              입사 {lastPoint.years}년 누적 소득
            </p>
            <p className="text-2xl font-black text-navy dark:text-canvas-50 mb-1">
              세전 약 {formatSalaryKorean(lastPoint.cumulative)}
            </p>
            <p className="text-sm font-bold text-electric mb-2 tabular-nums">
              {cumulativeIncome
                .map((p) => `${p.label} ${formatSalaryKorean(p.cumulative)}`)
                .join(" → ")}
            </p>
            <p className="text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
              신입→주니어→시니어→리드 직급별 평균 영끌 연봉을 연차
              구간(1~2·3~5·6~10·11~15년차)에 대입해 단순 합산한 세전 누적
              소득으로, 진급 속도·성과에 따라 실제와 차이가 있을 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
