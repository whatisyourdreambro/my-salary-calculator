// src/app/digital-nomad-2026/page.tsx
// 디지털 노마드·해외 거주 가이드.

import type { Metadata } from "next";
import Link from "next/link";
import { Globe, ArrowRight, Calculator } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd, articleLd, howToLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 디지털 노마드 가이드 — 한국 거주자 해외 원격근무 세금",
 description:
 "한국 거주자 + 해외 회사 원격근무 시 세금 의무. 거주자 vs 비거주자 판정 + 종합과세 + 외화 송금 + 환전 세금까지.",
 path: "/digital-nomad-2026",
 keywords: ["디지털 노마드", "해외 원격근무", "거주자 세금", "외화 송금"],
});

const STEPS = [
 { name: "Step 1. 거주자 vs 비거주자 판정", text: "1년 중 183일 이상 한국 거주 → 거주자 (전세계 소득 한국 과세). 미만 → 비거주자 (한국 발생 소득만)." },
 { name: "Step 2. 외화 소득 신고", text: "거주자는 해외 회사 급여도 매년 5월 종합소득세 신고. 환율 적용 시점은 입금일 기준." },
 { name: "Step 3. 외국 납부세액 공제", text: "해외에서 이미 낸 세금은 한국 세액에서 공제 가능. 이중과세 방지 협정 적용 (대부분 OECD 국가)." },
 { name: "Step 4. 4대보험 + 건강보험 처리", text: "거주자는 한국 건강보험 가입 의무 (지역가입자). 직장 가입자 자격 유지 시 별도." },
];

const FAQ_ITEMS = [
 { question: "해외 회사 원격근무 시 한국 세금?", answer: "한국 거주자(183일+) → 전세계 소득 한국 과세. 비거주자 → 한국 발생 소득만. 해외 회사 급여도 한국 종소세 의무." },
 { question: "외화 입금 시 환율 적용?", answer: "입금일 매매기준율 (한국은행). 매월 입금 시 매월 환율 적용 → 12회 환율 평균 산출. 환차익은 비과세." },
 { question: "이중과세는 어떻게?", answer: "한국-OECD 협정 대부분 이중과세 방지. 미국·캐나다·호주 등에서 낸 세금 → 한국 세액에서 공제. 이중 부담 없음." },
 { question: "건강보험은?", answer: "한국 거주자 + 직장 미가입 → 지역가입자 자동 등록. 월 약 20~80만 (소득·재산별). 1년 이상 해외 체류 시 일시 정지 가능." },
 { question: "디지털 노마드 비자는?", answer: "한국은 별도 디지털 노마드 비자 없음 (2026 기준). 6개월 단기 체류만 가능. 장기 해외 체류는 본인 거주국 비자 필요 (포르투갈·스페인 등 디지털 노마드 비자 발급)." },
];

export default function DigitalNomad2026Page() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd data={[
 breadcrumbLd([{ name: "홈", path: "/" }, { name: "2026 디지털 노마드", path: "/digital-nomad-2026" }]),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "디지털 노마드 4단계", description: "거주자 판정부터 4대보험까지", totalTime: "PT2H", steps: STEPS }),
 articleLd({ title: "2026 디지털 노마드 가이드", description: "한국 거주자 해외 원격근무 세금", slug: "digital-nomad-2026", publishedDate: "2026-04-30" }),
 ]} />
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Globe className="w-4 h-4" /> 글로벌 가이드
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 2026 <span className="text-electric">디지털 노마드</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">한국 거주자 해외 원격근무 세금·신고</p>
 </div>

 <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
 <Link href="/calc/fx-trading-roi" className="bg-primary p-6 rounded-2xl text-navy hover:opacity-90 transition group">
 <Calculator className="w-5 h-5 mb-2" />
 <p className="text-2xl font-black mb-1">외화 환차익 시뮬</p>
 <p className="text-sm opacity-80">달러 환전 손익</p>
 </Link>
 <Link href="/calc/freelance-tax-quick" className="bg-white border border-canvas p-6 rounded-2xl hover:border-electric transition group">
 <Calculator className="w-5 h-5 mb-2 text-electric" />
 <p className="text-2xl font-black text-navy mb-1">종합소득세 시뮬</p>
 <p className="text-sm text-muted-blue">5월 신고 환급</p>
 </Link>
 </section>

 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">🚀 디지털 노마드 4단계</h2>
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

 <RelatedCalculators currentPath="/digital-nomad-2026" />
 </div>
 </main>
 );
}
