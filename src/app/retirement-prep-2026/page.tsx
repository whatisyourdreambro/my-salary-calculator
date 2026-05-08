// src/app/retirement-prep-2026/page.tsx
// 은퇴 준비 가이드.

import type { Metadata } from "next";
import Link from "next/link";
import { Sunset, ArrowRight, Calculator, Coins } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd, articleLd, howToLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 은퇴 준비 가이드 — 노후 자금 10억·연금 3종 활용",
 description:
 "한국 은퇴 자금 권장 10억. 국민연금 + 퇴직연금 + 개인연금 3층 연금 구조 + IRP 절세 + 4% 룰 인출 전략.",
 path: "/retirement-prep-2026",
 keywords: ["은퇴 준비", "노후 자금", "연금 3종", "은퇴 설계"],
});

const STEPS = [
 { name: "Step 1. 은퇴 후 연 생활비 산정", text: "원하는 라이프스타일 × 12개월. 검소 3,000만 / 보통 5,000만 / 풍족 1억." },
 { name: "Step 2. 필요 노후 자금 계산", text: "연 생활비 × 25배 (4% 룰). 한국은 부동산 + 의료비 고려해 30배 권장." },
 { name: "Step 3. 3층 연금 활용", text: "1층 국민연금 + 2층 퇴직연금(IRP·DB·DC) + 3층 개인연금(연금저축). 합산 약 70~80% 노후 자금 커버." },
 { name: "Step 4. 부족분 자산 운용", text: "주식·ETF 70% + 채권·예금 30%. 인출 전 5년치 안전자산 별도 확보 (버킷 전략)." },
];

const FAQ_ITEMS = [
 { question: "한국 평균 노후 자금은?", answer: "통계청 60대 가구 평균 약 4~5억. 하지만 안전한 노후를 위해 10억 이상 권장. 국민연금 + 퇴직연금 합산 시 추가 5억 이상 필요." },
 { question: "국민연금 수령액은?", answer: "가입 20년 + 월 평균 보수 300만 → 월 약 80~100만 수령 (65세부터). 가입 30년+ 월 보수 500만 → 월 150~200만." },
 { question: "퇴직연금 IRP 활용은?", answer: "퇴사 시 일시 수령 X, IRP 이전 → 55세 후 분할 인출. 세율 3.3~5.5% (일시 수령 누진보다 30%+ 절세)." },
 { question: "4% 룰이 한국에서도 적용?", answer: "한국은 부동산 + 의료비 + 자녀 지원 부담 큼. 보수적으로 3.5%(28.5배) 또는 3%(33배) 권장." },
 { question: "은퇴 시점은 언제?", answer: "정년 60세 + 국민연금 65세부터 → 5년 공백. 퇴직금·개인연금으로 메꿔야. 점진적 은퇴(50대 후반 파트타임)도 옵션." },
];

export default function RetirementPrep2026Page() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd data={[
 breadcrumbLd([{ name: "홈", path: "/" }, { name: "2026 은퇴 준비", path: "/retirement-prep-2026" }]),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "은퇴 준비 4단계", description: "노후 자금부터 인출 전략까지", totalTime: "P30Y", steps: STEPS }),
 articleLd({ title: "2026 은퇴 준비 가이드", description: "노후 자금·연금 3종", slug: "retirement-prep-2026", publishedDate: "2026-04-30" }),
 ]} />
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Sunset className="w-4 h-4" /> 은퇴 가이드
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 2026 <span className="text-electric">은퇴 준비</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">노후 자금 10억 + 3층 연금 활용</p>
 </div>

 <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
 <Link href="/fire-calculator" className="bg-primary p-6 rounded-2xl text-navy hover:opacity-90 transition group">
 <Calculator className="w-5 h-5 mb-2" />
 <p className="text-2xl font-black mb-1">FIRE 시뮬레이터</p>
 <p className="text-sm opacity-80">조기은퇴 자산 목표</p>
 <ArrowRight className="w-5 h-5 mt-3 group-hover:translate-x-1 transition" />
 </Link>
 <Link href="/tools/finance/irp" className="bg-white border border-canvas p-6 rounded-2xl hover:border-electric transition group">
 <Coins className="w-5 h-5 mb-2 text-electric" />
 <p className="text-2xl font-black text-navy mb-1">IRP 절세 시뮬</p>
 <p className="text-sm text-muted-blue">최대 900만 세액공제</p>
 <ArrowRight className="w-5 h-5 mt-3 text-electric group-hover:translate-x-1 transition" />
 </Link>
 </section>

 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">🚀 은퇴 준비 4단계</h2>
 <div className="space-y-3">
 {STEPS.map((s, i) => (
 <div key={s.name} className="bg-white p-5 rounded-2xl border border-canvas flex gap-4">
 <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center font-black text-navy">{i + 1}</div>
 <div>
 <p className="font-black text-navy mb-1">{s.name}</p>
 <p className="text-sm text-muted-blue">{s.text}</p>
 </div>
 </div>
 ))}
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

 <RelatedCalculators currentPath="/retirement-prep-2026" />
 </div>
 </main>
 );
}
