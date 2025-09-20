// src/app/types.ts

// localStorage에 저장될 데이터 타입을 정의합니다.
export interface StoredSalaryData {
  annualSalary: number;
  monthlyNet: number;
  payBasis: "annual" | "monthly";
  severanceType: "separate" | "included";
  nonTaxableAmount: number;
  dependents: number;
  children: number;
}
