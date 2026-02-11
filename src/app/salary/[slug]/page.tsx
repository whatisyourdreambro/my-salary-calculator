// src/app/salary/[slug]/page.tsx

import { Metadata } from "next";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { calculateSalaryRank } from "@/data/salaryRankData";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowLeft } from "lucide-react";

interface Props {
  params: { slug: string };
}

// Helper to parse slug (e.g., "5000-manwon" -> 50000000)
function parseSalarySlug(slug: string): number | null {
  const match = slug.match(/^(\d+)-manwon$/);
  if (match) return parseInt(match[1]) * 10000;
  
  const matchEok = slug.match(/^(\d+)-eok$/);
  if (matchEok) return parseInt(matchEok[1]) * 100000000;

  return null;
}

export async function generateStaticParams() {
  const salaries = [
    3000, 3500, 4000, 4500, 5000, 6000, 7000, 8000, 9000 // Man-won
  ];
  const eoks = [1, 1.5, 2]; // Eok-won

  const params = [
    ...salaries.map(s => ({ slug: `${s}-manwon` })),
    ...eoks.map(e => ({ slug: `${e}-eok`.replace(".5", "-5") }))
  ];

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const salary = parseSalarySlug(params.slug);
  if (!salary) return { title: "Salary Calculator" };

  const salaryDisplay = salary >= 100000000 
    ? `${(salary / 100000000).toFixed(1)}억` 
    : `${(salary / 10000).toLocaleString()}만원`;

  return {
    title: `2026년 ${salaryDisplay} 실수령액 및 연봉 티어 | 머니샐러리`,
    description: `2026년 최신 세법 기준 ${salaryDisplay}의 월 실수령액은 얼마일까요? 공제액(국민연금, 건강보험 등)과 상위 % 연봉 티어를 확인하세요.`,
    keywords: [`연봉 ${salaryDisplay}`, "2026 실수령액", "연봉계산기", "머니샐러리"],
  };
}

export default function SalarySlugPage({ params }: Props) {
  const salary = parseSalarySlug(params.slug);
  if (!salary) notFound();

  const tax = calculateSalary2026(salary, 200000, 1, 0);
  const rank = calculateSalaryRank("30s", salary);

  const salaryDisplay = salary >= 100000000 
    ? `${(salary / 100000000).toFixed(1)}억` 
    : `${(salary / 10000).toLocaleString()}만원`;

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold mb-8 hover:underline">
        <ArrowLeft size={16} /> 전체 계산기로 돌아가기
      </Link>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden">
        <div className="bg-[#0F4C81] p-8 text-white">
          <h1 className="text-3xl font-black mb-2">2026년 연봉 {salaryDisplay} 실수령액</h1>
          <p className="opacity-80">최신 세법 및 공제 요율이 적용된 분석 보고서입니다.</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">월 예상 실수령액</h2>
                <div className="text-5xl font-black text-[#0F4C81]">
                  {tax.netPay.toLocaleString()}<span className="text-xl ml-1 font-bold">원</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">국민연금 (4.5%)</span>
                  <span className="font-medium">-{tax.nationalPension.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">건강보험 (3.545%)</span>
                  <span className="font-medium">-{tax.healthInsurance.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">소득세 (지방세 포함)</span>
                  <span className="font-medium">-{(tax.incomeTax + tax.localIncomeTax).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-dashed border-gray-200">
                  <span>총 공제액</span>
                  <span className="text-red-500">-{tax.totalDeductions.toLocaleString()}원</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
               <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${rank.color} flex items-center justify-center text-4xl shadow-lg`}>
                  {rank.icon}
               </div>
               <div>
                  <div className="text-xs font-bold text-gray-400 uppercase mb-1">My Salary Rank</div>
                  <div className="text-3xl font-black text-gray-800">{rank.name}</div>
                  <div className="text-primary font-bold mt-1">상위 {rank.percentile}%</div>
               </div>
               <p className="text-sm text-gray-500 leading-relaxed px-4">
                  "{rank.message}"
               </p>
            </div>
          </div>

          <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-6">
             <h3 className="font-bold text-[#0F4C81] flex items-center gap-2 mb-3">
                <CheckCircle size={18}/> 전문가 팁
             </h3>
             <p className="text-sm text-gray-700 leading-relaxed">
                2026년 기준 연봉 {salaryDisplay}원은 월 실수령액 약 {tax.netPay.toLocaleString()}원 수준입니다. 
                비과세 한도(식대 등)와 부양가족 수에 따라 약간의 차이가 발생할 수 있으며, 
                중소기업 취업 청년이라면 소득세 감면 혜택을 통해 실수령액을 더 높일 수 있습니다.
             </p>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-xl font-bold mb-6">다른 연봉도 확인해보세요</h2>
        <div className="flex flex-wrap justify-center gap-2">
           {[4000, 5000, 6000, 8000, 10000].map(s => (
             <Link 
                key={s} 
                href={`/salary/${s >= 10000 ? `${s/10000}-eok` : `${s}-manwon`}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:border-primary hover:text-primary transition-colors"
             >
                연봉 {s >= 10000 ? `${s/10000}억` : `${s}만원`}
             </Link>
           ))}
        </div>
      </div>
    </main>
  );
}
