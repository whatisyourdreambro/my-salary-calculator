// src/app/salary/[amount]/page.tsx

import { Metadata } from "next";
import Link from "next/link";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import WealthChart from "@/components/WealthChart";
import SalaryTierCard from "@/components/SalaryTierCard";
import SalaryResultCard from "@/components/SalaryResultCard";
import RelatedCalculators from "@/components/RelatedCalculators";
import JsonLd from "@/components/JsonLd";
import { ArrowLeft, Sparkles, ChevronRight, ArrowRight } from "lucide-react";
import { buildSalaryAmountMetadata } from "@/lib/seo";
import {
 breadcrumbLd,
 faqLd,
 softwareApplicationLd,
} from "@/lib/structuredData";

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
 return buildSalaryAmountMetadata(amount);
}

function buildSalaryFaq(amount: number, monthlyNet: number, totalDeduction: number) {
 const manwon = Math.round(amount / 10000).toLocaleString("ko-KR");
 const netManwon = (monthlyNet / 10000).toFixed(0);
 const deductionManwon = (totalDeduction / 10000).toFixed(0);
 const dsrLimit = Math.round((amount * 0.4) / 10000).toLocaleString("ko-KR");

 return [
 {
 question: `연봉 ${manwon}만원의 월 실수령액은 얼마인가요?`,
 answer: `연봉 ${manwon}만원의 2026년 세법 기준 월 실수령액은 약 ${netManwon}만원입니다. 4대보험과 소득세를 포함한 월 공제액은 약 ${deductionManwon}만원입니다 (비과세 식대 20만원 + 본인 1인 공제 적용 기준).`,
 },
 {
 question: `연봉 ${manwon}만원으로 받을 수 있는 대출 한도는?`,
 answer: `2026년 DSR 40% 규제 기준, 연봉 ${manwon}만원이면 연간 원리금 상환 한도는 약 ${dsrLimit}만원입니다. 이는 모든 대출(주담대·신용대출·할부 등)을 합산한 한도이며, LTV 규제와 함께 적용됩니다.`,
 },
 {
 question: `연봉 ${manwon}만원이면 한국 직장인 중 어느 정도 위치인가요?`,
 answer: `2024년 국세청 통계 기준 한국 직장인 평균 연봉은 약 4,200만원, 중위 연봉은 약 3,200만원입니다. 연봉 ${manwon}만원은 머니샐러리 연봉 티어에서 자세히 확인할 수 있으며, 본 페이지의 시각화를 참고하세요.`,
 },
 {
 question: "실수령액이 더 늘어나는 방법이 있나요?",
 answer:
 "비과세 식대 20만원 한도 100% 활용, 부양가족 인적공제, 중소기업 취업자 감면(만 34세 이하), 연금저축·IRP 세액공제(최대 900만원 납입), 신용카드 사용액 한도 채우기 등으로 실수령액을 높일 수 있습니다.",
 },
 ];
}

export default function SalaryAmountPage({ params }: Props) {
 const amount = parseSalaryParam(params.amount);
 const tax = calculateSalary2026(amount, 200000, 1, 0);

 const formattedAmount =
 amount >= 100000000
 ? `${(amount / 100000000).toFixed(1)}억`
 : `${(amount / 10000).toLocaleString("ko-KR")}만원`;

 const manwon = Math.round(amount / 10000);

 // 인근 연봉 cross-link (8개: ±200, ±400, ±600, ±800만원)
 const neighbors = [
 manwon - 800,
 manwon - 400,
 manwon - 200,
 manwon + 200,
 manwon + 400,
 manwon + 800,
 manwon + 1200,
 manwon + 2000,
 ].filter((n) => n >= 2000 && n <= 30000);

 const faqItems = buildSalaryFaq(amount, tax.netPay, tax.totalDeductions);

 return (
 <main className="min-h-screen bg-transparent pb-10">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "연봉별 실수령액", path: "/" },
 { name: `연봉 ${formattedAmount}`, path: `/salary/${params.amount}` },
 ]),
 softwareApplicationLd({
 name: `연봉 ${formattedAmount} 실수령액 계산기`,
 description: `연봉 ${formattedAmount}의 2026년 세법 기준 월 실수령액·세금 공제 분석`,
 url: `/salary/${params.amount}`,
 }),
 faqLd(faqItems),
 ]}
 />

 <div className="pt-8 px-6 flex flex-col items-center">
 <Link
 href="/"
 className="inline-flex items-center gap-2 text-faint-blue hover:text-primary transition-colors mb-6 group"
 >
 <ArrowLeft
 size={16}
 className="group-hover:-translate-x-1 transition-transform"
 />
 <span className="text-xs font-bold">전체 계산기로 돌아가기</span>
 </Link>

 <div className="flex items-center gap-2 mb-2">
 <span className="bg-canvas-dark text-electric text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
 2026 REPORT
 </span>
 <Sparkles size={14} className="text-[#FFD700]" />
 </div>

 <h1 className="text-3xl font-black text-navy text-center mb-10">
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

 <div className="w-full mt-10 space-y-12 max-w-4xl mx-auto">
 <WealthChart monthlyNetSalary={tax.netPay} />
 <SalaryTierCard annualSalary={amount} />

 {/* FAQ */}
 <section className="px-6">
 <h2 className="text-lg font-black text-navy mb-4">자주 묻는 질문</h2>
 <div className="space-y-3">
 {faqItems.map((item) => (
 <details
 key={item.question}
 className="group p-5 bg-white rounded-2xl border border-canvas-200"
 >
 <summary className="flex items-center justify-between cursor-pointer text-sm font-bold text-navy">
 {item.question}
 <ArrowRight className="w-4 h-4 text-electric transition-transform group-open:rotate-90" />
 </summary>
 <p className="mt-3 text-sm text-muted-blue leading-relaxed">
 {item.answer}
 </p>
 </details>
 ))}
 </div>
 </section>

 {/* 인근 연봉 리포트 */}
 {neighbors.length > 0 && (
 <div className="pt-8 border-t border-canvas px-6">
 <h2 className="text-sm font-black text-faint-blue uppercase tracking-widest mb-4 text-center">
 다른 연봉 리포트
 </h2>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {neighbors.map((s) => (
 <Link
 key={s}
 href={`/salary/${s}-manwon`}
 className="p-4 bg-white border border-canvas rounded-2xl text-xs font-bold text-muted-blue flex justify-between items-center hover:border-primary hover:text-primary transition-colors shadow-sm"
 >
 연봉 {s.toLocaleString("ko-KR")}만원
 <ChevronRight size={14} className="text-faint-blue" />
 </Link>
 ))}
 </div>
 </div>
 )}

 {/* RelatedCalculators */}
 <div className="px-6">
 <RelatedCalculators currentPath="/" title="이 연봉으로 다음 단계는?" />
 </div>
 </div>
 </div>
 </main>
 );
}
