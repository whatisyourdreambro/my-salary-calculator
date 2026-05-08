// src/app/stats/korean-salary-distribution-2026/page.tsx
//
// 한국 직장인 연봉 분포 백분위표 — 가장 큰 인용 자석.
// 기자·블로거가 "한국 평균 연봉 X만원" 인용 시 출처로.

import type { Metadata } from "next";
import Link from "next/link";
import { Users, Download, ArrowRight, TrendingUp } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, articleLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 한국 직장인 연봉 분포 — 백분위표 + 평균·중위 연봉 통계",
 description:
 "2026년 한국 직장인 연봉 백분위표 (10·25·50·75·90·95·99 백분위). 평균 4,200만원·중위 3,200만원·상위 1% 1.6억. 기자·블로거 인용 가능 출처.",
 path: "/stats/korean-salary-distribution-2026",
 keywords: [
 "한국 평균 연봉",
 "한국 중위 연봉",
 "연봉 백분위",
 "연봉 분포",
 "연봉 통계 2026",
 "한국 직장인 연봉",
 ],
});

// 2024 국세청 통계 + 추정 (2026)
const PERCENTILES = [
 { p: 10, salary: 21_000_000, note: "하위 10%" },
 { p: 25, salary: 28_000_000, note: "하위 25%" },
 { p: 50, salary: 32_000_000, note: "중위" },
 { p: 75, salary: 50_000_000, note: "상위 25%" },
 { p: 90, salary: 75_000_000, note: "상위 10%" },
 { p: 95, salary: 100_000_000, note: "상위 5%" },
 { p: 99, salary: 160_000_000, note: "상위 1%" },
 { p: 99.9, salary: 350_000_000, note: "상위 0.1%" },
];

const fmt = (n: number) => Math.round(n / 10000).toLocaleString("ko-KR");

const FAQ_ITEMS = [
 { question: "한국 직장인 평균 연봉은 얼마?", answer: "2026 추정 약 4,200만원 (세전). 단, 평균은 고소득자에 의해 끌어올려져 실제 다수 직장인은 평균 미달. 중위(50백분위) 약 3,200만원이 더 현실적." },
 { question: "평균과 중위의 차이?", answer: "평균은 (합계/인원). 한 명이 1억 받으면 평균이 크게 올라감. 중위는 정확히 가운데 사람의 연봉. 한국은 임금 격차 커서 중위(3,200만)이 평균(4,200만)보다 1,000만 낮음." },
 { question: "상위 1%는 얼마부터?", answer: "약 1.6억원/년. 직장인 약 1,800만 명 중 상위 18만 명. 임원·전문직·고위 공무원 등." },
 { question: "내 연봉이 평균인가?", answer: "본 페이지의 백분위표 + 본인 연봉 비교. 예: 5,000만 → 상위 25% 진입. 8,000만 → 상위 10%. 단, 직군별 차이 큼 (IT 6,500만 평균 vs 일반 사무직 4,000만)." },
 { question: "임금 격차가 왜 이렇게 큰가요?", answer: "대기업 vs 중소기업 격차 + 정규직 vs 비정규직 + 직군별 차이. 한국은 OECD 임금 불평등 상위권. 격차 완화 정책 논쟁 지속." },
];

export default function KoreanSalaryDistributionPage() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd data={[
 autoBreadcrumbLd("/stats/korean-salary-distribution-2026", { leafName: "한국 연봉 분포" }),
 faqLd(FAQ_ITEMS),
 articleLd({ title: "2026 한국 직장인 연봉 분포", description: "백분위표 + 평균·중위", slug: "korean-salary-distribution-2026", publishedDate: "2026-04-30" }),
 ]} />
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Users className="w-4 h-4" /> 인용 가능 통계
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 2026 <span className="text-electric">한국 연봉 분포</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">평균·중위·백분위 + 본인 위치 확인</p>
 </div>

 {/* 핵심 통계 */}
 <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
 <div className="bg-white p-5 rounded-2xl border border-canvas text-center">
 <p className="text-xs text-muted-blue mb-1">평균 연봉</p>
 <p className="text-2xl font-black text-navy">4,200만</p>
 </div>
 <div className="bg-primary p-5 rounded-2xl text-center">
 <p className="text-xs text-navy/60 mb-1">중위 (가장 현실적)</p>
 <p className="text-2xl font-black text-navy">3,200만</p>
 </div>
 <div className="bg-white p-5 rounded-2xl border border-canvas text-center">
 <p className="text-xs text-muted-blue mb-1">상위 10%</p>
 <p className="text-2xl font-black text-electric">7,500만</p>
 </div>
 <div className="bg-white p-5 rounded-2xl border border-canvas text-center">
 <p className="text-xs text-muted-blue mb-1">상위 1%</p>
 <p className="text-2xl font-black text-electric">1.6억</p>
 </div>
 </section>

 {/* 백분위표 */}
 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">📊 연봉 백분위표</h2>
 <div className="bg-white border border-canvas rounded-2xl p-6">
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-3 py-2 text-left font-black text-navy">백분위</th>
 <th className="px-3 py-2 text-right font-black text-navy">연봉 (만원)</th>
 <th className="px-3 py-2 text-left font-black text-navy">의미</th>
 </tr>
 </thead>
 <tbody>
 {PERCENTILES.map((p) => (
 <tr key={p.p} className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue font-black">{p.p}%</td>
 <td className="px-3 py-2 text-right font-black text-electric tabular-nums">{fmt(p.salary)}</td>
 <td className="px-3 py-2 text-xs text-muted-blue">{p.note}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </section>

 <section className="bg-white border border-canvas rounded-2xl p-6 mb-10">
 <h2 className="text-lg font-black text-navy mb-3 flex items-center gap-2">
 <TrendingUp className="w-5 h-5 text-electric" />
 본인 연봉 위치 확인
 </h2>
 <p className="text-sm text-muted-blue mb-4">
 본인 연봉을 입력하면 한국 직장인 중 본인 위치 (백분위)를 즉시 확인 가능.
 </p>
 <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-navy rounded-xl text-sm font-black">
 본인 연봉 입력 <ArrowRight className="w-4 h-4" />
 </Link>
 </section>

 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-5 mb-10">
 <p className="text-xs text-muted-blue leading-relaxed">
 <strong className="text-navy">출처:</strong> 국세청 근로소득세 신고 자료 (최신 2024년) + 통계청 임금 분포 + 자체 추정 (2026).
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

 <RelatedCalculators currentPath="/stats/korean-salary-distribution-2026" />
 </div>
 </main>
 );
}
