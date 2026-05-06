"use client";

import { Calendar, Eye, Clock, ChevronLeft, Calculator, ArrowRight, Lightbulb, Share2, BookOpen, Sparkles } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import ShareButtons from "@/components/ShareButtons";
import { Guide } from "@/lib/guidesData";
import TableOfContents from "@/components/guides/TableOfContents";
import CoupangBanner from "@/components/CoupangBanner";
import { GuideMidAd, SidebarAd } from "@/components/AdPlacement";

interface GuidePageClientProps {
 guide: Guide;
 relatedGuides: Guide[];
}

export default function EnglishGuideClient({ guide, relatedGuides }: GuidePageClientProps) {
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
 guide.category === "Stocks"
 ? { name: "Salary Converter", href: "/en/salary-converter" }
 : guide.category === "Tax"
 ? { name: "Flat Tax Calculator", href: "/en/flat-tax" }
 : { name: "Salary Converter", href: "/en/salary-converter" };

 if (!mounted) return null;

 return (
 <main className="min-h-screen bg-canvas -[#191F28] relative selection:bg-primary/20">
 {/* Reading Progress Bar */}
 <motion.div
 className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-[#0145F2] to-primary/80 z-50 origin-left"
 style={{ scaleX }}
 />

 {/* Hero Section */}
 <div className="relative pt-28 pb-16 overflow-hidden text-center">
 <div className="absolute inset-0 bg-gradient-to-br from-canvas via-white to-indigo-50 -[#0f1623] -[#191F28] -[#1a2035] -z-10" />
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 /15 rounded-full blur-[120px] -z-10 pointer-events-none" />

 <motion.div
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.8 }}
 className="relative z-20 max-w-4xl mx-auto px-4 mt-4"
 >
 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-electric/20 text-electric 400 font-bold text-sm mb-6">
 <span className="w-2 h-2 rounded-full bg-primary/50" />
 {guide.category} Guide
 </div>
 <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-navy mb-6 leading-tight">
 {guide.title}
 </h1>
 <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-faint-blue font-semibold">
 <div className="flex items-center gap-2">
 <Calendar className="w-4 h-4" />
 <span>{new Date(guide.publishedDate).toLocaleDateString("en-US")}</span>
 </div>
 <div className="w-1 h-1 rounded-full bg-slate-300" />
 <div className="flex items-center gap-2">
 <Clock className="w-4 h-4" />
 <span>{readingTime} min read</span>
 </div>
 <div className="w-1 h-1 rounded-full bg-slate-300" />
 <div className="flex items-center gap-2">
 <Eye className="w-4 h-4" />
 <span>{guide.views.toLocaleString('en-US')} views</span>
 </div>
 </div>
 </motion.div>
 </div>

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-6 relative z-20">
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
 className="flex-1 min-w-0"
 >
 <div className="toss-card bg-white -[#1E232E] p-6 sm:p-10 rounded-[24px]">

 {/* Smart Summary (TL;DR) */}
 <div className="mb-10 bg-primary/5 rounded-2xl p-6 border border-primary/10">
 <h3 className="flex items-center gap-2 font-bold text-lg text-primary mb-3">
 <Lightbulb className="w-5 h-5" />
 Key Summary (TL;DR)
 </h3>
 <p className="text-muted-foreground leading-relaxed">
 {guide.description} Read this full guide for a clear, actionable understanding of <strong>{guide.title}</strong>. Take your financial knowledge to the next level.
 </p>
 </div>

 <GuideMidAd />

 <div
 className="prose prose-lg max-w-none
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

 {/* Data Sources / Trust Banner — applied to all guides (E-E-A-T) */}
 <div className="mt-10 p-5 bg-secondary/30 rounded-2xl border border-border/50">
 <div className="flex items-start gap-3">
 <span className="text-2xl">📚</span>
 <div className="flex-1 text-sm">
 <p className="font-bold text-foreground mb-1">
 Sources & Methodology
 </p>
 <p className="text-muted-foreground leading-relaxed">
 Based on Korean government data (NTS, NPS, NHIS, KCOMWEL) and 2026 tax law.
 Last updated:{" "}
 <strong className="text-foreground">
 {new Date(guide.publishedDate).toLocaleDateString("en-US")}
 </strong>
 </p>
 <p className="text-xs text-muted-foreground mt-2">
 ※ For specific tax / legal decisions, please consult{" "}
 <Link href="/about" className="text-primary font-bold hover:underline">
 official sources
 </Link>{" "}
 and a qualified tax professional.
 </p>
 </div>
 </div>
 </div>

 {/* End of article — highest impact ad slot (right after reading) */}
 <GuideMidAd />

 <CoupangBanner
 responsive={{ mobile: "mobile-portrait", desktop: "large-portrait" }}
 />

 {/* Tags */}
 <div className="mt-8 pt-8 border-t border-border flex flex-wrap gap-2">
 {guide.tags.map((tag) => (
 <Link key={tag} href={`/en/guides?q=${tag}`}>
 <span className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all">
 #{tag}
 </span>
 </Link>
 ))}
 </div>
 </div>

 {/* Navigation Footer */}
 <div className="mt-8 toss-card p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
 <Link
 href="/en/guides"
 className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
 >
 <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
 <ChevronLeft className="w-5 h-5" />
 </div>
 <span className="font-bold">Back to all guides</span>
 </Link>

 <div className="flex items-center gap-4">
 <span className="text-sm font-medium text-muted-foreground">Share this guide</span>
 <ShareButtons
 title={guide.title}
 description={`${guide.category} Guide | Moneysalary`}
 className="justify-end"
 />
 </div>
 </div>

 {/* Related Guides Section */}
 <div className="mt-16">
 <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
 <Sparkles className="w-6 h-6 text-primary" />
 Related Reading
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {relatedGuides.map((relatedGuide) => (
 <Link
 key={relatedGuide.slug}
 href={`/en/guides/${relatedGuide.slug}`}
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
 <span>Read</span>
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
 <div className="toss-card p-6 relative overflow-hidden group">
 <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0" />
 <div className="relative z-10">
 <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
 <Calculator className="w-6 h-6" />
 </div>
 <h3 className="text-lg font-bold mb-2">
 Time to Practice
 </h3>
 <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
 Got the theory?<br />
 Use the <strong>{relatedCalculator.name}</strong> for accurate numbers in your own situation.
 </p>
 <Link
 href={relatedCalculator.href}
 className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:brightness-110 transition-all shadow-lg hover:shadow-primary/25"
 >
 Open Calculator <ArrowRight className="w-4 h-4" />
 </Link>
 </div>
 </div>

 {/* Newsletter / CTA */}
 <div className="toss-card p-6">
 <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
 <BookOpen className="w-5 h-5 text-primary" />
 Smarter Every Week
 </h3>
 <p className="text-muted-foreground text-sm mb-4">
 Don't miss our weekly finance guides.
 </p>
 <Link
 href="/en/guides"
 className="block text-center w-full py-3 bg-secondary text-foreground font-bold rounded-xl hover:bg-foreground hover:text-background transition-colors"
 >
 Browse All Guides
 </Link>
 </div>

 {/* Desktop-only sidebar ad - on mobile, end-of-article ad is enough */}
 <div className="hidden lg:block">
 <SidebarAd />
 <CoupangBanner size="skyscraper" showDisclosure={false} />
 </div>
 </div>
 </aside>
 </div>
 </div>
 </main>
 );
}
