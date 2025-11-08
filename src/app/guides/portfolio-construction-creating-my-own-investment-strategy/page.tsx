
import type { Metadata } from "next";
import Link from "next/link";
import { PieChart, DollarSign, Lightbulb, ShieldCheck } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "포트폴리오 구성, 나만의 투자 전략 만들기: 경제적 자유를 향한 로드맵 (2025년)",
  description:
    "성공적인 투자를 위한 나만의 포트폴리오! 자산 배분, 분산 투자, 위험 관리 등 포트폴리오 구성의 핵심 원칙을 상세히 설명하고, 개인의 투자 목표와 성향에 맞는 맞춤형 투자 전략을 수립하는 방법을 알려드립니다. 당신의 경제적 자유를 향한 로드맵을 지금 바로 만드세요.",
  openGraph: {
    title: "포트폴리오 구성, 나만의 투자 전략 만들기: 경제적 자유를 향한 로드맵 (2025년)",
    description:
      "포트폴리오, 더 이상 어렵지 않습니다. 당신의 투자 목표에 맞는 최적의 포트폴리오를 Moneysalary가 함께 만들어드립니다.",
    images: ["/api/og?title=포트폴리오 구성, 나만의 전략"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "포트폴리오 구성, 나만의 투자 전략 만들기: 경제적 자유를 향한 로드맵 (2025년)",
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
    "자산 배분, 분산 투자, 위험 관리 등 포트폴리오 구성의 핵심 원칙을 상세히 설명하고, 개인의 투자 목표와 성향에 맞는 맞춤형 투자 전략을 수립하는 방법을 알려드립니다. 당신의 경제적 자유를 향한 로드맵을 지금 바로 만드세요.",
};

export default function PortfolioConstructionGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-green-500 to-teal-600 dark:from-gray-900 dark:to-green-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            포트폴리오 구성,
            <br /> 나만의 투자 전략 만들기
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-teal-100 dark:text-gray-300">
            성공적인 투자를 위해서는 자신만의 명확한 투자 전략과 포트폴리오 구성이 필수적입니다. 자산 배분, 분산 투자, 위험 관리 등 포트폴리오 구성의 핵심 원칙을 상세히 설명하고, 당신의 경제적 자유를 향한 로드맵을 지금 바로 만드세요.
          </p>
          <p className="mt-4 text-xs text-teal-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              투자 포트폴리오는 당신의 투자 목표와 위험 감수 수준에 맞춰 다양한 자산에 자금을 배분하는 전략입니다. 단순히 여러 종목에 투자하는 것을 넘어, 각 자산의 특성과 시장 상황을 고려하여 최적의 조합을 찾는 것이 중요합니다. 잘 구성된 포트폴리오는 시장의 변동성 속에서도 안정적인 수익을 추구하고, 장기적인 관점에서 자산을 효과적으로 증식시키는 데 도움을 줍니다. 이 가이드를 통해 포트폴리오 구성의 모든 것을 파악하고, 당신만의 투자 전략을 만들어보세요.
            </p>

            <section className="mt-12 bg-teal-50 dark:bg-teal-900/20 p-6 rounded-2xl border border-teal-200 dark:border-teal-800">
              <h2 className="!mt-0 !text-2xl font-bold text-teal-700 flex items-center gap-2">
                <PieChart className="w-6 h-6" />
                포트폴리오 구성, 왜 중요할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>위험 분산:</strong> 특정 자산의 하락 위험을 다른 자산의 상승으로 상쇄하여 전체 포트폴리오의 안정성을 높입니다.
                </li>
                <li>
                  <strong>수익률 극대화:</strong> 다양한 자산에 투자하여 시장의 변화에 유연하게 대응하고, 장기적인 관점에서 수익률을 극대화할 수 있습니다.
                </li>
                <li>
                  <strong>투자 목표 달성:</strong> 자신의 투자 목표(은퇴 자금, 주택 마련 등)와 기간에 맞춰 최적의 자산 배분을 통해 목표 달성 확률을 높입니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <DollarSign className="w-7 h-7 text-purple-500" />
                나만의 투자 전략 만들기, 3단계 가이드
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. '투자 목표'와 '위험 감수 수준' 설정
                  </h3>
                  <p className="!text-sm !my-0">
                    언제까지 얼마의 자산을 모으고 싶은지, 그리고 시장의 변동성을 어느 정도까지 감수할 수 있는지 명확히 정의하세요. 이는 당신의 포트폴리오를 구성하는 가장 기본적인 기준이 됩니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. '자산 배분' 전략 수립: 분산 투자의 핵심
                  </h3>
                  <p className="!text-sm !my-0">
                    주식, 채권, 부동산, 현금 등 다양한 자산에 자금을 어떻게 배분할지 결정하세요. 일반적으로 젊을수록 주식 비중을 높이고, 나이가 들수록 채권 등 안전자산 비중을 높이는 것이 좋습니다. (예: 주식 60%, 채권 30%, 현금 10%)
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. '정기적인 리밸런싱'으로 포트폴리오 관리
                  </h3>
                  <p className="!text-sm !my-0">
                    시장 상황에 따라 자산 비중이 달라지면, 주기적으로(예: 1년에 한 번) 원래의 자산 배분 비율로 조정하는 '리밸런싱'이 필요합니다. 이는 포트폴리오의 위험을 관리하고, 장기적인 수익률을 유지하는 데 중요합니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 포트폴리오 구성, 이것만은 주의하세요!
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>무리한 투자:</strong> 자신의 위험 감수 수준을 넘어서는 무리한 투자는 피하세요. 손실이 발생하면 감정적인 판단을 내리기 쉽습니다.
                </li>
                <li>
                  <strong>잦은 매매:</strong> 단기적인 시장 변동에 일희일비하여 잦은 매매를 하는 것은 수수료와 세금만 늘릴 뿐입니다. 장기적인 관점에서 꾸준히 투자하세요.
                </li>
                <li>
                  <strong>정보의 맹신:</strong> 특정 전문가나 정보에 맹신하기보다는, 스스로 공부하고 판단하는 능력을 키우세요.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <ShieldCheck className="w-7 h-7 text-indigo-500" />
                당신의 경제적 자유를 향한 로드맵을 만드세요!
              </h2>
              <p>
                잘 구성된 포트폴리오는 당신의 자산을 지키고 불리는 든든한 동반자가 될 것입니다. <br />
                Moneysalary의 재테크 가이드와 함께 현명한 투자자가 되세요.
              </p>
              <Link
                href="/guides/road-to-100m-part3-invest"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                투자 시스템 만들기 가이드 보기 📈
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
