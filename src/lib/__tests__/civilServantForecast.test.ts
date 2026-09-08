import { describe, expect, it } from "vitest";
import { CIVIL_FORECAST_GRADES, CIVIL_FORECAST_STEPS, getCivilServantForecast } from "@/lib/civilServantForecast";

// Independent transcription by grade from MPM 2026, 별표3, 1~10호봉.
// https://www.mpm.go.kr/mpm/info/resultPay/bizSalary/2026/ (checked 2026-09-08)
const officialByGrade: Record<number, number[]> = {
  9: [2133000, 2147600, 2168000, 2194000, 2226100, 2264600, 2309900, 2367500, 2456700, 2542700],
  8: [2162100, 2195700, 2233800, 2276600, 2331700, 2412900, 2519600, 2622400, 2720300, 2813000],
  7: [2317100, 2367900, 2423800, 2485200, 2567100, 2682600, 2798700, 2915800, 3027100, 3133300],
  6: [2389500, 2500700, 2615200, 2732400, 2853100, 2977100, 3101500, 3226200, 3351300, 3468700],
  5: [2896400, 3013400, 3135000, 3261300, 3390900, 3523000, 3657300, 3793200, 3929600, 4066800],
};

describe("2027 civil servant base-pay selector", () => {
  it("offers exactly the 50 published base cells retained in the server table", () => {
    expect(CIVIL_FORECAST_GRADES).toEqual([9, 8, 7, 6, 5]);
    expect(CIVIL_FORECAST_STEPS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (const grade of CIVIL_FORECAST_GRADES) {
      for (const step of CIVIL_FORECAST_STEPS) {
        const expectedBase = officialByGrade[grade][step - 1];
        const result = getCivilServantForecast(grade, step)!;
        expect(result.base2026, `${grade}급 ${step}호봉`).toBe(expectedBase);
        expect(result.predicted2027).toBe(Math.round(expectedBase * 1039 / 1_000_000) * 1000);
        expect(result.monthlyIncrease).toBe(result.predicted2027 - expectedBase);
      }
    }
  });

  it("returns independently checked rounded examples at opposite table corners", () => {
    expect(getCivilServantForecast(9, 1)).toEqual({
      grade: 9, step: 1, base2026: 2133000, predicted2027: 2216000, monthlyIncrease: 83000,
    });
    expect(getCivilServantForecast(5, 10)?.predicted2027).toBe(4225000);
  });

  it("rejects missing, fractional or unsupported selection values", () => {
    for (const [grade, step] of [[0, 1], [4, 1], [10, 1], [9, 0], [9, 11], [9.5, 1], [9, 1.5], [NaN, 1], [9, Infinity]]) {
      expect(getCivilServantForecast(grade, step)).toBeNull();
    }
  });
});
