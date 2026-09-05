// src/app/calc/samsung-sdi-bonus/data.ts
//
// 삼성SDI 성과급 계산기 데이터 모듈 — Client.tsx 에 인라인이던 상수를 분리한
// 순수 데이터 소스(sk-hynix-bonus/psData.ts 와 같은 패턴). 2026-09-05 10배 계획 L13b ①.
// 값·주석은 Client.tsx 원본 그대로 옮겼다(동작 무변경). 수치 출처는 page.tsx 푸터의
// 출처 표기와 src/data/bonusData.ts(calcSlug "samsung-sdi-bonus") 프로필을 따른다.
//
// 갱신 규칙: 새 지급률 보도 시 여기만 고치고, ① 같은 폴더 data.test.ts 의 동결값
// ② bonusData.ts 프로필 ③ page.tsx 출처 문구를 함께 갱신한 뒤
// `node scripts/verify-bonus-data.mjs`(Client.tsx + data.ts 합산 스캔) 로 정합 확인.

export const SCENARIOS = [
  { id: "chasm", label: "캐즘 (0%)", percent: 0, hint: "2026 배터리·본사" },
  { id: "electromat", label: "전자재료 (5%)", percent: 5, hint: "2026 폴더블 OLED" },
  { id: "recovery", label: "회복기 (18%)", percent: 18, hint: "2024 전자재료" },
  { id: "normal", label: "평년 (28%)", percent: 28, hint: "2024 본사" },
  { id: "boom", label: "호황 (48%)", percent: 48, hint: "전기차 슈퍼사이클" },
] as const;

export const DEFAULT_SALARY_MANWON = 8000;
export const BASIC_RATIO = 20; // 기본급 = 연봉 / 20
export const TAI_HALF = 1.0; // 반기당 월 기본급 100%
export const TAI_PER_YEAR = 2; // 연 2회
