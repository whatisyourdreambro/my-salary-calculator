import type { Metadata } from "next";
import Link from "next/link";
import { Home, GitCompare, TrendingUp, Award, HelpCircle } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "디딤돌 vs 보금자리론, 나에게 맞는 대출은? (2025년 총정리)",
  description:
    "생애최초 주택 구매자를 위한 대표 정책 금융 상품, 디딤돌 대출과 보금자리론! 소득, 주택 가격, LTV/DTI, 금리, 한도까지 완벽 비교하고 나에게 딱 맞는 상품을 찾아보세요.",
  openGraph: {
    title: "디딤돌 vs 보금자리론, 나에게 맞는 대출은? (2025년 총정리)",
    description:
      "내 집 마련의 꿈, 어떤 대출이 더 유리할까요? 디딤돌과 보금자리론의 모든 것을 비교 분석해 드립니다.",
    images: ["/api/og?title=디딤돌 vs 보금자리론, 나에게 맞는 대출은?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "디딤돌 vs 보금자리론, 나에게 맞는 대출은? (2025년 총정리)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-04-01",
  dateModified: currentDate,
  description:
    "디딤돌 대출과 보금자리론의 소득, 주택 가격, LTV/DTI 등 핵심 조건부터 금리, 한도까지 한눈에 비교하고 나에게 딱 맞는 상품을 찾아보세요.",
};

const comparisonData = [
  { category: "소득 (부부합산)", didimdol: "연 6천만원 이하", bogeumjari: "연 7천만원 이하" },
  { category: "생애최초/신혼", didimdol: "연 7천만원 이하", bogeumjari: "연 8.5천만원 이하" },
  { category: "주택 가격", didimdol: "5억원 이하", bogeumjari: "시세 6억원 이하" },
  { category: "생애최초", didimdol: "6억원 이하", bogeumjari: "-" },
  { category: "대출 한도", didimdol: "최대 3억원", bogeumjari: "최대 3.6억원" },
  { category: "LTV", didimdol: "최대 70%", bogeumjari: "최대 70% (생애최초 80%)" },
  { category: "DTI", didimdol: "최대 60%", bogeumjari: "최대 60%" },
  { category: "금리 수준", didimdol: "연 2.45% ~ 3.55%", bogeumjari: "연 4%대 초중반" },
];

export default function DidimdolVsBogeumjariGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-gray-900 dark:to-cyan-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            디딤돌 vs 보금자리론,
            <br /> 나에게 맞는 대출은?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-blue-100 dark:text-gray-300">
            내 집 마련의 첫걸음, 주택담보대출. 정부가 지원하는 대표적인 정책 금융 상품인 디딤돌 대출과 보금자리론의 차이점을 명확히 알고 나에게 가장 유리한 선택을 하세요.
          </p>
          <p className="mt-4 text-xs text-blue-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              결혼을 앞둔 신혼부부, 독립을 꿈꾸는 사회초년생이라면 누구나 한 번쯤 '내 집 마련'을 꿈꿉니다. 정부는 무주택 서민의 주거 안정을 위해 디딤돌 대출과 보금자리론이라는 든든한 주택담보대출 상품을 지원하고 있습니다. 두 대출의 가장 큰 차이는 '소득'과 '주택 가격' 조건입니다.
            </p>

            <section className="mt-12 bg-cyan-50 dark:bg-cyan-900/20 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-800">
              <h2 className="!mt-0 !text-2xl font-bold text-cyan-700 flex items-center gap-2">
                <HelpCircle className="w-6 h-6" />
                초간단 자가진단: 나는 어떤 대출?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>1단계: 소득 확인!</strong><br/>
                  <span className="text-sm">부부 합산 연소득이 6천만원(생애최초/신혼 7천만원) 이하라면 금리가 훨씬 낮은 <strong>디딤돌 대출</strong>이 1순위입니다.</span>
                </li>
                <li>
                  <strong>2단계: 주택 가격 확인!</strong><br/>
                  <span className="text-sm">디딤돌 대출 조건에 해당된다면, 매수하려는 주택 가격이 5억원(생애최초 6억원) 이하인지 확인하세요.</span>
                </li>
                <li>
                  <strong>3단계: 조건이 안 맞는다면?</strong><br/>
                  <span className="text-sm">디딤돌 조건에서 하나라도 벗어난다면, 소득 7천만원(신혼 8.5천만원) & 주택가격 6억원 이하 조건의 <strong>보금자리론</strong>을 알아보세요.</span>
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <GitCompare className="w-7 h-7 text-green-500" />
                디딤돌 vs 보금자리론 한눈에 비교 (2025년 기준)
              </h2>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-center">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">구분</th>
                      <th className="py-3 px-4 font-bold text-blue-600">디딤돌 대출</th>
                      <th className="py-3 px-4 font-bold text-orange-500">보금자리론</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {comparisonData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-4 px-4 font-bold">{item.category}</td>
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300 font-medium">{item.didimdol}</td>
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300 font-medium">{item.bogeumjari}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
               <p className="text-xs text-center mt-2 text-gray-500">* 위 조건은 2025년 기준으로, 정부 정책에 따라 변경될 수 있습니다.</p>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Award className="w-6 h-6" /> 놓치면 후회하는 추가 꿀팁
              </h2>
              <ul className="!my-2 space-y-2 text-base">
                <li><strong>체증식 상환을 활용하세요:</strong> 사회초년생, 신혼부부처럼 미래 소득 증가가 예상된다면 초기 상환 부담이 적은 체증식 상환 방식(초기에는 이자만 내다가 점차 원금 상환액을 늘리는 방식)을 고려해볼 수 있습니다. (단, 총 이자 부담은 커질 수 있음)</li>
                <li><strong>우대금리를 꼭 확인하세요:</strong> 다자녀, 신혼가구, 생애최초, 청약통장 가입 등 다양한 우대금리 항목이 있습니다. 중복 적용이 가능한 경우도 있으니 꼼꼼히 챙겨야 합니다.</li>
                <li><strong>보금자리론의 변동성을 기억하세요:</strong> 보금자리론은 정부 예산 및 시장 상황에 따라 신청이 중단되거나 조건이 강화될 수 있습니다. 대출 실행 시점의 공고를 반드시 확인해야 합니다.</li>
              </ul>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <TrendingUp className="w-7 h-7 text-indigo-500" />
                내 조건에 맞는 월 상환액 미리 계산하기
              </h2>
              <p className="mt-4">
                원하는 대출 금액과 기간을 입력하면 매달 얼마를 갚아야 할지 미리 알아볼 수 있습니다. <br />
                Moneysalary 주택담보대출 계산기로 나의 상환 계획을 세워보세요.
              </p>
              <Link
                href="/home-loan"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                주택담보대출 계산기 바로가기 🏠
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}