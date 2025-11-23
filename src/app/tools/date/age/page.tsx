import { AgeCalculator } from "@/components/calculators/date/DateCalculators";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "만 나이 계산기 (Age Calculator) - MoneySalary",
    description: "생년월일을 입력하면 만 나이와 연 나이를 정확하게 계산해드립니다.",
};

export default function AgePage() {
    return (
        <div className="min-h-screen bg-black pt-20 pb-20 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">만 나이 계산기</h1>
                <AgeCalculator />
            </div>
        </div>
    );
}
