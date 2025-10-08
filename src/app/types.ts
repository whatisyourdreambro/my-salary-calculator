import type { ElementType } from "react";

// localStorage에 저장될 연봉 계산기 데이터
export interface StoredSalaryData {
  annualSalary: number;
  monthlyNet: number;
  payBasis: "annual" | "monthly";
  severanceType: "separate" | "included";
  nonTaxableAmount: number;
  dependents: number;
  children: number;
  monthlyExpenses?: number; // 월평균 지출액 (선택적)
  advancedSettings?: AdvancedSettings; // [개선] 연봉 계산과 관련된 상세 설정을 포함
}

// 주택담보대출 계산 결과 저장 데이터
export interface StoredHomeLoanData {
  monthlyPayment: number;
  loanSuggestion: string;
}

// 예상 퇴직금 저장 데이터
export interface StoredSeveranceData {
  estimatedSeverancePay: number;
}

// 연봉 순위 결과 저장 데이터
export interface StoredRankData {
  rank: number;
  condition: string;
  median: number;
  average: number;
}

// 미래 연봉 예측 결과 저장 데이터
export interface StoredFutureSalaryData {
  years: number;
  finalSalary: number;
  totalIncrease: number;
}

// 연봉 계산 상세 설정을 위한 인터페이스
export interface AdvancedSettings {
  isSmeYouth: boolean; // 중소기업 취업 청년 감면 여부
  disabledDependents: number; // 장애인 부양가족 수
  seniorDependents: number; // 70세 이상 경로우대 부양가족 수
}

// 모든 금융 데이터를 통합 관리하는 최상위 타입
export interface StoredFinancialData {
  salary?: StoredSalaryData;
  homeLoan?: StoredHomeLoanData;
  severance?: StoredSeveranceData;
  rank?: StoredRankData;
  futureSalary?: StoredFutureSalaryData;
  lastUpdated: string; // 데이터 업데이트 시각
}

// [추가] 가이드 및 카테고리 관련 타입
export type Category = {
  id: string;
  name: string;
  // lucide-react 아이콘과 같은 React 컴포넌트를 직접 받기 위해 타입을 ElementType으로 지정
  icon: ElementType;
};

export type Guide = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  publishedAt: string;
};
