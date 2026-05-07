// src/app/tax-changes-2026/page.tsx
// 2026 세법 변경사항 종합

import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Sparkles, ArrowRight, Calculator } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 세법 변경사항 — 결혼세액공제 부활·자녀공제 확대 등",
 description:
 "2026년 세법 주요 변경사항 한 페이지. 결혼세액공제 50만 부활, 6세 이하 자녀 추가공제, 출산·입양 세액공제 확대, 신용카드 공제 한도 변동 등.",
 path: "/tax-changes-2026",
 keywords: [
 "2026 세법",
 "세법 개정",
 "결혼세액공제",
 "자녀세액공제",
 "출산 세액공제",
 "신용카드 공제 변경",
 ],
});

const FAQ_ITEMS = [
 {
 question: "2026년 가장 큰 세법 변경은 무엇인가요?",
 answer:
 "결혼세액공제 50만원 부활(2025년 폐지 후 1년 만 재도입)과 6세 이하 자녀 추가 공제 100만원 신설이 가장 큰 변경입니다. 신혼부부와 어린 자녀를 둔 가정은 매년 100~200만원 추가 환급 가능합니다.",
 },
 {
 question: "결혼세액공제는 어떻게 신청하나요?",
 answer:
 "혼인 신고한 해 또는 다음 해 연말정산 시 자동 적용. 별도 신청은 필요 없으나, 회사 연말정산 자료 제출 시 혼인신고서 사본을 첨부하는 것이 안전합니다. 부부 모두 직장인이면 각 50만원, 합 100만원 환급.",
 },
 {
 question: "신용카드 공제율이 변경되었나요?",
 answer:
 "기본 공제율은 동일합니다 (신용 15%, 체크/현금영수증 30%, 전통시장·대중교통 40%). 다만 도서·공연·박물관·미술관 사용분 공제율 30%은 총급여 7천만 이하 기준 유지. 한도 300만(7천만 이하)·250만(1.2억 이하)·200만(1.2억 초과).",
 },
];

const MAJOR_CHANGES = [
 {
 category: "결혼·출산",
 emoji: "💍",
 changes: [
 {
 title: "결혼세액공제 50만원 부활",
 detail: "혼인 신고한 해 또는 다음 해 1회 50만원 세액공제 (총급여 7천만 이하). 부부 모두 신청 가능 (합 100만원).",
 impact: "신혼부부 +50~100만원",
 },
 {
 title: "출산·입양 세액공제 확대",
 detail: "첫째 30만, 둘째 50만, 셋째 이상 70만원 세액공제 (출생 신고 연도).",
 impact: "다자녀 가정 +30~70만원",
 },
 {
 title: "6세 이하 자녀 추가공제 신설",
 detail: "만 6세 이하 자녀 1인당 추가 100만원 소득공제 (누진 24% 구간 시 약 24만원 환급).",
 impact: "어린 자녀 가정 +20~30만원/인",
 },
 ],
 },
 {
 category: "근로소득",
 emoji: "💼",
 changes: [
 {
 title: "비과세 식대 20만원 유지",
 detail: "월 20만원까지 식대 비과세 (2024년 상향 후 유지). 자가운전 보조금도 월 20만원.",
 impact: "월 1.8만원 4대보험료 절약",
 },
 {
 title: "근로소득 간이세액표 조정",
 detail: "물가·인상 반영으로 일부 구간 조정. 매월 원천징수액 변동 가능.",
 impact: "월급 ±1~3만원 차이",
 },
 ],
 },
 {
 category: "투자·금융",
 emoji: "📈",
 changes: [
 {
 title: "ISA 한도·비과세 유지",
 detail: "연 2,000만 / 3년 200만 비과세 (서민형 400만). 변동 없음.",
 impact: "기존 활용 지속",
 },
 {
 title: "연금저축·IRP 합산 900만 유지",
 detail: "세액공제 16.5% (총급여 5,500만 이하) / 13.2% (초과). 변동 없음.",
 impact: "최대 148만원 환급",
 },
 {
 title: "금융소득 종합과세 기준 2,000만 유지",
 detail: "이자·배당 합계 2,000만 초과 시 종합과세 합산. 자산가 영향 큼.",
 impact: "자산 분산 검토",
 },
 ],
 },
 {
 category: "부동산",
 emoji: "🏠",
 changes: [
 {
 title: "1세대 1주택 비과세 12억 유지",
 detail: "양도가액 12억까지 비과세. 2년 보유·거주 요건.",
 impact: "기존 동일",
 },
 {
 title: "다주택자 중과세 한시 유예 연장 검토",
 detail: "2025년 5월부터 시작된 한시 유예 연장 여부는 정부 발표 확인 필요.",
 impact: "다주택자 1주택~3주택 차이 큼",
 },
 {
 title: "임대사업자 등록 요건 일부 조정",
 detail: "장기 임대 의무 기간 등 세부 조건 조정 가능. 신규 등록 전 확인.",
 impact: "임대사업자 영향",
 },
 ],
 },
 {
 category: "사업자",
 emoji: "🏢",
 changes: [
 {
 title: "법인세 누진 구조 유지",
 detail: "9% (2억 이하) / 19% / 21% / 24% (3,000억 초과). 변동 없음.",
 impact: "기존 동일",
 },
 {
 title: "간이과세자 기준 매출 8,000만 유지",
 detail: "매출 4,800만~8,000만 간이과세, 8,000만 초과 일반과세 자동 전환.",
 impact: "전환 검토 시점",
 },
 ],
 },
];

