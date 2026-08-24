import VatCalculator from "@/components/calculators/finance/VatCalculator";
import { CalcResultAd } from "@/components/AdPlacement";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildToolMetadata } from "@/lib/seo";

// buildToolMetadata 수렴 (2026-08-24): "{name} 2026 — {tagline}" 표준 패턴 + type=tool OG
export const metadata: Metadata = buildToolMetadata({
 name: "부가세(VAT) 계산기",
 tagline: "공급가액·합계금액 10% 자동 계산",
 description:
 "공급가액 또는 합계금액을 기준으로 부가가치세(VAT)를 정확하게 계산합니다. 일반과세자 10% 세율 기준 세액·공급가액 분리를 즉시 확인하세요.",
 path: "/tools/finance/vat",
});

export default function VatPage() {
 return (
 <div className="min-h-screen pt-24 pb-20">
 <div className="page-width">
 <div className="text-center mb-12">
 <h1 className="text-4xl font-black text-navy mb-4">부가세 계산기</h1>
 <p className="text-muted-blue">일반과세자 10% 세율 적용</p>
 </div>
 <VatCalculator />
 {/* 결과 직하 광고 */}
 <CalcResultAd />
 </div>
 <ToolPageContent path="/tools/finance/vat" />
 </div>
 );
}
