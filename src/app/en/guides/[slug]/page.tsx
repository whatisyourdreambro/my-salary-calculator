import { enGuides } from "@/lib/guidesData";
import { notFound } from "next/navigation";
import EnglishGuideClient from "./EnglishGuideClient";
import { Metadata } from "next";

export const dynamic = 'force-static';

interface Props {
 params: { slug: string };
}

export async function generateStaticParams() {
 return enGuides.map((guide) => ({
 slug: guide.slug,
 }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const guide = enGuides.find((g) => g.slug === params.slug);
 if (!guide) return {};

 const koUrl = `https://www.moneysalary.com/guides/${guide.slug}`;
 const enUrl = `https://www.moneysalary.com/en/guides/${guide.slug}`;

 return {
 title: `${guide.title} | Moneysalary Guides`,
 description: guide.description,
 alternates: {
 canonical: enUrl,
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
 locale: 'en_US',
 url: enUrl,
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

export default function EnglishGuidePage({ params }: Props) {
 const guide = enGuides.find((g) => g.slug === params.slug);

 if (!guide) {
 notFound();
 }

 const relatedGuides = enGuides
 .filter((g) => g.category === guide.category && g.slug !== guide.slug)
 .slice(0, 3);

 if (relatedGuides.length < 3) {
 const others = enGuides
 .filter((g) => g.slug !== guide.slug && !relatedGuides.find(r => r.slug === g.slug))
 .slice(0, 3 - relatedGuides.length);
 relatedGuides.push(...others);
 }

 const jsonLd = {
 '@context': 'https://schema.org',
 '@type': 'Article',
 headline: guide.title,
 description: guide.description,
 inLanguage: 'en',
 author: {
 '@type': 'Organization',
 name: 'Moneysalary',
 },
 datePublished: guide.publishedDate,
 mainEntityOfPage: {
 '@type': 'WebPage',
 '@id': `https://www.moneysalary.com/en/guides/${guide.slug}`,
 },
 };

 return (
 <>
  <script
   type="application/ld+json"
   dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
  />
  <EnglishGuideClient guide={guide} relatedGuides={relatedGuides} />
 </>
 );
}
