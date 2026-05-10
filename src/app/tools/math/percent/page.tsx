import { PercentCalculator } from "@/components/calculators/math/MathCalculators";
import { Metadata } from "next";

export const metadata: Metadata = {
 title: "퍼센트 계산기 (Percentage) - MoneySalary",
 description: "전체값에 대한 비율, 비율에 대한 값 등 다양한 퍼센트 계산을 지원합니다.",
};

export default function PercentPage() {
 return (
 <div className="min-h-screen bg-canvas dark:bg-canvas-950 pt-24 sm:pt-28 pb-20 px-4">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] text-navy dark:text-canvas-50 mb-8 leading-[1.1]">퍼센트 계산기</h1>
 <PercentCalculator />
 </div>
 </div>
 );
}
