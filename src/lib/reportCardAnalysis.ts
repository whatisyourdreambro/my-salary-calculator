import type { SalaryStat } from "./salaryData";

export interface ReportCardData {
  grade: "S" | "A" | "B" | "C" | "D";
  title: string;
  summary: string;
  stats: { subject: string; value: number }[];
}

export interface GrowthPlan {
  step: number;
  title: string;
  description: string;
  link: string;
  linkText: string;
}

// 연봉 등급과 능력치를 계산하는 함수
export const analyzeSalary = (
  salary: number,
  rank: number,
  jobCategory: string,
  experienceLevel: string,
  marketData: SalaryStat
): ReportCardData => {
  let grade: "S" | "A" | "B" | "C" | "D";
  let title: string;
  let summary: string;

  if (rank <= 10) {
    grade = "S";
    title = "최상위 소득 그룹 (S등급)";
    summary =
      "놀라운 수준입니다! 당신은 해당 그룹에서 가장 높은 보상을 받는 인재 중 한 명입니다. 현재의 위치를 유지하며 자산 증식에 집중할 때입니다.";
  } else if (rank <= 25) {
    grade = "A";
    title = "상위 소득 그룹 (A등급)";
    summary =
      "훌륭합니다! 당신의 가치는 시장에서 높게 평가받고 있습니다. 한 단계 더 높은 도약을 위한 전략을 고민해볼 시점입니다.";
  } else if (rank <= 50) {
    grade = "B";
    title = "평균 이상 그룹 (B등급)";
    summary =
      "안정적인 궤도에 올랐습니다. 현재의 전문성을 바탕으로 당신의 몸값을 더욱 높일 수 있는 기회를 찾아보세요.";
  } else if (rank <= 75) {
    grade = "C";
    title = "성장 필요 그룹 (C등급)";
    summary =
      "아직 당신의 잠재력을 모두 발휘하지 못했습니다. 체계적인 전략을 통해 연봉을 한 단계 업그레이드할 필요가 있습니다.";
  } else {
    grade = "D";
    title = "분발 필요 그룹 (D등급)";
    summary =
      "괜찮습니다. 지금부터가 진짜 시작입니다. 당신의 가치를 증명하고 제대로 된 보상을 받기 위한 첫걸음을 내디딜 때입니다.";
  }

  // 육각형 능력치 계산 (가중치 기반의 휴리스틱)
  const normalize = (val: number, max: number) =>
    Math.min(100, (val / max) * 100);

  const stats = [
    {
      subject: "기본소득",
      value: normalize(salary, marketData.percentiles[10] || 150000000),
    },
    { subject: "시장성", value: 100 - rank },
    {
      subject: "성장성",
      value: ["it_dev", "professional"].includes(jobCategory) ? 85 : 65,
    },
    {
      subject: "안정성",
      value: ["management", "manufacturing"].includes(jobCategory) ? 80 : 70,
    },
    {
      subject: "희소성",
      value: ["1-2", "3-6"].includes(experienceLevel) ? 60 : 80,
    },
  ];

  return { grade, title, summary, stats };
};

// AI 성장 플랜을 생성하는 함수
export const generateGrowthPlan = (
  grade: string,
  rank: number,
  salary: number
): GrowthPlan[] => {
  const plans: GrowthPlan[] = [];

  // 공통 플랜: 1단계
  plans.push({
    step: 1,
    title: "목표 설정: 3년 내 연봉 30% 인상",
    description:
      "막연한 희망이 아닌 구체적인 목표를 설정하는 것이 모든 성장의 첫걸음입니다. 당신의 다음 목표 연봉을 설정하고, 달성 계획을 시뮬레이션 해보세요.",
    link: `/?tab=future&salary=${salary}`,
    linkText: "미래 연봉 계산기로 계획하기",
  });

  // 등급별 맞춤 플랜: 2단계
  if (rank > 50) {
    // C, D 등급
    plans.push({
      step: 2,
      title: "전략 학습: 몸값 올리는 협상의 기술",
      description:
        "당신의 가치는 현재 연봉보다 높을 수 있습니다. 시장 가치를 파악하고, 논리적인 근거로 당신의 가치를 증명하는 실전 협상 기술을 익히세요.",
      link: "/guides/salary-negotiation",
      linkText: "연봉 협상 가이드 전문 읽기",
    });
  } else {
    // S, A, B 등급
    plans.push({
      step: 2,
      title: "시장 분석: 더 높은 곳으로의 점프",
      description:
        "현재의 성과에 만족하지 마세요. IT업계 최고 수준의 보상을 제공하는 '네카라쿠배'의 연봉 구조를 분석하고 당신의 다음 커리어를 준비하세요.",
      link: "/guides/nekarakubae-salary",
      linkText: "네카라쿠배 연봉 가이드 보기",
    });
  }

  // 공통 플랜: 3단계
  plans.push({
    step: 3,
    title: "자산 증식: 돈이 일하게 만들기",
    description:
      "근로소득만으로는 경제적 자유를 얻기 어렵습니다. 상승된 연봉을 종잣돈 삼아, 당신이 잠자는 동안에도 자산이 불어나는 투자 파이프라인을 구축하세요.",
    link: "/guides/road-to-100m-part3-invest",
    linkText: "투자 파이프라인 구축 가이드",
  });

  return plans;
};
