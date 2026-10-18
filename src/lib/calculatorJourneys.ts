// Ordered, editorial task groups. Adjacent steps are reciprocal so a new tool
// is reachable from its companions instead of always recommending older tools.
// Server callers pass only the selected cards to the client, not this catalog.
export const CALCULATOR_JOURNEYS: ReadonlyArray<{ topic: string; slugs: readonly string[] }> = [
  { topic: "대출 잔액과 상환 일정", slugs: ["loan-balance-after-payments", "lump-sum-prepayment-term", "extra-payment-term", "loan-term-extension-cost", "payment-holiday-cost", "loan-interest-principal-split"] },
  { topic: "대출 금리와 실제 비용", slugs: ["variable-rate-stress", "loan-cashflow-effective-rate", "refinance-break-even", "credit-line-daily-interest", "loan-total-interest"] },
  { topic: "여러 대출의 상환 계획", slugs: ["debt-avalanche-vs-snowball", "debt-consolidation-payment", "loan-affordability", "bonus-repayment-reserve"] },
  { topic: "저축 시작과 적립 시점", slugs: ["savings-beginning-vs-end", "savings-contribution-pause", "savings-start-delay", "savings-contribution-stepup"] },
  { topic: "예금의 세후 이자와 만기", slugs: ["savings-tax-rate-compare", "savings-ladder-cashflow", "deposit-break-switch"] },
  { topic: "투자 손실과 인출 비용", slugs: ["systematic-withdrawal-runway", "investment-drawdown-recovery", "portfolio-rebalance-amount", "investment-fee-break-even"] },
  { topic: "월급 인상과 저축 여력", slugs: ["salary-purchasing-power", "savings-rate-after-raise", "salary-raise-timing", "bonus-versus-raise"] },
  { topic: "월중 수입과 생활비", slugs: ["irregular-income-baseline", "split-payday-budget", "emergency-fund-runway", "unpaid-leave-budget", "emergency-fund-target"] },
  { topic: "자녀 용돈과 교육비 준비", slugs: ["allowance-growth-plan", "education-savings-gap", "education-cost-cumulative"] },
  { topic: "육아와 가구 소득 전환", slugs: ["childcare-work-return", "single-income-transition-budget", "parental-leave-household-gap"] },
  { topic: "가족 돌봄과 의료 예산", slugs: ["eldercare-family-budget", "family-insurance-premium-share", "family-medical-budget"] },
  { topic: "가족 공동 목표 저축", slugs: ["family-event-fund", "shared-goal-contribution", "sinking-fund-monthly", "couple-expense-income-split", "savings-required-monthly"] },
  { topic: "일하는 방식과 이직 비용", slugs: ["career-training-payback", "job-transition-cash-gap", "commute-adjusted-offer", "work-from-home-savings", "flex-time-tradeoff", "commute-time-value"] },
  { topic: "구독 요금제와 실제 이용량", slugs: ["cloud-storage-growth", "data-plan-overage", "annual-plan-break-even", "prepaid-pass-usage"] },
  { topic: "물품 교체와 유지 비용", slugs: ["diy-service-time-cost", "home-maintenance-reserve", "appliance-energy-replacement", "reusable-item-payback"] },
  { topic: "차량 이용과 주차 비용", slugs: ["ev-charge-vs-fuel", "parking-pass-break-even", "car-total-ownership"] },
  { topic: "모임과 여행 예산", slugs: ["event-budget-headcount", "travel-shared-budget", "travel-luggage-shipping"] },
  { topic: "구매 할인과 교환 비용", slugs: ["return-or-exchange-cost", "free-shipping-threshold", "coupon-stack-savings", "bulk-unit-price-waste"] },
  { topic: "해외 결제와 환전", slugs: ["foreign-atm-cost", "overseas-card-cost", "leftover-currency-roundtrip", "exchange-spread-cost"] },
  { topic: "송금과 환율 적용", slugs: ["remittance-received", "export-quote-break-even-rate", "currency-converter"] },
  { topic: "광고와 판매 이익", slugs: ["customer-acquisition-payback", "advertising-profit-roas", "discount-volume-target", "business-margin-quick"] },
  { topic: "사업 설비와 프로젝트 예산", slugs: ["equipment-lease-buy", "project-budget-variance", "break-even-order-count", "meeting-cost"] },
  { topic: "판매대금과 현금 회수", slugs: ["invoice-early-payment", "receivables-aging-loss", "operating-cashflow-plan", "marketplace-settlement", "business-cashflow-runway", "cash-conversion-cycle"] },
  { topic: "온라인 주문의 순이익", slugs: ["product-return-cost", "online-order-profit", "wholesale-price-target"] },
  { topic: "이사와 주거비 분담", slugs: ["relocation-payback", "storage-unit-cost", "moving-cost-quick", "roommate-utility-share"] },
  { topic: "임대 주택의 유지 예산", slugs: ["renovation-budget-buffer", "vacancy-carrying-cost", "rental-yield", "rent-free-effective-cost", "rental-prorated-rent"] },
];

export function calculatorJourneyNeighbors(slug: string): string[] {
  const group = CALCULATOR_JOURNEYS.find(group => group.slugs.includes(slug));
  if (!group) return [];
  const index = group.slugs.indexOf(slug);
  return [group.slugs[(index + 1) % group.slugs.length], group.slugs[(index + group.slugs.length - 1) % group.slugs.length]];
}
