// 데이터 모듈 동결값 회귀 테스트 (2026-09-05, 10배 계획 L13b ① — 7종 계산기 Client 인라인 상수 → data.ts 분리)
//
// 기대값은 분리 직전 Client.tsx 인라인 리터럴을 그대로 복사한 "동결 스냅샷"이다.
// 새 지급률 보도로 data.ts 를 갱신할 때는 이 파일의 동결값도 같은 커밋에서 갱신한다
// (bonusData.ts 프로필·verify-bonus-data.mjs 와 3중 정합). jsdom 없음 — 순수 데이터만 검증.
import { describe, expect, it } from "vitest";
import { DEFAULT_BASIC_MANWON, SCENARIOS } from "./data";

describe("posco-bonus/data 동결값", () => {
  it("SCENARIOS — 2026-09-05 Client.tsx 인라인 리터럴과 동일", () => {
    expect(SCENARIOS).toEqual([
      { id: "deficit", label: "적자기 (100%)", percent: 100, hint: "다운사이클·중국 덤핑" },
      { id: "normal", label: "평년 (400%)", percent: 400, hint: "철강 안정기" },
      { id: "boom", label: "호황 (800%)", percent: 800, hint: "직고용 발표 사례 (2025-04)" },
      { id: "super", label: "슈퍼사이클 (1,000%)", percent: 1000, hint: "2022 영업익 7조 수준" },
    ]);
  });
  it("기본값", () => {
    expect(DEFAULT_BASIC_MANWON).toBe(450);
  });
});
