// src/lib/payForecast2027.ts
//
// 2027 교사·경찰·소방 봉급 '대표 호봉' 예상치 — /teacher-pay-2027·/police-pay-2027·/firefighter-pay-2027 공용
// (수익 추천 #3, 2026-09-25 준비). 계산은 /civil-servant-pay-2027 과 같은 forecast2027()
// (2026 확정 봉급 × (1 + 예산안 3.9%), 천원 단위 반올림)이고 기준 봉급은 payTablesFull2026.ts(원문 파싱).
//
// ★ 전체 2027 호봉표를 만들지 않는다 — 저연차 추가 인상·국회 심의 조정 전이라 오정보가 된다(추천 #2 원칙).
//   대표 호봉 몇 줄만, 페이지에서 '단순 예상치·확정 전'으로 표기한다.
// ★ 12월 말 2027 봉급표 공표 시: 이 파일 대신 공표 원문 2027 풀표로 페이지를 확정표 체제로 전환한다.

import { TEACHER_START_HOBONG, forecast2027 } from "@/lib/civilServantPay";
import {
  POLICE_FIRE_PAY_FULL_2026,
  POLICE_FIRE_RANKS_FULL,
  TEACHER_PAY_FULL_2026,
  payAt,
} from "@/lib/payTablesFull2026";

export type PayForecastRow = {
  /** 행 이름 — 교원 'N호봉', 경찰·소방 '계급 N호봉' */
  label: string;
  /** 참고 문구(연차 가정 등) — 없으면 빈 문자열 */
  note: string;
  base2026: number;
  predicted2027: number;
  /** 월 봉급 증가 예상액 (반올림 후 차이) */
  monthlyIncrease: number;
};

function forecastRow(label: string, note: string, base2026: number): PayForecastRow {
  const predicted2027 = forecast2027(base2026);
  return { label, note, base2026, predicted2027, monthlyIncrease: predicted2027 - base2026 };
}

/** 신규 교사 통상 시작 호봉(4년제 교대·사범대, 2급 정교사) — teacher-pay-2026 과 같은 기준 */
const TEACHER_START = TEACHER_START_HOBONG;

/** 교원 대표 호봉 — 시작(9)·약 5년 단위·최고(40) */
export const TEACHER_FORECAST_STEPS: ReadonlyArray<number> = [9, 14, 18, 23, 28, 33, 40];

export function teacherForecastRows(): PayForecastRow[] {
  return TEACHER_FORECAST_STEPS.map((hobong) => {
    const row = TEACHER_PAY_FULL_2026.find(([h]) => h === hobong);
    if (!row) throw new Error(`[payForecast2027] 교원 ${hobong}호봉 기준 봉급이 없습니다`);
    const note =
      hobong === TEACHER_START
        ? "신규 교사 통상 시작"
        : hobong === 40
          ? "최고 호봉"
          : `약 ${hobong - TEACHER_START + 1}년 차`;
    return forecastRow(`${hobong}호봉`, note, row[1]);
  });
}

/**
 * 경찰·소방 대표 지점 — [계급 인덱스(0 = 순경·소방사), 호봉]. 신임 → 승진 경로 예시.
 * 연차·승진 시점은 개인마다 달라 '예시'로만 쓴다.
 */
export const POLICE_FIRE_FORECAST_POINTS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [0, 5],
  [1, 5],
  [2, 10],
  [3, 15],
  [4, 20],
  [5, 25],
];

export function policeFireForecastRows(variant: "police" | "fire"): PayForecastRow[] {
  return POLICE_FIRE_FORECAST_POINTS.map(([rank, hobong], i) => {
    const labels = POLICE_FIRE_RANKS_FULL[rank];
    if (!labels) throw new Error(`[payForecast2027] 계급 인덱스 ${rank} 가 없습니다`);
    const name = variant === "police" ? labels.police : labels.fire;
    const base2026 = payAt(POLICE_FIRE_PAY_FULL_2026, hobong, rank + 1);
    return forecastRow(`${name} ${hobong}호봉`, i === 0 ? "신임(경력 가산 전)" : "", base2026);
  });
}
