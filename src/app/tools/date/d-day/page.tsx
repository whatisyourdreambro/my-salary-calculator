import { DDayCalculator } from "@/components/calculators/date/DateCalculators";
import { CalcResultAd } from "@/components/AdPlacement";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildToolMetadata } from "@/lib/seo";

// buildToolMetadata 수렴 (2026-08-24): "{name} 2026 — {tagline}" 표준 패턴 + type=tool OG
export const metadata: Metadata = buildToolMetadata({
 name: "D-Day 디데이 계산기",
 tagline: "시험·전역·기념일 남은 날짜 계산",
 description:
 "시험, 기념일, 전역일 등 중요한 날짜까지 남은 시간을 계산해보세요. 목표일을 입력하면 오늘부터 남은 일수(D-Day)를 즉시 확인할 수 있습니다.",
 path: "/tools/date/d-day",
});

export default function DDayPage() {
 return (
 <div className="min-h-screen bg-canvas pt-28 pb-20 px-4">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl font-bold text-navy mb-8">D-Day 계산기</h1>
 <DDayCalculator />
 {/* 결과 직하 광고 */}
 <CalcResultAd />
 </div>
 <ToolPageContent path="/tools/date/d-day" />
 </div>
 );
}
