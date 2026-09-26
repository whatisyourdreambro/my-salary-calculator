// 연말정산(2026년 귀속 — 정산은 2027년 1~2월) 계산 엔진.
// 2026-08-23 정합화: 근로소득공제·세율표는 taxConstants2026, 카드공제는
// cardDeduction2026(정밀 계산기와 동일 로직), 월세는 RENT_CREDIT_2026 공유 —
// 페이지·정밀 계산기와 수치 드리프트 원천 차단. 결과는 소득세 기준이며
// 지방소득세(소득세의 10%)는 미포함 (UI에서 별도 고지).
// 2026-09-26 W1-A: 기납부세액 기본값을 간이세액표 추정(estimatePrepaidIncomeTax2026)으로 바꾸고,
// 보장성보험 100만원 한도·출산입양 30/50/70만원·혼인 50만원·고향사랑·교육비 1명당 한도를 반영했다.

import {
  earnedIncomeDeduction2026,
  calcIncomeTax2026,
  earnedIncomeTaxCredit2026,
  childTaxCredit2026,
  INSURANCE_RATES_2026,
  PENSION_BASE_2026,
  PENSION_ACCOUNT_CREDIT_2026,
  MEDICAL_CREDIT_2026,
  EDUCATION_CREDIT_2026,
  RENT_CREDIT_2026,
  INSURANCE_CREDIT_2026,
  BIRTH_CREDIT_2026,
  MARRIAGE_CREDIT_2026,
} from "@/lib/taxConstants2026";
import { calcCardDeduction2026 } from "@/lib/cardDeduction2026";
import { calcDonationCredit2026 } from "@/lib/donationCredit";
import { withholdingIncomeTax2026 } from "@/lib/withholdingTaxTable2026";

// 연말정산 항목별 입력을 위한 인터페이스 정의
export interface TaxInputs {
 grossSalary: number; // 총급여액
 prepaidTax: number; // 기납부세액

 // 소득공제 항목
 nationalPension: number; // 국민연금
 healthInsurance: number; // 건강보험료
 employmentInsurance: number; // 고용보험료

 dependents: number; // 기본공제 대상자 수 (본인포함)
 disabledDependents: number; // 장애인 수
 seniorDependents: number; // 70세 이상 경로자 수

 housingSubscription: number; // 주택청약저축 납입액
 /**
  * @deprecated 계산에 쓰지 않는다. 장기주택저당차입금 이자상환액 소득공제(소득세법 §52⑤)는
  * 상환기간·고정금리·비거치 여부별 한도를 가르는 입력이 없어 엔진이 다루지 않는다. 종전에는 필드만
  * 있고 계산에 빠져 있어, 값을 넣어도 결과가 그대로였다(2026-09-26 W1-A). 넘기는 호출부
  * (/calc/dual-income-year-end, /widget/year-end-tax)가 모두 0 이라 호환용으로 0 만 받는다 —
  * 두 곳에서 지운 뒤 필드를 삭제할 것.
  */
 mortgageInterest?: 0;

 creditCard: number; // 신용카드 사용액
 debitCardAndCash: number; // 체크카드 및 현금영수증 사용액
 traditionalMarket: number; // 전통시장 사용액
 publicTransport: number; // 대중교통 사용액

 // 세액공제 항목
 children: number; // 자녀 수 (8세 이상 기본공제대상 자녀 — 자녀세액공제·카드 한도·간이세액표 자녀 공제)
 /**
  * 해당년도 출산/입양 자녀 수 — birthOrders 가 없을 때만 쓰는 보수적 대체값.
  * 순서를 모르므로 1명당 첫째 금액(30만원)을 적용한다(실제는 둘째 50만·셋째 이상 70만일 수 있음).
  */
 birthsOrAdoptions: number;
 /**
  * 해당 과세기간에 출산·입양 신고한 자녀의 순서 (1 = 첫째, 2 = 둘째, 3 이상 = 셋째 이상).
  * 소득세법 §59의2③ — 첫째 30만·둘째 50만·셋째 이상 70만원. 있으면 birthsOrAdoptions 보다 우선한다.
  */
 birthOrders?: readonly number[];
 /** 2026년 혼인신고 여부 — 조특법 §92 혼인세액공제 50만원 (생애 1회, 2024~2026년 혼인신고분) */
 marriedIn2026?: boolean;

