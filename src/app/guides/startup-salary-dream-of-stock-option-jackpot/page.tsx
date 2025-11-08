
import type { Metadata } from "next";
import Link from "next/link";
import { Rocket, DollarSign, TrendingUp, Lightbulb } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "스타트업 연봉, 스톡옵션 대박의 꿈: 당신의 미래를 바꿀 기회!",
  description:
    "낮은 연봉? 천만에! 스타트업은 스톡옵션이라는 강력한 무기로 당신의 미래를 바꿀 수 있습니다. 스톡옵션의 개념, 행사 방법, 세금, 그리고 스타트업 연봉 협상 노하우까지. 대박의 꿈을 현실로 만드세요.",
  openGraph: {
    title: "스타트업 연봉, 스톡옵션 대박의 꿈: 당신의 미래를 바꿀 기회!",
    description:
      "스타트업에서 일하고 싶다면? 스톡옵션의 모든 것을 이해하고 당신의 가치를 제대로 평가받으세요.",
    images: ["/api/og?title=스타트업 연봉, 스톡옵션의 모든 것"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "스타트업 연봉, 스톡옵션 대박의 꿈: 당신의 미래를 바꿀 기회!",
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
    "스톡옵션의 개념, 행사 방법, 세금, 그리고 스타트업 연봉 협상 노하우까지. 대박의 꿈을 현실로 만드세요.",
};

export default function StartupSalaryGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-gray-900 dark:to-purple-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            스타트업 연봉,
            <br /> 스톡옵션 대박의 꿈
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            빠른 성장, 혁신적인 문화, 그리고 '스톡옵션'이라는 강력한 보상. 스타트업은 당신의 커리어를 한 단계 도약시키고, 미래를 바꿀 수 있는 기회를 제공합니다. 스톡옵션의 모든 것을 파헤쳐봅니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              스타트업은 대기업에 비해 초기 연봉이 낮을 수 있다는 인식이 있지만, 이는 스톡옵션이라는 특별한 보상 체계를 간과한 것입니다. 스톡옵션은 회사의 성장에 따라 그 가치가 기하급수적으로 증가할 수 있어, 성공적인 스타트업의 경우 대기업 연봉을 훨씬 뛰어넘는 '대박'을 안겨주기도 합니다. 스타트업으로의 이직을 고민하고 있다면, 스톡옵션의 개념과 잠재력을 정확히 이해하는 것이 중요합니다.
            </p>

            <section className="mt-12 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h2 className="!mt-0 !text-2xl font-bold text-purple-600 flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                스톡옵션 (Stock Option), 무엇인가요?
              </h2>
              <p className="!my-2 text-base">
                스톡옵션은 회사가 임직원에게 미리 정해진 가격(행사가)으로 일정 수량의 주식을 살 수 있는 권리를 부여하는 제도입니다. 회사의 가치가 상승하여 주가가 행사가보다 높아지면, 그 차익만큼을 얻을 수 있습니다. 즉, <strong>회사의 성장에 기여하고 그 성과를 주식으로 보상받는 것</strong>입니다.
              </p>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>행사가:</strong> 스톡옵션을 부여받을 때 정해지는 주식 매수 가격.
                </li>
                <li>
                  <strong>현재가:</strong> 스톡옵션을 행사할 때의 주식 시장 가격.
                </li>
                <li>
                  <strong>차익:</strong> (현재가 - 행사가) × 주식 수량. 이 차익이 당신의 수익이 됩니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-green-500" />
                스톡옵션, 대박을 위한 3가지 조건
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. '성장 가능성' 높은 스타트업 선택
                  </h3>
                  <p className="!text-sm !my-0">
                    스톡옵션의 가치는 회사의 성장에 비례합니다. 시장의 문제를 해결하는 혁신적인 아이템, 탄탄한 비즈니스 모델, 뛰어난 팀 역량을 갖춘 스타트업을 선택하는 것이 중요합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. '행사가'가 낮을수록 유리
                  </h3>
                  <p className="!text-sm !my-0">
                    행사가는 스톡옵션을 부여받을 때의 회사 가치를 기준으로 책정됩니다. 회사의 초기 단계에 합류하여 낮은 행사가로 스톡옵션을 받는 것이 나중에 큰 차익을 얻을 수 있는 비결입니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. '락업 기간'과 '베스팅' 조건 확인
                  </h3>
                  <p className="!text-sm !my-0">
                    스톡옵션은 보통 일정 기간(락업 기간)이 지나야 행사할 수 있으며, 매년 일정 비율(베스팅)로 권리가 확정됩니다. 계약 조건을 꼼꼼히 확인하여 불이익이 없도록 해야 합니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 스톡옵션 세금, 미리 알아두세요!
              </h2>
              <p className="!my-2 text-base">
                스톡옵션 행사 시 발생하는 차익은 <strong>근로소득 또는 기타소득</strong>으로 분류되어 세금이 부과됩니다. 또한, 주식을 매도할 때는 <strong>양도소득세</strong>가 발생할 수 있습니다. 세금 폭탄을 피하기 위해 전문가와 상담하거나 관련 세법을 미리 숙지하는 것이 중요합니다.
              </p>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Rocket className="w-7 h-7 text-indigo-500" />
                당신의 스타트업 커리어, 지금 바로 시작하세요!
              </h2>
              <p>
                스타트업은 당신의 열정과 역량을 마음껏 펼치고, 그 성과를 보상받을 수 있는 최고의 기회입니다. <br />
                Moneysalary의 다양한 커리어 가이드와 함께 당신의 꿈을 현실로 만드세요.
              </p>
              <Link
                href="/guides/salary-negotiation"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                스타트업 연봉 협상 가이드 보기 🚀
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
