// src/app/salary/[amount]/page.tsx

import { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import SalaryTierCard from "@/components/SalaryTierCard";
import SalaryResultCard from "@/components/SalaryResultCard";
import RelatedCalculators from "@/components/RelatedCalculators";
import RelatedGuides from "@/components/RelatedGuides";
import { getRelatedGuides } from "@/lib/relatedGuides";
import RelatedCompanies from "@/components/RelatedCompanies";
import JsonLd from "@/components/JsonLd";
import { CalcResultAd, GuideMidAd, HomeTopAd, InArticleAd, SidebarAd } from "@/components/AdPlacement";
import { SALARY_PAGE_GUIDES } from "@/lib/crossLink";
import NextActions from "@/components/NextActions";
import CoupangBanner from "@/components/CoupangBanner";
import FavoritesButton from "@/components/FavoritesButton";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Sparkles, ChevronRight, ArrowRight } from "lucide-react";
import { buildSalaryAmountMetadata } from "@/lib/seo";
import {
 breadcrumbLd,
 faqLd,
 softwareApplicationLd,
 howToLd,
 speakableLd,
} from "@/lib/structuredData";

// 무거운 recharts 컴포넌트는 클라이언트 사이드만 렌더 → LCP 절감
const WealthChart = dynamic(() => import("@/components/WealthChart"), {
 ssr: false,
 loading: () => (
 <div className="w-full h-[400px] bg-white rounded-3xl border border-canvas-200 animate-pulse" />
 ),
});

// [필수] Cloudflare Pages 호환을 위해 순수 Edge 런타임만 선언합니다.
export const runtime = "edge";

// 색인 가능한 연봉 범위 — 이 범위를 벗어나거나 형식이 잘못된 URL은 notFound (무한 thin-content 방지)
const MIN_SALARY = 1_000_000; // 연 100만원
const MAX_SALARY = 1_000_000_000; // 연 10억

function parseSalaryParam(param: string): number | null {
 let amount: number | null = null;
 const manwonMatch = param.match(/^(\d+)-manwon$/);
 const eokMatch = param.match(/^(\d+)-eok$/);
 const eokHalfMatch = param.match(/^(\d+)-5-eok$/);
 if (manwonMatch) {
  amount = parseInt(manwonMatch[1], 10) * 10000;
 } else if (eokMatch) {
  amount = parseInt(eokMatch[1], 10) * 100000000;
 } else if (eokHalfMatch) {
  amount = parseInt(eokHalfMatch[1], 10) * 100000000 + 50000000;
 } else if (/^\d+$/.test(param)) {
  amount = parseInt(param, 10);
 }
 if (
  amount === null ||
  !Number.isFinite(amount) ||
  amount < MIN_SALARY ||
  amount > MAX_SALARY
 ) {
  return null;
 }
 return amount;
}

