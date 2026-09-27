// /calc/bonus-home-plan 대출 규칙·구매 가능 연도 계산 회귀 (2026-09-27)
// 규칙 원문: 10·15 대책(2025-10-15)·금융위 대출수요 관리(2025-10-17)·6·27(2025-06-27)·국토부 2026-06-30 지정·
// 금융위 3단계 스트레스 DSR(2025-05-20) — loanRules.ts 머리말. 합성 사례는 손으로 계산한 값이다.
import { describe, expect, it } from "vitest";
import { dsrLimitOf } from "@/lib/widgets/dsrLimit";
import { calculateHomeLoanRepayment } from "@/lib/homeLoanRepayment";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import {
  DSR_RATIO,
  dsrLoanLimit,
  effectiveTermYears,
  LOAN_RULES_AS_OF,
  loanLimit,
  ltvFor,
  mortgageCapFor,
  REVIEW_BY,
  stressAddFor,
  type RegionClass,
} from "@/lib/bonusHome/loanRules";
import { solveAffordability, type AffordInputs } from "@/lib/bonusHome/affordability";
import { computeComp, defaultTaiBaseMonthly, type CompInputs } from "@/lib/bonusHome/compEngines";
import { companyScenarioOps } from "@/lib/bonusHome/scenarios";

const CAPITAL_REG: RegionClass = { capitalArea: true, regulated: true };
const CAPITAL: RegionClass = { capitalArea: true, regulated: false };
const LOCAL: RegionClass = { capitalArea: false, regulated: false };

describe("대출 규칙 기준일", () => {
  it(`기준일 ${LOAN_RULES_AS_OF}, 재확인 기한 ${REVIEW_BY} — 지나면 WARN(실패 아님)`, () => {
    const today = new Date().toISOString().slice(0, 10);
    if (today > REVIEW_BY) {
      console.warn(`[bonusHome] 대출 규제 기준일 ${LOAN_RULES_AS_OF} — 재확인 기한 ${REVIEW_BY} 경과: 지방 스트레스 금리·규제지역 목록을 다시 확인할 것`);
    }
    expect(LOAN_RULES_AS_OF <= REVIEW_BY).toBe(true);
  });
});

describe("DSR — 사이트 공용 dsrLimitOf 그대로", () => {
  it("스트레스 가산 금리로 dsrLimitOf 호출과 같다", () => {
    expect(dsrLoanLimit({ dsrIncome: 100_000_000, existingAnnualDebtService: 0, ratePct: 4.48, stressAddPct: 3, years: 30 })).toBe(
      dsrLimitOf(100_000_000, 7.48, 30),
    );
    expect(DSR_RATIO).toBe(0.4);
  });
  it("기존 부채 원리금은 연 소득을 (원리금 ÷ 40%) 줄이는 것 = 연 상환 여력에서 원리금을 빼는 것", () => {
    const withDebt = dsrLoanLimit({ dsrIncome: 100_000_000, existingAnnualDebtService: 12_000_000, ratePct: 0, stressAddPct: 0, years: 30 });
    expect(withDebt).toBe(dsrLimitOf(70_000_000, 0, 30));
    // 금리 0%: (1억 × 40% − 1,200만) × 30년 = 8.4억
    expect(withDebt).toBe(840_000_000);
    expect(dsrLoanLimit({ dsrIncome: 10_000_000, existingAnnualDebtService: 50_000_000, ratePct: 4, stressAddPct: 3, years: 30 })).toBe(0);
  });
});

