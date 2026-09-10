// src/lib/salaryRedirect.ts
//
// /salary/* 요청 정규화 (Edge 미들웨어용 — Web API·순수 산술만, Node API·무거운 import 금지).
//
// 배경 (2026-09-11 라이브 점검): /salary/[amount] 는 dynamicParams=false 정적 생성이라 집합 밖 금액과
// 구형 URL 형태(/salary/13400-manwon, /salary/1-eok — 2026-02 이전 사이트가 직접 만들던 링크)가 전부
// 404 였다. GSC '찾을 수 없음(404)' 312건의 예시 URL 이 정확히 이 형태다. page.tsx 의 parseSalaryParam 은
// 프리렌더되지 않은 param 에서는 실행조차 되지 않는 죽은 코드였다.
// 여기서는 금액을 해석해 가장 가까운 정적 페이지로 308 을 돌려준다(연봉 1억 3,400만 → 1억 3,500만 페이지).
// 정확한 금액이 필요한 방문자는 그 페이지의 홈 계산기 링크로 이어진다.

import { SALARY_STATIC_AMOUNTS } from "./salaryStaticAmounts.generated";

// 끝 슬래시 변형(/salary/5000-manwon/)은 Next 의 trailingSlash 정규화(308)에 맡긴다 — 여기서 잡으면 2단 리다이렉트가 된다.
const SALARY_PATH = /^\/salary\/([^/]+)$/;

/** URL 조각 → 원 단위 금액. 숫자·{N}-manwon·{N}-eok·{N}-5-eok 만 인식, 그 외 null. */
export function parseSalaryPathAmount(segment: string): number | null {
  let m: RegExpMatchArray | null;
  if ((m = segment.match(/^(\d{1,10})$/))) return Number(m[1]);
  if ((m = segment.match(/^(\d{1,6})-manwon$/))) return Number(m[1]) * 10_000;
  if ((m = segment.match(/^(\d{1,3})-5-eok$/))) return Number(m[1]) * 100_000_000 + 50_000_000;
  if ((m = segment.match(/^(\d{1,3})-eok$/))) return Number(m[1]) * 100_000_000;
  return null;
}

/** 정렬된 정적 집합에서 가장 가까운 금액 (동률이면 큰 쪽). 집합 밖 범위는 양끝으로 클램프. */
export function nearestStaticSalaryAmount(amount: number, amounts: readonly number[] = SALARY_STATIC_AMOUNTS): number {
  if (amounts.length === 0) return amount;
  let lo = 0;
  let hi = amounts.length - 1;
  if (amount <= amounts[lo]) return amounts[lo];
  if (amount >= amounts[hi]) return amounts[hi];
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (amounts[mid] === amount) return amount;
    if (amounts[mid] < amount) lo = mid;
    else hi = mid;
  }
  return amount - amounts[lo] < amounts[hi] - amount ? amounts[lo] : amounts[hi];
}

/**
 * pathname 이 /salary/* 이고 정적 페이지가 아니면 308 목적지 경로, 아니면 null.
 * 정적 집합 안의 숫자 경로(정상 페이지)는 null — 미들웨어가 그대로 통과시킨다.
 */
export function resolveSalaryRedirect(pathname: string, amounts: readonly number[] = SALARY_STATIC_AMOUNTS): string | null {
  const m = pathname.match(SALARY_PATH);
  if (!m) return null;
  const amount = parseSalaryPathAmount(m[1]);
  if (amount === null || !Number.isFinite(amount) || amount <= 0) return null; // 형식 불명 → 기존 404 흐름
  const target = nearestStaticSalaryAmount(amount, amounts);
  const targetPath = `/salary/${target}`;
  return targetPath === pathname ? null : targetPath;
}
