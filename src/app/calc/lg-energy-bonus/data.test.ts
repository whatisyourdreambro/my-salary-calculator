// 데이터 모듈 동결값 회귀 테스트 (2026-09-05, 10배 계획 L13b ① — 7종 계산기 Client 인라인 상수 → data.ts 분리)
//
// 기대값은 분리 직전 Client.tsx 인라인 리터럴을 그대로 복사한 "동결 스냅샷"이다.
// 새 지급률 보도로 data.ts 를 갱신할 때는 이 파일의 동결값도 같은 커밋에서 갱신한다
// (bonusData.ts 프로필·verify-bonus-data.mjs 와 3중 정합). jsdom 없음 — 순수 데이터만 검증.
import { describe, expect, it } from "vitest";
import { DEFAULT_BASIC_MANWON, SCENARIOS } from "./data";

describe("lg-energy-bonus/data 동결값", () => {
  it("SCENARIOS — 2026-09-05 Client.tsx 인라인 리터럴과 동일", () => {
    expect(SCENARIOS).toEqual([
      { id: "deficit", label: "적자기 (50%)", percent: 50, hint: "2024년 실 지급" },
      { id: "current", label: "최근 (75%)", percent: 75, hint: "2025년 실 지급" },
      { id: "recovery", label: "회복기 (200%)", percent: 200, hint: "ESS 전환 가정" },
      { id: "normal", label: "평년 (400%)", percent: 400, hint: "안정 흑자" },
      { id: "boom", label: "호황 (900%)", percent: 900, hint: "2022년 폭증기" },
    ]);
  });
  it("기본값", () => {
    expect(DEFAULT_BASIC_MANWON).toBe(450);
  });
});
