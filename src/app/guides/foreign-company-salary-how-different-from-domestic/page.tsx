
import type { Metadata } from "next";
import Link from "next/link";
import { Globe, DollarSign, Briefcase, Handshake } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "외국계 기업 연봉, 국내 기업과 무엇이 다를까? (성과주의 vs 연공서열)",
  description:
    "높은 연봉과 수평적인 문화, 외국계 기업은 정말 다를까? 국내 기업과의 연봉 체계(기본급, 성과급, 스톡옵션), 복지, 기업 문화, 그리고 커리어 성장 경로까지 상세히 비교 분석합니다. 외국계 기업 취업을 위한 팁도 놓치지 마세요.",
  openGraph: {
    title: "외국계 기업 연봉, 국내 기업과 무엇이 다를까? (성과주의 vs 연공서열)",
    description:
      "글로벌 기업의 문을 두드리는 당신을 위한 가이드. 외국계 기업의 연봉과 문화, 국내 기업과의 차이점을 명확히 알려드립니다.",
    images: ["/api/og?title=외국계 기업 연봉, 국내와 다른 점은?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "외국계 기업 연봉, 국내 기업과 무엇이 다를까? (성과주의 vs 연공서열)",
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
    "국내 기업과의 연봉 체계(기본급, 성과급, 스톡옵션), 복지, 기업 문화, 그리고 커리어 성장 경로까지 상세히 비교 분석합니다. 외국계 기업 취업을 위한 팁도 놓치지 마세요.",
};

export default function ForeignCompanySalaryGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-purple-500 to-pink-600 dark:from-gray-900 dark:to-purple-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            외국계 기업 연봉,
            <br /> 국내 기업과 무엇이 다를까?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-pink-100 dark:text-gray-300">
            높은 연봉, 수평적인 문화, 글로벌 커리어 기회. 외국계 기업은 많은 직장인들의 로망입니다. 하지만 국내 기업과 어떤 점이 다르고, 나에게 더 맞는 곳은 어디일까요? 연봉부터 문화까지 샅샅이 비교해 드립니다.
          </p>
          <p className="mt-4 text-xs text-pink-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              외국계 기업은 국내 기업과는 다른 채용 방식, 연봉 체계, 그리고 기업 문화를 가지고 있습니다. 특히 '성과주의'를 기반으로 한 보상 시스템은 개인의 역량에 따라 국내 기업보다 훨씬 높은 연봉을 받을 수 있는 기회를 제공합니다. 하지만 동시에 높은 성과 압박과 치열한 경쟁을 감수해야 하기도 합니다. 외국계 기업으로의 이직을 고민하고 있다면, 이 가이드를 통해 충분히 이해하고 준비하세요.
            </p>

            <section className="mt-12 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h2 className="!mt-0 !text-2xl font-bold text-purple-600 flex items-center gap-2">
                <Globe className="w-6 h-6" />
                외국계 기업 연봉, 국내와 다른 3가지 특징
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>성과주의 보상:</strong> 연공서열보다는 개인의 성과와 역량에 따라 연봉이 결정됩니다. 기본급 외에 인센티브, 보너스, 스톡옵션 등 변동급의 비중이 높습니다.
                </li>
                <li>
                  <strong>높은 초봉과 빠른 연봉 상승:</strong> 신입 초봉이 국내 대기업보다 높은 경우가 많으며, 성과에 따라 연봉 상승률도 가파릅니다.
                </li>
                <li>
                  <strong>글로벌 스탠다드:</strong> 본사의 연봉 정책을 따르는 경우가 많아, 국내 시장 상황과 관계없이 글로벌 기준의 높은 연봉을 받을 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <Handshake className="w-7 h-7 text-green-500" />
                외국계 vs 국내 기업, 연봉 및 문화 비교
              </h2>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">구분</th>
                      <th className="py-3 px-4 font-bold text-blue-600">외국계 기업</th>
                      <th className="py-3 px-4 font-bold text-orange-500">국내 기업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">연봉 체계</td>
                      <td className="py-4 px-4">성과주의, 변동급 비중 높음</td>
                      <td className="py-4 px-4">연공서열, 고정급 비중 높음</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">기업 문화</td>
                      <td className="py-4 px-4">수평적, 자율적, 개인의 책임 강조</td>
                      <td className="py-4 px-4">수직적, 집단주의, 조직의 화합 강조</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">커리어 성장</td>
                      <td className="py-4 px-4">직무 전문성 강화, 글로벌 이동 기회</td>
                      <td className="py-4 px-4">다양한 직무 경험, 조직 내 승진</td>
                    </tr>
                     <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">채용 방식</td>
                      <td className="py-4 px-4">수시 채용, 직무 중심, 영어 면접 필수</td>
                      <td className="py-4 px-4">공채, 스펙 중심, 인적성 검사</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Briefcase className="w-7 h-7 text-indigo-500" />
                외국계 기업, 어떻게 준비해야 할까?
              </h2>
              <p>
                외국계 기업 취업을 위해서는 직무 전문성, 영어 능력, 그리고 글로벌 마인드가 필수입니다. <br />
                Moneysalary의 커리어 가이드와 함께 당신의 꿈을 현실로 만드세요.
              </p>
              <Link
                href="/guides/salary-negotiation"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                연봉 협상 잘하는 법 가이드 보기 🚀
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
