import type { Metadata } from "next";
// [수정] 사용하지 않는 Link import 제거
// import Link from "next/link";

export const metadata: Metadata = {
  title: "월급으로 시작하는 투자 파이프라인 (2025년 투자 로드맵) | Moneysalary",
  description:
    "연봉으로 시작하는 가장 현실적인 투자 방법. 시드머니 모으기부터 미국 S&P 500 ETF, 연금저축펀드를 활용한 장기 투자 전략과 절세 혜택까지, 직장인을 위한 투자 로드맵을 제시합니다.",
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "월급으로 시작하는 투자 파이프라인 (2025년 투자 로드맵)",
  author: { "@type": "Organization", name: "Moneysalary" },
  publisher: {
    "@type": "Organization",
    name: "Moneysalary",
    logo: {
      "@type": "ImageObject",
      url: "https://www.moneysalary.com/favicon.ico",
    },
  },
  datePublished: "2025-09-16",
  dateModified: "2025-09-16",
  description:
    "연봉으로 시작하는 가장 현실적인 투자 방법. 시드머니 모으기부터 미국 S&P 500 ETF, 연금저축펀드를 활용한 장기 투자 전략과 절세 혜택까지, 직장인을 위한 투자 로드맵을 제시합니다.",
};

export default function RoadTo100mInvestPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-signature-blue to-violet-500 bg-clip-text text-transparent pb-2">
            월급으로 시작하는 투자 파이프라인
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Road to 1억 시리즈 (3편)
          </p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            최종 업데이트: 2025년 9월 16일
          </p>
        </div>

        <article className="prose dark:prose-invert lg:prose-xl max-w-none">
          <p className="lead">
            열심히 일해서 번 돈, 통장에 그대로 잠들어 있지는 않나요? 인플레이션
            시대에 저축만으로는 자산을 불리기 어렵습니다.{" "}
            <strong>연봉 1억</strong>이라는 목표를 향한 마지막 퍼즐은 바로{" "}
            <strong>투자</strong>입니다. 매달 들어오는 월급을 기반으로, 꾸준하고
            안정적인 수익을 창출하는 현실적인 투자 파이프라인 구축 전략을
            소개합니다.
          </p>

          <section className="mt-12 space-y-8">
            <div className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
              <h2 className="!mt-0 text-2xl font-bold">
                1단계: 목표 설정과 시드머니 마련
              </h2>
              <p>
                <strong>&apos;3년 안에 1억 모으기&apos;</strong>,{" "}
                <strong>&apos;매달 50만원 배당금 받기&apos;</strong> 등 구체적인
                목표를 세우고, 고정 지출을 제외한 월 저축 가능 금액을 파악하여
                강제 저축 시스템을 만드는 것이 투자의 첫걸음입니다.
              </p>
            </div>
            <div className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
              <h2 className="!mt-0 text-2xl font-bold">
                2단계: 직장인 최고의 투자처, 미국 S&P 500 ETF
              </h2>
              <p>
                개별 종목 분석 시간이 부족한 직장인에게 가장 추천하는 투자처는
                지수 추종 ETF입니다. 특히 <strong>미국 S&P 500 지수</strong>를
                추종하는 ETF는 지난 수십 년간 연평균 10% 내외의 안정적인 성장을
                보여주었습니다. <strong>연금저축펀드나 IRP 계좌</strong>를 통해
                투자하면 절세 혜택과 장기적인 자산 증식, 두 마리 토끼를 모두
                잡을 수 있습니다.
              </p>
            </div>
            <div className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
              <h2 className="!mt-0 text-2xl font-bold">
                3단계: 꾸준함이 무기, 적립식 투자
              </h2>
              <p>
                주식 시장의 등락에 일희일비하지 않고, 매달 일정한 금액을 꾸준히
                투자하는 <strong>적립식 투자</strong>는 직장인에게 가장 적합한
                전략입니다. 주가가 낮을 때는 더 많은 수량을, 높을 때는 더 적은
                수량을 매수하게 되어 평균 매수 단가를 낮추는{" "}
                <strong>코스트 에버리징</strong> 효과를 누릴 수 있습니다.
              </p>
            </div>
          </section>

          <div className="mt-12 text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="font-bold">
              Road to 1억 시리즈는 여기서 마무리됩니다.
            </p>
            <p>
              Moneysalary는 당신의 경제적 자유를 향한 여정을 항상 응원합니다.
            </p>
          </div>
        </article>
      </main>
    </>
  );
}