 pensionSavings: number; // 연금저축 납입액
 irp: number; // IRP 납입액

 lifeInsurance: number; // 보장성 보험료 (일반, 연 100만원 한도 12%)
 medicalExpenses: number; // 의료비
 educationExpenses: number; // 교육비 (구분 없는 합계 — 한도 미적용, 종전 동작 유지)
 /** 교육비 — 취학 전 아동·초중고생 지출 합계. 1명당 연 300만원 × educationChildSchoolCount 까지 */
 educationChildSchool?: number;
 /** 교육비 — 취학 전 아동·초중고생 수 (지출이 있는데 0·미입력이면 1명으로 본다) */
 educationChildSchoolCount?: number;
 /** 교육비 — 대학생 지출 합계. 1명당 연 900만원 × educationUniversityCount 까지 */
 educationUniversity?: number;
 /** 교육비 — 대학생 수 (지출이 있는데 0·미입력이면 1명으로 본다) */
 educationUniversityCount?: number;
 /** 교육비 — 근로자 본인 (대학원·직업능력개발훈련 포함, 한도 없음) */
 educationSelf?: number;
 donation: number; // 기부금 (특례·일반 합산 — 1천만원 이하 15%, 초과분 30%)
 /** 고향사랑기부금 (본인 지출) — donationCredit 정본(조특법 §58: 10만원 100/110·20만원까지 40%·초과 15%) */
 hometownDonation?: number;
 monthlyRent: number; // 월세액
}

// 계산 결과를 위한 인터페이스 정의
export interface TaxResult {
 finalRefund: number; // 최종 환급(또는 추가납부)액
 determinedTax: number; // 결정세액
 taxBase: number; // 과세표준
 grossSalary: number; // 총급여
 totalDeductions: number; // 총 공제액 (소득공제 + 세액공제)

 // 상세 분석 리포트용 단계별 값 (2026-09-25). 종전 리포트는 최종 결과에서 역산해
 // 근로소득공제·산출세액을 틀리게 보여줬고 세액공제 합계는 늘 0원이었다.
 earnedIncomeDeduction: number; // 근로소득공제
 incomeDeduction: number; // 과세표준에 실제 반영된 소득공제 합계 (근로소득금액 한도)
 calculatedTax: number; // 산출세액
 taxCredit: number; // 결정세액에 실제 반영된 세액공제 합계 (산출세액 한도)
}

