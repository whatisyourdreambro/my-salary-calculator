// src/lib/salaryMBTI.ts

export interface SalaryMBTIType {
 type: string;
 title: string;
 description: string;
 keywords: string[];
 dna: {
 strength: string;
 weakness: string;
 };
 icon: string; // 3D Icon identifier
 data: { age: number; salary: number }[];
 guide: {
 link: string;
 title: string;
 };
 growthPlan: {
 step: number;
 title: string;
 description: string;
 link: string;
 linkText: string;
 }[];
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
 keywords: ["#리더십", "#야망", "#성공지향"],
 dna: {
 strength: "목표 달성을 위한 강력한 추진력과 전략적 사고",
 weakness: "때로는 지나친 완벽주의가 빠른 결정을 방해할 수 있음",
 },
 icon: "👑",
 data: [
 { age: 20, salary: 0.7 },
 { age: 30, salary: 2 },
 { age: 40, salary: 5 },
 { age: 50, salary: 15 },
 { age: 60, salary: 30 },
 ],
 guide: {
 link: "/guides/road-to-100m-part1-tax",
 title: "절세 전략 가이드 보기",
 },
 growthPlan: [
 {
 step: 1,
 title: "절세 전략 수립",
 description:
 "높은 소득만큼 세금 관리도 중요합니다. 연금저축/IRP를 활용해 절세의 기초를 다지세요.",
 link: "/guides/road-to-100m-part1-tax",
 linkText: "절세 전략 가이드 보기",
 },
 {
 step: 2,
 title: "투자 포트폴리오 다각화",
 description:
 "부동산, 주식을 넘어 다양한 자산에 분산 투자하여 안정성을 높이세요.",
 link: "/guides/road-to-100m-part3-invest",
 linkText: "투자 파이프라인 구축하기",
 },
 {
 step: 3,
 title: "미래 연봉 예측",
 description:
 "당신의 커리어 로드맵을 시뮬레이션하고 다음 목표를 설정하세요.",
 link: "/?tab=future",
 linkText: "미래 연봉 계산하기",
 },
 ],
 },
 {
 type: "ENTP",
 title: "유튜버 대박형",
 description: "타고난 끼와 재능으로 일확천금을 노립니다. 인생은 한 방!",
 keywords: ["#아이디어", "#임기응변", "#도전"],
 dna: {
 strength: "새로운 기회를 포착하는 뛰어난 직관력과 창의력",
 weakness: "지루함을 쉽게 느껴 꾸준한 자산 관리에 어려움을 겪을 수 있음",
 },
 icon: "🚀",
 data: [
 { age: 20, salary: 0.2 },
 { age: 30, salary: 0.5 },
 { age: 35, salary: 10 },
 { age: 40, salary: 8 },
 { age: 60, salary: 5 },
 ],
 guide: {
 link: "/guides/road-to-100m-part2-sidejob",
 title: "N잡으로 월 100만원 벌기",
 },
 growthPlan: [
 {
 step: 1,
 title: "N잡으로 현금흐름 만들기",
 description:
 "당신의 다양한 재능을 활용해 여러 개의 수입 파이프라인을 구축해보세요.",
 link: "/guides/road-to-100m-part2-sidejob",
 linkText: "N잡으로 월 100만원 벌기",
 },
 {
 step: 2,
 title: "환율의 원리 이해하기",
 description:
 "변동성은 위기이자 기회입니다. 환율의 원리를 이해하고 새로운 투자 기회를 포착하세요.",
 link: "/guides/exchange-rate-impact",
 linkText: "환율 가이드 보기",
 },
 {
 step: 3,
 title: "행운의 번호 테스트",
 description:
 "당신의 직감을 믿는다면, 작은 행운을 시험해보는 것은 어떨까요?",
 link: "/lotto",
 linkText: "로또 번호 생성하기",
 },
 ],
 },
 {
 type: "ENFJ",
 title: "인맥왕 사업가형",
 description: "넓은 인맥과 뛰어난 공감 능력으로 성공적인 사업을 일궈냅니다.",
 keywords: ["#네트워킹", "#공감능력", "#리더십"],
 dna: {
 strength: "사람의 마음을 움직여 함께 목표를 이루는 능력",
 weakness: "거절을 잘 못해 재정적 손실을 볼 위험이 있음",
 },
 icon: "🤝",
 data: [
 { age: 20, salary: 0.4 },
 { age: 30, salary: 1.5 },
 { age: 40, salary: 4 },
 { age: 50, salary: 10 },
 { age: 60, salary: 20 },
 ],
 guide: {
 link: "/guides/salary-negotiation",
 title: "연봉 협상 전략 가이드",
 },
 growthPlan: [
 {
 step: 1,
 title: "연봉 협상의 달인 되기",
 description:
 "뛰어난 공감 능력을 활용해 당신의 가치를 설득력 있게 전달하는 법을 배우세요.",
 link: "/guides/salary-negotiation",
 linkText: "연봉 협상 전략 가이드",
 },
 {
 step: 2,
 title: "커리어 성장 계획",
 description:
 "당신의 리더십을 발휘할 수 있는 다음 커리어 목표를 설정하고 계획을 세워보세요.",
 link: "/?tab=future",
 linkText: "미래 연봉 계산하기",
 },
 {
 step: 3,
 title: "가치 투자 알아보기",
 description:
 "사람을 보듯, 장기적인 안목으로 가치 있는 기업에 투자하는 법을 배워보세요.",
 link: "/guides/compound-interest",
 linkText: "복리의 마법 알아보기",
 },
 ],
 },
 {
 type: "ENFP",
 title: "자유로운 영혼의 N잡러형",
 description:
 "다양한 분야에 도전하며 즐겁게 돈을 법니다. 수익보단 재미가 우선!",
 keywords: ["#열정", "#자유", "#긍정"],
 dna: {
 strength: "새로운 도전에 대한 두려움이 없고 긍정적인 에너지 보유",
 weakness: "재미없는 재무 계획과 관리에 쉽게 지루함을 느낌",
 },
 icon: "🎨",
 data: [
 { age: 20, salary: 0.3 },
 { age: 30, salary: 0.7 },
 { age: 40, salary: 1.5 },
 { age: 50, salary: 2.5 },
 { age: 60, salary: 4 },
 ],
 guide: {
 link: "/guides/road-to-100m-part2-sidejob",
 title: "N잡 가이드 보기",
 },
 growthPlan: [
 {
 step: 1,
 title: "N잡으로 월 100만원 벌기",
 description:
 "당신의 넘치는 열정과 아이디어를 추가 수입으로 연결해보세요.",
 link: "/guides/road-to-100m-part2-sidejob",
 linkText: "N잡 가이드 보기",
 },
 {
 step: 2,
 title: "디지털 노마드 라이프",
 description: "돈에 얽매이지 않고 자유롭게 사는 삶, 어떻게 가능할까요?",
 link: "/guides/first-job-investment",
 linkText: "첫 월급 재테크 알아보기",
 },
 {
 step: 3,
 title: "나만의 드림카 찾기",
 description:
 "현재의 행복이 중요하다면, 당신의 가슴을 뛰게 할 드림카를 찾아보세요.",
 link: "/car-loan",
 linkText: "자동차 구매 계산기",
 },
 ],
 },
 {
 type: "ISTJ",
 title: "공무원 안정형",
 description:
 "성실함과 꾸준함의 대명사. 예측 가능한 안정적인 부를 축적합니다.",
 keywords: ["#성실", "#안정", "#원칙주의"],
 dna: {
 strength: "계획적이고 꾸준한 저축으로 리스크를 최소화함",
 weakness: "새로운 투자 기회에 대한 변화를 두려워할 수 있음",
 },
 icon: "🏛️",
 data: [
 { age: 20, salary: 0.3 },
 { age: 30, salary: 0.6 },
 { age: 40, salary: 0.9 },
 { age: 50, salary: 1.2 },
 { age: 60, salary: 1.5 },
 ],
 guide: {
 link: "/guides/civil-servant-salary",
 title: "공무원 월급 가이드",
 },
 growthPlan: [
 {
 step: 1,
 title: "공무원 월급 파헤치기",
 description:
 "기본급 외에 숨겨진 각종 수당을 파악하여 당신의 진짜 소득을 알아보세요.",
 link: "/guides/civil-servant-salary",
 linkText: "공무원 월급 가이드",
 },
 {
 step: 2,
 title: "장기 투자 계획 수립",
 description:
 "안정성을 바탕으로 S&P 500 ETF 등 우량 자산에 장기 투자하여 자산을 불려나가세요.",
 link: "/guides/road-to-100m-part3-invest",
 linkText: "장기 투자 계획하기",
 },
 {
 step: 3,
 title: "내 집 마련 시뮬레이션",
 description:
 "안정적인 소득을 바탕으로 내 집 마련 계획을 구체화해보세요.",
 link: "/home-loan",
 linkText: "주택담보대출 계산하기",
 },
 ],
 },
 {
 type: "ISFJ",
 title: "알부자 저축왕형",
 description:
 "티끌 모아 태산을 이룹니다. 당신의 통장 잔고는 배신하지 않습니다.",
 keywords: ["#절약", "#꾸준함", "#안전제일"],
 dna: {
 strength: "강력한 절약 정신과 꾸준함으로 종잣돈을 모으는 능력",
 weakness: "투자에 대한 막연한 두려움으로 돈을 불릴 기회를 놓칠 수 있음",
 },
 icon: "💰",
 data: [
 { age: 20, salary: 0.3 },
 { age: 30, salary: 0.7 },
 { age: 40, salary: 1.2 },
 { age: 50, salary: 2.0 },
 { age: 60, salary: 3.0 },
 ],
 guide: {
 link: "/guides/first-job-investment",
 title: "첫 월급 재테크 가이드",
 },
 growthPlan: [
 {
 step: 1,
 title: "첫 월급 100만원 재테크",
 description:
 "저축만으로는 부족합니다. 당신의 첫 종잣돈을 안전하게 굴리는 법을 배우세요.",
 link: "/guides/first-job-investment",
 linkText: "첫 월급 재테크 가이드",
 },
 {
 step: 2,
 title: "복리의 마법 이해하기",
 description:
 "시간을 내 편으로 만드는 가장 확실한 방법, 복리의 원리를 이해하세요.",
 link: "/guides/compound-interest",
 linkText: "복리의 마법 알아보기",
 },
 {
 step: 3,
 title: "디딤돌 vs 보금자리론",
 description:
 "알뜰하게 모은 돈으로 내 집 마련의 꿈을 이뤄보세요. 정부 지원 대출을 활용하세요.",
 link: "/guides/didimdol-vs-bogeumjari",
 linkText: "정책 대출 비교하기",
 },
 ],
 },
 {
 type: "INTJ",
 title: "냉철한 투자분석가형",
 description: "치밀한 분석과 데이터 기반의 투자로 높은 수익률을 기록합니다.",
 keywords: ["#전략", "#분석", "#독립성"],
 dna: {
 strength: "감정에 휘둘리지 않는 냉철한 판단력과 데이터 분석 능력",
 weakness: "지나친 분석으로 적절한 투자 타이밍을 놓칠 수 있음",
 },
 icon: "📈",
 data: [
 { age: 20, salary: 0.5 },
 { age: 30, salary: 1.5 },
 { age: 40, salary: 4 },
 { age: 50, salary: 8 },
 { age: 60, salary: 15 },
 ],
 guide: {
 link: "/guides/road-to-100m-part3-invest",
 title: "투자 파이프라인 구축 가이드",
 },
 growthPlan: [
 {
 step: 1,
 title: "월급으로 투자 파이프라인 만들기",
 description:
 "당신의 분석력을 바탕으로 체계적인 투자 시스템을 구축하세요.",
 link: "/guides/road-to-100m-part3-invest",
 linkText: "투자 파이프라인 구축 가이드",
 },
 {
 step: 2,
 title: "복리의 마법 활용하기",
 description:
 "장기적인 관점에서 당신의 자산이 눈덩이처럼 불어나는 원리를 활용하세요.",
 link: "/guides/compound-interest",
 linkText: "복리의 마법 알아보기",
 },
 {
 step: 3,
 title: "경제적 자유 계산하기",
 description:
 "당신의 최종 목표인 경제적 자유 달성 시점을 구체적으로 계산하고 계획하세요.",
 link: "/fire-calculator",
 linkText: "FIRE 계산기",
 },
 ],
 },
 {
 type: "INTP",
 title: "네카라쿠배 개발자형",
 description:
 "최고의 기술력으로 높은 연봉을 받습니다. 당신의 능력은 곧 돈입니다.",
 keywords: ["#논리", "#분석", "#기술덕후"],
 dna: {
 strength: "복잡한 문제를 해결하는 뛰어난 지적 능력",
 weakness: "반복적인 재무 관리에 흥미를 잃기 쉬움",
 },
 icon: "💻",
 data: [
 { age: 20, salary: 0.8 },
 { age: 30, salary: 1.5 },
 { age: 40, salary: 2.5 },
 { age: 50, salary: 3 },
 { age: 60, salary: 3.5 },
 ],
 guide: {
 link: "/guides/nekarakubae-salary",
 title: "네카라쿠배 연봉 가이드",
 },
 growthPlan: [
 {
 step: 1,
 title: "네카라쿠배 연봉 파헤치기",
 description:
 "업계 최고 수준의 보상 구조를 이해하고 당신의 가치를 객관적으로 파악하세요.",
 link: "/guides/nekarakubae-salary",
 linkText: "네카라쿠배 연봉 가이드",
 },
 {
 step: 2,
 title: "연봉 협상 기술 연마",
 description:
 "당신의 높은 가치를 연봉으로 증명하세요. 논리적인 협상 전략이 필요합니다.",
 link: "/guides/salary-negotiation",
 linkText: "연봉 협상 전략 가이드",
 },
 {
 step: 3,
 title: "자산 자동화 시스템 구축",
 description: "높은 소득을 자동으로 투자하여 복리의 마법을 누리세요.",
 link: "/guides/road-to-100m-part3-invest",
 linkText: "투자 자동화 시스템 만들기",
 },
 ],
 },
 {
 type: "ESTJ",
 title: "대기업 임원형",
 description: "철저한 자기관리와 추진력으로 조직의 정점에 오릅니다.",
 keywords: ["#체계", "#관리", "#추진력"],
 dna: {
 strength: "조직의 목표를 달성하고 성과를 만들어내는 탁월한 관리 능력",
 weakness: "안정성을 지나치게 추구하여 새로운 금융 트렌드를 놓칠 수 있음",
 },
 icon: "🏢",
 data: [
 { age: 20, salary: 0.5 },
 { age: 30, salary: 1.0 },
 { age: 40, salary: 2.0 },
 { age: 50, salary: 4.0 },
 { age: 60, salary: 5.0 },
 ],
 guide: {
 link: "/guides/bonus-tax",
 title: "성과급 세금 가이드 보기",
 },
 growthPlan: [
 {
 step: 1,
 title: "성과급 세금 관리",
 description:
 "높은 성과급을 받는 만큼, 세금 관리를 통해 실수령액을 극대화해야 합니다.",
 link: "/guides/bonus-tax",
 linkText: "성과급 세금 가이드 보기",
 },
 {
 step: 2,
 title: "삼성 vs 하이닉스 연봉 비교",
 description:
 "업계 최고 기업들의 보상 체계를 분석하고 당신의 위치를 점검하세요.",
 link: "/guides/samsung-vs-hynix",
 linkText: "대기업 연봉 비교 가이드",
 },
 {
 step: 3,
 title: "퇴직금 세금 설계",
 description:
 "오랜 근속의 결실인 퇴직금을 세금으로부터 지키는 전략을 미리 세우세요.",
 link: "/guides/severance-tax",
 linkText: "퇴직금 세금 가이드 보기",
 },
 ],
 },
 {
 type: "ESFJ",
 title: "알뜰살뜰 주부재테크형",
 description: "꼼꼼한 가계부 관리와 정보력으로 알토란 같은 부를 일굽니다.",
 keywords: ["#꼼꼼함", "#정보력", "#커뮤니티"],
 dna: {
 strength: "다양한 정보를 활용하여 생활 속에서 돈을 아끼고 모으는 능력",
 weakness:
 "소소한 절약에 집중하느라 큰 규모의 자산 증식 기회를 놓칠 수 있음",
 },
 icon: "🏘️",
 data: [
 { age: 20, salary: 0.3 },
 { age: 30, salary: 0.6 },
 { age: 40, salary: 1.0 },
 { age: 50, salary: 1.5 },
 { age: 60, salary: 2.0 },
 ],
 guide: {
 link: "/guides/didimdol-vs-bogeumjari",
 title: "디딤돌 vs 보금자리론",
 },
 growthPlan: [
 {
 step: 1,
 title: "내 집 마련 대출 비교",
 description:
 "꼼꼼한 정보력을 바탕으로 가장 유리한 정부 지원 대출 상품을 찾아보세요.",
 link: "/guides/didimdol-vs-bogeumjari",
 linkText: "디딤돌 vs 보금자리론",
 },
 {
 step: 2,
 title: "첫 월급 재테크",
 description:
 "절약뿐만 아니라 소액으로 투자를 시작하여 돈을 불리는 경험을 쌓아보세요.",
 link: "/guides/first-job-investment",
 linkText: "첫 월급 재테크 가이드",
 },
 {
 step: 3,
 title: "연말정산 꿀팁",
 description:
 "당신의 정보력을 활용해 놓치기 쉬운 연말정산 공제 항목을 모두 챙기세요.",
 link: "/guides/year-end-tax-settlement",
 linkText: "연말정산 가이드",
 },
 ],
 },
 {
 type: "ESTP",
 title: "인생은 한방! 코인 투자형",
 description:
 "하이 리스크, 하이 리턴! 인생 역전을 꿈꾸는 베팅의 귀재입니다.",
 keywords: ["#모험", "#베팅", "#하이리스크"],
 dna: {
 strength: "과감한 결단력과 행동력으로 단기간에 높은 수익을 노림",
 weakness: "충동적인 투자로 큰 손실을 볼 위험이 항상 존재함",
 },
 icon: "🎲",
 data: [
 { age: 20, salary: 0.4 },
 { age: 28, salary: 0.2 },
 { age: 30, salary: 20 },
 { age: 40, salary: 15 },
 { age: 60, salary: 50 },
 ],
 guide: {
 link: "/guides/exchange-rate-impact",
 title: "환율 가이드 보기",
 },
 growthPlan: [
 {
 step: 1,
 title: "환율의 원리 이해하기",
 description:
 "글로벌 자산 시장의 핵심 지표인 환율을 이해하여 리스크를 관리하세요.",
 link: "/guides/exchange-rate-impact",
 linkText: "환율 가이드 보기",
 },
 {
 step: 2,
 title: "장기 투자 포트폴리오 구축",
 description:
 "모든 자산을 '한 방'에 걸지 마세요. 안정적인 장기 투자 자산을 반드시 확보해야 합니다.",
 link: "/guides/road-to-100m-part3-invest",
 linkText: "투자 파이프라인 만들기",
 },
 {
 step: 3,
 title: "행운의 번호 테스트",
 description:
 "재미로 당신의 행운을 시험해보세요. 하지만 투자는 재미로 하는 것이 아닙니다!",
 link: "/lotto",
 linkText: "로또 번호 생성하기",
 },
 ],
 },
 {
 type: "ESFP",
 title: "욜로(YOLO) 플렉스형",
 description: "현재의 행복이 가장 중요합니다. 돈은 쓰기 위해 버는 것!",
 keywords: ["#YOLO", "#FLEX", "#현재지향"],
 dna: {
 strength: "돈을 통해 현재의 삶을 즐기고 만족도를 높이는 능력",
 weakness: "미래를 위한 재정 계획이 부족하여 노후에 어려움을 겪을 수 있음",
 },
 icon: "🛍️",
 data: [
 { age: 20, salary: 0.4 },
 { age: 30, salary: 0.8 },
 { age: 40, salary: 1.2 },
 { age: 50, salary: 1.0 },
 { age: 60, salary: 0.8 },
 ],
 guide: {
 link: "/car-loan",
 title: "자동차 구매 계산기",
 },
 growthPlan: [
 {
 step: 1,
 title: "내 연봉으로 살 수 있는 드림카",
 description:
 "현재의 만족을 추구한다면, 당신의 드림카를 현실적인 예산 안에서 찾아보세요.",
 link: "/car-loan",
 linkText: "자동차 구매 계산기",
 },
 {
 step: 2,
 title: "최소한의 안전장치, 4대보험",
 description:
 "즐기는 것도 좋지만, 최소한의 사회 안전망이 어떻게 작동하는지는 알아야 합니다.",
 link: "/guides/four-major-insurances",
 linkText: "4대 보험 가이드",
 },
 {
 step: 3,
 title: "파이어족 계산기",
 description:
 "현재를 즐기는 삶과 조기 은퇴의 삶, 둘 사이의 균형점을 찾아보세요.",
 link: "/fire-calculator",
 linkText: "FIRE 계산기",
 },
 ],
 },
 {
 type: "INFJ",
 title: "가치투자 신봉자형",
 description:
 "장기적인 안목으로 가치 있는 기업에 투자하여 꾸준한 수익을 냅니다.",
 keywords: ["#가치투자", "#장기보유", "#신념"],
 dna: {
 strength: "단기적인 시장 변동에 흔들리지 않고 장기적인 가치를 믿는 뚝심",
 weakness:
 "자신이 믿는 가치에 너무 몰두하여 포트폴리오 리밸런싱 시점을 놓칠 수 있음",
 },
 icon: "💎",
 data: [
 { age: 20, salary: 0.4 },
 { age: 30, salary: 0.9 },
 { age: 40, salary: 2.0 },
 { age: 50, salary: 4.0 },
 { age: 60, salary: 8.0 },
 ],
 guide: {
 link: "/guides/compound-interest",
 title: "복리 가이드 보기",
 },
 growthPlan: [
 {
 step: 1,
 title: "복리의 마법, 스노우볼 효과",
 description:
 "당신의 투자 철학과 가장 잘 맞는 복리의 원리를 깊이 있게 이해하고 활용하세요.",
 link: "/guides/compound-interest",
 linkText: "복리 가이드 보기",
 },
 {
 step: 2,
 title: "투자 파이프라인 구축하기",
 description:
 "당신의 신념을 실현할 수 있는 체계적인 투자 시스템을 만드세요.",
 link: "/guides/road-to-100m-part3-invest",
 linkText: "투자 파이프라인 가이드",
 },
 {
 step: 3,
 title: "경제적 자유 계산하기",
 description:
 "가치 투자를 통해 언제쯤 경제적 자유를 이룰 수 있을지 구체적으로 계산해보세요.",
 link: "/fire-calculator",
 linkText: "FIRE 계산기",
 },
 ],
 },
 {
 type: "INFP",
 title: "사회적 기업가형",
 description:
 "돈보다는 사회적 가치를 추구하며, 선한 영향력으로 부를 창출합니다.",
 keywords: ["#가치", "#신념", "#비영리"],
 dna: {
 strength: "돈을 넘어선 가치를 추구하며 장기적인 관점에서 부를 형성함",
 weakness: "현실적인 재무 목표 설정과 수익 창출에 어려움을 겪을 수 있음",
 },
 icon: "🕊️",
 data: [
 { age: 20, salary: 0.3 },
 { age: 30, salary: 0.5 },
 { age: 40, salary: 1.0 },
 { age: 50, salary: 2.0 },
 { age: 60, salary: 3.0 },
 ],
 guide: {
 link: "/guides/road-to-100m-part2-sidejob",
 title: "N잡 가이드 보기",
 },
 growthPlan: [
 {
 step: 1,
 title: "N잡으로 선한 영향력 넓히기",
 description:
 "당신의 신념을 담은 사이드 프로젝트를 통해 추가 수입과 사회적 가치를 동시에 추구하세요.",
 link: "/guides/road-to-100m-part2-sidejob",
 linkText: "N잡 가이드 보기",
 },
 {
 step: 2,
 title: "금융 용어 사전",
 description:
 "세상을 바꾸기 위해서도 돈은 중요합니다. 기본적인 금융 용어부터 차근차근 익혀보세요.",
 link: "/glossary",
 linkText: "금융 용어 사전",
 },
 {
 step: 3,
 title: "첫 월급 재테크 시작하기",
 description:
 "작은 돈이라도 투자를 시작하여 자본주의 시스템을 이해하는 것이 중요합니다.",
 link: "/guides/first-job-investment",
 linkText: "첫 월급 재테크 가이드",
 },
 ],
 },
 {
 type: "ISTP",
 title: "파이어족 조기은퇴형",
 description: "빠르게 돈을 모아 조기 은퇴를 꿈꿉니다. 노동으로부터의 자유!",
 keywords: ["#효율", "#자유", "#FIRE"],
 dna: {
 strength: "최소한의 노력으로 최대의 효율을 뽑아내 목표를 달성함",
 weakness: "장기적이고 반복적인 저축 과정에 쉽게 지루함을 느낌",
 },
 icon: "🔥",
 data: [
 { age: 20, salary: 0.5 },
 { age: 30, salary: 1.2 },
 { age: 40, salary: 2 },
 { age: 45, salary: 0.5 },
 { age: 60, salary: 0.5 },
 ],
 guide: {
 link: "/fire-calculator",
 title: "FIRE 계산기",
 },
 growthPlan: [
 {
 step: 1,
 title: "내 은퇴 나이 계산하기",
 description:
 "당신의 최종 목표인 조기 은퇴 시점을 구체적으로 계산하고 로드맵을 그려보세요.",
 link: "/fire-calculator",
 linkText: "FIRE 계산기",
 },
 {
 step: 2,
 title: "월급으로 투자 파이프라인 구축",
 description:
 "노동 소득을 자본 소득으로 전환하는 효율적인 시스템을 만드세요.",
 link: "/guides/road-to-100m-part3-invest",
 linkText: "투자 파이프라인 가이드",
 },
 {
 step: 3,
 title: "퇴직금 세금 관리",
 description:
 "조기 은퇴 시 받게 될 퇴직금을 세금으로부터 최대한 지키는 방법을 미리 알아보세요.",
 link: "/guides/severance-tax",
 linkText: "퇴직금 세금 가이드",
 },
 ],
 },
 {
 type: "ISFP",
 title: "디지털 노마드형",
 description: "돈에 얽매이지 않고, 좋아하는 일을 하며 자유롭게 살아갑니다.",
 keywords: ["#자유", "#경험", "#현재"],
 dna: {
 strength: "적은 돈으로도 현재의 삶에 만족하고 행복을 찾는 능력",
 weakness: "예측 불가능한 수입으로 인해 재정적 불안정성에 노출되기 쉬움",
 },
 icon: "✈️",
 data: [
 { age: 20, salary: 0.3 },
 { age: 30, salary: 0.6 },
 { age: 40, salary: 1.0 },
 { age: 50, salary: 1.2 },
 { age: 60, salary: 1.0 },
 ],
 guide: {
 link: "/?tab=freelancer",
 title: "프리랜서 계산기",
 },
 growthPlan: [
 {
 step: 1,
 title: "프리랜서/알바 수입 계산",
 description:
 "자유로운 삶을 지탱하기 위한 최소한의 소득을 계획하고 관리하세요.",
 link: "/?tab=freelancer",
 linkText: "프리랜서 계산기",
 },
 {
 step: 2,
 title: "N잡으로 수입 다각화",
 description:
 "하나의 일에 얽매이지 않고, 여러가지 일을 통해 수입원을 다각화하여 안정성을 높이세요.",
 link: "/guides/road-to-100m-part2-sidejob",
 linkText: "N잡 가이드 보기",
 },
 {
 step: 3,
 title: "환율의 영향 알아보기",
 description:
 "전 세계를 무대로 활동한다면, 환율은 당신의 자산 가치를 결정하는 중요한 요소입니다.",
 link: "/guides/exchange-rate-impact",
 linkText: "환율 가이드",
 },
 ],
 },
];

export function getResultType(answers: string[]): SalaryMBTIType {
 const counts = answers.reduce((acc, cur) => {
 acc[cur] = (acc[cur] || 0) + 1;
 return acc;
 }, {} as Record<string, number>);

 const mbti =
 (counts["E"] >= counts["I"] ? "E" : "I") +
 (counts["N"] >= counts["S"] ? "N" : "S") +
 (counts["T"] >= counts["F"] ? "T" : "F") +
 (counts["J"] >= counts["P"] ? "J" : "P");

 return (
 resultTypes.find((r) => r.type === mbti) ||
 resultTypes.find((r) => r.type === "ISTJ")!
 );
}
