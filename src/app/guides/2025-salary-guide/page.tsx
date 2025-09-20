import type { Metadata } from "next";
import Link from "next/link";

// [추가] 현재 날짜를 YYYY-MM-DD 형식으로 생성하는 로직
const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "2025년 연봉 실수령액 완벽 가이드: 세후 월급과 세금 총정리",
  description:
    "2025년 최신 세법 기준, 연봉별 실수령액 표와 4대보험, 소득세 공제액을 상세히 분석합니다. 연봉 3000, 4000, 5000, 6000, 1억까지 구간별 세후 월급을 확인하세요.",
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "2025년 연봉 실수령액 완벽 가이드: 세후 월급과 세금 총정리",
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
  datePublished: "2025-09-16",
  // [수정] dateModified 값을 동적으로 할당
  dateModified: currentDate,
  description:
    "2025년 최신 세법 기준, 연봉별 실수령액 표와 4대보험, 소득세 공제액을 상세히 분석합니다.",
};

export default function SalaryGuide2025Page() {
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
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            2025년 연봉 실수령액 완벽 가이드
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            내 통장에 찍힐 진짜 월급은 얼마일까요? 2025년 최신 세법 기준을
            완벽하게 정리해 드립니다.
          </p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            {/* [수정] 최종 업데이트 날짜를 동적으로 표시 */}
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <article className="prose dark:prose-invert lg:prose-xl max-w-none">
          <p className="lead">
            연봉 협상 결과만큼이나 중요한 것이 바로{" "}
            <strong>세후 실수령액</strong>입니다. 이 글에서는 2025년 최신 세법을
            기준으로, 복잡한 4대보험과 소득세 공제 항목을 하나하나 분석하여 실제
            내 손에 들어오는 금액을 명확하게 알려드립니다.
          </p>

          <section className="mt-12 bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="!mt-0 text-2xl font-bold">
              연봉 실수령액, 왜 차이가 날까요?
            </h2>
            <p>
              계약서에 명시된 연봉 총액과 실제 월급이 다른 이유는 바로 세금과
              4대 보험료, 즉 <strong>공제</strong> 때문입니다. 주요 항목은
              다음과 같습니다.
            </p>
            <ul className="!my-4">
              <li>
                <strong>국민연금:</strong> 노후를 대비하는 저축성 보험
              </li>
              <li>
                <strong>건강보험:</strong> 병원비 부담을 덜어주는 사회 보험
              </li>
              <li>
                <strong>고용보험:</strong> 실직 시 실업급여를 받기 위한 보험
              </li>
              <li>
                <strong>근로소득세(소득세):</strong> 벌어들인 소득에 대한 세금
              </li>
            </ul>
            <Link
              href="/glossary"
              className="block mt-4 p-3 bg-signature-blue/10 dark:bg-signature-blue/20 rounded-lg text-center font-semibold text-signature-blue hover:bg-signature-blue/20 dark:hover:bg-signature-blue/30 transition-colors"
            >
              더 많은 용어가 궁금하다면? 용어 사전 바로가기 →
            </Link>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold text-center">
              주요 연봉 구간별 실수령액 표 (2025년 기준)
            </h2>
            <p className="text-center">
              가장 궁금해하실 주요 연봉 구간별 월 예상 실수령액입니다.
            </p>
            <div className="overflow-x-auto mt-6">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th>연봉</th>
                    <th>월 세전</th>
                    <th>월 세후 예상액</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>3,000만원</strong>
                    </td>
                    <td>250만원</td>
                    <td>약 220만원</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>4,000만원</strong>
                    </td>
                    <td>333만원</td>
                    <td>약 288만원</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>5,000만원</strong>
                    </td>
                    <td>417만원</td>
                    <td>약 353만원</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>6,000만원</strong>
                    </td>
                    <td>500만원</td>
                    <td>약 416만원</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>1억원</strong>
                    </td>
                    <td>833만원</td>
                    <td>약 658만원</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Link
              href="/"
              className="block mt-6 p-4 bg-signature-blue text-white rounded-lg text-center font-bold hover:bg-blue-700 transition-colors"
            >
              내 연봉으로 정확한 실수령액 계산하기 🧐
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}
