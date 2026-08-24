import { NumberGenerator } from "@/components/calculators/math/MathCalculators";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { CalcResultAd } from "@/components/AdPlacement";
import { buildToolMetadata } from "@/lib/seo";

// buildToolMetadata 수렴 (2026-08-24): "{name} 2026 — {tagline}" 표준 패턴 + type=tool OG
export const metadata: Metadata = buildToolMetadata({
 name: "랜덤 숫자 생성기",
 tagline: "로또 번호·추첨용 난수 생성",
 description:
 "로또 번호 생성, 추첨 등 다양한 용도의 랜덤 숫자를 생성해보세요. 범위와 개수를 정하면 중복 없는 난수를 즉시 뽑아드립니다.",
 path: "/tools/math/number-gen",
});

export default function NumberGenPage() {
 return (
 <div className="min-h-screen bg-canvas pt-28 pb-20 px-4">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl font-bold text-navy mb-8">랜덤 숫자 생성기</h1>
 <NumberGenerator />
 {/* 결과 직하 광고 */}
 <CalcResultAd />
 </div>
 <ToolPageContent path="/tools/math/number-gen" />
 </div>
 );
}
