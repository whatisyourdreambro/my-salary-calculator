// src/components/RelatedCompanies.tsx
//
// 회사 페이지 cross-link — 같은 업종 또는 비슷한 연봉대 회사 추천.

import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { allCompanies } from "@/data/companies";
import type { CompanyProfile } from "@/types/company";
import { formatSalaryKorean } from "@/lib/companyContentBuilder";

interface RelatedCompaniesProps {
  currentId: string;
  industry?: string;
  targetSalary?: number;
  limit?: number;
  title?: string;
}

function totalEntry(c: CompanyProfile): number {
  return c.salary.entry.base + (c.salary.entry.incentive.avgAmount || 0);
}

function score(c: CompanyProfile, industry?: string, target?: number): number {
  let s = 0;
  if (industry && c.industry === industry) s += 10;
  if (target) {
    const diff = Math.abs(totalEntry(c) - target);
    const ratio = diff / target;
    s += Math.max(0, 8 - ratio * 16); // 가까울수록 점수 높음
  }
  return s;
}

export default function RelatedCompanies({
  currentId,
  industry,
  targetSalary,
  limit = 6,
  title = "비슷한 회사 비교",
}: RelatedCompaniesProps) {
  const candidates = allCompanies
    .filter((c) => c.id !== currentId)
    .map((c) => ({ company: c, score: score(c, industry, targetSalary) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.company);

  if (candidates.length === 0) return null;

  return (
    <section className="my-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 mb-5">
        <Building2 size={20} className="text-electric" />
        <h2 className="text-lg font-black text-navy dark:text-canvas-50">{title}</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {candidates.map((c) => {
          const entry = totalEntry(c);
          return (
            <Link
              key={c.id}
              href={`/salary-db/${c.id}`}
              className="group flex flex-col gap-2 p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 hover:border-electric hover:bg-electric-5 transition-all"
            >
              <div className="text-2xl">{c.logo}</div>
              <p className="text-sm font-bold text-navy dark:text-canvas-50 leading-tight line-clamp-1">
                {c.name.ko}
              </p>
              <p className="text-[11px] text-faint-blue line-clamp-1">{c.industry}</p>
              <p className="text-xs font-black text-electric mt-1">
                신입 {formatSalaryKorean(entry)}
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-electric mt-auto pt-1">
                자세히
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
