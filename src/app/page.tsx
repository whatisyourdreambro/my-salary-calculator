"use client";

import dynamic from 'next/dynamic';
import { CheckCircle, BarChart, TrendingUp, Calculator, ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from 'react';
import AdUnit from "@/components/AdUnit";

const CalculatorTabs = dynamic(() => import('@/components/CalculatorTabs'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex justify-center items-center glass rounded-3xl">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">계산기 로딩 중...</p>
      </div>
    </div>
  )
});

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Moneysalary",
  url: "https://www.moneysalary.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.moneysalary.com/salary/{search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const FeatureCard = ({
  icon: Icon,
  title,
  children,
  delay = 0
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className="glass-card p-8 rounded-3xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden border border-white/10 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500" />

    <div className="relative z-10">
      <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner ring-1 ring-white/20">
        <Icon className="w-8 h-8 text-primary drop-shadow-sm" />
      </div>
      <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">{children}</p>
    </div>
  </motion.div>
);

export default function HomePage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const scrollToCalculator = () => {
    const calculatorSection = document.getElementById("calculator-section");
    if (calculatorSection) {
      calculatorSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData),
        }}
      />
      <main className="w-full overflow-hidden" ref={containerRef}>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden pt-20">
          {/* Dynamic Background */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob" />
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-pink-500/20 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob animation-delay-4000" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          </div>

          <motion.div
            style={{ y, opacity }}
            className="max-w-5xl mx-auto text-center relative z-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-primary font-semibold text-sm mb-10 shadow-lg hover:scale-105 transition-transform cursor-default"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>2025년 최신 세법 완벽 반영</span>
              </motion.div>

              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-foreground mb-8 leading-tight">
                당신의 연봉, <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-teal-500 animate-gradient-xy relative inline-block pb-2">
                  정확한 가치
                </span>
                를 발견하다
              </h1>

              <p className="mt-8 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium">
                단순한 계산을 넘어, 당신의 금융 미래를 설계하세요.
                <br className="hidden sm:block" />
                머니샐러리가 가장 정확하고 직관적인 급여 분석을 제공합니다.
              </p>

              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-5 items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={scrollToCalculator}
                  className="group relative px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl text-lg shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 overflow-hidden w-full sm:w-auto"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center justify-center gap-2">
                    지금 계산하기 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 glass text-foreground font-bold rounded-2xl text-lg hover:bg-white/10 transition-all duration-300 w-full sm:w-auto border border-white/10"
                >
                  더 알아보기
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50"
          >
            <span className="text-sm font-medium tracking-widest uppercase">Scroll</span>
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </motion.div>
        </section>

        {/* Ad Unit 1: Between Hero and Calculator */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdUnit slotId="1122334455" format="auto" label="Home Top Ad" />
        </div>

        {/* Calculator Tabs Section */}
        <section
          id="calculator-section"
          className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 -mt-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-20"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-[2.5rem] blur-2xl -z-10 opacity-60" />
            <div className="glass-card rounded-[2.5rem] p-2 sm:p-4 shadow-2xl ring-1 ring-white/20 backdrop-blur-xl bg-background/40">
              <CalculatorTabs />
            </div>
          </motion.div>
        </section>

        {/* Ad Unit 2: Between Calculator and Features */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdUnit slotId="5544332211" format="auto" label="Home Middle Ad" />
        </div>

        {/* Features Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-30 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-6"
              >
                금융 파트너, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">머니샐러리</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="max-w-2xl mx-auto text-xl text-muted-foreground"
              >
                정확한 계산을 넘어, 건강한 재무 관리를 위한 프리미엄 기능을 경험하세요.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard icon={Calculator} title="종합 소득 계산" delay={0.1}>
                정규직, 프리랜서 등 다양한 고용 형태에 맞는
                <span className="text-foreground font-bold"> 1원 단위까지 정확한</span> 세후 소득을 계산합니다.
              </FeatureCard>
              <FeatureCard icon={BarChart} title="연봉 정보 분석" delay={0.2}>
                빅데이터 기반 연봉 테이블과 순위 비교로
                <span className="text-foreground font-bold"> 당신의 객관적 위치</span>를 파악하세요.
              </FeatureCard>
              <FeatureCard icon={TrendingUp} title="금융 성장 가이드" delay={0.3}>
                커리어 성장과 자산 증식을 위한
                <span className="text-foreground font-bold"> 맞춤형 인사이트</span>를 제공합니다.
              </FeatureCard>
              <FeatureCard icon={CheckCircle} title="나만의 금융 비서" delay={0.4}>
                급여, 대출, 세금을 한눈에.
                <span className="text-foreground font-bold"> 스마트한 대시보드</span>로 관리하세요.
              </FeatureCard>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
