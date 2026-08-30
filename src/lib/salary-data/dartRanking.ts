// src/lib/salary-data/dartRanking.ts
//
// DART 공시 상장사 랭킹 페이지군(/salary-db/listed/industry/[industryId],
// /salary-db/listed/top-*) 집계 — 단일 소스 (서버 전용).
// ★dartDisclosed(약 1.3MB)를 import 하므로 클라이언트 컴포넌트에서 절대
//   import 금지 (서버 컴포넌트·generateStaticParams·sitemap 전용).
//
// 게이팅 원칙 (compare 413 색인 거부 교훈):
// - 단일 축·고정 코호트만 — 조합 축 페이지 금지.
// - 업종 페이지는 상장사 5곳 이상 업종만 생성 (dynamicParams=false, 밖은 404).
// - dartReport 집계 원칙 승계: FY2025 단일 기준·플래그 제외·직원 수 가중 평균.
// - 인상률 랭킹은 직원 수 급변(±30% 초과) 회사 제외 — 합병·분할 왜곡 방지.
// - 행 링크: corpCodeMap 매칭 시 /salary-db/{id}, 아니면 listedCohortStockCodes
//   등재 시에만 /salary-db/listed/{stockCode} — 코호트 밖 lite URL은 404.

import { dartDisclosed, DART_DATA_DATE, type DartDisclosedEntry } from "@/data/dart/dartDisclosed";
import { corpCodeMap } from "@/data/dart/corpCodeMap";
import { mapKsicToIndustry } from "@/data/dart/ksicToIndustry";
import { getIndustryMeta } from "./industryTaxonomy";
import { listedCohortStockCodes } from "./dartLite";

export const DART_RANKING_YEAR = "2025";
export const DART_RANKING_DATE = DART_DATA_DATE;

/** 업종 랭킹 페이지 생성 최소 상장사 수 */
export const INDUSTRY_MIN_LISTED = 5;
/** 페이지당 순위표 상한 (대형 업종 캡 — 전체 모수는 본문에 명시) */
export const RANK_ROWS_CAP = 100;
/** 인상률 랭킹 제외 가드: 직원 수 변동 30% 초과 시 합병·분할 왜곡으로 간주 */
const RAISE_EMPLOYEE_CHANGE_MAX = 0.3;

function decodeName(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

const companyIdByCorp = new Map<string, string>();
for (const [id, entry] of Object.entries(corpCodeMap)) {
  if (!companyIdByCorp.has(entry.corpCode)) companyIdByCorp.set(entry.corpCode, id);
}

export interface RankingRow {
  rank: number;
  nameKo: string;
  stockCode: string;
  /** 내부 링크 — 상세 프로필 > lite > 없음(null) 순 */
  href: string | null;
  avgSalaryManwon: number;
  employeeCount: number;
  avgTenureYears?: number;
  industryId: string;
  industryKo: string;
  /** 인상률 랭킹 전용 — 전년(FY2024) 대비 % */
  raisePct?: number;
  prevSalaryManwon?: number;
}

// ── 모수: FY2025 + 무플래그 + 상장 전수 ──
const listedEligible: DartDisclosedEntry[] = dartDisclosed.filter(
  (d) =>
    d.fiscalYear === DART_RANKING_YEAR &&
    !(d.flags && d.flags.length) &&
    d.stockCode !== ""
);

export const LISTED_TOTAL = listedEligible.length;

function linkFor(d: DartDisclosedEntry): string | null {
  const id = companyIdByCorp.get(d.corpCode);
  if (id) return `/salary-db/${id}`;
  if (listedCohortStockCodes.has(d.stockCode)) return `/salary-db/listed/${d.stockCode}`;
  return null;
}

function toRow(d: DartDisclosedEntry, rank: number): RankingRow {
  const industryId = mapKsicToIndustry(d.ksicCode);
  return {
    rank,
    nameKo: decodeName(d.corpNameKo),
    stockCode: d.stockCode,
    href: linkFor(d),
    avgSalaryManwon: d.avgSalaryManwonRaw,
    employeeCount: d.employeeCount,
    avgTenureYears: d.avgTenureYears,
    industryId,
    industryKo: getIndustryMeta(industryId).ko,
  };
}

// ── 업종별 랭킹 ──
export interface IndustryRanking {
  industryId: string;
  industryKo: string;
  companyCount: number;
  totalEmployees: number;
  weightedAvgManwon: number;
  medianManwon: number;
  topRows: RankingRow[]; // 평균연봉 내림차순, RANK_ROWS_CAP 캡
}

export const industryRankings: IndustryRanking[] = (() => {
  const groups = new Map<string, DartDisclosedEntry[]>();
  for (const d of listedEligible) {
    const id = mapKsicToIndustry(d.ksicCode);
    if (id === "etc") continue;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id)!.push(d);
  }
  const out: IndustryRanking[] = [];
  for (const [industryId, list] of groups) {
    if (list.length < INDUSTRY_MIN_LISTED) continue;
    const sorted = [...list].sort((a, b) => b.avgSalaryManwonRaw - a.avgSalaryManwonRaw);
    const totalEmployees = list.reduce((s, d) => s + d.employeeCount, 0);
    const weighted =
      totalEmployees > 0
        ? Math.round(
            list.reduce((s, d) => s + d.avgSalaryManwonRaw * d.employeeCount, 0) / totalEmployees
          )
        : 0;
    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 === 1
        ? sorted[mid].avgSalaryManwonRaw
        : Math.round((sorted[mid - 1].avgSalaryManwonRaw + sorted[mid].avgSalaryManwonRaw) / 2);
    out.push({
      industryId,
      industryKo: getIndustryMeta(industryId).ko,
      companyCount: list.length,
      totalEmployees,
      weightedAvgManwon: weighted,
      medianManwon: median,
      topRows: sorted.slice(0, RANK_ROWS_CAP).map((d, i) => toRow(d, i + 1)),
    });
  }
  return out.sort((a, b) => b.weightedAvgManwon - a.weightedAvgManwon);
})();

