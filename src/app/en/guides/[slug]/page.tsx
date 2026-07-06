import { koGuides, enGuides } from "@/lib/guidesData";
import { permanentRedirect } from "next/navigation";
import Link from "next/link";
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
 // 가이드 미존재 시 page 컴포넌트가 /en/guides 로 308 redirect 처리하지만
 // generateMetadata 는 redirect 전 호출되므로 명시적 Metadata 객체 반환 필수.
 // 빈 객체({}) 반환은 타입은 통과하나 title/robots 누락으로 GSC noindex 위험.
 if (!guide) {
 return {
 title: "Guide Not Found | Moneysalary",
 robots: { index: false, follow: false },
 };
 }

 const koUrl = `https://www.moneysalary.com/guides/${guide.slug}`;
 const enUrl = `https://www.moneysalary.com/en/guides/${guide.slug}`;
 // 한국어판 실재 확인 후에만 ko hreflang 선언 — 존재하지 않는 대상을 가리키는
 // hreflang 재발 방지 (guides/[slug]의 hasEn 게이트와 대칭, sitemap.ts와 동일 정책)
 const hasKo = koGuides.some((g) => g.slug === params.slug);

 return {
 title: `${guide.title} | Moneysalary Guides`,
 description: guide.description,
 alternates: {
 canonical: enUrl,
 languages: hasKo
 ? {
 "ko-KR": koUrl,
 "en": enUrl,
 "x-default": koUrl,
 }
 : {
 "en": enUrl,
 "x-default": enUrl,
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

 // 한↔영 상호 SSR 링크 — /en 트리로 가는 서버 렌더 내부링크가 사실상 0이던
 // 문제(GSC 미색인 원인) 해소. hreflang 게이트와 동일한 실재 확인 사용.
 const hasKo = koGuides.some((g) => g.slug === guide.slug);

 return (
 <>
  <script
   type="application/ld+json"
   dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
  />
  <EnglishGuideClient guide={guide} relatedGuides={relatedGuides} />
  {hasKo && (
   <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
    <Link
     href={`/guides/${guide.slug}`}
     hrefLang="ko"
     className="inline-flex items-center gap-2 text-sm font-bold text-electric hover:underline"
    >
     🇰🇷 이 가이드를 한국어로 보기 →
    </Link>
   </div>
  )}
 </>
 );
}
