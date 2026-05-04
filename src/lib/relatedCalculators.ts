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
 "/dashboard": ["salary"],
 "/salary-db": ["salary"],
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
 : currentPath;

 const categories = PATH_RECOMMENDATIONS[normalizedPath] || ["salary"];
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
