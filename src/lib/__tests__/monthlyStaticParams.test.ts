import { describe, expect, it } from "vitest";
import { MAX_MONTHLY, MIN_MONTHLY, getStaticMonthlyAmounts, nearestStaticMonthlyAmount } from "@/lib/monthlyStaticParams";

describe("nearestStaticMonthlyAmount", () => {
  const grid = new Set(getStaticMonthlyAmounts());

  it("returns a value that is always on the static grid", () => {
    for (let m = 0; m <= 25_000_000; m += 12_345) expect(grid.has(nearestStaticMonthlyAmount(m))).toBe(true);
  });

  it("snaps to the nearest 100k step below 10M and 500k step above", () => {
    expect(nearestStaticMonthlyAmount(2_049_000)).toBe(2_000_000);
    expect(nearestStaticMonthlyAmount(2_051_000)).toBe(2_100_000);
    expect(nearestStaticMonthlyAmount(10_240_000)).toBe(10_000_000);
    expect(nearestStaticMonthlyAmount(10_260_000)).toBe(10_500_000);
  });

  it("clamps outside the grid and tolerates non-finite input", () => {
    expect(nearestStaticMonthlyAmount(1_000_000)).toBe(MIN_MONTHLY);
    expect(nearestStaticMonthlyAmount(99_000_000)).toBe(MAX_MONTHLY);
    expect(nearestStaticMonthlyAmount(Number.NaN)).toBe(MIN_MONTHLY);
  });

  it("keeps a grid value unchanged", () => {
    for (const a of getStaticMonthlyAmounts()) expect(nearestStaticMonthlyAmount(a)).toBe(a);
  });
});
