// src/app/social-insurance-rates-2026/page.tsx
// 2026 4대보험 요율 종합

import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowRight, Calculator } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 4대보험 요율표 — 국민연금·건강보험·고용보험·산재보험",
 description:
 "2026년 4대보험 요율 한 페이지. 국민연금 9%, 건강보험 7.09%, 장기요양보험, 고용보험, 산재보험 본인·회사 부담률과 월급별 보험료 시뮬.",
 path: "/social-insurance-rates-2026",
 keywords: [
 "2026 4대보험",
 "국민연금 요율",
 "건강보험 요율",
 "고용보험 요율",
 "장기요양보험",
 "보험료 계산",
 ],
});

const FAQ_ITEMS = [
 {
 question: "4대보험 본인 부담은 월급의 몇 %인가요?",
 answer:
 "본인 부담은 월급(보수월액)의 약 9.4% 수준입니다. 국민연금 4.5% + 건강보험 3.545% + 장기요양 약 0.46% + 고용보험 0.9% = 약 9.4%. 산재보험은 회사가 100% 부담합니다.",
 },
 {
 question: "건강보험료는 7월에 왜 갑자기 늘어나나요?",
 answer:
 "건강보험료는 작년 보수 기준으로 미리 떼는 임시 금액. 4월에 작년 실제 소득이 확정되면 차액을 7월 한 달에 정산합니다. 작년 임금 인상·성과급이 컸다면 7월 정산금이 큽니다 (분납 5회 신청 가능).",
 },
 {
 question: "지역가입자 보험료는 어떻게 계산되나요?",
 answer:
 "지역가입자(직장인이 아닌 사람)는 소득·재산·자동차를 종합한 점수 기반. 자가 1채 + 자동차 + 예금 있으면 월 30~80만 부담. 직장가입자보다 부담 큰 경우가 많아 배우자 피부양자 등재가 유리합니다.",
 },
];

const INSURANCE_RATES = [
 {
 name: "국민연금",
 totalRate: "9.0%",
 selfRate: "4.5%",
 companyRate: "4.5%",
 base: "보수월액 기준 (상한 590만)",
 purpose: "노후 연금 (65세부터 수령)",
 },
 {
 name: "건강보험",
 totalRate: "7.09%",
 selfRate: "3.545%",
 companyRate: "3.545%",
 base: "보수월액",
 purpose: "의료비 보장",
 },
 {
 name: "장기요양보험",
 totalRate: "건강보험의 12.95%",
 selfRate: "약 0.4591%",
 companyRate: "약 0.4591%",
 base: "건강보험료 기준",
 purpose: "노인 장기요양 서비스",
 },
 {
 name: "고용보험",
 totalRate: "1.95~2.7%",
 selfRate: "0.9%",
 companyRate: "1.05~1.65% (회사 규모별)",
 base: "보수월액",
 purpose: "실업급여·고용안정",
 },
 {
 name: "산재보험",
 totalRate: "업종별 (평균 1.4%)",
 selfRate: "0%",
 companyRate: "100% (업종별 차등)",
 base: "보수월액",
 purpose: "업무 중 재해 보장",
 },
];

const SAMPLE_SALARIES = [
 { salary: 30000000, monthly: 2500000 },
 { salary: 50000000, monthly: 4166667 },
 { salary: 70000000, monthly: 5833333 },
 { salary: 100000000, monthly: 8333333 },
];

function calculateInsurance(monthly: number) {
 const pension = Math.floor((monthly * 0.045) / 10) * 10;
 const health = Math.floor((monthly * 0.03545) / 10) * 10;
 const longTermCare = Math.floor((health * 0.1295) / 10) * 10;
 const employment = Math.floor((monthly * 0.009) / 10) * 10;
 const total = pension + health + longTermCare + employment;
 return { pension, health, longTermCare, employment, total };
}

