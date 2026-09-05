// src/data/opiAnnouncement.ts
//
// 삼성전자 2026년 OPI(초과이익성과급) 발표 상태 — 단일 소스 (2026-09-05 L13b 선행분 ④).
// 홈 시즌 배너 1월 OPI 슬롯(src/lib/seasonalCalendar.ts, days 20~31)은
// getCurrentSeasonal(now, { opiAnnounced }) 인자로만 열린다 — 이 상수를 호출부에서 주입.
//
// ★ 발표 전 null 강제 — 추정 수치 기입 금지(brief §2-5 데이터 추정 금지).
//   발표 확인 후에만 announced=true·rate(대표 사업부 지급률 %)·date(YYYY-MM-DD)·
//   source(보도 URL)를 한 번에 채운다. 하나라도 비면 announced 를 true 로 바꾸지 말 것.
//   계산기 본문(src/app/calc/samsung-bonus/**)의 수치는 별도 슬롯(L13b ②, 9/21 이후)에서 갱신.

/** 2026년 OPI 발표 상태. 발표 전에는 모든 값이 null/false 이어야 한다. */
export const OPI_2026_ANNOUNCEMENT: {
  /** 발표 확인 여부 — true 일 때만 1월 홈 배너 OPI 슬롯이 열린다 */
  announced: boolean;
  /** 대표 지급률(%) — 발표 전 null. 추정값 금지 */
  rate: number | null;
  /** 발표일 YYYY-MM-DD — 발표 전 null */
  date: string | null;
  /** 출처(보도·공지 URL) — 발표 전 null */
  source: string | null;
} = { announced: false, rate: null, date: null, source: null };
