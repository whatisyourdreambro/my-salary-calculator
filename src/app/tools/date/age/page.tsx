import { AgeCalculator } from "@/components/calculators/date/DateCalculators";
import { CalcResultAd } from "@/components/AdPlacement";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildToolMetadata } from "@/lib/seo";

// buildToolMetadata 수렴 (2026-08-24): "{name} 2026 — {tagline}" 표준 패턴 + type=tool OG
export const metadata: Metadata = buildToolMetadata({
 name: "만 나이 계산기",
 tagline: "생년월일로 만 나이·연 나이 즉시 확인",
 description:
 "생년월일을 입력하면 만 나이 통일법 기준 만 나이와 연 나이를 오늘 날짜 기준으로 정확하게 계산해드립니다. 시험·병역·보험 등 만 나이 확인이 필요할 때 바로 사용하세요.",
 path: "/tools/date/age",
});

export default function AgePage() {
 return (
 <div className="min-h-screen bg-canvas pt-28 pb-20 px-4">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl font-bold text-navy mb-8">만 나이 계산기</h1>
 <AgeCalculator />
 {/* 결과 직하 광고 */}
 <CalcResultAd />
 </div>
 <ToolPageContent path="/tools/date/age" />
 </div>
 );
}
