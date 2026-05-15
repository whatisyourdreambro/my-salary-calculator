
import { koGuides } from "@/lib/guidesData";
import { notFound } from "next/navigation";
import GuidePageClient from "./GuidePageClient";
import RelatedGuides from "@/components/RelatedGuides";
import GuideRelatedCalcs from "@/components/GuideRelatedCalcs";
import { InArticleAd, HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import JsonLd from "@/components/JsonLd";
import { speakableLd, articleLd, autoBreadcrumbLd } from "@/lib/structuredData";
import { buildGuideMetadata } from "@/lib/seo";
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

 // 표준 헬퍼로 키워드·robots·동적 OG 이미지·Article 타입을 일관 적용.
 const base = buildGuideMetadata({
 slug: guide.slug,
 title: guide.title,
 description: guide.description,
 publishedDate: guide.publishedDate,
 tags: guide.tags,
 });

 // 가이드는 한·영 버전이 있어 hreflang 대체 링크를 추가 병합.
 const koUrl = `https://www.moneysalary.com/guides/${guide.slug}`;
 const enUrl = `https://www.moneysalary.com/en/guides/${guide.slug}`;

 return {
 ...base,
 alternates: {
 ...base.alternates,
 languages: {
 "ko-KR": koUrl,
 "en": enUrl,
 "x-default": koUrl,
 },
 },
 };
}

export default function GuidePage({ params }: Props) {
 const guide = koGuides.find((g) => g.slug === params.slug);

 if (!guide) {
 notFound();
 }

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

 const articleSchema = articleLd({
 title: guide.title,
 description: guide.description,
 slug: guide.slug,
 publishedDate: guide.publishedDate,
 modifiedDate: guide.publishedDate,
 });

 const breadcrumbSchema = autoBreadcrumbLd(`/guides/${guide.slug}`, {
 leafName: guide.title,
 });

 return (
 <>
 <JsonLd
 data={[
 articleSchema,
 breadcrumbSchema,
 speakableLd({
 url: `/guides/${guide.slug}`,
 cssSelectors: [".guide-tldr", ".faq-answer"],
 }),
 ]}
 />
 <GuidePageClient guide={guide} relatedGuides={relatedGuides} />

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <InArticleAd />

 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />

 <RelatedGuides
 currentSlug={guide.slug}
 category={guide.category}
 tags={guide.tags}
 limit={6}
 title="더 깊이 알아보고 싶다면"
 />

 <GuideRelatedCalcs guideSlug={guide.slug} />

 <div className="my-8">
 <HomeTopAd />
 </div>
 </div>
 </>
 );
}
