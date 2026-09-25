// src/app/year-end-tax/page.tsx

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { ArrowRight } from "lucide-react";
import YearEndTaxCalculator from "@/components/YearEndTaxCalculator";
import RelatedCalculators from "@/components/RelatedCalculators";
import YearEndTaxCluster from "@/components/YearEndTaxCluster";
import JsonLd from "@/components/JsonLd";
import ShareSection from "@/components/ShareSection";
import { buildPageMetadata } from "@/lib/seo";
import { YEAR_END_SEASON } from "@/lib/yearEndSeason";
import {
 YEAR_END_LIMIT_ROWS,
 YEAR_END_LIMIT_FAQS,
 YEAR_END_LIMITS_SOURCE_NOTE,
} from "@/lib/yearEndLimits2026";
import { breadcrumbLd, softwareApplicationLd, faqLd, speakableLd } from "@/lib/structuredData";
import { InArticleAd, HomeTopAd, GuideMidAd, CalcResultAd } from "@/components/AdPlacement";
// 부활 팩 ④ (운영자 승인 2026-08-31) — CPA 오퍼 슬롯
import { OfferSlot } from "@/components/affiliate/AffiliateSlot";
import CoupangBanner from "@/components/CoupangBanner";

export const metadata: Metadata = buildPageMetadata({
 // 의도: 계산기 도구 (시즌 무관, 연 1회 사용). 시즌 가이드는 별도 페이지.
 title: `연말정산 환급금 계산기 — 즉시 계산 도구 (${YEAR_END_SEASON.attributionYear})`,
 description:
 `총급여·신용카드·의료비·연금저축·기부금 입력 → ${YEAR_END_SEASON.attributionYear}년 귀속 연말정산 예상 환급금을 즉시 계산하는 무료 도구. 연말정산 시즌 가이드·체크리스트는 별도 페이지에서 확인하세요.`,
 path: "/year-end-tax",
 keywords: [
 "연말정산 환급금 계산기",
 "연말정산 계산기 무료",
 "연말정산 미리보기",
 "2026 연말정산 달라지는 점",
 "13월의 월급 계산",
 "신용카드 공제 계산",
 "의료비 공제 계산",
 "연금저축 공제 계산",
 "환급금 미리보기",
 ],
});

const FAQ_ITEMS = [
 {
 question: "연말정산 환급금은 어떻게 계산되나요?",
 answer:
 "근로소득공제 후 과세표준에 누진세율(6~45%)을 적용해 산출세액을 계산하고, 신용카드·의료비·교육비·기부금 등 세액공제를 차감합니다. 미리 낸 원천징수세보다 적으면 환급, 많으면 추가 납부됩니다.",
 },
 {
 question: "신용카드 공제 한도는 어떻게 되나요?",
 answer:
 "총급여 25% 초과분부터 신용카드 15%, 체크카드/현금영수증 30%, 전통시장·대중교통 40% 공제되며 기본한도는 300만원(총급여 7천만 이하, 자녀 2명 이상 400만원)입니다.",
 },
 {
 question: "연금저축·IRP 세액공제는 얼마까지 받을 수 있나요?",
 answer:
 "연금저축 600만원 + IRP 추가 300만원 = 최대 900만원까지 공제 대상입니다. 총급여 5,500만원 이하는 16.5%, 초과는 13.2%(지방소득세 포함 — 소득세 기준 15%/12%) 세액공제율이 적용됩니다 (최대 약 148만원 절세). 본 계산기 결과는 소득세 기준입니다.",
 },
 {
 question: "2026년 귀속 연말정산에서 달라지는 점은 무엇인가요?",
 answer:
 "올해 소득분에는 신용카드 소득공제 자녀 추가 한도(1명 +50만원, 2명 이상 +100만원), 출산·보육수당 비과세 월 20만원, 교육비 세액공제 확대, 월세 세액공제 주말부부 각자 신청 등이 적용됩니다. 2026년 발표된 세제개편안(인적공제 소득요건 완화 등)은 국회 통과 시 2027년 소득분부터 적용되므로 올해(2026년 귀속, 2027년 1~2월 정산)에는 반영되지 않습니다.",
 },
];

