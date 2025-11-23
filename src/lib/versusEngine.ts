import { CompanyProfile, JobLevel, SalaryComponent } from "@/types/company";

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
        const MAX_HOURLY = 100000; // 10만원/hr

        const scoreMoneyA = Math.min((totalCompA / MAX_SALARY) * 100, 100);
        const scoreMoneyB = Math.min((totalCompB / MAX_SALARY) * 100, 100);

        const scoreWL_A = Math.min((companyA.workLife.vacation.usageRate + (100 - companyA.workLife.weeklyHours.real)) / 2, 100); // Rough heuristic
        const scoreWL_B = Math.min((companyB.workLife.vacation.usageRate + (100 - companyB.workLife.weeklyHours.real)) / 2, 100);

        const scoreGrowthA = companyA.culture.score * 10;
        const scoreGrowthB = companyB.culture.score * 10;

        // 3. Generate Verdict
        let verdict = "";
        if (totalCompA > totalCompB && hourlyA > hourlyB) {
            verdict = `${companyA.name.ko}의 압승입니다. 연봉과 시급 모두 더 높습니다.`;
        } else if (totalCompA > totalCompB && hourlyA < hourlyB) {
            verdict = `${companyA.name.ko}가 돈은 더 주지만, ${companyB.name.ko}가 '가성비(시급)'는 더 좋습니다. 워라밸을 중시한다면 ${companyB.name.ko}를 고려하세요.`;
        } else if (totalCompA < totalCompB && hourlyA > hourlyB) {
            verdict = `${companyB.name.ko}가 연봉은 높지만, 근무강도가 셉니다. 실속은 ${companyA.name.ko}가 챙길 수 있습니다.`;
        } else {
            verdict = `${companyB.name.ko}가 모든 면에서 우세합니다.`;
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
                { subject: "성장 (Growth)", A: Math.round(scoreGrowthA), B: Math.round(scoreGrowthB), fullMark: 100 },
                { subject: "문화 (Culture)", A: Math.round(companyA.culture.score * 10), B: Math.round(companyB.culture.score * 10), fullMark: 100 },
                { subject: "복지 (Benefits)", A: Math.min(companyA.benefits.length * 20, 100), B: Math.min(companyB.benefits.length * 20, 100), fullMark: 100 }, // Simple count heuristic
            ],
            verdict,
        };
    }
}
