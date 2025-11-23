import LtvCalculator from "@/components/calculators/real-estate/LtvCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "LTV 계산기 - 주택담보대출비율 계산 | MoneySalary",
    description: "주택 가격과 대출 금액으로 LTV를 계산하세요. 주택 담보 대출 한도 확인.",
};

export default function LtvPage() {
    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-black text-center mb-8">LTV 계산기</h1>
            <LtvCalculator />
        </div>
    );
}
