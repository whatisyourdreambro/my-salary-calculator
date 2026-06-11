
// src/app/table/2026/monthly/page.tsx

import type { Metadata } from "next";
import { generateAnnualSalaryTableData2026 } from "@/lib/generateData2026";
import SalaryTable from "@/components/SalaryTable";
import TableHero from "@/components/TableHero";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "2026 월급 실수령액 표 — 200만~1000만원 전 구간 세후 수령액",
 description:
 "월급 250만원이면 세후 약 218만원, 500만원이면 약 410만원. 2026년 최신 4대보험·소득세 자동 계산표를 200만~1000만원 전 구간으로 한눈에 확인하세요. 전년 대비 변화액까지 즉시 비교 가능.",
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
 "2026년 기준 부양가족이 없는 1인 직장인은 4대보험과 소득세 공제 후 약 218만원을 받습니다. 비과세 식대 포함 여부, 부양가족 수에 따라 금액이 달라질 수 있습니다.",
 },
 {
 question: "월급에서 공제되는 항목은 무엇인가요?",
 answer:
 "국민연금 4.75%, 건강보험 3.595%, 장기요양보험(건강보험료의 13.14%), 고용보험 0.9%가 공제되고, 여기에 근로소득 간이세액표 기준 소득세와 소득세의 10%인 지방소득세가 추가로 공제됩니다.",
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

// JSON-LD for table page — Dataset + FAQ
const monthlyJsonLd = [
 {
 "@context": "https://schema.org",
 "@type": "Dataset",
 name: "2026년 월급별 실수령액 데이터",
 description:
 "2026년 최신 세법 기준 월급 200만원에서 1000만원 이상까지 구간별 실수령액, 4대보험 공제 내역 데이터셋",
 creator: { "@type": "Organization", name: "머니샐러리" },
 url: "https://www.moneysalary.com/table/2026/monthly",
 inLanguage: "ko",
 },
 {
 "@context": "https://schema.org",
 "@type": "FAQPage",
 mainEntity: FAQ_ITEMS.map((item) => ({
 "@type": "Question",
 name: item.question,
 acceptedAnswer: { "@type": "Answer", text: item.answer },
 })),
 },
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
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{ __html: JSON.stringify(monthlyJsonLd) }}
 />
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
 <SalaryTable
 headers={tableHeaders}
 data={allData}
 linkColumnBaseHref="/salary"
 linkValueKey="preTax"
 />

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
 <strong className="text-navy">소득세(근로소득 간이세액표 기준)</strong>를
 공제하고 실제로 통장에 입금되는 금액입니다.
 </p>
 <p className="text-faint-blue leading-relaxed mb-4">
 2026년 최저시급은 10,320원으로, 주휴수당 포함 월 209시간 기준 세전 월급은{" "}
 <strong className="text-navy">2,156,880원</strong>입니다. 본 표는 연봉의
 1/12을 세전 월급으로 환산한 값이므로, 상여금이 별도인 회사는 실제 수령액과
 다를 수 있습니다.
 </p>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
 {[
 { label: "월급 250만원", monthly: "약 218만원" },
 { label: "월급 300만원", monthly: "약 260만원" },
 { label: "월급 400만원", monthly: "약 337만원" },
 { label: "월급 500만원", monthly: "약 410만원" },
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

 <div className="mt-4 text-center text-faint-blue text-sm pb-8">
 * 본 데이터는 2026년 예상 보험료율 인상안을 반영한 시뮬레이션 결과입니다.
 </div>
 </div>
 </main>
 );
}

export default function MonthlyTablePage() {
 return <MonthlyTable />;
}
