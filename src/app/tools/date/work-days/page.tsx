import { WorkDayCalculator } from "@/components/calculators/date/DateCalculators";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "영업일 계산기 (Business Days) - MoneySalary",
    description: "주말을 제외한 실제 근무일(영업일) 수를 계산해보세요.",
};

export default function WorkDayPage() {
    return (
        <div className="min-h-screen bg-black pt-20 pb-20 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">영업일 계산기</h1>
                <WorkDayCalculator />
            </div>
        </div>
    );
}
