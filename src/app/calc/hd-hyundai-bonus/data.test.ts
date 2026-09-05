// 데이터 모듈 동결값 회귀 테스트 (2026-09-05, 10배 계획 L13b ① — 7종 계산기 Client 인라인 상수 → data.ts 분리)
//
// 기대값은 분리 직전 Client.tsx 인라인 리터럴을 그대로 복사한 "동결 스냅샷"이다.
// 새 지급률 보도로 data.ts 를 갱신할 때는 이 파일의 동결값도 같은 커밋에서 갱신한다
// (bonusData.ts 프로필·verify-bonus-data.mjs 와 3중 정합). jsdom 없음 — 순수 데이터만 검증.
import { describe, expect, it } from "vitest";
import { DEFAULT_BASIC_MANWON, SCENARIOS } from "./data";

describe("hd-hyundai-bonus/data 동결값", () => {
  it("SCENARIOS — 2026-09-05 Client.tsx 인라인 리터럴과 동일", () => {
    expect(SCENARIOS).toEqual([
      { id: "average", label: "평년 (400%)", percent: 400, hint: "사이클 평균" },
      { id: "current", label: "2025 연말 (600%)", percent: 600, hint: "통합 HD현대중공업" },
      { id: "samho", label: "HD현대삼호 (837%)", percent: 837, hint: "사업부별 차등" },
      { id: "union", label: "2026 노조 요구 (~1,400%)", percent: 1400, hint: "영업이익 30% 분배" },
    ]);
  });
  it("기본값", () => {
    expect(DEFAULT_BASIC_MANWON).toBe(450);
  });
});
