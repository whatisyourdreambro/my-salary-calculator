import CagrCalculator from "@/components/calculators/finance/CagrCalculator";
import { Metadata } from "next";
import { Activity } from "lucide-react";

export const metadata: Metadata = {
 title: "CAGR(연평균 성장률) 계산기 | Moneysalary",
 description: "투자의 연평균 성장률(Compound Annual Growth Rate)을 계산하여 성과를 분석하세요.",
};

export default function CagrPage() {
 return (
 <main className="min-h-screen bg-canvas dark:bg-canvas-950 pt-24 sm:pt-28 pb-20">
 <div className="max-w-3xl mx-auto px-4 sm:px-6">
 <header className="text-center mb-10 sm:mb-12">
 <span className="inline-flex items-center gap-1.5 bg-primary-10 border border-primary-20 text-electric text-[12px] font-bold px-3 py-1 rounded-full mb-5">
 <Activity size={13} aria-hidden="true" /> 연평균 성장률
 </span>
 <h1 className="text-3xl sm:text-4xl font-black text-navy dark:text-canvas-50 tracking-[-0.04em] mb-3 leading-[1.1]">
 CAGR 계산기
 </h1>
 <p className="text-base sm:text-lg text-muted-blue dark:text-canvas-300 font-medium leading-relaxed">
 복리 효과를 고려한 진정한 투자 수익률을 즉시 계산합니다
 </p>
 </header>
 <CagrCalculator />
 </div>
 </main>
 );
}
