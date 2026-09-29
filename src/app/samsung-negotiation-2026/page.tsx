// src/app/samsung-negotiation-2026/page.tsx
// 삼성전자 2026 임금협상(2025-12-11 상견례·12-16 1차 본교섭 → 5월 20일 잠정합의 → 5월 27일 가결·조인식) 시즌 랜딩.
// 반도체 가이드 7개로 깊은 회유, 회사 페이지 2개로 추가 트래픽 분산.
//
// 2026-09-27 타결 결과 반영 (협상 전 시점 문구 정정):
//  - 투표·조인식: 삼성전자 뉴스룸 2026-05-27 '삼성전자 노사, 2026년 임금협약 체결' — 5월 20일 밤 잠정합의,
//    5월 22일 14시~27일 10시 조합원 찬반투표 투표 95.5%·찬성 73.7% 가결, 5월 27일 조인식.
//  - 인상률 6.2%(기본 4.1% + 성과 평균 2.1%)·3월 급여부터 소급·셀러리캡·DS부문 특별경영성과급·DX 자사주는
//    회사·노조 발표를 인용한 보도 기준(주간경향 2026-05-21, 오피니언뉴스 2026-05-20, MTN 2026-05-20) —
//    src/data/seedCompanies.ts 삼성전자 설명과 같은 값.
//  - 광고 위 문구(히어로 날짜 배지·쟁점 1 카드 끝 문장)는 줄 수 불변 폭 맞춤. 쟁점 카드 끝 구절은 문단 끝이라
//    끝 구절 전체 폭만 맞추면 된다(-0.30px, 320~1440px 1px 간격 + 1536·1920 전 폭 높이 불변 확인).
//    결과 요약은 마지막 광고(HomeTopAd) 아래에만 둔다.
//  - 메타 제목·설명 교체는 R6-06 규칙의 이 URL 35일 1회 교정으로 기록한다(T0 = 배포일, 다음 메타 변경은
//    T0+35 판독 뒤). og:title 은 buildPageMetadata 가 title 에서 만든다(따로 두지 않음).
//
// 2026-09-30 후속 정정 (R8-B 후속, dedupe 12 — 접힌 FAQ 와 마지막 광고 아래 요약만, 광고 위 무접촉):
//  - 협상 시작: 5월 12일은 본교섭 시작이 아니다 — 2025-12-11 상견례, 12-16 1차 본교섭, 2-19 결렬, 3-3 중노위 조정 중지,
//    5/11~12 1차 사후조정(13일 새벽 결렬), 5/18~20 2차 사후조정 결렬, 5/20 고용노동부 장관 중재 잠정합의
//    (파이낸셜뉴스 2026-05-27 일지 보도, 투표·조인식은 삼성전자 뉴스룸).
//  - 특별경영성과급: 재원은 노사가 합의한 DS부문 사업성과의 10.5%(상한 없음), 지급 조건 DS부문 연간 영업이익
//    2026~2028년 200조원·2029~2035년 100조원(파이낸셜뉴스 2026-09-27 보도) — 정본 FIXED_RERATE·getThreshold 와 테스트로 대조.
//  - SK하이닉스 PS: 2024년 실적분 1,500%, 2025년 실적분 2,964%(2026-02-05 지급) — 정본 psData PS_HISTORY 와 테스트로 대조.
//  - 인상폭 표 아래 주석(광고 위)의 1월 1일자 소급은 폭 맞춤 실패로 11/2(결정 12)로 넘기고, 요약의 시나리오 li 에서 3월 소급을 밝힌다.

