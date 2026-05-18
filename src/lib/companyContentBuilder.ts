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
 const peers = allCompanies.filter((c) => c.industry === company.industry);
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

/** 업종 영문 코드 → 한글 라벨. 미등록 업종은 원문을 그대로 사용. */
const INDUSTRY_KO: Record<string, string> = {
 Pharmaceutical: "제약",
 Pharma: "제약",
 Biopharmaceutical: "바이오제약",
 Game: "게임",
 Construction: "건설",
 Platform: "플랫폼",
 Food: "식품",
 Fintech: "핀테크",
 Finance: "금융",
 Securities: "증권",
 "Securities / Investment Banking": "증권·IB",
 "IT Services": "IT 서비스",
 Banking: "은행",
 "Banking / Public": "은행(공공)",
 "Banking / Financial Holding": "은행·금융지주",
 Retail: "유통",
 Logistics: "물류",
 Insurance: "보험",
 "Insurance (Non-Life)": "손해보험",
 "Heavy Industry": "중공업",
 "Healthcare / University Hospital": "대학병원",
 Energy: "에너지",
 "Energy / Public": "에너지(공기업)",
 "Public Finance": "공공 금융",
 "Finance / Public": "금융(공공)",
 "Legal Services": "법률 서비스",
 Entertainment: "엔터테인먼트",
 "Entertainment / K-pop": "엔터테인먼트(K-pop)",
 Chemical: "화학",
 "Accounting / Consulting": "회계·컨설팅",
 "Management Consulting": "경영 컨설팅",
 Transportation: "운송",
 "Transportation / Public": "운송(공기업)",
 Shipbuilding: "조선",
 "Semiconductor Equipment": "반도체 장비",
 "Media / Broadcasting": "미디어·방송",
 EdTech: "에듀테크",
 "E-commerce": "이커머스",
 Defense: "방위산업",
 "Auto Parts": "자동차 부품",
};

/** 업종 문자열을 한글 라벨로 변환 (미등록 시 원문 반환). */
export function industryLabelKo(industry: string): string {
 return INDUSTRY_KO[industry] || industry;
}
