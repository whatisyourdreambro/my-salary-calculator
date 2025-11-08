
import type { Metadata } from "next";
import Link from "next/link";
import { Rocket, PiggyBank, TrendingUp, ShieldCheck, Wallet, AlertTriangle, Home, Calculator } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "사회초년생 재테크 로드맵: 첫 월급부터 부자되는 돈 관리 시스템",
  description:
    "첫 월급, 어떻게 관리해야 할지 막막한가요? 월급 명세서 보는 법, 통장 쪼개기, 주택청약, 연금, ISA, ETF 투자까지! N년차 직장 생활이 편해지는 돈 관리 시스템을 만들어보세요.",
  openGraph: {
    title: "사회초년생 재테크 로드맵: 첫 월급부터 부자되는 돈 관리 시스템",
    description:
      "첫 월급부터 시작하는 부자의 길, 사회초년생을 위한 재테크 A to Z. 지금 바로 시작하세요!",
    images: ["/api/og?title=사회초년생 재테크, 첫걸음부터 함께"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "사회초년생 재테크 로드맵: 첫 월급부터 부자되는 돈 관리 시스템",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-06-10",
  dateModified: currentDate,
  description:
    "첫 월급 관리, 통장 쪼개기, 주택청약, 연금계좌, ISA, ETF 투자까지 사회초년생을 위한 재테크 로드맵을 제시합니다.",
};

export default function FirstJobInvestmentGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-green-400 to-blue-500 dark:from-gray-900 dark:to-green-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            첫 월급 재테크 로드맵
            <br /> 이 순서대로만 따라오세요
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-blue-100 dark:text-gray-300">
            드디어 월급의 기쁨을 맛본 사회초년생! 하지만 '텅장'은 순식간입니다. 부자가 되는 첫걸음, 첫 월급부터 시작하는 돈 관리 시스템 구축법을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-blue-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              인생의 첫 월급, 그 설렘도 잠시. 학자금 대출, 월세, 통신비 등 통장을 스쳐 지나가는 돈들을 보며 한숨 쉬고 있나요? 괜찮습니다. 중요한 것은 지금부터 어떻게 돈을 관리하고 불려나갈지 '시스템'을 만드는 것입니다. 이 글만 따라오면 당신도 똑똑한 재테크의 길을 걸을 수 있습니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Rocket className="w-7 h-7 text-purple-500" />
                사회초년생 돈 관리 시스템 5단계
              </h2>
              <p>
                복잡한 금융 상품 공부보다, 아래 5가지 단계를 순서대로 실천하는 것이 훨씬 중요합니다.
              </p>
              <div className="mt-6 space-y-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">1</div>
                  <div>
                    <h3 className="font-bold !mt-0 !mb-1">급여명세서 확인 & 통장 쪼개기</h3>
                    <p className="!text-sm !my-0">
                      내 월급에서 세금과 4대보험이 왜, 얼마나 빠져나가는지 이해하는 것부터 시작입니다. 그 후, 월급 통장, 소비 통장, 저축/투자 통장으로 돈의 흐름을 통제하세요.
                      <Link href="/guides/four-major-insurances" className="text-sm font-bold text-purple-600 hover:underline block mt-1">→ 4대보험 완벽 가이드 보기</Link>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">2</div>
                  <div>
                    <h3 className="font-bold !mt-0 !mb-1">주택청약종합저축 가입하기</h3>
                    <p className="!text-sm !my-0">
                      내 집 마련의 첫걸음이자 필수 준비물입니다. 고민하지 말고 월 10만원씩 자동이체를 설정하세요. 연말정산 소득공제 혜택도 있습니다.
                      <Link href="/guides/housing-subscription-savings-how-to-make-a-1st-priority-account" className="text-sm font-bold text-purple-600 hover:underline block mt-1">→ 주택청약 1순위 만들기 가이드 보기</Link>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">3</div>
                  <div>
                    <h3 className="font-bold !mt-0 !mb-1">연금계좌(IRP/연금저축) 개설하기</h3>
                    <p className="!text-sm !my-0">
                      '13월의 월급'을 만드는 최고의 절세 상품. 먼 미래의 노후 대비는 물론, 당장의 세금을 아끼는 가장 확실한 방법입니다.
                      <Link href="/guides/pension-savings-fund-vs-irp-which-is-right-for-me" className="text-sm font-bold text-purple-600 hover:underline block mt-1">→ 연금계좌 완벽 비교 가이드 보기</Link>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">4</div>
                  <div>
                    <h3 className="font-bold !mt-0 !mb-1">ISA 계좌 만들기</h3>
                    <p className="!text-sm !my-0">
                      투자로 얻은 수익에 대한 세금을 아껴주는 '만능 계좌'. 투자를 시작하기 전 반드시 함께 만들어야 할 필수품입니다.
                      <Link href="/guides/isa-account-all-about-the-all-purpose-tax-saving-account" className="text-sm font-bold text-purple-600 hover:underline block mt-1">→ ISA 계좌 200% 활용법 보기</Link>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">5</div>
                  <div>
                    <h3 className="font-bold !mt-0 !mb-1">소액으로 ETF 적립식 투자 시작하기</h3>
                    <p className="!text-sm !my-0">
                      모든 준비가 끝났다면, 이제 '복리의 마법'을 경험할 차례입니다. S&P 500, 나스닥 100 등 시장 지수 ETF를 매월 꾸준히 사모으는 것부터 시작해보세요.
                      <Link href="/guides/etf-investment-from-stock-selection-to-trading-strategy" className="text-sm font-bold text-purple-600 hover:underline block mt-1">→ ETF 투자 실전 가이드 보기</Link>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800">
              <h2 className="!mt-0 !text-2xl font-bold text-brand-red flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" /> 사회초년생이 피해야 할 재테크 실수 3가지
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li><strong>1. 신용카드의 유혹:</strong> 할부의 편리함에 빠져 미래의 소득을 당겨쓰기 시작하면, 돈을 모으기 어렵습니다. 체크카드를 주력으로 사용하세요.</li>
                <li><strong>2. 묻지마 투자:</strong> 친구 따라, 유튜버 따라 잘 알지도 못하는 주식이나 코인에 투자하는 것은 도박과 같습니다. 내가 이해하는 상품에만 투자하세요.</li>
                <li><strong>3. 불필요한 보험 가입:</strong> 보험은 필수지만, 사회초년생에게 월 20~30만원짜리 종신보험은 과합니다. 실손보험과 같은 보장성 보험부터 우선적으로 알아보세요.</li>
              </ul>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">
                내 첫 월급, 실수령액은 얼마일까?
              </h2>
              <p className="mt-4">
                세금과 4대보험을 떼고 내 통장에 실제로 찍히는 금액이 궁금하다면? <br/>
                '연봉 계산기'로 지금 바로 확인해보세요.
              </p>
              <Link
                href="/salary"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                <Calculator className="inline-block w-5 h-5 mr-2" />
                내 월급 실수령액 계산하기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}