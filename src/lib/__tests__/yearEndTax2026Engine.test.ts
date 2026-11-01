// src/lib/__tests__/yearEndTax2026Engine.test.ts
//
// 2026년 귀속 연말정산 정본 엔진 골든 (2026-09-26 W1-A — SEASON-01 (a)(c)).
//
// (a) 기납부세액 추정: 종전 /year-end-tax·홈 연말정산 탭은 기납부세액 기본값이 250만원 고정이라
//     신용 1,500만·체크 500만·1인 기준 총급여 6,000만원 이상에서 실제 환급(+18만~+64만원)을
//     '추가 납부 134만~925만원'으로 뒤집어 보여줬다. 이제 간이세액표(100%) × 12 로 추정한다.
// (c) 엔진 공제: 보장성보험 100만원 한도(소득세법 §59의4①), 출산·입양 30/50/70만원(§59의2③),
//     혼인 50만원(조특법 §92①), 고향사랑(조특법 §58 — donationCredit 정본), 교육비 1명당 한도(§59의4③).
// 대조: /widget/year-end-tax 결정세액 그리드와 /calc/dual-income-year-end 1인분 결정세액이 같은 입력의
//     calculateYearEndTax 와 같다.
// (b) B24 입력 확장 (2026-11-01, W2-A 90f1359d3·650a826ff 포팅 — YE-03·STR-10): 접힌 아코디언 2·3 에만
//     주택청약·전통시장·대중교통·자녀세액공제 대상 자녀·출산입양·혼인·의료비(본인 등/그 밖의 부양가족)·교육비(본인/
//     취학 전·초중고/대학생)·월세·보장성보험 입력을 더했다. 기본 상태 서버 렌더는 포팅 전(origin/main 3b49d42e5)과
//     바이트 동일해야 하고(광고 위 높이 불변), 새 입력마다 전형값에서 결정세액이 법정 금액만큼 준다. 자녀 칸은 W2-A 의
//     '자녀 수 (8~20세)' 대신 연간 자녀세액공제 적격 인원(2026년 귀속 9세 이상·2017년생 제외)에 잇는다.
//     엔진: 주택청약 총급여 7천만원 요건(조특법 §87②), 그 밖의 부양가족 의료비 700만원 한도·3% 문턱 순서(소득세법 §59의4②).
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import defaultSsrSnapshot from "./fixtures/yearEndTaxDefaultSsr-3b49d42e5.json";

vi.mock("next/navigation", () => ({ usePathname: () => "/year-end-tax" }));
vi.mock("@/components/AdPlacement", () => ({
  CalcResultAd: () => createElement("div", { "data-test-ad": "result" }),
}));

import {
  birthAdoptionCredit2026,
  calculateYearEndTax,
  deriveAnnualHealthPremium,
  deriveAnnualSocialInsurance2026,
  estimatePrepaidIncomeTax2026,
  type TaxInputs,
} from "@/lib/yearEndTaxCalculator";
import {
  BIRTH_CREDIT_2026,
  CHILD_TAX_CREDIT_2026,
  EDUCATION_CREDIT_2026,
  HOUSING_SUBSCRIPTION_DEDUCTION_2026,
  INSURANCE_CREDIT_2026,
  INSURANCE_RATES_2026,
  MARRIAGE_CREDIT_2026,
  MEDICAL_CREDIT_2026,
  PENSION_BASE_2026,
  RENT_CREDIT_2026,
} from "@/lib/taxConstants2026";
import { CARD_EXTRA_LIMIT_2026 } from "@/lib/cardDeduction2026";
import { calcDonationCredit2026, DONATION_CREDIT_2026 } from "@/lib/donationCredit";
import { withholdingIncomeTax2026 } from "@/lib/withholdingTaxTable2026";
import { GET as widgetGET } from "@/app/widget/year-end-tax/route";
import DualIncomeYearEndClient from "@/app/calc/dual-income-year-end/Client";
import YearEndTaxCalculator, {
  IncomeDeductionExtraFields,
  minDependents,
  TaxCreditExtraFields,
  withBirthOrder,
  withChildren,
  YEAR_END_FIELD_TIPS,
} from "@/components/YearEndTaxCalculator";

