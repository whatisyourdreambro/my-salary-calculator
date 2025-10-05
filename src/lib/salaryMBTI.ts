// src/lib/salaryMBTI.ts

export interface SalaryMBTIType {
  type: string;
  title: string;
  description: string;
  data: { age: number; salary: number }[];
  guide: {
    title: string;
    link: string;
  };
}

export interface QuestionOption {
  text: string;
  type: string;
}

export const questions: {
  question: string;
  options: QuestionOption[];
}[] = [
  {
    question: "학창시절 당신의 별명은?",
    options: [
      { text: "분위기 메이커, 핵인싸", type: "E" },
      { text: "혼자가 편한, 자발적 아싸", type: "I" },
    ],
  },
  {
    question: "갑자기 1억이 생긴다면?",
    options: [
      { text: "내일의 10억을 위한, 부동산/주식 투자", type: "N" },
      { text: "일단 안전하게, 예금 통장에 저축", type: "S" },
    ],
  },
  {
    question: "새로운 재테크 정보를 들었을 때 당신은?",
    options: [
      { text: "감보다 데이터! 각종 지표와 리포트를 꼼꼼히 분석", type: "T" },
      { text: "이건 대박의 느낌! 나의 직감을 믿고 과감하게 베팅", type: "F" },
    ],
  },
  {
    question: "당신의 소비 습관은?",
    options: [
      { text: "한 달 예산을 세우고 철저하게 관리", type: "J" },
      { text: "꽂히면 일단 지르고, 다음 달의 내가 해결", type: "P" },
    ],
  },
  {
    question: "꿈꾸는 당신의 미래는?",
    options: [
      { text: "빠르게 돈 벌고 은퇴하는, 파이어족", type: "P" },
      { text: "한 분야의 최고가 되는, 장인", type: "J" },
    ],
  },
];

