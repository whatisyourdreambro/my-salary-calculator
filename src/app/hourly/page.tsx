// src/app/hourly/page.tsx
// 시급 환산 인덱스 — 인기 시급 카드 + 진입점

import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "시급 → 월급·연봉 환산표 — 알바·계약직 실수령액 (2026)",
 description:
 "시급 1,000원~30,000원의 한국 표준 월 209시간 기준 월급·연봉 환산. 4대보험·소득세 차감 후 실수령액과 최저시급 비교까지 한 페이지에서.",
 path: "/hourly",
 keywords: [
 "시급 연봉 환산",
 "시급 월급",
 "알바 연봉",
 "최저시급 환산",
 "시급 실수령액",
 ],
});

const POPULAR_HOURLY = [
 { wage: 10320, label: "2026 최저시급" },
 { wage: 11000, label: "신입 알바" },
 { wage: 12000, label: "" },
 { wage: 13000, label: "" },
 { wage: 15000, label: "전문직 시급" },
 { wage: 18000, label: "" },
 { wage: 20000, label: "고급 알바" },
 { wage: 25000, label: "" },
 { wage: 30000, label: "프리랜서" },
];

const FAQ_ITEMS = [
 { question: "월 209시간이 무슨 의미인가요?", answer: "한국 노동법 표준: 주 40시간 × 4.345주 + 주휴수당 시간(주 8시간 × 4.345) = 약 209시간. 주휴수당이 이미 포함된 환산." },
 { question: "최저시급 미달 시 어떻게 해야?", answer: "사업주는 차액 지급 의무. 미지급 시 고용노동부 1350 신고. 3년 내 청구 가능." },
 { question: "프리랜서 시급은 어떻게 계산?", answer: "프리랜서는 209시간 기준이 아니라 실제 근로시간. 본인이 일한 시간 × 시급 = 보수. 사업소득 3.3% 원천징수 후 5월 종합소득세 정산." },
];

export default function HourlyIndexPage() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd data={[autoBreadcrumbLd("/hourly", { leafName: "시급 환산" }), faqLd(FAQ_ITEMS)]} />
 <div className="max-w-4xl mx-auto px-4">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Clock className="w-4 h-4" />
 시급 환산
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 시급 → <span className="text-electric">월급·연봉</span> 환산
 </h1>
 <p className="text-lg text-muted-blue">한국 표준 월 209시간 기준 + 4대보험·소득세 자동 차감</p>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
 {POPULAR_HOURLY.map((p) => (
 <Link key={p.wage} href={`/hourly/${p.wage}`} className="bg-white border border-canvas rounded-2xl p-5 hover:border-electric transition group">
 <p className="text-xs text-muted-blue mb-1">{p.label || "인기 시급"}</p>
 <p className="text-xl font-black text-navy">시급 {p.wage.toLocaleString("ko-KR")}원</p>
 <p className="text-xs text-electric mt-2 font-bold opacity-0 group-hover:opacity-100 transition">월급·연봉 보기 →</p>
 </Link>
 ))}
 </div>

 <section className="mb-10">
 <h2 className="text-xl font-black text-navy mb-4">자주 묻는 질문</h2>
 <div className="space-y-3">
 {FAQ_ITEMS.map((f) => (
 <details key={f.question} className="bg-white rounded-2xl p-5 border border-canvas group">
 <summary className="font-black text-navy cursor-pointer list-none flex justify-between items-start">
 <span>{f.question}</span>
 <ArrowRight className="w-5 h-5 text-electric flex-shrink-0 ml-3 transition-transform group-open:rotate-90" />
 </summary>
 <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">{f.answer}</p>
 </details>
 ))}
 </div>
 </section>

 <RelatedCalculators currentPath="/hourly" />
 </div>
 </main>
 );
}
