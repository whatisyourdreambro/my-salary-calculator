import { WorkDayCalculator } from "@/components/calculators/date/DateCalculators";
import { CalcResultAd } from "@/components/AdPlacement";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildToolMetadata } from "@/lib/seo";

// buildToolMetadata 수렴 (2026-08-24): "{name} 2026 — {tagline}" 표준 패턴 + type=tool OG
export const metadata: Metadata = buildToolMetadata({
 name: "영업일 계산기",
 tagline: "주말 제외 실제 근무일수 계산",
 description:
 "주말을 제외한 실제 근무일(영업일) 수를 계산해보세요. 시작일과 종료일만 입력하면 프로젝트 일정·납기·급여 산정에 필요한 영업일수를 즉시 확인할 수 있습니다.",
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
