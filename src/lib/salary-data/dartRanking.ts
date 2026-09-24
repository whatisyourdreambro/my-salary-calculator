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
// - 두 집계 방식 괴리 10% 초과 회사는 연봉 순위(업종·인상률) 모수에서 제외 (A19, 2026-09-25 —
//   dartRankingGuards). 직원 수·근속연수 랭킹은 급여 괴리와 무관해 전수 모수(플래그만 제외).
// - 인상률 랭킹은 직원 수 급변(±30% 초과) 회사 제외 — 합병·분할 왜곡 방지.
//   + 두 해 중 한 해라도 평균연봉이 그해 연간 최저임금 환산액 미만이면 제외(부분연도·단시간
//   혼입 신호), 인상률 +100% 초과·직원 50명 미만은 이상치로 순위에서 빼 별도 목록
//   (DATA-07, 2026-09-25 — 인용문·FAQ 는 순위 행만 사용).
// - 행 링크: corpCodeMap 매칭 시 /salary-db/{id}, 아니면 listedCohortStockCodes
//   등재 시에만 /salary-db/listed/{stockCode} — 코호트 밖 lite URL은 404.

import { dartDisclosed, DART_DATA_DATE, type DartDisclosedEntry } from "@/data/dart/dartDisclosed";
import { corpCodeMap } from "@/data/dart/corpCodeMap";
import { mapKsicToIndustry } from "@/data/dart/ksicToIndustry";
import {
  MINIMUM_WAGE_2024,
  MINIMUM_WAGE_2025,
  MINIMUM_WAGE_2026,
  type MinimumWageYear,
} from "@/config/minimumWage";
import { getIndustryMeta } from "./industryTaxonomy";
import { listedCohortStockCodes, resolveCompanyRouteId } from "./dartLite";
import { passesRankingDivergence, RANKING_METHOD_REVISED_DATE } from "./dartRankingGuards";

export const DART_RANKING_YEAR = "2025";
/** DART 공시 수집 기준일 — 페이지에 보이는 '데이터 기준일' */
export const DART_RANKING_DATE = DART_DATA_DATE;
/**
 * 랭킹 페이지(업종·지표 TOP) 수정일 — sitemap lastmod·Dataset dateModified 용. 공시 데이터가 그대로여도
 * 순위 모수·기준이 바뀌면 올린다(2026-09-25 A19 괴리 30%→10%, DATA-07 최저임금 미달·이상치 제외).
 * max(수집일, 기준 변경일) — ISO 날짜 문자열 비교, today() 승격 없음.
 */
export const DART_RANKING_PAGE_MODIFIED =
  DART_RANKING_DATE >= RANKING_METHOD_REVISED_DATE ? DART_RANKING_DATE : RANKING_METHOD_REVISED_DATE;
/** 인상률 비교 기준(전년) 사업연도 */
export const RAISE_PREV_YEAR = String(Number(DART_RANKING_YEAR) - 1);

/** 업종 랭킹 페이지 생성 최소 상장사 수 */
export const INDUSTRY_MIN_LISTED = 5;
/** 페이지당 순위표 상한 (대형 업종 캡 — 전체 모수는 본문에 명시) */
export const RANK_ROWS_CAP = 100;
/** 인상률 랭킹 제외 가드: 직원 수 변동 30% 초과 시 합병·분할 왜곡으로 간주 */
const RAISE_EMPLOYEE_CHANGE_MAX = 0.3;
/** 인상률 이상치 기준 (DATA-07) — 초과 시 순위에서 빼 별도 목록 (스톡옵션·부분연도 효과) */
export const RAISE_OUTLIER_MAX_PCT = 100;
/** 인상률 이상치 기준 (DATA-07) — 직원 수가 이보다 적으면 평균이 소수 인원에 좌우됨 */
export const RAISE_MIN_EMPLOYEES = 50;

/**
 * 사업연도별 연간 최저임금 환산액(만원, 시급×209시간×12) — 정본 config/minimumWage.ts.
 * 평균연봉이 이보다 낮으면 임금 인상이 아니라 부분연도·단시간 혼입 신호다 (DATA-07).
 * 매년 4월 DART 갱신 시 새 연도 상수를 여기에 이어 붙인다 (없으면 인상률 비교 불가로 제외).
 */
export const MIN_WAGE_ANNUAL_MANWON: Readonly<Record<string, number>> = Object.fromEntries(
  ([MINIMUM_WAGE_2024, MINIMUM_WAGE_2025, MINIMUM_WAGE_2026] as MinimumWageYear[]).map((w) => [
    String(w.year),
    w.yearly / 10_000,
  ])
);

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

