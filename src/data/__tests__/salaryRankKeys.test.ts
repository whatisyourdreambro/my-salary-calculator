import { describe, expect, it } from "vitest";
import { calculateSalaryRank } from "../salaryRankData";

describe("salary-rank age-group fallback", () => {
  it.each(["constructor", "toString", "__proto__", "unknown"])(
    "treats unknown object key %s like the documented 30s fallback", ageGroup => {
      expect(calculateSalaryRank(ageGroup, 70_000_000)).toEqual(calculateSalaryRank("30s", 70_000_000));
    },
  );
});
