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

export type StoredFinancialData = {
  salary?: StoredSalaryData;
  rank?: StoredRankData; // rank 속성 추가
  lastUpdated: string;
  // 다른 금융 데이터 타입들을 여기에 추가할 수 있습니다.
};

export type AdvancedSettings = {
  isSmeYouth: boolean; // 중소기업 취업 청년 감면
  disabledDependents: number; // 장애인 부양가족
  seniorDependents: number; // 70세 이상 경로우대
};
