// src/app/year-end-tax/page.tsx

import type { Metadata } from "next";
import YearEndTaxCalculator from "@/components/YearEndTaxCalculator";
import RelatedCalculators from "@/components/RelatedCalculators";
import JsonLd from "@/components/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbLd, softwareApplicationLd, faqLd, speakableLd } from "@/lib/structuredData";
import { InArticleAd, HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";

export const metadata: Metadata = buildPageMetadata({
 title: "연말정산 환급금 계산기 - 13월의 월급 미리 보기 (2026)",
 description:
 "총급여·신용카드·의료비·연금저축·기부금 입력 → 2026년 귀속 연말정산 예상 환급금 즉시 계산. 놓치기 쉬운 공제 항목과 절세 전략까지 한 번에.",
 path: "/year-end-tax",
 keywords: [
 "연말정산 계산기",
 "연말정산 환급금",
 "13월의 월급",
 "신용카드 공제",
 "의료비 공제",
 "연금저축 공제",
 "2026 연말정산",
 ],
});

const FAQ_ITEMS = [
 {
 question: "연말정산 환급금은 어떻게 계산되나요?",
 answer:
 "근로소득공제 후 과세표준에 누진세율(6~45%)을 적용해 산출세액을 계산하고, 신용카드·의료비·교육비·기부금 등 세액공제를 차감합니다. 미리 낸 원천징수세보다 적으면 환급, 많으면 추가 납부됩니다.",
 },
 {
 question: "신용카드 공제 한도는 어떻게 되나요?",
 answer:
 "총급여의 25%를 초과한 금액부터 공제됩니다. 신용카드 15%, 체크카드/현금영수증 30%, 전통시장·대중교통 40% 공제율이 적용되며 최대 300만원(총급여 7천만 이하)까지입니다.",
 },
 {
 question: "연금저축·IRP 세액공제는 얼마까지 받을 수 있나요?",
 answer:
 "연금저축 600만원 + IRP 추가 300만원 = 최대 900만원까지 납입 가능합니다. 총급여 5,500만원 이하는 16.5%, 초과는 13.2% 세액공제율이 적용됩니다 (최대 약 148만원 절세).",
 },
];

export default function YearEndTaxPage() {
 return (
 <main className="w-full min-h-screen bg-canvas -[#191F28]">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "연말정산 계산기", path: "/year-end-tax" },
 ]),
 softwareApplicationLd({
 name: "연말정산 환급금 계산기",
 description:
 "13월의 월급을 미리 계산하는 2026 귀속 연말정산 시뮬레이터.",
 url: "/year-end-tax",
 }),
 faqLd(FAQ_ITEMS),
 speakableLd({
 url: "/year-end-tax",
 cssSelectors: [".faq-answer"],
 }),
 ]}
 />
 {/* Hero */}
 <section className="relative pt-32 pb-16 px-4 text-center overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-primary via-white to-primary/80 -[#0f1623] -[#191F28] -[#1a2035] -z-10" />
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 /50/10 rounded-full blur-[120px] -z-10" />

 <div className="max-w-3xl mx-auto">
 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/50/10 border border-primary/20 text-primary font-bold text-sm mb-6">
 💰 13월의 월급
 </div>
 <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight mb-5 leading-[1.15] text-navy ">
 연말정산 환급금<br />
 <span className="text-primary">미리 계산해보세요</span>
 </h1>
 <p className="text-lg sm:text-xl text-faint-blue leading-relaxed font-medium">
 2026년 귀속 연말정산, 예상 환급금을 미리 계산하고<br className="hidden sm:block" />
 절세 전략을 세워보세요.
 </p>

 
 </div>
 </section>

 {/* 계산기 섹션 */}
 <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 -mt-4">
 <YearEndTaxCalculator />

 <div className="max-w-4xl mx-auto mt-10">
 <InArticleAd />

 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />

 <RelatedCalculators currentPath="/year-end-tax" />

 <div className="mt-8">
 <HomeTopAd />
 </div>
 </div>
 </section>
 </main>
 );
}
