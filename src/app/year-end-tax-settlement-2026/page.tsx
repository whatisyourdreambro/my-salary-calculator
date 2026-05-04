// src/app/year-end-tax-settlement-2026/page.tsx
// 12월 연말정산 + 성과급 시즌 페이지

import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Gift, ArrowRight, Calculator } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd, articleLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 연말정산 + 성과급 가이드 - 13월의 월급·환급금 극대화",
 description:
 "12월 연말정산 + 성과급 시즌 완벽 가이드. 신용카드·연금저축·기부금 공제 + 성과급 세금 절세 전략까지 한 페이지에서 확인하세요.",
 path: "/year-end-tax-settlement-2026",
 keywords: [
 "2026 연말정산",
 "13월의 월급",
 "성과급 절세",
 "신용카드 공제",
 "연금저축 공제",
 "12월 절세",
 ],
});

const TIPS = [
 { icon: "💳", title: "신용카드 사용액 점검", body: "총급여의 25% 초과분부터 공제. 12월 추가 사용으로 한도 채우기." },
 { icon: "💰", title: "연금저축 추가 납입", body: "12/31까지 입금하면 당해년도 공제 가능. 최대 600만원." },
 { icon: "🏥", title: "의료비 영수증 정리", body: "총급여 3% 초과분만 공제. 안경·렌즈·한약도 포함." },
 { icon: "🎁", title: "기부금 영수증 확보", body: "지정기부금 15% 세액공제. 종교단체도 가능." },
 { icon: "🏠", title: "월세 공제 신청", body: "총급여 7천만 이하 무주택자, 한도 750만원의 17%." },
 { icon: "📚", title: "교육비 점검", body: "본인·자녀 학원비, 교복비 등 일부 공제 가능." },
];

const FAQ_ITEMS = [
 {
 question: "성과급 받으면 세금 폭탄이라는데 사실인가요?",
 answer:
 "성과급은 연봉합산 방식이라 누진세율 구간이 올라갈 수 있어 한 달 부담이 커 보입니다. 하지만 연말정산에서 일부 환급되므로 실효세율은 비슷합니다. 미리 IRP·연금저축으로 절세 가능.",
 },
 {
 question: "연말정산에서 가장 많이 놓치는 공제는?",
 answer:
 "월세 공제(무주택자), 안경·렌즈비(의료비), 교복비(교육비), 산후조리원비, 본인/배우자 노부모 부양 공제 등이 자주 누락됩니다. 홈택스 '예상세액 계산하기'로 사전 점검 권장.",
 },
 {
 question: "IRP 만원이라도 가입하면 절세 효과가 있나요?",
 answer:
 "네. IRP는 연 300만원까지 추가 세액공제(연금저축 600만 + IRP 300만 = 900만원). 연봉 5,500만원 이하는 16.5% 공제. 100만원 납입 시 약 16.5만원 절세.",
 },
];

export default function YearEndTaxSettlement2026Page() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "2026 연말정산 + 성과급 가이드", path: "/year-end-tax-settlement-2026" },
 ]),
 faqLd(FAQ_ITEMS),
 articleLd({
 title: "2026 연말정산 + 성과급 절세 가이드",
 description: "12월 연말정산 공제 항목 + 성과급 세금 전략",
 slug: "year-end-tax-settlement-2026",
 publishedDate: "2026-05-01",
 }),
 ]}
 />

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
 <Gift className="w-4 h-4" />
 12월 골든타임
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 13월의 월급, <span className="text-electric">제대로 받기</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 12월 연말정산은 1년 절세의 골든타임입니다.
 성과급 절세 + 6대 공제 점검으로 환급금을 극대화하세요.
 </p>
 </div>

 {/* 6 Tips Grid */}
 <section className="mb-12">
 <h2 className="text-xl font-black text-navy mb-6 flex items-center gap-2">
 <Calendar className="w-5 h-5 text-electric" />
 12월 연말정산 6대 점검
 </h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {TIPS.map((tip) => (
 <div
 key={tip.title}
 className="p-5 bg-white rounded-2xl border border-canvas-200"
 >
 <div className="text-2xl mb-2">{tip.icon}</div>
 <p className="font-bold text-navy text-sm mb-1">{tip.title}</p>
 <p className="text-xs text-muted-blue leading-relaxed">{tip.body}</p>
 </div>
 ))}
 </div>
 </section>

 {/* CTAs */}
 <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-4">
 <Link
 href="/year-end-tax"
 className="block p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors group"
 >
 <Calculator className="w-8 h-8 opacity-70 mb-3" />
 <h3 className="text-lg font-black mb-2">연말정산 계산기</h3>
 <p className="text-sm opacity-90">
 항목별 입력하면 환급금/추가 납부 즉시 계산
 </p>
 </Link>
 <Link
 href="/tools/finance/bonus"
 className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors group"
 >
 <Gift className="w-8 h-8 text-electric mb-3" />
 <h3 className="text-lg font-black mb-2">성과급 세금 계산기</h3>
 <p className="text-sm text-muted-blue">
 연봉합산 방식 2026 세율 자동 적용
 </p>
 </Link>
 </section>

 {/* FAQ */}
 <section className="mb-12">
 <h2 className="text-xl font-black text-navy mb-6">자주 묻는 질문</h2>
 <div className="space-y-3">
 {FAQ_ITEMS.map((item) => (
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

 <RelatedCalculators currentPath="/year-end-tax-settlement-2026" />
 </div>
 </main>
 );
}
