// src/lib/relatedCalculators.ts
//
// 페이지 간 cross-link 매핑.
// 사용자가 한 계산기를 끝낸 후 자연스럽게 이동할 다음 도구 추천.
// 내부 링크 강화로 SEO + 평균 페이지뷰/세션 개선.

export interface RelatedItem {
 path: string;
 title: string;
 description: string;
 icon?: string; // lucide icon name
}

/**
 * 카테고리별 추천 카탈로그 (RelatedCalculators.tsx에서 fallback으로 사용).
 */
export const CATEGORY_RECOMMENDATIONS: Record<string, RelatedItem[]> = {
 salary: [
 { path: "/", title: "연봉 실수령액 계산기", description: "4대보험·세금 자동 공제", icon: "Calculator" },
 { path: "/calc/samsung-bonus", title: "삼성전자 성과급 계산기", description: "OPI·TAI 세후 실수령 시뮬", icon: "Gift" },
 { path: "/weekly-holiday-allowance-2026", title: "주휴수당 계산기", description: "주 15시간+ 알바 필수", icon: "Calendar" },
 { path: "/year-end-tax", title: "연말정산 계산기", description: "13월의 월급 미리 계산", icon: "Receipt" },
 { path: "/tools/finance/severance", title: "퇴직금 계산기", description: "환산급여 방식 정확 계산", icon: "Briefcase" },
 { path: "/salary-db", title: "회사별 연봉", description: "동급 회사 평균 비교", icon: "Building2" },
 ],
 // 회사 성과급 계산기 클러스터 전용 — 수익 #1(/calc/samsung-bonus) 방문자를
 // 수익 #3(홈 계산기)·#2(/salary-db)와 절세·순위 도구로 순환시키는 동선
 bonus: [
 { path: "/", title: "연봉 실수령액 계산기", description: "성과급 합산 연봉 세후 계산", icon: "Calculator" },
 { path: "/calc/samsung-bonus", title: "삼성전자 성과급 계산기", description: "OPI·TAI 세후 실수령 시뮬", icon: "Gift" },
 { path: "/salary-db", title: "회사별 연봉 데이터베이스", description: "480+ 기업 평균 연봉·복지 비교", icon: "Building2" },
 { path: "/tools/finance/irp", title: "IRP·연금저축 절세", description: "성과급 세액공제 환급 극대화", icon: "PiggyBank" },
 { path: "/fun/salary-rank", title: "연봉 순위 테스트", description: "내 연봉+성과급 상위 몇 %?", icon: "TrendingUp" },
 { path: "/tools/finance/bonus", title: "성과급 세금 계산기", description: "회사 무관 일반 성과급 세후", icon: "Gift" },
 ],
 loan: [
 { path: "/tools/real-estate/dsr", title: "DSR 한도 계산기", description: "총부채원리금상환비율", icon: "Percent" },
 { path: "/tools/real-estate/ltv", title: "LTV 담보인정비율", description: "주택담보대출 한도", icon: "Scale" },
 { path: "/savings-interest-2026", title: "적금·예금 이자 계산기", description: "정기적금/예금 만기 원리금", icon: "PiggyBank" },
 { path: "/tools/finance/installment", title: "할부 이자 계산기", description: "신용카드 할부·카드론", icon: "CreditCard" },
 { path: "/", title: "연봉 실수령액", description: "내 월급 정확히 계산", icon: "Calculator" },
 ],
 tax: [
 { path: "/income-tax-2026", title: "종합소득세 계산기", description: "8단계 누진세율 + 지방소득세", icon: "Receipt" },
 { path: "/health-insurance-fee-2026", title: "건강보험료 계산기", description: "본인부담 3.595% + 장기요양 합산 약 4.07%", icon: "Heart" },
 { path: "/year-end-tax", title: "연말정산 계산기", description: "환급액 미리 계산", icon: "Receipt" },
 { path: "/tools/finance/bonus", title: "성과급 세금 계산기", description: "2026 연봉합산 세율", icon: "Gift" },
 { path: "/tools/finance/freelance-tax", title: "프리랜서 종합소득세", description: "사업소득 계산", icon: "Laptop" },
 { path: "/tools/finance/irp", title: "IRP·연금저축 절세", description: "최대 900만원 공제", icon: "Building2" },
 ],
 investment: [
 { path: "/savings-interest-2026", title: "적금·예금 이자 계산기", description: "정기적금/예금 단리·복리", icon: "PiggyBank" },
 { path: "/national-pension-estimate-2026", title: "국민연금 예상수령액", description: "가입기간별 월 노령연금", icon: "Building2" },
 { path: "/tools/finance/compound", title: "복리 계산기", description: "적립식 자산 시뮬", icon: "Zap" },
 { path: "/tools/finance/cagr", title: "CAGR 연평균 수익률", description: "투자 기간별 수익률", icon: "TrendingUp" },
 { path: "/fire-calculator", title: "FIRE 조기은퇴", description: "경제적 자유 시뮬", icon: "Flame" },
 ],
 realEstate: [
 { path: "/property-holding-tax-2026", title: "부동산 보유세 계산기", description: "재산세 + 종부세 통합 산출", icon: "Home" },
 { path: "/tools/real-estate/acquisition-tax", title: "취득세 계산기", description: "주택·토지 취득세", icon: "Home" },
 { path: "/auto-tax-2026", title: "자동차세 계산기", description: "배기량·차령·연납 5% 공제", icon: "Calculator" },
 { path: "/tools/real-estate/gift-tax", title: "증여세 계산기", description: "가족 간 증여 한도", icon: "Heart" },
 { path: "/home-loan", title: "주택담보대출", description: "모기지 시뮬레이션", icon: "Home" },
 { path: "/tools/real-estate/dsr", title: "DSR 한도", description: "총부채원리금상환비율", icon: "Percent" },
 ],
 life: [
 { path: "/hub/daily-life", title: "생활·건강·가족 허브", description: "생활비·건강·육아 계산기 모음", icon: "Users" },
 { path: "/tools/life/dutch-pay", title: "더치페이 계산기", description: "인원별 금액 분배", icon: "Users" },
 { path: "/tools/life/fuel-cost", title: "연비·유류비", description: "주유비용 계산", icon: "Fuel" },
 { path: "/tools/life/subscription", title: "구독 비용", description: "월 총 구독료 분석", icon: "CreditCard" },
 { path: "/tools/life/unit-converter", title: "단위 변환기", description: "길이·무게·온도", icon: "RefreshCw" },
 ],
 insurance: [
 { path: "/hub/insurance", title: "보험 점검 허브", description: "보장액·보험료 계산기 모음", icon: "Heart" },
 { path: "/calc/life-insurance-needs", title: "생명보험 필요 보장액", description: "부양가족 기준 적정 보장액", icon: "Heart" },
 { path: "/calc/auto-insurance-quick", title: "자동차보험 견적", description: "차종·연령별 평균 보험료", icon: "Calculator" },
 { path: "/health-insurance-fee-2026", title: "건강보험료 계산기", description: "직장/지역 가입자 본인 부담", icon: "Heart" },
 ],
 business: [
 { path: "/hub/business", title: "사장님·프리랜서 허브", description: "수익·인건비·세금 계산 모음", icon: "Briefcase" },
 { path: "/calc/business-margin-quick", title: "사업 마진율", description: "매출·원가로 마진율 산출", icon: "TrendingUp" },
 { path: "/calc/employee-cost-quick", title: "직원 인건비", description: "4대보험 포함 회사 실부담", icon: "Users" },
 { path: "/tools/finance/freelance-tax", title: "프리랜서 종합소득세", description: "3.3% 원천징수·종소세", icon: "Laptop" },
 ],
 health: [
 { path: "/hub/daily-life", title: "생활·건강·가족 허브", description: "건강·생활비 계산기 모음", icon: "Heart" },
 { path: "/calc/bmi-quick", title: "BMI 비만도", description: "체중·신장으로 비만도 판정", icon: "Heart" },
 { path: "/calc/daily-calorie-quick", title: "일일 권장 칼로리", description: "BMR × 활동지수", icon: "Zap" },
 { path: "/tools/health/bmi", title: "BMI 상세 계산기", description: "성인 비만도 기준표", icon: "Heart" },
 ],
 family: [
 { path: "/hub/daily-life", title: "생활·건강·가족 허브", description: "결혼·육아 비용 계산 모음", icon: "Users" },
 { path: "/calc/baby-yearly-cost", title: "자녀 양육비 1년차", description: "출산·기저귀·분유 합산", icon: "Heart" },
 { path: "/calc/education-cost-cumulative", title: "교육비 18년 누적", description: "유치원~대학 누적 교육비", icon: "TrendingUp" },
 { path: "/parental-leave", title: "육아휴직 급여", description: "월 급여별 수령액 계산", icon: "Calendar" },
 ],
};

