// src/app/unemployment-benefit-2026/page.tsx
// 실업급여 종합 시즌 페이지 — 한국 검색 트래픽 큰 풀(월 10만+) 직접 흡수.

import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Calculator, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
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
 title: "2026 실업급여 신청 가이드 — 자격·수급액·기간·신청 절차",
 description:
 "고용보험 가입 180일·비자발 퇴사 등 실업급여 자격, 일액 60% + 수급기간 120~270일 계산법, 워크넷 구직 등록부터 매월 실업 인정까지 5단계 절차.",
 path: "/unemployment-benefit-2026",
 keywords: [
 "실업급여 신청",
 "실업급여 자격",
 "실업급여 수급액",
 "실업급여 180일",
 "구직급여",
 "이직확인서",
 ],
});

const ELIGIBILITY = [
 { icon: "✅", title: "고용보험 가입 180일 이상", body: "퇴사 직전 18개월 안에 피보험단위기간 180일 이상 (근로일수 기준)." },
 { icon: "✅", title: "비자발적 퇴사", body: "권고사직, 회사 도산, 정년, 계약 만료. 자발 퇴사도 정당한 사유(임금 체불·괴롭힘) 인정 시 가능." },
 { icon: "✅", title: "적극적 구직 활동", body: "워크넷 구직 등록 + 매월 1~2회 구직 활동 증명 (입사 지원·면접·교육)." },
 { icon: "✅", title: "근로 의사·능력 있음", body: "질병·임신 등 즉시 취업 불가 시 수급 보류. 회복 후 재신청 가능." },
];

const STEPS = [
 { name: "Step 1. 워크넷 구직 등록", text: "퇴사 직후 워크넷(work.go.kr) 구직 등록. 구직 등록 없이는 실업 인정 불가." },
 { name: "Step 2. 거주지 고용센터 방문", text: "퇴사 12개월 이내 본인 거주지 관할 고용센터 방문. 수급자격 인정 신청서 + 이직확인서 + 신분증 제출." },
 { name: "Step 3. 수급자격 교육 이수", text: "2시간 온라인/집체 교육. 교육 없으면 수급 시작 안 됨." },
 { name: "Step 4. 매월 실업 인정일 출석", text: "4주마다 1회 출석 (1차 직접, 이후 온라인 가능). 구직 활동 증빙 제출." },
 { name: "Step 5. 수급액 입금", text: "실업 인정일 다음 영업일 본인 계좌로 28일치 입금." },
];

const FAQ_ITEMS = [
 {
 question: "실업급여를 받기 위한 최소 가입 기간은?",
 answer:
 "고용보험 피보험단위기간 180일 이상. '근속 180일'이 아닌 '근로일수 180일'. 단기 알바·계약직도 합산 가능. 18개월 안에 합산 180일이면 자격 충족.",
 },
 {
 question: "자발적 퇴사는 무조건 실업급여를 못 받나요?",
 answer:
 "원칙은 그렇지만 정당한 사유 인정 시 가능. 임금 체불 2개월 이상, 직장 내 괴롭힘 증거, 통근 1.5시간 이상 곤란, 가족 간병, 질병으로 인한 근로 곤란 등. 증거 자료 충분히 준비 필수.",
 },
 {
 question: "수급액은 어떻게 결정되나요?",
 answer:
 "일 평균임금 × 60% (상한 약 68,000원/일·하한 약 65,792원/일, 2026 추정). 평균임금 = 퇴사 직전 3개월 임금 / 90일. 월급 350만이면 일 약 11.6만 → 60% = 7만이지만 상한 6.8만 적용.",
 },
 {
 question: "수급 기간은 며칠인가요?",
 answer:
 "가입기간(180일~10년+)과 연령(50세 미만/이상)에 따라 120~270일. 5년 근속 + 35세는 180일, 10년+ 50세 이상은 270일. 별도 수급기간 계산기 참고.",
 },
 {
 question: "수급 중 취업하면 어떻게 되나요?",
 answer:
 "잔여 수급일이 1/2 이상 남아있고 12개월 이상 근속 시 '조기재취업수당' (잔여액의 50% 일시 지급). 빠르게 재취업해도 손실 거의 없음.",
 },
 {
 question: "이직확인서가 안 와요. 어떻게 하죠?",
 answer:
 "회사가 이직확인서를 안 보내주면 본인이 급여명세서·근로계약서·통장 거래 내역으로 직접 증명 가능. 고용센터에 신고하면 회사에 강제 발급 요구.",
 },
];

