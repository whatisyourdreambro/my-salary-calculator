// src/lib/salary-data/dartReport.ts
//
// DART 공시 평균연봉 리포트 집계 — 단일 소스 (서버 전용).
// ★dartDisclosed(약 1.3MB)를 import 하므로 클라이언트 컴포넌트에서 절대
//   import 금지 (서버 컴포넌트·sitemap·registry 전용).
// 리포트 제목·본문이 회사 수를 공유하도록 카운트를 여기서 파생
// (entrySalaryReport.ts 패턴 — 제목 413 vs 본문 402 불일치 사고 방지).
//
// 집계 원칙:
// - 랭킹은 fiscalYear 2025(직전 사업연도) 단일 기준 — 연도 혼합 랭킹 금지.
// - V4-divergence 플래그(집계 방식 간 괴리 >30%) 회사는 랭킹에서 제외.
// - 업종 평균은 직원 수 가중(= 급여총액 합산 ÷ 인원 합산과 동치) — 소기업
//   평균의 왜곡 방지.

import { dartDisclosed, DART_DATA_DATE, type DartDisclosedEntry } from "@/data/dart/dartDisclosed";
import { corpCodeMap } from "@/data/dart/corpCodeMap";
import { mapKsicToIndustry } from "@/data/dart/ksicToIndustry";
import { getIndustryMeta } from "./industryTaxonomy";
import { listedCohortStockCodes } from "./dartLite";

/** HTML 엔티티 디코드 — DART corp_name 에 &amp; 등이 섞여 있음 (삼성E&A 등) */
function decodeName(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

/** corpCode → 사이트 회사 id 역매핑 (TOP 100 표의 내부 링크용) */
const companyIdByCorp = new Map<string, string>();
for (const [id, entry] of Object.entries(corpCodeMap)) {
  // 동일 corpCode 중복 id(ktg/ktng 등)는 첫 번째만
  if (!companyIdByCorp.has(entry.corpCode)) companyIdByCorp.set(entry.corpCode, id);
}

export interface DartRankRow {
  rank: number;
  corpCode: string;
  nameKo: string;
  /** /salary-db/{id} 페이지가 있으면 내부 링크 */
  companyId?: string;
  /** 종목코드 — companyId 없는 행의 /salary-db/listed/{stockCode} 링크용 (코호트 등재 시만) */
  stockCode: string;
  avgSalaryManwon: number;
  employeeCount: number;
  avgTenureYears?: number;
  industryId: string;
  industryKo: string;
  listed: boolean;
}

const RANK_YEAR = "2025";

// 랭킹 모수: 2025 사업연도 + 플래그 없음
const eligible = dartDisclosed.filter(
  (d) => d.fiscalYear === RANK_YEAR && !(d.flags && d.flags.length)
);

function toRow(d: DartDisclosedEntry, rank: number): DartRankRow {
  const industryId = mapKsicToIndustry(d.ksicCode);
  return {
    rank,
    corpCode: d.corpCode,
    nameKo: decodeName(d.corpNameKo),
    companyId: companyIdByCorp.get(d.corpCode),
    stockCode: d.stockCode,
    avgSalaryManwon: d.avgSalaryManwonRaw,
    employeeCount: d.employeeCount,
    avgTenureYears: d.avgTenureYears,
    industryId,
    industryKo: getIndustryMeta(industryId).ko,
    listed: d.stockCode !== "",
  };
}

/** TOP 100 — 평균연봉 내림차순 */
export const dartTop100: DartRankRow[] = [...eligible]
  .sort((a, b) => b.avgSalaryManwonRaw - a.avgSalaryManwonRaw)
  .slice(0, 100)
  .map((d, i) => toRow(d, i + 1));

/** 업종별 집계 (회사 10곳 이상 업종, 직원 수 가중 평균) */
export interface DartIndustryRow {
  industryId: string;
  industryKo: string;
  companyCount: number;
  totalEmployees: number;
  /** 직원 수 가중 평균연봉 (만원) */
  weightedAvgManwon: number;
  /** 업종 내 최고 연봉 회사 */
  topCompany: { nameKo: string; avgSalaryManwon: number; companyId?: string };
}

export const DART_INDUSTRY_MIN_COMPANIES = 10;

export const dartIndustryRows: DartIndustryRow[] = (() => {
  const groups = new Map<string, DartDisclosedEntry[]>();
  for (const d of eligible) {
    const id = mapKsicToIndustry(d.ksicCode);
    if (id === "etc") continue;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id)!.push(d);
  }
  const rows: DartIndustryRow[] = [];
  for (const [industryId, list] of groups) {
    if (list.length < DART_INDUSTRY_MIN_COMPANIES) continue;
    const totalEmployees = list.reduce((s, d) => s + d.employeeCount, 0);
    const weighted =
      list.reduce((s, d) => s + d.avgSalaryManwonRaw * d.employeeCount, 0) / totalEmployees;
    const top = [...list].sort((a, b) => b.avgSalaryManwonRaw - a.avgSalaryManwonRaw)[0];
    rows.push({
      industryId,
      industryKo: getIndustryMeta(industryId).ko,
      companyCount: list.length,
      totalEmployees,
      weightedAvgManwon: Math.round(weighted),
      topCompany: {
        nameKo: decodeName(top.corpNameKo),
        avgSalaryManwon: top.avgSalaryManwonRaw,
        companyId: companyIdByCorp.get(top.corpCode),
      },
    });
  }
  return rows.sort((a, b) => b.weightedAvgManwon - a.weightedAvgManwon);
})();

// ── DART 증강 팩 (2026-08-30, 성장 제안 ①) — 회사 페이지 배지·그리드 밴드 표 ──

