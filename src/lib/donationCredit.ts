// src/lib/donationCredit.ts
//
// 기부금 세액공제 — 2026년 귀속(현행법) 공유 순수 모듈.
// 근거: 소득세법 제59조의4(기부금 세액공제)·제34조(기부금 구분),
//       조세특례제한법 제76조(정치자금기부금)·제58조(고향사랑기부금).
//
// 세액공제율 (확정값만 반영):
//   - 특례(법정)+일반(지정) 합산: 1천만원 이하 15%, 1천만원 초과분 30%
//     → src/lib/yearEndTaxCalculator.ts 의 donationCredit(137-138행,
//       min(d,1천만)×15% + 초과분×30%)과 동일 수치 — 드리프트 없음 확인 (2026-08-31)
//   - 정치자금(본인 지출만): 10만원 이하 100/110 전액, 초과분 15%,
//     3천만원 초과분 25%
//   - 고향사랑기부금: 10만원 이하 100/110 전액, 초과분 15%,
//     연간 기부 상한 2,000만원(2025-01-01 상향, 종전 500만원),
//     답례품은 기부액의 30% 이내 포인트(세액공제와 별도 혜택)
//
// 공제 한도 (근로소득금액 = 총급여 − 근로소득공제 기준):
//   - 정치자금: 근로소득금액 100%
//   - 특례(법정)기부금: 근로소득금액 100%
//   - 일반(지정)기부금: (근로소득금액 − 특례 공제대상액)의 30%
//   - 종교단체 기부금이 있는 경우: 위 잔여액의 10% + min(잔여액의 20%, 종교단체 외
//     일반기부금) — 국세청 연말정산 안내 산식
//   - 이월공제: 특례·일반기부금 한도 초과분만 10년 이월. 정치자금·고향사랑은 이월 불가.
//
// ※ 2024년 기부분에 한시 적용됐던 3천만원 초과분 40% 특례는 2026년 기부분
//    적용 여부가 확인되지 않아 반영하지 않음.
// 갱신 슬롯: 12월 세법개정 — 고액기부(3천만원 초과분) 40% 특례 연장 여부 확인
// 갱신 슬롯: 2026-12 세법개정 — 공제율(15/30%)·정치자금·고향사랑 파라미터 재확인

import { earnedIncomeDeduction2026 } from "@/lib/taxConstants2026";

// ─────────────────────────────────────────────────────────────
// 정본 상수 — donation-tax-credit-2026 페이지·테스트가 공유
// ─────────────────────────────────────────────────────────────
export const DONATION_CREDIT_2026 = {
  /** 특례+일반 합산 공제대상 중 15% 적용 상한 (초과분 30%) — 소득세법 §59의4 */
  GENERAL_HIGH_THRESHOLD: 10_000_000,
  GENERAL_RATE_LOW: 0.15,
  GENERAL_RATE_HIGH: 0.3,
  /** 정치자금·고향사랑 공통 — 10만원까지 100/110 전액공제 */
  FULL_CREDIT_LIMIT: 100_000,
  FULL_CREDIT_RATIO: 100 / 110,
  /** 정치자금 — 10만원 초과분 15%, 3천만원 초과분 25% (조특법 §76) */
  POLITICAL_RATE: 0.15,
  POLITICAL_HIGH_THRESHOLD: 30_000_000,
  POLITICAL_RATE_HIGH: 0.25,
  /** 고향사랑 — 10만원 초과분 15%, 연간 기부 상한 2,000만원 (조특법 §58) */
  HOMETOWN_RATE: 0.15,
  HOMETOWN_CAP: 20_000_000,
  /** 답례품 — 기부액의 30% 이내 (지자체 포인트, 세액공제와 별개) */
  HOMETOWN_GIFT_RATIO: 0.3,
  /** 일반기부금 한도율 30%, 종교단체 10% — 근로소득금액 잔여분 기준 */
  LIMIT_GENERAL_RATIO: 0.3,
  LIMIT_RELIGIOUS_RATIO: 0.1,
  /** 특례·일반기부금 한도 초과분 이월공제 연수 */
  CARRYOVER_YEARS: 10,
} as const;

export interface DonationCreditInputs {
  /** 총급여 (연봉, 비과세 제외) */
  grossSalary: number;
  /** 특례(법정)기부금 — 국가·지자체, 이재민 구호, 특정 병원·학교 등 */
  statutory: number;
  /** 일반(지정)기부금 — 종교단체 외 (사회복지·문화·NGO 등) */
  general: number;
  /** 일반(지정)기부금 — 종교단체 */
  religious: number;
  /** 정치자금기부금 — 본인 지출분만 (배우자·부양가족 지출 불가) */
  political: number;
  /** 고향사랑기부금 — 본인 지출분만 */
  hometown: number;
}

export interface DonationCreditResult {
  /** 근로소득금액 = 총급여 − 근로소득공제 (한도 판정 기준) */
  earnedIncomeAmount: number;

  // ── 한도 내 공제대상금액 ──
  politicalEligible: number;
  hometownEligible: number;
  statutoryEligible: number;
  /** 일반기부금(종교 포함) 합산 공제대상 */
  generalEligible: number;
  /** 일반기부금 한도액 (종교단체 유무에 따라 산식 상이) */
  generalLimit: number;

