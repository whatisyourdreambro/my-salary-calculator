// src/lib/salaryData.ts

export type PercentileData = { percentile: number; income: number };

export type SalaryStat = {
  percentiles: PercentileData[];
  median: number;
  average: number;
};

export const salaryData: Record<string, SalaryStat> = {
  "all-all-all-all": {
    percentiles: [
      { percentile: 25, income: 3010 },
      { percentile: 75, income: 6580 },
      { percentile: 90, income: 9870 },
    ],
    median: 4320,
    average: 5460,
  },
  "it_dev-1-3-20s-capital": {
    percentiles: [
      { percentile: 25, income: 4200 },
      { percentile: 75, income: 6000 },
      { percentile: 90, income: 7500 },
    ],
    median: 5000,
    average: 5150,
  },
  "it_dev-1-3-20s-non-capital": {
    percentiles: [
      { percentile: 25, income: 3800 },
      { percentile: 75, income: 5500 },
      { percentile: 90, income: 6800 },
    ],
    median: 4500,
    average: 4650,
  },
  "it_dev-4-7-30s-capital": {
    percentiles: [
      { percentile: 25, income: 7500 },
      { percentile: 75, income: 11000 },
      { percentile: 90, income: 14000 },
    ],
    median: 9000,
    average: 9500,
  },
  "it_dev-4-7-30s-non-capital": {
    percentiles: [
      { percentile: 25, income: 6800 },
      { percentile: 75, income: 9500 },
      { percentile: 90, income: 12000 },
    ],
    median: 8000,
    average: 8400,
  },
  "it_dev-8+-40s-capital": {
    percentiles: [
      { percentile: 25, income: 11000 },
      { percentile: 75, income: 16000 },
      { percentile: 90, income: 20000 },
    ],
    median: 13000,
    average: 14500,
  },
  "it_dev-8+-40s-non-capital": {
    percentiles: [
      { percentile: 25, income: 9500 },
      { percentile: 75, income: 13000 },
      { percentile: 90, income: 16000 },
    ],
    median: 11000,
    average: 12000,
  },
  "management-1-3-20s-capital": {
    percentiles: [
      { percentile: 25, income: 3300 },
      { percentile: 75, income: 4600 },
      { percentile: 90, income: 5600 },
    ],
    median: 3800,
    average: 4000,
  },
  "management-1-3-20s-non-capital": {
    percentiles: [
      { percentile: 25, income: 3000 },
      { percentile: 75, income: 4200 },
      { percentile: 90, income: 5100 },
    ],
    median: 3500,
    average: 3650,
  },
  "management-4-7-30s-capital": {
    percentiles: [
      { percentile: 25, income: 4800 },
      { percentile: 75, income: 7000 },
      { percentile: 90, income: 8500 },
    ],
    median: 5800,
    average: 6100,
  },
  "management-4-7-30s-non-capital": {
    percentiles: [
      { percentile: 25, income: 4400 },
      { percentile: 75, income: 6300 },
      { percentile: 90, income: 7600 },
    ],
    median: 5200,
    average: 5500,
  },
  "management-8+-40s-capital": {
    percentiles: [
      { percentile: 25, income: 7200 },
      { percentile: 75, income: 11500 },
      { percentile: 90, income: 14000 },
    ],
    median: 9000,
    average: 9800,
  },
  "management-8+-40s-non-capital": {
    percentiles: [
      { percentile: 25, income: 6500 },
      { percentile: 75, income: 9800 },
      { percentile: 90, income: 12000 },
    ],
    median: 8000,
    average: 8500,
  },
  "design-1-3-20s-capital": {
    percentiles: [
      { percentile: 25, income: 3100 },
      { percentile: 75, income: 4200 },
      { percentile: 90, income: 5000 },
    ],
    median: 3600,
    average: 3700,
  },
  "design-1-3-20s-non-capital": {
    percentiles: [
      { percentile: 25, income: 2800 },
      { percentile: 75, income: 3800 },
      { percentile: 90, income: 4500 },
    ],
    median: 3300,
    average: 3400,
  },
  "design-4-7-30s-capital": {
    percentiles: [
      { percentile: 25, income: 4500 },
      { percentile: 75, income: 6500 },
      { percentile: 90, income: 8000 },
    ],
    median: 5500,
    average: 5700,
  },
  "design-4-7-30s-non-capital": {
    percentiles: [
      { percentile: 25, income: 4100 },
      { percentile: 75, income: 5800 },
      { percentile: 90, income: 7100 },
    ],
    median: 4900,
    average: 5100,
  },
  "design-8+-40s-capital": {
    percentiles: [
      { percentile: 25, income: 6800 },
      { percentile: 75, income: 9500 },
      { percentile: 90, income: 11000 },
    ],
    median: 8000,
    average: 8200,
  },
  "design-8+-40s-non-capital": {
    percentiles: [
      { percentile: 25, income: 6000 },
      { percentile: 75, income: 8500 },
      { percentile: 90, income: 10000 },
    ],
    median: 7200,
    average: 7500,
  },
};

Object.values(salaryData).forEach((stat) => {
  stat.percentiles.forEach((p) => (p.income *= 10000));
  stat.median *= 10000;
  stat.average *= 10000;
});
