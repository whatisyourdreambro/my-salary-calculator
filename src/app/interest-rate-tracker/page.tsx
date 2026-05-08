// src/app/interest-rate-tracker/page.tsx
// 한국은행 기준금리 추적 페이지.

import type { Metadata } from "next";
import { TrendingUp, ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, articleLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "한국은행 기준금리 추이 — 2020~2026 변동 + 영향 분석",
 description:
 "한국은행 기준금리 history 2020~2026. 0.5% → 3.5% 변동과 대출·예금·부동산 영향. 매월 금융통화위원회 결정 일정 + 다음 회의 D-day.",
 path: "/interest-rate-tracker",
 keywords: [
 "한국은행 기준금리",
 "기준금리 추이",
 "금융통화위원회",
 "기준금리 변동",
 "한은 금리",
 ],
});

const HISTORY = [
 { date: "2020-03", rate: 0.75, note: "코로나 긴급 인하" },
 { date: "2020-05", rate: 0.5, note: "역대 최저" },
 { date: "2021-08", rate: 0.75 },
 { date: "2022-01", rate: 1.25 },
 { date: "2022-04", rate: 1.5 },
 { date: "2022-05", rate: 1.75 },
 { date: "2022-07", rate: 2.25, note: "빅스텝 (0.5%p)" },
 { date: "2022-08", rate: 2.5 },
 { date: "2022-10", rate: 3.0, note: "빅스텝" },
 { date: "2022-11", rate: 3.25 },
 { date: "2023-01", rate: 3.5, note: "정점" },
 { date: "2024-08", rate: 3.25, note: "1년 반 만에 첫 인하" },
 { date: "2024-11", rate: 3.0 },
 { date: "2025-02", rate: 2.75 },
 { date: "2025-05", rate: 2.5 },
 { date: "2026-04", rate: 2.5, note: "현재 (동결 추세)" },
];

const FAQ_ITEMS = [
 { question: "기준금리란?", answer: "한국은행이 시중은행에 적용하는 기준 금리. 모든 대출·예금 금리의 기준점. 매년 8회 금통위에서 결정." },
 { question: "기준금리가 오르면 어떻게?", answer: "대출 금리 ↑ → 부담 ↑ + 부동산 가격 ↓ + 예금 금리 ↑ + 환율 ↑ (보통). 가계 부채 압박 + 기업 투자 둔화." },
 { question: "기준금리가 내리면?", answer: "대출 금리 ↓ + 자산 가격 ↑ (부동산·주식) + 예금 금리 ↓ + 환율 ↓. 경기 부양 효과 + 인플레 우려." },
 { question: "다음 결정은 언제?", answer: "한국은행 금융통화위원회 매월 1회 (셋째 또는 넷째 목요일). 정확한 일정은 한국은행 홈페이지." },
 { question: "내 대출 금리는 어떻게 영향?", answer: "변동금리 대출은 즉시 반영, 고정금리는 만기까지 동일. 최근 3년 변동금리 대출자는 부담 큰 폭 증가 → 고정 전환 검토." },
];

export default function InterestRateTrackerPage() {
 const current = HISTORY[HISTORY.length - 1];
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd data={[
 autoBreadcrumbLd("/interest-rate-tracker", { leafName: "한국은행 기준금리" }),
 faqLd(FAQ_ITEMS),
 articleLd({ title: "한국은행 기준금리 추이", description: "2020~2026", slug: "interest-rate-tracker", publishedDate: "2026-04-30", modifiedDate: new Date().toISOString() }),
 ]} />
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <TrendingUp className="w-4 h-4" /> 매월 갱신
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 한국은행 <span className="text-electric">기준금리</span> 추이
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">2020~2026 + 영향 분석</p>
 </div>

 <section className="bg-primary p-8 rounded-3xl text-center mb-8">
 <p className="text-navy/70 text-xs font-black uppercase tracking-widest mb-2">현재 기준금리 (2026.4 기준)</p>
 <p className="text-6xl font-black text-navy tracking-tight">{current.rate}%</p>
 <p className="text-sm text-navy/60 mt-3">{current.note || "동결"}</p>
 </section>

 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">📊 6년 변동 history</h2>
 <div className="bg-white border border-canvas rounded-2xl p-6 overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-3 py-2 text-left font-black text-navy">시점</th>
 <th className="px-3 py-2 text-right font-black text-navy">기준금리</th>
 <th className="px-3 py-2 text-left font-black text-navy">메모</th>
 </tr>
 </thead>
 <tbody>
 {HISTORY.map((h) => (
 <tr key={h.date} className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue font-black">{h.date}</td>
 <td className="px-3 py-2 text-right font-black text-electric tabular-nums">{h.rate}%</td>
 <td className="px-3 py-2 text-xs text-muted-blue">{h.note || ""}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
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

 <RelatedCalculators currentPath="/interest-rate-tracker" />
 </div>
 </main>
 );
}
