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

import { COMPANY_FAQ_REVIEW_DATE, STATIC_LAST_MODIFIED } from "@/config/siteDates";

/**
 * 회사 상세(/salary-db/[id]) 페이지 수정일 = max(회사 데이터 lastUpdated, COMPANY_FAQ_REVIEW_DATE).
 * lastUpdated 가 없거나 날짜로 읽히지 않으면 데이터일은 STATIC_LAST_MODIFIED 로 본다.
 * Dataset·데이터 배지의 lastUpdated 는 원본 데이터 날짜 그대로 두고, 이 값은 "페이지"
 * 수정일(sitemap lastmod·RSS pubDate)에만 쓴다. 날짜를 새로 올리지 않는다 — 두 입력의 최댓값뿐.
 */
export function companyPageModified(company: { lastUpdated?: string }): Date {
  const parsed = company.lastUpdated ? new Date(company.lastUpdated) : null;
  const dataModified =
    parsed && !Number.isNaN(parsed.getTime()) ? parsed : STATIC_LAST_MODIFIED;
  return new Date(Math.max(dataModified.getTime(), COMPANY_FAQ_REVIEW_DATE.getTime()));
}
