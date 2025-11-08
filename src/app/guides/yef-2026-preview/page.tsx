import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Globe, LineChart, Lightbulb } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "2026년 경제 전망: 한국 경제, 어디로 갈까? (고금리, 고물가 시대)",
  description:
    "2026년 한국 경제는 어떤 변화를 맞이할까요? 고금리, 고물가 시대의 지속 여부, 글로벌 경기 침체 가능성, 주요 산업별 전망, 그리고 개인의 현명한 재테크 전략까지. 미래를 예측하고 대비하세요.",
  openGraph: {
    title: "2026년 경제 전망: 한국 경제, 어디로 갈까? (고금리, 고물가 시대)",
    description:
      "불확실성의 시대, 2026년 한국 경제의 흐름을 읽고 당신의 자산을 지키세요.",
    images: ["/api/og?title=2026년 한국 경제 전망"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "2026년 경제 전망: 한국 경제, 어디로 갈까? (고금리, 고물가 시대)",
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
    "2026년 한국 경제의 주요 이슈와 전망을 분석하고, 이에 따른 개인의 현명한 재테크 전략을 제시합니다.",
};

export default function YEF2026PreviewGuidePage() {
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
            2026년 경제 전망,
            <br /> 한국 경제의 향방은?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            불확실성으로 가득한 글로벌 경제 속에서 2026년 한국 경제는 어떤 길을 걷게 될까요? 고금리, 고물가 시대의 지속 여부와 주요 산업별 전망을 통해 당신의 자산 전략을 세워보세요.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              2025년은 고금리, 고물가, 고환율의 '3고(高)' 현상이 지속되며 전 세계적으로 경기 둔화 우려가 커졌던 한 해였습니다. 2026년에는 이러한 경제 환경이 어떻게 변화할지, 한국 경제는 어떤 기회와 위협에 직면할지 면밀히 분석하여 개인과 기업의 현명한 의사결정을 돕고자 합니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Globe className="w-7 h-7 text-blue-500" />
                글로벌 경제 환경: '고금리 장기화'가 뉴노멀?
              </h2>
              <p>
                미국 연방준비제도(Fed)의 금리 인하 시점이 예상보다 늦어지면서, 글로벌 고금리 기조는 2026년에도 이어질 가능성이 높습니다. 이는 전 세계적인 투자 위축과 소비 둔화로 이어져 한국 경제에도 부담으로 작용할 것입니다.
              </p>
              <blockquote className="!border-l-blue-500">
                <p>
                  <strong>주요 변수:</strong> 미국 대선 결과, 미중 갈등 심화 여부, 러시아-우크라이나 전쟁 장기화 등 지정학적 리스크가 2026년 글로벌 경제의 불확실성을 더욱 키울 전망입니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <LineChart className="w-7 h-7 text-green-500" />
                2026년 한국 경제, 주요 전망
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 성장률: 2%대 초반의 완만한 회복
                  </h3>
                  <p className="!text-sm !my-0">
                    글로벌 경기 둔화의 영향으로 수출 회복세가 제한적일 수 있으나, 정부의 재정 지출 확대와 내수 회복 노력으로 2%대 초반의 완만한 성장률을 기록할 것으로 예상됩니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 물가: 2%대 중반으로 하향 안정화
                  </h3>
                  <p className="!text-sm !my-0">
                    국제 유가 및 원자재 가격 안정화, 정부의 물가 관리 노력으로 소비자물가 상승률은 2%대 중반으로 점차 하향 안정화될 것으로 보입니다. 하지만 공공요금 인상 압력은 여전합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 금리: 하반기 금리 인하 기대감
                  </h3>
                  <p className="!text-sm !my-0">
                    물가 안정화 추세가 확인되면 한국은행도 하반기부터 기준금리 인하를 검토할 가능성이 있습니다. 하지만 미국과의 금리 역전 폭을 고려하여 신중한 접근이 예상됩니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Lightbulb className="w-7 h-7 text-yellow-500" />
                개인의 현명한 재테크 전략
              </h2>
              <p>
                불확실한 경제 상황 속에서도 당신의 자산을 지키고 불리기 위한 전략은 다음과 같습니다.
              </p>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>고금리 예적금 활용:</strong> 금리 인하 전까지는 높은 금리의 예적금 상품을 적극 활용하여 안정적인 이자 수익을 확보하세요.
                </li>
                <li>
                  <strong>변동금리 대출 관리:</strong> 금리 인하 기대감이 있지만, 변동금리 대출의 경우 금리 변동에 대비하여 여유 자금을 확보하거나 고정금리 전환을 고려해볼 수 있습니다.
                </li>
                <li>
                  <strong>장기 분산 투자:</strong> 단기적인 시장 변동에 일희일비하기보다는, 우량 자산에 대한 장기적인 관점의 분산 투자를 유지하는 것이 중요합니다. (예: 미국 지수 추종 ETF)
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold">
                미래를 위한 당신의 재정 계획은?
              </h2>
              <p>
                경제 전망을 바탕으로 당신의 재정 목표를 설정하고, <br />
                Moneysalary의 다양한 재테크 가이드와 계산기로 구체적인 계획을 세워보세요.
              </p>
              <Link
                href="/fire-calculator"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                파이어(FIRE) 계산기로 미래 자산 예측하기 🔥
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}