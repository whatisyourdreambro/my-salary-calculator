// src/app/glossary/[slug]/page.tsx
// 글로서리 용어별 정적 페이지 — long-tail 키워드 ("X 뜻", "X 의미") 노출 50배 증폭.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles, Hash } from "lucide-react";
import {
 glossaryData,
 toGlossarySlug,
 getGlossaryBySlug,
 getRelatedGlossaryItems,
} from "@/data/glossaryData";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import {
 autoBreadcrumbLd,
 faqLd,
} from "@/lib/structuredData";
import { HomeTopAd, InArticleAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import Breadcrumbs from "@/components/Breadcrumbs";

export const dynamic = "force-static";

export async function generateStaticParams() {
 return glossaryData.map((item) => ({
 slug: toGlossarySlug(item.title),
 }));
}

export async function generateMetadata({
 params,
}: {
 params: { slug: string };
}): Promise<Metadata> {
 const item = getGlossaryBySlug(params.slug);
 if (!item) return { title: "Not Found" };

 return buildPageMetadata({
 title: `${item.title} 뜻과 의미 — ${item.summary}`,
 description: `${item.title}은(는) ${item.summary}. ${item.content.slice(0, 80)}... 직장인이 꼭 알아야 할 ${item.category} 용어를 쉬운 비유로 설명합니다.`,
 path: `/glossary/${toGlossarySlug(item.title)}`,
 keywords: [
 `${item.title} 뜻`,
 `${item.title} 의미`,
 `${item.title}이란`,
 item.category,
 ],
 });
}

function buildDefinedTermLd(item: { title: string; summary: string; content: string }) {
 return {
 "@context": "https://schema.org",
 "@type": "DefinedTerm",
 name: item.title,
 description: item.summary,
 inDefinedTermSet: "https://www.moneysalary.com/glossary",
 url: `https://www.moneysalary.com/glossary/${toGlossarySlug(item.title)}`,
 about: item.content,
 };
}

export default function GlossaryDetailPage({
 params,
}: {
 params: { slug: string };
}) {
 const item = getGlossaryBySlug(params.slug);
 if (!item) notFound();

 const Icon = item.icon;
 const related = getRelatedGlossaryItems(item, 5);

 const faqItems = [
 {
 question: `${item.title}이(가) 무엇인가요?`,
 answer: `${item.summary}. ${item.content}`,
 },
 {
 question: `${item.title}을(를) 쉽게 비유하면?`,
 answer: item.analogy,
 },
 {
 question: `${item.title} 관련 알아두면 좋은 팁은?`,
 answer: item.tip,
 },
 ];

 return (
 <main className="w-full min-h-screen bg-canvas pb-20">
 <JsonLd
 data={[
 autoBreadcrumbLd(`/glossary/${toGlossarySlug(item.title)}`, {
 leafName: item.title,
 }),
 buildDefinedTermLd(item),
 faqLd(faqItems),
 ]}
 />

 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
 <Breadcrumbs
 path={`/glossary/${toGlossarySlug(item.title)}`}
 leafName={item.title}
 className="mb-6"
 />

 <header className="mb-8">
 <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-10 text-electric font-bold text-xs uppercase tracking-wider mb-4">
 <BookOpen className="w-3 h-3" />
 {item.category}
 </span>
 <div className="flex items-start gap-4">
 <div className="p-4 bg-electric-10 rounded-2xl text-electric flex-shrink-0">
 <Icon className="w-8 h-8" />
 </div>
 <div>
 <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-canvas-50 mb-2">
 {item.title}
 </h1>
 <p className="text-lg text-muted-blue italic">
 &ldquo;{item.summary}&rdquo;
 </p>
 </div>
 </div>
 </header>

 <HomeTopAd />

 <article className="prose prose-slate dark:prose-invert max-w-none mb-10">
 <h2 className="text-2xl font-black text-navy dark:text-canvas-50 !mt-8 !mb-4">
 {item.title} 자세히 알아보기
 </h2>
 <p className="text-base leading-7 text-muted-blue dark:text-canvas-300">
 {item.content}
 </p>

 <div className="bg-canvas-100 dark:bg-canvas-800 p-6 rounded-2xl !mt-6 not-prose">
 <h3 className="font-bold text-navy dark:text-canvas-50 mb-3 flex items-center gap-2">
 <Hash className="w-4 h-4 text-electric" />
 쉽게 말하면
 </h3>
 <p className="text-base leading-7 text-muted-blue dark:text-canvas-300">
 {item.analogy}
 </p>
 </div>

 <div className="bg-electric-5 border border-electric-20 p-6 rounded-2xl !mt-4 not-prose">
 <h3 className="font-bold text-electric mb-3 flex items-center gap-2">
 <Sparkles className="w-4 h-4" />
 Honey Tip
 </h3>
 <p className="text-base leading-7 text-muted-blue dark:text-canvas-300">
 {item.tip}
 </p>
 </div>
 </article>

 <InArticleAd />

 {related.length > 0 && (
 <section className="mb-10">
 <h2 className="text-xl font-black text-navy dark:text-canvas-50 mb-4">
 {item.category} 카테고리의 다른 용어
 </h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {related.map((rel) => {
 const RelIcon = rel.icon;
 return (
 <Link
 key={rel.title}
 href={`/glossary/${toGlossarySlug(rel.title)}`}
 className="group flex items-start gap-3 p-4 bg-white dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-800 hover:border-electric transition-colors"
 >
 <div className="p-2 bg-canvas-100 dark:bg-canvas-800 rounded-xl text-electric flex-shrink-0">
 <RelIcon className="w-5 h-5" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="font-bold text-navy dark:text-canvas-50 group-hover:text-electric transition-colors">
 {rel.title}
 </p>
 <p className="text-xs text-muted-blue mt-1 line-clamp-1">
 {rel.summary}
 </p>
 </div>
 <ArrowRight className="w-4 h-4 text-electric flex-shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
 </Link>
 );
 })}
 </div>
 </section>
 )}

 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />

 <section className="mt-10 bg-white dark:bg-canvas-900 p-6 rounded-2xl border border-canvas-200 dark:border-canvas-800">
 <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
 다음 단계 — 직접 계산해보기
 </h2>
 <ul className="space-y-2 text-sm">
 <li>
 <Link href="/calc" className="text-electric hover:underline font-bold">
 → 100개 금융 계산기 둘러보기
 </Link>
 </li>
 <li>
 <Link href="/salary/50000000" className="text-electric hover:underline font-bold">
 → 연봉 5천만원 실수령액 시뮬레이션
 </Link>
 </li>
 <li>
 <Link href="/guides" className="text-electric hover:underline font-bold">
 → 직장인 금융 가이드 전체 보기
 </Link>
 </li>
 </ul>
 </section>
 </div>
 </main>
 );
}
