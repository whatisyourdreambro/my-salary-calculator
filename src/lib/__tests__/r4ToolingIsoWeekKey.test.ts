// R4 TOOLING (2026-11-18, N2-guides-content-09 / guides-content-b15-F01, scripts-b09-F03 is the same defect):
// isoWeekKey in the trend-brief gate (rules.ts) and its copy in the daily script (daily.mjs) must give real ISO 8601
// week labels. The old formula had the sign of the Jan-4 weekday term reversed, so years whose Jan 4 is not a
// Thursday got shifted labels (2026-01-01 -> W00, 2026-11-18 -> W46). Grouping was right; only the label in the
// weekly-cap message was wrong. The trend pipeline stays frozen until 2027-01-31: function and tests only.
import { describe, expect, it } from "vitest";
import { isoWeekKey } from "@/lib/trendBriefs/rules";

/** Independent reference: the ISO week is the week of its Thursday; week = ordinal day of that Thursday, 1-based, div 7. */
function referenceIsoWeek(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  const mondayBased = (date.getUTCDay() + 6) % 7;
  const thursday = new Date(date.getTime() + (3 - mondayBased) * 86_400_000);
  const year = thursday.getUTCFullYear();
  const ordinal = Math.floor((thursday.getTime() - Date.UTC(year, 0, 1)) / 86_400_000);
  return `${year}-W${String(Math.floor(ordinal / 7) + 1).padStart(2, "0")}`;
}

function eachDay(from: string, to: string): string[] {
  const out: string[] = [];
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= Date.parse(`${to}T00:00:00Z`); t += 86_400_000) out.push(new Date(t).toISOString().slice(0, 10));
  return out;
}

describe("isoWeekKey gives ISO 8601 week labels (rules.ts and daily.mjs)", () => {
  it("known dates (checked against Python date.isocalendar on 2026-11-18)", () => {
    const cases: Array<[string, string]> = [
      ["2026-11-18", "2026-W47"],
      ["2026-01-01", "2026-W01"],
      ["2026-10-12", "2026-W42"],
      ["2026-10-18", "2026-W42"],
      ["2026-10-19", "2026-W43"],
      ["2026-12-28", "2026-W53"],
      ["2027-01-01", "2026-W53"],
      ["2027-01-04", "2027-W01"],
      ["2027-12-31", "2027-W52"],
      ["2028-01-03", "2028-W01"],
      ["2024-12-30", "2025-W01"],
      ["2029-12-31", "2030-W01"],
    ];
    for (const [day, label] of cases) expect(isoWeekKey(day), day).toBe(label);
  });

  it("matches the reference on every day from 2024 to 2030", () => {
    for (const day of eachDay("2024-01-01", "2030-12-31")) expect(isoWeekKey(day), day).toBe(referenceIsoWeek(day));
  });

  it("daily.mjs has the same function (drift guard, 140 days around the freeze end)", async () => {
    const daily = await import("../../../scripts/trend-publish/daily.mjs");
    for (const day of eachDay("2026-11-01", "2027-03-20")) expect(daily.isoWeekKey(day), day).toBe(isoWeekKey(day));
    for (const day of ["2026-01-01", "2026-11-18", "2027-01-04", "2027-12-31"]) expect(daily.isoWeekKey(day), day).toBe(referenceIsoWeek(day));
  });
});
