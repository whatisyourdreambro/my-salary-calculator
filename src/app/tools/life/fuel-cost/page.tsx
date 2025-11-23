import { FuelCostCalculator } from "@/components/calculators/life/LifeCalculators";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "유류비 계산기 (Fuel Cost) - MoneySalary",
    description: "이동 거리와 연비를 입력하여 예상 주유비를 계산해보세요.",
};

export default function FuelCostPage() {
    return (
        <div className="min-h-screen bg-black pt-20 pb-20 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">유류비 계산기</h1>
                <FuelCostCalculator />
            </div>
        </div>
    );
}
