// 기부금 세액공제 검증 — 소득세법 §59의4·조특법 §76(정치자금)·§58(고향사랑)
// 확정 산식 수기 대조 (2026-08-31 작성). 근로소득공제 정본(taxConstants2026) 기준:
//   총급여 5,000만 → 근로소득금액 37,750,000
//   총급여 1억     → 근로소득금액 85,250,000
//   총급여 3,000만 → 근로소득금액 20,250,000
import { describe, expect, it } from "vitest";
import {
  calcDonationCredit2026,
  DONATION_CREDIT_2026,
} from "../donationCredit";

const ZERO = {
  grossSalary: 50_000_000,
  statutory: 0,
  general: 0,
  religious: 0,
  political: 0,
  hometown: 0,
};

describe("calcDonationCredit2026 — 일반·특례 축 (15%·30%)", () => {
  it("일반기부금 200만 (총급여 5,000만) → 15% = 30만원", () => {
    const r = calcDonationCredit2026({ ...ZERO, general: 2_000_000 });
    expect(r.earnedIncomeAmount).toBe(37_750_000);
    expect(r.generalEligible).toBe(2_000_000);
    expect(r.generalAxisCredit).toBe(300_000);
    expect(r.totalCredit).toBe(300_000);
  });

  it("특례기부금 1,200만 (총급여 1억) → 1천만×15% + 200만×30% = 210만원", () => {
    const r = calcDonationCredit2026({
      ...ZERO,
      grossSalary: 100_000_000,
      statutory: 12_000_000,
    });
    expect(r.earnedIncomeAmount).toBe(85_250_000);
    expect(r.statutoryEligible).toBe(12_000_000);
    expect(r.generalAxisLowBase).toBe(10_000_000);
    expect(r.generalAxisHighBase).toBe(2_000_000);
    expect(r.generalAxisCredit).toBe(2_100_000);
  });

  it("연말정산 엔진(yearEndTaxCalculator 137-138행) 산식과 동일 수치", () => {
    // 엔진: min(d, 1천만)×0.15 + max(0, d−1천만)×0.3 — 한도 미달 구간에서 일치해야 함
    for (const d of [500_000, 5_000_000, 10_000_000, 12_000_000]) {
      const engine = Math.round(
        Math.min(d, 10_000_000) * 0.15 + Math.max(0, d - 10_000_000) * 0.3
      );
      const r = calcDonationCredit2026({
        ...ZERO,
        grossSalary: 100_000_000,
        statutory: d,
      });
      expect(r.generalAxisCredit).toBe(engine);
    }
  });

  it("특례기부금 한도 = 근로소득금액 100% — 초과분은 10년 이월", () => {
    // 총급여 3,000만 → 근로소득금액 20,250,000
    const r = calcDonationCredit2026({
      ...ZERO,
      grossSalary: 30_000_000,
      statutory: 25_000_000,
    });
    expect(r.earnedIncomeAmount).toBe(20_250_000);
    expect(r.statutoryEligible).toBe(20_250_000);
    expect(r.statutoryExcess).toBe(4_750_000);
    expect(r.carryoverTotal).toBe(4_750_000);
    // 20,250,000 → 1천만×15% + 10,250,000×30% = 4,575,000
    expect(r.generalAxisCredit).toBe(4_575_000);
  });
});

describe("calcDonationCredit2026 — 종교단체 10%·일반 30% 한도", () => {
  it("종교단체 500만 단독 (총급여 5,000만) → 한도 10% = 3,775,000", () => {
    const r = calcDonationCredit2026({ ...ZERO, religious: 5_000_000 });
    expect(r.generalLimit).toBe(3_775_000);
    expect(r.generalEligible).toBe(3_775_000);
    expect(r.generalExcess).toBe(1_225_000);
    expect(r.generalAxisCredit).toBe(566_250); // 3,775,000 × 15%
  });

  it("종교 있는 혼합 한도 = 잔여×10% + min(잔여×20%, 종교 외)", () => {
    const r = calcDonationCredit2026({
      ...ZERO,
      general: 40_000_000,
      religious: 50_000_000,
    });
    // 잔여 37,750,000 → 3,775,000 + min(7,550,000, 4천만) = 11,325,000
    expect(r.generalLimit).toBe(11_325_000);
    expect(r.generalEligible).toBe(11_325_000);
    expect(r.generalExcess).toBe(78_675_000);
    // 1천만×15% + 1,325,000×30% = 1,897,500
    expect(r.generalAxisCredit).toBe(1_897_500);
  });
});

