// /calc/severance-vs-pension (퇴직금 vs 퇴직연금 비교) 계산부.
//
// 2026-10-05 감사 code6-02 정정: 종전 Client.tsx 는 IRP 연금 수령 세금을 퇴직금 전액의 4.4%(3.3~5.5% 평균)로
// 잡았다. 3.3~5.5% 는 세액공제받은 납입금·운용수익을 연금으로 받을 때의 연금소득세율이고, 퇴직금을 IRP 에서
// 연금으로 받으면 이연퇴직소득세(일시 수령 때 낼 퇴직소득세)의 70%(연금 실제 수령연차 10년 이하)만
// 원천징수한다 — 소득세법 제129조 제1항 제5호의3(11~20년차 60%, 21년차부터 50%), 시행 2026.1.1.
// 4.4% 모델은 일시 수령 실효세율이 4.4% 보다 낮은 대부분의 입력(기본값 포함)에서 연금 수령 쪽 세금을 더 크게 잡아
// 화면에 '최대 +-1,025,408원' 을 띄우고 조언을 거꾸로 만들었다.
// 이 모듈은 퇴직소득세를 사이트 정본 calculateSeveranceTax(8구간 누진세율)로 계산하고, 연금 수령 세금은 그 70%로 본다
// (수령 1~10년차 기준 — 10년을 넘겨 받으면 실제 세금은 이보다 더 줄어든다).
//
// code6-08 정정: DB(최종 평균임금 × 근속)는 마지막 해 연봉을 현재 연봉 × (1+상승률)^(근속−1) 로 본다.
// DC 적립 루프는 0년차(현재 연봉)부터 근속−1 년차까지 적립하므로, 종전 ^근속 은 DB 에만 한 해치 인상을 더 얹었다.

import { calculateSeveranceTax } from "@/lib/severanceCalculator";

/** 퇴직소득을 연금수령할 때 원천징수세율 = 연금외수령 원천징수세율 × 70% (연금 실제 수령연차 10년 이하) */
export const DEFERRED_RETIREMENT_TAX_RATIO_1_10 = 0.7;

export interface SeveranceVsPensionInput {
  /** 현재 연봉 (세전) */
  salary: number;
  /** 근속 예상 (년) — 1 이상 */
  years: number;
  /** 연봉 상승률 (소수, 3% = 0.03) */
  growth: number;
  /** DC 운용 수익률 (소수) */
  dcReturn: number;
}

export interface SeveranceVsPensionResult {
  dbAmount: number;
  dcAmount: number;
  dbTax: number;
  dcTax: number;
  dbNet: number;
  dcNet: number;
  dbAnnuityTax: number;
  dcAnnuityTax: number;
  dbAnnuityNet: number;
  dcAnnuityNet: number;
  /** IRP 연금 수령 절세액 — DB·DC 중 큰 쪽 (음수 없음) */
  maxAnnuitySaving: number;
}

/** 일시 수령 퇴직소득세 (지방소득세 포함) — 근속연수는 1년 미만 끝수를 1년으로 (소득세법 제48조 제1항) */
export function retirementIncomeTaxWithLocal(amount: number, years: number): number {
  if (!(amount > 0) || !(years > 0)) return 0;
  const serviceYears = Math.max(1, Math.ceil(years));
  const r = calculateSeveranceTax(amount, serviceYears * 365, serviceYears);
  return r.incomeTax + r.localTax;
}

/** IRP 연금 수령(1~10년차) 원천징수세액 = 이연퇴직소득세 × 70% */
export function deferredRetirementAnnuityTax(lumpSumTax: number): number {
  return Math.round(Math.max(0, lumpSumTax) * DEFERRED_RETIREMENT_TAX_RATIO_1_10);
}

export function compareSeveranceVsPension(input: SeveranceVsPensionInput): SeveranceVsPensionResult {
  const salary = Number.isFinite(input.salary) ? Math.max(0, input.salary) : 0;
  const years = Number.isFinite(input.years) ? Math.max(1, input.years) : 1;
  const growth = Number.isFinite(input.growth) ? input.growth : 0;
  const dcRet = Number.isFinite(input.dcReturn) ? input.dcReturn : 0;

  const monthlyPay = salary / 12;
  // DB형 퇴직금 = 마지막 해 월급 × 근속연수. 마지막 해 = 현재 연봉에서 (근속 − 1)번 인상 (DC 적립 루프와 같은 기준)
  const finalMonthlyPay = monthlyPay * Math.pow(1 + growth, Math.max(0, years - 1));
  const dbAmount = finalMonthlyPay * years;

  // DC형 = 매년 그 해 연봉의 1/12 을 적립하고 남은 기간 운용 수익
  let dcAmount = 0;
  for (let y = 0; y < years; y++) {
    const yearContribution = (salary * Math.pow(1 + growth, y)) / 12;
    dcAmount += yearContribution * Math.pow(1 + dcRet, years - y);
  }

  const dbTax = retirementIncomeTaxWithLocal(dbAmount, years);
  const dcTax = retirementIncomeTaxWithLocal(dcAmount, years);
  const dbAnnuityTax = deferredRetirementAnnuityTax(dbTax);
  const dcAnnuityTax = deferredRetirementAnnuityTax(dcTax);

  const dbNet = dbAmount - dbTax;
  const dcNet = dcAmount - dcTax;
  const dbAnnuityNet = dbAmount - dbAnnuityTax;
  const dcAnnuityNet = dcAmount - dcAnnuityTax;

  return {
    dbAmount,
    dcAmount,
    dbTax,
    dcTax,
    dbNet,
    dcNet,
    dbAnnuityTax,
    dcAnnuityTax,
    dbAnnuityNet,
    dcAnnuityNet,
    maxAnnuitySaving: Math.max(0, dbAnnuityNet - dbNet, dcAnnuityNet - dcNet),
  };
}
