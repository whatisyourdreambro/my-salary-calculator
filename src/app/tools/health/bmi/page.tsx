import BmiCalculator from "@/components/calculators/health/BmiCalculator";
import { CalcResultAd } from "@/components/AdPlacement";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildToolMetadata } from "@/lib/seo";

// buildToolMetadata 수렴 (2026-08-24): "{name} 2026 — {tagline}" 표준 패턴 + type=tool OG
export const metadata: Metadata = buildToolMetadata({
 name: "BMI 비만도 계산기",
 tagline: "키·몸무게로 체질량지수 즉시 확인",
 description:
 "신장과 체중을 입력하여 비만도(BMI)를 측정하고 건강 상태를 확인하세요. 저체중·정상·과체중·비만 구간을 체질량지수 기준으로 즉시 판정해드립니다.",
 path: "/tools/health/bmi",
});

export default function BmiPage() {
 return (
 <div className="min-h-screen pt-24 pb-20">
 <div className="page-width">
 <div className="text-center mb-12">
 <h1 className="text-4xl font-black text-navy mb-4">BMI 계산기</h1>
 <p className="text-muted-blue">나의 체질량지수(Body Mass Index) 확인하기</p>
 </div>
 <BmiCalculator />
 {/* 결과 직하 광고 */}
 <CalcResultAd />
 </div>
 <ToolPageContent path="/tools/health/bmi" />
 </div>
 );
}