/**
 * /calc/[slug] 동적 계산기의 데이터 category → 추천 카탈로그 키 매핑.
 * 계산기 데이터 전체를 클라이언트 번들에 싣지 않도록, 페이지(서버)에서
 * calc.category 문자열만 prop으로 내려받아 여기서 변환한다.
 * 목적: calc 클러스터 내부 순환 링크 형성 (GSC 발견됨-미색인 해소).
 */
const CALC_DATA_CATEGORY_MAP: Record<string, string[]> = {
 salary: ["salary"],
 tax: ["tax"],
 loan: ["loan"],
 investment: ["investment"],
 "real-estate": ["realEstate", "loan"],
 insurance: ["insurance"],
 business: ["business", "tax"],
 life: ["life"],
 currency: ["life", "investment"],
 health: ["health"],
 family: ["family"],
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
 // 회사별 성과급 계산기 — bonus 카테고리 우선 (홈 계산기·salary-db·절세로 순환)
 "/calc/samsung-bonus": ["bonus", "tax"],
 "/calc/sk-hynix-bonus": ["bonus", "tax"],
 "/calc/hyundai-bonus": ["bonus", "tax"],
 "/calc/kia-bonus": ["bonus", "tax"],
 "/calc/lg-energy-bonus": ["bonus", "tax"],
 "/calc/hd-hyundai-bonus": ["bonus", "tax"],
 "/calc/naver-bonus": ["bonus", "tax"],
 "/calc/kakao-bonus": ["bonus", "tax"],
 "/calc/posco-bonus": ["bonus", "tax"],
 "/calc/samsung-sdi-bonus": ["bonus", "tax"],
 "/calc/lg-chem-bonus": ["bonus", "tax"],
 "/salary-raise-2026": ["salary", "tax"],
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
 "/dashboard": ["salary"],
 // 회사 페이지: 회사명 검색 사용자는 본인 연봉 시뮬레이션·연말정산·퇴직금에 관심 높음 → tax 카테고리 추가
 "/salary-db": ["salary", "tax"],
 // 비교 페이지: 두 회사 비교 후 본인 연봉 분석으로 이동 동선
 "/salary-db/compare": ["salary", "tax"],
 // 직업·산업·지역 페이지: 본인 연봉 시뮬레이션/세금 계산기로의 cross-link (세션당 PV ↑)
 "/job": ["salary", "tax"],
 "/industry": ["salary", "tax"],
 "/region": ["salary"],
 // 14차 — 7차/11차 신설 시즌 계산기 dead-end 차단
 "/auto-tax-2026": ["realEstate", "tax"],
 "/weekly-holiday-allowance-2026": ["salary"],
 "/income-tax-2026": ["tax", "salary"],
 "/property-holding-tax-2026": ["realEstate", "tax"],
 "/health-insurance-fee-2026": ["tax", "salary"],
 // 건보 정산 가이드 — tax 2순위가 건보료 계산기라 주제 정합 추천이 자동 노출
 "/health-insurance-2026": ["tax", "salary"],
 "/national-pension-estimate-2026": ["investment", "tax"],
 "/savings-interest-2026": ["investment", "loan"],
};

