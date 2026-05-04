// src/app/rss.xml/route.ts

import { NextResponse } from "next/server";
import { guides } from "@/lib/guidesData";

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

function generateRssFeed() {
 const baseUrl = "https://www.moneysalary.com";
 const siteTitle = "머니샐러리 금융 가이드";
 const feedDescription =
 "2026년 최신 세법 기준 연봉·세금·재테크 가이드. 직장인의 돈 공부, 머니샐러리에서 시작하세요.";
 const lastBuildDate = new Date().toUTCString();

 const sortedGuides = [...guides].sort(
 (a, b) =>
 new Date(b.publishedDate).getTime() -
 new Date(a.publishedDate).getTime()
 );

 const latestPubDate = sortedGuides[0]
 ? new Date(sortedGuides[0].publishedDate).toUTCString()
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

 sortedGuides.forEach((guide) => {
 const itemUrl = `${baseUrl}/guides/${guide.slug}`;
 const pubDate = new Date(guide.publishedDate).toUTCString();

 rss += `<item>`;
 rss += `<title>${escapeXml(guide.title)}</title>`;
 rss += `<link>${itemUrl}</link>`;
 rss += `<description>${escapeXml(guide.description)}</description>`;
 rss += `<pubDate>${pubDate}</pubDate>`;
 rss += `<guid isPermaLink="true">${itemUrl}</guid>`;
 rss += `<dc:creator>머니샐러리</dc:creator>`;
 if (guide.category) {
 rss += `<category>${escapeXml(guide.category)}</category>`;
 }
 if (guide.tags && guide.tags.length > 0) {
 guide.tags.slice(0, 5).forEach((tag) => {
 rss += `<category>${escapeXml(tag)}</category>`;
 });
 }
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
