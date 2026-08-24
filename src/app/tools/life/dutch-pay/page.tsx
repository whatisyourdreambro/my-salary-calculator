import { DutchPayCalculator } from "@/components/calculators/life/LifeCalculators";
import { CalcResultAd } from "@/components/AdPlacement";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildToolMetadata } from "@/lib/seo";

// buildToolMetadata 수렴 (2026-08-24): "{name} 2026 — {tagline}" 표준 패턴 + type=tool OG
export const metadata: Metadata = buildToolMetadata({
 name: "N빵 계산기",
 tagline: "회식·모임·여행 더치페이 정산",
 description:
 "회식, 모임, 여행 경비를 인원수대로 정확하게 나누어 계산합니다. 총 금액과 인원만 입력하면 1인당 부담금을 즉시 확인할 수 있는 더치페이 정산 도구입니다.",
 path: "/tools/life/dutch-pay",
});

export default function DutchPayPage() {
 return (
 <div className="min-h-screen bg-canvas pt-28 pb-20 px-4">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl font-bold text-navy mb-8">N빵 계산기</h1>
 <DutchPayCalculator />
 {/* 결과 직하 광고 */}
 <CalcResultAd />
 </div>
 <ToolPageContent path="/tools/life/dutch-pay" />
 </div>
 );
}
