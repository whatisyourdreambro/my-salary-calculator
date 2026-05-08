// src/app/parental-leave-2026/page.tsx
// 육아휴직 + 출산휴가 종합 시즌 페이지.

import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Calculator, ArrowRight, Heart, Users } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import {
 breadcrumbLd,
 faqLd,
 articleLd,
 howToLd,
 speakableLd,
} from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 육아휴직급여·출산휴가급여 가이드 — 최대 250만원 받는 법",
 description:
 "2024+ 1~3개월 통상임금 100%(상한 250만)·4~12개월 80%(상한 150만), 75% 매월 + 25% 사후 지급. 출산휴가 90일·다태아 120일 통상임금 100%까지.",
 path: "/parental-leave-2026",
 keywords: [
 "육아휴직급여",
 "통상임금",
 "출산휴가급여",
 "다태아 120일",
 "3+3 부모육아휴직제",
 "부부 동시 육아휴직",
 ],
});

const PARENTAL_TIERS = [
 { period: "1~3개월", rate: "통상임금 100%", cap: "월 상한 250만원", note: "75% 매월 + 25% 사후" },
 { period: "4~12개월", rate: "통상임금 80%", cap: "월 상한 150만원", note: "75% 매월 + 25% 사후" },
];

const COUPLE_BONUS = [
 { month: "1개월", perParent: "200만원", combined: "400만원" },
 { month: "2개월", perParent: "250만원", combined: "500만원" },
 { month: "3개월", perParent: "300만원", combined: "600만원" },
];

const STEPS = [
 { name: "Step 1. 회사 30일 전 통보", text: "육아휴직 시작 30일 전 서면 신청. 회사 거부 불가 (근로기준법). 출산휴가도 30일 전 통보." },
 { name: "Step 2. 고용센터 급여 신청", text: "휴직 시작 후 1개월 이내 고용센터 신청. 매월 1회 (4주마다) 신청." },
 { name: "Step 3. 매월 인정", text: "복귀 의사 + 자녀 양육 사실 증명. 회사 폐업·해고 시 별도 절차." },
 { name: "Step 4. 75% 매월 입금", text: "본인 계좌로 매월 입금. 25%는 복귀 후 6개월 이상 근속 시 일시 지급." },
];

const FAQ_ITEMS = [
 {
 question: "육아휴직급여 1~3개월 통상임금 100%가 정확히 얼마인가요?",
 answer:
 "통상임금 100%, 단 월 상한 250만원. 통상임금이 350만이면 250만원만 받음. 250만 이하면 본인 통상임금 그대로. 75%는 매월(187.5만원), 25%는 복귀 후 6개월 근속 시 일시 지급(67.5만원).",
 },
 {
 question: "4~12개월은 왜 80%로 줄어드나요?",
 answer:
 "장기 휴직 방지 + 정부 재정 부담 고려. 4~12개월은 통상임금 80%(상한 150만). 통상임금 350만 → 80% = 280만이지만 상한 150만 적용. 1~3개월에 비해 큰 폭 감소.",
 },
 {
 question: "부부가 동시에 육아휴직 받으면 가산이 있나요?",
 answer:
 "둘째 자녀부터 '3+3 부모육아휴직제' 적용. 부부가 1~3개월 동시 휴직 시 통상임금 100%(상한 부부 합 450만)까지. 둘째 출산 시 가장 큰 혜택.",
 },
 {
 question: "출산휴가 + 육아휴직 연속 사용 가능한가요?",
 answer:
 "일반적. 출산휴가 90일(다태아 120일) 직후 육아휴직 12개월 연속. 합 약 15개월. 단, 회사에 별도로 30일 전씩 통보 필요.",
 },
 {
 question: "복귀 안 하면 25%는 못 받나요?",
 answer:
 "복귀 후 6개월 이상 근속 시 25% 일시 지급. 6개월 내 퇴사 시 25% 미지급. 단, 회사 폐업 등 본인 귀책 아닐 시 예외 인정.",
 },
 {
 question: "출산휴가 중 통상임금 100% 못 받는 회사도 있나요?",
 answer:
 "법정 100% 의무. 단, 우선지원 대상기업(중소기업)은 정부 100%, 대기업은 처음 60일 회사 + 마지막 30일 정부. 회사가 차액 미지급 시 노동청 신고.",
 },
];

