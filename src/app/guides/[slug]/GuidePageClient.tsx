"use client";

import { Calendar, Eye, Clock, ChevronLeft, Calculator, ArrowRight, Lightbulb, BookOpen, Sparkles } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import ShareButtons from "@/components/ShareButtons";
import type { Guide } from "@/lib/guidesData";
import TableOfContents from "@/components/guides/TableOfContents";
import CoupangBanner from "@/components/CoupangBanner";
import { GuideMidAd, InArticleAd, SidebarAd } from "@/components/AdPlacement";
import Breadcrumbs from "@/components/Breadcrumbs";

interface GuidePageClientProps {
 guide: Guide;
 relatedGuides: Guide[];
}

// 'YYYY-MM-DD' → 'YYYY.MM.DD' 고정 포맷.
// toLocaleDateString은 서버/브라우저 환경(ICU·타임존)에 따라 출력이 달라
// hydration mismatch를 유발하므로 문자열 기반 수동 포맷을 사용한다.
function formatDate(dateStr: string): string {
 const [y, m, d] = dateStr.split("-");
 return y && m && d ? `${y}.${m}.${d}` : dateStr;
}

// 본문 HTML을 <h2 시작 위치에서만 분할 — 태그 중간이 잘리지 않도록 보장.
// h2가 2개 미만이면 분할하지 않고, 본문 길이에 비례해 2~3조각으로 나눠
// 조각 사이에 광고를 배치한다 (1/3 지점 GuideMidAd, 2/3 지점 InArticleAd).
function splitContentByH2(html: string): string[] {
 const h2Pattern = /<h2[\s>]/gi;
 const indices: number[] = [];
 let match: RegExpExecArray | null;
 while ((match = h2Pattern.exec(html)) !== null) indices.push(match.index);

 // h2 2개 미만 — 분할하지 않음
 if (indices.length < 2) return [html];

 // 본문이 h2로 시작하면 그 위치는 분할점에서 제외 (빈 조각 방지)
 const candidates = indices.filter((i) => i > 0);
 if (candidates.length === 0) return [html];

 const nearest = (target: number, pool: number[]) =>
 pool.reduce((best, cur) =>
 Math.abs(cur - target) < Math.abs(best - target) ? cur : best
 );

 // 짧은 글은 2분할(중간 1곳), 긴 글은 3분할(1/3·2/3 지점)
 if (html.length < 4000 || candidates.length === 1) {
 const p = nearest(html.length / 2, candidates);
 return [html.slice(0, p), html.slice(p)];
 }

 const p1 = nearest(html.length / 3, candidates);
 const after = candidates.filter((i) => i > p1);
 if (after.length === 0) return [html.slice(0, p1), html.slice(p1)];

 const p2 = nearest((html.length * 2) / 3, after);
 return [html.slice(0, p1), html.slice(p1, p2), html.slice(p2)];
}

