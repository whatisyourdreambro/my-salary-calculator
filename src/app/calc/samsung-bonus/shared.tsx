"use client";

// samsung-bonus 공유 모듈 — 고정 정책 상수·세금 로직·사업부 데이터·포맷 유틸·useCountUp.
// Client.tsx 본체와 next/dynamic 으로 분리 로드되는 시뮬레이터 2종이 함께 사용한다.

import { useState, useEffect, useRef } from "react";

// ────────────────────────────────────────────────────────────
// 고정 정책 변수 (공개 노사 합의 보도 기반)
// ────────────────────────────────────────────────────────────
export const FIXED_RERATE = 10.5; // 영업이익의 10.5% — OPI2(특별경영성과금) 재원
export const FIXED_BU_RATIO = 4; // 부문 : 사업부 = 4 : 6
export const FIXED_SA_RATIO = 6;
export const FIXED_OPI1_RATE = 50; // OPI1(기본 성과인센티브) = 연봉의 50%
export const REFERENCE_SALARY = 80_000_000; // 본인 연봉 비례 기준 (평균 8천만원)

// 회의록 임계값:
// • 2026~2028: 영업이익 200조 이상 → 성과급 풀 활성화
// • 2029~2035 (향후 7년): 영업이익 100조 이상 → 성과급 풀 활성화
export function getThreshold(year: number): number {
  if (year >= 2026 && year <= 2028) return 200;
  if (year >= 2029 && year <= 2035) return 100;
  return 0; // 합의 범위 외 — 임계값 정보 없음
}
export function getThresholdPeriod(year: number): string {
  if (year >= 2026 && year <= 2028) return "26~28년 (200조 이상)";
  if (year >= 2029 && year <= 2035) return "29~35년 (100조 이상)";
  return "합의 범위 외";
}

// ────────────────────────────────────────────────────────────
// 세금 로직
// ────────────────────────────────────────────────────────────

