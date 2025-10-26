import type { Metadata } from "next";
import Link from "next/link";
import { Coffee, TrendingDown, Calculator, Smile } from "lucide-react";

export const metadata: Metadata = {
  title: "주 4일제, 꿈일까 현실일까? | 연봉 삭감의 진실과 계산법",
  description:
    "주 4일제(주 32시간) 전환 시 내 월급은 어떻게 바뀔까? '임금 유지'와 '비례 삭감' 시나리오별 연봉 변화를 실제 예시와 함께 완벽하게 계산해 드립니다.",
  openGraph: {
    title: "주 4일제, 꿈일까 현실일까? | 연봉 삭감의 진실",
    description:
      "워라밸의 꿈, 주 4일제! 하지만 내 월급은 괜찮을까요? 연봉 변화를 미리 계산해보세요.",
    images: [
      "/api/og?title=주 4일제, 내 월급은 어떻게 될까?&description=연봉 변화 시뮬레이션",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "주 4일제, 꿈일까 현실일까? | 연봉 삭감의 진실과 계산법",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-19",
  dateModified: "2025-09-20",
  description:
    "주 4일제(주 32시간) 전환 시 '임금 유지'와 '비례 삭감' 시나리오별 연봉 변화를 실제 예시와 함께 완벽하게 계산해 드립니다.",
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
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-br from-green-500 to-teal-500 dark:from-gray-900 dark:to-green-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            주 4일제, 그 꿈의 대가는
            <br />내 월급일까?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-teal-100 dark:text-gray-300">
            금요일의 여유, 상상만 해도 즐거운 &apos;주 4일 근무&apos;. 하지만
            워라밸의 꿈이 현실이 될 때, 가장 먼저 걱정되는 것은 바로 내
            연봉입니다. 임금 삭감의 진실을 파헤쳐 봅니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              글로벌 빅테크 기업부터 국내 유수의 스타트업까지, 주 4일제는 더
              이상 먼 미래의 이야기가 아닌 현실적인 제도로 논의되고 있습니다.
              늘어난 여가 시간, 향상된 업무 효율이라는 장밋빛 전망 이면에는
              &apos;임금 조정&apos;이라는 현실적인 문제가 존재합니다. 과연 내
              연봉은 어떻게 되는 걸까요?
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Coffee className="w-7 h-7 text-green-600" />
                임금 협상의 두 갈래 길: 유지 vs 삭감
              </h2>
              <p>
                주 4일제 도입 시 임금 정책은 전적으로 회사의 결정에
                달려있습니다. 크게 두 가지 시나리오로 나눌 수 있으며, 이는
                당신의 실수령액에 결정적인 영향을 미칩니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <Smile className="w-6 h-6 text-green-600" />
                    <h3 className="font-bold !mt-0 !text-lg">
                      ① 임금 완전 유지 (Dream Case)
                    </h3>
                  </div>
                  <p className="!text-sm !my-0 mt-2">
                    가장 이상적인 시나리오입니다. 주 5일(40시간) 근무할 때와
                    동일한 연봉을 받으면서 하루를 더 쉽니다. 이는 실질적으로
                    당신의 <strong>시간당 임금이 25% 인상</strong>되는 엄청난
                    혜택입니다. 생산성 향상에 대한 회사의 강력한 믿음이 있을 때
                    가능합니다.
                  </p>
                </div>
                <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-6 h-6 text-brand-red" />
                    <h3 className="font-bold !mt-0 !text-lg">
                      ② 근로시간 비례 삭감 (Realistic Case)
                    </h3>
                  </div>
                  <p className="!text-sm !my-0 mt-2">
                    가장 일반적이고 현실적인 시나리오입니다. 주 40시간에서 주
                    32시간으로 근로시간이 20% 감소하므로, 연봉도 그에 비례하여
                    20% 삭감 조정될 수 있습니다. 이 경우, 시간당 임금은 동일하게
                    유지됩니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Calculator className="w-7 h-7 text-signature-blue" />
                시나리오 B: 내 연봉, 직접 계산해보기
              </h2>
              <p>
                만약 당신의 현재 연봉이 <strong>5,000만원</strong>이고, 회사가
                근로시간 비례 삭감안을 선택했다고 가정해봅시다. 당신의 연봉은
                다음과 같이 계산됩니다.
              </p>
              <div className="mt-6 p-8 bg-gray-100 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 text-center">
                <p className="text-lg font-medium">
                  기존 연봉 × (변경된 주간 근로시간 / 기존 주간 근로시간)
                </p>
                <p className="text-2xl sm:text-3xl font-bold my-2">
                  5,000만원 × (32시간 / 40시간) ={" "}
                  <span className="text-signature-blue">4,000만원</span>
                </p>
              </div>
              <p className="mt-4">
                연봉이 4,000만원으로 줄어들면, 4대보험 및 소득세 공제액도 함께
                줄어들어 월 실수령액이 변동됩니다. 기존 월 실수령액이 약
                353만원이었다면, 변경 후에는 약 288만원으로 감소하게 됩니다.
              </p>
              <blockquote>
                <p>
                  <strong>줄어든 연봉, 끝이 아닐 수 있습니다.</strong> 연봉
                  감소로 인해 소득세율 구간이 낮아지면, 연말정산 시 예상보다
                  많은 금액을 환급받을 수도 있습니다. 정확한 변화는 직접
                  계산해보는 것이 가장 중요합니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">당신의 선택은 무엇인가요?</h2>
              <p>
                늘어난 여가와 삶의 질이냐, 줄어드는 소득이냐. 주 4일제는
                우리에게 중요한 질문을 던집니다. 정답은 없습니다. 하지만 변화가
                현실이 되기 전에, 당신의 연봉이 어떻게 변하는지 정확히 계산하고
                미래를 준비하는 것은 필수입니다.
              </p>
              <Link
                href="/?salaryInput=40,000,000&payBasis=annual"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                변경된 연봉으로 내 실수령액 계산하기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
