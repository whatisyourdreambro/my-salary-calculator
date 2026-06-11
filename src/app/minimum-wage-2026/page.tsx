// src/app/minimum-wage-2026/page.tsx
// 최저임금 2026 시즌 페이지 — 매년 8월 공표·10월 확정 시즌 검색 폭증

import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, ArrowRight, Calculator, FileText, Calendar } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import PublishedMeta from "@/components/PublishedMeta";
import { breadcrumbLd, faqLd, articleLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import ShareButtons from "@/components/ShareButtons";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 최저임금 시급 10,320원 — 주휴 포함 월 2,156,880원 환산표",
 description:
 "2026 최저시급 10,320원(전년 대비 +290원, 2.9% 인상). 주휴수당 포함 월급 2,156,880원, 연봉 25,882,560원. 시급·월급·연봉 환산표, 적용 시점, 위반 시 처벌까지 한 번에.",
 path: "/minimum-wage-2026",
 ogType: "article",
 publishedTime: "2026-05-22",
 modifiedTime: "2026-05-23",
 keywords: [
 "최저임금 2026",
 "2026 최저임금",
 "2026 최저시급",
 "최저시급 10320원",
 "최저임금 시급",
 "최저임금 월급",
 "최저임금 연봉",
 "주휴수당 포함 월급",
 "최저임금 인상률",
 "최저임금 위반",
 ],
});

const FAQ_ITEMS = [
 {
 question: "2026 최저임금은 언제부터 적용되나요?",
 answer:
 "최저임금법에 따라 매년 1월 1일부터 12월 31일까지 적용됩니다. 매년 8월 5일 전 고용노동부장관이 결정·고시하고, 다음해 1월 1일부터 효력이 발생합니다. 2026년 최저임금은 2025년 8월 5일 이전에 고시되어 2026년 1월 1일부터 적용됩니다.",
 },
 {
 question: "최저임금 시급에 주휴수당이 포함되나요?",
 answer:
 "아니요. 최저임금 시급은 주휴수당을 제외한 시급입니다. 다만 월급으로 계산할 때는 주휴수당을 포함해 월 209시간(주 40시간 × 4.345주)으로 환산하는 것이 일반적입니다. 예: 시급 1만원 × 209시간 = 월 209만원(주휴수당 포함).",
 },
 {
 question: "최저임금에 포함되는 임금과 제외되는 임금은?",
 answer:
 "포함: 기본급, 정기상여금(매월 1/12 지급분), 통화로 지급되는 식대·교통비. 제외: 연장·휴일·야간근로수당, 비정기상여금, 식사·기숙사 등 현물 복지. 2024년부터 정기상여금·복리후생비 전액이 최저임금에 산입됩니다.",
 },
 {
 question: "수습 기간에도 최저임금이 적용되나요?",
 answer:
 "원칙적으로 적용되지만, 1년 이상 근로계약을 체결한 자에 한해 수습 시작일부터 3개월 이내까지 최저임금의 90%를 지급할 수 있습니다(단순노무 종사자 제외). 즉 단기 알바·일용직은 첫날부터 100%, 정규직은 수습 3개월간 90% 적용 가능.",
 },
 {
 question: "주 15시간 미만 단시간 근로자도 최저임금이 같나요?",
 answer:
 "네, 시급 기준은 동일합니다. 다만 주 15시간 미만 근로자(초단시간 근로자)는 주휴수당·연차·퇴직금이 적용되지 않습니다. 시급으로만 비교하면 동일하지만 월급 환산 시 주휴수당 미포함이라 정규직 대비 약 17% 적게 받습니다.",
 },
 {
 question: "최저임금 위반 시 사업주 처벌은?",
 answer:
 "최저임금법 제28조에 따라 3년 이하 징역 또는 2,000만원 이하 벌금. 차액 미지급분은 임금 체불로 별도 처벌 + 지연이자(연 20%) 부과. 신고는 고용노동부 1350 또는 가까운 노동지청·고용노동부 홈페이지에서 가능.",
 },
 {
 question: "최저임금이 안 지켜질 때 어떻게 신고하나요?",
 answer:
 "① 본인 임금명세서·근로계약서·통장 입금 내역 확보 → ② 고용노동부 1350 전화 상담 또는 노동포털(www.moel.go.kr) 임금체불 신고 → ③ 가까운 지방고용노동관서 방문 진정. 통상 2~3개월 내 차액 지급 명령 받을 수 있습니다. 신고자 익명 보호 가능.",
 },
 {
 question: "최저임금과 통상임금은 같은 건가요?",
 answer:
 "다릅니다. 최저임금은 시간당 지급해야 할 최소 금액(법정 하한). 통상임금은 연장·야간·휴일 근로수당 산정의 기준이 되는 임금(고정·정기·일률적으로 지급되는 임금 합산). 통상임금이 최저임금보다 보통 높지만, 산정 방식과 적용 영역이 완전히 다릅니다.",
 },
 {
 question: "외국인 근로자에게도 최저임금이 적용되나요?",
 answer:
 "네, 국적·체류 자격 관계없이 모든 근로자에게 적용됩니다. E-9(고용허가제), F-4(재외동포), 유학생 알바 모두 동일. 외국인 차별 지급은 최저임금법 + 외국인근로자 고용법 동시 위반.",
 },
 {
 question: "최저임금 인상이 직장인 연봉에도 영향을 주나요?",
 answer:
 "간접적으로 영향이 있습니다. 최저임금 인상 → 신입 초봉 인상 압력 → 전체 연봉 테이블 동반 인상 사례 많음. 특히 유통·외식·서비스업은 직접 영향. 본인 월급이 최저임금 기준(2026년 주휴 포함 월 2,156,880원) 미만이면 즉시 인상 청구 가능.",
 },
];

