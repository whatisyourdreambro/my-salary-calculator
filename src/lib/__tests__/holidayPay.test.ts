import { describe, expect, it } from "vitest";
import { estimateHolidayWorkPay } from "../holidayPay";

describe("separate holiday work estimate", () => {
  const pay = (hours: number, nightHours = 0, eligible = true) => estimateHolidayWorkPay({ ordinaryHourly: 10_000, hours, nightHours, eligible });
  it("requires the applicable workplace and holiday conditions", () => expect(pay(8, 0, false)).toBeNull());
  it("adds 50 percent for the first eight hours, not another paid holiday wage", () => expect(pay(8)).toEqual({ base: 80_000, holidayPremium: 40_000, nightPremium: 0, total: 120_000 }));
  it("adds 100 percent only beyond eight hours and night premium once", () => expect(pay(10, 2)).toEqual({ base: 100_000, holidayPremium: 60_000, nightPremium: 10_000, total: 170_000 }));
  it("accepts fractional actual work hours and zero worked hours", () => { expect(pay(0)?.total).toBe(0); expect(pay(1.5)?.total).toBe(22_500); });
  it.each([[2, 3], [25, 0], [10, 9], [-1, 0], [NaN, 0], [Infinity, 0]])("rejects impossible intervals %s/%s", (hours, night) => expect(pay(hours, night)).toBeNull());
});