// 2026년 귀속 연말정산 계산 함수
export function calculateYearEndTax(inputs: TaxInputs): TaxResult {
 const { grossSalary } = inputs;

 // 1. 근로소득공제 — taxConstants2026 정본 사용 (2,000만원 캡 포함)
 const earnedIncomeDeduction = earnedIncomeDeduction2026(grossSalary);
 const earnedIncomeAmount = grossSalary - earnedIncomeDeduction;

 // 2. 소득공제
 const personalDeduction =
 inputs.dependents * 1500000 +
 inputs.seniorDependents * 1000000 +
 inputs.disabledDependents * 2000000;

 // 소득세법 §52①1 — 건강보험료와 '노인장기요양보험료'가 모두 전액 소득공제
 // 대상이다. inputs.healthInsurance 에는 장기요양보험료를 포함해 넘겨야 한다
 // (호출부는 deriveAnnualHealthPremium 을 쓸 것).
 const insuranceDeduction =
 inputs.nationalPension +
 inputs.healthInsurance +
 inputs.employmentInsurance;

 const housingSubscriptionDeduction =
 Math.min(inputs.housingSubscription, 3000000) * 0.4;

 // 카드공제 — 정밀 계산기와 동일한 공유 모듈 (결제수단별 15/30/40%·
 // 자녀 한도 상향·전통시장/대중교통 추가한도. 2026-08-23 간소화판 대체)
 const cardDeduction = calcCardDeduction2026({
 grossSalary,
 children: inputs.children,
 creditCard: inputs.creditCard,
 checkCash: inputs.debitCardAndCash,
 traditionalMarket: inputs.traditionalMarket,
 publicTransport: inputs.publicTransport,
 }).finalDeduction;

 const totalIncomeDeduction =
 personalDeduction +
 insuranceDeduction +
 housingSubscriptionDeduction +
 cardDeduction;

 // 3. 과세표준
 const taxBase = Math.max(0, earnedIncomeAmount - totalIncomeDeduction);

 // 4. 산출세액 — taxConstants2026 누진세율표 정본 사용 (수학적 동치,
 // 경계값 1,400만/5,000만/8,800만 일치 확인)
 const calculatedTax = calcIncomeTax2026(taxBase);

 // 5. 세액공제 — 근로소득세액공제·자녀세액공제는 taxConstants2026 정본 함수 사용
 const earnedIncomeTaxCredit = earnedIncomeTaxCredit2026(
 calculatedTax,
 grossSalary
 );

 // 자녀세액공제 (소득세법 §59의2, 2025 개정) — 첫째 25만·둘째 30만·셋째+ 40만
 const childTaxCredit = childTaxCredit2026(inputs.children);

 // 연금계좌세액공제 — PENSION_ACCOUNT_CREDIT_2026 정본 (화면 입력이 연금저축/IRP 합산
 // 1칸이라 연금저축 단독 600만 한도는 구분하지 않는다)
 const pensionAccountCredit =
 Math.min(inputs.pensionSavings + inputs.irp, PENSION_ACCOUNT_CREDIT_2026.TOTAL_CAP) *
 (grossSalary <= PENSION_ACCOUNT_CREDIT_2026.SALARY_15_MAX
 ? PENSION_ACCOUNT_CREDIT_2026.RATE_HIGH
 : PENSION_ACCOUNT_CREDIT_2026.RATE_LOW);
 // 출산·입양 세액공제 (소득세법 §59의2③) — 첫째 30만·둘째 50만·셋째 이상 70만
 const birthCredit = birthAdoptionCredit2026(inputs.birthOrders, inputs.birthsOrAdoptions);
 // 혼인세액공제 (조특법 §92①) — 2026년 혼인신고 1회 50만원
 const marriageCredit = inputs.marriedIn2026 ? MARRIAGE_CREDIT_2026.AMOUNT : 0;
 // 보장성보험료 세액공제 (소득세법 §59의4①) — 연 100만원 초과분은 없는 것으로 본다.
 // 종전에는 한도 없이 × 12% 여서 보험료가 크면 공제가 과대했다 (2026-09-26 W1-A)
 const insuranceCredit =
 Math.min(Math.max(0, inputs.lifeInsurance), INSURANCE_CREDIT_2026.LIMIT) *
 INSURANCE_CREDIT_2026.RATE;
 const medicalCredit =
 Math.max(0, inputs.medicalExpenses - grossSalary * MEDICAL_CREDIT_2026.THRESHOLD_RATIO) *
 MEDICAL_CREDIT_2026.RATE;
 // 교육비 세액공제 (소득세법 §59의4③) — 취학 전·초중고 1명당 300만·대학생 900만·본인 한도 없음.
 // 구분 없는 educationExpenses 는 종전대로 한도 없이 15% (/calc/dual-income-year-end 호환)
 const educationBase =
 inputs.educationExpenses +
 cappedPerPerson(inputs.educationChildSchool, inputs.educationChildSchoolCount, EDUCATION_CREDIT_2026.SCHOOL_CAP) +
 cappedPerPerson(inputs.educationUniversity, inputs.educationUniversityCount, EDUCATION_CREDIT_2026.UNIVERSITY_CAP) +
 Math.max(0, inputs.educationSelf ?? 0);
 const educationCredit = educationBase * EDUCATION_CREDIT_2026.RATE;
 // 월세 세액공제 — 총급여 8,000만 초과는 대상 아님 (RENT_CREDIT_2026 정본,
 // 2026-08-23 상한 미적용 버그 수정)
 const rentCredit =
 grossSalary > RENT_CREDIT_2026.SALARY_CAP
 ? 0
 : Math.min(inputs.monthlyRent, RENT_CREDIT_2026.CAP) *
 (grossSalary <= RENT_CREDIT_2026.SALARY_17_MAX
 ? RENT_CREDIT_2026.RATE_HIGH
 : RENT_CREDIT_2026.RATE_LOW);

 // 기부금 세액공제 — 1천만원 이하 15%, 초과분 30% (소득세법 §59의4)
 // 유형별 한도(소득 30%·10% 등)·이월공제는 단순화 미반영 — 구분 없는 합계 입력의 한계
 // (정밀 계산은 /donation-tax-credit-2026 의 calcDonationCredit2026)
 const donationCredit =
 Math.min(inputs.donation, 10_000_000) * 0.15 +
 Math.max(0, inputs.donation - 10_000_000) * 0.3;
 // 고향사랑기부금 (조특법 §58) — 정본 calcDonationCredit2026 으로만 계산 (상수 복제 금지)
 const hometownCredit =
 (inputs.hometownDonation ?? 0) > 0
 ? calcDonationCredit2026({
 grossSalary,
 statutory: 0,
 general: 0,
 religious: 0,
 political: 0,
 hometown: inputs.hometownDonation ?? 0,
 }).hometownCredit
 : 0;

 const totalTaxCredit =
 earnedIncomeTaxCredit +
 childTaxCredit +
 birthCredit +
 marriageCredit +
 pensionAccountCredit +
 insuranceCredit +
 medicalCredit +
 educationCredit +
 donationCredit +
 hometownCredit +
 rentCredit;

 // 6. 최종 결정세액 및 환급액
 const determinedTax = Math.max(0, calculatedTax - totalTaxCredit);
 const finalRefund = inputs.prepaidTax - determinedTax;

 // 리포트 산식이 원 단위로 맞아떨어지도록 반올림된 값끼리 차감한다
 // (총급여 − 근로소득공제 − 소득공제 = 과세표준, 산출세액 − 세액공제 = 결정세액)
 const roundedEarnedIncomeDeduction = Math.round(earnedIncomeDeduction);
 const roundedTaxBase = Math.round(taxBase);
 const roundedDeterminedTax = Math.round(determinedTax);

 return {
 finalRefund: Math.round(finalRefund),
 determinedTax: roundedDeterminedTax,
 taxBase: roundedTaxBase,
 grossSalary,
 totalDeductions: Math.round(grossSalary - taxBase),
 earnedIncomeDeduction: roundedEarnedIncomeDeduction,
 incomeDeduction: grossSalary - roundedEarnedIncomeDeduction - roundedTaxBase,
 calculatedTax,
 taxCredit: calculatedTax - roundedDeterminedTax,
 };
}

