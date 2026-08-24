import { UnitConverter } from "@/components/calculators/life/LifeCalculators";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { CalcResultAd } from "@/components/AdPlacement";
import { buildToolMetadata } from "@/lib/seo";

// buildToolMetadata 수렴 (2026-08-24): "{name} 2026 — {tagline}" 표준 패턴 + type=tool OG
export const metadata: Metadata = buildToolMetadata({
 name: "단위 변환기",
 tagline: "길이·무게 등 생활 단위 즉시 환산",
 description:
 "길이, 무게 등 다양한 단위를 간편하게 변환하세요. cm·inch, kg·lb 같은 일상 단위 환산 결과를 입력 즉시 확인할 수 있습니다.",
 path: "/tools/life/unit-converter",
});

export default function UnitConverterPage() {
 return (
 <div className="min-h-screen bg-canvas pt-28 pb-20 px-4">
 <div className="max-w-2xl mx-auto">
 <h1 className="text-3xl font-bold text-navy mb-8">단위 변환기</h1>
 <UnitConverter />
 {/* 결과 직하 광고 */}
 <CalcResultAd />
 </div>
 <ToolPageContent path="/tools/life/unit-converter" />
 </div>
 );
}
