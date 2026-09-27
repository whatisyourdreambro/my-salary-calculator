// src/lib/bonusHome/marketSnapshotRules.ts
//
// src/data/marketSnapshot.json 의 모양·검증 규칙(순수 함수). 갱신 스크립트(scripts/fetch-market-snapshot.ts)와
// vitest(marketSnapshot.test.ts)가 같은 규칙을 쓴다. 스크립트가 tsx 로 읽으므로 '@/' 경로 별칭 없이 상대 경로만 쓴다.
// 런타임(Workers)에서는 네트워크를 쓰지 않는다 — 커밋된 JSON 이 유일한 런타임 소스다.

import { HOME_REGIONS } from "../../data/homePriceRegions";

export type SnapshotRegion = {
  clsId: number;
  fullName: string;
  /** 중위 매매가격(원) */
  median: number;
  /** 평균 매매가격(원) */
  mean: number;
};

export type MarketSnapshot = {
  schema: 1;
  /** 스냅숏을 받은 날(KST, YYYY-MM-DD) */
  fetchedAt: string;
  rone: {
    medianStatblId: string;
    meanStatblId: string;
    /** 기준월 YYYYMM */
    month: string;
    /** "2026년 8월" */
    monthLabel: string;
    source: string;
    sourceUrl: string;
    regions: Record<string, SnapshotRegion>;
    /** 참고 — 전국 중위가격(원) */
    nationalMedian: number;
  };
  ecos: {
    statCode: string;
    itemCode: string;
    /** 기준월 YYYYMM */
    month: string;
    monthLabel: string;
    /** 연리 % */
    ratePct: number;
    source: string;
    sourceUrl: string;
  };
};

/** 값 범위 가드(원) — 5천만 ~ 50억 */
export const PRICE_MIN = 50_000_000;
export const PRICE_MAX = 5_000_000_000;
/** 전월 대비 변동 허용폭(±15%) — 넘으면 --accept-jumps 없이는 쓰지 않는다 */
export const MAX_MONTHLY_JUMP = 0.15;
/** 주담대 금리 범위 가드(연 %) */
export const RATE_MIN = 0.5;
export const RATE_MAX = 15;

export const monthLabelOf = (yyyymm: string): string => `${yyyymm.slice(0, 4)}년 ${Number(yyyymm.slice(4, 6))}월`;

/** 기준월 후보 — 이번 달(KST) −1 ~ −3개월, 최신부터. 메타데이터의 DATA_END 는 믿지 않는다(2024로 남아 있음) */
export function monthCandidates(now: Date, back = 3): string[] {
  const kst = new Date(now.getTime() + 9 * 3600 * 1000);
  let y = kst.getUTCFullYear();
  let m = kst.getUTCMonth() + 1;
  const out: string[] = [];
  for (let i = 1; i <= back; i++) {
    m -= 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
    out.push(`${y}${String(m).padStart(2, "0")}`);
  }
  return out;
}

/** ECOS 조회 구간(최대 10개월 — 공개 sample 키 한도) */
export function ecosRange(now: Date): { from: string; to: string } {
  const months = monthCandidates(now, 10);
  return { from: months[months.length - 1], to: months[0] };
}

/**
 * 새 스냅숏 검증. 오류 목록이 비면 통과. prev 가 있으면 기준월이 다를 때 지역별 중위가 월 변동폭을 본다.
 */
export function validateSnapshot(next: MarketSnapshot, prev: MarketSnapshot | null, opts: { acceptJumps?: boolean } = {}): string[] {
  const errors: string[] = [];
  if (!/^\d{6}$/.test(next.rone.month)) errors.push(`R-ONE 기준월 형식 오류: ${next.rone.month}`);
  if (!/^\d{6}$/.test(next.ecos.month)) errors.push(`ECOS 기준월 형식 오류: ${next.ecos.month}`);
  for (const region of HOME_REGIONS) {
    const r = next.rone.regions[region.id];
    if (!r) {
      errors.push(`${region.label}: 값 없음`);
      continue;
    }
    if (r.clsId !== region.rOneClsId) errors.push(`${region.label}: CLS_ID ${r.clsId} ≠ ${region.rOneClsId}`);
    if (r.fullName !== region.rOneFullName) errors.push(`${region.label}: CLS_FULLNM '${r.fullName}' ≠ '${region.rOneFullName}'`);
    for (const [k, v] of [["중위", r.median], ["평균", r.mean]] as const) {
      if (!Number.isFinite(v) || v < PRICE_MIN || v > PRICE_MAX) errors.push(`${region.label} ${k} ${v} 범위(5천만~50억) 밖`);
    }
    const before = prev?.rone.regions[region.id];
    if (before && prev && prev.rone.month !== next.rone.month && !opts.acceptJumps) {
      const jump = Math.abs(r.median / before.median - 1);
      if (jump > MAX_MONTHLY_JUMP) {
        errors.push(`${region.label} 중위가 ${prev.rone.month}→${next.rone.month} ${(jump * 100).toFixed(1)}% 변동(±15% 초과) — 확인 후 --accept-jumps`);
      }
    }
  }
  const extra = Object.keys(next.rone.regions).filter((id) => !HOME_REGIONS.some((r) => r.id === id));
  if (extra.length) errors.push(`설정에 없는 지역: ${extra.join(", ")}`);
  if (!Number.isFinite(next.rone.nationalMedian) || next.rone.nationalMedian < PRICE_MIN || next.rone.nationalMedian > PRICE_MAX) {
    errors.push(`전국 중위가 ${next.rone.nationalMedian} 범위 밖`);
  }
  if (!Number.isFinite(next.ecos.ratePct) || next.ecos.ratePct < RATE_MIN || next.ecos.ratePct > RATE_MAX) {
    errors.push(`ECOS 주담대 금리 ${next.ecos.ratePct}% 범위(0.5~15) 밖`);
  }
  return errors;
}