export default function SocialInsuranceRates2026Page() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "2026 4대보험 요율", path: "/social-insurance-rates-2026" },
 ]),
 faqLd(FAQ_ITEMS),
 speakableLd({
 url: "/social-insurance-rates-2026",
 cssSelectors: [".faq-answer"],
 }),
 ]}
 />

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
 <Shield className="w-4 h-4" />
 2026년 기준
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 2026 4대보험 <span className="text-electric">요율표</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 국민연금·건강보험·고용보험·산재보험 본인·회사 부담률과
 연봉별 월 보험료 시뮬을 한 페이지에서.
 </p>
 </div>

 {/* 보험별 요율 */}
 <section className="mb-12 space-y-3">
 {INSURANCE_RATES.map((insurance) => (
 <div
 key={insurance.name}
 className="p-6 bg-white rounded-2xl border border-canvas-200"
 >
 <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
 <div>
 <h2 className="text-lg font-black text-navy">{insurance.name}</h2>
 <p className="text-xs text-faint-blue mt-1">{insurance.purpose}</p>
 </div>
 <div className="text-right">
 <p className="text-2xl font-black text-electric">{insurance.totalRate}</p>
 <p className="text-xs text-faint-blue">총 요율</p>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-3 mt-4">
 <div className="p-3 bg-canvas rounded-xl">
 <p className="text-xs text-faint-blue mb-1">본인 부담</p>
 <p className="font-bold text-navy">{insurance.selfRate}</p>
 </div>
 <div className="p-3 bg-canvas rounded-xl">
 <p className="text-xs text-faint-blue mb-1">회사 부담</p>
 <p className="font-bold text-navy">{insurance.companyRate}</p>
 </div>
 </div>
 <p className="text-xs text-muted-blue mt-3 leading-relaxed">
 <strong className="text-navy">기준:</strong> {insurance.base}
 </p>
 </div>
 ))}
 </section>

 <InArticleAd />

 {/* 연봉별 시뮬 */}
 <section className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
 <h2 className="text-xl sm:text-2xl font-black text-navy mb-2">
 연봉별 월 4대보험료 시뮬
 </h2>
 <p className="text-sm text-faint-blue mb-6">
 본인 부담 기준. 회사 부담은 별도.
 </p>
 <div className="overflow-x-auto">
 <table className="w-full text-xs sm:text-sm">
 <thead>
 <tr className="border-b-2 border-canvas-200">
 <th className="py-3 px-2 text-left text-navy font-bold">연봉</th>
 <th className="py-3 px-2 text-right text-navy font-bold">국민연금</th>
 <th className="py-3 px-2 text-right text-navy font-bold">건강+장기</th>
 <th className="py-3 px-2 text-right text-navy font-bold">고용</th>
 <th className="py-3 px-2 text-right text-navy font-bold">합계</th>
 </tr>
 </thead>
 <tbody>
 {SAMPLE_SALARIES.map(({ salary, monthly }) => {
 const ins = calculateInsurance(monthly);
 return (
 <tr key={salary} className="border-b border-canvas">
 <td className="py-3 px-2 font-bold text-navy">
 {(salary / 10000).toLocaleString("ko-KR")}만
 </td>
 <td className="py-3 px-2 text-right text-muted-blue font-mono">
 {ins.pension.toLocaleString("ko-KR")}
 </td>
 <td className="py-3 px-2 text-right text-muted-blue font-mono">
 {(ins.health + ins.longTermCare).toLocaleString("ko-KR")}
 </td>
 <td className="py-3 px-2 text-right text-muted-blue font-mono">
 {ins.employment.toLocaleString("ko-KR")}
 </td>
 <td className="py-3 px-2 text-right font-bold text-electric font-mono">
 {ins.total.toLocaleString("ko-KR")}원
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 <div className="mt-4 p-3 bg-canvas rounded-xl">
 <p className="text-xs text-muted-blue">
 ※ 본인 부담만 표시. 회사 부담은 별도 (산재보험 100% 회사). 정확한 금액은 비과세 항목·세부 조건에 따라 다름.
 </p>
 </div>
 </section>

 {/* CTA */}
 <Link
 href="/"
 className="block mb-12 p-6 sm:p-8 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors group"
 >
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm font-bold opacity-90 mb-2">정확한 보험료 계산</p>
 <h3 className="text-xl sm:text-2xl font-black mb-2">
 내 연봉의 4대보험료 자세히 보기
 </h3>
 <p className="text-sm opacity-90">
 비과세 식대 20만 + 부양가족 반영 정확 계산
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

 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />

 <RelatedCalculators currentPath="/social-insurance-rates-2026" />

 <div className="mt-8">
 <HomeTopAd />
 </div>
 </div>
 </main>
 );
}
