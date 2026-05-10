import DsrCalculator from "@/components/calculators/real-estate/DsrCalculator";
import { Metadata } from "next";
import { Percent } from "lucide-react";

export const metadata: Metadata = {
 title: "DSR 계산기 - 총부채원리금상환비율 계산 | MoneySalary",
 description: "내 연소득과 대출 상환액으로 DSR을 간편하게 계산해보세요. 2026년 DSR 40% 규제 기준.",
};

export default function DsrPage() {
 return (
 <main className="min-h-screen bg-canvas dark:bg-canvas-950 pt-24 sm:pt-28 pb-20">
 <div className="max-w-3xl mx-auto px-4 sm:px-6">
 <header className="text-center mb-10 sm:mb-12">
 <span className="inline-flex items-center gap-1.5 bg-primary-10 border border-primary-20 text-electric text-[12px] font-bold px-3 py-1 rounded-full mb-5">
 <Percent size={13} aria-hidden="true" /> 2026 DSR 40% 규제
 </span>
 <h1 className="text-3xl sm:text-4xl font-black text-navy dark:text-canvas-50 tracking-[-0.04em] mb-3 leading-[1.1]">
 DSR 계산기
 </h1>
 <p className="text-base sm:text-lg text-muted-blue dark:text-canvas-300 font-medium leading-relaxed">
 총부채원리금상환비율을 계산해 대출 가능 한도를 확인하세요
 </p>
 </header>
 <DsrCalculator />
 </div>
 </main>
 );
}