export default function ParentalLeave2026Page() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "2026 육아휴직·출산휴가 가이드", path: "/parental-leave-2026" },
 ]),
 faqLd(FAQ_ITEMS),
 howToLd({
 name: "2026 육아휴직급여 신청 4단계",
 description: "회사 통보부터 매월 입금까지 절차",
 totalTime: "P12M",
 steps: STEPS,
 }),
 articleLd({
 title: "2026 육아휴직급여·출산휴가급여 가이드",
 description: "1~3개월 100%·4~12개월 80%·다태아 120일",
 slug: "parental-leave-2026",
 publishedDate: "2026-04-30",
 }),
 speakableLd({
 url: "/parental-leave-2026",
 cssSelectors: [".faq-answer"],
 }),
 ]}
 />

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Heart className="w-4 h-4" />
 정부지원금 가이드
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 2026 <span className="text-electric">육아휴직·출산휴가</span> 가이드
 </h1>
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 1~3개월 통상임금 100% (상한 250만), 4~12개월 80% (상한 150만).<br />
 부부 동시 휴직 + 출산휴가까지 받을 수 있는 모든 혜택.
 </p>
 </div>

 {/* 빠른 도구 진입 */}
 <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
 <Link href="/calc/parental-leave-benefit" className="bg-primary p-6 rounded-2xl text-navy hover:opacity-90 transition group">
 <Calculator className="w-5 h-5 mb-2" />
 <p className="text-2xl font-black mb-1">육아휴직급여 계산기</p>
 <p className="text-sm opacity-80">통상임금 + 개월수 → 총 수급액</p>
 <ArrowRight className="w-5 h-5 mt-3 group-hover:translate-x-1 transition" />
 </Link>
 <Link href="/calc/maternity-leave-benefit" className="bg-white border border-canvas p-6 rounded-2xl hover:border-electric transition group">
 <Calculator className="w-5 h-5 mb-2 text-electric" />
 <p className="text-2xl font-black text-navy mb-1">출산휴가급여 계산기</p>
 <p className="text-sm text-muted-blue">단태아 90일·다태아 120일</p>
 <ArrowRight className="w-5 h-5 mt-3 text-electric group-hover:translate-x-1 transition" />
 </Link>
 </section>

 {/* 육아휴직급여 구조 */}
 <section className="mb-12">
 <h2 className="text-2xl font-black text-navy mb-5">💰 육아휴직급여 (2024+ 개편)</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {PARENTAL_TIERS.map((t) => (
 <div key={t.period} className="bg-white p-6 rounded-2xl border border-canvas">
 <p className="text-sm text-electric font-black mb-2">{t.period}</p>
 <p className="text-2xl font-black text-navy mb-1">{t.rate}</p>
 <p className="text-sm text-muted-blue mb-3">{t.cap}</p>
 <p className="text-xs text-muted-blue p-3 bg-canvas rounded-xl">{t.note}</p>
 </div>
 ))}
 </div>
 </section>

 {/* 부부 동시 가산 */}
 <section className="mb-12">
 <h2 className="text-2xl font-black text-navy mb-2 flex items-center gap-2">
 <Users className="w-6 h-6 text-electric" />
 3+3 부모육아휴직제 (둘째 자녀+)
 </h2>
 <p className="text-sm text-muted-blue mb-5">부부 동시 1~3개월 휴직 시 통상임금 100% (각각 상한 인상)</p>
 <div className="bg-white border border-canvas rounded-2xl p-6">
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-3 py-2 text-left font-black text-navy">개월</th>
 <th className="px-3 py-2 text-right font-black text-navy">부모 1인</th>
 <th className="px-3 py-2 text-right font-black text-navy">부부 합산</th>
 </tr>
 </thead>
 <tbody>
 {COUPLE_BONUS.map((c) => (
 <tr key={c.month} className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue">{c.month}</td>
 <td className="px-3 py-2 text-right font-black text-navy tabular-nums">{c.perParent}</td>
 <td className="px-3 py-2 text-right font-black text-electric tabular-nums">{c.combined}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <p className="text-xs text-muted-blue mt-3">3개월 합산 시 부부 합 총 1,500만원 → 둘째 출산 후 가장 큰 혜택.</p>
 </section>

 {/* 출산휴가 */}
 <section className="mb-12">
 <h2 className="text-2xl font-black text-navy mb-5">🤰 출산전후휴가</h2>
 <div className="bg-white border border-canvas rounded-2xl p-6">
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-3 py-2 text-left font-black text-navy">구분</th>
 <th className="px-3 py-2 text-right font-black text-navy">총 일수</th>
 <th className="px-3 py-2 text-right font-black text-navy">출산 후 의무</th>
 </tr>
 </thead>
 <tbody>
 <tr className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue">단태아</td>
 <td className="px-3 py-2 text-right font-black text-navy">90일</td>
 <td className="px-3 py-2 text-right text-muted-blue">최소 45일</td>
 </tr>
 <tr className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue">다태아 (쌍둥이+)</td>
 <td className="px-3 py-2 text-right font-black text-electric">120일</td>
 <td className="px-3 py-2 text-right text-muted-blue">최소 60일</td>
 </tr>
 </tbody>
 </table>
 <p className="text-xs text-muted-blue mt-3">통상임금 100%, 월 상한 약 210만원. 우선지원 대상기업(중소)은 정부 100%, 대기업은 60일 회사 + 30(60)일 정부.</p>
 </div>
 </section>

 {/* 신청 절차 */}
 <section className="mb-12">
 <h2 className="text-2xl font-black text-navy mb-5">🚀 신청 절차 4단계</h2>
 <div className="space-y-3">
 {STEPS.map((s, i) => (
 <div key={s.name} className="bg-white p-5 rounded-2xl border border-canvas flex gap-4">
 <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center font-black text-navy">
 {i + 1}
 </div>
 <div>
 <p className="font-black text-navy mb-1">{s.name}</p>
 <p className="text-sm text-muted-blue">{s.text}</p>
 </div>
 </div>
 ))}
 </div>
 </section>

 {/* FAQ */}
 <section className="mb-12">
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

 <RelatedCalculators currentPath="/parental-leave-2026" />
 </div>
 </main>
 );
}
