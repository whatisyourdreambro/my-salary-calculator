"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { shiftWorkCalendarMonth, type WorkCalendarDay } from "@/lib/workClockCalendar";
import styles from "./work-clock.module.css";

type Props = {
  month: string;
  days: WorkCalendarDay[];
  firstWeekday: number;
  today: string;
  selectedDay: string;
  onMonthChange: (month: string) => void;
  onSelectDay: (day: string) => void;
};

const compactWon = (value: number) => value >= 100_000_000
  ? `${(value / 100_000_000).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}억`
  : value >= 10_000
  ? `${(value / 10_000).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}만`
  : Math.round(value).toLocaleString("ko-KR");

export default function WorkCalendar({ month, days, firstWeekday, today, selectedDay, onMonthChange, onSelectDay }: Props) {
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const cells: (WorkCalendarDay | null)[] = [...Array.from({ length: firstWeekday }, () => null), ...days];
  while (cells.length % 7 !== 0) cells.push(null);
  const rows = Array.from({ length: cells.length / 7 }, (_, index) => cells.slice(index * 7, index * 7 + 7));
  const [year, monthNumber] = month.split("-").map(Number);

  return <div className={styles.calendar}>
    <div className={styles.calendarToolbar}>
      <div className={styles.buttonRow}>
        <button type="button" className={styles.iconButton} aria-label="이전 달" disabled={month === "2000-01"} onClick={() => onMonthChange(shiftWorkCalendarMonth(month, -1))}><ChevronLeft size={17} /></button>
        <strong aria-live="polite">{year}년 {monthNumber}월</strong>
        <button type="button" className={styles.iconButton} aria-label="다음 달" disabled={month === "2099-12"} onClick={() => onMonthChange(shiftWorkCalendarMonth(month, 1))}><ChevronRight size={17} /></button>
      </div>
      <button type="button" className={styles.textButton} onClick={() => { onMonthChange(today.slice(0, 7)); onSelectDay(today); }}>오늘로</button>
    </div>
    <p id="work-calendar-help" className={styles.sectionSubtitle}>날짜를 누르면 그날의 금액과 근무를 볼 수 있어요. 달력 금액은 세전이며 1분마다 반영합니다.</p>
    <table className={styles.calendarTable} aria-label={`${year}년 ${monthNumber}월 근무 달력`} aria-describedby="work-calendar-help">
      <thead><tr>{["일", "월", "화", "수", "목", "금", "토"].map((day, index) => <th scope="col" key={day} className={index === 0 ? styles.sunday : index === 6 ? styles.saturday : undefined}>{day}</th>)}</tr></thead>
      <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((day, index) => <td key={day?.key ?? `empty-${index}`}>
        {day && <button type="button" ref={(node) => { if (node) buttons.current.set(day.key, node); else buttons.current.delete(day.key); }}
          className={`${styles.calendarDay} ${selectedDay === day.key ? styles.calendarDaySelected : ""} ${day.hasRecords ? styles.calendarDayRecorded : ""}`}
          aria-pressed={selectedDay === day.key} aria-current={day.key === today ? "date" : undefined}
          aria-label={`${day.key}, ${day.hasRecords ? `세전 ${Math.round(day.totals.gross).toLocaleString("ko-KR")}원` : "기록 없음"}${day.ongoing ? ", 근무 중" : ""}`}
          onClick={() => onSelectDay(day.key)}
          onKeyDown={(event) => {
            const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -index, End: 6 - index };
            const offset = offsets[event.key];
            if (offset === undefined) return;
            event.preventDefault();
            const next = days[day.day - 1 + offset];
            if (next) { onSelectDay(next.key); buttons.current.get(next.key)?.focus(); }
          }}>
          <span className={`${styles.calendarDate} ${index === 0 ? styles.sunday : index === 6 ? styles.saturday : ""}`}>{day.day}<span className={styles.calendarMarker} aria-hidden="true">{day.ongoing ? "●" : day.key === today ? "오늘" : ""}</span></span>
          <span className={styles.calendarAmount}>{day.hasRecords ? compactWon(day.totals.gross) : "—"}</span>
        </button>}
      </td>)}</tr>)}</tbody>
    </table>
  </div>;
}
