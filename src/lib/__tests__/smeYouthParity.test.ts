// 중소기업 청년 감면 엔진 정합 테스트 — 2026-09-25 CALC-09 (batch B10) · A17 (CALC-01).
//
// calculator.ts 의 '중소기업 청년' 스위치(InteractiveTable·홈 고급 설정)와 전용 계산기
// /calc/smb-income-tax-break(smbTaxBreak.computeSmbTaxBreak)는 같은 헬퍼 applySmeYouthReduction
// 으로 조특법 §30(산출세액 × 90%, 과세기간 200만 한도)과 소득세법 §59③(근로소득세액공제
// × (1 − 감면/산출세액))을 계산한다. 종전 calculator.ts 는 세액공제 뒤 금액에 90%·200만 한도를
// 적용해 한도가 걸리는 연봉에서 절감액을 과대 계산했다(5,000만 연 2,000,004원).
//
// A17 이후 두 표면의 '기준 세액'은 다르다 — 월 실수령 엔진은 근로소득 간이세액표(별표2)의 산식,
// 전용 계산기는 인적공제·4대보험료 소득공제만 넣은 연간 결정세액 근사. 그래서 금액 일치가 아니라
// 같은 헬퍼·같은 법 구조(감면은 산출세액에, 공제는 비율 축소)를 쓰는지를 검증한다.
//
// 2026-10-06 감사 code7-03: 전용 계산기의 과세표준에 건강·장기요양·고용보험료 공제(소득세법 §52①)가
// 빠져 있었다(연봉 3,000만 절감액 606,004원 → 496,830원). 이제 연말정산 엔진
// (deriveAnnualSocialInsurance2026)·성과급 엔진(estimateAnnualIncomeTax2026)과 같은 보험료 공제를
// 쓰는지, 본문 검산 예시 숫자가 엔진 결과와 같은지를 함께 고정한다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { estimateAnnualIncomeTax2026 } from "@/lib/bonusTaxCalc";
import { calculateNetSalary } from "@/lib/calculator";
import { applySmeYouthReduction, computeSmbTaxBreak } from "@/lib/smbTaxBreak";
import { withholdingIncomeTax2026 } from "@/lib/withholdingTaxTable2026";
import { deriveAnnualSocialInsurance2026 } from "@/lib/yearEndTaxCalculator";

const OFF = { isSmeYouth: false, disabledDependents: 0, seniorDependents: 0 };
const ON = { ...OFF, isSmeYouth: true };

describe("중소기업 청년 감면 — calculator.ts (간이세액표 기준)", () => {
  it.each([30_000_000, 50_000_000, 80_000_000])("연봉 %i원: 스위치 ON 월 소득세 = 간이세액표 감면 산식", (salary) => {
    const on = calculateNetSalary(salary, 0, 1, 0, ON);
    expect(on.incomeTax).toBe(withholdingIncomeTax2026(salary / 12, 1, 0, { smeYouth: true }));
    expect(on.localTax).toBe(Math.round(on.incomeTax * 0.1));
  });

  it("한도 미달(3,000만): 감면 후 소득세 = 간이세액표 금액의 10%", () => {
    const off = calculateNetSalary(30_000_000, 0, 1, 0, OFF);
    const on = calculateNetSalary(30_000_000, 0, 1, 0, ON);
    // 월급여액 250만 · 1인 → 표 2,500~2,510천원 칸 35,600원. (산출 − 공제) × 10% 와 같다
    expect(off.incomeTax).toBe(35_600);
    expect(on.incomeTax).toBe(3_560);
  });

  it("한도 초과(5,000만): 감면 200만 + §59③ 공제 축소 — 월 84,310원 (절감 연 1,596,120원 < 200만)", () => {
    // 표 4,160~4,180천원 칸(중간값 417만) 산식: 총급여 5,004만, 산출세액 3,267,840원,
    // 근로소득세액공제 66만(표 한도) → 감면 전 월 217,320원(별표2 금액).
    // 감면 = min(3,267,840 × 90%, 200만) = 200만, 공제 = 66만 × (1 − 200만/3,267,840) = 256,065.6원
    // → 연 1,011,774.4원 ÷ 12 → 10원 미만 절사 84,310원.
    const off = calculateNetSalary(50_000_000, 0, 1, 0, OFF);
    const on = calculateNetSalary(50_000_000, 0, 1, 0, ON);
    expect(off.incomeTax).toBe(217_320);
    expect(on.incomeTax).toBe(84_310);
    const annualSaving = (off.incomeTax - on.incomeTax) * 12;
    expect(annualSaving).toBe(1_596_120);
    expect(annualSaving).toBeLessThan(2_000_000);
  });
});

describe("중소기업 청년 감면 — 전용 계산기(smbTaxBreak)와 같은 헬퍼", () => {
  it.each([30_000_000, 50_000_000, 80_000_000])("연봉 %i원: computeSmbTaxBreak 의 감면·축소 공제 = applySmeYouthReduction", (salary) => {
    const smb = computeSmbTaxBreak({ annualSalary: salary, dependents: 1, breakType: "youth" });
    const helper = applySmeYouthReduction({ calculatedTax: smb.calculatedTax, earnedIncomeCredit: smb.creditBefore });
    expect(smb.reduction).toBe(helper.reduction);
    expect(Math.abs(smb.creditAfter - helper.creditAfter)).toBeLessThanOrEqual(1);
    expect(smb.reductionCapped).toBe(helper.capped);
  });

  it("한도가 걸리는 5,000만: 전용 계산기 절감액은 200만이 아니라 §59③ 반영 1,617,247원", () => {
    const smb = computeSmbTaxBreak({ annualSalary: 50_000_000, dependents: 1, breakType: "youth" });
    expect(smb.reductionCapped).toBe(true);
    // 2026-10-06 code7-03 전(§52 보험료 공제 누락)에는 1,654,563원
    expect(smb.savedIncomeTax).toBe(1_617_247);
  });
});

