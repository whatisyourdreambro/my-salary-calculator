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
 name: "연봉 계산기",
 type: "dropdown",
 items: [
 { name: "🚀 100가지 계산기 한눈에", href: "/calc" },
 { name: "종합 계산기", href: "/?tab=salary" },
 { name: "퇴직금 계산기", href: "/?tab=severance" },
 { name: "프리랜서/알바", href: "/?tab=freelancer" },
 { name: "연말정산 계산기", href: "/year-end-tax" },
 { name: "FIRE 은퇴 계산기", href: "/fire-calculator" },
 { name: "전체 30종 도구", href: "/tools" },
 { name: "🔥 성과급 세금 계산기", href: "/tools/finance/bonus" },
 { name: "복리 계산기", href: "/tools/finance/compound" },
 { name: "주식 양도소득세", href: "/tools/finance/stock-tax" },
 { name: "취득세 계산기", href: "/tools/real-estate/acquisition-tax" },
 { name: "증여세 계산기", href: "/tools/real-estate/gift-tax" },
 { name: "프리랜서 종합소득세", href: "/tools/finance/freelance-tax" },
 { name: "IRP·연금저축 세액공제", href: "/tools/finance/irp" },
 { name: "할부 이자 계산기", href: "/tools/finance/installment" },
 { name: "대출 이자 계산기", href: "/tools/loan" },
 ],
 },
 {
 name: "회사·연봉DB",
 type: "dropdown",
 items: [
 { name: "기업별 연봉 DB", href: "/salary-db" },
 { name: "내 연봉 제보하기", href: "/salary-db/submit" },
 { name: "2026 연봉 실수령액 표", href: "/table/2026/annual" },
 { name: "2026 월급 실수령액 표", href: "/table/2026/monthly" },
 { name: "직장인 단계별 자산", href: "/career-stages-2026" },
 { name: "커리어 플래너", href: "/pro/career-planner" },
 ],
 },
 {
 name: "2026 시즌·정보",
 type: "dropdown",
 items: [
 { name: "🔥 5월 종합소득세 신고", href: "/year-end-tax-2026" },
 { name: "7월 건강보험료 정산", href: "/health-insurance-2026" },
 { name: "12월 연말정산·성과급", href: "/year-end-tax-settlement-2026" },
 { name: "3월 신입 연봉 협상", href: "/new-employee-2026" },
 { name: "연말정산 체크리스트", href: "/year-end-tax-checklist" },
 { name: "2026 세율표", href: "/tax-rates-2026" },
 { name: "2026 4대보험 요율", href: "/social-insurance-rates-2026" },
 { name: "2026 세법 변경사항", href: "/tax-changes-2026" },
 { name: "퇴직연금 (DB·DC·IRP)", href: "/retirement-pension-2026" },
 ],
 },
 {
 name: "가이드·재테크",
 type: "dropdown",
 items: [
 { name: "전체 가이드 (50+편)", href: "/guides" },
 { name: "직장인 꿀팁 모음", href: "/tips" },
 { name: "Q&A 자주 묻는 질문", href: "/qna" },
 { name: "금융 용어 사전", href: "/glossary" },
 { name: "📊 주식 가이드 모아보기", href: "/guides?category=주식" },
 { name: "🔥 삼성전자 2026 주가 전망", href: "/guides/samsung-electronics-stock-2026" },
 { name: "🚀 SK하이닉스 주가 분석", href: "/guides/sk-hynix-stock-2026" },
 { name: "🔄 반도체 사이클 2026", href: "/guides/semiconductor-cycle-2026" },
 { name: "💼 삼성 직원 자사주 시뮬", href: "/guides/samsung-employee-rsu-stock" },
 { name: "💰 SK하이닉스 PS·PI·자사주", href: "/guides/sk-hynix-employee-bonus-stock" },
 { name: "⚖️ 삼성 vs 하이닉스 비교", href: "/guides/samsung-vs-hynix-employee-comparison" },
 { name: "🧾 반도체 주식 절세 가이드", href: "/guides/chip-stock-tax-guide" },
 { name: "📈 적립식 vs 일시매수 전략", href: "/guides/kospi-leader-stock-strategy" },
 { name: "사이트 소개", href: "/about" },
 ],
 },
 {
 name: "생활 금융",
 type: "dropdown",
 items: [
 { name: "자동차 구매·할부", href: "/car-loan" },
 { name: "주택담보대출 계산", href: "/home-loan" },
 { name: "FIRE 조기은퇴", href: "/fire-calculator" },
 { name: "2026 재물운 사주", href: "/fortune-2026" },
 { name: "로또 번호 생성", href: "/lotto" },
 ],
 },
];
