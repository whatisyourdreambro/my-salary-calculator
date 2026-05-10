import DepositCalculator from "@/components/calculators/DepositCalculator";
import { Metadata } from "next";
import { PiggyBank } from "lucide-react";

export const metadata: Metadata = {
 title: "예적금 계산기 (이자/세금) | Moneysalary",
 description: "예금, 적금 이자와 세후 수령액을 계산해보세요. 일반과세, 세금우대, 비과세 적용 가능.",
};

export default function DepositCalculatorPage() {
 return (
 <main className="min-h-screen bg-canvas dark:bg-canvas-950 pt-24 sm:pt-28 pb-20">
 <div className="max-w-3xl mx-auto px-4 sm:px-6">
 <header className="text-center mb-10 sm:mb-12">
 <span className="inline-flex items-center gap-1.5 bg-primary-10 border border-primary-20 text-electric text-[12px] font-bold px-3 py-1 rounded-full mb-5">
 <PiggyBank size={13} aria-hidden="true" /> 세후 수령액
 </span>
 <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-navy dark:text-canvas-50 tracking-[-0.04em] mb-4 leading-[1.1]">
 예적금 계산기
 </h1>
 <p className="text-base sm:text-lg text-muted-blue dark:text-canvas-300 max-w-xl mx-auto font-medium leading-relaxed">
 목돈 굴리기(예금)와 목돈 만들기(적금)의 만기 수령액을
 <br className="hidden sm:block" />
 이자소득세(15.4%)까지 고려해 정확하게 계산합니다.
 </p>
 </header>
 <DepositCalculator />
 </div>
 </main>
 );
}
