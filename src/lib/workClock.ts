import { MONTHLY_HOURS } from "@/config/minimumWage";

/** A personal earnings visualization, not a payroll or attendance system. */
export type PayProfile = {
  basis: "annual" | "monthly" | "hourly";
  amount: number;
  dailyHours: number;
  workDaysPerWeek: number;
  /** User's combined income tax + insurance estimate, not an income tax rate. */
  deductionPercent: number;
};

export type WorkBreak = {
  id: string;
  startAt: number;
  endAt: number | null;
  kind: "rest" | "toilet" | "meal";
  paid: boolean;
};

export type WorkSession = {
  id: string;
  startAt: number;
  endAt: number | null;
  scheduledEndAt: number;
  breaks: WorkBreak[];
  /** Snapshot: changing the settings cannot rewrite previously recorded earnings. */
  profile: PayProfile;
};

export type WorkClockState = { version: 1; profile: PayProfile; sessions: WorkSession[] };
export type WorkTimeRange = { startAt: number; endAt: number };
export type WorkTotals = {
  elapsedMs: number;
  workedMs: number;
  paidMs: number;
  unpaidBreakMs: number;
  paidBreakMs: number;
  toiletMs: number;
  toiletPaidGross: number;
  gross: number;
  deduction: number;
  net: number;
  capped: boolean;
};

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;
const KST_OFFSET_MS = 9 * HOUR_MS;
export const MAX_SHIFT_MS = DAY_MS;
export const MAX_WORK_SESSIONS = 500;
export const WORK_CLOCK_STORAGE_KEY = "moneysalary:work-clock:v1";
const MAX_BREAKS = 100;
const MAX_SAVED_LENGTH = 2_000_000;

export const DEFAULT_PAY_PROFILE: PayProfile = {
  basis: "annual", amount: 48_000_000, dailyHours: 8, workDaysPerWeek: 5, deductionPercent: 15,
};

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function finiteIn(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function timestamp(value: unknown): value is number {
  return finiteIn(value, 0, 253_402_214_400_000);
}

function validId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 100;
}

export function isValidPayProfile(value: unknown): value is PayProfile {
  return record(value) && ["annual", "monthly", "hourly"].includes(value.basis as string)
    && finiteIn(value.amount, 0, 1_000_000_000_000)
    && finiteIn(value.dailyHours, 0.25, 16)
    && finiteIn(value.workDaysPerWeek, 1, 7) && Number.isInteger(value.workDaysPerWeek)
    && finiteIn(value.deductionPercent, 0, 100);
}

/** Validate saved records strictly; `now` also prevents future actual attendance. */
export function isValidWorkSession(value: unknown, now = Date.now()): value is WorkSession {
  if (!record(value) || !validId(value.id) || !timestamp(value.startAt) || value.startAt > now
    || !timestamp(value.scheduledEndAt) || value.scheduledEndAt <= value.startAt
    || value.scheduledEndAt - value.startAt > MAX_SHIFT_MS
    || !isValidPayProfile(value.profile) || !Array.isArray(value.breaks) || value.breaks.length > MAX_BREAKS
    || !(value.endAt === null || timestamp(value.endAt))) return false;
  if (value.endAt !== null && (value.endAt < value.startAt || value.endAt > now
    || value.endAt > value.scheduledEndAt)) return false;
  const limit = value.endAt ?? Math.min(now, value.scheduledEndAt);
  let previousEnd = value.startAt;
  const ids = new Set<string>();
  for (let index = 0; index < value.breaks.length; index += 1) {
    const pause: unknown = value.breaks[index];
    if (!record(pause) || !validId(pause.id) || ids.has(pause.id)
      || !timestamp(pause.startAt) || pause.startAt < previousEnd || pause.startAt > limit
      || !["rest", "toilet", "meal"].includes(pause.kind as string) || typeof pause.paid !== "boolean"
      || !(pause.endAt === null || timestamp(pause.endAt))) return false;
    ids.add(pause.id);
    if (pause.endAt === null) {
      if (value.endAt !== null || index !== value.breaks.length - 1) return false;
      previousEnd = limit;
    } else {
      if (pause.endAt < pause.startAt || pause.endAt > limit) return false;
      previousEnd = pause.endAt;
    }
  }
  return true;
}

