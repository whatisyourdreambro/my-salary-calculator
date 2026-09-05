// src/app/calc/hd-hyundai-bonus/data.ts
//
// HD현대중공업 성과급 계산기 데이터 모듈 — Client.tsx 에 인라인이던 상수를 분리한
// 순수 데이터 소스(sk-hynix-bonus/psData.ts 와 같은 패턴). 2026-09-05 10배 계획 L13b ①.
// 값·주석은 Client.tsx 원본 그대로 옮겼다(동작 무변경). 수치 출처는 page.tsx 푸터의
// 출처 표기와 src/data/bonusData.ts(calcSlug "hd-hyundai-bonus") 프로필을 따른다.
//
// 갱신 규칙: 새 지급률 보도 시 여기만 고치고, ① 같은 폴더 data.test.ts 의 동결값
// ② bonusData.ts 프로필 ③ page.tsx 출처 문구를 함께 갱신한 뒤
// `node scripts/verify-bonus-data.mjs`(Client.tsx + data.ts 합산 스캔) 로 정합 확인.

// HD현대중공업 시나리오
export const SCENARIOS = [
  { id: "average", label: "평년 (400%)", percent: 400, hint: "사이클 평균" },
  { id: "current", label: "2025 연말 (600%)", percent: 600, hint: "통합 HD현대중공업" },
  { id: "samho", label: "HD현대삼호 (837%)", percent: 837, hint: "사업부별 차등" },
  { id: "union", label: "2026 노조 요구 (~1,400%)", percent: 1400, hint: "영업이익 30% 분배" },
] as const;

export const DEFAULT_BASIC_MANWON = 450;
