// src/app/year-end-tax-checklist/page.tsx
// 연말정산 체크리스트 — 12월 마감 전 점검 항목

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { CheckCircle2, AlertCircle, ArrowRight, Calculator } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import { YEAR_END_SEASON } from "@/lib/yearEndSeason";
import JsonLd from "@/components/JsonLd";
import ShareSection from "@/components/ShareSection";
import PublishedMeta from "@/components/PublishedMeta";
import YearEndTaxCluster from "@/components/YearEndTaxCluster";
import { breadcrumbLd, faqLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd, CalcResultAd, GuideMidAd, SidebarAd, MultiplexAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";

export const metadata: Metadata = buildPageMetadata({
 // 의도: 12월 31일 마감 전 항목별 점검표 (체크 형태). 계산기·전략은 별도 페이지.
 title: `${YEAR_END_SEASON.attributionYear} 연말정산 체크리스트 — 12월 31일 마감 전 40+ 항목 점검표`,
 description:
 "12월 31일 마감 전 빠짐없이 점검해야 할 연말정산 40+ 항목 체크리스트. 신용카드·연금저축·기부금·월세·인적공제 카테고리별 점검표 형식으로 빠르게 확인.",
 path: "/year-end-tax-checklist",
 ogType: "article",
 publishedTime: "2026-01-10",
 modifiedTime: "2026-09-09",
 keywords: [
 "연말정산 체크리스트",
 "2026 연말정산 달라지는 점",
 "12월 마감 연말정산",
 "연말정산 40가지 점검",
 "연말정산 점검표",
 "12월 31일 마감 전",
 "환급금 극대화 체크",
 ],
});

const FAQ_ITEMS = [
 {
 question: "연말정산 체크리스트는 언제 점검하나요?",
 answer:
 "연말 전에 지출·납입과 증빙을 점검하세요. 새 지출의 귀속연도와 이미 지출한 항목의 증빙 누락은 다릅니다. 누락은 회사의 추가 제출·종합소득세 신고·경정청구 가능 여부를 확인할 수 있습니다. 연금 납입 마감 시간은 금융회사별로 확인하세요.",
 },
 {
 question: "맞벌이 부부는 어떻게 분배하나요?",
 answer:
 "부부 각자의 과세표준과 실제 지출자, 소득 요건, 의료비 문턱, 다른 공제와 남은 세액을 비교해야 합니다. 같은 자녀의 기본공제를 중복 신청할 수 없고, 소득 있는 배우자의 카드 사용액을 임의로 합산할 수도 없습니다. 연봉이 높은 사람에게 모두 유리하다고 단정하지 마세요.",
 },
 {
 question: "환급 vs 추가 납부 — 어느 쪽이 좋나요?",
 answer:
 "환급은 최종 세금보다 미리 낸 금액이 많을 때, 추가 납부는 적을 때 생깁니다. 원천징수액이 다르면 같은 최종 세금이어도 결과가 달라집니다. 환급이 크다는 이유만으로 절세를 잘했다고, 추가 납부라는 이유만으로 공제를 놓쳤다고 판단하지 않습니다.",
 },
 {
 question: "올해(2026년 귀속) 연말정산에서 새로 챙길 항목은?",
 answer:
 "2026년에는 자녀 수에 따른 카드공제 기본 한도 가산, 회사 보육수당의 자녀 1명당 월 20만원 비과세 한도, 초등 저학년 예체능 교육비 확대 등을 확인하세요. 교육비의 자녀 소득 요건과 기본 인적공제의 소득 요건은 다릅니다. 향후 개편안은 공포·시행 내용을 확인하기 전 올해 공제에 적용하지 않습니다.",
 },
];

const CHECKLIST = [
 {
 category: "🆕 올해(2026년 귀속) 달라진 것부터 확인",
 items: [
 "신용카드 공제: 자녀 1명 +50만, 2명 이상 +100만 추가 한도 (총급여 7천만 초과는 절반)",
 "6세 이하 자녀 보육 관련 회사 급여: 자녀 1명당 월 20만원 비과세 한도 확인",
 "교육비: 자녀 소득요건 폐지와 만 9세 미만 또는 초등 2학년 이하 예능학원·체육시설 대상 확인",
 "월세: 부부 각자의 주거·소득 요건과 부부합산 공제대상 월세 한도 확인",
 "향후 세제개편안은 정부안 발표와 법률 공포·시행을 구분 — 2026년 공제에 선반영하지 않음",
 ],
 },
 {
 category: "💳 신용카드·체크카드",
 items: [
 "총급여의 25% 초과 사용액 확인 (예: 연봉 5,000만 → 1,250만 이상)",
 "카드 종류별 사용액·공제율·한도를 구분하고 불필요한 추가 소비는 하지 않기",
 "전통시장·대중교통 사용액 별도 확인 (40% 공제율)",
 "도서·공연·박물관·미술관 사용액 (총급여 7천만 이하 30%)",
 ],
 },
 {
 category: "💰 연금저축·IRP",
 items: [
 "연금저축 세액공제 대상 납입액 600만원 한도와 실제 납입액 확인",
 "연금저축·퇴직연금 합산 일반 한도 900만원 확인 (IRP 자체 한도가 300만원인 것은 아님)",
 "금융회사별 연말 납입 마감 시간·중도인출 조건·생활자금 확인",
 "총급여 5,500만원 이하 소득세 공제율 15%, 초과 12% — 실제 환급액과 구분",
 ],
 },
 {
 category: "🏥 의료비",
 items: [
 "본인·부양가족 의료비 영수증 모두 정리 (총급여 3% 초과분 공제)",
 "안경·렌즈비 (1인당 50만 한도) 영수증",
 "산후조리원비 (출산 1회당 200만 한도, 소득 무관)",
 "치료 목적 의약품·임플란트 증빙 확인 — 건강증진·미용 목적 비용과 실손 보전액 제외",
 "난임 시술비 별도 30% 세액공제",
 ],
 },
 {
 category: "🏠 월세·주택",
 items: [
 "월세 공제: 총급여 8천만원 이하 등 소득·무주택·대상 주택·주소 요건 확인",
 "월세 영수증 또는 계좌이체 명세서 (집주인 동의 불필요)",
 "임대차 계약서 사본",
 "주택청약저축: 대상 요건과 연 납입 300만원 한도의 40% 소득공제 확인",
 "주택임차차입금 원리금 상환액의 40% 소득공제 — 주택마련저축 공제와 합산 연 400만원 한도",
 ],
 },
 {
 category: "👨‍👩‍👧 인적공제",
 items: [
 "배우자·부양가족의 소득 요건, 자녀 만 20세 이하·부모 만 60세 이상 등 나이 요건 확인",
 "1인당 150만 소득공제",
 "경로 (만 70세 이상) +100만, 장애인 +200만, 부녀자 +50만",
 "연간 소득금액 100만원 이하 또는 근로소득만 있는 경우 총급여 500만원 이하 확인",
 "장애인은 나이 요건 예외가 있어도 소득 요건 확인 — 향후 개편안을 올해 요건과 혼동하지 않기",
 "맞벌이 부부: 동일 부양가족 중복 공제 방지·각자의 전체 세액 비교",
 ],
 },
 {
 category: "🎁 기부금",
 items: [
 "지정기부금 영수증 (15% 세액공제, 1천만 초과 30%)",
 "정치자금 기부금은 일반 기부금과 별도 공제율·공제 가능 세액 확인",
 "고향사랑기부금 영수증·공제 가능 세액 확인 (현금 환급 보장 아님)",
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
 "학교에 낸 현장체험학습비의 학교급·세부 한도·교육비 납입증명서 확인",
 "근로자 본인의 법정 학자금대출 공제 대상 원리금 상환액 확인 — 부모 대납분 자동 합산 금지",
 ],
 },
 {
 category: "💍 신혼·출산",
 items: [
 "혼인세액공제: 2024~2026년 신고한 해, 1명당 생애 1회 50만원과 실제 공제 가능 세액 확인",
 "출산·입양 세액공제 (첫째 30만, 둘째 50만, 셋째 70만)",
 "기본공제 대상 자녀·손자녀 중 만 8세 이상 자녀세액공제 확인 (6세 이하 추가 100만원 없음)",
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

 <div className="page-width">
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
 <CheckCircle2 className="w-4 h-4" />
 12월 마감 전 점검
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 2026 연말정산 <span className="text-electric">체크리스트</span>
 </h1>
 <PublishedMeta publishedDate="2026-01-10" updatedDate="2026-09-09" className="mb-2" />
 <YearEndTaxCluster />
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 공제 요건과 증빙 누락을 확인하는 9개 카테고리·40+ 항목.
 올해 달라진 것부터 확인하고, 인쇄해서 하나씩 체크하세요.
 </p>
 </div>

 {/* 데스크톱 2컬럼 — calc/[slug] 정본 패턴 (사이드바 광고, 운영자 일괄 승인
 2026-08-23). 히어로는 그리드 밖 전폭 유지 */}
 <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:gap-14">
 <div className="min-w-0">

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

 <div className="mb-12">
 <CalcResultAd />
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

 <p className="text-xs text-faint-blue -mt-6 mb-12">
 ※ 8월 3일 발표된 2026 세제개편안(2027년분부터 적용 예정, 국회 통과
 필요)의 상세 내용은{" "}
 <Link href="/tax-reform-2026" className="text-electric font-bold hover:underline">
 2026 세법개정안 총정리
 </Link>
 에서 확인하세요.
 </p>

 <div className="mb-12">
 <GuideMidAd />
 </div>

 {/* 공제 항목별 정밀 계산기 — 연말정산 클러스터 내부링크 */}
 <section className="mb-12">
 <h2 className="text-xl font-black text-navy mb-2">
 체크한 항목, 계산기로 공제액 확인
 </h2>
 <p className="text-sm text-muted-blue leading-relaxed mb-4">
 신용카드·의료비·월세 카테고리는 전용 계산기로 예상 공제액을 바로
 계산할 수 있습니다.
 </p>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <Link
 href="/credit-card-deduction-2026"
 className="block p-6 bg-white rounded-2xl border border-canvas-200 hover:border-electric transition-colors"
 >
 <div className="text-2xl mb-2">💳</div>
 <p className="font-bold text-navy text-sm mb-1">신용카드 소득공제 계산기</p>
 <p className="text-xs text-muted-blue leading-relaxed">
 25% 문턱·자녀 수별 한도 반영 공제액 계산
 </p>
 </Link>
 <Link
 href="/medical-tax-credit-2026"
 className="block p-6 bg-white rounded-2xl border border-canvas-200 hover:border-electric transition-colors"
 >
 <div className="text-2xl mb-2">🏥</div>
 <p className="font-bold text-navy text-sm mb-1">의료비 세액공제 계산기</p>
 <p className="text-xs text-muted-blue leading-relaxed">
 실손 차감·3% 문턱·난임 30% 반영 계산
 </p>
 </Link>
 <Link
 href="/rent-tax-credit-2026"
 className="block p-6 bg-white rounded-2xl border border-canvas-200 hover:border-electric transition-colors"
 >
 <div className="text-2xl mb-2">🏠</div>
 <p className="font-bold text-navy text-sm mb-1">월세 세액공제 계산기</p>
 <p className="text-xs text-muted-blue leading-relaxed">
 15%·17% 자동 판정, 최대 170만원
 </p>
 </Link>
 </div>
 </section>

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

 <section className="mb-10 p-5 rounded-2xl border border-canvas-200 bg-white text-sm text-muted-blue leading-relaxed">
 <h2 className="font-bold text-navy mb-3">공제액 확인에 사용한 공식 자료</h2>
 <p>2026년 9월 9일 확인. 소득공제액·세액공제액·실제 환급액은 다릅니다. 각 항목의 요건과 회사가 요청하는 증빙을 함께 확인하세요.</p>
 <ul className="mt-3 space-y-2">
 <li><a className="text-electric underline" href="https://b.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7875&mi=6596" target="_blank" rel="noopener noreferrer">국세청: 자녀·혼인·연금계좌 세액공제</a></li>
 <li><a className="text-electric underline" href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7874&mi=6595" target="_blank" rel="noopener noreferrer">국세청: 의료비·교육비·기부금</a></li>
 <li><a className="text-electric underline" href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=239021" target="_blank" rel="noopener noreferrer">국세청: 주택임차차입금 원리금 공제</a></li>
 <li><a className="text-electric underline" href="https://www.korea.kr/multi/visualNewsView.do?newsId=148957488" target="_blank" rel="noopener noreferrer">재정경제부: 2026년부터 바뀐 보육·교육비·카드 공제</a></li>
 </ul>
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
 <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">{item.answer}</p>
 </details>
 ))}
 </div>
 </section>

 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />

 <RelatedCalculators currentPath="/year-end-tax-checklist" />

 <div className="mt-8">
 <HomeTopAd />
 </div>

 <ShareSection heading="도움이 됐다면 공유해 주세요" contentType="page" className="mt-10" />
 {/* 본문 끝 멀티플렉스(관련 콘텐츠형) — 전면 최적화 (운영자 지시 2026-09-02) */}
 <div className="mt-10">
 <MultiplexAd />
 </div>
 </div>

 {/* Desktop sticky sidebar — 광고 + 쿠팡 (salary/[amount] 동일 조합) */}
 <aside
 className="hidden lg:block lg:sticky lg:top-24 space-y-6 self-start"
 aria-label="추천·광고"
 >
 <SidebarAd />
 <CoupangBanner size="skyscraper" showDisclosure={false} />
 </aside>
 </div>
 </div>
 </main>
 );
}
