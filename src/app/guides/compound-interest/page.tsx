import type { Metadata } from "next";
import Link from "next/link";
import { Zap, BarChart, TrendingUp, Brain } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "복리의 마법: 부자를 만드는 눈덩이 효과 완벽 이해",
  description:
    "'투자의 귀재' 워렌 버핏이 세계 최고의 부자가 될 수 있었던 비밀, 바로 복리입니다. 원금에만 이자가 붙는 단리와의 차이점부터, 당신의 돈을 눈덩이처럼 불려줄 복리 효과의 모든 것을 알려드립니다.",
  openGraph: {
    title: "복리의 마법: 부자를 만드는 눈덩이 효과 완벽 이해",
    description:
      "시간을 내 편으로 만드는 가장 강력한 무기, 복리. 지금 바로 당신의 자산을 불려나갈 준비를 하세요.",
    images: ["/api/og?title=복리의 마법, 부자가 되는 길"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "복리의 마법: 부자를 만드는 눈덩이 효과 완벽 이해",
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
    "원금에만 이자가 붙는 단리와의 차이점부터, 당신의 돈을 눈덩이처럼 불려줄 복리 효과의 모든 것을 알려드립니다.",
};

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
            아인슈타인이 '세계 8대 불가사의'라고 불렀던 복리. 투자의 대가 워렌 버핏의 자산 대부분이 50세 이후에 형성된 이유이기도 합니다. 시간을 내 편으로 만드는 가장 강력한 무기, 복리의 비밀을 파헤쳐봅니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              1억을 투자해서 연 10%의 수익률을 올린다면, 1년 뒤 얼마가 될까요? 단순하게 생각하면 1억 1천만원입니다. 하지만 복리의 세계에서는 이야기가 달라집니다. 이자에 이자가 붙는 마법, 지금부터 쉽게 설명해 드립니다.
            </p>

            <section className="mt-12 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h2 className="!mt-0 !text-2xl font-bold text-purple-600 flex items-center gap-2">
                <Zap className="w-6 h-6" />
                복리, 한 문장으로 이해하기
              </h2>
              <p className="!my-4 text-lg">
                <strong>원금</strong>에만 이자가 붙는 '단리'와 달리, <strong>원금과 이자를 합친 금액</strong>에 다시 이자가 붙는 방식입니다. 시간이 지날수록 돈이 스스로 돈을 버는 속도가 기하급수적으로 빨라집니다.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <BarChart className="w-7 h-7 text-amber-500" />
                단리 vs 복리, 10년 후의 차이
              </h2>
              <p>
                1,000만원을 연 10% 수익률로 10년간 투자했을 때, 단리와 복리의 차이는 얼마나 벌어질까요?
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 text-center">
                  <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text">
                    단리 투자
                  </h3>
                  <p className="!text-sm !my-0">
                    매년 원금 1,000만원에 대한 이자 100만원만 받습니다.
                  </p>
                  <p className="text-2xl font-bold mt-2 text-gray-700 dark:text-gray-300">10년 후: 2,000만원</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-700 text-center">
                  <h3 className="font-bold !mt-0 !mb-1 text-green-700 dark:text-green-300">
                    복리 투자
                  </h3>
                  <p className="!text-sm !my-0">
                    첫해 이자 100만원이 원금에 더해져, 다음 해엔 1,100만원에 대한 이자를 받습니다.
                  </p>
                  <p className="text-2xl font-bold mt-2 text-green-600 dark:text-green-400">10년 후: 약 2,594만원</p>
                </div>
              </div>
              <p className="text-center mt-4 text-lg font-semibold">무려 <strong>594만원</strong>의 차이가 발생합니다!</p>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Brain className="w-7 h-7 text-signature-blue" />
                복리 효과를 극대화하는 3가지 방법
              </h2>
              <ol className="!my-4 space-y-4 text-base">
                <li>
                  <strong>1. 높은 수익률:</strong> 당연하지만, 수익률이 높을수록 복리 효과는 극대화됩니다. 하지만 항상 리스크 관리가 동반되어야 합니다.
                </li>
                <li>
                  <strong>2. 장기 투자:</strong> 복리의 마법은 '시간'을 먹고 자랍니다. 단기적인 등락에 흔들리지 않고 꾸준히 투자하는 것이 중요합니다.
                </li>
                <li>
                  <strong>3. 꾸준한 추가 납입:</strong> 매월, 매년 꾸준히 투자금을 늘려나가면 눈덩이는 훨씬 더 빠르게 굴러갑니다.
                </li>
              </ol>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <TrendingUp className="w-7 h-7 text-indigo-500" />
                당신의 미래 자산, 지금 바로 계산해보세요
              </h2>
              <p>
                매월 꾸준히 투자하면 10년, 20년 뒤 내 자산은 얼마나 불어날까요? <br />
                Moneysalary의 미래 연봉 계산기로 당신의 부를 예측하고 계획을 세워보세요.
              </p>
              <Link
                href="/fire-calculator"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                파이어(FIRE) 계산기로 내 은퇴 자금 예측하기 🔥
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}