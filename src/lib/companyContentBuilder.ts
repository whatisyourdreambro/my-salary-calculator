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

// ─────────────────────────────────────────────────────────────
// 회사 고유 심층 지표 (CompanyUniqueStats 전용)
//
// 434개 회사 페이지가 전부 치환 템플릿 문장이라 회사 고유 신호가 약한
// thin content 문제 대응 — 기존 데이터 필드만으로 회사마다 실제 값이
// 달라지는 지표를 계산한다. 새 수치 추정은 하지 않는다.
// ─────────────────────────────────────────────────────────────

/** 신입 영끌(기본급 + 평균 인센티브) — 기존 벤치마크·순위 함수와 동일 기준. */
function entryTotalOf(c: CompanyProfile): number {
  return c.salary.entry.base + (c.salary.entry.incentive.avgAmount || 0);
}

// 전체 순위 맵 — 빌드 타임에 434개 페이지가 각각 호출하므로
// 정렬은 모듈 로드 시 1회만 수행하고 id → 순위 맵을 재사용한다.
const overallRankMap: Map<string, number> = (() => {
  const sorted = [...allCompanies].sort(
    (a, b) => entryTotalOf(b) - entryTotalOf(a)
  );
  const map = new Map<string, number>();
  sorted.forEach((c, index) => {
    map.set(c.id, index + 1);
  });
  return map;
})();

export interface OverallRank {
  rank: number;
  /** 전체 회사 수 — 하드코딩 금지, allCompanies.length에서 계산 */
  total: number;
  /** 상위 N% (1~100) */
  percentile: number;
}

/**
 * 전체 회사 중 신입 영끌 연봉 순위.
 */
export function getOverallRank(company: CompanyProfile): OverallRank | null {
  const rank = overallRankMap.get(company.id);
  const total = allCompanies.length;
  if (!rank || total === 0) return null;
  const percentile = Math.min(100, Math.max(1, Math.ceil((rank / total) * 100)));
  return { rank, total, percentile };
}

/** 실질 시급(원) — 신입 영끌 ÷ (주 실근무시간 × 52주). 데이터 없으면 null. */
function hourlyWageOf(c: CompanyProfile): number | null {
  const real = c.workLife?.weeklyHours?.real;
  if (!real || real <= 0) return null;
  const total = entryTotalOf(c);
  if (total <= 0) return null;
  return total / (real * 52);
}

// 업종별 실질 시급 합계 — 모듈 로드 시 1회 계산 (자기 자신 제외는 조회 시 처리).
const industryHourlySum: Map<string, { sum: number; count: number }> = (() => {
  const acc = new Map<string, { sum: number; count: number }>();
  for (const c of allCompanies) {
    const hourly = hourlyWageOf(c);
    if (hourly === null) continue;
    const industryId = normalizeIndustry(c.industry);
    const cur = acc.get(industryId) ?? { sum: 0, count: 0 };
    cur.sum += hourly;
    cur.count += 1;
    acc.set(industryId, cur);
  }
  return acc;
})();

export interface RealHourlyWage {
  /** 원 단위 실질 시급 */
  hourly: number;
  weeklyRealHours: number;
  /** 같은 업종 평균 실질 시급(자기 자신 제외). 표본 2개 미만이면 null */
  industryAvgHourly: number | null;
  /** 업종 평균 대비 % (+ 높음 / − 낮음). industryAvgHourly 없으면 null */
  diffPercent: number | null;
}

/**
 * 실질 시급 — 신입 영끌 연봉을 주 실근무시간 기준 시급으로 환산.
 * workLife.weeklyHours.real 이 없으면 null.
 */
export function getRealHourlyWage(company: CompanyProfile): RealHourlyWage | null {
  const hourly = hourlyWageOf(company);
  if (hourly === null) return null;

  // 업종 평균 — 자기 자신을 빼고 최소 2개 표본이 있어야 비교 의미가 있다.
  const bucket = industryHourlySum.get(normalizeIndustry(company.industry));
  let industryAvgHourly: number | null = null;
  let diffPercent: number | null = null;
  if (bucket && bucket.count >= 3) {
    const peerAvg = (bucket.sum - hourly) / (bucket.count - 1);
    if (peerAvg > 0) {
      industryAvgHourly = Math.round(peerAvg);
      diffPercent = Math.round(((hourly - peerAvg) / peerAvg) * 100);
    }
  }

  return {
    hourly: Math.round(hourly),
    weeklyRealHours: company.workLife.weeklyHours.real,
    industryAvgHourly,
    diffPercent,
  };
}

/**
 * "연봉 외" 합산에서 제외할 보상성 항목 필터.
 *
 * 데이터 전수 스캔(2026-08-07) 결과 434개사 중 123개사의 benefits에
 * 성과급(OPI/TAI/PS/PI)·스톡·사인온 항목이 금액과 함께 들어 있는데, 이
 * 금액은 같은 페이지의 직급별 연봉표(incentive.avgAmount·stock·signOn)에
 * 이미 반영돼 있다. 그대로 합산하면 "연봉 외 복지 가치"가 성과급을 이중
 * 계산한 허위 수치가 되므로 제목 기준으로 제외한다. 실제 데이터에 존재하는
 * 제목 패턴(성과급·성과 인센티브·OPI 성과급·PS/PI·스톡옵션·RSU 부여·
 * 사이닝보너스·All Cash Pay 등)을 모두 커버하도록 작성.
 */