export default function TaxChanges2026Page() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "2026 세법 변경사항", path: "/tax-changes-2026" },
 ]),
 faqLd(FAQ_ITEMS),
 speakableLd({
 url: "/tax-changes-2026",
 cssSelectors: [".faq-answer"],
 }),
 ]}
 />

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
 <Sparkles className="w-4 h-4" />
 2026년 시행
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 2026 세법 <span className="text-electric">변경사항</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 결혼세액공제 부활, 자녀공제 확대, 비과세 항목 등
 직장인이 꼭 알아야 할 2026년 세법 핵심 변경사항.
 </p>
 </div>

 {/* 카테고리별 변경사항 */}
 <div className="space-y-8 mb-12">
 {MAJOR_CHANGES.map((cat) => (
 <section key={cat.category}>
 <div className="flex items-center gap-3 mb-4">
 <span className="text-3xl">{cat.emoji}</span>
 <h2 className="text-xl sm:text-2xl font-black text-navy">{cat.category}</h2>
 </div>
 <div className="space-y-3">
 {cat.changes.map((change, idx) => (
 <div
 key={idx}
 className="p-5 bg-white rounded-2xl border border-canvas-200"
 >
 <div className="flex items-start justify-between gap-4 flex-wrap">
 <div className="flex-1 min-w-0">
 <h3 className="font-bold text-navy text-base mb-2">{change.title}</h3>
 <p className="text-sm text-muted-blue leading-relaxed">
 {change.detail}
 </p>
 </div>
 <div className="flex-shrink-0 px-3 py-1.5 rounded-full bg-electric-10 text-electric text-xs font-bold">
 {change.impact}
 </div>
 </div>
 </div>
 ))}
 </div>
 </section>
 ))}
 </div>

 <InArticleAd />

 {/* CTA */}
 <Link
 href="/year-end-tax"
 className="block mb-12 p-6 sm:p-8 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors group"
 >
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm font-bold opacity-90 mb-2">바뀐 세법 적용</p>
 <h3 className="text-xl sm:text-2xl font-black mb-2">
 2026 연말정산 환급금 미리 보기
 </h3>
 <p className="text-sm opacity-90">
 결혼·출산·자녀공제 등 신규 항목 자동 반영
 </p>
 </div>
 <Calculator className="w-12 h-12 opacity-50 group-hover:opacity-80 transition-opacity flex-shrink-0" />
 </div>
 </Link>

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
 <p className="mt-3 text-sm text-muted-blue leading-relaxed">{item.answer}</p>
 </details>
 ))}
 </div>
 </section>

 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />

 <RelatedCalculators currentPath="/tax-changes-2026" />

 <div className="mt-8">
 <HomeTopAd />
 </div>
 </div>
 </main>
 );
}