import type { Metadata } from "next";
import ShareSection from "@/components/ShareSection";
import Link from "@/components/AppLink";
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
import { InArticleAd, HomeTopAd, GuideMidAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";

export const metadata: Metadata = buildPageMetadata({
 title: "삼성전자 2026 임금협상 타결 - 평균 6.2% 인상, 5/27 가결·특별성과급",
 description:
 "삼성전자 2026년 임금협약: 5월 20일 잠정합의, 5월 27일 조합원 투표 찬성 73.7%로 가결. 평균 6.2%(기본 4.1%+성과 2.1%) 인상·3월 급여부터 소급, DS부문 특별경영성과급 신설. 쟁점·직급별 인상폭·SK하이닉스 비교.",
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
 modifiedTime: "2026-09-27",
});

const KEY_ISSUES = [
 {
 title: "쟁점 1. 기본급 인상률",
 body:
 "노조 7~9% 요구 vs 사측 3~5% 제시. 메모리 호황·HBM3E 매출로 노조 요구안 상향 가능성. 타결 인상률: 평균 6.2%.",
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
 "2026년 임금교섭은 2025년 12월 11일 상견례와 12월 16일 1차 본교섭으로 시작됐습니다. 2026년 2월 19일 교섭 결렬, 3월 3일 중앙노동위원회 조정 중지 뒤 5월 11~12일 1차 사후조정(13일 새벽 결렬)과 5월 18~20일 2차 사후조정이 결렬됐고, 5월 20일 고용노동부 장관 중재 교섭에서 잠정합의안이 나왔습니다. 5월 22일부터 27일까지 진행된 조합원 찬반투표에서 투표율 95.5%, 찬성 73.7%로 가결돼 5월 27일 임금협약 조인식을 마쳤습니다(삼성전자 뉴스룸 2026년 5월 27일, 일정은 파이낸셜뉴스 2026-05-27 일지 보도 기준).",
 },
 {
 question: "예상 인상률은 얼마인가요?",
 answer:
 "5월 27일 가결된 2026년 임금협약의 평균 인상률은 6.2%(기본인상률 4.1% + 성과인상률 평균 2.1%)입니다(보도 기준). 협상 전 이 페이지는 합의선을 5.0~6.5%로 추정했는데, 합계 6.2%는 그 범위 안이지만 기본인상률만 보면 4.1%로 추정보다 낮았습니다. 개인별 인상률은 성과인상률이 평가에 따라 달라 사람마다 다릅니다.",
 },
 {
 question: "OPI와 TAI는 무엇이 다른가요?",
 answer:
 "OPI(Operating Profit Incentive, 초과이익성과금)는 사업부 영업이익 기반으로 연 1회 지급되며 기본급의 배수로 환산됩니다. TAI(Target Achievement Incentive, 목표달성장려금)는 반기 단위 KPI 평가 기반으로 연 2회 지급됩니다. 노조는 두 제도를 통합·단순화하자는 요구를 지속하고 있습니다.",
 },
 {
 question: "소급분은 언제, 얼마나 들어오나요?",
 answer:
 "2026년 임금 인상과 셀러리캡 상향은 2026년 3월 급여부터 소급 적용됩니다(보도 기준). 3월부터 협약 반영 전까지의 인상 차액이 한꺼번에 정산되는 구조이며, 실제 지급일과 금액은 회사 공지와 급여명세서로 확인하세요. 대략적인 크기는 '월 기본급 × 인상률 × 소급 개월 수'로 가늠할 수 있습니다.",
 },
 {
 question: "SK하이닉스 PS와 비교하면 어떤가요?",
 answer:
 "SK하이닉스 PS는 영업이익 기반으로 연 1회 지급되며 2024년 실적분은 기본급의 1,500%, 2025년 실적분은 2,964%(2026년 2월 5일 지급)였습니다(보도 기준). 삼성전자 OPI는 연봉의 50% 수준이었으며, 회사별 산정 방식 차이로 단순 비교는 어렵습니다. 자세한 비교는 '삼성 vs SK하이닉스 종합 보상 비교' 가이드를 참고하세요.",
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
 title: "삼성전자 2026 임금협상 타결 - 평균 6.2% 인상, 5월 27일 가결",
 description: "5월 20일 잠정합의·5월 27일 가결 결과, 5가지 핵심 쟁점, 직급별 인상폭, 소급분 가계 준비까지",
 slug: "samsung-negotiation-2026",
 url: "/samsung-negotiation-2026",
 publishedDate: "2026-05-12",
 modifiedDate: "2026-09-27",
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
 <time dateTime="2026-05-27">2026년 5월 27일 임금협약 가결</time>
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 삼성전자 2026 <span className="text-electric">임금협상</span> 가이드
 </h1>
 <PublishedMeta publishedDate="2026-05-12" updatedDate="2026-09-27" className="mb-2" />
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

 {/* 쟁점·인상표 섹션 경계 광고 — 전면 최적화 (운영자 지시 2026-09-02) */}
 <GuideMidAd />

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
 href="/salary-db/samsung-electronics"
 className="block p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
 >
 <Building2 className="w-8 h-8 opacity-70 mb-3" />
 <h3 className="text-lg font-black mb-2">삼성전자 회사 프로필</h3>
 <p className="text-sm opacity-90">
 평균 연봉 1.35억, 직급별 성장표, OPI·TAI 복지 정보
 </p>
 </Link>
 <Link
 href="/salary-db/sk-hynix"
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

 <ShareSection contentType="guide" className="mb-8" />
 <RelatedCalculators currentPath="/samsung-negotiation-2026" />

 <div className="mt-8">
 <HomeTopAd />
 </div>

 {/* 2026 임금협약 타결 결과 요약 — 마지막 광고(HomeTopAd) 아래에만 추가(2026-09-27). 광고 위 높이 불변.
 출처·검증 메모는 파일 머리 주석. 회사 발표(뉴스룸)와 보도 기준 항목을 구분해 적는다. */}
 <section className="mt-10 max-w-3xl mx-auto p-6 bg-white rounded-2xl border border-canvas-200">
 <h2 className="text-lg font-black text-navy mb-3">
 2026 임금협약 타결 결과 (5월 27일 가결)
 </h2>
 <ul className="text-sm text-muted-blue leading-relaxed space-y-2 list-disc pl-5">
 <li>
 <strong>일정</strong>: 2025년 12월 11일 상견례·12월 16일 1차 본교섭 → 2월 19일 결렬·3월 3일 중노위
 조정 중지 → 5월 11~12일·18~20일 사후조정 결렬 → 5월 20일 밤 고용노동부 장관 중재로 잠정합의 → 5월 22~27일
 조합원 찬반투표에서 투표율 95.5%, 찬성 73.7%로 가결 → 5월 27일 임금협약 조인식(투표·조인식은 삼성전자 뉴스룸,
 앞 일정은 파이낸셜뉴스 일지 보도 기준).
 </li>
 <li>
 <strong>임금 인상률</strong>: 평균 6.2%(기본인상률 4.1% + 성과인상률 평균 2.1%), 2026년
 3월 급여부터 소급 적용(보도 기준).
 </li>
 <li>
 <strong>셀러리캡 상향</strong>: CL2 8,000만원, CL3 1억 1,000만원, CL4 1억 3,000만원(개발·비개발
 통합)(보도 기준).
 </li>
 <li>
 <strong>DS부문 특별경영성과급 신설</strong>: 재원은 노사가 합의한 DS부문 사업성과의 10.5%(상한 없음)이고,
 2026~2028년 DS부문 연간 영업이익 200조원·2029~2035년 100조원 이상일 때만 지급됩니다. 세후 전액 자사주로
 지급하고 3분의 1은 바로, 나머지는 1년·2년 뒤 매각할 수 있습니다. DX부문·CSS사업팀은 600만원 상당
 자사주(보도 기준).
 </li>
 <li>
 위 쟁점 카드와 직급별 인상폭 표(5·6·7%)는 협상 전 시나리오입니다. 개인별 인상률은 성과인상률
 평가에 따라 평균 6.2%와 다를 수 있습니다. 표 아래 주석의 1월 1일자 소급도 협상 전 가정이며, 실제 소급은
 3월 급여부터입니다.
 </li>
 </ul>
 <p className="mt-4 text-xs text-muted-blue leading-relaxed">
 출처: 삼성전자 뉴스룸 「삼성전자 노사, 2026년 임금협약 체결」(2026-05-27, 투표 결과·조인식). 인상률·소급·셀러리캡·성과급
 세부는 회사·노조 발표를 인용한 2026년 5월 20~21일 보도 기준입니다(소급은 오피니언뉴스 2026-05-20). 협상 일정은
 파이낸셜뉴스 2026-05-27 일지, 특별경영성과급 지급 조건은 파이낸셜뉴스 2026-09-27 보도 기준입니다. 성과급 세후 금액은{" "}
 <Link href="/calc/samsung-bonus" className="text-electric font-bold hover:underline">
 삼성 OPI·TAI 계산기
 </Link>
 에서 계산할 수 있습니다.
 </p>
 </section>
 </div>
 </main>
 );
}
