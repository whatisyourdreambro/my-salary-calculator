// src/lib/companyContentBuilder.ts
//
// 회사 데이터에서 자동 SEO 콘텐츠 섹션을 생성하는 헬퍼.
// 같은 업종 평균 대비 차이, 같은 연봉대 cross-link 등을 동적 계산.

import type { CompanyProfile } from "@/types/company";
import { allCompanies } from "@/data/companies";
import { normalizeIndustry } from "@/lib/salary-data/industryTaxonomy";
import { formatSalaryKorean } from "@/lib/seo";

export interface IndustryBenchmark {
 averageEntry: number;
 averageSenior: number;
 sampleSize: number;
 percentile: number; // 이 회사가 업종 내 상위 몇 %인가
}

/**
 * 같은 업종 회사들과 평균 비교.
 */
export function getIndustryBenchmark(
 company: CompanyProfile
): IndustryBenchmark | null {
 const companyIndustryId = normalizeIndustry(company.industry);
 const peers = allCompanies.filter(
 (c) => normalizeIndustry(c.industry) === companyIndustryId && c.id !== company.id
 );
 if (peers.length < 2) return null;

 const peerEntrySalaries = peers.map(
 (c) => c.salary.entry.base + (c.salary.entry.incentive.avgAmount || 0)
 );
 const peerSeniorSalaries = peers.map(
 (c) => c.salary.senior.base + (c.salary.senior.incentive.avgAmount || 0)
 );

 const averageEntry = Math.round(
 peerEntrySalaries.reduce((a, b) => a + b, 0) / peers.length
 );
 const averageSenior = Math.round(
 peerSeniorSalaries.reduce((a, b) => a + b, 0) / peers.length
 );

 // 백분위 계산 (entry 기준)
 const companyEntry =
 company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0);
 const lowerCount = peerEntrySalaries.filter((s) => s < companyEntry).length;
 const percentile = Math.round((lowerCount / peers.length) * 100);

 return {
 averageEntry,
 averageSenior,
 sampleSize: peers.length + 1,
 percentile,
 };
}

/**
 * 같은 연봉대(±15%)의 다른 회사 N개 추천.
 */
export function getSimilarSalaryCompanies(
 company: CompanyProfile,
 limit = 5
): CompanyProfile[] {
 const targetEntry =
 company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0);
 const min = targetEntry * 0.85;
 const max = targetEntry * 1.15;

 return allCompanies
 .filter((c) => {
 if (c.id === company.id) return false;
 const total = c.salary.entry.base + (c.salary.entry.incentive.avgAmount || 0);
 return total >= min && total <= max;
 })
 .sort((a, b) => {
 const aTotal = a.salary.entry.base + (a.salary.entry.incentive.avgAmount || 0);
 const bTotal = b.salary.entry.base + (b.salary.entry.incentive.avgAmount || 0);
 return Math.abs(aTotal - targetEntry) - Math.abs(bTotal - targetEntry);
 })
 .slice(0, limit);
}

// formatSalaryKorean은 seo.ts로 이동(2026-07-06) — 이 파일은 allCompanies 전체를
// import해서 metadata 헬퍼가 쓰기엔 무거움. 기존 소비처 호환을 위해 재수출.
export { formatSalaryKorean };

/**
 * 직급별 연봉 차이 텍스트 생성 (예: "신입 vs 시니어 약 3배 차이").
 */
export function describeSalaryGrowth(company: CompanyProfile): string {
 const entry =
 company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0);
 const senior =
 company.salary.senior.base + (company.salary.senior.incentive.avgAmount || 0);
 const ratio = (senior / entry).toFixed(1);
 return `신입 ${formatSalaryKorean(entry)} → 시니어 ${formatSalaryKorean(senior)} (약 ${ratio}배)`;
}

/**
 * 워라밸 텍스트 생성.
 */
export function describeWorkLife(company: CompanyProfile): string {
 const real = company.workLife.weeklyHours.real;
 const contract = company.workLife.weeklyHours.contract;
 const overhours = real - contract;

 if (overhours <= 2) {
 return `평균 주 ${real}시간 — 워라밸 양호`;
 }
 if (overhours <= 5) {
 return `평균 주 ${real}시간 (계약 대비 +${overhours}시간) — 보통`;
 }
 return `평균 주 ${real}시간 (계약 대비 +${overhours}시간) — 강도 높음`;
}

// ─────────────────────────────────────────────────────────────
// 같은 업종 연봉 순위
// ─────────────────────────────────────────────────────────────

export interface IndustryRankRow {
 company: CompanyProfile;
 rank: number;
 entryTotal: number;
}

/**
 * 같은 업종 회사들을 신입 영끌 연봉 기준으로 정렬한 순위.
 * 표본이 3개 미만이면 null (순위로서 의미 없음).
 */
export function getIndustryRanking(company: CompanyProfile): {
 rows: IndustryRankRow[];
 total: number;
 myRank: number;
} | null {
 const companyIndustryId = normalizeIndustry(company.industry);
 const peers = allCompanies.filter(
 (c) => normalizeIndustry(c.industry) === companyIndustryId
 );
 if (peers.length < 3) return null;

 const rows: IndustryRankRow[] = peers
 .map((c) => ({
 company: c,
 entryTotal: c.salary.entry.base + (c.salary.entry.incentive.avgAmount || 0),
 rank: 0,
 }))
 .sort((a, b) => b.entryTotal - a.entryTotal)
 .map((row, index) => ({ ...row, rank: index + 1 }));

 const myRank = rows.find((r) => r.company.id === company.id)?.rank ?? 0;
 return { rows, total: rows.length, myRank };
}

// 업종 한글 라벨은 표준 분류(industryTaxonomy)에 위임한다.
// 기존 import 경로 호환을 위해 이 모듈에서도 industryLabelKo를 재노출.
export { industryLabelKo } from "@/lib/salary-data/industryTaxonomy";
