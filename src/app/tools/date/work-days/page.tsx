import { WorkDayCalculator } from "@/components/calculators/date/DateCalculators";
import { CalcResultAd } from "@/components/AdPlacement";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "영업일 계산기 — 주말 제외 근무일수 계산 (Business Days)",
 description: "시작일과 종료일 사이 주말(토·일)을 제외한 실제 근무일·영업일 수를 즉시 계산합니다. 연차 소진 계획, 납기·배송 기한, 프로젝트 일정 산정에 활용하세요.",
 path: "/tools/date/work-days",
});

export default function WorkDayPage() {
 return (
 <div className="min-h-screen bg-canvas pt-28 pb-20 px-4">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl font-bold text-navy mb-8">영업일 계산기</h1>
 <WorkDayCalculator />
 {/* 결과 직하 광고 */}
 <CalcResultAd />
 </div>
 <ToolPageContent path="/tools/date/work-days" />
 </div>
 );
}
