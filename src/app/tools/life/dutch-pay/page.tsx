import { DutchPayCalculator } from "@/components/calculators/life/LifeCalculators";
import { Metadata } from "next";

export const metadata: Metadata = {
 title: "N빵 계산기 (Dutch Pay) - MoneySalary",
 description: "회식, 모임, 여행 경비를 인원수대로 정확하게 나누어 계산합니다.",
};

export default function DutchPayPage() {
 return (
 <div className="min-h-screen bg-electric pt-20 pb-20 px-4 pt-28 pb-20">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl font-bold text-navy mb-8">N빵 계산기</h1>
 <DutchPayCalculator />
 </div>
 </div>
 );
}
