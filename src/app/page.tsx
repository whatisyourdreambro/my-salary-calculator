"use client";

import dynamic from 'next/dynamic';
import {
  Calculator, ArrowRight, PiggyBank, Briefcase, Globe, FileText, GitCompare, Receipt, TrendingUp
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
    whileHover={{ y: -4, scale: 1.01 }}
    className={`group relative toss-card overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_#00000014] ${colSpan === 2 ? 'md:col-span-2' : ''}`}
  >
    <Link href={href} className="block p-7 h-full relative z-10 bg-white dark:bg-[#1E232E]">
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-8">
          <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${colorClass}`}>
            <Icon className="w-7 h-7" />
          </div>
          <div className={`opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0`}>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        <h3 className="text-[22px] font-bold text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[15px] font-medium">{description}</p>
      </div>
    </Link>
  </motion.div>
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData),
        }}
      />
      <main className="w-full overflow-hidden">
        {/* Toss Style Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center w-full max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-bold text-sm mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              2026년 최신 세법 완벽 반영
            </motion.div>

            <h1 className="text-5xl sm:text-7xl lg:text-[84px] font-black tracking-tight text-slate-900 dark:text-white mb-8 leading-[1.15]">
              내 연봉의 모든 것,<br />
              <span className="text-blue-600">가장 쉽고 정확하게.</span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed tracking-tight">
              복잡한 세금 계산부터 숨어있는 환급금까지.<br className="hidden sm:block" />
              대한민국 1등 연봉 계산기 머니샐러리.
            </p>

            <div className="mt-14 flex flex-col sm:flex-row justify-center gap-4 items-center max-w-md mx-auto sm:max-w-none">
              <button
                onClick={scrollToCalculator}
                className="toss-button-primary py-5 px-10 text-[20px] shadow-[0_8px_20px_#3182F640]"
              >
                지금 계산하기
              </button>
            </div>
          </motion.div>
        </section>

        {/* Main Calculator Section */}
        <section
          id="calculator-section"
          className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Ad - Desktop Only */}
            <div className="hidden lg:block lg:col-span-2">
              <AdUnit
                slotId="5492837410"
                format="vertical"
                className="min-h-[600px] sticky top-28"
                label="Sidebar Left"
              />
            </div>

            {/* Main App Area (Center) */}
            <div className="lg:col-span-8 flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-20 w-full max-w-xl" // Strict Native App Width
              >
                <CalculatorTabs />
              </motion.div>
            </div>

            {/* Right Ad - Desktop Only */}
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


        {/* Premium Tools Bento Grid */}
        <section className="py-32 px-4 relative bg-slate-50 dark:bg-[#191F28]">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="mb-16">
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
                className="text-xl text-slate-500 font-medium"
              >
                당신의 자산을 불려줄 필수 도구들.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <CalculatorCard
                icon={Calculator}
                title="정규직 계산기"
                description="2026년 최신 세율 적용, 가장 정확한 실수령액 계산"
                href="/?tab=salary"
                colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                colSpan={2}
                delay={0}
              />
              <CalculatorCard
                icon={PiggyBank}
                title="퇴직금 계산기"
                description="예상 퇴직금과 IRP 절세 효과 분석"
                href="/?tab=severance"
                colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                delay={0.1}
              />
              <CalculatorCard
                icon={Briefcase}
                title="알바/프리랜서"
                description="3.3% 공제 및 주휴수당 완벽 계산"
                href="/?tab=freelancer"
                colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30"
                delay={0.2}
              />
              <CalculatorCard
                icon={Globe}
                title="환율 영향 (New)"
                description="내 연봉의 글로벌 구매력 비교"
                href="/?tab=exchange"
                colorClass="bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30"
                delay={0.3}
              />
              <CalculatorCard
                icon={FileText}
                title="연말정산 설계"
                description="13월의 월급을 위한 필승 시뮬레이션"
                href="/year-end-tax"
                colorClass="bg-pink-100 text-pink-600 dark:bg-pink-900/30"
                delay={0.4}
              />
              <CalculatorCard
                icon={Receipt}
                title="급여명세서"
                description="직인까지 찍히는 나만의 급여 명세서"
                href="/fun/salary-slip"
                colorClass="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30"
                delay={0.5}
              />
              <CalculatorCard
                icon={TrendingUp}
                title="미래 연봉 예측"
                description="커리어 성장 곡선과 은퇴 목표 달성 시기 분석"
                href="/?tab=future"
                colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30"
                delay={0.6}
              />
              <CalculatorCard
                icon={GitCompare}
                title="기업 오퍼 비교"
                description="두 회사의 실제 가치(시급, 복지) 정밀 비교"
                href="/company/compare"
                colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30"
                colSpan={2}
                delay={0.7}
              />
            </div>
          </div>
        </section>

        {/* Basic Financial Tools Section */}
        <section className="py-32 bg-white dark:bg-[#1E232E] relative border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-[40px] font-black text-slate-900 dark:text-white mb-4 tracking-tight">대출 & 예적금</h2>
              <p className="text-xl text-slate-500 font-medium">스마트한 레버리지 활용하기</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-[22px] font-bold text-center text-slate-800 dark:text-slate-200">대출 이자 계산기</h3>
                <div className="toss-card p-2 sm:p-4">
                  <LoanCalculator />
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-[22px] font-bold text-center text-slate-800 dark:text-slate-200">적금 이자 계산기</h3>
                <div className="toss-card p-2 sm:p-4">
                  <DepositCalculator />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