describe("calcDonationCredit2026 — 정치자금 (조특법 §76, 본인 지출만)", () => {
  it("10만원 → 100/110 전액 = 90,909원", () => {
    const r = calcDonationCredit2026({ ...ZERO, political: 100_000 });
    expect(r.politicalCredit).toBe(90_909);
    expect(r.totalCredit).toBe(90_909);
  });

  it("100만원 → 90,909 + 90만×15% = 225,909원", () => {
    const r = calcDonationCredit2026({ ...ZERO, political: 1_000_000 });
    expect(r.politicalCredit).toBe(225_909);
  });

  it("4,000만원 (총급여 2억) → 3천만 초과분 25% 구간 적용", () => {
    const r = calcDonationCredit2026({
      ...ZERO,
      grossSalary: 200_000_000,
      political: 40_000_000,
    });
    // 근로소득금액 183,250,000 ≥ 4천만 → 전액 공제대상
    // 90,909.09 + 29,900,000×15%(4,485,000) + 1천만×25%(2,500,000) = 7,075,909
    expect(r.politicalEligible).toBe(40_000_000);
    expect(r.politicalCredit).toBe(7_075_909);
  });

  it("근로소득금액 초과분은 소멸 (이월 불가)", () => {
    // 총급여 3,000만 → 근로소득금액 20,250,000
    const r = calcDonationCredit2026({
      ...ZERO,
      grossSalary: 30_000_000,
      political: 30_000_000,
    });
    expect(r.politicalEligible).toBe(20_250_000);
    expect(r.politicalExcess).toBe(9_750_000);
    expect(r.carryoverTotal).toBe(0); // 정치자금은 이월공제 대상 아님
  });
});

// 고향사랑 — 조특법 §58① (2025-12-23 개정 법률 제21223호, 부칙 제13조: 2026-01-01 이후 기부분)
//   1호 10만원 이하: 기부금 × 100/110
//   2호 10만원 초과 20만원 이하: 10만 × 100/110 + (기부금 − 10만) × 40%
//   3호 20만원 초과 2천만원 이하: 10만 × 100/110 + 10만 × 40% + (기부금 − 20만) × 15%
// 수기 대조 (2026-09-25, 소득세분 — 지방소득세 10%는 별도로 함께 줄어든다)
describe("calcDonationCredit2026 — 고향사랑기부금 (조특법 §58, 2026 기부분)", () => {
  it("10만원 → 100/110 전액 90,909원 + 답례품 3만원", () => {
    const r = calcDonationCredit2026({ ...ZERO, hometown: 100_000 });
    expect(r.hometownCredit).toBe(90_909);
    expect(r.hometownGiftValue).toBe(30_000);
  });

  it("15만원 → 90,909.09 + 5만×40%(20,000) = 110,909원", () => {
    const r = calcDonationCredit2026({ ...ZERO, hometown: 150_000 });
    expect(r.hometownCredit).toBe(110_909);
    expect(r.hometownGiftValue).toBe(45_000);
  });

  it("20만원 → 90,909.09 + 10만×40%(40,000) = 130,909원 — 지방소득세 포함 14만 4천원(고향사랑e음 안내값)", () => {
    const r = calcDonationCredit2026({ ...ZERO, hometown: 200_000 });
    expect(r.hometownCredit).toBe(130_909);
    expect(r.hometownGiftValue).toBe(60_000);
    // 소득세 공제액(반올림 전) × 1.1 = 지방소득세 포함 환급 체감액
    const raw = 100_000 * (100 / 110) + 100_000 * DONATION_CREDIT_2026.HOMETOWN_RATE_MID;
    expect(Math.round(raw * 1.1)).toBe(144_000);
  });

  it("50만원 → 90,909.09 + 40,000 + 30만×15%(45,000) = 175,909원", () => {
    const r = calcDonationCredit2026({ ...ZERO, hometown: 500_000 });
    expect(r.hometownCredit).toBe(175_909);
    expect(r.hometownGiftValue).toBe(150_000);
  });

  it("100만원 → 90,909.09 + 40,000 + 80만×15%(120,000) = 250,909원", () => {
    const r = calcDonationCredit2026({ ...ZERO, hometown: 1_000_000 });
    expect(r.hometownCredit).toBe(250_909);
    expect(r.hometownGiftValue).toBe(300_000);
  });

  it("구간 경계 — 10만 1원·20만 1원에서 다음 구간 공제율로 넘어간다", () => {
    expect(calcDonationCredit2026({ ...ZERO, hometown: 100_001 }).hometownCredit).toBe(90_909); // +0.4원
    expect(calcDonationCredit2026({ ...ZERO, hometown: 110_000 }).hometownCredit).toBe(94_909); // +1만×40%
    expect(calcDonationCredit2026({ ...ZERO, hometown: 210_000 }).hometownCredit).toBe(132_409); // +1만×15%
  });

  it("2,500만원 → 연 상한 2,000만 적용, 초과 500만은 이월 불가", () => {
    const r = calcDonationCredit2026({
      ...ZERO,
      grossSalary: 200_000_000,
      hometown: 25_000_000,
    });
    expect(r.hometownEligible).toBe(20_000_000);
    expect(r.hometownExcess).toBe(5_000_000);
    // 90,909.09 + 10만×40%(40,000) + 19,800,000×15%(2,970,000) = 3,100,909
    expect(r.hometownCredit).toBe(3_100_909);
    expect(r.hometownGiftValue).toBe(6_000_000);
    expect(r.carryoverTotal).toBe(0);
  });

  it("정치자금은 구간 개정 대상이 아니다 — 같은 20만원이면 10만 초과분 15%", () => {
    // 조특법 §76① 10만원 초과분 15%(3천만원 초과분 25%) — §58 개정과 무관
    const r = calcDonationCredit2026({ ...ZERO, political: 200_000, hometown: 200_000 });
    expect(r.politicalCredit).toBe(105_909);
    expect(r.hometownCredit).toBe(130_909);
  });
});

