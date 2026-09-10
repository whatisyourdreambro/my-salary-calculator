import { describe, expect, it } from "vitest";
import { expandedFinanceCalculators } from "@/lib/simpleCalculators/expandedFinance";
import { batch1Calculators } from "@/lib/simpleCalculators/batch1";
import { batch2Calculators } from "@/lib/simpleCalculators/batch2";

const cases: [string, Record<string, number>, number][] = [
  ["refinance-break-even", {}, 12],
  ["extra-payment-term", { rate: 0 }, 6],
  ["lump-sum-prepayment-term", { rate: 0 }, 23],
  ["loan-balance-after-payments", { rate: 0 }, 8000000],
  ["loan-interest-principal-split", {}, 400000],
  ["payment-holiday-cost", { rate: 0 }, 277778],
  ["variable-rate-stress", { old: 0, next: 0 }, 0],
  ["loan-term-extension-cost", { rate: 0 }, 0],
  ["debt-consolidation-payment", { r1: 0, r2: 0, r: 0 }, 166667],
  ["debt-avalanche-vs-snowball", { r1: 0, r2: 0 }, 0],
  ["credit-line-daily-interest", {}, 9589],
  ["loan-cashflow-effective-rate", { fee: 0, months: 30 }, 0],
  ["salary-purchasing-power", {}, 3142857],
  ["commute-adjusted-offer", {}, -1349],
  ["work-from-home-savings", {}, 664000],
  ["bonus-versus-raise", {}, 1800000],
  ["salary-raise-timing", {}, 900000],
  ["unpaid-leave-budget", {}, 300000],
  ["career-training-payback", {}, 12],
  ["flex-time-tradeoff", {}, 12500],
  ["bonus-repayment-reserve", {}, 3000000],
  ["split-payday-budget", {}, 900000],
  ["irregular-income-baseline", {}, 500000],
  ["job-transition-cash-gap", {}, 1750000],
  ["savings-required-monthly", { rate: 0 }, 666667],
  ["savings-start-delay", { rate: 0 }, 6000000],
  ["savings-contribution-stepup", { years: 2, step: 10, rate: 0 }, 12600000],
  ["savings-contribution-pause", { rate: 0 }, 3000000],
  ["savings-beginning-vs-end", { months: 12, rate: 12 }, 63413],
  ["savings-rate-after-raise", {}, 24.55],
  ["emergency-fund-target", {}, 8200000],
  ["emergency-fund-runway", {}, 8],
  ["sinking-fund-monthly", {}, 300000],
  ["savings-ladder-cashflow", { rate: 0 }, 6000000],
  ["deposit-break-switch", {}, -147500],
  ["savings-tax-rate-compare", {}, 0],
  ["portfolio-rebalance-amount", {}, 1000000],
  ["investment-drawdown-recovery", {}, 25],
  ["investment-fee-break-even", {}, 24000000],
  ["systematic-withdrawal-runway", {}, 12],
  ["couple-expense-income-split", {}, 1500000],
  ["parental-leave-household-gap", {}, 700000],
  ["childcare-work-return", {}, 1300000],
  ["education-savings-gap", { inflation: 0, rate: 0 }, 250000],
  ["eldercare-family-budget", {}, 5200000],
  ["family-medical-budget", {}, 1000000],
  ["allowance-growth-plan", {}, 3663060],
  ["family-event-fund", {}, 583333],
  ["shared-goal-contribution", {}, 600000],
  ["single-income-transition-budget", {}, -700000],
  ["family-insurance-premium-share", {}, 7.4],
];
function get(slug: string) {
  const calc = expandedFinanceCalculators.find((item) => item.slug === slug);
  if (!calc) throw new Error(`Missing calculator: ${slug}`);
  return calc;
}
function run(slug: string, changes: Record<string, number> = {}) {
  const calc = get(slug);
  const defaults = Object.fromEntries(calc.fields.map((field) => [field.name, field.defaultValue]));
  return calc.compute({ ...defaults, ...changes });
}

