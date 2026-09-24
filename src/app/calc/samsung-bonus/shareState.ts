// 삼성 성과급 계산기 공유 상태 URL 해시 — 순수 인코딩/디코딩 (2026-09-21 S2-0, CALC-06 흡수).
// 규격(10배·100배 계획): #d=사업부&s=연봉(원)&p=영업이익(조)&y=적용연도&o1=OPI1%&ac=추가 세액공제%&ins=4대보험(1/0)
// `?v=` 같은 쿼리 파라미터 신설 금지(캐시·색인 분기 방지) — 해시만 사용한다.
// 모든 값이 기본값이면 빈 문자열(해시 없음), 하나라도 다르면 7키 전부 기록(공유 링크 자기완결).
//
// 2026-09-25 A18: 소득세가 '산출세액 차이 × (1 − 세액공제 30%)' 가정에서 연말정산 구조의 실제
// 엔진 차이로 바뀌며 슬라이더 의미가 '추가 세액공제 가정(기본 0%)'이 됐다. 옛 링크의 cr(세액공제율,
// 기본 30)은 그대로 해석하면 추가 공제를 이중으로 빼므로 새 키 ac 를 쓰고, cr 은 하위호환으로만
// 읽는다: ac = max(0, cr − 30) — 옛 기본값 30 은 0(새 기본값)으로, 30 을 넘긴 몫만 추가 공제로 옮긴다.

export type SamsungShareState = {
  /** 사업부 id (memory/common/foundry) */
  d: string;
  /** 본인 연봉 (원) */
  s: number;
  /** 영업이익 (조원) */
  p: number;
  /** 적용 연도 */
  y: number;
  /** OPI1 지급률 (연봉 대비 %) */
  o1: number;
  /** 추가 세액공제 가정 (%) — 기본 0. 옛 링크의 cr 은 parseShareHash 가 변환 */
  ac: number;
  /** 4대보험 추가 부과 적용 */
  ins: boolean;
};

export const SHARE_HASH_KEYS = ["d", "s", "p", "y", "o1", "ac", "ins"] as const;

/** 2026-09-25 이전 링크의 cr(세액공제율) 기본값 — 새 ac 로 옮길 때 0 으로 보는 기준 */
export const LEGACY_CREDIT_RATE_DEFAULT = 30;

function num(v: string | null): number | null {
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * 해시 → 부분 상태. 앵커 해시('=' 없음)나 유효 키가 없으면 null.
 * 범위 밖 값은 키 단위로 버린다(나머지 키는 살림).
 */
export function parseShareHash(
  hash: string,
  opts: { divisionIds: readonly string[]; maxOpi1: number; maxCredit?: number }
): Partial<SamsungShareState> | null {
  const raw = (hash ?? "").replace(/^#/, "");
  if (!raw.includes("=")) return null;
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(raw);
  } catch {
    return null;
  }
  const out: Partial<SamsungShareState> = {};
  const d = params.get("d");
  if (d && opts.divisionIds.includes(d)) out.d = d;
  const s = num(params.get("s"));
  if (s !== null && Number.isInteger(s) && s >= 1 && s <= 9_999_999_999) out.s = s;
  const p = num(params.get("p"));
  if (p !== null && p >= 0 && p <= 10_000) out.p = Math.round(p * 10) / 10;
  const y = num(params.get("y"));
  if (y !== null && Number.isInteger(y) && y >= 2026 && y <= 2035) out.y = y;
  const o1 = num(params.get("o1"));
  if (o1 !== null && Number.isInteger(o1) && o1 >= 0 && o1 <= opts.maxOpi1) out.o1 = o1;
  const maxCredit = opts.maxCredit ?? 50;
  const validCredit = (v: number | null): v is number =>
    v !== null && Number.isInteger(v) && v >= 0 && v <= maxCredit;
  const ac = num(params.get("ac"));
  const cr = num(params.get("cr")); // 하위호환 — 2026-09-25 이전 링크
  if (validCredit(ac)) out.ac = ac;
  else if (validCredit(cr)) out.ac = Math.max(0, cr - LEGACY_CREDIT_RATE_DEFAULT);
  const ins = params.get("ins");
  if (ins === "1") out.ins = true;
  else if (ins === "0") out.ins = false;
  return Object.keys(out).length ? out : null;
}

/** 상태 → 해시. 기본값과 전부 같으면 "" (URL 깨끗하게 유지). */
export function buildShareHash(state: SamsungShareState, defaults: SamsungShareState): string {
  const same = SHARE_HASH_KEYS.every((k) => state[k] === defaults[k]);
  if (same) return "";
  const parts = [
    `d=${encodeURIComponent(state.d)}`,
    `s=${Math.round(state.s)}`,
    `p=${state.p}`,
    `y=${state.y}`,
    `o1=${state.o1}`,
    `ac=${state.ac}`,
    `ins=${state.ins ? 1 : 0}`,
  ];
  return `#${parts.join("&")}`;
}
