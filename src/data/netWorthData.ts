// src/data/netWorthData.ts
//
// 가구주 연령대별 "평균 순자산" — 통계청 2024년 가계금융복지조사 결과 (2024.3.31 기준).
// 출처: 통계청·한국은행·금융감독원 공동 「2024년 가계금융복지조사 결과」(2024.12 발표)
//   - 정책브리핑: https://www.korea.kr/briefing/policyBriefingView.do?newsId=156664637
//   - 한국은행 보도자료: https://www.bok.or.kr/portal/bbs/B0000501/view.do?nttId=10088484
// 순자산 = 자산 − 부채. 개인이 아닌 "가구(가구주 연령)" 기준 평균값.
//
// ⚠️ 정확성 메모: 2025년 조사 수치는 발표 매체별로 상충하는 인용이 많아
//   (틀린 정보 방지) 단일 공식 출처에서 일관되게 확인된 2024년 확정치를 사용한다.
//   갱신 시 반드시 통계청 원자료로 교차 검증할 것.

export interface NetWorthBracket {
  /** 매칭 키 */
  key: string;
  /** 표시 라벨 */
  label: string;
  /** 평균 순자산 (만원) */
  avgManwon: number;
}

// 단위: 만원
export const NET_WORTH_BY_AGE: NetWorthBracket[] = [
  { key: "under40", label: "39세 이하", avgManwon: 22158 },
  { key: "40s", label: "40대", avgManwon: 45064 },
  { key: "50s", label: "50대", avgManwon: 51131 },
  { key: "60plus", label: "60세 이상", avgManwon: 51922 },
];

export const NET_WORTH_SURVEY_LABEL = "통계청 2024년 가계금융복지조사 (가구 기준)";

// salaryRankData.ts의 세분 연령대 키 → 순자산 연령 브래킷 매핑.
// 순자산 조사는 4개 구간(39세이하/40대/50대/60세이상)으로만 공표되므로
// 20·30대는 모두 "39세 이하" 구간에 매핑한다.
const AGE_GROUP_TO_BRACKET: Record<string, string> = {
  "20s_early": "under40",
  "20s_late": "under40",
  "30s_early": "under40",
  "30s_late": "under40",
  "40s_early": "40s",
  "40s_late": "40s",
  "50s": "50s",
  // 하위 호환 키
  "20s": "under40",
  "30s": "under40",
  "40s": "40s",
};

/** 세분 연령대 키로 해당 순자산 브래킷을 반환 (없으면 null). */
export function netWorthForAgeGroup(ageGroupKey: string): NetWorthBracket | null {
  const bracketKey = AGE_GROUP_TO_BRACKET[ageGroupKey];
  if (!bracketKey) return null;
  return NET_WORTH_BY_AGE.find((b) => b.key === bracketKey) ?? null;
}
