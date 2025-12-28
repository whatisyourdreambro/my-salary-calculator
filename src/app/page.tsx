"use client";

import dynamic from 'next/dynamic';
import {
  CheckCircle, BarChart, TrendingUp, Calculator, ArrowRight, Sparkles, ChevronDown,
  PiggyBank, Briefcase, Globe, FileText, GitCompare, Receipt, Zap, ShieldCheck
} from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from 'react';
import AdUnit from "@/components/AdUnit";
import Link from 'next/link';

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

const LoanCalculator = dynamic(() => import('@/components/LoanCalculator'), { ssr: false });
const DepositCalculator = dynamic(() => import('@/components/DepositCalculator'), { ssr: false });

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

const CalculatorCard = ({
  icon: Icon,
  title,
  description,
  href,
  color,
  delay = 0,
  colSpan = 1
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  color: string;
  delay?: number;
  colSpan?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg hover:bg-white/10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 cursor-pointer ${colSpan === 2 ? 'md:col-span-2' : ''}`}
  >
    <Link href={href} className="block p-6 h-full relative z-10">
      {/* Inner Glow Effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-${color}-500/10 via-transparent to-transparent`} />

      {/* Border Shine */}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-white/0 group-hover:ring-white/20 transition-all duration-500" />

      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 rounded-full blur-3xl group-hover:bg-${color}-500/20 transition-colors duration-500`} />

      <div className="relative z-10 flex flex-col h-full">
        <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 border border-${color}-500/20`}>
          <Icon className={`w-6 h-6 text-${color}-500`} />
        </div>

        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-zinc-300 transition-colors duration-300">{description}</p>

        <div className="mt-auto pt-6 flex items-center text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors duration-300">
          바로가기 <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </Link>
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
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

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
      <main className="w-full overflow-hidden bg-zinc-950" ref={containerRef}>
        {/* Hero Section */}
        <section className="relative min-h-[95vh] flex items-center justify-center px-4 overflow-hidden pt-20">
          {/* Premium Aurora Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-blob" />
            <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
            <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          </div>

          <motion.div
            style={{ y, opacity, scale }}
            className="max-w-6xl mx-auto text-center relative z-10"
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-emerald-400 font-medium text-sm mb-8 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] hover:bg-emerald-500/20 transition-colors cursor-default"
              >
                <Sparkles className="w-4 h-4" />
                <span>2025년 최신 세법 완벽 반영</span>
              </motion.div>

              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-8 leading-[1.1]">
                Your Salary, <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 animate-gradient-xy drop-shadow-sm">
                  Redefined.
                </span>
              </h1>

              <p className="mt-8 max-w-2xl mx-auto text-lg sm:text-xl text-zinc-400 leading-relaxed font-medium">
                단순한 계산을 넘어, 당신의 금융 미래를 설계하세요.
                <br className="hidden sm:block" />
                머니샐러리가 가장 정확하고 우아한 급여 분석을 제공합니다.
              </p>

              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6 items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={scrollToCalculator}
                  className="group relative w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-2xl text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)] transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    지금 시작하기 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                </motion.button>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/guides" className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-medium rounded-2xl text-lg border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm">
                    <FileText className="w-5 h-5" />
                    금융 가이드
                  </Link>
                </motion.div>
              </div>

              {/* Trust Badges */}
              <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap justify-center gap-8 text-zinc-500 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>100% 익명 보장</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>실시간 세법 업데이트</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span>정확도 99.9%</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-500"
          >
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Scroll</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </motion.div>
        </section>



        {/* Calculator Grid Navigation (Bento Grid) */}
        <section className="py-24 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900/50 to-zinc-950 pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight"
              >
                Premium Tools
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-zinc-400 text-lg"
              >
                당신에게 필요한 모든 금융 도구, 여기 있습니다.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <CalculatorCard
                icon={Calculator}
                title="정규직 계산기"
                description="2025년 최신 세율 적용, 가장 정확한 실수령액 계산"
                href="/?tab=salary"
                color="emerald"
                colSpan={2}
                delay={0}
              />
              <CalculatorCard
                icon={PiggyBank}
                title="퇴직금 계산기"
                description="예상 퇴직금과 IRP 절세 효과 분석"
                href="/?tab=severance"
                color="blue"
                delay={0.1}
              />
              <CalculatorCard
                icon={Briefcase}
                title="알바/프리랜서"
                description="3.3% 공제 및 주휴수당 완벽 계산"
                href="/?tab=freelancer"
                color="purple"
                delay={0.2}
              />
              <CalculatorCard
                icon={Globe}
                title="환율 영향 (New)"
                description="내 연봉의 글로벌 가치와 구매력 비교"
                href="/?tab=exchange"
                color="cyan"
                delay={0.3}
              />
              <CalculatorCard
                icon={FileText}
                title="연말정산 최적화"
                description="13월의 월급을 위한 필승 전략 시뮬레이션"
                href="/year-end-tax"
                color="pink"
                delay={0.4}
              />
              <CalculatorCard
                icon={Receipt}
                title="급여명세서"
                description="직인까지 찍히는 나만의 급여 명세서 발급"
                href="/fun/salary-slip"
                color="yellow"
                delay={0.5}
              />
              <CalculatorCard
                icon={TrendingUp}
                title="미래 연봉 예측"
                description="커리어 성장 곡선과 FIRE 달성 시기 예측"
                href="/?tab=future"
                color="orange"
                delay={0.6}
              />
              <CalculatorCard
                icon={GitCompare}
                title="연봉 비교"
                description="두 회사의 실제 가치(시급, 복지) 정밀 비교"
                href="/battle"
                color="red"
                colSpan={2}
                delay={0.7}
              />
            </div>
          </div>
        </section>

        {/* Main Calculator Section */}
        <section
          id="calculator-section"
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-20"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-[2.5rem] blur-2xl -z-10 opacity-60" />
            <div className="glass-card rounded-[2.5rem] p-2 sm:p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl bg-zinc-900/50 border border-white/10">
              <CalculatorTabs />
            </div>
          </motion.div>
        </section>



        {/* Financial Tools Section */}
        <section className="py-24 bg-zinc-900/30 relative border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">Financial Tools</h2>
              <p className="text-zinc-400">스마트한 자산 관리를 위한 필수 계산기</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-center text-zinc-300 mb-4">대출 이자 계산기</h3>
                <LoanCalculator />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-center text-zinc-300 mb-4">적금 이자 계산기</h3>
                <DepositCalculator />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
