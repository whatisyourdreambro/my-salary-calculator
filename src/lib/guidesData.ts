// src/lib/guidesData.ts

export interface Guide {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  level: '초급' | '중급' | '고급';
  publishedDate: string;
  views: number;
}

export const categories = [
  { id: "all", name: "전체보기" },
  { id: "연봉", name: "연봉 분석" },
  { id: "커리어", name: "커리어 성장" },
  { id: "세금", name: "절세/세금" },
  { id: "투자", name: "재테크/투자" },
  { id: "부동산", name: "부동산" },
  { id: "기초", name: "금융 기초" },
];

export const guides: Guide[] = [
  { slug: "salary-guide-2025", title: "2025년 연봉 실수령액 완벽 분석", description: "최신 세법을 적용한 연봉 구간별 상세 실수령액 표를 제공합니다.", category: "연봉", tags: ["연봉", "실수령액", "2025년"], level: "초급", publishedDate: "2025-10-26", views: 150234 },
  { slug: "salary-negotiation-strategy", title: "연봉협상, 최소 20% 올리는 4단계 전략", description: "당신의 가치를 증명하고, 원하는 연봉을 얻어내는 실전 협상 기술을 공개합니다.", category: "연봉", tags: ["연봉협상", "커리어", "몸값"], level: "중급", publishedDate: "2025-10-20", views: 98765 },
  { slug: "nekarakubae-salary", title: "네카라쿠배 개발자 초봉 1억, 그 진실은?", description: "계약 연봉, 사이닝 보너스, 스톡옵션을 포함한 '영끌 초봉'의 실체를 파헤칩니다.", category: "연봉", tags: ["개발자", "IT", "네카라쿠배"], level: "중급", publishedDate: "2025-10-15", views: 120345 },
  { slug: "hyundai-production-salary", title: "현대차 생산직 연봉: '킹산직'의 모든 것", description: "신의 직장이라 불리는 현대자동차 생산직의 실제 연봉과 복지를 심층 분석합니다.", category: "연봉", tags: ["생산직", "현대자동차", "킹산직"], level: "중급", publishedDate: "2025-10-10", views: 210987 },
  { slug: "public-servant-salary", title: "9급 공무원 첫 월급, 정말 박봉일까?", description: "기본급 뒤에 숨겨진 각종 수당을 포함한 공무원의 진짜 월급을 공개합니다.", category: "연봉", tags: ["공무원", "9급", "월급"], level: "초급", publishedDate: "2025-09-28", views: 88765 },
  { slug: "foreign-company-salary", title: "외국계 기업 연봉, 정말 더 높을까?", description: "국내 기업 vs 외국계 기업, 같은 직무의 연봉과 복지를 비교 분석합니다.", category: "연봉", tags: ["외국계", "연봉 비교", "커리어"], level: "중급", publishedDate: "2025-09-22", views: 76543 },
  { slug: "first-job-guide", title: "첫 이직, 성공을 위한 A to Z 가이드", description: "이력서 작성부터 면접, 연봉 협상까지. 성공적인 첫 이직을 위한 모든 것을 담았습니다.", category: "커리어", tags: ["이직", "초년생", "면접"], level: "초급", publishedDate: "2025-10-25", views: 65432 },
  { slug: "linkedin-power-up", title: "링크드인 프로필, 이렇게 만들면 헤드헌터에게 연락온다", description: "당신의 몸값을 높여줄 링크드인 프로필 작성법과 네트워킹 전략을 공개합니다.", category: "커리어", tags: ["링크드인", "헤드헌터", "브랜딩"], level: "중급", publishedDate: "2025-10-18", views: 81234 },
  { slug: "startup-vs-large-corp", title: "스타트업 vs 대기업, 당신의 선택은?", description: "성장 가능성과 안정성, 두 마리 토끼를 잡기 위한 커리어 선택 가이드.", category: "커리어", tags: ["스타트업", "대기업", "커리어패스"], level: "중급", publishedDate: "2025-10-12", views: 54321 },
  { slug: "pm-career-path", title: "비개발자를 위한 IT 프로덕트 매니저(PM) 되는 법", description: "PM의 역할, 필요한 역량, 그리고 성공적인 커리어 전환을 위한 로드맵을 제시합니다.", category: "커리어", tags: ["PM", "IT", "커리어전환"], level: "고급", publishedDate: "2025-10-05", views: 92345 },
  { slug: "developer-roadmap-2026", title: "2026년 개발자 커리어 로드맵", description: "AI 시대, 살아남는 개발자가 되기 위한 기술 스택과 역량 강화 전략.", category: "커리어", tags: ["개발자", "로드맵", "AI"], level: "고급", publishedDate: "2025-09-29", views: 112345 },
  { slug: "year-end-tax-settlement-deep-dive", title: "연말정산, 놓치기 쉬운 공제 항목 TOP 10", description: "13월의 월급을 두둑하게 만들어 줄 숨겨진 공제 항목들을 찾아드립니다.", category: "세금", tags: ["연말정산", "세금", "절세"], level: "중급", publishedDate: "2025-10-24", views: 134567 },
  { slug: "bonus-tax-guide", title: "성과급 세금 폭탄, 피하는 법 완벽 가이드", description: "상여금 세금 계산 원리부터 IRP를 활용한 절세 전략까지 총정리.", category: "세금", tags: ["성과급", "세금", "IRP"], level: "고급", publishedDate: "2025-10-14", views: 109876 },
  { slug: "severance-tax-guide", title: "퇴직금 세금, 최소 40% 아끼는 공제의 비밀", description: "복잡한 퇴직소득세 계산법과 세금을 획기적으로 줄여주는 공제의 모든 것을 설명합니다.", category: "세금", tags: ["퇴직금", "퇴직소득세", "절세"], level: "고급", publishedDate: "2025-10-08", views: 156789 },
  { slug: "freelancer-tax-guide", title: "프리랜서, 5월 종합소득세 완벽 대비 가이드", description: "3.3% 원천징수부터 경비 처리, 절세 꿀팁까지. 프리랜서를 위한 맞춤형 세금 가이드.", category: "세금", tags: ["프리랜서", "종합소득세", "5월"], level: "중급", publishedDate: "2025-09-25", views: 87654 },
  { slug: "gift-tax-guide", title: "증여세, 10분 만에 이해하고 절세하는 법", description: "가족 간의 증여, 세금 폭탄을 피하기 위해 반드시 알아야 할 모든 것.", category: "세금", tags: ["증여세", "절세", "부동산"], level: "고급", publishedDate: "2025-09-18", views: 78901 },
  { slug: "first-investment-guide", title: "첫 월급 100만원 재테크: 부자되는 첫걸음", description: "사회초년생 필독! 당신의 미래를 바꿀 첫 월급 재테크 로드맵을 공개합니다.", category: "투자", tags: ["초년생", "재테크", "ETF"], level: "초급", publishedDate: "2025-10-22", views: 145678 },
  { slug: "sp500-vs-nasdaq", title: "S&P 500 vs 나스닥 100, 당신의 선택은?", description: "미국 대표 지수 ETF, 두 상품의 특징과 장단점을 완벽 비교 분석해 드립니다.", category: "투자", tags: ["ETF", "미국주식", "S&P500"], level: "초급", publishedDate: "2025-10-16", views: 165432 },
  { slug: "dollar-investment-guide", title: "지금 당장 달러 투자를 시작해야 하는 이유", description: "가장 안전한 자산, 달러에 투자하는 3가지 방법과 장기적인 관점의 투자 전략.", category: "투자", tags: ["달러", "환테크", "안전자산"], level: "중급", publishedDate: "2025-10-09", views: 99876 },
  { slug: "pension-saving-guide", title: "연금저축 vs IRP, 당신에게 맞는 연금 계좌는?", description: "세액공제 혜택부터 중도 인출 조건까지, 두 연금 계좌의 모든 것을 비교 분석합니다.", category: "투자", tags: ["연금", "IRP", "연말정산"], level: "중급", publishedDate: "2025-10-01", views: 132456 },
  { slug: "dividend-stock-guide", title: "파이어족을 위한 월배당 포트폴리오 짜는 법", description: "매달 현금 흐름을 만드는 배당주 투자의 모든 것. 종목 선정부터 포트폴리오 구성까지.", category: "투자", tags: ["배당주", "파이어족", "포트폴리오"], level: "고급", publishedDate: "2025-09-20", views: 110293 },
  { slug: "first-home-guide", title: "생애최초 주택 구매, A to Z 가이드", description: "디딤돌, 보금자리론부터 청약 전략까지. 내 집 마련의 꿈을 이루기 위한 모든 정보.", category: "부동산", tags: ["내집마련", "디딤돌", "청약"], level: "중급", publishedDate: "2025-10-23", views: 98712 },
  { slug: "jeonse-vs-monthly", title: "전세 vs 월세, 당신의 현금흐름에 맞는 선택은?", description: "각각의 장단점과 유불리를 현재 나의 재정 상황에 맞춰 분석해 드립니다.", category: "부동산", tags: ["전세", "월세", "주거"], level: "초급", publishedDate: "2025-10-11", views: 76543 },
  { slug: "real-estate-investment-basics", title: "부동산 소액 투자, 1000만원으로 시작하는 법", description: "리츠(REITs)를 활용하여 누구나 쉽게 부동산에 간접 투자하는 방법을 알려드립니다.", category: "부동산", tags: ["리츠", "소액투자", "재테크"], level: "초급", publishedDate: "2025-10-03", views: 87654 },
  { slug: "4-major-insurances", title: "4대 보험 완벽 가이드: 내 월급에서 왜, 얼마나 떼는 걸까?", description: "국민연금, 건강보험, 고용보험, 산재보험. 내 삶을 지키는 최소한의 안전장치, 제대로 알아보세요.", category: "기초", tags: ["4대보험", "월급", "세금"], level: "초급", publishedDate: "2025-09-30", views: 187654 },
  { slug: "compound-interest-magic", title: "복리의 마법, 스노우볼 효과: 부자들의 비밀 무기", description: "시간을 내 편으로 만들어 자산을 불리는 가장 확실한 방법, 복리의 모든 것을 알려드립니다.", category: "기초", tags: ["복리", "투자", "기초"], level: "초급", publishedDate: "2025-09-15", views: 198765 },
  { slug: "credit-score-101", title: "신용점수, 100점 올리는 가장 빠른 방법", description: "신용점수의 중요성부터, 일상 속에서 점수를 관리하고 올리는 실질적인 팁까지 모두 알려드립니다.", category: "기초", tags: ["신용점수", "대출", "신용카드"], level: "초급", publishedDate: "2025-09-14", views: 78123 },
  { slug: "k-pass-guide", title: "K-패스, 정말 이득일까? 완벽 분석", description: "알뜰교통카드와 K-패스의 차이점, 그리고 나에게 가장 유리한 교통비 절약 카드는 무엇일까요?", category: "기초", tags: ["K-패스", "교통비", "절약"], level: "초급", publishedDate: "2025-09-01", views: 87654 },
  { slug: "parking-account-comparison", title: "파킹통장, 금리 비교 및 추천 (2025년 최신)", description: "하루만 맡겨도 이자가 붙는 파킹통장, 제2의 월급으로 활용하는 방법과 최고의 상품을 추천합니다.", category: "기초", tags: ["파킹통장", "금리", "CMA"], level: "초급", publishedDate: "2025-08-26", views: 88765 },
];