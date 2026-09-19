import { describe, expect, it } from "vitest";
import { addGoalFavorite, addTimerFavorite, createFocusTimer, defaultWorkClockExtras, focusRemaining, getBreakReceipt, parseWorkClockExtras, pauseFocusTimer, startFocusTimer } from "@/app/work-clock/workClockExtras";
import { calculateSession, createWorkSession, endBreak, finishSession, startBreak, type PayProfile } from "@/lib/workClock";

const minute = 60_000;
const begin = Date.parse("2026-09-19T09:00:00+09:00");
const profile: PayProfile = { basis: "hourly", amount: 12_000, dailyHours: 8, workDaysPerWeek: 5, deductionPercent: 10 };

describe("work clock focus timer", () => {
  it("uses absolute elapsed time after a long background gap and never goes negative", () => {
    const timer = startFocusTimer(createFocusTimer(25), begin);
    expect(focusRemaining(timer, begin + 17 * minute)).toBe(8 * minute);
    expect(focusRemaining(timer, begin + 26 * minute)).toBe(0);
    expect(focusRemaining(timer, begin + 3 * 86400000)).toBe(0);
  });
  it("freezes while paused, resumes only its remainder, and resets to the selected duration", () => {
    const running = startFocusTimer(createFocusTimer(50), begin);
    const paused = pauseFocusTimer(running, begin + 12 * minute + 321);
    expect(paused.remainingMs).toBe(38 * minute - 321);
    expect(focusRemaining(paused, begin + 3 * 86400000)).toBe(paused.remainingMs);
    const resumed = startFocusTimer(paused, begin + 3 * 86400000);
    expect(focusRemaining(resumed, begin + 3 * 86400000 + minute)).toBe(37 * minute - 321);
    const reset = createFocusTimer(resumed.durationMs / minute);
    expect(reset).toMatchObject({ status: "idle", endAt: null, remainingMs: 50 * minute });
  });
  it("persists a running deadline and a paused duration without depending on painting ticks", () => {
    const timer = startFocusTimer(createFocusTimer(7), begin);
    const restored = parseWorkClockExtras(JSON.stringify({ ...defaultWorkClockExtras(), timer }))!;
    expect(focusRemaining(restored.timer, begin + 3 * minute)).toBe(4 * minute);
    const paused = pauseFocusTimer(restored.timer, begin + 3 * minute);
    const reloaded = parseWorkClockExtras(JSON.stringify({ ...restored, timer: paused }))!;
    expect(focusRemaining(reloaded.timer, begin + 500 * minute)).toBe(4 * minute);
  });
  it("rejects empty-equivalent, fractional, negative and excessive durations", () => {
    for (const minutes of [0, -1, 1.5, 181, NaN, Infinity]) expect(() => createFocusTimer(minutes)).toThrow();
    expect(createFocusTimer(180).durationMs).toBe(180 * minute);
  });
});

describe("bounded user favorites", () => {
  it("preserves user labels and prevents duplicate or excessive goal values", () => {
    const goals = addGoalFavorite([], 25000, "  책 한 권  ");
    expect(goals).toEqual([{ amount: 25000, label: "책 한 권" }]);
    expect(() => addGoalFavorite(goals, 25000, "다른 이름")).toThrow();
    for (const amount of [0, -1, 1.1, 1_000_000_000, NaN]) expect(() => addGoalFavorite([], amount, "")).toThrow();
    const full = Array.from({ length: 8 }, (_, index) => ({ label: "목표", amount: index + 1 }));
    expect(() => addGoalFavorite(full, 9, "추가")).toThrow();
    expect(addGoalFavorite([], 5000, "")[0].label).toBe("5,000원 목표");
  });
  it("round trips favorites and rejects duplicates, oversized lists and malformed timer payloads", () => {
    const valid = { ...defaultWorkClockExtras(), goals: [{ label: "책", amount: 25000 }], timerMinutes: [7, 90] };
    expect(parseWorkClockExtras(JSON.stringify(valid))).toEqual(valid);
    expect(() => addTimerFavorite([], 25)).toThrow();
    expect(() => addTimerFavorite([7], 7)).toThrow();
    const changes = [
      { version: 2 }, { goals: [...valid.goals, ...valid.goals] }, { goals: [{ label: "x".repeat(25), amount: 100 }] },
      { timerMinutes: [7, 7] }, { timerMinutes: [50] }, { timerMinutes: Array.from({ length: 9 }, (_, i) => i + 1) },
      { timer: { ...valid.timer, durationMs: "1500000" } }, { timer: { ...valid.timer, remainingMs: -1 } },
      { timer: { ...valid.timer, status: "running", endAt: null } },
    ];
    for (const change of changes) expect(parseWorkClockExtras(JSON.stringify({ ...valid, ...change }))).toBeNull();
    expect(parseWorkClockExtras("broken")).toBeNull();
  });
});

describe("break receipt without changing earnings", () => {
  it("shows hypothetical unpaid value but adds no wages; paid receipts match accumulated wages", () => {
    for (const paid of [false, true]) {
      const session = startBreak(createWorkSession(profile, begin, [], begin, begin + 8 * 60 * minute), "meal", paid, begin);
      const receipt = getBreakReceipt(session, session.breaks[0], begin + 15 * minute);
      expect(receipt).toEqual({ elapsedMs: 15 * minute, hypotheticalGross: 3000, hypotheticalNet: 2700, accruedGross: paid ? 3000 : 0, accruedNet: paid ? 2700 : 0 });
      expect(calculateSession(session, begin + 15 * minute).net).toBe(receipt.accruedNet);
    }
  });
  it("uses the recorded profile and clamps a forgotten break to scheduled departure", () => {
    const settings = { ...profile };
    const original = createWorkSession(settings, begin, [], begin, begin + 60 * minute);
    const session = startBreak(original, "toilet", true, begin + 50 * minute);
    settings.amount = 99000;
    settings.deductionPercent = 80;
    const receipt = getBreakReceipt(session, session.breaks[0], begin + 24 * 60 * minute);
    expect(receipt).toMatchObject({ elapsedMs: 10 * minute, hypotheticalGross: 2000, hypotheticalNet: 1800 });
    const ended = finishSession(endBreak(session, begin + 24 * 60 * minute), begin + 24 * 60 * minute);
    expect(getBreakReceipt(ended, ended.breaks[0], begin + 48 * 60 * minute)).toEqual(receipt);
    expect(session.breaks[0].endAt).toBeNull();
  });
});
