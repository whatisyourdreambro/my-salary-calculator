import DsrCalculator from "@/components/calculators/real-estate/DsrCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "DSR 계산기 - 총부채원리금상환비율 계산 | MoneySalary",
    description: "내 연소득과 대출 상환액으로 DSR을 간편하게 계산해보세요. 대출 규제 확인 필수 도구.",
};

export default function DsrPage() {
    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-black text-center mb-8">DSR 계산기</h1>
            <DsrCalculator />
        </div>
    );
}
