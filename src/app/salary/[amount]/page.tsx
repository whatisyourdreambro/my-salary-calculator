// src/app/salary/[amount]/page.tsx

import { Metadata } from "next";
import Link from "next/link";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { calculateSalaryRank } from "@/data/salaryRankData";
import AdUnit from "@/components/AdUnit";
import WealthChart from "@/components/WealthChart";
import SalaryTierCard from "@/components/SalaryTierCard";
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  TrendingUp,
  Wallet,
  Zap
} from "lucide-react";

// Helper to parse dynamic segment (amount or slug)
function parseSalaryParam(param: string): number {
  // Case 1: Semantic slug (e.g., "5000-manwon")
  const manwonMatch = param.match(/^(\d+)-manwon$/);
  if (manwonMatch) return parseInt(manwonMatch[1]) * 10000;
  
  const eokMatch = param.match(/^(\d+)-eok$/);
  if (eokMatch) return parseInt(eokMatch[1]) * 100000000;
  
  const eokHalfMatch = param.match(/^(\d+)-5-eok$/);
  if (eokHalfMatch) return parseInt(eokHalfMatch[1]) * 100000000 + 50000000;

  // Case 2: Numeric string (e.g., "50000000")
  const numeric = parseInt(param, 10);
  if (!isNaN(numeric) && numeric > 1000) return numeric;

  return 50000000; // Default
}

export const dynamic = 'force-static';
export async function generateStaticParams() {
  const params: { amount: string }[] = [];

  // Semantic Slugs (High SEO Volume)
  const salaries = [3000, 3500, 4000, 4500, 5000, 6000, 7000, 8000, 9000];
  salaries.forEach(s => params.push({ amount: `${s}-manwon` }));
  [1, 1.5, 2].forEach(e => params.push({ amount: `${e}-eok`.replace(".5", "-5") }));

  // Numeric amounts (Backward compatibility)
  for (let i = 30; i <= 100; i += 5) {
    params.push({ amount: (i * 1000000).toString() });
  }

  return params;
}

