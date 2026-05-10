import { DDayCalculator } from "@/components/calculators/date/DateCalculators";
import { Metadata } from "next";

export const metadata: Metadata = {
 title: "D-Day 디데이 계산기 - MoneySalary",
 description: "시험, 기념일, 전역일 등 중요한 날짜까지 남은 시간을 계산해보세요.",
};

export default function DDayPage() {
 return (
 <div className="min-h-screen bg-canvas dark:bg-canvas-950 pt-24 sm:pt-28 pb-20 px-4">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] text-navy dark:text-canvas-50 mb-8 leading-[1.1]">D-Day 계산기</h1>
 <DDayCalculator />
 </div>
 </div>
 );
}