describe("중소기업 감면 전용 계산기 — 4대보험료 소득공제 (code7-03)", () => {
  const SALARIES = [
    5_000_000, 14_000_000, 25_000_000, 30_000_000, 33_000_000, 41_234_567, 50_000_000, 70_000_000,
    79_080_000, 80_000_000, 120_000_000,
  ];

  it.each(SALARIES)("연봉 %i원: 연금·건강·장기요양·고용 공제 = 연말정산 엔진 deriveAnnualSocialInsurance2026", (salary) => {
    const smb = computeSmbTaxBreak({ annualSalary: salary, dependents: 1, breakType: "youth" });
    const ins = deriveAnnualSocialInsurance2026(salary);
    expect(smb.pensionDeduction).toBe(ins.nationalPension);
    expect(smb.insurancePremiumDeduction).toBe(ins.healthInsurance + ins.employmentInsurance);
  });

  it.each(SALARIES)("연봉 %i원: 감면 없는 결정세액 = 성과급 엔진 estimateAnnualIncomeTax2026 (±1원)", (salary) => {
    const smb = computeSmbTaxBreak({ annualSalary: salary, dependents: 1, breakType: "youth" });
    expect(Math.abs(smb.finalTaxWithout - estimateAnnualIncomeTax2026(salary))).toBeLessThanOrEqual(1);
  });

  it("연봉 3,000만 · 1인 · 청년 — 본문 검산 예시와 같은 값", () => {
    const r = computeSmbTaxBreak({ annualSalary: 30_000_000, dependents: 1, breakType: "youth" });
    expect(r).toMatchObject({
      earnedIncomeDeduction: 9_750_000,
      pensionDeduction: 1_425_000,
      insurancePremiumDeduction: 1_490_215,
      taxBase: 15_834_785,
      calculatedTax: 1_115_218,
      reduction: 1_003_696,
      reductionCapped: false,
      creditBefore: 613_370,
      creditAfter: 61_337,
      finalTaxWith: 50_185,
      finalTaxWithout: 501_848,
      savedAnnualTotal: 496_830,
      savedPeriodTotal: 2_484_148,
    });
  });

  it("본문 검산 예시(page.tsx) 숫자가 엔진 결과를 그대로 쓴다", () => {
    const src = readFileSync(resolve(process.cwd(), "src/app/calc/smb-income-tax-break/page.tsx"), "utf8");
    for (const s of ["1,583만 4,785원", "1,115,218원", "1,003,696원", "613,370원", "61,337원", "50,185원", "501,848원", "49만 7,000원", "248만원"]) {
      expect({ s, found: src.includes(s) }).toEqual({ s, found: true });
    }
    // 종전(§52 누락) 숫자가 남아 있지 않다
    for (const s of ["1,732만 5,000원", "1,338,750", "1,204,875", "726,625", "72,662", "61,213", "612,125", "60만 6,000원", "303만원"]) {
      expect({ s, found: src.includes(s) }).toEqual({ s, found: false });
    }
  });

  it("결과 아래 안내문(InArticleAd 위) — 4대보험료 공제 반영·보장성보험료 미반영, 종전 문장보다 길지 않게", () => {
    // 4대보험료 소득공제 로 쓰면 종전(국민연금 연금보험료공제)보다 숫자 1자 길어져 326~331px 에서 한 줄이 는다
    // (사이트 글꼴 정적 모델, 2026-11-01 PKG-14). 4대보험료 공제 는 종전보다 한글 2자 짧고 320~1440px 어디서도 줄이 늘지 않는다.
    const src = readFileSync(resolve(process.cwd(), "src/app/calc/smb-income-tax-break/Client.tsx"), "utf8");
    expect(src).toContain("기본 인적공제(1인 150만원)와 4대보험료 공제만 반영했습니다.");
    expect(src).toContain("월세·보장성보험료·의료비·자녀세액공제 등 개인별 공제는 미반영");
    expect(src).not.toContain("4대보험료 소득공제만 반영했습니다");
    expect(src).not.toContain("국민연금 연금보험료공제만");
  });
});

describe("applySmeYouthReduction — 순수 헬퍼", () => {
  it("한도 미달: 감면 = 산출세액 × 90%, 공제는 10% 로 축소", () => {
    const r = applySmeYouthReduction({ calculatedTax: 1_000_000, earnedIncomeCredit: 550_000 });
    expect(r.reduction).toBe(900_000);
    expect(r.creditAfter).toBeCloseTo(55_000, 6);
    expect(r.capped).toBe(false);
  });

  it("한도 초과: 감면 200만, 공제 × (1 − 200만/산출세액)", () => {
    const r = applySmeYouthReduction({ calculatedTax: 4_000_000, earnedIncomeCredit: 660_000 });
    expect(r.reduction).toBe(2_000_000);
    expect(r.creditAfter).toBeCloseTo(330_000, 6);
    expect(r.capped).toBe(true);
  });

  it("산출세액 0 이면 감면·공제 0", () => {
    expect(applySmeYouthReduction({ calculatedTax: 0, earnedIncomeCredit: 0 })).toEqual({
      reduction: 0,
      creditAfter: 0,
      capped: false,
    });
  });

  it("감면율·한도 인자 (60세 이상 등 70%)", () => {
    const r = applySmeYouthReduction({ calculatedTax: 1_000_000, earnedIncomeCredit: 550_000, rate: 0.7 });
    expect(r.reduction).toBe(700_000);
    expect(r.creditAfter).toBeCloseTo(165_000, 6);
  });
});
