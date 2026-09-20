// 삼성전자 OPI(초과이익성과금) 실지급률 — 단일 소스 (2026-09-21 S2-0 배치, 10배 계획 L13b ②).
// page.tsx(FAQ·실지급률 표·분배 모델 설명)와 Client.tsx(OPI1 슬라이더 기본값·안내문),
// MultiYearBonusSimulator(기본값)가 이 파일만 읽는다. 순수 데이터 — React·Next 의존 없음.
//
// 갱신 절차(매년 1월 말 OPI 발표 D0): OPI_ACTUAL 에 새 연도 블록 추가 → OPI_LATEST 가
// 자동 파생 → src/data/opiAnnouncement.ts(홈 배너 게이트) 4필드 동시 기입 → vitest.
// 추정치 기입 금지 — 노조 공지·복수 보도로 확인된 값만.

/** OPI 지급률 상한 — 연봉 대비 % (회사 제도상 상한) */
export const OPI1_MAX_RATE = 50;

/** 실제 지급률 한 행 — 연봉 대비 % */
export type OpiActualRate = {
  id: string;
  /** 표시 명칭 (보도 표기 기준) */
  division: string;
  /** 연봉 대비 % */
  rate: number;
  /** 상위 그룹 강조 표시 */
  top: boolean;
};

export type OpiActualYear = {
  /** 실적 연도 (지급은 이듬해 1월 말) */
  fiscalYear: number;
  /** 지급일 YYYY-MM-DD */
  payDate: string;
  /** 지급일 표기 (본문용) */
  payDateLabel: string;
  /** 출처 요약 (본문 인용) */
  sourceNote: string;
  rates: OpiActualRate[];
};

/** 2025년 실적분 OPI — 2026-01-30 지급 (노조 공지 기반 복수 보도) */
export const OPI_ACTUAL_2025: OpiActualYear = {
  fiscalYear: 2025,
  payDate: "2026-01-30",
  payDateLabel: "2026년 1월 30일",
  sourceNote: "노조 공지 기반 보도",
  rates: [
    { id: "mx", division: "MX (스마트폰)", rate: 50, top: true },
    { id: "ds-common", division: "DS부문 공통", rate: 47, top: true },
    { id: "kr-sr-cdo", division: "한국총괄·SR·CDO", rate: 37, top: false },
    { id: "mfg-lab", division: "생산기술연구소", rate: 36, top: false },
    { id: "ehs", division: "EHS", rate: 34, top: false },
    {
      id: "biz-support",
      division: "경영지원·하만·상생협력·글로벌CS",
      rate: 39,
      top: false,
    },
    {
      id: "vd-da-nw-med",
      division: "VD·생활가전·네트워크·의료기기",
      rate: 12,
      top: false,
    },
    { id: "css", division: "CSS사업팀", rate: 11, top: false },
  ],
};

/** 연도별 실지급률 목록 — 최신 연도가 마지막. 새 발표는 여기에만 추가한다. */
export const OPI_ACTUAL: OpiActualYear[] = [OPI_ACTUAL_2025];

/** 가장 최근 실지급률 블록 (라벨·기본값 파생용) */
export const OPI_LATEST: OpiActualYear = OPI_ACTUAL[OPI_ACTUAL.length - 1];

/** 최신 실지급률 중 최고값 행 (계산기 기본값·본문 '최대' 표기용) */
export const OPI_LATEST_TOP: OpiActualRate = OPI_LATEST.rates.reduce((best, r) =>
  r.rate > best.rate ? r : best
);

/** 최신 실지급률 중 최저값 행 (본문 '최저' 표기용) */
export const OPI_LATEST_BOTTOM: OpiActualRate = OPI_LATEST.rates.reduce((worst, r) =>
  r.rate < worst.rate ? r : worst
);

/**
 * OPI1 계산기 기본값 — 최신 실지급률 최고값(2025년분 MX 50%)을 상한 안에서 사용.
 * 종전 shared.tsx `FIXED_OPI1_RATE = 50` 리터럴을 여기서 파생한다.
 */
export const OPI1_DEFAULT_RATE = Math.min(OPI1_MAX_RATE, OPI_LATEST_TOP.rate);

/** 본문 요약용 "MX 50%·DS부문 공통 47%·…" 문자열 (상위 n개) */
export function opiRateSummary(limit = OPI_LATEST.rates.length, year = OPI_LATEST) {
  return year.rates
    .slice(0, limit)
    .map((r) => `${r.division.replace(/\s*\(.*?\)/g, "")} ${r.rate}%`)
    .join("·");
}
