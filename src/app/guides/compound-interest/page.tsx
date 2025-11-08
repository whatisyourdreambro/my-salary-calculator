
import type { Metadata } from "next";
import Link from "next/link";
import { Zap, BarChart, TrendingUp, Brain, Sigma } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "복리의 마법과 72법칙: 부자를 만드는 눈덩이 효과",
  description:
    "워렌 버핏의 부의 비밀, 복리. 단리와의 압도적인 차이를 시각적인 표로 확인하고, 내 돈이 2배가 되는 시간을 계산하는 '72의 법칙'을 배워보세요. 시간을 내 편으로 만드는 법을 알려드립니다.",
  openGraph: {
    title: "복리의 마법과 72법칙: 부자를 만드는 눈덩이 효과",
    description:
      "시간을 내 편으로 만드는 가장 강력한 무기, 복리. 지금 바로 당신의 자산을 불려나갈 준비를 하세요.",
    images: ["/api/og?title=복리의 마법과 72의 법칙"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "복리의 마법과 72법칙: 부자를 만드는 눈덩이 효과",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-05-25",
  dateModified: currentDate,
  description:
    "단리와의 차이, 72의 법칙, 그리고 복리 효과를 극대화하는 3가지 실천 방법을 알려드립니다.",
};

const comparisonData = [
    { year: 1, simple: "1,100만원", compound: "1,100만원", diff: "0원" },
    { year: 5, simple: "1,500만원", compound: "1,611만원", diff: "111만원" },
    { year: 10, simple: "2,000만원", compound: "2,594만원", diff: "594만원" },
    { year: 20, simple: "3,000만원", compound: "6,728만원", diff: "3,728만원" },
    { year: 30, simple: "4,000만원", compound: "1억 7,449만원", diff: "1억 3,449만원" },
]

export default function CompoundInterestGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-gray-900 dark:to-purple-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            복리의 마법,
            <br /> 부자를 만드는 눈덩이 효과
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            아인슈타인이 '세계 8대 불가사의'라고 불렀던 복리. 시간을 내 편으로 만드는 가장 강력한 무기, 복리의 비밀을 파헤쳐봅니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              복리(複利)란 원금에만 이자가 붙는 '단리(單利)'와 달리, <strong>원금과 이자를 합친 금액에 다시 이자가 붙는 방식</strong>입니다. 시간이 지날수록 돈이 스스로 돈을 버는 속도가 기하급수적으로 빨라지는, 말 그대로 '눈덩이 효과'를 만들어냅니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <BarChart className="w-7 h-7 text-amber-500" />
                단리 vs 복리: 30년 후, 당신의 1,000만원은?
              </h2>
              <p>
                1,000만원을 연 10% 수익률로 30년간 투자했을 때, 단리와 복리의 차이는 얼마나 벌어질까요?
              </p>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="w-full text-center text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="p-3 font-semibold">년차</th>
                      <th className="p-3 font-semibold">단리</th>
                      <th className="p-3 font-semibold text-green-600">복리</th>
                      <th className="p-3 font-semibold text-red-500">차이</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {comparisonData.map((item) => (
                      <tr key={item.year} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-3 font-bold">{item.year}년</td>
                        <td className="p-3">{item.simple}</td>
                        <td className="p-3 font-semibold text-green-600">{item.compound}</td>
                        <td className="p-3 font-semibold text-red-500">{item.diff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-center mt-4 text-lg font-semibold">30년 후, 그 차이는 무려 <strong className="text-red-500">1억 3,449만원</strong>에 달합니다!</p>
            </section>

            <section className="mt-12 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h2 className="!mt-0 !text-2xl font-bold text-purple-600 flex items-center gap-2">
                <Sigma className="w-6 h-6" />
                내 돈이 2배가 되는 시간, '72의 법칙'
              </h2>
              <p className="!my-2 text-base">
                복리 투자의 계획을 쉽게 세우도록 돕는 마법의 공식이 있습니다. 바로 '72의 법칙'입니다.
              </p>
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
                 <p className="text-lg font-medium">
                  돈이 2배가 되는 기간 (년) ≈ 72 / 연 수익률 (%)
                </p>
              </div>
              <p className="!text-sm !mt-4">
                예를 들어, 연 8% 수익률이라면 약 9년(72÷8), 10% 수익률이라면 약 7.2년(72÷10) 만에 원금이 2배가 됩니다. 이 간단한 법칙만 알아도 장기 투자의 위력을 체감할 수 있습니다.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Brain className="w-7 h-7 text-signature-blue" />
                복리의 마법을 내 것으로 만드는 3가지 행동
              </h2>
              <ol className="!my-4 space-y-4 text-base">
                <li>
                  <strong>1. '장기적으로 우상향'하는 자산에 투자하기</strong><br/>
                  복리는 '시간'과 '수익률'의 함수입니다. 어떤 자산에 투자해야 할지 막막하다면, 세계 최고의 기업들에 자동으로 분산 투자하는 '지수 추종 ETF'부터 시작해보세요.
                  <Link href="/guides/etf-investment-from-stock-selection-to-trading-strategy" className="text-sm font-bold text-blue-600 hover:underline block mt-1">→ ETF 투자 완벽 가이드 보기</Link>
                </li>
                <li>
                  <strong>2. '세금'이라는 마찰력 줄이기</strong><br/>
                  투자로 번 돈에서 세금을 떼면, 눈덩이가 굴러가는 데 마찰이 생깁니다. ISA 계좌 등을 활용해 세금을 최대한 줄이는 것이 복리 효과를 극대화하는 핵심입니다.
                  <Link href="/guides/isa-account-all-about-the-all-purpose-tax-saving-account" className="text-sm font-bold text-blue-600 hover:underline block mt-1">→ ISA 계좌 200% 활용법 보기</Link>
                </li>
                <li>
                  <strong>3. '시간'을 내 편으로 만들기</strong><br/>
                  복리의 가장 중요한 재료는 '시간'입니다. 하루라도 빨리 시작해서, 시장의 단기적인 등락에 흔들리지 않고 꾸준히 투자하는 '시스템'을 만드는 것이 중요합니다.
                  <Link href="/guides/road-to-100m-part3-invest" className="text-sm font-bold text-blue-600 hover:underline block mt-1">→ 돈이 일하는 투자 시스템 만들기 가이드 보기</Link>
                </li>
              </ol>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <TrendingUp className="w-7 h-7 text-indigo-500" />
                당신의 미래 자산, 지금 바로 계산해보세요
              </h2>
              <p className="mt-4">
                매월 꾸준히 투자하면 10년, 20년 뒤 내 자산은 얼마나 불어날까요? <br />
                '파이어 계산기'로 당신의 부를 예측하고 계획을 세워보세요.
              </p>
              <Link
                href="/fire-calculator"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                파이어(FIRE) 은퇴 계산기 🔥
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}