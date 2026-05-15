// src/app/hub/[id]/page.tsx
// 주제별 허브(필러) 페이지 — 5개 허브를 단일 동적 라우트로 정적 생성.

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getHubById, getAllHubIds, hubs } from "@/lib/hubs";
import { buildPageMetadata } from "@/lib/seo";
import { autoBreadcrumbLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { HomeTopAd, InArticleAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return getAllHubIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const hub = getHubById(params.id);
  if (!hub) return { title: "Not Found" };

  const intro = hub.intro[0];
  const description =
    intro.length > 158 ? `${intro.slice(0, 155)}…` : intro;

  return buildPageMetadata({
    title: hub.title,
    description,
    path: `/hub/${hub.id}`,
    keywords: hub.keywords,
  });
}

export default function HubPage({ params }: { params: { id: string } }) {
  const hub = getHubById(params.id);
  if (!hub) notFound();

  const otherHubs = hubs.filter((h) => h.id !== hub.id);

  return (
    <main className="min-h-screen bg-canvas dark:bg-canvas-950 pb-20">
      <JsonLd
        data={[autoBreadcrumbLd(`/hub/${hub.id}`, { leafName: hub.title })]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <Breadcrumbs path={`/hub/${hub.id}`} leafName={hub.title} className="mb-6" />

        <header className="mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-10 text-electric font-bold text-xs uppercase tracking-wider mb-4">
            주제별 종합 가이드
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-canvas-50 mb-3">
            {hub.title}
          </h1>
          <p className="text-lg text-muted-blue dark:text-canvas-300">
            {hub.tagline}
          </p>
        </header>

        <article className="space-y-4 mb-10">
          {hub.intro.map((paragraph, i) => (
            <p
              key={i}
              className="text-base leading-7 text-muted-blue dark:text-canvas-300"
            >
              {paragraph}
            </p>
          ))}
        </article>

        <HomeTopAd />

        <div className="space-y-10 mt-8">
          {hub.sections.map((section, si) => (
            <section key={section.heading}>
              <h2 className="text-xl font-black text-navy dark:text-canvas-50 mb-4">
                {section.heading}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {section.links.map((link) => (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    className="group flex items-start gap-3 p-4 bg-white dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-800 hover:border-electric transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-navy dark:text-canvas-50 group-hover:text-electric transition-colors">
                        {link.label}
                      </p>
                      <p className="text-xs text-muted-blue dark:text-canvas-400 mt-1 leading-relaxed">
                        {link.desc}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-electric flex-shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ))}
              </div>
              {si === 1 && (
                <div className="mt-8">
                  <InArticleAd />
                </div>
              )}
            </section>
          ))}
        </div>

        <div className="mt-10">
          <CoupangBanner
            responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
          />
        </div>

        <nav className="mt-12 pt-8 border-t border-canvas-200 dark:border-canvas-800">
          <h2 className="text-sm font-black text-faint-blue uppercase tracking-widest mb-4">
            다른 주제 종합 가이드
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherHubs.map((other) => (
              <Link
                key={other.id}
                href={`/hub/${other.id}`}
                className="group flex items-center justify-between gap-3 p-4 bg-white dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-800 hover:border-electric transition-colors"
              >
                <span className="font-bold text-navy dark:text-canvas-50 group-hover:text-electric transition-colors">
                  {other.title.split(" — ")[0]}
                </span>
                <ArrowRight className="w-4 h-4 text-electric flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </main>
  );
}
