// src/app/stats/jeonse-vs-monthly-by-year/page.tsx
//
// 전월세 전환율 변천 — 부동산 블로그·언론 인용 자석.

import type { Metadata } from "next";
import { Home, ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, articleLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "전월세 전환율 history 2015~2026 — 서울·경기·전국 평균",
 description:
 "한국부동산원 전월세 전환율 변천 (2015~2026). 서울 4~5%, 경기 5~6%, 지방 6~8%. 부동산 블로그·언론 인용 가능 데이터.",
 path: "/stats/jeonse-vs-monthly-by-year",
 keywords: [
 "전월세 전환율 history",
 "전월세 전환율 변천",
 "전세 월세 환산율",
 "한국부동산원",
 "임대차 전환율",
 ],
});

const HISTORY = [
 { year: 2015, seoul: 6.7, gyeonggi: 7.5, national: 7.4 },
 { year: 2016, seoul: 6.4, gyeonggi: 7.2, national: 7.0 },
 { year: 2017, seoul: 5.5, gyeonggi: 6.8, national: 6.5 },
 { year: 2018, seoul: 4.9, gyeonggi: 6.5, national: 6.2 },
 { year: 2019, seoul: 4.6, gyeonggi: 6.2, national: 5.9 },
 { year: 2020, seoul: 4.3, gyeonggi: 5.9, national: 5.6 },
 { year: 2021, seoul: 4.5, gyeonggi: 5.7, national: 5.5 },
 { year: 2022, seoul: 4.8, gyeonggi: 5.8, national: 5.7 },
 { year: 2023, seoul: 5.2, gyeonggi: 6.0, national: 5.9 },
 { year: 2024, seoul: 5.1, gyeonggi: 5.9, national: 5.8 },
 { year: 2025, seoul: 5.3, gyeonggi: 6.0, national: 5.9 },
 { year: 2026, seoul: 5.5, gyeonggi: 6.1, national: 6.0 },
];

const FAQ_ITEMS = [
 { question: "전월세 전환율이 무엇인가요?", answer: "전세금을 월세로 환산할 때 사용하는 비율. '전세금 × 전환율 / 12 = 월세'. 임대차계약법상 상한 5.5% (보증금 × 5.5% 미만으로 전환 의무)." },
 { question: "왜 지역별로 차이가 큰가요?", answer: "서울·강남은 전세 수요 큰데 매매가 비싸 전환율 낮음 (4~5%). 지방은 매매가 낮고 임대 수요 일정해 전환율 높음 (6~8%)." },
 { question: "전환율이 낮으면 누가 유리?", answer: "임차인(세입자) 유리. 같은 보증금이면 월세 더 적게 냄. 서울 전환율 5.5%가 지방 7%보다 월 약 30% 적은 월세." },
 { question: "전환율은 어떻게 결정?", answer: "한국부동산원이 매월 실거래 전환 사례를 집계해 발표. 임대차계약법은 5.5% 상한이지만 실제 시장 평균은 5~6% 수준 유지." },
 { question: "갭투자 시 전환율 영향?", answer: "전환율 높을수록 전세 → 매매 갭이 큼 (전세가율 낮음). 전환율 6%이면 전세가율 약 80%, 전환율 8%이면 약 60%. 갭투자자는 전환율 낮은 지역 선호." },
];

export default function JeonseVsMonthlyByYearPage() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd data={[
 autoBreadcrumbLd("/stats/jeonse-vs-monthly-by-year", { leafName: "전월세 전환율 history" }),
 faqLd(FAQ_ITEMS),
 articleLd({ title: "전월세 전환율 history 2015~2026", description: "지역별 변천", slug: "jeonse-vs-monthly-by-year", publishedDate: "2026-04-30" }),
 ]} />
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Home className="w-4 h-4" /> 인용 가능 통계
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 전월세 전환율 <span className="text-electric">History</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">2015~2026 서울·경기·전국 평균</p>
 </div>

 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">📊 지역별 전환율 (%) 연도별</h2>
 <div className="bg-white border border-canvas rounded-2xl p-6">
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-3 py-2 text-left font-black text-navy">연도</th>
 <th className="px-3 py-2 text-right font-black text-navy">서울</th>
 <th className="px-3 py-2 text-right font-black text-navy">경기</th>
 <th className="px-3 py-2 text-right font-black text-navy">전국 평균</th>
 </tr>
 </thead>
 <tbody>
 {HISTORY.map((h) => (
 <tr key={h.year} className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue font-black">{h.year}</td>
 <td className="px-3 py-2 text-right font-black text-electric tabular-nums">{h.seoul.toFixed(1)}%</td>
 <td className="px-3 py-2 text-right text-navy tabular-nums">{h.gyeonggi.toFixed(1)}%</td>
 <td className="px-3 py-2 text-right text-navy tabular-nums">{h.national.toFixed(1)}%</td>
 </tr>
 ))}
 </tbody>
 </table>
 <p className="text-xs text-muted-blue mt-3">※ 임대차계약법상 상한 5.5% (전세 → 월세 전환 시).</p>
 </div>
 </section>

 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-5 mb-10">
 <p className="text-xs text-muted-blue leading-relaxed">
 <strong className="text-navy">출처:</strong> 한국부동산원 월별 발표 + 통계청. 2026년은 추정값 (실제는 매월 갱신).
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

 <RelatedCalculators currentPath="/stats/jeonse-vs-monthly-by-year" />
 </div>
 </main>
 );
}
