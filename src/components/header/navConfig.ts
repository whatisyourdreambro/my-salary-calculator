// src/components/header/navConfig.ts
//
// 헤더 네비게이션 설정 데이터.
// 5개 카테고리로 통합 (이전 8개) → 1024px부터 한 줄 노출 가능.
// 컴포넌트 로직과 분리하여 메뉴 구조 변경 시 이 파일만 수정.

export type LinkItem = { name: string; href: string; type: "link" };
export type DropdownItem = {
 name: string;
 type: "dropdown";
 items: { name: string; href: string }[];
};
export type NavItem = LinkItem | DropdownItem;

export const navConfig: NavItem[] = [
 {
 name: "계산기·도구",
 type: "dropdown",
 items: [
 { name: "🚀 100가지 계산기 한눈에", href: "/calc" },
 { name: "종합 연봉 계산기", href: "/" },
 { name: "연말정산 계산기", href: "/year-end-tax" },
 { name: "퇴직금·중간정산", href: "/tools/finance/severance" },
 { name: "프리랜서 종소세", href: "/tools/finance/freelance-tax" },
 { name: "전체 30종 도구", href: "/tools" },
 { name: "─────", href: "#" },
 { name: "🆕 시급 → 연봉 환산", href: "/hourly" },
 { name: "🆕 월급 → 연봉 환산", href: "/monthly" },
 { name: "🆕 연도별 세율표", href: "/year/2026/tax-rates" },
 { name: "성과급 세금", href: "/tools/finance/bonus" },
 { name: "복리 계산기", href: "/tools/finance/compound" },
 { name: "주식 양도소득세", href: "/tools/finance/stock-tax" },
 { name: "취득세 계산기", href: "/tools/real-estate/acquisition-tax" },
 { name: "증여세 계산기", href: "/tools/real-estate/gift-tax" },
 { name: "IRP·연금저축 세액공제", href: "/tools/finance/irp" },
 { name: "DSR·LTV 한도", href: "/tools/real-estate/dsr" },
 { name: "할부 이자 계산기", href: "/tools/finance/installment" },
 { name: "주택담보대출", href: "/home-loan" },
 { name: "자동차 할부", href: "/car-loan" },
 { name: "FIRE 조기은퇴", href: "/fire-calculator" },
 ],
 },
 {
 name: "🔥 인터랙티브",
 type: "dropdown",
 items: [
 { name: "🎯 연봉 협상 시뮬레이터", href: "/tools/career/negotiation-simulator" },
 { name: "💚 재무 건강 진단", href: "/tools/career/financial-health" },
 { name: "🌅 노후 자금 시뮬", href: "/tools/career/retirement-projection" },
 { name: "🔄 이직 결정 도구", href: "/tools/career/job-change-decision" },
 { name: "🧾 세금 절세 진단", href: "/tools/tax/savings-checkup" },
 { name: "🏠 첫 주택 자금 계획", href: "/tools/real-estate/first-home-plan" },
 { name: "📊 포트폴리오 자산 배분", href: "/tools/finance/portfolio-allocator" },
 { name: "─────", href: "#" },
 { name: "💰 가계부 자동 분석 (NEW)", href: "/tools/life/budget-analyzer" },
 { name: "💳 부채 통합 시뮬 (NEW)", href: "/tools/finance/debt-consolidation" },
 { name: "👶 자녀 양육비 시뮬 (NEW)", href: "/tools/family/child-cost-projection" },
 { name: "🌐 글로벌 직업 비교 (NEW)", href: "/tools/career/global-job-compare" },
 ],
 },
 {
 name: "회사·직업·지역",
 type: "dropdown",
 items: [
 { name: "기업별 연봉 DB (165개)", href: "/salary-db" },
 { name: "회사 vs 회사 비교", href: "/company/compare" },
 { name: "🆕 인기 회사 비교 50쌍", href: "/company/vs/samsung-electronics-vs-lg-electronics" },
 { name: "내 연봉 제보하기", href: "/salary-db/submit" },
 { name: "─────", href: "#" },
 { name: "🆕 직업별 연봉 (130개)", href: "/job/backend-developer/salary" },
 { name: "🆕 지역별 생활비 (27개)", href: "/region/seoul/cost-of-living" },
 { name: "🆕 공무원 9급 호봉표", href: "/salary-grade/civil-servant-2026" },
 { name: "─────", href: "#" },
 { name: "2026 연봉 실수령액 표", href: "/table/2026/annual" },
 { name: "2026 월급 실수령액 표", href: "/table/2026/monthly" },
 { name: "직장인 단계별 자산", href: "/career-stages-2026" },
 { name: "커리어 플래너", href: "/pro/career-planner" },
 ],
 },
 {
 name: "2026 시즌",
 type: "dropdown",
 items: [
 { name: "🔥 5월 종합소득세 신고", href: "/year-end-tax-2026" },
 { name: "7월 건강보험료 정산", href: "/health-insurance-2026" },
 { name: "12월 연말정산·성과급", href: "/year-end-tax-settlement-2026" },
 { name: "3월 신입 연봉 협상", href: "/new-employee-2026" },
 { name: "─────", href: "#" },
 { name: "🆕 실업급여 신청 가이드", href: "/unemployment-benefit-2026" },
 { name: "🆕 육아휴직급여 가이드", href: "/parental-leave-2026" },
 { name: "🆕 부업·N잡 시작", href: "/side-job-2026" },
 { name: "🆕 이직 가이드", href: "/career-change-2026" },
 { name: "🆕 은퇴 준비", href: "/retirement-prep-2026" },
 { name: "🆕 1인 창업 가이드", href: "/startup-founder-2026" },
 { name: "🆕 디지털 노마드", href: "/digital-nomad-2026" },
 { name: "🆕 첫 직장 가이드", href: "/first-job-2026" },
 { name: "─────", href: "#" },
 { name: "연말정산 체크리스트", href: "/year-end-tax-checklist" },
 { name: "2026 세율표", href: "/tax-rates-2026" },
 { name: "2026 4대보험 요율", href: "/social-insurance-rates-2026" },
 { name: "2026 세법 변경사항", href: "/tax-changes-2026" },
 { name: "퇴직연금 (DB·DC·IRP)", href: "/retirement-pension-2026" },
 { name: "2026 재물운 사주", href: "/fortune-2026" },
 ],
 },
 {
 name: "가이드·통계",
 type: "dropdown",
 items: [
 { name: "전체 가이드 (60+편)", href: "/guides" },
 { name: "직장인 꿀팁 모음", href: "/tips" },
 { name: "Q&A 자주 묻는 질문", href: "/qna" },
 { name: "금융 용어 사전", href: "/glossary" },
 { name: "─────", href: "#" },
 { name: "📊 통계·인용 자료실", href: "/stats" },
 { name: "🆕 한국 연봉 분포 백분위", href: "/stats/korean-salary-distribution-2026" },
 { name: "🆕 최저시급 38년 history", href: "/stats/minimum-wage-history" },
 { name: "🆕 4대보험 요율 history", href: "/stats/4-insurance-rates-history" },
 { name: "🆕 누진세율 변천사", href: "/stats/income-tax-bracket-history" },
 { name: "🆕 전월세 전환율 history", href: "/stats/jeonse-vs-monthly-by-year" },
 { name: "─────", href: "#" },
 { name: "📡 자동 갱신 콘텐츠", href: "/interest-rate-tracker" },
 { name: "환율 대시보드", href: "/fx-dashboard" },
 { name: "한국은행 기준금리", href: "/interest-rate-tracker" },
 { name: "최저시급 D-day", href: "/minimum-wage-countdown" },
 { name: "부동산 시세 Pulse", href: "/real-estate-pulse" },
 { name: "월별 임금 통계", href: "/salary-stats-monthly" },
 { name: "─────", href: "#" },
 { name: "🔥 임베드 위젯 (블로그용)", href: "/share/embed-codes" },
 { name: "Press Kit (언론·블로거)", href: "/pr/press-kit" },
 { name: "사이트 소개", href: "/about" },
 ],
 },
];
