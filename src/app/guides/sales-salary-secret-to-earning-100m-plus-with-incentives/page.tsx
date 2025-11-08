
import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, TrendingUp, Target, Briefcase } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "영업직 연봉, 성과급으로 억대 버는 비결: 당신도 할 수 있다!",
  description:
    "'영업은 곧 돈이다!' 영업직은 노력과 성과에 따라 억대 연봉도 가능한 매력적인 직무입니다. 높은 성과급을 받는 영업 전문가들의 비결과 영업직의 커리어 성장 전략, 그리고 당신의 몸값을 높이는 노하우를 알려드립니다.",
  openGraph: {
    title: "영업직 연봉, 성과급으로 억대 버는 비결: 당신도 할 수 있다!",
    description:
      "영업으로 억대 연봉을 꿈꾼다면? 성과급 극대화 전략과 성공적인 영업 커리어 로드맵을 확인하세요.",
    images: ["/api/og?title=영업직, 억대 연봉의 비결"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "영업직 연봉, 성과급으로 억대 버는 비결: 당신도 할 수 있다!",
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
    "높은 성과급을 받는 영업 전문가들의 비결과 영업직의 커리어 성장 전략, 그리고 당신의 몸값을 높이는 노하우를 알려드립니다.",
};

export default function SalesSalaryGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-red-500 to-orange-600 dark:from-gray-900 dark:to-red-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            영업직 연봉,
            <br /> 성과급으로 억대 버는 비결
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-orange-100 dark:text-gray-300">
            '영업은 곧 돈이다!'라는 말이 현실이 되는 직무, 영업. 당신의 노력과 성과가 곧 연봉으로 직결되는 매력적인 영업직에서 억대 연봉을 달성하는 비결을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-orange-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              영업직은 다른 직무와 달리 정해진 연봉 테이블보다는 개인의 성과에 따라 보상이 크게 달라지는 특징을 가지고 있습니다. 기본급은 낮을 수 있지만, 인센티브, 커미션, 성과급 등 변동급의 비중이 높아 잠재적인 고소득을 기대할 수 있습니다. 특히 B2B 영업, 금융 영업, 제약 영업 등 전문성을 요구하는 분야에서는 억대 연봉을 받는 영업 전문가들이 많습니다. 당신도 그 주인공이 될 수 있습니다.
            </p>

            <section className="mt-12 bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800">
              <h2 className="!mt-0 !text-2xl font-bold text-brand-red flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                영업직 연봉 구조, 이것만 알면 끝!
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>기본급:</strong> 직급, 연차에 따라 고정적으로 지급되는 급여. 영업직은 다른 직무보다 기본급 비중이 낮은 경우가 많습니다.
                </li>
                <li>
                  <strong>성과급/인센티브/커미션:</strong> 개인 또는 팀의 영업 실적에 따라 지급되는 변동급. 영업직 연봉의 핵심이자 고소득의 원천입니다.
                </li>
                <li>
                  <strong>복지 혜택:</strong> 차량 유지비, 통신비, 식대 등 영업 활동에 필요한 경비를 지원받는 경우가 많습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Target className="w-7 h-7 text-green-500" />
                억대 연봉 영업 전문가들의 3가지 비결
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. '전문성'으로 무장하라
                  </h3>
                  <p className="!text-sm !my-0">
                    단순히 물건을 파는 것을 넘어, 고객의 문제를 해결해주는 '솔루션 제공자'가 되어야 합니다. 당신이 판매하는 제품/서비스에 대한 깊이 있는 이해와 산업 전반에 대한 지식을 갖추세요. 고객은 전문가에게 지갑을 엽니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. '네트워크'를 확장하고 관리하라
                  </h3>
                  <p className="!text-sm !my-0">
                    영업은 사람과 사람의 관계에서 시작됩니다. 기존 고객과의 관계를 돈독히 하고, 잠재 고객과의 접점을 꾸준히 늘려나가세요. 명함 관리, CRM 활용, 정기적인 연락 등 체계적인 네트워크 관리가 중요합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. '데이터' 기반의 전략적 영업
                  </h3>
                  <p className="!text-sm !my-0">
                    감에 의존하는 영업은 이제 그만! 고객 데이터, 시장 트렌드, 경쟁사 분석 등 데이터를 기반으로 영업 전략을 수립하고 실행하세요. 어떤 고객에게 어떤 메시지를 전달할지, 어떤 제품을 추천할지 데이터가 답을 알려줄 것입니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Briefcase className="w-7 h-7 text-indigo-500" />
                당신의 영업 커리어, 지금 바로 시작하세요!
              </h2>
              <p>
                영업은 당신의 노력과 성과가 정직하게 보상받는 매력적인 직무입니다. <br />
                Moneysalary의 다양한 커리어 가이드와 함께 당신의 영업 커리어를 성공적으로 이끌어보세요.
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
