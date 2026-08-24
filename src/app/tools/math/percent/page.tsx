import { PercentCalculator } from "@/components/calculators/math/MathCalculators";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { CalcResultAd } from "@/components/AdPlacement";
import { buildToolMetadata } from "@/lib/seo";

// buildToolMetadata 수렴 (2026-08-24): "{name} 2026 — {tagline}" 표준 패턴 + type=tool OG
export const metadata: Metadata = buildToolMetadata({
 name: "퍼센트 계산기",
 tagline: "비율·증감률·할인율 즉시 계산",
 description:
 "전체값에 대한 비율, 비율에 대한 값 등 다양한 퍼센트 계산을 지원합니다. 할인율·증감률·비중 계산을 입력 즉시 확인하세요.",
 path: "/tools/math/percent",
});

export default function PercentPage() {
 return (
 <div className="min-h-screen bg-canvas pt-28 pb-20 px-4">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl font-bold text-navy mb-8">퍼센트 계산기</h1>
 <PercentCalculator />
 {/* 결과 직하 광고 */}
 <CalcResultAd />
 </div>
 <ToolPageContent path="/tools/math/percent" />
 </div>
 );
}