// 분할된 본문 조각마다 동일하게 적용하는 prose 스타일
const PROSE_CLASS = `prose prose-lg max-w-none
 prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-24
 prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-border
 prose-h3:text-xl prose-h3:mt-8 prose-h3:text-primary
 prose-p:text-muted-foreground prose-p:leading-8
 prose-strong:text-foreground prose-strong:font-bold
 prose-a:text-primary prose-a:no-underline prose-a:font-bold hover:prose-a:underline
 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-secondary/30 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-foreground
 prose-ul:list-disc prose-ul:pl-6 prose-li:marker:text-primary`;

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

 // 본문을 h2 경계로 2~3분할해 사이에 광고 배치 (h2 2개 미만이면 분할 없음)
 const segments = splitContentByH2(guide.content);

 return (
 <main className="min-h-screen bg-canvas relative selection:bg-primary/20">
 {/* Reading Progress Bar — 클라이언트 전용(useScroll). mounted 게이트는 이 요소에만 적용,
 본문은 정적 HTML에 즉시 렌더되어 SEO 색인에 포함된다. */}
 {mounted && (
 <motion.div
 className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-[#0145F2] to-primary/80 z-50 origin-left"
 style={{ scaleX }}
 />
 )}

 {/* Hero Section */}
 <div className="relative pt-28 pb-16 overflow-hidden text-center">
 <div className="absolute inset-0 bg-gradient-to-br from-canvas via-white to-indigo-50 -z-10" />
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/15 rounded-full blur-[120px] -z-10 pointer-events-none" />

 <motion.div
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.8 }}
 className="relative z-20 max-w-4xl mx-auto px-4 mt-4"
 >
 <Breadcrumbs
 path={`/guides/${guide.slug}`}
 leafName={guide.title}
 align="center"
 className="mb-5"
 />
 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-electric/20 text-electric font-bold text-sm mb-6">
 <span className="w-2 h-2 rounded-full bg-primary/50" />
 {guide.category} 가이드
 </div>
 <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-navy mb-6 leading-tight">
 {guide.title}
 </h1>
 <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-faint-blue font-semibold">
 <div className="flex items-center gap-2">
 <Calendar className="w-4 h-4" />
 <span>{formatDate(guide.publishedDate)}</span>
 </div>
 <div className="w-1 h-1 rounded-full bg-slate-300" />
 <div className="flex items-center gap-2">
 <Clock className="w-4 h-4" />
 <span>{readingTime}분 분량</span>
 </div>
 <div className="w-1 h-1 rounded-full bg-slate-300" />
 <div className="flex items-center gap-2">
 <Eye className="w-4 h-4" />
 <span>{guide.views.toLocaleString('ko-KR')} views</span>
 </div>
 </div>
 </motion.div>
 </div>

 <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-6 relative z-20">
 <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">

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
 <div className="duotone-card bg-white p-6 sm:p-10 rounded-[24px]">

 {/* Smart Summary (TL;DR) — guide-tldr/faq-answer: page.tsx speakable 스키마 셀렉터와 일치 */}
 <div className="guide-tldr mb-10 bg-primary/5 rounded-2xl p-6 border border-primary/10">
 <h3 className="flex items-center gap-2 font-bold text-lg text-primary mb-3">
 <Lightbulb className="w-5 h-5" />
 핵심 요약 (TL;DR)
 </h3>
 <p className="faq-answer text-muted-foreground leading-relaxed">
 {guide.description} 이 가이드를 통해 당신은 <strong>{guide.title}</strong>에 대한 명확한 이해와 구체적인 실행 전략을 얻을 수 있습니다.
 지금 바로 읽고 당신의 금융 지식을 한 단계 업그레이드 하세요.
 </p>
 </div>

 {/* 분할되지 않는 짧은 글만 본문 앞에 광고 — 분할 시에는 1/3 지점으로 이동 */}
 {segments.length === 1 && <GuideMidAd />}

 <div
 className={PROSE_CLASS}
 dangerouslySetInnerHTML={{ __html: segments[0] }}
 />

 {segments.length >= 2 && (
 <>
 {/* 본문 1/3 지점 — 같은 슬롯은 페이지당 1회만 노출되므로 여기 단 한 번 */}
 <GuideMidAd />
 <div
 className={PROSE_CLASS}
 dangerouslySetInnerHTML={{ __html: segments[1] }}
 />
 </>
 )}

 {segments.length >= 3 && (
 <>
 {/* 본문 2/3 지점 */}
 <InArticleAd />
 <div
 className={PROSE_CLASS}
 dangerouslySetInnerHTML={{ __html: segments[2] }}
 />
 </>
 )}

 {/* 데이터 출처·신뢰 배너 — 모든 가이드 자동 적용 (E-E-A-T 강화) */}
 <div className="mt-10 p-5 bg-secondary/30 rounded-2xl border border-border/50">
 <div className="flex items-start gap-3">
 <span className="text-2xl">📚</span>
 <div className="flex-1 text-sm">
 <p className="font-bold text-foreground mb-1">
 본 가이드의 데이터 출처
 </p>
 <p className="text-muted-foreground leading-relaxed">
 국세청·국민연금공단·국민건강보험공단·근로복지공단 등 정부 공식 자료 기반.
 2026년 세법·요율 반영. 마지막 업데이트:{" "}
 <strong className="text-foreground">
 {formatDate(guide.publishedDate)}
 </strong>
 </p>
 <p className="text-xs text-muted-foreground mt-2">
 ※ 정확한 세무·법률 의사결정은{" "}
 <Link href="/about" className="text-primary font-bold hover:underline">
 공식 출처
 </Link>
 와 세무 전문가 상담 권장.
 </p>
 </div>
 </div>
 </div>

 {/* 3분할 글은 본문 2/3 지점에서 이미 노출(동일 슬롯 dedup) — 그 외에만 본문 끝 배치 */}
 {segments.length < 3 && <InArticleAd />}

 {/* 모바일은 banner(320×100)로 축소 — portrait(320×480)는 본문 흐름 차단·이탈 유발 */}
 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "large-portrait" }}
 />

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
 <div className="mt-8 duotone-card p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
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
 <div className="duotone-card p-6 relative overflow-hidden group">
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

 {/* 계산기 CTA */}
 <div className="duotone-card p-6">
 <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
 <BookOpen className="w-5 h-5 text-primary" />
 더 똑똑해지는 법
 </h3>
 <p className="text-muted-foreground text-sm mb-4">
 가이드를 읽었다면, 이제 내 연봉으로 직접 확인해 볼 차례입니다.
 </p>
 <Link
 href="/"
 className="block w-full py-3 bg-secondary text-foreground font-bold rounded-xl text-center hover:bg-foreground hover:text-background transition-colors"
 >
 내 연봉 실수령액 계산하기
 </Link>
 </div>

 {/* 데스크톱 전용 사이드바 광고 - 모바일에선 본문 끝 광고로 충분 */}
 <div className="hidden lg:block">
 <SidebarAd />
 </div>
 </div>
 </aside>
 </div>
 </div>
 </main>
 );
}
