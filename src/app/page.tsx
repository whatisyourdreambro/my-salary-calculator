"use client";

import dynamic from 'next/dynamic';
import {
  Calculator, ArrowRight, PiggyBank, Briefcase, Globe,
  FileText, GitCompare, Receipt, TrendingUp, Zap, ChevronRight,
  Shield, BarChart3, Sparkles, BookOpen
} from "lucide-react";
import { motion } from "framer-motion";
import Link from 'next/link';

const CalculatorTabs = dynamic(() => import('@/components/CalculatorTabs'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 flex justify-center items-center">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
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

// 계산기 카드 컴포넌트
const ToolCard = ({
  icon: Icon, title, description, href, iconBg, delay = 0, wide = false
}: {
  icon: React.ElementType; title: string; description: string;
  href: string; iconBg: string; delay?: number; wide?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay }}
    className={wide ? 'md:col-span-2' : ''}
  >
    <Link href={href} className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-200">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${iconBg}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 text-[15px] mb-0.5 group-hover:text-blue-600 transition-colors">{title}</p>
        <p className="text-slate-400 text-sm truncate">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
    </Link>
  </motion.div>
);

export default function HomePage() {
  const scrollToCalculator = () => {
    document.getElementById("calculator-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
      />
      <main className="w-full overflow-hidden">

        {/* ═══ Hero ════════════════════════════════════════════════ */}
        <section className="relative min-h-[88vh] flex flex-col items-center justify-center px-4 pt-24 pb-12 overflow-hidden">
          {/* 배경 그라디언트 */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-white -z-10" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-400/8 rounded-full blur-[100px] -z-10 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center w-full max-w-3xl mx-auto"
          >
            {/* 뱃지 */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold text-sm mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              2026년 세법 완벽 반영
            </motion.div>

            {/* 타이틀 */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mb-5 leading-[1.1]">
              내 연봉의 모든 것,<br />
              <span className="text-blue-600">가장 쉽고 정확하게.</span>
            </h1>

            <p className="max-w-xl mx-auto text-lg sm:text-xl text-slate-500 font-medium leading-relaxed mb-10">
              복잡한 세금 계산부터 숨어있는 환급금까지.<br className="hidden sm:block" />
              대한민국 1등 연봉 계산기 머니샐러리.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 items-center">
              <button
                onClick={scrollToCalculator}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-black text-lg hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25"
              >
                <Zap className="w-5 h-5 text-white" />
                <span className="text-white">지금 바로 계산하기</span>
              </button>
              <Link
                href="/guides"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl text-[16px] font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                금융 가이드 보기 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 수치 요약 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-16 flex items-center justify-center gap-8 sm:gap-16 py-6 border-y border-slate-100"
            >
              {[
                { value: "2026년", label: "최신 세법" },
                { value: "100+", label: "금융 계산기" },
                { value: "무료", label: "완전 무료" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl sm:text-3xl font-black text-blue-600 mb-0.5">{stat.value}</p>
                  <p className="text-xs font-semibold text-slate-400">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ═══ 계산기 섹션 ════════════════════════════════════════ */}
        <section id="calculator-section" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <CalculatorTabs />
          </motion.div>
        </section>

        {/* ═══ 프리미엄 도구 그리드 ════════════════════════════════ */}
        <section className="py-20 px-4 bg-slate-50 border-t border-slate-100">
          <div className="max-w-5xl mx-auto">
            <div className="mb-10">
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Premium Tools</p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 tracking-tight">프리미엄 금융 도구</h2>
              <p className="text-slate-500 font-medium">당신의 재정 건강을 위한 필수 도구들</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ToolCard icon={Calculator} title="정규직 계산기" description="2026년 최신 세율 · 실수령액 정확 계산" href="/?tab=salary" iconBg="bg-blue-50 text-blue-600" wide delay={0} />
              <ToolCard icon={PiggyBank} title="퇴직금 계산기" description="예상 퇴직금과 IRP 절세 효과 분석" href="/?tab=severance" iconBg="bg-primary/5 text-primary" delay={0.05} />
              <ToolCard icon={Briefcase} title="알바/프리랜서" description="3.3% 공제 및 주휴수당 계산" href="/?tab=freelancer" iconBg="bg-violet-50 text-violet-600" delay={0.1} />
              <ToolCard icon={Globe} title="환율 영향" description="내 연봉의 글로벌 구매력 비교" href="/?tab=exchange" iconBg="bg-teal-50 text-teal-600" delay={0.15} />
              <ToolCard icon={FileText} title="연말정산 설계" description="13월의 월급을 위한 필승 시뮬레이션" href="/year-end-tax" iconBg="bg-amber-50 text-amber-600" delay={0.2} />
              <ToolCard icon={Receipt} title="급여명세서" description="나만의 급여 명세서 생성" href="/fun/salary-slip" iconBg="bg-green-50 text-green-600" delay={0.25} />
              <ToolCard icon={TrendingUp} title="미래 연봉 예측" description="커리어 성장 곡선과 은퇴 목표 분석" href="/?tab=future" iconBg="bg-blue-50 text-blue-600" delay={0.3} />
              <ToolCard icon={GitCompare} title="기업 오퍼 비교" description="두 회사의 시급·복지 정밀 비교" href="/company/compare" iconBg="bg-indigo-50 text-indigo-600" delay={0.35} />
              <ToolCard icon={BarChart3} title="연봉 순위" description="전국 소득 분포에서 내 위치 확인" href="/?tab=rank" iconBg="bg-rose-50 text-rose-600" delay={0.4} />
              <ToolCard icon={Shield} title="종합 계산기 허브" description="30+ 금융 계산기 한곳에 모아보기" href="/tools" iconBg="bg-slate-100 text-slate-700" delay={0.45} />
            </div>
          </div>
        </section>

        {/* ═══ 대출/예적금 섹션 ════════════════════════════════════ */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Financial Tools</p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 tracking-tight">대출 &amp; 예적금</h2>
              <p className="text-slate-500 font-medium">스마트한 레버리지와 자산 불리기</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-base font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-primary rounded-full inline-block"></span>
                  대출 이자 계산기
                </h3>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <LoanCalculator />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-green-500 rounded-full inline-block"></span>
                  적금 이자 계산기
                </h3>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <DepositCalculator />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 가이드 바로가기 ════════════════════════════════════ */}
        <section className="py-16 bg-slate-50 border-t border-slate-100">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">금융 지식 가이드</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">직장인이 꼭 알아야 할 세금, 투자, 절세 꿀팁을 무료로 제공합니다</p>
            <Link
              href="/guides"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-black transition-colors"
            >
              <span className="text-white">가이드 전체 보기</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>
          </div>
        </section>

      </main>
    </>
  );
}
