// src/app/year-end-tax-2026/page.tsx
// 5월 종합소득세 시즌 페이지 — 프리랜서·N잡러 대상

import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, AlertCircle, CheckCircle2, FileText, Calculator, ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd, articleLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd } from "@/components/AdPlacement";
import PartnerSlot from "@/components/PartnerSlot";
import CoupangBanner from "@/components/CoupangBanner";
import EmailCaptureCard from "@/components/EmailCaptureCard";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 종합소득세 신고 가이드 - 5월 종소세 환급금·신고법",
 description:
 "2026년 5월 종합소득세 신고 완벽 가이드. 프리랜서·N잡러·사업소득자의 신고 일정, 필요 서류, 환급금 계산법, 절세 팁까지 한 페이지에서 확인하세요.",
 path: "/year-end-tax-2026",
 keywords: [
 "2026 종합소득세",
 "5월 종소세",
 "종합소득세 신고",
 "프리랜서 종소세",
 "N잡 종소세",
 "종소세 환급",
 "사업소득세",
 ],
});

const SCHEDULE = [
 { date: "5월 1일", event: "종합소득세 신고·납부 시작", note: "홈택스 신고 가능" },
 { date: "5월 31일", event: "신고·납부 마감일", note: "마감 임박 가산세 부담" },
 { date: "6월 30일", event: "분납 신청 마감", note: "1,000만원 초과 시 가능" },
 { date: "7월 1일", event: "환급 시작 (예상)", note: "신고 후 약 30일 내 입금" },
];

const TARGETS = [
 { type: "프리랜서·N잡러", desc: "근로소득 외 사업소득(3.3%) 발생자" },
 { type: "1인 사업자", desc: "개인사업자 등록자, 부가세 신고 별도" },
 { type: "임대소득자", desc: "주택임대 2,000만원 초과 시 분리과세 가능" },
 { type: "금융소득 종합과세 대상", desc: "이자·배당 합계 2,000만원 초과" },
];

const REQUIRED_DOCS = [
 "사업자등록증 (사업자만)",
 "수입금액 증빙 (계산서, 세금계산서, 현금영수증)",
 "필요경비 영수증 (사업 관련 지출)",
 "소득공제 증빙 (인적공제·연금저축·기부금 등)",
 "원천징수영수증 (3.3% 공제분)",
];

const FAQ_ITEMS = [
 {
 question: "프리랜서인데 종합소득세를 꼭 신고해야 하나요?",
 answer:
 "네, 사업소득 3.3%로 원천징수된 금액이 있다면 5월에 종합소득세 신고를 해야 환급받을 수 있습니다. 신고하지 않으면 원천징수된 세금을 그대로 부담하게 됩니다.",
 },
 {
 question: "신고하지 않으면 어떻게 되나요?",
 answer:
 "신고기한(5/31)을 넘기면 무신고 가산세 20%, 납부지연 가산세(연 9.125%)가 부과됩니다. 환급 대상이라면 환급금을 못 받습니다. 5년 이내 기한 후 신고는 가능하지만 가산세가 누적됩니다.",
 },
 {
 question: "필요경비는 어디까지 인정되나요?",
 answer:
 "사업과 직접 관련된 지출만 인정됩니다. 예: 사무실 임대료, 통신비(업무 비율), 출장비, 업무용 도서·교육비, 사업용 자산 감가상각. 영수증·계산서를 5년간 보관해야 합니다.",
 },
 {
 question: "단순경비율과 기준경비율의 차이는?",
 answer:
 "단순경비율(소규모 사업자)은 수입의 일정 비율을 자동으로 경비로 인정. 기준경비율(일정 규모 이상)은 주요 경비만 실제 증빙 필요. 본인의 업종·규모에 따라 자동 적용되며 홈택스에서 조회 가능합니다.",
 },
 {
 question: "환급금은 언제 입금되나요?",
 answer:
 "신고 후 약 30일 내(6월 말~7월 초) 신고 시 입력한 계좌로 자동 입금됩니다. 신고가 늦거나 검증이 필요한 경우 더 늦어질 수 있습니다.",
 },
];

