// src/app/guides/[slug]/page.tsx
import { guides } from "@/lib/guidesData";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Calendar, Eye } from "lucide-react";

// This function allows Next.js to know which slugs are available at build time
export async function generateStaticParams() {
  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}

// This function generates metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const guide = guides.find((g) => g.slug === params.slug);
  if (!guide) {
    return {
      title: "가이드를 찾을 수 없습니다.",
    }
  }
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

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <article className="bg-card p-6 sm:p-8 md:p-10 rounded-2xl border border-border shadow-lg">
        <div className="mb-8 text-center">
            <p className="text-sm sm:text-base font-semibold text-primary">{guide.category}</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mt-2">
                {guide.title}
            </h1>
            <div className="mt-6 flex items-center justify-center gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(guide.publishedDate).toLocaleDateString('ko-KR')}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{guide.views.toLocaleString()}</span>
                </div>
            </div>
        </div>
        <div
          className="prose prose-sm sm:prose-base lg:prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: guide.content }}
        />
      </article>
    </main>
  );
}
