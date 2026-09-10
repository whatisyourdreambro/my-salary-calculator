import { describe, expect, it } from "vitest";
import { expandedPracticalCalculators } from "@/lib/simpleCalculators/expandedPractical";
import { batch1Calculators } from "@/lib/simpleCalculators/batch1";
import { batch2Calculators } from "@/lib/simpleCalculators/batch2";
import type { CalculatorDef, CalculatorResult } from "@/lib/simpleCalculators/types";

const bySlug = new Map(expandedPracticalCalculators.map(calc => [calc.slug, calc]));
const defaults = (calc: CalculatorDef) => Object.fromEntries(calc.fields.map(field => [field.name, field.defaultValue]));
const run = (slug: string, overrides: Record<string, number> = {}) => {
  const calc = bySlug.get(slug)!;
  return calc.compute({ ...defaults(calc), ...overrides });
};
const secondary = (result: CalculatorResult, label: string) => result.secondary?.find(row => row.label === label)?.value;
const values = (result: CalculatorResult) => [result.primary.value, ...(result.secondary ?? []).map(row => row.value)];

// Hand-worked amounts, not calculations copied from the implementation. Every route
// has a distinct scenario: signed cash/earnings, percentage bases and rounding matter.
const fixtures: [string, Record<string, number>, number][] = [
  ["operating-cashflow-plan", { opening: 20000000, receipts: 30000000, suppliers: 12000000, wages: 8000000, rent: 2000000, other: 3000000 }, 25000000],
  ["inventory-turnover-days", { cogs: 120000000, opening: 10000000, closing: 20000000, days: 365 }, 45.625],
  ["cash-conversion-cycle", { inventoryDays: 40, receivableDays: 30, payableDays: 25, dailyCash: 500000 }, 45],
  ["advertising-profit-roas", { spend: 1000000, revenue: 4000000, margin: 35 }, 400000],
  ["customer-acquisition-payback", { campaign: 6000000, customers: 120, revenue: 30000, cost: 10000 }, 2.5],
  ["online-order-profit", { price: 30000, quantity: 2, cost: 15000, fee: 5, packing: 1000, shipping: 3000 }, 23000],
  ["break-even-order-count", { fixed: 3000000, price: 40000, variable: 25000, orders: 250 }, 200],
  ["wholesale-price-target", { cost: 10000, packing: 1000, setup: 100000, quantity: 100, margin: 20, fee: 5 }, 16000],
  ["discount-volume-target", { price: 20000, cost: 12000, quantity: 100, discount: 10 }, 134],
  ["product-return-cost", { orders: 1000, returns: 5, shipping: 3000, handling: 2000, cost: 20000, loss: 10 }, 350000],
  ["invoice-early-payment", { invoice: 10000000, discount: 2, days: 30, funding: 8 }, 135561.64383561644],
  ["receivables-aging-loss", { current: 20000000, currentLoss: 1, overdue: 5000000, overdueLoss: 20 }, 23800000],
  ["stock-reorder-point", { daily: 20, lead: 7, safety: 50, stock: 250 }, 190],
  ["inventory-order-quantity", { demand: 12000, orderCost: 50000, holding: 3000 }, 632.4555320336759],
  ["marketplace-settlement", { sales: 15000000, refund: 1000000, fee: 8, deduction: 200000, hold: 500000 }, 12180000],
  ["meeting-cost", { people: 6, hourly: 30000, minutes: 60, preparation: 15, meetings: 4 }, 900000],
  ["project-budget-variance", { budget: 30000000, actual: 18000000, remaining: 15000000 }, 3000000],
  ["equipment-lease-buy", { purchase: 12000000, resale: 3000000, maintenance: 100000, rent: 400000, setup: 500000, months: 36 }, 2300000],
  ["relocation-payback", { upfront: 2000000, oldHousing: 900000, newHousing: 700000, oldTravel: 100000, newTravel: 150000 }, 13.333333333333334],
  ["rent-free-effective-cost", { rent: 2000000, management: 300000, months: 24, free: 3, setup: 6000000 }, 2300000],
  ["vacancy-carrying-cost", { months: 3, management: 200000, financing: 600000, other: 100000, rent: 1200000 }, 2700000],
  ["home-maintenance-reserve", { quote: 6000000, buffer: 10, saved: 1800000, months: 12 }, 400000],
  ["renovation-budget-buffer", { base: 20000000, extra: 3000000, buffer: 10, budget: 25000000 }, 25300000],
  ["roommate-utility-share", { fixed: 30000, usage: 90000, people: 3, myDays: 20, totalDays: 75 }, 34000],
  ["rental-prorated-rent", { rent: 900000, management: 100000, period: 30, used: 12, paid: 300000 }, 100000],
  ["storage-unit-cost", { volume: 12, capacity: 5, rent: 120000, months: 3, transport: 300000 }, 1380000],
  ["annual-plan-break-even", { monthly: 15000, annual: 120000, months: 10 }, 8],
  ["appliance-energy-replacement", { oldWatts: 500, newWatts: 300, hours: 5, days: 30, unitRate: 200, upgrade: 360000 }, 6000],
  ["event-budget-headcount", { budget: 3000000, fixed: 1000000, meal: 30000, kit: 10000, invited: 60 }, 50],
  ["car-total-ownership", { purchase: 35000000, resale: 15000000, years: 5, fixed: 2000000, km: 15000, efficiency: 12, fuel: 1700 }, 40625000],
  ["ev-charge-vs-fuel", { km: 1000, fuelEfficiency: 10, fuelPrice: 1700, electricEfficiency: 5, electricPrice: 300, fixed: 5000 }, 105000],
  ["commute-time-value", { fareA: 6000, minutesA: 100, fareB: 12000, minutesB: 60, days: 20, timeValue: 15000 }, 80000],
  ["parking-pass-break-even", { daily: 10000, pass: 150000, days: 20 }, 15],
  ["travel-shared-budget", { people: 4, days: 3, hotel: 600000, transport: 240000, daily: 50000, buffer: 10 }, 381000],
  ["travel-luggage-shipping", { bagFee: 40000, flights: 2, weight: 12, block: 5, unitFee: 10000, base: 5000 }, 45000],
  ["prepaid-pass-usage", { pass: 200000, visits: 10, single: 30000, planned: 8 }, 7],
  ["bulk-unit-price-waste", { largePrice: 20000, largeQty: 20, waste: 25, smallPrice: 6000, smallQty: 5 }, 133.33333333333326],
  ["free-shipping-threshold", { cart: 23000, threshold: 30000, shipping: 3000 }, 4000],
  ["coupon-stack-savings", { price: 100000, fixed: 10000, discount: 20, cap: 30000 }, 70000],
  ["return-or-exchange-cost", { paid: 100000, returnShipping: 6000, deduction: 4000, replacement: 110000, delivery: 3000 }, 23000],
  ["reusable-item-payback", { purchase: 20000, wash: 100, disposable: 500, uses: 100 }, 50],
  ["diy-service-time-cost", { materials: 50000, tools: 30000, hours: 5, value: 15000, quote: 200000 }, 45000],
  ["data-plan-overage", { base: 30000, included: 10, usage: 13.2, block: 1, blockFee: 5000, alternative: 45000 }, 5000],
  ["cloud-storage-growth", { used: 80, included: 100, growth: 10, unit: 100, months: 6 }, 10000],
  ["exchange-spread-cost", { foreign: 1000, baseRate: 1300, spread: 2, waiver: 90, fee: 0 }, 1302600],
  ["overseas-card-cost", { foreign: 500, exchange: 1300, network: 1, issuer: 0.2, fixed: 0 }, 657800],
  ["remittance-received", { budget: 1310000, senderFee: 10000, exchange: 1300, recipientFee: 10 }, 990],
  ["leftover-currency-roundtrip", { foreign: 300, buyRate: 1350, sellRate: 1280, fee: 1000 }, -22000],
  ["export-quote-break-even-rate", { invoice: 10000, feeRate: 2, fixedFee: 100, cost: 11000000, exchange: 1300 }, 1134.020618556701],
  ["foreign-atm-cost", { cash: 200, operator: 5, exchange: 1300, feeRate: 1, fixed: 3000 }, 272165],
];

