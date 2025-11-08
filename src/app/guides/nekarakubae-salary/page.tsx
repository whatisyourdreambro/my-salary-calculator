import type { Metadata } from "next";
import Link from "next/link";
import { Code, Rocket, Crown, ShoppingCart, Bike, BookOpen } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "네카라쿠배 연봉/복지/문화 전격 비교 (2025년 최신)",
  description:
    "네이버, 카카오, 라인, 쿠팡, 배달의민족! 대한민국 IT 트렌드를 이끄는 5개 기업의 신입 초봉, 평균 연봉, 핵심 복지, 기업 문화, 그리고 입사 준비 방법까지 한눈에 비교 분석합니다.",
  openGraph: {
    title: "네카라쿠배 연봉/복지/문화 전격 비교 (2025년 최신)",
    description:
      "개발자들의 최종 목표, 네카라쿠배! 5개 회사의 연봉과 문화를 비교하고 당신의 다음 커리어를 계획해보세요.",
    images: ["/api/og?title=네카라쿠배 연봉/복지/문화 전격 비교"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "네카라쿠배 연봉/복지/문화 전격 비교 (2025년 최신)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-05-15",
  dateModified: currentDate,
  description:
    "네이버, 카카오, 라인, 쿠팡, 배달의민족 5개 기업의 신입 초봉, 복지, 기업 문화를 비교 분석하고 입사 준비 팁을 제공합니다.",
};

const companies = [
    { name: "네이버", salary: "6,000만원 + α", benefits: "주택자금 대출, 사내 병원, 릴랙스 휴가", culture: "안정적, 체계적, 기술 중심" },
    { name: "카카오", salary: "6,000만원 + α", benefits: "닉네임 문화, 유연 근무, 안식 휴가", culture: "수평적, 빠른 시도, 서비스 중심" },
    { name: "라인", salary: "6,000만원 이상", benefits: "해외 근무 기회, 뛰어난 개발 문화", culture: "글로벌, 자율성, 기술 공유 활발" },
    { name: "쿠팡", salary: "6,500만원 + 사이닝", benefits: "스톡옵션, 높은 보상, 자율 출퇴근", culture: "미국식, 데이터 중심, 치열함" },
    { name: "배달의민족", salary: "6,000만원 이상", benefits: "'송파구에서 일 잘하는 법' 문화, 자기계발비", culture: "독특한 B급 감성, 사용자 경험 중시" },
]

export default function NekarakubaeSalaryGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-purple-600 to-pink-500 dark:from-gray-900 dark:to-purple-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            네카라쿠배, 그곳이 궁금하다
            <br /> 연봉부터 문화까지
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-pink-100 dark:text-gray-300">
            개발자들의 '꿈의 직장'으로 불리는 네이버, 카카오, 라인, 쿠팡, 배달의민족. 대한민국 IT 생태계를 이끄는 이들 기업의 모든 것을 파헤쳐봅니다.
          </p>
          <p className="mt-4 text-xs text-pink-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              '네카라쿠배'는 더 이상 단순한 기업 이름의 나열이 아닙니다. 높은 연봉, 최고의 복지, 뛰어난 동료, 그리고 무한한 성장 기회를 상징하는 대한민국 IT 인재들의 '워너비' 그 자체가 되었습니다. 과연 이들 기업은 무엇이 다를까요?
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Code className="w-7 h-7 text-blue-500" />
                네카라쿠배 한눈에 비교하기
              </h2>
              <p>
                각 회사의 신입 개발자 초봉, 주요 복지, 그리고 문화를 한눈에 비교해 보세요. 연봉은 계약 조건, 스톡옵션, 사이닝 보너스에 따라 개인별로 크게 달라질 수 있습니다.
              </p>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="p-3 font-semibold">회사</th>
                      <th className="p-3 font-semibold">신입 초봉 (예상)</th>
                      <th className="p-3 font-semibold">주요 복지</th>
                      <th className="p-3 font-semibold">문화/특징</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {companies.map((company) => (
                      <tr key={company.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-3 font-bold">{company.name}</td>
                        <td className="p-3">{company.salary}</td>
                        <td className="p-3">{company.benefits}</td>
                        <td className="p-3">{company.culture}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-center mt-2 text-gray-500">* 최근에는 '당토(당근마켓, 토스)'를 포함하여 '네카라쿠배당토'로 불리기도 합니다.</p>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Rocket className="w-6 h-6" /> 네카라쿠배 입성을 위한 3가지 준비
              </h2>
              <ul className="!my-4 space-y-3 text-base">
                <li><strong>1. 코딩 테스트 통과:</strong> 알고리즘과 자료구조는 기본입니다. '백준', '프로그래머스' 등의 플랫폼에서 꾸준히 문제를 풀며 문제 해결 능력을 길러야 합니다.</li>
                <li><strong>2. 기술 블로그 & 포트폴리오:</strong> 단순히 코드를 나열하는 것을 넘어, 특정 기술을 왜 사용했는지, 문제 해결 과정에서 어떤 고민을 했는지 기록으로 남기는 것이 중요합니다. 당신의 성장 가능성을 보여주는 가장 좋은 방법입니다.</li>
                <li><strong>3. CS 기본기:</strong> 운영체제(OS), 네트워크, 데이터베이스 등 컴퓨터 과학의 기본 지식은 좋은 개발자의 필수 소양입니다. 면접에서 당신의 기술적 깊이를 보여줄 수 있습니다.</li>
              </ul>
            </section>

            <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">
                내 직군별 연봉은 어느 정도일까?
              </h2>
              <p className="mt-4 max-w-xl mx-auto">
                네카라쿠배를 목표로 하기 전, 백엔드, 프론트엔드, 앱 개발 등 내 직무의 시장 가치를 먼저 파악하는 것이 중요합니다. 직군별 상세 연봉 정보를 확인해보세요.
              </p>
              <Link
                href="/guides/it-developer-salary-comparison-by-role"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                <Code className="inline-block w-5 h-5 mr-2" />
                개발자 직군별 연봉 비교하기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}