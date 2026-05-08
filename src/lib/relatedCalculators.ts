// src/lib/relatedCalculators.ts
//
// 페이지 간 cross-link 매핑.
// 사용자가 한 계산기를 끝낸 후 자연스럽게 이동할 다음 도구 추천.
// 내부 링크 강화로 SEO + 평균 페이지뷰/세션 개선.

import { getCalculatorBySlug } from "./simpleCalculators";

export interface RelatedItem {
 path: string;
 title: string;
 description: string;
 icon?: string; // lucide icon name
}

// CalculatorDef.category → CATEGORY_RECOMMENDATIONS 키 매핑
const CALC_CATEGORY_TO_REC: Record<string, string[]> = {
 tax: ["tax", "salary"],
 salary: ["salary", "tax"],
 loan: ["loan", "realEstate"],
 "real-estate": ["realEstate", "loan"],
 investment: ["investment", "salary"],
 insurance: ["insurance", "salary"],
 business: ["business", "tax"],
 life: ["life"],
 health: ["life"],
 family: ["life", "tax"],
 career: ["career", "salary"],
 currency: ["investment", "life"],
};

/**
 * 카테고리별 추천 카탈로그 (RelatedCalculators.tsx에서 fallback으로 사용).
 */
export const CATEGORY_RECOMMENDATIONS: Record<string, RelatedItem[]> = {
 salary: [
 { path: "/year-end-tax", title: "연말정산 계산기", description: "13월의 월급 미리 계산", icon: "Receipt" },
 { path: "/home-loan", title: "주택담보대출 계산기", description: "내 연봉으로 받을 수 있는 한도", icon: "Home" },
 { path: "/tools/finance/severance", title: "퇴직금 계산기", description: "환산급여 방식 정확 계산", icon: "Briefcase" },
 { path: "/salary-db", title: "회사별 연봉", description: "동급 회사 평균 비교", icon: "Building2" },
 ],
 loan: [
 { path: "/tools/real-estate/dsr", title: "DSR 한도 계산기", description: "총부채원리금상환비율", icon: "Percent" },
 { path: "/tools/real-estate/ltv", title: "LTV 담보인정비율", description: "주택담보대출 한도", icon: "Scale" },
 { path: "/tools/finance/installment", title: "할부 이자 계산기", description: "신용카드 할부·카드론", icon: "CreditCard" },
 { path: "/", title: "연봉 실수령액", description: "내 월급 정확히 계산", icon: "Calculator" },
 ],
 tax: [
 { path: "/year-end-tax", title: "연말정산 계산기", description: "환급액 미리 계산", icon: "Receipt" },
 { path: "/tools/finance/bonus", title: "성과급 세금 계산기", description: "2026 연봉합산 세율", icon: "Gift" },
 { path: "/tools/finance/freelance-tax", title: "프리랜서 종합소득세", description: "사업소득 계산", icon: "Laptop" },
 { path: "/tools/finance/irp", title: "IRP·연금저축 절세", description: "최대 900만원 공제", icon: "Building2" },
 ],
 investment: [
 { path: "/tools/finance/compound", title: "복리 계산기", description: "적립식 자산 시뮬", icon: "Zap" },
 { path: "/tools/finance/cagr", title: "CAGR 연평균 수익률", description: "투자 기간별 수익률", icon: "TrendingUp" },
 { path: "/tools/deposit", title: "예적금 만기 계산기", description: "이자·원리금 계산", icon: "PiggyBank" },
 { path: "/fire-calculator", title: "FIRE 조기은퇴", description: "경제적 자유 시뮬", icon: "Flame" },
 ],
 realEstate: [
 { path: "/tools/real-estate/acquisition-tax", title: "취득세 계산기", description: "주택·토지 취득세", icon: "Home" },
 { path: "/tools/real-estate/gift-tax", title: "증여세 계산기", description: "가족 간 증여 한도", icon: "Heart" },
 { path: "/home-loan", title: "주택담보대출", description: "모기지 시뮬레이션", icon: "Home" },
 { path: "/tools/real-estate/dsr", title: "DSR 한도", description: "총부채원리금상환비율", icon: "Percent" },
 ],
 life: [
 { path: "/tools/life/dutch-pay", title: "더치페이 계산기", description: "인원별 금액 분배", icon: "Users" },
 { path: "/tools/life/fuel-cost", title: "연비·유류비", description: "주유비용 계산", icon: "Fuel" },
 { path: "/tools/life/subscription", title: "구독 비용", description: "월 총 구독료 분석", icon: "CreditCard" },
 { path: "/tools/life/unit-converter", title: "단위 변환기", description: "길이·무게·온도", icon: "RefreshCw" },
 ],
 company: [
 { path: "/salary-db", title: "회사별 연봉 DB", description: "동급 회사 평균 비교", icon: "Building2" },
 { path: "/company/compare", title: "회사 비교", description: "두 회사 연봉·복지 비교", icon: "GitCompare" },
 { path: "/company/simulator", title: "회사 이직 시뮬", description: "이직 시 실수령 변화", icon: "ArrowLeftRight" },
 { path: "/year-end-tax", title: "연말정산 계산기", description: "13월의 월급", icon: "Receipt" },
 ],
 career: [
 { path: "/pro/career-planner", title: "커리어 플래너", description: "5·10년 연봉 시뮬", icon: "TrendingUp" },
 { path: "/mbti-salary", title: "MBTI 연봉", description: "성향별 연봉 분석", icon: "Brain" },
 { path: "/fire-calculator", title: "FIRE 조기은퇴", description: "경제적 자유 시뮬", icon: "Flame" },
 { path: "/report", title: "내 연봉 리포트", description: "동종업계 비교 분석", icon: "BarChart3" },
 ],
 season: [
 { path: "/year-end-tax-settlement-2026", title: "2026 연말정산", description: "환급금·성과급 가이드", icon: "Receipt" },
 { path: "/health-insurance-2026", title: "건강보험료 정산", description: "7월 정산금 분석", icon: "HeartPulse" },
 { path: "/new-employee-2026", title: "2026 신입사원 가이드", description: "첫 월급·4대보험", icon: "Sparkles" },
 { path: "/tax-rates-2026", title: "2026 세율표", description: "소득세·4대보험율", icon: "Percent" },
 ],
 retirement: [
 { path: "/tools/finance/severance", title: "퇴직금 계산기", description: "환산급여 방식", icon: "Briefcase" },
 { path: "/tools/finance/irp", title: "IRP·연금저축", description: "최대 900만원 공제", icon: "PiggyBank" },
 { path: "/retirement-pension-2026", title: "2026 퇴직연금", description: "DC/DB 비교", icon: "Calendar" },
 { path: "/fire-calculator", title: "FIRE 시뮬", description: "조기은퇴 자산 목표", icon: "Flame" },
 ],
 insurance: [
 { path: "/health-insurance-2026", title: "건보료 정산", description: "7월 추가 납부·환급", icon: "HeartPulse" },
 { path: "/social-insurance-rates-2026", title: "4대보험 요율", description: "2026 최신 요율", icon: "Shield" },
 { path: "/", title: "연봉 실수령액", description: "4대보험 차감 후", icon: "Calculator" },
 { path: "/year-end-tax", title: "연말정산", description: "보험료 공제 반영", icon: "Receipt" },
 ],
 business: [
 { path: "/tools/finance/freelance-tax", title: "프리랜서 종합소득세", description: "사업소득 계산", icon: "Laptop" },
 { path: "/tools/finance/vat", title: "부가세 계산기", description: "분기별 신고세액", icon: "FileText" },
 { path: "/tools/finance/irp", title: "IRP 절세", description: "사업자 노란우산", icon: "PiggyBank" },
 { path: "/year-end-tax", title: "연말정산", description: "사업소득 합산", icon: "Receipt" },
 ],
 date: [
 { path: "/tools/date/age", title: "나이 계산기", description: "만 나이·연 나이", icon: "Calendar" },
 { path: "/tools/date/d-day", title: "D-day 계산기", description: "기념일 카운트다운", icon: "Clock" },
 { path: "/tools/date/work-days", title: "근무일 계산", description: "주말·공휴일 제외", icon: "CalendarDays" },
 { path: "/tools/finance/severance", title: "퇴직금 계산", description: "근속일수 기반", icon: "Briefcase" },
 ],
 fun: [
 { path: "/fun/salary-rank", title: "연봉 랭킹", description: "내 연봉 순위", icon: "Trophy" },
 { path: "/fun/salary-battle", title: "연봉 배틀", description: "친구와 비교", icon: "Swords" },
 { path: "/mbti-salary", title: "MBTI 연봉", description: "성향별 연봉", icon: "Brain" },
 { path: "/fun/financial-mbti", title: "금융 MBTI", description: "재테크 성향", icon: "Brain" },
 ],
};

