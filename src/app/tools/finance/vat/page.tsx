import VatCalculator from "@/components/calculators/finance/VatCalculator";
import { CalcResultAd } from "@/components/AdPlacement";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "부가세(VAT) 계산기 — 공급가액·합계금액 10% 역산",
 description: "합계금액(부가세 포함) 또는 공급가액(부가세 별도) 중 하나만 입력하면 부가세 10%와 나머지 금액을 즉시 역산합니다. 예: 합계 110만원 → 공급가액 100만원 + 부가세 10만원.",
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
