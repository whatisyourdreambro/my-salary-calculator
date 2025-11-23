import SalaryRankCalculator from "@/components/calculators/SalaryRankCalculator";
import AdUnit from "@/components/AdUnit";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "내 연봉 순위 계산기 - 나는 상위 몇 %일까? | MoneySalary",
    description: "재미로 보는 연봉 서열! 내 연봉은 대한민국 상위 몇 %인지 확인하고 티어를 발급받으세요.",
    openGraph: {
        title: "내 연봉 순위 계산기 - 나는 상위 몇 %일까?",
        description: "재미로 보는 연봉 서열! 내 연봉은 대한민국 상위 몇 %인지 확인하고 티어를 발급받으세요.",
        images: ["/og-salary-rank.png"], // Assuming we'll add this later
    },
};

export default function SalaryRankPage() {
    return (
        <main className="w-full min-h-screen bg-zinc-950 flex flex-col items-center py-12 px-4 font-sans text-zinc-100">
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 shadow-sm border border-zinc-800 text-yellow-400 font-medium text-sm mb-4 animate-bounce">
                    <span>👑</span>
                    <span>지금 가장 핫한 계산기</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
                    내 연봉은 <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">상위 몇 %</span>일까?
                </h1>
                <p className="text-zinc-400 text-lg">
                    나이와 연봉을 입력하고 나의 <span className="text-white font-bold">연봉 계급</span>을 확인하세요.
                </p>
            </div>

            <SalaryRankCalculator />

            <div className="mt-16 w-full max-w-4xl">
                <AdUnit slotId="9998887776" format="auto" label="Salary Rank Bottom Ad" />
            </div>
        </main>
    );
}
