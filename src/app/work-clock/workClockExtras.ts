import { getPayRates, type WorkBreak, type WorkSession } from "@/lib/workClock";

export const WORK_CLOCK_EXTRAS_KEY = "moneysalary:work-clock:extras:v1";
export const MAX_FAVORITES = 8;
const MINUTE = 60_000;
export type FocusTimer = { status: "idle" | "running" | "paused"; durationMs: number; remainingMs: number; endAt: number | null };
export type GoalFavorite = { label: string; amount: number };
export type WorkClockExtras = { version: 1; goals: GoalFavorite[]; timerMinutes: number[]; timer: FocusTimer };

export function isFocusMinutes(value: number) { return Number.isInteger(value) && value >= 1 && value <= 180; }
export function createFocusTimer(minutes = 25): FocusTimer {
  if (!isFocusMinutes(minutes)) throw new Error("집중 시간은 1~180분 정수로 입력해 주세요.");
  return { status: "idle", durationMs: minutes * MINUTE, remainingMs: minutes * MINUTE, endAt: null };
}
export function focusRemaining(timer: FocusTimer, now: number) {
  return timer.status === "running" && timer.endAt !== null
    ? Math.min(timer.durationMs, Math.max(0, timer.endAt - now)) : timer.remainingMs;
}
export function startFocusTimer(timer: FocusTimer, now: number): FocusTimer {
  const remainingMs = timer.status === "paused" && timer.remainingMs > 0 ? timer.remainingMs : timer.durationMs;
  return { ...timer, status: "running", remainingMs, endAt: now + remainingMs };
}
export function pauseFocusTimer(timer: FocusTimer, now: number): FocusTimer {
  return { ...timer, status: "paused", remainingMs: focusRemaining(timer, now), endAt: null };
}
export function defaultWorkClockExtras(): WorkClockExtras {
  return { version: 1, goals: [], timerMinutes: [], timer: createFocusTimer() };
}

export function addGoalFavorite(goals: GoalFavorite[], amount: number, label: string): GoalFavorite[] {
  if (!Number.isInteger(amount) || amount < 1 || amount > 999_999_999) throw new Error("목표 금액을 1~999,999,999원 정수로 입력해 주세요.");
  const cleanLabel = label.trim() || `${amount.toLocaleString("ko-KR")}원 목표`;
  if (cleanLabel.length > 24) throw new Error("목표 이름은 24자 이내로 입력해 주세요.");
  if (goals.some(goal => goal.amount === amount)) throw new Error("이미 즐겨찾기에 있는 금액입니다.");
  if (goals.length >= MAX_FAVORITES) throw new Error("목표 즐겨찾기는 최대 8개입니다. 기존 목표를 지운 뒤 추가해 주세요.");
  return [...goals, { amount, label: cleanLabel }];
}
export function addTimerFavorite(presets: number[], minutes: number): number[] {
  if (!isFocusMinutes(minutes)) throw new Error("집중 시간은 1~180분 정수로 입력해 주세요.");
  if ([25, 50, ...presets].includes(minutes)) throw new Error("이미 선택할 수 있는 시간입니다.");
  if (presets.length >= MAX_FAVORITES) throw new Error("시간 즐겨찾기는 최대 8개입니다. 기존 시간을 지운 뒤 추가해 주세요.");
  return [...presets, minutes];
}

/** Extras are optional and separate from immutable wage/attendance snapshots. */
export function parseWorkClockExtras(raw: string | null): WorkClockExtras | null {
  if (!raw || raw.length > 5000) return null;
  try {
    const data = JSON.parse(raw);
    if (!data || data.version !== 1 || !Array.isArray(data.goals) || data.goals.length > MAX_FAVORITES
      || !Array.isArray(data.timerMinutes) || data.timerMinutes.length > MAX_FAVORITES) return null;
    const goals: GoalFavorite[] = [];
    for (const item of data.goals) {
      if (!item || typeof item.label !== "string" || !item.label.trim()) return null;
      goals.push(...addGoalFavorite(goals, item.amount, item.label).slice(-1));
    }
    const timerMinutes: number[] = [];
    for (const minutes of data.timerMinutes) timerMinutes.push(...addTimerFavorite(timerMinutes, minutes).slice(-1));
    const timer = data.timer;
    if (!timer || !["idle", "running", "paused"].includes(timer.status) || !Number.isFinite(timer.durationMs) || !isFocusMinutes(timer.durationMs / MINUTE)
      || !Number.isFinite(timer.remainingMs) || timer.remainingMs < 0 || timer.remainingMs > timer.durationMs) return null;
    if (timer.status === "running" ? !Number.isFinite(timer.endAt) || timer.endAt <= 0 || timer.endAt > 253_402_214_400_000 : timer.endAt !== null) return null;
    if (timer.status === "idle" && timer.remainingMs !== timer.durationMs) return null;
    return { version: 1, goals, timerMinutes, timer: { status: timer.status, durationMs: timer.durationMs, remainingMs: timer.remainingMs, endAt: timer.endAt } };
  } catch { return null; }
}

/** The recorded profile and scheduled cutoff also apply to break receipts. */
export function getBreakReceipt(session: WorkSession, pause: WorkBreak, now: number) {
  const endAt = Math.min(now, pause.endAt ?? now, session.endAt ?? now, session.scheduledEndAt);
  const elapsedMs = Math.max(0, endAt - Math.max(session.startAt, pause.startAt));
  const gross = elapsedMs / 3_600_000 * getPayRates(session.profile).workHourlyGross;
  const net = gross * (1 - session.profile.deductionPercent / 100);
  return { elapsedMs, hypotheticalGross: gross, hypotheticalNet: net, accruedGross: pause.paid ? gross : 0, accruedNet: pause.paid ? net : 0 };
}
