import { DDayCalculator } from "@/components/calculators/date/DateCalculators";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "D-Day 디데이 계산기 - MoneySalary",
    description: "시험, 기념일, 전역일 등 중요한 날짜까지 남은 시간을 계산해보세요.",
};

export default function DDayPage() {
    return (
        <div className="min-h-screen bg-black pt-20 pb-20 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">D-Day 계산기</h1>
                <DDayCalculator />
            </div>
        </div>
    );
}
