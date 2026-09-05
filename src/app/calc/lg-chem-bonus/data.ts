// src/app/calc/lg-chem-bonus/data.ts
//
// LG화학 성과급 계산기 데이터 모듈 — Client.tsx 에 인라인이던 상수를 분리한
// 순수 데이터 소스(sk-hynix-bonus/psData.ts 와 같은 패턴). 2026-09-05 10배 계획 L13b ①.
// 값·주석은 Client.tsx 원본 그대로 옮겼다(동작 무변경). 수치 출처는 page.tsx 푸터의
// 출처 표기와 src/data/bonusData.ts(calcSlug "lg-chem-bonus") 프로필을 따른다.
//
// 갱신 규칙: 새 지급률 보도 시 여기만 고치고, ① 같은 폴더 data.test.ts 의 동결값
// ② bonusData.ts 프로필 ③ page.tsx 출처 문구를 함께 갱신한 뒤
// `node scripts/verify-bonus-data.mjs`(Client.tsx + data.ts 합산 스캔) 로 정합 확인.

export const PS_SCENARIOS = [
  { id: "deficit", label: "적자 (0%)", percent: 0, hint: "다운사이클 2024" },
  { id: "minimum", label: "최소 (100%)", percent: 100, hint: "회복기 시작" },
  { id: "normal", label: "평년 (400%)", percent: 400, hint: "안정 흑자" },
  { id: "specialty", label: "첨단소재 (600%)", percent: 600, hint: "2022 호황 평균" },
  { id: "petro", label: "석유화학 (850%)", percent: 850, hint: "2022 슈퍼사이클 최대" },
] as const;

export const PI_FIXED_PERCENT = 200; // PI 연간 고정 200%
export const DEFAULT_BASIC_MANWON = 450;
