// src/lib/salaryStaticParams.ts
//
// /salary/[amount] 빌드 타임 정적 생성(SSG) 대상 amount 집합의 단일 소스.
//
// 배경: 기존에는 runtime="edge"로 매 요청 SSR → 구글봇 크롤 시 CF Worker CPU
// 한도 초과로 GSC 5xx가 발생했다. 정적 생성으로 전환하면서 dynamicParams=false
// (집합 밖 URL은 404)가 되므로, 사이트 내부에서 /salary/{amount} 링크를 만드는
// "모든" 지점의 amount가 이 집합에 포함되어야 내부 404 링크가 생기지 않는다.
//
// 집합 구성 (2026-08-07 전수 조사 기준 — 링크 생성 지점과 1:1 대응):
//   1. 사이트맵 격자        — src/app/sitemap.ts 의 /salary/* 등재 구간과 동일
//   2. 표 4종 행 링크       — /table/2026/{annual,monthly,weekly,hourly} 의
//                             linkColumnBaseHref="/salary" (행 데이터 생성 함수를
//                             직접 import 해 링크 환산식까지 그대로 재현 — 드리프트 방지)
//   3. 회사 신입 총보상     — CompanyNarrative·CompanyBonusCalculatorLink 가
//                             entry.base + entry.incentive.avgAmount 로 링크
//   4. 직군/지역/산업 평균  — job·region·industry 페이지의 avg/overall × 10000 링크
//   5. 고정 링크            — 홈 인기 구간(POPULAR_SALARY_LINKS)·/region 하단·
//                             glossary/qna/가이드 본문의 하드코딩 링크
//
// ★ 새 내부 링크 지점을 추가할 때는 반드시 이 집합 안의 값만 가리키거나,
//   해당 값을 이 파일에 추가할 것. (검증: 아래 각 수집 함수와 대조)

import { allCompanies } from "@/data/companies";
import { jobsData } from "@/data/jobsData";
import { regionsData } from "@/data/regionsData";
import { industriesData } from "@/data/industriesData";
import { POPULAR_SALARY_LINKS } from "@/lib/homeContent";
import { generateAnnualSalaryTableData2026 } from "@/lib/generateData2026";
import {
  generateWeeklyPayTableData2026,
  generateHourlyWageTableData2026,
} from "@/lib/generateData";

// 색인 가능한 연봉 범위 — 범위 밖이거나 형식이 잘못된 URL은 404 (무한 thin-content 방지)
export const MIN_SALARY = 1_000_000; // 연 100만원
export const MAX_SALARY = 1_000_000_000; // 연 10억

/**
 * 사이트맵 격자 — src/app/sitemap.ts 의 /salary/* 루프와 반드시 동일하게 유지.
 * (500만~1,950만 50만 단위 / 2,000만~1억 50만 단위 / 1억 500만~2억 500만 단위)
 */
export function sitemapGridAmounts(): number[] {
  const out: number[] = [];
  for (let i = 5; i < 20; i += 0.5) out.push(Math.round(i * 1_000_000));
  for (let i = 20; i <= 100; i += 0.5) out.push(Math.round(i * 1_000_000));
  for (let i = 105; i <= 200; i += 5) out.push(i * 1_000_000);
  // sitemap.ts 의 specials 목록 (전부 위 격자에 이미 포함되지만 방어적으로 명시)
  out.push(
    24_000_000, 26_000_000, 28_000_000, 32_000_000, 35_000_000, 38_000_000,
    42_000_000, 45_000_000, 55_000_000, 65_000_000, 75_000_000, 85_000_000,
    95_000_000
  );
  return out;
}

/**
 * 표 4종의 행 링크 amount — 실제 행 데이터 생성 함수를 그대로 사용해
 * SalaryTable buildHref(= Math.round(preTax × multiplier))와 동일하게 환산.
 */
function tableRowLinkAmounts(): number[] {
  const out: number[] = [];
  // 연봉·월급 표: /salary/{preTax} (monthly는 linkValueKey="preTax"로 동일 값)
  for (const row of generateAnnualSalaryTableData2026()) out.push(Math.round(row.preTax));
  // 주급 표: WeeklyTableInteractive linkValueMultiplier={52}
  for (const row of generateWeeklyPayTableData2026()) out.push(Math.round(row.preTax * 52));
  // 시급 표: HourlyTableInteractive linkValueMultiplier={209 * 12}
  for (const row of generateHourlyWageTableData2026()) out.push(Math.round(row.preTax * 209 * 12));
  return out;
}

/**
 * 전 회사 신입 총보상(영끌) — CompanyNarrative·CompanyBonusCalculatorLink·
 * RelatedCompanies 가 쓰는 entry.base + entry.incentive.avgAmount 식과 동일.
 */