type Props = {
 params: { amount: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const amount = parseSalaryParam(params.amount);
 if (amount === null) {
  return { title: "페이지를 찾을 수 없습니다", robots: { index: false, follow: false } };
 }
 // SNS 공유 CTR — 월 실수령액 숫자를 OG 이미지에 직접 박기.
 const tax = calculateSalary2026(amount, 200000, 1, 0);
 return buildSalaryAmountMetadata(amount, tax.netPay);
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
 if (amount === null) {
  notFound();
 }
 const tax = calculateSalary2026(amount, 200000, 1, 0);

 const formattedAmount =
 amount >= 100000000
 ? `${(amount / 100000000).toFixed(1)}억`
 : `${(amount / 10000).toLocaleString("ko-KR")}만원`;

 const manwon = Math.round(amount / 10000);

 // 인근 연봉 cross-link
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

 const breadcrumbItems = [
 { name: "홈", path: "/" },
 { name: "연봉별 실수령액", path: "/" },
 { name: `연봉 ${formattedAmount}`, path: `/salary/${params.amount}` },
 ];

 const howTo = howToLd({
 name: `연봉 ${formattedAmount} 실수령액 계산하는 방법`,
 description: `연봉 ${formattedAmount}을 기준으로 4대보험·소득세·실수령액을 단계별로 계산하는 가이드.`,
 totalTime: "PT2M",
 steps: [
 {
 name: "비과세 식대 차감",
 text: "월 식대 20만원(연 240만원)은 비과세로 과세표준에서 제외합니다.",
 },
 {
 name: "4대보험 공제",
 text: "국민연금 4.5%, 건강보험 3.545%, 장기요양 0.4591%, 고용보험 0.9%를 차감합니다.",
 },
 {
 name: "근로소득공제 적용",
 text: "총급여에 따라 70~5% 구간별 근로소득공제를 적용합니다.",
 },
 {
 name: "기본·인적공제 차감",
 text: "본인 150만원, 표준세액공제 13만원 등을 차감해 과세표준을 산출합니다.",
 },
 {
 name: "산출세액 계산",
 text: "6~45% 8단계 누진세율 적용 후 지방소득세 10%를 더해 최종 세액을 결정합니다.",
 },
 ],
 });

 const speakable = speakableLd({
 url: `/salary/${params.amount}`,
 cssSelectors: [".speakable-summary", ".faq-answer"],
 });

 return (
 <main className="min-h-screen bg-transparent pb-10">
 <JsonLd
 data={[
 breadcrumbLd(breadcrumbItems),
 softwareApplicationLd({
 name: `연봉 ${formattedAmount} 실수령액 계산기`,
 description: `연봉 ${formattedAmount}의 2026년 세법 기준 월 실수령액·세금 공제 분석`,
 url: `/salary/${params.amount}`,
 }),
 faqLd(faqItems),
 howTo,
 speakable,
 ]}
 />

 <div className="pt-24 px-4 sm:px-6 lg:px-8">
 <div className="max-w-7xl mx-auto">
 <Breadcrumbs items={breadcrumbItems} className="mb-6" />

 <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:gap-14">
 {/* Main column */}
 <div className="flex flex-col items-center lg:items-stretch">
 <div className="flex items-center gap-2 mb-2 self-center">
 <span className="bg-canvas-dark text-electric text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
 2026 REPORT
 </span>
 <Sparkles size={14} className="text-[#FFD700]" />
 </div>

 <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-navy text-center mb-6 self-center leading-tight">
 연봉 <span className="text-primary">{formattedAmount}</span>의<br />월
 실수령액 분석
 </h1>

 <div className="self-center mb-6">
 <FavoritesButton title={`연봉 ${formattedAmount} 실수령액`} />
 </div>

 <div className="speakable-summary self-center max-w-xl text-center text-sm text-muted-blue mb-6">
 연봉 {formattedAmount}의 월 실수령액은 약 {(tax.netPay / 10000).toFixed(0)}만원,
 4대보험·세금 공제는 월 약 {(tax.totalDeductions / 10000).toFixed(0)}만원입니다.
 </div>

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

 <div className="w-full mt-6">
 <CalcResultAd />
 </div>

 {/* 결과 직후 — 다음 행동 CTA */}
 <div className="w-full mt-2 px-2">
 <NextActions annualSalary={amount} category="salary" />
 </div>

 {/* 쿠팡 파트너스 배너 */}
 <div className="w-full mt-6 px-2">
 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "rectangle" }}
 showDisclosure={true}
 />
 </div>

 <div className="w-full mt-10 space-y-12">
 <WealthChart monthlyNetSalary={tax.netPay} />

 {/* 차트와 티어카드 사이 InArticleAd */}
 <div className="px-2">
 <InArticleAd />
 </div>

 <SalaryTierCard annualSalary={amount} />

 {/* FAQ */}
 <section className="px-2 sm:px-6">
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
 <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">
 {item.answer}
 </p>
 </details>
 ))}
 </div>
 </section>

 {/* FAQ 후 — 콘텐츠 흐름과 어울리는 fluid 인아티클 광고 (CTR↑) */}
 <div className="px-2">
 <GuideMidAd />
 </div>

 {/* FAQ 후 쿠팡 한 번 더 */}
 <div className="px-2">
 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 showDisclosure={false}
 category="salary"
 />
 </div>

 {/* 인근 연봉 리포트 */}
 {neighbors.length > 0 && (
 <div className="pt-8 border-t border-canvas px-2 sm:px-6">
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

 <div className="px-2 sm:px-6">
 <RelatedCalculators currentPath="/" title="이 연봉으로 다음 단계는?" />
 </div>

 {/* 핵심 가이드 cross-link — 본인 연봉을 바탕으로 다음 의사결정 도움 */}
 <div className="px-2 sm:px-6">
 <RelatedGuides
 items={getRelatedGuides({
 currentSlug: `__salary-${params.amount}`,
 explicitSlugs: SALARY_PAGE_GUIDES,
 limit: 4,
 })}
 title="연봉을 알았다면 다음은 이걸 읽어보세요"
 />
 </div>

 {/* 같은 연봉대 회사 — 입력 연봉 ±15% 매칭 회사 6개 */}
 <div className="px-2 sm:px-6">
 <RelatedCompanies
 currentId={`__salary-${params.amount}`}
 targetSalary={amount}
 limit={6}
 title="이 연봉대의 실제 회사들"
 />
 </div>
 </div>
 </div>

 {/* Desktop sticky sidebar — 광고 + 쿠팡 */}
 <aside
 className="hidden lg:block lg:sticky lg:top-24 space-y-6 self-start"
 aria-label="추천·광고"
 >
 <SidebarAd />
 <CoupangBanner size="skyscraper" showDisclosure={false} />
 </aside>
 </div>
 </div>
 </div>
 </main>
 );
}
