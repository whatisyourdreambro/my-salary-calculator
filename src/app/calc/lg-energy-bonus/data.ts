// src/app/calc/lg-energy-bonus/data.ts
//
// LG에너지솔루션 성과급 계산기 데이터 모듈 — Client.tsx 에 인라인이던 상수를 분리한
// 순수 데이터 소스(sk-hynix-bonus/psData.ts 와 같은 패턴). 2026-09-05 10배 계획 L13b ①.
// 값·주석은 Client.tsx 원본 그대로 옮겼다(동작 무변경). 수치 출처는 page.tsx 푸터의
// 출처 표기와 src/data/bonusData.ts(calcSlug "lg-energy-bonus") 프로필을 따른다.
//
// 갱신 규칙: 새 지급률 보도 시 여기만 고치고, ① 같은 폴더 data.test.ts 의 동결값
// ② bonusData.ts 프로필 ③ page.tsx 출처 문구를 함께 갱신한 뒤
// `node scripts/verify-bonus-data.mjs`(Client.tsx + data.ts 합산 스캔) 로 정합 확인.

// LG에너지솔루션 성과급 시나리오 (배터리 사이클 기반)
export const SCENARIOS = [
  { id: "deficit", label: "적자기 (50%)", percent: 50, hint: "2024년 실 지급" },
  { id: "current", label: "최근 (75%)", percent: 75, hint: "2025년 실 지급" },
  { id: "recovery", label: "회복기 (200%)", percent: 200, hint: "ESS 전환 가정" },
  { id: "normal", label: "평년 (400%)", percent: 400, hint: "안정 흑자" },
  { id: "boom", label: "호황 (900%)", percent: 900, hint: "2022년 폭증기" },
] as const;

export const DEFAULT_BASIC_MANWON = 450;
