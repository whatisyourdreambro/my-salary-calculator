// src/app/samsung-negotiation-2026/page.tsx
// 삼성전자 2026 임금협상(5월 12일 본격 시작) 시즌 랜딩.
// 반도체 가이드 7개로 깊은 회유, 회사 페이지 2개로 추가 트래픽 분산.

import type { Metadata } from "next";
import Link from "next/link";
import {
 TrendingUp,
 ArrowRight,
 Calculator,
 Building2,
 BookOpen,
 BarChart3,
} from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import PublishedMeta from "@/components/PublishedMeta";
import { breadcrumbLd, faqLd, articleLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";

export const metadata: Metadata = buildPageMetadata({
 title: "삼성전자 2026 임금협상 - 5월 12일 본격 시작, 인상률·OPI·복지 핵심 쟁점",
 description:
 "2026년 5월 12일 본격 교섭에 들어간 삼성전자 노사 임금협상. 5가지 핵심 쟁점, 직급별 예상 인상폭, SK하이닉스 비교까지 모두 정리.",
 path: "/samsung-negotiation-2026",
 keywords: [
 "삼성전자 임금협상 2026",
 "삼성전자 임단협",
 "삼성전자 노사협상",
 "OPI 성과급",
 "TAI 성과급",
 "삼성전자 인상률",
 "SK하이닉스 PS 비교",
 ],
 ogType: "article",
 publishedTime: "2026-05-12",
 modifiedTime: "2026-05-12",
});

const KEY_ISSUES = [
 {
 title: "쟁점 1. 기본급 인상률",
 body:
 "노조 7~9% 요구 vs 사측 3~5% 제시. 메모리 호황·HBM3E 매출로 노조 요구안 상향 가능성. 합의선 추정: 5.0~6.5%.",
 },
 {
 title: "쟁점 2. OPI 산정 기준",
 body:
 "DS부문 영업이익 기반. 일부 사업부 2025년 OPI가 연봉 50%(기본급 1000%)에 근접. 산정 베이스 통상임금 확대 여부가 핵심.",
 },
 {
 title: "쟁점 3. TAI 통합 논의",
 body:
 "반기 KPI 평가 기반의 TAI를 OPI와 통합·단순화하자는 노조 요구. 직원 예측 가능성 제고 효과.",
 },
 {
 title: "쟁점 4. 복지포인트·학자금",
 body:
 "복지포인트 확대, 자녀 학자금 범위, 사내 병원 이용 등 비현금 복지. 30~40대 직원 체감도 큰 항목.",
 },
 {
 title: "쟁점 5. 단협 적용 범위",
 body:
 "노조 가입률 약 25% 추정. 단체협약 조항이 비조합원에 자동 적용되는 범위가 인사·노조 쟁점.",
 },
];

const SALARY_INCREASE_TABLE = [
 { rank: "사원 (5,500만원)", p5: "5,775만원", p6: "5,830만원", p7: "5,885만원" },
 { rank: "대리 (7,500만원)", p5: "7,875만원", p6: "7,950만원", p7: "8,025만원" },
 { rank: "책임 (1억원)", p5: "1억 500만원", p6: "1억 600만원", p7: "1억 700만원" },
 { rank: "수석 (1.4억원)", p5: "1억 4,700만원", p6: "1억 4,840만원", p7: "1억 4,980만원" },
];

const RELATED_GUIDES = [
 {
 slug: "samsung-wage-negotiation-2026",
 title: "삼성전자 2026 임금협상 심층 분석",
 description: "5가지 핵심 쟁점, 직급별 예상 인상폭, 소급분 가계 준비.",
 emoji: "📊",
 },
 {
 slug: "sk-hynix-wage-2026",
 title: "SK하이닉스 2026 PS·임금 분석",
 description: "PS 1,500% 시대의 임단협 변수와 받고 나면 할 3가지.",
 emoji: "💰",
 },
 {
 slug: "samsung-hynix-2026-deepdive",
 title: "삼성 vs SK하이닉스 종합 보상 비교",
 description: "호황기·다운사이클까지 양대 반도체 보상 구조 종합.",
 emoji: "⚖️",
 },
 {
 slug: "semiconductor-performance-bonus-tax",
 title: "반도체 성과급 세금 완벽 가이드",
 description: "OPI·PS·PI 누진세율과 IRP·ISA 4가지 절세 전략.",
 emoji: "🧾",
 },
 {
 slug: "hbm-supercycle-worker-2026",
 title: "HBM 슈퍼사이클과 직장인 자산 시나리오",
 description: "강세/조정/다운사이클 3가지 시나리오별 자산 배분 가이드.",
 emoji: "🚀",
 },
 {
 slug: "semiconductor-entry-salary-2026",
 title: "반도체 신입 학사·석사·박사 초봉",
 description: "5,300만원 ~ 1억원의 학력별 격차와 5년 누적 보상.",
 emoji: "🎓",
 },
 {
 slug: "chip-rsu-stock-tax-2026",
 title: "우리사주·RSU·자사주 절세 통합 가이드",
 description: "매수·매도 시점별 세금과 4가지 절세 원칙.",
 emoji: "💼",
 },
];

const FAQ_ITEMS = [
 {
 question: "삼성전자 2026 임금협상은 언제 시작했나요?",
 answer:
 "2026년 5월 12일 본격 본교섭이 개시됐습니다. 노조 측 요구안 제시와 사측 제시안 교환을 시작으로 통상 6~8주에 걸쳐 5~10차 본교섭을 거쳐 잠정 합의에 도달합니다. 과거 패턴상 최종 타결은 6~8월, 소급 적용은 1월 1일자입니다.",
 },
 {
 question: "예상 인상률은 얼마인가요?",
 answer:
 "2025년 임단협에서는 약 5%대에서 타결됐습니다. 2026년은 메모리 호황과 HBM3E 매출 본격 반영으로 노조 요구안이 7~9%대로 상향될 가능성이 있어 합의선은 5.0~6.5% 정도로 추정됩니다.",
 },
 {
 question: "OPI와 TAI는 무엇이 다른가요?",
 answer:
 "OPI(Operating Profit Incentive, 초과이익성과금)는 사업부 영업이익 기반으로 연 1회 지급되며 기본급의 배수로 환산됩니다. TAI(Target Achievement Incentive, 목표달성장려금)는 반기 단위 KPI 평가 기반으로 연 2회 지급됩니다. 노조는 두 제도를 통합·단순화하자는 요구를 지속하고 있습니다.",
 },
 {
 question: "소급분은 언제, 얼마나 들어오나요?",
 answer:
 "잠정합의가 6~8월에 이뤄지면 1월부터 합의 시점까지 5~8개월치가 한 번에 입금됩니다. 합의 인상률이 5%일 경우, 연봉 1억원 직원 기준 약 200~300만원 수준의 일시 입금이 발생합니다.",
 },
 {
 question: "SK하이닉스 PS와 비교하면 어떤가요?",
 answer:
 "SK하이닉스 PS는 영업이익 기반으로 연 1회 지급되며 2024~2025년 호황기에는 기본급 기준 1,500% 수준이었습니다. 삼성전자 OPI는 연봉의 50% 수준이었으며, 회사별 산정 방식 차이로 단순 비교는 어렵습니다. 자세한 비교는 '삼성 vs SK하이닉스 종합 보상 비교' 가이드를 참고하세요.",
 },
];

export default function SamsungNegotiation2026Page() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "삼성전자 2026 임금협상", path: "/samsung-negotiation-2026" },
 ]),
 faqLd(FAQ_ITEMS),
 articleLd({
 title: "삼성전자 2026 임금협상 - 5월 12일 본격 시작",
 description: "5가지 핵심 쟁점, 직급별 예상 인상폭, 소급분 가계 준비까지",
 slug: "samsung-negotiation-2026",
 publishedDate: "2026-05-12",
 modifiedDate: "2026-05-12",
 }),
 speakableLd({
 url: "/samsung-negotiation-2026",
 cssSelectors: [".faq-answer", ".guide-tldr"],
 }),
 ]}
 />

 <div className="page-width">
 {/* Hero */}
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
 <TrendingUp className="w-4 h-4" />
 <time dateTime="2026-05-12">2026년 5월 12일 본격 협상 시작</time>
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 삼성전자 2026 <span className="text-electric">임금협상</span> 가이드
 </h1>
 <PublishedMeta publishedDate="2026-05-12" className="mb-2" />
 <p className="guide-tldr text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 매출 300조·영업이익 50조원대 회복 시점의 임단협. <br />
 5가지 핵심 쟁점, 직급별 예상 인상폭, SK하이닉스 비교까지 한눈에.
 </p>
 </div>

 {/* Key Issues */}
 <section className="mb-12">
 <h2 className="text-xl font-black text-navy mb-6 flex items-center gap-2">
 <BarChart3 className="w-5 h-5 text-electric" />
 노사 핵심 쟁점 5가지
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {KEY_ISSUES.map((issue, idx) => (
 <div
 key={issue.title}
 className="p-5 bg-white rounded-2xl border border-canvas-200"
 >
 <div className="flex items-start gap-3">
 <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-electric-10 flex items-center justify-center font-black text-electric text-sm">
 {idx + 1}
 </div>
 <div>
 <p className="font-bold text-navy text-sm mb-2">{issue.title}</p>
 <p className="text-xs text-muted-blue leading-relaxed">{issue.body}</p>
 </div>
 </div>
 </div>
 ))}
 </div>
 </section>

 {/* Salary Increase Table */}
 <section className="mb-12">
 <h2 className="text-xl font-black text-navy mb-6">직급별 예상 인상폭</h2>
 <div className="overflow-x-auto rounded-2xl border border-canvas-200">
 <table className="w-full text-sm bg-white">
 <thead className="bg-canvas">
 <tr>
 <th className="p-4 text-left font-bold text-navy">직급(2025 연봉)</th>
 <th className="p-4 text-left font-bold text-navy">5% 인상</th>
 <th className="p-4 text-left font-bold text-navy">6% 인상</th>
 <th className="p-4 text-left font-bold text-electric">7% 인상</th>
 </tr>
 </thead>
 <tbody>
 {SALARY_INCREASE_TABLE.map((row) => (
 <tr key={row.rank} className="border-t border-canvas-200">
 <td className="p-4 font-semibold text-navy">{row.rank}</td>
 <td className="p-4 text-muted-blue">{row.p5}</td>
 <td className="p-4 text-muted-blue">{row.p6}</td>
 <td className="p-4 font-bold text-electric">{row.p7}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <p className="text-xs text-muted-blue mt-3">
 ※ 기본 연봉만 반영. OPI/TAI 성과급은 별도. 합의 후 1월 1일자 소급 적용 시 일시 입금.
 </p>
 </section>

 <InArticleAd />

 {/* Related Guides Grid */}
 <section className="mb-12">
 <h2 className="text-xl font-black text-navy mb-6 flex items-center gap-2">
 <BookOpen className="w-5 h-5 text-electric" />
 반도체 직장인 심층 가이드 7편
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
 {RELATED_GUIDES.map((g) => (
 <Link
 key={g.slug}
 href={`/guides/${g.slug}`}
 className="group flex flex-col p-5 bg-white rounded-2xl border border-canvas-200 hover:border-electric hover:shadow-md transition-all"
 >
 <span className="text-2xl mb-3">{g.emoji}</span>
 <h3 className="font-bold text-navy text-sm mb-2 leading-tight group-hover:text-electric transition-colors">
 {g.title}
 </h3>
 <p className="text-xs text-muted-blue leading-relaxed mb-4 flex-1">
 {g.description}
 </p>
 <div className="flex items-center gap-1 text-xs font-bold text-electric mt-auto">
 자세히 읽기
 <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
 </div>
 </Link>
 ))}
 </div>
 </section>

 {/* Company Profile CTAs */}
 <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-4">
 <Link
 href="/company/samsung-electronics"
 className="block p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
 >
 <Building2 className="w-8 h-8 opacity-70 mb-3" />
 <h3 className="text-lg font-black mb-2">삼성전자 회사 프로필</h3>
 <p className="text-sm opacity-90">
 평균 연봉 1.35억, 직급별 성장표, OPI·TAI 복지 정보
 </p>
 </Link>
 <Link
 href="/company/sk-hynix"
 className="block p-6 bg-navy rounded-3xl text-white hover:bg-navy/90 transition-colors"
 >
 <Building2 className="w-8 h-8 opacity-70 mb-3" />
 <h3 className="text-lg font-black mb-2">SK하이닉스 회사 프로필</h3>
 <p className="text-sm opacity-90">
 평균 연봉 1.4억, PS 1,500% 사례, 해피프라이데이 복지
 </p>
 </Link>
 </section>

 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />

 {/* Calculator CTA */}
 <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
 <Link
 href="/"
 className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
 >
 <Calculator className="w-8 h-8 text-electric mb-3" />
 <h3 className="text-lg font-black mb-2">실수령액 계산</h3>
 <p className="text-sm text-muted-blue">
 인상된 연봉의 세후 월급 즉시 확인
 </p>
 </Link>
 <Link
 href="/calc/samsung-bonus"
 className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
 >
 <Calculator className="w-8 h-8 text-electric mb-3" />
 <h3 className="text-lg font-black mb-2">삼성 OPI·TAI 계산기</h3>
 <p className="text-sm text-muted-blue">
 사업부·평가등급별 세후 실수령
 </p>
 </Link>
 </section>

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
 <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">
 {item.answer}
 </p>
 </details>
 ))}
 </div>
 </section>

 <RelatedCalculators currentPath="/samsung-negotiation-2026" />

 <div className="mt-8">
 <HomeTopAd />
 </div>
 </div>
 </main>
 );
}
