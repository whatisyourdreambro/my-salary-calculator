// src/app/rss.xml/route.ts

import { NextResponse } from "next/server";
// koGuides만 발행 — guides(전체)를 쓰면 en 가이드 13편이 같은 /guides/{slug} URL·guid로
// 이중 발행되어 RSS guid 중복이 생김 (2026-08-08 URL 전수 감사에서 실측)
import { koGuides } from "@/lib/guidesContent";
// /insights 데이터 리포트 3편 합류 (2026-09-05) — guid는 /insights/<slug> 라 /guides 와 충돌 없음.
// pubDate=updatedDate(갱신 시 피드 상단 재노출). 10/5 서치어드바이저 rss.xml 제출 전 선행.
import { reportsRegistry } from "@/data/reportsRegistry";
// 가이드 pubDate = 사이트맵 lastmod 와 같은 날짜(lens-crawl-F02·lens-meta-F01, 2026-11-13). 전문 = 본문 + 광고 아래 보강.
// 사이트맵 전용 날짜 표(guideSitemapDates.ts)의 행은 광고 아래 보강을 고친 날이거나, 화면 날짜를 올리지 못한 광고 위 같은 폭
// 정정을 한 날이다(2026-11-15 ads-01 — 그 파일 머리 주석).
import { getGuideSitemapDate } from "@/lib/guideSitemapDates";
import { guideSupplements } from "@/lib/guides/supplements";
import { contentEncoded, FULL_TEXT_GUIDE_COUNT } from "@/lib/rssFullText";

// Next 15 no longer caches GET handlers by default; keep this build-time feed static.
export const dynamic = "force-static";

const REPORT_CATEGORY = "데이터 리포트";
// 본문 전문(content:encoded)을 싣는 최신 가이드 수 (2026-09-26 NAVER-03b) — 네이버 요청 피드는 item 에
// 요약이 아닌 전문을 요구한다. 전 편(334편·본문 약 1.5MB)이 아니라 최신 FULL_TEXT_GUIDE_COUNT(30)편만
// 실어 피드를 가볍게 유지한다(50편은 약 0.77MB — 크기 거부 위험). 나머지 가이드·리포트 item 은 종전 그대로.

/** 가이드·리포트 공통 피드 항목 */
interface FeedItem {
 title: string;
 url: string;
 description: string;
 /** ISO YYYY-MM-DD */
 date: string;
 categories: string[];
 /** 본문 HTML — 최신 가이드 FULL_TEXT_GUIDE_COUNT 편만 */
 fullText?: string;
}

const byDateDesc = (a: FeedItem, b: FeedItem) =>
 new Date(b.date).getTime() - new Date(a.date).getTime();

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
 // 사이트맵 lastmod 와 같은 날짜(getGuideSitemapDate = 본문 정정일·광고 아래 보강일·화면 날짜를 올리지 못한 광고 위 정정일까지
 // 반영한 내용 수정일) 내림차순 —
 // sort 는 안정 정렬이라 같은 날짜는 koGuides 순서를 유지하고, 아래 병합 정렬 뒤에도 가이드끼리의 순서가 같다
 // (= 피드의 첫 FULL_TEXT_GUIDE_COUNT 개 가이드 item 이 전문 대상). 10/19 579d60bbf 가 상세 화면 날짜만 옮기고
 // 피드는 getGuideModifiedDate 에 남겨 둔 어긋남을 고쳤다(lens-crawl-F02).
 const guideItems: FeedItem[] = koGuides
 .map((guide) => ({
 title: guide.title,
 url: `${baseUrl}/guides/${guide.slug}`,
 // 검색 설명(metaDescription, META-07·lens-meta-F02)이 있으면 그것 — 상세 쪽 meta·OG description 과 같은 문장이다
 // (guides/[slug]/page.tsx). 화면 TL;DR(description)은 임협 타결 전 상태를 말하는 글이 있어, 사이트맵 날짜로
 // 피드 위로 올라올 때 옛 문구가 함께 올라오지 않게 한다(feeds-01, 2026-11-15).
 description: guide.metaDescription ?? guide.description,
 date: getGuideSitemapDate(guide),
 categories: [
 ...(guide.category ? [guide.category] : []),
 ...(guide.tags ?? []).slice(0, 5),
 ],
 // 상세 화면과 같은 이어 붙임(guides/[slug]/page.tsx) — 본문 + 마지막 광고 아래 보강
 fullText: guide.content + (guideSupplements[guide.slug] ?? ""),
 }))
 .sort(byDateDesc)
 .map((item, index) => (index < FULL_TEXT_GUIDE_COUNT ? item : { ...item, fullText: undefined }));
 const reportItems: FeedItem[] = reportsRegistry.map((report) => ({
 title: report.title,
 url: `${baseUrl}/insights/${report.slug}`,
 description: report.description,
 date: report.updatedDate,
 categories: [REPORT_CATEGORY, ...report.keywords.slice(0, 4)],
 }));
 return [...guideItems, ...reportItems].sort(byDateDesc);
}

function generateRssFeed() {
 const baseUrl = "https://www.moneysalary.com";
 const siteTitle = "머니샐러리 금융 가이드";
 const feedDescription =
 "연봉·세금·재테크 가이드. 적용 연도와 조건은 각 글에서 확인하세요. 직장인의 돈 공부, 머니샐러리에서 시작하세요.";
 const lastBuildDate = new Date().toUTCString();

 // 가이드도 실제 내용 수정일(사이트맵 lastmod 와 같은 날, 없으면 발행일)로 재노출. 원문 발행일과 guid는 보존한다.
 // 정렬 첫 항목 = 가이드·리포트 최신 갱신일 중 max → 채널 pubDate
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
 // 전문은 item 맨 끝 — 앞 요소(title·link·guid…)를 정규식으로 읽는 소비처가 본문 HTML 과 섞이지 않게
 if (item.fullText) rss += contentEncoded(item.fullText, item.url);
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
