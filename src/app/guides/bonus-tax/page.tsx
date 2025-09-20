import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, FileText, Gift, Lightbulb } from "lucide-react";

export const metadata: Metadata = {
  title: "성과급 세금 폭탄, 피하는 법 완벽 가이드 (2025년 최종판)",
  description:
    "두둑한 성과급, 세금으로 절반이 사라진다고? 상여금 세금 계산의 원리부터 연말정산으로 세금을 돌려받는 방법, IRP를 활용한 절세 전략까지 총정리.",
  openGraph: {
    title: "성과급 세금 폭탄, 피하는 법 완벽 가이드 (2025년)",
    description:
      "열심히 일한 당신, 세금 때문에 울지 마세요. 성과급 세금의 모든 것을 알려드립니다.",
    images: [
      "/api/og?title=성과급 세금 폭탄, 피할 수 있을까?&description=2025년 최종 절세 가이드",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "성과급 세금 폭탄, 피하는 법 완벽 가이드 (2025년 최종판)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-19",
  dateModified: "2025-09-20",
  description:
    "성과급(상여금) 세금 계산 원리와 IRP를 활용한 합법적 절세 전략, 연말정산 환급 팁까지 모두 알려드립니다.",
};

export default function BonusTaxGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-light-bg dark:bg-dark-bg">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-br from-amber-400 to-orange-500 dark:from-gray-900 dark:to-amber-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            성과급 세금 폭탄,
            <br /> 피할 수 없을까?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-orange-100 dark:text-gray-300">
            1년의 노력이 담긴 달콤한 성과급. 하지만 세금 명세서를 받아보는 순간,
            그 달콤함은 씁쓸함으로 변하곤 합니다. 그 이유와 해결책을 지금부터
            알려드립니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              &quot;상여금 1,000만원 받았는데, 세금만 300만원?&quot; 직장인
              커뮤니티에 심심치 않게 올라오는 하소연입니다. 성과급은 법적으로
              &apos;근로소득&apos;에 포함되기에 세금을 내는 것이 당연하지만,
              유독 세금 부담이 크게 느껴지는 이유는 무엇일까요? 그 비밀은 바로
              소득세의 &apos;누진세 구조&apos;에 있습니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <DollarSign className="w-7 h-7 text-green-500" />왜 성과급은
                &apos;세금 폭탄&apos;이 될까?
              </h2>
              <p>
                대한민국의 소득세는 소득이 높을수록 더 높은 세율을 적용하는{" "}
                <strong>누진세 구조</strong>를 따릅니다. 평소 월급만 받을 때는
                15% 세율을 적용받던 사람도, 목돈인 성과급이 더해지는 순간 24%,
                35%의 높은 세율 구간으로 진입하게 됩니다. 국세청은 이 높은
                세율을 기준으로 세금을 원천징수하기 때문에, 우리가 체감하는 세금
                부담이 급격히 커지는 것입니다.
              </p>
              <blockquote>
                <p>
                  <strong>핵심 원리:</strong> 성과급이 지급되는 달, 당신의
                  &apos;월 소득&apos;이 일시적으로 급증하면서, 그 달에 한해 매우
                  높은 세율이 적용되는 것입니다. 물론, 이렇게 많이 뗀 세금은
                  다음 해 <strong>연말정산</strong>을 통해 일부 돌려받게 됩니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <FileText className="w-7 h-7 text-signature-blue" />내 성과급
                세금, 계산 방식 2가지
              </h2>
              <p>
                회사는 보통 두 가지 방식 중 하나로 당신의 성과급 세금을
                계산합니다. 어떤 방식을 쓰든 연말정산을 통해 최종 납부세액은
                동일해지지만, 당장 내 손에 쥐는 돈이 달라질 수 있습니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !text-lg">
                    A. 원칙적인 방법 (정확하지만 복잡)
                  </h3>
                  <p className="!text-sm !my-0">
                    성과급을 포함한 올해 총급여를 근무 개월 수로 나눠
                    &apos;월평균 급여&apos;를 다시 계산하고, 그에 맞는 세율을
                    적용해 세금을 정산하는 방식입니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !text-lg">
                    B. 간편한 방법 (대부분 회사 채택)
                  </h3>
                  <p className="!text-sm !my-0">
                    성과급 지급 직전 달의 월급에 적용된 세율을 성과급에도
                    동일하게 적용하여 원천징수합니다. 계산이 간편해 대부분의
                    회사가 이 방식을 사용합니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Lightbulb className="w-7 h-7 text-yellow-500" />
                합법적으로 세금 아끼는 현실적인 전략
              </h2>
              <p>
                성과급 자체에 대한 세금을 피할 순 없지만, 우리는 연말정산이라는
                강력한 무기를 가지고 있습니다. 늘어난 총소득만큼 공제 항목을
                철저히 준비하면, 떼였던 세금을 상당 부분 되돌려 받을 수
                있습니다.
              </p>
              <div className="mt-6 p-6 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                <h3 className="font-bold !mt-0 !text-xl flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  최고의 절세 치트키: IRP & 연금저축
                </h3>
                <p className="!my-2 !text-base">
                  성과급을 받았다면 그 해 연말까지{" "}
                  <strong>개인형 퇴직연금(IRP)과 연금저축펀드</strong> 계좌를
                  최대한 활용하세요. 연간 최대 900만원까지 납입하면, 총급여액에
                  따라 <strong>최대 148만 5천원</strong>의 세금을 연말정산 시
                  그대로 돌려받을 수 있습니다. 성과급으로 늘어난 세금 부담을
                  상쇄할 가장 확실하고 강력한 방법입니다.
                </p>
                <Link
                  href="/guides/road-to-100m-part1-tax"
                  className="font-semibold text-yellow-700 dark:text-yellow-300 hover:underline !text-base"
                >
                  연봉 1억을 위한 절세 전략 가이드 바로가기 →
                </Link>
              </div>
            </section>

            <section className="mt-16 text-center">
              <p className="text-lg font-semibold">
                성과급은 1년 동안의 노고에 대한 보상입니다.
                <br />
                세금 때문에 기쁨을 잃지 마세요.
              </p>
              <Link
                href="/year-end-tax"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                내 연봉으로 연말정산 환급금 계산하기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
