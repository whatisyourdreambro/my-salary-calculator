// src/app/first-job-2026/page.tsx
// 첫 직장 가이드 — 신입사원·인턴 대상.

import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowRight, Calculator, GraduationCap } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd, articleLd, howToLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 첫 직장 가이드 — 신입사원 첫 월급·4대보험·세금",
 description:
 "첫 직장 받는 첫 월급 + 4대보험 + 소득세 + 연말정산 + 청년 절세. 신입 첫 1년 필수 체크리스트.",
 path: "/first-job-2026",
 keywords: ["첫 직장", "신입 첫 월급", "첫 월급 세금", "신입 4대보험"],
});

const STEPS = [
 { name: "Step 1. 근로계약서 + 첫 월급", text: "근로계약서 작성 + 4대보험 가입. 첫 월급은 일할 계산. 비과세 식대 20만 + 본인 1인 공제 적용." },
 { name: "Step 2. 청년 절세 활용", text: "중소기업 취업자 감면 (만 34세 이하 신입, 5년간 90% 세액 감면). 청년형 ISA 가입 (200만 비과세)." },
 { name: "Step 3. 4대보험 점검", text: "월급 명세서에서 본인 부담 약 9.4% 차감 확인. 국민연금 4.5% + 건강보험 3.545% + 장기요양 0.46% + 고용보험 0.9%." },
 { name: "Step 4. 첫 연말정산 준비", text: "12월 신용카드·연금저축·기부금 점검. 첫 해는 환급 적을 수 있음 (공제 적음). 다음 해부터 본격 절세 시작." },
];

const FAQ_ITEMS = [
 { question: "첫 월급은 언제 받나요?", answer: "보통 첫 달 25일 또는 다음 달 10일. 입사일 이후 일할 계산. 비과세 식대 20만이 첫 월급에서 차감됨." },
 { question: "신입 평균 연봉은?", answer: "한국 평균 약 3,000~4,500만원 (직군 차이 큼). IT 5,500~7,500만, 일반 사무 3,500~4,500만. 본 사이트 직업별 페이지에서 직군별 확인." },
 { question: "중소기업 취업자 감면이란?", answer: "만 15~34세 청년이 중소기업 취업 시 5년간 소득세 90% 감면 (한도 200만/년). 본인이 회사에 신청해야 적용." },
 { question: "청년형 ISA는?", answer: "만 19~34세 + 총급여 5,000만 이하 가입 가능. 5년 후 비과세 한도 200만 (일반형 200만보다 우대 X, 단 가입 자격 우대)." },
 { question: "첫 연말정산 환급은?", answer: "첫 해는 환급 적음 (공제 적음). 12월 입사면 거의 0원. 6월+ 입사면 30~100만 환급 가능. 신용카드·연금저축 적극 활용 권장." },
];

export default function FirstJob2026Page() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd data={[
 breadcrumbLd([{ name: "홈", path: "/" }, { name: "2026 첫 직장 가이드", path: "/first-job-2026" }]),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "첫 직장 4단계", description: "첫 월급부터 첫 연말정산까지", totalTime: "P1Y", steps: STEPS }),
 articleLd({ title: "2026 첫 직장 가이드", description: "신입 첫 월급·4대보험·세금", slug: "first-job-2026", publishedDate: "2026-04-30" }),
 ]} />
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <GraduationCap className="w-4 h-4" /> 신입 가이드
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 2026 <span className="text-electric">첫 직장</span> 가이드
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">첫 월급부터 첫 연말정산까지</p>
 </div>

 <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
 <Link href="/" className="bg-primary p-6 rounded-2xl text-navy hover:opacity-90 transition group">
 <Calculator className="w-5 h-5 mb-2" />
 <p className="text-base font-black mb-1">첫 월급 시뮬</p>
 <p className="text-xs opacity-80">실수령액 미리 보기</p>
 </Link>
 <Link href="/year-end-tax" className="bg-white border border-canvas p-6 rounded-2xl hover:border-electric transition">
 <p className="text-base font-black text-navy mb-1">연말정산</p>
 <p className="text-xs text-muted-blue">환급 미리 계산</p>
 </Link>
 <Link href="/new-employee-2026" className="bg-white border border-canvas p-6 rounded-2xl hover:border-electric transition">
 <p className="text-base font-black text-navy mb-1">신입 협상</p>
 <p className="text-xs text-muted-blue">연봉 협상 멘트</p>
 </Link>
 </section>

 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">🚀 첫 직장 4단계</h2>
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

 <RelatedCalculators currentPath="/first-job-2026" />
 </div>
 </main>
 );
}