const TAX_BRACKETS = [
  { limit: 14_000_000, rate: 0.06, deduction: 0 },
  { limit: 50_000_000, rate: 0.15, deduction: 1_260_000 },
  { limit: 88_000_000, rate: 0.24, deduction: 5_760_000 },
  { limit: 150_000_000, rate: 0.35, deduction: 15_440_000 },
  { limit: 300_000_000, rate: 0.38, deduction: 19_940_000 },
  { limit: 500_000_000, rate: 0.40, deduction: 25_940_000 },
  { limit: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { limit: Infinity, rate: 0.45, deduction: 65_940_000 },
];

function calcEmpDeduction(total: number): number {
  if (total <= 5_000_000) return total * 0.7;
  if (total <= 15_000_000) return 3_500_000 + (total - 5_000_000) * 0.4;
  if (total <= 45_000_000) return 7_500_000 + (total - 15_000_000) * 0.15;
  if (total <= 100_000_000) return 12_000_000 + (total - 45_000_000) * 0.05;
  return Math.min(14_750_000 + (total - 100_000_000) * 0.02, 20_000_000);
}

function calcTax(taxable: number): number {
  if (taxable <= 0) return 0;
  for (const b of TAX_BRACKETS) {
    if (taxable <= b.limit)
      return Math.max(0, Math.round(taxable * b.rate - b.deduction));
  }
  return 0;
}

// 세금/4대보험 계산. credit = 세액공제율(0~50%), applyInsurance = 4대보험 추가 부과 적용 여부
export function calcBonusNet(
  salary: number,
  bonusWon: number,
  credit: number,
  applyInsurance: boolean
) {
  if (bonusWon <= 0)
    return { net: 0, deduct: 0, effRate: 0, breakdown: emptyBreakdown() };

  const basicDeduct = 1_500_000;
  const baseTaxable = Math.max(
    0,
    salary - calcEmpDeduction(salary) - basicDeduct
  );
  const total = salary + bonusWon;
  const totalTaxable = Math.max(
    0,
    total - calcEmpDeduction(total) - basicDeduct
  );
  const grossIncomeTaxOnBonus = calcTax(totalTaxable) - calcTax(baseTaxable);
  const incomeTaxOnBonus = grossIncomeTaxOnBonus * (1 - credit / 100);
  const localTax = incomeTaxOnBonus * 0.1;

  let nationalPension = 0;
  let healthIns = 0;
  let longTermCare = 0;
  let employment = 0;
  if (applyInsurance) {
    // 국민연금: 보수월액 연 7,644만원 상한 — 본봉이 상한 미달일 때만 추가 부과
    const pensionCap = 76_440_000;
    const pensionBase = Math.max(0, pensionCap - salary);
    nationalPension = Math.min(bonusWon, pensionBase) * 0.0475;
    // 건강·고용은 상한 없음. 다만 보수정산 시점에 일시 부과되며 회사가 일부 분담.
    healthIns = bonusWon * 0.03595;
    longTermCare = healthIns * 0.1314;
    employment = bonusWon * 0.009;
  }
  const insurance = nationalPension + healthIns + longTermCare + employment;

  const deduct = incomeTaxOnBonus + localTax + insurance;
  return {
    net: bonusWon - deduct,
    deduct,
    effRate: (deduct / bonusWon) * 100,
    breakdown: {
      incomeTax: incomeTaxOnBonus,
      localTax,
      nationalPension,
      healthIns,
      longTermCare,
      employment,
    },
  };
}

function emptyBreakdown() {
  return {
    incomeTax: 0,
    localTax: 0,
    nationalPension: 0,
    healthIns: 0,
    longTermCare: 0,
    employment: 0,
  };
}

// ────────────────────────────────────────────────────────────
// 사업부 데이터 — 색맹 보강용 패턴/아이콘 동반
// ────────────────────────────────────────────────────────────

export type Division = {
  id: "memory" | "common" | "foundry";
  label: string;
  shortLabel: string;
  color: string;
  bgTint: string;
  defaultCount: number;
  defaultRatio: number;
};

// 보도값 매칭 보정 — 영업이익 350조 기준 메모리 791%·공통 553%·파운드리 252%
// 보도 결과에 가장 근접한 가중치 역산. 회의록 원본은 1.0/0.7/0.0이지만 보도값과
// 정합 불가(공통 16% 과대평가)하므로 보도값 매칭 우선. 사용자가 회의록 원본 값으로
// UI에서 직접 조정 가능.
export const DIVISIONS: Division[] = [
  {
    id: "memory",
    label: "메모리",
    shortLabel: "M",
    color: "#0145F2",
    bgTint: "#0145F20D",
    defaultCount: 27400,
    defaultRatio: 1.0,
  },
  {
    id: "common",
    label: "공통",
    shortLabel: "C",
    color: "#F59E0B",
    bgTint: "#F59E0B0D",
    defaultCount: 29000,
    defaultRatio: 0.55, // 보도값 553% 매칭 (회의록 원본 0.7)
  },
  {
    id: "foundry",
    label: "파운드리·시스템LSI",
    shortLabel: "F",
    color: "#EF4444",
    bgTint: "#EF44440D",
    defaultCount: 20900,
    defaultRatio: 0.05, // 보도값 252% 매칭 + 2026 적자 사업부 (회의록 원본 0.0)
  },
];

// ────────────────────────────────────────────────────────────
// 유틸 — 모든 큰 숫자 입력은 콤마 포맷으로 통일
// ────────────────────────────────────────────────────────────

export function fmtManwon(n: number) {
  return Math.round(n).toLocaleString("ko-KR") + "만원";
}
export function fmtManwonInt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}
export function fmtEok(n: number) {
  const eok = n / 10000;
  return eok >= 1 ? `≈ ${eok.toFixed(2)}억` : "";
}
export function fmtTrillion(manwon: number) {
  return (manwon / 1e8).toFixed(1);
}
export function fmtEokInt(manwon: number) {
  return Math.round(manwon / 10000).toLocaleString("ko-KR");
}
export function fmtPlain(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}
export function formatNumberInput(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
}
export function parseNumberInput(s: string): number {
  return Number(s.replace(/[^0-9]/g, "")) || 0;
}

export function useCountUp(target: number, duration = 450): number {
  const [value, setValue] = useState(target);
  const prevTarget = useRef(target);
  const prevValue = useRef(target);

  useEffect(() => {
    if (Math.abs(prevTarget.current - target) < 1) {
      setValue(target);
      prevTarget.current = target;
      prevValue.current = target;
      return;
    }
    const start = prevValue.current;
    const startTime = performance.now();
    let rafId = 0;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;
      prevValue.current = current;
      setValue(current);
      if (progress < 1) rafId = requestAnimationFrame(tick);
      else {
        prevTarget.current = target;
        prevValue.current = target;
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return value;
}
