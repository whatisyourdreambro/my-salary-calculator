"use client";

import { Calendar, Eye, Clock, ChevronLeft, Calculator, ArrowRight, Lightbulb, Share2, BookOpen, Sparkles } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import AdUnit from "@/components/AdUnit";
import ShareButtons from "@/components/ShareButtons";
import { Guide } from "@/lib/guidesData";
import TableOfContents from "@/components/guides/TableOfContents";

interface GuidePageClientProps {
    guide: Guide;
    relatedGuides: Guide[];
}

export default function GuidePageClient({ guide, relatedGuides }: GuidePageClientProps) {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Calculate reading time
    const readingTime = Math.ceil(guide.content.length / 1000);

    const relatedCalculator =
        guide.category === "연봉"
            ? { name: "연봉 계산기", href: "/salary" }
            : guide.category === "세금"
                ? { name: "연말정산 계산기", href: "/year-end-tax" }
                : guide.category === "커리어"
                    ? { name: "커리어 플래너", href: "/pro/career-planner" }
                    : { name: "금융 계산기", href: "/" };

    if (!mounted) return null;

    return (
        <main className="min-h-screen bg-background relative selection:bg-primary/20">
            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-purple-500 to-indigo-500 z-50 origin-left"
                style={{ scaleX }}
            />

            {/* Hero Section */}
            <div className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-zinc-950 z-0" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 z-0" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background z-10" />

                {/* Animated Background Orbs */}
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] animate-pulse delay-700" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-20 max-w-4xl mx-auto px-4 text-center mt-10"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary-foreground/90 text-sm font-bold mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        {guide.category} 가이드
                    </div>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-8 leading-tight drop-shadow-2xl">
                        {guide.title}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-300 font-medium">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{new Date(guide.publishedDate).toLocaleDateString("ko-KR")}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-gray-600" />
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>{readingTime}분 분량</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-gray-600" />
                        <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-primary" />
                            <span>{guide.views.toLocaleString()} views</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 -mt-20 relative z-20">
                <div className="flex flex-col lg:flex-row gap-8 xl:gap-16">

                    {/* Sidebar Left (TOC) - Desktop Only */}
                    <aside className="hidden lg:block w-[240px] flex-shrink-0">
                        <div className="sticky top-24">
                            <TableOfContents content={guide.content} />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="flex-1 min-w-0" // prevent overflow
                    >
                        <div className="glass-card bg-background/60 backdrop-blur-xl p-6 sm:p-10 rounded-3xl shadow-2xl border border-white/10 ring-1 ring-black/5">

                            {/* Smart Summary (TL;DR) */}
                            <div className="mb-10 bg-primary/5 rounded-2xl p-6 border border-primary/10">
                                <h3 className="flex items-center gap-2 font-bold text-lg text-primary mb-3">
                                    <Lightbulb className="w-5 h-5" />
                                    핵심 요약 (TL;DR)
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {guide.description} 이 가이드를 통해 당신은 <strong>{guide.title}</strong>에 대한 명확한 이해와 구체적인 실행 전략을 얻을 수 있습니다.
                                    지금 바로 읽고 당신의 금융 지식을 한 단계 업그레이드 하세요.
                                </p>
                            </div>

                            <div
                                className="prose prose-lg dark:prose-invert max-w-none 
                                prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-24
                                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-border
                                prose-h3:text-xl prose-h3:mt-8 prose-h3:text-primary
                                prose-p:text-muted-foreground prose-p:leading-8
                                prose-strong:text-foreground prose-strong:font-bold
                                prose-a:text-primary prose-a:no-underline prose-a:font-bold hover:prose-a:underline
                                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-secondary/30 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-foreground
                                prose-ul:list-disc prose-ul:pl-6 prose-li:marker:text-primary"
                                dangerouslySetInnerHTML={{ __html: guide.content }}
                            />

                            {/* Ad Unit: Content Bottom */}
                            <div className="my-12">
                                <AdUnit slotId="5544332211" format="auto" label="Guide Content Bottom Ad" />
                            </div>

                            {/* Tags */}
                            <div className="mt-8 pt-8 border-t border-border flex flex-wrap gap-2">
                                {guide.tags.map((tag) => (
                                    <Link key={tag} href={`/guides?q=${tag}`}>
                                        <span className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all">
                                            #{tag}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Navigation Footer */}
                        <div className="mt-8 glass-card bg-background/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <Link
                                href="/guides"
                                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                    <ChevronLeft className="w-5 h-5" />
                                </div>
                                <span className="font-bold">목록으로 돌아가기</span>
                            </Link>

                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-muted-foreground">유익하셨나요? 공유하기</span>
                                <ShareButtons
                                    title={guide.title}
                                    description={`${guide.category} 가이드 | Moneysalary`}
                                    className="justify-end"
                                />
                            </div>
                        </div>

                        {/* Related Guides Section */}
                        <div className="mt-16">
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-primary" />
                                함께 읽으면 좋은 글
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {relatedGuides.map((relatedGuide) => (
                                    <Link
                                        key={relatedGuide.slug}
                                        href={`/guides/${relatedGuide.slug}`}
                                        className="group flex flex-col h-full bg-secondary/5 border border-white/5 hover:border-primary/30 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <div className="p-6 flex flex-col flex-grow">
                                            <span className="text-xs font-bold text-primary mb-2">{relatedGuide.category}</span>
                                            <h4 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                {relatedGuide.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
                                                {relatedGuide.description}
                                            </p>
                                            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mt-auto">
                                                <span>읽기</span>
                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </motion.article>

                    {/* Sidebar Right (Widgets) */}
                    <aside className="w-full lg:w-[320px] space-y-6 flex-shrink-0">
                        {/* Related Calculator Card */}
                        <div className="sticky top-24 space-y-6">
                            <div className="glass-card bg-background/60 backdrop-blur-xl p-6 rounded-2xl border border-primary/20 shadow-lg relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0" />
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                                        <Calculator className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">
                                        이제 실전입니다!
                                    </h3>
                                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                                        이론을 마스터하셨나요?<br />
                                        <strong>{relatedCalculator.name}</strong>로 내 상황에 맞는 정확한 데이터를 확인해보세요.
                                    </p>
                                    <Link
                                        href={relatedCalculator.href}
                                        className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:brightness-110 transition-all shadow-lg hover:shadow-primary/25"
                                    >
                                        계산기 바로가기 <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>

                            <AdUnit slotId="1122334455" format="auto" label="Guide Sidebar Ad" />

                            {/* Newsletter / CTA */}
                            <div className="glass-card bg-background/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg">
                                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                    더 똑똑해지는 법
                                </h3>
                                <p className="text-muted-foreground text-sm mb-4">
                                    매주 업데이트되는 금융 가이드를 놓치지 마세요.
                                </p>
                                <button className="w-full py-3 bg-secondary text-foreground font-bold rounded-xl hover:bg-foreground hover:text-background transition-colors">
                                    머니샐러리 즐겨찾기 추가
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
