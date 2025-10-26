import type { Metadata } from "next";
import Link from "next/link";
import { TrendingDown, Shield, Sliders, CheckSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "퇴직금 세금 계산: 최소 40% 아끼는 공제의 비밀 (2025년)",
  description:
    "내 퇴직금에서 세금이 얼마나 나갈까? 복잡한 퇴직소득세 4단계 계산법과 세금을 획기적으로 줄여주는 '근속연수공제', '환산급여공제'의 모든 것을 실제 예시와 함께 완벽하게 설명합니다.",
  openGraph: {
    title: "퇴직금 세금, 최소 40% 아끼는 공제의 비밀",
    description:
      "수천만 원이 될 수 있는 내 퇴직금 세금, 계산법을 아는 만큼 돌려받습니다.",
    images: [
      "/api/og?title=퇴직금 세금, 아는 만큼 아낀다&description=2025년 기준 완벽 계산 가이드",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "퇴직금 세금 계산: 최소 40% 아끼는 공제의 비밀 (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-01",
  dateModified: "2025-09-20",
  description:
    "복잡한 퇴직소득세 4단계 계산법과 세금을 획기적으로 줄여주는 '근속연수공제', '환산급여공제'의 모든 것을 실제 예시와 함께 완벽하게 설명합니다.",
};

export default function SeveranceTaxPage() {
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
        <div className="w-full bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-900 dark:to-black text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            내 퇴직금 세금,
            <br />
            얼마나 떼일까?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-300">
            수십 년의 땀과 노력이 담긴 퇴직금. 하지만 세금 계산법을 모른다면
            생각보다 훨씬 많은 돈을 잃을 수 있습니다. 세금을 결정하는 핵심
            원리를 파헤쳐 드립니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              오랜 직장 생활의 마침표, 퇴직금. 하지만 막상 수령할 때가 되면
              복잡한 세금 문제에 부딪히게 됩니다. 퇴직소득세는 다른 소득에 비해
              세금 부담이 적도록 설계되었지만, 그 구조가 매우 복잡해 이해하기
              어렵습니다. 이 글에서는 4단계로 이루어진 퇴직소득세 계산의 전
              과정을 하나씩, 그리고 쉽게 풀어드립니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <TrendingDown className="w-7 h-7 text-signature-blue" />
                퇴직금 세금, 왜 월급보다 적게 낼까?
              </h2>
              <p>
                국가는 장기간의 근로에 대한 보상인 퇴직금에 대해서는 큰 세제
                혜택을 줍니다. 월급처럼 매년 세금을 매기는 것이 아니라, 퇴직 시
                한 번에 정산하면서 <strong>&apos;공제&apos;</strong>라는
                이름으로 세금 부담을 대폭 줄여주기 때문입니다. 이 공제의 규모가
                매우 커서, 실제 적용되는 세율이 명목 세율보다 훨씬 낮아지는
                효과가 있습니다.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Sliders className="w-7 h-7 text-purple-500" />
                복잡한 4단계 계산법, 핵심만 파헤치기
              </h2>
              <p>
                내 퇴직소득세는 아래와 같은 4단계의 과정을 거쳐 최종 결정됩니다.
                각 단계의 핵심은 &apos;얼마나 많이 깎아주는가(공제)&apos;에
                있습니다.
              </p>
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="!mt-0 !mb-1 font-semibold text-lg">
                    1단계: 환산급여 계산 (연봉으로 바꾸기)
                  </h3>
                  <p className="!my-0 !text-base">
                    <strong>(퇴직금 - 근속연수공제) ÷ 근속연수 × 12</strong>.
                    퇴직금을 연봉처럼 바꿔서 세율을 적용하기 쉽게 만드는
                    과정입니다. 여기서 첫 번째 세금 할인,{" "}
                    <strong>근속연수공제</strong>가 적용됩니다.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="!mt-0 !mb-1 font-semibold text-lg">
                    2단계: 과세표준 계산 (진짜 세금 기준 금액)
                  </h3>
                  <p className="!my-0 !text-base">
                    <strong>환산급여 - 환산급여공제</strong>. 1단계에서 계산된
                    금액에서 두 번째 세금 할인, <strong>환산급여공제</strong>를
                    적용해 세금을 매길 최종 기준 금액을 확정합니다. 이 공제
                    규모가 매우 큽니다.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="!mt-0 !mb-1 font-semibold text-lg">
                    3단계: 산출세액 계산 (세율 적용)
                  </h3>
                  <p className="!my-0 !text-base">
                    <strong>과세표준 × 기본세율(6~45%)</strong>. 드디어 세율을
                    곱해 세금을 계산합니다. 하지만 이게 끝이 아닙니다.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="!mt-0 !mb-1 font-semibold text-lg">
                    4단계: 최종 납부세액 (마지막 조정)
                  </h3>
                  <p className="!my-0 !text-base">
                    <strong>(산출세액 ÷ 12 × 근속연수)</strong>. 3단계 세금을
                    다시 연 단위로 쪼개 최종적으로 내가 낼 세금을 결정합니다.
                    장기 근속의 효과를 마지막으로 반영해주는 과정입니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Shield className="w-7 h-7 text-green-500" />
                세금을 줄이는 두 개의 핵심 방패: 공제
              </h2>
              <p>
                결국 퇴직금 세금의 핵심은 &apos;근속연수공제&apos;와
                &apos;환산급여공제&apos;라는 두 가지 거대한 공제 항목입니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-bold !mt-0 !text-lg">근속연수공제</h3>
                  <p className="!text-base !my-0 mt-2">
                    오래 일할수록 더 많이 깎아주는 공제입니다. 근속연수에 따라
                    정해진 금액을 퇴직금에서 바로 빼주기 때문에,
                    장기근속자일수록 세금 부담이 크게 줄어듭니다.
                  </p>
                </div>
                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-bold !mt-0 !text-lg">환산급여공제</h3>
                  <p className="!text-base !my-0 mt-2">
                    가장 강력한 세금 할인 혜택입니다. 1단계에서 계산된
                    환산급여를 기준으로, 소득 구간에 따라 최소 40%에서 최대
                    100%까지 매우 높은 비율로 금액을 추가 공제해줍니다.
                  </p>
                </div>
              </div>
              <blockquote>
                <p>
                  <strong>결론:</strong> 이 두 가지 강력한 공제 덕분에,
                  근속연수가 길고 퇴직금이 소액인 경우 세금이 전혀 없을 수도
                  있습니다. 복잡한 계산 과정은 결국 세금을 최대한 줄여주기 위한
                  장치인 셈입니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <CheckSquare className="w-7 h-7 text-signature-blue" />
                복잡한 계산은 이제 그만
              </h2>
              <p>
                원리는 이해했지만 여전히 복잡하신가요? 걱정하지 마세요.
                Moneysalary 퇴직금 계산기에 당신의 정보만 입력하면, 이 모든
                복잡한 과정을 거친 최종 예상 퇴직금을 바로 확인할 수 있습니다.
              </p>
              <Link
                href="/?tab=severance"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                내 퇴직금 바로 확인하기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
