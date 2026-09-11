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

/** salaryReportHref 가 스냅을 허용하는 최대 상대 오차 (|정적 금액 − 목표| / 목표). 넘으면 링크 대신 평문. */
export const SALARY_HREF_MAX_GAP = 0.02;

/** 정적 집합의 [최소, 최대] 범위 안인지 — 범위 밖은 클램프하지 않고 링크를 만들지 않는다. */
function isWithinStaticSalaryRange(amount: number, amounts: readonly number[]): boolean {
  return amounts.length > 0 && amount >= amounts[0] && amount <= amounts[amounts.length - 1];
}

/**
 * 내부 링크용 /salary/[amount] 경로 — 맞는 정적 페이지가 없으면 링크를 만들지 않는다(null).
 *
 * 308 정규화(resolveSalaryRedirect)는 어떤 금액이든 가장 가까운 페이지로 보내야 하지만, 회사 표처럼
 * 금액 옆에 링크를 거는 자리는 다르다: 임원 총보상 4.5억을 집합 끝(3.5억) 페이지로 클램프해 보내면
 * 틀린 목적지다(2026-09-12 S2-2 조사 — 3.5억 초과 임원 행 58건). 그래서
 *   (1) 비정상 값·집합 범위 밖은 null (클램프 금지),
 *   (2) 범위 안이라도 가장 가까운 정적 금액과의 오차가 SALARY_HREF_MAX_GAP(2%) 를 넘으면 null.
 * 호출 측은 null 이면 평문 텍스트로 둔다. 반환 경로는 항상 정적 집합의 원소라 dynamicParams=false 에서도 404 가 없다.
 */
export function salaryReportHref(amountWon: number, amounts: readonly number[] = SALARY_STATIC_AMOUNTS): string | null {
  if (!Number.isFinite(amountWon) || amountWon <= 0) return null;
  if (!isWithinStaticSalaryRange(amountWon, amounts)) return null;
  const snapped = nearestStaticSalaryAmount(amountWon, amounts);
  if (Math.abs(snapped - amountWon) / amountWon > SALARY_HREF_MAX_GAP) return null;
  return `/salary/${snapped}`;
}

/**
 * salaryReportHref 의 느슨한 판 — 2% 오차 규칙 없이, 집합 범위 안이면 가장 가까운 정적 페이지를 돌려준다.
 * 범위 밖은 여전히 null(클램프 금지). 월급 리포트·공유 결과처럼 정확한 금액이 본문에 따로 적혀 있고
 * 종전부터 최근접 페이지로 이어 주던 자리 전용 — 회사 표의 금액 셀처럼 링크 텍스트 자체가 금액인 곳에는 쓰지 말 것.
 */
export function salaryReportHrefOrNearest(amountWon: number, amounts: readonly number[] = SALARY_STATIC_AMOUNTS): string | null {
  const exact = salaryReportHref(amountWon, amounts);
  if (exact !== null) return exact;
  if (!Number.isFinite(amountWon) || amountWon <= 0 || !isWithinStaticSalaryRange(amountWon, amounts)) return null;
  return `/salary/${nearestStaticSalaryAmount(amountWon, amounts)}`;
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
