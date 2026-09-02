import { NumberGenerator } from "@/components/calculators/math/MathCalculators";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { CalcResultAd } from "@/components/AdPlacement";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "랜덤 숫자 생성기 — 로또 번호·추첨 중복 없는 난수 (RNG)",
 description: "최소값·최대값·개수를 정하면 중복 없는 랜덤 숫자를 오름차순으로 생성합니다. 기본값은 로또 번호(1~45 중 6개)이며 경품 추첨·순서 정하기·자리 배정에도 활용하세요.",
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
