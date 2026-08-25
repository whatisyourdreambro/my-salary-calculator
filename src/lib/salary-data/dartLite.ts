// src/lib/salary-data/dartLite.ts
//
// DART 공시 전용 경량 회사 페이지(/salary-db/listed/[stockCode]) 코호트 — 단일 소스.
// ★dartDisclosed(약 1.3MB)를 import 하므로 클라이언트 컴포넌트에서 절대
//   import 금지 (서버 컴포넌트·generateStaticParams·sitemap 전용).
//
// 게이팅 원칙 (compare 413 색인 거부 교훈 — thin·중복 페이지 방지):
// - fiscalYear 2025 + 플래그 없음 + 상장(stockCode 보유)만.
// - 기존 /salary-db/[id] 보유 회사(corpCodeMap 등재 corp)는 제외 — 같은 회사
//   두 URL 카니발 방지. corp 중복(구법인) 대비 회사명 정규화 2차 가드 병행.
// - 직원 500명 이상 중 직원 수 상위 150 ∪ 평균연봉 상위 150 ≈ 200곳 (Phase 1).
//   색인률(28일, 60% 게이트) 통과 시 Phase 2에서 코호트 상수만 확대.
// - generateStaticParams·sitemap 이 이 파일 하나를 공유 — 코호트 밖 URL 은 404.

import {
  dartDisclosed,
  DART_DATA_DATE,
  type DartDisclosedEntry,
} from "@/data/dart/dartDisclosed";
import { corpCodeMap } from "@/data/dart/corpCodeMap";
import { mapKsicToIndustry } from "@/data/dart/ksicToIndustry";
import { getIndustryMeta } from "./industryTaxonomy";
import { companyRepository } from "./CompanyRepository";

export const DART_LITE_DATE = DART_DATA_DATE;

/** Phase 1 코호트 게이트 — Phase 2 확대 시 이 상수만 조정 */
const EMPLOYEE_MIN = 500;
const TOP_BY_EMPLOYEE = 150;
const TOP_BY_SALARY = 150;
/** 현행(primary) 사업연도 — 매년 4월 DART 갱신 시 이 상수만 올린다 */
const PRIMARY_FISCAL_YEAR = "2025";