describe("새 생활·사업 계산기 검산", () => {
  it.each(fixtures)("%s의 독립 예시 결과", (slug, inputs, expected) => {
    const result = bySlug.get(slug)!.compute(inputs);
    expect(result.status).not.toBe("invalid");
    expect(result.primary.value).toBeCloseTo(expected, 5);
    expect(values(result).every(Number.isFinite)).toBe(true);
  });

  it("50개가 서로 및 기존 계산기와 중복되지 않고 개별 콘텐츠·링크가 완성되어 있다", () => {
    expect(expandedPracticalCalculators).toHaveLength(50);
    expect(new Set(fixtures.map(([slug]) => slug)).size).toBe(50);
    const existing = [...batch1Calculators, ...batch2Calculators];
    const all = [...existing, ...expandedPracticalCalculators];
    expect(new Set(all.map(calc => calc.slug)).size).toBe(all.length);
    expect(new Set(all.map(calc => calc.title)).size).toBe(all.length);
    const known = new Set(all.map(calc => calc.slug));
    for (const calc of expandedPracticalCalculators) {
      expect(calc.description.length, calc.slug).toBeGreaterThanOrEqual(100);
      expect(calc.explanation?.split("\n\n")).toHaveLength(2);
      expect(calc.faqs?.length).toBeGreaterThanOrEqual(3);
      expect(calc.formula?.length).toBeGreaterThan(20);
      expect(calc.caveats?.length).toBeGreaterThanOrEqual(2);
      expect(calc.publishedAt).toBe("2026-09-10");
      expect(calc.relatedSlugs?.every(slug => known.has(slug) && slug !== calc.slug), calc.slug).toBe(true);
      expect(new Set(calc.fields.map(field => field.name)).size).toBe(calc.fields.length);
      expect(calc.fields.every(field => field.hint && field.suffix && field.min !== undefined && field.max !== undefined)).toBe(true);
    }
  });

  it.each(expandedPracticalCalculators.map(calc => [calc.slug, calc] as const))("%s는 잘못된 입력을 정상 0원으로 처리하지 않는다", (_, calc) => {
    for (const field of calc.fields) {
      for (const invalid of [-1, Infinity, NaN, (field.max ?? 1e12) + 1]) {
        const result = calc.compute({ ...defaults(calc), [field.name]: invalid });
        expect(result.status, `${calc.slug}/${field.name}/${invalid}`).toBe("invalid");
        expect(result.note).toBeTruthy();
        expect(values(result).every(Number.isFinite)).toBe(true);
      }
    }
    expect(calc.compute({}).status).toBe("invalid");
    const extreme = calc.compute(Object.fromEntries(calc.fields.map(field => [field.name, field.max!])));
    expect(values(extreme).every(Number.isFinite)).toBe(true);
    expect(values(calc.compute(Object.fromEntries(calc.fields.map(field => [field.name, 0])))).every(Number.isFinite)).toBe(true);
  });

  it("현금이 부족하거나 현금주기가 음수인 사실을 0으로 감추지 않는다", () => {
    expect(run("operating-cashflow-plan", { opening: 0, receipts: 0 }).primary.value).toBe(-25000000);
    const cycle = run("cash-conversion-cycle", { inventoryDays: 10, receivableDays: 5, payableDays: 30 });
    expect(cycle.primary.value).toBe(-15);
    expect(secondary(cycle, "주기 대응 운영자금")).toBe(0);
    expect(run("project-budget-variance", { budget: 40000000 }).primary.value).toBe(-7000000);
  });

  it.each([
    ["inventory-turnover-days", { opening: 0, closing: 0 }],
    ["advertising-profit-roas", { margin: 0 }],
    ["customer-acquisition-payback", { customers: 0 }],
    ["break-even-order-count", { price: 25000 }],
    ["wholesale-price-target", { margin: 95, fee: 5 }],
    ["discount-volume-target", { discount: 40 }],
    ["invoice-early-payment", { days: 0 }],
    ["inventory-order-quantity", { holding: 0 }],
    ["marketplace-settlement", { refund: 16000000 }],
    ["rent-free-effective-cost", { free: 25 }],
    ["roommate-utility-share", { myDays: 76 }],
    ["rental-prorated-rent", { used: 31 }],
    ["storage-unit-cost", { capacity: 0 }],
    ["event-budget-headcount", { meal: 0, kit: 0 }],
    ["car-total-ownership", { efficiency: 0 }],
    ["ev-charge-vs-fuel", { electricEfficiency: 0 }],
    ["travel-shared-budget", { people: 0 }],
    ["travel-luggage-shipping", { block: 0 }],
    ["prepaid-pass-usage", { planned: 11 }],
    ["bulk-unit-price-waste", { waste: 100 }],
    ["return-or-exchange-cost", { deduction: 100000 }],
    ["data-plan-overage", { block: 0 }],
    ["cloud-storage-growth", { months: 1.5 }],
    ["exchange-spread-cost", { baseRate: 0 }],
    ["remittance-received", { recipientFee: 1001 }],
    ["export-quote-break-even-rate", { feeRate: 100 }],
    ["foreign-atm-cost", { cash: 0 }],
  ] as [string, Record<string, number>][])("%s의 정의 불가·모순 조건을 차단한다", (slug, changes) => {
    expect(run(slug, changes).status).toBe("invalid");
  });

  it("횟수·칸수는 필요한 방향으로 반올림하고 무료배송 충족 때 추가구매를 만들지 않는다", () => {
    expect(run("break-even-order-count", { fixed: 3000001 }).primary.value).toBe(201);
    expect(run("discount-volume-target", { discount: 0 }).primary.value).toBe(100);
    expect(run("storage-unit-cost", { volume: 10 }).primary.value).toBe(1020000);
    expect(run("event-budget-headcount", { budget: 2999999 }).primary.value).toBe(49);
    expect(run("free-shipping-threshold", { cart: 30000 }).primary.value).toBe(0);
    expect(run("free-shipping-threshold", { cart: 29000 }).primary.value).toBe(-2000);
  });

  it("공동경비와 개인경비의 분모를 구분하여 비용을 보존한다", () => {
    const shares = [20, 25, 30].map(myDays => run("roommate-utility-share", { myDays }).primary.value);
    expect(shares.reduce((sum, value) => sum + value, 0)).toBe(120000);
    const two = run("travel-shared-budget", { people: 2 });
    expect(two.primary.value).toBe(612000);
    expect(secondary(two, "일행 전체 예산")).toBe(1224000);
    // Shipping is per order, never multiplied by two products.
    expect(run("online-order-profit", { shipping: 0 }).primary.value).toBe(26000);
  });

  it("절감이 없으면 회수기간을 날조하지 않고 비용의 부호를 유지한다", () => {
    const move = run("relocation-payback", { newHousing: 1000000 });
    expect(move.primary.value).toBe(-150000);
    expect(move.note).toContain("기간은 존재하지");
    const appliance = run("appliance-energy-replacement", { newWatts: 700 });
    expect(appliance.primary.value).toBe(-6000);
    expect(secondary(appliance, "교체비 회수기간")).toBeUndefined();
    expect(run("reusable-item-payback", { wash: 500 }).note).toContain("회수할 수 없");
    expect(run("home-maintenance-reserve", { saved: 10000000 }).primary.value).toBe(0);
    expect(run("inventory-order-quantity", { demand: 0 }).primary.value).toBe(0);
  });

  it("매출 할인은 원가를 할인하지 않으며 쿠폰 한도·0원 하한을 지킨다", () => {
    expect(run("coupon-stack-savings", { cap: 10000 }).primary.value).toBe(80000);
    expect(run("coupon-stack-savings", { fixed: 200000 }).primary.value).toBe(0);
    expect(run("coupon-stack-savings", { cap: 0 }).primary.value).toBe(90000);
    expect(run("product-return-cost", { returns: 0 }).primary.value).toBe(0);
    expect(run("receivables-aging-loss", { currentLoss: 100, overdueLoss: 100 }).primary.value).toBe(0);
  });

  it("초과청구는 경계에서 늘지 않고 용량 증가는 월별로 누적한다", () => {
    expect(secondary(run("data-plan-overage", { included: 0.1, usage: 0.4, block: 0.1 }), "추가 청구 단위 수")).toBe(3);
    expect(secondary(run("data-plan-overage", { usage: 10 }), "추가 데이터 요금")).toBe(0);
    expect(run("cloud-storage-growth", { months: 2 }).primary.value).toBe(0);
    expect(run("cloud-storage-growth", { months: 3 }).primary.value).toBe(1000);
    expect(run("cloud-storage-growth", { used: 120, growth: 0, months: 3 }).primary.value).toBe(6000);
    expect(secondary(run("cloud-storage-growth", { growth: 0 }), "용량 초과 시작 시점")).toBeUndefined();
  });

  it("환전우대는 원금이 아닌 스프레드에 적용하고 송금 수수료의 통화를 구분한다", () => {
    expect(run("exchange-spread-cost", { waiver: 100, fee: 5000 }).primary.value).toBe(1305000);
    expect(run("exchange-spread-cost", { waiver: 0 }).primary.value).toBe(1326000);
    expect(run("remittance-received", { recipientFee: 0 }).primary.value).toBe(1000);
    expect(run("overseas-card-cost", { network: 0, issuer: 0, fixed: 1000 }).primary.value).toBe(651000);
    expect(run("leftover-currency-roundtrip", { buyRate: 1300, sellRate: 1300, fee: 0 }).primary.value).toBe(0);
    expect(run("foreign-atm-cost", { operator: 0, feeRate: 0, fixed: 0 }).primary.value).toBe(260000);
  });

  it("소수 중량·용량의 정확한 배수를 한 단위 더 청구하지 않는다", () => {
    const storage = run("storage-unit-cost", { volume: 2.1, capacity: 0.3 });
    expect(secondary(storage, "필요 창고 칸수")).toBe(7);
    expect(secondary(run("storage-unit-cost", { volume: 2.1001, capacity: 0.3 }), "필요 창고 칸수")).toBe(8);
    expect(secondary(run("travel-luggage-shipping", { weight: 2.1, block: 0.3 }), "청구 중량 단위 수")).toBe(7);
    expect(secondary(run("travel-luggage-shipping", { weight: 2.1001, block: 0.3 }), "청구 중량 단위 수")).toBe(8);
    const cloud = run("cloud-storage-growth", { used: 0.1, included: 0.3, growth: 0.1, months: 3 });
    expect(cloud.primary.value).toBeCloseTo(10, 10);
    expect(secondary(cloud, "용량 초과 시작 시점")).toBe(3);
    expect(run("cloud-storage-growth", { used: 0.1, included: 0.3, growth: 0.1, months: 2 }).primary.value).toBe(0);
  });

  it("선납 유효기간 안에 회수하지 못하는 조건을 명시한다", () => {
    expect(run("annual-plan-break-even", { annual: 300000, monthly: 15000 }).note).toContain("1년 안에는");
    expect(run("parking-pass-break-even", { pass: 400000, daily: 10000 }).note).toContain("한 달 안에");
  });

  it.each([
    ["customer-acquisition-payback", "customers"], ["online-order-profit", "quantity"],
    ["break-even-order-count", "orders"], ["wholesale-price-target", "quantity"],
    ["discount-volume-target", "quantity"], ["product-return-cost", "orders"],
    ["meeting-cost", "people"], ["meeting-cost", "meetings"],
    ["roommate-utility-share", "people"], ["event-budget-headcount", "invited"],
    ["travel-shared-budget", "people"], ["travel-luggage-shipping", "flights"],
    ["prepaid-pass-usage", "visits"], ["prepaid-pass-usage", "planned"],
    ["reusable-item-payback", "uses"],
  ])("%s의 실제 인원·물건·이용 건수 %s를 소수로 쪼개지 않는다", (slug, field) => {
    expect(run(slug, { [field]: 0.5 }).status).toBe("invalid");
    expect(run(slug, { [field]: 1.5 }).status).toBe("invalid");
  });

  it("평균 출고량·보유기간·측정 중량의 소수와 아주 작은 양의 부피를 보존한다", () => {
    expect(run("stock-reorder-point", { daily: 0.5, lead: 1.5, safety: 0 }).primary.value).toBe(0.75);
    expect(run("cash-conversion-cycle", { inventoryDays: 0.5, receivableDays: 0.5, payableDays: 0.5 }).primary.value).toBe(0.5);
    expect(secondary(run("storage-unit-cost", { volume: 1e-10, capacity: 1e6 }), "필요 창고 칸수")).toBe(1);
  });
});
