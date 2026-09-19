import { describe, expect, it } from "vitest";
import {
  MAX_SHIFT_MS, MAX_WORK_SESSIONS, WORK_CLOCK_STORAGE_KEY, DEFAULT_PAY_PROFILE,
  calculatePeriodTotals, calculateSession, createWorkSession, endBreak, estimateWeeklyRestAllowance,
  finishSession, getKstDayKey, getKstDayRange, getKstMonthRange, getPayRates,
  isValidWorkSession, loadWorkClockState, parseWorkClockState, saveWorkClockState,
  serializeWorkClockState, startBreak, type PayProfile, type WorkClockState, type WorkSession,
} from "@/lib/workClock";

const at = (date: string) => Date.parse(`${date}+09:00`);
const hour = 3_600_000;
const profile: PayProfile = { basis: "hourly", amount: 12_000, dailyHours: 8, workDaysPerWeek: 5, deductionPercent: 10 };
const begin = at("2026-09-19T09:00:00");
const shift = (start = begin, end = start + 9 * hour) => createWorkSession(profile, start, [], start, end);
const state = (sessions: WorkSession[]): WorkClockState => ({ version: 1, profile, sessions });

describe("work-clock timestamp accounting", () => {
  it("subtracts unpaid lunch, includes paid toilet time, and never counts breaks twice", () => {
    let session = shift();
    session = startBreak(session, "meal", false, begin + 3 * hour);
    session = endBreak(session, begin + 4 * hour);
    session = startBreak(session, "toilet", true, begin + 5 * hour);
    session = endBreak(session, begin + 5.25 * hour);
    const totals = calculateSession(session, begin + 9 * hour);
    expect(totals.elapsedMs).toBe(9 * hour);
    expect(totals.paidMs).toBe(8 * hour);
    expect(totals.workedMs).toBe(7.75 * hour);
    expect(totals.unpaidBreakMs).toBe(hour);
    expect(totals.paidBreakMs).toBe(hour / 4);
    expect(totals.toiletMs).toBe(hour / 4);
    expect(totals.toiletPaidGross).toBe(3000);
    expect(totals.gross).toBe(96_000);
    expect(totals.deduction).toBe(9600);
    expect(totals.net).toBe(86_400);
  });

  it("freezes pay during an unpaid break then resumes correctly after storage reload", () => {
    const resting = startBreak(shift(), "rest", false, begin + hour);
    expect(calculateSession(resting, begin + 2 * hour).gross).toBe(12_000);
    const saved = serializeWorkClockState(state([resting]), begin + 3 * hour)!;
    const restored = parseWorkClockState(saved, begin + 3 * hour)!.sessions[0];
    expect(calculateSession(restored, begin + 3 * hour).gross).toBe(12_000);
    const resumed = endBreak(restored, begin + 3 * hour);
    expect(calculateSession(resumed, begin + 4 * hour).gross).toBe(24_000);
  });

  it("keeps pay increasing during a paid break and distinguishes unpaid toilet time", () => {
    let session = startBreak(shift(), "toilet", false, begin + hour);
    session = endBreak(session, begin + 1.5 * hour);
    session = startBreak(session, "rest", true, begin + 2 * hour);
    const totals = calculateSession(session, begin + 3 * hour);
    expect(totals.paidMs).toBe(2.5 * hour);
    expect(totals.toiletMs).toBe(0.5 * hour);
    expect(totals.toiletPaidGross).toBe(0);
    expect(totals.paidBreakMs).toBe(hour);
  });

  it("automatically caps a forgotten shift at scheduled departure, including an open break", () => {
    const original = startBreak(shift(), "rest", false, begin + 8 * hour);
    const totals = calculateSession(original, begin + 72 * hour);
    expect(totals.elapsedMs).toBe(9 * hour);
    expect(totals.unpaidBreakMs).toBe(hour);
    expect(totals.capped).toBe(true);
    const finished = finishSession(original, begin + 72 * hour);
    expect(finished.endAt).toBe(begin + 9 * hour);
    expect(finished.breaks[0].endAt).toBe(begin + 9 * hour);
    expect(calculateSession(finished, begin + 96 * hour).gross).toBe(96_000);
    expect(original.endAt).toBeNull();
    expect(original.breaks[0].endAt).toBeNull();
  });

  it("bounds open shifts at 24h even without a user-specified departure", () => {
    const session = createWorkSession(profile, begin);
    expect(session.scheduledEndAt).toBe(begin + MAX_SHIFT_MS);
    expect(calculateSession(session, begin + 10 * MAX_SHIFT_MS).elapsedMs).toBe(MAX_SHIFT_MS);
    expect(() => createWorkSession(profile, begin, [], begin, begin + MAX_SHIFT_MS + 1)).toThrow();
  });

  it("finishes a shift and its open paid break, without letting future ticks add wages", () => {
    const resting = startBreak(shift(), "toilet", true, begin + hour);
    const finished = finishSession(resting, begin + 1.5 * hour);
    const a = calculateSession(finished, begin + 2 * hour);
    const b = calculateSession(finished, begin + 100 * hour);
    expect(a).toEqual(b);
    expect(a.gross).toBe(18_000);
    expect(a.toiletPaidGross).toBe(6000);
  });

  it("calculates a past as-of time without counting future portions of a valid finished record", () => {
    const finished = finishSession(shift(), begin + 8 * hour);
    expect(calculateSession(finished, begin + hour).gross).toBe(12_000);
    expect(calculateSession(finished, begin - hour).gross).toBe(0);
  });

  it("rejects overlapping breaks, backwards transitions and conflicting shifts", () => {
    const resting = startBreak(shift(), "rest", true, begin + 2 * hour);
    expect(() => startBreak(resting, "meal", false, begin + 3 * hour)).toThrow();
    expect(() => endBreak(resting, begin + hour)).toThrow();
    expect(() => finishSession(resting, begin + hour)).toThrow();
    const resumed = endBreak(resting, begin + 3 * hour);
    expect(() => startBreak(resumed, "rest", true, begin + 2 * hour)).toThrow();
    expect(() => startBreak(resumed, "rest", true, begin + 10 * hour)).toThrow();
    expect(() => createWorkSession(profile, begin + 10 * hour, [resting])).toThrow();
    const finished = finishSession(resumed, begin + 8 * hour);
    expect(() => createWorkSession(profile, begin + 7 * hour, [finished])).toThrow();
    expect(createWorkSession(profile, begin + 8 * hour, [finished]).startAt).toBe(begin + 8 * hour);
  });

  it("does not double count overlapping sessions even when called directly", () => {
    const first = finishSession(shift(), begin + 4 * hour);
    const overlapping = finishSession(shift(begin + 2 * hour), begin + 6 * hour);
    expect(calculatePeriodTotals([first, overlapping], begin, begin + 9 * hour, begin + 9 * hour).gross).toBe(48_000);
  });

  it("keeps historic salary and deductions unchanged after editing the current profile", () => {
    const settings = { ...profile };
    const session = createWorkSession(settings, begin);
    settings.amount = 99_000;
    settings.deductionPercent = 99;
    expect(calculateSession(session, begin + hour).net).toBe(10_800);
  });
});

