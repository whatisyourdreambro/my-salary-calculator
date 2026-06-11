import { WorkDayCalculator } from "@/components/calculators/date/DateCalculators";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "영업일 계산기 (Business Days)",
 description: "주말을 제외한 실제 근무일(영업일) 수를 계산해보세요.",
 path: "/tools/date/work-days",
});

export default function WorkDayPage() {
 return (
 <div className="min-h-screen bg-canvas pt-28 pb-20 px-4">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl font-bold text-navy mb-8">영업일 계산기</h1>
 <WorkDayCalculator />
 </div>
 <ToolPageContent path="/tools/date/work-days" />
 </div>
 );
}
