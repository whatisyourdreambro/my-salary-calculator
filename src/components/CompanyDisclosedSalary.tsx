// src/components/CompanyDisclosedSalary.tsx
//
// 공시 기준 평균연봉 카드 (server component).
// company.disclosed 가 있는 회사만 렌더 — 금융감독원 전자공시(DART) 사업보고서·
// 공공기관 알리오 등 공식 공시(또는 이를 인용한 언론 보도)의 평균연봉을
// 본 DB 직급별 추정치와 분리해 "공식 수치"로 보여주는 권위 차별화 섹션.
// 수치·출처는 데이터 파일의 disclosed 필드에만 기재 — 이 컴포넌트에서
// 추정·가공 금지. 추정치와의 관계는 정직하게 설명한다.

import { ShieldCheck, ExternalLink } from "lucide-react";
import type { CompanyProfile } from "@/types/company";

/** 만원 단위 → "1억 5,800만원" 한국식 표기 */
function formatManwon(manwon: number): string {
  const eok = Math.floor(manwon / 10000);
  const rest = manwon % 10000;
  if (eok > 0 && rest > 0)
    return `${eok}억 ${rest.toLocaleString("ko-KR")}만원`;
  if (eok > 0) return `${eok}억원`;
  return `${rest.toLocaleString("ko-KR")}만원`;
}

/** 근속연수 — 소수 1자리까지만 표시 (13.7 → "13.7", 15 → "15") */
function formatTenure(years: number): string {
  const rounded = Math.round(years * 10) / 10;
  return `${rounded}`;
}

export default function CompanyDisclosedSalary({
  company,
}: {
  company: CompanyProfile;
}) {
  const d = company.disclosed;
  if (!d) return null;

  const koName = company.name.ko;

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
      <div className="rounded-2xl border border-canvas-200 dark:border-canvas-800 bg-white dark:bg-canvas-900 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-black text-navy dark:text-canvas-50 mb-3">
          <ShieldCheck size={18} className="text-electric flex-shrink-0" />
          {koName} 공시 기준 평균연봉 — 추정이 아닌 공식 수치
        </h2>

        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-3">
          <p className="text-2xl sm:text-3xl font-black text-navy dark:text-canvas-50">
            {formatManwon(d.avgSalaryManwon)}
          </p>
          <p className="text-sm font-bold text-electric">
            사업연도 {d.fiscalYear} 기준
          </p>
          {d.avgTenureYears != null && (
            <p className="text-sm font-bold text-muted-blue dark:text-canvas-300">
              평균 근속 {formatTenure(d.avgTenureYears)}년
            </p>
          )}
        </div>

        <p className="text-sm leading-7 text-muted-blue dark:text-canvas-300 mb-3">
          {koName}의 공시 기준 평균연봉(사업연도 {d.fiscalYear})은{" "}
          {d.avgSalaryManwon.toLocaleString("ko-KR")}만원입니다. 금융감독원
          전자공시(DART) 사업보고서·공공기관 알리오 등 공식 공시(또는 이를
          인용한 언론 보도)에 기반한 값으로, 임원 제외 여부·성과급 포함 범위
          등 산정 기준은 출처에 따라 다를 수 있습니다. 위 직급별 연봉표는
          신입~임원 직급 구조로 나눈 머니샐러리 DB 추정치라, 전 직급·전
          연차를 한 번에 평균 낸 공시 수치와는 차이가 날 수 있습니다 — 두
          수치를 함께 보면 실제 수준을 더 정확히 가늠할 수 있습니다.
        </p>

        {d.note && (
          <p className="text-xs leading-6 text-muted-blue dark:text-canvas-300 mb-3">
            {d.note}
          </p>
        )}

        <p className="text-xs text-muted-blue dark:text-canvas-300">
          출처:{" "}
          {d.sourceUrl ? (
            <a
              href={d.sourceUrl}
              target="_blank"
              rel="nofollow noopener"
              className="underline underline-offset-2 hover:text-electric transition-colors inline-flex items-center gap-1"
            >
              {d.source}
              <ExternalLink className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            </a>
          ) : (
            d.source
          )}
        </p>
      </div>
    </section>
  );
}