function decodeName(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

/** 회사명 정규화 — corp 중복(지주 전환 구법인 등) 카니발 2차 가드용 */
function normName(s: string): string {
  return decodeName(s)
    .replace(/㈜|주식회사|\(주\)/g, "")
    .replace(/[\s·.,'"&()-]/g, "")
    .toLowerCase();
}

export interface DartLiteCompany {
  stockCode: string;
  corpCode: string;
  nameKo: string;
  /** 공시 원값 (만원) */
  avgSalaryManwon: number;
  employeeCount: number;
  avgTenureYears?: number;
  fiscalYear: string;
  rceptNo: string;
  industryId: string;
  industryKo: string;
  /** 상장 전수(모수 listedTotal) 중 평균연봉 순위 */
  listedRank: number;
  listedTotal: number;
  /** 업종 내 순위 (업종 상장사 5곳 이상일 때만 유효) */
  industryRank: number;
  industryTotal: number;
  /** 업종 직원 수 가중 평균 (만원, 업종 5곳 미만이면 null) */
  industryWeightedAvgManwon: number | null;
  /** 과년도 공시 이력 (최신 우선 — fetch-hist 수집분, 없으면 undefined) */
  history?: { fiscalYear: string; avgSalaryManwonRaw: number; employeeCount: number }[];
}

// ── 모수: FY2025 + 무플래그 + 상장 전수 (순위 컨텍스트용 — 삼성전자 등 포함) ──
const listedEligible: DartDisclosedEntry[] = dartDisclosed.filter(
  (d) =>
    d.fiscalYear === PRIMARY_FISCAL_YEAR &&
    !(d.flags && d.flags.length) &&
    d.stockCode !== ""
);

const listedBySalary = [...listedEligible].sort(
  (a, b) => b.avgSalaryManwonRaw - a.avgSalaryManwonRaw
);
const listedRankByCorp = new Map<string, number>();
listedBySalary.forEach((d, i) => listedRankByCorp.set(d.corpCode, i + 1));

// 업종 집계 (가중 평균 + 업종 내 순위)
const industryGroups = new Map<string, DartDisclosedEntry[]>();
for (const d of listedEligible) {
  const id = mapKsicToIndustry(d.ksicCode);
  if (!industryGroups.has(id)) industryGroups.set(id, []);
  industryGroups.get(id)!.push(d);
}
const industryRankByCorp = new Map<string, { rank: number; total: number }>();
const industryWeighted = new Map<string, number>();
for (const [id, list] of industryGroups) {
  const sorted = [...list].sort((a, b) => b.avgSalaryManwonRaw - a.avgSalaryManwonRaw);
  sorted.forEach((d, i) =>
    industryRankByCorp.set(d.corpCode, { rank: i + 1, total: sorted.length })
  );
  const emp = list.reduce((s, d) => s + d.employeeCount, 0);
  if (emp > 0) {
    industryWeighted.set(
      id,
      Math.round(list.reduce((s, d) => s + d.avgSalaryManwonRaw * d.employeeCount, 0) / emp)
    );
  }
}

// ── 카니발 가드 ──
const mappedCorps = new Set(Object.values(corpCodeMap).map((e) => e.corpCode));
const existingNames = new Set(
  companyRepository.getAll().map((c) => normName(c.name.ko))
);

function toLite(d: DartDisclosedEntry): DartLiteCompany {
  const industryId = mapKsicToIndustry(d.ksicCode);
  const ir = industryRankByCorp.get(d.corpCode);
  const industryTotal = ir?.total ?? 0;
  return {
    stockCode: d.stockCode,
    corpCode: d.corpCode,
    nameKo: decodeName(d.corpNameKo),
    avgSalaryManwon: d.avgSalaryManwonRaw,
    employeeCount: d.employeeCount,
    avgTenureYears: d.avgTenureYears,
    fiscalYear: d.fiscalYear,
    rceptNo: d.rceptNo,
    industryId,
    industryKo: getIndustryMeta(industryId).ko,
    listedRank: listedRankByCorp.get(d.corpCode) ?? 0,
    listedTotal: listedEligible.length,
    industryRank: ir?.rank ?? 0,
    industryTotal,
    industryWeightedAvgManwon:
      industryTotal >= 5 ? industryWeighted.get(industryId) ?? null : null,
    ...(d.history && d.history.length ? { history: d.history } : {}),
  };
}

/** Phase 1 코호트 — 평균연봉 내림차순 정렬 */
export const listedCohort: DartLiteCompany[] = (() => {
  const pool = listedEligible.filter(
    (d) =>
      !mappedCorps.has(d.corpCode) &&
      !existingNames.has(normName(d.corpNameKo)) &&
      d.employeeCount >= EMPLOYEE_MIN
  );
  const byEmp = [...pool]
    .sort((a, b) => b.employeeCount - a.employeeCount)
    .slice(0, TOP_BY_EMPLOYEE);
  const bySal = [...pool]
    .sort((a, b) => b.avgSalaryManwonRaw - a.avgSalaryManwonRaw)
    .slice(0, TOP_BY_SALARY);
  const seen = new Set<string>();
  const merged: DartDisclosedEntry[] = [];
  for (const d of [...bySal, ...byEmp]) {
    if (seen.has(d.stockCode)) continue;
    seen.add(d.stockCode);
    merged.push(d);
  }
  return merged
    .map(toLite)
    .sort((a, b) => b.avgSalaryManwon - a.avgSalaryManwon);
})();

const cohortByStock = new Map(listedCohort.map((c) => [c.stockCode, c]));

export function getListedByStockCode(stockCode: string): DartLiteCompany | null {
  return cohortByStock.get(stockCode) ?? null;
}

/** 코호트 내 유사 연봉 이웃 (±12%, 최대 5곳) — lite 페이지 상호 메쉬 */
export function getSalaryNeighbors(c: DartLiteCompany, limit = 5): DartLiteCompany[] {
  return listedCohort
    .filter(
      (o) =>
        o.stockCode !== c.stockCode &&
        Math.abs(o.avgSalaryManwon - c.avgSalaryManwon) / c.avgSalaryManwon <= 0.12
    )
    .sort(
      (a, b) =>
        Math.abs(a.avgSalaryManwon - c.avgSalaryManwon) -
        Math.abs(b.avgSalaryManwon - c.avgSalaryManwon)
    )
    .slice(0, limit);
}

/** 같은 업종의 기존 /salary-db/[id] 회사 (링크 주스 환류, 최대 limit곳) */
export function getSameIndustryExisting(
  c: DartLiteCompany,
  limit = 4
): { id: string; nameKo: string }[] {
  if (c.industryId === "etc") return [];
  return companyRepository
    .getByIndustry(c.industryId)
    .slice(0, limit)
    .map((co) => ({ id: co.id, nameKo: co.name.ko }));
}

/** 코호트 stockCode 집합 — TOP100 리포트 행 링크화 등 외부 소비용 */
export const listedCohortStockCodes = new Set(listedCohort.map((c) => c.stockCode));