describe("지역별 LTV·주담대 한도·스트레스·만기", () => {
  it("LTV: 규제지역 40% · 그 외 70%", () => {
    expect(ltvFor(CAPITAL_REG)).toBe(0.4);
    expect(ltvFor(CAPITAL)).toBe(0.7);
    expect(ltvFor(LOCAL)).toBe(0.7);
  });
  it("수도권·규제지역 한도: 15억 이하 6억 · 25억 이하 4억 · 초과 2억, 지방 비규제 없음", () => {
    expect(mortgageCapFor(CAPITAL, 1_500_000_000)).toBe(600_000_000);
    expect(mortgageCapFor(CAPITAL_REG, 1_500_000_001)).toBe(400_000_000);
    expect(mortgageCapFor(CAPITAL_REG, 2_500_000_000)).toBe(400_000_000);
    expect(mortgageCapFor(CAPITAL_REG, 2_500_000_001)).toBe(200_000_000);
    expect(mortgageCapFor(LOCAL, 5_000_000_000)).toBe(Number.POSITIVE_INFINITY);
  });
  it("스트레스 가산: 수도권·규제지역 3.0%p · 지방 0.75%p", () => {
    expect(stressAddFor(CAPITAL_REG)).toBe(3);
    expect(stressAddFor(CAPITAL)).toBe(3);
    expect(stressAddFor(LOCAL)).toBe(0.75);
  });
  it("만기: 수도권·규제지역 30년 이내, 지방은 입력 그대로", () => {
    expect(effectiveTermYears(CAPITAL, 40)).toBe(30);
    expect(effectiveTermYears(LOCAL, 40)).toBe(40);
    expect(effectiveTermYears(LOCAL, Number.NaN)).toBe(30);
  });
  it("대출 = min(DSR, LTV × 시가, 한도) 와 묶인 제약", () => {
    const base = { existingAnnualDebtService: 0, ratePct: 0, stressAddPct: 0, years: 30 };
    // 수도권 비규제 10억: LTV 7억 · 한도 6억 · DSR(6천만 × 40% × 30 = 7.2억) → 6억, 한도
    expect(loanLimit({ ...base, price: 1_000_000_000, cls: CAPITAL, dsrIncome: 60_000_000, ltv: 0.7 })).toMatchObject({ loan: 600_000_000, binding: "주담대 한도" });
    // 지방 3억: LTV 2.1억 < DSR 7.2억 → LTV
    expect(loanLimit({ ...base, price: 300_000_000, cls: LOCAL, dsrIncome: 60_000_000, ltv: 0.7 })).toMatchObject({ loan: 210_000_000, binding: "LTV" });
    // 소득 1천만: DSR 1.2억 → DSR
    expect(loanLimit({ ...base, price: 300_000_000, cls: LOCAL, dsrIncome: 10_000_000, ltv: 0.7 })).toMatchObject({ loan: 120_000_000, binding: "DSR" });
  });
});

// ── 구매 가능 연도 — 손계산 합성 사례 ─────────────────────────────
// 직접 입력·성과급 0%·연봉 6천만 고정 → 월 실수령(주입) 400만, 저축 50% → 연 2,400만.
const flatComp = (over: Partial<CompInputs> = {}) =>
  computeComp({
    company: "custom",
    division: "memory",
    salary0: 60_000_000,
    wageGrowthPct: 0,
    ops: [0, 0, 0, 0, 0],
    opi1Pct: 0,
    taiBaseMonthly0: 0,
    piPct: 0,
    customBonusPct: 0,
    stockGrowthPct: 0,
    ...over,
  });
const afford = (over: Partial<AffordInputs> = {}) =>
  solveAffordability({
    comp: flatComp(),
    startAssets: 0,
    savingsRatePct: 50,
    bonusSavePct: 100,
    savingsInterestPct: 0,
    includeLockedShares: false,
    dsrIncludeBonus: true,
    price0: 300_000_000,
    priceGrowthPct: 0,
    isOver85: false,
    cls: LOCAL,
    ratePct: 0,
    stressAddPct: 0,
    ltv: 0.7,
    termYears: 30,
    existingAnnualDebtService: 0,
    netMonthlyOf: (s) => (s / 12) * 0.8,
    ...over,
  });

describe("구매 가능 연도 — 합성 사례(손계산)", () => {
  it("지방 3억: 필요 현금 = 3억 + 취득세 330만 − LTV 2.1억 = 9,330만 → 연 2,400만 저축이면 2030년 말(9,600만)", () => {
    const r = afford();
    expect(r.years[0].acqTax).toBe(3_300_000);
    expect(r.years[0].loan.loan).toBe(210_000_000);
    expect(r.years[0].need).toBe(93_300_000);
    expect(r.years.map((y) => y.assets)).toEqual([24_000_000, 48_000_000, 72_000_000, 96_000_000, 120_000_000]);
    expect(r.buyYear).toBe(2030);
    expect(r.shortfall).toBe(0);
    // 금리 0% 30년: 2.1억 ÷ 360 = 583,333원, 월 실수령 400만의 14.6%
    expect(r.repayment.monthlyPayment).toBe(583_333);
    expect(r.repayment.shareOfNetPct).toBeCloseTo(14.583, 2);
  });
  it("현재 모은 돈 1억이면 2027년 말", () => {
    expect(afford({ startAssets: 100_000_000 }).buyYear).toBe(2027);
  });
  it("지방 10억은 2031년까지 불가 — 부족 = (10억 + 3,300만 − 7억) − 1.2억 = 2.13억", () => {
    const r = afford({ price0: 1_000_000_000 });
    expect(r.buyYear).toBeNull();
    expect(r.decisive.year).toBe(2031);
    expect(r.shortfall).toBe(213_000_000);
  });
  it("집값 변동 가정 10%: 2027년 집값 = 3억 × 1.1", () => {
    expect(afford({ priceGrowthPct: 10 }).years[0].price).toBeCloseTo(330_000_000, 3);
  });
  it("DSR 소득은 직전 연도 총급여 — 성과급 포함 토글", () => {
    const comp = flatComp({ customBonusPct: 20 });
    const on = afford({ comp });
    const off = afford({ comp, dsrIncludeBonus: false });
    expect(on.years[0].dsrIncome).toBe(60_000_000 + 12_000_000);
    expect(on.years[1].dsrIncome).toBe(60_000_000 + 12_000_000);
    expect(off.years.map((y) => y.dsrIncome)).toEqual([60_000_000, 60_000_000, 60_000_000, 60_000_000, 60_000_000]);
  });
  it("기본 월 실수령은 calculateSalary2026(연봉).netPay", () => {
    const r = afford({ netMonthlyOf: undefined });
    expect(r.years[0].salarySavings).toBe(calculateSalary2026(60_000_000).netPay * 12 * 0.5);
  });
  it("월 상환액은 스트레스 없는 입력 금리의 원리금균등", () => {
    const r = afford({ ratePct: 4.48, stressAddPct: 0.75 });
    expect(r.repayment.monthlyPayment).toBe(calculateHomeLoanRepayment(r.decisive.loan.loan, 4.48, 30, "equalPrincipalAndInterest").monthlyPayment);
  });
});

