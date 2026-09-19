import { describe, expect, it } from "vitest";
import { buildWorkCalendarMonth, isWorkCalendarMonth, shiftWorkCalendarMonth } from "../workClockCalendar";
import { DEFAULT_PAY_PROFILE, type WorkSession } from "../workClock";

const at = (value: string) => Date.parse(`${value}+09:00`);
const profile = { ...DEFAULT_PAY_PROFILE, basis: "hourly" as const, amount: 12_000, deductionPercent: 10 };
const shift = (start: string, end: string, extra: Partial<WorkSession> = {}): WorkSession => ({
  id: "shift", startAt: at(start), endAt: at(end), scheduledEndAt: at(end), profile, breaks: [], ...extra,
});

describe("KST work calendar", () => {
  it("lays out leap February and limits supported month navigation", () => {
    const calendar = buildWorkCalendarMonth("2028-02", [], at("2028-03-01T00:00:00"));
    expect(calendar.days).toHaveLength(29);
    expect(calendar.firstWeekday).toBe(2);
    expect(calendar.days[28].key).toBe("2028-02-29");
    expect(shiftWorkCalendarMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftWorkCalendarMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftWorkCalendarMonth("2000-01", -1)).toBe("2000-01");
    expect(shiftWorkCalendarMonth("2099-12", 1)).toBe("2099-12");
    for (const invalid of ["2026-00", "2026-13", "1999-12", "2026-2", ""]) expect(isWorkCalendarMonth(invalid)).toBe(false);
  });

  it("splits cross-month work and an unpaid break at Korean midnight", () => {
    const session = shift("2026-08-31T23:00:00", "2026-09-01T01:00:00", { breaks: [{ id: "rest", kind: "rest", paid: false, startAt: at("2026-08-31T23:45:00"), endAt: at("2026-09-01T00:15:00") }] });
    const now = at("2026-09-02T00:00:00");
    const august = buildWorkCalendarMonth("2026-08", [session], now).days[30];
    const september = buildWorkCalendarMonth("2026-09", [session], now).days[0];
    expect(august.totals.gross).toBe(9_000);
    expect(september.totals.gross).toBe(9_000);
    expect(august.totals.net).toBe(8_100);
    expect(september.totals.paidMs).toBe(45 * 60_000);
    expect(september.hasRecords).toBe(true);
    expect(september.ongoing).toBe(false);
  });

  it("counts ongoing work only through now and stops at the scheduled cutoff", () => {
    const session = shift("2026-09-19T09:00:00", "2026-09-19T18:00:00", { endAt: null });
    const during = buildWorkCalendarMonth("2026-09", [session], at("2026-09-19T10:30:00")).days;
    expect(during[18].totals.gross).toBe(18_000);
    expect(during[18].ongoing).toBe(true);
    expect(during[19].hasRecords).toBe(false);
    const after = buildWorkCalendarMonth("2026-09", [session], at("2026-09-20T01:00:00")).days;
    expect(after[18].totals.gross).toBe(108_000);
    expect(after[18].ongoing).toBe(false);
    expect(after[19].hasRecords).toBe(false);
  });

  it("distinguishes a recorded zero-pay day from a day without records", () => {
    const start = at("2026-09-19T09:00:00");
    const end = at("2026-09-19T10:00:00");
    const session = shift("2026-09-19T09:00:00", "2026-09-19T10:00:00", { breaks: [{ id: "rest", kind: "rest", paid: false, startAt: start, endAt: end }] });
    const days = buildWorkCalendarMonth("2026-09", [session], end).days;
    expect(days[18].totals.gross).toBe(0);
    expect(days[18].hasRecords).toBe(true);
    expect(days[17].hasRecords).toBe(false);
  });

  it("treats an exact midnight finish as belonging only to the preceding date", () => {
    const session = shift("2026-09-18T23:00:00", "2026-09-19T00:00:00");
    const days = buildWorkCalendarMonth("2026-09", [session], at("2026-09-19T01:00:00")).days;
    expect(days[17].totals.gross).toBe(12_000);
    expect(days[18].hasRecords).toBe(false);
  });
});