/**
 * 경로별 명시적 추천 매핑.
 * 카테고리보다 더 구체적인 cross-link 제공.
 */
const PATH_RECOMMENDATIONS: Record<string, string[]> = {
 "/": ["salary"],
 "/home-loan": ["loan", "realEstate"],
 "/car-loan": ["loan"],
 "/year-end-tax": ["tax", "salary"],
 "/fire-calculator": ["investment", "salary"],
 "/calc/2026-year": ["salary", "tax"],
 "/tools": ["salary", "loan", "tax"],
 "/tools/loan": ["loan"],
 "/tools/deposit": ["investment"],
 "/tools/finance/bonus": ["tax", "salary"],
 "/tools/finance/severance": ["salary", "tax"],
 "/tools/finance/freelance-tax": ["tax"],
 "/tools/finance/stock-tax": ["tax", "investment"],
 "/tools/finance/cagr": ["investment"],
 "/tools/finance/compound": ["investment"],
 "/tools/finance/installment": ["loan"],
 "/tools/finance/irp": ["tax", "investment"],
 "/tools/finance/vat": ["tax"],
 "/tools/real-estate/acquisition-tax": ["realEstate", "tax"],
 "/tools/real-estate/gift-tax": ["realEstate", "tax"],
 "/tools/real-estate/dsr": ["realEstate", "loan"],
 "/tools/real-estate/ltv": ["realEstate", "loan"],
 "/tools/life/dutch-pay": ["life"],
 "/tools/life/fuel-cost": ["life"],
 "/tools/life/subscription": ["life"],
 "/tools/life/unit-converter": ["life"],
 "/dashboard": ["salary", "career"],
 "/salary-db": ["company", "salary"],
 "/salary-db/submit": ["company", "salary"],
 // ── 시즌 정보 페이지 (11개) ──────────────────────────
 "/year-end-tax-settlement-2026": ["tax", "season", "salary"],
 "/year-end-tax-2026": ["tax", "season"],
 "/year-end-tax-checklist": ["tax", "season"],
 "/health-insurance-2026": ["insurance", "season", "salary"],
 "/new-employee-2026": ["salary", "career", "season"],
 "/tax-rates-2026": ["tax", "salary"],
 "/social-insurance-rates-2026": ["insurance", "salary"],
 "/tax-changes-2026": ["tax", "season"],
 "/retirement-pension-2026": ["retirement", "season", "salary"],
 "/career-stages-2026": ["career", "salary"],
 "/fortune-2026": ["fun", "career"],
 // ── 시즌 calc 페이지 (11개) ──────────────────────────
 "/calc/year-end-bonus": ["tax", "salary", "season"],
 "/calc/year-end-bonus-tax": ["tax", "season"],
 "/calc/incentive-tax": ["tax", "salary"],
 "/calc/january-bonus": ["tax", "season"],
 "/calc/severance-vs-pension": ["retirement", "salary"],
 "/calc/holiday-bonus": ["tax", "season"],
 "/calc/vacation-pay": ["salary", "career"],
 "/calc/child-deduction": ["tax", "season"],
 "/calc/jeonse-loan": ["realEstate", "loan"],
 "/calc/housing-subscription": ["realEstate"],
 // ── Tools 추가 ──────────────────────────────────────
 "/tools/date/age": ["date", "life"],
 "/tools/date/d-day": ["date", "life"],
 "/tools/date/work-days": ["date", "career"],
 "/tools/health/bmi": ["life"],
 "/tools/math/percent": ["life", "investment"],
 "/tools/math/number-gen": ["life", "fun"],
 "/tools/math": ["life"],
 // ── 메인 페이지 추가 ─────────────────────────────────
 "/mbti-salary": ["career", "fun"],
 "/lotto": ["fun", "investment"],
 "/report": ["company", "salary"],
 "/tips": ["tax", "salary"],
 "/qna": ["tax", "salary"],
 "/glossary": ["tax", "investment"],
 "/guides": ["tax", "salary", "investment"],
 // ── 회사 페이지 ─────────────────────────────────────
 "/company": ["company", "salary"],
 "/company/compare": ["company", "salary"],
 "/company/simulator": ["company", "career"],
 // ── 프리미엄 ────────────────────────────────────────
 "/pro/career-planner": ["career", "salary"],
 // ── Fun 페이지 (체류시간 + 내부 링크 그래프) ─────────
 "/fun": ["fun"],
 "/fun/salary-rank": ["fun", "career"],
 "/fun/salary-battle": ["fun", "career"],
 "/fun/financial-mbti": ["fun", "investment"],
 "/fun/mbti-salary": ["career", "fun"],
 "/fun/rich-dna-test": ["fun", "investment"],
 "/fun/asset-allocator": ["investment", "fun"],
 "/fun/escape-plan": ["career", "retirement"],
 "/fun/spending-test": ["life", "fun"],
 "/fun/fortune": ["fun"],
 "/fun/lunch-roulette": ["life", "fun"],
 "/fun/random-draw": ["fun"],
 "/fun/rank": ["fun", "career"],
 "/fun/reincarnation": ["fun"],
 "/fun/salary-slip": ["salary", "fun"],
 "/fun/weekend-duty": ["career", "fun"],
 "/fun/what-to-buy": ["life", "fun"],
 "/fun/worldcup": ["fun"],
 "/fun/iq-test": ["fun"],
 "/fun/flappy": ["fun"],
 "/fun/tetris": ["fun"],
 "/fun/meme-coin": ["investment", "fun"],
 // ── Salary DB 진입 ──────────────────────────────────
 "/salary": ["salary", "company"],
 // ── Phase 3 핫 키워드 군집 시즌 페이지 ─────────────────
 "/unemployment-benefit-2026": ["salary", "career", "season"],
 "/parental-leave-2026": ["salary", "season", "career"],
 "/salary-grade/civil-servant-2026": ["salary", "career", "company"],
 "/salary-grade": ["salary", "career"],
 // ── Phase 3 batch3 calc 명시 매핑 ─────────────────────
 "/calc/unemployment-benefit-amount": ["salary", "career"],
 "/calc/unemployment-benefit-period": ["salary", "career"],
 "/calc/parental-leave-benefit": ["salary", "career"],
 "/calc/maternity-leave-benefit": ["salary", "career"],
 "/calc/auto-tax-annual": ["tax"],
 "/calc/auto-tax-acquisition": ["tax", "realEstate"],
 "/calc/auto-tax-discount": ["tax", "season"],
 "/calc/jeonse-monthly-conversion": ["realEstate", "loan"],
 "/calc/gap-investment-quick": ["realEstate", "investment"],
 // ── 영문 페이지 (현재 5개 — Phase 1.3 hreflang 페어와 함께 동작) ──
 "/en": ["salary", "tax"],
 "/en/flat-tax": ["tax"],
 "/en/salary-converter": ["salary"],
 "/en/guides": ["tax", "salary", "investment"],
 "/global": ["salary"],
};

