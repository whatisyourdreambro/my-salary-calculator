import type { Metadata } from "next";
import Link from "next/link";
import { Telescope, TrendingUp, Wallet, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "2026 연말정산 미리보기: 13월의 월급, 더 두둑해질까?",
  description:
    "아는 만큼 환급받는다! 2026년 연말정산에서 변경될 가능성이 높은 핵심 공제 항목을 최신 세법 개정안 논의를 바탕으로 예측하고, 당신의 지갑에 미칠 영향을 심층 분석합니다.",
  openGraph: {
    title: "2026 연말정산 미리보기: 13월의 월급, 더 두둑해질까?",
    description:
      "내년 연말정산, 미리 준비하고 더 많이 환급받으세요. 핵심 변경 예측 총정리.",
    images: [
      "/api/og?title=2026년 연말정산 미리보기&description=핵심 변경점과 내게 미칠 영향은?",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "2026 연말정산 미리보기: 13월의 월급, 더 두둑해질까?",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-20",
  dateModified: "2025-09-20",
  description:
    "최신 세법 개정안 논의를 바탕으로 2026년 연말정산에서 변경될 가능성이 높은 자녀 세액공제, 월세 공제 등 핵심 변경 사항을 예측하고 심층 분석합니다.",
};

export default function YEF2026PreviewPage() {
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
        <div className="w-full bg-gradient-to-br from-gray-800 to-slate-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            2026 연말정산 미리보기
            <br />{" "}
            <span className="text-yellow-400">미래의 세금을 해킹하다</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-300">
            1년 후의 연말정산, 아직 멀게만 느껴지시나요? 하지만 세법의 변화는
            이미 시작되었습니다. 남들보다 한발 앞서 변화의 흐름을 읽고, 13월의
            월급을 극대화할 전략을 세워보세요.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              세금은 더 이상 &apos;내기만 하는 것&apos;이 아닙니다. 정책의
              흐름을 이해하고 미리 준비하는 사람에게는 합법적인 절세라는 달콤한
              열매를 안겨주죠. 현재 정부와 국회에서 논의 중인 세법 개정안을
              바탕으로, 2026년 당신의 연말정산에 가장 큰 영향을 미칠 가능성이
              높은 핵심 변경 예측 사항들을 심층적으로 분석했습니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Telescope className="w-7 h-7 text-indigo-500" />
                미래 예측: 2026년, 무엇이 달라질까?
              </h2>
              <p>
                현재 우리 사회가 당면한 과제인 &apos;저출산&apos;과 &apos;청년
                주거 문제&apos;는 세금 정책 변화의 가장 중요한 키워드입니다.
                정부는 세제 혜택을 통해 이러한 문제들을 해결하려는 의지를 보이고
                있습니다.
              </p>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-4 border-indigo-500">
                  <h3 className="font-bold !mt-0 !text-xl flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    예측 1: 자녀 세액공제, 파격적으로 확대된다
                  </h3>
                  <p className="!my-2 !text-base">
                    <strong>현행:</strong> 첫째 15만원, 둘째 20만원, 셋째부터
                    30만원 공제
                    <br />
                    <strong>변경 예측:</strong> 저출산 문제 해결을 위한 가장
                    직접적인 카드로,{" "}
                    <strong>
                      모든 자녀에 대해 최소 2배 이상(예: 첫째 30, 둘째 40) 공제
                      금액이 상향
                    </strong>
                    되거나, 자녀 수에 따라 추가 공제를 제공하는 새로운 방식이
                    도입될 가능성이 매우 높습니다. 특히 영유아 자녀에 대한 추가
                    공제 신설도 유력하게 거론됩니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-4 border-indigo-500">
                  <h3 className="font-bold !mt-0 !text-xl flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    예측 2: 월세 세액공제, 문턱이 낮아진다
                  </h3>
                  <p className="!my-2 !text-base">
                    <strong>현행:</strong> 총급여 7,000만원 이하 무주택자 대상
                    <br />
                    <strong>변경 예측:</strong> 1인 가구와 청년층의 주거비
                    부담을 덜어주기 위해,{" "}
                    <strong>소득 기준을 8,000만원 또는 그 이상으로 완화</strong>
                    하고, 공제 대상 주택의 기준시가(현재 4억원 이하)를 상향
                    조정할 가능성이 큽니다. 이를 통해 더 많은 청년 직장인들이
                    월세 공제 혜택을 받게 될 것입니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-4 border-indigo-500">
                  <h3 className="font-bold !mt-0 !text-xl flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    예측 3: IRP/연금저축, 세액공제 한도 상향?
                  </h3>
                  <p className="!my-0 !text-base">
                    국민의 노후 준비를 장려하기 위해 연금계좌의 세액공제
                    한도(현재 연 900만원)를{" "}
                    <strong>연 1,200만원까지 상향 조정</strong>하자는 논의가
                    꾸준히 이어지고 있습니다. 만약 현실화된다면, 고소득
                    직장인들에게는 최고의 절세 전략이 될 것입니다.
                  </p>
                </div>
              </div>
              <blockquote>
                <p>
                  <strong>주의:</strong> 본 내용은 2025년 9월 현재 논의 중인
                  내용을 바탕으로 한 예측이며, 최종 세법 개정안은 국회 논의
                  과정에서 변경될 수 있습니다. 확정된 내용은 연말에 다시 한번
                  확인해야 합니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">
                미래를 아는 자가 절세 전쟁에서 승리한다
              </h2>
              <p>
                세법의 변화를 예측하고 남들보다 먼저 준비하는 것은 현명한
                직장인의 필수 역량입니다. 내년의 변화를 예측했다면, 올해의
                환급액부터 제대로 챙겨야겠죠?
              </p>
              <Link
                href="/year-end-tax"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                올해 내 환급금부터 계산해보기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
