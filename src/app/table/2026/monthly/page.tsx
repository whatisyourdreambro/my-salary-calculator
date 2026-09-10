
// src/app/table/2026/monthly/page.tsx

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { generateAnnualSalaryTableData2026 } from "@/lib/generateData2026";
import SalaryTable from "@/components/SalaryTable";
import TableHero from "@/components/TableHero";
import { CalcResultAd, Display2Ad, HomeTopAd, InArticleAd } from "@/components/AdPlacement";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, datasetLd, faqLd } from "@/lib/structuredData";
import SeasonalLinks from "../SeasonalLinks";
import FavoritesButton from "@/components/FavoritesButton";
import { SALARY_CALCULATION_METHOD_HREF, SALARY_MODEL_2026 } from "@/lib/salaryModelContent";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 월급 실수령액 표 — 200만~1000만원 전 구간 세후 수령액",
 description:
 "세전 월급 250만원은 세후 약 223만원, 500만원은 약 415만원으로 추정합니다. 급여에 포함된 월 비과세 20만원·본인 1명·자녀 0명 기준으로, 연봉을 12개월로 나눈 2026년 예상 월 수령액과 공제 내역을 비교하세요.",
 path: "/table/2026/monthly",
 keywords: [
 "월급 실수령액 표",
 "2026 월급 계산기",
 "월급별 실수령액",
 "최저월급 2026",
 "세후 월급 계산",
 "월급 250만원 실수령",
 "월급 300만원 실수령",
 "월급 400만원 실수령",
 "월급 500만원 실수령",
 "월급 700만원 실수령",
 "4대보험 공제액",
 ],
});

const tableHeaders = [
 { key: "monthlyPreTax", label: "월급 (세전)" },
 { key: "monthlyNet", label: "월 실수령액" },
 { key: "totalDeduction", label: "공제총액" },
 { key: "pension", label: "국민연금" },
 { key: "health", label: "건강보험" },
 { key: "employment", label: "고용보험" },
 { key: "incomeTax", label: "소득세" },
];

const FAQ_ITEMS = [
 {
 question: "월급 250만원의 실수령액은 얼마인가요?",
 answer:
 `세전 월급을 연 3,000만원으로 환산하면 2026년 모델의 예상 월 수령액은 약 223만원입니다 (${SALARY_MODEL_2026.defaultConditions} 기준). 실제 지급액은 비과세 항목과 부양가족 수, 급여 정산 방식에 따라 달라질 수 있습니다.`,
 },
 {
 question: "월급에서 공제되는 항목은 무엇인가요?",
 answer:
 `근로자 부담 국민연금 4.75%, 건강보험 3.595%, 장기요양보험(건강보험료의 13.14%), 고용보험 0.9%를 항목별 보수 기준과 조건으로 계산합니다. 소득세와 그 10%인 지방소득세도 공제합니다. ${SALARY_MODEL_2026.incomeTaxMethod} ${SALARY_MODEL_2026.limitation}`,
 },
 {
 question: "2026년 최저임금 월급은 얼마인가요?",
 answer:
 "2026년 최저시급 10,320원 기준, 주휴수당 포함 월 209시간 근무 시 세전 2,156,880원입니다. 여기서 4대보험과 소득세를 공제한 금액이 실수령액입니다.",
 },
 {
 question: "연봉 기준 표와는 어떻게 다른가요?",
 answer:
 "본 표는 연봉의 1/12을 세전 월급으로 환산해 보여줍니다. 상여금·성과급이 별도로 지급되는 회사라면 실제 월 수령액과 차이가 있을 수 있으니 연봉 기준 표도 함께 확인하세요.",
 },
];

// JSON-LD for table page — datasetLd 빌더로 dateModified(신선도 신호) 부여 + FAQ + breadcrumb
const monthlyJsonLd = [
 datasetLd({
 name: "2026년 월급별 실수령액 데이터",
 description:
 `2026년 연봉 표를 12개월로 나눈 세전 월급과 예상 월 수령액·보험료·세금 공제 내역. ${SALARY_MODEL_2026.defaultConditions} 기준.`,
 url: "/table/2026/monthly",
 dateModified: "2026-08-30",
 keywords: ["월급", "실수령액", "세후 월급", "월급 테이블", "2026년"],
 }),
 faqLd(FAQ_ITEMS),
 autoBreadcrumbLd("/table/2026/monthly", { leafName: "2026 월급 실수령액 표" }),
];

