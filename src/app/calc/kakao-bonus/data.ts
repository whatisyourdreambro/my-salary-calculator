// src/app/calc/kakao-bonus/data.ts
//
// 카카오 성과급 계산기 데이터 모듈 — Client.tsx 에 인라인이던 상수를 분리한
// 순수 데이터 소스(sk-hynix-bonus/psData.ts 와 같은 패턴). 2026-09-05 10배 계획 L13b ①.
// 값·주석은 Client.tsx 원본 그대로 옮겼다(동작 무변경). 수치 출처는 page.tsx 푸터의
// 출처 표기와 src/data/bonusData.ts(calcSlug "kakao-bonus") 프로필을 따른다.
//
// 갱신 규칙: 새 지급률 보도 시 여기만 고치고, ① 같은 폴더 data.test.ts 의 동결값
// ② bonusData.ts 프로필 ③ page.tsx 출처 문구를 함께 갱신한 뒤
// `node scripts/verify-bonus-data.mjs`(Client.tsx + data.ts 합산 스캔) 로 정합 확인.

export const PI_SCENARIOS = [
  { value: 10, label: "10% (낮음)" },
  { value: 20, label: "20% (보통)" },
  { value: 30, label: "30% (높음)" },
  { value: 40, label: "40% (최상위)" },
] as const;

export const DEFAULT_SALARY_MANWON = 9000;
export const DEFAULT_KAKAO_STOCK = 50_000;
export const DEFAULT_RSU_SHARES = 135; // 평균 1인당 670만원 / 5만 = 135주
export const ENCOURAGEMENT_BONUS = 1_000_000; // 2026 격려금 100만원
