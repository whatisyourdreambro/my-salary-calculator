import { calculatePeriodTotals, getKstDayKey, type WorkSession, type WorkTotals } from "./workClock";

const DAY = 86_400_000;

export type WorkCalendarDay = {
  key: string;
  day: number;
  startAt: number;
  endAt: number;
  totals: WorkTotals;
  hasRecords: boolean;
  ongoing: boolean;
};

export function isWorkCalendarMonth(value: string): boolean {
  return /^(20\d{2})-(0[1-9]|1[0-2])$/.test(value);
}

/** Month keys and day boundaries always use Korea time, regardless of device timezone. */
export function shiftWorkCalendarMonth(month: string, direction: -1 | 1): string {
  if (!isWorkCalendarMonth(month)) throw new Error("조회 월을 확인해 주세요.");
  const [year, monthNumber] = month.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, monthNumber - 1 + direction, 1)).toISOString().slice(0, 7);
  return isWorkCalendarMonth(shifted) ? shifted : month;
}

export function buildWorkCalendarMonth(month: string, sessions: WorkSession[], now: number) {
  if (!isWorkCalendarMonth(month)) throw new Error("조회 월을 확인해 주세요.");
  const [year, monthNumber] = month.split("-").map(Number);
  const count = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
  const firstAt = Date.parse(`${month}-01T00:00:00+09:00`);
  const days: WorkCalendarDay[] = Array.from({ length: count }, (_, index) => {
    const startAt = firstAt + index * DAY;
    const endAt = startAt + DAY;
    const overlapping = sessions.filter((session) => session.startAt < endAt &&
      Math.min(session.endAt ?? now, now, session.scheduledEndAt) > startAt);
    return {
      key: getKstDayKey(startAt), day: index + 1, startAt, endAt,
      totals: calculatePeriodTotals(overlapping, startAt, endAt, now),
      hasRecords: overlapping.length > 0,
      ongoing: overlapping.some((session) => session.endAt === null && now < session.scheduledEndAt && now >= startAt && now < endAt),
    };
  });
  return { days, firstWeekday };
}
