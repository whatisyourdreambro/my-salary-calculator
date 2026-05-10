import { DutchPayCalculator } from "@/components/calculators/life/LifeCalculators";
import { Metadata } from "next";

export const metadata: Metadata = {
 title: "N빵 계산기 (Dutch Pay) - MoneySalary",
 description: "회식, 모임, 여행 경비를 인원수대로 정확하게 나누어 계산합니다.",
};

export default function DutchPayPage() {
 return (
 <div className="min-h-screen bg-canvas dark:bg-canvas-950 pt-24 sm:pt-28 pb-20 px-4">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] text-navy dark:text-canvas-50 mb-8 leading-[1.1]">N빵 계산기</h1>
 <DutchPayCalculator />
 </div>
 </div>
 );
}
