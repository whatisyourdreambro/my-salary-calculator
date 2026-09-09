// src/app/tax-changes-2026/page.tsx
// 2026 세법 변경사항 종합

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Sparkles, ArrowRight, Calculator } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import ShareSection from "@/components/ShareSection";
import PublishedMeta from "@/components/PublishedMeta";
import { breadcrumbLd, faqLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd, GuideMidAd, CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 세법 변경사항 — 자녀공제·보육수당·적용연도",
 description:
 "2026년 귀속 자녀·혼인 공제와 보육수당, 카드 공제 변경을 확인합니다. 계속 적용되는 제도와 새 변경사항, 향후 개편안을 구분하고 공식 출처를 연결합니다.",
 path: "/tax-changes-2026",
 ogType: "article",
 publishedTime: "2026-01-01",
 modifiedTime: "2026-09-09",
 keywords: [
 "2026 세법",
 "세법 개정",
 "결혼세액공제",
 "자녀세액공제",
 "출산 세액공제",
 "신용카드 공제 변경",
 ],
});

const FAQ_ITEMS = [
 {
 question: "2026년 새 변경사항과 기존 공제는 어떻게 구분하나요?",
 answer:
 "2026년부터 보육수당 비과세 한도가 자녀 1명당 월 20만원으로 바뀌고 자녀 수에 따른 신용카드 공제 기본 한도가 늘어납니다. 혼인세액공제는 2024~2026년 혼인신고분에 계속 적용되는 생애 1회 제도입니다. 6세 이하 자녀에게 100만원 소득공제가 새로 생긴 것은 아닙니다.",
 },
 {
 question: "결혼세액공제는 어떻게 신청하나요?",
 answer:
 "2024~2026년 중 혼인신고한 해의 소득에 대해 생애 1회 50만원 소득세 세액공제를 확인합니다. 2026년 혼인신고분은 통상 2027년 초 근로소득 연말정산에 반영합니다. 신고 사실과 기존 공제 여부를 확인하고 회사의 소득·세액공제 신고 절차에 따라 자료를 제출하세요. 부부는 각자 판단하며 실제 적용액은 남은 세액 등에 따라 달라집니다.",
 },
 {
 question: "신용카드 공제율이 변경되었나요?",
 answer:
 "기본 공제율은 동일합니다 (신용 15%, 체크/현금영수증 30%, 전통시장·대중교통 40%). 다만 도서·공연·박물관·미술관 사용분 공제율 30%은 총급여 7천만 이하 기준 유지. 기본 한도는 총급여 7천만 이하 300만·초과 250만이며, 2026년 귀속부터 자녀 1명 +50만(7천만 초과 +25만)·2명 이상 +100만(초과 +50만)이 가산됩니다. (1.2억 초과 200만원 구간은 옛 3구간 체계로 현행 아님)",
 },
];

