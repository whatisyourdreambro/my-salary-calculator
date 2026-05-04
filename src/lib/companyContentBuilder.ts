// src/lib/companyContentBuilder.ts
//
// 회사 데이터에서 자동 SEO 콘텐츠 섹션을 생성하는 헬퍼.
// 같은 업종 평균 대비 차이, 같은 연봉대 cross-link 등을 동적 계산.

import type { CompanyProfile } from "@/types/company";
import { allCompanies } from "@/data/companies";

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
 const peers = allCompanies.filter(
 (c) => c.industry === company.industry && c.id !== company.id
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

/**
 * 연봉 액수를 한글 표기로 포맷 (예: 5,200만원 / 1억 200만원).
 */
export function formatSalaryKorean(amount: number): string {
 const eok = Math.floor(amount / 100000000);
 const remaining = amount % 100000000;
 const manwon = Math.round(remaining / 10000);

 if (eok > 0 && manwon > 0) {
 return `${eok}억 ${manwon.toLocaleString("ko-KR")}만원`;
 }
 if (eok > 0) {
 return `${eok}억원`;
 }
 return `${manwon.toLocaleString("ko-KR")}만원`;
}

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
