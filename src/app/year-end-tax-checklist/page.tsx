// src/app/year-end-tax-checklist/page.tsx
// 연말정산 체크리스트 — 12월 마감 전 점검 항목

import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, AlertCircle, ArrowRight, Calculator } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd } from "@/components/AdPlacement";
import PartnerSlot from "@/components/PartnerSlot";
import CoupangBanner from "@/components/CoupangBanner";
import EmailCaptureCard from "@/components/EmailCaptureCard";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 연말정산 체크리스트 — 12월 마감 전 12가지 점검",
 description:
 "연말정산 환급금 극대화를 위한 12월 마감 전 체크리스트. 신용카드·연금저축·기부금·월세·인적공제 등 모든 항목 점검표.",
 path: "/year-end-tax-checklist",
 keywords: [
 "연말정산 체크리스트",
 "연말정산 12월",
 "연말정산 점검",
 "13월의 월급",
 "환급금 극대화",
 ],
});

const FAQ_ITEMS = [
 {
 question: "연말정산 체크리스트는 언제 점검하나요?",
 answer:
 "이상적으로는 매월 점검하지만, 늦어도 12월 1일~30일 사이 마지막 점검 필수. 12월 31일 이후엔 그 해 적용 항목 추가 불가능. 특히 연금저축·IRP 입금은 12/31 이전 처리 시간 1~2일 소요.",
 },
 {
 question: "맞벌이 부부는 어떻게 분배하나요?",
 answer:
 "총급여 더 높은 쪽이 부양가족 인적공제·신용카드·의료비를 모아서 받는 게 절세 효과 큼. 누진세율이 한 단계 위면 환급금 차이도 큼. 단, 본인 카드 사용분만 본인 명의로 모음.",
 },
 {
 question: "환급 vs 추가 납부 — 어느 쪽이 좋나요?",
 answer:
 "환급은 미리 떼인 세금을 돌려받는 것이고, 추가 납부는 부족분 정산. 환급이 많을수록 1년간 무이자 대출 효과(미리 떼인 만큼)인데, 매월 받는 게 더 유리. 추가 납부는 절세 항목 미활용 신호.",
 },
];

const CHECKLIST = [
 {
 category: "💳 신용카드·체크카드",
 items: [
 "총급여의 25% 초과 사용액 확인 (예: 연봉 5,000만 → 1,250만 이상)",
 "체크카드·현금영수증 사용액이 신용카드의 25%~한도 채울 만큼인지",
 "전통시장·대중교통 사용액 별도 확인 (40% 공제율)",
 "도서·공연·박물관·미술관 사용액 (총급여 7천만 이하 30%)",
 ],
 },
 {
 category: "💰 연금저축·IRP",
 items: [
 "연금저축 600만 한도 풀 납입 여부 확인",
 "IRP 추가 300만 한도 활용",
 "12월 31일까지 입금 (이체 처리 1~2일 소요 → 12/30 권장)",
 "총급여 5,500 이하 → 16.5% 환급, 초과 → 13.2% 환급",
 ],
 },
 {
 category: "🏥 의료비",
 items: [
 "본인·부양가족 의료비 영수증 모두 정리 (총급여 3% 초과분 공제)",
 "안경·렌즈비 (1인당 50만 한도) 영수증",
 "산후조리원비 (200만 한도, 총급여 7천만 이하)",
 "한약·임플란트·보양 의료비 포함 가능",
 "난임 시술비 별도 30% 세액공제",
 ],
 },
 {
 category: "🏠 월세·주택",
 items: [
 "총급여 7천만 이하 무주택자만 가능 (한도 750만의 17%)",
 "월세 영수증 또는 계좌이체 명세서 (집주인 동의 불필요)",
 "임대차 계약서 사본",
 "주택청약저축 매월 10만 자동이체 (40% 소득공제)",
 "전세자금대출 이자 공제 (한도 400만의 40%)",
 ],
 },
 {
 category: "👨‍👩‍👧 인적공제",
 items: [
 "본인 + 배우자 (소득 100만 이하) + 만 20세 이하 자녀 + 60세 이상 부모",
 "1인당 150만 소득공제",
 "경로 (만 70세 이상) +100만, 장애인 +200만, 부녀자 +50만",
 "부양가족 소득 100만 초과 여부 확인 (초과 시 자격 박탈)",
 "맞벌이 부부 → 누진세율 높은 쪽이 신청",
 ],
 },
 {
 category: "🎁 기부금",
 items: [
 "지정기부금 영수증 (15% 세액공제, 1천만 초과 30%)",
 "정치자금 10만까지 100% 환급 (초과분 15%)",
 "고향사랑기부제 10만까지 100%",
 "종교단체·교육기관 기부금 가능",
 "12월 31일까지 결제분만 인정",
 ],
 },
 {
 category: "🎓 교육비",
 items: [
 "본인 교육비 한도 없이 15% 세액공제",
 "자녀 학교 교육비 (초중고 300만, 대학 900만 한도)",
 "교복비 50만 (중·고등)",
 "체험학습비 30만 (어린이집·유치원·초등)",
 "학자금 대출 원금·이자 상환액",
 ],
 },
 {
 category: "💍 신혼·출산",
 items: [
 "결혼세액공제 50만 (총급여 7천만 이하, 혼인 신고일 기준)",
 "출산·입양 세액공제 (첫째 30만, 둘째 50만, 셋째 70만)",
 "6세 이하 자녀 추가공제 100만",
 "산후조리원비 의료비 공제",
 ],
 },
];

