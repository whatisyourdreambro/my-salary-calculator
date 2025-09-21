// src/app/types.ts

// localStorage에 저장될 연봉 계산기 데이터
export interface StoredSalaryData {
  annualSalary: number;
  monthlyNet: number;
  payBasis: "annual" | "monthly";
  severanceType: "separate" | "included";
  nonTaxableAmount: number;
  dependents: number;
  children: number;
}

// [신규] 주택담보대출 계산 결과 저장 데이터
export interface StoredHomeLoanData {
  monthlyPayment: number;
  loanSuggestion: string;
}

// [신규] 예상 퇴직금 저장 데이터
export interface StoredSeveranceData {
  estimatedSeverancePay: number;
}

// [신규] 모든 금융 데이터를 통합 관리하는 최상위 타입
export interface StoredFinancialData {
  salary?: StoredSalaryData;
  homeLoan?: StoredHomeLoanData;
  severance?: StoredSeveranceData;
  lastUpdated: string; // 데이터 업데이트 시각
}
