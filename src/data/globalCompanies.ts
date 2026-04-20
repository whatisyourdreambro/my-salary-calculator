import { CompanyProfile } from "@/types/company";

export const globalCompanies: CompanyProfile[] = [
 // 1. Google (Alphabet)
 {
 id: "google",
 name: { ko: "구글 (Google)", en: "Google" },
 industry: "Tech / Software",
 tier: "foreign",
 logo: "🌈",
 description: "전 세계 정보를 체계화하는 글로벌 검색 및 AI 리더.",
 salary: {
 entry: { base: 180000000, incentive: { target: 15, max: 30, avgAmount: 27000000 }, stock: { type: "RSU", amount: 100000000, vesting: "4 years" }, signOn: 30000000 },
 junior: { base: 220000000, incentive: { target: 15, max: 30, avgAmount: 33000000 }, stock: { type: "RSU", amount: 150000000, vesting: "4 years" } },
 senior: { base: 280000000, incentive: { target: 20, max: 40, avgAmount: 56000000 }, stock: { type: "RSU", amount: 250000000, vesting: "4 years" } },
 lead: { base: 350000000, incentive: { target: 25, max: 50, avgAmount: 87500000 }, stock: { type: "RSU", amount: 400000000, vesting: "4 years" } },
 executive: { base: 500000000, incentive: { target: 50, max: 100, avgAmount: 250000000 }, stock: { type: "RSU", amount: 1000000000, vesting: "4 years" } },
 },
 workLife: {
 weeklyHours: { contract: 40, real: 40 },
 vacation: { days: 25, usageRate: 100 },
 remoteWork: { policy: "hybrid", description: "주 3일 출근 권장" },
 },
 benefits: [
 { category: "lifestyle", title: "Gourmet Food", description: "세계 최고 수준의 사내 식당 무료", value: 10000000 },
 { category: "health", title: "마사지/헬스", description: "사내 마사지 및 짐 무료 이용", value: 2000000 },
 { category: "financial", title: "401k Match", description: "은퇴 연금 매칭 (최대 50% ~ 100%)", value: 15000000 },
 ],
 culture: {
 score: 9.2,
 keywords: ["혁신", "데이터", "심리적안전감"],
 pros: ["업계 최고의 대우와 복지", "똑똑한 동료들", "심리적 안전감이 보장되는 문화"],
 cons: ["대기업병 (느린 의사결정)", "승진 경쟁 치열", "잦은 리오가니제이션"],
 },
 lastUpdated: "2025-11-23",
 },
 // 2. Apple
 {
 id: "apple",
 name: { ko: "애플 (Apple)", en: "Apple" },
 industry: "Consumer Electronics",
 tier: "foreign",
 logo: "🍎",
 description: "Think Different. 기술과 인문학의 교차점에 서 있는 기업.",
 salary: {
 entry: { base: 170000000, incentive: { target: 10, max: 20, avgAmount: 17000000 }, stock: { type: "RSU", amount: 80000000, vesting: "4 years" }, signOn: 20000000 },
 junior: { base: 210000000, incentive: { target: 15, max: 30, avgAmount: 31500000 }, stock: { type: "RSU", amount: 120000000, vesting: "4 years" } },
 senior: { base: 270000000, incentive: { target: 20, max: 40, avgAmount: 54000000 }, stock: { type: "RSU", amount: 200000000, vesting: "4 years" } },
 lead: { base: 330000000, incentive: { target: 25, max: 50, avgAmount: 82500000 }, stock: { type: "RSU", amount: 350000000, vesting: "4 years" } },
 executive: { base: 480000000, incentive: { target: 50, max: 100, avgAmount: 240000000 }, stock: { type: "RSU", amount: 800000000, vesting: "4 years" } },
 },
 workLife: {
 weeklyHours: { contract: 40, real: 45 },
 vacation: { days: 20, usageRate: 90 },
 remoteWork: { policy: "office", description: "오피스 중심 문화 (엄격함)" },
 },
 benefits: [
 { category: "lifestyle", title: "제품 할인", description: "Apple 제품 25% 할인", value: 3000000 },
 { category: "health", title: "최고급 의료보험", description: "가족 포함 100% 커버리지", value: 10000000 },
 ],
 culture: {
 score: 8.8,
 keywords: ["비밀주의", "완벽주의", "디테일"],
 pros: ["세상을 바꾸는 제품을 만든다는 자부심", "최고의 인재 밀도", "높은 보상"],
 cons: ["극도의 비밀주의", "사내 정치", "높은 업무 강도"],
 },
 lastUpdated: "2025-11-23",
 },
 // 3. Meta (Facebook)
 {
 id: "meta",
 name: { ko: "메타 (Meta)", en: "Meta" },
 industry: "Social Media / VR",
 tier: "foreign",
 logo: "♾️",
 description: "사람들을 연결하고 커뮤니티를 만드는 소셜 테크놀로지 기업.",
 salary: {
 entry: { base: 190000000, incentive: { target: 15, max: 30, avgAmount: 28500000 }, stock: { type: "RSU", amount: 120000000, vesting: "4 years" }, signOn: 50000000 },
 junior: { base: 230000000, incentive: { target: 15, max: 30, avgAmount: 34500000 }, stock: { type: "RSU", amount: 180000000, vesting: "4 years" } },
 senior: { base: 300000000, incentive: { target: 20, max: 40, avgAmount: 60000000 }, stock: { type: "RSU", amount: 300000000, vesting: "4 years" } },
 lead: { base: 380000000, incentive: { target: 25, max: 50, avgAmount: 95000000 }, stock: { type: "RSU", amount: 500000000, vesting: "4 years" } },
 executive: { base: 550000000, incentive: { target: 50, max: 100, avgAmount: 275000000 }, stock: { type: "RSU", amount: 1200000000, vesting: "4 years" } },
 },
 workLife: {
 weeklyHours: { contract: 40, real: 42 },
 vacation: { days: 25, usageRate: 95 },
 remoteWork: { policy: "hybrid", description: "유연한 근무 환경" },
 },
 benefits: [
 { category: "lifestyle", title: "All Meals Free", description: "아침, 점심, 저녁 무료 제공", value: 10000000 },
 { category: "family", title: "육아 휴직", description: "남녀 모두 4개월 유급 휴가", value: 20000000 },
 ],
 culture: {
 score: 8.5,
 keywords: ["빠른실행", "임팩트", "해커톤"],
 pros: ["Move Fast 문화", "높은 보상과 사이닝 보너스", "젊고 에너제틱한 분위기"],
 cons: ["잦은 퍼포먼스 리뷰(PSC) 압박", "워라밸이 깨지기 쉬움"],
 },
 lastUpdated: "2025-11-23",
 },
 // 4. Netflix
 {
 id: "netflix",
 name: { ko: "넷플릭스 (Netflix)", en: "Netflix" },
 industry: "Entertainment / Streaming",
 tier: "foreign",
 logo: "🍿",
 description: "전 세계를 즐겁게 하는 글로벌 스트리밍 엔터테인먼트 서비스.",
 salary: {
 // Netflix pays "Top of Market" all cash usually, but we simulate structure for comparison
 entry: { base: 350000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "Option", amount: 0, vesting: "0 years" }, signOn: 0 },
 junior: { base: 450000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "Option", amount: 0, vesting: "0 years" } },
 senior: { base: 650000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "Option", amount: 0, vesting: "0 years" } },
 lead: { base: 900000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "Option", amount: 0, vesting: "0 years" } },
 executive: { base: 1500000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "Option", amount: 0, vesting: "0 years" } },
 },
 workLife: {
 weeklyHours: { contract: 40, real: 45 },
 vacation: { days: 999, usageRate: 50 }, // Unlimited
 remoteWork: { policy: "hybrid", description: "자율과 책임" },
 },
 benefits: [
 { category: "financial", title: "All Cash Pay", description: "업계 최고 수준의 현금 연봉", value: 50000000 },
 { category: "lifestyle", title: "무제한 휴가", description: "원하는 만큼 쉬는 '자율과 책임'", value: 0 },
 ],
 culture: {
 score: 8.0,
 keywords: ["자율과책임", "솔직함", "퍼포먼스"],
 pros: ["업계 압도적 1위 연봉 (All Cash)", "최고의 동료들", "규칙 없는 규칙"],
 cons: ["Keeper Test (성과 못내면 해고)", "극도의 솔직함이 주는 스트레스"],
 },
 lastUpdated: "2025-11-23",
 },
 // 5. NVIDIA
 {
 id: "nvidia",
 name: { ko: "엔비디아 (NVIDIA)", en: "NVIDIA" },
 industry: "Semiconductor / AI",
 tier: "foreign",
 logo: "🟩",
 description: "AI 컴퓨팅의 엔진. GPU를 통해 세상을 인지하고 이해하는 방식을 변화시킵니다.",
 salary: {
 entry: { base: 180000000, incentive: { target: 10, max: 20, avgAmount: 18000000 }, stock: { type: "RSU", amount: 150000000, vesting: "4 years" }, signOn: 20000000 },
 junior: { base: 220000000, incentive: { target: 10, max: 20, avgAmount: 22000000 }, stock: { type: "RSU", amount: 250000000, vesting: "4 years" } },
 senior: { base: 280000000, incentive: { target: 15, max: 30, avgAmount: 42000000 }, stock: { type: "RSU", amount: 500000000, vesting: "4 years" } }, // Stock exploded
 lead: { base: 350000000, incentive: { target: 20, max: 40, avgAmount: 70000000 }, stock: { type: "RSU", amount: 800000000, vesting: "4 years" } },
 executive: { base: 500000000, incentive: { target: 30, max: 60, avgAmount: 150000000 }, stock: { type: "RSU", amount: 2000000000, vesting: "4 years" } },
 },
 workLife: {
 weeklyHours: { contract: 40, real: 50 },
 vacation: { days: 20, usageRate: 85 },
 remoteWork: { policy: "hybrid", description: "프로젝트 중심 근무" },
 },
 benefits: [
 { category: "financial", title: "ESPP", description: "자사주 매입 프로그램 (15% 할인)", value: 20000000 },
 { category: "health", title: "가족 의료 지원", description: "포괄적 의료 혜택", value: 5000000 },
 ],
 culture: {
 score: 9.5,
 keywords: ["AI리더", "주가폭등", "엔지니어링"],
 pros: ["폭발적인 주가 상승으로 인한 보상", "AI 시대를 이끈다는 자부심", "젠슨 황의 리더십"],
 cons: ["높은 업무 강도", "빠르게 변하는 기술 트렌드"],
 },
 lastUpdated: "2025-11-23",
 },
 // 6. Microsoft
 {
 id: "microsoft",
 name: { ko: "마이크로소프트 (Microsoft)", en: "Microsoft" },
 industry: "Tech / Software",
 tier: "foreign",
 logo: "🪟",
 description: "지구상의 모든 사람과 조직이 더 많은 것을 성취할 수 있도록 돕습니다.",
 salary: {
 entry: { base: 160000000, incentive: { target: 10, max: 20, avgAmount: 16000000 }, stock: { type: "RSU", amount: 60000000, vesting: "4 years" }, signOn: 20000000 },
 junior: { base: 190000000, incentive: { target: 15, max: 30, avgAmount: 28500000 }, stock: { type: "RSU", amount: 100000000, vesting: "4 years" } },
 senior: { base: 240000000, incentive: { target: 20, max: 40, avgAmount: 48000000 }, stock: { type: "RSU", amount: 180000000, vesting: "4 years" } },
 lead: { base: 300000000, incentive: { target: 25, max: 50, avgAmount: 75000000 }, stock: { type: "RSU", amount: 300000000, vesting: "4 years" } },
 executive: { base: 450000000, incentive: { target: 40, max: 80, avgAmount: 180000000 }, stock: { type: "RSU", amount: 700000000, vesting: "4 years" } },
 },
 workLife: {
 weeklyHours: { contract: 40, real: 40 },
 vacation: { days: 25, usageRate: 95 },
 remoteWork: { policy: "hybrid", description: "유연한 하이브리드" },
 },
 benefits: [
 { category: "lifestyle", title: "웰빙 지원금", description: "연 150만원 상당", value: 1500000 },
 { category: "growth", title: "교육비 지원", description: "무제한 도서/교육비", value: 3000000 },
 ],
 culture: {
 score: 9.0,
 keywords: ["워라밸", "성장", "포용성"],
 pros: ["업계 최고의 워라밸", "안정적인 성장", "다양성과 포용성 존중"],
 cons: ["다소 보수적인 분위기", "복잡한 내부 프로세스"],
 },
 lastUpdated: "2025-11-23",
 },
 // 7. Tesla
 {
 id: "tesla",
 name: { ko: "테슬라 (Tesla)", en: "Tesla" },
 industry: "Automotive / Energy",
 tier: "foreign",
 logo: "⚡",
 description: "지속 가능한 에너지로의 전 세계적 전환을 가속화합니다.",
 salary: {
 entry: { base: 140000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "RSU", amount: 100000000, vesting: "4 years" }, signOn: 10000000 },
 junior: { base: 170000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "RSU", amount: 150000000, vesting: "4 years" } },
 senior: { base: 220000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "RSU", amount: 300000000, vesting: "4 years" } },
 lead: { base: 280000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "RSU", amount: 500000000, vesting: "4 years" } },
 executive: { base: 400000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "RSU", amount: 1500000000, vesting: "4 years" } },
 },
 workLife: {
 weeklyHours: { contract: 40, real: 60 },
 vacation: { days: 15, usageRate: 50 },
 remoteWork: { policy: "office", description: "전원 출근 필수 (Hardcore)" },
 },
 benefits: [
 { category: "lifestyle", title: "FSD 할인", description: "자율주행 옵션 할인", value: 5000000 },
 { category: "financial", title: "ESPP", description: "자사주 할인 매입", value: 10000000 },
 ],
 culture: {
 score: 7.5,
 keywords: ["하드코어", "미션", "일론머스크"],
 pros: ["인류를 구한다는 미션", "천재들과 일하는 경험", "스톡옵션 대박 기회"],
 cons: ["살인적인 업무 강도", "일론 머스크의 변덕", "워라밸 없음"],
 },
 lastUpdated: "2025-11-23",
 },
 // 8. Amazon
 {
 id: "amazon",
 name: { ko: "아마존 (Amazon)", en: "Amazon" },
 industry: "E-commerce / Cloud",
 tier: "foreign",
 logo: "📦",
 description: "지구상에서 가장 고객 중심적인 기업.",
 salary: {
 entry: { base: 160000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "RSU", amount: 80000000, vesting: "5-15-40-40" }, signOn: 50000000 }, // Back-loaded vesting
 junior: { base: 200000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "RSU", amount: 120000000, vesting: "5-15-40-40" } },
 senior: { base: 250000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "RSU", amount: 200000000, vesting: "5-15-40-40" } },
 lead: { base: 300000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "RSU", amount: 350000000, vesting: "5-15-40-40" } },
 executive: { base: 450000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "RSU", amount: 800000000, vesting: "5-15-40-40" } },
 },
 workLife: {
 weeklyHours: { contract: 40, real: 50 },
 vacation: { days: 15, usageRate: 80 },
 remoteWork: { policy: "office", description: "주 5일 출근 원칙" },
 },
 benefits: [
 { category: "financial", title: "Sign-on Bonus", description: "입사 1-2년차 현금 보너스 집중", value: 50000000 },
 { category: "lifestyle", title: "Prime Membership", description: "프라임 멤버십 지원", value: 150000 },
 ],
 culture: {
 score: 7.8,
 keywords: ["Frugality", "Day1", "PIP"],
 pros: ["엄청난 성장 기회", "AWS라는 강력한 캐시카우", "철저한 리더십 원칙"],
 cons: ["PIP(성과부진자 관리) 공포", "짠물 복지 (Frugality)", "백로딩 베스팅"],
 },
 lastUpdated: "2025-11-23",
 },
];
