// Mock data representing approximate salary percentiles by age group in Korea (Unit: 10,000 KRW)
// Source: Estimated based on various statistical reports (for entertainment purposes)

export const SALARY_PERCENTILES: Record<string, number[]> = {
    // Age Group: [Top 1%, Top 5%, Top 10%, Top 25%, Top 50%, Top 75%]
    "20s": [8000, 6000, 5000, 4000, 3200, 2600],
    "30s": [12000, 9000, 7500, 5500, 4200, 3200],
    "40s": [18000, 13000, 10000, 7000, 5000, 3500],
    "50s": [20000, 14000, 11000, 7500, 5200, 3500],
};

export const TIER_CONFIG = [
    { percentile: 1, name: "CHALLENGER", color: "from-blue-400 to-cyan-300", icon: "💎", message: "상위 1%의 신화적 존재입니다." },
    { percentile: 5, name: "GRANDMASTER", color: "from-purple-500 to-pink-500", icon: "👑", message: "어딜 가나 대우받는 최상위권!" },
    { percentile: 10, name: "MASTER", color: "from-red-500 to-orange-500", icon: "🦁", message: "성공한 커리어의 상징입니다." },
    { percentile: 25, name: "DIAMOND", color: "from-cyan-500 to-blue-500", icon: "💠", message: "남부럽지 않은 고연봉자!" },
    { percentile: 50, name: "PLATINUM", color: "from-emerald-400 to-teal-500", icon: "☘️", message: "대한민국 평균 이상입니다." },
    { percentile: 75, name: "GOLD", color: "from-yellow-400 to-amber-500", icon: "🥇", message: "성실하게 미래를 쌓아가는 중!" },
    { percentile: 100, name: "SILVER", color: "from-slate-300 to-slate-400", icon: "🥈", message: "무한한 잠재력을 가진 시작!" },
];

export function calculateSalaryRank(ageGroup: string, salary: number) {
    const percentiles = SALARY_PERCENTILES[ageGroup] || SALARY_PERCENTILES["30s"];
    const salaryMan = salary / 10000; // Convert to Man-won

    if (salaryMan >= percentiles[0]) return { ...TIER_CONFIG[0] };
    if (salaryMan >= percentiles[1]) return { ...TIER_CONFIG[1] };
    if (salaryMan >= percentiles[2]) return { ...TIER_CONFIG[2] };
    if (salaryMan >= percentiles[3]) return { ...TIER_CONFIG[3] };
    if (salaryMan >= percentiles[4]) return { ...TIER_CONFIG[4] };
    if (salaryMan >= percentiles[5]) return { ...TIER_CONFIG[5] };
    return { ...TIER_CONFIG[6] };
}
