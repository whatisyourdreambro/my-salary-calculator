// src/app/minimum-wage-countdown/page.tsx
// 최저시급 발표 디데이 + 인상률 추정 — 매년 7월 시즌 트래픽.

import type { Metadata } from "next";
import { Clock, ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, articleLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "2027 최저시급 발표 D-day — 인상률 추정 + 협상 일정",
 description:
 "최저임금위원회 2027년 최저시급 발표 일정 (매년 7월). 2026 대비 추정 인상률과 월급 환산. 매월 갱신.",
 path: "/minimum-wage-countdown",
 keywords: [
 "2027 최저시급",
 "최저시급 발표",
 "최저임금위원회",
 "최저시급 인상률",
 ],
});

const CURRENT_2026 = 10_320;
const ESTIMATED_2027_LOW = 10_500; // 1.7% 인상 가정
const ESTIMATED_2027_HIGH = 10_800; // 4.7% 인상 가정

const FAQ_ITEMS = [
 { question: "최저시급은 언제 결정되나요?", answer: "매년 7월 최저임금위원회가 다음 해 적용 최저시급 결정. 8월 5일까지 고시. 2027년 적용 최저시급은 2026년 7월 결정 예정." },
 { question: "예상 인상률은?", answer: "최근 5년 평균 인상률 약 3%. 정부·노조·사용자 협상 결과로 변동 큼. 2026년 1.7%로 낮은 편이었으니 2027년은 3~5% 인상 가능성." },
 { question: "최저임금위원회 구성?", answer: "근로자위원 9명 + 사용자위원 9명 + 공익위원 9명 = 총 27명. 만장일치 어려워 보통 표결로 결정." },
 { question: "매년 7월 결정이 늦어지는 이유?", answer: "노조와 사용자 측 입장 차이 큼. 노조는 30%+ 인상 요구, 사용자는 동결 주장. 공익위원 중재로 평균 2~5% 결정." },
 { question: "최저시급이 결정되면 바로 적용?", answer: "결정은 7월, 고시는 8월, 시행은 다음 해 1월 1일. 그 사이 사업주는 임금표·근로계약서 갱신 필수." },
];

export default function MinimumWageCountdownPage() {
 const today = new Date();
 const announceDate = new Date(today.getFullYear(), 6, 31); // 매년 7월 31일
 if (today > announceDate) announceDate.setFullYear(announceDate.getFullYear() + 1);
 const daysLeft = Math.ceil((announceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd data={[
 autoBreadcrumbLd("/minimum-wage-countdown", { leafName: "최저시급 발표 D-day" }),
 faqLd(FAQ_ITEMS),
 articleLd({ title: "2027 최저시급 발표 D-day", description: "인상률 추정", slug: "minimum-wage-countdown", publishedDate: "2026-04-30", modifiedDate: today.toISOString() }),
 ]} />
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Clock className="w-4 h-4" /> 디데이 카운터
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 2027 최저시급 발표 <span className="text-electric">D-{daysLeft}</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">{announceDate.toISOString().slice(0, 10)} 발표 예정</p>
 </div>

 <section className="bg-primary p-8 rounded-3xl text-center mb-8">
 <p className="text-navy/70 text-xs font-black uppercase tracking-widest mb-2">2026 현재 최저시급</p>
 <p className="text-5xl font-black text-navy tracking-tight mb-3">{CURRENT_2026.toLocaleString("ko-KR")}원</p>
 <p className="text-sm text-navy/60">월 209시간 = 월 {(CURRENT_2026 * 209).toLocaleString("ko-KR")}원</p>
 </section>

 <section className="grid grid-cols-2 gap-4 mb-10">
 <div className="bg-white p-6 rounded-2xl border border-canvas text-center">
 <p className="text-xs text-muted-blue mb-1">2027 추정 (낮은 인상)</p>
 <p className="text-2xl font-black text-navy">{ESTIMATED_2027_LOW.toLocaleString("ko-KR")}원</p>
 <p className="text-xs text-electric mt-2">+{((ESTIMATED_2027_LOW / CURRENT_2026 - 1) * 100).toFixed(1)}%</p>
 </div>
 <div className="bg-white p-6 rounded-2xl border border-canvas text-center">
 <p className="text-xs text-muted-blue mb-1">2027 추정 (높은 인상)</p>
 <p className="text-2xl font-black text-navy">{ESTIMATED_2027_HIGH.toLocaleString("ko-KR")}원</p>
 <p className="text-xs text-electric mt-2">+{((ESTIMATED_2027_HIGH / CURRENT_2026 - 1) * 100).toFixed(1)}%</p>
 </div>
 </section>

 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-5 mb-10">
 <p className="text-sm text-muted-blue leading-relaxed">
 <strong className="text-navy">현재 상태:</strong> 2027년 최저시급은 2026년 7월 최저임금위원회 협상으로 결정. 노조·사용자·공익위원 27명 표결.
 본 페이지는 발표 후 1일 이내 정확한 수치로 갱신됩니다.
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

 <RelatedCalculators currentPath="/minimum-wage-countdown" />
 </div>
 </main>
 );
}
