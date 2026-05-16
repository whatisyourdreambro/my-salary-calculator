// 연령대별 연봉 백분위 데이터 (단위: 만원)
// 통계청·고용노동부 자료 기반 추정치 (참고용)

export const SALARY_PERCENTILES: Record<string, number[]> = {
  // [상위 1%, 상위 5%, 상위 10%, 상위 25%, 상위 50%, 상위 75%]
  "20s_early": [6000,  4500,  3800,  3000,  2500,  2000],
  "20s_late":  [9000,  7000,  5800,  4500,  3500,  2800],
  "30s_early": [11000, 8000,  6500,  5000,  3900,  3000],
  "30s_late":  [14000, 10500, 8500,  6200,  4600,  3400],
  "40s_early": [16000, 12000, 9500,  6800,  4800,  3400],
  "40s_late":  [20000, 14000, 11000, 7500,  5200,  3600],
  "50s":       [20000, 14000, 11000, 7500,  5200,  3500],
  // 하위 호환용
  "20s": [8000,  6000,  5000,  4000,  3200,  2600],
  "30s": [12000, 9000,  7500,  5500,  4200,  3200],
  "40s": [18000, 13000, 10000, 7000,  5000,  3500],
};

export const AGE_GROUPS = [
  { key: "20s_early", label: "20대 초반" },
  { key: "20s_late",  label: "20대 후반" },
  { key: "30s_early", label: "30대 초반" },
  { key: "30s_late",  label: "30대 후반" },
  { key: "40s_early", label: "40대 초반" },
  { key: "40s_late",  label: "40대 후반" },
  { key: "50s",       label: "50대 이상" },
];

export const TIER_CONFIG = [
  { percentile: 1,   name: "CHALLENGER",   color: "from-blue-400 to-cyan-300",    icon: "💎", message: "상위 1%의 신화적 존재입니다." },
  { percentile: 5,   name: "GRANDMASTER",  color: "from-yellow-400 to-orange-400", icon: "👑", message: "어딜 가나 대우받는 최상위권!" },
  { percentile: 10,  name: "MASTER",       color: "from-red-500 to-orange-400",   icon: "🦁", message: "성공한 커리어의 상징입니다." },
  { percentile: 25,  name: "DIAMOND",      color: "from-sky-400 to-blue-500",     icon: "💠", message: "남부럽지 않은 고연봉자!" },
  { percentile: 50,  name: "PLATINUM",     color: "from-teal-400 to-green-400",   icon: "☘️", message: "대한민국 평균 이상입니다." },
  { percentile: 75,  name: "GOLD",         color: "from-yellow-500 to-amber-400", icon: "🥇", message: "성실하게 미래를 쌓아가는 중!" },
  { percentile: 100, name: "SILVER",       color: "from-slate-300 to-slate-400",  icon: "🥈", message: "무한한 잠재력을 가진 시작!" },
];

export function calculateSalaryRank(ageGroup: string, salary: number) {
  const percentiles = SALARY_PERCENTILES[ageGroup] ?? SALARY_PERCENTILES["30s"];
  const salaryMan = salary / 10000;

  for (let i = 0; i < percentiles.length; i++) {
    if (salaryMan >= percentiles[i]) return { ...TIER_CONFIG[i] };
  }
  return { ...TIER_CONFIG[TIER_CONFIG.length - 1] };
}
