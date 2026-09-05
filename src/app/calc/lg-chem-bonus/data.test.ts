// 데이터 모듈 동결값 회귀 테스트 (2026-09-05, 10배 계획 L13b ① — 7종 계산기 Client 인라인 상수 → data.ts 분리)
//
// 기대값은 분리 직전 Client.tsx 인라인 리터럴을 그대로 복사한 "동결 스냅샷"이다.
// 새 지급률 보도로 data.ts 를 갱신할 때는 이 파일의 동결값도 같은 커밋에서 갱신한다
// (bonusData.ts 프로필·verify-bonus-data.mjs 와 3중 정합). jsdom 없음 — 순수 데이터만 검증.
import { describe, expect, it } from "vitest";
import { DEFAULT_BASIC_MANWON, PI_FIXED_PERCENT, PS_SCENARIOS } from "./data";

describe("lg-chem-bonus/data 동결값", () => {
  it("PS_SCENARIOS — 2026-09-05 Client.tsx 인라인 리터럴과 동일", () => {
    expect(PS_SCENARIOS).toEqual([
      { id: "deficit", label: "적자 (0%)", percent: 0, hint: "다운사이클 2024" },
      { id: "minimum", label: "최소 (100%)", percent: 100, hint: "회복기 시작" },
      { id: "normal", label: "평년 (400%)", percent: 400, hint: "안정 흑자" },
      { id: "specialty", label: "첨단소재 (600%)", percent: 600, hint: "2022 호황 평균" },
      { id: "petro", label: "석유화학 (850%)", percent: 850, hint: "2022 슈퍼사이클 최대" },
    ]);
  });
  it("PI 고정률·기본값", () => {
    expect(PI_FIXED_PERCENT).toBe(200);
    expect(DEFAULT_BASIC_MANWON).toBe(450);
  });
});
