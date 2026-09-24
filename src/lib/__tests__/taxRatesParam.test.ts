// 연도 요율 인자(rates) 회귀 테스트 — 2026-09-25 CALC-03 (batch B10).
//
// 목적: TaxLogic.calculateSalary2026·bonusTaxCalc.calcBonusNet 에 선택 인자 rates 를 추가해도
// 인자를 넘기지 않는 기존 호출부의 출력이 1원도 바뀌지 않음을 고정한다. /salary 제목·설명은
// 월 실수령액을 담고 있어(seo.ts buildSalaryAmountMetadata) 1원 차이도 제목 변경이 된다.
// 동결값 이력: 인자 추가 직전(4d80ce3e) 엔진 출력 스냅샷 → 2026-09-25 A17(CALC-01)에서 월 소득세를
// 근로소득 간이세액표로 바꾸며 같은 커밋에서 재산출(소득세 칸은 별표2 금액과 일치). 엔진을 의도적으로
// 바꾸는 커밋은 이 값을 같은 커밋에서 갱신하고 커밋 본문에 바뀐 제목 수를 남긴다.
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
  [11_000_000, 847_036, 0, 69_630],
  [17_000_000, 1_294_936, 3_200, 121_730],
  [22_500_000, 1_698_580, 12_430, 176_420],
  [26_500_000, 1_991_723, 19_520, 216_610],
  [30_500_000, 2_280_646, 30_450, 261_020],
  [34_500_000, 2_564_840, 45_680, 310_160],
  [38_874_000, 2_860_500, 76_060, 379_000],
  [42_000_000, 3_066_300, 102_770, 433_700],
  [45_144_000, 3_267_890, 134_550, 494_110],
  [48_906_000, 3_503_930, 177_270, 571_570],
  [52_668_000, 3_739_980, 219_990, 649_020],
  [57_000_000, 4_012_580, 268_450, 737_420],
  [61_000_000, 4_258_323, 318_640, 825_010],
  [65_000_000, 4_509_886, 363_520, 906_780],
  [69_000_000, 4_758_380, 411_200, 991_620],
  [73_000_000, 4_985_093, 478_690, 1_098_240],
  [77_748_000, 5_247_500, 564_870, 1_231_500],
  [82_764_000, 5_525_190, 660_130, 1_371_810],
  [87_500_000, 5_800_466, 750_850, 1_491_200],
  [92_500_000, 6_091_653, 846_100, 1_616_680],
  [97_000_000, 6_353_223, 932_290, 1_730_110],
  [102_828_000, 6_694_710, 1_041_420, 1_874_290],
  [110_352_000, 7_130_980, 1_186_500, 2_065_020],
  [118_000_000, 7_522_553, 1_381_140, 2_310_780],
  [125_400_000, 7_847_880, 1_618_150, 2_602_120],
  [135_200_000, 8_315_856, 1_898_260, 2_950_810],
  [145_600_000, 8_812_463, 2_195_530, 3_320_870],
  [155_000_000, 9_261_336, 2_464_210, 3_655_330],
  [168_000_000, 9_882_110, 2_835_800, 4_117_890],
];

// [월급, netPay, incomeTax, totalDeductions] — /monthly/[amount] 와 같은 호출(월급×12, 비과세 20만, 1인)
const MONTHLY_SAMPLES: ReadonlyArray<readonly [number, number, number, number]> = [
  [2_000_000, 1_808_470, 15_110, 191_530],
  [2_500_000, 2_244_440, 29_160, 255_560],
  [3_000_000, 2_665_440, 56_800, 334_560],
  [3_500_000, 3_066_300, 102_770, 433_700],
  [4_166_667, 3_571_547, 190_620, 595_120],
  [5_000_000, 4_195_410, 307_420, 804_590],
  [7_000_000, 5_593_130, 687_340, 1_406_870],
  [10_000_000, 7_613_360, 1_442_570, 2_386_640],
];

// [연봉, 성과급, net, incomeTaxDelta, totalDeductions] — calcBonusNet 기본 인자(추가 공제 0%·4대보험 ON)
// 2026-09-25 A18: 소득세 = 연간 결정세액 차이로 재산출 (종전 공제 30% 가정 값은 커밋 f080c80a 참조)
const BONUS_SAMPLES: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [80_000_000, 30_000_000, 21_300_001, 6_554_349, 8_699_999],
  [100_000_000, 50_000_000, 30_847_345, 15_153_603, 19_152_655],
  [100_000_000, 100_000_000, 59_858_930, 31_976_079, 40_141_070],
  [42_000_000, 1_000_000, 769_810, 120_924, 230_190],
  [60_000_000, 10_000_000, 7_621_099, 1_279_239, 2_378_901],
  [80_000_000, 40_000_000, 27_665_629, 9_406_744, 12_334_371],
];

// [연봉, changeValue, monthlyNet] — /table/2027 annual (2027 vs 2026, 연금 4.75→5.0%)
// 간이세액표 소득세는 연금 요율과 무관해 changeValue = 연금 보험료 차이뿐 (상한 659만 × 0.25%p = 16,475원)
const TABLE_2027: ReadonlyArray<readonly [number, number, number]> = [
  [24_000_000, -4_500, 1_803_966],
  [30_000_000, -5_750, 2_238_674],
  [50_000_000, -9_916, 3_561_612],
  [80_000_000, -16_167, 5_350_856],
  [100_000_000, -16_475, 6_514_428],
  [150_000_000, -16_475, 9_006_082],
  [200_000_000, -16_475, 11_313_926],
];

// [연봉, changeValue, monthlyNet] — /table/2026 annual (2026 vs 2025)
const TABLE_2026: ReadonlyArray<readonly [number, number, number]> = [
  [24_000_000, -5_640, 1_808_470],
  [50_000_000, -12_428, 3_571_546],
  [100_000_000, -31_523, 6_530_913],
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
      [30_000_000, 2_244_424, 29_160],
      [50_000_000, 3_571_528, 190_620],
      [80_000_000, 5_367_023, 610_230],
      [100_000_000, 6_530_903, 986_720],
    ];
    for (const [salary, monthlyNet, incomeTax] of expected) {
      const r = calculateNetSalary(salary, 2_400_000, 1, 0, adv);
      expect({ salary, monthlyNet: r.monthlyNet, incomeTax: r.incomeTax }).toEqual({ salary, monthlyNet, incomeTax });
    }
  });
});
