// src/app/stats/4-insurance-rates-history/page.tsx
//
// 4대보험 요율 history — 학술·정책 인용 자석.

import type { Metadata } from "next";
import { Shield, Download, ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, articleLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "한국 4대보험 요율 history 2010~2026 — 국민연금·건보·고용·산재",
 description:
 "2010~2026년 한국 4대보험 본인·회사 부담률 변천. 국민연금 4.5% 고정, 건강보험 인상 추세, 고용·장기요양 변화 한 페이지로.",
 path: "/stats/4-insurance-rates-history",
 keywords: [
 "4대보험 요율 history",
 "건강보험료 인상 추이",
 "국민연금 요율",
 "고용보험 요율",
 "장기요양보험 요율",
 ],
});

const HISTORY = [
 { year: 2010, np: 4.5, hi: 2.815, ltc: 6.55, ei: 0.45 },
 { year: 2012, np: 4.5, hi: 2.945, ltc: 6.55, ei: 0.55 },
 { year: 2014, np: 4.5, hi: 2.995, ltc: 6.55, ei: 0.65 },
 { year: 2016, np: 4.5, hi: 3.060, ltc: 6.55, ei: 0.65 },
 { year: 2018, np: 4.5, hi: 3.120, ltc: 7.38, ei: 0.65 },
 { year: 2020, np: 4.5, hi: 3.335, ltc: 10.25, ei: 0.8 },
 { year: 2021, np: 4.5, hi: 3.430, ltc: 11.52, ei: 0.8 },
 { year: 2022, np: 4.5, hi: 3.495, ltc: 12.27, ei: 0.9 },
 { year: 2023, np: 4.5, hi: 3.545, ltc: 12.81, ei: 0.9 },
 { year: 2024, np: 4.5, hi: 3.545, ltc: 12.95, ei: 0.9 },
 { year: 2025, np: 4.5, hi: 3.545, ltc: 12.95, ei: 0.9 },
 { year: 2026, np: 4.5, hi: 3.545, ltc: 12.95, ei: 0.9 },
];

const FAQ_ITEMS = [
 { question: "국민연금 요율은 왜 4.5% 고정인가요?", answer: "국민연금 본인 부담률은 1998년부터 4.5% 고정. 회사도 4.5% 부담 (총 9%). 연금 재정 위기로 인상 논의 있으나 정치적 이슈로 동결." },
 { question: "건강보험료가 가장 많이 오른 시기는?", answer: "2010년 2.815%에서 2023년 3.545%로 13년간 약 26% 상승. 매년 1~3% 인상이 일반적이지만 2024~2026년은 동결 (정부 부담 완화 정책)." },
 { question: "장기요양보험은 왜 빠르게 오르나요?", answer: "고령화 가속으로 장기요양 수요 폭증. 2010년 6.55% → 2026년 12.95%로 약 2배. 향후 지속 상승 예상." },
 { question: "산재보험 요율은?", answer: "본인 부담 0% (회사 100%). 업종별 0.7~18.6%. 일반 사무직은 약 1%, 건설·광업은 5~10%. 본 페이지는 본인 부담 보험만 표시." },
 { question: "본인 부담 합계는?", answer: "2026 기준: 국민연금 4.5% + 건강보험 3.545% + 장기요양 약 0.46% + 고용보험 0.9% = 약 9.4% (월급의 약 9.4%)." },
];

export default function FourInsuranceRatesHistoryPage() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd data={[
 autoBreadcrumbLd("/stats/4-insurance-rates-history", { leafName: "4대보험 요율 history" }),
 faqLd(FAQ_ITEMS),
 articleLd({ title: "한국 4대보험 요율 history", description: "2010~2026 변천", slug: "4-insurance-rates-history", publishedDate: "2026-04-30" }),
 ]} />
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Shield className="w-4 h-4" /> 인용 가능 통계
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 4대보험 요율 <span className="text-electric">History</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">2010~2026 본인 부담률 변천</p>
 </div>

 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">📊 본인 부담률 (%) 연도별</h2>
 <div className="bg-white border border-canvas rounded-2xl p-6 overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-3 py-2 text-left font-black text-navy">연도</th>
 <th className="px-3 py-2 text-right font-black text-navy">국민연금</th>
 <th className="px-3 py-2 text-right font-black text-navy">건강보험</th>
 <th className="px-3 py-2 text-right font-black text-navy">장기요양 (건보의)</th>
 <th className="px-3 py-2 text-right font-black text-navy">고용보험</th>
 </tr>
 </thead>
 <tbody>
 {HISTORY.map((h) => (
 <tr key={h.year} className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue font-black">{h.year}</td>
 <td className="px-3 py-2 text-right text-navy tabular-nums">{h.np.toFixed(1)}%</td>
 <td className="px-3 py-2 text-right font-black text-electric tabular-nums">{h.hi.toFixed(3)}%</td>
 <td className="px-3 py-2 text-right text-muted-blue tabular-nums">{h.ltc.toFixed(2)}%</td>
 <td className="px-3 py-2 text-right text-navy tabular-nums">{h.ei.toFixed(2)}%</td>
 </tr>
 ))}
 </tbody>
 </table>
 <p className="text-xs text-muted-blue mt-3">※ 산재보험은 회사 100% 부담 (본인 0%). 업종별 0.7~18.6% 변동.</p>
 </div>
 </section>

 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-5 mb-10">
 <p className="text-xs text-muted-blue leading-relaxed">
 <strong className="text-navy">출처:</strong> 국민연금공단·국민건강보험공단·고용노동부 공식 발표값.
 인용 시 "moneysalary.com" 출처 표기 부탁드립니다.
 </p>
 </section>

 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">자주 묻는 질문</h2>
 <div className="space-y-3">
 {FAQ_ITEMS.map((item) => (
 <details key={item.question} className="bg-white rounded-2xl p-5 border border-canvas group">
 <summary className="font-black text-navy cursor-pointer list-none flex justify-between items-start">
 <span>{item.question}</span>
 <ArrowRight className="w-5 h-5 text-electric flex-shrink-0 ml-3 transition-transform group-open:rotate-90" />
 </summary>
 <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">{item.answer}</p>
 </details>
 ))}
 </div>
 </section>

 <RelatedCalculators currentPath="/stats/4-insurance-rates-history" />
 </div>
 </main>
 );
}