export function getPayRates(profile: PayProfile) {
  if (!isValidPayProfile(profile)) throw new Error("급여 설정을 확인해 주세요.");
  const weeklyHours = profile.dailyHours * profile.workDaysPerWeek;
  // The site's standard monthly convention is 209 / 48 weeks. This allocation
  // excludes rest-day hours from the denominator, so it is NOT ordinary hourly pay.
  const scheduledMonthlyHours = weeklyHours * MONTHLY_HOURS / 48;
  const monthlyGross = profile.basis === "annual" ? profile.amount / 12
    : profile.basis === "monthly" ? profile.amount : profile.amount * scheduledMonthlyHours;
  const workHourlyGross = profile.basis === "hourly" ? profile.amount : monthlyGross / scheduledMonthlyHours;
  return {
    monthlyGross, scheduledMonthlyHours, workHourlyGross,
    // A reference only: the full salary may contain payments outside ordinary wages.
    ordinaryHourlyEstimate: profile.basis === "hourly" ? profile.amount
      : weeklyHours === 40 ? monthlyGross / MONTHLY_HOURS : null,
  };
}

function emptyTotals(): WorkTotals {
  return { elapsedMs: 0, workedMs: 0, paidMs: 0, unpaidBreakMs: 0, paidBreakMs: 0,
    toiletMs: 0, toiletPaidGross: 0, gross: 0, deduction: 0, net: 0, capped: false };
}

/** Recomputed from timestamps after tab throttling/reload; never accumulates ticks. */
export function calculateSession(session: WorkSession, now: number, range?: WorkTimeRange): WorkTotals {
  const result = emptyTotals();
  // Future portions of a structurally valid record are clipped to the supplied now.
  if (!timestamp(now) || !isValidWorkSession(session, Number.POSITIVE_INFINITY)
    || (range && (!timestamp(range.startAt) || !timestamp(range.endAt) || range.endAt < range.startAt))) return result;
  const cutoff = Math.min(session.scheduledEndAt, session.startAt + MAX_SHIFT_MS);
  const sessionEnd = Math.min(session.endAt ?? now, now, cutoff);
  result.capped = session.endAt === null && now >= cutoff;
  const start = Math.max(session.startAt, range?.startAt ?? session.startAt);
  const end = Math.min(sessionEnd, range?.endAt ?? sessionEnd);
  if (end <= start) return result;
  result.elapsedMs = end - start;
  let toiletPaidMs = 0;
  for (const pause of session.breaks) {
    const duration = Math.max(0, Math.min(pause.endAt ?? sessionEnd, end) - Math.max(pause.startAt, start));
    if (pause.paid) result.paidBreakMs += duration;
    else result.unpaidBreakMs += duration;
    if (pause.kind === "toilet") {
      result.toiletMs += duration;
      if (pause.paid) toiletPaidMs += duration;
    }
  }
  result.paidMs = result.elapsedMs - result.unpaidBreakMs;
  result.workedMs = result.paidMs - result.paidBreakMs;
  const hourly = getPayRates(session.profile).workHourlyGross;
  result.gross = result.paidMs / HOUR_MS * hourly;
  result.deduction = result.gross * session.profile.deductionPercent / 100;
  result.net = result.gross - result.deduction;
  result.toiletPaidGross = toiletPaidMs / HOUR_MS * hourly;
  return result;
}

/** A half-open range [startAt,endAt); midnight belongs to the following KST day. */
export function calculatePeriodTotals(sessions: WorkSession[], startAt: number, endAt: number, now: number): WorkTotals {
  const total = emptyTotals();
  let previousEnd = -1;
  for (const session of [...sessions].sort((a, b) => a.startAt - b.startAt).slice(-MAX_WORK_SESSIONS)) {
    if (!isValidWorkSession(session, Number.POSITIVE_INFINITY)) continue;
    const actualEnd = Math.min(session.endAt ?? now, now, session.scheduledEndAt);
    // Even untrusted callers cannot inflate a period with overlapping shifts.
    if (session.startAt < previousEnd) continue;
    previousEnd = actualEnd;
    const part = calculateSession(session, now, { startAt, endAt });
    for (const key of Object.keys(total) as (keyof WorkTotals)[]) {
      if (key === "capped") total.capped ||= part.capped;
      else total[key] += part[key];
    }
  }
  return total;
}