/**
 * 총급여에서 연간 건강보험료 + 노인장기요양보험료(건보료 × 13.14%)를 파생한다.
 *
 * 2026-09-06 전수검사: /widget/year-end-tax · /calc/dual-income-year-end ·
 * YearEndTaxCalculator 세 곳이 건보료만 넘기고 장기요양보험료를 빠뜨려
 * 보험료 소득공제가 그만큼 적게 잡혔다(결정세액 최대 19.8만원 과대 = 환급 과소).
 * 세 호출부가 같은 함수를 쓰도록 정본화한다.
 */
export function deriveAnnualHealthPremium(grossSalary: number): number {
  const health = grossSalary * INSURANCE_RATES_2026.HEALTH_INSURANCE;
  const longTermCare = health * INSURANCE_RATES_2026.LONG_TERM_CARE_RATIO;
  return Math.round(health + longTermCare);
}

/**
 * 총급여에서 연간 4대보험 근로자 부담분(국민연금·건강+장기요양·고용)을 파생한다 — 소득공제 입력용.
 * 국민연금은 기준소득월액 상·하한(PENSION_BASE_2026)을 적용한다. YearEndTaxCalculator 의
 * derivedInputs 와 /widget/year-end-tax·/calc/dual-income-year-end 의 derivedInsurance 가 같은 산식이다
 * (yearEndTax2026Engine.test.ts 대조 테스트).
 */
