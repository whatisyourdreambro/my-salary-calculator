import { UnitConverter } from "@/components/calculators/life/LifeCalculators";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "단위 변환기 (Unit Converter)",
 description: "길이, 무게 등 다양한 단위를 간편하게 변환하세요.",
 path: "/tools/life/unit-converter",
});

export default function UnitConverterPage() {
 return (
 <div className="min-h-screen bg-canvas pt-28 pb-20 px-4">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl font-bold text-navy mb-8">단위 변환기</h1>
 <UnitConverter />
 </div>
 <ToolPageContent path="/tools/life/unit-converter" />
 </div>
 );
}
