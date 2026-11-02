import { CompanyProfile, JobLevel, SalaryComponent } from "@/types/company";
import { josa } from "@/lib/josa";

export interface ComparisonResult {
 companyA: CompanyProfile;
 companyB: CompanyProfile;
 metrics: {
 totalComp: { a: number; b: number; winner: "a" | "b" | "draw" };
 realHourlyWage: { a: number; b: number; winner: "a" | "b" | "draw" };
 workLifeScore: { a: number; b: number; winner: "a" | "b" | "draw" };
 growthScore: { a: number; b: number; winner: "a" | "b" | "draw" };
 };
 radarData: {
 subject: string;
 A: number;
 B: number;
 fullMark: number;
 }[];
 verdict: string;
}

const calculateTotalComp = (salary: SalaryComponent): number => {
 const incentiveAmount = salary.incentive.avgAmount || (salary.base * (salary.incentive.target / 100));
 const stockAmount = salary.stock ? salary.stock.amount : 0;
 return salary.base + incentiveAmount + stockAmount + (salary.signOn || 0); // Sign-on is one-time, maybe amortize? For now, include raw.
};

const calculateRealHourlyWage = (totalComp: number, weeklyHours: number): number => {
 return totalComp / (weeklyHours * 52);
};

export class CompanyComparator {
 static compare(
 companyA: CompanyProfile,
 companyB: CompanyProfile,
 level: JobLevel = "entry"
 ): ComparisonResult {
 // 1. Calculate Financials
 const salaryA = companyA.salary[level];
 const salaryB = companyB.salary[level];

 const totalCompA = calculateTotalComp(salaryA);
 const totalCompB = calculateTotalComp(salaryB);

 const hourlyA = calculateRealHourlyWage(totalCompA, companyA.workLife.weeklyHours.real);
 const hourlyB = calculateRealHourlyWage(totalCompB, companyB.workLife.weeklyHours.real);

 // 2. Calculate Scores (0-100 Normalization for Radar)
 // Simple normalization logic: (Value / MaxValue) * 100
 // We use arbitrary "Max" baselines for now.
 const MAX_SALARY = 150000000; // 1.5억 baseline for entry/junior

 const scoreMoneyA = Math.min((totalCompA / MAX_SALARY) * 100, 100);
 const scoreMoneyB = Math.min((totalCompB / MAX_SALARY) * 100, 100);

 const scoreWL_A = Math.min((companyA.workLife.vacation.usageRate + (100 - companyA.workLife.weeklyHours.real)) / 2, 100); // Rough heuristic
 const scoreWL_B = Math.min((companyB.workLife.vacation.usageRate + (100 - companyB.workLife.weeklyHours.real)) / 2, 100);

 // 성장 점수는 별도 데이터가 없어 문화 점수와 같은 값이다 — 레이더에 '성장' 축을 따로 그리면 문화 축과 늘 같은 값이
 // 두 번 나와 독립 지표처럼 보였다(2026-10-05 감사 code61-03). 레이더에서는 뺀다(metrics.growthScore 는 호환용으로 남김).
 const scoreGrowthA = companyA.culture.score * 10;
 const scoreGrowthB = companyB.culture.score * 10;

 // 3. Generate Verdict
 // 2026-10-05 감사 code61-02: B 가 연봉·시급 모두 앞설 때도 A 처럼 압승 판정(종전에는 고른 칸에 따라 중립 문구),
 // 조사 '가'·'를' 은 회사명 받침에 맞춰 josa() 로(쿠팡가 → 쿠팡이).
 const nameA = companyA.name.ko;
 const nameB = companyB.name.ko;
 let verdict = "";
 if (totalCompA > totalCompB && hourlyA > hourlyB) {
 verdict = `${nameA}의 압승입니다. 연봉과 시급 모두 더 높습니다.`;
 } else if (totalCompB > totalCompA && hourlyB > hourlyA) {
 verdict = `${nameB}의 압승입니다. 연봉과 시급 모두 더 높습니다.`;
 } else if (totalCompA > totalCompB && hourlyA < hourlyB) {
 verdict = `${josa(nameA, "이/가")} 돈은 더 주지만, ${josa(nameB, "이/가")} '가성비(시급)'는 더 좋습니다. 워라밸을 중시한다면 ${josa(nameB, "을/를")} 고려하세요.`;
 } else if (totalCompA < totalCompB && hourlyA > hourlyB) {
 verdict = `${josa(nameB, "이/가")} 연봉은 높지만, 근무강도가 셉니다. 실속은 ${josa(nameA, "이/가")} 챙길 수 있습니다.`;
 } else {
 verdict = "총보상·실질 시급 결과를 각 항목에서 비교하세요. 워라밸·문화·복지 점수는 별도 참고 지표입니다.";
 }

 return {
 companyA,
 companyB,
 metrics: {
 totalComp: {
 a: totalCompA,
 b: totalCompB,
 winner: totalCompA > totalCompB ? "a" : totalCompB > totalCompA ? "b" : "draw",
 },
 realHourlyWage: {
 a: hourlyA,
 b: hourlyB,
 winner: hourlyA > hourlyB ? "a" : hourlyB > hourlyA ? "b" : "draw",
 },
 workLifeScore: {
 a: scoreWL_A,
 b: scoreWL_B,
 winner: scoreWL_A > scoreWL_B ? "a" : scoreWL_B > scoreWL_A ? "b" : "draw",
 },
 growthScore: {
 a: scoreGrowthA,
 b: scoreGrowthB,
 winner: scoreGrowthA > scoreGrowthB ? "a" : scoreGrowthB > scoreGrowthA ? "b" : "draw",
 },
 },
 radarData: [
 { subject: "연봉 (Money)", A: Math.round(scoreMoneyA), B: Math.round(scoreMoneyB), fullMark: 100 },
 { subject: "워라밸 (Balance)", A: Math.round(scoreWL_A), B: Math.round(scoreWL_B), fullMark: 100 },
 { subject: "문화 (Culture)", A: Math.round(companyA.culture.score * 10), B: Math.round(companyB.culture.score * 10), fullMark: 100 },
 { subject: "복지 (Benefits)", A: Math.min(companyA.benefits.length * 20, 100), B: Math.min(companyB.benefits.length * 20, 100), fullMark: 100 }, // Simple count heuristic
 ],
 verdict,
 };
 }
}