export default function YearEndTaxPage() {
 return (
 <main className="w-full min-h-screen bg-canvas">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "연말정산 계산기", path: "/year-end-tax" },
 ]),
 softwareApplicationLd({
 name: "연말정산 환급금 계산기",
 description:
 "13월의 월급을 미리 계산하는 2026 귀속 연말정산 시뮬레이터.",
 url: "/year-end-tax",
 }),
 // FAQPage 는 한 페이지에 하나 — 기존 FAQ + 페이지 끝 공제 한도 FAQ(둘 다 화면에 노출)
 faqLd([...FAQ_ITEMS, ...YEAR_END_LIMIT_FAQS]),
 speakableLd({
 url: "/year-end-tax",
 cssSelectors: [".faq-answer"],
 }),
 ]}
 />
 {/* Hero */}
 <section className="relative pt-32 pb-16 px-4 text-center overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-primary via-white to-primary/80 -z-10" />
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10" />

 <div className="max-w-3xl mx-auto">
 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-6">
 💰 13월의 월급
 </div>
 <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight mb-5 leading-[1.15] text-navy ">
 연말정산 환급금<br />
 <span className="text-primary">미리 계산해보세요</span>
 </h1>
 <YearEndTaxCluster />
 <p className="text-lg sm:text-xl text-faint-blue leading-relaxed font-medium">
 2026년 귀속 연말정산, 예상 환급금을 미리 계산하고<br className="hidden sm:block" />
 절세 전략을 세워보세요.
 </p>

 
 </div>
 </section>

 {/* 계산기 섹션 */}
 <section className="page-width pb-20 -mt-4">
 <div className="max-w-4xl mx-auto">
 <HomeTopAd />
 </div>

 <YearEndTaxCalculator />

 <div className="max-w-4xl mx-auto mt-10">
 <InArticleAd />

 {/* 부활 팩 ④ (운영자 승인 2026-08-31): 광고 직후 CPA 오퍼 */}
 <OfferSlot vertical="loan" />

 {/* 2026년 귀속 확정 변경사항 — "연말정산 미리보기" 검색 의도 대응 */}
 <section className="mt-10 p-6 bg-white rounded-2xl border border-canvas-200">
 <h2 className="text-lg font-black text-navy mb-3">
 2026년 귀속 연말정산, 미리보기 전 달라진 점 확인
 </h2>
 <ul className="space-y-2 text-sm text-muted-blue leading-relaxed list-disc pl-5">
 <li>
 <strong>신용카드 공제 자녀 추가 한도</strong> — 자녀 1명 +50만원,
 2명 이상 +100만원 (총급여 7천만원 초과자는 절반)
 </li>
 <li>
 <strong>출산·보육수당 비과세</strong> — 자녀 1인당 월 20만원까지
 </li>
 <li>
 <strong>교육비 세액공제 확대</strong> — 자녀 소득요건 폐지, 9세 미만
 예체능 학원비 포함
 </li>
 <li>
 <strong>월세 세액공제</strong> — 주말부부 각자 신청 가능 (부부합산
 한도 연 1,000만원)
 </li>
 </ul>
 <p className="text-xs text-faint-blue leading-relaxed mt-4">
 ※ 2026년 발표된 세제개편안(인적공제 소득요건 300만원 완화 등)은
 국회 통과 시 2027년 소득분부터 적용 — 올해(2026년 귀속, 2027년 1~2월
 정산)와는 무관합니다. 상세 내용은{" "}
 <Link href="/tax-reform-2026" className="text-electric font-bold hover:underline">
 2026 세법개정안 총정리
 </Link>
 , 올해 시행분 전체 목록은{" "}
 <Link href="/tax-changes-2026" className="text-electric font-bold hover:underline">
 2026 세법 변경사항
 </Link>
 에서 확인하세요.
 </p>
 </section>

 {/* 변경사항·항목별 계산기 사이 보강 광고 — 전면 최적화 (운영자 지시 2026-09-02) */}
 <div className="mt-10">
 <CalcResultAd />
 </div>
 {/* 공제 항목별 정밀 계산기 — 연말정산 클러스터 내부링크 */}
 <section className="mt-10">
 <h2 className="text-xl font-black text-navy mb-2">공제 항목별 정밀 계산기</h2>
 <p className="text-sm text-muted-blue leading-relaxed mb-4">
 위 계산기에 넣을 신용카드·의료비·월세 금액이 애매하다면, 항목별 전용
 계산기에서 예상 공제액을 먼저 확인해보세요.
 </p>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <Link
 href="/credit-card-deduction-2026"
 className="block p-5 bg-white rounded-2xl border border-canvas-200 hover:border-electric transition-colors"
 >
 <div className="text-2xl mb-2">💳</div>
 <p className="font-bold text-navy text-sm mb-1">신용카드 소득공제 계산기</p>
 <p className="text-xs text-muted-blue leading-relaxed">
 25% 문턱·자녀 수별 한도 반영 공제액 계산
 </p>
 </Link>
 <Link
 href="/medical-tax-credit-2026"
 className="block p-5 bg-white rounded-2xl border border-canvas-200 hover:border-electric transition-colors"
 >
 <div className="text-2xl mb-2">🏥</div>
 <p className="font-bold text-navy text-sm mb-1">의료비 세액공제 계산기</p>
 <p className="text-xs text-muted-blue leading-relaxed">
 실손 차감·3% 문턱·난임 30% 반영 계산
 </p>
 </Link>
 <Link
 href="/rent-tax-credit-2026"
 className="block p-5 bg-white rounded-2xl border border-canvas-200 hover:border-electric transition-colors"
 >
 <div className="text-2xl mb-2">🏠</div>
 <p className="font-bold text-navy text-sm mb-1">월세 세액공제 계산기</p>
 <p className="text-xs text-muted-blue leading-relaxed">
 15%·17% 자동 판정, 최대 170만원
 </p>
 </Link>
 </div>
 </section>

 {/* 시즌 보강 광고(운영자 승인 2026-08-30, 제안 C) — 계산기 섹션과 FAQ 사이 */}
 <div className="mt-10">
 <GuideMidAd />
 </div>

 {/* FAQ — speakable(.faq-answer) 대상 */}
 <div className="mt-10 mb-4">
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
 </div>

 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />

 <RelatedCalculators currentPath="/year-end-tax" />

 <ShareSection heading="도움이 됐다면 공유해 주세요" contentType="page" className="mt-10" />

 {/* 2026년 귀속 주요 공제 한도표 + 한도 FAQ (2026-09-25) — 마지막 광고(쿠팡 배너)보다
 아래, 기존 형제 요소 순서를 바꾸지 않도록 컨테이너 맨 끝에 추가 (광고 위 UI 금지 규칙).
 수치는 yearEndLimits2026 이 정본 상수에서 만든다. */}
 <section className="mt-12" aria-labelledby="year-end-limits-heading">
 <h2 id="year-end-limits-heading" className="text-xl font-black text-navy mb-2">
 2026년 귀속 연말정산 주요 공제 한도
 </h2>
 <p className="text-sm text-muted-blue leading-relaxed mb-4">
 위 계산기에 넣을 금액을 정하기 전에 항목별 공제율과 한도를 확인하세요.
 소득공제는 과세표준을, 세액공제는 세금을 직접 줄입니다.
 </p>
 <div className="bg-white rounded-2xl border border-canvas-200 px-4 sm:px-0">
 <table className="w-full text-sm border-collapse block sm:table">
 <caption className="sr-only">2026년 귀속 연말정산 항목별 공제율과 한도</caption>
 <thead className="hidden sm:table-header-group">
 <tr className="border-b-2 border-canvas-200 text-navy">
 <th scope="col" className="py-3 px-4 text-left font-black">항목</th>
 <th scope="col" className="py-3 px-4 text-left font-black">공제율</th>
 <th scope="col" className="py-3 px-4 text-left font-black">한도·요건</th>
 </tr>
 </thead>
 <tbody className="block sm:table-row-group">
 {YEAR_END_LIMIT_ROWS.map((row) => (
 <tr
 key={row.item}
 className="block sm:table-row py-4 sm:py-0 border-b border-canvas-200 last:border-b-0 align-top"
 >
 <th
 scope="row"
 className="block sm:table-cell sm:py-3 sm:px-4 text-left font-bold text-navy sm:w-44"
 >
 {row.item}
 <span className="block mt-0.5 text-xs font-medium text-faint-blue">{row.basis}</span>
 </th>
 <td className="block sm:table-cell mt-2 sm:mt-0 sm:py-3 sm:px-4 text-muted-blue leading-relaxed">
 <span className="sm:hidden font-bold text-navy">공제율 </span>
 {row.rate}
 </td>
 <td className="block sm:table-cell mt-1 sm:mt-0 sm:py-3 sm:px-4 text-muted-blue leading-relaxed">
 <span className="sm:hidden font-bold text-navy">한도 </span>
 {row.limit}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <p className="text-xs text-faint-blue leading-relaxed mt-3">
 {YEAR_END_LIMITS_SOURCE_NOTE}
 </p>

 {/* 공제 한도 FAQ — 문구는 상단 JsonLd faqLd 와 같은 배열 (speakable .faq-answer 포함) */}
 <h2 className="text-xl font-black text-navy mt-10 mb-6">공제 한도 자주 묻는 질문</h2>
 <div className="space-y-3">
 {YEAR_END_LIMIT_FAQS.map((item) => (
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
 </div>
 </section>
 </main>
 );
}
