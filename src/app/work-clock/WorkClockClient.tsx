"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CalendarDays, Check, Clock3, Coffee, Flag, History, LockKeyhole, Pause, Play, RotateCcw, Settings2, ShieldCheck, Square, Timer, Trash2, Wallet } from "lucide-react";
import {
  calculatePeriodTotals, calculateSession, createWorkSession, DEFAULT_PAY_PROFILE,
  endBreak, estimateWeeklyRestAllowance, finishSession, getKstDayKey, getKstDayRange,
  getKstMonthRange, getPayRates, isValidPayProfile, loadWorkClockState, MAX_WORK_SESSIONS,
  saveWorkClockState, startBreak, WORK_CLOCK_STORAGE_KEY,
  type PayProfile, type WorkBreak, type WorkClockState, type WorkSession,
} from "@/lib/workClock";
import styles from "./work-clock.module.css";
import { trackCalcStart, trackCalcSuccess } from "@/lib/analytics";
import HolidayPayEstimate from "./HolidayPayEstimate";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const GOAL_KEY = "moneysalary:work-clock:goal:v1";
const won = (value: number) => Math.round(value).toLocaleString("ko-KR");
const timeText = (value: number) => new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false }).format(value);
const dateText = (value: number) => new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric", weekday: "short" }).format(value);
const localInput = (value: number) => new Date(value + 9 * HOUR).toISOString().slice(0, 16);
const fromInput = (value: string) => value ? Date.parse(`${value}:00+09:00`) : NaN;
const duration = (milliseconds: number, seconds = false) => {
  const total = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total % 3600 / 60);
  return seconds ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}` : `${hours}시간 ${minutes}분`;
};
const breakLabels: Record<WorkBreak["kind"], string> = { rest: "휴식", toilet: "화장실", meal: "식사" };
const draftFrom = (profile: PayProfile) => ({ ...profile, amount: String(profile.amount), dailyHours: String(profile.dailyHours), workDaysPerWeek: String(profile.workDaysPerWeek), deductionPercent: String(profile.deductionPercent) });
type PayDraft = ReturnType<typeof draftFrom>;

/** Timestamp-based rendering: hidden tabs stop painting; elapsed pay never relies on tick count. */
function useVisibleClock() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      if (timer) clearInterval(timer);
      setNow(Date.now());
      if (!document.hidden) timer = setInterval(() => setNow(Date.now()), 1000);
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => { if (timer) clearInterval(timer); document.removeEventListener("visibilitychange", sync); };
  }, []);
  return now;
}

export default function WorkClockClient() {
  const measuredStart = useRef(false);
  const clock = useVisibleClock();
  const now = clock ?? Date.UTC(2026, 0, 1);
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<PayProfile>(DEFAULT_PAY_PROFILE);
  const [draft, setDraft] = useState<PayDraft>(draftFrom(DEFAULT_PAY_PROFILE));
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [unreadableSaved, setUnreadableSaved] = useState(false);
  const [staleStorage, setStaleStorage] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [startInput, setStartInput] = useState("");
  const [exactStartAt, setExactStartAt] = useState<number | null>(null);
  const [cutoffInput, setCutoffInput] = useState("");
  const [finishInput, setFinishInput] = useState("");
  const [breakKind, setBreakKind] = useState<WorkBreak["kind"]>("rest");
  const [breakPaid, setBreakPaid] = useState(false);
  const [month, setMonth] = useState("");
  const [manualStart, setManualStart] = useState("");
  const [manualEnd, setManualEnd] = useState("");
  const [manualPauseAt, setManualPauseAt] = useState("");
  const [manualPauseMinutes, setManualPauseMinutes] = useState("60");
  const [goalAmount, setGoalAmount] = useState("5000");
  const [focusEndAt, setFocusEndAt] = useState<number | null>(null);
  const [weeklyHourly, setWeeklyHourly] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("40");
  const [attendance, setAttendance] = useState(false);
  const [employment, setEmployment] = useState(false);
  const [clearConfirmation, setClearConfirmation] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [undo, setUndo] = useState<{ state: WorkClockState; goal: string; save: boolean } | null>(null);

  useEffect(() => {
    const initialNow = Date.now();
    const today = getKstDayKey(initialNow);
    const saved = loadWorkClockState();
    if (saved) {
      setProfile(saved.profile);
      setDraft(draftFrom(saved.profile));
      setSessions(saved.sessions);
      setSaveEnabled(true);
      setRecovered(saved.sessions.some((session) => session.endAt === null));
      try {
        const storedGoal = window.localStorage.getItem(GOAL_KEY);
        if (storedGoal && /^\d{1,9}$/.test(storedGoal) && Number(storedGoal) > 0) setGoalAmount(storedGoal);
      } catch { /* Storage status is reported when saving is requested. */ }
    } else {
      try {
        if (window.localStorage.getItem(WORK_CLOCK_STORAGE_KEY)) {
          setUnreadableSaved(true);
          setStorageError("저장된 기록을 읽지 못했습니다. 기존 데이터는 그대로 보관 중이며 덮어쓰지 않습니다. 필요하면 브라우저 데이터를 확인한 뒤 ‘설정·기록 모두 삭제’로 초기화해 주세요.");
        }
      } catch { /* Local storage is optional. */ }
    }
    setStartInput(localInput(initialNow));
    setExactStartAt(initialNow);
    setCutoffInput(localInput(initialNow + 8 * HOUR));
    setMonth(today.slice(0, 7));
    setManualStart(`${today}T09:00`);
    setManualEnd(`${today}T18:00`);
    setManualPauseAt(`${today}T12:00`);
    setReady(true);
  }, []);

  // Persist only on edits, never on timer ticks. No inputs or records leave the browser.
  useEffect(() => {
    if (!ready || !saveEnabled) return;
    const saved = saveWorkClockState({ version: 1, profile, sessions });
    let goalSaved = true;
    try { window.localStorage.setItem(GOAL_KEY, goalAmount); } catch { goalSaved = false; }
    setStorageError(saved && goalSaved ? "" : "브라우저 저장에 실패했습니다. 현재 기록은 이 탭에만 있으니 닫기 전에 확인해 주세요.");
  }, [ready, saveEnabled, profile, sessions, goalAmount]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== WORK_CLOCK_STORAGE_KEY) return;
      setSaveEnabled(false);
      setStaleStorage(true);
      setUndo(null);
      setStorageError("다른 탭에서 기록이 바뀌어 이 탭의 자동 저장을 멈췄습니다. 다른 탭의 기록을 보려면 이 페이지를 새로고침해 주세요.");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const active = sessions.find((session) => session.endAt === null);
  const openBreak = active?.breaks.find((pause) => pause.endAt === null);
  const activeTotals = active ? calculateSession(active, now) : null;
  const todayRange = getKstDayRange(now);
  const todayTotals = calculatePeriodTotals(sessions, todayRange.startAt, todayRange.endAt, now);
  const selectedMonthAt = /^\d{4}-\d{2}$/.test(month) ? Date.parse(`${month}-01T00:00:00+09:00`) : now;
  const monthRange = getKstMonthRange(Number.isFinite(selectedMonthAt) && selectedMonthAt >= Date.UTC(2000, 0, 1) - 9 * HOUR && selectedMonthAt < Date.UTC(2100, 0, 1) ? selectedMonthAt : now);
  const monthTotals = calculatePeriodTotals(sessions, monthRange.startAt, monthRange.endAt, now);
  const monthSessions = sessions.filter((session) => session.startAt < monthRange.endAt && (session.endAt ?? Math.min(now, session.scheduledEndAt)) > monthRange.startAt).sort((a, b) => b.startAt - a.startAt);
  const rates = getPayRates(profile);
  const weekly = estimateWeeklyRestAllowance({ ordinaryHourlyPay: weeklyHourly === "" ? rates.ordinaryHourlyEstimate ?? 0 : Number(weeklyHourly), scheduledWeeklyHours: Number(weeklyHours), attendanceConfirmed: attendance, employmentContinuesThroughRestDay: employment });
  const weeklyRateKnown = weeklyHourly !== "" || rates.ordinaryHourlyEstimate !== null;
  const goal = Number(goalAmount);
  const validGoal = Number.isFinite(goal) && goal > 0 && goal <= 999_999_999;
  const goalProgress = validGoal ? Math.min(100, todayTotals.net / goal * 100) : 0;
  const focusRemaining = focusEndAt === null ? 25 * 60_000 : Math.max(0, focusEndAt - now);
  const latestBreakSession = sessions.slice().sort((a, b) => b.startAt - a.startAt).find((session) => session.breaks.some((pause) => pause.endAt !== null));
  const latestBreak = latestBreakSession?.breaks.slice().reverse().find((pause) => pause.endAt !== null);
  const receiptGross = latestBreak && latestBreakSession && latestBreak.paid ? ((latestBreak.endAt ?? now) - latestBreak.startAt) / HOUR * getPayRates(latestBreakSession.profile).workHourlyGross : 0;
  const minuteNow = Math.floor(now / 60_000) * 60_000;
  const chartDays = useMemo(() => {
    const days: { at: number; gross: number }[] = [];
    for (let at = monthRange.startAt; at < monthRange.endAt; at += DAY) {
      days.push({ at, gross: calculatePeriodTotals(sessions, at, at + DAY, minuteNow).gross });
    }
    return days;
  }, [sessions, monthRange.startAt, monthRange.endAt, minuteNow]);
  const chartMax = Math.max(1, ...chartDays.map((day) => day.gross));
  const status = !active ? "출근 전 / 근무 종료" : activeTotals?.capped ? "예정 퇴근 도달 · 계산 멈춤" : openBreak ? `${breakLabels[openBreak.kind]} 중 · ${openBreak.paid ? "유급" : "무급"}` : "근무 기록 중";

  function run(action: () => void) {
    setError("");
    setMessage("");
    try { action(); } catch (caught) { setError(caught instanceof Error ? caught.message : "입력한 시간과 금액을 확인해 주세요."); }
  }

  function updateDraft(field: keyof PayDraft, value: string) {
    setDraft((previous) => ({ ...previous, [field]: value }));
  }

  function applyProfile() {
    run(() => {
      if ([draft.amount, draft.dailyHours, draft.workDaysPerWeek, draft.deductionPercent].some((value) => value.trim() === "")) throw new Error("급여, 근무시간, 공제율을 모두 입력해 주세요.");
      const next: PayProfile = { basis: draft.basis, amount: Number(draft.amount), dailyHours: Number(draft.dailyHours), workDaysPerWeek: Number(draft.workDaysPerWeek), deductionPercent: Number(draft.deductionPercent) };
      if (!isValidPayProfile(next)) throw new Error("금액은 0 이상, 하루 근무는 0.25~16시간, 주 근무는 1~7일 정수, 공제율은 0~100%로 입력해 주세요.");
      setUndo(null);
      setProfile(next);
      setWeeklyHours(String(Math.min(40, next.dailyHours * next.workDaysPerWeek)));
      setMessage(active ? "급여 설정을 저장했습니다. 진행 중인 근무는 출근 당시 설정을 유지하며, 다음 근무부터 새 설정을 씁니다." : "급여 설정을 적용했습니다. 이제 출근 시간을 확인하고 시작해 주세요.");
    });
  }

  function beginShift() {
    run(() => {
      if (sessions.length >= MAX_WORK_SESSIONS) throw new Error("최대 500개 근무를 기록할 수 있습니다. 오래된 기록을 삭제한 뒤 시작해 주세요.");
      const started = createWorkSession(profile, exactStartAt ?? fromInput(startInput), sessions, Date.now(), fromInput(cutoffInput));
      if (started.scheduledEndAt <= Date.now()) throw new Error("예정 퇴근시간을 현재 이후로 설정해 주세요. 지난 근무는 아래에서 직접 추가할 수 있습니다.");
      setUndo(null);
      setSessions((previous) => [...previous, started]);
      setMessage("근무를 시작했습니다. 예정 퇴근시간에 수익 계산이 자동으로 멈춥니다.");
    });
  }

  function changeActive(action: "break" | "return" | "finish", recordedEnd?: number) {
    run(() => {
      if (!active) return;
      const at = recordedEnd ?? Date.now();
      if (!Number.isFinite(at) || at > Date.now()) throw new Error("실제 퇴근시간을 현재 이전으로 입력해 주세요.");
      const next = action === "break" ? startBreak(active, breakKind, breakPaid, at) : action === "return" ? endBreak(active, at) : finishSession(active, at);
      setUndo(null);
      setSessions((previous) => previous.map((session) => session.id === active.id ? next : session));
      setRecovered(false);
      setMessage(action === "break" ? `${breakLabels[breakKind]}를 ${breakPaid ? "유급" : "무급"}으로 기록합니다.` : action === "return" ? "복귀했습니다. 수고하고 있는 나에게 잠깐의 응원을!" : "오늘도 수고했어요. 퇴근 기록을 남겼습니다.");
      if (action === "finish") {
        const nextStart = Date.now();
        setStartInput(localInput(nextStart));
        setExactStartAt(nextStart);
        setCutoffInput(localInput(nextStart + 8 * HOUR));
        setFinishInput("");
        trackCalcSuccess("work_clock", "/work-clock");
      }
    });
  }

  function addManualShift(event: React.FormEvent) {
    event.preventDefault();
    run(() => {
      if (sessions.length >= MAX_WORK_SESSIONS) throw new Error("기록이 500개에 도달했습니다. 오래된 기록을 삭제해 주세요.");
      const startAt = fromInput(manualStart);
      const endAt = fromInput(manualEnd);
      const at = Date.now();
      if (!Number.isFinite(startAt) || startAt < Date.parse("2000-01-01T00:00:00+09:00")) throw new Error("지난 근무는 2000년 1월 1일 이후의 일시로 입력해 주세요.");
      if (!Number.isFinite(endAt) || endAt > at || endAt <= startAt) throw new Error("지난 근무의 퇴근시간은 출근 이후, 현재 이전이어야 합니다.");
      const pauseMinutes = Number(manualPauseMinutes);
      if (manualPauseMinutes.trim() === "" || !Number.isFinite(pauseMinutes) || pauseMinutes < 0 || pauseMinutes >= 1440) throw new Error("무급 휴게를 0~1439분으로 입력해 주세요.");
      let added = createWorkSession(profile, startAt, sessions, at, endAt);
      if (pauseMinutes > 0) {
        const pauseStart = fromInput(manualPauseAt);
        const pauseEnd = pauseStart + pauseMinutes * 60_000;
        if (!Number.isFinite(pauseStart) || pauseStart < startAt || pauseEnd > endAt) throw new Error("무급 휴게의 시작과 종료가 근무시간 안에 있어야 합니다.");
        added = startBreak(added, "rest", false, pauseStart);
        added = endBreak(added, pauseEnd);
      }
      added = finishSession(added, endAt);
      setUndo(null);
      setSessions((previous) => [...previous, added].sort((a, b) => a.startAt - b.startAt));
      setMonth(getKstDayKey(startAt).slice(0, 7));
      setMessage("지난 근무를 추가했습니다. 현재 급여 설정으로 기록했으며, 이후 설정을 바꿔도 이 기록은 유지됩니다.");
      trackCalcSuccess("work_clock", "/work-clock");
    });
  }

  function captureUndo() { setUndo({ state: { version: 1, profile, sessions }, goal: goalAmount, save: saveEnabled }); }

  function removeSession(id: string) {
    captureUndo();
    setSessions((previous) => previous.filter((session) => session.id !== id));
    setDeleteId(null);
    setMessage("근무 기록을 삭제했습니다. 아래에서 실행 취소할 수 있습니다.");
  }

  function clearAll() {
    captureUndo();
    setSaveEnabled(false);
    setSessions([]);
    setProfile(DEFAULT_PAY_PROFILE);
    setDraft(draftFrom(DEFAULT_PAY_PROFILE));
    setGoalAmount("5000");
    setRecovered(false);
    setUnreadableSaved(false);
    setStaleStorage(false);
    setFocusEndAt(null);
    setClearConfirmation(false);
    try { window.localStorage.removeItem(WORK_CLOCK_STORAGE_KEY); window.localStorage.removeItem(GOAL_KEY); setStorageError(""); }
    catch { setStorageError("브라우저 저장소 삭제에 실패했습니다. 브라우저의 사이트 데이터 설정에서 삭제할 수 있습니다."); }
    setMessage("급여 설정과 모든 근무 기록을 삭제했습니다. 이 탭을 닫기 전까지 실행 취소할 수 있습니다.");
  }

  function restoreDeleted() {
    if (!undo) return;
    setProfile(undo.state.profile);
    setDraft(draftFrom(undo.state.profile));
    setSessions(undo.state.sessions);
    setGoalAmount(undo.goal);
    setSaveEnabled(undo.save);
    setUndo(null);
    setMessage("삭제 전 기록을 복원했습니다.");
  }

  function toggleStorage(enabled: boolean) {
    setUndo(null);
    if (enabled && staleStorage) {
      setError("다른 탭의 최신 기록을 보호하기 위해 저장을 멈췄습니다. 새로고침하여 최신 기록을 불러온 뒤 저장해 주세요.");
      return;
    }
    if (enabled && unreadableSaved) {
      setError("읽지 못한 기존 기록을 덮어쓰지 않도록 저장을 멈췄습니다. 기존 데이터를 확인한 뒤 ‘설정·기록 모두 삭제’로 초기화해 주세요.");
      return;
    }
    setSaveEnabled(enabled);
    setStorageError("");
    if (!enabled) {
      try { window.localStorage.removeItem(WORK_CLOCK_STORAGE_KEY); window.localStorage.removeItem(GOAL_KEY); }
      catch { setStorageError("브라우저 저장소 삭제에 실패했습니다. 브라우저의 사이트 데이터 설정에서 삭제해 주세요."); }
      setMessage("이 브라우저에 저장된 기록을 지웠습니다. 현재 탭의 기록은 닫을 때까지 유지됩니다.");
    }
  }

  function markStarted(trusted: boolean) {
    if (!trusted || measuredStart.current) return;
    measuredStart.current = true;
    trackCalcStart("work_clock", "/work-clock");
  }

  return (
    <div className={styles.dashboard} onInputCapture={(event) => markStarted(event.nativeEvent.isTrusted)} onClickCapture={(event) => {
      if (event.target instanceof Element && event.target.closest("[data-work-clock-action]")) markStarted(event.nativeEvent.isTrusted);
    }}>
      {recovered && active && <div className={styles.notice}><History size={16} /><p>이전에 저장한 근무가 진행 중입니다. {dateText(active.startAt)} {timeText(active.startAt)} 출근 기록과 실제 퇴근시간을 확인해 주세요. 예정 퇴근 이후에는 금액이 늘어나지 않습니다.</p></div>}

      <div className={styles.topGrid}>
        <section className={styles.hero} aria-labelledby="earnings-title">
          <div className={styles.heroTop}><h2 id="earnings-title" className={styles.heroLabel}>오늘 내가 번 돈</h2><span className={styles.status}><span className={styles.statusDot} />{ready ? status : "준비 중"}</span></div>
          <div className={styles.heroValue} aria-live="off"><span>{ready ? won(todayTotals.net) : "0"}</span><small>원</small></div>
          <p className={styles.heroEstimate}>공제 후 환산액 · 급여 지급액과 다를 수 있어요</p>
          <dl className={styles.heroStats} aria-live="off">
            <div><dt>세전 환산</dt><dd>{won(todayTotals.gross)}원</dd></div>
            <div><dt>예상 세금·보험 공제</dt><dd>{won(todayTotals.deduction)}원</dd></div>
            <div><dt>유급으로 기록한 시간</dt><dd>{duration(todayTotals.paidMs, true)}</dd></div>
          </dl>
          <div className={styles.shiftLine}><span>{ready ? `${dateText(now)} · 한국시간` : "한국시간 기준"}</span><strong>{active ? `예정 퇴근 ${timeText(active.scheduledEndAt)}` : "나의 시간을 숫자로"}</strong></div>
          {active && <p className={styles.heroEstimate}>이번 근무 전체 {won(activeTotals?.net ?? 0)}원 · 공제율 {active.profile.deductionPercent}%</p>}
        </section>

        <section className={styles.panel} aria-labelledby="pay-settings-title">
          <div className={styles.panelHeading}><h2 id="pay-settings-title" className={styles.panelTitle}><Settings2 size={18} /> 내 급여 설정</h2><span className={styles.smallTag}>다음 근무에 적용</span></div>
          <div className={styles.basis} role="group" aria-label="급여 기준">
            {([ ["annual", "연봉"], ["monthly", "월급"], ["hourly", "시급"] ] as const).map(([basis, label]) => <button type="button" key={basis} aria-pressed={draft.basis === basis} onClick={() => setDraft((previous) => ({ ...previous, basis, amount: basis === "annual" ? "48000000" : basis === "monthly" ? "4000000" : "12000" }))}>{label}</button>)}
          </div>
          <div className={styles.fields}>
            <label className={`${styles.field} ${styles.fullField}`} htmlFor="work-pay">세전 {draft.basis === "annual" ? "연봉" : draft.basis === "monthly" ? "월급" : "시급"} (원)<input id="work-pay" className={styles.input} inputMode="numeric" type="number" min="0" max="1000000000000" value={draft.amount} onChange={(event) => updateDraft("amount", event.target.value)} /></label>
            <label className={styles.field} htmlFor="work-hours">환산용 하루 근무 (시간)<input id="work-hours" className={styles.input} type="number" min="0.25" max="16" step="0.25" value={draft.dailyHours} onChange={(event) => updateDraft("dailyHours", event.target.value)} /></label>
            <label className={styles.field} htmlFor="work-days">환산용 주 근무일 (일)<input id="work-days" className={styles.input} type="number" min="1" max="7" step="1" value={draft.workDaysPerWeek} onChange={(event) => updateDraft("workDaysPerWeek", event.target.value)} /></label>
            <label className={`${styles.field} ${styles.fullField}`} htmlFor="work-deductions">세금·보험 합산 예상 공제율 (%)<input id="work-deductions" className={styles.input} type="number" min="0" max="100" step="0.1" value={draft.deductionPercent} onChange={(event) => updateDraft("deductionPercent", event.target.value)} /></label>
          </div>
          <div className={styles.ratePreview}><span>현재 적용된 근무시간당 환산</span><strong>{won(rates.workHourlyGross)}원</strong></div>
          <button type="button" data-work-clock-action className={`${styles.button} ${styles.primary} ${styles.wide}`} onClick={applyProfile}><Check size={16} /> 급여 설정 적용</button>
          <p className={styles.sectionSubtitle}>기본값은 예시입니다. 공제율은 급여명세서의 총 공제 ÷ 세전 급여로 조정하세요. 연봉·월급 환산 시급은 법정 통상시급과 다릅니다.</p>
        </section>
      </div>

      <section className={`${styles.panel} ${styles.controlPanel}`} aria-labelledby="work-record-title">
        <div>
          <h2 id="work-record-title" className={styles.panelTitle}><Clock3 size={18} /> 오늘의 근무 기록</h2>
          <p className={styles.sectionSubtitle}>한국시간으로 기록해요. 예정 퇴근에 계산이 멈추고, 퇴근 버튼으로 기록을 마칩니다.</p>
          {!active ? <>
            <div className={`${styles.fields} ${styles.controlFields}`}>
              <label className={styles.field} htmlFor="shift-start">출근 일시<input id="shift-start" className={styles.input} type="datetime-local" value={startInput} onChange={(event) => { setStartInput(event.target.value); setExactStartAt(null); }} /></label>
              <label className={styles.field} htmlFor="shift-cutoff">예정 퇴근 일시<input id="shift-cutoff" className={styles.input} type="datetime-local" value={cutoffInput} onChange={(event) => setCutoffInput(event.target.value)} /></label>
            </div>
            <div className={styles.buttonRow}><button type="button" data-work-clock-action className={`${styles.button} ${styles.primary}`} disabled={!ready} onClick={beginShift}><Play size={16} /> 출근 · 기록 시작</button><button type="button" className={styles.textButton} disabled={!ready} onClick={() => { const at = Date.now(); setStartInput(localInput(at)); setExactStartAt(at); setCutoffInput(localInput(at + 8 * HOUR)); }}>현재 시각으로 맞추기</button></div>
          </> : <>
            <div className={styles.ratePreview}><span>{dateText(active.startAt)} {timeText(active.startAt)} 출근</span><strong>{duration(activeTotals?.elapsedMs ?? 0)}</strong></div>
            <div className={styles.buttonRow}>{openBreak && !activeTotals?.capped && <button type="button" data-work-clock-action className={`${styles.button} ${styles.primary}`} onClick={() => changeActive("return")}><Play size={16} /> 업무 복귀</button>}<button type="button" data-work-clock-action className={`${styles.button} ${styles.blue}`} onClick={() => changeActive("finish")}><Square size={14} /> {activeTotals?.capped ? "예정 시각으로 퇴근 완료" : "퇴근 · 기록 마치기"}</button></div>
            <p className={styles.sectionSubtitle}>무급 휴게 {duration(activeTotals?.unpaidBreakMs ?? 0)} · 유급 휴식 {duration(activeTotals?.paidBreakMs ?? 0)}</p>
            {activeTotals?.capped && <p className={styles.sectionSubtitle}>예정 퇴근시간에 자동으로 계산을 멈췄어요. 잊고 켜 두어도 밤새 급여가 늘어나지 않습니다.</p>}
            <details className={styles.weeklyDetails}><summary>이미 퇴근했다면 실제 시각 입력</summary><div className={styles.weeklyFields}><label className={styles.field} htmlFor="shift-actual-end">실제 퇴근 일시<input id="shift-actual-end" className={styles.input} type="datetime-local" value={finishInput} onChange={(event) => setFinishInput(event.target.value)} /></label><button type="button" className={styles.button} onClick={() => changeActive("finish", fromInput(finishInput))}>입력한 시각으로 퇴근 기록</button><p className={styles.muted}>마지막 휴게 기록 이후, 현재 이전의 시각을 입력해 주세요. 예정 퇴근 이후는 예정 시각까지만 반영합니다.</p></div></details>
          </>}
        </div>
        <div className={styles.controlAside}>
          <div className={styles.breakControls}>
            <div className={styles.fields}>
              <label className={styles.field} htmlFor="break-kind">잠깐 자리 비우기<select id="break-kind" className={styles.select} value={breakKind} disabled={!!openBreak} onChange={(event) => { const kind = event.target.value as WorkBreak["kind"]; setBreakKind(kind); setBreakPaid(false); }}><option value="rest">휴식 / 스트레칭</option><option value="meal">식사</option><option value="toilet">화장실</option></select></label>
              <div className={styles.field}><span>휴게 시작</span><button type="button" className={styles.button} disabled={!active || !!openBreak || activeTotals?.capped} onClick={() => changeActive("break")}><Pause size={15} /> {breakLabels[breakKind]} 시작</button></div>
            </div>
            <label className={styles.checkbox}><input type="checkbox" checked={breakPaid} disabled={!!openBreak} onChange={(event) => setBreakPaid(event.target.checked)} /><span>이 시간도 유급으로 환산하기<br />실제 회사 규정에 맞춰 직접 선택해 주세요. 기본값은 무급입니다.</span></label>
          </div>
          <div className={styles.breakReceipt}>
            <span>{latestBreak ? `최근 ${breakLabels[latestBreak.kind]} 영수증 · ${latestBreak.paid ? "유급 환산" : "무급 기록"}` : "잠깐 쉬어 간 시간도 기록해요"}</span>
            <strong>{latestBreak ? `${won(receiptGross)}원` : "REST & RECHARGE"}</strong>
            <p>{latestBreak ? `${duration((latestBreak.endAt ?? now) - latestBreak.startAt)} 동안의 세전 환산액 · 전체 금액에 이미 반영됨` : "화장실·식사·스트레칭 후 복귀하면 시간과 유급 환산액을 보여 드려요."}</p>
          </div>
        </div>
      </section>

      <div aria-live="polite" aria-atomic="true">{error ? <p className={`${styles.notice} ${styles.error}`}><AlertCircle size={16} />{error}</p> : message ? <p className={styles.message}>{message}</p> : null}</div>

      <div className={styles.bottomGrid}>
        <section className={styles.panel} aria-labelledby="goal-title">
          <div className={styles.featureIcon}><Coffee size={20} /></div><h2 id="goal-title" className={styles.panelTitle}>오늘의 작은 목표</h2>
          <p className={styles.sectionSubtitle}>공제 후 환산액으로 커피 한 잔까지.</p>
          <div className={styles.goalChoices}><button type="button" aria-pressed={goalAmount === "5000"} onClick={() => setGoalAmount("5000")}>커피 5천원</button><button type="button" aria-pressed={goalAmount === "12000"} onClick={() => setGoalAmount("12000")}>점심 1만2천원</button></div>
          <label className={styles.field} htmlFor="work-goal">내 목표 금액 (원)<input id="work-goal" className={styles.input} type="number" min="1" max="999999999" value={goalAmount} onChange={(event) => setGoalAmount(event.target.value)} /></label>
          <div className={styles.progress} role="progressbar" aria-label="오늘 목표 달성률" aria-valuenow={Math.floor(goalProgress)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${goalProgress}%` }} /></div>
          <p className={styles.muted}>{!validGoal ? "목표 금액을 1원 이상 입력해 주세요." : goalProgress >= 100 ? "목표 달성! 오늘의 시간을 잘 쌓고 있어요." : `${won(Math.max(0, goal - todayTotals.net))}원 남았어요 · ${Math.floor(goalProgress)}% 달성`}</p>
        </section>

        <section className={styles.panel} aria-labelledby="focus-title">
          <div className={styles.featureIcon}><Timer size={20} /></div><h2 id="focus-title" className={styles.panelTitle}>25분, 한 가지에 집중</h2>
          <p className={styles.sectionSubtitle}>할 일 하나를 끝낸 뒤 가볍게 몸을 풀어요.</p>
          <div className={styles.focusClock} aria-live="off">{String(Math.floor(focusRemaining / 60_000)).padStart(2, "0")}<span>:</span>{String(Math.floor(focusRemaining / 1000) % 60).padStart(2, "0")}</div>
          <div className={styles.buttonRow}><button type="button" className={`${styles.button} ${styles.primary}`} disabled={!ready} onClick={() => setFocusEndAt(Date.now() + 25 * 60_000)}><Play size={14} /> {focusEndAt === null ? "집중 시작" : "다시 25분"}</button>{focusEndAt !== null && <button type="button" className={styles.iconButton} aria-label="집중 타이머 초기화" onClick={() => setFocusEndAt(null)}><RotateCcw size={15} /></button>}</div>
          <p className={styles.sectionSubtitle}>{focusEndAt !== null && focusRemaining === 0 ? "집중 완료. 어깨를 펴고 잠깐 쉬어 가세요." : "근무 기록과 독립적인 타이머예요. 창을 닫으면 초기화됩니다."}</p>
        </section>

        <section className={styles.panel} aria-labelledby="weekly-title">
          <div className={styles.featureIcon}><Wallet size={20} /></div><h2 id="weekly-title" className={styles.panelTitle}>주휴수당 따로 확인</h2>
          <p className={styles.sectionSubtitle}>요건을 확인한 한 주의 참고 금액입니다.</p>
          <div className={styles.featureValue}>{weekly.eligible && weeklyRateKnown ? `${won(weekly.amount)}원` : "요건 확인 필요"}</div>
          <p className={styles.muted}>오늘·월 누적에 더하지 않아요. 월급·연봉에 이미 포함될 수 있습니다.</p>
          <details className={styles.weeklyDetails}><summary>통상시급과 해당 주 요건 입력</summary><div className={styles.weeklyFields}>
            <label className={styles.field} htmlFor="weekly-hourly">통상시급 (원)<input id="weekly-hourly" className={styles.input} type="number" min="0" max="1000000000" placeholder={rates.ordinaryHourlyEstimate === null ? "직접 입력해 주세요" : String(Math.round(rates.ordinaryHourlyEstimate))} value={weeklyHourly} onChange={(event) => setWeeklyHourly(event.target.value)} /></label>
            <p className={styles.muted}>{rates.ordinaryHourlyEstimate === null ? "현재 근무 형태는 자동 통상시급 추정을 지원하지 않습니다." : `미입력 시 ${won(rates.ordinaryHourlyEstimate)}원 사용${profile.basis === "hourly" ? " (입력 시급)" : " (월급 ÷ 209시간, 전액 통상임금 가정)"}`}</p>
            <label className={styles.field} htmlFor="weekly-hours">4주 평균 주 소정근로 (시간)<input id="weekly-hours" className={styles.input} type="number" min="0" max="40" step="0.5" value={weeklyHours} onChange={(event) => setWeeklyHours(event.target.value)} /></label>
            <label className={styles.checkbox}><input type="checkbox" checked={attendance} onChange={(event) => setAttendance(event.target.checked)} />해당 주 소정근로일을 개근했어요</label>
            <label className={styles.checkbox}><input type="checkbox" checked={employment} onChange={(event) => setEmployment(event.target.checked)} />주휴일까지 근로관계가 유지돼요</label>
            <p className={styles.muted}>{weeklyRateKnown ? weekly.reason : "통상시급을 입력해야 계산할 수 있습니다."}</p>
          </div></details>
        </section>
      </div>

      <HolidayPayEstimate ordinaryHourlyDefault={rates.ordinaryHourlyEstimate} />

      <section className={styles.panel} aria-labelledby="history-title">
        <div className={styles.historyHeader}><div><h2 id="history-title" className={styles.panelTitle}><CalendarDays size={19} /> 차곡차곡, 나의 근무 달력</h2><p className={styles.sectionSubtitle}>기록한 시간만 합산합니다. 월급 전체, 주휴·연장·휴일 가산수당은 자동으로 더하지 않아요.</p></div><label className={styles.field} htmlFor="history-month">조회 월 (한국시간)<input id="history-month" className={`${styles.input} ${styles.monthInput}`} type="month" min="2000-01" max="2099-12" value={month} onChange={(event) => { if (/^(20\d{2})-(0[1-9]|1[0-2])$/.test(event.target.value)) setMonth(event.target.value); }} /></label></div>
        <dl className={styles.monthTotals} aria-live="off"><div><dt>이 달 세전 환산</dt><dd>{won(monthTotals.gross)}원</dd></div><div><dt>예상 공제 후</dt><dd>{won(monthTotals.net)}원</dd></div><div><dt>유급 기록</dt><dd>{duration(monthTotals.paidMs)}</dd></div></dl>
        <div className={styles.chart} role="img" aria-label={`${month || "조회 월"} 일별 세전 환산액 막대그래프. 정확한 금액은 아래 기록에서 확인할 수 있습니다.`}>{chartDays.map((day) => <div key={day.at} className={styles.chartDay} title={`${getKstDayKey(day.at)}: ${won(day.gross)}원`}><span className={`${styles.chartBar} ${getKstDayKey(day.at) === getKstDayKey(now) ? styles.chartBarToday : ""}`} style={{ height: `${Math.max(3, day.gross / chartMax * 100)}%` }} /></div>)}</div>
        <div className={styles.chartLabels}><span>1일</span><span>일별 기록 · 1분마다 반영</span><span>{chartDays.length}일</span></div>
        {monthSessions.length === 0 ? <div className={styles.empty}><Flag size={23} className="mx-auto mb-2" /><p>아직 이 달에 기록한 근무가 없어요.<br />오늘 출근을 시작하거나 지난 근무를 추가해 보세요.</p></div> : <div className={styles.historyList}>{monthSessions.map((session) => {
          const total = calculateSession(session, now, monthRange);
          return <div key={session.id} className={styles.historyRow}><div><strong>{dateText(session.startAt)}{session.endAt === null ? " · 진행 중" : ""}</strong><p>{timeText(session.startAt)} → {session.endAt !== null ? `${getKstDayKey(session.startAt) !== getKstDayKey(session.endAt) ? `${getKstDayKey(session.endAt).slice(5)} ` : ""}${timeText(session.endAt)}` : "근무 중"} · 유급 {duration(total.paidMs)}</p></div><div className={styles.historyAmount}><strong>{won(total.net)}원</strong><p>세전 {won(total.gross)}원 · 공제 {session.profile.deductionPercent}%</p></div><button type="button" className={styles.iconButton} aria-label={`${dateText(session.startAt)} ${timeText(session.startAt)} 근무 삭제`} onClick={() => setDeleteId(session.id)}><Trash2 size={14} /></button></div>;
        })}</div>}
        {deleteId && <div className={styles.confirmation} role="group" aria-label="근무 삭제 확인"><p>선택한 근무와 휴게 기록을 삭제할까요?</p><div className={styles.buttonRow}><button type="button" className={`${styles.button} ${styles.danger}`} onClick={() => removeSession(deleteId)}>이 기록 삭제</button><button type="button" className={styles.button} onClick={() => setDeleteId(null)}>취소</button></div></div>}
        <p className={styles.sectionSubtitle}>자정을 넘긴 근무는 각 날짜·월에 해당하는 시간만 나눠 합산해요. 기록별 금액은 조회 월에 해당하는 부분입니다.</p>

        <details className={styles.manualDetails}><summary>+ 지난 근무 직접 추가하기</summary><form className={styles.manualForm} onSubmit={addManualShift}>
          <p className={styles.muted}>현재 적용된 급여 설정을 사용합니다. 출퇴근과 무급 휴게의 실제 일시를 입력하세요. 한 근무는 최대 24시간입니다.</p>
          <div className={styles.fields}><label className={styles.field} htmlFor="manual-start">출근 일시<input id="manual-start" className={styles.input} type="datetime-local" required value={manualStart} onChange={(event) => setManualStart(event.target.value)} /></label><label className={styles.field} htmlFor="manual-end">퇴근 일시<input id="manual-end" className={styles.input} type="datetime-local" required value={manualEnd} onChange={(event) => setManualEnd(event.target.value)} /></label><label className={styles.field} htmlFor="manual-pause-minutes">무급 휴게 (분, 없으면 0)<input id="manual-pause-minutes" className={styles.input} type="number" min="0" max="1439" required value={manualPauseMinutes} onChange={(event) => setManualPauseMinutes(event.target.value)} /></label><label className={styles.field} htmlFor="manual-pause-start">무급 휴게 시작 일시<input id="manual-pause-start" className={styles.input} type="datetime-local" disabled={Number(manualPauseMinutes) === 0} required={Number(manualPauseMinutes) > 0} value={manualPauseAt} onChange={(event) => setManualPauseAt(event.target.value)} /></label></div>
          <div className={styles.buttonRow}><button type="submit" data-work-clock-action disabled={!!active || !ready} className={`${styles.button} ${styles.primary}`}><Check size={16} /> 지난 근무 추가</button>{active && <span className={styles.muted}>진행 중인 근무를 먼저 마쳐 주세요.</span>}</div>
        </form></details>
      </section>

      <div className={styles.storage}><div className={styles.storageInfo}><label className={styles.checkbox}><input type="checkbox" checked={saveEnabled} onChange={(event) => toggleStorage(event.target.checked)} /><span><strong>이 브라우저에 급여와 근무 기록 저장하기</strong> (선택)</span></label><p>기본은 저장 안 함 · 입력값은 서버에 전송하지 않아요. 저장하면 최대 500개 기록을 이 기기에 보관합니다. 공용 기기에서는 저장을 끄세요.</p></div><button type="button" className={styles.textButton} onClick={() => setClearConfirmation(true)}><Trash2 size={14} /> 설정·기록 모두 삭제</button></div>
      {storageError && <p className={`${styles.notice} ${styles.error}`} role="alert"><LockKeyhole size={16} />{storageError}</p>}
      {clearConfirmation && <div className={styles.confirmation} role="group" aria-label="모든 기록 삭제 확인"><p>급여 설정, 근무 기록, 목표를 삭제하고 브라우저 저장을 끕니다.</p><div className={styles.buttonRow}><button type="button" className={`${styles.button} ${styles.danger}`} onClick={clearAll}>모두 삭제</button><button type="button" className={styles.button} onClick={() => setClearConfirmation(false)}>취소</button></div></div>}
      {undo && <div className={styles.buttonRow}><button type="button" className={styles.button} onClick={restoreDeleted}><RotateCcw size={15} /> 마지막 삭제 실행 취소</button><span className={styles.muted}>다음 급여·근무 변경 또는 탭 종료 전까지 복원할 수 있어요.</span></div>}
      <p className={styles.muted}><ShieldCheck size={14} className="mr-1 inline" /> 개인용 환산 도구이며 회사의 근태·급여 증빙이 아닙니다. 휴게 유급 여부와 실제 수당은 근로계약 및 급여명세서를 확인하세요.</p>
    </div>
  );
}
