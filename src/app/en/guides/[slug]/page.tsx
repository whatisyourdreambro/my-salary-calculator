import { enGuides } from "@/lib/guidesData";
import { permanentRedirect } from "next/navigation";
import EnglishGuideClient from "./EnglishGuideClient";
import { articleLd } from "@/lib/structuredData";
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
 // GSC 404 출혈 차단(7차): 옛 영문 가이드 슬러그 → /en/guides 메인 308
 permanentRedirect("/en/guides");
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

 const jsonLd = articleLd({
 title: guide.title,
 description: guide.description,
 slug: guide.slug,
 publishedDate: guide.publishedDate,
 modifiedDate: guide.publishedDate,
 lang: "en",
 });

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
