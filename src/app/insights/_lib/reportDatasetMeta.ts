// src/app/insights/_lib/reportDatasetMeta.ts
//
// /insights 리포트 원본 데이터(CSV·JSON) 경로·인용 정책 URL의 가벼운 정본.
// ★클라이언트 컴포넌트(ReportDataLinks)도 import 하므로 여기에는 데이터 배열
//   (dartDisclosed·BONUS_PROFILES·companyRepository)을 절대 import 하지 않는다.
//   실제 행 직렬화는 reportDatasets.ts(서버 전용) 담당.
//
// 데이터 다운로드 라우트: /insights/<slug>/data.csv · /insights/<slug>/data.json
// (route.ts 3×2 — force-static 프리렌더, middleware matcher 제외 등재 2026-09-05)

const SITE_URL = "https://www.moneysalary.com";

/**
 * 데이터셋 license — 사이트 자체 인용 정책("출처 표기 시 자유 인용", /insights 인용 정책 섹션).
 * CC BY 등 외부 표준 라이선스 명시는 운영자 결정 항목이라 여기서 선언하지 않는다.
 */
export const CITATION_POLICY_PATH = "/insights#citation-policy";
export const CITATION_POLICY_URL = `${SITE_URL}${CITATION_POLICY_PATH}`;

/** DART 원문 — 리포트 3편 공통 1차 출처 (schema.org Dataset.citation 용) */
export const DART_CITATION = {
  name: "금융감독원 전자공시시스템(DART) 사업보고서 '직원 등의 현황'",
  url: "https://dart.fss.or.kr",
};

export interface ReportDatasetMeta {
  slug: string;
  /** 다운로드 링크 옆 짧은 라벨 (표 이름) */
  label: string;
  /** /embed#<anchor> — 이 데이터의 위젯 버전 (src/app/embed/widgets.ts anchor) */
  embedAnchor: string;
}

/** 데이터 다운로드를 제공하는 리포트 3편 (reportsRegistry 슬러그와 일치해야 함) */
export const REPORT_DATASETS: ReportDatasetMeta[] = [
  {
    slug: "listed-avg-salary-top100-2026",
    label: "공시 평균연봉 TOP 100 표",
    embedAnchor: "company",
  },
  {
    slug: "bonus-payout-history-2026",
    label: "성과급 실지급 내역 표",
    embedAnchor: "bonus",
  },
  {
    slug: "entry-salary-by-industry-2026",
    label: "업종별 신입 초봉 순위 표",
    embedAnchor: "salary",
  },
];

export function getReportDatasetMeta(slug: string): ReportDatasetMeta | undefined {
  return REPORT_DATASETS.find((d) => d.slug === slug);
}

/** 경로(상대) — 페이지 링크·JSON-LD contentUrl 공용 */
export function reportDataPaths(slug: string) {
  return {
    csv: `/insights/${slug}/data.csv`,
    json: `/insights/${slug}/data.json`,
  };
}

/** 절대 URL — JSON-LD DataDownload.contentUrl 용 */
export function reportDataUrls(slug: string) {
  const p = reportDataPaths(slug);
  return { csv: `${SITE_URL}${p.csv}`, json: `${SITE_URL}${p.json}` };
}

/** 연도 목록 → schema.org temporalCoverage (단일 "2025" 또는 ISO 8601 구간 "2023/2026") */
export function temporalCoverageOfYears(years: number[]): string {
  if (years.length === 0) return "";
  const min = Math.min(...years);
  const max = Math.max(...years);
  return min === max ? String(min) : `${min}/${max}`;
}
