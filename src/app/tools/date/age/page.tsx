import { AgeCalculator } from "@/components/calculators/date/DateCalculators";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "만 나이 계산기 (Age Calculator)",
 description: "생년월일을 입력하면 만 나이와 연 나이를 정확하게 계산해드립니다.",
 path: "/tools/date/age",
});

export default function AgePage() {
 return (
 <div className="min-h-screen bg-canvas pt-28 pb-20 px-4">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl font-bold text-navy mb-8">만 나이 계산기</h1>
 <AgeCalculator />
 </div>
 <ToolPageContent path="/tools/date/age" />
 </div>
 );
}