const resultTypes: SalaryMBTIType[] = [
  {
    type: "ENTJ",
    title: "타고난 재벌형",
    description:
      "타고난 리더십과 야망으로 부를 이룹니다. 돈이 당신을 따르는군요!",
    data: [
      { age: 20, salary: 0.7 },
      { age: 30, salary: 2 },
      { age: 40, salary: 5 },
      { age: 50, salary: 15 },
      { age: 60, salary: 30 },
    ],
    guide: {
      title: "연봉 1억을 위한 절세 전략",
      link: "/guides/road-to-100m-part1-tax",
    },
  },
  {
    type: "ENTP",
    title: "유튜버 대박형",
    description: "타고난 끼와 재능으로 일확천금을 노립니다. 인생은 한 방!",
    data: [
      { age: 20, salary: 0.2 },
      { age: 30, salary: 0.5 },
      { age: 35, salary: 10 },
      { age: 40, salary: 8 },
      { age: 60, salary: 5 },
    ],
    guide: {
      title: "N잡으로 월 100만원 더 벌기",
      link: "/guides/road-to-100m-part2-sidejob",
    },
  },
  {
    type: "ENFJ",
    title: "인맥왕 사업가형",
    description: "넓은 인맥과 뛰어난 공감 능력으로 성공적인 사업을 일궈냅니다.",
    data: [
      { age: 20, salary: 0.4 },
      { age: 30, salary: 1.5 },
      { age: 40, salary: 4 },
      { age: 50, salary: 10 },
      { age: 60, salary: 20 },
    ],
    guide: {
      title: "연봉협상: 최소 20% 올려받는 4단계 전략",
      link: "/guides/salary-negotiation",
    },
  },
  {
    type: "ENFP",
    title: "자유로운 영혼의 N잡러형",
    description:
      "다양한 분야에 도전하며 즐겁게 돈을 법니다. 수익보단 재미가 우선!",
    data: [
      { age: 20, salary: 0.3 },
      { age: 30, salary: 0.7 },
      { age: 40, salary: 1.5 },
      { age: 50, salary: 2.5 },
      { age: 60, salary: 4 },
    ],
    guide: {
      title: "N잡으로 월 100만원 더 벌기",
      link: "/guides/road-to-100m-part2-sidejob",
    },
  },
  {
    type: "ISTJ",
    title: "공무원 안정형",
    description:
      "성실함과 꾸준함의 대명사. 예측 가능한 안정적인 부를 축적합니다.",
    data: [
      { age: 20, salary: 0.3 },
      { age: 30, salary: 0.6 },
      { age: 40, salary: 0.9 },
      { age: 50, salary: 1.2 },
      { age: 60, salary: 1.5 },
    ],
    guide: {
      title: "공무원 월급, 정말 박봉일까?",
      link: "/guides/civil-servant-salary",
    },
  },
  {
    type: "ISFJ",
    title: "알부자 저축왕형",
    description:
      "티끌 모아 태산을 이룹니다. 당신의 통장 잔고는 배신하지 않습니다.",
    data: [
      { age: 20, salary: 0.3 },
      { age: 30, salary: 0.7 },
      { age: 40, salary: 1.2 },
      { age: 50, salary: 2.0 },
      { age: 60, salary: 3.0 },
    ],
    guide: {
      title: "첫 월급 100만원 재테크",
      link: "/guides/first-job-investment",
    },
  },
  {
    type: "INTJ",
    title: "냉철한 투자분석가형",
    description: "치밀한 분석과 데이터 기반의 투자로 높은 수익률을 기록합니다.",
    data: [
      { age: 20, salary: 0.5 },
      { age: 30, salary: 1.5 },
      { age: 40, salary: 4 },
      { age: 50, salary: 8 },
      { age: 60, salary: 15 },
    ],
    guide: {
      title: "월급으로 만드는 투자 파이프라인",
      link: "/guides/road-to-100m-part3-invest",
    },
  },
  {
    type: "INTP",
    title: "네카라쿠배 개발자형",
    description:
      "최고의 기술력으로 높은 연봉을 받습니다. 당신의 능력은 곧 돈입니다.",
    data: [
      { age: 20, salary: 0.8 },
      { age: 30, salary: 1.5 },
      { age: 40, salary: 2.5 },
      { age: 50, salary: 3 },
      { age: 60, salary: 3.5 },
    ],
    guide: {
      title: "네카라쿠배 개발자 초봉 1억, 그 진실은?",
      link: "/guides/nekarakubae-salary",
    },
  },
  {
    type: "ESTJ",
    title: "대기업 임원형",
    description: "철저한 자기관리와 추진력으로 조직의 정점에 오릅니다.",
    data: [
      { age: 20, salary: 0.5 },
      { age: 30, salary: 1.0 },
      { age: 40, salary: 2.0 },
      { age: 50, salary: 4.0 },
      { age: 60, salary: 5.0 },
    ],
    guide: { title: "성과급 세금 폭탄 피하는 법", link: "/guides/bonus-tax" },
  },
  {
    type: "ESFJ",
    title: "알뜰살뜰 주부재테크형",
    description: "꼼꼼한 가계부 관리와 정보력으로 알토란 같은 부를 일굽니다.",
    data: [
      { age: 20, salary: 0.3 },
      { age: 30, salary: 0.6 },
      { age: 40, salary: 1.0 },
      { age: 50, salary: 1.5 },
      { age: 60, salary: 2.0 },
    ],
    guide: {
      title: "디딤돌 vs 보금자리론 완벽 비교",
      link: "/guides/didimdol-vs-bogeumjari",
    },
  },
  {
    type: "ESTP",
    title: "인생은 한방! 코인 투자형",
    description:
      "하이 리스크, 하이 리턴! 인생 역전을 꿈꾸는 베팅의 귀재입니다.",
    data: [
      { age: 20, salary: 0.4 },
      { age: 28, salary: 0.2 },
      { age: 30, salary: 20 },
      { age: 40, salary: 15 },
      { age: 60, salary: 50 },
    ],
    guide: {
      title: "환율, 내 자산의 가치를 결정한다",
      link: "/guides/exchange-rate-impact",
    },
  },
  {
    type: "ESFP",
    title: "욜로(YOLO) 플렉스형",
    description: "현재의 행복이 가장 중요합니다. 돈은 쓰기 위해 버는 것!",
    data: [
      { age: 20, salary: 0.4 },
      { age: 30, salary: 0.8 },
      { age: 40, salary: 1.2 },
      { age: 50, salary: 1.0 },
      { age: 60, salary: 0.8 },
    ],
    guide: { title: "내 연봉으로 살 수 있는 드림카는?", link: "/car-loan" },
  },
  {
    type: "INFJ",
    title: "가치투자 신봉자형",
    description:
      "장기적인 안목으로 가치 있는 기업에 투자하여 꾸준한 수익을 냅니다.",
    data: [
      { age: 20, salary: 0.4 },
      { age: 30, salary: 0.9 },
      { age: 40, salary: 2.0 },
      { age: 50, salary: 4.0 },
      { age: 60, salary: 8.0 },
    ],
    guide: {
      title: "복리의 마법, 스노우볼 효과",
      link: "/guides/compound-interest",
    },
  },
  {
    type: "INFP",
    title: "사회적 기업가형",
    description:
      "돈보다는 사회적 가치를 추구하며, 선한 영향력으로 부를 창출합니다.",
    data: [
      { age: 20, salary: 0.3 },
      { age: 30, salary: 0.5 },
      { age: 40, salary: 1.0 },
      { age: 50, salary: 2.0 },
      { age: 60, salary: 3.0 },
    ],
    guide: {
      title: "N잡으로 월 100만원 더 벌기",
      link: "/guides/road-to-100m-part2-sidejob",
    },
  },
  {
    type: "ISTP",
    title: "파이어족 조기은퇴형",
    description: "빠르게 돈을 모아 조기 은퇴를 꿈꿉니다. 노동으로부터의 자유!",
    data: [
      { age: 20, salary: 0.5 },
      { age: 30, salary: 1.2 },
      { age: 40, salary: 2 },
      { age: 45, salary: 0.5 },
      { age: 60, salary: 0.5 },
    ],
    guide: { title: "내 은퇴 나이 계산해보기", link: "/fire-calculator" },
  },
  {
    type: "ISFP",
    title: "디지털 노마드형",
    description: "돈에 얽매이지 않고, 좋아하는 일을 하며 자유롭게 살아갑니다.",
    data: [
      { age: 20, salary: 0.3 },
      { age: 30, salary: 0.6 },
      { age: 40, salary: 1.0 },
      { age: 50, salary: 1.2 },
      { age: 60, salary: 1.0 },
    ],
    guide: {
      title: "N잡으로 월 100만원 더 벌기",
      link: "/guides/road-to-100m-part2-sidejob",
    },
  },
];

export function getResultType(answers: string[]): SalaryMBTIType {
  const counts = answers.reduce((acc, cur) => {
    acc[cur] = (acc[cur] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mbti =
    (counts["E"] > counts["I"] ? "E" : "I") +
    (counts["N"] > counts["S"] ? "N" : "S") +
    (counts["T"] > counts["F"] ? "T" : "F") +
    (counts["J"] > counts["P"] ? "J" : "P");

  return (
    resultTypes.find((r) => r.type === mbti) ||
    resultTypes.find((r) => r.type === "ISTJ")!
  );
}
