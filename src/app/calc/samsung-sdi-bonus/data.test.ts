// 데이터 모듈 동결값 회귀 테스트 (2026-09-05, 10배 계획 L13b ① — 7종 계산기 Client 인라인 상수 → data.ts 분리)
//
// 기대값은 분리 직전 Client.tsx 인라인 리터럴을 그대로 복사한 "동결 스냅샷"이다.
// 새 지급률 보도로 data.ts 를 갱신할 때는 이 파일의 동결값도 같은 커밋에서 갱신한다
// (bonusData.ts 프로필·verify-bonus-data.mjs 와 3중 정합). jsdom 없음 — 순수 데이터만 검증.
import { describe, expect, it } from "vitest";
import {
  BASIC_RATIO,
  DEFAULT_SALARY_MANWON,
  SCENARIOS,
  TAI_HALF,
  TAI_PER_YEAR,
} from "./data";

describe("samsung-sdi-bonus/data 동결값", () => {
  it("SCENARIOS — 2026-09-05 Client.tsx 인라인 리터럴과 동일", () => {
    expect(SCENARIOS).toEqual([
      // 2026-11-18 R4(RL-16 CB-03, 10월 a61342085·119902bed): 2026년 1월 OPI 는 전 사업부 0%, 전자재료 한 자릿수는 2025년 초(2024 실적분) 지급분.
      // 전자재료 힌트는 10월 스윕에서 광고 이동이 없던 같은 폭 문구(2025 폴더블 OLED 는 675px 에서 칩 줄 수를 바꿨다).
      { id: "chasm", label: "캐즘 (0%)", percent: 0, hint: "2026 전 사업부" },
      { id: "electromat", label: "전자재료 (5%)", percent: 5, hint: "2025 OLED/IT소재" },
      { id: "recovery", label: "회복기 (18%)", percent: 18, hint: "2024 전자재료" },
      { id: "normal", label: "평년 (28%)", percent: 28, hint: "2024 본사" },
      { id: "boom", label: "호황 (48%)", percent: 48, hint: "전기차 슈퍼사이클" },
    ]);
  });
  it("기본값·TAI 상수", () => {
    expect(DEFAULT_SALARY_MANWON).toBe(8000);
    expect(BASIC_RATIO).toBe(20);
    expect(TAI_HALF).toBe(1.0);
    expect(TAI_PER_YEAR).toBe(2);
  });
});
