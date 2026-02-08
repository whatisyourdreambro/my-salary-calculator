
import { guides } from "@/lib/guidesData";
import { notFound } from "next/navigation";
import GuidePageClient from "./GuidePageClient";
import { Metadata } from "next";


export const dynamic = 'force-static';

export async function generateStaticParams() {
  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const guide = guides.find((g) => g.slug === params.slug);
  if (!guide) return {};

  return {
    title: guide.title,
    description: guide.description,
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = guides.find((g) => g.slug === params.slug);

  if (!guide) {
    notFound();
  }

  return <GuidePageClient guide={guide} />;
}