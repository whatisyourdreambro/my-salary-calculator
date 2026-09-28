// src/app/tools/finance/severance/legalSeverance.ts
//
// /tools/finance/severance '법정 퇴직금 자동계산' 모드의 계산부 (A31, 2026-09-28).
//
// 종전 page.tsx 는 인라인 포크 calcLegalSeverance(월급 × 총 근속 개월수 ÷ 12)를 써서
// 입·퇴사일, 연간 상여금, 연차수당을 반영하지 못했다 — 월 400만원 · 5년(2021-10-01 ~
// 2026-09-30) · 연간 상여금 1,600만원 · 연차수당 100만원이면 정본 26,509,083원 대신
// 20,000,000원(−24.6%)이 나왔다(2026-09-28 감사 S03). 이제 홈 퇴직금 탭과 같은 정본 엔진
// calculateSeverancePay(src/lib/severanceCalculator.ts)를 그대로 부르고, 결과를 페이지
// 결과 카드 모양으로 옮기기만 한다(산식 중복 0).
//
// 산식(정본): 1일 평균임금 × 30일 × 재직일수 ÷ 365
//   1일 평균임금 = (퇴직 전 3개월 임금 + 연간 상여금 × 3/12 + 연차수당 × 3/12) ÷ 그 3개월 총일수
//   퇴사일 = 마지막 근무일(포함). 계속근로 1년 미만(입사 1주년 기념일이 퇴직일 = 마지막
//   근무일 다음 날보다 늦음)이면 0원(근로자퇴직급여 보장법 §4①).
// 퇴직소득세·지방소득세도 정본 결과(serviceYearsFromDates 근속연수)를 그대로 쓴다.
// '퇴직금 직접 입력' 모드는 이 모듈을 쓰지 않는다(page.tsx calcSeveranceTax).

import { calculateSeverancePay } from "@/lib/severanceCalculator";

// 입·퇴사일 기본값 — 정확히 5년 근속(종전 기본값 '5년 0개월'과 같은 기간).
// 서버 렌더(빌드, UTC)와 첫 클라이언트 렌더(KST 등)가 같아야 하므로(하이드레이션) new Date() 대신
// 고정 날짜를 쓴다. 기본 결과(월 400만원 → 세전 19,575,938원)는 같은 폴더 테스트가 고정한다.
export const DEFAULT_START_DATE = "2021-10-01";
export const DEFAULT_END_DATE = "2026-09-30";

export interface LegalSeveranceInput {
  /** 입사일 (YYYY-MM-DD) */
  startDate: string;
  /** 퇴사일 = 마지막 근무일 (YYYY-MM-DD) */
  endDate: string;
  /** 퇴직 전 3개월 평균 월 급여(세전) — 3개월 모두 이 금액으로 본다 */
  monthlySalary: number;
  /** 연간 상여금 총액 */
  annualBonus: number;
  /** 연차수당(미사용 연차수당) */
  annualLeavePay: number;
}

export interface LegalSeveranceResult {
  /** 세전 법정 퇴직금 (원) */
  severancePay: number;
  /** 퇴직소득세 */
  tax: number;
  /** 지방소득세 */
  localTax: number;
  totalTax: number;
  /** 세후 실수령액 = severancePay − totalTax (결과 카드의 행 합계와 원 단위로 일치) */
  netPay: number;
  /** 실효세율 (%) */
  effectiveRate: number;
}

/** 빈칸·음수·NaN 입력은 0 으로 본다 (NumberInput type="number" 는 음수 입력을 허용한다). */
const nonNegative = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

export function calcLegalSeveranceResult(input: LegalSeveranceInput): LegalSeveranceResult {
  const monthly = nonNegative(input.monthlySalary);
  const r = calculateSeverancePay(
    input.startDate,
    input.endDate,
    [monthly, monthly, monthly],
    nonNegative(input.annualBonus),
    nonNegative(input.annualLeavePay)
  );
  const severancePay = r.estimatedSeverancePay;
  const tax = r.incomeTax;
  const localTax = r.localTax;
  const totalTax = tax + localTax;
  return {
    severancePay,
    tax,
    localTax,
    totalTax,
    netPay: severancePay - totalTax,
    effectiveRate: severancePay > 0 ? (totalTax / severancePay) * 100 : 0,
  };
}
