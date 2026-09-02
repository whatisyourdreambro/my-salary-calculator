import { UnitConverter } from "@/components/calculators/life/LifeCalculators";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { CalcResultAd } from "@/components/AdPlacement";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "단위 변환기 — cm→inch·ft, kg→lb 변환 (Unit Converter)",
 description: "센티미터(cm)를 인치(inch)·피트(feet)로, 킬로그램(kg)을 파운드(lb)로 즉시 변환합니다. 예: 175cm = 68.9인치·5.74피트, 70kg = 154.3lb. 해외 직구 사이즈·체중 단위 확인에 활용하세요.",
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
