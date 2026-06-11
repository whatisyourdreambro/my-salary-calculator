import { PercentCalculator } from "@/components/calculators/math/MathCalculators";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "퍼센트 계산기 (Percentage)",
 description: "전체값에 대한 비율, 비율에 대한 값 등 다양한 퍼센트 계산을 지원합니다.",
 path: "/tools/math/percent",
});

export default function PercentPage() {
 return (
 <div className="min-h-screen bg-canvas pt-28 pb-20 px-4">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl font-bold text-navy mb-8">퍼센트 계산기</h1>
 <PercentCalculator />
 </div>
 <ToolPageContent path="/tools/math/percent" />
 </div>
 );
}
