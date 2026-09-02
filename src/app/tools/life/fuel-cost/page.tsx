import { FuelCostCalculator } from "@/components/calculators/life/LifeCalculators";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { CalcResultAd } from "@/components/AdPlacement";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "유류비 계산기 — 거리·연비·유가로 주유비 계산 (Fuel Cost)",
 description: "이동 거리(km)·연비(km/L)·리터당 유가(원)를 입력하면 예상 주유비를 즉시 계산합니다. 예: 300km, 연비 12km/L, 1,700원/L → 25L·42,500원. 장거리 여행·출장 교통비 산정에 활용하세요.",
 path: "/tools/life/fuel-cost",
});

export default function FuelCostPage() {
 return (
 <div className="min-h-screen bg-canvas pt-28 pb-20 px-4">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl font-bold text-navy mb-8">유류비 계산기</h1>
 <FuelCostCalculator />
 {/* 결과 직하 광고 */}
 <CalcResultAd />
 </div>
 <ToolPageContent path="/tools/life/fuel-cost" />
 </div>
 );
}
