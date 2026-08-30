// src/lib/annualLeave.ts
//
// 연차 발생 개수 계산 — /calc/annual-leave-days 전용 순수 함수 (의존성 0).
//
// 법적 근거 (전부 원문 확인 2026-08-30):
// - 근로기준법 제60조: 1년 미만 1개월 개근 시 1일(최대 11일) / 1년 80% 이상 출근 15일 /
//   3년 이상 최초 1년 초과 매 2년당 +1일, 총 25일 한도.
// - 대법원 2021다227100(2021-10-14) + 고용부 행정해석 변경(2021-12-16): 연차는
//   "1년간 근로를 마친 다음 날" 발생 — 만 365일 근무 후 퇴직 시 15일 미발생(11일만).
// - 회계연도 부여: 고용부 행정해석 근기 68207-620(2003-05-23) — 입사 다음 해 1/1에
//   비례연차 = 15 × (입사~12/31 재직일수 ÷ 365). 퇴직 시 입사일 기준 미달분 정산.
//   소수점 처리는 법정 규정 없음(근로자 불리 금지 — 올림/그대로 부여 관행).

export interface LeaveGrant {
  /** 발생일 (YYYY-MM-DD) — 이날 재직해야 발생 */
  grantDate: string;
  /** 발생 일수 (비례연차는 소수 2자리) */
  days: number;
  label: string;
  note?: string;
}

/** 만 근속연수(1년 이상) 기준 연차: 15 + floor((years-1)/2), 상한 25 */
export function statutoryLeaveDays(fullYears: number): number {
  if (fullYears < 1) return 0;
  return Math.min(25, 15 + Math.floor((fullYears - 1) / 2));
}

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toISO(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function addMonths(d: Date, months: number): Date {
  const r = new Date(d.getFullYear(), d.getMonth() + months, d.getDate());
  // 말일 보정 (1/31 + 1개월 → 2/28)
  if (r.getDate() !== d.getDate()) return new Date(r.getFullYear(), r.getMonth(), 0);
  return r;
}

function addYears(d: Date, years: number): Date {
  const r = new Date(d.getFullYear() + years, d.getMonth(), d.getDate());
  if (r.getDate() !== d.getDate()) return new Date(r.getFullYear(), r.getMonth(), 0);
  return r;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/**
 * 입사일 기준 발생 스케줄 — 입사일부터 기준일(포함)까지 발생한 연차.
 * 발생일에 재직 중이어야 함(기준일 = 마지막 재직일로 해석).
 */
export function entryBasedSchedule(entryISO: string, untilISO: string): LeaveGrant[] {
  const entry = parseISO(entryISO);
  const until = parseISO(untilISO);
  if (until < entry) return [];
  const grants: LeaveGrant[] = [];

  // 1년 미만 월차 — k개월 개근 시 1일 (발생일 = 입사 + k개월, 최대 11)
  for (let k = 1; k <= 11; k++) {
    const g = addMonths(entry, k);
    if (g > until) break;
    grants.push({
      grantDate: toISO(g),
      days: 1,
      label: `${k}개월 개근`,
      note: k === 1 ? "1년 미만 월 단위 연차 (최대 11일, 개근 시)" : undefined,
    });
  }

  // 1년 이상 — 만 N년 되는 날의 다음 날(= N주년 당일부터 재직 필요) 발생
  for (let n = 1; ; n++) {
    const g = addYears(entry, n);
    if (g > until) break;
    grants.push({
      grantDate: toISO(g),
      days: statutoryLeaveDays(n),
      label: `만 ${n}년`,
      note: n === 1 ? "만 1년 다음 날 재직해야 발생 (대법 2021다227100)" : undefined,
    });
  }
  return grants;
}

/**
 * 회계연도(1/1) 기준 발생 스케줄.
 * - 입사연도: 월차 동일 발생.
 * - 다음 해 1/1: 비례연차 = 15 × (입사~12/31 재직일수 ÷ 365), 소수 2자리.
 *   (남은 월차도 입사 1년까지 병행 발생)
 * - 이후 매년 1/1: 부여 시점의 만 근속연수 기준 15 + 가산.
 */
export function fiscalYearSchedule(entryISO: string, untilISO: string): LeaveGrant[] {
  const entry = parseISO(entryISO);
  const until = parseISO(untilISO);
  if (until < entry) return [];
  const grants: LeaveGrant[] = [];

  // 월차 (입사 1년까지 — 입사일 기준과 동일)
  for (let k = 1; k <= 11; k++) {
    const g = addMonths(entry, k);
    if (g > until) break;
    grants.push({ grantDate: toISO(g), days: 1, label: `${k}개월 개근` });
  }

  // 입사 다음 해 1/1 — 비례연차
  const firstJan = new Date(entry.getFullYear() + 1, 0, 1);
  if (firstJan <= until) {
    const served = daysBetween(entry, new Date(entry.getFullYear() + 1, 0, 1));
    const prorated = Math.round((15 * served) / 365 * 100) / 100;
    grants.push({
      grantDate: toISO(firstJan),
      days: prorated,
      label: "비례연차",
      note: `15 × (재직 ${served}일 ÷ 365) — 소수점은 회사 규정(올림 관행)`,
    });
  }

  // 이후 매년 1/1 — 만 근속연수 기준
  for (let y = entry.getFullYear() + 2; ; y++) {
    const g = new Date(y, 0, 1);
    if (g > until) break;
    // 부여일까지의 만 근속연수
    let fullYears = 0;
    while (addYears(entry, fullYears + 1) <= g) fullYears++;
    grants.push({
      grantDate: toISO(g),
      days: statutoryLeaveDays(Math.max(1, fullYears)),
      label: `${y}년 부여`,
    });
  }
  return grants;
}

/** 스케줄 합계 (표시용) */
export function totalDays(grants: LeaveGrant[]): number {
  return Math.round(grants.reduce((s, g) => s + g.days, 0) * 100) / 100;
}
