import CagrCalculator from "@/components/calculators/finance/CagrCalculator";
import { CalcResultAd } from "@/components/AdPlacement";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildToolMetadata } from "@/lib/seo";

// buildToolMetadata 수렴 (2026-08-24): "{name} 2026 — {tagline}" 표준 패턴 + type=tool OG
export const metadata: Metadata = buildToolMetadata({
 name: "CAGR(연평균 성장률) 계산기",
 tagline: "복리 기준 투자 수익률 분석",
 description:
 "투자의 연평균 성장률(Compound Annual Growth Rate)을 계산하여 성과를 분석하세요. 시작 금액·최종 금액·기간만 입력하면 복리 기준 연평균 수익률을 즉시 확인할 수 있습니다.",
 path: "/tools/finance/cagr",
});

export default function CagrPage() {
 return (
 <div className="min-h-screen pt-24 pb-20">
 <div className="page-width">
 <div className="text-center mb-12">
 <h1 className="text-4xl font-black text-navy mb-4">CAGR 계산기</h1>
 <p className="text-muted-blue">복리 효과를 고려한 진정한 투자 수익률</p>
 </div>
 <CagrCalculator />
 {/* 결과 직하 광고 */}
 <CalcResultAd />
 </div>
 <ToolPageContent path="/tools/finance/cagr" />
 </div>
 );
}
