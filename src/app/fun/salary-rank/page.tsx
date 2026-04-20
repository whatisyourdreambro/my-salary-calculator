import SalaryRankCalculator from "@/components/calculators/SalaryRankCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
 title: "내 연봉 순위 계산기 - 나는 상위 몇%일까? | MoneySalary",
 description: "대한민국 연봉 분포! 내 연봉의 전국 상위 몇%인지 확인하고 어워드를 발급받으세요.",
 openGraph: {
 title: "내 연봉 순위 계산기 - 나는 상위 몇%일까?",
 description: "대한민국 연봉 분포! 내 연봉의 전국 상위 몇%인지 확인하고 어워드를 발급받으세요.",
 },
};

export default function SalaryRankPage() {
 return (
 <main className="w-full min-h-screen bg-canvas -[#191F28] pt-28 px-4 pb-20 font-sans">
 <div className="text-center mb-12 max-w-2xl mx-auto">
 <h1 className="text-4xl font-black tracking-tight text-navy mb-4">
 내 연봉은 <span className="text-primary">상위 몇%</span>일까?
 </h1>
 <p className="text-lg text-faint-blue font-medium">
 대한민국 직장인 연봉 분포에서 나의 위치를 확인하세요.
 </p>
 </div>

 

 <SalaryRankCalculator />

 
 </main>
 );
}