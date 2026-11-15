// 삼성전자 연간 영업이익 잠정실적 — 1월 8일 전후 발표 트리거 상수 (2026-09-21 S2-0, 10배 계획 L13b).
// 발표 전에는 announced=false·전 필드 null 강제(추정치 금지). 잠정실적 D0 에 4필드(announced·profitTrillion·date·source)를
// 한 번에 채우면 page.tsx 히어로 기존 문장이 잠정실적 문장으로 치환된다. 새 UI 요소를 추가하지 않는다(광고 위 높이 불변 규칙).
//
// ★ 잠정실적은 전사 연결 합계만 나온다(부문별 실적 없음 — 2026-01-08 2025년 4분기 잠정실적 보도). DS부문 영업이익은
//   1월 말 확정실적(2026-01-29 발표 보도)에 처음 나온다. 계산기 입력 칸은 'DS부문 영업이익'(재원 = DS 영업이익 × 10.5%)이라
//   전사 잠정치를 그 칸에 넣지 않는다 — 기본값(350)은 dsProfitTrillion 이 채워진 뒤에만 바뀐다(2026-11-15 N2-calc-02, calc-03-F07).

export const ANNUAL_OP_2026_PRELIM: {
  /** 잠정실적 발표 확인 여부 */
  announced: boolean;
  /** 전사 연결 잠정 영업이익 — 조원 (예: 350). 히어로 문장 전용, 계산기 기본값에는 쓰지 않는다. 발표 전 null */
  profitTrillion: number | null;
  /** 잠정실적 발표일 YYYY-MM-DD — 발표 전 null */
  date: string | null;
  /** 잠정실적 출처(공시·보도 URL) — 발표 전 null */
  source: string | null;
  /** DS부문 연간 영업이익 — 조원. 1월 말 확정실적(뉴스룸·보도)에서만 채운다. 그 전에는 null */
  dsProfitTrillion: number | null;
} = { announced: false, profitTrillion: null, date: null, source: null, dsProfitTrillion: null };

/** 발표 전 계산기 기본 영업이익(조) — 히어로·FAQ의 "350조 가정"과 동일 값 */
export const DEFAULT_PROFIT_TRILLION = 350;

/** 계산기 'DS부문 영업이익' 기본값(조) — DS부문 확정치가 있을 때만 그 값, 아니면 350. 전사 잠정치는 쓰지 않는다 */
export function defaultProfitFrom(op: Pick<typeof ANNUAL_OP_2026_PRELIM, "announced" | "dsProfitTrillion">): number {
  return op.announced && op.dsProfitTrillion != null && op.dsProfitTrillion > 0
    ? op.dsProfitTrillion
    : DEFAULT_PROFIT_TRILLION;
}

/** 계산기 초기 영업이익(조) — DS부문 확정치 반영 후에는 그 값, 그 전에는 350 */
export function initialProfitTrillion(): number {
  return defaultProfitFrom(ANNUAL_OP_2026_PRELIM);
}
