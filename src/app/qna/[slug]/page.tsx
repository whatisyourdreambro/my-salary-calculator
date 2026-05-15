// src/app/qna/[slug]/page.tsx
// Q&A 동적 페이지 — long-tail "X 어떻게 X 하나요?" 키워드 페이지별 분리로 SEO 노출 극대화.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, HelpCircle, Sparkles, GraduationCap } from "lucide-react";
import {
 qnaData,
 toQnaSlug,
 getQnaBySlug,
 getRelatedQna,
} from "@/data/qnaData";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import { HomeTopAd, InArticleAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import Breadcrumbs from "@/components/Breadcrumbs";

export const dynamic = "force-static";

export async function generateStaticParams() {
 return qnaData.map((item) => ({
 slug: toQnaSlug(item.question),
 }));
}

export async function generateMetadata({
 params,
}: {
 params: { slug: string };
}): Promise<Metadata> {
 const item = getQnaBySlug(params.slug);
 if (!item) return { title: "Not Found" };

 // SERP CTR 최적화: 질문 그대로 title + 결론 그대로 description
 return buildPageMetadata({
 title: item.question,
 description: `${item.answer.conclusion} 머니샐러리 ${item.category} 전문 가이드.`,
 path: `/qna/${toQnaSlug(item.question)}`,
 keywords: [item.category, "직장인 Q&A", "금융 질문", "세금 질문"],
 });
}

export default function QnaDetailPage({
 params,
}: {
 params: { slug: string };
}) {
 const item = getQnaBySlug(params.slug);
 if (!item) notFound();

 const related = getRelatedQna(item, 4);
 const slug = toQnaSlug(item.question);

 return (
 <main className="w-full min-h-screen bg-canvas pb-20">
 <JsonLd
 data={[
 autoBreadcrumbLd(`/qna/${slug}`, { leafName: item.question.slice(0, 30) }),
 // 이 페이지 자체가 하나의 큰 FAQ — Google FAQ rich result 노출
 faqLd([
 {
 question: item.question,
 answer: `${item.answer.conclusion}\n\n${item.answer.details.map((d) => d.replace(/<[^>]+>/g, "")).join("\n")}${item.answer.tip ? `\n\n팁: ${item.answer.tip}` : ""}`,
 },
 ]),
 ]}
 />

 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
 <Breadcrumbs
 path={`/qna/${slug}`}
 leafName={item.question}
 className="mb-6"
 />

 <header className="mb-8">
 <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-10 text-electric font-bold text-xs uppercase tracking-wider mb-4">
 <HelpCircle className="w-3 h-3" />
 {item.category}
 </span>
 <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-canvas-50 leading-tight">
 {item.question}
 </h1>
 </header>

 <HomeTopAd />

 {/* Key Point — 결론 */}
 <section className="p-6 sm:p-8 bg-electric-5 border border-electric-20 rounded-3xl mb-8">
 <div className="flex gap-4">
 <span className="text-3xl flex-shrink-0">💡</span>
 <div>
 <p className="font-bold text-electric mb-2 text-sm uppercase tracking-wider">
 Key Point
 </p>
 <p className="text-foreground font-bold text-lg leading-relaxed text-navy dark:text-canvas-50">
 {item.answer.conclusion}
 </p>
 </div>
 </div>
 </section>

 {/* Details — 상세 설명 */}
 <section className="mb-10">
 <h2 className="font-bold text-2xl text-navy dark:text-canvas-50 mb-5 flex items-center gap-2">
 <Sparkles className="w-5 h-5 text-electric" />
 상세 설명
 </h2>
 <ul className="space-y-4">
 {item.answer.details.map((detail, i) => (
 <li
 key={i}
 dangerouslySetInnerHTML={{ __html: detail }}
 className="text-base leading-7 text-muted-blue dark:text-canvas-300 pl-4 border-l-2 border-canvas-200 dark:border-canvas-700 [&>strong]:text-navy dark:[&>strong]:text-canvas-50 [&>strong]:font-bold"
 />
 ))}
 </ul>
 </section>

 <InArticleAd />

 {/* Tip */}
 {item.answer.tip && (
 <div className="p-6 bg-canvas-100 dark:bg-canvas-800 rounded-2xl border border-canvas-200 dark:border-canvas-700 mb-8">
 <p className="font-bold text-electric flex items-center gap-2 mb-3">
 <Sparkles className="w-4 h-4" />
 Honey Tip
 </p>
 <p className="text-base leading-7 text-muted-blue dark:text-canvas-300">
 {item.answer.tip}
 </p>
 </div>
 )}

 {/* Action CTA */}
 <Link
 href={item.answer.action.href}
 className="group flex items-center justify-between p-6 bg-electric text-white rounded-2xl font-bold mb-10 hover:bg-electric/90 transition-colors"
 >
 <span className="flex items-center gap-3">
 <GraduationCap className="w-6 h-6" />
 {item.answer.action.text}
 </span>
 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
 </Link>

 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />

 {related.length > 0 && (
 <section className="mt-10">
 <h2 className="text-xl font-black text-navy dark:text-canvas-50 mb-4">
 {item.category} 카테고리의 다른 질문
 </h2>
 <div className="space-y-3">
 {related.map((rel) => (
 <Link
 key={rel.question}
 href={`/qna/${toQnaSlug(rel.question)}`}
 className="group flex items-start gap-4 p-5 bg-white dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-800 hover:border-electric transition-colors"
 >
 <span className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg bg-canvas-100 text-electric group-hover:bg-electric group-hover:text-white transition-all">
 Q
 </span>
 <div className="flex-1 min-w-0">
 <p className="font-bold text-navy dark:text-canvas-50 group-hover:text-electric transition-colors leading-snug mb-1">
 {rel.question}
 </p>
 <p className="text-xs text-muted-blue line-clamp-1">
 {rel.answer.conclusion}
 </p>
 </div>
 <ArrowRight className="w-5 h-5 text-electric flex-shrink-0 mt-2 group-hover:translate-x-0.5 transition-transform" />
 </Link>
 ))}
 </div>
 </section>
 )}

 <section className="mt-10 bg-white dark:bg-canvas-900 p-6 rounded-2xl border border-canvas-200 dark:border-canvas-800">
 <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
 머니샐러리 추천 도구
 </h2>
 <ul className="space-y-2 text-sm">
 <li>
 <Link href="/" className="text-electric hover:underline font-bold">
 → 연봉 실수령액 계산기 (4대보험·소득세 자동)
 </Link>
 </li>
 <li>
 <Link href="/calc" className="text-electric hover:underline font-bold">
 → 100개 금융 계산기 둘러보기
 </Link>
 </li>
 <li>
 <Link href="/guides" className="text-electric hover:underline font-bold">
 → 직장인 금융 가이드 전체 보기
 </Link>
 </li>
 <li>
 <Link href="/glossary" className="text-electric hover:underline font-bold">
 → 금융 용어 사전
 </Link>
 </li>
 </ul>
 </section>
 </div>
 </main>
 );
}
