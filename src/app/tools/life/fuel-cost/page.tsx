import { FuelCostCalculator } from "@/components/calculators/life/LifeCalculators";
import { Metadata } from "next";

export const metadata: Metadata = {
 title: "유류비 계산기 (Fuel Cost) - MoneySalary",
 description: "이동 거리와 연비를 입력하여 예상 주유비를 계산해보세요.",
};

export default function FuelCostPage() {
 return (
 <div className="min-h-screen bg-canvas dark:bg-canvas-950 pt-24 sm:pt-28 pb-20 px-4">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] text-navy dark:text-canvas-50 mb-8 leading-[1.1]">유류비 계산기</h1>
 <FuelCostCalculator />
 </div>
 </div>
 );
}
