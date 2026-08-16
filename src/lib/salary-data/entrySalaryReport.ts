// src/lib/salary-data/entrySalaryReport.ts
//
// 데이터 리포트 1호(업종별 신입 초봉 순위)의 집계 단일 소스.
// 리포트 페이지 본문과 reportsRegistry(제목·설명의 회사 수)가 같은 값을 쓰도록
// 여기서 한 번만 계산한다 — 제목 413 vs 본문 402 불일치 사고 방지(2026-08-17).
//
// 집계 규칙:
// - 국내 기업만 (tier !== "foreign"), 표준 업종 분류 불가(etc) 제외
// - 업종별 5개사 이상만 순위화 (표본 부족 업종 제외)
// - 정렬: 신입 영끌(기본급+평균 인센티브) 평균 내림차순

import { companyRepository } from "./CompanyRepository";
import {
  buildIndustryAggregate,
  type IndustryAggregate,
} from "./industryAggregates";

export const ENTRY_REPORT_MIN_COMPANIES = 5;

export interface EntryReportIndustryRow {
  /** 표준 업종 id (industryTaxonomy) */
  id: string;
  agg: IndustryAggregate;
}

function build(): EntryReportIndustryRow[] {
  const domestic = companyRepository
    .getAll()
    .filter((c) => c.tier !== "foreign");

  const byIndustry = new Map<string, typeof domestic>();
  for (const c of domestic) {
    const id = c.industryId ?? "etc";
    if (id === "etc") continue;
    const list = byIndustry.get(id);
    if (list) list.push(c);
    else byIndustry.set(id, [c]);
  }

  return Array.from(byIndustry.entries())
    .map(([id, list]) => ({ id, agg: buildIndustryAggregate(list)! }))
    .filter((x) => x.agg && x.agg.count >= ENTRY_REPORT_MIN_COMPANIES)
    .sort((a, b) => b.agg.avgEntry - a.agg.avgEntry);
}

/** 순위 업종 목록 (모듈 로드 시 1회 계산 — force-static 빌드에서 실행) */
export const entryReportRows: EntryReportIndustryRow[] = build();

/** 순위 집계에 포함된 회사 수 (제목·본문·방법론이 공유하는 정본 수치) */
export const entryReportCompanyCount = entryReportRows.reduce(
  (sum, x) => sum + x.agg.count,
  0
);

/** 순위화된 업종 수 */
export const entryReportIndustryCount = entryReportRows.length;
