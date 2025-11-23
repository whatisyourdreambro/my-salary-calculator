import { PercentCalculator } from "@/components/calculators/math/MathCalculators";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "퍼센트 계산기 (Percentage) - MoneySalary",
    description: "전체값에 대한 비율, 비율에 대한 값 등 다양한 퍼센트 계산을 지원합니다.",
};

export default function PercentPage() {
    return (
        <div className="min-h-screen bg-black pt-20 pb-20 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">퍼센트 계산기</h1>
                <PercentCalculator />
            </div>
        </div>
    );
}
