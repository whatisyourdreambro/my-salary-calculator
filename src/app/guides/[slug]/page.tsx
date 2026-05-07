
import { koGuides } from "@/lib/guidesData";
import { notFound } from "next/navigation";
import GuidePageClient from "./GuidePageClient";
import RelatedGuides from "@/components/RelatedGuides";
import { InArticleAd, HomeTopAd } from "@/components/AdPlacement";
import PartnerSlot from "@/components/PartnerSlot";
import CoupangBanner from "@/components/CoupangBanner";
import JsonLd from "@/components/JsonLd";
import { speakableLd } from "@/lib/structuredData";
import { getPartnerForGuideTags } from "@/lib/partnerConfig";
import { Metadata } from "next";

export const dynamic = 'force-static';

interface Props {
 params: { slug: string };
}

export async function generateStaticParams() {
 return koGuides.map((guide) => ({
 slug: guide.slug,
 }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const guide = koGuides.find((g) => g.slug === params.slug);
 if (!guide) return {};

 const koUrl = `https://www.moneysalary.com/guides/${guide.slug}`;
 const enUrl = `https://www.moneysalary.com/en/guides/${guide.slug}`;

 return {
 title: `${guide.title} | Moneysalary 금융 가이드`,
 description: guide.description,
 alternates: {
 canonical: koUrl,
 languages: {
 "ko-KR": koUrl,
 "en": enUrl,
 "x-default": koUrl,
 },
 },
 openGraph: {
 title: guide.title,
 description: guide.description,
 type: 'article',
 locale: 'ko_KR',
 url: koUrl,
 publishedTime: guide.publishedDate,
 authors: ['Moneysalary'],
 tags: guide.tags,
 },
 twitter: {
 card: 'summary_large_image',
 title: guide.title,
 description: guide.description,
 },
 };
}

export default function GuidePage({ params }: Props) {
 const guide = koGuides.find((g) => g.slug === params.slug);

 if (!guide) {
 notFound();
 }

 // Logic to find related guides: Same category, exclude current, top views (Korean only)
 const relatedGuides = koGuides
 .filter((g) => g.category === guide.category && g.slug !== guide.slug)
 .sort((a, b) => b.views - a.views)
 .slice(0, 3);

 if (relatedGuides.length < 3) {
 const others = koGuides
 .filter((g) => g.slug !== guide.slug && !relatedGuides.find(r => r.slug === g.slug))
 .sort((a, b) => b.views - a.views)
 .slice(0, 3 - relatedGuides.length);
 relatedGuides.push(...others);
 }

 const articleLd = {
 '@context': 'https://schema.org',
 '@type': 'Article',
 headline: guide.title,
 description: guide.description,
 inLanguage: 'ko-KR',
 author: {
 '@type': 'Organization',
 name: 'Moneysalary',
 },
 datePublished: guide.publishedDate,
 dateModified: guide.publishedDate,
 mainEntityOfPage: {
 '@type': 'WebPage',
 '@id': `https://www.moneysalary.com/guides/${guide.slug}`,
 },
 };

 // 카테고리/태그 기반 PartnerSlot 자동 매칭
 const partnerId =
 getPartnerForGuideTags([...(guide.tags ?? []), guide.category ?? ""]) ??
 "finda-loan-guide";

 return (
 <>
 <JsonLd
 data={[
 articleLd,
 speakableLd({
 url: `/guides/${guide.slug}`,
 cssSelectors: [".guide-tldr", ".faq-answer"],
 }),
 ]}
 />
 <GuidePageClient guide={guide} relatedGuides={relatedGuides} />

 {/* 가이드 본문 후속: 광고 + PartnerSlot + 관련 가이드 */}
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <InArticleAd />

 <PartnerSlot
 id={partnerId}
 fallback={
 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />
 }
 />

 <RelatedGuides
 currentSlug={guide.slug}
 category={guide.category}
 tags={guide.tags}
 limit={6}
 title="더 깊이 알아보고 싶다면"
 />

 <div className="my-8">
 <HomeTopAd />
 </div>
 </div>
 </>
 );
}