export default function YearEndTax2026Page() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "2026 종합소득세 신고", path: "/year-end-tax-2026" },
 ]),
 faqLd(FAQ_ITEMS),
 articleLd({
 title: "2026 종합소득세 신고 가이드",
 description:
 "5월 종소세 신고 일정, 필요 서류, 환급금 계산, 절세 팁",
 slug: "year-end-tax-2026",
 publishedDate: "2026-05-01",
 }),
 speakableLd({
 url: "/year-end-tax-2026",
 cssSelectors: [".faq-answer", ".speakable-summary"],
 }),
 ]}
 />

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 {/* Hero */}
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
 <Calendar className="w-4 h-4" />
 5월 1일 ~ 5월 31일 신고
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 2026 종합소득세 <span className="text-electric">신고 가이드</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 프리랜서·N잡러·사업소득자라면 5월 종합소득세를 꼭 신고해야 합니다.
 일정·서류·환급금·절세 전략을 한 페이지에서 확인하세요.
 </p>
 </div>

 {/* Schedule Calendar */}
 <section className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
 <h2 className="text-xl font-black text-navy mb-6 flex items-center gap-2">
 <Calendar className="w-5 h-5 text-electric" />
 2026년 5월 종합소득세 일정
 </h2>
 <div className="space-y-3">
 {SCHEDULE.map((item) => (
 <div
 key={item.date}
 className="flex items-start gap-4 p-4 bg-canvas rounded-xl"
 >
 <div className="flex-shrink-0 w-20 text-center">
 <p className="text-xs font-bold text-electric">{item.date}</p>
 </div>
 <div className="flex-1">
 <p className="font-bold text-navy text-sm">{item.event}</p>
 <p className="text-xs text-muted-blue mt-0.5">{item.note}</p>
 </div>
 </div>
 ))}
 </div>
 </section>

 {/* Who needs to file */}
 <section className="mb-12">
 <h2 className="text-xl font-black text-navy mb-6 flex items-center gap-2">
 <AlertCircle className="w-5 h-5 text-electric" />
 신고 대상자
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {TARGETS.map((target) => (
 <div
 key={target.type}
 className="p-5 bg-white rounded-2xl border border-canvas-200"
 >
 <p className="font-bold text-navy text-sm mb-1">{target.type}</p>
 <p className="text-xs text-muted-blue leading-relaxed">{target.desc}</p>
 </div>
 ))}
 </div>
 </section>

 {/* Mid InArticleAd — 가장 viewability 높음 */}
 <div className="mb-12">
 <InArticleAd />
 </div>

 {/* Required Documents */}
 <section className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
 <h2 className="text-xl font-black text-navy mb-6 flex items-center gap-2">
 <FileText className="w-5 h-5 text-electric" />
 필요 서류 체크리스트
 </h2>
 <ul className="space-y-3">
 {REQUIRED_DOCS.map((doc) => (
 <li key={doc} className="flex items-start gap-3 text-sm text-muted-blue">
 <CheckCircle2 className="w-4 h-4 text-electric flex-shrink-0 mt-0.5" />
 <span>{doc}</span>
 </li>
 ))}
 </ul>
 </section>

 {/* CTA: Calculator */}
 <section className="mb-12">
 <Link
 href="/tools/finance/freelance-tax"
 className="block p-6 sm:p-8 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors group"
 >
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm font-bold opacity-90 mb-2">계산기 바로가기</p>
 <h3 className="text-xl sm:text-2xl font-black mb-2">
 프리랜서 종합소득세 계산기
 </h3>
 <p className="text-sm opacity-90">
 사업소득에서 필요경비 차감 후 누진세율을 자동 적용합니다.
 </p>
 </div>
 <Calculator className="w-12 h-12 opacity-50 group-hover:opacity-80 transition-opacity flex-shrink-0" />
 </div>
 </Link>
 </section>

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
 <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">
 {item.answer}
 </p>
 </details>
 ))}
 </div>
 </section>

 {/* 시즌 메일 구독 — 다음 시즌 재방문 락인 */}
 <EmailCaptureCard context="year-end-tax" />

 {/* 핵심 제휴 — 종합소득세 환급(삼쩜삼) */}
 <PartnerSlot
 id="samjeomsam-tax"
 fallback={
 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />
 }
 />

 <RelatedCalculators currentPath="/year-end-tax-2026" />

 <div className="mt-8">
 <HomeTopAd />
 </div>
 </div>
 </main>
 );
}