/**
 * 주어진 경로에 대해 추천할 다른 계산기 N개 반환.
 * 우선순위: PATH_RECOMMENDATIONS → category fallback → salary 기본값.
 * 자기 자신(currentPath)은 자동 제외.
 */
export function getRelatedCalculators(
 currentPath: string,
 limit = 4,
 calcCategory?: string
): RelatedItem[] {
 // /salary/[amount] 같은 동적 경로 처리
 const normalizedPath = currentPath.startsWith("/salary/")
 ? "/"
 : currentPath.startsWith("/salary-db/compare/")
 ? "/salary-db/compare"
 : currentPath.startsWith("/salary-db/")
 ? "/salary-db"
 : currentPath.startsWith("/job/")
 ? "/job"
 : currentPath.startsWith("/industry/")
 ? "/industry"
 : currentPath.startsWith("/region/")
 ? "/region"
 : currentPath;

 // /calc/[slug]: 명시 매핑이 없으면 계산기 데이터 category 기반으로 같은
 // 클러스터(허브+형제 계산기)를 추천 — 이전엔 전부 salary 폴백이라 calc
 // 내부 순환 링크가 0이었음.
 const calcClusterCategories =
 !PATH_RECOMMENDATIONS[normalizedPath] &&
 normalizedPath.startsWith("/calc/") &&
 calcCategory
 ? CALC_DATA_CATEGORY_MAP[calcCategory]
 : undefined;

 const categories =
 PATH_RECOMMENDATIONS[normalizedPath] || calcClusterCategories || ["salary"];
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
