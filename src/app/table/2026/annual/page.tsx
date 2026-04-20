
// src/app/table/2026/annual/page.tsx

import { Metadata } from "next";
import { Suspense } from "react";
import { generateAnnualSalaryTableData2026 } from "@/lib/generateData2026";
import Link from "next/link";
import SalaryTable from "@/components/SalaryTable";
import TableHero from "@/components/TableHero";

export const metadata: Metadata = {
  title: "2026 연봉 실수령액 대백과 — 연봉별 세후 월급 전체 표 | 머니샐러리",
  description:
    "2026년 최신 세법 기준 연봉별 실수령액 전체 표. 연봉 2000만원~2억까지 월 실수령액, 국민연금·건강보험·고용보험·소득세 공제액을 한눈에 확인하세요. 전년 대비 변화액도 표시.",
  keywords: [
    "연봉 실수령액 표",
    "2026 연봉 계산기",
    "연봉별 실수령액",
    "세후 월급 표",
    "연봉 3000 실수령액",
    "연봉 4000 실수령액",
    "연봉 5000 실수령액",
    "연봉 6000 실수령액",
    "연봉 7000 실수령액",
    "연봉 1억 실수령액",
    "4대보험 공제액",
    "2026 세법",
  ].join(", "),
  openGraph: {
    title: "2026 연봉 실수령액 대백과 — 연봉별 세후 월급 전체 표",
    description:
      "연봉 2000만원~2억 구간별 2026년 세후 월급, 공제액을 즉시 확인하세요.",
    url: "https://www.moneysalary.com/table/annual",
    siteName: "머니샐러리",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "2026 연봉 실수령액 대백과 표 | 머니샐러리",
    description: "연봉별 세후 월급·공제액 전체 표. 2026 최신 세법 반영.",
  },
  alternates: {
    canonical: "https://www.moneysalary.com/table/annual",
  },
};

const tableHeaders = [
  { key: "preTax", label: "연봉" },
  { key: "monthlyNet", label: "2026 예상 월 실수령" },
  { key: "changeValue", label: "변화값 (전년비)" },
  { key: "totalDeduction", label: "공제총액" },
  { key: "pension", label: "국민연금" },
  { key: "health", label: "건강보험" },
  { key: "employment", label: "고용보험" },
  { key: "incomeTax", label: "소득세" },
];

// JSON-LD for table page
const tableJsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "2026년 연봉별 실수령액 데이터",
  description:
    "2026년 최신 세법 기준 연봉 2000만원에서 2억까지 구간별 월 실수령액, 4대보험 공제 내역 데이터셋",
  creator: { "@type": "Organization", name: "머니샐러리" },
  url: "https://www.moneysalary.com/table/annual",
  inLanguage: "ko",
};

function AnnualTable() {
  const allData = generateAnnualSalaryTableData2026();
  const highlightRows = [26000000, 30000000, 50000000, 80000000, 100000000];

  return (
    <main className="w-full bg-background min-h-screen pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tableJsonLd) }}
      />
      <TableHero
        badgeText="2026년 최신 데이터 반영"
        title={
          <>
            2026 연봉 실수령액 <br className="sm:hidden" />
            <span className="text-electric whitespace-nowrap">
              대백과
            </span>
          </>
        }
        description={
          <>
            당신의 진짜 가치를 숫자로 확인하세요. <br className="hidden sm:block" />
            2026년 최신 세법 기준, 연봉 구간별 상세 공제 내역과 실수령액을 한눈에 비교해 드립니다.
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <SalaryTable
          headers={tableHeaders}
          data={allData}
          highlightRows={highlightRows}
        />

        {/* SEO 텍스트 콘텐츠 — 체류시간 + 검색엔진 */}
        <section className="mt-12 mb-8 max-w-4xl mx-auto">
          <div
            className="rounded-2xl p-8"
            style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #DDE4EC" }}
          >
            <h2 className="text-2xl font-black text-navy mb-4">
              2026년 연봉 실수령액이란?
            </h2>
            <p className="text-faint-blue leading-relaxed mb-4">
              연봉 실수령액은 세전 연봉에서 <strong className="text-navy">국민연금(4.5%)</strong>,{" "}
              <strong className="text-navy">건강보험(3.545%)</strong>,{" "}
              <strong className="text-navy">장기요양보험(건강보험의 12.95%)</strong>,{" "}
              <strong className="text-navy">고용보험(0.9%)</strong>, 그리고{" "}
              <strong className="text-navy">소득세(근로소득 간이세액표 기준)</strong>를
              공제하고 실제로 받는 금액입니다.
            </p>
            <p className="text-faint-blue leading-relaxed mb-4">
              2026년에는 건강보험료율 소폭 인상이 예정되어 있어, 동일 연봉이라도
              전년 대비 실수령액이 소폭 감소할 수 있습니다. 위 표의{" "}
              <strong className="text-navy">변화값(전년비)</strong> 항목에서 감소폭을
              확인하세요.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {[
                { label: "연봉 3천만원", monthly: "216만원" },
                { label: "연봉 5천만원", monthly: "357만원" },
                { label: "연봉 7천만원", monthly: "490만원" },
                { label: "연봉 1억원",  monthly: "678만원" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="text-center p-4 rounded-xl"
                  style={{ backgroundColor: "#EDF1F5" }}
                >
                  <div className="text-xs font-bold text-faint-blue mb-1">{item.label}</div>
                  <div className="text-lg font-black text-electric">월 {item.monthly}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-4 text-center text-faint-blue text-sm pb-8">
          * 본 데이터는 2026년 예상 보험료율 인상안을 반영한 시뮬레이션 결과이며, 실제 확정치와 다를 수 있습니다.
        </div>
      </div>
    </main>
  );
}

export default function AnnualTablePage() {
  return <AnnualTable />;
}
