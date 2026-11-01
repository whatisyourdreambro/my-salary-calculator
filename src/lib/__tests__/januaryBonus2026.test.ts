// src/lib/__tests__/januaryBonus2026.test.ts
//
// /calc/january-bonus (13월의 월급 시뮬레이터) — 연말정산 정본 엔진 어댑터 고정 테스트 (2026-11-01 B23 CALC-01,
// 운영자 승인 2026-11-01 승인 목록 4번 권장안).
//
// 종전 Client.tsx 포크 엔진은 국민연금(소득세법 제51조의3)·건강·장기요양·고용보험료(제52조 제1항) 소득공제가 없었다.
// 원천징수세액을 비우면 같은 부풀린 산식으로 추정해 환급처럼 보였고, 간이세액표 기준 실제 원천징수세액을 넣으면
// 환급이 추가 납부로 뒤집혔다(같은 기본 입력, 총급여 4,000만 −176,078원·5,000만 −269,501원·7,000만 −1,061,996원).
// (a) 비움과 간이세액표 원천징수 직접 입력의 환급액이 같다.
// (b) 기본값 고정: 원천징수 2,868,624원, 결정세액(지방세 포함) 2,336,441원, 환급 +532,183원 (종전 +731,125원).
// (c) Client.tsx 에 포크 엔진이 남아 있지 않고, 결과 카드 바로 다음이 CalcResultAd 다 (입력칸 6개·결과 행 7개 그대로).
// (d) 엔진 TaxResult.breakdown 은 추가 필드일 뿐 — 기존 필드 값은 추가 전 엔진(3b49d42e5)과 같다.
// (e) 기부금 칸 = 고향사랑기부금 (조특법 제58조: 10만원까지 100/110, 10만원 초과 20만원 이하 40%, 초과분 15%).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/AdPlacement", () => ({
  CalcResultAd: () => createElement("div", { "data-test-ad": "result" }),
}));

import JanuaryBonusClient from "@/app/calc/january-bonus/Client";
import { calcCardDeduction2026 } from "@/lib/cardDeduction2026";
import { calcDonationCredit2026 } from "@/lib/donationCredit";
import { estimateJanuaryBonus2026, januaryBonusFamily, type JanuaryBonusInputs } from "@/lib/januaryBonus2026";
import { MEDICAL_CREDIT_2026, PENSION_ACCOUNT_CREDIT_2026 } from "@/lib/taxConstants2026";
import {
  calculateYearEndTax,
  deriveAnnualSocialInsurance2026,
  estimatePrepaidIncomeTax2026,
  type TaxInputs,
} from "@/lib/yearEndTaxCalculator";

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

/** 화면 기본값 — Client.tsx useState 초기값과 같다 */
const DEFAULTS: JanuaryBonusInputs = {
  salary: 50_000_000,
  card: 18_000_000,
  irp: 3_000_000,
  medical: 500_000,
  donation: 100_000,
  withheldWithLocal: 0,
  hasSpouse: false,
  dependents: 0,
};

describe("(a) 원천징수세액 비움 = 간이세액표 원천징수 직접 입력", () => {
  it.each([30_000_000, 40_000_000, 50_000_000, 70_000_000])("총급여 %d — 환급액이 같고 추가 납부로 뒤집히지 않는다", (salary) => {
    const blank = estimateJanuaryBonus2026({ ...DEFAULTS, salary });
    const typedValue = Math.round(estimatePrepaidIncomeTax2026(salary, 1, 0) * 1.1);
    const typed = estimateJanuaryBonus2026({ ...DEFAULTS, salary, withheldWithLocal: typedValue });
    expect(blank.isWithheldEstimated).toBe(true);
    expect(typed.isWithheldEstimated).toBe(false);
    expect(typed.withheld).toBe(blank.withheld);
    expect(typed.totalFinalTax).toBe(blank.totalFinalTax);
    expect(typed.refund).toBe(blank.refund);
    expect(blank.refund).toBeGreaterThan(0);
  });

  it("직접 넣은 원천징수세액은 그대로 쓰고 환급 = 입력값 − 결정세액(지방세 포함)이다 (추징도 그대로)", () => {
    const base = estimateJanuaryBonus2026(DEFAULTS);
    for (const typed of [1_000_000, 2_336_441, 5_000_000]) {
      const r = estimateJanuaryBonus2026({ ...DEFAULTS, withheldWithLocal: typed });
      expect(r.withheld).toBe(typed);
      expect(r.totalFinalTax).toBe(base.totalFinalTax);
      expect(r.refund).toBe(typed - base.totalFinalTax);
    }
    expect(estimateJanuaryBonus2026({ ...DEFAULTS, withheldWithLocal: 1_000_000 }).refund).toBe(-1_336_441);
  });
});

