// src/components/header/navConfig.ts
//
// 헤더 네비게이션 설정 데이터.
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
 name: "커리어 플래너",
 href: "/pro/career-planner",
 type: "link",
 },
 {
 name: "연봉 계산기",
 type: "dropdown",
 items: [
 { name: "종합 계산기", href: "/?tab=salary" },
 { name: "퇴직금 계산기", href: "/?tab=severance" },
 { name: "프리랜서/알바", href: "/?tab=freelancer" },
 { name: "연말정산 계산기", href: "/year-end-tax" },
 ],
 },
 {
 name: "연봉 테이블",
 type: "dropdown",
 items: [
 { name: "기업별 연봉 DB", href: "/salary-db" },
 { name: "내 연봉 제보하기", href: "/salary-db/submit" },
 { name: "2026 연봉 표", href: "/table/2026/annual" },
 { name: "2026 월급 표", href: "/table/2026/monthly" },
 { name: "2026 세율표", href: "/tax-rates-2026" },
 { name: "2026 4대보험 요율", href: "/social-insurance-rates-2026" },
 ],
 },
 {
 name: "금융 가이드",
 type: "dropdown",
 items: [
 { name: "전체 가이드", href: "/guides" },
 { name: "직장인 꿀팁 모음", href: "/tips" },
 { name: "Q&A", href: "/qna" },
 { name: "용어 사전", href: "/glossary" },
 { name: "2026 세법 변경", href: "/tax-changes-2026" },
 { name: "연말정산 체크리스트", href: "/year-end-tax-checklist" },
 ],
 },
 {
 name: "Fun/Lab",
 type: "dropdown",
 items: [
 { name: "전체 보기", href: "/fun" },
 { name: "멘사급 IQ 테스트", href: "/fun/iq-test" },
 { name: "부자 DNA 테스트", href: "/fun/rich-dna-test" },
 { name: "연봉 상위 1% 계산기", href: "/fun/rank" },
 { name: "인생 2회차 게임", href: "/fun/reincarnation" },
 { name: "월급쟁이 테트리스", href: "/fun/tetris" },
 ],
 },
 {
 name: "계산기 도구",
 type: "dropdown",
 items: [
 { name: "전체 30종 보기", href: "/tools" },
 { name: "🔥 성과급 세금 계산기", href: "/tools/finance/bonus" },
 { name: "퇴직금 세금 계산기", href: "/tools/finance/severance" },
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
 name: "생활 금융",
 type: "dropdown",
 items: [
 { name: "자동차 구매", href: "/car-loan" },
 { name: "FIRE 계산기", href: "/fire-calculator" },
 { name: "2026 재물운 사주", href: "/fortune-2026" },
 { name: "로또 번호 생성", href: "/lotto" },
 ],
 },
];
