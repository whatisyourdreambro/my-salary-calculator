// src/components/CompanyIndustryRank.tsx
//
// 회사 페이지 — 같은 업종 내 신입 연봉 순위.
// 동종업계 회사를 신입 영끌 연봉순으로 나열하고 현재 회사를 강조한다.
// 같은 업종 회사끼리 내부 링크를 촘촘히 연결해 토픽 클러스터를 형성하고,
// "{업종} 연봉 순위" 검색 의도에 대응하며, 사용자의 다음 페이지 이동을 유도한다.

import Link from "next/link";
import { Trophy } from "lucide-react";
import type { CompanyProfile } from "@/types/company";
import {
  getIndustryRanking,
  industryLabelKo,
  formatSalaryKorean,
} from "@/lib/companyContentBuilder";

const TOP_VISIBLE = 15;

export default function CompanyIndustryRank({
  company,
}: {
  company: CompanyProfile;
}) {
  const ranking = getIndustryRanking(company);
  if (!ranking) return null;

  const { rows, total, myRank } = ranking;
  const industryKo = industryLabelKo(company.industry);

  // 목록이 길면 상위 15개만 노출하되, 현재 회사가 그 밖이면 해당 행을 덧붙인다.
  const visible = rows.slice(0, TOP_VISIBLE);
  const currentOutside = myRank > TOP_VISIBLE;
  if (currentOutside) visible.push(rows[myRank - 1]);

  return (
    <section
      className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      aria-label={`${industryKo} 업종 연봉 순위`}
    >
      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-navy dark:text-canvas-50 mb-2 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-electric" />
        {industryKo} 업종 연봉 순위
      </h2>
      <p className="text-sm text-muted-blue dark:text-canvas-300 mb-6">
        {company.name.ko}은(는) {industryKo} 업종 {total}개사 중 신입 영끌 연봉{" "}
        <strong className="text-electric">{myRank}위</strong>입니다. 같은 업종 회사의
        초봉을 한눈에 비교해 보세요.
      </p>

      <ol className="space-y-2">
        {visible.map((row, index) => {
          const isCurrent = row.company.id === company.id;
          const showGap = currentOutside && index === visible.length - 1;
          return (
            <li key={row.company.id}>
              {showGap && (
                <p className="text-center text-faint-blue text-sm py-1" aria-hidden>
                  ⋯
                </p>
              )}
              <Link
                href={`/salary-db/${row.company.id}`}
                className={`flex items-center gap-3 rounded-xl border p-3.5 transition-colors ${
                  isCurrent
                    ? "border-electric bg-electric-5 dark:bg-electric-10"
                    : "border-canvas-200 dark:border-canvas-800 bg-white dark:bg-canvas-900 hover:border-electric"
                }`}
              >
                <span
                  className={`flex-shrink-0 w-7 text-center font-black tabular-nums ${
                    row.rank <= 3 ? "text-electric" : "text-faint-blue"
                  }`}
                >
                  {row.rank}
                </span>
                <span
                  className={`flex-1 font-bold ${
                    isCurrent
                      ? "text-electric"
                      : "text-navy dark:text-canvas-50"
                  }`}
                >
                  {row.company.name.ko}
                  {isCurrent && (
                    <span className="ml-1.5 text-xs font-bold text-electric">
                      이 회사
                    </span>
                  )}
                </span>
                <span className="font-black tabular-nums text-navy dark:text-canvas-50">
                  {formatSalaryKorean(row.entryTotal)}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 text-xs text-faint-blue">
        신입 영끌 연봉(기본급 + 평균 인센티브) 기준 · 연봉 데이터 최종 업데이트{" "}
        {company.lastUpdated}
      </p>
    </section>
  );
}
