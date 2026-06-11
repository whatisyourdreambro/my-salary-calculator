import BmiCalculator from "@/components/calculators/health/BmiCalculator";
import { Metadata } from "next";
import ToolPageContent from "@/components/tool/ToolPageContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "BMI 비만도 계산기",
 description: "신장과 체중을 입력하여 비만도(BMI)를 측정하고 건강 상태를 확인하세요.",
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
 </div>
 <ToolPageContent path="/tools/health/bmi" />
 </div>
 );
}
