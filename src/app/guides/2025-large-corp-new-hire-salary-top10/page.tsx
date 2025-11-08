
import type { Metadata } from "next";
import Link from "next/link";
import { Building, TrendingUp, Award, Briefcase, Calculator } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "2025년 대기업 신입 '영끌' 연봉 TOP 10 (성과급 포함)",
  description:
    "취준생 필독! 2025년 삼성, SK하이닉스, 현대차, 네이버 등 주요 대기업의 '영끌' 신입 초봉 순위를 공개합니다. 계약 연봉과 성과급을 포함한 실질 연봉을 확인하고 당신의 목표를 설정하세요.",
  openGraph: {
    title: "2025년 대기업 신입 '영끌' 연봉 TOP 10 (성과급 포함)",
    description:
      "대기업 신입 초봉, 당신의 미래를 바꿀 수 있습니다. 2025년 최고 연봉 기업들을 지금 바로 확인하세요.",
    images: ["/api/og?title=2025년 대기업 신입 '영끌' 연봉 TOP 10"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "2025년 대기업 신입 '영끌' 연봉 TOP 10 (성과급 포함)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-07-15",
  dateModified: currentDate,
  description:
    "2025년 최신 데이터를 바탕으로 삼성, SK하이닉스 등 주요 대기업의 '영끌' 신입사원 초봉 순위를 공개합니다.",
};

const top10SalaryData = [
    { rank: 1, company: "SK하이닉스", industry: "반도체", base: "약 5,300만원", bonus: "성과급(PS) 포함 시 1억 초중반", gist: "반도체 호황기, 압도적인 성과급으로 1위" },
    { rank: 2, company: "삼성전자 (DS)", industry: "반도체", base: "약 5,300만원", bonus: "성과급(OPI) 포함 시 1억 내외", gist: "성과급에 따라 순위 변동, 여전한 업계 최상위" },
    { rank: 3, company: "네이버/카카오", industry: "IT 플랫폼", base: "약 6,000만원", bonus: "스톡옵션, 성과급 별도", gist: "개발자 확보 경쟁으로 높은 초봉 유지" },
    { rank: 4, company: "현대자동차", industry: "완성차", base: "약 7,000만원 이상", bonus: "각종 수당, 성과급 포함 시 1억 근접", gist: "전통의 강자, 높은 기본급과 안정성" },
    { rank: 5, company: "LG에너지솔루션", industry: "배터리", base: "약 5,500만원", bonus: "성과급 포함 시 8천만원 이상", gist: "미래 성장성을 바탕으로 보상 확대" },
    { rank: 6, company: "SK텔레콤", industry: "통신", base: "약 5,300만원", bonus: "안정적인 성과급, 높은 복지 수준", gist: "안정성과 높은 복지를 겸비한 직장" },
    { rank: 7, company: "S-OIL", industry: "정유/화학", base: "약 5,400만원", bonus: "높은 성과급으로 '기름집' 명성 유지", gist: "업황에 따른 성과급 변동폭이 큼" },
    { rank: 8, company: "삼성SDS", industry: "IT 서비스", base: "약 5,000만원 후반", bonus: "안정적인 IT 대기업", gist: "네카라쿠배 대비 낮은 대신 안정성 확보" },
    { rank: 9, company: "KB국민은행", industry: "금융", base: "약 6,000만원 이상", bonus: "높은 초봉, 안정적인 금융권의 상징", gist: "초봉이 매우 높고, 안정적인 커리어" },
    { rank: 10, company: "CJ제일제당", industry: "식품", base: "약 5,500만원", bonus: "업계 최고 대우, 안정적인 성장", gist: "식품업계의 삼성, 꾸준한 성과" },
];

export default function Top10LargeCorpSalary2025Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-blue-700 to-indigo-800 dark:from-gray-900 dark:to-blue-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            2025년 대기업 신입 '영끌' 연봉 TOP 10
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            취업 준비생이라면 누구나 꿈꾸는 대기업! 2025년 최신 데이터를 바탕으로, 계약 연봉과 성과급을 모두 더한 '실질 초봉' 순위를 공개합니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              대기업 연봉은 단순히 '기본급'만으로 평가할 수 없습니다. 연말에 터지는 성과급(PS/OPI 등)과 각종 수당을 모두 더한 '영끌 연봉'이야말로 진짜 내 소득입니다. 최근 IT/반도체 인재 확보 경쟁이 치열해지면서, 신입 초봉 1억 시대가 현실이 되고 있습니다.
            </p>

            <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
                <Award className="w-6 h-6" />
                왜 이 기업들의 연봉이 높을까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li><strong>반도체/IT 업계:</strong> 글로벌 인재 확보 경쟁이 가장 치열한 분야로, 높은 성과급과 사이닝 보너스, 스톡옵션 등으로 최고의 대우를 보장합니다.</li>
                <li><strong>자동차/정유 업계:</strong> 전통적인 고연봉 산업으로, 강력한 노조와 높은 이익을 바탕으로 안정적인 고임금 구조를 유지하고 있습니다.</li>
                <li><strong>금융권:</strong> 높은 수준의 초봉과 안정성을 바탕으로 여전히 최고의 직장 중 하나로 꼽힙니다.</li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <Building className="w-7 h-7 text-green-500" />
                2025년 대기업 신입 '영끌' 연봉 순위
              </h2>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {top10SalaryData.map((item) => (
                  <div key={item.rank} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 flex flex-col">
                    <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                      <span className="font-bold text-lg text-blue-500">{item.rank}.</span> {item.company}
                    </h3>
                    <div className="text-sm space-y-1 mt-2 flex-grow">
                        <p className="!my-1"><strong>산업군:</strong> {item.industry}</p>
                        <p className="!my-1"><strong>계약 초봉:</strong> {item.base}</p>
                        <p className="!my-1"><strong>성과급 포함:</strong> <span className="font-semibold text-blue-600 dark:text-blue-400">{item.bonus}</span></p>
                        <p className="!my-1 mt-2 pt-2 border-t dark:border-gray-600"><strong>한줄평:</strong> {item.gist}</p>
                    </div>
                  </div>
                ))}
              </div>
               <p className="text-xs text-center mt-4 text-gray-500">* 위 금액은 공시 자료, 언론 보도 등을 종합한 추정치이며, 직무/개인/회사 실적에 따라 실제와 차이가 있을 수 있습니다.</p>
            </section>

            <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">
                초봉 6,000만원, 내 첫 월급은 얼마?
              </h2>
              <p className="mt-4 max-w-xl mx-auto">
                꿈에 그리던 첫 연봉, 세금과 4대보험을 떼고 나면 통장에 얼마가 찍힐까요? '연봉 계산기'로 당신의 소중한 첫 월급 실수령액을 미리 확인해보세요.
              </p>
              <Link
                href="/salary"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                <Calculator className="inline-block w-5 h-5 mr-2" />
                내 첫 월급 실수령액 계산하기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