const MAJOR_CHANGES = [
 {
 category: "결혼·출산",
 emoji: "💍",
 changes: [
 {
 title: "혼인세액공제 — 2024~2026년 신고분 계속 적용",
 detail: "혼인신고한 해에 거주자 1명당 생애 1회 50만원 소득세 세액공제. 소득 상한은 없지만 실제 공제액은 세액 등을 확인해야 합니다.",
 impact: "귀속연도·생애 사용 여부 확인",
 },
 {
 title: "출산·입양 세액공제 — 해당 연도 확인",
 detail: "해당 연도에 출산하거나 입양신고한 공제 대상 자녀는 첫째 30만, 둘째 50만, 셋째 이후 각 70만원 소득세 세액공제. 매년 반복되는 출산 공제가 아닙니다.",
 impact: "출산일·입양신고일 확인",
 },
 {
 title: "자녀세액공제 — 기본공제 대상 중 만 8세 이상",
 detail: "기본공제 대상 자녀·손자녀 중 만 8세 이상이 1명 25만, 2명 55만, 3명부터 40만원씩 추가됩니다. 기본 소득공제 150만원과는 별개이며, 6세 이하 추가 100만원 소득공제는 적용하지 않습니다.",
 impact: "소득공제와 세액공제 구분",
 },
 ],
 },
 {
 category: "근로소득",
 emoji: "💼",
 changes: [
 {
 title: "비과세 식대 20만원 유지",
 detail: "회사에서 식사 등을 제공받지 않는 근로자의 식대는 월 20만원까지 비과세 여부를 확인합니다. 지급 항목과 법정 요건에 따라 달라집니다.",
 impact: "급여명세서 항목 확인",
 },
 {
 title: "보육수당 비과세 한도 — 2026년부터 자녀별 적용",
 detail: "6세 이하 자녀의 보육과 관련해 회사가 지급하는 급여의 비과세 한도가 근로자당 월 20만원에서 자녀 1명당 월 20만원으로 확대됐습니다. 2026년 1월 1일 이후 지급분부터 적용합니다.",
 impact: "회사 지급액·대상 자녀 확인",
 },
 ],
 },
 {
 category: "투자·금융",
 emoji: "📈",
 changes: [
 {
 title: "ISA 한도·비과세 유지",
 detail: "일반적인 ISA 납입한도는 연 2,000만원·총 1억원이며, 순이익 비과세 한도는 일반형 200만원·서민형 등 400만원입니다. 비과세는 매년 반복 한도로 계산하지 말고 가입·해지 요건과 함께 확인하세요.",
 impact: "기존 활용 지속",
 },
 {
 title: "연금저축·IRP 합산 900만 유지",
 detail: "연금저축 600만원, 퇴직연금과 합쳐 일반 세액공제 대상 납입액 900만원 한도. 총급여 5,500만원 이하 소득세 공제율 15%, 초과 12%이며 실제 환급액과는 다릅니다.",
 impact: "납입·중도인출·남은 세액 확인",
 },
 {
 title: "금융소득 종합과세 기준 2,000만 유지",
 detail: "이자·배당 합계 2,000만 초과 시 종합과세 합산. 자산가 영향 큼.",
 impact: "자산 분산 검토",
 },
 ],
 },
 {
 category: "부동산",
 emoji: "🏠",
 changes: [
 {
 title: "1세대 1주택 비과세 12억 유지",
 detail: "1세대 1주택의 보유·거주 등 비과세 요건을 먼저 확인합니다. 양도가액 12억원 초과 고가주택은 초과 비율에 해당하는 양도차익 과세를 별도로 계산합니다.",
 impact: "기존 동일",
 },
 {
 title: "다주택자 양도세 중과 재개",
 detail: "조정대상지역 다주택 양도는 주택 수·보유기간·양도일과 중과 제외 요건을 함께 확인해야 합니다. 2026년 5월 9일까지의 한시 배제와 이후 거래를 구분하고, 계약·잔금에 관한 경과조치도 확인하세요. 향후 개편안만으로 현재 거래 세율을 정하지 않습니다.",
 impact: "다주택자 매도 시점 셈법 중요",
 },
 {
 title: "임대사업자는 등록 유형·의무기간 별도 확인",
 detail: "등록 시기·유형, 임대 의무기간, 실제 요건 충족 여부에 따라 세제 적용이 달라집니다. 변경될 수 있다는 설명만으로 감면 대상이라고 판단하지 마세요.",
 impact: "임대사업자 영향",
 },
 ],
 },
 {
 category: "사업자",
 emoji: "🏢",
 changes: [
 {
 title: "법인세율 — 2026년 이후 개시 사업연도",
 detail: "일반 영리법인은 과세표준 2억 이하 10%, 200억 이하 20%, 3,000억 이하 22%, 초과 25%의 누진세율입니다. 2026년 1월 1일 이후 개시하는 사업연도부터 적용하며 소규모법인 등은 별도 기준을 확인합니다.",
 impact: "신고 연도와 사업연도 구분",
 },
 {
 title: "간이과세 기준 — 1억400만원 미만 여부 확인",
 detail: "원칙적으로 직전 연도 공급대가 1억400만원 미만인 개인사업자가 대상이며 간이과세 배제 업종 등은 제외됩니다. 부동산임대업·과세유흥장소 등 별도 기준과 과세유형 전환 시기를 확인하세요.",
 impact: "전환 검토 시점",
 },
 ],
 },
];

