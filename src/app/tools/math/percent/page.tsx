import { PercentCalculator } from "@/components/calculators/math/MathCalculators";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { CalcResultAd } from "@/components/AdPlacement";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "퍼센트 계산기 — 비율·할인율·몇 % 계산 (Percentage)",
 description: "전체값의 X%는 얼마인지, 일부값이 전체의 몇 %인지 두 가지 방식으로 즉시 계산합니다. 예: 250,000원의 15% = 37,500원, 30명 중 12명 = 40%. 할인율·비중·달성률 계산에 활용하세요.",
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