const industryRankingById = new Map(industryRankings.map((r) => [r.industryId, r]));

export function getIndustryRanking(industryId: string): IndustryRanking | null {
  return industryRankingById.get(industryId) ?? null;
}

/**
 * companyId → 소속 업종 랭킹 메타 (랭킹 페이지가 실재하는 업종만).
 * R2 W1 (2026-08-31) — salary-db/[id] 430p 공시 카드에서 업종 랭킹 도선용.
 * 서버 전용 (dartDisclosed 경유) — 클라이언트 import 금지.
 */
export const industryRankingByCompanyId: ReadonlyMap<
  string,
  { industryId: string; industryKo: string }
> = (() => {
  const m = new Map<string, { industryId: string; industryKo: string }>();
  for (const d of listedEligible) {
    const id = companyIdByCorp.get(d.corpCode);
    if (!id || m.has(id)) continue;
    const industryId = mapKsicToIndustry(d.ksicCode);
    if (industryId === "etc" || !industryRankingById.has(industryId)) continue;
    m.set(id, { industryId, industryKo: getIndustryMeta(industryId).ko });
  }
  return m;
})();

// ── 지표 랭킹 3종 ──

/** 연봉 인상률 TOP 100 — FY2024 history 보유 + 직원 수 급변 제외 */
export const topRaiseRows: RankingRow[] = (() => {
  const candidates: { d: DartDisclosedEntry; raisePct: number; prev: number }[] = [];
  for (const d of listedEligible) {
    const prev = d.history?.find((h) => h.fiscalYear === "2024");
    if (!prev || prev.avgSalaryManwonRaw <= 0 || prev.employeeCount <= 0) continue;
    const empChange = Math.abs(d.employeeCount - prev.employeeCount) / prev.employeeCount;
    if (empChange > RAISE_EMPLOYEE_CHANGE_MAX) continue;
    const raisePct = ((d.avgSalaryManwonRaw - prev.avgSalaryManwonRaw) / prev.avgSalaryManwonRaw) * 100;
    candidates.push({ d, raisePct, prev: prev.avgSalaryManwonRaw });
  }
  return candidates
    .sort((a, b) => b.raisePct - a.raisePct)
    .slice(0, RANK_ROWS_CAP)
    .map((c, i) => ({
      ...toRow(c.d, i + 1),
      raisePct: Math.round(c.raisePct * 10) / 10,
      prevSalaryManwon: c.prev,
    }));
})();

/** 인상률 랭킹 모수 (방법론 표기용) */
export const raiseEligibleCount = (() => {
  let n = 0;
  for (const d of listedEligible) {
    const prev = d.history?.find((h) => h.fiscalYear === "2024");
    if (!prev || prev.avgSalaryManwonRaw <= 0 || prev.employeeCount <= 0) continue;
    if (Math.abs(d.employeeCount - prev.employeeCount) / prev.employeeCount > RAISE_EMPLOYEE_CHANGE_MAX) continue;
    n++;
  }
  return n;
})();

/** 평균 근속연수 TOP 100 */
export const topTenureRows: RankingRow[] = [...listedEligible]
  .filter((d) => d.avgTenureYears != null && d.avgTenureYears > 0)
  .sort((a, b) => (b.avgTenureYears ?? 0) - (a.avgTenureYears ?? 0))
  .slice(0, RANK_ROWS_CAP)
  .map((d, i) => toRow(d, i + 1));

export const tenureEligibleCount = listedEligible.filter(
  (d) => d.avgTenureYears != null && d.avgTenureYears > 0
).length;

/** 직원 수 TOP 100 */
export const topEmployeesRows: RankingRow[] = [...listedEligible]
  .sort((a, b) => b.employeeCount - a.employeeCount)
  .slice(0, RANK_ROWS_CAP)
  .map((d, i) => toRow(d, i + 1));