describe("확장 금융 계산기 51종", () => {
  it("장기·고금리 대출의 만기 잔액에서 큰 수 차감에 의한 원금 오차가 없다", () => {
    expect(run("loan-balance-after-payments", { p: 1e12, rate: 49.8, months: 600, paid: 600 }).primary.value).toBe(0);
    expect(run("loan-balance-after-payments", { p: 1e12, rate: 50, months: 600, paid: 599 }).primary.value).toBe(40000000001);
  });
  it("납입 중단이나 증액이 없으면 큰 초기 자금에서도 차이가 정확히 0이다", () => {
    expect(run("savings-contribution-pause", { p: 1e12, save: 1e6, rate: 20, months: 600, pause: 0 }).primary.value).toBe(0);
    expect(run("savings-contribution-stepup", { p: 1e12, save: 1e6, rate: 20, years: 50, step: 0 }).secondary?.find(row => row.label === "고정 납입 대비 증가")?.value).toBe(0);
    expect(run("savings-contribution-pause", { p: 1e12, save: 100, rate: 12, months: 2, start: 1, pause: 1 }).primary.value).toBe(101);
    expect(run("savings-beginning-vs-end", { p: 1e12, save: 100, rate: 12, months: 1 }).primary.value).toBe(1);
  });
  it("각 고유 계산기를 독립 수치 사례와 연결하며 실제 관련 경로와 충분한 설명을 갖는다", () => {
    expect(expandedFinanceCalculators).toHaveLength(51);
    expect(cases).toHaveLength(51);
    expect(new Set(cases.map(([slug]) => slug)).size).toBe(51);
    const all = [...batch1Calculators, ...batch2Calculators, ...expandedFinanceCalculators];
    const slugs = new Set(all.map((calc) => calc.slug));
    expect(slugs.size).toBe(all.length);
    for (const calc of expandedFinanceCalculators) {
      expect(calc.description.length, calc.slug).toBeGreaterThanOrEqual(100);
      expect(calc.explanation?.split("\n\n").length, calc.slug).toBeGreaterThanOrEqual(2);
      expect(calc.faqs?.length, calc.slug).toBeGreaterThanOrEqual(3);
      expect(calc.formula?.length, calc.slug).toBeGreaterThan(15);
      expect(calc.publishedAt).toBe("2026-09-10");
      for (const related of calc.relatedSlugs ?? []) expect(slugs.has(related), `${calc.slug} -> ${related}`).toBe(true);
      for (const field of calc.fields) {
        expect(field.min, `${calc.slug}/${field.name}`).toBeDefined();
        expect(field.max).toBeDefined();
        expect(field.step).toBeGreaterThan(0);
        expect(field.hint).toBeTruthy();
      }
    }
  });

  it.each(cases)("독립 계산 예시: %s", (slug, inputs, expected) => {
    const output = run(slug, inputs);
    expect(output.status).not.toBe("invalid");
    expect(output.primary.value).toBe(expected);
  });

  it.each(expandedFinanceCalculators)("입력 경계와 비정상 숫자에서 유한값 및 명시 안내: $slug", (calc) => {
    const defaults = Object.fromEntries(calc.fields.map((field) => [field.name, field.defaultValue]));
    const normal = calc.compute(defaults);
    expect(normal.status).not.toBe("invalid");
    for (const field of calc.fields) {
      for (const bad of [NaN, Infinity, -Infinity, (field.min ?? 0) - 1, (field.max ?? 1e12) + 1]) {
        const output = calc.compute({ ...defaults, [field.name]: bad });
        expect(output.status).toBe("invalid");
        expect(output.note).toBeTruthy();
        expect(Number.isFinite(output.primary.value)).toBe(true);
      }
    }
    for (const mode of ["min", "max"] as const) {
      const output = calc.compute(Object.fromEntries(calc.fields.map((field) => [field.name, field[mode]!])));
      expect([output.primary, ...(output.secondary ?? [])].every((entry) => Number.isFinite(entry.value))).toBe(true);
      if (output.status === "invalid") expect(output.note).toBeTruthy();
    }
  });

  it("고정 월납입은 Microsoft PMT 공식의 공개 예시와 맞는다", () => {
    const output = run("loan-balance-after-payments", { p: 10000, rate: 8, months: 10, paid: 0 });
    expect(output.secondary?.[0].value).toBe(1037);
    expect(run("loan-balance-after-payments", { p: 10000, rate: 8, months: 10, paid: 10 }).primary.value).toBe(0);
  });

  it("거치 이자가 합산되고 기간 연장은 같은 금리에서 총이자를 증가시킨다", () => {
    const holiday = run("payment-holiday-cost", { p: 1000000, rate: 12, pause: 1, months: 1 });
    expect(holiday.primary.value).toBe(1020100);
    expect(holiday.secondary?.[0].value).toBe(10000);
    expect(run("loan-term-extension-cost").primary.value).toBeGreaterThan(0);
  });

  it("선취 수수료 유효금리는 동일 현금흐름으로 알려진 월 1%를 역산한다", () => {
    // One month: 1,000,000 received and 1,010,000 repaid -> monthly 1%; (1.01^12-1)*100 = 12.6825%.
    const output = run("loan-cashflow-effective-rate", { p: 1100000, fee: 100000, pay: 1010000, months: 1 });
    expect(output.primary.value).toBe(12.68);
  });

  it("추가·목돈 상환은 마지막 부분 납입과 실제 이자를 함께 줄인다", () => {
    // At 1% monthly: 1,000 -> pay 510 -> balance 500 -> final pay 505; total interest 15.
    const extra = run("extra-payment-term", { p: 1000, rate: 12, pay: 510, extra: 500 });
    expect(extra.primary.value).toBe(1);
    expect(extra.secondary?.find((entry) => entry.label === "줄어드는 총이자")?.value).toBe(5);
    const lump = run("lump-sum-prepayment-term", { p: 1000, rate: 12, pay: 510, lump: 500, fee: 2 });
    expect(lump.primary.value).toBe(1);
    expect(lump.secondary?.find((entry) => entry.label === "수수료 차감 이자 절감")?.value).toBe(8);
  });

  it("채무 우선순위는 같은 예산의 비영 금리 현금흐름에서 차이를 낸다", () => {
    // Manual six-month ledgers: avalanche interest 51.5175952; snowball interest 77.638295192.
    const output = run("debt-avalanche-vs-snowball", { p1: 1000, r1: 0, m1: 100, p2: 2000, r2: 12, m2: 100, budget: 600 });
    expect(output.primary.value).toBe(26);
    expect(output.secondary?.map((entry) => entry.value)).toEqual([6, 6, 52, 78]);
    expect(run("variable-rate-stress", { p: 1000, old: 0, next: 12, months: 1 }).primary.value).toBe(10);
  });

  it("이자 이하 상환·0분모·불가능한 기간을 계산 완료로 처리하지 않는다", () => {
    const invalidCases: [string, Record<string, number>][] = [
      ["extra-payment-term", { p: 10000000, rate: 12, pay: 100000 }],
      ["loan-balance-after-payments", { months: 12, paid: 13 }],
      ["refinance-break-even", { next: 1000000 }],
      ["debt-avalanche-vs-snowball", { budget: 100000 }],
      ["loan-cashflow-effective-rate", { fee: 12000000 }],
      ["savings-contribution-pause", { months: 12, start: 10, pause: 4 }],
      ["savings-start-delay", { delay: 61 }],
      ["portfolio-rebalance-amount", { ta: 40 }],
      ["investment-drawdown-recovery", { loss: 100 }],
      ["investment-fee-break-even", { percent: 0 }],
      ["systematic-withdrawal-runway", { withdraw: 0 }],
      ["couple-expense-income-split", { a: 0, b: 0 }],
      ["family-insurance-premium-share", { income: 0 }],
      ["salary-raise-timing", { start: 6.5 }],
    ];
    for (const [slug, input] of invalidCases) expect(run(slug, input).status, slug).toBe("invalid");
  });

  it("일시 중단 0·0이율·전체 상환·충분한 저축은 정상적인 0 결과다", () => {
    expect(run("savings-contribution-pause", { pause: 0 }).primary.value).toBe(0);
    expect(run("savings-beginning-vs-end", { rate: 0 }).primary.value).toBe(0);
    expect(run("lump-sum-prepayment-term", { lump: 12000000 }).primary.value).toBe(0);
    expect(run("savings-required-monthly", { p: 30000000 }).primary.value).toBe(0);
    expect(run("systematic-withdrawal-runway", { p: 500000, withdraw: 1000000 }).primary.value).toBe(0);
  });

  it("비상금 미소진·목표 저축 부족·월중 현금 부족을 구별한다", () => {
    const stable = run("emergency-fund-runway", { income: 3000000, bills: 2000000 });
    expect(stable.primary.label).toBe("매달 남는 금액");
    expect(stable.note).toContain("소진되지");
    const short = run("shared-goal-contribution", { goal: 2000000 });
    expect(short.primary.value).toBe(500000);
    expect(short.note).toContain("채울 수 없습니다");
    const cash = run("split-payday-budget");
    expect(cash.primary.value).toBe(900000);
    expect(cash.secondary?.find((entry) => entry.label === "월말 잔액")?.value).toBe(1100000);
  });
});
