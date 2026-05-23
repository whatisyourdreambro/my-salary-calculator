// src/app/retirement-pension-2026/page.tsx
// 2026 퇴직연금 종합 가이드 — DB·DC·IRP 비교

import type { Metadata } from "next";
import Link from "next/link";
import { PiggyBank, ArrowRight, Calculator } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import PublishedMeta from "@/components/PublishedMeta";
import { breadcrumbLd, faqLd, speakableLd, howToLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 퇴직연금 완벽 가이드 — DB·DC·IRP 차이와 선택법",
 description:
 "확정급여형(DB)·확정기여형(DC)·개인형퇴직연금(IRP) 차이와 운용 수익률, 세제 혜택. 본인에게 맞는 퇴직연금 선택법.",
 path: "/retirement-pension-2026",
 ogType: "article",
 publishedTime: "2026-02-01",
 modifiedTime: "2026-05-12",
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
 "DB(확정급여형)는 회사가 운용 책임 → 안정적이지만 수익률 낮음(연 2~3%). DC(확정기여형)는 본인이 운용 → 잘 굴리면 수익률 높음(5~10%), 책임 본인. 30대 이전 + 투자 자신 있으면 DC, 50대 이상 안정 우선이면 DB. 다만 회사가 DC만 운영하는 곳도 많아 선택 불가한 경우도 있습니다. 본인 회사의 옵션부터 확인하세요.",
 },
 {
 question: "퇴직 시 IRP로 옮겨야 하나요?",
 answer:
 "퇴직 시 일시 수령하면 퇴직소득세를 일시에 부담(연 5,000만원 퇴직금 기준 약 250~400만원). IRP로 이전 후 만 55세 이후 연금으로 분할 수령하면 연금소득세 3.3~5.5% 저세율 적용. 일시 수령 대비 약 70% 세금 절감 가능. 또한 IRP 계좌 내에서 운용 수익은 인출 시까지 과세이연.",
 },
 {
 question: "DC 운용은 어떻게 하나요?",
 answer:
 "회사 지정 운용기관(증권사·은행)에서 펀드·예금·ETF 선택. 일반 권장: 30~70% 위험자산(주식형·TDF) + 30~70% 안전자산(예금·채권). 단, DC는 위험자산 비중 70% 상한 규제. 20대~30대는 위험자산 70%, 40대 50%, 50대 30~40%로 점진 축소 권장. 분기별 점검 + 연 1회 리밸런싱.",
 },
 {
 question: "IRP 추가 납입은 얼마까지 가능한가요?",
 answer:
 "연 1,800만원까지 입금 가능하지만 세액공제 한도는 연 900만원 (연금저축 합산). 연봉 5,500만 이하는 16.5%, 초과는 13.2% 세액공제 (지방세 포함). 900만원 풀로 채우면 환급액 최대 148.5만원. 입금 후 운용 수익도 인출 시까지 과세이연되므로 일반 투자 대비 복리 효과↑.",
 },
 {
 question: "IRP 30% 안전자산 의무는 무엇인가요?",
 answer:
 "IRP는 퇴직급여보장법상 안전자산(예금·채권·TDF의 채권 부분) 비중을 30% 이상 유지해야 합니다. 위험자산(주식형 펀드·ETF)은 70%까지만. TDF(타겟데이트펀드)는 만기에 가까울수록 자동으로 채권 비중이 늘어나 30% 의무를 자연스럽게 충족합니다.",
 },
 {
 question: "55세 전 IRP를 인출하면 어떻게 되나요?",
 answer:
 "기타소득세 16.5% 일시 부과 + 그동안 받았던 세액공제도 환수. 예) 그동안 900만원 × 13.2% × 5년 = 약 594만원 세액공제 받았다면 모두 토해내야 함. 의료·재해·주택구입 등 법정 사유 외에는 만 55세까지 절대 인출 금지. IRP 가입 전 본인 5년+ 자금 여유 반드시 확인.",
 },
 {
 question: "DB에서 DC로 전환할 수 있나요?",
 answer:
 "회사 규정에 따라 가능하지만 일방향 전환만 허용되는 경우가 많습니다(DB→DC는 가능, DC→DB는 불가). 또한 전환 시점의 적립금 평가 방식 차이로 손실 가능성도 있어 신중 결정 필요. 일반적으로 입사 초기에 본인 운용 능력·시장 전망을 판단해 한 번 결정 후 유지하는 게 좋습니다.",
 },
 {
 question: "퇴직 시점에 시장이 안 좋으면 DC가 손해 아닌가요?",
 answer:
 "맞습니다. DC는 시장 변동성에 노출되므로 퇴직 5년 전부터 위험자산 비중을 30%까지 점진 축소 권장. 또는 TDF(타겟데이트펀드)에 일임하면 자동으로 안전자산 비중이 늘어나 시점 리스크를 자동 관리. 다만 DB는 회사가 약속한 금액 보장이라 시장과 무관.",
 },
 {
 question: "공무원·교사·군인 연금과 어떻게 다른가요?",
 answer:
 "공무원·교사·군인은 공무원연금공단/사학연금 등 별도 공적연금 가입(국민연금 X). 일반 직장인의 퇴직연금(DB/DC/IRP)과 구조 완전히 다르며 보장률·수령액도 다름. 본 가이드는 일반 직장인 퇴직연금 기준입니다.",
 },
 {
 question: "퇴직연금 가입 회사를 어떻게 확인하나요?",
 answer:
 "회사 인사팀 또는 사내 HR 시스템에서 (1) 퇴직급여 제도 종류(DB/DC), (2) 운용기관, (3) 본인 적립금·수익률 조회 가능. 미가입 회사는 회사가 직접 적립한 퇴직금(법정 퇴직금)만 받게 됨. 통합연금포털(www.fss.or.kr)에서 본인 모든 퇴직연금·연금저축 통합 조회도 가능.",
 },
];

