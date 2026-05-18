// src/lib/salary-data/industryAggregates.ts
//
// 업종별 랜딩 페이지(/industry/[slug])용 집계 헬퍼.
// 새로운 급여 데이터를 만들지 않고, 이미 등록된 회사들의 필드만 재집계한다.
// "{업종} 회사별 연봉 순위" 표·평균·중앙값을 실제 회사 데이터에서 계산.

import type { CompanyProfile } from "@/types/company";
import { companyRepository } from "./CompanyRepository";

export interface IndustryAggregateRow {
  company: CompanyProfile;
  rank: number;
  /** 신입 영끌 연봉 (기본급 + 평균 인센티브) */
  entryTotal: number;
  /** 시니어 영끌 연봉 */
  seniorTotal: number;
}

export interface IndustryAggregate {
  /** 집계 대상 회사 수 */
  count: number;
  /** 신입 영끌 평균 */
  avgEntry: number;
  /** 신입 영끌 중앙값 */
  medianEntry: number;
  /** 시니어 영끌 평균 */
  avgSenior: number;
  /** 평균 주당 실근무시간 */
  avgWeeklyHours: number;
  /** 신입 영끌 최고 급여사 */
  topPayer: CompanyProfile | null;
  /** 신입 영끌 기준 내림차순 정렬된 전체 순위 */
  rows: IndustryAggregateRow[];
}

function entryTotalOf(c: CompanyProfile): number {
  return c.salary.entry.base + (c.salary.entry.incentive.avgAmount || 0);
}

function seniorTotalOf(c: CompanyProfile): number {
  return c.salary.senior.base + (c.salary.senior.incentive.avgAmount || 0);
}

/**
 * 회사 배열을 받아 업종 집계 통계를 계산한다 (id 기준 중복 제거).
 * 회사가 없으면 null.
 */
export function buildIndustryAggregate(
  companies: CompanyProfile[]
): IndustryAggregate | null {
  const seen = new Set<string>();
  const unique = companies.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
  if (unique.length === 0) return null;

  const rows: IndustryAggregateRow[] = unique
    .map((c) => ({
      company: c,
      entryTotal: entryTotalOf(c),
      seniorTotal: seniorTotalOf(c),
      rank: 0,
    }))
    .sort((a, b) => b.entryTotal - a.entryTotal)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  const entries = rows.map((r) => r.entryTotal);
  const avgEntry = Math.round(entries.reduce((a, b) => a + b, 0) / rows.length);

  const sorted = [...entries].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const medianEntry =
    sorted.length % 2 === 1
      ? sorted[mid]
      : Math.round((sorted[mid - 1] + sorted[mid]) / 2);

  const avgSenior = Math.round(
    rows.map((r) => r.seniorTotal).reduce((a, b) => a + b, 0) / rows.length
  );
  const avgWeeklyHours = Math.round(
    unique.map((c) => c.workLife.weeklyHours.real).reduce((a, b) => a + b, 0) /
      unique.length
  );

  return {
    count: rows.length,
    avgEntry,
    medianEntry,
    avgSenior,
    avgWeeklyHours,
    topPayer: rows[0]?.company ?? null,
    rows,
  };
}

/** 업종 프로필이 집계 대상으로 삼는 회사 집합을 해석한다. */
export interface IndustryAggregateSource {
  /** 표준 업종 id 목록 (industryTaxonomy 기준) */
  industryIds?: string[];
  /** 특정 tier 전체를 집계 (예: 공기업 페이지는 tier="public") */
  aggregateTier?: CompanyProfile["tier"];
}

/** 업종 프로필 → 집계 대상 회사 목록. */
export function getCompaniesForIndustry(
  source: IndustryAggregateSource
): CompanyProfile[] {
  if (source.aggregateTier) {
    return companyRepository
      .getAll()
      .filter((c) => c.tier === source.aggregateTier);
  }
  return (source.industryIds ?? []).flatMap((id) =>
    companyRepository.getByIndustry(id)
  );
}

/** 업종 프로필 → 집계 통계 (회사 없으면 null). */
export function getIndustryAggregate(
  source: IndustryAggregateSource
): IndustryAggregate | null {
  return buildIndustryAggregate(getCompaniesForIndustry(source));
}