describe("(b) 기본값 고정 (총급여 5,000만·카드 1,800만·IRP 300만·의료비 50만·고향사랑 10만, 1인, 원천징수 비움)", () => {
  it("원천징수 2,868,624 · 결정세액 2,336,441 · 환급 +532,183 (종전 포크 엔진 +731,125)", () => {
    expect(estimateJanuaryBonus2026(DEFAULTS)).toEqual({
      withheld: 2_868_624,
      isWithheldEstimated: true,
      determinedTax: 2_124_037,
      totalFinalTax: 2_336_441,
      refund: 532_183,
      irpCredit: 450_000,
      medicalCredit: 0,
      donationCredit: 90_909,
      cardDeductionCapped: 825_000,
      standardTaxCreditApplied: false,
    });
  });

  it("/year-end-tax 와 같은 엔진 호출이다 — 4대보험 파생, 공제대상가족 = 본인+배우자+부양, 카드는 신용카드", () => {
    for (const i of [DEFAULTS, { ...DEFAULTS, salary: 80_000_000, hasSpouse: true, dependents: 2, medical: 4_000_000 }]) {
      const family = januaryBonusFamily(i.hasSpouse, i.dependents);
      const prepaid = estimatePrepaidIncomeTax2026(i.salary, family, 0);
      const engine = calculateYearEndTax({
        grossSalary: i.salary,
        prepaidTax: prepaid,
        ...deriveAnnualSocialInsurance2026(i.salary),
        dependents: family,
        disabledDependents: 0,
        seniorDependents: 0,
        housingSubscription: 0,
        creditCard: i.card,
        debitCardAndCash: 0,
        traditionalMarket: 0,
        publicTransport: 0,
        children: 0,
        childTaxCreditEligibleChildren: 0,
        birthsOrAdoptions: 0,
        pensionSavings: 0,
        irp: i.irp,
        lifeInsurance: 0,
        medicalExpenses: i.medical,
        educationExpenses: 0,
        donation: 0,
        hometownDonation: i.donation,
        monthlyRent: 0,
      });
      const r = estimateJanuaryBonus2026(i);
      expect(r.determinedTax).toBe(engine.determinedTax);
      expect(r.withheld).toBe(Math.round(prepaid * 1.1));
      expect(r.totalFinalTax).toBe(Math.round(engine.determinedTax * 1.1));
    }
    expect(januaryBonusFamily(true, 2)).toBe(4);
    expect(januaryBonusFamily(false, 0)).toBe(1);
  });

  it("IRP 공제율은 총급여 5,500만원 이하 15%, 초과 12% (소득세분), 한도 900만원", () => {
    expect(estimateJanuaryBonus2026({ ...DEFAULTS, salary: 55_000_000 }).irpCredit).toBe(450_000);
    expect(estimateJanuaryBonus2026({ ...DEFAULTS, salary: 55_000_001 }).irpCredit).toBe(360_000);
    expect(estimateJanuaryBonus2026({ ...DEFAULTS, irp: 12_000_000 }).irpCredit).toBe(1_350_000);
  });
});

