// src/app/salary/[amount]/page.tsx

import { Metadata } from "next";
import Link from "next/link";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { calculateSalaryRank } from "@/data/salaryRankData";
import AdUnit from "@/components/AdUnit";
import WealthChart from "@/components/WealthChart";
import SalaryTierCard from "@/components/SalaryTierCard";
import SalaryResultCard from "@/components/SalaryResultCard";
import {
  ArrowLeft,
  Calculator,
  Sparkles,
  TrendingUp,
  ChevronRight
} from "lucide-react";

// Helper to parse dynamic segment
function parseSalaryParam(param: string): number {
  const manwonMatch = param.match(/^(\d+)-manwon$/);
  if (manwonMatch) return parseInt(manwonMatch[1]) * 10000;
  const eokMatch = param.match(/^(\d+)-eok$/);
  if (eokMatch) return parseInt(eokMatch[1]) * 100000000;
  const eokHalfMatch = param.match(/^(\d+)-5-eok$/);
  if (eokHalfMatch) return parseInt(eokHalfMatch[1]) * 100000000 + 50000000;
  const numeric = parseInt(param, 10);
  if (!isNaN(numeric) && numeric > 1000) return numeric;
  return 50000000;
}

export const dynamic = 'force-static';
export async function generateStaticParams() {
  const params: { amount: string }[] = [];
  const salaries = [3000, 3500, 4000, 4500, 5000, 6000, 7000, 8000, 9000];
  salaries.forEach(s => params.push({ amount: `${s}-manwon` }));
  [1, 1.5, 2].forEach(e => params.push({ amount: `${e}-eok`.replace(".5", "-5") }));
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
  const tax = calculateSalary2026(amount, 200000, 1, 0);
  
  const formattedAmount = amount >= 100000000 
    ? `${(amount / 100000000).toFixed(1)}억` 
    : `${(amount / 10000).toLocaleString()}만원`;

  const amountDisplay = amount >= 100000000 ? `${(amount / 100000000).toFixed(1)}억` : `${(amount/10000)}`;
  const netDisplay = tax.netPay.toLocaleString();

  const ogUrl = `/api/og?amount=${amountDisplay}&net=${netDisplay}`;

  return {
    title: `2026년 연봉 ${formattedAmount} 실수령액은? | 머니샐러리`,
    description: `연봉 ${formattedAmount}의 2026년 예상 월 실수령액은 ${netDisplay}원입니다. 세금 공제 내역을 확인하세요.`,
    alternates: {
      canonical: `https://moneysalary.com/salary/${params.amount}`,
    },
    openGraph: {
      images: [ogUrl],
    },
  };
}

export default function SalaryAmountPage({ params }: Props) {
  const amount = parseSalaryParam(params.amount);
  const tax = calculateSalary2026(amount, 200000, 1, 0);
  
  const formattedAmount = amount >= 100000000 
    ? `${(amount / 100000000).toFixed(1)}억` 
    : `${(amount / 10000).toLocaleString()}만원`;

  // JSON-LD for this specific salary
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialApplication",
    "name": `Salary Analysis for ${formattedAmount}`,
    "description": `2026 Salary breakdown for ${formattedAmount}`,
    "applicationCategory": "FinanceApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "KRW"
    }
  };

  return (
    <main className="min-h-screen bg-white pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Header Area */}
      <div className="pt-12 px-6 flex flex-col items-center">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="text-xs font-bold">전체 계산기로 돌아가기</span>
        </Link>
        
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">2026 REPORT</span>
          <Sparkles size={14} className="text-[#FFD700]" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-800 text-center mb-12">
          연봉 <span className="text-primary">{formattedAmount}</span>의<br />
          월 실수령액 분석
        </h1>

        <SalaryResultCard 
          monthlyNet={tax.netPay}
          totalDeduction={tax.totalDeductions}
          breakdown={{
            pension: tax.nationalPension,
            health: tax.healthInsurance,
            longTermCare: tax.longTermCare,
            employment: tax.employmentInsurance,
            incomeTax: tax.incomeTax,
            localTax: tax.localTax
          }}
        />

        <div className="w-full mt-12 space-y-12">
          <WealthChart monthlyNetSalary={tax.netPay} />
          <SalaryTierCard annualSalary={amount} />
          
          <div className="px-6">
            <AdUnit slotId="5492837410" format="auto" />
          </div>

          {/* SEO Footer Links */}
          <div className="pt-12 border-t border-slate-100 px-6">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 text-center">다른 연봉 리포트</h2>
            <div className="grid grid-cols-2 gap-3">
              {[4000, 5000, 6000, 8000].map(s => (
                <Link 
                  key={s} 
                  href={`/salary/${s}-manwon`}
                  className="p-4 bg-slate-50 rounded-2xl text-xs font-bold text-slate-600 flex justify-between items-center hover:bg-slate-100 transition-colors"
                >
                  연봉 {s}만원 <ChevronRight size={14} className="text-slate-300" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}