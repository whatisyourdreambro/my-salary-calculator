// src/app/health-insurance-2026/page.tsx
// 7월 건강보험료 정산 시즌 페이지

import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, AlertCircle, ArrowRight, Calculator, TrendingUp, TrendingDown } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd, articleLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd } from "@/components/AdPlacement";
import PartnerSlot from "@/components/PartnerSlot";
import CoupangBanner from "@/components/CoupangBanner";
import EmailCaptureCard from "@/components/EmailCaptureCard";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 건강보험료 정산 가이드 - 7월 정산금·환급·추가 납부",
 description:
 "매년 7월에 작년 소득 기준 건강보험료가 정산됩니다. 정산금 계산법, 환급/추가 납부 시점, 분납 신청 방법을 한 번에 정리.",
 path: "/health-insurance-2026",
 keywords: [
 "2026 건강보험료 정산",
 "7월 건보료 정산",
 "건보료 환급",
 "건강보험료 추가 납부",
 "건보료 분납",
 ],
});

const SCHEDULE = [
 { date: "4월", event: "정산 통보 사전 안내", note: "건보공단에서 SMS·우편 발송" },
 { date: "7월", event: "건강보험료 정산 반영", note: "월급에서 정산금 자동 차감/환급" },
 { date: "7~8월", event: "분납 신청 가능", note: "5회 분할 납부 (10만원 이상)" },
];

const FAQ_ITEMS = [
 {
 question: "왜 7월에 갑자기 건보료가 늘어났나요?",
 answer:
 "건강보험료는 작년 소득 기준으로 정산됩니다. 작년 임금 인상, 성과급, 추가 소득이 있었다면 그 차액이 7월 한 달에 한꺼번에 정산되어 부담이 커집니다.",
 },
 {
 question: "정산 환급은 언제 받을 수 있나요?",
 answer:
 "작년 소득이 줄었거나 휴직했다면 7월 급여에 환급금이 함께 입금됩니다. 회사에서 4대보험 통합 정산하므로 별도 신청은 필요 없습니다.",
 },
 {
 question: "정산금이 너무 커서 한 번에 못 내면?",
 answer:
 "정산금이 10만원 이상이면 5회 분납 신청 가능합니다. 회사 인사팀에 7월 중 신청서를 제출하면 8~12월에 나눠 차감됩니다. 별도 이자 없음.",
 },
 {
 question: "프리랜서·N잡러도 7월에 정산되나요?",
 answer:
 "지역가입자는 별도로 11월에 정산됩니다(전년도 종합소득 기준). 직장가입자는 7월 정산이 적용되며, 두 가지 가입자가 모두 해당되는 경우 각각 정산됩니다.",
 },
];

export default function HealthInsurance2026Page() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "2026 건강보험료 정산", path: "/health-insurance-2026" },
 ]),
 faqLd(FAQ_ITEMS),
 articleLd({
 title: "2026 건강보험료 정산 가이드",
 description: "7월 건보료 정산금·환급·분납",
 slug: "health-insurance-2026",
 publishedDate: "2026-05-01",
 }),
 speakableLd({
 url: "/health-insurance-2026",
 cssSelectors: [".faq-answer"],
 }),
 ]}
 />

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
 <Calendar className="w-4 h-4" />
 매년 7월 정산
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 2026 건강보험료 <span className="text-electric">정산 가이드</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 매년 7월 작년 소득 기준으로 건강보험료가 정산됩니다.
 정산금 부담 줄이는 방법과 환급 시점을 미리 확인하세요.
 </p>
 </div>

 {/* Why Section */}
 <section className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
 <h2 className="text-xl font-black text-navy mb-4 flex items-center gap-2">
 <AlertCircle className="w-5 h-5 text-electric" />
 왜 7월에 정산되나요?
 </h2>
 <p className="text-sm text-muted-blue leading-relaxed mb-4">
 매월 떼는 건강보험료는 <strong className="text-navy">전년도 보수 기준</strong>으로 산정한 임시 금액입니다.
 매년 4월에 작년 실제 소득이 확정되면, 그 차액을 <strong className="text-navy">7월 급여에 한 번에 정산</strong>합니다.
 </p>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
 <div className="p-4 bg-canvas rounded-xl">
 <div className="flex items-center gap-2 mb-2">
 <TrendingUp className="w-4 h-4 text-red-500" />
 <p className="text-sm font-bold text-navy">소득 증가 시</p>
 </div>
 <p className="text-xs text-muted-blue">7월 급여에서 추가 정산금 차감 (부담 ↑)</p>
 </div>
 <div className="p-4 bg-canvas rounded-xl">
 <div className="flex items-center gap-2 mb-2">
 <TrendingDown className="w-4 h-4 text-green-500" />
 <p className="text-sm font-bold text-navy">소득 감소 시</p>
 </div>
 <p className="text-xs text-muted-blue">7월 급여에 환급금 입금 (이득)</p>
 </div>
 </div>
 </section>

 {/* Schedule */}
 <section className="mb-12">
 <h2 className="text-xl font-black text-navy mb-6 flex items-center gap-2">
 <Calendar className="w-5 h-5 text-electric" />
 정산 일정
 </h2>
 <div className="space-y-3">
 {SCHEDULE.map((item) => (
 <div
 key={item.date}
 className="flex items-start gap-4 p-4 bg-white rounded-xl border border-canvas-200"
 >
 <div className="flex-shrink-0 w-16 text-center">
 <p className="text-sm font-bold text-electric">{item.date}</p>
 </div>
 <div className="flex-1">
 <p className="font-bold text-navy text-sm">{item.event}</p>
 <p className="text-xs text-muted-blue mt-0.5">{item.note}</p>
 </div>
 </div>
 ))}
 </div>
 </section>

 <InArticleAd />

 {/* CTA */}
 <Link
 href="/"
 className="block mb-12 p-6 sm:p-8 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors group"
 >
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm font-bold opacity-90 mb-2">계산기 바로가기</p>
 <h3 className="text-xl sm:text-2xl font-black mb-2">
 내 월급의 건강보험료 자세히 보기
 </h3>
 <p className="text-sm opacity-90">
 연봉 입력 시 월별 건강보험료(3.545%)와 장기요양보험까지 자동 계산.
 </p>
 </div>
 <Calculator className="w-12 h-12 opacity-50 group-hover:opacity-80 transition-opacity flex-shrink-0" />
 </div>
 </Link>

 {/* FAQ */}
 <section className="mb-12">
 <h2 className="text-xl font-black text-navy mb-6">
 자주 묻는 질문
 </h2>
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

 <PartnerSlot
 id="toss-insurance-home"
 fallback={
 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />
 }
 />

 <EmailCaptureCard context="general" />

 <RelatedCalculators currentPath="/health-insurance-2026" />

 <div className="mt-8">
 <HomeTopAd />
 </div>
 </div>
 </main>
 );
}
