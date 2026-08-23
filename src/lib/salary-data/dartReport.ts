// src/lib/salary-data/dartReport.ts
//
// DART 공시 평균연봉 리포트 집계 — 단일 소스 (서버 전용).
// ★dartDisclosed(약 800KB)를 import 하므로 클라이언트 컴포넌트에서 절대
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
