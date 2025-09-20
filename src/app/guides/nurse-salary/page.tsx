import type { Metadata } from "next";
import Link from "next/link";
import { Hospital, TrendingUp } from "lucide-react"; // Briefcase, MapPin 제거

export const metadata: Metadata = {
  title: "간호사 연봉 테이블: 신규부터 수간호사까지 총정리 (2025년)",
  description:
    "대학병원(BIG 5) 신규 간호사 초봉부터 5년차, 10년차 수간호사까지. 병원 규모별, 경력별 현실적인 연봉과 세후 실수령액, 그리고 간호사의 커리어 로드맵까지 완벽 분석합니다.",
  openGraph: {
    title: "간호사 연봉 테이블: 신규부터 수간호사까지 총정리 (2025년)",
    description:
      "백의의 천사, 그들의 진짜 연봉은 얼마일까요? 병원 규모별, 경력별 현실적인 연봉을 알려드립니다.",
    images: [
      "/api/og?title=간호사 연봉 테이블 완벽 분석&description=신규부터 수간호사까지, 2025년 최신 정보",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "간호사 연봉 테이블: 신규부터 수간호사까지 총정리 (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-17",
  dateModified: "2025-09-21",
  description:
    "대학병원(BIG 5) 신규 간호사 초봉부터 5년차, 10년차 수간호사까지. 병원 규모별, 경력별 현실적인 연봉과 세후 실수령액, 그리고 간호사의 커리어 로드맵까지 완벽 분석합니다.",
};

export default function NurseSalaryGuidePage() {
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
        <div className="w-full bg-gradient-to-br from-pink-500 to-rose-500 dark:from-gray-900 dark:to-rose-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            백의의 천사,
            <br /> 간호사의 진짜 연봉
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-rose-100 dark:text-gray-300">
            고된 업무 강도만큼 합당한 보상을 받고 있을까요? 신규 간호사부터
            베테랑 수간호사까지, 병원 규모와 경력에 따른 2025년 최신 연봉
            테이블을 공개합니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              간호사는 생명을 다루는 숭고한 직업이지만, 높은 수준의 전문성과
              고된 3교대 근무, 감정 노동을 요구하는 직업이기도 합니다. 간호사를
              준비하는 학생부터 현직 간호사까지, 많은 분들이 궁금해하는 연봉
              정보를 병원의 규모, 경력, 직책에 따라 심층적으로 분석했습니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Hospital className="w-7 h-7 text-pink-500" />
                병원 규모가 연봉을 결정한다
              </h2>
              <p>
                간호사의 연봉을 결정하는 가장 큰 변수는 단연 병원의 규모입니다.
                흔히 말하는 &apos;BIG 5&apos; 병원(서울대, 세브란스, 삼성서울,
                서울아산, 서울성모)을 포함한 상급종합병원과 일반 종합병원,
                그리고 개인/요양병원 사이에는 상당한 연봉 격차가 존재합니다.
              </p>
            </section>

            <section className="mt-12 overflow-x-auto">
              <h2 className="!text-2xl font-bold text-center">
                2025년 경력별 연봉 테이블 (세전 추정치)
              </h2>
              <p className="text-center text-sm text-gray-500">
                ※ 3교대, 초과근무수당 등 포함, 병원별 차이 있음
              </p>
              <table className="min-w-full text-center mt-4">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">경력</th>
                    <th className="py-3 px-4 font-bold text-rose-600">
                      상급종합병원 (BIG 5)
                    </th>
                    <th className="py-3 px-4 font-semibold">종합병원</th>
                    <th className="py-3 px-4 font-semibold">개인/요양병원</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="py-4 px-4 font-semibold">신규 (1년차)</td>
                    <td className="py-4 px-4 font-bold">4,800 ~ 5,500만원</td>
                    <td className="py-4 px-4">4,000 ~ 4,800만원</td>
                    <td className="py-4 px-4">3,600 ~ 4,200만원</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-semibold">5년차</td>
                    <td className="py-4 px-4 font-bold">6,500 ~ 8,000만원</td>
                    <td className="py-4 px-4">5,000 ~ 6,000만원</td>
                    <td className="py-4 px-4">4,500 ~ 5,200만원</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-semibold">
                      10년차+ (수간호사급)
                    </td>
                    <td className="py-4 px-4 font-bold">8,500만원 ~ 1.2억원</td>
                    <td className="py-4 px-4">6,500 ~ 8,000만원</td>
                    <td className="py-4 px-4">5,500 ~ 6,500만원</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-green-500" />
                간호사의 커리어 로드맵과 연봉 상승
              </h2>
              <p>
                간호사의 연봉은 단순히 시간이 흐른다고 오르지 않습니다. 어떤
                커리어 경로를 선택하느냐에 따라 연봉 상승률은 크게 달라집니다.
              </p>
              <blockquote>
                <p>
                  <strong>임상 간호사:</strong> 병원에 남아 경력을 쌓으며 주임,
                  수간호사, 팀장으로 승진하는 가장 일반적인 경로입니다. 직책이
                  올라갈수록 연봉은 크게 상승합니다. <br />
                  <strong>전문 간호사:</strong> 특정 분야(종양, 마취, 응급 등)의
                  석사 학위와 자격을 취득하여 해당 분야의 전문가로 활동하며 높은
                  연봉을 받습니다. <br />
                  <strong>탈임상:</strong> 제약회사, 보험심사, 공무원 등 병원을
                  떠나 새로운 분야로 진출하는 경우도 많습니다. 임상 경력을
                  바탕으로 다양한 기회를 잡을 수 있습니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">
                당신의 연봉, 정확한 가치를 확인하세요
              </h2>
              <p>
                위 연봉 테이블은 평균적인 추정치입니다. 비과세 수당, 부양가족 등
                당신의 상황에 맞는 정확한 세후 실수령액을 직접 확인하고, 미래의
                커리어 계획을 세워보세요.
              </p>
              <Link
                href="/"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                내 연봉 실수령액 계산하기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
