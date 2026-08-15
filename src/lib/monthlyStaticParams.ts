// src/lib/monthlyStaticParams.ts
//
// /monthly/[amount] 빌드 타임 정적 생성 대상 월급 집합의 단일 소스.
// sitemap.ts 의 /monthly 등재 구간과 반드시 동일하게 유지할 것.
// (salaryStaticParams.ts 의 연봉 축 패턴을 월급 축에 그대로 적용 — 2026-08-15 Phase 3)

export const MIN_MONTHLY = 1_600_000; // 월 160만 (2026 최저임금 언저리 하한)
export const MAX_MONTHLY = 20_000_000; // 월 2,000만

let cached: number[] | null = null;

/** 정적 생성할 월급 전량 — 160만~1,000만 10만 단위 + 1,050만~2,000만 50만 단위 */
export function getStaticMonthlyAmounts(): number[] {
  if (cached) return cached;
  const out: number[] = [];
  for (let m = MIN_MONTHLY; m <= 10_000_000; m += 100_000) out.push(m);
  for (let m = 10_500_000; m <= MAX_MONTHLY; m += 500_000) out.push(m);
  cached = out;
  return out;
}
