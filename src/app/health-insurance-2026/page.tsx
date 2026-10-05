// src/app/health-insurance-2026/page.tsx
// 건강보험료 연말정산 가이드 페이지.
//
// 근로자의 정기 연말정산(4월분)과 개인별 급여 공제 시점은 구분한다.
// 2026-10-04: 10월 1일 시행 분납 기준 및 시행 전 재산정분의 경과조치를 반영.
// 건강보험 보수월액 변경·분납도 월급 공제에 영향을 주므로 월만으로 원인을 단정하지 않는다.

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Calendar, AlertCircle, ArrowRight, Calculator, TrendingUp, TrendingDown } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import ShareSection from "@/components/ShareSection";
import PublishedMeta from "@/components/PublishedMeta";
import { breadcrumbLd, faqLd, articleLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd, GuideMidAd, CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 건강보험료 연말정산 — 4월 정산·10월 분납·환급 가이드",
 description:
 "직장인 건보료 연말정산은 4월분 보험료에 반영됩니다. 2025년 귀속 정산(공단 발표): 1,035만명 평균 21만9천원 추가 납부·355만명 평균 11만5천원 환급. 2026년 10월부터 바뀐 분할납부 기준과 시행 전 재산정분 예외, 급여 공제액·환급 확인법까지 정리.",
 path: "/health-insurance-2026",
 ogType: "article",
 publishedTime: "2026-04-01",
 modifiedTime: "2026-10-04",
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
 note: "2026년에 실시한 2025년 귀속 정산에서는 간이지급명세서 연계로 약 61%(1,020만명) 자동 처리",
 },
 {
 date: "4월",
 event: "건강보험료 연말정산 반영·고지",
 note: "근로자의 정기 정산 차액을 4월분에 반영·고지하며, 실제 급여 반영 달과 분납액은 회사 안내로 확인",
 },
 {
 date: "10/1~",
 event: "정산보험료 분납 기준 변경",
 note: "2026년 10월분 안내: 추가 본인부담액 1만 80원 이상이면 신청으로 최대 12회. 시행 전 재산정분은 종전 기준",
 },
 {
 date: "7월",
 event: "국민연금 기준소득월액 재산정",
 note: "국민연금 정기 변경과 함께 건강보험 분납·보수월액 변경도 명세서에서 각각 확인",
 },
];

