"use client";

import dynamic from 'next/dynamic';
import {
  Calculator, ArrowRight, PiggyBank, Briefcase, Globe, FileText, GitCompare, Receipt, TrendingUp, Zap, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import AdUnit from "@/components/AdUnit";
import Link from 'next/link';

const CalculatorTabs = dynamic(() => import('@/components/CalculatorTabs'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex justify-center items-center toss-card">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-semibold animate-pulse">계산기 로딩 중...</p>
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
  colorClass,
  delay = 0,
  colSpan = 1
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  colorClass: string;
  delay?: number;
  colSpan?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={`group relative toss-card overflow-hidden ${colSpan === 2 ? 'md:col-span-2' : ''}`}
  >
    <Link href={href} className="block p-7 h-full">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-7">
          <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${colorClass}`}>
            <Icon className="w-7 h-7" />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <ChevronRight className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <h3 className="text-[20px] font-bold text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[14px] font-medium">{description}</p>
      </div>
    </Link>
  </motion.div>
);

const StatCard = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <p className="text-3xl sm:text-4xl font-black text-blue-600 tabular-nums mb-1">{value}</p>
    <p className="text-sm font-semibold text-slate-500">{label}</p>
  </div>
);

export default function HomePage() {
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
      />
      <main className="w-full overflow-hidden">
        {/* === Hero Section === */}
        <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 pt-28 pb-16 overflow-hidden">
          {/* 배경 */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-slate-50 dark:from-[#0f1623] dark:via-[#191F28] dark:to-[#191F28] -z-10" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center w-full max-w-4xl mx-auto"
          >
            {/* 뱃지 */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-sm mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              2026년 최신 세법 완벽 반영
            </motion.div>

            {/* 메인 타이틀 */}
            <h1 className="text-5xl sm:text-7xl lg:text-[80px] font-black tracking-tight text-slate-900 dark:text-white mb-7 leading-[1.1]">
              내 연봉의 모든 것,<br />
              <span className="text-blue-600">가장 쉽고 정확하게.</span>
            </h1>

            <p className="mt-4 max-w-2xl mx-auto text-xl sm:text-2xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed tracking-tight">
              복잡한 세금 계산부터 숨어있는 환급금까지.<br className="hidden sm:block" />
              대한민국 1등 연봉 계산기 머니샐러리.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 items-center">
              <button
                onClick={scrollToCalculator}
                className="toss-button-primary max-w-xs py-5 text-[18px] font-black shadow-[0_8px_24px_rgba(49,130,246,0.35)]"
              >
                <Zap className="w-5 h-5" />
                지금 바로 계산하기
              </button>
              <Link
                href="/guides"
                className="flex items-center gap-2 px-6 py-4 rounded-[16px] text-[16px] font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                금융 가이드 보기 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 수치 요약 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-20 flex items-center justify-center gap-10 sm:gap-20 py-8 border-y border-slate-100 dark:border-slate-800/80"
            >
              <StatCard value="2026년" label="최신 세법 적용" />
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
              <StatCard value="100+" label="금융 계산기" />
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
              <StatCard value="무료" label="광고 없는 계산기" />
            </motion.div>
          </motion.div>
        </section>

        {/* === 계산기 섹션 === */}
        <section
          id="calculator-section"
          className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Ad */}
            <div className="hidden lg:block lg:col-span-2">
              <AdUnit
                slotId="5492837410"
                format="vertical"
                className="min-h-[600px] sticky top-28"
                label="Sidebar Left"
              />
            </div>

            {/* 메인 계산기 */}
            <div className="lg:col-span-8 flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-20 w-full max-w-xl"
              >
                <CalculatorTabs />
              </motion.div>
            </div>

            {/* Right Ad */}
            <div className="hidden lg:block lg:col-span-2">
              <AdUnit
                slotId="5492837410"
                format="vertical"
                className="min-h-[600px] sticky top-28"
                label="Sidebar Right"
              />
            </div>
          </div>
        </section>

        {/* 모바일 중간 광고 */}
        <div className="lg:hidden px-4 mb-12">
          <AdUnit slotId="5492837410" format="auto" label="Mobile Mid Ad" />
        </div>

        {/* === 프리미엄 도구 그리드 === */}
        <section className="py-28 px-4 relative bg-slate-50 dark:bg-[#191F28]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-sm font-black text-blue-600 uppercase tracking-widest mb-3"
              >
                Premium Tools
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl sm:text-[44px] font-black text-slate-900 dark:text-white mb-4 tracking-tight"
              >
                프리미엄 금융 도구
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl text-slate-500 dark:text-slate-400 font-medium"
              >
                당신의 자산을 불려줄 필수 도구들.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <CalculatorCard icon={Calculator} title="정규직 계산기" description="2026년 최신 세율 적용, 가장 정확한 실수령액 계산" href="/?tab=salary" colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30" colSpan={2} delay={0} />
              <CalculatorCard icon={PiggyBank} title="퇴직금 계산기" description="예상 퇴직금과 IRP 절세 효과 분석" href="/?tab=severance" colorClass="bg-primary/5 text-primary dark:bg-primary/30" delay={0.1} />
              <CalculatorCard icon={Briefcase} title="알바/프리랜서" description="3.3% 공제 및 주휴수당 완벽 계산" href="/?tab=freelancer" colorClass="bg-primary/10 text-primary dark:bg-primary/30" delay={0.2} />
              <CalculatorCard icon={Globe} title="환율 영향 (New)" description="내 연봉의 글로벌 구매력 비교" href="/?tab=exchange" colorClass="bg-primary/5 text-primary dark:bg-primary/30" delay={0.3} />
              <CalculatorCard icon={FileText} title="연말정산 설계" description="13월의 월급을 위한 필승 시뮬레이션" href="/year-end-tax" colorClass="bg-slate-50 text-primary dark:bg-primary/30" delay={0.4} />
              <CalculatorCard icon={Receipt} title="급여명세서" description="직인까지 찍히는 나만의 급여 명세서" href="/fun/salary-slip" colorClass="bg-primary/5 text-primary dark:bg-primary/30" delay={0.5} />
              <CalculatorCard icon={TrendingUp} title="미래 연봉 예측" description="커리어 성장 곡선과 은퇴 목표 달성 시기 분석" href="/?tab=future" colorClass="bg-primary/5 text-primary dark:bg-primary/30" delay={0.6} />
              <CalculatorCard icon={GitCompare} title="기업 오퍼 비교" description="두 회사의 실제 가치(시급, 복지) 정밀 비교" href="/company/compare" colorClass="bg-primary/10 text-indigo-600 dark:bg-primary/30" colSpan={2} delay={0.7} />
            </div>
          </div>
        </section>

        {/* 섹션 광고 */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <AdUnit slotId="2345678901" format="auto" label="Mid Page Ad" />
        </div>

        {/* === 대출/예적금 섹션 === */}
        <section className="py-28 bg-white dark:bg-[#1E232E] relative border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-black text-blue-600 uppercase tracking-widest mb-3">Financial Tools</p>
              <h2 className="text-3xl sm:text-[40px] font-black text-slate-900 dark:text-white mb-4 tracking-tight">대출 &amp; 예적금</h2>
              <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">스마트한 레버리지 활용하기</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-[20px] font-bold text-center text-slate-800 dark:text-slate-200">대출 이자 계산기</h3>
                <div className="toss-card p-4">
                  <LoanCalculator />
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-[20px] font-bold text-center text-slate-800 dark:text-slate-200">적금 이자 계산기</h3>
                <div className="toss-card p-4">
                  <DepositCalculator />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 하단 광고 */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <AdUnit slotId="3456789012" format="auto" label="Bottom Page Ad" />
        </div>
      </main>
    </>
  );
}
