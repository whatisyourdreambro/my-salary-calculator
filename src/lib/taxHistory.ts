// src/lib/taxHistory.ts
// 2020~2026 한국 주요 세율·4대보험 요율 history.
// /year/[year]/tax-rates 페이지 데이터 소스.

export interface IncomeTaxBracket {
 min: number;
 max: number | null;
 rate: number; // 0.06 = 6%
 deduction: number;
}

export interface YearTaxData {
 year: number;
 incomeTaxBrackets: IncomeTaxBracket[];
 nationalPensionRate: number; // 4.5% = 0.045 본인 부담
 healthInsuranceRate: number; // 3.545% = 0.03545
 longTermCareRatio: number; // 건강보험의 12.95%
 employmentInsuranceRate: number; // 0.9% = 0.009
 minWage: number; // 최저시급 (원)
 majorChange: string;
}

// 한국 소득세 누진세율 history.
// 2023년 1,200만원/4,600만원 → 1,400만원/5,000만원 한계점 변경.
const BRACKETS_2020_2022: IncomeTaxBracket[] = [
 { min: 0, max: 12_000_000, rate: 0.06, deduction: 0 },
 { min: 12_000_000, max: 46_000_000, rate: 0.15, deduction: 1_080_000 },
 { min: 46_000_000, max: 88_000_000, rate: 0.24, deduction: 5_220_000 },
 { min: 88_000_000, max: 150_000_000, rate: 0.35, deduction: 14_900_000 },
 { min: 150_000_000, max: 300_000_000, rate: 0.38, deduction: 19_400_000 },
 { min: 300_000_000, max: 500_000_000, rate: 0.4, deduction: 25_400_000 },
 { min: 500_000_000, max: 1_000_000_000, rate: 0.42, deduction: 35_400_000 },
 { min: 1_000_000_000, max: null, rate: 0.45, deduction: 65_400_000 },
];

const BRACKETS_2023_2026: IncomeTaxBracket[] = [
 { min: 0, max: 14_000_000, rate: 0.06, deduction: 0 },
 { min: 14_000_000, max: 50_000_000, rate: 0.15, deduction: 1_260_000 },
 { min: 50_000_000, max: 88_000_000, rate: 0.24, deduction: 5_760_000 },
 { min: 88_000_000, max: 150_000_000, rate: 0.35, deduction: 15_440_000 },
 { min: 150_000_000, max: 300_000_000, rate: 0.38, deduction: 19_940_000 },
 { min: 300_000_000, max: 500_000_000, rate: 0.4, deduction: 25_940_000 },
 { min: 500_000_000, max: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
 { min: 1_000_000_000, max: null, rate: 0.45, deduction: 65_940_000 },
];

export const TAX_HISTORY: Record<number, YearTaxData> = {
 2020: {
 year: 2020,
 incomeTaxBrackets: BRACKETS_2020_2022,
 nationalPensionRate: 0.045,
 healthInsuranceRate: 0.0335,
 longTermCareRatio: 0.1025,
 employmentInsuranceRate: 0.008,
 minWage: 8_590,
 majorChange: "최저시급 8,590원 (2.87% 인상). 코로나19 대응 고용유지 지원금 도입.",
 },
 2021: {
 year: 2021,
 incomeTaxBrackets: BRACKETS_2020_2022,
 nationalPensionRate: 0.045,
 healthInsuranceRate: 0.03433,
 longTermCareRatio: 0.1152,
 employmentInsuranceRate: 0.008,
 minWage: 8_720,
 majorChange: "최저시급 8,720원 (1.5% 인상). 건보료 6.86%로 인상.",
 },
 2022: {
 year: 2022,
 incomeTaxBrackets: BRACKETS_2020_2022,
 nationalPensionRate: 0.045,
 healthInsuranceRate: 0.03495,
 longTermCareRatio: 0.1227,
 employmentInsuranceRate: 0.009,
 minWage: 9_160,
 majorChange: "최저시급 9,160원 (5.05% 인상). 고용보험 1.8%로 인상.",
 },
 2023: {
 year: 2023,
 incomeTaxBrackets: BRACKETS_2023_2026,
 nationalPensionRate: 0.045,
 healthInsuranceRate: 0.03545,
 longTermCareRatio: 0.1281,
 employmentInsuranceRate: 0.009,
 minWage: 9_620,
 majorChange: "소득세 누진구간 변경 (1,200→1,400만, 4,600→5,000만). 식대 비과세 10→20만으로 상향.",
 },
 2024: {
 year: 2024,
 incomeTaxBrackets: BRACKETS_2023_2026,
 nationalPensionRate: 0.045,
 healthInsuranceRate: 0.03545,
 longTermCareRatio: 0.1295,
 employmentInsuranceRate: 0.009,
 minWage: 9_860,
 majorChange: "결혼세액공제 50만원 신설. 자녀세액공제 첫째 30만, 둘째 50만, 셋째 70만으로 확대.",
 },
 2025: {
 year: 2025,
 incomeTaxBrackets: BRACKETS_2023_2026,
 nationalPensionRate: 0.045,
 healthInsuranceRate: 0.03545,
 longTermCareRatio: 0.1295,
 employmentInsuranceRate: 0.009,
 minWage: 10_030,
 majorChange: "최저시급 1만원 시대. 결혼세액공제 일시 폐지 (1년 한정).",
 },
 2026: {
 year: 2026,
 incomeTaxBrackets: BRACKETS_2023_2026,
 nationalPensionRate: 0.045,
 healthInsuranceRate: 0.03545,
 longTermCareRatio: 0.1295,
 employmentInsuranceRate: 0.009,
 minWage: 10_320,
 majorChange: "결혼세액공제 50만원 부활. 6세 이하 자녀 추가공제 100만 신설. 식대 비과세 20만 유지.",
 },
};

export const HISTORY_YEARS: number[] = Object.keys(TAX_HISTORY)
 .map(Number)
 .sort((a, b) => a - b);

export function getYearTaxData(year: number): YearTaxData | undefined {
 return TAX_HISTORY[year];
}

/**
 * 주어진 연도의 세율로 연봉 입력 시 산출세액 계산 (간이).
 * 누진세율 적용. 4대보험·근로소득공제는 별도.
 */
export function calculateIncomeTaxByYear(taxableBase: number, year: number): number {
 const data = TAX_HISTORY[year];
 if (!data) return 0;

 for (const b of data.incomeTaxBrackets) {
 if (b.max === null || taxableBase <= b.max) {
 return Math.max(0, taxableBase * b.rate - b.deduction);
 }
 }
 return 0;
}