const HOW_TO_STEPS = [
 {
 name: "1단계 — 본인 회사 제도 확인",
 text: "회사 인사팀에 (1) 퇴직급여 제도(DB/DC), (2) 운용기관 확인. DB만 있으면 선택 불가. DC가 있으면 본인 운용.",
 },
 {
 name: "2단계 — 본인 성향 판단",
 text: "투자 자신·여유시간 있으면 DC, 안정 우선·운용 모르면 DB. 20~30대는 DC, 50대는 DB가 일반적.",
 },
 {
 name: "3단계 — DC 선택 시 포트폴리오 구성",
 text: "20~30대: 위험자산 60~70% + 안전자산 30~40%. 40대: 50:50. 50대: 위험 30~40% + 안전 60~70%. TDF로 자동 운용도 옵션.",
 },
 {
 name: "4단계 — IRP 추가 가입 (절세)",
 text: "연 900만원 한도 세액공제. 연봉 5,500만 이하 16.5%, 초과 13.2%. 매월 자동이체로 자연스럽게 적립.",
 },
 {
 name: "5단계 — 퇴직 시 IRP 이전",
 text: "퇴직 시 일시 수령 X. IRP 계좌로 이전 → 만 55세 이후 연금으로 분할 수령(연금소득세 3.3~5.5%). 약 70% 세금 절감.",
 },
];