export default function YearEndTaxChecklistPage() {
 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "연말정산 체크리스트", path: "/year-end-tax-checklist" },
 ]),
 faqLd(FAQ_ITEMS),
 speakableLd({
 url: "/year-end-tax-checklist",
 cssSelectors: [".faq-answer"],
 }),
 ]}
 />

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
 <CheckCircle2 className="w-4 h-4" />
 12월 마감 전 점검
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 2026 연말정산 <span className="text-electric">체크리스트</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 환급금 극대화를 위해 12월 31일 전 챙겨야 할 8개 카테고리·40+ 항목.
 인쇄해서 하나씩 체크하세요.
 </p>
 </div>

 {/* 12월 31일 데드라인 알림 */}
 <div className="mb-12 p-6 bg-electric-10 border border-electric/20 rounded-3xl">
 <div className="flex items-start gap-3">
 <AlertCircle className="w-5 h-5 text-electric flex-shrink-0 mt-1" />
 <div>
 <h3 className="font-black text-navy text-base mb-2">12월 31일이 마감</h3>
 <p className="text-sm text-muted-blue leading-relaxed">
 12월 31일 이후 이체·결제·기부는 그 해 연말정산에 반영 X.
 특히 <strong>연금저축·IRP는 12월 30일까지</strong> 입금 (이체 처리 1~2일).
 </p>
 </div>
 </div>
 </div>

 {/* 카테고리별 체크리스트 */}
 <div className="space-y-6 mb-12">
 {CHECKLIST.map((cat) => (
 <section key={cat.category} className="p-6 bg-white rounded-2xl border border-canvas-200">
 <h2 className="text-lg font-black text-navy mb-4">{cat.category}</h2>
 <ul className="space-y-3">
 {cat.items.map((item, idx) => (
 <li key={idx} className="flex items-start gap-3">
 <CheckCircle2 className="w-4 h-4 text-electric flex-shrink-0 mt-1" />
 <span className="text-sm text-muted-blue leading-relaxed">{item}</span>
 </li>
 ))}
 </ul>
 </section>
 ))}
 </div>

 {/* CTA */}
 <Link
 href="/year-end-tax"
 className="block mb-12 p-6 sm:p-8 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors group"
 >
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm font-bold opacity-90 mb-2">체크 후 다음 단계</p>
 <h3 className="text-xl sm:text-2xl font-black mb-2">
 연말정산 환급금 미리 시뮬
 </h3>
 <p className="text-sm opacity-90">
 항목별 입력 → 예상 환급금 즉시 계산
 </p>
 </div>
 <Calculator className="w-12 h-12 opacity-50 group-hover:opacity-80 transition-opacity flex-shrink-0" />
 </div>
 </Link>

 <InArticleAd />

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

 <PartnerSlot
 id="samjeomsam-tax"
 fallback={
 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />
 }
 />

 <EmailCaptureCard context="year-end-tax" />

 <RelatedCalculators currentPath="/year-end-tax-checklist" />

 <div className="mt-8">
 <HomeTopAd />
 </div>
 </div>
 </main>
 );
}
