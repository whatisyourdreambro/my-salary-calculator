// src/lib/salaryData.ts

export type PercentileData = { percentile: number; income: number };

export type SalaryStat = {
  percentiles: PercentileData[];
  median: number;
  average: number;
};

// [수정] 모든 금액 단위를 실제 값으로 변경하여 코드의 명확성을 높이고 잠재적 오류를 방지합니다.
export const salaryData: Record<string, SalaryStat> = {
  "all-all-all-all": {
    percentiles: [
      { percentile: 25, income: 30100000 },
      { percentile: 75, income: 65800000 },
      { percentile: 90, income: 98700000 },
    ],
    median: 43200000,
    average: 54600000,
  },
  "it_dev-1-3-20s-capital": {
    percentiles: [
      { percentile: 25, income: 42000000 },
      { percentile: 75, income: 60000000 },
      { percentile: 90, income: 75000000 },
    ],
    median: 50000000,
    average: 51500000,
  },
  "it_dev-1-3-20s-non-capital": {
    percentiles: [
      { percentile: 25, income: 38000000 },
      { percentile: 75, income: 55000000 },
      { percentile: 90, income: 68000000 },
    ],
    median: 45000000,
    average: 46500000,
  },
  "it_dev-4-7-30s-capital": {
    percentiles: [
      { percentile: 25, income: 75000000 },
      { percentile: 75, income: 110000000 },
      { percentile: 90, income: 140000000 },
    ],
    median: 90000000,
    average: 95000000,
  },
  "it_dev-4-7-30s-non-capital": {
    percentiles: [
      { percentile: 25, income: 68000000 },
      { percentile: 75, income: 95000000 },
      { percentile: 90, income: 120000000 },
    ],
    median: 80000000,
    average: 84000000,
  },
  "it_dev-8+-40s-capital": {
    percentiles: [
      { percentile: 25, income: 110000000 },
      { percentile: 75, income: 160000000 },
      { percentile: 90, income: 200000000 },
    ],
    median: 130000000,
    average: 145000000,
  },
  "it_dev-8+-40s-non-capital": {
    percentiles: [
      { percentile: 25, income: 95000000 },
      { percentile: 75, income: 130000000 },
      { percentile: 90, income: 160000000 },
    ],
    median: 110000000,
    average: 120000000,
  },
  "management-1-3-20s-capital": {
    percentiles: [
      { percentile: 25, income: 33000000 },
      { percentile: 75, income: 46000000 },
      { percentile: 90, income: 56000000 },
    ],
    median: 38000000,
    average: 40000000,
  },
  "management-1-3-20s-non-capital": {
    percentiles: [
      { percentile: 25, income: 30000000 },
      { percentile: 75, income: 42000000 },
      { percentile: 90, income: 51000000 },
    ],
    median: 35000000,
    average: 36500000,
  },
  "management-4-7-30s-capital": {
    percentiles: [
      { percentile: 25, income: 48000000 },
      { percentile: 75, income: 70000000 },
      { percentile: 90, income: 85000000 },
    ],
    median: 58000000,
    average: 61000000,
  },
  "management-4-7-30s-non-capital": {
    percentiles: [
      { percentile: 25, income: 44000000 },
      { percentile: 75, income: 63000000 },
      { percentile: 90, income: 76000000 },
    ],
    median: 52000000,
    average: 55000000,
  },
  "management-8+-40s-capital": {
    percentiles: [
      { percentile: 25, income: 72000000 },
      { percentile: 75, income: 115000000 },
      { percentile: 90, income: 140000000 },
    ],
    median: 90000000,
    average: 98000000,
  },
  "management-8+-40s-non-capital": {
    percentiles: [
      { percentile: 25, income: 65000000 },
      { percentile: 75, income: 98000000 },
      { percentile: 90, income: 120000000 },
    ],
    median: 80000000,
    average: 85000000,
  },
  "design-1-3-20s-capital": {
    percentiles: [
      { percentile: 25, income: 31000000 },
      { percentile: 75, income: 42000000 },
      { percentile: 90, income: 50000000 },
    ],
    median: 36000000,
    average: 37000000,
  },
  "design-1-3-20s-non-capital": {
    percentiles: [
      { percentile: 25, income: 28000000 },
      { percentile: 75, income: 38000000 },
      { percentile: 90, income: 45000000 },
    ],
    median: 33000000,
    average: 34000000,
  },
  "design-4-7-30s-capital": {
    percentiles: [
      { percentile: 25, income: 45000000 },
      { percentile: 75, income: 65000000 },
      { percentile: 90, income: 80000000 },
    ],
    median: 55000000,
    average: 57000000,
  },
  "design-4-7-30s-non-capital": {
    percentiles: [
      { percentile: 25, income: 41000000 },
      { percentile: 75, income: 58000000 },
      { percentile: 90, income: 71000000 },
    ],
    median: 49000000,
    average: 51000000,
  },
  "design-8+-40s-capital": {
    percentiles: [
      { percentile: 25, income: 68000000 },
      { percentile: 75, income: 95000000 },
      { percentile: 90, income: 110000000 },
    ],
    median: 80000000,
    average: 82000000,
  },
  "design-8+-40s-non-capital": {
    percentiles: [
      { percentile: 25, income: 60000000 },
      { percentile: 75, income: 85000000 },
      { percentile: 90, income: 100000000 },
    ],
    median: 72000000,
    average: 75000000,
  },
};
