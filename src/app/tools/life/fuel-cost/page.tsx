import { FuelCostCalculator } from "@/components/calculators/life/LifeCalculators";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { CalcResultAd } from "@/components/AdPlacement";
import { buildToolMetadata } from "@/lib/seo";

// buildToolMetadata 수렴 (2026-08-24): "{name} 2026 — {tagline}" 표준 패턴 + type=tool OG
export const metadata: Metadata = buildToolMetadata({
 name: "유류비 계산기",
 tagline: "거리·연비·유가로 주유비 계산",
 description:
 "이동 거리와 연비를 입력하여 예상 주유비를 계산해보세요. 출퇴근·여행 경로의 기름값을 리터당 유가 기준으로 즉시 확인할 수 있습니다.",
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
