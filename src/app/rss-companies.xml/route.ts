// src/app/rss-companies.xml/route.ts
//
// 회사 연봉 DB 전용 RSS — 네이버 서치어드바이저 수집 채널용 (2026-08-15 Phase 5).
// 가이드 피드(/rss.xml)와 분리: guid 축이 달라 중복 없음.
//
// 소스는 raw allCompanies 가 아닌 companyRepository.getAll() (2026-09-05 수정) — sitemap.ts 와 동일.
// raw 배열은 DART 공시 주입으로 승격된 lastUpdated(2026-08-23, 239곳)를 모르기 때문에
// 피드 pubDate 최신이 8/15 에 머물러 네이버 수집기가 갱신을 알 수 없었다(라이브 실측).
//
// 2026-09-25 B7(SEO-CRAWL-03) — 정본 회사 전체 수록 + sitemap 과 같은 수정일:
//  - 종전 `.slice(0, 200)` 은 8/23 동률 200여 곳을 id 알파벳순으로 자른 결과(abl-bio…semes)라
//    삼성전자·SK하이닉스·현대차 등 네이버 상위 회사가 피드에 없었다 → 전체 수록(약 430곳).
//  - pubDate = companyPageModified(src/lib/pageModified.ts) — sitemap lastmod 와 같은 함수라
//    두 신호가 다시 어긋나지 않는다. 날짜를 새로 올리지 않는다(데이터일·FAQ 검수일의 최댓값 —
//    2026-10-01 KST 이후 빌드부터는 L10' 공시 평균 description 대상 회사만 그 적용일도 포함).
//  - 정렬 = 페이지 수정일 내림차순 + id 오름차순(코드 유닛 비교 — 로캘 무관, 배포마다 순서 고정.
//    순서가 흔들리면 수집기가 '변경'으로 오인).
//  - item title·description = 회사 페이지 <title>·meta description 문자열 그대로
//    (src/lib/companyPageMetadata.ts — page.tsx generateMetadata 와 같은 입력). 회사 <title> 불변.
//  - 정적 프리렌더 유지(요청 객체·동적 API 미사용) — Worker CPU 를 쓰지 않는다.

import { NextResponse } from "next/server";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { companyCountPlus } from "@/config/site";
import { companyPageModified } from "@/lib/pageModified";
import { companyPageTitleAndDescription } from "@/lib/companyPageMetadata";

const escapeXml = (unsafe: string) =>
  unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });

function generateFeed() {
  const baseUrl = "https://www.moneysalary.com";
  const title = "머니샐러리 회사별 연봉 DB";
  const description =
    `삼성전자, SK하이닉스, 네이버, 카카오 등 한국 기업 ${companyCountPlus}곳의 직급별 연봉·복지·워라밸 데이터. 갱신순 피드.`;

  const companies = companyRepository
    .getAll()
    .map((company) => ({ company, modified: companyPageModified(company) }))
    .sort(
      (a, b) =>
        b.modified.getTime() - a.modified.getTime() ||
        (a.company.id < b.company.id ? -1 : a.company.id > b.company.id ? 1 : 0)
    );

  const lastBuildDate = new Date().toUTCString();
  // 채널 pubDate = 첫 item(가장 최근 페이지 수정일) — rss.xml 과 같은 규칙
  const latestPubDate = companies[0]
    ? companies[0].modified.toUTCString()
    : lastBuildDate;
  let rss = `<?xml version="1.0" encoding="UTF-8" ?>`;
  rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">`;
  rss += `<channel>`;
  rss += `<title>${escapeXml(title)}</title>`;
  rss += `<link>${baseUrl}/salary-db</link>`;
  rss += `<description>${escapeXml(description)}</description>`;
  rss += `<language>ko-KR</language>`;
  rss += `<lastBuildDate>${lastBuildDate}</lastBuildDate>`;
  rss += `<pubDate>${latestPubDate}</pubDate>`;
  rss += `<ttl>1440</ttl>`;
  rss += `<atom:link href="${baseUrl}/rss-companies.xml" rel="self" type="application/rss+xml" />`;

  companies.forEach(({ company, modified }) => {
    const itemUrl = `${baseUrl}/salary-db/${company.id}`;
    const page = companyPageTitleAndDescription(company);
    rss += `<item>`;
    rss += `<title>${escapeXml(page.title)}</title>`;
    rss += `<link>${itemUrl}</link>`;
    rss += `<description>${escapeXml(page.description)}</description>`;
    rss += `<pubDate>${modified.toUTCString()}</pubDate>`;
    rss += `<guid isPermaLink="true">${itemUrl}</guid>`;
    rss += `<dc:creator>머니샐러리</dc:creator>`;
    rss += `</item>`;
  });

  rss += `</channel>`;
  rss += `</rss>`;
  return rss;
}

export async function GET() {
  return new NextResponse(generateFeed(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
