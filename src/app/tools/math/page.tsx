import MathCalculators from "@/components/calculators/MathCalculators";
import { Metadata } from "next";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
 title: "퍼센트 계산기 & 단위 변환 | Moneysalary",
 description: "비율, 비중, 증감율 등 다양한 퍼센트 계산과 단위 변환을 쉽고 빠르게.",
};

export default function MathPage() {
 return (
 <main className="min-h-screen bg-canvas dark:bg-canvas-950 pt-24 sm:pt-28 pb-20">
 <div className="max-w-3xl mx-auto px-4 sm:px-6">
 <header className="text-center mb-10 sm:mb-12">
 <span className="inline-flex items-center gap-1.5 bg-primary-10 border border-primary-20 text-electric text-[12px] font-bold px-3 py-1 rounded-full mb-5">
 <Sparkles size={13} aria-hidden="true" /> 일상 도구
 </span>
 <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-navy dark:text-canvas-50 tracking-[-0.04em] mb-4 leading-[1.1]">
 수학 도구 모음
 </h1>
 <p className="text-base sm:text-lg text-muted-blue dark:text-canvas-300 max-w-xl mx-auto font-medium leading-relaxed">
 일상에 필요한 퍼센트 계산과 단위 변환을 직관적인 UI로 즉시 해결합니다.
 </p>
 </header>
 <MathCalculators />
 </div>
 </main>
 );
}
