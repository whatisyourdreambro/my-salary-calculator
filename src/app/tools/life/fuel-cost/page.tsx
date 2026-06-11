import { FuelCostCalculator } from "@/components/calculators/life/LifeCalculators";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "유류비 계산기 (Fuel Cost)",
 description: "이동 거리와 연비를 입력하여 예상 주유비를 계산해보세요.",
 path: "/tools/life/fuel-cost",
});

export default function FuelCostPage() {
 return (
 <div className="min-h-screen bg-canvas pt-28 pb-20 px-4">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl font-bold text-navy mb-8">유류비 계산기</h1>
 <FuelCostCalculator />
 </div>
 <ToolPageContent path="/tools/life/fuel-cost" />
 </div>
 );
}
