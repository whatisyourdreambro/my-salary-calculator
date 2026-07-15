// src/app/health-insurance-2026/page.tsx
// 건강보험료 연말정산 가이드 페이지.
//
// 2026-07-13 사실관계 전면 정정: 기존 "7월 정산" 프레임은 오류였음 —
// 직장가입자(근로자) 건보 연말정산은 4월분 보험료에 일시 반영·고지가 공식 절차
// (개인사업장 대표자는 6월). 7월의 실제 월급 공제 이벤트는 국민연금
// 기준소득월액 재산정이므로 해당 안내로 연결한다.

import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, AlertCircle, ArrowRight, Calculator, TrendingUp, TrendingDown } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import PublishedMeta from "@/components/PublishedMeta";
import { breadcrumbLd, faqLd, articleLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 건강보험료 연말정산 — 4월 반영·분납·환급 완벽 가이드",
 description:
 "직장인 건보료 연말정산은 4월분 보험료에 반영됩니다. 2026년 실측: 1,035만명 평균 21만9천원 추가 납부·355만명 평균 11만5천원 환급. 분할납부(12회 이내) 신청법, 환급 시점, 7월 국민연금 재산정까지 정리.",
 path: "/health-insurance-2026",
 ogType: "article",
 publishedTime: "2026-04-01",
 modifiedTime: "2026-07-13",
 keywords: [
 "2026 건강보험료 정산",
 "건강보험료 연말정산",
 "4월 건보료 정산",
 "건보료 환급",
 "건강보험료 추가 납부",
 "건보료 분납",
 "건강보험료 정산금",
 "직장가입자 정산",
 ],
});

const SCHEDULE = [
 {
 date: "1~3월",
 event: "전년도 보수총액 확정",
 note: "2026년부터 국세청 간이지급명세서 연계로 약 61%(1,020만명) 자동 처리",
 },
 {
 date: "4월",
 event: "건강보험료 연말정산 반영·고지",
 note: "4월분 보험료에 정산 차액 일시 차감/환급 (개인사업장 대표자는 6월)",
 },
 {
 date: "~5/11",
 event: "분할납부 신청 기한",
 note: "추가 정산액이 당월 보험료 이상이면 12회 이내 분할 신청 가능 (이자 없음)",
 },
 {
 date: "7월",
 event: "국민연금 기준소득월액 재산정",
 note: "건보와 별개 — 7월 월급 공제액이 달라졌다면 국민연금 쪽입니다",
 },
];

