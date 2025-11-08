
import type { Metadata } from "next";
import Link from "next/link";
import { Coffee, TrendingDown, Calculator, Smile, ThumbsUp, ThumbsDown, Building } from "lucide-react";

export const metadata: Metadata = {
  title: "주 4일제, 꿈의 직장일까? (장단점, 연봉 삭감, 해외 사례 총정리)",
  description:
    "주 4일제(주 32시간)의 장점과 단점, 그리고 '임금 삭감'의 진실을 파헤쳐봅니다. 카카오, 우아한형제들 등 국내외 실제 도입 사례와 함께 미래의 근무 형태를 전망합니다.",
  openGraph: {
    title: "주 4일제, 꿈의 직장일까? (장단점, 연봉 삭감, 해외 사례 총정리)",
    description:
      "워라밸의 꿈, 주 4일제! 하지만 내 월급은 괜찮을까요? 연봉 변화부터 장단점까지 모든 것을 알려드립니다.",
    images: [
      "/api/og?title=주 4일제, 꿈일까 현실일까?&description=장단점과 연봉 변화 총정리",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "주 4일제, 꿈의 직장일까? (장단점, 연봉 삭감, 해외 사례 총정리)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-07-20",
  dateModified: "2025-07-20",
  description:
    "주 4일제의 장점과 단점, '임금 삭감' 시나리오별 연봉 변화, 그리고 국내외 실제 도입 사례를 상세히 분석합니다.",
};

export default function FourDayWeekGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-green-500 to-teal-500 dark:from-gray-900 dark:to-green-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            주 4일제,
            <br /> 꿈의 직장일까?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-teal-100 dark:text-gray-300">
            금요일의 여유, 상상만 해도 즐거운 '주 4일 근무'. 하지만 워라밸의 꿈 이면에는 임금 조정, 업무 강도 심화 등 현실적인 문제도 존재합니다. 주 4일제의 모든 것을 파헤쳐 봅니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              글로벌 빅테크 기업부터 국내 유수의 스타트업까지, 주 4일제는 더 이상 먼 미래의 이야기가 아닌 현실적인 제도로 논의되고 있습니다. 늘어난 여가 시간, 향상된 업무 효율이라는 장밋빛 전망과 '임금 조정'이라는 현실적인 문제 사이에서, 우리는 무엇을 알아야 할까요?
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Coffee className="w-7 h-7 text-green-600" />
                주 4일제, 모두에게 좋을까? (장점 vs 단점)
              </h2>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-bold !mt-0 !text-lg flex items-center gap-2"><Smile className="w-6 h-6"/> 근로자</h3>
                  <div className="mt-4">
                    <p className="font-semibold flex items-center gap-1"><ThumbsUp className="w-4 h-4 text-green-500"/> 장점</p>
                    <ul className="!text-sm !my-0 list-disc list-inside"><li>워라밸 향상, 번아웃 예방</li><li>자기계발, 취미 시간 확보</li></ul>
                  </div>
                  <div className="mt-4">
                    <p className="font-semibold flex items-center gap-1"><ThumbsDown className="w-4 h-4 text-red-500"/> 단점</p>
                    <ul className="!text-sm !my-0 list-disc list-inside"><li>임금 삭감 가능성</li><li>업무 강도 심화 우려</li></ul>
                  </div>
                </div>
                <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h3 className="font-bold !mt-0 !text-lg flex items-center gap-2"><Building className="w-6 h-6"/> 기업</h3>
                   <div className="mt-4">
                    <p className="font-semibold flex items-center gap-1"><ThumbsUp className="w-4 h-4 text-green-500"/> 장점</p>
                    <ul className="!text-sm !my-0 list-disc list-inside"><li>핵심 인재 유치 및 유지</li><li>생산성 향상, 이직률 감소</li></ul>
                  </div>
                  <div className="mt-4">
                    <p className="font-semibold flex items-center gap-1"><ThumbsDown className="w-4 h-4 text-red-500"/> 단점</p>
                    <ul className="!text-sm !my-0 list-disc list-inside"><li>인건비 부담 (임금 유지 시)</li><li>협업 및 소통의 어려움</li></ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Calculator className="w-7 h-7 text-signature-blue" />
                가장 현실적인 문제: 내 연봉은?
              </h2>
              <p>
                주 4일제 도입 시 가장 현실적인 시나리오는 근로시간에 비례한 임금 삭감입니다. 연봉 5,000만원 직장인이 주 32시간으로 근무 시간이 20% 줄어들 경우, 연봉은 다음과 같이 계산됩니다.
              </p>
              <div className="mt-6 p-8 bg-gray-100 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 text-center">
                <p className="text-lg font-medium">
                  5,000만원 × (32시간 / 40시간) ={" "}
                  <span className="text-signature-blue text-2xl sm:text-3xl font-bold">4,000만원</span>
                </p>
              </div>
              <blockquote className="!border-l-blue-500 mt-6">
                <p>
                  물론 '임금 삭감 없는 주 4일제'를 도입하는 기업도 있습니다. 이는 줄어든 시간만큼 생산성을 높일 수 있다는 강력한 믿음이 있을 때 가능하며, 직원에게는 시간당 임금이 25% 인상되는 엄청난 혜택입니다.
                </p>
              </blockquote>
            </section>

             <section className="mt-12">
              <h2 className="!text-2xl font-bold">실제 도입 사례는?</h2>
              <ul className="!my-4 space-y-2 text-base">
                <li><strong>해외 (영국):</strong> 2022년 영국에서 61개 기업이 참여한 대규모 주 4일제 실험 결과, 기업 매출은 그대로 유지되면서 직원들의 번아웃은 71% 감소하고, 퇴사율은 57%나 줄어드는 긍정적인 효과를 확인했습니다.</li>
                <li><strong>국내 (IT 기업 중심):</strong> 카카오(격주 주 4일), 우아한형제들(월요병 없는 날) 등 일부 IT 기업을 중심으로 완전한 주 4일제보다는 유연한 형태로 도입하여 근무 환경을 개선하고 있습니다.</li>
              </ul>
            </section>

            <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">나에게 맞는 '워라밸'의 정의는?</h2>
              <p className="mt-4 max-w-xl mx-auto">
                주 4일제는 워라밸을 위한 하나의 방법일 뿐입니다. 당신의 삶에서 진정한 일과 삶의 균형을 찾아보세요. 좋은 회사를 구별하는 안목을 기를 수 있습니다.
              </p>
              <Link
                href="/guides/how-to-find-a-company-with-good-work-life-balance"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                워라밸 좋은 회사 찾는 법 🧘‍♀️
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
