import { describe, expect, it } from "vitest";
import { calculateFutureSalary, calculatePathToGoal } from "../futureCalculator";

describe("future salary goal paths match the forward simulation", () => {
  it.each([3, 5, 10, 30])("reaches the target using the returned annual rate and events over %i years", (years) => {
    const current = 50_000_000, target = 100_000_000;
    const paths = calculatePathToGoal(current, target, years);
    expect(paths).toHaveLength(2);
    for (const path of paths) {
      const result = calculateFutureSalary(current, years, path.avgIncreaseRate, path.events, null);
      // The UI intentionally presents annual rates rounded to 0.01 percentage points.
      expect(Math.abs(result.at(-1)!.salary - target) / target).toBeLessThan(0.002);
    }
  });
  it.each([NaN, Infinity, -1, 0, 1.5, 101])("rejects unsupported horizons before looping: %s", (years) => {
    expect(calculateFutureSalary(50_000_000, years, 5, [], null)).toEqual([]);
    expect(calculatePathToGoal(50_000_000, 100_000_000, years)).toEqual([]);
  });
  it("does not return or save non-finite prediction values", () => {
    expect(calculateFutureSalary(1e308, 10, 100, [], null)).toEqual([]);
    expect(calculateFutureSalary(50_000_000, 10, NaN, [], null)).toEqual([]);
  });
});
