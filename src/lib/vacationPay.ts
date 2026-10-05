// /calc/vacation-pay (연차수당 계산기) 계산부.
//
// 2026-10-05 감사 code7-01 정정: 종전 Client.tsx 는 1일 통상임금을 연봉 ÷ 240 으로 잡았다. 같은 페이지가 밝힌
// 법정 산식(월 통상임금 ÷ 209시간 × 8시간 = 연봉 ÷ 313.5)보다 항상 30.6% 크다. 세금도 총급여 구간별 고정
// 7/16/22/28%, 4대보험은 고정 8.5% 로 사이트 2026 엔진과 따로 놀았다.
// 이제 1일 통상임금은 정본 computeOrdinaryWage(209시간, 근로기준법 시행령 제6조), 세금·4대보험은 성과급 정본
// calcBonusNet(연봉에 연차수당을 얹은 연말정산 결정세액 차이 + 4대보험 추가분)으로 계산한다.
// 연봉 전액을 통상임금으로 보는 추정이다 — 비정기 상여·실적급이 섞인 연봉이면 실제 통상임금은 이보다 낮다.

import { computeOrdinaryWage } from "@/lib/ordinaryWage";
import { calcBonusNet } from "@/lib/bonusTaxCalc";

export interface VacationPayResult {
  /** 1일 통상임금 = 연봉 ÷ 12 ÷ 209 × 8 */
  dailyWage: number;
  /** 세전 연차수당 */
  grossPay: number;
  /** 소득세 + 지방소득세 증가분 */
  tax: number;
  /** 국민연금 + 건강(장기요양) + 고용보험 */
  insurance: number;
  totalDeduction: number;
  net: number;
}

export function calcVacationPay(salary: number, days: number): VacationPayResult {
  const annual = Number.isFinite(salary) ? Math.max(0, salary) : 0;
  const numDays = Number.isFinite(days) ? Math.max(0, days) : 0;
  const dailyWage = computeOrdinaryWage({ monthlyBase: annual / 12, monthlyFixedAllowance: 0, annualBonus: 0 }).daily;
  const grossPay = Math.round(dailyWage * numDays);
  const b = calcBonusNet(annual, grossPay);
  const tax = b.incomeTaxDelta + b.localTaxDelta;
  const insurance = b.pensionDelta + b.healthDelta + b.empInsDelta;
  const totalDeduction = tax + insurance;
  return { dailyWage, grossPay, tax, insurance, totalDeduction, net: Math.max(0, grossPay - totalDeduction) };
}
