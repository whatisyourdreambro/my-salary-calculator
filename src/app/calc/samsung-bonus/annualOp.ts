// 삼성전자 연간 영업이익 잠정실적 — 1월 8일 전후 발표 트리거 상수 (2026-09-21 S2-0, 10배 계획 L13b).
// 발표 전에는 announced=false·전 필드 null 강제(추정치 금지). 발표 D0 에 4필드를 한 번에 채우면
// page.tsx 히어로 기존 문장이 잠정실적 문장으로 치환되고, Client 영업이익 기본값(350)이
// 잠정치로 바뀐다. 새 UI 요소를 추가하지 않는다(광고 위 높이 불변 규칙).

export const ANNUAL_OP_2026_PRELIM: {
  /** 잠정실적 발표 확인 여부 */
  announced: boolean;
  /** 연간 영업이익 잠정치 — 조원 (예: 350). 발표 전 null */
  profitTrillion: number | null;
  /** 발표일 YYYY-MM-DD — 발표 전 null */
  date: string | null;
  /** 출처(공시·보도 URL) — 발표 전 null */
  source: string | null;
} = { announced: false, profitTrillion: null, date: null, source: null };

/** 발표 전 계산기 기본 영업이익(조) — 히어로·FAQ의 "350조 가정"과 동일 값 */
export const DEFAULT_PROFIT_TRILLION = 350;

/** 계산기 초기 영업이익(조) — 잠정실적 발표 후에는 잠정치, 그 전에는 350 */
export function initialProfitTrillion(): number {
  const p = ANNUAL_OP_2026_PRELIM;
  return p.announced && p.profitTrillion != null && p.profitTrillion > 0
    ? p.profitTrillion
    : DEFAULT_PROFIT_TRILLION;
}
