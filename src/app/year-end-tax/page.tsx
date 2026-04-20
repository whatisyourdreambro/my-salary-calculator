// src/app/year-end-tax/page.tsx

import type { Metadata } from "next";
import YearEndTaxCalculator from "@/components/YearEndTaxCalculator";
export const metadata: Metadata = {
 title: "연말정산 환급금 계산기 (2026년 귀속) | Moneysalary",
 description:
 "13월의 월급, 미리 계산해보세요! 총급여, 신용카드, 의료비 등 항목을 입력하고 2026년 귀속 연말정산 예상 환급금 또는 추가 납부 세액을 확인하세요.",
};

export default function YearEndTaxPage() {
 return (
 <main className="w-full min-h-screen bg-canvas -[#191F28]">
 {/* Hero */}
 <section className="relative pt-32 pb-16 px-4 text-center overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-primary via-white to-primary/80 -[#0f1623] -[#191F28] -[#1a2035] -z-10" />
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 /50/10 rounded-full blur-[120px] -z-10" />

 <div className="max-w-3xl mx-auto">
 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/50/10 border border-primary/20 text-primary font-bold text-sm mb-6">
 💰 13월의 월급
 </div>
 <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight mb-5 leading-[1.15] text-navy ">
 연말정산 환급금<br />
 <span className="text-primary">미리 계산해보세요</span>
 </h1>
 <p className="text-lg sm:text-xl text-faint-blue leading-relaxed font-medium">
 2026년 귀속 연말정산, 예상 환급금을 미리 계산하고<br className="hidden sm:block" />
 절세 전략을 세워보세요.
 </p>

 
 </div>
 </section>

 {/* 계산기 섹션 */}
 <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 -mt-4">
 <YearEndTaxCalculator />

 
 </section>
 </main>
 );
}
