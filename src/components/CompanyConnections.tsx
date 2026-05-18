// src/components/CompanyConnections.tsx
//
// 회사 페이지 → 업종 허브·경쟁사 비교 페이지로 가는 내부 링크 섹션.
// 허브-스포크 구조를 완성해 크롤 자산을 집중시킨다.

import Link from "next/link";
import { ArrowRight, BarChart3, GitCompare } from "lucide-react";
import type { CompanyProfile } from "@/types/company";
import { industriesData } from "@/data/industriesData";
import { getComparePairs } from "@/lib/salary-data/companyComparePairs";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";

export default function CompanyConnections({ company }: { company: CompanyProfile }) {
  const industryHub = company.industryId
    ? industriesData.find((p) => p.industryIds?.includes(company.industryId as string))
    : undefined;

  const comparePairs = getComparePairs()
    .filter((p) => p.aId === company.id || p.bId === company.id)
    .slice(0, 6);

  if (!industryHub && comparePairs.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
      <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-5">
        {company.name.ko} 연봉 더 깊이 보기
      </h2>

      {industryHub && (
        <Link
          href={`/industry/${industryHub.id}`}
          className="flex items-center gap-3 p-4 mb-3 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 hover:border-electric transition-colors group"
        >
          <BarChart3 size={20} className="text-electric flex-shrink-0" />
          <span className="flex-1 text-sm font-bold text-navy dark:text-canvas-50">
            {industryHub.name} 업계 회사별 연봉 순위 전체 보기
          </span>
          <ArrowRight className="w-4 h-4 text-electric group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}

      {comparePairs.length > 0 && (
        <div className="mt-2">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-muted-blue dark:text-canvas-300 mb-3">
            <GitCompare size={16} className="text-electric" />
            경쟁사와 연봉 1:1 비교
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {comparePairs.map((p) => {
              const otherId = p.aId === company.id ? p.bId : p.aId;
              const other = companyRepository.getById(otherId);
              if (!other) return null;
              return (
                <Link
                  key={p.slug}
                  href={`/salary-db/compare/${p.slug}`}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 hover:border-electric hover:bg-electric-5 transition-all text-sm"
                >
                  <span className="text-lg">{other.logo}</span>
                  <span className="flex-1 font-medium text-navy dark:text-canvas-100">
                    {company.name.ko} vs {other.name.ko} 연봉 비교
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-electric flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