// 서버 컴포넌트는 데이터 로직에만 집중합니다.
function MonthlyTable() {
 const rawData = generateAnnualSalaryTableData2026();
 const allData = rawData.map(d => ({
 ...d,
 monthlyPreTax: Math.floor(d.preTax / 12)
 }));

 return (
 <main className="w-full bg-background min-h-screen pb-20">
 <JsonLd data={monthlyJsonLd} />
 <TableHero
 badgeText="2026년 최신 데이터 반영"
 title={
 <>
 2026 월급 실수령액 <br className="sm:hidden" />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80 whitespace-nowrap">
 미리보기
 </span>
 </>
 }
 description={
 <>
 2026년 최저월급은 약 216만원입니다. (<span className="text-primary font-bold">10,320원</span> 기준)<br />
 내 월급의 세후 수령액 변화를 미리 확인해보세요.
 </>
 }
 />

 <div className="page-width -mt-20 relative z-10">
 {/* 표 1/3·2/3 지점 광고 — layout 하단 PageFooterAds 의 InArticle·HomeTop 사본은 dedup 으로 죽고 이곳이 산다(유닛 수 불변, 2026-09-11) */}
 <SalaryTable
 headers={tableHeaders}
 data={allData}
 linkColumnBaseHref="/salary"
 linkValueKey="preTax"
 interstitials={[
 { afterRow: Math.round(allData.length / 3), node: <InArticleAd /> },
 { afterRow: Math.round((allData.length * 2) / 3), node: <HomeTopAd /> },
 ]}
 />

 {/* 운영자 승인 광고 배치(2026-07-07): 표와 SEO 본문 사이 — 표 전 구간 무광고였음 */}
 <CalcResultAd />

 {/* 월급 축 상세 리포트 진입로 (2026-08-15 Phase 3) — /monthly/* 트리 크롤·탐색 허브.
     금액은 monthlyStaticParams 격자 위 값만 사용 (내부 404 방지) */}
 <section className="mt-10 max-w-4xl mx-auto">
 <h2 className="text-lg font-black text-navy mb-4">월급별 상세 리포트</h2>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {[2_000_000, 2_500_000, 3_000_000, 3_500_000, 4_000_000, 4_500_000, 5_000_000, 6_000_000].map((m) => (
 <Link
 key={m}
 href={`/monthly/${m}`}
 className="p-3 bg-white rounded-xl border border-canvas-200 text-center text-sm font-bold text-navy hover:border-primary transition-colors"
 >
 월급 {Math.round(m / 10_000).toLocaleString("ko-KR")}만원
 </Link>
 ))}
 </div>
 </section>

 {/* SEO 텍스트 콘텐츠 — 체류시간 + 검색엔진 */}
 <section className="mt-12 mb-8 max-w-4xl mx-auto">
 <div
 className="rounded-2xl p-8"
 style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #DDE4EC" }}
 >
 <h2 className="text-2xl font-black text-navy mb-4">
 2026년 월급 실수령액이란?
 </h2>
 <p className="text-faint-blue leading-relaxed mb-4">
 월급 실수령액은 세전 월급에서 <strong className="text-navy">국민연금(4.75%)</strong>,{" "}
 <strong className="text-navy">건강보험(3.595%)</strong>,{" "}
 <strong className="text-navy">장기요양보험(건강보험료의 13.14%)</strong>,{" "}
 <strong className="text-navy">고용보험(0.9%)</strong>, 그리고{" "}
 <strong className="text-navy">소득세·지방소득세</strong>를
 공제한 금액입니다. 이 표는 항목별 조건을 적용한 예상액이며 실제 지급액과 다를 수 있습니다.
 {" "}{SALARY_MODEL_2026.incomeTaxMethod} {SALARY_MODEL_2026.limitation}
 </p>
 <p className="text-faint-blue leading-relaxed mb-4">
 2026년 최저시급은 10,320원으로, 주휴수당 포함 월 209시간 기준 세전 월급은{" "}
 <strong className="text-navy">2,156,880원</strong>입니다. 본 표는 연봉의
 1/12을 세전 월급으로 환산한 값이므로, 상여금이 별도인 회사는 실제 수령액과
 다를 수 있습니다.
 </p>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
 {/* 수치는 generateData2026(상세 페이지와 동일 엔진·식대 20만 기준) 결과와 동기 — 2026-08-30 통일 */}
 {[
 { label: "월급 250만원", monthly: "약 223만원" },
 { label: "월급 300만원", monthly: "약 263만원" },
 { label: "월급 400만원", monthly: "약 340만원" },
 { label: "월급 500만원", monthly: "약 415만원" },
 ].map((item) => (
 <div
 key={item.label}
 className="text-center p-4 rounded-xl"
 style={{ backgroundColor: "#EDF1F5" }}
 >
 <div className="text-xs font-bold text-faint-blue mb-1">{item.label}</div>
 <div className="text-lg font-black text-electric">세후 {item.monthly}</div>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* FAQ */}
 <section className="mb-8 max-w-4xl mx-auto">
 <div
 className="rounded-2xl p-8"
 style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #DDE4EC" }}
 >
 <h2 className="text-2xl font-black text-navy mb-6">자주 묻는 질문</h2>
 <div className="space-y-6">
 {FAQ_ITEMS.map((item) => (
 <div key={item.question}>
 <h3 className="font-bold text-navy mb-2">Q. {item.question}</h3>
 <p className="text-faint-blue leading-relaxed text-sm">{item.answer}</p>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* 실험 #1 (docs/ad-experiments.md, 운영자 승인 2026-08-17): display-2 추가 배치.
     env NEXT_PUBLIC_ADSENSE_SLOT_DISPLAY_2 미설정 시 자동 미렌더. */}
 <div className="mt-10">
 <Display2Ad />
 </div>

 {/* 시즌 크로스링크 — 표 유입을 시즌 피크 페이지로 라우팅 (2026-07-16, 광고 슬롯과 무관한 본문 영역) */}
 <SeasonalLinks />

 {/* 즐겨찾기 락인 — 재방문 수요 큰 표 페이지 (2026-08-17, 광고 아래 영역) */}
 <div className="mt-6 flex justify-center">
 <FavoritesButton path="/table/2026/monthly" title="2026 월급 실수령액 표" />
 </div>

 <div className="mt-4 text-center text-faint-blue text-sm pb-8">
 * {SALARY_MODEL_2026.defaultConditions} 기준으로, 각 행의 상세 페이지와 같은 계산 모델을 사용합니다.{" "}
 <Link href={SALARY_CALCULATION_METHOD_HREF} className="text-link underline underline-offset-4">계산 방식과 적용 조건</Link>을 확인하세요.
 </div>
 </div>
 </main>
 );
}

export default function MonthlyTablePage() {
 return <MonthlyTable />;
}
