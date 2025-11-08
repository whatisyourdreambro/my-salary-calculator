
import type { Metadata } from "next";
import Link from "next/link";
import { Code, BarChart2, TrendingUp, Lightbulb } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "IT 개발자 직무별 연봉 비교: 프론트, 백엔드, 데브옵스, 데이터 (2025년)",
  description:
    "개발자 연봉, 직무에 따라 천차만별! 프론트엔드, 백엔드, 데브옵스, 데이터 사이언티스트 등 주요 IT 개발 직무별 평균 연봉과 요구 역량, 커리어 성장 경로를 상세히 비교 분석합니다. 당신의 몸값을 높이는 전략을 찾아보세요.",
  openGraph: {
    title: "IT 개발자 직무별 연봉 비교: 프론트, 백엔드, 데브옵스, 데이터 (2025년)",
    description:
      "어떤 개발 직무가 가장 높은 연봉을 받을까? IT 개발자라면 반드시 알아야 할 직무별 연봉과 커리어 가이드.",
    images: ["/api/og?title=IT 개발자 직무별 연봉 비교"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "IT 개발자 직무별 연봉 비교: 프론트, 백엔드, 데브옵스, 데이터 (2025년)",
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
  datePublished: "2025-10-28",
  dateModified: currentDate,
  description:
    "프론트엔드, 백엔드, 데브옵스, 데이터 사이언티스트 등 주요 IT 개발 직무별 평균 연봉과 요구 역량, 커리어 성장 경로를 상세히 비교 분석합니다.",
};

const developerSalaryData = [
  { role: "프론트엔드 개발자", junior: "4,000만원 ~ 5,500만원", senior: "7,000만원 ~ 1.2억원", note: "사용자 경험(UX)과 인터페이스(UI) 구현" },
  { role: "백엔드 개발자", junior: "4,500만원 ~ 6,000만원", senior: "8,000만원 ~ 1.5억원", note: "서버, 데이터베이스, 시스템 설계 및 구축" },
  { role: "데브옵스 엔지니어", junior: "5,000만원 ~ 7,000만원", senior: "9,000만원 ~ 1.8억원", note: "개발-운영 통합, 자동화, 클라우드 인프라 관리" },
  { role: "데이터 사이언티스트", junior: "5,000만원 ~ 7,000만원", senior: "9,000만원 ~ 2억원", note: "데이터 분석, 머신러닝 모델 개발, 비즈니스 인사이트 도출" },
  { role: "모바일 개발자 (iOS/Android)", junior: "4,000만원 ~ 6,000만원", senior: "7,000만원 ~ 1.3억원", note: "모바일 앱 개발 및 유지보수" },
];

export default function ItDeveloperSalaryComparisonPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-purple-600 to-indigo-700 dark:from-gray-900 dark:to-purple-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            IT 개발자 연봉,
            <br /> 직무별로 얼마나 다를까?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            개발자 전성시대! 하지만 어떤 직무를 선택하느냐에 따라 연봉과 커리어 패스는 천차만별입니다. 프론트엔드부터 데이터 사이언티스트까지, 주요 IT 개발 직무별 연봉을 파헤쳐봅니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              IT 산업의 폭발적인 성장과 함께 개발자는 가장 각광받는 직업 중 하나가 되었습니다. 하지만 '개발자'라는 큰 범주 안에는 수많은 전문 분야가 존재하며, 각 분야는 요구하는 기술 스택, 업무 내용, 그리고 연봉 수준에서 큰 차이를 보입니다. 자신의 적성과 목표에 맞는 직무를 선택하고, 그에 맞는 역량을 키우는 것이 성공적인 개발자 커리어의 핵심입니다.
            </p>

            <section className="mt-12 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h2 className="!mt-0 !text-2xl font-bold text-purple-600 flex items-center gap-2">
                <Code className="w-6 h-6" />
                개발자 연봉, 무엇이 결정할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>기술 스택:</strong> 희소성 있고 수요가 높은 기술(예: 클라우드, AI/ML, 블록체인)을 보유한 개발자는 더 높은 연봉을 받습니다.
                </li>
                <li>
                  <strong>경력과 역량:</strong> 주니어보다는 시니어, 단순히 코딩만 하는 개발자보다는 문제 해결 능력과 리더십을 갖춘 개발자가 높은 대우를 받습니다.
                </li>
                <li>
                  <strong>산업 및 기업 규모:</strong> IT 대기업, 스타트업, 금융권 IT 등 산업과 기업 규모에 따라 연봉 테이블이 크게 달라집니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <BarChart2 className="w-7 h-7 text-green-500" />
                주요 IT 개발 직무별 평균 연봉 (2025년 예상)
              </h2>
              <p className="text-center">
                각 직무별 주니어(신입~3년차) 및 시니어(5년차 이상) 개발자의 평균 연봉 추정치입니다. (세전, 성과급 포함)
              </p>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">직무</th>
                      <th className="py-3 px-4 font-bold text-signature-blue">주니어 (신입~3년차)</th>
                      <th className="py-3 px-4 font-bold text-green-600">시니어 (5년차 이상)</th>
                      <th className="py-3 px-4 font-semibold">주요 업무</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {developerSalaryData.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="py-4 px-4 font-bold">{item.role}</td>
                        <td className="py-4 px-4 font-semibold text-signature-blue">
                          {item.junior}
                        </td>
                        <td className="py-4 px-4 font-semibold text-green-600">
                          {item.senior}
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-sm">
                          {item.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
               <p class="text-xs text-center mt-2 text-gray-500">* 위 금액은 추정치이며, 기업 규모, 개인 역량, 기술 스택에 따라 실제와 차이가 클 수 있습니다.</p>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Lightbulb className="w-7 h-7 text-yellow-500" />
                당신의 몸값을 높이는 커리어 전략
              </h2>
              <p>
                어떤 직무를 선택하든, 꾸준한 학습과 성장은 개발자 커리어의 필수입니다. <br />
                Moneysalary의 다양한 가이드와 함께 당신의 몸값을 높이는 전략을 세워보세요.
              </p>
              <Link
                href="/guides/nekarakubae-salary"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                네카라쿠배 연봉 가이드 보기 👩‍💻
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
