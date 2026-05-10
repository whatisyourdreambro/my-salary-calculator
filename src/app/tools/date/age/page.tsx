import { AgeCalculator } from "@/components/calculators/date/DateCalculators";
import { Metadata } from "next";

export const metadata: Metadata = {
 title: "만 나이 계산기 (Age Calculator) - MoneySalary",
 description: "생년월일을 입력하면 만 나이와 연 나이를 정확하게 계산해드립니다.",
};

export default function AgePage() {
 return (
 <div className="min-h-screen bg-canvas dark:bg-canvas-950 pt-24 sm:pt-28 pb-20 px-4">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] text-navy dark:text-canvas-50 mb-8 leading-[1.1]">만 나이 계산기</h1>
 <AgeCalculator />
 </div>
 </div>
 );
}
