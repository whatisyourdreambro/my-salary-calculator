
import type { Metadata } from "next";
import Link from "next/link";
import { Building, EyeOff, TrendingUp, Briefcase } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "공기업 연봉, 블라인드 채용 시대의 현실: 안정성 vs 고연봉",
  description:
    "안정성의 대명사, 공기업! 하지만 연봉은 어떨까요? 블라인드 채용이 정착된 2025년, 주요 공기업의 연봉 수준과 복지, 그리고 블라인드 채용 합격을 위한 전략을 상세히 분석합니다.",
  openGraph: {
    title: "공기업 연봉, 블라인드 채용 시대의 현실: 안정성 vs 고연봉",
    description:
      "학벌, 스펙 없이 오직 실력으로! 블라인드 채용 시대, 공기업 연봉과 취업 전략의 모든 것을 알려드립니다.",
    images: ["/api/og?title=공기업 연봉, 블라인드 채용 시대"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "공기업 연봉, 블라인드 채용 시대의 현실: 안정성 vs 고연봉",
  author: {
    "@type": "Organization",
    name: "Moneysalary",
  },
  publisher: {
    "@type": "Organization",
    name: "Moneysalary",
    logo: {
      "@type": "ImageObject",
      url: "https://www.moneysalary.com/favicon.ico",
    },
  },
  datePublished: "2025-10-28",
  dateModified: currentDate,
  description:
    "2025년, 주요 공기업의 연봉 수준과 복지, 그리고 블라인드 채용 합격을 위한 전략을 상세히 분석합니다.",
};

const publicCorpSalaryData = [
  { corp: "한국전력공사", avgSalary: "7,000만원 ~ 8,000만원", note: "안정적인 에너지 공기업" },
  { corp: "한국수력원자력", avgSalary: "7,500만원 ~ 8,500만원", note: "원자력 발전 전문" },
  { corp: "인천국제공항공사", avgSalary: "7,000만원 ~ 8,000만원", note: "높은 복지 수준" },
  { corp: "한국철도공사 (코레일)", avgSalary: "6,000만원 ~ 7,000만원", note: "교통 인프라 핵심" },
  { corp: "국민건강보험공단", avgSalary: "6,500만원 ~ 7,500만원", note: "사회 안전망 담당" },
];

export default function PublicEnterpriseSalaryGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-teal-500 to-cyan-600 dark:from-gray-900 dark:to-teal-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            공기업 연봉,
            <br /> 블라인드 채용 시대의 현실
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-cyan-100 dark:text-gray-300">
            '신의 직장'이라 불리며 많은 취준생들의 꿈이 된 공기업. 블라인드 채용으로 오직 실력만 본다는데, 과연 연봉은 어떨까요? 주요 공기업의 연봉과 복지, 그리고 합격 전략을 파헤쳐봅니다.
          </p>
          <p className="mt-4 text-xs text-cyan-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              공기업은 높은 고용 안정성과 준수한 복지 혜택으로 꾸준히 인기를 얻고 있습니다. 특히 블라인드 채용 도입 이후, 학벌이나 스펙보다는 직무 역량과 인성을 중시하는 채용 문화가 정착되면서 더욱 많은 구직자들에게 기회의 문을 열어주고 있습니다. 하지만 공기업의 연봉은 사기업에 비해 낮다는 인식이 있는데, 과연 사실일까요? 주요 공기업의 연봉 수준과 블라인드 채용 합격 전략을 상세히 분석해 드립니다.
            </p>

            <section className="mt-12 bg-teal-50 dark:bg-teal-900/20 p-6 rounded-2xl border border-teal-200 dark:border-teal-800">
              <h2 className="!mt-0 !text-2xl font-bold text-teal-700 flex items-center gap-2">
                <EyeOff className="w-6 h-6" />
                블라인드 채용, 연봉에 미치는 영향은?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>평등한 기회:</strong> 학벌, 출신지, 가족 관계 등 불필요한 정보가 배제되어 오직 직무 역량으로만 평가받습니다. 이는 연봉 협상 시에도 개인의 역량과 기여도를 중심으로 논의될 수 있는 기반을 마련합니다.
                </li>
                <li>
                  <strong>직무 중심 평가:</strong> NCS(국가직무능력표준) 기반의 채용이 이루어지므로, 직무 관련 경험과 지식이 연봉 및 직급 결정에 중요한 요소가 됩니다.
                </li>
                <li>
                  <strong>안정적인 연봉 상승:</strong> 사기업처럼 급격한 연봉 상승은 어렵지만, 호봉제와 성과급을 통해 꾸준하고 안정적인 연봉 상승을 기대할 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <Building className="w-7 h-7 text-purple-500" />
                주요 공기업 평균 연봉 (2025년 예상)
              </h2>
              <p className="text-center">
                알리오(ALIO) 공시 자료 및 현직자 인터뷰를 종합하여 추정한 주요 공기업의 평균 연봉입니다. (신입 초봉 기준, 성과급 및 각종 수당 포함)
              </p>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">공기업명</th>
                      <th className="py-3 px-4 font-bold text-signature-blue">평균 연봉 (예상)</th>
                      <th className="py-3 px-4 font-semibold">주요 특징</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {publicCorpSalaryData.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="py-4 px-4 font-bold">{item.corp}</td>
                        <td className="py-4 px-4 font-semibold text-signature-blue">
                          {item.avgSalary}
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-sm">
                          {item.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
               <p class="text-xs text-center mt-2 text-gray-500">* 위 금액은 추정치이며, 직무, 개인 성과, 회사 실적에 따라 실제와 차이가 있을 수 있습니다.</p>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Briefcase className="w-7 h-7 text-indigo-500" />
                블라인드 채용, 어떻게 준비해야 할까?
              </h2>
              <p>
                학벌, 스펙보다는 직무 역량이 중요해진 블라인드 채용 시대. <br />
                NCS 기반의 직무 지식과 경험, 그리고 면접에서의 인성 평가가 합격의 핵심입니다.
              </p>
              <Link
                href="/guides/salary-negotiation"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                공기업 취업 전략 가이드 보기 🚀
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