export default function UnemploymentBenefit2026Page() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "2026 실업급여 신청 가이드", path: "/unemployment-benefit-2026" },
 ]),
 faqLd(FAQ_ITEMS),
 howToLd({
 name: "2026 실업급여 신청 5단계",
 description: "퇴사 후 워크넷 구직 등록부터 매월 실업 인정·수급액 입금까지 단계별 절차",
 totalTime: "P3M",
 steps: STEPS,
 }),
 articleLd({
 title: "2026 실업급여 신청 완벽 가이드",
 description: "자격·수급액·기간·신청 절차",
 slug: "unemployment-benefit-2026",
 publishedDate: "2026-04-30",
 }),
 speakableLd({
 url: "/unemployment-benefit-2026",
 cssSelectors: [".faq-answer"],
 }),
 ]}
 />

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-4">
 <ShieldCheck className="w-4 h-4" />
 정부지원금 가이드
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-3">
 2026 <span className="text-electric">실업급여</span> 신청 가이드
 </h1>
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 자격 조건 + 수급액 + 수급기간 + 신청 절차까지.<br />
 받을 수 있는 권리, 평균 1,200만원을 놓치지 마세요.
 </p>
 </div>

 {/* 빠른 도구 진입 */}
 <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
 <Link href="/calc/unemployment-benefit-amount" className="bg-primary p-6 rounded-2xl text-navy hover:opacity-90 transition group">
 <div className="flex items-center gap-3 mb-2">
 <Calculator className="w-5 h-5" />
 <p className="text-xs font-black uppercase tracking-widest">계산기 1</p>
 </div>
 <p className="text-2xl font-black mb-1">수급액 계산기</p>
 <p className="text-sm opacity-80">평균임금 × 60% (상하한 적용)</p>
 <ArrowRight className="w-5 h-5 mt-3 group-hover:translate-x-1 transition" />
 </Link>
 <Link href="/calc/unemployment-benefit-period" className="bg-white border border-canvas p-6 rounded-2xl hover:border-electric transition group">
 <div className="flex items-center gap-3 mb-2 text-electric">
 <Calculator className="w-5 h-5" />
 <p className="text-xs font-black uppercase tracking-widest">계산기 2</p>
 </div>
 <p className="text-2xl font-black text-navy mb-1">수급기간 계산기</p>
 <p className="text-sm text-muted-blue">120~270일 (가입기간×연령)</p>
 <ArrowRight className="w-5 h-5 mt-3 text-electric group-hover:translate-x-1 transition" />
 </Link>
 </section>

 {/* 자격 조건 */}
 <section className="mb-12">
 <h2 className="text-2xl font-black text-navy mb-5 flex items-center gap-2">
 <ShieldCheck className="w-6 h-6 text-electric" />
 받을 수 있는 사람 — 4가지 조건
 </h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {ELIGIBILITY.map((e) => (
 <div key={e.title} className="bg-white p-5 rounded-2xl border border-canvas">
 <p className="text-2xl mb-2">{e.icon}</p>
 <p className="text-base font-black text-navy mb-1">{e.title}</p>
 <p className="text-sm text-muted-blue">{e.body}</p>
 </div>
 ))}
 </div>
 </section>

 {/* 수급액 표 */}
 <section className="mb-12">
 <h2 className="text-2xl font-black text-navy mb-5">💰 수급액 — 평균임금 60%</h2>
 <div className="bg-white border border-canvas rounded-2xl p-6">
 <p className="text-sm text-muted-blue mb-4">
 일 수급액 = 평균임금 × 60% (상한 약 68,000원·하한 약 65,792원, 2026 추정)
 </p>
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-3 py-2 text-left font-black text-navy">월급</th>
 <th className="px-3 py-2 text-right font-black text-navy">일 수급액</th>
 <th className="px-3 py-2 text-right font-black text-navy">월 수급액 (30일)</th>
 </tr>
 </thead>
 <tbody>
 {[2_000_000, 2_500_000, 3_000_000, 3_500_000, 4_000_000, 5_000_000].map((m) => {
 const dailyAvg = m / 30;
 const daily = Math.min(68_000, Math.max(65_792, Math.round(dailyAvg * 0.6)));
 return (
 <tr key={m} className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue">{(m / 10000).toLocaleString("ko-KR")}만원</td>
 <td className="px-3 py-2 text-right font-black text-navy tabular-nums">{daily.toLocaleString("ko-KR")}원</td>
 <td className="px-3 py-2 text-right font-black text-electric tabular-nums">{(daily * 30).toLocaleString("ko-KR")}원</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </section>

 {/* 수급기간 */}
 <section className="mb-12">
 <h2 className="text-2xl font-black text-navy mb-5">⏱️ 수급기간 — 가입기간 × 연령</h2>
 <div className="bg-white border border-canvas rounded-2xl p-6">
 <table className="w-full text-sm">
 <thead className="bg-canvas-dark">
 <tr>
 <th className="px-3 py-2 text-left font-black text-navy">가입기간</th>
 <th className="px-3 py-2 text-right font-black text-navy">50세 미만</th>
 <th className="px-3 py-2 text-right font-black text-navy">50세 이상·장애인</th>
 </tr>
 </thead>
 <tbody>
 {[
 ["1년 미만", "120일", "120일"],
 ["1~3년", "150일", "180일"],
 ["3~5년", "180일", "210일"],
 ["5~10년", "210일", "240일"],
 ["10년 이상", "240일", "270일"],
 ].map(([a, b, c]) => (
 <tr key={a} className="border-t border-canvas">
 <td className="px-3 py-2 text-muted-blue">{a}</td>
 <td className="px-3 py-2 text-right font-black text-navy tabular-nums">{b}</td>
 <td className="px-3 py-2 text-right font-black text-electric tabular-nums">{c}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </section>

 {/* 신청 절차 */}
 <section className="mb-12">
 <h2 className="text-2xl font-black text-navy mb-5">🚀 신청 절차 5단계</h2>
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

 {/* 자주 묻는 질문 */}
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

 {/* 거부되는 케이스 경고 */}
 <section className="mb-12 p-6 bg-electric/5 border border-electric/20 rounded-2xl">
 <h2 className="text-lg font-black text-navy mb-3 flex items-center gap-2">
 <AlertCircle className="w-5 h-5 text-electric" />
 자주 거부되는 케이스
 </h2>
 <ul className="space-y-2 text-sm text-muted-blue">
 <li>• 자발적 퇴사 + 정당한 사유 미인정 (회사가 싫어서·연봉이 낮아서 등은 불인정)</li>
 <li>• 이직확인서 미제출 → 본인이 증빙 자료(급여명세서)로 신청 가능</li>
 <li>• 형식적 입사 지원 (구직 활동 부실) → 부정수급으로 환수</li>
 <li>• 퇴직 후 12개월 경과 → 권리 소멸</li>
 </ul>
 </section>

 <RelatedCalculators currentPath="/unemployment-benefit-2026" />
 </div>
 </main>
 );
}
