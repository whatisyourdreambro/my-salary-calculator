import LoanCalculator from "@/components/calculators/LoanCalculator";
import { Metadata } from "next";
import { Calculator } from "lucide-react";

export const metadata: Metadata = {
 title: "대출 이자 계산기 | Moneysalary",
 description: "원리금균등, 원금균등, 만기일시 상환 방식에 따른 대출 이자와 월 상환액을 계산해보세요.",
};

export default function LoanCalculatorPage() {
 return (
 <main className="min-h-screen bg-canvas dark:bg-canvas-950 pt-24 sm:pt-28 pb-20">
 <div className="max-w-3xl mx-auto px-4 sm:px-6">
 <header className="text-center mb-10 sm:mb-12">
 <span className="inline-flex items-center gap-1.5 bg-primary-10 border border-primary-20 text-electric text-[12px] font-bold px-3 py-1 rounded-full mb-5">
 <Calculator size={13} aria-hidden="true" /> 3가지 상환 방식
 </span>
 <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-navy dark:text-canvas-50 tracking-[-0.04em] mb-4 leading-[1.1]">
 대출 이자 계산기
 </h1>
 <p className="text-base sm:text-lg text-muted-blue dark:text-canvas-300 max-w-xl mx-auto font-medium leading-relaxed">
 가장 합리적인 상환 계획을 세워보세요.
 <br className="hidden sm:block" />
 원리금균등·원금균등·만기일시 모두 지원합니다.
 </p>
 </header>
 <LoanCalculator />
 </div>
 </main>
 );
}
