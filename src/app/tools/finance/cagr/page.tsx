import CagrCalculator from "@/components/calculators/finance/CagrCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "CAGR(연평균 성장률) 계산기 | Moneysalary",
    description: "투자의 연평균 성장률(Compound Annual Growth Rate)을 계산하여 성과를 분석하세요.",
};

export default function CagrPage() {
    return (
        <div className="min-h-screen pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-white mb-4">CAGR 계산기</h1>
                    <p className="text-zinc-400">복리 효과를 고려한 진정한 투자 수익률</p>
                </div>
                <CagrCalculator />
            </div>
        </div>
    );
}
