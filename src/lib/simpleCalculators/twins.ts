// src/lib/simpleCalculators/twins.ts
//
// 간이(quick) 계산기 → 같은 의도의 정밀 페이지(/tools·전용 페이지) 매핑 (2026-09-11 검색의도 감사).
//
// 배경: 복리·대출·DSR·퇴직금·증여세·부가세·실업급여 등 ~30개 간이 계산기가 전용 페이지와 같은
// 검색어를 노리는데, 간이 쪽에서 정밀 쪽으로 가는 링크가 0건이었다(관련 추천이 얇은 간이 계산기끼리만
// 순환). 결과 직후 "정밀 계산기" 링크 한 줄로 방문자를 더 풍부한 페이지(차트·광고 슬롯·본문)로 보낸다.
// canonical 통합(noindex/alternates)은 별도 판단 사항 — 여기서는 내부 링크만 만든다.
// 대상 라우트 실존 여부는 src/lib/__tests__/calcSeo.test.ts 가 src/app/**/page.tsx 로 검사한다.

export interface PrecisionTwin {
  href: string;
  title: string;
}

export const PRECISION_TWINS: Record<string, PrecisionTwin> = {
  "compound-interest-quick": { href: "/tools/finance/compound", title: "복리 계산기 상세" },
  "cagr-quick": { href: "/tools/finance/cagr", title: "CAGR 계산기 상세" },
  "loan-monthly-payment": { href: "/tools/loan", title: "대출 이자 계산기 (상환 방식 비교)" },
  "loan-total-interest": { href: "/tools/loan", title: "대출 이자 계산기 (상환 방식 비교)" },
  "level-principal-payment": { href: "/tools/loan", title: "대출 이자 계산기 (원금균등 상세)" },
  "bullet-loan": { href: "/tools/loan", title: "대출 이자 계산기 (만기일시 상세)" },
  "mortgage-monthly-quick": { href: "/home-loan", title: "주택담보대출 계산기 상세" },
  "monthly-installment": { href: "/tools/finance/installment", title: "할부 이자 계산기 상세" },
  "dsr-quick": { href: "/tools/real-estate/dsr", title: "DSR 계산기 상세" },
  "loan-affordability": { href: "/tools/real-estate/dsr", title: "DSR·대출 한도 계산기 상세" },
  "ltv-quick": { href: "/tools/real-estate/ltv", title: "LTV 계산기 상세" },
  "severance-pay-quick": { href: "/tools/finance/severance", title: "퇴직금 계산기 상세 (환산급여)" },
  "retirement-income-tax-quick": { href: "/tools/finance/severance", title: "퇴직금·퇴직소득세 계산기 상세" },
  "gift-tax-quick": { href: "/tools/real-estate/gift-tax", title: "증여세 계산기 상세" },
  "dividend-tax-quick": { href: "/tools/finance/dividend-tax", title: "배당소득세 계산기 상세" },
  "stock-capital-gains-quick": { href: "/tools/finance/stock-tax", title: "주식 양도세 계산기 상세" },
  "vat-quick": { href: "/tools/finance/vat", title: "부가세 계산기 상세" },
  "freelancer-yearly-quick": { href: "/tools/finance/freelance-tax", title: "프리랜서 세금 계산기 상세" },
  "percent-of": { href: "/tools/math/percent", title: "퍼센트 계산기 상세" },
  "unemployment-benefit": { href: "/unemployment-benefit", title: "실업급여 계산기 상세 (수급 기간·상한)" },
  "fire-target": { href: "/fire-calculator", title: "FIRE 계산기 상세" },
  "holiday-allowance-quick": { href: "/weekly-holiday-allowance-2026", title: "주휴수당 계산기 2026 상세" },
  "annual-leave-pay-quick": { href: "/calc/vacation-pay", title: "연차수당 계산기 2026 상세" },
  "interest-tax-quick": { href: "/savings-interest-2026", title: "예적금 이자 계산기 2026 상세" },
  "property-tax-quick": { href: "/property-holding-tax-2026", title: "재산세·보유세 계산기 2026 상세" },
  "comprehensive-property-tax-quick": { href: "/property-holding-tax-2026", title: "종부세·보유세 계산기 2026 상세" },
  "income-tax-bracket-sim": { href: "/income-tax-2026", title: "종합소득세 계산기 2026 상세" },
  "bmi-quick": { href: "/tools/health/bmi", title: "BMI 계산기 상세" },
  "split-bill": { href: "/tools/life/dutch-pay", title: "더치페이 계산기 상세" },
  "fuel-cost-trip": { href: "/tools/life/fuel-cost", title: "유류비 계산기 상세" },
  "subscription-monthly": { href: "/tools/life/subscription", title: "구독료 계산기 상세" },
  "unit-converter-length": { href: "/tools/life/unit-converter", title: "단위 변환기 상세" },
};
