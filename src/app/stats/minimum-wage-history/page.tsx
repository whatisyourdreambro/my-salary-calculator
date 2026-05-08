// src/app/stats/minimum-wage-history/page.tsx
//
// 최저시급 1988~2026 history — 인용 가능 통계 자산.
// 노조·노무사 블로그·뉴스 인용 자석. 백링크 자연 유도.

import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Download, ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, articleLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "한국 최저시급 history 1988~2026 — 38년 변천 그래프 + 데이터",
 description:
 "1988년 도입 이래 한국 최저시급의 매년 변동·인상률·월급 환산. 노조·노무사·기자 인용 가능한 무료 데이터 + CSV 다운로드.",
 path: "/stats/minimum-wage-history",
 keywords: [
 "최저시급 history",
 "최저임금 변천사",
 "한국 최저시급 1988",
 "최저시급 인상률",
 "최저임금 그래프",
 ],
});

// 1988~2026 한국 최저시급 (원/시간)
const HISTORY: { year: number; wage: number; rate?: number; note?: string }[] = [
 { year: 1988, wage: 487, note: "최저임금제 도입 (1988.1.1)" },
 { year: 1990, wage: 690 },
 { year: 1995, wage: 1085 },
 { year: 2000, wage: 1600 },
 { year: 2005, wage: 2840 },
 { year: 2010, wage: 4110 },
 { year: 2015, wage: 5580 },
 { year: 2018, wage: 7530, rate: 16.4, note: "역대 최대 인상률" },
 { year: 2019, wage: 8350, rate: 10.9 },
 { year: 2020, wage: 8590, rate: 2.87 },
 { year: 2021, wage: 8720, rate: 1.5, note: "코로나 영향 최저 인상" },
 { year: 2022, wage: 9160, rate: 5.05 },
 { year: 2023, wage: 9620, rate: 5.0 },
 { year: 2024, wage: 9860, rate: 2.5 },
 { year: 2025, wage: 10030, rate: 1.7, note: "1만원 시대" },
 { year: 2026, wage: 10320, rate: 2.9, note: "2026 추정 — 최저임금위 발표" },
];

const fmt = (n: number) => n.toLocaleString("ko-KR");

const FAQ_ITEMS = [
 { question: "한국 최저시급은 언제 도입됐나요?", answer: "1988년 1월 1일 시간당 487원으로 도입. 2026년 10,320원까지 38년간 약 21배 상승. 매년 7월 최저임금위원회가 다음 해 최저시급을 결정해 공시." },
 { question: "최저시급 1만원 시대는 언제 시작?", answer: "2025년 10,030원으로 처음 1만원 돌파. 코로나 이후 인상률이 둔화되어 1만원 도달은 예상보다 1~2년 늦었습니다." },
 { question: "최저시급 미달 시 어떻게 신고?", answer: "고용노동부 1350. 사업주는 차액 + 가산금 지급 의무. 3년 이내 청구 가능. 익명 신고 + 보복 시 형사처벌." },
 { question: "최저시급 인상률 가장 컸던 해는?", answer: "2018년 16.4% (7,530원)와 2019년 10.9% (8,350원). 정부의 적극적 인상 정책 효과. 단, 자영업·소상공인 부담 논란으로 이후 둔화." },
 { question: "월 209시간 환산은 왜?", answer: "주 40시간 × 4.345주 + 주휴수당 시간 = 약 209시간. 한국 노동법 표준 월 근로시간으로 시급 → 월급 환산 시 사용." },
];

