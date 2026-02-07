// src/app/table/annual/page.tsx

import { Suspense } from "react";
import { generateAnnualSalaryTableData } from "@/lib/generateData";
import { HelpCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import AnnualTableInteractive from "./AnnualTableInteractive";
import TableHero from "@/components/TableHero";


const tableHeaders = [
  { key: "preTax", label: "연봉" },
  { key: "monthlyNet", label: "월 실수령액" },
  { key: "totalDeduction", label: "월 공제액 합계" },
  { key: "pension", label: "국민연금" },
  { key: "health", label: "건강보험" },
  { key: "employment", label: "고용보험" },
  { key: "incomeTax", label: "소득세" },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "DataSet",
  name: "2025년 연봉 실수령액 표",
  description:
    "2025년 최신 세법 기준 연봉 구간별 월 예상 실수령액, 4대보험, 소득세 등 상세 공제 내역 데이터 표입니다.",
  url: "https://www.moneysalary.com/table/annual",
  creator: {
    "@type": "Organization",
    name: "Moneysalary",
  },
  license: "https://www.moneysalary.com",
  keywords: ["연봉", "실수령액", "세후 월급", "연봉 테이블", "2025년"],
};

// 서버 컴포넌트는 데이터 로직에만 집중합니다.
function AnnualTable() {
  const allData = generateAnnualSalaryTableData();
  const highlightRows = [30000000, 50000000, 80000000, 100000000];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="w-full bg-background">
        <TableHero
          badgeText="2025년 최신 세법 기준"
          title={
            <>
              2025 연봉 실수령액 <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                대백과
              </span>
            </>
          }
          description={
            <>
              당신의 진짜 가치를 숫자로 확인하세요. <br className="hidden sm:block" />
              2025년 최신 세법 기준, 연봉 구간별 상세 공제 내역과 실수령액을 한눈에 비교해 드립니다.
            </>
          }
        />

        <Suspense fallback={<div>Loading...</div>}>
          <AnnualTableInteractive
            allData={allData}
            tableHeaders={tableHeaders}
            highlightRows={highlightRows}
          />
        </Suspense>

        <div className="w-full py-16">
          <section>
            <h2 className="text-3xl font-bold text-center mb-10 text-foreground flex items-center justify-center gap-3">
              <HelpCircle className="w-8 h-8 text-primary" />
              연봉에 대한 모든 궁금증 (Q&A)
            </h2>
            <div className="space-y-16">
              {/* Premium Q&A Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-zinc-900/40 backdrop-blur-2xl p-8 rounded-3xl shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                  <h3 className="font-bold text-xl mb-4 text-zinc-100 flex items-center gap-2">
                    <span className="text-emerald-400">Q.</span> '세전', '세후'는 무슨 뜻인가요?
                  </h3>
                  <p className="text-zinc-400 leading-relaxed">
                    <strong>세전 연봉</strong>은 회사와 계약한 금액 총액을
                    의미하며, <strong>세후 실수령액</strong>은 이 세전 연봉에서
                    4대보험(국민연금, 건강보험, 고용보험, 산재보험)과 소득세(국세, 지방세) 등 각종 공제 항목을 제외하고
                    실제 통장에 입금되는 금액을 말합니다.
                  </p>
                </div>
                <div className="bg-zinc-900/40 backdrop-blur-2xl p-8 rounded-3xl shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                  <h3 className="font-bold text-xl mb-4 text-zinc-100 flex items-center gap-2">
                    <span className="text-emerald-400">Q.</span> 연봉이 같아도 실수령액이 다른 이유는?
                  </h3>
                  <p className="text-zinc-400 leading-relaxed">
                    <strong>비과세 수당(식대 20만원 등)</strong>, 부양가족 수,
                    그리고 <strong>연말정산 결과</strong>에 따라 매월 공제되는 세금(원천징수액)이 달라지기 때문입니다.
                    머니샐러리 계산기에서 상세 조건을 입력하면 나만의 정확한 실수령액을 확인할 수 있습니다.
                  </p>
                  <Link
                    href="/"
                    className="text-emerald-400 font-semibold mt-6 inline-flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    내 조건으로 정확히 계산하기 <TrendingUp className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* SEO Content Section */}
              <div className="bg-zinc-900/40 backdrop-blur-2xl p-8 md:p-12 rounded-3xl border border-white/10">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
                  2025년 연봉 실수령액, 무엇이 달라졌나요?
                </h2>
                <div className="space-y-8 text-zinc-300 leading-relaxed">
                  <div>
                    <h3 className="text-xl font-semibold text-zinc-100 mb-3">1. 식대 비과세 한도 확대 유지</h3>
                    <p>
                      작년부터 식대 비과세 한도가 월 10만원에서 <strong>20만원</strong>으로 확대되었습니다.
                      이는 연봉 5,000만원 기준, 연간 약 20~30만원의 세금 절감 효과를 가져옵니다.
                      머니샐러리 표는 이 비과세 한도를 기본적으로 반영하여 계산되었습니다.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-zinc-100 mb-3">2. 소득세 과표 구간 조정</h3>
                    <p>
                      서민·중산층 세부담 완화를 위해 소득세 과세표준 하위 구간이 조정되었습니다.
                      1,400만원 이하 구간(6%)과 5,000만원 이하 구간(15%)이 유지/조정되면서,
                      실질적인 세후 소득이 소폭 상승하는 효과가 있습니다.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-zinc-100 mb-3">3. 4대보험 요율 변동 확인</h3>
                    <p>
                      장기요양보험료율 등 매년 미세하게 변동되는 4대보험 요율을 2025년 최신 기준으로 완벽하게 반영했습니다.
                      건강보험료와 국민연금 상한액 변동까지 고려된 가장 정확한 데이터를 확인하세요.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default function AnnualTablePage() {
  return <AnnualTable />;
}
