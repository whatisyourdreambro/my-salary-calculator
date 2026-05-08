// src/app/stats/income-tax-bracket-history/page.tsx
//
// 한국 소득세 누진세율 변천사 — 세무사·회계사·정책 인용.

import type { Metadata } from "next";
import { FileText, Download, ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, articleLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "한국 소득세 누진세율 변천사 1995~2026 — 8단계 세율 history",
 description:
 "한국 소득세 누진세율 1995년 도입~2026년 현재까지 30년 변천. 한계세율·누진공제·구간 한계점 변경 history. 세무사·회계사 인용 가능 데이터.",
 path: "/stats/income-tax-bracket-history",
 keywords: [
 "소득세율 변천사",
 "누진세율 history",
 "소득세 한계점 변경",
 "한국 소득세 1995",
 "소득세 8단계",
 ],
});

const HISTORY = [
 { year: "1995~2001", maxRate: 40, brackets: 4, note: "4단계 누진세율 (10·20·30·40%)" },
 { year: "2002~2007", maxRate: 36, brackets: 4, note: "최고세율 인하 (40→36%)" },
 { year: "2008~2011", maxRate: 35, brackets: 4, note: "최고세율 35%" },
 { year: "2012~2013", maxRate: 38, brackets: 5, note: "최고세율 38% 부활 + 5단계" },
 { year: "2014~2016", maxRate: 38, brackets: 5, note: "구간 한계점 조정" },
 { year: "2017~2017", maxRate: 40, brackets: 6, note: "5억 초과 40% 신설" },
 { year: "2018~2020", maxRate: 42, brackets: 7, note: "5억 초과 42% 인상" },
 { year: "2021~2022", maxRate: 45, brackets: 8, note: "10억 초과 45% 신설 — 8단계 정착" },
 { year: "2023~2026", maxRate: 45, brackets: 8, note: "1구간 1,200→1,400만, 2구간 4,600→5,000만 한계점 인상" },
];

const CURRENT_BRACKETS_2026 = [
 { range: "1,400만 이하", rate: 6, deduction: 0 },
 { range: "1,400만~5,000만", rate: 15, deduction: 1_260_000 },
 { range: "5,000만~8,800만", rate: 24, deduction: 5_760_000 },
 { range: "8,800만~1.5억", rate: 35, deduction: 15_440_000 },
 { range: "1.5억~3억", rate: 38, deduction: 19_940_000 },
 { range: "3억~5억", rate: 40, deduction: 25_940_000 },
 { range: "5억~10억", rate: 42, deduction: 35_940_000 },
 { range: "10억 초과", rate: 45, deduction: 65_940_000 },
];

const FAQ_ITEMS = [
 { question: "한국 소득세는 언제 누진세율이 됐나요?", answer: "1995년 4단계 누진세율 도입이 현대적 시작. 이전엔 단일세율이었지만 점진적으로 단계 늘려 현재 8단계." },
 { question: "최고세율은 언제 45%로 올랐나요?", answer: "2021년 1월 1일부터 10억 초과 구간에 45% 적용. 2018년 5억 초과 42% → 2021년 10억 초과 45% 신설로 8단계 완성." },
 { question: "구간 한계점은 왜 자주 바뀌나요?", answer: "물가·임금 인상 반영 + 정치적 이슈. 2023년 1구간 한계점 1,200→1,400만(17% 인상)이 가장 큰 변화. 평균 임금 상승 반영." },
 { question: "지방소득세는 따로 있나요?", answer: "네. 산출세액의 10%가 지방소득세. 본 페이지의 세율은 국세 (소득세)만. 실제 부담 = 산출세액 × 1.1." },
 { question: "구간이 8단계인 이유?", answer: "고소득자 누진 강화 + 저소득자 부담 완화. OECD 평균 4~5단계보다 많은 편. 단순화 vs 형평성 논쟁 지속." },
];

export default function IncomeTaxBracketHistoryPage() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd data={[
 autoBreadcrumbLd("/stats/income-tax-bracket-history", { leafName: "소득세율 변천사" }),
 faqLd(FAQ_ITEMS),
 articleLd({ title: "한국 소득세 누진세율 변천사", description: "1995~2026 30년 history", slug: "income-tax-bracket-history", publishedDate: "2026-04-30" }),
 ]} />
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <FileText className="w-4 h-4" /> 인용 가능 통계
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 소득세 누진세율 <span className="text-electric">변천사</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">1995~2026 (30년) · 4단계 → 8단계 진화</p>
 </div>

 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">📜 30년 변천 timeline</h2>
 <div className="bg-white border border-canvas rounded-2xl p-6">
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-3 py-2 text-left font-black text-navy">기간</th>
 <th className="px-3 py-2 text-right font-black text-navy">최고세율</th>
 <th className="px-3 py-2 text-right font-black text-navy">단계</th>
 <th className="px-3 py-2 text-left font-black text-navy">주요 변경</th>
 </tr>
 </thead>
 <tbody>
 {HISTORY.map((h) => (
 <tr key={h.year} className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue font-black">{h.year}</td>
 <td className="px-3 py-2 text-right font-black text-electric tabular-nums">{h.maxRate}%</td>
 <td className="px-3 py-2 text-right text-navy">{h.brackets}단계</td>
 <td className="px-3 py-2 text-xs text-muted-blue">{h.note}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </section>

 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">📊 2026 현재 8단계 누진세율</h2>
 <div className="bg-white border border-canvas rounded-2xl p-6">
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-3 py-2 text-left font-black text-navy">과세표준 구간</th>
 <th className="px-3 py-2 text-right font-black text-navy">세율</th>
 <th className="px-3 py-2 text-right font-black text-navy">누진공제</th>
 </tr>
 </thead>
 <tbody>
 {CURRENT_BRACKETS_2026.map((b) => (
 <tr key={b.range} className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue">{b.range}</td>
 <td className="px-3 py-2 text-right font-black text-navy tabular-nums">{b.rate}%</td>
 <td className="px-3 py-2 text-right text-muted-blue tabular-nums">{b.deduction.toLocaleString("ko-KR")}원</td>
 </tr>
 ))}
 </tbody>
 </table>
 <p className="text-xs text-muted-blue mt-3">※ 산출세액 = 과세표준 × 세율 - 누진공제. 지방소득세 10% 별도.</p>
 </div>
 </section>

 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-5 mb-10">
 <p className="text-xs text-muted-blue leading-relaxed">
 <strong className="text-navy">출처:</strong> 국세청 세법 공식 발표 + 기획재정부 세제개편안. 1995~2026 30년 종합.
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

 <RelatedCalculators currentPath="/stats/income-tax-bracket-history" />
 </div>
 </main>
 );
}