  // ── 한도 초과분 ──
  /** 정치자금 한도 초과분 — 이월 불가(소멸) */
  politicalExcess: number;
  /** 고향사랑 연 2,000만원 상한 초과분 — 이월 불가 */
  hometownExcess: number;
  /** 특례기부금 한도 초과분 — 10년 이월 가능 */
  statutoryExcess: number;
  /** 일반기부금 한도 초과분 — 10년 이월 가능 */
  generalExcess: number;
  /** 10년 이월공제 가능한 초과분 합계 (특례+일반) */
  carryoverTotal: number;

  // ── 세액공제액 ──
  politicalCredit: number;
  hometownCredit: number;
  /** 특례+일반 합산 축 (1천만 이하 15%·초과 30%) */
  generalAxisCredit: number;
  /** 합산 축 중 15% 적용분 공제대상 */
  generalAxisLowBase: number;
  /** 합산 축 중 30% 적용분 공제대상 */
  generalAxisHighBase: number;
  totalCredit: number;

  /** 고향사랑 답례품 예상 혜택 (기부액 30% 포인트 — 세액공제와 별개) */
  hometownGiftValue: number;
}

/**
 * 2026년 귀속 기부금 세액공제 계산 (근로소득만 있는 근로자 기준 간이 계산).
 * 세액공제는 산출세액 한도 내에서만 차감되며 이 함수는 그 상한을 반영하지 않는다.
 */
export function calcDonationCredit2026(
  i: DonationCreditInputs
): DonationCreditResult {
  const C = DONATION_CREDIT_2026;
  const gross = Math.max(0, i.grossSalary);
  const statutory = Math.max(0, i.statutory);
  const general = Math.max(0, i.general);
  const religious = Math.max(0, i.religious);
  const political = Math.max(0, i.political);
  const hometown = Math.max(0, i.hometown);

  // 근로소득금액 — 근로소득공제 정본(taxConstants2026) 재사용
  const earnedIncomeAmount = Math.max(
    0,
    gross - earnedIncomeDeduction2026(gross)
  );

  // ── 1) 정치자금 — 본인 지출만, 근로소득금액 100% 한도, 이월 불가 ──
  const politicalEligible = Math.min(political, earnedIncomeAmount);
  const politicalExcess = political - politicalEligible;
  const polFull = Math.min(politicalEligible, C.FULL_CREDIT_LIMIT);
  const polMid = Math.min(
    Math.max(politicalEligible - C.FULL_CREDIT_LIMIT, 0),
    C.POLITICAL_HIGH_THRESHOLD - C.FULL_CREDIT_LIMIT
  );
  const polHigh = Math.max(politicalEligible - C.POLITICAL_HIGH_THRESHOLD, 0);
  const politicalCredit = Math.round(
    polFull * C.FULL_CREDIT_RATIO +
      polMid * C.POLITICAL_RATE +
      polHigh * C.POLITICAL_RATE_HIGH
  );

  // ── 2) 고향사랑기부금 — 연 2,000만원 상한, 이월 불가 ──
  const hometownEligible = Math.min(hometown, C.HOMETOWN_CAP);
  const hometownExcess = hometown - hometownEligible;
  const homeFull = Math.min(hometownEligible, C.FULL_CREDIT_LIMIT);
  const homeRest = Math.max(hometownEligible - C.FULL_CREDIT_LIMIT, 0);
  const hometownCredit = Math.round(
    homeFull * C.FULL_CREDIT_RATIO + homeRest * C.HOMETOWN_RATE
  );
  const hometownGiftValue = Math.round(
    hometownEligible * C.HOMETOWN_GIFT_RATIO
  );

  // ── 3) 특례(법정)기부금 — 근로소득금액 100% 한도, 초과분 10년 이월 ──
  const statutoryEligible = Math.min(statutory, earnedIncomeAmount);
  const statutoryExcess = statutory - statutoryEligible;

  // ── 4) 일반(지정)기부금 — 잔여 소득의 30%(종교단체 10%) 한도, 초과분 10년 이월 ──
  const remaining = Math.max(0, earnedIncomeAmount - statutoryEligible);
  const generalLimit =
    religious > 0
      ? remaining * C.LIMIT_RELIGIOUS_RATIO +
        Math.min(remaining * (C.LIMIT_GENERAL_RATIO - C.LIMIT_RELIGIOUS_RATIO), general)
      : remaining * C.LIMIT_GENERAL_RATIO;
  const generalTotal = general + religious;
  const generalEligible = Math.min(generalTotal, generalLimit);
  const generalExcess = generalTotal - generalEligible;

  // ── 5) 특례+일반 합산 축 — 1천만원 이하 15%, 초과분 30% ──
  //     (yearEndTaxCalculator.ts donationCredit 산식과 동일 수치)
  const axisBase = statutoryEligible + generalEligible;
  const generalAxisLowBase = Math.min(axisBase, C.GENERAL_HIGH_THRESHOLD);
  const generalAxisHighBase = Math.max(axisBase - C.GENERAL_HIGH_THRESHOLD, 0);
  const generalAxisCredit = Math.round(
    generalAxisLowBase * C.GENERAL_RATE_LOW +
      generalAxisHighBase * C.GENERAL_RATE_HIGH
  );

  return {
    earnedIncomeAmount,
    politicalEligible,
    hometownEligible,
    statutoryEligible,
    generalEligible,
    generalLimit,
    politicalExcess,
    hometownExcess,
    statutoryExcess,
    generalExcess,
    carryoverTotal: statutoryExcess + generalExcess,
    politicalCredit,
    hometownCredit,
    generalAxisCredit,
    generalAxisLowBase,
    generalAxisHighBase,
    totalCredit: politicalCredit + hometownCredit + generalAxisCredit,
    hometownGiftValue,
  };
}