const FAQ_ITEMS = [
 {
 question: "건강보험료 연말정산은 언제 반영되나요?",
 answer:
 "직장가입자(근로자)의 건강보험료 연말정산은 매년 4월분 보험료에 일시 반영·고지됩니다(개인사업장 대표자는 6월). 작년 임금 인상·성과급 등으로 실제 보수가 더 컸다면 차액이 4월에 추가 부과되고, 반대면 환급됩니다. 2026년 실측으로는 1,035만명이 평균 21만9천원을 추가 납부했고 355만명이 평균 11만5천원을 환급받았습니다(건보공단 발표). 2026년부터는 국세청 간이지급명세서 연계로 약 61%가 자동 정산 처리됩니다.",
 },
 {
 question: "정산 환급은 언제 받을 수 있나요?",
 answer:
 "작년 소득이 줄었거나 휴직했다면 4월분 보험료 정산에서 환급이 반영됩니다. 회사가 4대보험을 통합 정산하므로 근로자 본인의 별도 신청은 필요 없습니다. 2026년에는 355만명이 평균 11만5천원을 환급받았습니다.",
 },
 {
 question: "정산금이 너무 커서 한 번에 못 내면?",
 answer:
 "추가 정산보험료가 당월 보험료 이상이면 회사(사용자) 신청으로 12회 이내 분할 납부할 수 있습니다. 2026년 정산분 신청 기한은 5월 11일이었고 별도 이자는 없습니다. 참고로 2026년 7월부터는 신청 기준이 '최저보험료(월 2만 160원) 초과'로 완화되고 납부유예 보험료 분할도 최대 12회로 확대돼, 내년 정산부터는 더 많은 직장인이 분납을 이용할 수 있습니다.",
 },
 {
 question: "7월 월급에서 공제액이 달라졌는데 건보료 때문인가요?",
 answer:
 "아닙니다 — 직장가입자 건보 정산은 4월이고, 7월에 달라지는 것은 국민연금입니다. 매년 7월 1일 전년도 소득 기준으로 국민연금 기준소득월액이 정기 재산정되며, 2026년 7월부터는 상한이 월 637만원에서 659만원으로 인상되어 월 소득 659만원 이상 가입자는 보험료가 오릅니다(총 월 약 2만 1천원, 본인부담은 그 절반 수준). 자세한 내용은 국민연금 예상수령액 계산기 페이지를 참고하세요.",
 },
 {
 question: "프리랜서·N잡러(지역가입자)도 4월에 정산되나요?",
 answer:
 "지역가입자는 별도 일정입니다 — 매년 11월분 보험료부터 국세청 연계 전년도 소득과 6월 1일 기준 재산을 반영해 보험료가 재산정됩니다. 폐업·소득 감소 등으로 보험료 조정을 신청했던 가입자는 11월 소득정산도 적용됩니다. 직장가입자 4월 정산과는 별개 제도입니다.",
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
 title: "2026 건강보험료 연말정산 가이드",
 description: "4월 건보료 정산금·환급·분납 + 7월 국민연금 재산정",
 slug: "health-insurance-2026",
 publishedDate: "2026-04-01",
 modifiedDate: "2026-07-13",
 }),
 speakableLd({
 url: "/health-insurance-2026",
 cssSelectors: [".faq-answer"],
 }),
 ]}
 />

 <div className="page-width">
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
 <Calendar className="w-4 h-4" />
 매년 4월 정산 반영
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 2026 건강보험료 <span className="text-electric">연말정산 가이드</span>
 </h1>
 <PublishedMeta publishedDate="2026-04-01" updatedDate="2026-07-13" className="mb-2" />
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 직장인 건강보험료는 매년 4월분 보험료에 작년 실제 소득 기준으로
 정산됩니다. 정산금 부담 줄이는 분할납부와 환급 시점, 그리고 7월
 월급이 달라졌다면 확인할 국민연금 재산정까지 정리했습니다.
 </p>
 <p className="mt-6 inline-block text-xs text-canvas-700 px-4 py-2 bg-canvas-100 rounded-xl border border-canvas-200">
 📚 공식 출처:{" "}
 <a
 href="https://www.nhis.or.kr/nhis/minwon/retrieveJobCalcView.do"
 target="_blank"
 rel="noopener noreferrer"
 className="text-electric font-bold hover:underline"
 >
 국민건강보험공단 직장보험료 모의계산
 </a>
 </p>
 </div>

 {/* Why Section */}
 <section className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
 <h2 className="text-xl font-black text-navy mb-4 flex items-center gap-2">
 <AlertCircle className="w-5 h-5 text-electric" />
 왜 4월에 정산되나요?
 </h2>
 <p className="text-sm text-muted-blue leading-relaxed mb-4">
 매월 떼는 건강보험료는 <strong className="text-navy">전년도 보수 기준</strong>으로 산정한 임시 금액입니다.
 매년 초 작년 실제 보수총액이 확정되면(2026년부터 국세청 자료 연계로 약 61% 자동 처리), 그 차액이{" "}
 <strong className="text-navy">4월분 보험료에 한 번에 정산·고지</strong>됩니다. 2026년에는
 1,035만명이 평균 21만 9천원을 추가 납부하고, 355만명이 평균 11만 5천원을 환급받았습니다.
 </p>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
 <div className="p-4 bg-canvas rounded-xl">
 <div className="flex items-center gap-2 mb-2">
 <TrendingUp className="w-4 h-4 text-red-500" />
 <p className="text-sm font-bold text-navy">소득 증가 시</p>
 </div>
 <p className="text-xs text-muted-blue">4월분 보험료에 추가 정산금 차감 (부담 ↑)</p>
 </div>
 <div className="p-4 bg-canvas rounded-xl">
 <div className="flex items-center gap-2 mb-2">
 <TrendingDown className="w-4 h-4 text-green-500" />
 <p className="text-sm font-bold text-navy">소득 감소 시</p>
 </div>
 <p className="text-xs text-muted-blue">4월분 보험료에서 환급 반영 (이득)</p>
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

 {/* CTA — 건보료 전용 계산기 (기존엔 홈으로만 연결돼 단방향 링크였음) */}
 <Link
 href="/health-insurance-fee-2026"
 className="block mb-4 p-6 sm:p-8 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors group"
 >
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm font-bold opacity-90 mb-2">계산기 바로가기</p>
 <h3 className="text-xl sm:text-2xl font-black mb-2">
 내 월 건강보험료 정확히 계산
 </h3>
 <p className="text-sm opacity-90">
 직장가입자(본인부담 3.595%)·지역가입자 비교, 장기요양보험까지 자동 계산.
 </p>
 </div>
 <Calculator className="w-12 h-12 opacity-50 group-hover:opacity-80 transition-opacity flex-shrink-0" />
 </div>
 </Link>
 <Link
 href="/national-pension-estimate-2026"
 className="block mb-12 p-5 bg-white rounded-2xl border border-canvas-200 hover:border-electric transition-colors group"
 >
 <div className="flex items-center justify-between gap-3">
 <div>
 <p className="text-xs font-bold text-electric mb-1">7월 월급이 달라졌다면</p>
 <p className="font-bold text-navy text-sm">
 국민연금 기준소득월액 재산정 확인 — 예상수령액 계산기
 </p>
 </div>
 <ArrowRight className="w-5 h-5 text-electric group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
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
 <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">
 {item.answer}
 </p>
 </details>
 ))}
 </div>
 </section>

 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />

 <RelatedCalculators currentPath="/health-insurance-2026" />

 <div className="mt-8">
 <HomeTopAd />
 </div>
 </div>
 </main>
 );
}
