// src/app/year/[year]/salary/[amount]/page.tsx
//
// 연도×연봉 교차 페이지 — 과거 세율로 X년의 실수령액 시뮬.
// 인기 연봉 20개 × 7년도 = 140 페이지.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ArrowRight, TrendingUp } from "lucide-react";
import { buildYearSalaryMetadata } from "@/lib/seo";
import {
 HISTORY_YEARS,
 getYearTaxData,
 calculateIncomeTaxByYear,
} from "@/lib/taxHistory";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, articleLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const dynamic = "force-static";
export const dynamicParams = false;

const POPULAR_AMOUNTS = [
 25_000_000, 28_000_000, 30_000_000, 32_000_000, 35_000_000, 38_000_000,
 40_000_000, 42_000_000, 45_000_000, 50_000_000, 55_000_000, 60_000_000,
 65_000_000, 70_000_000, 75_000_000, 80_000_000, 90_000_000, 100_000_000,
 120_000_000, 150_000_000,
];

type Props = { params: { year: string; amount: string } };

export function generateStaticParams() {
 const params: { year: string; amount: string }[] = [];
 HISTORY_YEARS.forEach((y) =>
 POPULAR_AMOUNTS.forEach((a) =>
 params.push({ year: String(y), amount: String(a) })
 )
 );
 return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const year = parseInt(params.year, 10);
 const amount = parseInt(params.amount, 10);
 if (!getYearTaxData(year) || !POPULAR_AMOUNTS.includes(amount)) return {};
 return buildYearSalaryMetadata(year, amount);
}

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

// 간이 실수령액 — 누진세율 적용, 4대보험 차감, 비과세 식대 20만(2023+) 또는 10만(2022 이전).
function simulateNetPay(
 yearlyGross: number,
 year: number
): { monthlyGross: number; monthlyNet: number; monthlyDeduction: number; effectiveRate: number } {
 const data = getYearTaxData(year)!;
 const nonTaxable = year >= 2023 ? 200_000 : 100_000;
 const monthlyGross = yearlyGross / 12;
 const taxableMonthly = Math.max(0, monthlyGross - nonTaxable);

 // 4대보험 (월 기준)
 const pension = taxableMonthly * data.nationalPensionRate;
 const health = taxableMonthly * data.healthInsuranceRate;
 const longTermCare = health * data.longTermCareRatio;
 const employment = taxableMonthly * data.employmentInsuranceRate;
 const monthlyInsurance = pension + health + longTermCare + employment;

 // 소득세 (간이) — 연 산출세액 / 12
 const annualTaxable = Math.max(0, yearlyGross - nonTaxable * 12);
 // 근로소득공제 간이 — 연소득의 30~70%
 let earnedDeduction = 0;
 if (annualTaxable <= 5_000_000) earnedDeduction = annualTaxable * 0.7;
 else if (annualTaxable <= 15_000_000) earnedDeduction = 3_500_000 + (annualTaxable - 5_000_000) * 0.4;
 else if (annualTaxable <= 45_000_000) earnedDeduction = 7_500_000 + (annualTaxable - 15_000_000) * 0.15;
 else if (annualTaxable <= 100_000_000) earnedDeduction = 12_000_000 + (annualTaxable - 45_000_000) * 0.05;
 else earnedDeduction = 14_750_000 + (annualTaxable - 100_000_000) * 0.02;

 const taxBase = Math.max(0, annualTaxable - earnedDeduction - 1_500_000); // 본인 1인 기본공제
 const annualIncomeTax = calculateIncomeTaxByYear(taxBase, year);
 const localTax = annualIncomeTax * 0.1;
 const monthlyIncomeTax = (annualIncomeTax + localTax) / 12;

 const monthlyDeduction = monthlyInsurance + monthlyIncomeTax;
 const monthlyNet = monthlyGross - monthlyDeduction;
 const effectiveRate = (monthlyDeduction / monthlyGross) * 100;

 return {
 monthlyGross,
 monthlyNet,
 monthlyDeduction,
 effectiveRate,
 };
}