export default function MinimumWage2026Page() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "최저임금 2026", path: "/minimum-wage-2026" },
 ]),
 faqLd(FAQ_ITEMS),
 articleLd({
 title: "최저임금 2026 — 시급·월급·연봉 환산 + 인상률·위반 처벌",
 description: "주휴수당 포함 월급 환산, 적용 시점, 위반 시 처벌, 신고 방법 종합",
 slug: "minimum-wage-2026",
 publishedDate: "2026-05-22",
 modifiedDate: "2026-05-22",
 }),
 speakableLd({
 url: "/minimum-wage-2026",
 cssSelectors: [".faq-answer"],
 }),
 ]}
 />

 <div className="page-width">
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
 <Calendar className="w-4 h-4" />
 매년 8월 5일 고시 · 1월 1일 적용
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 최저임금 2026 <span className="text-electric">시급·월급·연봉</span>
 </h1>
 <PublishedMeta publishedDate="2026-05-22" updatedDate="2026-05-22" className="mb-2" />
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 시급 기준은 매년 8월 5일 고용노동부장관이 고시하고, 다음 해 1월 1일부터 적용됩니다.
 주휴수당 포함 월급은 209시간(주 40시간 × 4.345주) 기준으로 환산합니다.
 </p>
 <p className="mt-6 inline-block text-xs text-canvas-700 px-4 py-2 bg-canvas-100 rounded-xl border border-canvas-200">
 📚 공식 출처:{" "}
 <a
 href="https://www.minimumwage.go.kr/"
 target="_blank"
 rel="noopener noreferrer"
 className="text-electric font-bold hover:underline"
 >
 최저임금위원회 공식 사이트
 </a>
 </p>
 </div>

 {/* 핵심 본문 */}
 <section className="mb-12 max-w-3xl mx-auto prose prose-slate">
 <p className="text-sm leading-7 text-muted-blue">
 최저임금은 근로자의 생활 안정을 위해 국가가 정한 임금의 하한선입니다. 매년
 최저임금위원회에서 결정해 8월 5일 이전 고시 → 다음 해 1월 1일부터 적용됩니다.
 사업주가 최저임금 미만으로 임금을 지급하면 3년 이하 징역 또는 2,000만원 이하 벌금이
 부과되며, 차액 미지급분은 임금 체불로 별도 처벌됩니다.
 </p>
 <p className="text-sm leading-7 text-muted-blue mt-4">
 <strong>시급 → 월급 환산</strong>은 209시간 기준이 표준입니다. 주 40시간 근무 +
 주휴 8시간 = 주 48시간, 4.345주 = 월 약 209시간. 시급 1만원이면 월 209만원
 (주휴수당 포함). 단, 주 15시간 미만 단시간 근로자는 주휴수당이 없어 월 환산이
 다릅니다.
 </p>
 <p className="text-sm leading-7 text-muted-blue mt-4">
 직장인이라면 본인 시급(연봉 ÷ 2,088시간)이 최저임금 이상인지 확인하는 게 중요합니다.
 2026년 최저임금으로 환산한 연봉은 약 2,588만원(주휴 포함 월 2,156,880원 × 12개월)
 으로, 연봉이 이보다 적다면 즉시 인상 청구가 가능하니 머니샐러리 연봉 계산기로 실제
 시급을 확인해보세요. 또한 최저임금 인상은 신입 초봉·전 직급 연봉 테이블에 간접
 영향을 주므로 매년 1월 인상분 파악이 필수입니다.
 </p>
 </section>

 <InArticleAd />

 {/* 시간 단위 환산표 */}
 <section className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
 <h2 className="text-xl font-black text-navy mb-6 flex items-center gap-2">
 <TrendingUp className="w-5 h-5 text-electric" />
 시급 → 월급·연봉 환산 (209시간 기준, 주휴수당 포함)
 </h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {[
 { hourly: 9860, label: "2024 시급" },
 { hourly: 10030, label: "2025 시급" },
 { hourly: 10320, label: "2026 시급 (확정)" },
 { hourly: 11000, label: "시급 11,000원 (참고)" },
 { hourly: 12000, label: "시급 12,000원 (참고)" },
 { hourly: 13000, label: "시급 13,000원 (참고)" },
 ].map((row) => {
 const monthly = row.hourly * 209;
 const yearly = monthly * 12;
 return (
 <div key={row.hourly} className="p-4 bg-canvas rounded-xl">
 <p className="text-xs font-bold text-faint-blue mb-1">{row.label}</p>
 <p className="text-lg font-black text-electric">
 시급 {row.hourly.toLocaleString("ko-KR")}원
 </p>
 <p className="text-sm text-muted-blue mt-1">
 월 {Math.round(monthly / 10000).toLocaleString("ko-KR")}만원 · 연{" "}
 {Math.round(yearly / 10000).toLocaleString("ko-KR")}만원
 </p>
 </div>
 );
 })}
 </div>
 <p className="text-xs text-faint-blue mt-4">
 ※ 2026 최저시급 10,320원은 고용노동부 고시 확정 수치입니다 (주휴 포함 월 209시간 기준
 월 2,156,880원).
 </p>
 </section>

 {/* CTAs */}
 <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
 <Link
 href="/"
 className="block p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
 >
 <Calculator className="w-8 h-8 opacity-70 mb-3" />
 <h3 className="text-lg font-black mb-2">연봉 실수령액 계산</h3>
 <p className="text-sm opacity-90">본인 시급 vs 최저임금 비교</p>
 </Link>
 <Link
 href="/new-employee-salary-2026"
 className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
 >
 <FileText className="w-8 h-8 text-electric mb-3" />
 <h3 className="text-lg font-black mb-2">신입 초봉 TOP 50</h3>
 <p className="text-sm text-muted-blue">회사 480곳 영끌 순위</p>
 </Link>
 <Link
 href="/social-insurance-rates-2026"
 className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
 >
 <FileText className="w-8 h-8 text-electric mb-3" />
 <h3 className="text-lg font-black mb-2">2026 4대보험 요율</h3>
 <p className="text-sm text-muted-blue">최저임금과 함께 매년 변경</p>
 </Link>
 </section>

 {/* FAQ */}
 <section className="mb-12 max-w-3xl mx-auto">
 <h2 className="text-xl font-black text-navy mb-6">최저임금 자주 묻는 질문</h2>
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

 <RelatedCalculators currentPath="/minimum-wage-2026" />

 <div className="mt-8 max-w-3xl mx-auto">
 <ShareButtons
 title="최저임금 2026 — 시급·월급·연봉 환산표"
 description="주휴수당 포함 월급, 작년 대비 인상률, 위반 처벌 한눈에"
 />
 </div>

 <div className="mt-8">
 <HomeTopAd />
 </div>
 </div>
 </main>
 );
}
