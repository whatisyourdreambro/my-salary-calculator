// src/lib/nextActionLinks.ts
//
// 결과 직하 3-CTA(NextActions)와 /calc 결과 핀의 "href 정본" — React 없이 서버 컴포넌트·테스트가 참조.
//
// 배경(2026-09-12 S2-3, NAV-06): 홈·/salary 416쪽·/calc 72쪽에서 NextActions·RelatedCalculators·
// 결과 핀이 같은 대상을 반복했다. 페이지가 위 블록의 href 를 아래 블록(RelatedCalculators)에
// exclude 로 넘겨 중복을 없앤다.
//
// ★ 규칙(2026-08-16 광고 위 UI 불변): 중복 제거는 "제외 + 채움" 뿐이다. 제외된 자리는
//   getRelatedCalculators 의 salary 폴백이 다시 채워 블록 개수(limit)가 그대로이므로 광고 위 높이가
//   변하지 않는다. 어떤 블록도 항목 수를 줄이지 말 것.
//
// 이 파일은 클라이언트 컴포넌트(SalaryCalculator 등)도 import 하므로 계산기 레지스트리
// (@/lib/simpleCalculators index, 507KB)를 절대 import 하지 말 것 — 타입만 가져온다.
// 카드 문구·아이콘은 NextActions.tsx 가 그대로 갖고, 두 목록이 어긋나지 않도록
// src/lib/__tests__/nextLinkDedup.test.ts 가 buildActions ↔ nextActionHrefs 를 전 카테고리 대조한다.

import type { CalculatorDef, ClientCalculatorDef } from "@/lib/simpleCalculators/types";

export type NextActionCategory =
 | "salary"
 | "loan"
 | "tax"
 | "insurance"
 | "investment"
 | "real-estate";

// NextActions.tsx buildActions 와 같은 순서. salary/미지정은 annualSalary 유무로 문구만 달라지고
// href 집합은 같다(주담대·회사별 연봉·연말정산).
const LOAN_HREFS = ["/home-loan", "/calc/jeonse-loan", "/property-holding-tax-2026"] as const;
const TAX_HREFS = ["/year-end-tax", "/tools/finance/freelance-tax", "/salary-db"] as const;
const INSURANCE_HREFS = ["/health-insurance-2026", "/calc/medical-expense-coverage", "/fire-calculator"] as const;
const INVESTMENT_HREFS = ["/calc/compound-interest-quick", "/calc/stock-capital-gains-quick", "/fire-calculator"] as const;
const SALARY_HREFS = ["/home-loan", "/salary-db", "/year-end-tax"] as const;

function hrefsOf(category: NextActionCategory | undefined): readonly string[] {
 if (category === "loan" || category === "real-estate") return LOAN_HREFS;
 if (category === "tax") return TAX_HREFS;
 if (category === "insurance") return INSURANCE_HREFS;
 if (category === "investment") return INVESTMENT_HREFS;
 return SALARY_HREFS;
}

/**
 * NextActions 가 해당 카테고리에서 렌더하는 href 목록(렌더 순서).
 * currentPath 를 주면 NextActions 와 동일하게 자기 자신 링크를 뺀다.
 */
export function nextActionHrefs(
 category?: NextActionCategory,
 currentPath?: string
): string[] {
 const hrefs = hrefsOf(category);
 return currentPath ? hrefs.filter((h) => h !== currentPath) : [...hrefs];
}

/**
 * /calc/[slug] 계산기 데이터 category → NextActions 카테고리.
 * 매핑이 없는 생활·사업·가족·커리어·환율 계산기는 undefined(NextActions 미렌더).
 */
export function mapToNextActionCategory(
 cat: CalculatorDef["category"]
): NextActionCategory | undefined {
 switch (cat) {
 case "loan":
 case "real-estate":
 return cat;
 case "tax":
 return "tax";
 case "insurance":
 case "health":
 return "insurance";
 case "investment":
 return "investment";
 case "salary":
 return "salary";
 default:
 return undefined;
 }
}

/**
 * /calc/[slug] 의 결과 직후 핀(SimpleCalculatorView calc-next-pins)과 관련 계산기 카드 그리드가
 * 가리키는 href 전부 — 정밀 계산기(precisionTwin) + relatedCards → /calc/{slug}.
 * 핀은 카드 그리드의 부분집합이므로 둘을 한 블록으로 본다. 서버가 만든 ClientCalculatorDef 만 받아
 * 레지스트리를 다시 읽지 않는다.
 */
export function calcPinHrefs(
 calc: Pick<ClientCalculatorDef, "precisionTwin" | "relatedCards">
): string[] {
 const out: string[] = [];
 if (calc.precisionTwin) out.push(calc.precisionTwin.href);
 for (const rel of calc.relatedCards ?? []) out.push(`/calc/${rel.slug}`);
 return out;
}
