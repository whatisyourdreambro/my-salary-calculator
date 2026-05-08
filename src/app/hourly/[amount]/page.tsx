// src/app/hourly/[amount]/page.tsx
//
// 시급 ↔ 월급·연봉 환산 long-tail 페이지.
// 한국 표준 월 209시간(주 40시간 × 4.345 + 주휴수당) 기준.
// generateStaticParams로 시급 1000~30000원을 정적 빌드.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ArrowRight, Calculator, Calendar } from "lucide-react";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { buildHourlyAmountMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import {
 autoBreadcrumbLd,
 faqLd,
 howToLd,
 softwareApplicationLd,
} from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

// 정적 export — generateStaticParams로 빌드 시 모든 페이지 생성
export const dynamic = "force-static";
export const dynamicParams = false;

// 한국 노동법 표준 월 근로시간 (주 40시간 × 4.345 + 주휴수당 시간)
const HOURS_PER_MONTH = 209;
// 2026년 최저시급 (가정 — 발표 시 갱신 필요)
const MINIMUM_WAGE_2026 = 10_320;

type Props = {
 params: { amount: string };
};

export function generateStaticParams(): { amount: string }[] {
 const params: { amount: string }[] = [];
 // 1000원~10000원: 100원 단위 (91개)
 for (let h = 1000; h <= 10000; h += 100) params.push({ amount: String(h) });
 // 10000원 초과~30000원: 500원 단위 (40개)
 for (let h = 10500; h <= 30000; h += 500) params.push({ amount: String(h) });
 return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const hourly = parseInt(params.amount, 10);
 if (isNaN(hourly) || hourly < 100) return {};
 return buildHourlyAmountMetadata(hourly);
}

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function HourlyAmountPage({ params }: Props) {
 const hourly = parseInt(params.amount, 10);
 if (isNaN(hourly) || hourly < 100 || hourly > 100_000) notFound();

 const dailyWage = hourly * 8; // 8시간 기준
 const weeklyWage = hourly * 40; // 주 40시간
 const monthlyGross = hourly * HOURS_PER_MONTH;
 const yearlyGross = monthlyGross * 12;

 // 4대보험 + 소득세 차감 (연봉 기준)
 const taxResult = calculateSalary2026(yearlyGross);
 const monthlyNet = taxResult.netPay;
 const yearlyNet = monthlyNet * 12;
 const monthlyDeduction = monthlyGross - monthlyNet;

 // 최저시급 대비 비율
 const minWageRatio = (hourly / MINIMUM_WAGE_2026) * 100;
 const isAboveMin = hourly >= MINIMUM_WAGE_2026;

 const FAQ_ITEMS = [
 {
 question: `시급 ${fmt(hourly)}원으로 한 달 일하면 얼마인가요?`,
 answer: `한국 노동법 표준 월 209시간(주 40시간 × 4.345 + 주휴수당) 기준 월급은 약 ${fmt(monthlyGross)}원(세전)입니다. 4대보험·소득세 차감 후 실수령액은 약 ${fmt(monthlyNet)}원이며, 연봉으로는 약 ${fmt(yearlyGross / 10000)}만원입니다.`,
 },
 {
 question: `시급 ${fmt(hourly)}원은 ${new Date().getFullYear() === 2026 ? "2026년" : ""} 최저시급보다 높은가요?`,
 answer: `2026년 최저시급(${fmt(MINIMUM_WAGE_2026)}원) 기준으로 ${isAboveMin ? `${minWageRatio.toFixed(1)}%로 최저시급 이상` : `${minWageRatio.toFixed(1)}%로 최저시급 미달`}입니다. 최저임금 미달 시 사업주는 차액 지급 의무가 있으며, 신고는 고용노동부 1350.`,
 },
 {
 question: "주휴수당은 어떻게 계산되나요?",
 answer:
 "주 15시간 이상 근무하고 1주 개근 시 발생. 1일분(보통 8시간) 시급을 추가로 받습니다. 월 209시간 환산은 주휴수당 시간(주 8시간 × 4.345)이 이미 포함된 수치입니다.",
 },
 {
 question: "야간·휴일·연장 근로 수당은?",
 answer:
 "야간(22시~06시) 50% 가산, 휴일(주말·공휴일) 50% 가산, 연장(주 40시간 초과) 50% 가산. 5인 이상 사업장만 적용. 5인 미만은 가산수당 면제 가능.",
 },
 {
 question: "일급·주급은 어떻게 계산하나요?",
 answer: `8시간 기준 일급은 ${fmt(dailyWage)}원, 주 40시간 기준 주급은 ${fmt(weeklyWage)}원입니다. 단, 한 달 4주가 정확히 아니므로 월급 = 주급 × 4가 아니라 시급 × 209시간으로 계산합니다.`,
 },
 ];

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 autoBreadcrumbLd(`/hourly/${hourly}`, {
 leafName: `시급 ${fmt(hourly)}원 환산`,
 overrides: { hourly: "시급 환산" },
 }),
 softwareApplicationLd({
 name: `시급 ${fmt(hourly)}원 → 월급·연봉 환산`,
 description: `시급 ${fmt(hourly)}원의 한국 표준 월 209시간 기준 월급, 연봉, 실수령액 분석.`,
 url: `/hourly/${hourly}`,
 }),
 faqLd(FAQ_ITEMS),
 howToLd({
 name: "시급을 월급·연봉으로 환산하는 4단계",
 description: "시급 X원 → 일급·주급·월급·연봉 + 실수령액 분석",
 totalTime: "PT5M",
 steps: [
 { name: "Step 1. 시급 입력", text: "본인 시급 또는 알바 채용공고 시급 (세전)." },
 { name: "Step 2. 표준 근로시간 적용", text: "주 40시간 + 주휴수당 4.345주 = 월 209시간." },
 { name: "Step 3. 월급·연봉 환산", text: "월급 = 시급 × 209, 연봉 = 월급 × 12." },
 { name: "Step 4. 4대보험·소득세 차감", text: "2026년 세법 기준 4대보험·소득세 자동 차감 후 실수령액 산출." },
 ],
 }),
 ]}
 />

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="mb-6">
 <Link href="/" className="text-sm text-muted-blue hover:text-primary inline-flex items-center gap-1">
 ← 홈으로
 </Link>
 </div>

 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Clock className="w-4 h-4" />
 시급 환산
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 시급 <span className="text-electric">{fmt(hourly)}원</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">
 한국 표준 월 209시간 (주 40시간 + 주휴수당) 기준 환산
 </p>
 </div>

 {/* 핵심 결과 */}
 <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
 {[
 { label: "일급 (8시간)", value: dailyWage, suffix: "원" },
 { label: "주급 (40시간)", value: weeklyWage, suffix: "원" },
 { label: "월급 (세전)", value: monthlyGross, suffix: "원" },
 { label: "연봉 (세전)", value: yearlyGross, suffix: "원" },
 ].map((c) => (
 <div key={c.label} className="bg-white rounded-2xl p-4 border border-canvas">
 <p className="text-xs text-muted-blue mb-1">{c.label}</p>
 <p className="text-lg font-black text-navy tabular-nums">{fmt(c.value)}<span className="text-xs ml-0.5">{c.suffix}</span></p>
 </div>
 ))}
 </section>

 {/* 실수령액 */}
 <section className="bg-primary p-8 rounded-3xl text-center mb-8">
 <p className="text-navy/70 text-xs font-black uppercase tracking-widest mb-2">월 실수령액 (세후)</p>
 <p className="text-5xl font-black text-navy tracking-tight mb-3">{fmt(monthlyNet)}<span className="text-2xl">원</span></p>
 <div className="flex justify-center gap-6 pt-4 border-t border-white/20">
 <div><p className="text-navy/60 text-xs">월 공제</p><p className="text-navy font-black">{fmt(monthlyDeduction)}원</p></div>
 <div className="w-px bg-white/20" />
 <div><p className="text-navy/60 text-xs">연 실수령</p><p className="text-navy font-black">{fmt(yearlyNet / 10000)}만원</p></div>
 </div>
 </section>

 {/* 최저시급 비교 */}
 <section className="bg-white border border-canvas rounded-2xl p-6 mb-8">
 <h2 className="text-lg font-black text-navy mb-3 flex items-center gap-2">
 <Calendar className="w-5 h-5 text-electric" />
 2026년 최저시급 대비
 </h2>
 <p className="text-sm text-muted-blue mb-2">
 2026년 최저시급 <strong className="text-navy">{fmt(MINIMUM_WAGE_2026)}원</strong> 대비{" "}
 <strong className={isAboveMin ? "text-success" : "text-electric"}>
 {minWageRatio.toFixed(1)}%
 </strong>{" "}
 — {isAboveMin ? "최저시급 이상입니다." : "최저시급 미달 — 차액 지급 청구 가능 (고용노동부 1350)."}
 </p>
 <div className="w-full h-3 bg-canvas-dark rounded-full overflow-hidden">
 <div
 className={`h-full rounded-full ${isAboveMin ? "bg-success" : "bg-electric"}`}
 style={{ width: `${Math.min(minWageRatio, 100)}%` }}
 />
 </div>
 </section>

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

 <RelatedCalculators currentPath={`/hourly/${hourly}`} />

 <div className="mt-10 p-5 bg-canvas border border-canvas rounded-xl">
 <Link href="/" className="inline-flex items-center gap-2 text-primary font-black">
 <Calculator className="w-4 h-4" />
 정확한 연봉 실수령액 계산하기
 <ArrowRight className="w-4 h-4" />
 </Link>
 </div>
 </div>
 </main>
 );
}
