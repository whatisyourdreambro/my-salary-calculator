import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, HeartPulse, Briefcase, Hospital } from "lucide-react";

export const metadata: Metadata = {
  title:
    "4대 보험 완벽 가이드: 내 월급에서 왜, 얼마나 떼는 걸까? | Moneysalary",
  description:
    "국민연금, 건강보험, 고용보험, 산재보험까지. 월급봉투의 비밀, 4대 보험의 모든 것을 2025년 기준으로 가장 쉽게 알려드립니다. 내 삶을 지키는 최소한의 안전장치, 제대로 알아보세요.",
  openGraph: {
    title: "4대 보험 완벽 가이드: 내 월급에서 왜 떼는 걸까?",
    description:
      "국민연금, 건강보험, 고용보험, 산재보험. 내 삶을 지키는 든든한 안전망, 핵심만 쏙쏙 알려드립니다.",
    images: ["/api/og?title=4대 보험, 내 삶의 든든한 안전망"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "4대 보험 완벽 가이드: 내 월급에서 왜, 얼마나 떼는 걸까?",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-01",
  dateModified: "2025-09-20",
  description:
    "국민연금, 건강보험, 고용보험, 산재보험. 월급봉투의 비밀인 4대 보험의 모든 것을 2025년 기준으로 가장 쉽게 알려드립니다.",
};

export default function FourMajorInsurancesPage() {
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
        <div className="w-full bg-gradient-to-br from-teal-500 to-cyan-500 dark:from-gray-900 dark:to-teal-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            내 월급 속 4대 보험,
            <br />내 삶의 든든한 파트너
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-cyan-100 dark:text-gray-300">
            매달 월급에서 빠져나가는 돈, 아깝게만 느껴졌나요? 4대 보험은 미래의
            위험으로부터 나를 지켜주는 가장 강력하고 기본적인 사회 안전망입니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              월급날, 명세서를 보며 &apos;대체 이 돈은 다 어디로 가는
              걸까?&apos; 궁금했다면 제대로 찾아오셨습니다. 국민연금, 건강보험,
              고용보험, 산재보험. 이름만 들어도 복잡한 4대 보험의 진짜 가치와
              역할을 쉽고 명확하게 알려드립니다.
            </p>

            {/* Insurance Sections */}
            <section className="mt-12 space-y-10">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-signature-blue" />
                  </div>
                </div>
                <div>
                  <h2 className="!mt-0 !text-2xl font-bold">
                    국민연금: 먼 미래의 나를 위한 약속
                  </h2>
                  <p>
                    소득이 있을 때 꾸준히 보험료를 내어 모아두었다가, 나이가
                    들어 생업에 종사하지 못하거나 예기치 못한 사고나 질병으로
                    어려움을 겪을 때, 국가가 나에게 매달 연금을 지급하는
                    제도입니다. 지금의 작은 투자가 먼 훗날의 나에게 든든한
                    버팀목이 되어줍니다.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <HeartPulse className="w-8 h-8 text-brand-red" />
                  </div>
                </div>
                <div>
                  <h2 className="!mt-0 !text-2xl font-bold">
                    건강보험: 아플 때를 위한 최고의 방패
                  </h2>
                  <p>
                    병원에 갔을 때 상상 이상의 병원비 폭탄을 맞지 않는 이유,
                    바로 건강보험 덕분입니다. 평소에 모든 국민이 보험료를 내고,
                    이를 모아 아픈 사람이 큰 부담 없이 치료받을 수 있도록 돕는
                    사회적 연대 시스템입니다.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div>
                  <h2 className="!mt-0 !text-2xl font-bold">
                    고용보험: 재도약을 위한 안전그네
                  </h2>
                  <p>
                    내 의지와 상관없이 실직했을 때, 새로운 직장을 찾을 때까지
                    최소한의 생계를 유지할 수 있도록 실업급여를 지급합니다.
                    단순히 돈을 주는 것을 넘어, 재취업을 위한 직업 훈련 등
                    새로운 시작을 응원하는 든든한 지원군입니다.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                    <Hospital className="w-8 h-8 text-amber-600" />
                  </div>
                </div>
                <div>
                  <h2 className="!mt-0 !text-2xl font-bold">
                    산재보험: 일터에서의 나를 지키는 보험
                  </h2>
                  <p>
                    업무 중 발생한 사고나 질병에 대해 치료비와 보상을 책임지는
                    보험입니다. 이 보험료는 전액 회사가 부담하므로 근로자의
                    월급에서는 공제되지 않지만, 우리를 지켜주는 중요한 4대 보험
                    중 하나입니다.
                  </p>
                </div>
              </div>
            </section>

            {/* Call to Action Section */}
            <section className="mt-16 text-center bg-gray-50 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!mt-0 !text-2xl font-bold">
                그래서 내 월급에서 얼마가 나갈까요?
              </h2>
              <p className="mt-2 max-w-xl mx-auto">
                4대 보험료는 당신의 연봉을 기준으로 계산됩니다. 아래 버튼을 눌러
                내 연봉을 입력하고, 각 보험료가 얼마인지 상세한 내역을 직접
                확인해보세요.
              </p>
              <Link
                href="/"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                내 4대 보험료 상세 계산하기 🧮
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