const AGE_RECOMMEND = [
 {
 age: "20대",
 strategy: "DC + IRP 풀 활용",
 detail:
 "위험자산 70% (주식형·TDF) + 안전자산 30%. IRP 연 900만 세액공제 최대 활용. 시간이 가장 큰 자산.",
 color: "#0145F2",
 },
 {
 age: "30대",
 strategy: "DC + IRP 적극 운용",
 detail:
 "위험자산 60~70%. 결혼·자녀 등 큰 지출 고려해 IRP 추가 납입 균형. 매년 리밸런싱.",
 color: "#7C83FF",
 },
 {
 age: "40대",
 strategy: "DC 50:50 + IRP 안정 강화",
 detail:
 "위험자산 50% + 안전자산 50%. IRP 안전 비중 늘림. 자녀 교육비 vs 노후 자금 균형.",
 color: "#F59E0B",
 },
 {
 age: "50대",
 strategy: "DC→DB 전환 검토 + IRP 안전",
 detail:
 "위험자산 30%+. DB 옵션 있다면 전환 검토. IRP는 안정성 우선 TDF로 일임도 옵션.",
 color: "#EF4444",
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
 howToLd({
 name: "퇴직연금 (DB·DC·IRP) 선택 5단계",
 description:
 "본인 회사 제도 확인부터 IRP 절세, 퇴직 시 이전까지 5단계 가이드.",
 steps: HOW_TO_STEPS,
 totalTime: "PT10M",
 }),
 speakableLd({
 url: "/retirement-pension-2026",
 cssSelectors: [".faq-answer"],
 }),
 ]}
 />

 <div className="page-width">
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
 <PiggyBank className="w-4 h-4" />
 2026 퇴직연금
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 퇴직연금 <span className="text-electric">완벽 가이드</span>
 </h1>
 <PublishedMeta publishedDate="2026-02-01" updatedDate="2026-05-12" className="mb-2" />
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

 <InArticleAd />

 {/* 의사결정 플로우 — HowTo 5단계 */}
 <section className="mb-12">
 <h2 className="text-xl font-black text-navy mb-6">
 본인에게 맞는 퇴직연금 선택 — 5단계
 </h2>
 <div className="space-y-3">
 {HOW_TO_STEPS.map((step, i) => (
 <div
 key={step.name}
 className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-canvas-200"
 >
 <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-electric flex items-center justify-center font-black text-white">
 {i + 1}
 </div>
 <div>
 <p className="font-bold text-navy text-sm mb-1">{step.name}</p>
 <p className="text-xs text-muted-blue leading-relaxed">
 {step.text}
 </p>
 </div>
 </div>
 ))}
 </div>
 </section>

 {/* 연령대별 추천 전략 */}
 <section className="mb-12">
 <h2 className="text-xl font-black text-navy mb-6">
 연령대별 추천 전략
 </h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {AGE_RECOMMEND.map((a) => (
 <div
 key={a.age}
 className="p-5 bg-white rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-md"
 style={{ borderLeft: `4px solid ${a.color}` }}
 >
 <div className="flex items-center justify-between mb-2">
 <p
 className="text-xl font-black"
 style={{ color: a.color }}
 >
 {a.age}
 </p>
 <p className="text-xs font-bold text-navy">{a.strategy}</p>
 </div>
 <p className="text-xs text-muted-blue leading-relaxed">
 {a.detail}
 </p>
 </div>
 ))}
 </div>
 <p className="text-xs text-faint-blue mt-4 leading-relaxed">
 ※ 위 비중은 일반 권장. 본인 위험 성향·자산 규모·다른 노후 자산(국민연금·부동산)
 보유 여부에 따라 조정 필요합니다.
 </p>
 </section>

 {/* 본문 - 심화 */}
 <article className="prose prose-sm sm:prose-base max-w-none mb-12">
 <h2 className="text-xl font-black text-navy mt-8 mb-4">
 DB vs DC, 10년 운용 차이는?
 </h2>
 <p className="text-muted-blue leading-relaxed">
 연봉 5,000만원 직원이 10년 근속할 때 DB(연 3% 보장)는 만기 약 6,720만원,
 DC를 연 7% 수익으로 운용하면 약 7,820만원. 1,100만원 차이. 단 DC는 시장
 변동성에 노출되므로 5년 단위 약세장에서는 DB가 유리한 결과도 가능. 본인의
 운용 시간·시장 관심도가 가장 큰 결정 요인입니다.
 </p>

 <h2 className="text-xl font-black text-navy mt-8 mb-4">
 IRP 세액공제 — 진짜 가치
 </h2>
 <p className="text-muted-blue leading-relaxed">
 연봉 5,500만 이하 직원이 IRP 900만원 풀 납입 시 환급액 약 148.5만원.
 연봉 8천 직원도 약 118.8만원. 매년 동일하게 30년간 받으면 누적 환급액만
 약 3,500~4,500만원. 게다가 적립금 운용 수익은 인출 시까지 과세이연되어
 일반 펀드 대비 복리 효과 큽니다.
 </p>

 <h2 className="text-xl font-black text-navy mt-8 mb-4">
 퇴직 시점 일시 수령 vs IRP 이전
 </h2>
 <p className="text-muted-blue leading-relaxed">
 퇴직금 1억원 기준 일시 수령 시 퇴직소득세 약 500~800만원 발생 (근속연수에
 따라 변동). IRP 이전 후 만 55세부터 10년 분할 연금 수령하면 연금소득세
 3.3~5.5% 적용 → 약 330~550만원으로 약 50~70% 절감. 거기에 운용 수익까지
 추가되므로 IRP 이전이 거의 항상 유리합니다.
 </p>

 <h2 className="text-xl font-black text-navy mt-8 mb-4">
 흔한 실수 5가지
 </h2>
 <ul className="space-y-1 text-muted-blue leading-relaxed">
 <li>
 • <strong>DC 방치</strong> — 가입만 하고 자동 운용 안 함. 5년 후 보니
 예금형으로만 운용되어 수익률 거의 0.
 </li>
 <li>
 • <strong>55세 전 인출</strong> — 기타소득세 16.5% + 세액공제 환수.
 IRP 가입 전 5년+ 자금 여유 반드시 확인.
 </li>
 <li>
 • <strong>퇴직 시 일시 수령</strong> — 세금 부담 큼. IRP 이전이 거의
 항상 유리.
 </li>
 <li>
 • <strong>IRP 안전자산 30% 무시</strong> — 위험자산만 채워서 거부됨.
 TDF 활용하면 자동 충족.
 </li>
 <li>
 • <strong>국민연금만 노후 자산으로</strong> — 평균 월 60만원대 수령.
 본인 생활비 충족 안 됨. 퇴직연금·IRP·연금저축 3축 필수.
 </li>
 </ul>
 </article>

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

 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />

 <RelatedCalculators currentPath="/retirement-pension-2026" />

 <div className="mt-8">
 <HomeTopAd />
 </div>
 </div>
 </main>
 );
}
