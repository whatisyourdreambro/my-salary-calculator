// src/lib/bonusHome/affordability.ts
//
// 성과급 내 집 마련 — 연말 자산 vs 필요 현금 비교(순수 함수). 2027~2031년 각 연말에
//   자산_y = 자산_{y−1} × (1 + 저축 이자) + 연봉 저축_y + (현금화 가능 세후 성과급_y + 잠금 해제 주식_y) × 성과급 저축 비율
//   필요 현금_y = 집값_y + 취득세_y − 대출 가능액_y
// 을 계산해 처음으로 자산 ≥ 필요 현금이 되는 해를 '구매 가능 연도'로 돌려준다. 없으면 2031년 부족액.
//   · 연봉 저축 = 그해 연봉의 월 실수령(calculateSalary2026, 비과세 20만·본인 1인 기본값) × 12 × 월 저축률
//   · 대출 가능액 = min(DSR, LTV × 집값, 주담대 한도) — loanRules.ts. DSR 소득 = 직전 연도 총급여(연봉 + 그해 받은 성과급,
//     주식 포함 — '성과급 포함' 끄면 연봉만). 은행은 통상 전년도 원천징수영수증 총급여를 보되 은행마다 다르다.
//   · 취득세 = 1주택·아파트(calcAcquisitionTax), 중개보수·등기 비용은 제외.
//   · 구매 시점 월 상환액 = 원리금균등(스트레스 가산 없는 입력 금리) — calculateHomeLoanRepayment.
// 2026년 남은 기간의 저축·12월 성과급은 넣지 않는다(보수적) — '현재 모은 돈'에 포함해 입력하면 된다.

import { calcAcquisitionTax } from "@/lib/acquisitionTax";
import { calculateHomeLoanRepayment } from "@/lib/homeLoanRepayment";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import type { CompResult } from "./compEngines";
import { effectiveTermYears, loanLimit, type LoanLimitResult, type RegionClass } from "./loanRules";
import { PAYOUT_YEARS } from "./scenarios";

export type AffordInputs = {
  comp: CompResult;
  /** 현재 모은 돈(원) */
  startAssets: number;
  /** 월 저축률(월 실수령 대비 %) */
  savingsRatePct: number;
  /** 성과급 저축 비율(현금화 가능 세후 성과급 대비 %) */
  bonusSavePct: number;
  /** 저축 이자(연 %) — 기본 0 */
  savingsInterestPct: number;
  /** 잠금 주식(삼성 특별경영성과급 자사주)도 구매 자금에 포함 */
  includeLockedShares: boolean;
  /** DSR 소득에 성과급 포함 */
  dsrIncludeBonus: boolean;
  /** 현재 집값(원) */
  price0: number;
  /** 집값 변동 가정(연 %) */
  priceGrowthPct: number;
  /** 전용 85㎡ 초과(농특세) */
  isOver85: boolean;
  cls: RegionClass;
  /** 대출 금리(연 %, 스트레스 제외) */
  ratePct: number;
  /** 스트레스 금리 가산(%p) */
  stressAddPct: number;
  /** LTV(0~1) */
  ltv: number;
  /** 대출 기간(년) */
  termYears: number;
  /** 기존 부채 연간 원리금(원) */
  existingAnnualDebtService: number;
  /** 월 실수령 함수(테스트 주입용) — 기본 calculateSalary2026(salary).netPay */
  netMonthlyOf?: (salary: number) => number;
};

export type AffordYear = {
  year: number;
  salarySavings: number;
  bonusSaved: number;
  /** 연말 자산(현금화 가능분) */
  assets: number;
  /** 구매 판정에 쓰는 자산(잠금 주식 포함 토글 반영) */
  assetsForPurchase: number;
  price: number;
  acqTax: number;
  dsrIncome: number;
  loan: LoanLimitResult;
  /** 필요 현금 = 집값 + 취득세 − 대출 */
  need: number;
  affordable: boolean;
};

