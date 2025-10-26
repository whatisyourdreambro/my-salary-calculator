// src/app/guides/[slug]/page.tsx
import { guides } from "@/lib/guidesData";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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
      <article className="bg-card p-8 rounded-2xl border border-border shadow-lg">
        <div className="mb-8 text-center">
            <p className="text-primary font-semibold">{guide.category}</p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mt-2">
                {guide.title}
            </h1>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>{new Date(guide.publishedDate).toLocaleDateString('ko-KR')}</span>
                <span>|</span>
                <div className="flex flex-wrap gap-2">
                    {guide.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">#{tag}</span>
                    ))}
                </div>
            </div>
        </div>
        <div className="prose dark:prose-invert lg:prose-xl mx-auto">
            <p className="lead">{guide.description}</p>
            <div className="mt-12 text-center p-8 border-2 border-dashed border-border rounded-xl">
                <p className="text-muted-foreground">이곳에 실제 가이드 본문이 표시됩니다.</p>
            </div>
        </div>
      </article>
    </main>
  );
}
