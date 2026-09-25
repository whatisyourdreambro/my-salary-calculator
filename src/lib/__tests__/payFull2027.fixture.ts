// 테스트 전용 '가짜' 2027 확정 봉급표 — pay2027ConfirmedSlot.test.ts·payTablesFull2027.test.ts 공용.
// 실제 공표값이 아니다: 2026 원문 표에 1호봉 4.5%·그 밖 3.9%를 곱해 100원 단위로 반올림한 모양 검증용 숫자다.
// (1호봉만 다르게 올려 호봉별 인상률 범위 문구 'a~b%' 경로도 함께 시험한다.) 페이지·데이터 모듈에서 import 금지.
import type { PayFull2027 } from "@/lib/payTablesFull2027";
import {
  GENERAL_PAY_FULL_2026,
  POLICE_FIRE_PAY_FULL_2026,
  TEACHER_PAY_FULL_2026,
} from "@/lib/payTablesFull2026";

const up = (hobong: number, pay: number) => Math.round((pay * (hobong === 1 ? 1.045 : 1.039)) / 100) * 100;

const grid = (rows: ReadonlyArray<ReadonlyArray<number | null>>) =>
  rows.map(([hobong, ...pays]) => [
    hobong,
    ...pays.map((pay) => (typeof pay === "number" ? up(hobong as number, pay) : null)),
  ]);

export const FIXTURE_BASIS = "테스트용 12월 국무회의 의결, 2027년 1월 1일 적용";
export const FIXTURE_SOURCE = "https://www.mpm.go.kr/mpm/info/resultPay/bizSalary/2027/";
export const FIXTURE_CHECKED = "2026-12-31";

export function buildPayFull2027Fixture(): PayFull2027 {
  return {
    commonRate: 0.039,
    basis: FIXTURE_BASIS,
    sourceUrl: FIXTURE_SOURCE,
    checked: FIXTURE_CHECKED,
    teacher: TEACHER_PAY_FULL_2026.map(([hobong, pay]) => [hobong, up(hobong, pay)] as const),
    policeFire: grid(POLICE_FIRE_PAY_FULL_2026),
    general: grid(GENERAL_PAY_FULL_2026),
  };
}
