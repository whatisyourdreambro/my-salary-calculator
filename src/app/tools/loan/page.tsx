import LoanCalculator from "@/components/calculators/LoanCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "대출 이자 계산기 | Moneysalary",
    description: "원리금균등, 원금균등, 만기일시 상환 방식에 따른 대출 이자와 월 상환액을 계산해보세요.",
};

export default function LoanCalculatorPage() {
    return (
        <div className="min-h-screen pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        대출 이자 계산기
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        가장 합리적인 상환 계획을 세워보세요. <br className="hidden sm:block" />
                        원리금균등, 원금균등, 만기일시 방식을 모두 지원합니다.
                    </p>
                </div>
                <LoanCalculator />
            </div>
        </div>
    );
}
