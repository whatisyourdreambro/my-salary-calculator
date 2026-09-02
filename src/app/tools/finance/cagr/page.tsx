import CagrCalculator from "@/components/calculators/finance/CagrCalculator";
import { CalcResultAd } from "@/components/AdPlacement";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "CAGR(연평균 성장률) 계산기 — 투자 수익률 연환산",
 description: "시작 금액·종료 금액·기간(년)만 입력하면 연평균 성장률(CAGR)을 즉시 계산합니다. 예: 1,000만원이 5년 뒤 2,000만원이면 CAGR 약 14.9%. 주식·펀드·부동산 수익률을 연 단위로 비교하세요.",
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
