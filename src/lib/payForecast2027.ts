// src/lib/payForecast2027.ts
//
// 2027 교사·경찰·소방 봉급 '대표 호봉' 비교 행 — /teacher-pay-2027·/police-pay-2027·/firefighter-pay-2027 공용
// (수익 추천 #3, 2026-09-25 준비). 기준 봉급은 payTablesFull2026.ts(원문 파싱).
//   - 확정 전(PAY_FULL_2027 = null): 2027 값 = forecast2027() — /civil-servant-pay-2027 과 같은
//     2026 확정 봉급 × (1 + 예산안 3.9%), 천원 단위 반올림.
//   - 확정 후(PAY_FULL_2027 입력): 2027 값 = 확정 봉급표의 같은 칸. 행(호봉·계급)은 그대로.
//
// ★ 2027 전체 '예상' 호봉표는 만들지 않는다 — 저연차 추가 인상·국회 심의 조정 전이라 오정보가 된다(추천 #2 원칙).
//   확정 전에는 대표 호봉 몇 줄만, 페이지에서 '단순 예상치·확정 전'으로 표기한다.
// ★ 12월 말 2027 봉급표 공표 시: payTablesFull2027.ts 의 PAY_FULL_2027 에 원문 숫자만 넣는다 — 이 파일과
//   페이지는 고치지 않는다(비교 행·문구·풀표·Dataset 이 그 값으로 바뀐다).

import { TEACHER_START_HOBONG, forecast2027 } from "@/lib/civilServantPay";
import {
  POLICE_FIRE_PAY_FULL_2026,
  POLICE_FIRE_RANKS_FULL,
  TEACHER_PAY_FULL_2026,
  payAt,
} from "@/lib/payTablesFull2026";
import type { PayFull2027 } from "@/lib/payTablesFull2027";

export type PayForecastRow = {
  /** 행 이름 — 교원 'N호봉', 경찰·소방 '계급 N호봉' */
  label: string;
  /** 참고 문구(연차 가정 등) — 없으면 빈 문자열 */
  note: string;
  base2026: number;
  /** 2027 월 봉급 — 확정 전에는 예상치(천원 반올림), 확정 후에는 확정 봉급표 금액 */
  pay2027: number;
  /** 월 봉급 증가액 (확정 전에는 예상) */
  monthlyIncrease: number;
};

function compareRow(label: string, note: string, base2026: number, confirmed2027: number | null): PayForecastRow {
  const pay2027 = confirmed2027 ?? forecast2027(base2026);
  return { label, note, base2026, pay2027, monthlyIncrease: pay2027 - base2026 };
}

/** 신규 교사 통상 시작 호봉(4년제 교대·사범대, 2급 정교사) — teacher-pay-2026 과 같은 기준 */
const TEACHER_START = TEACHER_START_HOBONG;

/** 교원 대표 호봉 — 시작(9)·약 5년 단위·최고(40) */
export const TEACHER_FORECAST_STEPS: ReadonlyArray<number> = [9, 14, 18, 23, 28, 33, 40];

export function teacherForecastRows(confirmed: PayFull2027 | null = null): PayForecastRow[] {
  return TEACHER_FORECAST_STEPS.map((hobong) => {
    const row = TEACHER_PAY_FULL_2026.find(([h]) => h === hobong);
    if (!row) throw new Error(`[payForecast2027] 교원 ${hobong}호봉 기준 봉급이 없습니다`);
    const note =
      hobong === TEACHER_START
        ? "신규 교사 통상 시작"
        : hobong === 40
          ? "최고 호봉"
          : `약 ${hobong - TEACHER_START + 1}년 차`;
    let confirmed2027: number | null = null;
    if (confirmed) {
      const next = confirmed.teacher.find(([h]) => h === hobong);
      if (!next) throw new Error(`[payForecast2027] 2027 확정 교원 ${hobong}호봉 봉급이 없습니다`);
      confirmed2027 = next[1];
    }
    return compareRow(`${hobong}호봉`, note, row[1], confirmed2027);
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

export function policeFireForecastRows(
  variant: "police" | "fire",
  confirmed: PayFull2027 | null = null
): PayForecastRow[] {
  return POLICE_FIRE_FORECAST_POINTS.map(([rank, hobong], i) => {
    const labels = POLICE_FIRE_RANKS_FULL[rank];
    if (!labels) throw new Error(`[payForecast2027] 계급 인덱스 ${rank} 가 없습니다`);
    const name = variant === "police" ? labels.police : labels.fire;
    const base2026 = payAt(POLICE_FIRE_PAY_FULL_2026, hobong, rank + 1);
    const confirmed2027 = confirmed ? payAt(confirmed.policeFire, hobong, rank + 1) : null;
    return compareRow(`${name} ${hobong}호봉`, i === 0 ? "신임(경력 가산 전)" : "", base2026, confirmed2027);
  });
}