describe("(c) 화면 — 포크 엔진 제거, 결과 카드 직하 CalcResultAd", () => {
  const src = read("src/app/calc/january-bonus/Client.tsx");
  const html = renderToStaticMarkup(createElement(JanuaryBonusClient));
  const text = (s: string) => s.replace(/<!--.*?-->/g, "").replace(/<[^>]+>/g, "");

  it("Client.tsx 에 자체 세율표·근로소득공제·원천징수 추정이 없고 정본 어댑터만 부른다", () => {
    for (const forked of ["TAX_BRACKETS", "calcEmpDeduction", "calcTax(", "estimateAnnualWithholding", "earnedIncomeTaxCredit2026"]) {
      expect(src).not.toContain(forked);
    }
    expect(src).toContain("estimateJanuaryBonus2026(");
  });

  it("입력칸 6개·결과 행 7개가 같은 순서로 남고, 마지막 행 바로 다음이 결과 광고다", () => {
    expect(html.match(/<input/g)).toHaveLength(6);
    const rows = [
      "총급여",
      "원천징수세액 (연간 세액 추정치)",
      "결정세액 (소득세 + 지방세)",
      "IRP 세액공제(소득세분)",
      "의료비 세액공제",
      "기부금 세액공제",
      "카드 소득공제",
    ];
    // 행 이름 뒤 </span> 로 찾는다 — 입력 라벨(총급여 (비과세 제외) 등)은 </label> 로 끝나 겹치지 않는다
    let at = -1;
    for (const label of rows) {
      const next = html.indexOf(`${label}</span>`, at + 1);
      expect(next, label).toBeGreaterThan(at);
      at = next;
    }
    expect(html.match(/data-test-ad=/g)).toHaveLength(1);
    const ad = html.indexOf('<div data-test-ad="result"');
    expect(ad).toBeGreaterThan(at);
    expect(text(html.slice(at, ad))).toBe("카드 소득공제825,000원");
    expect(src.indexOf("<CalcResultAd />")).toBeGreaterThan(src.indexOf('label: "카드 소득공제"'));
  });

  it("첫 화면 숫자 — 환급 +532,183원, 원천징수 2,868,624원, 결정세액 2,336,441원", () => {
    const plain = text(html);
    expect(plain).toContain("+532,183원");
    expect(plain).toContain("원천징수세액 (연간 세액 추정치)2,868,624원");
    expect(plain).toContain("결정세액 (소득세 + 지방세)2,336,441원");
    expect(plain).toContain("IRP 세액공제(소득세분)450,000원");
    expect(plain).toContain("기부금 세액공제90,909원");
    expect(plain).not.toContain("731,125");
  });

  it("입력 라벨 — 총급여 (비과세 제외), 의료비 지출액 (3% 초과분 공제), 고향사랑기부금 (10만원 전액)", () => {
    for (const label of ["총급여 (비과세 제외)", "의료비 지출액 (3% 초과분 공제)", "고향사랑기부금 (10만원 전액)"]) {
      expect(html).toContain(`>${label}</label>`);
    }
    expect(html).not.toContain("기부금 (10만원까지 100%)");
  });
});

