// src/data/reportsRegistry.ts
//
// /insights 데이터 리포트 발행 목록의 단일 소스.
// sitemap·/insights 인덱스·크로스링크가 이 목록을 소비한다.
// 리포트는 분기 1회 개별 제작물(대량 자동생성 금지 원칙) — 페이지 자체는
// src/app/insights/<slug>/page.tsx 에 개별 폴더 라우트로 만들고, 여기에는
// 메타만 등재한다. 슬러그는 ASCII 필수 (한글 슬러그 프리렌더는 CF Pages 404).

import {
  entryReportCompanyCount,
  entryReportIndustryCount,
} from "@/lib/salary-data/entrySalaryReport";
import { dartReportStats } from "@/lib/salary-data/dartReport";
import { BONUS_PROFILES } from "@/data/bonusData";

// 성과급 리포트(serp 전략 2호 과제) 카운트 — bonusData 단일 소스에서 파생 (하드코딩 금지 원칙)
const bonusCompanyCount = new Set(BONUS_PROFILES.map((p) => p.calcSlug)).size;
const bonusPayoutCount = BONUS_PROFILES.reduce((s, p) => s + p.payouts.length, 0);

export interface ReportMeta {
  /** ASCII URL 슬러그 — /insights/<slug> */
  slug: string;
  title: string;
  description: string;
  /** ISO YYYY-MM-DD */
  publishedDate: string;
  /** ISO YYYY-MM-DD — 데이터 갱신 시 함께 갱신 (sitemap lastModified로 사용) */
  updatedDate: string;
  keywords: string[];
}

export const reportsRegistry: ReportMeta[] = [
  {
    slug: "bonus-payout-history-2026",
    // 회사·건수는 bonusData 단일 소스에서 파생 — 하드코딩 금지
    title: `2026 대기업 성과급 실지급률 총정리 — ${bonusCompanyCount}개사 ${bonusPayoutCount}건 전수`,
    description: `삼성전자 TAI·OPI, SK하이닉스 PS, 현대차 임단협 성과급 등 국내 대기업 ${bonusCompanyCount}개사의 실제 성과급 지급률 ${bonusPayoutCount}건을 보도·공시 교차 확인으로 집계. 월 기본급 대비·연봉 대비·정액 세 기준을 분리해 왜곡 없이 비교. 출처 표기 시 자유 인용.`,
    publishedDate: "2026-08-23",
    updatedDate: "2026-09-03",
    keywords: [
      "성과급 지급률",
      "대기업 성과급",
      "삼성전자 성과급",
      "SK하이닉스 PS",
      "OPI 지급률",
      "성과급 순위",
      "머니샐러리 데이터 리포트",
    ],
  },
  {
    slug: "listed-avg-salary-top100-2026",
    // 회사 수는 dartReport 집계 단일 소스에서 파생 — 하드코딩 금지
    title: `${dartReportStats.rankYear} 공시 기준 평균연봉 TOP 100 — 상장사 ${dartReportStats.companyCount.toLocaleString("ko-KR")}곳 전수 분석`,
    description: `머니샐러리가 금융감독원 전자공시(DART) 사업보고서 '직원 등의 현황'을 전수 수집해 집계한 ${dartReportStats.rankYear}년 평균연봉 순위. 급여총액÷인원 가중 평균, 추정치 0. 출처 표기 시 자유 인용.`,
    publishedDate: "2026-08-23",
    updatedDate: "2026-08-23",
    keywords: [
      "상장사 평균연봉",
      "평균연봉 순위",
      "연봉 높은 회사",
      "대기업 평균연봉",
      "공시 연봉",
      "사업보고서 평균연봉",
      "머니샐러리 데이터 리포트",
    ],
  },
  {
    slug: "entry-salary-by-industry-2026",
    // 회사·업종 수는 집계 단일 소스에서 파생 — 하드코딩 시 본문과 불일치 사고
    title: `2026 업종별 신입 초봉 순위 — ${entryReportCompanyCount}개사 데이터 분석`,
    description: `머니샐러리가 국내 ${entryReportCompanyCount}개사 연봉 데이터를 ${entryReportIndustryCount}개 업종으로 집계한 2026 신입 초봉(기본급+평균 인센티브) 순위 리포트. 업종별 평균·중앙값·초봉 1위 기업, 공시·정부 통계 교차 검증까지 한눈에. 출처 표기 시 자유 인용.`,
    publishedDate: "2026-08-17",
    updatedDate: "2026-08-25",
    keywords: [
      "업종별 초봉",
      "업종별 연봉 순위",
      "신입 초봉 순위",
      "2026 초봉",
      "업종별 신입 연봉",
      "머니샐러리 데이터 리포트",
    ],
  },
];

export function getReportBySlug(slug: string): ReportMeta | undefined {
  return reportsRegistry.find((r) => r.slug === slug);
}
