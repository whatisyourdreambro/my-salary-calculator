import { describe, expect, it } from "vitest";
import { calculatePensionHike } from "../pensionHike";

describe("pension increase comparison boundaries", () => {
  it.each(["", "0", "000", "-1", "3e6", "Infinity", "NaN", "3000000원", "3,5", "3,000,000.1", " 3500000", "9007199254740992"])("rejects %j without producing a floor-based result", input => {
    expect(calculatePensionHike(input)).toBeNull();
  });
  it("compares the same income with employee rates", () => {
    const r = calculatePensionHike("3,500,000")!;
    expect(r.p2026).toBe(166250);
    expect(r.p2027).toBe(175000);
    expect(r.diffMonthly).toBe(8750);
    expect(r.annualizedDifference).toBe(105000);
    expect(r.totalWithEmployer2027).toBe(350000);
  });
  it("applies the legal bounds only after positive input validation", () => {
    expect(calculatePensionHike("1")).toMatchObject({ base: 410000, floored: true });
    expect(calculatePensionHike("6590001")).toMatchObject({ base: 6590000, capped: true });
    expect(calculatePensionHike("6590000")).toMatchObject({ base: 6590000, capped: false });
  });
  it("discards sub-thousand income before comparing rates", () => {
    expect(calculatePensionHike("3500999")).toEqual(calculatePensionHike("3500000"));
  });
});