export function getKstDayKey(at: number): string {
  if (!timestamp(at)) throw new Error("날짜를 확인해 주세요.");
  return new Date(at + KST_OFFSET_MS).toISOString().slice(0, 10);
}

export function getKstDayRange(at: number): WorkTimeRange {
  const startAt = Date.parse(`${getKstDayKey(at)}T00:00:00+09:00`);
  return { startAt, endAt: startAt + DAY_MS };
}

export function getKstMonthRange(at: number): WorkTimeRange {
  const day = getKstDayKey(at);
  const year = Number(day.slice(0, 4));
  const month = Number(day.slice(5, 7));
  return { startAt: Date.UTC(year, month - 1, 1) - KST_OFFSET_MS,
    endAt: Date.UTC(year, month, 1) - KST_OFFSET_MS };
}

function newId(): string {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID() : `work-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function sessionCutoff(session: WorkSession): number {
  return Math.min(session.scheduledEndAt, session.startAt + MAX_SHIFT_MS);
}

export function createWorkSession(profile: PayProfile, startAt: number, existing: WorkSession[] = [],
  now = startAt, scheduledEndAt = startAt + MAX_SHIFT_MS): WorkSession {
  const session: WorkSession = { id: newId(), startAt, endAt: null, scheduledEndAt, breaks: [], profile: { ...profile } };
  if (!timestamp(now) || !isValidWorkSession(session, now)) throw new Error("출근·퇴근 시간과 급여 설정을 확인해 주세요. 한 기록은 24시간 이내여야 합니다.");
  if (existing.some((item) => item.endAt === null)) throw new Error("진행 중인 기록을 먼저 퇴근 처리해 주세요.");
  if (existing.some((item) => startAt < (item.endAt ?? item.scheduledEndAt) && scheduledEndAt > item.startAt)) {
    throw new Error("기존 근무 기록과 시간이 겹칩니다.");
  }
  return session;
}

function assertOpenSession(session: WorkSession, at: number): void {
  if (!timestamp(at) || !isValidWorkSession(session, Number.POSITIVE_INFINITY)
    || session.endAt !== null || at < session.startAt) throw new Error("진행 중인 근무 기록과 시간을 확인해 주세요.");
}

export function startBreak(session: WorkSession, kind: WorkBreak["kind"], paid: boolean, at: number): WorkSession {
  assertOpenSession(session, at);
  if (at >= sessionCutoff(session)) throw new Error("예정 퇴근시간이 지났습니다. 근무를 마무리해 주세요.");
  const last = session.breaks[session.breaks.length - 1];
  if (last && (last.endAt === null || at < last.endAt)) throw new Error("진행 중인 휴게를 먼저 마쳐 주세요.");
  if (!["rest", "toilet", "meal"].includes(kind) || typeof paid !== "boolean" || session.breaks.length >= MAX_BREAKS) {
    throw new Error("휴게 기록을 확인해 주세요. 한 근무에 최대 100개를 기록할 수 있습니다.");
  }
  return { ...session, breaks: [...session.breaks, { id: newId(), startAt: at, endAt: null, kind, paid }] };
}

export function endBreak(session: WorkSession, at: number): WorkSession {
  assertOpenSession(session, at);
  const last = session.breaks[session.breaks.length - 1];
  const endAt = Math.min(at, sessionCutoff(session));
  if (!last || last.endAt !== null || endAt < last.startAt) throw new Error("진행 중인 휴게와 복귀 시간을 확인해 주세요.");
  return { ...session, breaks: session.breaks.map((pause, i) => i === session.breaks.length - 1 ? { ...pause, endAt } : pause) };
}

export function finishSession(session: WorkSession, at: number): WorkSession {
  assertOpenSession(session, at);
  const endAt = Math.min(at, sessionCutoff(session));
  const last = session.breaks[session.breaks.length - 1];
  if (last && endAt < (last.endAt ?? last.startAt)) throw new Error("퇴근시간은 마지막 휴게 기록 이후여야 합니다.");
  const closed = last?.endAt === null ? endBreak(session, endAt) : session;
  return { ...closed, endAt };
}

export function estimateWeeklyRestAllowance(input: {
  ordinaryHourlyPay: number;
  /** Four-week average scheduled hours; standard 40h/week comparable worker. */
  scheduledWeeklyHours: number;
  attendanceConfirmed: boolean;
  employmentContinuesThroughRestDay: boolean;
}): { eligible: boolean; hours: number; amount: number; reason: string } {
  const no = (reason: string) => ({ eligible: false, hours: 0, amount: 0, reason });
  if (!finiteIn(input.ordinaryHourlyPay, 0, 1_000_000_000) || !finiteIn(input.scheduledWeeklyHours, 0, 40)) {
    return no("통상시급과 주 소정근로시간(0~40시간)을 확인해 주세요.");
  }
  if (input.scheduledWeeklyHours < 15) return no("4주 평균 주 소정근로시간이 15시간 이상이어야 합니다.");
  if (!input.attendanceConfirmed) return no("해당 주의 소정근로일 개근 여부를 확인해 주세요.");
  if (!input.employmentContinuesThroughRestDay) return no("주휴일까지 근로관계가 유지되는지 확인해 주세요.");
  const hours = input.scheduledWeeklyHours / 40 * 8;
  return { eligible: true, hours, amount: hours * input.ordinaryHourlyPay,
    reason: "주 40시간·5일 통상근로자에 비례한 참고 추정입니다. 월급·연봉 기록에는 추가 합산하지 않습니다." };
}

function cleanProfile(profile: PayProfile): PayProfile {
  return { basis: profile.basis, amount: profile.amount, dailyHours: profile.dailyHours,
    workDaysPerWeek: profile.workDaysPerWeek, deductionPercent: profile.deductionPercent };
}

export function parseWorkClockState(raw: string | null, now = Date.now()): WorkClockState | null {
  if (!raw || raw.length > MAX_SAVED_LENGTH || !timestamp(now)) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!record(value) || value.version !== 1 || !isValidPayProfile(value.profile)
      || !Array.isArray(value.sessions) || value.sessions.length > MAX_WORK_SESSIONS) return null;
    const sessions: WorkSession[] = [];
    const ids = new Set<string>();
    let previousEnd = -1;
    let openSeen = false;
    for (const session of [...value.sessions].sort((a, b) => (record(a) && typeof a.startAt === "number" ? a.startAt : 0)
      - (record(b) && typeof b.startAt === "number" ? b.startAt : 0))) {
      if (!isValidWorkSession(session, now) || ids.has(session.id) || openSeen || session.startAt < previousEnd) return null;
      ids.add(session.id);
      previousEnd = session.endAt ?? session.scheduledEndAt;
      openSeen = session.endAt === null;
      sessions.push({ id: session.id, startAt: session.startAt, endAt: session.endAt,
        scheduledEndAt: session.scheduledEndAt, profile: cleanProfile(session.profile),
        breaks: session.breaks.map(({ id, startAt, endAt, kind, paid }) => ({ id, startAt, endAt, kind, paid })) });
    }
    return { version: 1, profile: cleanProfile(value.profile), sessions };
  } catch { return null; }
}

export function serializeWorkClockState(state: WorkClockState, now = Date.now()): string | null {
  try {
    // Explicit retention: the most recent 500 records, with an active record last.
    const bounded = { ...state, sessions: [...state.sessions].sort((a, b) => a.startAt - b.startAt).slice(-MAX_WORK_SESSIONS) };
    const validated = parseWorkClockState(JSON.stringify(bounded), now);
    return validated ? JSON.stringify(validated) : null;
  } catch { return null; }
}

type StorageAccess = Pick<Storage, "getItem" | "setItem">;

export function loadWorkClockState(storage?: StorageAccess, now = Date.now()): WorkClockState | null {
  try {
    const target = storage ?? (typeof window !== "undefined" ? window.localStorage : null);
    return target ? parseWorkClockState(target.getItem(WORK_CLOCK_STORAGE_KEY), now) : null;
  } catch { return null; }
}

/** False means the UI must say that changes are only held in this tab. */
export function saveWorkClockState(state: WorkClockState, storage?: StorageAccess, now = Date.now()): boolean {
  try {
    const target = storage ?? (typeof window !== "undefined" ? window.localStorage : null);
    const raw = serializeWorkClockState(state, now);
    if (!target || raw === null) return false;
    target.setItem(WORK_CLOCK_STORAGE_KEY, raw);
    return true;
  } catch { return false; }
}
