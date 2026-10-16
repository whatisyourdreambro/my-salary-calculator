import { describe, expect, it } from "vitest";
import { MAX_RANDOM_INTEGER_COUNT, sampleUniqueIntegers } from "../randomIntegers";

describe("bounded unique integer sampling", () => {
  it("finishes with exactly count unique values even when every random draw is identical", () => {
    let calls = 0;
    const numbers = sampleUniqueIntegers(-10, 10, 21, () => { calls++; return 0; });
    expect(numbers).toEqual(Array.from({ length: 21 }, (_, index) => index - 10));
    expect(calls).toBe(21);
  });
  it.each([
    [Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER + 3, 3],
    [-Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 3],
    [NaN, 10, 3], [1, Infinity, 3], [1.5, 10, 3], [1, 10, 2.5],
    [10, 1, 3], [1, 3, 4], [1, 10, 0], [1, 100_000, MAX_RANDOM_INTEGER_COUNT + 1],
  ])("rejects an unsupported request without entering a sampling loop: %j", (min, max, count) => {
    expect(() => sampleUniqueIntegers(min, max, count, () => { throw new Error("should not draw"); })).toThrow(RangeError);
  });
  it("supports safe negative ranges and rejects an invalid random source", () => {
    expect(sampleUniqueIntegers(-100, -90, 3, () => 0.999)).toEqual([-92, -91, -90]);
    expect(() => sampleUniqueIntegers(1, 5, 2, () => 1)).toThrow(RangeError);
  });
});
