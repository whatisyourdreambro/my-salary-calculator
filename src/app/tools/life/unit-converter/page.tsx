import { UnitConverter } from "@/components/calculators/life/LifeCalculators";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "단위 변환기 (Unit Converter) - MoneySalary",
    description: "길이, 무게 등 다양한 단위를 간편하게 변환하세요.",
};

export default function UnitConverterPage() {
    return (
        <div className="min-h-screen bg-black pt-20 pb-20 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">단위 변환기</h1>
                <UnitConverter />
            </div>
        </div>
    );
}
