// src/components/header/navConfig.ts
//
// 헤더 네비게이션 설정 데이터.
// 6개 카테고리로 통합. 메가 메뉴 스타일 — 항목별 description + badge 지원.
// 컴포넌트 로직과 분리하여 메뉴 구조 변경 시 이 파일만 수정.

export type Badge = "HOT" | "NEW" | "SEASON" | "MUST";

export type LinkItem = {
 name: string;
 href: string;
 type: "link";
 badge?: Badge;
};

export type DropdownSubItem = {
 name: string;
 href: string;
 /** 메가 메뉴 부연 설명 (1줄, 25자 이내 권장) */
 description?: string;
 /** 우측 상단 뱃지 */
 badge?: Badge;
};

export type DropdownItem = {
 name: string;
 type: "dropdown";
 /** 메가 메뉴 헤더 부연 설명 (선택) */
 description?: string;
 items: DropdownSubItem[];
};

export type NavItem = LinkItem | DropdownItem;

export const navConfig: NavItem[] = [
 {
  name: "계산기",
  type: "dropdown",
  description: "직장인 필수 100+ 계산기 모음",
  items: [
   { name: "100가지 계산기 한눈에", href: "/calc", description: "모든 금융 계산기 인덱스", badge: "MUST" },
   { name: "종합 연봉 실수령액", href: "/?tab=salary", description: "2026 세후 월급·4대보험" },
   { name: "퇴직금 계산기", href: "/?tab=severance", description: "30일분 평균임금 자동" },
   { name: "프리랜서·알바", href: "/?tab=freelancer", description: "3.3% 원천징수 후 수령액" },
   { name: "연말정산 계산기", href: "/year-end-tax", description: "환급금 미리보기", badge: "SEASON" },
   { name: "FIRE 은퇴 계산기", href: "/fire-calculator", description: "조기 은퇴 자산 시뮬" },
   { name: "성과급 세금", href: "/tools/finance/bonus", description: "보너스 실수령액", badge: "HOT" },
   { name: "삼성전자 성과급 시뮬레이터", href: "/calc/samsung-bonus", description: "OPI + TAI 사업부별 분배", badge: "HOT" },
   { name: "SK하이닉스 PS·PI 계산기", href: "/calc/sk-hynix-bonus", description: "PS(영업이익 10%) + PI(반기 150%)", badge: "NEW" },
   { name: "현대차 성과급 계산기", href: "/calc/hyundai-bonus", description: "임단협 450% + 1,580만 + 무상주 30주", badge: "NEW" },
   { name: "기아 성과급 계산기", href: "/calc/kia-bonus", description: "임단협 450% + 1,600만 + 무상주 53주", badge: "NEW" },
   { name: "LG에너지솔루션 성과급", href: "/calc/lg-energy-bonus", description: "배터리 사이클 50~900% 변동", badge: "NEW" },
   { name: "HD현대중공업 성과급", href: "/calc/hd-hyundai-bonus", description: "조선 슈퍼사이클 600%+", badge: "NEW" },
   { name: "네이버 성과급·RSU", href: "/calc/naver-bonus", description: "PI 10~40% + 자사주 RSU", badge: "NEW" },
   { name: "카카오 성과급·RSU", href: "/calc/kakao-bonus", description: "PI + RSU 47만주(237억)", badge: "NEW" },
   { name: "연봉 인상 협상 시뮬", href: "/salary-raise-2026", description: "인상률 + 세후 + 5년 누적", badge: "NEW" },
   { name: "종합소득세 계산기", href: "/income-tax-2026", description: "8단계 누진세율 + 지방세", badge: "NEW" },
   { name: "건강보험료 계산기", href: "/health-insurance-fee-2026", description: "직장·지역 가입자 본인 부담", badge: "NEW" },
   { name: "주휴수당 계산기", href: "/weekly-holiday-allowance-2026", description: "주 15시간+ 알바 필수", badge: "NEW" },
   { name: "국민연금 예상수령액", href: "/national-pension-estimate-2026", description: "가입기간별 월 노령연금", badge: "NEW" },
   { name: "적금·예금 이자 계산기", href: "/savings-interest-2026", description: "단리/복리·세후 만기", badge: "NEW" },
   { name: "복리 계산기", href: "/tools/finance/compound", description: "장기 자산 시뮬" },
   { name: "주식 양도소득세", href: "/tools/finance/stock-tax", description: "주식 매도 시 세금" },
   { name: "취득세 계산기", href: "/tools/real-estate/acquisition-tax", description: "주택 매수 세금" },
   { name: "증여세 계산기", href: "/tools/real-estate/gift-tax", description: "증여 한도 시뮬" },
   { name: "프리랜서 종합소득세", href: "/tools/finance/freelance-tax", description: "5월 종소세 신고" },
   { name: "IRP·연금저축", href: "/tools/finance/irp", description: "세액공제 환급액", badge: "HOT" },
   { name: "실업급여 계산기", href: "/unemployment-benefit", description: "수령액·기간 즉시 계산", badge: "HOT" },
   { name: "근로장려금 계산기", href: "/earned-income-credit", description: "단독·홑벌이·맞벌이", badge: "HOT" },
   { name: "육아휴직 급여 계산기", href: "/parental-leave", description: "6+6 부모 육아휴직", badge: "NEW" },
   { name: "전체 30종 도구", href: "/tools", description: "마이너 계산기까지" },
  ],
 },
 {
  name: "연봉DB",
  type: "dropdown",
  description: "실제 데이터 기반 연봉 정보",
  items: [
   { name: "기업별 연봉 DB", href: "/salary-db", description: "414개 기업 평균 연봉", badge: "MUST" },
   { name: "직업별 연봉", href: "/job", description: "59개 직종 연봉 비교", badge: "NEW" },
   { name: "산업별 연봉", href: "/industry", description: "16개 산업군 연봉 현황", badge: "NEW" },
   { name: "지역별 연봉", href: "/region", description: "17개 시도 + 판교·여의도", badge: "NEW" },
   { name: "내 연봉 제보", href: "/salary-db/submit", description: "익명 등록·기여" },
   { name: "2026 연봉 실수령액 표", href: "/table/2026/annual", description: "1천만~2억 한눈" },
   { name: "2026 월급 실수령액 표", href: "/table/2026/monthly", description: "월급 기준 조회" },
   { name: "직장인 단계별 자산", href: "/career-stages-2026", description: "20~50대 연봉·자산" },
   { name: "커리어 플래너", href: "/pro/career-planner", description: "이직·승진 시뮬레이션" },
   { name: "내 연봉 리포트", href: "/report", description: "저장한 결과 시각화" },
  ],
 },
 {
  name: "시즌",
  type: "dropdown",
  description: "2026 월별 핫스팟 가이드·정보",
  items: [
   { name: "5월 종합소득세 신고", href: "/year-end-tax-2026", description: "프리랜서·N잡러", badge: "SEASON" },
   { name: "6·12월 자동차세 계산기", href: "/auto-tax-2026", description: "배기량·차령·연납 7% 할인", badge: "NEW" },
   { name: "7·9월 부동산 보유세", href: "/property-holding-tax-2026", description: "재산세 + 종부세 통합", badge: "NEW" },
   { name: "7월 건강보험료 정산", href: "/health-insurance-2026", description: "추가 부과 대응" },
   { name: "12월 연말정산·성과급", href: "/year-end-tax-settlement-2026", description: "근로자 절세 전략" },
   { name: "3월 신입 연봉 협상", href: "/new-employee-2026", description: "첫 협상 가이드" },
   { name: "신입 초봉 TOP 50", href: "/new-employee-salary-2026", description: "회사 480곳 영끌 인덱스", badge: "NEW" },
   { name: "최저임금 2026", href: "/minimum-wage-2026", description: "시급·월급·연봉 환산표", badge: "NEW" },
   { name: "건강검진 2026", href: "/health-checkup-2026", description: "대상자·항목·비용·예약", badge: "NEW" },
   { name: "연말정산 체크리스트", href: "/year-end-tax-checklist", description: "12.31 마감 점검" },
   { name: "2026 세율표", href: "/tax-rates-2026", description: "소득세 구간 한눈" },
   { name: "2026 4대보험 요율", href: "/social-insurance-rates-2026", description: "최신 요율표" },
   { name: "2026 세법 변경사항", href: "/tax-changes-2026", description: "올해 핵심 변화", badge: "NEW" },
   { name: "퇴직연금 (DB·DC·IRP)", href: "/retirement-pension-2026", description: "유형별 비교" },
   { name: "삼성 신입 연봉 협상", href: "/samsung-negotiation-2026", description: "반도체 대기업 가이드" },
   { name: "삼성 성과급 시뮬레이터", href: "/calc/samsung-bonus", description: "OPI + TAI 사업부별 분배", badge: "HOT" },
   { name: "SK하이닉스 PS·PI 계산기", href: "/calc/sk-hynix-bonus", description: "1.48억 받은 2025 사례 포함", badge: "NEW" },
   { name: "현대차 성과급 계산기", href: "/calc/hyundai-bonus", description: "임단협 잠정합의 + 노조 요구안", badge: "NEW" },
   { name: "기아 성과급 계산기", href: "/calc/kia-bonus", description: "5년 무파업 합의 450%+1,600만", badge: "NEW" },
   { name: "LG에너지솔루션 성과급", href: "/calc/lg-energy-bonus", description: "배터리 사이클별 5가지 시나리오", badge: "NEW" },
   { name: "HD현대중공업 성과급", href: "/calc/hd-hyundai-bonus", description: "조선 슈퍼사이클 + 노조 영업이익 30%", badge: "NEW" },
   { name: "네이버 성과급·RSU", href: "/calc/naver-bonus", description: "정기 PI + 자사주 RSU 465억", badge: "NEW" },
   { name: "카카오 성과급·RSU", href: "/calc/kakao-bonus", description: "RSU 47만주 + 격려금 100만", badge: "NEW" },
  ],
 },
 {
  name: "가이드",
  type: "dropdown",
  description: "직장인 절세·투자·재테크 가이드",
  items: [
   { name: "전체 가이드 (120+편)", href: "/guides", description: "절세·투자·커리어", badge: "MUST" },
   { name: "Q&A 자주 묻는 질문", href: "/qna", description: "직장인 금융 답변" },
   { name: "금융 용어 사전", href: "/glossary", description: "쉽게 풀어쓴 용어" },
   { name: "직장인 꿀팁 모음", href: "/tips", description: "실전 노하우" },
   { name: "주제별 종합 가이드", href: "/hub", description: "FIRE·투자·부동산·절세·커리어", badge: "NEW" },
   { name: "연말정산 환급 200만원", href: "/guides/year-end-tax-refund-secrets-2026", description: "7가지 비밀", badge: "NEW" },
   { name: "IRP vs 연금저축 vs ISA", href: "/guides/irp-pension-isa-comparison-2026", description: "최적 조합 전략", badge: "NEW" },
   { name: "연봉 협상 실전 시나리오", href: "/guides/salary-negotiation-real-scripts-2026", description: "+18% 인상 스크립트", badge: "NEW" },
   { name: "신혼부부 세금 혜택", href: "/guides/newlywed-tax-benefits-2026", description: "결혼 1년 13가지", badge: "NEW" },
   { name: "직장인 부업 + 종소세", href: "/guides/side-hustle-tax-2026", description: "월 100만원 부업", badge: "NEW" },
   { name: "주식 가이드 모음", href: "/guides?category=주식", description: "삼성·하이닉스·반도체" },
   { name: "삼성전자 2026 주가", href: "/guides/samsung-electronics-stock-2026", description: "전망·시나리오" },
   { name: "SK하이닉스 주가 분석", href: "/guides/sk-hynix-stock-2026", description: "AI 메모리 사이클" },
   { name: "반도체 주식 절세", href: "/guides/chip-stock-tax-guide", description: "RSU·자사주 절세" },
  ],
 },
 {
  name: "생활금융",
  type: "dropdown",
  description: "대출·부동산·해외 비교",
  items: [
   { name: "주택담보대출 계산", href: "/home-loan", description: "DSR·LTV·월 상환액", badge: "HOT" },
   { name: "자동차 구매·할부", href: "/car-loan", description: "내 연봉 드림카" },
   { name: "FIRE 조기은퇴", href: "/fire-calculator", description: "은퇴 자산 시뮬" },
   { name: "해외 연봉 비교", href: "/global", description: "한국 vs 일본·미국" },
   { name: "MBTI 연봉 분석", href: "/mbti-salary", description: "성격 유형별 연봉" },
   { name: "사이트 소개", href: "/about", description: "운영자·연락처" },
  ],
 },
 {
  name: "Fun",
  type: "dropdown",
  description: "직장인 심심풀이 테스트·게임",
  items: [
   { name: "Fun 전체 보기", href: "/fun", description: "20+ 게임·테스트 모음" },
   { name: "금융 MBTI 테스트", href: "/fun/financial-mbti", description: "16가지 투자 성향", badge: "HOT" },
   { name: "부자 DNA 테스트", href: "/fun/rich-dna-test", description: "나의 부자 가능성" },
   { name: "IQ 테스트", href: "/fun/iq-test", description: "직장인 IQ 측정" },
   { name: "연봉 배틀", href: "/fun/salary-battle", description: "친구와 연봉 대결" },
   { name: "연봉 랭킹", href: "/fun/salary-rank", description: "내 연봉 상위 %" },
   { name: "탈출 계획", href: "/fun/escape-plan", description: "노비 탈출 시기" },
   { name: "자산 배분 마스터", href: "/fun/asset-allocator", description: "60초 투자 게임" },
   { name: "지출 성향 테스트", href: "/fun/spending-test", description: "나의 소비 패턴" },
   { name: "환생 시뮬레이터", href: "/fun/reincarnation", description: "다음 생 시뮬" },
   { name: "월급 명세서 생성", href: "/fun/salary-slip", description: "재미용 명세서" },
   { name: "점심 룰렛", href: "/fun/lunch-roulette", description: "오늘 뭐 먹지?" },
   { name: "월드컵 토너먼트", href: "/fun/worldcup", description: "최고의 직장 뽑기" },
   { name: "2026 재물운 사주", href: "/fortune-2026", description: "올해 재물운" },
   { name: "로또 번호 생성", href: "/lotto", description: "AI 추천 번호" },
  ],
 },
];
