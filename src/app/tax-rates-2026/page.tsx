// src/app/tax-rates-2026/page.tsx
// 2026년 한국 세율표 종합 — 소득세·증여세·상속세·양도세·법인세

import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, ArrowRight, FileText } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 세율표 한눈에 — 소득세·증여세·상속세·양도세·법인세",
 description:
 "2026년 한국 모든 세금 누진세율표. 근로소득세 6~45%, 증여세 10~50%, 상속세 10~50%, 양도세 6~45%, 법인세 9~24%까지 한 페이지에서.",
 path: "/tax-rates-2026",
 keywords: [
 "2026 세율",
 "소득세 세율",
 "증여세 세율",
 "상속세 세율",
 "양도소득세 세율",
 "법인세율",
 "누진세율표",
 ],
});

const FAQ_ITEMS = [
 {
 question: "2026년 소득세율이 변경되었나요?",
 answer:
 "2026년 소득세 누진세율은 6~45% 8단계 구조로 유지됩니다. 다만 일부 구간 한계점은 매년 조정될 수 있으며, 세액공제 항목(자녀 공제, 결혼세액공제 50만 부활 등)이 추가되었습니다.",
 },
 {
 question: "누진세율은 어떻게 적용되나요?",
 answer:
 "과세표준이 1억이라고 1억 전체에 35% 세율이 적용되는 게 아닙니다. 1,400만까지는 6%, 1,400~5천은 15%, 5천~8.8천은 24%, 8.8천~1.5억은 35%로 구간별로 누진 적용. 누진공제액을 빼면 더 간단히 계산됩니다.",
 },
 {
 question: "증여세와 상속세 세율은 같은가요?",
 answer:
 "맞습니다. 증여세와 상속세 모두 10~50% 5단계 누진세율로 동일합니다. 다만 공제 한도가 다릅니다 — 증여세는 직계비속 5천만(미성년 2천만)·배우자 6억, 상속세는 일괄공제 5억·배우자 최대 30억.",
 },
];

const INCOME_TAX_BRACKETS = [
 { min: 0, max: 14000000, rate: "6%", deduction: 0 },
 { min: 14000000, max: 50000000, rate: "15%", deduction: 1260000 },
 { min: 50000000, max: 88000000, rate: "24%", deduction: 5760000 },
 { min: 88000000, max: 150000000, rate: "35%", deduction: 15440000 },
 { min: 150000000, max: 300000000, rate: "38%", deduction: 19940000 },
 { min: 300000000, max: 500000000, rate: "40%", deduction: 25940000 },
 { min: 500000000, max: 1000000000, rate: "42%", deduction: 35940000 },
 { min: 1000000000, max: null, rate: "45%", deduction: 65940000 },
];

const INHERITANCE_GIFT_BRACKETS = [
 { range: "1억 이하", rate: "10%", deduction: "-" },
 { range: "5억 이하", rate: "20%", deduction: "1,000만" },
 { range: "10억 이하", rate: "30%", deduction: "6,000만" },
 { range: "30억 이하", rate: "40%", deduction: "1억 6,000만" },
 { range: "30억 초과", rate: "50%", deduction: "4억 6,000만" },
];

const CORPORATE_TAX_BRACKETS = [
 { range: "2억 이하", rate: "9%" },
 { range: "200억 이하", rate: "19%" },
 { range: "3,000억 이하", rate: "21%" },
 { range: "3,000억 초과", rate: "24%" },
];

function formatKrw(num: number): string {
 if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
 if (num >= 10000) return `${(num / 10000).toLocaleString("ko-KR")}만`;
 return num.toLocaleString("ko-KR");
}

