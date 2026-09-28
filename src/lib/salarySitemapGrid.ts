// src/lib/salarySitemapGrid.ts
//
// /salary 사이트맵 격자 — 내부 링크가 가리킬 /salary/{금액} 의 단일 소스 (S3-2 2단계).
// 스코핑: docs/salary-grid-canonicalization-scoping-2026-09-12.md
//
// 배경: /salary/[amount] 정적 생성 416쪽 중 사이트맵 격자(211) 밖 205쪽은 self-canonical 인데 사이트맵에 없고,
// 표·월급·회사·직업·업종 페이지의 내부 링크가 그 205쪽을 가리켰다(GSC '다른 canonical 선택' 29건).
// 내부 링크는 이 모듈로 스냅한 격자 금액만 가리킨다. 205쪽은 레거시 URL 로 계속 정적 생성한다
// (salaryStaticParams.getStaticSalaryAmounts — 색인된 URL 이 404 가 되면 안 된다).
//
// 데이터 import 0 — "use client" 컴포넌트(SalaryTable)가 써도 회사 DB 같은 무거운 모듈이 번들에 실리지 않는다.

/** 규칙 격자의 양끝 — 이 범위 밖 금액은 격자로 스냅하지 않는다(클램프 금지: 3.5억을 2억 페이지로 보내면 틀린 목적지). */
export const SITEMAP_SALARY_MIN = 5_000_000;
export const SITEMAP_SALARY_MAX = 200_000_000;

/** src/app/sitemap.ts 의 /salary/* 루프 3개와 같은 격자 (테스트가 실제 sitemap() 출력과 대조한다). */
function buildGrid(): number[] {
  const out: number[] = [];
  // 500만~1,950만 50만 단위 — 파트타임·아르바이트 연봉
  for (let i = 5; i < 20; i += 0.5) out.push(Math.round(i * 1_000_000));
  // 2,000만~1억 50만 단위
  for (let i = 20; i <= 100; i += 0.5) out.push(Math.round(i * 1_000_000));
  // 1억 500만~2억 500만 단위
  for (let i = 105; i <= 200; i += 5) out.push(i * 1_000_000);
  return Array.from(new Set(out)).sort((a, b) => a - b);
}

/** 사이트맵에 등재된 /salary 금액 전량 (원 단위, 오름차순·중복 없음) */
export const SITEMAP_SALARY_GRID: readonly number[] = buildGrid();

const GRID_SET: ReadonlySet<number> = new Set(SITEMAP_SALARY_GRID);

/** amount 가 사이트맵 격자 위의 금액인지 */
export function isSitemapSalaryAmount(amountWon: number): boolean {
  return GRID_SET.has(amountWon);
}

/** 정렬된 배열에서 target 에 가장 가까운 값 (동률이면 큰 쪽 — 308 정규화 nearestStaticSalaryAmount 와 같은 규칙) */
function nearestInSorted(target: number, sorted: readonly number[]): number {
  let lo = 0;
  let hi = sorted.length - 1;
  if (target <= sorted[lo]) return sorted[lo];
  if (target >= sorted[hi]) return sorted[hi];
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] < target) lo = mid;
    else hi = mid;
  }
  return target - sorted[lo] < sorted[hi] - target ? sorted[lo] : sorted[hi];
}

/**
 * 금액(원) → 내부 링크가 가리킬 사이트맵 격자 금액.
 *   · 격자 위 금액은 그대로.
 *   · [SITEMAP_SALARY_MIN, SITEMAP_SALARY_MAX] 안이면 가장 가까운 격자 금액 (최대 오차: 1억~1억 500만 구간 약 2.4%).
 *   · 그 밖(2억 초과 등)·비정상 값은 null — 클램프하지 않는다. 호출 측이 평문이나 홈 계산기(/)로 둔다.
 * grid 인자는 테스트용 (기본 = 사이트맵 격자).
 */
export function snapToSitemapSalary(amountWon: number, grid: readonly number[] = SITEMAP_SALARY_GRID): number | null {
  if (!Number.isFinite(amountWon) || grid.length === 0) return null;
  const v = Math.round(amountWon);
  const nearest = nearestInSorted(v, grid);
  if (nearest === v) return v; // 격자 위
  if (v < SITEMAP_SALARY_MIN || v > SITEMAP_SALARY_MAX) return null;
  return nearest;
}

/** 내부 링크용 /salary/{격자 금액} — 격자로 맞출 수 없으면 null */
export function sitemapSalaryHref(amountWon: number): string | null {
  const snapped = snapToSitemapSalary(amountWon);
  return snapped === null ? null : `/salary/${snapped}`;
}
