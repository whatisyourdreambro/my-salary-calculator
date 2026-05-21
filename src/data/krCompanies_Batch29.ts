import { CompanyProfile } from "@/types/company";

// Batch29: GSC 노출 키워드 기반 누락 회사 보충 (2026-05).
// 정유·담배인삼·H&B 유통·반도체 소재·조선 지주 등 검색 트래픽
// 잠재력이 있으나 데이터가 비어 있던 회사 5개를 추가.
export const krCompanies_Batch29: CompanyProfile[] = [
  {
    id: "sk-energy",
    name: { ko: "SK에너지", en: "SK Energy" },
    industry: "Oil & Refining",
    tier: "conglomerate",
    logo: "⛽",
    description:
      "SK이노베이션의 정유·석유제품 사업 자회사. 국내 1위 정유사로 울산 콤플렉스 운영, 휘발유·경유·항공유 등 석유제품 생산·유통.",
    salary: {
      entry: { base: 56000000, incentive: { target: 22, max: 45, avgAmount: 16000000 } },
      junior: { base: 70000000, incentive: { target: 22, max: 45, avgAmount: 20000000 } },
      senior: { base: 100000000, incentive: { target: 28, max: 55, avgAmount: 32000000 } },
      lead: { base: 128000000, incentive: { target: 32, max: 62, avgAmount: 45000000 } },
      executive: { base: 235000000, incentive: { target: 40, max: 80, avgAmount: 100000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 47 },
      vacation: { days: 21, usageRate: 78 },
      remoteWork: { policy: "office", description: "현장 운영 특성상 대부분 사무실 근무" },
    },
    benefits: [
      { category: "financial", title: "성과급 PS", description: "정유 마진 연동 성과급", value: 12000000 },
      { category: "lifestyle", title: "주유 할인", description: "전국 SK주유소 임직원 할인" },
      { category: "family", title: "사택·기숙사", description: "울산 콤플렉스 근무자 사택 지원" },
    ],
    culture: {
      score: 7.6,
      keywords: ["정유1위", "SK그룹", "공장교대"],
      pros: ["국내 1위 정유사 안정성", "SK 그룹 복지·성과급", "정유 호황기 성과급 폭발적"],
      cons: ["울산 근무 비중 높음", "정유 시황 변동성", "현장직 교대 근무"],
    },
    lastUpdated: "2026-05-22",
  },
  {
    id: "ktng",
    name: { ko: "KT&G", en: "KT&G" },
    industry: "Tobacco & Ginseng",
    tier: "conglomerate",
    logo: "🚬",
    description:
      "구 한국담배인삼공사. 국내 담배 시장 점유율 60% 이상, 정관장(홍삼) 1위. 코스피200 종목으로 배당 우량주.",
    salary: {
      entry: { base: 58000000, incentive: { target: 25, max: 50, avgAmount: 18000000 } },
      junior: { base: 73000000, incentive: { target: 25, max: 50, avgAmount: 22000000 } },
      senior: { base: 110000000, incentive: { target: 30, max: 60, avgAmount: 38000000 } },
      lead: { base: 140000000, incentive: { target: 35, max: 65, avgAmount: 52000000 } },
      executive: { base: 250000000, incentive: { target: 40, max: 75, avgAmount: 110000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 44 },
      vacation: { days: 22, usageRate: 86 },
      remoteWork: { policy: "hybrid", daysPerWeek: 4, description: "주 1일 재택 가능" },
    },
    benefits: [
      { category: "financial", title: "성과급 PS", description: "연 600~1500만원 수준", value: 10000000 },
      { category: "financial", title: "우리사주", description: "임직원 우선 배정·배당 안정" },
      { category: "family", title: "자녀 학자금", description: "대학까지 전액 지원", value: 15000000 },
      { category: "health", title: "사내 헬스장·검진", description: "본사 헬스장·종합검진" },
    ],
    culture: {
      score: 8.1,
      keywords: ["담배1위", "정관장", "공기업출신", "우량주"],
      pros: ["담배·홍삼 독과점 안정성", "복지 최상위권 (학자금·우리사주)", "워라밸 양호"],
      cons: ["보수적 조직 문화", "성장 정체 우려", "흡연율 감소 트렌드 리스크"],
    },
    lastUpdated: "2026-05-22",
  },
  {
    id: "olive-young",
    name: { ko: "올리브영", en: "Olive Young" },
    industry: "H&B Retail",
    tier: "conglomerate",
    logo: "💄",
    description:
      "CJ 계열 H&B 스토어 1위. 전국 1,300개 매장 + 온라인몰. 화장품·건강기능식품 유통 점유율 압도적.",
    salary: {
      entry: { base: 42000000, incentive: { target: 15, max: 30, avgAmount: 7000000 } },
      junior: { base: 53000000, incentive: { target: 15, max: 30, avgAmount: 9000000 } },
      senior: { base: 78000000, incentive: { target: 20, max: 40, avgAmount: 18000000 } },
      lead: { base: 100000000, incentive: { target: 25, max: 50, avgAmount: 27000000 } },
      executive: { base: 180000000, incentive: { target: 32, max: 65, avgAmount: 65000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 46 },
      vacation: { days: 18, usageRate: 75 },
      remoteWork: { policy: "office", description: "본사 사무직 외 매장직은 현장 근무" },
    },
    benefits: [
      { category: "lifestyle", title: "올리브영 임직원 할인", description: "전 품목 할인 + 포인트", value: 1200000 },
      { category: "financial", title: "CJ 계열 복지포인트", description: "연 100만원 복지포인트", value: 1000000 },
      { category: "growth", title: "어학·교육 지원", description: "전 직급 어학·자기계발 지원" },
    ],
    culture: {
      score: 7.4,
      keywords: ["H&B1위", "CJ계열", "유통혁신"],
      pros: ["H&B 카테고리 압도적 점유율", "CJ 계열 복지", "이커머스 전환 빠름"],
      cons: ["유통업 특성상 매장 운영 부담", "본사 채용 규모 제한적"],
    },
    lastUpdated: "2026-05-22",
  },
  {
    id: "sk-siltron",
    name: { ko: "SK실트론", en: "SK Siltron" },
    industry: "Semiconductor Materials",
    tier: "conglomerate",
    logo: "💿",
    description:
      "국내 유일 반도체 웨이퍼 제조사. SK 계열, 세계 5위 실리콘 웨이퍼 공급사. 300mm 웨이퍼 + SiC(차세대) 동시 운영.",
    salary: {
      entry: { base: 54000000, incentive: { target: 20, max: 40, avgAmount: 13000000 } },
      junior: { base: 68000000, incentive: { target: 20, max: 40, avgAmount: 16000000 } },
      senior: { base: 96000000, incentive: { target: 25, max: 50, avgAmount: 26000000 } },
      lead: { base: 122000000, incentive: { target: 30, max: 60, avgAmount: 38000000 } },
      executive: { base: 220000000, incentive: { target: 38, max: 75, avgAmount: 90000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 48 },
      vacation: { days: 18, usageRate: 72 },
      remoteWork: { policy: "office", description: "구미·청주 공장 근무 비중 높음" },
    },
    benefits: [
      { category: "financial", title: "성과급 PS·PI", description: "반도체 사이클 연동", value: 11000000 },
      { category: "family", title: "사택·기숙사", description: "구미·청주 근무자 사택 제공" },
      { category: "growth", title: "기술 교육·해외 연수", description: "엔지니어 해외 기술 교육 지원" },
    ],
    culture: {
      score: 7.5,
      keywords: ["반도체웨이퍼", "SK계열", "차세대SiC"],
      pros: ["국내 유일 웨이퍼 제조 기술력", "SK 그룹 안정성", "반도체 호황기 성과급"],
      cons: ["지방 공장 근무", "반도체 시황 변동성", "교대 근무 비중"],
    },
    lastUpdated: "2026-05-22",
  },
  {
    id: "hd-korea-shipbuilding",
    name: { ko: "HD한국조선해양", en: "HD Korea Shipbuilding & Offshore Engineering" },
    industry: "Shipbuilding",
    tier: "conglomerate",
    logo: "🚢",
    description:
      "HD현대 조선 부문 중간 지주사. HD현대중공업·HD현대미포·HD현대삼호중공업을 자회사로 보유. 세계 1위 조선 그룹 본부.",
    salary: {
      entry: { base: 55000000, incentive: { target: 22, max: 45, avgAmount: 15000000 } },
      junior: { base: 70000000, incentive: { target: 22, max: 45, avgAmount: 19000000 } },
      senior: { base: 102000000, incentive: { target: 28, max: 55, avgAmount: 32000000 } },
      lead: { base: 130000000, incentive: { target: 32, max: 62, avgAmount: 45000000 } },
      executive: { base: 240000000, incentive: { target: 40, max: 78, avgAmount: 105000000 } },
    },
    workLife: {
      weeklyHours: { contract: 40, real: 49 },
      vacation: { days: 20, usageRate: 76 },
      remoteWork: { policy: "office", description: "조선업 특성상 대부분 현장·사무실 근무" },
    },
    benefits: [
      { category: "financial", title: "조선 호황 성과급", description: "수주 호황기 PS 큰 폭 지급", value: 15000000 },
      { category: "family", title: "사택·자녀 학자금", description: "울산 사택 + 대학 학자금 지원", value: 20000000 },
      { category: "growth", title: "해외 프로젝트 파견", description: "선주사 해외 파견 기회" },
    ],
    culture: {
      score: 7.7,
      keywords: ["조선1위", "HD현대", "지주사"],
      pros: ["세계 1위 조선 그룹", "조선 호황기 성과급 폭발적", "기술 엔지니어 전문성"],
      cons: ["조선 시황 변동성", "울산 근무 비중", "수주 압박으로 강도 높음"],
    },
    lastUpdated: "2026-05-22",
  },
];
