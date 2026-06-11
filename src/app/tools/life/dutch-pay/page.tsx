import { DutchPayCalculator } from "@/components/calculators/life/LifeCalculators";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "N빵 계산기 (Dutch Pay)",
 description: "회식, 모임, 여행 경비를 인원수대로 정확하게 나누어 계산합니다.",
 path: "/tools/life/dutch-pay",
});

export default function DutchPayPage() {
 return (
 <div className="min-h-screen bg-canvas pt-28 pb-20 px-4">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl font-bold text-navy mb-8">N빵 계산기</h1>
 <DutchPayCalculator />
 </div>
 <ToolPageContent path="/tools/life/dutch-pay" />
 </div>
 );
}