function companyEntryAmounts(): number[] {
  return allCompanies.map(
    (c) => c.salary.entry.base + (c.salary.entry.incentive.avgAmount || 0)
  );
}

/** 직군·지역·산업 페이지의 /salary/{만원 × 10000} 링크 값 전량 */
function jobRegionIndustryAmounts(): number[] {
  const out: number[] = [];
  for (const j of jobsData) {
    out.push(
      j.salary.overall * 10000,
      j.salary.entry.avg * 10000,
      j.salary.junior.avg * 10000,
      j.salary.senior.avg * 10000
    );
  }
  for (const r of regionsData) {
    out.push(
      r.salary.overall * 10000,
      r.salary.entry.avg * 10000,
      r.salary.junior.avg * 10000,
      r.salary.senior.avg * 10000
    );
  }
  for (const ind of industriesData) {
    out.push(
      ind.salary.overall * 10000,
      ind.salary.entry.avg * 10000,
      ind.salary.junior.avg * 10000,
      ind.salary.senior.avg * 10000
    );
  }
  return out;
}

/**
 * 그 외 하드코딩 내부 링크:
 * - /region 하단 서울(4,800만)·판교(6,200만)
 * - glossary/qna 상세·가이드 본문의 연봉 5천만원 링크
 * - SalaryNudge 인기 구간(3,000만~1억 — 전부 격자 안이지만 방어적으로 명시)
 */
const FIXED_LINK_AMOUNTS: number[] = [
  48_000_000, 62_000_000, 50_000_000, 30_000_000, 35_000_000, 40_000_000,
  45_000_000, 60_000_000, 70_000_000, 80_000_000, 100_000_000,
];

let cachedAmounts: number[] | null = null;
let cachedSet: Set<number> | null = null;

/** 정적 생성할 amount 전량 (오름차순, 중복 제거, [MIN, MAX] 범위 내) */
export function getStaticSalaryAmounts(): number[] {
  if (cachedAmounts) return cachedAmounts;
  const set = new Set<number>();
  const addAll = (list: number[]) => {
    for (const raw of list) {
      const v = Math.round(raw);
      if (Number.isFinite(v) && v >= MIN_SALARY && v <= MAX_SALARY) set.add(v);
    }
  };
  addAll(sitemapGridAmounts());
  addAll(tableRowLinkAmounts());
  addAll(companyEntryAmounts());
  addAll(jobRegionIndustryAmounts());
  addAll(POPULAR_SALARY_LINKS.map((l) => l.amount));
  addAll(FIXED_LINK_AMOUNTS);
  cachedAmounts = Array.from(set).sort((a, b) => a - b);
  return cachedAmounts;
}

/** amount가 정적 생성 집합에 포함되는지 (내부 링크 생성 전 검증용) */
export function isStaticSalaryAmount(amount: number): boolean {
  if (!cachedSet) cachedSet = new Set(getStaticSalaryAmounts());
  return cachedSet.has(amount);
}

// ─────────────────────────────────────────────────────────────
// 인근 연봉 링크 — /salary/[amount] 페이지 하단 "다른 연봉 리포트"
// ─────────────────────────────────────────────────────────────

let cachedGrid: number[] | null = null;

function sortedGrid(): number[] {
  if (!cachedGrid) {
    cachedGrid = Array.from(new Set(sitemapGridAmounts())).sort((a, b) => a - b);
  }
  return cachedGrid;
}

/** 오름차순 배열에서 target에 가장 가까운 값 (동률이면 작은 쪽) */
function snapToGrid(target: number, grid: number[]): number {
  let lo = 0;
  let hi = grid.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (grid[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  if (lo > 0 && target - grid[lo - 1] <= grid[lo] - target) return grid[lo - 1];
  return grid[lo];
}

/**
 * 인근 연봉 cross-link 대상 — 기존 오프셋(±200/±400/±800/+1,200/+2,000만원)을
 * 유지하되, 반드시 사이트맵 격자(= 정적 생성 집합의 부분집합) 위의 값으로
 * 스냅한다. 내부 404 링크 0건 보장.
 */
export function getSalaryNeighborAmounts(amount: number): number[] {
  const grid = sortedGrid();
  const offsetsManwon = [-800, -400, -200, 200, 400, 800, 1200, 2000];
  const picked = new Set<number>();
  for (const off of offsetsManwon) {
    const snapped = snapToGrid(amount + off * 10_000, grid);
    if (snapped !== amount) picked.add(snapped);
  }
  return Array.from(picked).sort((a, b) => a - b);
}
