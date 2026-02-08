
import { guides } from "@/lib/guidesData";
import { notFound } from "next/navigation";
import GuidePageClient from "./GuidePageClient";
import { Metadata } from "next";

export const dynamic = 'force-static';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = guides.find((g) => g.slug === params.slug);
  if (!guide) return {};

  return {
    title: `${guide.title} | Moneysalary 금융 가이드`,
    description: guide.description,
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: 'article',
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
  const guide = guides.find((g) => g.slug === params.slug);

  if (!guide) {
    notFound();
  }

  // Logic to find related guides: Same category, exclude current, top views
  const relatedGuides = guides
    .filter((g) => g.category === guide.category && g.slug !== guide.slug)
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

  // If not enough related guides in same category, fill with others
  if (relatedGuides.length < 3) {
    const others = guides
      .filter((g) => g.slug !== guide.slug && !relatedGuides.find(r => r.slug === g.slug))
      .sort((a, b) => b.views - a.views)
      .slice(0, 3 - relatedGuides.length);
    relatedGuides.push(...others);
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    author: {
      '@type': 'Organization',
      name: 'Moneysalary',
    },
    datePublished: guide.publishedDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://moneysalary.com/guides/${guide.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GuidePageClient guide={guide} relatedGuides={relatedGuides} />
    </>
  );
}