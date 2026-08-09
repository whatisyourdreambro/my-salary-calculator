// src/app/year-end-tax-settlement-2026/page.tsx
// 12월 연말정산 + 성과급 시즌 페이지

import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Gift, ArrowRight, Calculator } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import PublishedMeta from "@/components/PublishedMeta";
import YearEndTaxCluster from "@/components/YearEndTaxCluster";
import { breadcrumbLd, faqLd, articleLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";

export const metadata: Metadata = buildPageMetadata({
 // 의도: 근로자 12월 시즌 가이드 (전략·읽는 콘텐츠). 체크리스트는 별도 페이지(/year-end-tax-checklist), 계산기는 /year-end-tax.
 title: "2026 근로자 연말정산 + 성과급 절세 가이드 — 12월 IRP 만기 납입까지",
 description:
 "성과급 1천만원 받으면 한계세율 35%→38%로 점프할 수 있음. 12월까지 IRP·연금저축 최대 900만원 납입 시 환급 약 119~149만원. 2026 근로자 연말정산 + 성과급 절세 6가지 핵심 전략.",
 path: "/year-end-tax-settlement-2026",
 ogType: "article",
 publishedTime: "2026-01-15",
 modifiedTime: "2026-08-07",
 keywords: [
 "근로자 연말정산 2026",
 "2026 연말정산",
 "2026 연말정산 달라지는 점",
 "연말정산 미리보기",
 "연말정산 절세",
 "성과급 세금 절세",
 "성과급 IRP 절세",
 "12월 연말정산 가이드",
 "성과급 한계세율",
 "연봉인상 후 절세",
 "연금저축 환급",
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
 {
 question: "2026년 귀속 연말정산에서 달라지는 점은 무엇인가요?",
 answer:
 "올해 소득분에는 신용카드 소득공제 자녀 추가 한도(1명 +50만원, 2명 이상 +100만원), 출산·보육수당 비과세 월 20만원, 교육비 세액공제 확대(자녀 소득요건 폐지, 9세 미만 예체능 학원비 포함), 월세 세액공제 주말부부 각자 신청 등이 적용됩니다. 8월 3일 발표된 2026 세제개편안(인적공제 소득요건 300만원 완화 등)은 국회 통과 시 2027년 소득분부터 적용되므로 올해 연말정산과는 무관합니다.",
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
 url: "/year-end-tax-settlement-2026",
 publishedDate: "2026-01-15",
 modifiedDate: "2026-08-07",
 }),
 speakableLd({
 url: "/year-end-tax-settlement-2026",
 cssSelectors: [".faq-answer"],
 }),
 ]}
 />

 <div className="page-width">
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
 <Gift className="w-4 h-4" />
 12월 골든타임
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 13월의 월급, <span className="text-electric">제대로 받기</span>
 </h1>
 <PublishedMeta publishedDate="2026-01-15" updatedDate="2026-08-07" className="mb-2" />
 <YearEndTaxCluster />
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

 <InArticleAd />

 {/* 2026년 귀속 확정 변경사항 — 시즌 검색 의도("2026 연말정산 달라지는 점") 대응 */}
 <section className="mb-12">
 <h2 className="text-xl font-black text-navy mb-2">
 2026 연말정산 달라지는 점 — 올해 확정 적용 항목
 </h2>
 <p className="text-sm text-muted-blue leading-relaxed mb-4">
 올해(2026년) 소득분 연말정산에는 작년 개정으로 확정된 아래 항목이
 적용됩니다. 미리보기 단계에서 빠뜨리기 쉬운 신설·확대 공제부터
 챙기세요.
 </p>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {[
 {
 title: "신용카드 공제 자녀 추가 한도",
 body: "자녀 1명 +50만원, 2명 이상 +100만원 한도 추가 (총급여 7천만원 초과자는 절반).",
 },
 {
 title: "출산·보육수당 비과세 월 20만원",
 body: "자녀 1인당 월 20만원까지 비과세. 급여명세서에서 적용 여부 확인.",
 },
 {
 title: "교육비 세액공제 확대",
 body: "자녀 소득요건 폐지, 9세 미만 자녀의 예체능 학원비도 공제 대상 포함.",
 },
 {
 title: "월세 세액공제 — 주말부부 각자 신청",
 body: "주말부부는 각자 신청 가능 (부부합산 한도 연 1,000만원).",
 },
 ].map((item) => (
 <div
 key={item.title}
 className="p-5 bg-white rounded-2xl border border-canvas-200"
 >
 <p className="font-bold text-navy text-sm mb-1">{item.title}</p>
 <p className="text-xs text-muted-blue leading-relaxed">{item.body}</p>
 </div>
 ))}
 </div>
 <div className="mt-4 p-5 bg-canvas-100 rounded-2xl border border-canvas-200">
 <p className="text-sm text-muted-blue leading-relaxed">
 ⚠️ <strong>8월 3일 발표된 2026 세제개편안</strong>(부양가족 인적공제
 소득요건 300만원 완화, 월세 세액공제 한도 1,200만원 등)은 국회 통과
 시 <strong>2027년 소득분부터</strong> 적용됩니다. 올해 연말정산과는
 무관하니 혼동하지 마세요. 발표 내용은{" "}
 <Link
 href="/tax-reform-2026"
 className="text-electric font-bold hover:underline"
 >
 2026 세법개정안 총정리
 </Link>
 에서, 올해 시행분 전체 목록은{" "}
 <Link
 href="/tax-changes-2026"
 className="text-electric font-bold hover:underline"
 >
 2026 세법 변경사항
 </Link>
 에서 확인하세요.
 </p>
 <p className="text-xs text-faint-blue leading-relaxed mt-3">
 💡 국세청 홈택스의 &lsquo;연말정산 미리보기&rsquo; 서비스는 예년 기준 10월
 말~11월에 열립니다. 그 전에는 아래 계산기로 예상 환급금을 먼저
 확인해보세요.
 </p>
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

 {/* 공제 항목별 정밀 계산기 — 연말정산 클러스터 내부링크 */}
 <section className="mb-12">
 <h2 className="text-xl font-black text-navy mb-2">공제 항목별 정밀 계산기</h2>
 <p className="text-sm text-muted-blue leading-relaxed mb-4">
 6대 점검 중 신용카드·의료비·월세는 전용 계산기로 예상 공제액을 미리
 계산할 수 있습니다.
 </p>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <Link
 href="/credit-card-deduction-2026"
 className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
 >
 <div className="text-2xl mb-3">💳</div>
 <h3 className="text-base font-black mb-2">신용카드 소득공제 계산기</h3>
 <p className="text-sm text-muted-blue">
 25% 문턱·자녀 수별 한도 반영 — 12월 한도 채우기 전 확인
 </p>
 </Link>
 <Link
 href="/medical-tax-credit-2026"
 className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
 >
 <div className="text-2xl mb-3">🏥</div>
 <h3 className="text-base font-black mb-2">의료비 세액공제 계산기</h3>
 <p className="text-sm text-muted-blue">
 실손 차감·총급여 3% 문턱·난임 30%까지 반영 계산
 </p>
 </Link>
 <Link
 href="/rent-tax-credit-2026"
 className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
 >
 <div className="text-2xl mb-3">🏠</div>
 <h3 className="text-base font-black mb-2">월세 세액공제 계산기</h3>
 <p className="text-sm text-muted-blue">
 15%·17% 자동 판정, 연 1,000만원 한도 최대 170만원
 </p>
 </Link>
 </div>
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

 <RelatedCalculators currentPath="/year-end-tax-settlement-2026" />

 <div className="mt-8">
 <HomeTopAd />
 </div>
 </div>
 </main>
 );
}
