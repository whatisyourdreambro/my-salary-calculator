// src/app/career-change-2026/page.tsx
// 이직 가이드 — 연봉 협상·시장 가치·이직 타이밍.

import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, ArrowRight, Calculator, Target } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd, articleLd, howToLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 이직 가이드 — 연봉 협상·시장 가치·이직 타이밍",
 description:
 "이직 시 평균 연봉 인상률 20~30%. 본인 시장 가치 평가 + 협상 전략 + 이직 골든타임. 헤드헌터 활용 + 오퍼 협상.",
 path: "/career-change-2026",
 keywords: ["이직 가이드", "연봉 협상", "시장 가치", "이직 타이밍"],
});

const STEPS = [
 { name: "Step 1. 본인 시장 가치 평가", text: "잡플래닛·블라인드·머니샐러리 회사별 페이지에서 동일 직군·연차 평균 연봉 비교. 본인 ±20% 이내면 시장 평균." },
 { name: "Step 2. 이직 골든타임 점검", text: "1) 회사 매출·실적 둔화 → 정체. 2) 본인 직무 시장 수요 ↑ → 좋은 시점. 3) 30~35세 시니어 점프가 가장 좋은 시점." },
 { name: "Step 3. 헤드헌터·플랫폼 활용", text: "원티드·잡코리아·링크드인 + 헤드헌터 1~2명 활용. 본인 미공개 채용 정보 받기." },
 { name: "Step 4. 오퍼 협상 + 패키지 비교", text: "기본급뿐 아니라 사이닝 보너스·스톡·휴가·복지·재택 종합 비교. 다른 오퍼 활용해 협상력 ↑." },
];

const FAQ_ITEMS = [
 { question: "이직 시 평균 연봉 인상률은?", answer: "한국 평균 약 20~30%. IT는 30~40%까지 가능. 단, 회사 신입 평균 미달이면 인상폭 작거나 일치 (이직 매력도 ↓)." },
 { question: "이직 잦으면 불리한가요?", answer: "5년 내 3회 이상은 부정적. 단, 분명한 사유(승진·기술 스택 확장)가 있으면 OK. 2~3년 단위 이직이 평균." },
 { question: "이직 시 협상 카드는?", answer: "1) 다른 오퍼 (가장 강력). 2) 시장 평균 데이터. 3) 본인 보유 핵심 기술·자격증. 4) 면접관과 팀원 호감도." },
 { question: "사이닝 보너스 협상은?", answer: "전 회사 잔여 인센티브·연차 등 손실 보상 명목. 보통 연봉의 5~20%. 1~2년 근속 조건 (조기 퇴사 시 환급)." },
 { question: "스톡옵션은 어떻게?", answer: "비상장 스타트업 → 기업가치 × 지분율 추산. 4년 vesting + 1년 cliff 일반. IPO 가능성 + 행사가 비교 필수." },
];

export default function CareerChange2026Page() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd data={[
 breadcrumbLd([{ name: "홈", path: "/" }, { name: "2026 이직 가이드", path: "/career-change-2026" }]),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "이직 4단계", description: "시장 가치 평가부터 오퍼 협상까지", totalTime: "P3M", steps: STEPS }),
 articleLd({ title: "2026 이직 가이드", description: "연봉 협상·시장 가치", slug: "career-change-2026", publishedDate: "2026-04-30" }),
 ]} />
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Target className="w-4 h-4" /> 이직 가이드
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 2026 <span className="text-electric">이직</span> 가이드
 </h1>
 <p className="text-base sm:text-lg text-muted-blue">평균 연봉 인상률 20~30% · 협상 전략 + 골든타임</p>
 </div>

 <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
 <Link href="/salary-db" className="bg-primary p-6 rounded-2xl text-navy hover:opacity-90 transition group">
 <Calculator className="w-5 h-5 mb-2" />
 <p className="text-2xl font-black mb-1">회사별 연봉 DB</p>
 <p className="text-sm opacity-80">85+ 회사 직급별 연봉</p>
 <ArrowRight className="w-5 h-5 mt-3 group-hover:translate-x-1 transition" />
 </Link>
 <Link href="/job/backend-developer/salary" className="bg-white border border-canvas p-6 rounded-2xl hover:border-electric transition group">
 <TrendingUp className="w-5 h-5 mb-2 text-electric" />
 <p className="text-2xl font-black text-navy mb-1">직업별 평균 연봉</p>
 <p className="text-sm text-muted-blue">100+ 직군 분석</p>
 <ArrowRight className="w-5 h-5 mt-3 text-electric group-hover:translate-x-1 transition" />
 </Link>
 </section>

 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">🚀 이직 4단계</h2>
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

 <RelatedCalculators currentPath="/career-change-2026" />
 </div>
 </main>
 );
}
