import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, PiggyBank, BarChartHorizontal } from "lucide-react";

export const metadata: Metadata = {
  title: "연봉 4500만원 실수령액: 세후 월급 318만원, 적절한 걸까? (2025년)",
  description:
    "연봉 4500만원 직장인의 통장에 찍히는 진짜 월급은? 2025년 기준 세후 실수령액 318만원을 상세히 분해하고, 이 시기 직장인을 위한 가장 현실적인 재테크 전략과 미래 로드맵을 제시합니다.",
  openGraph: {
    title: "연봉 4500만원의 모든 것: 실수령액부터 재테크 전략까지",
    description:
      "내 월급 318만원, 제대로 알고 쓰고 계신가요? 당신의 돈에 대한 시야를 넓혀드립니다.",
    images: [
      "/api/og?title=연봉 4500만원 심층 분석&description=실수령액부터 미래 자산 전략까지",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "연봉 4500만원 실수령액: 세후 월급 318만원, 적절한 걸까? (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-19",
  dateModified: "2025-09-20",
  description:
    "2025년 기준 연봉 4500만원의 세후 실수령액 318만원을 상세히 분해하고, 이 시기 직장인을 위한 가장 현실적인 재테크 전략과 미래 로드맵을 제시합니다.",
};

export default function Salary4500GuidePage() {
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
        <div className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-gray-900 dark:to-indigo-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            연봉 4500만원,
            <br />내 삶의 진짜 시작점
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-purple-100 dark:text-gray-300">
            사회초년생 단계를 지나 경력의 첫 이정표를 세운 당신. 그 가치를
            증명하는 연봉 4500만원의 실제 모습과 미래를 위한 자산 전략을 심도
            있게 분석합니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              &apos;연봉 4500만원&apos;은 더 이상 신입사원이 아닌, 조직의 허리
              역할을 준비하는 경력직의 상징입니다. 하지만 기대와 달리, 세금과
              4대 보험의 무게가 본격적으로 느껴지기 시작하는 구간이기도 하죠.
              월급봉투 뒤에 숨겨진 진실을 파헤치고, 현명하게 자산을 불려나갈
              전략을 세워야 할 때입니다.
            </p>

            {/* Result Section */}
            <section className="mt-12 bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-center">
              <h2 className="!mt-0 !text-2xl font-bold text-indigo-800 dark:text-indigo-200">
                결론: 2025년 기준, 당신의 월급 통장에는...
              </h2>
              <p className="text-5xl sm:text-6xl font-bold text-indigo-600 dark:text-indigo-400 my-4">
                약 3,181,390원
              </p>
              <p className="font-medium text-indigo-700 dark:text-indigo-300">
                (1인 가구, 월 비과세액 20만원 기준)
              </p>
              <p className="text-sm text-indigo-500 dark:text-indigo-400/80 mt-2">
                월급 약 375만원 중 <strong>약 56만원</strong>이 공제됩니다.
              </p>
            </section>

            {/* Deduction Breakdown Section */}
            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <BarChartHorizontal className="w-7 h-7 text-red-500" />
                월급 56만원, 어디로 사라졌을까?
              </h2>
              <p>
                연봉 4500만원은 소득세율 15% 구간이 적용되는 시작점입니다. 이전
                구간(연봉 1400만원 이하, 6%)보다 세율이 2.5배 높아져 세금 부담이
                체감적으로 크게 늘어납니다. 매달 내 월급에서 빠져나가는 공제
                내역을 자세히 살펴보는 것은, 내 돈의 흐름을 이해하는
                첫걸음입니다.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="font-semibold">국민연금 (내 노후자금)</span>
                  <span className="font-mono font-semibold">약 188,620원</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="font-semibold">
                    건강보험 (아플 때를 대비)
                  </span>
                  <span className="font-mono font-semibold">약 132,050원</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="font-semibold">고용보험 (실직 대비)</span>
                  <span className="font-mono font-semibold">약 33,520원</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="font-semibold">
                    근로소득세 (국가 운영 재원)
                  </span>
                  <span className="font-mono font-semibold">약 210,670원</span>
                </div>
              </div>
              <blockquote>
                <p>
                  <strong>잠깐!</strong> 부양가족이 있거나, 식대 외에 차량유지비
                  등 추가 비과세 혜택이 있다면 실수령액은 더 늘어날 수 있습니다.
                  Moneysalary 계산기에서 당신의 조건을 직접 입력하고 1원
                  단위까지 정확한 결과를 확인해보세요.
                </p>
              </blockquote>
            </section>

            {/* Financial Strategy Section */}
            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <PiggyBank className="w-7 h-7 text-green-500" />월 318만원 생존
                전략: 단순 저축을 넘어
              </h2>
              <p>
                이제 당신은 매달 약 318만원이라는 안정적인 현금 흐름을 갖게
                되었습니다. 소비의 유혹을 이겨내고 이 소중한 돈을 어떻게
                활용하느냐에 따라 5년, 10년 뒤 당신의 모습은 완전히 달라집니다.
                &apos;욜로&apos;도 좋지만, &apos;골로&apos; 가지 않기 위한
                최소한의 전략이 필요합니다.
              </p>
              <div className="mt-6 space-y-4">
                <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20">
                  <h3 className="font-bold !mt-0 !text-lg">
                    1. 강제 저축 시스템 구축: 월 150만원부터
                  </h3>
                  <p className="!my-0 !text-base">
                    선택이 아닌 필수입니다. 월급의 40~50%, 즉{" "}
                    <strong>120~150만원</strong> 이상을 &apos;없는 돈&apos;으로
                    생각하고 급여 이체일에 맞춰 자동이체 되도록 설정하세요.
                    연금저축펀드, IRP 계좌를 최우선으로 활용하여 연말정산 시
                    최대 148만원 이상을 환급받는 &apos;13월의 월급&apos;까지
                    챙겨야 합니다.
                  </p>
                </div>
                <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20">
                  <h3 className="font-bold !mt-0 !text-lg">
                    2. &apos;나&apos;를 위한 투자: 월 30만원의 기적
                  </h3>
                  <p className="!my-0 !text-base">
                    저축액 외 월 <strong>30만원</strong>은 당신의 몸값과 지식에
                    투자하세요. 외국어, 직무 관련 온라인 강의, 피트니스 멤버십
                    등은 당장의 소비처럼 보이지만, 미래에 수십 배의 가치로
                    돌아올 최고의 &apos;우상향&apos; 자산입니다.
                  </p>
                </div>
                <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20">
                  <h3 className="font-bold !mt-0 !text-lg">
                    3. 비상금 통장 마련: 최소 1,000만원
                  </h3>
                  <p className="!my-0 !text-base">
                    월급의 3~6배에 해당하는 <strong>최소 1,000만원</strong>을
                    언제든 인출할 수 있는 파킹통장 등에 예치하여 예상치 못한
                    리스크(갑작스러운 이직, 질병 등)에 대비하세요. 이는 당신의
                    소중한 장기 투자 계획을 지켜줄 가장 확실한 안전벨트입니다.
                  </p>
                </div>
              </div>
            </section>

            {/* Next Step CTA */}
            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <TrendingUp className="w-7 h-7 text-signature-blue" />
                당신의 다음 연봉은 얼마일까요?
              </h2>
              <p>
                연봉 4500만원은 끝이 아닌 새로운 시작입니다. 현재 가치에
                만족하지 말고, 성공적인 이직과 협상을 통해 당신의 가치를 더욱
                높여보세요.
              </p>
              <Link
                href="/?salaryInput=45,000,000&payBasis=annual"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                내 조건으로 정확히 계산하기 🧐
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
