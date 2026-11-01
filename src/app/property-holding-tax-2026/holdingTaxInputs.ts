// /property-holding-tax-2026 입력 공유 상태 (2026-11-01 R2-HOLD)
//
// 위 계산기(PropertyHoldingTaxClient — HomeTopAd 와 CalcResultAd 사이)와 맨 아래 상세
// (PropertyHoldingTaxDetail — 마지막 광고 MultiplexAd 아래)가 같은 입력을 본다. 두 컴포넌트 사이에 광고가
// 여럿 있어 공통 부모(서버 컴포넌트 page.tsx)로 상태를 올리려면 광고를 클라이언트 래퍼로 감싸야 하므로,
// 광고 JSX 는 그대로 두고 작은 모듈 스토어(useSyncExternalStore)로 잇는다.
// 구독자가 모두 떠나면(페이지를 벗어나면) 기본값으로 돌려, 종전 useState 처럼 들어올 때마다 기본 입력에서 시작한다.
// 서버 프리렌더와 첫 하이드레이션은 항상 기본값(getServerSnapshot)으로 그린다.

import { useMemo, useSyncExternalStore } from "react";
import { calcHoldingTax2026, type HoldingTaxResult } from "@/lib/propertyHoldingTax2026";

export interface HoldingTaxInputs {
  /** 1주택이면 그 주택 공시가격, 2주택 이상이면 공시가격 합계(원) */
  publishedValue: number;
  /** 보유 주택 수 (1~5) */
  numHomes: number;
  /** 1세대 1주택자 여부 (1주택일 때만 의미) */
  isOnlyOneHome: boolean;
  /** 과세기준일(6월 1일) 현재 만 나이 구간의 하한 — 0 은 60세 미만 */
  age: number;
  /** 과세기준일 현재 보유기간 구간의 하한(년) — 0 은 5년 미만 */
  holdingYears: number;
}

export const DEFAULT_HOLDING_TAX_INPUTS: Readonly<HoldingTaxInputs> = Object.freeze({
  publishedValue: 1_000_000_000,
  numHomes: 1,
  isOnlyOneHome: true,
  age: 0,
  holdingYears: 0,
});

let current: HoldingTaxInputs = DEFAULT_HOLDING_TAX_INPUTS;
const listeners = new Set<() => void>();

export function getHoldingTaxInputs(): HoldingTaxInputs {
  return current;
}

function getServerHoldingTaxInputs(): HoldingTaxInputs {
  return DEFAULT_HOLDING_TAX_INPUTS;
}

export function setHoldingTaxInputs(patch: Partial<HoldingTaxInputs>): void {
  const next: HoldingTaxInputs = { ...current, ...patch };
  const keys = Object.keys(next) as (keyof HoldingTaxInputs)[];
  if (keys.every((key) => Object.is(next[key], current[key]))) return;
  current = next;
  listeners.forEach((listener) => listener());
}

export function subscribeHoldingTaxInputs(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) current = DEFAULT_HOLDING_TAX_INPUTS;
  };
}

/** 두 컴포넌트가 함께 쓰는 입력 + 계산 결과 (계산은 src/lib/propertyHoldingTax2026.ts) */
export function useHoldingTax(): { inputs: HoldingTaxInputs; result: HoldingTaxResult } {
  const inputs = useSyncExternalStore(subscribeHoldingTaxInputs, getHoldingTaxInputs, getServerHoldingTaxInputs);
  const { publishedValue, numHomes, isOnlyOneHome, age, holdingYears } = inputs;
  const result = useMemo(
    () => calcHoldingTax2026(publishedValue, numHomes, isOnlyOneHome, { age, holdingYears }),
    [publishedValue, numHomes, isOnlyOneHome, age, holdingYears]
  );
  return { inputs, result };
}
