// src/app/salary/[amount]/page.tsx

import { Metadata } from "next";
import Link from "next/link";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import AdUnit from "@/components/AdUnit";
import WealthChart from "@/components/WealthChart";
import SalaryTierCard from "@/components/SalaryTierCard";
import SalaryResultCard from "@/components/SalaryResultCard";
import { ArrowLeft, Sparkles, ChevronRight } from "lucide-react";

// [필수] Cloudflare Pages 호환을 위해 순수 Edge 런타임만 선언합니다.
export const runtime = "edge";

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

type Props = {
  params: { amount: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const amount = parseSalaryParam(params.amount);
  const tax = calculateSalary2026(amount, 200000, 1, 0);

  const formattedAmount =
    amount >= 100000000
      ? `${(amount / 100000000).toFixed(1)}억`
      : `${(amount / 10000).toLocaleString()}만원`;

  const amountDisplay =
    amount >= 100000000
      ? `${(amount / 100000000).toFixed(1)}억`
      : `${amount / 10000}`;
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

  const formattedAmount =
    amount >= 100000000
      ? `${(amount / 100000000).toFixed(1)}억`
      : `${(amount / 10000).toLocaleString()}만원`;

  const jsonLd = {
    "@context": "[https://schema.org](https://schema.org)",
    "@type": "FinancialApplication",
    name: `Salary Analysis for ${formattedAmount}`,
    description: `2026 Salary breakdown for ${formattedAmount}`,
    applicationCategory: "FinanceApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
    },
  };

  return (
    <main className="min-h-screen bg-transparent pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="pt-8 px-6 flex flex-col items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-xs font-bold">전체 계산기로 돌아가기</span>
        </Link>

        {/* 상단 배너 광고 */}
        <div className="w-full max-w-4xl mb-8">
          <AdUnit slotId="9958502911" format="auto" label="상단 배너" />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
            2026 REPORT
          </span>
          <Sparkles size={14} className="text-[#FFD700]" />
        </div>

        <h1 className="text-3xl font-black text-slate-800 text-center mb-10">
          연봉 <span className="text-primary">{formattedAmount}</span>의<br />월
          실수령액 분석
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
            localTax: tax.localIncomeTax,
          }}
        />

        {/* 결과창 프리미엄 본문 광고 */}
        <div className="w-full max-w-4xl mt-10">
          <AdUnit slotId="5584143639" format="auto" label="결과창 프리미엄" />
        </div>

        <div className="w-full mt-10 space-y-12">
          <WealthChart monthlyNetSalary={tax.netPay} />
          <SalaryTierCard annualSalary={amount} />

          <div className="pt-12 border-t border-slate-200 px-6 max-w-4xl mx-auto w-full">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 text-center">
              다른 연봉 리포트
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[4000, 5000, 6000, 8000].map((s) => (
                <Link
                  key={s}
                  href={`/salary/${s}-manwon`}
                  className="p-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 flex justify-between items-center hover:border-primary hover:text-primary transition-colors shadow-sm"
                >
                  연봉 {s}만원{" "}
                  <ChevronRight size={14} className="text-slate-300" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