describe("KST day and month allocation", () => {
  it("splits overnight pay and an unpaid break exactly across month-end", () => {
    const start = at("2026-09-30T23:00:00");
    const end = at("2026-10-01T02:00:00");
    let session = shift(start, end);
    session = startBreak(session, "meal", false, at("2026-09-30T23:45:00"));
    session = endBreak(session, at("2026-10-01T00:15:00"));
    session = finishSession(session, end);
    const sept = getKstMonthRange(start);
    const oct = getKstMonthRange(end);
    const before = calculatePeriodTotals([session], sept.startAt, sept.endAt, end);
    const after = calculatePeriodTotals([session], oct.startAt, oct.endAt, end);
    expect(before.gross).toBe(9000);
    expect(after.gross).toBe(21_000);
    expect(before.gross + after.gross).toBe(calculateSession(session, end).gross);
    expect(before.unpaidBreakMs).toBe(hour / 4);
    expect(after.unpaidBreakMs).toBe(hour / 4);
    const day = getKstDayRange(end);
    expect(calculatePeriodTotals([session], day.startAt, day.endAt, end)).toEqual(after);
  });

  it("uses Seoul calendar dates independently of the device timezone", () => {
    expect(getKstDayKey(Date.parse("2026-09-19T14:59:59Z"))).toBe("2026-09-19");
    expect(getKstDayKey(Date.parse("2026-09-19T15:00:00Z"))).toBe("2026-09-20");
    const march = getKstDayRange(at("2026-03-08T12:00:00"));
    expect(march.endAt - march.startAt).toBe(24 * hour);
    const december = getKstMonthRange(at("2026-12-31T23:00:00"));
    expect(december.endAt).toBe(at("2027-01-01T00:00:00"));
  });
});

