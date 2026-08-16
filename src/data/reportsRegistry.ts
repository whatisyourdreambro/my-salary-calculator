// src/data/reportsRegistry.ts
//
// /insights 데이터 리포트 발행 목록의 단일 소스.
// sitemap·/insights 인덱스·크로스링크가 이 목록을 소비한다.
// 리포트는 분기 1회 개별 제작물(대량 자동생성 금지 원칙) — 페이지 자체는
// src/app/insights/<slug>/page.tsx 에 개별 폴더 라우트로 만들고, 여기에는
// 메타만 등재한다. 슬러그는 ASCII 필수 (한글 슬러그 프리렌더는 CF Pages 404).

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
    slug: "entry-salary-by-industry-2026",
    title: "2026 업종별 신입 초봉 순위 — 413개사 데이터 분석",
    description:
      "머니샐러리가 국내 413개사 연봉 데이터를 30개 업종으로 집계한 신입 초봉(기본급+평균 인센티브) 순위 리포트. 출처 표기 시 자유 인용.",
    publishedDate: "2026-08-17",
    updatedDate: "2026-08-17",
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
