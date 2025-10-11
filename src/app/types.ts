// src/app/types.ts

// calculateNetSalary 함수의 반환 타입을 기반으로 CalculationResult 타입을 정의하고 export 합니다.
export type CalculationResult = {
  monthlyNet: number;
  totalDeduction: number;
  pension: number;
  health: number;
  longTermCare: number;
  employment: number;
  incomeTax: number;
  localTax: number;
};

export type StoredSalaryData = {
  annualSalary: number;
  monthlyNet: number;
  payBasis: "annual" | "monthly";
  severanceType: "separate" | "included";
  nonTaxableAmount: number;
  dependents: number;
  children: number;
  monthlyExpenses: number;
};

// SalaryRank 컴포넌트에서 사용하는 타입
export type StoredRankData = {
  incomeType: "regular" | "freelancer";
  jobCategory: string;
  experience: string;
  annualIncome: number;
  ranking: {
    topPercent: number;
    rank: number;
    total: number;
  };
};

// SeveranceCalculator에서 사용하는 타입
export type StoredSeveranceData = {
  estimatedSeverancePay: number;
};

// HomeLoanSimulator에서 사용하는 타입
export type StoredHomeLoanData = {
  monthlyPayment: number;
  loanSuggestion: string;
};

// FutureSalaryCalculator에서 사용하는 타입
export type StoredFutureSalaryData = {
  years: number;
  finalSalary: number;
  totalIncrease: number;
};

// StoredFinancialData 타입을 확장하여 모든 데이터 구조를 포함합니다.
export type StoredFinancialData = {
  salary?: StoredSalaryData;
  rank?: StoredRankData;
  severance?: StoredSeveranceData;
  homeLoan?: StoredHomeLoanData;
  futureSalary?: StoredFutureSalaryData;
  lastUpdated: string;
};

export type AdvancedSettings = {
  isSmeYouth: boolean; // 중소기업 취업 청년 감면
  disabledDependents: number; // 장애인 부양가족
  seniorDependents: number; // 70세 이상 경로우대
};
