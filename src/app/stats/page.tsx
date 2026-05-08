// src/app/stats/page.tsx
// 통계 인용 페이지 허브 — 모든 통계 페이지 진입점.

import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, ArrowRight, FileText } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "한국 금융·임금 통계 모음 — 인용 가능 데이터",
 description:
 "한국 직장인 연봉 분포, 최저시급 history, 4대보험 요율 변천, 누진세율 변경, 전월세 전환율까지. 기자·블로거·연구자 인용 가능 무료 데이터.",
 path: "/stats",
 keywords: ["한국 임금 통계", "연봉 통계", "최저시급 history", "4대보험 history", "한국 경제 통계"],
});

const STATS_PAGES = [
 {
 slug: "korean-salary-distribution-2026",
 title: "한국 직장인 연봉 분포 2026",
 description: "평균 4,200만·중위 3,200만·상위 1% 1.6억",
 keyData: "백분위표 + 평균/중위/상위",
 icon: "👥",
 },
 {
 slug: "minimum-wage-history",
 title: "한국 최저시급 history 1988~2026",
 description: "38년 변천 + 매년 인상률 + 월급 환산",
 keyData: "487원 → 10,320원 (21배)",
 icon: "💵",
 },
 {
 slug: "4-insurance-rates-history",
 title: "4대보험 요율 history 2010~2026",
 description: "국민연금·건강보험·고용·장기요양",
 keyData: "본인 부담률 변천",
 icon: "🛡️",
 },
 {
 slug: "income-tax-bracket-history",
 title: "한국 소득세 누진세율 변천사",
 description: "1995~2026 (4단계 → 8단계)",
 keyData: "최고세율 36% → 45%",
 icon: "📊",
 },
 {
 slug: "jeonse-vs-monthly-by-year",
 title: "전월세 전환율 history 2015~2026",
 description: "서울·경기·전국 평균 + 임대차법 상한",
 keyData: "서울 5.5% / 지방 6%+",
 icon: "🏠",
 },
];

const FAQ_ITEMS = [
 { question: "본 데이터를 인용해도 되나요?", answer: "네. 자유롭게 인용 가능. 출처 표기 \"moneysalary.com\" 또는 본 페이지 URL. 학술·언론·블로그 모두 OK." },
 { question: "데이터는 얼마나 정확한가요?", answer: "공공기관(국세청·통계청·한국부동산원·고용노동부) 공식 발표값 + 자체 추정. 2026년 등 미발표 연도는 추정값으로 표시." },
 { question: "데이터 갱신 주기는?", answer: "공공기관 발표 시점 기준. 최저시급은 매년 7월, 4대보험은 매년 1월, 부동산 통계는 매월. 본 페이지는 발표 후 1~3개월 내 반영." },
 { question: "CSV 다운로드 가능?", answer: "각 통계 페이지에서 CSV 다운로드 링크 제공. 자유 사용 + 출처 표기 권장." },
];

export default function StatsHubPage() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd data={[
 autoBreadcrumbLd("/stats", { leafName: "한국 금융 통계" }),
 faqLd(FAQ_ITEMS),
 ]} />
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <BarChart3 className="w-4 h-4" /> 인용 가능 통계
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 한국 <span className="text-electric">금융·임금</span> 통계
 </h1>
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 기자·블로거·연구자가 인용할 수 있는 한국 금융·임금 데이터 모음.<br />
 모두 공공기관 발표값 + 자체 정리. 출처 표기 시 자유 사용.
 </p>
 </div>

 <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
 {STATS_PAGES.map((s) => (
 <Link
 key={s.slug}
 href={`/stats/${s.slug}`}
 className="bg-white p-6 rounded-2xl border border-canvas hover:border-electric transition group"
 >
 <p className="text-3xl mb-2">{s.icon}</p>
 <p className="text-lg font-black text-navy mb-1 group-hover:text-electric transition">{s.title}</p>
 <p className="text-sm text-muted-blue mb-3">{s.description}</p>
 <p className="text-xs text-electric font-bold">📌 {s.keyData}</p>
 <ArrowRight className="w-5 h-5 mt-3 text-electric group-hover:translate-x-1 transition" />
 </Link>
 ))}
 </section>

 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-6 mb-10">
 <h2 className="text-lg font-black text-navy mb-3 flex items-center gap-2">
 <FileText className="w-5 h-5 text-electric" />
 인용·사용 안내
 </h2>
 <p className="text-sm text-muted-blue leading-relaxed">
 본 페이지의 모든 데이터는 자유롭게 인용 가능합니다. 학술·언론·블로그·SNS 모두 가능.<br />
 단, <strong className="text-navy">"출처: moneysalary.com"</strong> 표기 부탁드립니다. 본 데이터는 한국 공공기관 공식 발표값을 종합·정리한 것이며, 일부 추정값 포함됩니다.
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

 <RelatedCalculators currentPath="/stats" />
 </div>
 </main>
 );
}
