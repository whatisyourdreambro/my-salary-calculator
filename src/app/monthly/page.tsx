// src/app/monthly/page.tsx
// 월급 환산 인덱스

import type { Metadata } from "next";
import Link from "next/link";
import { Coins, ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "월급 → 연봉·시급 환산표 — 직장인 실수령액 (2026)",
 description:
 "월급 150만~1,000만원의 연봉·시급 환산. 한국 표준 월 209시간 기준 시급, 4대보험·소득세 차감 후 실수령액 한 페이지.",
 path: "/monthly",
 keywords: ["월급 연봉 환산", "월급 시급", "월급 실수령액", "월급별 연봉표"],
});

const POPULAR_MONTHLY = [
 { value: 2_000_000, label: "신입 평균" },
 { value: 2_500_000, label: "" },
 { value: 3_000_000, label: "직장인 표준" },
 { value: 3_500_000, label: "" },
 { value: 4_000_000, label: "5년차" },
 { value: 4_500_000, label: "" },
 { value: 5_000_000, label: "10년차" },
 { value: 6_000_000, label: "팀장급" },
 { value: 8_000_000, label: "임원급" },
];

const FAQ_ITEMS = [
 { question: "월급에 성과급이 포함되나요?", answer: "고정 월급만 환산. 성과급은 연 단위로 별도 환산해 합산해야 정확. 메인 계산기에서 성과급 옵션 활성화 가능." },
 { question: "비과세 식대는 어떻게?", answer: "월 20만원까지 비과세 식대 (4대보험·소득세 면제). 본 환산은 월 20만원 비과세 가정. 회사 규정에 따라 다를 수 있음." },
 { question: "부양가족이 있으면?", answer: "본 환산은 본인 1인 기준. 부양가족 1인당 월 약 1만원 소득세 절감. 4인 가족이면 월 3만원 추가 환급." },
];

export default function MonthlyIndexPage() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd data={[autoBreadcrumbLd("/monthly", { leafName: "월급 환산" }), faqLd(FAQ_ITEMS)]} />
 <div className="max-w-4xl mx-auto px-4">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Coins className="w-4 h-4" />
 월급 환산
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 월급 → <span className="text-electric">연봉·시급</span> 환산
 </h1>
 <p className="text-lg text-muted-blue">연봉 + 시급 환산 + 4대보험·소득세 차감 실수령액</p>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
 {POPULAR_MONTHLY.map((p) => (
 <Link key={p.value} href={`/monthly/${p.value}`} className="bg-white border border-canvas rounded-2xl p-5 hover:border-electric transition group">
 <p className="text-xs text-muted-blue mb-1">{p.label || "인기 월급"}</p>
 <p className="text-xl font-black text-navy">월급 {(p.value / 10000).toLocaleString("ko-KR")}만원</p>
 <p className="text-xs text-electric mt-2 font-bold opacity-0 group-hover:opacity-100 transition">연봉·시급 보기 →</p>
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

 <RelatedCalculators currentPath="/monthly" />
 </div>
 </main>
 );
}
