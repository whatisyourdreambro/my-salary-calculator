// src/app/guides/[slug]/page.tsx
"use client";

export const runtime = "edge";

import { guides } from "@/lib/guidesData";
import { notFound } from "next/navigation";
import { Calendar, Eye, Clock, Share2, ChevronLeft, Calculator, ArrowRight } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = guides.find((g) => g.slug === params.slug);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!guide) {
    notFound();
  }

  // Calculate reading time (rough estimate)
  const readingTime = Math.ceil(guide.content.length / 1000);

  const relatedCalculator = guide.category === "연봉" ? { name: "연봉 계산기", href: "/salary" } :
    guide.category === "세금" ? { name: "연말정산 계산기", href: "/year-end-tax" } :
      guide.category === "커리어" ? { name: "커리어 플래너", href: "/pro/career-planner" } :
        { name: "금융 계산기", href: "/" };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background relative">
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-primary z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Hero Section */}
      <div className="relative w-full h-[400px] sm:h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background/50 to-background z-0" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 z-0" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto px-4 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {guide.category}
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight drop-shadow-sm">
            {guide.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm sm:text-base text-muted-foreground font-medium">
            <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-lg backdrop-blur-sm border border-border/50">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{new Date(guide.publishedDate).toLocaleDateString('ko-KR')}</span>
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-lg backdrop-blur-sm border border-border/50">
              <Clock className="w-4 h-4 text-primary" />
              <span>{readingTime}분 분량</span>
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-lg backdrop-blur-sm border border-border/50">
              <Eye className="w-4 h-4 text-primary" />
              <span>{guide.views.toLocaleString()}회 조회</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 -mt-20 relative z-20">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-full lg:w-[70%]"
          >
            <div className="glass-card p-8 sm:p-12 rounded-3xl shadow-2xl border border-white/20 dark:border-white/5">
              <div
                className="prose prose-lg dark:prose-invert max-w-none 
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-lg
                prose-strong:text-primary prose-strong:font-bold
                prose-a:text-primary prose-a:no-underline prose-a:border-b-2 prose-a:border-primary/30 hover:prose-a:border-primary prose-a:transition-colors
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:p-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                prose-li:marker:text-primary
                prose-img:rounded-2xl prose-img:shadow-lg"
                dangerouslySetInnerHTML={{ __html: guide.content }}
              />

              {/* Tags */}
              <div className="mt-12 pt-8 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {guide.tags.map(tag => (
                    <span key={tag} className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex justify-between items-center">
              <Link href="/guides" className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <ChevronLeft className="w-5 h-5" />
                </div>
                <span className="font-medium">목록으로 돌아가기</span>
              </Link>
              <button className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <span className="font-medium">공유하기</span>
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Share2 className="w-5 h-5" />
                </div>
              </button>
            </div>
          </motion.article>

          {/* Sidebar */}
          <aside className="w-full lg:w-[30%] space-y-8">
            {/* Related Calculator Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="sticky top-24"
            >
              <div className="glass-card p-6 rounded-2xl border border-primary/20 shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4 text-primary">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    이 글과 관련된 계산기
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    지금 바로 {relatedCalculator.name}를 통해<br />
                    나의 정확한 수치를 확인해보세요.
                  </p>
                  <Link
                    href={relatedCalculator.href}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/25"
                  >
                    계산하러 가기 <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Newsletter / CTA */}
              <div className="mt-8 glass-card p-6 rounded-2xl border border-border shadow-lg">
                <h3 className="text-lg font-bold text-foreground mb-2">
                  매주 새로운 금융 꿀팁
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  놓치면 손해인 최신 금융 정보를<br />
                  가장 먼저 받아보세요.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="이메일 주소"
                    className="flex-1 bg-background/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary hover:text-primary-foreground transition-colors">
                    구독
                  </button>
                </div>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>
    </main>
  );
}