import type { Metadata } from "next";
import Link from "next/link";
import { Rocket, PiggyBank, TrendingUp, ShieldCheck } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "사회초년생 재테크 로드맵: 이 순서대로만 따라오세요 (2025년)",
  description:
    "첫 월급, 어떻게 관리해야 할지 막막한가요? 월급 통장 쪼개기부터 비상금 만들기, 연금저축/IRP, ETF 투자까지! 부자가 되는 첫걸음, 사회초년생 재테크의 모든 것을 알려드립니다.",
  openGraph: {
    title: "사회초년생 재테크 로드맵: 이 순서대로만 따라오세요 (2025년)",
    description:
      "첫 월급부터 시작하는 부자의 길, 사회초년생을 위한 재테크 A to Z. 지금 바로 시작하세요!",
    images: ["/api/og?title=사회초년생 재테크, 뭐부터 시작할까?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "사회초년생 재테크 로드맵: 이 순서대로만 따라오세요 (2025년)",
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
    "월급 통장 쪼개기부터 비상금 만들기, 연금저축/IRP, ETF 투자까지! 부자가 되는 첫걸음, 사회초년생 재테크의 모든 것을 알려드립니다.",
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
            첫 월급 재테크,
            <br /> 뭐부터 시작해야 할까?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-blue-100 dark:text-gray-300">
            드디어 월급의 기쁨을 맛본 사회초년생! 하지만 '텅장'은 순식간입니다. 부자가 되는 첫걸음, 첫 월급부터 시작하는 재테크 로드맵을 제시합니다.
          </p>
          <p className="mt-4 text-xs text-blue-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              인생의 첫 월급, 그 설렘도 잠시. 학자금 대출, 월세, 통신비 등 통장을 스쳐 지나가는 돈들을 보며 한숨 쉬고 있나요? 괜찮습니다. 모두가 겪는 과정입니다. 중요한 것은 지금부터 어떻게 돈을 관리하고 불려나갈지 계획을 세우는 것입니다. 이 글만 따라오면 당신도 똑똑한 재테크의 길을 걸을 수 있습니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Rocket className="w-7 h-7 text-purple-500" />
                사회초년생 재테크 4단계 로드맵
              </h2>
              <p>
                복잡한 금융 상품을 공부하기 전에, 가장 기본적이고 중요한 4가지 단계부터 차근차근 시작해보세요.
              </p>
              <div className="mt-6 space-y-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">1</div>
                  <div>
                    <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text">통장 쪼개기: 돈의 흐름을 통제하라</h3>
                    <p className="!text-sm !my-0">
                      월급이 들어오는 급여 통장, 체크카드와 연결된 소비 통장, 그리고 저축/투자 통장으로 최소 3개 이상 나누는 것이 기본입니다. 돈에 꼬리표를 달아주면 불필요한 소비를 막고 계획적인 지출이 가능해집니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">2</div>
                  <div>
                    <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text">비상금 만들기: 최소한의 안전벨트</h3>
                    <p className="!text-sm !my-0">
                      갑작스러운 질병, 퇴사 등 예기치 못한 상황에 대비해 최소 3~6개월치 생활비를 비상금으로 모아두어야 합니다. 이 돈이 있어야 빚을 내거나 힘들게 모은 적금/투자를 해지하는 최악의 상황을 막을 수 있습니다. 파킹통장(CMA)을 활용하는 것을 추천합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">3</div>
                  <div>
                    <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text">절세 상품 활용하기: IRP & 연금저축</h3>
                    <p className="!text-sm !my-0">
                      투자를 시작하기 전, 국가가 제공하는 최고의 절세 혜택 상품부터 챙기세요. 연말정산 시 최대 148.5만원의 세금을 돌려주는 연금저축과 IRP는 사회초년생의 필수품입니다. 먼 미래의 노후 대비는 물론, 당장의 세금을 아끼는 가장 확실한 방법입니다.
                    </p>
                     <Link href="/guides/bonus-tax" className="text-sm text-purple-600 hover:underline">→ 성과급 세금 아끼는 절세 전략 가이드</Link>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">4</div>
                  <div>
                    <h3 className="font-bold !mt-0 !mb-1 text-light-text dark:text-dark-text">소액으로 투자 시작하기: ETF 적립식 매수</h3>
                    <p className="!text-sm !my-0">
                      위 3단계를 마쳤다면, 드디어 투자를 시작할 차례입니다. 처음부터 개별 종목에 투자하는 것은 위험 부담이 큽니다. S&P 500, 나스닥 100 등 시장 지수를 추종하는 ETF를 매월 꾸준히 소액으로 사모으는 것부터 시작해보세요. 복리의 마법을 경험하는 가장 안정적인 방법입니다.
                    </p>
                     <Link href="/guides/compound-interest" className="text-sm text-purple-600 hover:underline">→ 복리의 마법, 눈덩이 효과 가이드</Link>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <TrendingUp className="w-7 h-7 text-indigo-500" />
                10년 후, 당신의 자산은 얼마나 될까요?
              </h2>
              <p>
                지금부터 꾸준히 저축하고 투자한다면, 10년 뒤 당신은 어떤 모습일까요? <br />
                미래 자산을 예측하고 목표를 세워보세요. 시작이 반입니다.
              </p>
              <Link
                href="/fire-calculator"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                미래 자산 계산해보기 💰
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}