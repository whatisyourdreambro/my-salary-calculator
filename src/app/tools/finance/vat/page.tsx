import VatCalculator from "@/components/calculators/finance/VatCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "부가세(VAT) 계산기 | Moneysalary",
    description: "공급가액 또는 합계금액을 기준으로 부가가치세(VAT)를 정확하게 계산합니다.",
};

export default function VatPage() {
    return (
        <div className="min-h-screen pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-white mb-4">부가세 계산기</h1>
                    <p className="text-zinc-400">일반과세자 10% 세율 적용</p>
                </div>
                <VatCalculator />
            </div>
        </div>
    );
}
