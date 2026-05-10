import BmiCalculator from "@/components/calculators/health/BmiCalculator";
import { Metadata } from "next";
import { Activity } from "lucide-react";

export const metadata: Metadata = {
 title: "BMI 비만도 계산기 | Moneysalary",
 description: "신장과 체중을 입력하여 비만도(BMI)를 측정하고 건강 상태를 확인하세요.",
};

export default function BmiPage() {
 return (
 <main className="min-h-screen bg-canvas dark:bg-canvas-950 pt-24 sm:pt-28 pb-20">
 <div className="max-w-3xl mx-auto px-4 sm:px-6">
 <header className="text-center mb-10 sm:mb-12">
 <span className="inline-flex items-center gap-1.5 bg-primary-10 border border-primary-20 text-electric text-[12px] font-bold px-3 py-1 rounded-full mb-5">
 <Activity size={13} aria-hidden="true" /> 체질량지수
 </span>
 <h1 className="text-3xl sm:text-4xl font-black text-navy dark:text-canvas-50 tracking-[-0.04em] mb-3 leading-[1.1]">
 BMI 계산기
 </h1>
 <p className="text-base sm:text-lg text-muted-blue dark:text-canvas-300 font-medium leading-relaxed">
 키와 체중으로 비만도(Body Mass Index)와 건강 상태를 확인합니다
 </p>
 </header>
 <BmiCalculator />
 </div>
 </main>
 );
}
