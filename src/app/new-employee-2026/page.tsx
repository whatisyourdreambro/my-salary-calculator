// src/app/new-employee-2026/page.tsx
// 3월 신입 연봉 협상 시즌 페이지

import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, ArrowRight, Calculator, Building2 } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd, articleLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 신입 연봉 협상 가이드 - 직군별 평균 초봉·협상 멘트",
 description:
 "2026 신입 연봉 협상 완벽 가이드. 대기업·IT·금융·공기업 직군별 평균 초봉, 협상 멘트, 사이닝 보너스 협상법까지.",
 path: "/new-employee-2026",
 keywords: [
 "2026 신입 연봉",
 "신입 연봉 협상",
 "직군별 초봉",
 "신입 협상 멘트",
 "대기업 신입 연봉",
 "IT 신입 연봉",
 ],
});

const INDUSTRY_RANGES = [
 { name: "IT 대기업 (네카라쿠배)", range: "5,500~7,500만원", note: "사이닝 보너스 별도" },
 { name: "5대 그룹 (삼성·SK·현대 등)", range: "4,800~5,500만원", note: "성과급 200~500%" },
 { name: "은행·증권", range: "5,000~6,500만원", note: "성과급 변동 큼" },
 { name: "공기업·공공기관", range: "3,800~4,500만원", note: "안정성 + 복지" },
 { name: "스타트업 (시리즈 B+)", range: "4,500~6,000만원", note: "스톡옵션 별도" },
 { name: "외국계", range: "5,000~8,000만원", note: "본사·지사별 격차 큼" },
];

const NEGOTIATION_TIPS = [
 {
 title: "Step 1. 시장 가격 조사",
 body: "잡플래닛·블라인드·머니샐러리 회사별 페이지에서 동일 직군·연차의 평균 연봉 확인. 최소 5개 회사 비교.",
 },
 {
 title: "Step 2. 본인 가치 산정",
 body: "보유 기술 스택, 자격증, 인턴 경력, 학점 등 정량적 근거 정리. 이공계는 GPA 3.5+, 영어 점수 자료화.",
 },
 {
 title: "Step 3. 협상 멘트 준비",
 body: "'제안해주신 금액에 감사드립니다. 다만 시장 평균과 제 가치를 고려할 때 X만원 정도가 적정하다고 판단됩니다.'",
 },
 {
 title: "Step 4. 패키지 전체 협상",
 body: "연봉뿐 아니라 사이닝 보너스, 스톡옵션, 휴가일수, 재택근무, 복지비, 학자금 지원도 협상 대상.",
 },
];

const FAQ_ITEMS = [
 {
 question: "신입도 연봉 협상이 가능한가요?",
 answer:
 "네, 일정 부분 가능합니다. 특히 IT·금융·외국계는 시장 가격 변동이 커서 신입도 ±10% 협상 여지가 있습니다. 다만 공채는 등급 고정이라 어렵고, 수시채용은 가능성이 큽니다.",
 },
 {
 question: "오퍼 받고 얼마 안에 답해야 하나요?",
 answer:
 "보통 1주일 이내 답변을 요구합니다. 다른 회사 결과를 기다려야 하면 솔직히 말하고 1~2주 연장 요청하세요. 무리한 지연은 오퍼 철회 가능성 있음.",
 },
 {
 question: "연봉이 계약서와 다른 경우는?",
 answer:
 "근로계약서에 명시된 금액이 법적 효력입니다. 구두 약속과 다르면 즉시 인사팀에 정정 요청. 계약서 서명 전 모든 항목(연봉·성과급·복지) 재확인 필수.",
 },
];

export default function NewEmployee2026Page() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "2026 신입 연봉 협상", path: "/new-employee-2026" },
 ]),
 faqLd(FAQ_ITEMS),
 articleLd({
 title: "2026 신입 연봉 협상 가이드",
 description: "직군별 평균 초봉, 협상 멘트, 패키지 협상법",
 slug: "new-employee-2026",
 publishedDate: "2026-05-01",
 }),
 ]}
 />

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
 <TrendingUp className="w-4 h-4" />
 3월 신입 시즌
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 2026 신입 연봉 <span className="text-electric">협상 가이드</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 직군별 평균 초봉, 협상 멘트, 패키지 협상까지.
 첫 직장에서 ±10% 차이가 5년 후 ±20% 이상 격차를 만듭니다.
 </p>
 </div>

 {/* Industry Ranges */}
 <section className="mb-12">
 <h2 className="text-xl font-black text-navy mb-6 flex items-center gap-2">
 <Building2 className="w-5 h-5 text-electric" />
 직군별 신입 연봉 범위
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {INDUSTRY_RANGES.map((row) => (
 <div
 key={row.name}
 className="p-5 bg-white rounded-2xl border border-canvas-200"
 >
 <p className="font-bold text-navy text-sm mb-1">{row.name}</p>
 <p className="text-lg font-black text-electric mb-1">{row.range}</p>
 <p className="text-xs text-muted-blue">{row.note}</p>
 </div>
 ))}
 </div>
 </section>

 {/* Negotiation Steps */}
 <section className="mb-12">
 <h2 className="text-xl font-black text-navy mb-6">협상 4단계</h2>
 <div className="space-y-3">
 {NEGOTIATION_TIPS.map((tip, idx) => (
 <div
 key={tip.title}
 className="p-5 bg-white rounded-2xl border border-canvas-200"
 >
 <div className="flex items-start gap-3">
 <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-electric-10 flex items-center justify-center font-black text-electric text-sm">
 {idx + 1}
 </div>
 <div>
 <p className="font-bold text-navy text-sm mb-2">{tip.title}</p>
 <p className="text-xs text-muted-blue leading-relaxed">{tip.body}</p>
 </div>
 </div>
 </div>
 ))}
 </div>
 </section>

 {/* CTAs */}
 <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-4">
 <Link
 href="/salary-db"
 className="block p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
 >
 <Building2 className="w-8 h-8 opacity-70 mb-3" />
 <h3 className="text-lg font-black mb-2">회사별 평균 연봉</h3>
 <p className="text-sm opacity-90">동일 직군 회사 비교</p>
 </Link>
 <Link
 href="/"
 className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
 >
 <Calculator className="w-8 h-8 text-electric mb-3" />
 <h3 className="text-lg font-black mb-2">실수령액 계산</h3>
 <p className="text-sm text-muted-blue">제안 받은 연봉의 세후 월급</p>
 </Link>
 </section>

 {/* FAQ */}
 <section className="mb-12">
 <h2 className="text-xl font-black text-navy mb-6">자주 묻는 질문</h2>
 <div className="space-y-3">
 {FAQ_ITEMS.map((item) => (
 <details
 key={item.question}
 className="group p-5 bg-white rounded-2xl border border-canvas-200"
 >
 <summary className="flex items-center justify-between cursor-pointer text-sm font-bold text-navy">
 {item.question}
 <ArrowRight className="w-4 h-4 text-electric transition-transform group-open:rotate-90" />
 </summary>
 <p className="mt-3 text-sm text-muted-blue leading-relaxed">
 {item.answer}
 </p>
 </details>
 ))}
 </div>
 </section>

 <RelatedCalculators currentPath="/new-employee-2026" />
 </div>
 </main>
 );
}
