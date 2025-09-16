import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "2025년 연봉 실수령액 완벽 가이드: 세후 월급과 세금 총정리",
  description:
    "2025년 최신 세법 기준, 연봉별 실수령액 표와 4대보험, 소득세 공제액을 상세히 분석합니다. 연봉 3000, 4000, 5000, 6000, 1억까지 구간별 세후 월급을 확인하세요.",
};

// [수정] Article 스키마에 발행인(publisher), 수정일(dateModified) 정보 추가
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
  dateModified: "2025-09-16",
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
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <article className="prose dark:prose-invert lg:prose-xl w-full">
          {/* ... 기존 article 내용 ... */}
          <div className="mb-8">
            <h1 className="!mb-2">2025년 연봉 실수령액 완벽 가이드</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              최종 업데이트: 2025년 9월 16일
            </p>
          </div>

          <p className="lead">
            2025년 새해가 밝았습니다. 올해 내 통장에 찍힐 월급은 얼마일까요?
            연봉 협상 결과만큼이나 중요한 것이 바로{" "}
            <strong>세후 실수령액</strong>입니다. 이 글에서는 2025년 최신 세법을
            기준으로, 복잡한 4대보험과 소득세 공제 항목을 하나하나 분석하여 실제
            내 손에 들어오는 금액을 명확하게 알려드립니다.
          </p>

          <h2>
            연봉 실수령액, 왜 차이가 날까요? 핵심은 <strong>공제</strong>
          </h2>
          <p>
            계약서에 명시된 연봉 총액과 실제 월급이 다른 이유는 바로 세금과 4대
            보험료 때문입니다. 이를 <strong>공제</strong>라고 부르며, 주요
            항목은 다음과 같습니다. 자세한 내용은{" "}
            <Link href="/glossary">용어 사전</Link>을 참고하세요.
          </p>
          <ul>
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

          <h2>주요 연봉 구간별 실수령액 표 (2025년 기준)</h2>
          <p>
            가장 궁금해하실 주요 연봉 구간별 월 예상 실수령액입니다. 더 정확한
            금액은 <Link href="/">연봉 계산기</Link>에 직접 입력하여
            확인해보세요.
          </p>
          <div className="overflow-x-auto">
            <table>
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

          <h2>더 많은 수익을 원하시나요? (추가 팁)</h2>
          <p>
            단순히 월급만 기다리는 시대는 지났습니다. 최근 많은 직장인들이
            부업이나 재테크를 통해 추가 수익을 창출하고 있습니다. N잡, 주식
            투자, 부동산 등 다양한 방법으로 월 300만원 이상의 수익을 목표로
            해보세요.
          </p>

          <blockquote>
            <p>
              내 연봉 순위가 궁금하다면?{" "}
              <Link href="/#salary-rank">내 연봉 순위 확인하기</Link>로 이동하여
              다른 사람들과 비교해보세요.
            </p>
          </blockquote>
        </article>
      </main>
    </>
  );
}