describe("earnings allocation and separate statutory estimates", () => {
  it("distinguishes the working-time salary visualization from ordinary hourly reference", () => {
    const rates = getPayRates({ ...DEFAULT_PAY_PROFILE, basis: "monthly", amount: 2_090_000 });
    expect(rates.scheduledMonthlyHours).toBeCloseTo(174.1666666667);
    expect(rates.workHourlyGross).toBe(12_000);
    expect(rates.ordinaryHourlyEstimate).toBe(10_000);
    const annual = getPayRates({ ...DEFAULT_PAY_PROFILE, amount: 25_080_000 });
    expect(annual).toEqual(rates);
    expect(getPayRates({ ...profile, basis: "monthly", dailyHours: 4 }).ordinaryHourlyEstimate).toBeNull();
    expect(getPayRates(profile).workHourlyGross).toBe(12_000);
  });

  it("requires weekly rest eligibility confirmations and 15h threshold; caps at 40h scheduled work", () => {
    const eligible = { ordinaryHourlyPay: 10_000, scheduledWeeklyHours: 40,
      attendanceConfirmed: true, employmentContinuesThroughRestDay: true };
    expect(estimateWeeklyRestAllowance(eligible)).toMatchObject({ eligible: true, hours: 8, amount: 80_000 });
    expect(estimateWeeklyRestAllowance({ ...eligible, scheduledWeeklyHours: 15 })).toMatchObject({ eligible: true, hours: 3, amount: 30_000 });
    for (const changed of [{ scheduledWeeklyHours: 14.99 }, { scheduledWeeklyHours: 41 },
      { attendanceConfirmed: false }, { employmentContinuesThroughRestDay: false }, { ordinaryHourlyPay: NaN }]) {
      expect(estimateWeeklyRestAllowance({ ...eligible, ...changed }).eligible).toBe(false);
    }
    expect(calculateSession(shift(), begin + hour).gross).toBe(12_000);
  });
});

describe("local storage schema and corrupt data", () => {
  const now = begin + 10 * hour;
  const valid = () => state([finishSession(shift(), begin + 8 * hour)]);

  it("round trips an immutable snapshot and discards unknown fields", () => {
    const snapshot = valid();
    const saved = { ...snapshot, surprise: "untrusted" };
    const restored = parseWorkClockState(JSON.stringify(saved), now)!;
    expect(restored).toEqual(snapshot);
    expect(restored).not.toHaveProperty("surprise");
    expect(parseWorkClockState(serializeWorkClockState(restored, now), now)).toEqual(restored);
  });

  it("rejects malformed, wrong-version, future, backwards and overlapping saved intervals", () => {
    expect(parseWorkClockState("{broken", now)).toBeNull();
    expect(parseWorkClockState(JSON.stringify({ ...valid(), version: 2 }), now)).toBeNull();
    expect(parseWorkClockState(JSON.stringify({ ...valid(), profile: { ...profile, amount: -1 } }), now)).toBeNull();
    for (const change of [{ startAt: now + hour }, { endAt: begin - 1 }, { endAt: now + hour },
      { scheduledEndAt: begin + 30 * hour }, { profile: { ...profile, deductionPercent: 101 } },
      { breaks: [{ id: "bad", startAt: begin - 1, endAt: begin, kind: "rest", paid: true }] },
      { breaks: [{ id: "open", startAt: begin + hour, endAt: null, kind: "rest", paid: true }] }]) {
      const session = { ...valid().sessions[0], ...change };
      expect(parseWorkClockState(JSON.stringify(state([session as WorkSession])), now)).toBeNull();
    }
    const one = valid().sessions[0];
    expect(parseWorkClockState(JSON.stringify(state([one, { ...one, id: "duplicate-times" }])), now)).toBeNull();
    expect(isValidWorkSession({ ...one, breaks: [
      { id: "a", startAt: begin + hour, endAt: begin + 3 * hour, kind: "rest", paid: true },
      { id: "b", startAt: begin + 2 * hour, endAt: begin + 4 * hour, kind: "meal", paid: false },
    ] }, now)).toBe(false);
  });

  it("does not accrue invalid or future data", () => {
    expect(calculateSession({ ...shift(), startAt: NaN }, now).gross).toBe(0);
    expect(calculateSession(shift(), NaN).gross).toBe(0);
    expect(() => createWorkSession(profile, now + hour, [], now)).toThrow();
    expect(() => getPayRates({ ...profile, amount: Infinity })).toThrow();
  });

  it("catches denied access and quota exhaustion rather than crashing", () => {
    const denied = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("quota"); } };
    expect(loadWorkClockState(denied, now)).toBeNull();
    expect(saveWorkClockState(valid(), denied, now)).toBe(false);
    const map = new Map<string, string>();
    const storage = { getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => { map.set(key, value); } };
    const snapshot = valid();
    expect(saveWorkClockState(snapshot, storage, now)).toBe(true);
    expect(map.has(WORK_CLOCK_STORAGE_KEY)).toBe(true);
    expect(loadWorkClockState(storage, now)).toEqual(snapshot);
  });

  it("bounds retention to 500 most recent sessions and rejects unbounded imports", () => {
    const origin = at("2024-01-01T09:00:00");
    const sessions = Array.from({ length: MAX_WORK_SESSIONS + 1 }, (_, index) => {
      const start = origin + index * 24 * hour;
      return finishSession(shift(start), start + 8 * hour);
    });
    const retained = parseWorkClockState(serializeWorkClockState(state(sessions), now), now)!;
    expect(retained.sessions).toHaveLength(MAX_WORK_SESSIONS);
    expect(retained.sessions[0].id).toBe(sessions[1].id);
    expect(parseWorkClockState(JSON.stringify(state(sessions)), now)).toBeNull();
  });
});