type Props = {
  params: { amount: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const amount = parseSalaryParam(params.amount);
  const formattedAmount = amount >= 100000000 
    ? `${(amount / 100000000).toFixed(1)}억` 
    : `${(amount / 10000).toLocaleString()}만원`;

  return {
    title: `2026년 연봉 ${formattedAmount} 실수령액 및 연봉 티어 | 머니샐러리`,
    description: `연봉 ${formattedAmount}의 2026년 예상 월 실수령액과 공제 내역을 확인하세요. 상위 % 티어 카드와 미래 자산 시뮬레이션도 제공합니다.`,
    alternates: {
      canonical: `https://moneysalary.com/salary/${params.amount}`,
    },
  };
}

export default function SalaryAmountPage({ params }: Props) {
  const amount = parseSalaryParam(params.amount);
  
  // Use 2026 Logic
  const tax = calculateSalary2026(amount, 200000, 1, 0);
  const rank = calculateSalaryRank("30s", amount);
  
  const formattedAmount = amount >= 100000000 
    ? `${(amount / 100000000).toFixed(1)}억` 
    : `${(amount / 10000).toLocaleString()}만원`;

  const taxRate = ((tax.totalDeductions / (amount / 12)) * 100).toFixed(1);

  return (
    <main className="w-full bg-slate-50 min-h-screen pb-20">
      {/* Premium Hero Section */}
      <section className="relative py-16 sm:py-20 overflow-hidden bg-[#0F4C81] text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-8 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            <span>계산기로 돌아가기</span>
          </Link>
          
          <div className="flex flex-col md:flex-row items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold mb-4">
                <Calculator size={14} /> 2026년 최신 세법 적용
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-tight">
                연봉 <span className="text-[#FFD700]">{formattedAmount}</span>의<br />
                진짜 실수령액은?
              </h1>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl w-full md:w-auto min-w-[300px]">
                <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">월 예상 실수령액</p>
                <div className="text-4xl sm:text-5xl font-black flex items-baseline gap-1">
                    {tax.netPay.toLocaleString()}<span className="text-xl font-bold opacity-60">원</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs font-bold text-blue-100">
                    <span>공제액 합계: -{tax.totalDeductions.toLocaleString()}원</span>
                    <span>실효세율: {taxRate}%</span>
                </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20 space-y-12">
        {/* Ad Unit Top */}
        <AdUnit slotId="5492837410" format="auto" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Detailed Breakdown */}
            <div className="lg:col-span-3 space-y-8">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                            <Wallet className="text-[#0F4C81]" size={20} /> 급여 명세서 분석
                        </h2>
                        <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100">2026v.</span>
                    </div>
                    <div className="p-8 space-y-5">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                            <span className="text-gray-500 font-bold">세전 월급 (1/12)</span>
                            <span className="text-2xl font-black text-gray-800">{(amount / 12).toLocaleString()}원</span>
                        </div>
                        
                        <div className="space-y-4 pt-2">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">세금 및 4대보험 공제</p>
                            {[
                                { label: "국민연금 (4.5%)", value: tax.nationalPension, color: "bg-blue-400" },
                                { label: "건강보험 (3.545%)", value: tax.healthInsurance, color: "bg-green-400" },
                                { label: "장기요양 (12.95%)", value: tax.longTermCare, color: "bg-teal-400" },
                                { label: "고용보험 (0.9%)", value: tax.employmentInsurance, color: "bg-indigo-400" },
                                { label: "소득세 (간이세액)", value: tax.incomeTax, color: "bg-orange-400" },
                                { label: "지방소득세 (10%)", value: tax.localIncomeTax, color: "bg-amber-400" },
                            ].map((item) => (
                                <div key={item.label} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                        <span className="text-sm font-bold text-gray-600">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-black text-red-500">-{item.value.toLocaleString()}원</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 mt-6 border-t-2 border-dashed border-gray-100 flex justify-between items-center">
                            <span className="text-lg font-black text-gray-800">최종 실수령액</span>
                            <div className="text-3xl font-black text-[#0F4C81]">{tax.netPay.toLocaleString()}원</div>
                        </div>
                    </div>
                </div>

                {/* Expert Insight */}
                <div className="bg-[#0F4C81]/5 rounded-3xl p-8 border border-[#0F4C81]/10 flex gap-4">
                    <div className="text-3xl">💡</div>
                    <div>
                        <h4 className="font-black text-[#0F4C81] mb-2">머니샐러리 분석 리포트</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            연봉 {formattedAmount}의 실효세율은 약 {taxRate}% 입니다. 
                            이는 월급에서 약 {tax.totalDeductions.toLocaleString()}원이 세금과 보험료로 나가는 것을 의미합니다.
                            비과세 식대 20만원을 포함한 계산 결과이며, 개인의 부양가족 수에 따라 세액공제 혜택이 달라질 수 있습니다.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right: Tier Card & Ad */}
            <div className="lg:col-span-2 space-y-8">
                <SalaryTierCard annualSalary={amount} />
                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xl">
                    <span className="text-[10px] font-bold text-gray-300 block mb-2 uppercase tracking-widest">Sponsored Analysis</span>
                    <AdUnit slotId="5492837410" format="rectangle" />
                </div>
            </div>
        </div>

        {/* Phase 2: Wealth Simulation */}
        <div className="pt-8">
            <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="text-[#0F4C81]" size={24} />
                <h2 className="text-2xl font-black text-gray-800">미래 자산 성장 시뮬레이션</h2>
            </div>
            <WealthChart monthlyNetSalary={tax.netPay} />
        </div>

        {/* SEO Section: Popular Queries */}
        <div className="pt-16 border-t border-gray-200">
            <h2 className="text-center text-xl font-black text-gray-800 mb-8">사람들이 많이 찾는 다른 연봉</h2>
            <div className="flex flex-wrap justify-center gap-3">
                {[3000, 4000, 5000, 6000, 8000, 10000, 15000, 20000].map(s => (
                    <Link 
                        key={s} 
                        href={`/salary/${s >= 10000 ? `${s/10000}-eok` : `${s}-manwon`}`}
                        className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:border-[#0F4C81] hover:text-[#0F4C81] transition-all shadow-sm hover:shadow-md"
                    >
                        연봉 {s >= 10000 ? `${s/10000}억` : `${s.toLocaleString()}만원`}
                    </Link>
                ))}
            </div>
        </div>
      </div>
    </main>
  );
}