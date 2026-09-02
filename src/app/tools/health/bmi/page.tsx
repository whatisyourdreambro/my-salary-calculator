import BmiCalculator from "@/components/calculators/health/BmiCalculator";
import { CalcResultAd } from "@/components/AdPlacement";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "BMI 비만도 계산기 — 신장·체중으로 체질량지수·비만 판정",
 description: "신장(cm)과 체중(kg)으로 BMI(체질량지수)를 계산하고 한국·아시아 기준(저체중 18.5 미만, 정상 18.5~22.9, 과체중 23~24.9, 비만 25 이상)으로 즉시 판정합니다. 예: 170cm·70kg → BMI 24.2 과체중.",
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
