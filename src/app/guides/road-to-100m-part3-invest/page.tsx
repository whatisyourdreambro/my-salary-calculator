import type { Metadata } from "next";
import Link from "next/link";
import { Zap, TrendingUp, Shield, Repeat, Wallet } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "연봉 1억 로드맵 3편: 돈이 일하는 투자 시스템 만들기",
  description:
    "절세와 부업으로 만든 종잣돈, 어떻게 굴려야 할까? 워렌 버핏도 추천한 미국 지수 추종 ETF 적립식 투자를 어떤 계좌(ISA, 연금계좌)로 시작해야 하는지 알려드립니다.",
  openGraph: {
    title: "연봉 1억 로드맵 3편: 돈이 일하는 투자 시스템 만들기",
    description:
      "돈이 일하게 하라! 직장인을 위한 가장 현실적인 투자 시스템 구축 가이드.",
    images: ["/api/og?title=투자, 돈을 불리는 시스템 만들기"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "연봉 1억 로드맵 3편: 돈이 일하는 투자 시스템 만들기",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-03-15",
  dateModified: currentDate,
  description:
    "미국 지수 추종 ETF 적립식 투자를 어떤 계좌로 시작해야 하는지, 투자 시스템 구축 3단계를 알려드립니다.",
};

export default function RoadTo100MPart3InvestGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-green-500 to-emerald-600 dark:from-gray-900 dark:to-green-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            연봉 1억 로드맵 ③
            <br /> 투자로 돈이 일하게 하라
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-emerald-100 dark:text-gray-300">
            열심히 아끼고 모은 당신의 돈, 잠자고 있는 동안에도 스스로 불어나게 할 수는 없을까? 연봉 1억을 향한 마지막 퍼즐, '투자 시스템'을 만드는 방법을 공개합니다.
          </p>
          <p className="mt-4 text-xs text-emerald-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              절세로 새는 돈을 막고, 부업으로 추가 소득을 만들었다면, 이제 이 소중한 종잣돈을 '투자'를 통해 눈덩이처럼 불려나갈 차례입니다. 투자는 더 이상 전문가들의 영역이 아닙니다. 바쁜 직장인도, 투자 초보자도 누구나 쉽게 따라 할 수 있는 가장 확실하고 현실적인 투자 원칙을 소개합니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Zap className="w-7 h-7 text-yellow-500" />
                직장인 최고의 투자 전략: "사고, 잊어라"
              </h2>
              <p>
                투자의 귀재 워렌 버핏은 아내에게 "내가 죽으면 재산의 90%를 S&P 500 인덱스 펀드에 투자하라"고 유언했습니다. 개별 주식의 등락을 예측하려 애쓰는 대신, 미국 대표 기업 500개에 분산 투자하여 시장의 성장에 올라타라는 의미입니다.
              </p>
              <blockquote className="!border-l-green-500">
                <p>
                  <strong>핵심 전략:</strong> 미국 대표 지수(S&P 500, 나스닥 100)를 추종하는 <strong>ETF(상장지수펀드)</strong>를 매월 월급날마다 <strong>적립식으로 꾸준히</strong> 사 모으는 것. 이것이 바로 평범한 직장인이 부자가 되는 가장 확실한 길입니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Wallet className="w-7 h-7 text-blue-500" />
                어떤 계좌로 투자해야 할까? (중요)
              </h2>
              <p>
                어떤 상품에 투자하는지만큼 중요한 것이 '어떤 계좌를 사용하느냐'입니다. 세금 혜택이 있는 '절세 계좌'를 먼저 활용하는 것이 투자 수익률을 높이는 핵심입니다.
              </p>
              <div className="mt-6 space-y-4">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                  <h3 className="font-bold !mt-0 !mb-1 text-blue-700 dark:text-blue-300">1순위: ISA (개인종합자산관리계좌)</h3>
                  <p className="!text-sm !my-2">
                    비과세, 손익통산, 분리과세 혜택을 모두 갖춘 '만능 계좌'. 투자를 시작한다면 가장 먼저 개설하고 한도를 채워야 할 필수 통장입니다.
                  </p>
                  <Link href="/guides/isa-account-all-about-the-all-purpose-tax-saving-account" className="text-sm font-bold text-blue-600 hover:underline">ISA 200% 활용법 가이드 →</Link>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-1">2순위: 연금저축펀드 & IRP (개인형 퇴직연금)</h3>
                  <p className="!text-sm !my-2">
                    강력한 세액공제 혜택으로 연말정산 시 '13월의 월급'을 만들어주는 계좌. 노후 준비를 위한 장기 투자에 적합합니다.
                  </p>
                  <Link href="/guides/pension-savings-fund-vs-irp-which-is-right-for-me" className="text-sm font-bold text-gray-600 hover:underline">연금계좌 완벽 비교 가이드 →</Link>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-1">3순위: 일반 증권 계좌</h3>
                  <p className="!text-sm !my-2">
                    ISA와 연금계좌의 연간 납입 한도를 모두 채웠다면, 그 다음 자금은 일반 증권 계좌를 통해 투자합니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
                <h2 className="!mt-0 !text-2xl font-bold">나만의 투자 시스템 3단계로 구축하기</h2>
                <ol className="!my-4 space-y-3 text-base">
                    <li className="p-2"><strong>1단계: 절세 계좌부터 개설하기</strong><br/><span className="text-sm">증권사 앱에서 비대면으로 ISA, 연금저축펀드, IRP 계좌를 한 번에 만듭니다.</span></li>
                    <li className="p-2"><strong>2단계: 투자 종목 선택하기</strong><br/><span className="text-sm">S&P 500 추종 ETF (VOO, IVV, SPY) 또는 나스닥 100 추종 ETF (QQQ) 중에서 마음에 드는 것을 고릅니다.</span></li>
                    <li className="p-2"><strong>3단계: 자동이체 설정하고 잊어버리기</strong><br/><span className="text-sm">매월 월급날, 일정 금액이 자동으로 이체되어 ETF를 매수하도록 설정합니다. 그리고 주가 앱을 삭제하고 일상에 집중합니다.</span></li>
                </ol>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">
                나의 은퇴 시점은 언제가 될까?
              </h2>
              <p className="mt-4">
                매월 꾸준한 투자가 미래에 어떤 놀라운 결과로 돌아오는지 '파이어 계산기'로 직접 확인해보세요. <br/>복리의 마법이 당신의 은퇴 시계를 앞당겨줄 것입니다.
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