import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, BarChart, BrainCircuit } from "lucide-react";

export const metadata: Metadata = {
  title: "복리의 마법, 스노우볼 효과: 부자들의 비밀 무기",
  description:
    "아인슈타인이 '세계 8대 불가사의'라고 극찬한 복리. 원금에 이자가 붙고, 그 이자에 다시 이자가 붙는 '눈덩이 효과'의 원리를 이해하고 당신의 자산을 기하급수적으로 불리는 방법을 알려드립니다.",
  openGraph: {
    title: "복리의 마법, 스노우볼 효과: 부자들의 비밀 무기",
    description:
      "시간을 내 편으로 만들어 자산을 불리는 가장 확실한 방법, 복리의 모든 것을 알려드립니다.",
    images: [
      "/api/og?title=복리의 마법, 스노우볼 효과&description=시간을 내 편으로 만드는 가장 확실한 방법",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "복리의 마법, 스노우볼 효과: 부자들의 비밀 무기",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-10-06",
  dateModified: "2025-10-06",
  description:
    "원금에 이자가 붙고, 그 이자에 다시 이자가 붙는 '눈덩이 효과'의 원리를 이해하고 당신의 자산을 기하급수적으로 불리는 방법을 알려드립니다.",
};

export default function CompoundInterestPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-light-bg dark:bg-dark-bg">
        <div className="w-full bg-gradient-to-br from-green-500 to-emerald-600 dark:from-gray-900 dark:to-green-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            복리의 마법,
            <br /> <span className="text-emerald-300">시간의 힘을 빌리다</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-emerald-100 dark:text-gray-300">
            워렌 버핏을 세계 최고의 부자로 만든 비밀. 작은 눈덩이를 굴려 거대한
            산을 만드는 복리의 원리를 이해하면, 당신의 월급도 잠에서 깨어나
            스스로 일하기 시작합니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              만약 당신에게 1억을 받는 것과, 30일 동안 매일 돈이 2배가 되는 것
              중 하나를 선택하라고 한다면 무엇을 고르시겠습니까? 대부분의
              사람들은 1억을 선택하지만, 후자를 선택한 사람은 30일 뒤 500억이
              넘는 돈을 갖게 됩니다. 이것이 바로 복리의 무서운 힘입니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <BrainCircuit className="w-7 h-7 text-green-500" />
                단리와 복리, 결정적 차이
              </h2>
              <p>
                투자의 성과를 가르는 핵심적인 차이는 &apos;이자에 이자가
                붙는가&apos;에 있습니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !mb-1 text-lg">
                    단리 (Simple Interest)
                  </h3>
                  <p className="!text-sm !my-0">
                    오직 <strong>원금</strong>에 대해서만 약속된 이자를 지급하는
                    방식입니다. 시간이 지나도 이자 수익은 일정하게 유지됩니다.
                  </p>
                </div>
                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                  <h3 className="font-bold !mt-0 !mb-1 text-lg">
                    복리 (Compound Interest)
                  </h3>
                  <p className="!text-sm !my-0">
                    <strong>원금과 그동안 발생한 이자를 합한 금액</strong>에
                    다시 이자가 붙는 방식입니다. 시간이 지날수록 자산이
                    기하급수적으로 늘어나는 &apos;스노우볼 효과&apos;가
                    발생합니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <BarChart className="w-7 h-7 text-signature-blue" />
                시간이 마법을 부리는 순간
              </h2>
              <p>
                1,000만원을 연 7% 수익률로 투자했을 때, 단리와 복리의 차이는
                시간이 지날수록 극명하게 벌어집니다.
              </p>
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full text-center">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">기간</th>
                      <th className="py-3 px-4 font-semibold">단리 투자</th>
                      <th className="py-3 px-4 font-bold text-signature-blue">
                        복리 투자
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="py-3 px-4">10년 후</td>
                      <td>1,700만원</td>
                      <td className="font-bold text-signature-blue">
                        약 1,967만원
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">20년 후</td>
                      <td>2,400만원</td>
                      <td className="font-bold text-signature-blue">
                        약 3,870만원
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">30년 후</td>
                      <td>3,100만원</td>
                      <td className="font-bold text-signature-blue">
                        약 7,612만원
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">40년 후</td>
                      <td>3,800만원</td>
                      <td className="font-bold text-signature-blue">
                        약 1억 4,974만원
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <blockquote>
                <p>
                  <strong>핵심 인사이트:</strong> 복리 투자의 성과는 초반에는
                  미미해 보이지만, 시간이 흐를수록 그 수익률은 폭발적으로
                  증가합니다. 사회초년생에게 가장 강력한 무기는
                  &apos;시간&apos;이라는 말이 바로 여기서 나옵니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-amber-500" />
                어떻게 복리 효과를 누릴 수 있을까?
              </h2>
              <p>
                복리의 마법을 현실로 만들기 위한 가장 확실한 방법은 바로{" "}
                <strong>&apos;장기적인 우상향 자산&apos;</strong>에{" "}
                <strong>&apos;꾸준히&apos;</strong> 투자하는 것입니다.
              </p>
              <div className="mt-6 p-6 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20">
                <h3 className="font-bold !mt-0 !text-xl">
                  직장인을 위한 최고의 복리 투자법: S&P 500 ETF
                </h3>
                <p className="!my-2 !text-base">
                  미국을 대표하는 500개 기업에 분산 투자하는 S&P 500 지수 추종
                  ETF는 지난 수십 년간 장기적으로 우상향하며 연평균 10% 내외의
                  놀라운 복리 수익률을 증명했습니다. 매달 월급의 일부를 꾸준히
                  적립식으로 투자하는 것만으로도, 당신은 워렌 버핏이 추천한 가장
                  확실한 부의 길에 올라서는 것입니다.
                </p>
                <Link
                  href="/guides/road-to-100m-part3-invest"
                  className="font-semibold text-amber-700 dark:text-amber-300 hover:underline !text-base"
                >
                  월급으로 투자 파이프라인 만들기 →
                </Link>
              </div>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">
                당신의 돈을 잠에서 깨우세요
              </h2>
              <p>
                복리의 마법은 일찍 시작할수록, 꾸준할수록 강력해집니다. 오늘
                마시는 커피 한 잔 값으로, 당신의 미래를 바꿀 눈덩이를 굴리기
                시작하세요.
              </p>
              <Link
                href="/fire-calculator"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                내 은퇴 나이 계산해보기 🔥
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