const COMPENSATION_DUPLICATE_RE =
  /성과급|성과 ?인센티브|성과 ?보상|성과인상|인센티브|OPI|TAI|초과이익|이익분배|격려금|스톡|RSU|사이닝|sign[- ]?on|all cash|\bPS\b|\bPI\b/i;

/**
 * 금액 환산 가능한 "연봉 외" 복지 항목만 합산.
 * value 없는 항목, 그리고 연봉표에 이미 포함된 보상성 항목은 건너뛴다.
 */
function benefitsValueOf(c: CompanyProfile): { sum: number; counted: number } {
  let sum = 0;
  let counted = 0;
  for (const item of c.benefits ?? []) {
    if (typeof item.value !== "number" || item.value <= 0) continue;
    if (COMPENSATION_DUPLICATE_RE.test(item.title)) continue;
    sum += item.value;
    counted += 1;
  }
  return { sum, counted };
}

// 업종별 복지 가치 합계 — value 있는 회사만 표본으로 집계.
const industryBenefitsSum: Map<string, { sum: number; count: number }> = (() => {
  const acc = new Map<string, { sum: number; count: number }>();
  for (const c of allCompanies) {
    const { sum, counted } = benefitsValueOf(c);
    if (counted === 0 || sum <= 0) continue;
    const industryId = normalizeIndustry(c.industry);
    const cur = acc.get(industryId) ?? { sum: 0, count: 0 };
    cur.sum += sum;
    cur.count += 1;
    acc.set(industryId, cur);
  }
  return acc;
})();

export interface BenefitsValueSummary {
  /** 금액 환산 가능한 복지 항목 합산 연 환산액 (원) */
  totalAnnualValue: number;
  /** value 가 있는 항목 수 */
  countedItems: number;
  /** 전체 복지 항목 수 */
  totalItems: number;
  /** 같은 업종 평균(자기 자신 제외). 표본 2개 미만이면 null */
  industryAvg: number | null;
  /** 업종 평균 대비 %. industryAvg 없으면 null */
  diffPercent: number | null;
}

/**
 * 연봉 외 복지 가치 — benefits[].value 합산 연 환산액.
 * 금액 환산 가능한 항목이 하나도 없으면 null (추정 금지).
 */
export function getBenefitsValue(
  company: CompanyProfile
): BenefitsValueSummary | null {
  const { sum, counted } = benefitsValueOf(company);
  if (counted === 0 || sum <= 0) return null;

  const bucket = industryBenefitsSum.get(normalizeIndustry(company.industry));
  let industryAvg: number | null = null;
  let diffPercent: number | null = null;
  if (bucket && bucket.count >= 3) {
    const peerAvg = (bucket.sum - sum) / (bucket.count - 1);
    if (peerAvg > 0) {
      industryAvg = Math.round(peerAvg);
      diffPercent = Math.round(((sum - peerAvg) / peerAvg) * 100);
    }
  }

  return {
    totalAnnualValue: sum,
    countedItems: counted,
    totalItems: company.benefits?.length ?? 0,
    industryAvg,
    diffPercent,
  };
}

export interface CumulativeIncomePoint {
  /** 연차 라벨 — 예: "2년차" */
  label: string;
  /** 입사 후 경과 연수 */
  years: number;
  /** 해당 시점까지 세전 누적 소득 (원, 영끌 기준) */
  cumulative: number;
}

/**
 * 입사 후 15년 누적 세전 소득 추이 — 직급별 평균 영끌 연봉을
 * CompanySalaryTable 의 연차 구간(신입 1~2 / 주니어 3~5 / 시니어 6~10 /
 * 리드 11~15년차)에 대입해 단순 합산. 직급 데이터가 비면 null.
 */
export function getCumulativeIncome(
  company: CompanyProfile
): CumulativeIncomePoint[] | null {
  const s = company.salary;
  if (!s?.entry || !s.junior || !s.senior || !s.lead) return null;

  const totalOf = (level: "entry" | "junior" | "senior" | "lead") =>
    s[level].base + (s[level].incentive.avgAmount || 0);

  const entry = totalOf("entry");
  const junior = totalOf("junior");
  const senior = totalOf("senior");
  const lead = totalOf("lead");
  if (entry <= 0 || junior <= 0 || senior <= 0 || lead <= 0) return null;

  // 구간별 체류 연수: entry 2년(1~2년차) → junior 3년(3~5) → senior 5년(6~10) → lead 5년(11~15)
  const points: CumulativeIncomePoint[] = [];
  let cumulative = 0;

  cumulative += entry * 2;
  points.push({ label: "2년차", years: 2, cumulative });

  cumulative += junior * 3;
  points.push({ label: "5년차", years: 5, cumulative });

  cumulative += senior * 5;
  points.push({ label: "10년차", years: 10, cumulative });

  cumulative += lead * 5;
  points.push({ label: "15년차", years: 15, cumulative });

  return points;
}
