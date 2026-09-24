// 연도 요율 인자(rates) 회귀 테스트 — 2026-09-25 CALC-03 (batch B10).
//
// 목적: TaxLogic.calculateSalary2026·bonusTaxCalc.calcBonusNet 에 선택 인자 rates 를 추가해도
// 인자를 넘기지 않는 기존 호출부의 출력이 1원도 바뀌지 않음을 고정한다. /salary 제목·설명은
// 월 실수령액을 담고 있어(seo.ts buildSalaryAmountMetadata) 1원 차이도 제목 변경이 된다.
// 아래 동결값은 인자 추가 직전(4d80ce3e) 엔진 출력 스냅샷이다. 엔진을 의도적으로 바꾸는
// 커밋은 이 값을 같은 커밋에서 갱신하고 커밋 본문에 바뀐 제목 수를 남긴다.
import { describe, expect, it } from "vitest";

import { calculateSalary2026 } from "@/lib/TaxLogic";
import { calcBonusNet, DEFAULT_BONUS_CREDIT_RATE } from "@/lib/bonusTaxCalc";
import { calculateNetSalary } from "@/lib/calculator";
import { generateAnnualSalaryTableData2026 } from "@/lib/generateData2026";
import { generateAnnualSalaryTableData2027 } from "@/lib/generateData2027";
import { INSURANCE_RATES_2026, type InsuranceRates } from "@/lib/taxConstants2026";

const adv = { isSmeYouth: false, disabledDependents: 0, seniorDependents: 0 };

/** 연금만 5.0% 로 올린 가상 요율 — 인자가 실제로 쓰이는지 확인용 */
const RATES_PENSION_5: InsuranceRates = { ...INSURANCE_RATES_2026, NATIONAL_PENSION: 0.05 };

// [연봉, netPay, incomeTax, totalDeductions] — /salary 정적 격자 416개 중 등간격 30개, 비과세 월 20만·1인
const SALARY_GRID: ReadonlyArray<readonly [number, number, number, number]> = [
  [5_000_000, 386_446, 0, 30_220],
  [11_000_000, 842_706, 3_940, 73_960],
  [17_000_000, 1_285_936, 11_390, 130_730],
  [22_500_000, 1_689_040, 21_100, 185_960],
  [26_500_000, 1_982_043, 28_320, 226_290],
  [30_500_000, 2_268_356, 41_620, 273_310],
  [34_500_000, 2_537_030, 70_960, 337_970],
  [38_874_000, 2_815_300, 117_150, 424_200],
  [42_000_000, 3_013_700, 150_590, 486_300],
  [45_144_000, 3_213_240, 184_230, 548_760],
  [48_906_000, 3_452_500, 224_020, 623_000],
  [52_668_000, 3_688_860, 266_460, 700_140],
  [57_000_000, 3_961_010, 315_330, 788_990],
  [61_000_000, 4_212_333, 360_450, 871_000],
  [65_000_000, 4_463_626, 405_580, 953_040],
  [69_000_000, 4_714_930, 450_700, 1_035_070],
  [73_000_000, 4_931_223, 527_660, 1_152_110],
  [77_748_000, 5_194_160, 613_360, 1_284_840],
  [82_764_000, 5_475_700, 705_120, 1_421_300],
  [87_500_000, 5_751_786, 795_100, 1_539_880],
  [92_500_000, 6_043_253, 890_100, 1_665_080],
  [97_000_000, 6_305_573, 975_600, 1_777_760],
  [102_828_000, 6_645_030, 1_086_590, 1_923_970],
  [110_352_000, 7_078_670, 1_234_060, 2_117_330],
  [118_000_000, 7_446_023, 1_450_710, 2_387_310],
  [125_400_000, 7_771_890, 1_687_230, 2_678_110],
  [135_200_000, 8_239_856, 1_967_350, 3_026_810],
  [145_600_000, 8_736_473, 2_264_610, 3_396_860],
  [155_000_000, 9_185_336, 2_533_300, 3_731_330],
  [168_000_000, 9_806_130, 2_904_880, 4_193_870],
];

// [월급, netPay, incomeTax, totalDeductions] — /monthly/[amount] 와 같은 호출(월급×12, 비과세 20만, 1인)
const MONTHLY_SAMPLES: ReadonlyArray<readonly [number, number, number, number]> = [
  [2_000_000, 1_798_900, 23_810, 201_100],
  [2_500_000, 2_233_220, 39_360, 266_780],
  [3_000_000, 2_632_880, 86_400, 367_120],
  [3_500_000, 3_013_700, 150_590, 486_300],
  [4_166_667, 3_521_237, 236_360, 645_430],
  [5_000_000, 4_149_490, 349_170, 850_510],
  [7_000_000, 5_547_740, 728_600, 1_452_260],
  [10_000_000, 7_541_520, 1_507_880, 2_458_480],
];

// [연봉, 성과급, net, incomeTaxDelta, totalDeductions] — calcBonusNet 기본 인자(공제 30%·4대보험 ON)
const BONUS_SAMPLES: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [80_000_000, 30_000_000, 22_717_460, 5_265_750, 7_282_540],
  [100_000_000, 50_000_000, 34_670_783, 11_677_750, 15_329_217],
  [100_000_000, 100_000_000, 68_248_167, 24_349_500, 31_751_833],
  [42_000_000, 1_000_000, 804_651, 89_250, 195_349],
  [60_000_000, 10_000_000, 7_567_187, 1_328_250, 2_432_813],
  [80_000_000, 40_000_000, 29_579_622, 7_666_750, 10_420_378],
];