// 상장 전수 (FY2025·무플래그) — 순위 컨텍스트·밴드 표 모수
const listedEligible = eligible.filter((d) => d.stockCode !== "");
const listedBySalaryDesc = [...listedEligible].sort(
  (a, b) => b.avgSalaryManwonRaw - a.avgSalaryManwonRaw
);
const listedRankByCorp = new Map<string, number>();
listedBySalaryDesc.forEach((d, i) => listedRankByCorp.set(d.corpCode, i + 1));

/** 인상률 배지 제외 가드 — 직원 수 ±30% 초과 변동(합병·분할 왜곡) */
const YOY_EMPLOYEE_CHANGE_MAX = 0.3;

export interface DartCompanyStats {
  /** DART 공시 평균연봉 (만원, FY2025) — 수기 disclosed 와 괴리 검사용 */
  dartSalaryManwon: number;
  /** 전년(FY2024) 대비 인상률 % (소수 1자리) — 비교 불가 시 null */
  yoyPct: number | null;
  prevSalaryManwon: number | null;
  /** 상장 전수 중 평균연봉 순위 — 비상장이면 null */
  listedRank: number | null;
  listedTotal: number;
  /** 과년도 공시 이력 (최신 우선) */
  history?: { fiscalYear: string; avgSalaryManwonRaw: number; employeeCount: number }[];
}

/** /salary-db/[id] 회사 id → DART 파생 통계. 클라 번들 반입 금지 (서버 전용) */
export const dartCompanyStatsById: Map<string, DartCompanyStats> = (() => {
  const map = new Map<string, DartCompanyStats>();
  for (const d of eligible) {
    const companyId = companyIdByCorp.get(d.corpCode);
    if (!companyId || map.has(companyId)) continue;
    const prev = d.history?.find((h) => h.fiscalYear === "2024");
    let yoyPct: number | null = null;
    let prevSalaryManwon: number | null = null;
    if (prev && prev.avgSalaryManwonRaw > 0 && prev.employeeCount > 0) {
      const empChange = Math.abs(d.employeeCount - prev.employeeCount) / prev.employeeCount;
      if (empChange <= YOY_EMPLOYEE_CHANGE_MAX) {
        yoyPct =
          Math.round(
            ((d.avgSalaryManwonRaw - prev.avgSalaryManwonRaw) / prev.avgSalaryManwonRaw) * 1000
          ) / 10;
        prevSalaryManwon = prev.avgSalaryManwonRaw;
      }
    }
    map.set(companyId, {
      dartSalaryManwon: d.avgSalaryManwonRaw,
      yoyPct,
      prevSalaryManwon,
      listedRank: listedRankByCorp.get(d.corpCode) ?? null,
      listedTotal: listedEligible.length,
      ...(d.history && d.history.length ? { history: d.history } : {}),
    });
  }
  return map;
})();

export interface ListedBandRow {
  nameKo: string;
  stockCode: string;
  /** 상세 프로필 > lite(코호트 등재 시만 — 밖은 404) > null */
  href: string | null;
  avgSalaryManwon: number;
  employeeCount: number;
  industryKo: string;
}

/**
 * 해당 연봉(원) ±5%(3곳 미만 시 ±8% 폴백) 구간의 공시 평균연봉 상장사.
 * /salary/[amount]·/monthly/[amount] 그리드의 준중복 해소 + lite 내부링크용.
 * 3곳 미만이면 빈 배열 — 소비처는 섹션 자체를 미렌더 (thin 방지).
 */
export function getListedBySalaryBand(annualWon: number, limit = 10): ListedBandRow[] {
  const manwon = annualWon / 10000;
  if (manwon <= 0) return [];
  const pick = (pct: number) =>
    listedEligible.filter(
      (d) => Math.abs(d.avgSalaryManwonRaw - manwon) / manwon <= pct
    );
  let pool = pick(0.05);
  if (pool.length < 3) pool = pick(0.08);
  if (pool.length < 3) return [];
  return pool
    .sort(
      (a, b) =>
        Math.abs(a.avgSalaryManwonRaw - manwon) - Math.abs(b.avgSalaryManwonRaw - manwon)
    )
    .slice(0, limit)
    .map((d) => {
      const companyId = companyIdByCorp.get(d.corpCode);
      const industryId = mapKsicToIndustry(d.ksicCode);
      return {
        nameKo: decodeName(d.corpNameKo),
        stockCode: d.stockCode,
        href: companyId
          ? `/salary-db/${companyId}`
          : listedCohortStockCodes.has(d.stockCode)
            ? `/salary-db/listed/${d.stockCode}`
            : null,
        avgSalaryManwon: d.avgSalaryManwonRaw,
        employeeCount: d.employeeCount,
        industryKo: getIndustryMeta(industryId).ko,
      };
    });
}

/** 전체 통계 */
export const dartReportStats = (() => {
  const totalEmployees = eligible.reduce((s, d) => s + d.employeeCount, 0);
  const weightedAvg =
    eligible.reduce((s, d) => s + d.avgSalaryManwonRaw * d.employeeCount, 0) /
    Math.max(1, totalEmployees);
  const sorted = [...eligible].sort((a, b) => a.avgSalaryManwonRaw - b.avgSalaryManwonRaw);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 1
      ? sorted[mid].avgSalaryManwonRaw
      : Math.round((sorted[mid - 1].avgSalaryManwonRaw + sorted[mid].avgSalaryManwonRaw) / 2);
  return {
    companyCount: eligible.length,
    totalEmployees,
    weightedAvgManwon: Math.round(weightedAvg),
    medianManwon: median,
    rankYear: RANK_YEAR,
    dataDate: DART_DATA_DATE,
    /** 검증 통과 전체(연도 무관) — 방법론 표기용 */
    allValidCount: dartDisclosed.length,
  };
})();
