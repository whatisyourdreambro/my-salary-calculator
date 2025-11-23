import DepositCalculator from "@/components/calculators/DepositCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "예적금 계산기 (이자/세금) | Moneysalary",
    description: "예금, 적금 이자와 세후 수령액을 계산해보세요. 일반과세, 세금우대, 비과세 적용 가능.",
};

export default function DepositCalculatorPage() {
    return (
        <div className="min-h-screen pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        예적금 계산기
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        목돈 굴리기(예금)와 목돈 만들기(적금)의 <br className="hidden sm:block" />
                        만기 수령액을 세금(15.4%)까지 고려하여 정확하게 계산합니다.
                    </p>
                </div>
                <DepositCalculator />
            </div>
        </div>
    );
}
