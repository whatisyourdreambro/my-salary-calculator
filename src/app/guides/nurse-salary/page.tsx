import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "2025년 간호사 연봉 테이블 완벽 분석 (신규, 5년차, 수간호사) | Moneysalary",
  description:
    "2025년 최신 자료를 바탕으로 대학병원, 종합병원, 개인병원별 신규 간호사부터 5년차, 10년차 이상 수간호사까지 직급별 연봉 및 실수령액 정보를 제공합니다.",
};

// Article 스키마 데이터 추가
const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "2025년 간호사 연봉 테이블 완벽 분석 (신규, 5년차, 수간호사)",
  author: { "@type": "Organization", name: "Moneysalary" },
  publisher: {
    "@type": "Organization",
    name: "Moneysalary",
    logo: {
      "@type": "ImageObject",
      url: "https://www.moneysalary.com/favicon.ico",
    },
  },
  datePublished: "2025-09-17",
  dateModified: "2025-09-17",
  description:
    "대학병원, 종합병원, 개인병원별 신규 간호사부터 5년차, 10년차 이상 수간호사까지 직급별 연봉 및 실수령액 정보를 제공합니다.",
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
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <article className="prose dark:prose-invert lg:prose-xl w-full">
          <div className="mb-8">
            <h1 className="!mb-2">2025년 간호사 연봉 테이블 완벽 분석</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              최종 업데이트: 2025년 9월 17일
            </p>
          </div>

          <p className="lead">
            간호사를 준비하는 학생부터 현직 간호사까지, 많은 분들이 궁금해하는
            것이 바로 연봉입니다. 병원의 규모, 경력, 직책에 따라 연봉은 큰
            차이를 보입니다. 이 글에서는 2025년 최신 데이터를 기반으로 **병원
            종류와 경력별 예상 연봉 테이블**을 통해 내 연봉 수준을 정확히
            파악하고 미래를 계획하는 데 도움을 드립니다.
          </p>

          <h2>병원 종류 및 경력별 연봉 테이블 (세전)</h2>
          <p>
            아래 표는 일반적인 3교대 근무, 초과근무수당 등을 포함한 평균적인
            세전 연봉 추정치입니다. 실제 연봉은 개인의 역량과 병원의 정책에 따라
            달라질 수 있습니다.
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>경력</th>
                  <th>상급종합병원 (대학병원 등)</th>
                  <th>종합병원</th>
                  <th>개인병원 / 요양병원</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>신규 (1년차)</strong>
                  </td>
                  <td>4,500만원 ~ 5,500만원</td>
                  <td>4,000만원 ~ 4,800만원</td>
                  <td>3,600만원 ~ 4,200만원</td>
                </tr>
                <tr>
                  <td>
                    <strong>5년차</strong>
                  </td>
                  <td>6,000만원 ~ 7,500만원</td>
                  <td>5,000만원 ~ 6,000만원</td>
                  <td>4,500만원 ~ 5,200만원</td>
                </tr>
                <tr>
                  <td>
                    <strong>10년차 이상 (책임/수간호사급)</strong>
                  </td>
                  <td>8,000만원 ~ 1억 이상</td>
                  <td>6,500만원 ~ 8,000만원</td>
                  <td>5,500만원 ~ 6,500만원</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>연봉만큼 중요한 &apos;세후 실수령액&apos;</h2>
          <p>
            계약서상의 연봉과 실제 통장에 들어오는 월급은 다릅니다. 4대보험과
            소득세를 제외한 금액이 바로 &apos;세후 실수령액&apos;입니다. 예를
            들어, 세전 연봉 5,000만원인 신규 간호사의 월 예상 실수령액은 약
            353만원입니다.
          </p>
          <blockquote>
            <p>
              내 연봉의 정확한 월 실수령액이 궁금하신가요?{" "}
              <Link href="/">Moneysalary 연봉 계산기</Link>에 직접 입력하여 세금
              공제 내역까지 상세하게 확인해보세요.
            </p>
          </blockquote>
        </article>
      </main>
    </>
  );
}
