// src/app/real-estate-pulse/page.tsx
// 부동산 시세 — 분기 갱신.

import type { Metadata } from "next";
import { Home, ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, articleLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "한국 부동산 시세 Pulse — 매매·전세 평균가 분기별 추이",
 description:
 "전국·서울·6대광역시 아파트 매매·전세 평균가 + 분기별 변동률. KB부동산·한국부동산원 통계 종합.",
 path: "/real-estate-pulse",
 keywords: ["부동산 시세", "아파트 매매가", "전세가 추이", "KB부동산", "부동산원"],
});

const REGIONAL = [
 { region: "전국", saleAvg: "5.2억", rentAvg: "3.0억", quarterChange: -0.3 },
 { region: "서울", saleAvg: "10.5억", rentAvg: "5.8억", quarterChange: 0.5 },
 { region: "강남3구", saleAvg: "22억", rentAvg: "11억", quarterChange: 1.2 },
 { region: "경기도", saleAvg: "5.5억", rentAvg: "3.2억", quarterChange: -0.5 },
 { region: "인천", saleAvg: "4.0억", rentAvg: "2.4억", quarterChange: -0.8 },
 { region: "부산", saleAvg: "3.8억", rentAvg: "2.1억", quarterChange: -1.0 },
 { region: "대구", saleAvg: "3.5억", rentAvg: "1.9억", quarterChange: -1.2 },
 { region: "세종", saleAvg: "4.2억", rentAvg: "2.5억", quarterChange: 0.2 },
];

const FAQ_ITEMS = [
 { question: "부동산 시세는 어디서?", answer: "KB부동산 (kbland.kr) + 한국부동산원 (reb.or.kr) 매월 발표. 본 페이지는 분기별 종합." },
 { question: "지역 차이가 왜 큰가요?", answer: "서울·수도권 인구 집중 + 일자리 + 학군. 지방은 인구 감소 + 주택 공급 과잉으로 격차 확대." },
 { question: "전세가율이란?", answer: "매매가 대비 전세가 비율. 80%+ 면 갭투자 가능. 서울 약 55%, 지방 약 60%. 전세가율 낮을수록 매매 수요 큼." },
 { question: "분기별 변동률은?", answer: "전 분기 대비 매매가 변동률. -1% 이하면 하락기, +1% 이상이면 상승기. 본 페이지는 최근 분기 (2026 Q1) 기준." },
 { question: "투자 시점은?", answer: "본 페이지는 데이터만 제공 (조언 X). 매매 결정은 본인 자산·소득·금리·정책 등 종합 판단 + 전문가 상담 필수." },
];

export default function RealEstatePulsePage() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd data={[
 autoBreadcrumbLd("/real-estate-pulse", { leafName: "부동산 시세" }),
 faqLd(FAQ_ITEMS),
 articleLd({ title: "한국 부동산 시세 Pulse", description: "분기별 추이", slug: "real-estate-pulse", publishedDate: "2026-04-30", modifiedDate: new Date().toISOString() }),
 ]} />
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Home className="w-4 h-4" /> 분기 갱신
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 한국 <span className="text-electric">부동산 시세</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">매매·전세 평균가 + 분기별 변동률</p>
 </div>

 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">📊 지역별 평균 시세 (2026 Q1)</h2>
 <div className="bg-white border border-canvas rounded-2xl p-6 overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-3 py-2 text-left font-black text-navy">지역</th>
 <th className="px-3 py-2 text-right font-black text-navy">매매 평균</th>
 <th className="px-3 py-2 text-right font-black text-navy">전세 평균</th>
 <th className="px-3 py-2 text-right font-black text-navy">전 분기 대비</th>
 </tr>
 </thead>
 <tbody>
 {REGIONAL.map((r) => (
 <tr key={r.region} className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue font-black">{r.region}</td>
 <td className="px-3 py-2 text-right font-black text-navy tabular-nums">{r.saleAvg}</td>
 <td className="px-3 py-2 text-right text-muted-blue tabular-nums">{r.rentAvg}</td>
 <td className={`px-3 py-2 text-right font-black tabular-nums ${r.quarterChange > 0 ? "text-success" : r.quarterChange < 0 ? "text-electric" : "text-muted-blue"}`}>
 {r.quarterChange > 0 ? "+" : ""}{r.quarterChange}%
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 <p className="text-xs text-muted-blue mt-3">※ 아파트 평균. 단독·다가구 별도. 데이터 출처: KB부동산 + 한국부동산원.</p>
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

 <RelatedCalculators currentPath="/real-estate-pulse" />
 </div>
 </main>
 );
}