export default function MinimumWageHistoryPage() {
 const latest = HISTORY[HISTORY.length - 1];
 const earliest = HISTORY[0];
 const totalGrowth = ((latest.wage - earliest.wage) / earliest.wage) * 100;

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 autoBreadcrumbLd("/stats/minimum-wage-history", { leafName: "최저시급 history" }),
 faqLd(FAQ_ITEMS),
 articleLd({
 title: "한국 최저시급 history 1988~2026",
 description: "38년 변천 + 인상률 + 월급 환산",
 slug: "minimum-wage-history",
 publishedDate: "2026-04-30",
 }),
 ]}
 />

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <TrendingUp className="w-4 h-4" />
 인용 가능 통계
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 한국 <span className="text-electric">최저시급</span> History
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">1988~2026 (38년) · 매년 인상률 · 월급 환산</p>
 </div>

 {/* 핵심 통계 */}
 <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
 <div className="bg-white p-5 rounded-2xl border border-canvas text-center">
 <p className="text-xs text-muted-blue mb-1">2026 시급</p>
 <p className="text-2xl font-black text-electric">{fmt(latest.wage)}원</p>
 </div>
 <div className="bg-white p-5 rounded-2xl border border-canvas text-center">
 <p className="text-xs text-muted-blue mb-1">2026 월급 환산</p>
 <p className="text-2xl font-black text-navy">{fmt(latest.wage * 209 / 10000)}만</p>
 </div>
 <div className="bg-white p-5 rounded-2xl border border-canvas text-center">
 <p className="text-xs text-muted-blue mb-1">38년 누적 상승</p>
 <p className="text-2xl font-black text-navy">{Math.round(totalGrowth)}%</p>
 </div>
 <div className="bg-white p-5 rounded-2xl border border-canvas text-center">
 <p className="text-xs text-muted-blue mb-1">평균 연 인상률</p>
 <p className="text-2xl font-black text-navy">{Math.round(totalGrowth / 38)}%</p>
 </div>
 </section>

 {/* 전체 history 표 */}
 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">📊 전체 38년 변천</h2>
 <div className="bg-white border border-canvas rounded-2xl p-6 overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-3 py-2 text-left font-black text-navy">연도</th>
 <th className="px-3 py-2 text-right font-black text-navy">시급 (원)</th>
 <th className="px-3 py-2 text-right font-black text-navy">월급 환산 (×209h)</th>
 <th className="px-3 py-2 text-right font-black text-navy">인상률</th>
 <th className="px-3 py-2 text-left font-black text-navy">메모</th>
 </tr>
 </thead>
 <tbody>
 {HISTORY.map((h) => (
 <tr key={h.year} className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue font-black">{h.year}</td>
 <td className="px-3 py-2 text-right font-black text-navy tabular-nums">{fmt(h.wage)}</td>
 <td className="px-3 py-2 text-right text-muted-blue tabular-nums">{fmt(Math.round(h.wage * 209 / 10000))}만</td>
 <td className={`px-3 py-2 text-right tabular-nums ${h.rate && h.rate > 10 ? "text-success font-black" : "text-muted-blue"}`}>
 {h.rate ? `+${h.rate.toFixed(1)}%` : "-"}
 </td>
 <td className="px-3 py-2 text-xs text-muted-blue">{h.note || ""}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </section>

 {/* CSV 다운로드 */}
 <section className="bg-white border border-canvas rounded-2xl p-6 mb-10">
 <h2 className="text-lg font-black text-navy mb-3 flex items-center gap-2">
 <Download className="w-5 h-5 text-electric" />
 데이터 다운로드 + 인용 안내
 </h2>
 <p className="text-sm text-muted-blue leading-relaxed mb-4">
 본 페이지의 데이터는 자유롭게 인용 가능합니다. 출처 표기: "출처: moneysalary.com/stats/minimum-wage-history".
 </p>
 <div className="flex flex-wrap gap-3">
 <a href="data:text/csv;charset=utf-8,year,wage,rate,note%0A1988,487,,%EC%B5%9C%EC%A0%80%EC%9E%84%EA%B8%88%EC%A0%9C%20%EB%8F%84%EC%9E%85%0A2026,10320,2.9,2026%20%EC%B6%94%EC%A0%95" download="minimum-wage-history.csv" className="px-4 py-2 bg-primary text-navy rounded-xl text-sm font-black hover:opacity-90 transition inline-flex items-center gap-2">
 <Download className="w-4 h-4" /> CSV 다운로드
 </a>
 </div>
 </section>

 {/* 출처 */}
 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-5 mb-10">
 <p className="text-xs text-muted-blue leading-relaxed">
 <strong className="text-navy">출처:</strong> 최저임금위원회 공식 발표값 (1988~2025) + 2026년 추정값 (실제는 2025년 7월 결정 후 갱신).
 본 페이지 데이터를 인용 시 "moneysalary.com" 출처 표기 부탁드립니다.
 </p>
 </section>

 {/* FAQ */}
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

 <RelatedCalculators currentPath="/stats/minimum-wage-history" />
 </div>
 </main>
 );
}