describe("시나리오 절벽 — 삼성 보수(2027년 실적부터 임계값 미달)", () => {
  const samsung = (scenario: "conservative" | "base"): CompInputs => ({
    company: "samsung",
    division: "memory",
    salary0: 80_000_000,
    wageGrowthPct: 6.2,
    ops: companyScenarioOps("samsung", scenario),
    opi1Pct: 47,
    taiBaseMonthly0: defaultTaiBaseMonthly(80_000_000),
    piPct: 150,
    customBonusPct: 0,
    stockGrowthPct: 0,
  });
  const run = (scenario: "conservative" | "base", over: Partial<AffordInputs> = {}) =>
    afford({
      comp: computeComp(samsung(scenario)),
      netMonthlyOf: undefined,
      savingsRatePct: 30,
      price0: 852_500_000,
      cls: CAPITAL_REG,
      ltv: 0.4,
      ratePct: 4.48,
      stressAddPct: 3,
      ...over,
    });
  it("동탄 중위가·저축 30%: 기본은 2029년 말, 보수는 2028년부터 성과급이 급감(2030년엔 OPI·TAI 만)해 2031년까지 불가", () => {
    const cons = run("conservative");
    const base = run("base");
    expect(cons.years[1].bonusSaved).toBeLessThan(base.years[1].bonusSaved / 2);
    expect(cons.years[1].bonusSaved).toBeGreaterThan(0);
    expect(cons.years[3].bonusSaved).toBeLessThan(cons.years[2].bonusSaved / 3);
    expect(cons.buyYear).toBeNull();
    expect(cons.shortfall).toBeGreaterThan(0);
    expect(base.buyYear).toBe(2029);
  });
  it("잠금 주식 포함 토글은 판정 자산만 늘린다", () => {
    const off = run("base");
    const on = run("base", { includeLockedShares: true });
    expect(on.years[0].assets).toBe(off.years[0].assets);
    expect(on.years[0].assetsForPurchase).toBeGreaterThan(off.years[0].assetsForPurchase);
  });
  it("성과급 저축 0%·월 저축 0%면 현재 모은 돈만 — 동탄 8.5억은 불가", () => {
    const r = run("base", { bonusSavePct: 0, savingsRatePct: 0, startAssets: 10_000_000 });
    expect(r.buyYear).toBeNull();
    expect(r.years.every((y) => y.assets === 10_000_000)).toBe(true);
  });
});

describe("경계 입력 — NaN 이 결과로 새지 않는다", () => {
  it("모든 숫자 입력이 NaN 이어도 유한", () => {
    const r = afford({
      comp: flatComp({ salary0: Number.NaN }),
      startAssets: Number.NaN,
      savingsRatePct: Number.NaN,
      bonusSavePct: Number.NaN,
      savingsInterestPct: Number.NaN,
      price0: Number.NaN,
      priceGrowthPct: Number.NaN,
      ratePct: Number.NaN,
      stressAddPct: Number.NaN,
      ltv: Number.NaN,
      termYears: Number.NaN,
      existingAnnualDebtService: Number.NaN,
      netMonthlyOf: undefined,
    });
    const nums = [
      r.shortfall,
      r.repayment.monthlyPayment,
      r.repayment.monthlyNetPay,
      r.repayment.shareOfNetPct,
      ...r.years.flatMap((y) => [y.assets, y.assetsForPurchase, y.need, y.price, y.acqTax, y.loan.loan, y.loan.dsr, y.loan.ltvAmount, y.dsrIncome]),
    ];
    for (const n of nums) expect(Number.isFinite(n)).toBe(true);
  });
});