export default function TaxRates2026Page() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "2026 세율표", path: "/tax-rates-2026" },
 ]),
 faqLd(FAQ_ITEMS),
 speakableLd({
 url: "/tax-rates-2026",
 cssSelectors: [".faq-answer"],
 }),
 ]}
 />

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
 <FileText className="w-4 h-4" />
 2026년 기준
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 2026 세율표 <span className="text-electric">한눈에</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 한국 모든 세금의 2026년 누진세율을 한 페이지로.
 소득세·증여세·상속세·양도세·법인세까지.
 </p>
 </div>

 {/* 소득세 */}
 <section className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
 <h2 className="text-xl sm:text-2xl font-black text-navy mb-2">
 종합소득세·근로소득세 누진세율
 </h2>
 <p className="text-sm text-faint-blue mb-6">
 과세표준 기준 8단계 누진세율. 지방소득세 10% 별도 (실효세율 +10%).
 </p>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b-2 border-canvas-200">
 <th className="py-3 px-2 text-left text-navy font-bold">과세표준</th>
 <th className="py-3 px-2 text-center text-navy font-bold">세율</th>
 <th className="py-3 px-2 text-right text-navy font-bold">누진공제</th>
 </tr>
 </thead>
 <tbody>
 {INCOME_TAX_BRACKETS.map((bracket, idx) => (
 <tr key={idx} className="border-b border-canvas">
 <td className="py-3 px-2 text-muted-blue">
 {bracket.min === 0 ? "0" : formatKrw(bracket.min)} ~{" "}
 {bracket.max ? formatKrw(bracket.max) : "초과"}
 </td>
 <td className="py-3 px-2 text-center font-bold text-electric">{bracket.rate}</td>
 <td className="py-3 px-2 text-right text-muted-blue font-mono">
 {bracket.deduction === 0 ? "-" : `${bracket.deduction.toLocaleString("ko-KR")}원`}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <div className="mt-6 p-4 bg-canvas rounded-xl">
 <p className="text-xs text-muted-blue leading-relaxed">
 <strong className="text-navy">계산 공식:</strong> 산출세액 = (과세표준 × 세율) - 누진공제
 <br />
 예) 과세표준 5,000만 → 5,000만 × 15% - 126만 = 624만
 </p>
 </div>
 </section>

 <InArticleAd />

 {/* 증여세·상속세 */}
 <section className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
 <h2 className="text-xl sm:text-2xl font-black text-navy mb-2">
 증여세·상속세 누진세율 (동일)
 </h2>
 <p className="text-sm text-faint-blue mb-6">
 증여세와 상속세는 동일한 5단계 누진세율 적용. 공제 한도만 다름.
 </p>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b-2 border-canvas-200">
 <th className="py-3 px-2 text-left text-navy font-bold">과세표준</th>
 <th className="py-3 px-2 text-center text-navy font-bold">세율</th>
 <th className="py-3 px-2 text-right text-navy font-bold">누진공제</th>
 </tr>
 </thead>
 <tbody>
 {INHERITANCE_GIFT_BRACKETS.map((b, idx) => (
 <tr key={idx} className="border-b border-canvas">
 <td className="py-3 px-2 text-muted-blue">{b.range}</td>
 <td className="py-3 px-2 text-center font-bold text-electric">{b.rate}</td>
 <td className="py-3 px-2 text-right text-muted-blue">{b.deduction}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div className="p-4 bg-canvas rounded-xl">
 <p className="text-xs font-bold text-navy mb-2">증여세 공제 한도 (10년 누적)</p>
 <ul className="text-xs text-muted-blue space-y-1">
 <li>· 배우자 6억</li>
 <li>· 직계비속 5,000만 (미성년 2,000만)</li>
 <li>· 직계존속 5,000만</li>
 <li>· 기타 친족 1,000만</li>
 </ul>
 </div>
 <div className="p-4 bg-canvas rounded-xl">
 <p className="text-xs font-bold text-navy mb-2">상속세 공제 한도</p>
 <ul className="text-xs text-muted-blue space-y-1">
 <li>· 일괄공제 5억</li>
 <li>· 배우자 공제 최대 30억</li>
 <li>· 자녀 1인 5,000만</li>
 <li>· 금융재산 공제 최대 2억</li>
 </ul>
 </div>
 </div>
 </section>

 {/* 양도세 */}
 <section className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
 <h2 className="text-xl sm:text-2xl font-black text-navy mb-2">
 부동산·주식 양도소득세
 </h2>
 <p className="text-sm text-faint-blue mb-6">
 부동산 양도세는 종합소득세와 동일 누진세율 (6~45%) + 지방세 10%.
 </p>
 <ul className="space-y-2 text-sm text-muted-blue">
 <li><strong className="text-navy">1세대 1주택자:</strong> 12억 비과세 (2년 보유·거주)</li>
 <li><strong className="text-navy">다주택자 한시 유예:</strong> 일반 누진세율 적용 (정부 발표 따라 변동)</li>
 <li><strong className="text-navy">장기보유특별공제:</strong> 3~15년 보유, 6%~30% (1세대 1주택은 최대 80%)</li>
 <li><strong className="text-navy">주식 양도세:</strong> 국내 일반인 비과세, 대주주·해외주식 22% (250만 공제)</li>
 </ul>
 </section>

 {/* 법인세 */}
 <section className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
 <h2 className="text-xl sm:text-2xl font-black text-navy mb-2">법인세율</h2>
 <p className="text-sm text-faint-blue mb-6">
 법인 과세표준 기준 4단계. 지방소득세 10% 별도.
 </p>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b-2 border-canvas-200">
 <th className="py-3 px-2 text-left text-navy font-bold">과세표준</th>
 <th className="py-3 px-2 text-center text-navy font-bold">세율</th>
 </tr>
 </thead>
 <tbody>
 {CORPORATE_TAX_BRACKETS.map((b, idx) => (
 <tr key={idx} className="border-b border-canvas">
 <td className="py-3 px-2 text-muted-blue">{b.range}</td>
 <td className="py-3 px-2 text-center font-bold text-electric">{b.rate}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </section>

 {/* CTA */}
 <Link
 href="/"
 className="block mb-12 p-6 sm:p-8 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors group"
 >
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm font-bold opacity-90 mb-2">계산기 바로가기</p>
 <h3 className="text-xl sm:text-2xl font-black mb-2">
 내 연봉의 정확한 세금은?
 </h3>
 <p className="text-sm opacity-90">
 누진세율을 자동 적용한 실수령액 즉시 계산
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

 <RelatedCalculators currentPath="/tax-rates-2026" />

 <div className="mt-8">
 <HomeTopAd />
 </div>
 </div>
 </main>
 );
}