export default function TaxChanges2026Page() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "2026 세법 변경사항", path: "/tax-changes-2026" },
 ]),
 faqLd(FAQ_ITEMS),
 speakableLd({
 url: "/tax-changes-2026",
 cssSelectors: [".faq-answer"],
 }),
 ]}
 />

 <div className="page-width">
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
 <Sparkles className="w-4 h-4" />
 2026년 시행
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 2026 세법 <span className="text-electric">변경사항</span>
 </h1>
 <PublishedMeta publishedDate="2026-01-01" updatedDate="2026-09-09" className="mb-2" />
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 2026년 새로 바뀐 항목과 계속 적용되는 공제를 구분했습니다.
 자녀·혼인 공제, 회사 보육수당과 주요 세금의 적용 시점을 확인하세요.
 </p>
 <p className="mt-6 inline-block text-xs text-canvas-700 px-4 py-2 bg-canvas-100 rounded-xl border border-canvas-200">
 📅 이 페이지는 <strong>2026년 적용 기준</strong>을 다룹니다. 향후 제도 변경을 제안한
 <strong>2026년 세제개편안</strong>은{" "}
 <Link href="/tax-reform-2026" className="text-electric font-bold hover:underline">
 2026 세법개정안 총정리
 </Link>
 에서 별도로 확인하세요. 정부안 발표와 법률 공포·시행은 다르며, 제안 내용을 올해 공제에 적용하지 않습니다.
 </p>
 </div>

 {/* 카테고리별 변경사항 — 2번째 섹션 직후 InArticleAd (viewability 상향) */}
 <div className="space-y-8 mb-12">
 {MAJOR_CHANGES.map((cat, catIdx) => (
 <div key={cat.category}>
 <section>
 <div className="flex items-center gap-3 mb-4">
 <span className="text-3xl">{cat.emoji}</span>
 <h2 className="text-xl sm:text-2xl font-black text-navy">{cat.category}</h2>
 </div>
 <div className="space-y-3">
 {cat.changes.map((change, idx) => (
 <div
 key={idx}
 className="p-5 bg-white rounded-2xl border border-canvas-200"
 >
 <div className="flex items-start justify-between gap-4 flex-wrap">
 <div className="flex-1 min-w-0">
 <h3 className="font-bold text-navy text-base mb-2">{change.title}</h3>
 <p className="text-sm text-muted-blue leading-relaxed">
 {change.detail}
 </p>
 </div>
 <div className="flex-shrink-0 px-3 py-1.5 rounded-full bg-electric-10 text-electric text-xs font-bold">
 {change.impact}
 </div>
 </div>
 </div>
 ))}
 </div>
 </section>
 {catIdx === 1 && <InArticleAd />}
 {/* 4번째 카테고리(부동산) 직후 보강 광고 — 전면 최적화 (운영자 지시 2026-09-02) */}
 {catIdx === 3 && <CalcResultAd />}
 </div>
 ))}
 </div>

 <section className="mb-10 p-5 rounded-2xl bg-white border border-canvas-200 text-sm text-muted-blue leading-relaxed">
 <h2 className="font-bold text-navy mb-3">공식 근거 · 2026년 9월 9일 확인</h2>
 <ul className="space-y-2">
 <li><a className="text-electric underline" href="https://b.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7875&mi=6596" target="_blank" rel="noopener noreferrer">국세청: 자녀·혼인·연금계좌 공제</a></li>
 <li><a className="text-electric underline" href="https://www.korea.kr/multi/visualNewsView.do?newsId=148957488" target="_blank" rel="noopener noreferrer">재정경제부: 2026년 보육수당·교육비·카드 공제 변경</a></li>
 <li><a className="text-electric underline" href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7746" target="_blank" rel="noopener noreferrer">국세청: 2026년 이후 법인세율</a> · <a className="text-electric underline" href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7802&mi=6583" target="_blank" rel="noopener noreferrer">일반·간이과세 구분</a></li>
 <li><a className="text-electric underline" href="https://b.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7711&mi=2312" target="_blank" rel="noopener noreferrer">국세청: 양도소득세율과 적용 시점</a></li>
 </ul>
 <p className="mt-3">공제액은 현금 지원금이나 확정 환급액이 아닙니다. 개인별 자격·남은 세액과 기납부세액을 함께 확인하세요.</p>
 </section>

 {/* CTA */}
 <Link
 href="/year-end-tax"
 className="block mb-12 p-6 sm:p-8 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors group"
 >
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm font-bold opacity-90 mb-2">바뀐 세법 적용</p>
 <h3 className="text-xl sm:text-2xl font-black mb-2">
 2026 연말정산 환급금 미리 보기
 </h3>
 <p className="text-sm opacity-90">
 소득·공제·이미 낸 세금을 입력하고 정산 결과 비교
 </p>
 </div>
 <Calculator className="w-12 h-12 opacity-50 group-hover:opacity-80 transition-opacity flex-shrink-0" />
 </div>
 </Link>

 <GuideMidAd />

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
 <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">{item.answer}</p>
 </details>
 ))}
 </div>
 </section>

 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />

 <RelatedCalculators currentPath="/tax-changes-2026" />

 <div className="mt-8">
 <HomeTopAd />
 </div>

 <ShareSection heading="도움이 됐다면 공유해 주세요" contentType="page" className="mt-10" />
 </div>
 </main>
 );
}
