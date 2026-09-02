import { DDayCalculator } from "@/components/calculators/date/DateCalculators";
import { CalcResultAd } from "@/components/AdPlacement";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "D-Day 디데이 계산기 — 수능·시험·전역일 남은 날짜 계산",
 description: "목표 날짜 하나만 입력하면 오늘 기준 남은 날짜(D-N)와 지난 날짜(D+N)를 즉시 계산합니다. 수능·자격증 시험·전역일·기념일·출산 예정일 카운트다운에 활용하세요.",
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