// ── 전수 모수: FY2025 + 무플래그 + 상장 전수 (종전 규칙) ──
// - 회사 카드의 업종 랭킹 도선 (카드 링크 줄이 광고 위에 있어 순위 모수 강화와 무관하게 유지)
// - 직원 수·근속연수 랭킹 — 급여 집계 방식 괴리는 인원·근속과 무관하다. 10% 괴리 모수로
//   돌리면 인용 자산(top-employees·top-tenure)이 조용히 재정렬된다 (2026-09-25 리뷰 정정)
const listedLinkPool: DartDisclosedEntry[] = dartDisclosed.filter(
  (d) =>
    d.fiscalYear === DART_RANKING_YEAR &&
    !(d.flags && d.flags.length) &&
    d.stockCode !== ""
);

// ── 연봉 순위 모수: + 두 집계 방식 괴리 10% 이하 (A19, 2026-09-25 — dartRankingGuards) ──
// 업종 연봉 순위·인상률 순위 전용 (평균연봉 값 자체를 비교하는 랭킹)
const listedEligible: DartDisclosedEntry[] = listedLinkPool.filter(passesRankingDivergence);

/** 연봉 순위 모수 (괴리 10% 초과 제외) — 업종 연봉 순위·인상률 랭킹 표기용 */
export const LISTED_TOTAL = listedEligible.length;
/** 상장사 전수 모수 (플래그만 제외, 종전 규칙) — 직원 수·근속연수 랭킹 표기용 */
export const LISTED_ALL_TOTAL = listedLinkPool.length;
/** 연봉 순위 모수에서 괴리 10% 초과로 뺀 상장사 수 — 방법론 표기용 */
export const LISTED_DIVERGENCE_EXCLUDED = LISTED_ALL_TOTAL - LISTED_TOTAL;

function linkFor(d: DartDisclosedEntry): string | null {
  // corpCodeMap 의 id 를 그대로 쓰면 dedupe 로 사라진 회사(15곳)에 대해
  // 존재하지 않는 /salary-db/{id} 링크가 나간다 — 실재 라우트로 해석한다.
  const id = resolveCompanyRouteId(companyIdByCorp.get(d.corpCode), d.corpNameKo);
  if (id) return `/salary-db/${id}`;
  if (listedCohortStockCodes.has(d.stockCode)) return `/salary-db/listed/${d.stockCode}`;
  return null;
}

/**
 * ItemList JSON-LD 항목 — 자체 페이지(href)가 있는 행만, position 은 원래 순위 유지.
 * href 없는 행을 랭킹 페이지 자신의 URL 로 채우면 ListItem 이 자기 자신을 가리킨다
 * (RT-09, 2026-09-25: 업종 28쪽 972항목 중 608개가 canonical 과 동일했다).
 * 화면 순위표는 그대로 두고 구조화 데이터에서만 뺀다.
 */
export function rankingItemListItems(
  rows: RankingRow[],
  nameOf: (row: RankingRow) => string = (row) => row.nameKo
): { position: number; name: string; url: string }[] {
  return rows
    .filter((row): row is RankingRow & { href: string } => Boolean(row.href))
    .map((row) => ({ position: row.rank, name: nameOf(row), url: row.href }));
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
  for (const d of listedLinkPool) {
    const id = resolveCompanyRouteId(companyIdByCorp.get(d.corpCode), d.corpNameKo);
    if (!id || m.has(id)) continue;
    const industryId = mapKsicToIndustry(d.ksicCode);
    if (industryId === "etc" || !industryRankingById.has(industryId)) continue;
    m.set(id, { industryId, industryKo: getIndustryMeta(industryId).ko });
  }
  return m;
})();

// ── 지표 랭킹 3종 ──

/** 인상률 랭킹에서 이상치로 빠진 행 — 순위 없음, 사유 표기 (DATA-07) */
export interface RaiseOutlierRow extends RankingRow {
  outlierReason: string;
}

interface RaiseCandidate {
  d: DartDisclosedEntry;
  raisePct: number;
  prev: number;
}

/**
 * 인상률 후보 — 전년(FY2024) 이력 보유 + 직원 수 급변(±30%) 제외 + 두 해 모두 연간 최저임금
 * 환산액 이상(DATA-07 (a)). 인상률 내림차순.
 */
