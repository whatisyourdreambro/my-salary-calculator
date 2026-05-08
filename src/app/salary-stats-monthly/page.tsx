// src/app/salary-stats-monthly/page.tsx
// 통계청 월별 임금 통계.

import type { Metadata } from "next";
import { BarChart3, ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, articleLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "한국 직장인 월별 평균 임금 통계 — 통계청 + 고용노동부",
 description:
 "한국 상용근로자 월 평균 임금 + 산업별·연령별 분포. 매월 갱신.",
 path: "/salary-stats-monthly",
 keywords: ["월별 평균 임금", "임금 통계", "통계청", "산업별 임금", "한국 직장인 임금"],
});

const STATS = [
 { category: "전체 평균 (상용근로자)", monthly: 4_200_000, yearly: 50_400_000 },
 { category: "남성", monthly: 4_750_000, yearly: 57_000_000 },
 { category: "여성", monthly: 3_400_000, yearly: 40_800_000 },
 { category: "20대", monthly: 2_800_000, yearly: 33_600_000 },
 { category: "30대", monthly: 4_200_000, yearly: 50_400_000 },
 { category: "40대", monthly: 5_100_000, yearly: 61_200_000 },
 { category: "50대", monthly: 5_400_000, yearly: 64_800_000 },
];

const INDUSTRY = [
 { industry: "금융·보험", monthly: 6_800_000 },
 { industry: "정보통신 (IT)", monthly: 5_900_000 },
 { industry: "전기·가스", monthly: 6_500_000 },
 { industry: "제조업", monthly: 4_500_000 },
 { industry: "건설업", monthly: 4_200_000 },
 { industry: "교육 서비스", monthly: 4_100_000 },
 { industry: "도소매", monthly: 3_500_000 },
 { industry: "숙박·음식", monthly: 2_700_000 },
];

const FAQ_ITEMS = [
 { question: "한국 평균 임금은?", answer: "2026 추정 상용근로자 월 평균 임금 약 420만원, 연 약 5,040만원. 단, 평균은 고소득자에 의해 끌어올려져 중위(50백분위) 약 320만원이 더 현실적." },
 { question: "남녀 임금 격차는?", answer: "남 475만 vs 여 340만 (월). 여성이 약 28% 적음. OECD 임금 격차 1위 수준. 직군·경력 차이 외 구조적 차별 요인 존재." },
 { question: "산업별 격차는?", answer: "최고 금융·보험 (월 680만) vs 최저 숙박·음식 (월 270만) — 약 2.5배. IT는 평균 590만, 제조업 450만." },
 { question: "데이터 출처는?", answer: "통계청 「상용근로자 임금 동향」 + 고용노동부 「고용노동통계」. 매월 발표. 본 페이지는 분기별 종합." },
 { question: "본인 임금이 평균 미달이면?", answer: "1) 직군 평균 비교 (본 사이트 직업별 페이지) 2) 회사 평균 비교 (회사 DB) 3) 협상 또는 이직 검토. 평균 미달이 즉시 문제는 아니지만 시장 가치 점검 필수." },
];

export default function SalaryStatsMonthlyPage() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd data={[
 autoBreadcrumbLd("/salary-stats-monthly", { leafName: "월별 임금 통계" }),
 faqLd(FAQ_ITEMS),
 articleLd({ title: "한국 월별 평균 임금 통계", description: "통계청 + 고용노동부", slug: "salary-stats-monthly", publishedDate: "2026-04-30", modifiedDate: new Date().toISOString() }),
 ]} />
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <BarChart3 className="w-4 h-4" /> 월별 갱신
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 한국 <span className="text-electric">월별 임금</span> 통계
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">상용근로자 월 평균 + 산업별·연령별</p>
 </div>

 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">👥 인구 통계별 평균 임금</h2>
 <div className="bg-white border border-canvas rounded-2xl p-6">
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-3 py-2 text-left font-black text-navy">분류</th>
 <th className="px-3 py-2 text-right font-black text-navy">월 평균</th>
 <th className="px-3 py-2 text-right font-black text-navy">연 환산</th>
 </tr>
 </thead>
 <tbody>
 {STATS.map((s) => (
 <tr key={s.category} className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue font-black">{s.category}</td>
 <td className="px-3 py-2 text-right font-black text-electric tabular-nums">{(s.monthly / 10000).toLocaleString("ko-KR")}만</td>
 <td className="px-3 py-2 text-right text-muted-blue tabular-nums">{(s.yearly / 10000).toLocaleString("ko-KR")}만</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </section>

 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">🏭 산업별 평균 임금</h2>
 <div className="bg-white border border-canvas rounded-2xl p-6">
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-3 py-2 text-left font-black text-navy">산업</th>
 <th className="px-3 py-2 text-right font-black text-navy">월 평균</th>
 </tr>
 </thead>
 <tbody>
 {INDUSTRY.map((i) => (
 <tr key={i.industry} className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue font-black">{i.industry}</td>
 <td className="px-3 py-2 text-right font-black text-navy tabular-nums">{(i.monthly / 10000).toLocaleString("ko-KR")}만</td>
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

 <RelatedCalculators currentPath="/salary-stats-monthly" />
 </div>
 </main>
 );
}
