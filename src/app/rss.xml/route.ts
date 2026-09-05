// src/app/rss.xml/route.ts

import { NextResponse } from "next/server";
// koGuides만 발행 — guides(전체)를 쓰면 en 가이드 13편이 같은 /guides/{slug} URL·guid로
// 이중 발행되어 RSS guid 중복이 생김 (2026-08-08 URL 전수 감사에서 실측)
import { koGuides } from "@/lib/guidesContent";
// /insights 데이터 리포트 3편 합류 (2026-09-05) — guid는 /insights/<slug> 라 /guides 와 충돌 없음.
// pubDate=updatedDate(갱신 시 피드 상단 재노출). 10/5 서치어드바이저 rss.xml 제출 전 선행.
import { reportsRegistry } from "@/data/reportsRegistry";

const REPORT_CATEGORY = "데이터 리포트";

/** 가이드·리포트 공통 피드 항목 */
interface FeedItem {
 title: string;
 url: string;
 description: string;
 /** ISO YYYY-MM-DD */
 date: string;
 categories: string[];
}

const escapeXml = (unsafe: string) => {
 return unsafe.replace(/[<>&'"]/g, (c) => {
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
};

/** 가이드 + 리포트를 날짜 내림차순으로 병합 (guid 중복 없음 — 경로 prefix 상이) */
function buildFeedItems(baseUrl: string): FeedItem[] {
 const guideItems: FeedItem[] = koGuides.map((guide) => ({
 title: guide.title,
 url: `${baseUrl}/guides/${guide.slug}`,
 description: guide.description,
 date: guide.publishedDate,
 categories: [
 ...(guide.category ? [guide.category] : []),
 ...(guide.tags ?? []).slice(0, 5),
 ],
 }));
 const reportItems: FeedItem[] = reportsRegistry.map((report) => ({
 title: report.title,
 url: `${baseUrl}/insights/${report.slug}`,
 description: report.description,
 date: report.updatedDate,
 categories: [REPORT_CATEGORY, ...report.keywords.slice(0, 4)],
 }));
 return [...guideItems, ...reportItems].sort(
 (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
 );
}

function generateRssFeed() {
 const baseUrl = "https://www.moneysalary.com";
 const siteTitle = "머니샐러리 금융 가이드";
 const feedDescription =
 "2026년 최신 세법 기준 연봉·세금·재테크 가이드. 직장인의 돈 공부, 머니샐러리에서 시작하세요.";
 const lastBuildDate = new Date().toUTCString();

 // 정렬 첫 항목 = 가이드 최신 발행일·리포트 최신 갱신일 중 max → 채널 pubDate
 const items = buildFeedItems(baseUrl);

 const latestPubDate = items[0]
 ? new Date(items[0].date).toUTCString()
 : lastBuildDate;

 let rss = `<?xml version="1.0" encoding="UTF-8" ?>`;
 rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">`;
 rss += `<channel>`;
 rss += `<title>${escapeXml(siteTitle)}</title>`;
 rss += `<link>${baseUrl}</link>`;
 rss += `<description>${escapeXml(feedDescription)}</description>`;
 rss += `<language>ko-KR</language>`;
 rss += `<copyright>© ${new Date().getFullYear()} 머니샐러리</copyright>`;
 rss += `<lastBuildDate>${lastBuildDate}</lastBuildDate>`;
 rss += `<pubDate>${latestPubDate}</pubDate>`;
 rss += `<ttl>60</ttl>`;
 rss += `<atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />`;
 rss += `<image>`;
 rss += `<url>${baseUrl}/logo-full.png</url>`;
 rss += `<title>${escapeXml(siteTitle)}</title>`;
 rss += `<link>${baseUrl}</link>`;
 rss += `</image>`;

 items.forEach((item) => {
 const pubDate = new Date(item.date).toUTCString();

 rss += `<item>`;
 rss += `<title>${escapeXml(item.title)}</title>`;
 rss += `<link>${item.url}</link>`;
 rss += `<description>${escapeXml(item.description)}</description>`;
 rss += `<pubDate>${pubDate}</pubDate>`;
 rss += `<guid isPermaLink="true">${item.url}</guid>`;
 rss += `<dc:creator>머니샐러리</dc:creator>`;
 item.categories.forEach((category) => {
 rss += `<category>${escapeXml(category)}</category>`;
 });
 rss += `</item>`;
 });

 rss += `</channel>`;
 rss += `</rss>`;

 return rss;
}

export async function GET() {
 const feed = generateRssFeed();
 return new NextResponse(feed, {
 headers: {
 "Content-Type": "application/xml; charset=utf-8",
 "Cache-Control": "public, max-age=3600, s-maxage=3600",
 },
 });
}
