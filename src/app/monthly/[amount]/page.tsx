// src/app/monthly/[amount]/page.tsx
//
// 월급 ↔ 연봉·시급 환산 long-tail 페이지.
// generateStaticParams로 월급 150만~1000만원 (5만원 단위) 정적 빌드.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Coins, ArrowRight, Calculator, Clock } from "lucide-react";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { buildMonthlyAmountMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import {
 autoBreadcrumbLd,
 faqLd,
 howToLd,
 softwareApplicationLd,
} from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const dynamic = "force-static";
export const dynamicParams = false;

const HOURS_PER_MONTH = 209;

type Props = {
 params: { amount: string };
};

export function generateStaticParams(): { amount: string }[] {
 const params: { amount: string }[] = [];
 // 150만원~1000만원, 5만원 단위 (171개)
 for (let m = 1_500_000; m <= 10_000_000; m += 50_000) {
 params.push({ amount: String(m) });
 }
 return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const monthly = parseInt(params.amount, 10);
 if (isNaN(monthly) || monthly < 100_000) return {};
 return buildMonthlyAmountMetadata(monthly);
}

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function MonthlyAmountPage({ params }: Props) {
 const monthlyGross = parseInt(params.amount, 10);
 if (isNaN(monthlyGross) || monthlyGross < 100_000 || monthlyGross > 100_000_000) notFound();

 const yearlyGross = monthlyGross * 12;
 const hourlyEquiv = Math.round(monthlyGross / HOURS_PER_MONTH);
 const dailyWage = hourlyEquiv * 8;
 const weeklyWage = hourlyEquiv * 40;

 const taxResult = calculateSalary2026(yearlyGross);
 const monthlyNet = taxResult.netPay;
 const yearlyNet = monthlyNet * 12;
 const monthlyDeduction = monthlyGross - monthlyNet;

 const manwon = Math.round(monthlyGross / 10000).toLocaleString("ko-KR");
 const yearlyManwon = Math.round(yearlyGross / 10000).toLocaleString("ko-KR");

 const FAQ_ITEMS = [
 {
 question: `월급 ${manwon}만원의 연봉은 얼마인가요?`,
 answer: `세전 월급 ${manwon}만원 × 12개월 = 연봉 약 ${yearlyManwon}만원입니다. 단, 성과급·상여금이 별도로 있다면 연봉이 더 큽니다. 고정 월급만 환산한 수치.`,
 },
 {
 question: `월급 ${manwon}만원의 실수령액은?`,
 answer: `2026년 세법 기준 4대보험·소득세 차감 후 월 실수령액은 약 ${fmt(monthlyNet)}원, 연 ${fmt(yearlyNet / 10000)}만원입니다. 비과세 식대 20만원, 본인 1인 공제 적용 기준.`,
 },
 {
 question: `월급 ${manwon}만원의 시급 환산은?`,
 answer: `한국 표준 월 209시간(주 40시간 + 주휴수당) 기준 시급 ${fmt(hourlyEquiv)}원입니다. 주휴수당이 이미 포함된 환산이므로 실제 시급은 이보다 낮을 수 있습니다.`,
 },
 {
 question: "성과급이 있으면 어떻게 계산하나요?",
 answer:
 "고정 월급 외 성과급·상여금이 있으면 연봉 = (월급 × 12) + 성과급. 4대보험·소득세는 연 합산 기준. 머니샐러리 메인 계산기에서 비과세·부양가족·성과급 모두 반영해 더 정확한 계산 가능.",
 },
 ];

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 autoBreadcrumbLd(`/monthly/${monthlyGross}`, {
 leafName: `월급 ${manwon}만원 환산`,
 overrides: { monthly: "월급 환산" },
 }),
 softwareApplicationLd({
 name: `월급 ${manwon}만원 → 연봉·시급 환산`,
 description: `월급 ${manwon}만원의 연봉, 시급, 실수령액 분석.`,
 url: `/monthly/${monthlyGross}`,
 }),
 faqLd(FAQ_ITEMS),
 howToLd({
 name: "월급을 연봉·시급으로 환산하는 4단계",
 description: "월급 X만원 → 연봉·시급·실수령액",
 totalTime: "PT5M",
 steps: [
 { name: "Step 1. 월급 입력 (세전)", text: "본인 고정 월급. 성과급·상여금은 별도." },
 { name: "Step 2. 연봉 환산", text: "월급 × 12개월 = 세전 연봉." },
 { name: "Step 3. 시급 환산", text: "월급 / 209시간 = 시급 환산 (주휴수당 포함)." },
 { name: "Step 4. 실수령액 산출", text: "2026년 세법 기준 4대보험·소득세 자동 차감." },
 ],
 }),
 ]}
 />

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="mb-6">
 <Link href="/" className="text-sm text-muted-blue hover:text-primary inline-flex items-center gap-1">← 홈으로</Link>
 </div>

 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Coins className="w-4 h-4" />
 월급 환산
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 월급 <span className="text-electric">{manwon}만원</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">연봉·시급 환산 + 4대보험·소득세 차감 실수령액</p>
 </div>

 <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
 {[
 { label: "연봉 (세전)", value: yearlyGross, suffix: "원" },
 { label: "시급 환산", value: hourlyEquiv, suffix: "원" },
 { label: "일급 (8시간)", value: dailyWage, suffix: "원" },
 { label: "주급 (40시간)", value: weeklyWage, suffix: "원" },
 ].map((c) => (
 <div key={c.label} className="bg-white rounded-2xl p-4 border border-canvas">
 <p className="text-xs text-muted-blue mb-1">{c.label}</p>
 <p className="text-lg font-black text-navy tabular-nums">{fmt(c.value)}<span className="text-xs ml-0.5">{c.suffix}</span></p>
 </div>
 ))}
 </section>

 <section className="bg-primary p-8 rounded-3xl text-center mb-8">
 <p className="text-navy/70 text-xs font-black uppercase tracking-widest mb-2">월 실수령액 (세후)</p>
 <p className="text-5xl font-black text-navy tracking-tight mb-3">{fmt(monthlyNet)}<span className="text-2xl">원</span></p>
 <div className="flex justify-center gap-6 pt-4 border-t border-white/20">
 <div><p className="text-navy/60 text-xs">월 공제</p><p className="text-navy font-black">{fmt(monthlyDeduction)}원</p></div>
 <div className="w-px bg-white/20" />
 <div><p className="text-navy/60 text-xs">연 실수령</p><p className="text-navy font-black">{fmt(yearlyNet / 10000)}만원</p></div>
 </div>
 </section>

 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">자주 묻는 질문</h2>
 <div className="space-y-3">
 {FAQ_ITEMS.map((item) => (
 <details key={item.question} className="bg-white rounded-2xl p-5 border border-canvas group">
 <summary className="font-black text-navy cursor-pointer list-none flex justify-between items-start">
 <span>{item.question}</span>
 <ArrowRight className="w-5 h-5 text-electric flex-shrink-0 ml-3 transition-transform group-open:rotate-90" />
 </summary>
 <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">{item.answer}</p>
 </details>
 ))}
 </div>
 </section>

 <RelatedCalculators currentPath={`/monthly/${monthlyGross}`} />

 <div className="mt-10 p-5 bg-canvas border border-canvas rounded-xl flex gap-3">
 <Calculator className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
 <div>
 <Link href="/" className="text-primary font-black hover:underline">정확한 연봉 실수령액 계산하기 →</Link>
 <p className="text-xs text-muted-blue mt-1">비과세 식대·부양가족·성과급 반영한 정확한 계산</p>
 </div>
 </div>
 </div>
 </main>
 );
}
