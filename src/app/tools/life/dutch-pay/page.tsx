import { DutchPayCalculator } from "@/components/calculators/life/LifeCalculators";
import { CalcResultAd } from "@/components/AdPlacement";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "N빵 계산기 — 회식·모임 1인당 정산 금액 계산 (Dutch Pay)",
 description: "회식·모임·여행 총 금액과 인원수만 입력하면 1인당 부담금을 10원 단위 올림으로 즉시 계산합니다. 예: 187,000원을 7명이 나누면 1인당 26,720원.",
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
