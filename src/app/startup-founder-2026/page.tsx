// src/app/startup-founder-2026/page.tsx
// 1인 창업·사업자 가이드.

import type { Metadata } from "next";
import Link from "next/link";
import { Rocket, ArrowRight, Calculator } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd, articleLd, howToLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 1인 창업 가이드 — 사업자등록·세금·정책자금",
 description:
 "1인 창업 시작 절차 + 간이/일반과세자 선택 + 정책자금 7천만 + 세금 일정. 음식점·온라인쇼핑몰·서비스업 종합.",
 path: "/startup-founder-2026",
 keywords: ["1인 창업", "사업자등록", "창업 자금", "정책자금"],
});

const STEPS = [
 { name: "Step 1. 사업자등록 (홈택스 5분)", text: "국세청 홈택스 → 사업자등록 신청. 일반/간이과세자 선택. 업종코드 정확히. 매년 매출 8천만 초과 시 일반 자동 전환." },
 { name: "Step 2. 정책자금 신청", text: "소상공인진흥공단 (sbiz.or.kr) 우대 대출 7천만. 신용보증재단 추가 보증. 우대금리 2~4%." },
 { name: "Step 3. 부가세·종소세 일정 설정", text: "일반과세자: 분기별 부가세 (1·4·7·10월). 간이과세자: 반기별 (1·7월). 매년 5월 종합소득세." },
 { name: "Step 4. 노란우산공제 가입", text: "사업자 전용 절세 + 노후 자금. 연 500만 한도, 16.5% 환급. 직장인 IRP의 사업자 버전." },
];

const FAQ_ITEMS = [
 { question: "1인 창업 초기 자금은?", answer: "업종별 차이 큼. 음식점 5천만~1억, 온라인쇼핑몰 500만~3천만, 프리랜서 사무실 0~500만. 정책자금으로 70%까지 충당 가능." },
 { question: "간이과세자 vs 일반과세자?", answer: "연 매출 8천만 이하 + 매입 적은 업종(서비스업) → 간이 유리. 매입 많은 업종(도소매·제조) → 일반 유리 (매입세액 환급)." },
 { question: "사업자등록 후 첫 세금?", answer: "등록 후 분기 부가세 → 매월 매출 신고 → 5월 종합소득세. 첫 해 적자라도 신고 의무. 세무사 대행 (월 10~30만) 권장." },
 { question: "정책자금 한도와 금리?", answer: "소상공인진흥공단: 7천만 한도, 2~4% 우대금리. 신용 750+ 우대. 사업소득 3천만+ 시 가능." },
 { question: "1인 창업 vs 법인?", answer: "1인 창업(개인사업자): 등록 간단, 세율 6~45% 누진. 법인: 등록 복잡, 법인세 9~24% 고정 + 배당세. 매출 1억 초과 시 법인 유리." },
];

export default function StartupFounder2026Page() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd data={[
 breadcrumbLd([{ name: "홈", path: "/" }, { name: "2026 1인 창업", path: "/startup-founder-2026" }]),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "1인 창업 4단계", description: "사업자등록부터 절세까지", totalTime: "P3M", steps: STEPS }),
 articleLd({ title: "2026 1인 창업 가이드", description: "사업자등록·세금·정책자금", slug: "startup-founder-2026", publishedDate: "2026-04-30" }),
 ]} />
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Rocket className="w-4 h-4" /> 창업 가이드
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 2026 <span className="text-electric">1인 창업</span> 가이드
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">사업자등록 + 세금 + 정책자금 일괄</p>
 </div>

 <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
 <Link href="/calc/small-business-startup-cost" className="bg-primary p-6 rounded-2xl text-navy hover:opacity-90 transition group">
 <Calculator className="w-5 h-5 mb-2" />
 <p className="text-base font-black mb-1">창업 자금 계산</p>
 <p className="text-xs opacity-80">손익분기점 시뮬</p>
 </Link>
 <Link href="/calc/simple-vs-general-vat" className="bg-white border border-canvas p-6 rounded-2xl hover:border-electric transition">
 <p className="text-base font-black text-navy mb-1">간이 vs 일반</p>
 <p className="text-xs text-muted-blue">과세자 비교</p>
 </Link>
 <Link href="/calc/noran-umbrella-deduction" className="bg-white border border-canvas p-6 rounded-2xl hover:border-electric transition">
 <p className="text-base font-black text-navy mb-1">노란우산공제</p>
 <p className="text-xs text-muted-blue">사업자 절세</p>
 </Link>
 </section>

 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">🚀 1인 창업 4단계</h2>
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

 <RelatedCalculators currentPath="/startup-founder-2026" />
 </div>
 </main>
 );
}