/** 공제 항목 전부 0 인 1인 근로자 — 4대보험은 총급여에서 파생 */
const plain = (grossSalary: number, prepaidTax = 0): TaxInputs => ({
  grossSalary,
  prepaidTax,
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

/** /year-end-tax 기본 입력과 같은 카드 사용 (신용 1,500만 + 체크 500만), 기납부세액은 간이세액표 추정 */
const withCards = (grossSalary: number, prepaidTax = estimatePrepaidIncomeTax2026(grossSalary, 1, 0)) => ({
  ...plain(grossSalary, prepaidTax),
  creditCard: 15_000_000,
  debitCardAndCash: 5_000_000,
});

describe("기납부세액 추정 — 간이세액표(100%) × 12", () => {
  it("월급여 = 총급여/12 의 간이세액표 소득세 × 12 이고 지방소득세는 넣지 않는다", () => {
    for (const g of [30_000_000, 50_000_000, 100_000_000]) {
      expect(estimatePrepaidIncomeTax2026(g, 1, 0)).toBe(
        withholdingIncomeTax2026(Math.round(g / 12), 1, 0) * 12
      );
    }
    // 부양가족·8~20세 자녀가 늘면 원천징수 추정액이 줄어든다
    expect(estimatePrepaidIncomeTax2026(60_000_000, 3, 1)).toBe(
      withholdingIncomeTax2026(5_000_000, 3, 1) * 12
    );
    expect(estimatePrepaidIncomeTax2026(60_000_000, 3, 1)).toBeLessThan(
      estimatePrepaidIncomeTax2026(60_000_000, 1, 0)
    );
    // 부양가족 0 이하는 본인 1명으로 본다, 총급여 0·NaN 은 0
    expect(estimatePrepaidIncomeTax2026(60_000_000, 0, 0)).toBe(estimatePrepaidIncomeTax2026(60_000_000, 1, 0));
    expect(estimatePrepaidIncomeTax2026(0, 1, 0)).toBe(0);
    expect(estimatePrepaidIncomeTax2026(Number.NaN, 1, 0)).toBe(0);
  });

  // 총급여 → [기납부세액 추정, 결정세액, 환급액]. 신용 1,500만 + 체크 500만, 1인.
  const GOLDENS: [number, number, number, number][] = [
    [30_000_000, 427_200, 295_250, 131_950], // 표준세액공제 방식이 61,414원 유리 (CALC-02)
    [40_000_000, 1_262_520, 1_222_957, 39_563],
    [50_000_000, 2_607_840, 2_507_446, 100_394],
    [60_000_000, 4_025_640, 3_842_936, 182_704],
    [80_000_000, 7_867_080, 7_424_751, 442_329],
    [100_000_000, 12_384_960, 11_746_316, 638_644],
  ];

  for (const [gross, prepaid, determined, refund] of GOLDENS) {
    it(`총급여 ${gross / 10_000}만원: 기납부 ${prepaid.toLocaleString("ko-KR")} → 환급 +${refund.toLocaleString("ko-KR")}원`, () => {
      expect(estimatePrepaidIncomeTax2026(gross, 1, 0)).toBe(prepaid);
      const r = calculateYearEndTax(withCards(gross));
      expect(r.determinedTax).toBe(determined);
      expect(r.finalRefund).toBe(refund);
      expect(r.finalRefund).toBeGreaterThan(0); // 부호 뒤집힘 금지
    });
  }

  it("종전 250만원 고정값은 6,000만원부터 환급을 추가 납부로 뒤집었다 (회귀 기록)", () => {
    const fixed = (g: number) => calculateYearEndTax(withCards(g, 2_500_000)).finalRefund;
    expect(fixed(60_000_000)).toBe(-1_342_936);
    expect(fixed(80_000_000)).toBe(-4_924_751);
    expect(fixed(100_000_000)).toBe(-9_246_316);
  });
});

describe("세액공제 항목 — 법정 금액만큼 결정세액이 준다 (총급여 5,000만원, 1인)", () => {
  const base = plain(50_000_000);
  const t0 = calculateYearEndTax(base).determinedTax;
  const drop = (p: Partial<TaxInputs>) => t0 - calculateYearEndTax({ ...base, ...p }).determinedTax;

  it("보장성보험료는 연 100만원까지만 12% (소득세법 §59의4①)", () => {
    expect(INSURANCE_CREDIT_2026.LIMIT).toBe(1_000_000);
    expect(drop({ lifeInsurance: 500_000 })).toBe(60_000);
    expect(drop({ lifeInsurance: 1_000_000 })).toBe(120_000);
    expect(drop({ lifeInsurance: 3_000_000 })).toBe(120_000); // 종전 무한도 × 12% = 36만원
  });

  it("출산·입양은 첫째 30만·둘째 50만·셋째 이상 70만원 (소득세법 §59의2③)", () => {
    expect(drop({ birthOrders: [1] })).toBe(300_000);
    expect(drop({ birthOrders: [2] })).toBe(500_000);
    expect(drop({ birthOrders: [3] })).toBe(700_000);
    expect(drop({ birthOrders: [4] })).toBe(700_000);
    expect(drop({ birthOrders: [1, 2] })).toBe(800_000); // 쌍둥이 첫째·둘째
    expect(BIRTH_CREDIT_2026).toEqual({ FIRST: 300_000, SECOND: 500_000, THIRD_PLUS: 700_000 });
  });

  it("순서를 모르는 birthsOrAdoptions 는 1명당 30만원(보수적), birthOrders 가 있으면 그쪽이 우선", () => {
    expect(drop({ birthsOrAdoptions: 1 })).toBe(300_000);
    expect(drop({ birthsOrAdoptions: 2 })).toBe(600_000);
    expect(drop({ birthsOrAdoptions: 2, birthOrders: [2] })).toBe(500_000);
    expect(birthAdoptionCredit2026([0, Number.NaN, -1], 0)).toBe(0);
    expect(birthAdoptionCredit2026([], 1)).toBe(300_000);
  });

  it("2026년 혼인신고는 50만원 (조특법 §92①, 생애 1회)", () => {
    expect(MARRIAGE_CREDIT_2026.AMOUNT).toBe(500_000);
    expect(MARRIAGE_CREDIT_2026.REGISTERED_UNTIL).toBe("2026-12-31");
    expect(drop({ marriedIn2026: true })).toBe(500_000);
    expect(drop({ marriedIn2026: false })).toBe(0);
  });

  it("고향사랑 10만원은 100/110, 20만원까지는 40% — donationCredit 정본과 같다 (조특법 §58)", () => {
    expect(drop({ hometownDonation: 100_000 })).toBe(90_909);
    expect(drop({ hometownDonation: 200_000 })).toBe(130_909);
    for (const hometown of [100_000, 200_000, 1_000_000]) {
      const canonical = calcDonationCredit2026({
        grossSalary: 50_000_000, statutory: 0, general: 0, religious: 0, political: 0, hometown,
      }).hometownCredit;
      expect(drop({ hometownDonation: hometown })).toBe(canonical);
    }
    expect(DONATION_CREDIT_2026.HOMETOWN_RATE_MID).toBe(0.4);
    // 고향사랑은 일반 기부금(15%) 축과 따로 계산된다
    expect(drop({ donation: 100_000 })).toBe(15_000);
  });

  it("교육비: 취학 전·초중고 1명당 300만, 대학생 900만, 본인 한도 없음 (소득세법 §59의4③)", () => {
    const rate = EDUCATION_CREDIT_2026.RATE;
    expect(drop({ educationChildSchool: 5_000_000, educationChildSchoolCount: 1 })).toBe(3_000_000 * rate);
    expect(drop({ educationChildSchool: 5_000_000, educationChildSchoolCount: 2 })).toBe(5_000_000 * rate);
    // 인원 미입력·0 이어도 지출이 있으면 1명 한도
    expect(drop({ educationChildSchool: 5_000_000 })).toBe(3_000_000 * rate);
    expect(drop({ educationChildSchool: 5_000_000, educationChildSchoolCount: 0 })).toBe(3_000_000 * rate);
    expect(drop({ educationUniversity: 12_000_000, educationUniversityCount: 1 })).toBe(9_000_000 * rate);
    expect(drop({ educationUniversity: 12_000_000, educationUniversityCount: 2 })).toBe(12_000_000 * rate);
    expect(drop({ educationSelf: 12_000_000 })).toBe(12_000_000 * rate);
    // 구분 없는 educationExpenses 는 종전대로 한도 없음 (/calc/dual-income-year-end 호환)
    expect(drop({ educationExpenses: 12_000_000 })).toBe(12_000_000 * rate);
  });

  it("세액공제 합계는 산출세액을 넘지 않는다", () => {
    const r = calculateYearEndTax({
      ...plain(20_000_000),
      birthOrders: [3, 3],
      marriedIn2026: true,
      educationSelf: 20_000_000,
    });
    expect(r.determinedTax).toBe(0);
    expect(r.taxCredit).toBe(r.calculatedTax);
  });
});

describe("연간 자녀세액공제 인원 분리", () => {
  const household = () => ({ ...plain(80_000_000, 2_000_000), dependents: 4, children: 2,
    creditCard: 35_000_000, debitCardAndCash: 10_000_000, birthOrders: [1] });

  it("적격 인원만 바꾸면 소득공제·카드공제·출산공제·기납부세액은 그대로다", () => {
    const input = household();
    const without = calculateYearEndTax(input);
    for (const [count, credit] of [[1, 250_000], [2, 550_000], [3, 950_000]]) {
      const withCredit = calculateYearEndTax({ ...input, childTaxCreditEligibleChildren: count });
      expect(withCredit.incomeDeduction).toBe(without.incomeDeduction);
      expect(withCredit.taxBase).toBe(without.taxBase);
      expect(withCredit.calculatedTax).toBe(without.calculatedTax);
      expect(without.determinedTax - withCredit.determinedTax).toBe(credit);
      expect(withCredit.finalRefund - without.finalRefund).toBe(credit);
    }
    const withoutBirth = calculateYearEndTax({ ...input, birthOrders: [] });
    expect(withoutBirth.determinedTax - without.determinedTax).toBe(300_000);
  });

  it("기존 카드용 자녀 인원에서 연간 적격 인원을 추론하지 않는다", () => {
    const input = { ...plain(80_000_000), dependents: 3 };
    expect(calculateYearEndTax({ ...input, children: 2 })).toEqual(calculateYearEndTax(input));
    const missing = { ...input } as Partial<TaxInputs>;
    delete missing.childTaxCreditEligibleChildren;
    expect(() => calculateYearEndTax(missing as TaxInputs)).toThrow(RangeError);
  });

  it.each([-1, 0.5, Number.NaN, Infinity, 4])("적격 인원 %s가 정수·부분집합 계약을 위반하면 거부한다", (count) => {
    expect(() => calculateYearEndTax({ ...household(), childTaxCreditEligibleChildren: count })).toThrow(RangeError);
  });

  it("낮은 세액에서 공제가 새 환급을 만들지 않고 이미 낸 세금까지만 돌려준다", () => {
    const result = calculateYearEndTax({ ...plain(5_000_000, 100_000), dependents: 2, childTaxCreditEligibleChildren: 1 });
    expect(result.determinedTax).toBe(0);
    expect(result.finalRefund).toBe(100_000);
    expect(result.taxCredit).toBe(result.calculatedTax);
  });
});

describe("연금계좌 공제 — 연금저축 개별 한도와 퇴직연금 합산 한도", () => {
  for (const [salary, rate] of [[55_000_000, 0.15], [55_000_001, 0.12]] as const) {
    it(`총급여 ${salary}: 계좌를 구분해 국세 공제율 ${rate}을 적용한다`, () => {
      const base = plain(salary);
      const noPension = calculateYearEndTax(base);
      const reduction = (pensionSavings: number, irp: number) => noPension.determinedTax -
        calculateYearEndTax({ ...base, pensionSavings, irp }).determinedTax;
      expect(reduction(0, 0)).toBe(0);
      expect(reduction(5_000_000, 0)).toBe(5_000_000 * rate);
      expect(reduction(6_000_000, 0)).toBe(6_000_000 * rate);
      expect(reduction(9_000_000, 0)).toBe(6_000_000 * rate);
      expect(reduction(0, 9_000_000)).toBe(9_000_000 * rate);
      expect(reduction(6_000_000, 3_000_000)).toBe(9_000_000 * rate);
      expect(reduction(9_000_000, 1_000_000)).toBe(7_000_000 * rate);
      expect(reduction(9_000_000, 9_000_000)).toBe(9_000_000 * rate);
      expect(reduction(-1_000_000, 1_000_000)).toBe(1_000_000 * rate);
    });
  }

  it("기납부세액이 없어도 공제로 환급을 만들어 내지 않고 결정세액 0원에서 멈춘다", () => {
    const result = calculateYearEndTax({ ...plain(20_000_000), pensionSavings: 9_000_000, irp: 9_000_000 });
    expect(result.determinedTax).toBe(0);
    expect(result.finalRefund).toBe(0);
    expect(result.taxCredit).toBe(result.calculatedTax);
  });
});

describe("대조 — 위젯·맞벌이 계산기와 같은 입력이면 같은 결과", () => {
  it("4대보험 파생 산식이 연금 기준소득월액 상·하한을 적용한다", () => {
    const low = deriveAnnualSocialInsurance2026(3_000_000);
    expect(low.nationalPension).toBe(Math.round(PENSION_BASE_2026.MIN_MONTHLY * INSURANCE_RATES_2026.NATIONAL_PENSION * 12));
    const high = deriveAnnualSocialInsurance2026(200_000_000);
    expect(high.nationalPension).toBe(Math.round(PENSION_BASE_2026.MAX_MONTHLY * INSURANCE_RATES_2026.NATIONAL_PENSION * 12));
    expect(high.healthInsurance).toBe(deriveAnnualHealthPremium(200_000_000));
    expect(high.employmentInsurance).toBe(Math.round(200_000_000 * INSURANCE_RATES_2026.EMPLOYMENT_INSURANCE));
  });

  it("/widget/year-end-tax 결정세액 그리드 = calculateYearEndTax (1,200만~2억, 100만원 간격 전 칸)", async () => {
    const html = await (await widgetGET()).text();
    const grid = JSON.parse(/var GRID = (\[[^\]]*\]);/.exec(html)![1]) as number[];
    expect(grid.length).toBe(189);
    grid.forEach((tax, i) => {
      const gross = 12_000_000 + i * 1_000_000;
      expect(tax).toBe(Math.round(calculateYearEndTax(plain(gross)).determinedTax));
    });
  });

  it("/calc/dual-income-year-end 의 1인분 결정세액 = calculateYearEndTax (기본 입력 SSR)", () => {
    const html = renderToStaticMarkup(createElement(DualIncomeYearEndClient));
    const fmt = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
    // 부부 상호 의료비는 그 밖의 부양가족 칸(medicalExpensesGeneral, 700만원 한도)으로 넘긴다 (B24)
    const person = (gross: number, kids: number, coupleMedical: number, education: number) =>
      calculateYearEndTax({
        ...plain(gross),
        dependents: 1 + kids,
        children: kids,
        medicalExpensesGeneral: coupleMedical,
        educationExpenses: education,
      }).determinedTax;
    // 기본 입력: 본인 6,000만·배우자 4,000만·자녀 0명·연간 적격 0명·부부 상호 의료비 100만. 11/1 통합 스윕 수리로
    // B25 의 300만원 예시를 되돌렸다 — '최적 대비' 칸이 +90,000원으로 넓어져 CalcResultAd 가 320~661px 에서 내려갔다.
    const allMe = { me: person(60_000_000, 0, 1_000_000, 0), sp: person(40_000_000, 0, 0, 0) };
    const allSp = { me: person(60_000_000, 0, 0, 0), sp: person(40_000_000, 0, 1_000_000, 0) };
    for (const v of [allMe.me, allMe.sp, allMe.me + allMe.sp, allSp.me, allSp.sp, allSp.me + allSp.sp]) {
      expect(html).toContain(fmt(v));
    }
    // 자녀·지출이 없는 쪽은 홑벌이 1인 근로자와 같다
    expect(allMe.sp).toBe(calculateYearEndTax(plain(40_000_000)).determinedTax);
    // 100만원은 두 사람 3% 문턱(본인 180만·배우자 120만)에 모두 못 미쳐 어느 쪽이든 합계가 같다 — 절감 0원, 최적 대비 칸 —
    expect(allMe.me + allMe.sp).toBe(allSp.me + allSp.sp);
    expect(html).toContain(">0원<");
    expect(html).not.toContain(">+90,000원<");
    expect(html).toContain("부부 상호 의료비 → 어느 쪽이든 같음");
  });

  it("/year-end-tax 계산기는 기본 상태에서 간이세액표 추정 기납부세액을 보여준다 (줄 추가 없이 라벨만)", () => {
    const html = renderToStaticMarkup(createElement(YearEndTaxCalculator));
    expect(html).toContain("기납부세액 (간이세액표 추정·수정 가능)");
    expect(html).not.toContain("원천징수된 세금 총액");
    expect(html).toContain(`value="${estimatePrepaidIncomeTax2026(50_000_000, 1, 0).toLocaleString("ko-KR")}"`);
    expect(html).not.toContain('value="2,500,000"');
    // 계측은 이벤트 핸들러·ref 뿐 — SSR 마크업에 흔적을 남기지 않는다
    expect(html).not.toContain("inputProps");
    expect(html).not.toContain("resultRef");
  });
});

describe("B24 엔진 — 새 입력이 전형값에서 법정 금액만큼 결정세액을 줄인다 (총급여 5,000만원, 1인)", () => {
  const base = plain(50_000_000);
  const t0 = calculateYearEndTax(base).determinedTax;
  const drop = (p: Partial<TaxInputs>, from: TaxInputs = base) =>
    calculateYearEndTax(from).determinedTax - calculateYearEndTax({ ...from, ...p }).determinedTax;

  it("5,000만원 1인 기준선: 특별공제 방식, 과세표준 15% 구간, 근로소득세액공제는 한도(66만원)에 걸려 있다", () => {
    const r = calculateYearEndTax(base);
    expect(r.standardTaxCreditApplied).toBe(false);
    expect(r.taxBase).toBe(31_391_308);
    expect(r.calculatedTax).toBe(3_448_696);
    expect(t0).toBe(2_788_696);
  });

  it("주택청약: 연 300만원 한도 40% 소득공제 → 15% 구간에서 18만원, 총급여 7천만원 초과는 0 (조특법 §87②)", () => {
    expect(HOUSING_SUBSCRIPTION_DEDUCTION_2026).toEqual({ LIMIT: 3_000_000, RATE: 0.4, SALARY_CAP: 70_000_000 });
    expect(drop({ housingSubscription: 3_000_000 })).toBe(180_000); // 300만 × 40% × 15%
    expect(drop({ housingSubscription: 5_000_000 })).toBe(180_000); // 300만원 초과분은 공제 없음
    expect(drop({ housingSubscription: 3_000_000 }, plain(70_000_000))).toBe(180_000); // 경계 포함
    expect(drop({ housingSubscription: 3_000_000 }, plain(70_000_001))).toBe(0);
    expect(drop({ housingSubscription: 3_000_000 }, plain(80_000_000))).toBe(0);
    // 음수 입력은 공제 0 (종전 리터럴 식은 음수 공제로 세금을 늘렸다)
    expect(drop({ housingSubscription: -1_000_000 })).toBe(0);
  });

  it("전통시장·대중교통: 40% 공제, 카드 기본 한도를 넘으면 추가 한도 300만원(7천만원 초과 200만원) (조특법 §126의2)", () => {
    const card = { ...base, creditCard: 20_000_000 }; // 최저사용금액(1,250만)을 신용카드로 넘긴 상태, 기본 한도 미달
    expect(drop({ traditionalMarket: 1_000_000 }, card)).toBe(60_000); // 100만 × 40% × 15%
    expect(drop({ publicTransport: 1_000_000 }, card)).toBe(60_000);
    const full = { ...base, creditCard: 40_000_000 }; // 기본 한도 300만원이 찬 상태
    expect(drop({ traditionalMarket: 1_000_000 }, full)).toBe(60_000); // 추가 한도로 들어간다
    expect(drop({ traditionalMarket: 10_000_000 }, full)).toBe(450_000); // 추가 한도 300만 × 15%
    expect(CARD_EXTRA_LIMIT_2026.LOW_SALARY).toBe(3_000_000);
    // 총급여 8,000만원(24% 구간)은 추가 한도 200만원
    const high = { ...plain(80_000_000), creditCard: 60_000_000 };
    expect(drop({ publicTransport: 10_000_000 }, high)).toBe(480_000); // 추가 한도 200만 × 24%
    expect(CARD_EXTRA_LIMIT_2026.HIGH_SALARY).toBe(2_000_000);
  });

  it("문화·체육: 30% 공제, 총급여 7천만원 이하만, 추가 한도 300만원은 전통시장·대중교통과 함께 쓴다 (조특법 §126의2②3·⑪1)", () => {
    const card = { ...base, creditCard: 20_000_000 };
    expect(drop({ culture: 1_000_000 }, card)).toBe(45_000); // 100만 × 30% × 15%
    // 넘기지 않으면 0 과 같다 (기존 호출부 불변)
    expect(calculateYearEndTax({ ...card, culture: 0 })).toEqual(calculateYearEndTax(card));
    const full = { ...base, creditCard: 40_000_000 }; // 기본 한도 300만원이 찬 상태
    expect(drop({ culture: 10_000_000 }, full)).toBe(450_000); // 300만(추가 한도) × 15%
    // 전통시장과 합쳐도 추가 한도는 300만원 하나
    expect(drop({ culture: 10_000_000, traditionalMarket: 10_000_000 }, full)).toBe(450_000);
    // 총급여 7천만원 초과는 문화·체육 사용분을 공제하지 않는다
    expect(drop({ culture: 10_000_000 }, { ...plain(80_000_000), creditCard: 30_000_000 })).toBe(0);
  });

  it("자녀세액공제 대상(2026년 귀속 9세 이상·2017년생 제외): 1명 25만·2명 55만·3명 95만원 (소득세법 §59의2①)", () => {
    expect(drop({ childTaxCreditEligibleChildren: 1 }, { ...base, dependents: 2 })).toBe(CHILD_TAX_CREDIT_2026.FIRST);
    expect(drop({ childTaxCreditEligibleChildren: 2 }, { ...base, dependents: 3 })).toBe(550_000);
    expect(drop({ childTaxCreditEligibleChildren: 3 }, { ...base, dependents: 4 })).toBe(950_000);
  });

  it("의료비: 본인 등은 3% 초과분 한도 없이, 그 밖의 부양가족은 3% 초과분 연 700만원까지 15% (소득세법 §59의4②)", () => {
    expect(MEDICAL_CREDIT_2026.DEPENDENT_CAP).toBe(7_000_000);
    // 총급여 3% = 150만원
    expect(drop({ medicalExpenses: 3_000_000 })).toBe(225_000);
    expect(drop({ medicalExpenses: 20_000_000 })).toBe(2_775_000); // (2,000만 − 150만) × 15%
    expect(drop({ medicalExpensesGeneral: 3_000_000 })).toBe(225_000);
    expect(drop({ medicalExpensesGeneral: 10_000_000 })).toBe(1_050_000); // 850만원 → 700만원 한도 × 15%
    // 3% 문턱은 그 밖의 부양가족 의료비에서 먼저 빼고, 모자란 만큼 본인 등 의료비에서 뺀다
    expect(drop({ medicalExpensesGeneral: 1_000_000, medicalExpenses: 3_000_000 })).toBe(375_000); // 본인 등 300만 − 문턱 부족분 50만 = 250만 × 15%
    expect(drop({ medicalExpensesGeneral: 2_000_000, medicalExpenses: 3_000_000 })).toBe(525_000); // 그 밖 50만 + 본인 등 300만 = 350만 × 15%
    expect(drop({ medicalExpensesGeneral: 20_000_000, medicalExpenses: 3_000_000 })).toBe(1_500_000); // 그 밖 700만(한도) + 본인 등 300만 = 1,000만 × 15%
    // 구분 없이 medicalExpenses 만 넘기는 호출부(/calc/january-bonus)는 종전 식 그대로
    expect(drop({ medicalExpenses: 4_000_000, medicalExpensesGeneral: 0 })).toBe(drop({ medicalExpenses: 4_000_000 }));
    // 상세 행용 breakdown(B23)에도 그 밖의 부양가족 몫이 들어간다
    expect(calculateYearEndTax({ ...base, medicalExpensesGeneral: 10_000_000 }).breakdown.medicalCredit).toBe(1_050_000);
  });

  it("월세: 연 1,000만원 한도, 총급여 5,500만원 이하 17%·8,000만원 이하 15%·초과 0 (조특법 §95의2)", () => {
    expect(RENT_CREDIT_2026.CAP).toBe(10_000_000);
    expect(drop({ monthlyRent: 6_000_000 })).toBe(1_020_000); // 600만 × 17%
    expect(drop({ monthlyRent: 12_000_000 })).toBe(1_700_000); // 1,000만(한도) × 17%
    expect(drop({ monthlyRent: 6_000_000 }, plain(60_000_000))).toBe(900_000);
    expect(drop({ monthlyRent: 6_000_000 }, plain(80_000_000))).toBe(900_000);
    expect(drop({ monthlyRent: 6_000_000 }, plain(80_000_001))).toBe(0);
  });
});

// ── B24 화면 — 접힌 아코디언 2·3 의 새 입력 ─────────────────────────────────────────────
type El = { type: unknown; props: Record<string, unknown> };
/** 렌더하지 않은 요소 트리를 props.children 으로 훑는다 (추가 입력 컴포넌트는 훅이 없어 함수로 바로 부를 수 있다) */
function* walkTree(node: unknown): Generator<El> {
  if (Array.isArray(node)) {
    for (const n of node) yield* walkTree(n);
    return;
  }
  if (node && typeof node === "object" && "props" in node) {
    const el = node as El;
    yield el;
    yield* walkTree(el.props.children);
  }
}

/** /year-end-tax 기본 입력과 같다 (총급여 5,000만, 신용 1,500만 + 체크 500만, 1인, 새 항목 0) */
const UI_DEFAULT: TaxInputs = {
  ...plain(50_000_000),
  creditCard: 15_000_000,
  debitCardAndCash: 5_000_000,
  culture: 0,
  medicalExpensesGeneral: 0,
  educationSelf: 0,
  educationChildSchool: 0,
  educationChildSchoolCount: 1,
  educationUniversity: 0,
  educationUniversityCount: 1,
};
/** 컴포넌트 derivedInputs 와 같은 파생 (4대보험·간이세액표 기납부 추정 — 월 원천징수 자녀 인원은 0) */
const runUi = (i: TaxInputs) =>
  calculateYearEndTax({
    ...i,
    ...deriveAnnualSocialInsurance2026(i.grossSalary),
    prepaidTax: estimatePrepaidIncomeTax2026(i.grossSalary, i.dependents, 0),
  });
/** handleInputChange 와 같은 파싱 */
const parseWon = (v: string) => Number(v.replace(/,/g, "")) || 0;

function extraTrees(inputs: TaxInputs) {
  const onCurrency = vi.fn();
  const onNumber = vi.fn();
  const onChildren = vi.fn();
  const onBirthOrder = vi.fn();
  const onMarried = vi.fn();
  const income = IncomeDeductionExtraFields({ inputs, handleInputChange: onCurrency, handleNumberChange: onNumber });
  const credit = TaxCreditExtraFields({
    inputs,
    handleInputChange: onCurrency,
    handleNumberChange: onNumber,
    onChildrenChange: onChildren,
    onBirthOrderChange: onBirthOrder,
    onMarriedChange: onMarried,
  });
  const els = [...walkTree(income), ...walkTree(credit)];
  const byLabel = (label: string) => {
    const found = els.filter((e) => e.props.label === label);
    expect({ label, count: found.length }).toEqual({ label, count: 1 });
    return found[0];
  };
  return { els, byLabel, onCurrency, onNumber, onChildren, onBirthOrder, onMarried };
}

const openedMarkup = (inputs: TaxInputs) =>
  [
    renderToStaticMarkup(createElement(IncomeDeductionExtraFields, { inputs, handleInputChange: () => {}, handleNumberChange: () => {} })),
    renderToStaticMarkup(
      createElement(TaxCreditExtraFields, {
        inputs,
        handleInputChange: () => {},
        handleNumberChange: () => {},
        onChildrenChange: () => {},
        onBirthOrderChange: () => {},
        onMarriedChange: () => {},
      })
    ),
  ].join("");

describe("B24 화면 — 새 입력은 접힌 아코디언 2·3 안에만 있고 기본 렌더는 바이트 동일", () => {
  const html = renderToStaticMarkup(createElement(YearEndTaxCalculator));

  it("기본 상태 서버 렌더가 포팅 전(origin/main 3b49d42e5) 고정본과 바이트 동일하다 — 광고 위 높이 불변", () => {
    expect(Buffer.byteLength(html, "utf8")).toBe(defaultSsrSnapshot.bytes);
    expect(createHash("sha256").update(html, "utf8").digest("base64")).toBe(defaultSsrSnapshot.sha256);
    // 아코디언 2·3 은 접힌 채로, 1 만 펼쳐져 있다
    expect(html.match(/aria-expanded="false"/g)?.length).toBe(2);
    expect(html.match(/aria-expanded="true"/g)?.length).toBe(1);
    for (const label of ["전통시장", "대중교통", "문화·체육", "주택청약", "의료비", "교육비", "월세", "보장성보험료", "혼인", "출산", "자녀세액공제"]) {
      expect({ label, visible: html.includes(label) }).toEqual({ label, visible: false });
    }
  });

  it("펼친 아코디언에는 라벨마다 입력이 하나씩, 한도 안내가 정본 상수 값으로 붙는다", () => {
    const opened = openedMarkup(UI_DEFAULT);
    for (const tip of Object.values(YEAR_END_FIELD_TIPS)) expect(opened).toContain(tip);
    // 법정 한도·공제율이 화면 문구로 그대로 나온다 (소득세법 §59의2·§59의4, 조특법 §87②·§92·§95의2·§126의2)
    expect(YEAR_END_FIELD_TIPS).toEqual({
      traditionalMarket: "공제율 40% · 카드 기본 한도를 넘으면 대중교통과 합산해 추가 300만원(총급여 7,000만원 초과 200만원)까지",
      publicTransport: "공제율 40% · 추가 한도는 전통시장과 합산",
      culture: "공제율 30% · 총급여 7,000만원 이하만 · 추가 한도는 전통시장·대중교통과 합산",
      housingSubscription: "무주택 세대주(배우자 포함)·총급여 7,000만원 이하 · 연 300만원 한도 납입액의 40% 소득공제",
      lifeInsurance: "연 100만원 한도 · 12% 세액공제",
      children: "2026년 귀속 9세 이상·2017년생 제외 · 부양가족에 자동 포함 · 1명 25만원 · 2명 55만원 · 3명부터 1명당 40만원 추가",
      birth: "자녀세액공제와 별도 · 부양가족에 자동 포함",
      marriage: "생애 1회 50만원 · 부부 각각 (2026년 12월 31일 신고분까지)",
      medicalSpecial: "총급여 3% 초과분의 15% · 한도 없음",
      medicalGeneral: "총급여 3% 초과분의 15% · 연 700만원 한도",
      educationSelf: "대학원·직업능력개발훈련 포함 · 15% · 한도 없음",
      monthlyRent: "무주택 세대주·총급여 8,000만원 이하 · 연 1,000만원 한도 · 5,500만원 이하 17%, 초과 15%",
      educationChildSchool: "1명당 연 300만원 한도 · 15%",
      educationUniversity: "1명당 연 900만원 한도(대학원 제외) · 15%",
    });
    expect(opened).toContain("첫째 (30만원)");
    expect(opened).toContain("둘째 (50만원)");
    expect(opened).toContain("셋째 이상 (70만원)");
    expect(opened).toContain("2026년 혼인신고");
    expect(opened).toContain("자녀세액공제 대상 자녀");
    // W2-A 의 8~20세 자녀 칸은 옮겨 오지 않는다 (STR-10 — 연간 자녀세액공제 인원과 기준이 다르다)
    expect(opened).not.toContain("8~20세");
    // 고향사랑 입력은 이 화면에 두지 않는다 (기부금 칸 안내대로 유형별 계산기)
    expect(opened).not.toContain("고향사랑");
    // 새 항목 기본값은 0·미선택 — 금액 입력 11개와 출산·입양 '없음'
    expect(opened).not.toContain("checked");
    expect(opened.match(/value="0"/g)?.length).toBe(12);
    // 금액 입력의 한도 안내는 aria-describedby 로 입력에 이어진다 (기부금 칸과 같은 CurrencyInput description)
    expect(opened.match(/aria-describedby="[^"]+-description"/g)?.length).toBe(11);
  });

  it("안내 문구 소스에 금액·비율 리터럴이 없다 (정본 상수에서만 만든다)", () => {
    const src = readFileSync(join(process.cwd(), "src/components/YearEndTaxCalculator.tsx"), "utf8");
    const block = src.slice(src.indexOf("export const YEAR_END_FIELD_TIPS"), src.indexOf("} as const;", src.indexOf("export const YEAR_END_FIELD_TIPS")));
    expect(block.length).toBeGreaterThan(500);
    expect(block).not.toMatch(/\d[\d,_]*\s*(만원|원|%)/);
    const options = src.slice(src.indexOf("const BIRTH_ORDER_OPTIONS"), src.indexOf("] as const;", src.indexOf("const BIRTH_ORDER_OPTIONS")));
    expect(options).not.toMatch(/\d[\d,_]*\s*(만원|원)/);
    // 부양가족 최소 인원은 자녀세액공제 대상·출산 입력을 따른다 (아코디언 2 스테퍼)
    expect(src).toContain("min={minDependents(inputs)}");
    // 새 입력은 기존 접힌 아코디언 안에만 — 아코디언 개수·계측 영역 배선은 그대로
    expect(src.match(/<Accordion title=/g)?.length).toBe(3);
    expect(src.match(/contentProps=\{measurement\.inputProps\}/g)?.length).toBe(3);
  });

  // 라벨 → 입력값(전형값) → 엔진 필드 → 결정세액 감소액(법정 금액). 기본 입력(신용 1,500만 + 체크 500만) 위에서 잰다.
  const CURRENCY_GOLDENS: [label: string, field: keyof TaxInputs, typed: string, drop: number][] = [
    ["전통시장", "traditionalMarket", "1,000,000", 60_000], // 100만 × 40% × 15%
    ["대중교통", "publicTransport", "1,000,000", 60_000],
    ["문화·체육 (도서·공연·영화·체육시설 등)", "culture", "1,000,000", 45_000], // 100만 × 30% × 15%
    ["주택청약 납입액", "housingSubscription", "3,000,000", 180_000], // 300만 × 40% × 15%
    ["보장성보험료", "lifeInsurance", "1,000,000", 120_000], // 100만 × 12%
    ["의료비 (본인·6세 이하·65세 이상·장애인)", "medicalExpenses", "3,000,000", 225_000], // (300만 − 3% 150만) × 15%
    ["의료비 (그 밖의 부양가족)", "medicalExpensesGeneral", "10,000,000", 1_050_000], // 700만 한도 × 15%
    ["교육비 (본인)", "educationSelf", "5,000,000", 750_000], // 한도 없음 × 15%
    ["교육비 (취학 전·초중고)", "educationChildSchool", "5,000,000", 450_000], // 1명 300만 한도 × 15%
    ["교육비 (대학생)", "educationUniversity", "12,000,000", 1_350_000], // 1명 900만 한도 × 15%
    ["월세 (연간 합계)", "monthlyRent", "6,000,000", 1_020_000], // 600만 × 17%
  ];

  for (const [label, field, typed, expectedDrop] of CURRENCY_GOLDENS) {
    it(`${label} ${typed}원 → ${field} → 결정세액 −${expectedDrop.toLocaleString("ko-KR")}원, 환급 +같은 금액`, () => {
      const t = extraTrees(UI_DEFAULT);
      const control = t.byLabel(label);
      expect(control.props.value).toBe("0");
      expect(typeof control.props.description).toBe("string");
      (control.props.onValueChange as (v: string) => void)(typed);
      expect(t.onCurrency).toHaveBeenLastCalledWith(field, typed);
      const before = runUi(UI_DEFAULT);
      const after = runUi({ ...UI_DEFAULT, [field]: parseWon(typed) });
      expect(before.determinedTax - after.determinedTax).toBe(expectedDrop);
      // 기납부세액 추정은 가족 수로만 바뀌므로 환급액도 같은 금액만큼 는다
      expect(after.finalRefund - before.finalRefund).toBe(expectedDrop);
    });
  }

  it("교육비 인원 스테퍼 → 1명당 한도가 인원만큼 늘어난다", () => {
    const t = extraTrees(UI_DEFAULT);
    for (const [label, field] of [
      ["취학 전·초중고 인원", "educationChildSchoolCount"],
      ["대학생 인원", "educationUniversityCount"],
    ] as const) {
      const stepper = t.byLabel(label);
      expect(stepper.props.value).toBe(1);
      expect(stepper.props.min).toBe(1);
      (stepper.props.onValueChange as (v: number) => void)(2);
      expect(t.onNumber).toHaveBeenLastCalledWith(field, 2);
    }
    const school = { ...UI_DEFAULT, educationChildSchool: 5_000_000 };
    expect(runUi(school).determinedTax - runUi({ ...school, educationChildSchoolCount: 2 }).determinedTax).toBe(
      300_000 // 1명 한도 300만 → 2명 한도 600만: 공제 대상 300만 → 500만, 차이 200만 × 15%
    );
  });

  it("자녀세액공제 대상 자녀 → 연간 적격 인원(childTaxCreditEligibleChildren), 부양가족(본인 포함)이 모자라면 함께 오른다 (STR-10)", () => {
    const t = extraTrees(UI_DEFAULT);
    const stepper = t.byLabel("자녀세액공제 대상 자녀");
    expect(stepper.props.value).toBe(0);
    expect(stepper.props.onValueChange).toBe(t.onChildren);
    const one = withChildren(UI_DEFAULT, 1);
    // 카드 한도용 children 은 0 그대로 — 연간 자녀세액공제 인원과 기준이 다르다
    expect(one).toMatchObject({ childTaxCreditEligibleChildren: 1, children: 0, dependents: 2 });
    // 부양가족을 이미 넉넉히 세었으면 그대로 둔다
    expect(withChildren({ ...UI_DEFAULT, dependents: 4 }, 2)).toMatchObject({ childTaxCreditEligibleChildren: 2, dependents: 4 });
    // 자녀세액공제만의 몫: 같은 부양가족 2명에서 적격 0 → 1
    expect(runUi({ ...UI_DEFAULT, dependents: 2 }).determinedTax - runUi(one).determinedTax).toBe(CHILD_TAX_CREDIT_2026.FIRST);
    // 자동으로 는 부양가족 1명(기본공제 150만원 × 15%)까지 합친 화면상 감소액
    expect(runUi(UI_DEFAULT).determinedTax - runUi(one).determinedTax).toBe(475_000); // 기본공제 150만 × 15% + 자녀 25만
    expect(minDependents({ childTaxCreditEligibleChildren: 2, birthOrders: [1] })).toBe(4);
    expect(minDependents({ childTaxCreditEligibleChildren: 0 })).toBe(1);
    // 스테퍼로 오르내린 어떤 상태도 엔진의 적격 인원 계약(본인 제외 부양가족 이내 정수)을 어기지 않는다
    let state = UI_DEFAULT;
    for (const n of [1, 2, 3, 4, 5, 4, 2, 0]) {
      state = withChildren(state, n);
      expect(state.dependents).toBeGreaterThanOrEqual(minDependents(state));
      expect(() => runUi(state)).not.toThrow();
    }
    // 내려도 부양가족은 사용자가 직접 줄인다 (스테퍼 최솟값은 minDependents)
    expect(state).toMatchObject({ childTaxCreditEligibleChildren: 0, dependents: 6 });
  });

  it("출산·입양 순서 선택 → birthOrders, 첫째 30만·둘째 50만·셋째 이상 70만원", () => {
    const t = extraTrees(UI_DEFAULT);
    const select = t.els.find((e) => e.type === "select")!;
    expect(select.props.value).toBe(0);
    (select.props.onChange as (e: { target: { value: string } }) => void)({ target: { value: "2" } });
    expect(t.onBirthOrder).toHaveBeenLastCalledWith(2);
    for (const [order, amount] of [
      [1, BIRTH_CREDIT_2026.FIRST],
      [2, BIRTH_CREDIT_2026.SECOND],
      [3, BIRTH_CREDIT_2026.THIRD_PLUS],
    ] as const) {
      const next = withBirthOrder(UI_DEFAULT, order);
      expect(next).toMatchObject({ birthOrders: [order], dependents: 2 });
      expect(runUi({ ...UI_DEFAULT, dependents: 2 }).determinedTax - runUi(next).determinedTax).toBe(amount);
    }
    // '없음' 으로 되돌리면 공제는 빠지고, 올라간 부양가족은 사용자가 직접 내린다
    expect(withBirthOrder(withBirthOrder(UI_DEFAULT, 1), 0)).toMatchObject({ birthOrders: [], dependents: 2 });
    // 출산 자녀와 자녀세액공제 대상 자녀는 서로 다른 사람이라 부양가족 최소 인원에 따로 더한다
    expect(withBirthOrder(withChildren(UI_DEFAULT, 1), 1)).toMatchObject({ dependents: 3 });
    // 선택 상태는 birthOrders 첫 값으로 표시된다
    const shown = extraTrees({ ...UI_DEFAULT, birthOrders: [3] }).els.find((e) => e.type === "select")!;
    expect(shown.props.value).toBe(3);
  });

  it("2026년 혼인신고 체크 → marriedIn2026, 50만원", () => {
    const t = extraTrees(UI_DEFAULT);
    const box = t.els.find((e) => e.type === "input" && e.props.type === "checkbox")!;
    expect(box.props.checked).toBe(false);
    (box.props.onChange as (e: { target: { checked: boolean } }) => void)({ target: { checked: true } });
    expect(t.onMarried).toHaveBeenLastCalledWith(true);
    const married = runUi({ ...UI_DEFAULT, marriedIn2026: true });
    expect(runUi(UI_DEFAULT).determinedTax - married.determinedTax).toBe(MARRIAGE_CREDIT_2026.AMOUNT);
    expect(married.finalRefund - runUi(UI_DEFAULT).finalRefund).toBe(500_000);
  });
});