// [연봉, changeValue, monthlyNet] — /table/2027 annual (2027 vs 2026, 연금 4.75→5.0%)
const TABLE_2027: ReadonlyArray<readonly [number, number, number]> = [
  [24_000_000, -4_367, 1_794_525],
  [30_000_000, -5_323, 2_227_871],
  [50_000_000, -8_281, 3_512_931],
  [80_000_000, -11_898, 5_306_963],
  [100_000_000, -12_125, 6_468_301],
  [150_000_000, -10_132, 8_936_434],
  [200_000_000, -9_588, 11_254_072],
];

// [연봉, changeValue, monthlyNet] — /table/2026 annual (2026 vs 2025)
const TABLE_2026: ReadonlyArray<readonly [number, number, number]> = [
  [24_000_000, -5_506, 1_798_900],
  [50_000_000, -10_791, 3_521_236],
  [100_000_000, -24_561, 6_480_443],
];

describe("TaxLogic.calculateSalary2026 — rates 선택 인자", () => {
  it("/salary 격자 30개: 기본 호출 = 동결값 = 2026 요율 명시 호출", () => {
    for (const [annual, netPay, incomeTax, totalDeductions] of SALARY_GRID) {
      const byDefault = calculateSalary2026(annual, 200_000, 1, 0);
      expect({ annual, netPay: byDefault.netPay, incomeTax: byDefault.incomeTax, totalDeductions: byDefault.totalDeductions })
        .toEqual({ annual, netPay, incomeTax, totalDeductions });
      expect(calculateSalary2026(annual, 200_000, 1, 0, INSURANCE_RATES_2026)).toEqual(byDefault);
    }
  });

  it("/monthly 표본: 기본 호출 = 동결값", () => {
    for (const [monthly, netPay, incomeTax, totalDeductions] of MONTHLY_SAMPLES) {
      const r = calculateSalary2026(monthly * 12, 200_000, 1, 0);
      expect({ monthly, netPay: r.netPay, incomeTax: r.incomeTax, totalDeductions: r.totalDeductions })
        .toEqual({ monthly, netPay, incomeTax, totalDeductions });
    }
  });

  it("다른 연도 요율을 넘기면 그 요율로 계산한다 (연금 5.0% 가상 요율)", () => {
    const base = calculateSalary2026(50_000_000, 200_000, 1, 0);
    const p5 = calculateSalary2026(50_000_000, 200_000, 1, 0, RATES_PENSION_5);
    // 월 과세 보수 3,966,666.67원 × 5.0% → 10원 절사 198,330원
    expect(p5.nationalPension).toBe(198_330);
    expect(p5.nationalPension).toBeGreaterThan(base.nationalPension);
    expect(p5.healthInsurance).toBe(base.healthInsurance);
    expect(p5.netPay).toBeLessThan(base.netPay);
  });
});

describe("bonusTaxCalc.calcBonusNet — rates 선택 인자", () => {
  it("성과급 표본: 기본 호출 = 동결값 = 2026 요율 명시 호출", () => {
    for (const [salary, bonus, net, incomeTaxDelta, totalDeductions] of BONUS_SAMPLES) {
      const r = calcBonusNet(salary, bonus);
      expect({ salary, bonus, net: r.net, incomeTaxDelta: r.incomeTaxDelta, totalDeductions: r.totalDeductions })
        .toEqual({ salary, bonus, net, incomeTaxDelta, totalDeductions });
      expect(calcBonusNet(salary, bonus, DEFAULT_BONUS_CREDIT_RATE, true, INSURANCE_RATES_2026)).toEqual(r);
    }
  });

  it("다른 연도 요율을 넘기면 연금 추가 부과가 그 요율을 따른다", () => {
    // 연봉 6,000만 → 연금 상한(연 7,908만)까지 남은 1,908만 중 성과급 1,000만 전액 부과
    const r = calcBonusNet(60_000_000, 10_000_000, DEFAULT_BONUS_CREDIT_RATE, true, RATES_PENSION_5);
    expect(r.pensionDelta).toBe(500_000);
    expect(calcBonusNet(60_000_000, 10_000_000).pensionDelta).toBe(475_000);
  });
});

describe("/table 표 데이터 — 요율 인자 도입 후에도 불변", () => {
  it("/table/2027 changeValue·monthlyNet 동결값", () => {
    const rows = generateAnnualSalaryTableData2027();
    for (const [preTax, changeValue, monthlyNet] of TABLE_2027) {
      const row = rows.find((r) => r.preTax === preTax)!;
      expect({ preTax, changeValue: row.changeValue, monthlyNet: row.monthlyNet })
        .toEqual({ preTax, changeValue, monthlyNet });
    }
  });

  it("/table/2026 changeValue·monthlyNet 동결값", () => {
    const rows = generateAnnualSalaryTableData2026();
    for (const [preTax, changeValue, monthlyNet] of TABLE_2026) {
      const row = rows.find((r) => r.preTax === preTax)!;
      expect({ preTax, changeValue: row.changeValue, monthlyNet: row.monthlyNet })
        .toEqual({ preTax, changeValue, monthlyNet });
    }
  });

  it("calculator.ts 기본(청년 감면 OFF) 출력 동결값 — 비과세 연 240만·1인", () => {
    const expected: ReadonlyArray<readonly [number, number, number]> = [
      [30_000_000, 2_233_194, 39_369],
      [50_000_000, 3_521_212, 236_363],
      [80_000_000, 5_318_861, 654_013],
      [100_000_000, 6_480_426, 1_032_607],
    ];
    for (const [salary, monthlyNet, incomeTax] of expected) {
      const r = calculateNetSalary(salary, 2_400_000, 1, 0, adv);
      expect({ salary, monthlyNet: r.monthlyNet, incomeTax: r.incomeTax }).toEqual({ salary, monthlyNet, incomeTax });
    }
  });
});