describe("calcDonationCredit2026 — 종합", () => {
  it("입력 0 → 전부 0", () => {
    const r = calcDonationCredit2026(ZERO);
    expect(r.totalCredit).toBe(0);
    expect(r.carryoverTotal).toBe(0);
    expect(r.hometownGiftValue).toBe(0);
  });

  it("5축 혼합 (총급여 6,000만): 정치 20만+고향 50만+특례 100만+일반 300만+종교 100만", () => {
    const r = calcDonationCredit2026({
      grossSalary: 60_000_000, // 근로소득금액 47,250,000
      political: 200_000, // 90,909.09 + 10만×15% = 105,909
      hometown: 500_000, // 90,909.09 + 10만×40% + 30만×15% = 175,909
      statutory: 1_000_000,
      general: 3_000_000,
      religious: 1_000_000, // 한도 7,625,000 내 전액 인정 → 축 500만×15% = 75만
    });
    expect(r.earnedIncomeAmount).toBe(47_250_000);
    expect(r.politicalCredit).toBe(105_909);
    expect(r.hometownCredit).toBe(175_909);
    expect(r.generalLimit).toBe(7_625_000);
    expect(r.generalAxisCredit).toBe(750_000);
    expect(r.totalCredit).toBe(1_031_818);
  });

  it("음수 입력은 0으로 방어", () => {
    const r = calcDonationCredit2026({
      grossSalary: 50_000_000,
      statutory: -1,
      general: -100,
      religious: -5,
      political: -10,
      hometown: -999,
    });
    expect(r.totalCredit).toBe(0);
  });

  it("상수 정합 — 이월 10년·고향사랑 상한 2,000만·구간 10만/20만·40%/15%(재난지역 30%)", () => {
    expect(DONATION_CREDIT_2026.CARRYOVER_YEARS).toBe(10);
    expect(DONATION_CREDIT_2026.HOMETOWN_CAP).toBe(20_000_000);
    expect(DONATION_CREDIT_2026.FULL_CREDIT_LIMIT).toBe(100_000);
    expect(DONATION_CREDIT_2026.HOMETOWN_MID_UPPER).toBe(200_000);
    expect(DONATION_CREDIT_2026.HOMETOWN_RATE_MID).toBe(0.4);
    expect(DONATION_CREDIT_2026.HOMETOWN_RATE).toBe(0.15);
    expect(DONATION_CREDIT_2026.HOMETOWN_RATE_DISASTER).toBe(0.3);
  });
});
