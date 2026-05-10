import VatCalculator from "@/components/calculators/finance/VatCalculator";
import { Metadata } from "next";
import { Percent } from "lucide-react";

export const metadata: Metadata = {
 title: "부가세(VAT) 계산기 | Moneysalary",
 description: "공급가액 또는 합계금액을 기준으로 부가가치세(VAT)를 정확하게 계산합니다.",
};

export default function VatPage() {
 return (
 <main className="min-h-screen bg-canvas dark:bg-canvas-950 pt-24 sm:pt-28 pb-20">
 <div className="max-w-3xl mx-auto px-4 sm:px-6">
 <header className="text-center mb-10 sm:mb-12">
 <span className="inline-flex items-center gap-1.5 bg-primary-10 border border-primary-20 text-electric text-[12px] font-bold px-3 py-1 rounded-full mb-5">
 <Percent size={13} aria-hidden="true" /> 일반과세자 10%
 </span>
 <h1 className="text-3xl sm:text-4xl font-black text-navy dark:text-canvas-50 tracking-[-0.04em] mb-3 leading-[1.1]">
 부가세 계산기
 </h1>
 <p className="text-base sm:text-lg text-muted-blue dark:text-canvas-300 font-medium leading-relaxed">
 공급가·합계금액으로 부가세를 양방향 계산합니다
 </p>
 </header>
 <VatCalculator />
 </div>
 </main>
 );
}
