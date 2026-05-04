// src/app/career-stages-2026/page.tsx
// 직장인 커리어 단계별 평균 연봉·자산 가이드

import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, ArrowRight, Calculator, User } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "직장인 커리어 단계별 평균 연봉·자산 (20대~50대)",
 description:
 "20대 신입~50대 임원까지 단계별 평균 연봉·자산·필수 재테크. 본인 위치 점검과 다음 단계 준비 로드맵.",
 path: "/career-stages-2026",
 keywords: [
 "20대 평균 연봉",
 "30대 평균 자산",
 "40대 연봉",
 "직장인 커리어",
 "연령별 연봉",
 ],
});

const FAQ_ITEMS = [
 {
 question: "30대 평균 연봉은 얼마인가요?",
 answer:
 "2024년 국세청 기준 30대 직장인 평균 연봉은 약 4,500만~5,500만원. 직군에 따라 IT 6,500만+·일반 사무직 4,000만 등 편차 큼. 본인이 평균 이하면 협상 또는 이직 검토 시점.",
 },
 {
 question: "40대 평균 자산은 얼마인가요?",
 answer:
 "통계청 기준 40대 가구 평균 순자산은 약 4억~5억. 자가 1채 + 금융자산 + 퇴직연금 합계. 노후 자금 10억 목표 달성을 위해 40대는 자산 2배로 늘릴 골든타임.",
 },
 {
 question: "단계별로 우선순위가 뭔가요?",
 answer:
 "20대: 신용·비상금·청약. 30대 초: 종잣돈 1억. 30대 중: 자가 매수. 40대: 자녀 교육 + 노후 자금. 50대: 노후 자산 안정화 + 인출 전략. 단계별로 무게중심이 다름.",
 },
];

const STAGES = [
 {
 stage: "20대 사회초년생 (만 24~29세)",
 emoji: "🌱",
 avgSalary: "3,500~4,500만",
 priorities: [
 "비상금 6개월치 (1,500만)",
 "청약통장 매월 10만",
 "ETF 적립 시작 (월 30~50만)",
 "신용점수 850+",
 "체크카드 위주 (지출 통제)",
 ],
 milestone: "5년차에 자산 5,000만 목표",
 },
 {
 stage: "30대 초 (만 30~34세)",
 emoji: "🚀",
 avgSalary: "4,500~6,000만",
 priorities: [
 "종잣돈 1억 만들기",
 "ISA + 연금저축 풀 활용",
 "결혼·자녀 계획 시 자산 분산",
 "이직 골든타임 (30~35% 점프 가능)",
 "회사 RSU/스톡옵션 적극 협상",
 ],
 milestone: "5년차 시니어 점프 + 자산 1.5억",
 },
 {
 stage: "30대 중후반 (만 35~39세)",
 emoji: "🏠",
 avgSalary: "5,500~8,000만",
 priorities: [
 "자가 매수 검토 (대출 50% 이내)",
 "연봉 1억 도전",
 "리더십 트랙 결정 (PM vs IC)",
 "자녀 교육비 사전 증여",
 "보험 점검 (실손 + 정기)",
 ],
 milestone: "자가 + 자산 3~5억",
 },
 {
 stage: "40대 (만 40~49세)",
 emoji: "⚖️",
 avgSalary: "7,000만~1.2억",
 priorities: [
 "자녀 교육 + 노후 자금 동시",
 "포트폴리오 분산 (주식 60 + 채권 30 + 현금 10)",
 "임원급 진입 또는 전문가 트랙",
 "부동산 1주택 외 추가 투자 검토",
 "건강 + 보험 강화",
 ],
 milestone: "자산 7~10억",
 },
 {
 stage: "50대 (만 50~59세)",
 emoji: "🏔️",
 avgSalary: "8,000만~1.5억 (또는 정체)",
 priorities: [
 "노후 자산 안정화 (주식 30 + 채권 50 + 현금 20)",
 "인출 전략 결정 (3% 룰)",
 "건강보험 정산 + 의료비 대비",
 "임금피크 대응",
 "은퇴 후 부수입 채널 준비",
 ],
 milestone: "자산 12~15억 + 인출 계획",
 },
];

export default function CareerStages2026Page() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "직장인 커리어 단계별 가이드", path: "/career-stages-2026" },
 ]),
 faqLd(FAQ_ITEMS),
 ]}
 />

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
 <TrendingUp className="w-4 h-4" />
 커리어 로드맵
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 단계별 <span className="text-electric">커리어·자산</span> 가이드
 </h1>
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 20대 신입부터 50대 임원까지 — 본인 위치 점검과 다음 단계 준비.
 평균 연봉·자산·필수 재테크 로드맵.
 </p>
 </div>

 {/* 단계별 카드 */}
 <div className="space-y-6 mb-12">
 {STAGES.map((stage, idx) => (
 <section
 key={stage.stage}
 className="p-6 bg-white rounded-2xl border border-canvas-200"
 >
 <div className="flex items-start gap-4 mb-4">
 <span className="text-3xl">{stage.emoji}</span>
 <div className="flex-1">
 <h2 className="text-lg font-black text-navy mb-1">{stage.stage}</h2>
 <p className="text-sm text-faint-blue">
 평균 연봉: <strong className="text-electric">{stage.avgSalary}</strong>
 </p>
 </div>
 <div className="px-3 py-1 rounded-full bg-electric-10 text-electric text-xs font-black">
 STAGE {idx + 1}
 </div>
 </div>

 <div className="mb-3">
 <p className="text-xs font-bold text-faint-blue uppercase tracking-wider mb-2">
 우선순위 5가지
 </p>
 <ul className="space-y-1.5">
 {stage.priorities.map((p) => (
 <li key={p} className="text-sm text-muted-blue leading-relaxed">
 · {p}
 </li>
 ))}
 </ul>
 </div>

 <div className="p-3 bg-canvas rounded-xl">
 <p className="text-xs font-bold text-navy">
 🎯 마일스톤: <span className="text-electric">{stage.milestone}</span>
 </p>
 </div>
 </section>
 ))}
 </div>

 {/* CTA */}
 <Link
 href="/"
 className="block mb-12 p-6 sm:p-8 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors group"
 >
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm font-bold opacity-90 mb-2">본인 위치 점검</p>
 <h3 className="text-xl sm:text-2xl font-black mb-2">
 내 연봉 티어·실수령액 확인
 </h3>
 <p className="text-sm opacity-90">
 평균 대비 위치 + 실수령액 즉시 계산
 </p>
 </div>
 <Calculator className="w-12 h-12 opacity-50 group-hover:opacity-80 transition-opacity flex-shrink-0" />
 </div>
 </Link>

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
 <p className="mt-3 text-sm text-muted-blue leading-relaxed">{item.answer}</p>
 </details>
 ))}
 </div>
 </section>

 <RelatedCalculators currentPath="/career-stages-2026" />
 </div>
 </main>
 );
}
