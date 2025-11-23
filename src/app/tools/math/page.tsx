import MathCalculators from "@/components/calculators/MathCalculators";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "퍼센트 계산기 & 단위 변환 | Moneysalary",
    description: "비율, 비중, 증감율 등 다양한 퍼센트 계산과 단위 변환을 쉽고 빠르게.",
};

export default function MathPage() {
    return (
        <div className="min-h-screen pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        수학 도구 모음
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        일상 생활에 필요한 퍼센트 계산과 단위 변환을 <br className="hidden sm:block" />
                        직관적인 UI로 해결하세요.
                    </p>
                </div>
                <MathCalculators />
            </div>
        </div>
    );
}
