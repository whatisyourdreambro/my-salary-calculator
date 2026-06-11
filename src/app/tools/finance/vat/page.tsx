import VatCalculator from "@/components/calculators/finance/VatCalculator";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "부가세(VAT) 계산기",
 description: "공급가액 또는 합계금액을 기준으로 부가가치세(VAT)를 정확하게 계산합니다.",
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
 </div>
 <ToolPageContent path="/tools/finance/vat" />
 </div>
 );
}