const FAQ_ITEMS = [
 {
 question: "건강보험료 연말정산은 언제 반영되나요?",
 answer:
 "근로자의 전년도 보수에 대한 정기 정산은 4월분 보험료에 반영됩니다. 다시 산정한 보험료가 이미 낸 보험료보다 많으면 추가 납부, 적으면 반환이 발생합니다. 실제 급여 반영 달과 분납 여부는 회사 정산 내역으로 확인하세요. 보수가 지급되지 않는 사용자는 보수월액 적용기간이 6월부터이며 성실신고사용자는 7월부터입니다. 퇴직 시 정산도 별도로 발생할 수 있습니다.",
 },
 {
 question: "정산 환급은 언제 받을 수 있나요?",
 answer:
 "실제 보수로 다시 산정한 보험료보다 이미 낸 금액이 많으면 공단이 사용자에게 차액을 반환하고, 사용자는 근로자 몫을 정산합니다. 소득 감소나 휴직만으로 환급을 확정할 수는 없습니다. 정기 정산은 4월분에 반영되지만 급여에서 돌려받는 달과 금액은 회사의 정산 안내를 확인하세요.",
 },
 {
 question: "정산금이 너무 커서 한 번에 못 내면?",
 answer:
 "2026년 10월 1일부터 분납 기준이 완화됐습니다. 공단의 2026년 10월분 안내에 따르면 추가 정산보험료의 본인부담액이 1만 80원 이상일 때 사업장 대표자의 신청으로 최대 12회 분납할 수 있습니다. 다만 시행 전에 공단이 이미 재산정한 금액은 이후 징수하더라도 종전 기준이 적용됩니다. 신청은 해당 월 납부기한까지이며, 자동이체 사업장은 마감 2일 전까지라는 공단 안내와 사업장 처리 일정을 확인하세요. 2026년 4월 정산의 5월 11일 마감은 이미 지난 해당 정산분의 기한입니다.",
 },
 {
 question: "7월 월급에서 공제액이 달라졌는데 건보료 때문인가요?",
 answer:
 "월만으로 원인을 단정할 수 없습니다. 7월에는 국민연금 기준소득월액의 정기 변경을 확인하되, 건강보험 보수월액 변경이나 정산보험료 분납도 함께 살펴보세요. 명세서의 국민연금·건강보험·장기요양보험 항목을 전월과 각각 비교하고 회사 담당자에게 변경 사유와 반영 기간을 확인하세요.",
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
 description: "4월 건보료 정산금·환급·분할납부(2026년 10월 기준 변경·경과조치)와 급여 공제액 확인",
 slug: "health-insurance-2026",
 url: "/health-insurance-2026",
 publishedDate: "2026-04-01",
 modifiedDate: "2026-10-04",
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
 <PublishedMeta publishedDate="2026-04-01" updatedDate="2026-10-04" className="mb-2" />
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 직장인 건강보험료는 매년 4월분 보험료에 작년 실제 보수 기준으로
 정산됩니다. 정산금 부담 줄이는 분할납부(2026년 10월 기준 변경)와 환급 시점,
 월급명세서 공제액 확인법까지 정리했습니다.
 </p>
 <p className="mt-6 inline-block text-xs text-canvas-700 px-4 py-2 bg-canvas-100 rounded-xl border border-canvas-200">
 📚 공식 출처:{" "}
 <a
 href="https://www.nhis.or.kr/nhis/together/wbhaea01600m01.do?articleNo=11013881&mode=view"
 target="_blank"
 rel="noopener noreferrer"
 className="text-electric font-bold hover:underline"
 >
 공단 분납 기준 변경(2026.9.30)
 </a>{" · "}
 <a href="https://www.nhis.or.kr/nhis/together/wbhaea01600m01.do?article.offset=100&articleLimit=10&articleNo=11010732&mode=view" target="_blank" rel="noopener noreferrer" className="text-electric font-bold hover:underline">
 2025년 귀속 정산 결과(2026.4.22)
 </a>{" · "}
 <a href="https://www.nhis.or.kr/lm/lmxsrv/law/lawFullContent.do?SEQ=28&SEQ_HISTORY=" target="_blank" rel="noopener noreferrer" className="text-electric font-bold hover:underline">
 시행령 제34~39조·부칙
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
 계속 근무자의 보수월액은 원칙적으로 <strong className="text-navy">전년도 보수</strong>를 기준으로 정하되, 입사·보수 변경 등에 따라 달라질 수 있습니다.
 전년도 실제 보수총액으로 다시 계산한 보험료와 이미 낸 보험료의 차액을{" "}
 <strong className="text-navy">근로자는 4월분에 정기 정산</strong>합니다. 공단의 2026년 4월 발표에 따르면
 2025년 귀속분 정산에서 1,035만명이 평균 21만 9천원을 추가 납부하고 355만명이 평균 11만 5천원을 환급받았습니다.
 이는 해당 정산의 집계이며 개인의 추가 납부·환급액을 뜻하지 않습니다.
 </p>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
 <div className="p-4 bg-canvas rounded-xl">
 <div className="flex items-center gap-2 mb-2">
 <TrendingUp className="w-4 h-4 text-red-500" />
 <p className="text-sm font-bold text-navy">재산정 보험료가 더 크면</p>
 </div>
 <p className="text-xs text-muted-blue">이미 낸 금액과의 차액 추가 납부</p>
 </div>
 <div className="p-4 bg-canvas rounded-xl">
 <div className="flex items-center gap-2 mb-2">
 <TrendingDown className="w-4 h-4 text-green-500" />
 <p className="text-sm font-bold text-navy">이미 낸 보험료가 더 크면</p>
 </div>
 <p className="text-xs text-muted-blue">사용자를 통해 근로자 몫 정산·반환</p>
 </div>
 </div>
 </section>

 <GuideMidAd />

 {/* Schedule */}
 <section className="mb-12">
 <h2 className="text-xl font-black text-navy mb-6 flex items-center gap-2">
 <Calendar className="w-5 h-5 text-electric" />
 정기 정산과 분납 기준
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
 내 월 건강보험료 예상액 계산
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
 국민연금 안내·예상수령액 계산기
 </p>
 </div>
 <ArrowRight className="w-5 h-5 text-electric group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
 </div>
 </Link>

 {/* CTA·FAQ 사이 보강 광고 — 전면 최적화 (운영자 지시 2026-09-02) */}
 <div className="mb-12">
 <CalcResultAd />
 </div>
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

 <ShareSection heading="도움이 됐다면 공유해 주세요" contentType="page" className="mt-10" />
 </div>
 </main>
 );
}
