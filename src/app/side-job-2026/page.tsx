// src/app/side-job-2026/page.tsx
// 부업·N잡 시작 가이드.

import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, ArrowRight, Calculator, Sparkles } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd, articleLd, howToLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 부업·N잡 시작 가이드 — 세금·신고·합법 부업 추천",
 description:
 "직장인 부업 시작 전 알아야 할 사항. 회사 부업 금지 조항·종합소득세 신고·3.3% 원천징수·부가세까지. 인기 부업 추천 + 첫 신고 절차.",
 path: "/side-job-2026",
 keywords: ["부업 시작", "직장인 부업", "N잡 가이드", "부업 세금", "투잡 세금"],
});

const SIDE_JOBS = [
 { name: "유튜브·블로그 (광고 수익)", note: "구글·네이버 광고", time: "주 5~10h", income: "월 0~수백만 (변동)" },
 { name: "프리랜서 (디자인·번역·강의)", note: "크몽·숨고·탈잉", time: "주 5~15h", income: "월 50~300만" },
 { name: "스마트스토어·쿠팡 셀러", note: "재고 관리", time: "주 10~20h", income: "월 0~수천만 (변동)" },
 { name: "주식·코인 투자", note: "비활성 부업", time: "주 1~5h", income: "변동 큼 (손실 가능)" },
 { name: "온라인 강의·전자책", note: "인프런·클래스101", time: "초기 100h+ 후 자동", income: "월 30~500만" },
];

const STEPS = [
 { name: "Step 1. 회사 취업규칙 확인", text: "근로계약서 + 취업규칙에 부업 금지 조항 확인. 사기업은 대부분 자율, 공무원은 엄격히 금지." },
 { name: "Step 2. 사업자등록 검토", text: "월 매출 200만 초과 또는 정기적 사업이면 등록 필수. 미등록 시 무신고 가산세 + 부가세 추징." },
 { name: "Step 3. 분기·연 세금 일정 정리", text: "본업: 회사 연말정산. 부업: 5월 종합소득세 직접 신고 + 분기 부가세 (사업자)." },
 { name: "Step 4. 합법적 신고로 환급 챙기기", text: "원천징수 3.3% 떼인 프리랜서는 신고 시 보통 100~300만 환급. 미신고 시 환급 X." },
];

const FAQ_ITEMS = [
 { question: "부업이 회사에 들통나는 시점은?", answer: "본업+부업 합산 소득 → 건강보험료 +상승 → 회사로 통보 (직장인 4대보험 정산 시). 또는 회사 컴퓨터·시간 활용 시 직접 적발." },
 { question: "회사 부업 금지면 무조건 못 하나요?", answer: "근로계약서·취업규칙에 명시되어 있으면 위반. 단, 본업에 지장 없는 자기 시간 활용은 법적 보호. 대법원 판례 — 부업 자체 금지는 위헌 가능성." },
 { question: "월 얼마부터 사업자등록?", answer: "정기적 매출 발생 시. 1년 매출 4,800만 이하 간이과세자 가능. 단발성 프리랜서 (강의 1회 등)는 사업자등록 불필요, 종소세만 신고." },
 { question: "부업 세금이 본업보다 큰 이유?", answer: "본업+부업 합산 누진세율 점프. 본업 5,000만(15%) + 부업 2,000만 → 합 7,000만 (24% 구간). 부업 2,000만에 24% 추가 부과." },
 { question: "원천징수 3.3% 어떻게 되찾나?", answer: "매년 5월 종합소득세 신고 → 필요경비·인적공제 차감 → 실제 세금 vs 떼인 3.3% 차액 환급. 미신고 시 못 받음." },
 { question: "건강보험료 추가는?", answer: "본업+부업 합산 소득 신고 시 건보료 재산정. 본업만 비교 약 5~15% 추가. 회사가 알아채는 신호 — 7월 건보료 정산 시점에 노출." },
];

export default function SideJob2026Page() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd data={[
 breadcrumbLd([{ name: "홈", path: "/" }, { name: "2026 부업 가이드", path: "/side-job-2026" }]),
 faqLd(FAQ_ITEMS),
 howToLd({ name: "부업 시작 4단계", description: "회사 규정 확인부터 합법 신고까지", totalTime: "P3M", steps: STEPS }),
 articleLd({ title: "2026 부업·N잡 시작 가이드", description: "직장인 부업 세금·신고·추천", slug: "side-job-2026", publishedDate: "2026-04-30" }),
 speakableLd({ url: "/side-job-2026", cssSelectors: [".faq-answer"] }),
 ]} />
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <Sparkles className="w-4 h-4" /> 부업·N잡 가이드
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 2026 <span className="text-electric">부업·N잡</span> 시작 가이드
 </h1>
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 회사 규정·세금·신고까지. 부업 시작 전 꼭 알아야 할 사항.
 </p>
 </div>

 <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
 <Link href="/calc/side-job-income-tax" className="bg-primary p-6 rounded-2xl text-navy hover:opacity-90 transition group">
 <Calculator className="w-5 h-5 mb-2" />
 <p className="text-2xl font-black mb-1">부업 세금 시뮬</p>
 <p className="text-sm opacity-80">본업 + 부업 합산 종소세</p>
 <ArrowRight className="w-5 h-5 mt-3 group-hover:translate-x-1 transition" />
 </Link>
 <Link href="/calc/freelance-tax-quick" className="bg-white border border-canvas p-6 rounded-2xl hover:border-electric transition group">
 <Calculator className="w-5 h-5 mb-2 text-electric" />
 <p className="text-2xl font-black text-navy mb-1">프리랜서 종소세</p>
 <p className="text-sm text-muted-blue">5월 신고 환급 미리보기</p>
 <ArrowRight className="w-5 h-5 mt-3 text-electric group-hover:translate-x-1 transition" />
 </Link>
 </section>

 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">💼 인기 부업 5종</h2>
 <div className="bg-white border border-canvas rounded-2xl p-6 overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-3 py-2 text-left font-black text-navy">부업</th>
 <th className="px-3 py-2 text-left font-black text-navy">플랫폼</th>
 <th className="px-3 py-2 text-right font-black text-navy">소요 시간</th>
 <th className="px-3 py-2 text-right font-black text-navy">예상 수입</th>
 </tr>
 </thead>
 <tbody>
 {SIDE_JOBS.map((j) => (
 <tr key={j.name} className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue font-black">{j.name}</td>
 <td className="px-3 py-2 text-xs text-muted-blue">{j.note}</td>
 <td className="px-3 py-2 text-right text-navy">{j.time}</td>
 <td className="px-3 py-2 text-right font-black text-electric">{j.income}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </section>

 <section className="mb-10">
 <h2 className="text-2xl font-black text-navy mb-5">🚀 부업 시작 4단계</h2>
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

 <RelatedCalculators currentPath="/side-job-2026" />
 </div>
 </main>
 );
}
