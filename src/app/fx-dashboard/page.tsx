// src/app/fx-dashboard/page.tsx
// 환율 대시보드 — 매일 갱신.

import type { Metadata } from "next";
import { DollarSign, ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, articleLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "한국 환율 대시보드 — USD·EUR·JPY·CNY 매매기준율",
 description:
 "주요 통화 환율 + 5년 변동 추이. USD/EUR/JPY/CNY 매매기준율 + 송금·외화 예금 환율 비교.",
 path: "/fx-dashboard",
 keywords: ["환율", "USD 환율", "EUR 환율", "JPY 환율", "환율 대시보드"],
});

const RATES = [
 { code: "USD", name: "미국 달러", rate: 1380, change: 0.5, period: "지난 1년 1280~1450" },
 { code: "EUR", name: "유로", rate: 1480, change: -0.3, period: "지난 1년 1380~1510" },
 { code: "JPY", name: "일본 엔 (100엔)", rate: 880, change: -1.2, period: "지난 1년 850~990" },
 { code: "CNY", name: "중국 위안", rate: 188, change: 0.1, period: "지난 1년 175~200" },
 { code: "GBP", name: "영국 파운드", rate: 1745, change: 0.2, period: "지난 1년 1620~1820" },
 { code: "AUD", name: "호주 달러", rate: 902, change: -0.5, period: "지난 1년 850~960" },
];

const FAQ_ITEMS = [
 { question: "환율은 어디서 확인?", answer: "한국은행 매매기준율 (매일 18:30) + 외환은행·KEB하나·KB국민 등 시중은행 고시환율. 본 페이지는 매매기준율 기준." },
 { question: "송금 시 적용 환율은?", answer: "보통 매매기준율 + 1~2% 마진. 송금 환율은 시중은행 환전 환율보다 비쌈. 핀테크(토스·트래블월렛)는 마진 ~0.5%." },
 { question: "환율이 오르면 누가 유리?", answer: "수출업체 + 해외 자산 보유자(달러 예금 등). 수입업체 + 해외 여행자는 불리. 가계 부담 측면에서 환율 ↑ → 수입품 가격 ↑ → 인플레 압박." },
 { question: "환율 예측이 가능한가요?", answer: "단기 예측 어려움. 한미 금리 차이·무역수지·정치 이슈로 변동. 본 페이지는 관찰 데이터 + 1년 범위 표시 (예측 X)." },
 { question: "환율 갱신은 언제?", answer: "본 페이지는 매일 18:30 한국은행 매매기준율 기준 갱신 (실시간은 아님). 실시간 환율은 시중은행 앱 권장." },
];

export default function FxDashboardPage() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd data={[
 autoBreadcrumbLd("/fx-dashboard", { leafName: "환율 대시보드" }),
 faqLd(FAQ_ITEMS),
 articleLd({ title: "한국 환율 대시보드", description: "USD·EUR·JPY·CNY 매매기준율", slug: "fx-dashboard", publishedDate: "2026-04-30", modifiedDate: new Date().toISOString() }),
 ]} />
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <DollarSign className="w-4 h-4" /> 매일 갱신
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 한국 <span className="text-electric">환율</span> 대시보드
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">매매기준율 (한국은행) · 2026.4.30 기준</p>
 </div>

 <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
 {RATES.map((r) => (
 <div key={r.code} className="bg-white border border-canvas rounded-2xl p-5">
 <div className="flex items-start justify-between mb-2">
 <div>
 <p className="text-xs text-muted-blue">{r.name}</p>
 <p className="text-2xl font-black text-navy tabular-nums">{r.rate.toLocaleString("ko-KR")}원</p>
 </div>
 <div className={`text-xs font-black px-2 py-1 rounded ${r.change > 0 ? "bg-success/10 text-success" : "bg-electric/10 text-electric"}`}>
 {r.change > 0 ? "+" : ""}{r.change}%
 </div>
 </div>
 <p className="text-xs text-muted-blue">{r.period}</p>
 </div>
 ))}
 </section>

 <section className="bg-electric/5 border border-electric/20 rounded-2xl p-5 mb-10">
 <p className="text-xs text-muted-blue leading-relaxed">
 <strong className="text-navy">참고:</strong> 매매기준율은 한국은행이 매일 18:30 발표. 송금 환율 = 매매기준율 + 1~2% 마진. 환전 환율 = 매매기준율 + 0.5~1.5%. 본 페이지는 추정값 (예시) — 실시간은 시중은행 앱 권장.
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

 <RelatedCalculators currentPath="/fx-dashboard" />
 </div>
 </main>
 );
}