export default function YearSalaryPage({ params }: Props) {
 const year = parseInt(params.year, 10);
 const amount = parseInt(params.amount, 10);
 if (!getYearTaxData(year) || !POPULAR_AMOUNTS.includes(amount)) notFound();

 const result = simulateNetPay(amount, year);
 const result2026 = simulateNetPay(amount, 2026);
 const diffMonthly = result.monthlyNet - result2026.monthlyNet;
 const data = getYearTaxData(year)!;
 const manwon = Math.round(amount / 10000).toLocaleString("ko-KR");

 const FAQ_ITEMS = [
 {
 question: `${year}년 연봉 ${manwon}만원의 실수령액은?`,
 answer: `${year}년 누진세율과 4대보험 요율 적용 시 월 실수령액 약 ${fmt(result.monthlyNet)}원, 연 ${fmt((result.monthlyNet * 12) / 10000)}만원. 본인 1인 기본공제 + 비과세 식대 ${year >= 2023 ? "20만" : "10만"} 가정.`,
 },
 {
 question: `${year}년과 2026년 실수령액 차이는?`,
 answer:
 diffMonthly > 0
 ? `${year}년이 2026년보다 월 약 ${fmt(diffMonthly)}원 더 많이 받았습니다. 4대보험 요율 + 누진세율 변경 누적 효과.`
 : diffMonthly < 0
 ? `2026년이 ${year}년보다 월 약 ${fmt(-diffMonthly)}원 더 받습니다. 식대 비과세 상향 + 누진구간 한계 상향 효과.`
 : `${year}년과 2026년 실수령액이 거의 동일합니다.`,
 },
 {
 question: `${year}년의 주요 세법은?`,
 answer: data.majorChange,
 },
 ];

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 autoBreadcrumbLd(`/year/${year}/salary/${amount}`, {
 leafName: `${year} 연봉 ${manwon}만원`,
 overrides: { year: "연도별", salary: "연봉" },
 }),
 faqLd(FAQ_ITEMS),
 articleLd({
 title: `${year}년 연봉 ${manwon}만원 실수령액`,
 description: `${year}년 세법 기준 연봉 ${manwon}만원 시뮬`,
 slug: `year-${year}-salary-${amount}`,
 publishedDate: `${year}-01-01`,
 }),
 ]}
 />

 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="mb-6">
 <Link href={`/year/${year}/tax-rates`} className="text-sm text-muted-blue hover:text-primary inline-flex items-center gap-1">← {year}년 세율표</Link>
 </div>

 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Calendar className="w-4 h-4" />
 {year}년 기준
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 {year}년 연봉 <span className="text-electric">{manwon}만원</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">{year}년 세법 + 4대보험 요율 적용 실수령액</p>
 </div>

 <section className="bg-primary p-8 rounded-3xl text-center mb-8">
 <p className="text-navy/70 text-xs font-black uppercase tracking-widest mb-2">{year}년 월 실수령액 (세후)</p>
 <p className="text-5xl font-black text-navy tracking-tight mb-3">{fmt(result.monthlyNet)}<span className="text-2xl">원</span></p>
 <div className="flex justify-center gap-6 pt-4 border-t border-white/20">
 <div><p className="text-navy/60 text-xs">월 공제</p><p className="text-navy font-black">{fmt(result.monthlyDeduction)}원</p></div>
 <div className="w-px bg-white/20" />
 <div><p className="text-navy/60 text-xs">실효세율</p><p className="text-navy font-black">{result.effectiveRate.toFixed(2)}%</p></div>
 </div>
 </section>

 {/* 2026 비교 */}
 {year !== 2026 && (
 <section className="bg-white border border-canvas rounded-2xl p-6 mb-8">
 <h2 className="text-lg font-black text-navy mb-3 flex items-center gap-2">
 <TrendingUp className="w-5 h-5 text-electric" />
 2026년 대비 차이
 </h2>
 <p className="text-sm text-muted-blue leading-relaxed">
 2026년 동일 연봉 실수령액 <strong className="text-navy">{fmt(result2026.monthlyNet)}원</strong> →{" "}
 {diffMonthly > 0 && (
 <span className="text-success font-black">{year}년이 월 {fmt(diffMonthly)}원 ↑</span>
 )}
 {diffMonthly < 0 && (
 <span className="text-electric font-black">2026년이 월 {fmt(-diffMonthly)}원 ↑</span>
 )}
 {diffMonthly === 0 && <span className="text-navy">차이 없음</span>}
 . 4대보험 요율 + 누진세율 변경 누적.
 </p>
 </section>
 )}

 {/* FAQ */}
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

 <RelatedCalculators currentPath={`/year/${year}/salary/${amount}`} />

 <div className="mt-10 p-5 bg-canvas border border-canvas rounded-xl flex gap-3">
 <p className="text-xs text-muted-blue leading-relaxed">
 ※ 본 페이지는 {year}년 누진세율·4대보험 요율 + 본인 1인 기본공제·비과세 식대만 반영한 간이 시뮬입니다. 실제 환급액은 신용카드·연금저축·기부금 등 추가 공제로 달라집니다.
 </p>
 </div>
 </div>
 </main>
 );
}
