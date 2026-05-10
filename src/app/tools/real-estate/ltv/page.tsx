import LtvCalculator from "@/components/calculators/real-estate/LtvCalculator";
import { Metadata } from "next";
import { Scale } from "lucide-react";

export const metadata: Metadata = {
 title: "LTV 계산기 - 주택담보대출비율 계산 | MoneySalary",
 description: "주택 가격과 대출 금액으로 LTV를 계산하세요. 주택담보대출 한도 즉시 확인.",
};

export default function LtvPage() {
 return (
 <main className="min-h-screen bg-canvas dark:bg-canvas-950 pt-24 sm:pt-28 pb-20">
 <div className="max-w-3xl mx-auto px-4 sm:px-6">
 <header className="text-center mb-10 sm:mb-12">
 <span className="inline-flex items-center gap-1.5 bg-primary-10 border border-primary-20 text-electric text-[12px] font-bold px-3 py-1 rounded-full mb-5">
 <Scale size={13} aria-hidden="true" /> 2026 LTV 규제
 </span>
 <h1 className="text-3xl sm:text-4xl font-black text-navy dark:text-canvas-50 tracking-[-0.04em] mb-3 leading-[1.1]">
 LTV 계산기
 </h1>
 <p className="text-base sm:text-lg text-muted-blue dark:text-canvas-300 font-medium leading-relaxed">
 주택 가격 대비 담보인정비율로 대출 가능 금액을 계산합니다
 </p>
 </header>
 <LtvCalculator />
 </div>
 </main>
 );
}
