// src/app/rss-companies.xml/route.ts
//
// 회사 연봉 DB 전용 RSS — 네이버 서치어드바이저 수집 채널용 (2026-08-15 Phase 5).
// 가이드 피드(/rss.xml)와 분리: guid 축이 달라 중복 없음. lastUpdated 최신순 200개.

import { NextResponse } from "next/server";
import { allCompanies } from "@/data/companies";

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
    "삼성전자, SK하이닉스, 네이버, 카카오 등 한국 기업 430+곳의 직급별 연봉·복지·워라밸 데이터. 갱신순 피드.";

  const companies = [...allCompanies]
    .sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    )
    .slice(0, 200);

  const lastBuildDate = new Date().toUTCString();
  let rss = `<?xml version="1.0" encoding="UTF-8" ?>`;
  rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">`;
  rss += `<channel>`;
  rss += `<title>${escapeXml(title)}</title>`;
  rss += `<link>${baseUrl}/salary-db</link>`;
  rss += `<description>${escapeXml(description)}</description>`;
  rss += `<language>ko-KR</language>`;
  rss += `<lastBuildDate>${lastBuildDate}</lastBuildDate>`;
  rss += `<ttl>1440</ttl>`;
  rss += `<atom:link href="${baseUrl}/rss-companies.xml" rel="self" type="application/rss+xml" />`;

  companies.forEach((c) => {
    const itemUrl = `${baseUrl}/salary-db/${c.id}`;
    const entryTotal = Math.round(
      (c.salary.entry.base + (c.salary.entry.incentive.avgAmount || 0)) / 10000
    ).toLocaleString("ko-KR");
    rss += `<item>`;
    rss += `<title>${escapeXml(`${c.name.ko} 연봉 2026 — 신입 영끌 약 ${entryTotal}만원, 직급별 연봉표`)}</title>`;
    rss += `<link>${itemUrl}</link>`;
    rss += `<description>${escapeXml(
      `${c.name.ko}의 신입~임원 직급별 연봉, 인센티브 구조, 워라밸, 복지 데이터 (${c.lastUpdated} 갱신).`
    )}</description>`;
    rss += `<pubDate>${new Date(c.lastUpdated).toUTCString()}</pubDate>`;
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
