// src/lib/pageModified.ts
//
// 페이지 수정일(sitemap lastmod · RSS pubDate) 파생 규칙 단일 소스 (2026-09-25 B7, SEO-CRAWL-03).
//
// 배경: 회사 RSS(rss-companies.xml)는 pubDate 로 데이터 lastUpdated(2026-08-23)를 쓰고, sitemap 은
// max(lastUpdated, 회사 FAQ 검수일 9/10)를 써서 같은 URL 의 두 신선도 신호가 어긋나 있었다.
// 규칙을 여기 한 곳에 두고 sitemap.ts 와 rss-companies.xml/route.ts 가 같은 함수를 호출한다.
//
// ⚠️ 순수 함수만 — 회사 데이터·DART 배열 import 금지(호출부가 회사 객체를 넘긴다).
//    siteDates.ts 와 같이 가벼운 모듈로 유지해 어느 라우트에서 import 해도 번들이 불지 않게 한다.

import type { CompanyProfile } from "@/types/company";
import {
  COMPANY_FAQ_REVIEW_DATE,
  COMPANY_META_DISCLOSED_DATE,
  STATIC_LAST_MODIFIED,
} from "@/config/siteDates";
import {
  companyMetaDisclosedFigure,
  isCompanyMetaDisclosedLive,
} from "@/lib/companyMetaDisclosed";

/** L10' 대상 회사 페이지 수정일 — 다른 날짜 상수와 같은 표기("YYYY-MM-DD" → UTC 자정) */
const COMPANY_META_DISCLOSED_MODIFIED_MS = new Date(COMPANY_META_DISCLOSED_DATE).getTime();

/**
 * 회사 상세(/salary-db/[id]) 페이지 수정일 = max(회사 데이터 lastUpdated, COMPANY_FAQ_REVIEW_DATE,
 * L10' 적용일(대상 회사만)).
 * lastUpdated 가 없거나 날짜로 읽히지 않으면 데이터일은 STATIC_LAST_MODIFIED 로 본다.
 * Dataset·데이터 배지의 lastUpdated 는 원본 데이터 날짜 그대로 두고, 이 값은 "페이지"
 * 수정일(sitemap lastmod·RSS pubDate)에만 쓴다. 날짜를 새로 올리지 않는다 — 입력의 최댓값뿐.
 *
 * L10'(COMPANY_META_DISCLOSED_DATE = 2026-10-01 KST 이후 빌드): meta description 에 공시 평균연봉이 실린 회사
 * (companyMetaDisclosedFigure — seo.ts 와 같은 판정)만 COMPANY_META_DISCLOSED_DATE 를 max() 에 넣는다.
 * 그 전 빌드·비대상 회사는 종전 값 그대로. 이 승격이 sitemap lastmod 를 바꿔 postbuild IndexNow 가
 * 대상 URL 만 제출하고, rss-companies.xml 에서 대상 회사가 맨 앞으로 온다.
 * salary·disclosed 가 없는 부분 객체(테스트 등)는 대상이 아니다.
 */
export function companyPageModified(
  company: { lastUpdated?: string } & Partial<Pick<CompanyProfile, "salary" | "disclosed">>,
  now: Date = new Date()
): Date {
  const parsed = company.lastUpdated ? new Date(company.lastUpdated) : null;
  const dataModified =
    parsed && !Number.isNaN(parsed.getTime()) ? parsed : STATIC_LAST_MODIFIED;
  const metaModified =
    isCompanyMetaDisclosedLive(now) && companyMetaDisclosedFigure(company)
      ? COMPANY_META_DISCLOSED_MODIFIED_MS
      : Number.NEGATIVE_INFINITY;
  return new Date(
    Math.max(dataModified.getTime(), COMPANY_FAQ_REVIEW_DATE.getTime(), metaModified)
  );
}
