// src/app/calc/posco-bonus/data.ts
//
// 포스코 성과급 계산기 데이터 모듈 — Client.tsx 에 인라인이던 상수를 분리한
// 순수 데이터 소스(sk-hynix-bonus/psData.ts 와 같은 패턴). 2026-09-05 10배 계획 L13b ①.
// 값·주석은 Client.tsx 원본 그대로 옮겼다(동작 무변경). 수치 출처는 page.tsx 푸터의
// 출처 표기와 src/data/bonusData.ts(calcSlug "posco-bonus") 프로필을 따른다.
//
// 갱신 규칙: 새 지급률 보도 시 여기만 고치고, ① 같은 폴더 data.test.ts 의 동결값
// ② bonusData.ts 프로필 ③ page.tsx 출처 문구를 함께 갱신한 뒤
// `node scripts/verify-bonus-data.mjs`(Client.tsx + data.ts 합산 스캔) 로 정합 확인.

export const SCENARIOS = [
  { id: "deficit", label: "적자기 (100%)", percent: 100, hint: "다운사이클·중국 덤핑" },
  { id: "normal", label: "평년 (400%)", percent: 400, hint: "철강 안정기" },
  { id: "boom", label: "호황 (800%)", percent: 800, hint: "직고용 발표 사례 (2025-04)" },
  { id: "super", label: "슈퍼사이클 (1,000%)", percent: 1000, hint: "2022 영업익 7조 수준" },
] as const;

export const DEFAULT_BASIC_MANWON = 450;
