import type { Metadata } from "next";
import Link from "next/link";
import { UserCheck, TrendingUp, Briefcase, Map } from "lucide-react";

export const metadata: Metadata = {
  title: "5년차 간호사 연봉과 커리어: 번아웃과 성장 사이 (2025년)",
  description:
    "병원 허리가 된 5년차 간호사, 현실 연봉은 얼마일까? BIG 5 병원 기준 실수령액과 함께, 임상에 남을 것인가 떠날 것인가. 수간호사, 전문간호사, 탈임상 등 현실적인 커리어 로드맵을 제시합니다.",
  openGraph: {
    title: "5년차 간호사 연봉과 커리어: 번아웃과 성장 사이 (2025년)",
    description:
      "임상에 남을 것인가, 떠날 것인가. 5년차 간호사의 현실 연봉과 미래 커리어 로드맵.",
    images: [
      "/api/og?title=5년차 간호사의 연봉과 미래&description=현실적인 커리어 로드맵 심층 분석",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "5년차 간호사 연봉과 커리어: 번아웃과 성장 사이 (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-22",
  dateModified: "2025-09-22",
  description:
    "BIG 5 병원 기준 실수령액과 함께, 임상에 남을 것인가 떠날 것인가. 수간호사, 전문간호사, 탈임상 등 현실적인 커리어 로드맵을 제시합니다.",
};

export default function Nurse5yrSalaryPage() {
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
        <div className="w-full bg-gradient-to-br from-rose-500 to-pink-600 dark:from-gray-900 dark:to-rose-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            5년차 간호사,
            <br /> <span className="text-pink-200">번아웃과 성장 사이</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-rose-100 dark:text-gray-300">
            신규의 티를 벗고 병원의 진짜 허리가 된 당신. 하지만 동시에 찾아오는
            번아웃과 미래에 대한 고민. 5년차 간호사의 현실적인 연봉과 커리어의
            갈림길을 함께 고민합니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              3교대 근무의 고됨과 프리셉터로서의 책임감, 그리고 반복되는 일상.
              5년차는 많은 간호사들이 &apos;이 길을 계속 가야 하나&apos;라는
              질문을 스스로에게 던지는 시기입니다. 이 고민의 중심에는 &apos;나의
              노동 가치가 제대로 인정받고 있는가&apos;라는 현실적인 연봉 문제가
              자리 잡고 있습니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <UserCheck className="w-7 h-7 text-rose-500" />
                5년차 간호사, 현실 연봉 테이블
              </h2>
              <p>
                5년차가 되면 신규 시절과는 비교할 수 없는 연봉 상승을
                경험합니다. 특히 상급종합병원(대학병원) 기준, 5년차 간호사의
                평균 연봉은 각종 수당을 포함하여{" "}
                <strong>6,500만원에서 8,000만원</strong> 사이로 형성되며, 이는
                대기업 직장인과 비교해도 결코 적지 않은 금액입니다.
              </p>
              <blockquote>
                <p>
                  <strong>월 실수령액은?</strong> 연봉 7,000만원을 가정했을 때,
                  1인 가구, 비과세 20만원 기준 월 실수령액은{" "}
                  <strong>약 470만원</strong> 수준입니다. 하지만 잦은
                  초과근무(OT)와 나이트 수당에 따라 이 금액은 더 늘어날 수
                  있습니다.
                </p>
              </blockquote>
              <p>
                더 자세한 병원별, 직급별 연봉 정보가 궁금하다면 아래 링크를
                참고하세요.
              </p>
              <Link
                href="/guides/nurse-salary"
                className="font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                2025년 간호사 연봉 테이블 완벽 분석 가이드 →
              </Link>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Map className="w-7 h-7 text-blue-500" />
                커리어의 갈림길: 당신의 다음 행선지는?
              </h2>
              <p>
                5년차는 임상에 남아 전문가로 성장할 것인가, 아니면 새로운 길을
                모색할 것인가를 결정하는 중요한 시기입니다. 각 경로의 특징과
                연봉 전망을 살펴보세요.
              </p>
              <div className="mt-6 space-y-4">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !mb-1 text-lg flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    임상 전문가 (Clinical Expert)
                  </h3>
                  <p className="!my-0 !text-base">
                    주임, 수간호사, 팀장으로 승진하며 리더십을 발휘하는 경로.
                    10년차 이상 수간호사는 <strong>1억원 이상의 연봉</strong>도
                    가능합니다. 또는 특정 분야의 전문간호사 자격을 취득하여
                    최고의 전문가로 인정받을 수도 있습니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !mb-1 text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    탈임상 (Beyond Clinical)
                  </h3>
                  <p className="!my-0 !text-base">
                    임상 경력을 바탕으로 새로운 분야에 도전합니다. 제약회사(CRA,
                    MA), 보험심사, 8급 보건진료직 공무원, 연구간호사 등 다양한
                    길이 열려있습니다. 초기 연봉은 임상보다 낮을 수 있지만,{" "}
                    <strong>규칙적인 근무(상근직)</strong>라는 강력한 장점이
                    있습니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">
                당신의 5년, 그 이상의 가치를 인정받으세요
              </h2>
              <p>
                힘들게 버텨온 당신의 5년은 그 무엇과도 바꿀 수 없는 소중한
                자산입니다. 당신의 경험과 지식의 가치를 정확히 계산하고, 더 나은
                미래를 위한 현명한 선택을 내리시길 응원합니다.
              </p>
              <Link
                href="/?salaryInput=70,000,000&payBasis=annual"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                내 연봉 실수령액 정확히 계산하기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
