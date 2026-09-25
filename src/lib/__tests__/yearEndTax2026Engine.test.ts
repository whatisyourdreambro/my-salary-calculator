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
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

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
  EDUCATION_CREDIT_2026,
  INSURANCE_CREDIT_2026,
  INSURANCE_RATES_2026,
  MARRIAGE_CREDIT_2026,
  PENSION_BASE_2026,
} from "@/lib/taxConstants2026";
import { calcDonationCredit2026, DONATION_CREDIT_2026 } from "@/lib/donationCredit";
import { withholdingIncomeTax2026 } from "@/lib/withholdingTaxTable2026";
import { GET as widgetGET } from "@/app/widget/year-end-tax/route";
import DualIncomeYearEndClient from "@/app/calc/dual-income-year-end/Client";
import YearEndTaxCalculator from "@/components/YearEndTaxCalculator";

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
    [30_000_000, 427_200, 356_664, 70_536],
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
    const person = (gross: number, kids: number, medical: number, education: number) =>
      calculateYearEndTax({
        ...plain(gross),
        dependents: 1 + kids,
        children: kids,
        medicalExpenses: medical,
        educationExpenses: education,
      }).determinedTax;
    // 기본 입력: 본인 6,000만·배우자 4,000만·자녀 1명·자녀 의료비 300만·교육비 200만·부부 상호 의료비 100만
    const allMe = { me: person(60_000_000, 1, 4_000_000, 2_000_000), sp: person(40_000_000, 0, 0, 0) };
    const allSp = { me: person(60_000_000, 0, 0, 0), sp: person(40_000_000, 1, 4_000_000, 2_000_000) };
    for (const v of [allMe.me, allMe.sp, allMe.me + allMe.sp, allSp.me, allSp.sp, allSp.me + allSp.sp]) {
      expect(html).toContain(fmt(v));
    }
    // 자녀·지출이 없는 쪽은 홑벌이 1인 근로자와 같다
    expect(allMe.sp).toBe(calculateYearEndTax(plain(40_000_000)).determinedTax);
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