describe("(d) 엔진 TaxResult.breakdown — 추가 필드, 기존 필드 값 불변", () => {
  const plain = (grossSalary: number): TaxInputs => ({
    grossSalary,
    prepaidTax: estimatePrepaidIncomeTax2026(grossSalary, 1, 0),
    ...deriveAnnualSocialInsurance2026(grossSalary),
    dependents: 1,
    disabledDependents: 0,
    seniorDependents: 0,
    housingSubscription: 0,
    creditCard: 0,
    debitCardAndCash: 0,
    traditionalMarket: 0,
    publicTransport: 0,
    children: 0,
    childTaxCreditEligibleChildren: 0,
    birthsOrAdoptions: 0,
    pensionSavings: 0,
    irp: 0,
    lifeInsurance: 0,
    medicalExpenses: 0,
    educationExpenses: 0,
    donation: 0,
    monthlyRent: 0,
  });

  // breakdown 추가 전 엔진(3b49d42e5)에서 뽑은 기존 필드 값. 같은 엔진으로 입력 9,072개 격자의 기존 필드
  // 전부가 추가 전후 같음을 확인했다(B23 커밋 본문). 여기서는 표준·특별 방식, 카드·연금·의료비·고향사랑·
  // 기부금·월세·보험료·자녀가 섞인 9개를 고정한다.
  const GOLDENS: [string, Partial<TaxInputs> & { grossSalary: number }, Omit<ReturnType<typeof calculateYearEndTax>, "breakdown">][] = [
    ["3천만 공제 없음 (표준)", { grossSalary: 30_000_000 },
      { finalRefund: -54_925, determinedTax: 482_125, taxBase: 17_325_000, grossSalary: 30_000_000, totalDeductions: 12_675_000, earnedIncomeDeduction: 9_750_000, incomeDeduction: 2_925_000, calculatedTax: 1_338_750, taxCredit: 856_625, standardTaxCreditApplied: true }],
    ["2천5백만 카드·IRP·고향사랑 (표준)", { grossSalary: 25_000_000, creditCard: 15_000_000, debitCardAndCash: 5_000_000, irp: 1_000_000, hometownDonation: 100_000 },
      { finalRefund: 265_080, determinedTax: 0, taxBase: 10_500_000, grossSalary: 25_000_000, totalDeductions: 14_500_000, earnedIncomeDeduction: 9_000_000, incomeDeduction: 5_500_000, calculatedTax: 630_000, taxCredit: 630_000, standardTaxCreditApplied: true }],
    ["2천만 의료비 300만 (특별)", { grossSalary: 20_000_000, medicalExpenses: 3_000_000 },
      { finalRefund: 146_640, determinedTax: 0, taxBase: 8_306_523, grossSalary: 20_000_000, totalDeductions: 11_693_477, earnedIncomeDeduction: 8_250_000, incomeDeduction: 3_443_477, calculatedTax: 498_391, taxCredit: 498_391, standardTaxCreditApplied: false }],
    ["1월 환급 기본값 5천만", { grossSalary: 50_000_000, creditCard: 18_000_000, irp: 3_000_000, medicalExpenses: 500_000, hometownDonation: 100_000 },
      { finalRefund: 483_803, determinedTax: 2_124_037, taxBase: 30_566_308, grossSalary: 50_000_000, totalDeductions: 19_433_692, earnedIncomeDeduction: 12_250_000, incomeDeduction: 7_183_692, calculatedTax: 3_324_946, taxCredit: 1_200_909, standardTaxCreditApplied: false }],
    ["4천만 의료비 250만·고향사랑 15만", { grossSalary: 40_000_000, creditCard: 12_000_000, medicalExpenses: 2_500_000, hometownDonation: 150_000 },
      { finalRefund: 52_972, determinedTax: 1_209_548, taxBase: 23_063_047, grossSalary: 40_000_000, totalDeductions: 16_936_953, earnedIncomeDeduction: 11_250_000, incomeDeduction: 5_686_953, calculatedTax: 2_199_457, taxCredit: 989_909, standardTaxCreditApplied: false }],
    ["7천만 배우자·부양 1·자녀 1 카드 혼합", { grossSalary: 70_000_000, dependents: 3, children: 2, childTaxCreditEligibleChildren: 1, creditCard: 20_000_000, debitCardAndCash: 6_000_000, traditionalMarket: 1_000_000, publicTransport: 500_000, pensionSavings: 7_000_000, irp: 4_000_000, medicalExpenses: 4_000_000, hometownDonation: 250_000, donation: 500_000, lifeInsurance: 1_000_000 },
      { finalRefund: 2_873_124, determinedTax: 2_532_516, taxBase: 42_672_832, grossSalary: 70_000_000, totalDeductions: 27_327_168, earnedIncomeDeduction: 13_250_000, incomeDeduction: 14_077_168, calculatedTax: 5_140_925, taxCredit: 2_608_409, standardTaxCreditApplied: false }],
    ["8천만 의료비 500만·월세", { grossSalary: 80_000_000, creditCard: 30_000_000, irp: 9_000_000, medicalExpenses: 5_000_000, monthlyRent: 6_000_000 },
      { finalRefund: 3_172_329, determinedTax: 4_694_751, taxBase: 55_519_794, grossSalary: 80_000_000, totalDeductions: 24_480_206, earnedIncomeDeduction: 13_750_000, incomeDeduction: 10_730_206, calculatedTax: 7_564_751, taxCredit: 2_870_000, standardTaxCreditApplied: false }],
    ["1억5천 카드 한도", { grossSalary: 150_000_000, creditCard: 60_000_000, irp: 9_000_000, hometownDonation: 300_000 },
      { finalRefund: 3_879_790, determinedTax: 24_799_010, taxBase: 119_042_625, grossSalary: 150_000_000, totalDeductions: 30_957_375, earnedIncomeDeduction: 15_750_000, incomeDeduction: 15_207_375, calculatedTax: 26_224_919, taxCredit: 1_425_909, standardTaxCreditApplied: false }],
    ["1천만 고향사랑만 (산출세액 한도)", { grossSalary: 10_000_000, hometownDonation: 100_000 },
      { finalRefund: 0, determinedTax: 0, taxBase: 2_028_262, grossSalary: 10_000_000, totalDeductions: 7_971_738, earnedIncomeDeduction: 5_500_000, incomeDeduction: 2_471_738, calculatedTax: 121_696, taxCredit: 121_696, standardTaxCreditApplied: false }],
  ];

  const LEGACY_KEYS = [
    "finalRefund", "determinedTax", "taxBase", "grossSalary", "totalDeductions",
    "earnedIncomeDeduction", "incomeDeduction", "calculatedTax", "taxCredit", "standardTaxCreditApplied",
  ];

  it.each(GOLDENS)("%s — 기존 필드는 추가 전 값 그대로, 새 키는 breakdown 하나", (_name, input, legacy) => {
    const result = calculateYearEndTax({ ...plain(input.grossSalary), ...input });
    expect(Object.keys(result)).toEqual([...LEGACY_KEYS, "breakdown"]);
    const { breakdown, ...rest } = result;
    expect(rest).toEqual(legacy);
    expect(Object.keys(breakdown)).toEqual(["cardDeduction", "pensionAccountCredit", "medicalCredit", "hometownCredit"]);
  });

  it.each(GOLDENS)("%s — breakdown 은 고른 방식에 넣은 정본 산식 금액", (_name, input) => {
    const i = { ...plain(input.grossSalary), ...input };
    const { breakdown, standardTaxCreditApplied } = calculateYearEndTax(i);
    expect(breakdown.cardDeduction).toBe(
      calcCardDeduction2026({
        grossSalary: i.grossSalary,
        children: i.children,
        creditCard: i.creditCard,
        checkCash: i.debitCardAndCash,
        traditionalMarket: i.traditionalMarket,
        publicTransport: i.publicTransport,
      }).finalDeduction
    );
    const pensionBase = Math.min(
      Math.min(i.pensionSavings, PENSION_ACCOUNT_CREDIT_2026.SAVINGS_CAP) + i.irp,
      PENSION_ACCOUNT_CREDIT_2026.TOTAL_CAP
    );
    expect(breakdown.pensionAccountCredit).toBe(
      pensionBase * (i.grossSalary <= PENSION_ACCOUNT_CREDIT_2026.SALARY_15_MAX ? PENSION_ACCOUNT_CREDIT_2026.RATE_HIGH : PENSION_ACCOUNT_CREDIT_2026.RATE_LOW)
    );
    const medicalNominal = Math.max(0, i.medicalExpenses - i.grossSalary * MEDICAL_CREDIT_2026.THRESHOLD_RATIO) * MEDICAL_CREDIT_2026.RATE;
    expect(breakdown.medicalCredit).toBe(standardTaxCreditApplied ? 0 : medicalNominal);
    expect(breakdown.hometownCredit).toBe(
      (i.hometownDonation ?? 0) > 0
        ? calcDonationCredit2026({ grossSalary: i.grossSalary, statutory: 0, general: 0, religious: 0, political: 0, hometown: i.hometownDonation ?? 0 }).hometownCredit
        : 0
    );
  });

  it("표준세액공제 방식을 고르면 의료비 세액공제는 0 으로 보인다 (특별세액공제라 적용 안 됨)", () => {
    const r = calculateYearEndTax({ ...plain(30_000_000), medicalExpenses: 1_000_000 });
    expect(r.standardTaxCreditApplied).toBe(true);
    expect(r.breakdown.medicalCredit).toBe(0);
    const itemized = calculateYearEndTax({ ...plain(20_000_000), medicalExpenses: 3_000_000 });
    expect(itemized.standardTaxCreditApplied).toBe(false);
    expect(itemized.breakdown.medicalCredit).toBe(360_000);
  });
});

describe("(e) 기부금 칸 = 고향사랑기부금 (조특법 제58조)", () => {
  it("10만원까지 100/110, 10만원 초과 20만원 이하 40%, 20만원 초과 15% — 10만원 경계에서 끊기지 않는다", () => {
    const credit = (donation: number) => estimateJanuaryBonus2026({ ...DEFAULTS, donation }).donationCredit;
    expect(credit(0)).toBe(0);
    expect(credit(100_000)).toBe(90_909);
    expect(credit(100_001)).toBe(90_909);
    expect(credit(150_000)).toBe(110_909);
    expect(credit(200_000)).toBe(130_909);
    expect(credit(300_000)).toBe(145_909);
  });

  it("고향사랑기부금 공제는 결정세액에 그대로 반영된다 (10만원 → 결정세액 90,909원 감소)", () => {
    const without = estimateJanuaryBonus2026({ ...DEFAULTS, donation: 0 });
    const withDonation = estimateJanuaryBonus2026(DEFAULTS);
    expect(without.determinedTax - withDonation.determinedTax).toBe(90_909);
  });
});