const raiseCandidates: RaiseCandidate[] = (() => {
  const curMin = MIN_WAGE_ANNUAL_MANWON[DART_RANKING_YEAR];
  const prevMin = MIN_WAGE_ANNUAL_MANWON[RAISE_PREV_YEAR];
  const out: RaiseCandidate[] = [];
  // 최저임금 상수가 없는 연도는 비교 불가 — 빈 랭킹보다 조용한 필터 누락이 더 위험해 전부 제외
  if (curMin == null || prevMin == null) return out;
  for (const d of listedEligible) {
    const prev = d.history?.find((h) => h.fiscalYear === RAISE_PREV_YEAR);
    if (!prev || prev.avgSalaryManwonRaw <= 0 || prev.employeeCount <= 0) continue;
    const empChange = Math.abs(d.employeeCount - prev.employeeCount) / prev.employeeCount;
    if (empChange > RAISE_EMPLOYEE_CHANGE_MAX) continue;
    if (d.avgSalaryManwonRaw < curMin || prev.avgSalaryManwonRaw < prevMin) continue;
    const raisePct = ((d.avgSalaryManwonRaw - prev.avgSalaryManwonRaw) / prev.avgSalaryManwonRaw) * 100;
    out.push({ d, raisePct, prev: prev.avgSalaryManwonRaw });
  }
  return out.sort((a, b) => b.raisePct - a.raisePct);
})();

/** DATA-07 (b) — 이상치 사유 (없으면 null = 순위 행) */
function raiseOutlierReason(c: RaiseCandidate): string | null {
  const reasons: string[] = [];
  if (c.raisePct > RAISE_OUTLIER_MAX_PCT) reasons.push(`인상률 +${RAISE_OUTLIER_MAX_PCT}% 초과`);
  if (c.d.employeeCount < RAISE_MIN_EMPLOYEES) reasons.push(`직원 ${RAISE_MIN_EMPLOYEES}명 미만`);
  return reasons.length ? reasons.join("·") : null;
}

function toRaiseRow(c: RaiseCandidate, rank: number): RankingRow {
  return {
    ...toRow(c.d, rank),
    raisePct: Math.round(c.raisePct * 10) / 10,
    prevSalaryManwon: c.prev,
  };
}

const raiseSplit = (() => {
  const rows: RankingRow[] = [];
  const outliers: RaiseOutlierRow[] = [];
  // 이상치를 걸러 가며 순위 행 100개를 채운다 — 그 사이에 만난 이상치(= 걸러지지 않았다면
  // TOP 100 안에 들었을 행)만 별도 목록에 싣는다.
  for (const c of raiseCandidates) {
    if (rows.length >= RANK_ROWS_CAP) break;
    const reason = raiseOutlierReason(c);
    if (reason) outliers.push({ ...toRaiseRow(c, 0), outlierReason: reason });
    else rows.push(toRaiseRow(c, rows.length + 1));
  }
  return { rows, outliers };
})();

/** 연봉 인상률 TOP 100 — 위 가드 전부 통과한 행만 (인용문·FAQ 는 이 목록만 사용) */
export const topRaiseRows: RankingRow[] = raiseSplit.rows;

/** 순위에서 뺀 이상치 (+100% 초과·직원 50명 미만) — 페이지 하단 별도 목록 */
export const topRaiseOutlierRows: RaiseOutlierRow[] = raiseSplit.outliers;

/** 인상률 랭킹 모수 (방법론·메타 표기용) — 순위 행과 같은 필터 (이상치 제외) */
export const raiseEligibleCount = raiseCandidates.filter((c) => !raiseOutlierReason(c)).length;

/** 평균 근속연수 TOP 100 — 전수 모수(급여 괴리 무관, 위 listedLinkPool 주석) */
export const topTenureRows: RankingRow[] = [...listedLinkPool]
  .filter((d) => d.avgTenureYears != null && d.avgTenureYears > 0)
  .sort((a, b) => (b.avgTenureYears ?? 0) - (a.avgTenureYears ?? 0))
  .slice(0, RANK_ROWS_CAP)
  .map((d, i) => toRow(d, i + 1));

export const tenureEligibleCount = listedLinkPool.filter(
  (d) => d.avgTenureYears != null && d.avgTenureYears > 0
).length;

/** 직원 수 TOP 100 — 전수 모수(급여 괴리 무관) */
export const topEmployeesRows: RankingRow[] = [...listedLinkPool]
  .sort((a, b) => b.employeeCount - a.employeeCount)
  .slice(0, RANK_ROWS_CAP)
  .map((d, i) => toRow(d, i + 1));
