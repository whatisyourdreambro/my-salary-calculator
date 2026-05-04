// src/app/retirement-pension-2026/page.tsx
// 2026 퇴직연금 종합 가이드 — DB·DC·IRP 비교

import type { Metadata } from "next";
import Link from "next/link";
import { PiggyBank, ArrowRight, Calculator } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 퇴직연금 완벽 가이드 — DB·DC·IRP 차이와 선택법",
 description:
 "확정급여형(DB)·확정기여형(DC)·개인형퇴직연금(IRP) 차이와 운용 수익률, 세제 혜택. 본인에게 맞는 퇴직연금 선택법.",
 path: "/retirement-pension-2026",
 keywords: [
 "퇴직연금",
 "DB DC 차이",
 "IRP 계좌",
 "확정급여형",
 "확정기여형",
 "퇴직연금 운용",
 ],
});

const FAQ_ITEMS = [
 {
 question: "DB와 DC 중 어느 쪽이 유리한가요?",
 answer:
 "DB(확정급여형)는 회사가 운용 책임 → 안정적이지만 수익률 낮음. DC(확정기여형)는 본인이 운용 → 잘 굴리면 수익률 높지만 책임 본인. 30대 이전 + 투자 자신 있으면 DC, 안정 우선이면 DB.",
 },
 {
 question: "퇴직 시 IRP로 옮겨야 하나요?",
 answer:
 "퇴직 시 일시 수령하면 퇴직소득세 일시 부담. IRP로 이전하면 연금 수령 시 분할 인출 + 저세율(3.3~5.5%) 적용. 50세 이후엔 무조건 IRP 이전이 유리합니다.",
 },
 {
 question: "DC 운용은 어떻게 하나요?",
 answer:
 "회사 지정 운용기관(증권사·은행)에서 펀드·예금·ETF 선택 가능. 30~70% 위험자산(주식형) + 30~70% 안전자산(예금·채권). 분기별 점검 + 연 1회 리밸런싱 권장.",
 },
];

const COMPARISON = [
 {
 name: "DB (확정급여형)",
 desc: "회사가 운용. 퇴직 시 약속된 금액 지급.",
 pros: ["안정적 (회사 보장)", "운용 신경 X", "원금 보장"],
 cons: ["수익률 낮음 (연 2~3%)", "회사 부도 리스크"],
 suitable: "안정 우선 / 50대 이상",
 },
 {
 name: "DC (확정기여형)",
 desc: "본인이 운용. 운용 결과가 퇴직금.",
 pros: ["수익률 높을 수 있음 (5~10%)", "본인 통제", "포트폴리오 자유"],
 cons: ["손실 가능성", "운용 시간 필요"],
 suitable: "30대 이전 / 투자 자신",
 },
 {
 name: "IRP (개인형퇴직연금)",
 desc: "본인 명의 계좌 + 추가 납입 가능.",
 pros: ["연 300만 추가 세액공제", "퇴직금 합산 운용", "55세 후 연금 수령 저세율"],
 cons: ["30% 안전자산 의무", "55세 전 인출 손실 큼"],
 suitable: "절세 + 노후 자금 동시 추구",
 },
];

export default function RetirementPension2026Page() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "2026 퇴직연금 가이드", path: "/retirement-pension-2026" },
 ]),
 faqLd(FAQ_ITEMS),
 ]}
 />

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
 <PiggyBank className="w-4 h-4" />
 2026 퇴직연금
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 퇴직연금 <span className="text-electric">완벽 가이드</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 DB·DC·IRP 3가지 퇴직연금 차이와 본인에게 맞는 선택.
 잘못 고르면 노후 자산 1억 차이.
 </p>
 </div>

 {/* 3가지 비교 */}
 <div className="space-y-4 mb-12">
 {COMPARISON.map((item) => (
 <div key={item.name} className="p-6 bg-white rounded-2xl border border-canvas-200">
 <h2 className="text-lg font-black text-navy mb-2">{item.name}</h2>
 <p className="text-sm text-muted-blue mb-4">{item.desc}</p>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
 <div className="p-3 bg-canvas rounded-xl">
 <p className="text-xs font-bold text-electric mb-2">장점</p>
 <ul className="text-xs text-muted-blue space-y-1">
 {item.pros.map((p) => <li key={p}>· {p}</li>)}
 </ul>
 </div>
 <div className="p-3 bg-canvas rounded-xl">
 <p className="text-xs font-bold text-faint-blue mb-2">단점</p>
 <ul className="text-xs text-muted-blue space-y-1">
 {item.cons.map((c) => <li key={c}>· {c}</li>)}
 </ul>
 </div>
 </div>
 <p className="text-xs text-faint-blue">
 <strong className="text-navy">적합:</strong> {item.suitable}
 </p>
 </div>
 ))}
 </div>

 {/* CTA */}
 <Link
 href="/tools/finance/irp"
 className="block mb-12 p-6 sm:p-8 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors group"
 >
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm font-bold opacity-90 mb-2">IRP 절세 효과 시뮬</p>
 <h3 className="text-xl sm:text-2xl font-black mb-2">
 IRP·연금저축 세액공제 계산
 </h3>
 <p className="text-sm opacity-90">
 연 900만 한도 풀 활용 시 환급금 즉시 계산
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

 <RelatedCalculators currentPath="/retirement-pension-2026" />
 </div>
 </main>
 );
}