export function deriveAnnualSocialInsurance2026(grossSalary: number): {
  nationalPension: number;
  healthInsurance: number;
  employmentInsurance: number;
} {
  const pensionBase = Math.min(
    Math.max(grossSalary / 12, PENSION_BASE_2026.MIN_MONTHLY),
    PENSION_BASE_2026.MAX_MONTHLY
  );
  return {
    nationalPension: Math.round(pensionBase * INSURANCE_RATES_2026.NATIONAL_PENSION * 12),
    healthInsurance: deriveAnnualHealthPremium(grossSalary),
    employmentInsurance: Math.round(grossSalary * INSURANCE_RATES_2026.EMPLOYMENT_INSURANCE),
  };
}

/**
 * 기납부세액(연간 원천징수 소득세) 추정 — 근로소득 간이세액표(소득세법 시행령 [별표 2], 원천징수 비율
 * 100%)의 월 소득세 × 12.
 *
 * 2026-09-26 W1-A: /year-end-tax·홈 연말정산 탭의 기납부세액 기본값이 총급여와 무관한 250만원 고정이라,
 * 총급여 6,000만원 이상에서는 실제로는 환급(+18만~+64만원)인 사람에게 '추가 납부 134만~925만원'을
 * 보여줬다(신용 1,500만·체크 500만·1인 기준). 이제 총급여·부양가족·자녀 수에서 추정한다.
 *
 * - 소득세만이다(지방소득세 제외) — 엔진의 결정세액·환급액과 같은 기준.
 * - 표는 2026-03-01 지급분부터 적용되는 개정표다. 1~2월 지급분의 종전 표, 원천징수 비율 80·120% 선택,
 *   연중 입사·비과세 수당, 상여 지급월의 세액 차이는 반영하지 않는다 — 화면에 '추정'으로 표시하고
 *   원천징수영수증의 기납부세액으로 바꿔 넣게 한다.
 *
 * @param grossSalary 총급여(비과세 제외, 연)
 * @param family 공제대상가족 수 — 본인 포함 (최소 1)
 * @param children8to20 공제대상가족 중 8세 이상 20세 이하 자녀 수
 */
export function estimatePrepaidIncomeTax2026(
  grossSalary: number,
  family: number,
  children8to20: number
): number {
  if (!Number.isFinite(grossSalary) || grossSalary <= 0) return 0;
  return (
    withholdingIncomeTax2026(
      Math.round(grossSalary / 12),
      Math.max(1, family),
      children8to20
    ) * 12
  );
}

/**
 * 출산·입양 세액공제 (소득세법 §59의2③) — 출산·입양 순서별 30만·50만·70만원.
 * birthOrders 가 없으면 legacyCount(출산·입양 자녀 수)에 첫째 금액을 곱한 보수적 대체값을 쓴다.
 */
export function birthAdoptionCredit2026(
  birthOrders: readonly number[] | undefined,
  legacyCount: number
): number {
  if (birthOrders && birthOrders.length > 0) {
    let credit = 0;
    for (const raw of birthOrders) {
      if (!Number.isFinite(raw) || raw < 1) continue;
      const order = Math.floor(raw);
      credit +=
        order >= 3
          ? BIRTH_CREDIT_2026.THIRD_PLUS
          : order === 2
            ? BIRTH_CREDIT_2026.SECOND
            : BIRTH_CREDIT_2026.FIRST;
    }
    return credit;
  }
  const count = Number.isFinite(legacyCount) ? Math.max(0, Math.floor(legacyCount)) : 0;
  return count * BIRTH_CREDIT_2026.FIRST;
}

/**
 * 1명당 한도가 있는 지출 합계의 공제 대상액 — min(합계, 1명당 한도 × 인원).
 * 인원이 0·미입력이어도 지출이 있으면 1명으로 본다. 자녀별 지출이 한도를 넘는 사람과 못 미치는 사람이
 * 섞이면 합산 한도가 실제보다 커지므로, 입력 안내는 '1명당 한도까지만 합산해 입력'이어야 한다.
 */
function cappedPerPerson(
  amount: number | undefined,
  count: number | undefined,
  capPerPerson: number
): number {
  const total = Math.max(0, amount ?? 0);
  if (total === 0) return 0;
  const people =
    count !== undefined && Number.isFinite(count) ? Math.max(1, Math.floor(count)) : 1;
  return Math.min(total, capPerPerson * people);
}