/**
 * 주어진 경로에 대해 추천할 다른 계산기 N개 반환.
 * 우선순위: PATH_RECOMMENDATIONS → category fallback → salary 기본값.
 * 자기 자신(currentPath)은 자동 제외.
 */
export function getRelatedCalculators(
 currentPath: string,
 limit = 4
): RelatedItem[] {
 // /salary/[amount] 같은 동적 경로 처리
 const normalizedPath = currentPath.startsWith("/salary/")
 ? "/"
 : currentPath.startsWith("/salary-db/")
 ? "/salary-db"
 : currentPath.startsWith("/job/")
 ? "/salary-db"
 : currentPath.startsWith("/hourly/")
 ? "/"
 : currentPath.startsWith("/monthly/")
 ? "/"
 : currentPath.startsWith("/year/")
 ? "/tax-rates-2026"
 : currentPath;

 // /calc/[slug] 동적 경로 — 명시 매핑 없으면 calc.category에서 자동 추론
 let categories = PATH_RECOMMENDATIONS[normalizedPath];
 if (!categories && normalizedPath.startsWith("/calc/")) {
 const slug = normalizedPath.slice("/calc/".length);
 const calc = getCalculatorBySlug(slug);
 if (calc) {
 categories = CALC_CATEGORY_TO_REC[calc.category] || ["salary"];
 }
 }
 if (!categories) categories = ["salary"];

 const seen = new Set<string>([currentPath, normalizedPath]);
 const items: RelatedItem[] = [];

 for (const category of categories) {
 const recs = CATEGORY_RECOMMENDATIONS[category] || [];
 for (const item of recs) {
 if (seen.has(item.path) || items.length >= limit) continue;
 items.push(item);
 seen.add(item.path);
 }
 if (items.length >= limit) break;
 }

 // 부족하면 salary로 채움
 if (items.length < limit) {
 const fallback = CATEGORY_RECOMMENDATIONS.salary || [];
 for (const item of fallback) {
 if (seen.has(item.path) || items.length >= limit) continue;
 items.push(item);
 seen.add(item.path);
 }
 }

 return items.slice(0, limit);
}
