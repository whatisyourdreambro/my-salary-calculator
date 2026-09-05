// 데이터 모듈 동결값 회귀 테스트 (2026-09-05, 10배 계획 L13b ① — 7종 계산기 Client 인라인 상수 → data.ts 분리)
//
// 기대값은 분리 직전 Client.tsx 인라인 리터럴을 그대로 복사한 "동결 스냅샷"이다.
// 새 지급률 보도로 data.ts 를 갱신할 때는 이 파일의 동결값도 같은 커밋에서 갱신한다
// (bonusData.ts 프로필·verify-bonus-data.mjs 와 3중 정합). jsdom 없음 — 순수 데이터만 검증.
import { describe, expect, it } from "vitest";
import {
  DEFAULT_KAKAO_STOCK,
  DEFAULT_RSU_SHARES,
  DEFAULT_SALARY_MANWON,
  ENCOURAGEMENT_BONUS,
  PI_SCENARIOS,
} from "./data";

describe("kakao-bonus/data 동결값", () => {
  it("PI_SCENARIOS — 2026-09-05 Client.tsx 인라인 리터럴과 동일", () => {
    expect(PI_SCENARIOS).toEqual([
      { value: 10, label: "10% (낮음)" },
      { value: 20, label: "20% (보통)" },
      { value: 30, label: "30% (높음)" },
      { value: 40, label: "40% (최상위)" },
    ]);
  });
  it("기본값·격려금", () => {
    expect(DEFAULT_SALARY_MANWON).toBe(9000);
    expect(DEFAULT_KAKAO_STOCK).toBe(50_000);
    expect(DEFAULT_RSU_SHARES).toBe(135);
    expect(ENCOURAGEMENT_BONUS).toBe(1_000_000);
  });
});
