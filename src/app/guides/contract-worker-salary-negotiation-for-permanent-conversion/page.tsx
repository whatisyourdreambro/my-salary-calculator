
import type { Metadata } from "next";
import Link from "next/link";
import { Handshake, Briefcase, TrendingUp, Lightbulb } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "계약직 연봉, 정규직 전환 시 협상 전략: 당신의 가치를 증명하라!",
  description:
    "계약직에서 정규직으로! 꿈을 현실로 만드는 연봉 협상 가이드. 계약 기간 동안 성과를 어필하는 법, 희망 연봉 제시 노하우, 그리고 협상 결렬 시 대처법까지. 당신의 가치를 제대로 인정받으세요.",
  openGraph: {
    title: "계약직 연봉, 정규직 전환 시 협상 전략: 당신의 가치를 증명하라!",
    description:
      "정규직 전환, 연봉 협상이 핵심입니다. 계약직의 경험을 무기로 당신의 몸값을 높이세요.",
    images: ["/api/og?title=계약직 정규직 전환, 연봉 협상"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "계약직 연봉, 정규직 전환 시 협상 전략: 당신의 가치를 증명하라!",
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
    "계약 기간 동안 성과를 어필하는 법, 희망 연봉 제시 노하우, 그리고 협상 결렬 시 대처법까지. 당신의 가치를 제대로 인정받으세요.",
};

export default function ContractWorkerSalaryNegotiationGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-orange-500 to-red-600 dark:from-gray-900 dark:to-orange-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            계약직에서 정규직으로,
            <br /> 연봉 협상 성공 전략
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-red-100 dark:text-gray-300">
            불안정한 계약직 생활을 끝내고 정규직으로 전환되는 순간은 새로운 시작을 의미합니다. 하지만 이때 연봉 협상을 어떻게 하느냐에 따라 당신의 미래가 달라질 수 있습니다. 당신의 가치를 제대로 인정받는 협상 전략을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-red-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              계약직은 정규직 전환이라는 목표를 가지고 근무하는 경우가 많습니다. 계약 기간 동안 쌓은 경험과 성과는 정규직 전환 시 당신의 가장 강력한 무기가 됩니다. 하지만 많은 계약직 근로자들이 연봉 협상에 소극적이거나, 어떻게 해야 할지 몰라 손해를 보는 경우가 많습니다. 이 가이드를 통해 계약직의 경험을 발판 삼아 정규직으로서 더 높은 연봉을 쟁취하는 방법을 알아보세요.
            </p>

            <section className="mt-12 bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800">
              <h2 className="!mt-0 !text-2xl font-bold text-brand-red flex items-center gap-2">
                <Briefcase className="w-6 h-6" />
                계약직의 강점, 이렇게 활용하라!
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>직무 전문성:</strong> 계약 기간 동안 해당 직무에 대한 깊이 있는 이해와 실무 경험을 쌓을 수 있습니다. 이는 정규직 전환 시 당신의 가장 큰 경쟁력이 됩니다.
                </li>
                <li>
                  <strong>회사 문화 이해:</strong> 회사의 업무 방식, 조직 문화, 동료들과의 관계를 미리 파악하여 정규직 전환 후 빠른 적응이 가능합니다.
                </li>
                <li>
                  <strong>성과 증명:</strong> 계약 기간 동안 당신이 이룬 구체적인 성과를 데이터로 정리하여 정규직 전환의 당위성을 어필할 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Handshake className="w-7 h-7 text-green-500" />
                정규직 전환 연봉 협상, 3단계 전략
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 정보 수집: 나의 시장 가치를 파악하라
                  </h3>
                  <p className="!text-sm !my-0">
                    정규직 전환 시 해당 직무의 시장 평균 연봉, 그리고 회사 내 정규직 동료들의 연봉 수준을 파악하는 것이 중요합니다. 블라인드, 잡플래닛 등 커뮤니티와 채용 공고를 통해 정보를 수집하세요.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 성과 어필: 숫자로 당신의 가치를 증명하라
                  </h3>
                  <p className="!text-sm !my-0">
                    계약 기간 동안 당신이 이룬 성과를 구체적인 숫자로 정리하세요. '어떤 프로젝트를 성공적으로 마무리하여 매출에 기여했다', '업무 프로세스를 개선하여 효율성을 높였다' 등 정량적인 데이터가 협상에 큰 힘이 됩니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 희망 연봉 제시: 자신감 있게, 하지만 유연하게
                  </h3>
                  <p className="!text-sm !my-0">
                    수집한 정보와 당신의 성과를 바탕으로 희망 연봉을 명확히 제시하세요. 이때, 단순히 높은 금액을 부르기보다는 '이 정도의 연봉이 나의 시장 가치에 합당하다'는 논리적인 근거를 함께 제시하는 것이 중요합니다. 회사의 상황에 따라 유연하게 대처할 준비도 필요합니다.
                  </p>
                   <Link href="/guides/salary-negotiation" className="text-sm text-blue-600 hover:underline">→ 연봉 협상 잘하는 법 가이드 보기</Link>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 협상 결렬 시, 대처법은?
              </h2>
              <p className="!my-2 text-base">
                만약 연봉 협상이 원하는 대로 되지 않더라도 실망하지 마세요. 연봉 외에 복지 혜택(유급 휴가, 교육 지원 등)이나 직급, 업무 범위 등 다른 조건을 협상해볼 수 있습니다. 또한, 이번 경험을 바탕으로 더 좋은 조건의 다른 정규직 기회를 찾아보는 것도 현명한 방법입니다.
              </p>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <TrendingUp className="w-7 h-7 text-indigo-500" />
                당신의 가치를 인정받는 커리어를 만드세요!
              </h2>
              <p>
                계약직은 정규직으로 가는 징검다리이자, 당신의 역량을 증명할 수 있는 기회입니다. <br />
                Moneysalary가 당신의 성공적인 커리어 전환을 응원합니다.
              </p>
              <Link
                href="/guides/industry-trends-2025"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                2025년 유망 산업 트렌드 확인하기 📈
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
