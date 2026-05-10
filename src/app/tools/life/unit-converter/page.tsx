import { UnitConverter } from "@/components/calculators/life/LifeCalculators";
import { Metadata } from "next";

export const metadata: Metadata = {
 title: "단위 변환기 (Unit Converter) - MoneySalary",
 description: "길이, 무게 등 다양한 단위를 간편하게 변환하세요.",
};

export default function UnitConverterPage() {
 return (
 <div className="min-h-screen bg-canvas dark:bg-canvas-950 pt-24 sm:pt-28 pb-20 px-4">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] text-navy dark:text-canvas-50 mb-8 leading-[1.1]">단위 변환기</h1>
 <UnitConverter />
 </div>
 </div>
 );
}