export type AffordResult = {
  years: AffordYear[];
  /** 처음으로 자산 ≥ 필요 현금이 되는 해(연말). 없으면 null */
  buyYear: number | null;
  /** 판정 연도(구매 가능 연도, 없으면 2031)의 행 */
  decisive: AffordYear;
  /** 2031년까지 불가일 때 2031년 말 부족액(원), 가능하면 0 */
  shortfall: number;
  /** 구매 시점(없으면 2031년) 월 상환액과 월 실수령 대비 비율 */
  repayment: { monthlyPayment: number; monthlyNetPay: number; shareOfNetPct: number; termYears: number };
};

const fin = (n: number, fallback = 0): number => (Number.isFinite(n) ? n : fallback);
const pos = (n: number): number => (Number.isFinite(n) && n > 0 ? n : 0);
const defaultNetMonthly = (salary: number): number => calculateSalary2026(salary).netPay;

export function solveAffordability(p: AffordInputs): AffordResult {
  const netMonthlyOf = p.netMonthlyOf ?? defaultNetMonthly;
  const savingsRate = Math.min(Math.max(fin(p.savingsRatePct), 0), 100) / 100;
  const bonusShare = Math.min(Math.max(fin(p.bonusSavePct), 0), 100) / 100;
  const interest = fin(p.savingsInterestPct) / 100;
  const years: AffordYear[] = [];
  let assets = pos(p.startAssets);
  let prevGross = p.comp.gross2026.salary + (p.dsrIncludeBonus ? p.comp.gross2026.bonus : 0);
  for (const y of p.comp.years) {
    const salarySavings = pos(netMonthlyOf(y.salary)) * 12 * savingsRate;
    const bonusSaved = (pos(y.liquidNet) + pos(y.unlockedValue)) * bonusShare;
    assets = assets * (1 + interest) + salarySavings + bonusSaved;
    const assetsForPurchase = assets + (p.includeLockedShares ? pos(y.lockedHeldValue) * bonusShare : 0);
    const price = pos(p.price0) * Math.pow(1 + fin(p.priceGrowthPct) / 100, y.year - 2026);
    const acqTax = calcAcquisitionTax(price, true, "apt", p.isOver85).total;
    const loan = loanLimit({
      price,
      cls: p.cls,
      dsrIncome: prevGross,
      existingAnnualDebtService: p.existingAnnualDebtService,
      ratePct: p.ratePct,
      stressAddPct: p.stressAddPct,
      ltv: p.ltv,
      years: p.termYears,
    });
    const need = Math.max(0, price + acqTax - loan.loan);
    years.push({
      year: y.year,
      salarySavings,
      bonusSaved,
      assets,
      assetsForPurchase,
      price,
      acqTax,
      dsrIncome: prevGross,
      loan,
      need,
      affordable: assetsForPurchase >= need,
    });
    prevGross = y.salary + (p.dsrIncludeBonus ? pos(y.gross) : 0);
  }
  const hit = years.find((r) => r.affordable) ?? null;
  const decisive = hit ?? years[years.length - 1];
  const termYears = effectiveTermYears(p.cls, p.termYears);
  const pay = calculateHomeLoanRepayment(decisive.loan.loan, Math.max(0, fin(p.ratePct)), termYears, "equalPrincipalAndInterest");
  const salaryAt = p.comp.years.find((y) => y.year === decisive.year)?.salary ?? 0;
  const monthlyNetPay = pos(netMonthlyOf(salaryAt));
  return {
    years,
    buyYear: hit ? hit.year : null,
    decisive,
    shortfall: hit ? 0 : Math.max(0, decisive.need - decisive.assetsForPurchase),
    repayment: {
      monthlyPayment: pay.monthlyPayment,
      monthlyNetPay,
      shareOfNetPct: monthlyNetPay > 0 ? (pay.monthlyPayment / monthlyNetPay) * 100 : 0,
      termYears,
    },
  };
}

/** 판정 연도 축(표시용) */
export const AFFORD_YEARS = PAYOUT_YEARS;
