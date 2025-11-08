import type { Metadata } from "next";
import Link from "next/link";
import { UserCheck, TrendingUp, Briefcase, GraduationCap } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "5년차 간호사 연봉, 그리고 이직과 진로 고민 (2025년)",
  description:
    "신규 시절을 지나 진짜 베테랑으로! 5년차 간호사의 병원별 평균 연봉과 이직, 사직, 대학원, 전문간호사, 그리고 탈임상까지. 다양한 진로 선택의 기로에 선 당신을 위한 현실 조언.",
  openGraph: {
    title: "5년차 간호사 연봉, 그리고 이직과 진로 고민 (2025년)",
    description:
      "숙련된 5년차 간호사, 당신의 다음 스텝은? 연봉과 커리어의 모든 가능성을 탐색해보세요.",
    images: ["/api/og?title=5년차 간호사, 연봉과 진로"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "5년차 간호사 연봉, 그리고 이직과 진로 고민 (2025년)",
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
    "5년차 간호사의 병원별 평균 연봉과 이직, 사직, 대학원, 전문간호사, 탈임상 등 다양한 진로 선택지에 대한 현실 조언.",
};

export default function Nurse5yrSalaryGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-teal-400 to-cyan-500 dark:from-gray-900 dark:to-teal-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            5년차 간호사,
            <br /> 연봉과 미래 사이의 고민
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-cyan-100 dark:text-gray-300">
            어느덧 병동의 허리가 된 5년차 간호사. 익숙해진 업무와 함께 찾아오는 커리어의 정체기. 더 높은 연봉을 위한 이직과 새로운 도전을 위한 진로 변경, 그 갈림길에 선 당신을 위한 안내서입니다.
          </p>
          <p className="mt-4 text-xs text-cyan-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              3교대 근무와 고된 업무를 버텨내고 능숙하게 환자를 돌보는 5년차. 이제는 신규 간호사를 가르치고 병동의 크고 작은 일들을 책임지는 베테랑입니다. 하지만 많은 5년차 간호사들이 비슷한 고민에 빠집니다. '이 병원에 계속 다니는 게 맞을까?' '간호사 말고 다른 길은 없을까?'
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-green-500" />
                5년차 간호사, 연봉은 얼마나 오를까?
              </h2>
              <p>
                5년차 간호사의 연봉은 병원 규모와 개인의 역량에 따라 큰 차이를 보입니다. 일반적으로 신규 시절보다 <strong>1,500만원 ~ 2,500만원</strong> 가량 상승하며, 빅5 병원의 경우 <strong>7,000만원 이상</strong>의 높은 연봉을 받기도 합니다.
              </p>
              <blockquote className="!border-l-teal-500">
                <p>
                  <strong>연봉 상승의 정체기?</strong> 5년차가 되면 연봉 상승률이 점차 둔화되기 시작합니다. 더 높은 연봉을 원한다면, 연봉 테이블이 더 높은 상급 병원으로의 이직이나, 전문성을 강화하여 수간호사, 전문간호사로 나아가는 길을 모색해야 합니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <UserCheck className="w-7 h-7 text-blue-500" />
                당신의 다음 스텝: 4가지 진로 선택지
              </h2>
              <p>
                임상에 남을 것인가, 새로운 도전을 할 것인가? 5년차 간호사가 선택할 수 있는 주요 진로 방향은 다음과 같습니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    <Briefcase className="w-6 h-6" /> 1. 이직 (상급 병원 / 경력직)
                  </h3>
                  <p className="!text-sm !my-0">
                    가장 현실적인 연봉 상승 방법. 5년의 임상 경력은 상급 병원이나 특수 파트(수술실, 중환자실 등)로 이직할 때 강력한 무기가 됩니다. 채용 공고를 꾸준히 확인하며 기회를 노리는 것이 중요합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    <GraduationCap className="w-6 h-6" /> 2. 대학원 진학 및 전문간호사
                  </h3>
                  <p className="!text-sm !my-0">
                    임상에 대한 깊이 있는 연구나 특정 분야의 전문가가 되고 싶다면 대학원 진학을 고려할 수 있습니다. 석사 학위 취득 후 <strong>전문간호사</strong> 자격증을 따면, 더 높은 연봉과 전문성을 인정받을 수 있습니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 탈임상: 새로운 분야로의 도전
                  </h3>
                  <p className="!text-sm !my-0">
                    3교대 근무와 병원 문화에 지쳤다면 '탈임상'도 좋은 선택지입니다. 제약회사(CRA), 보험심사간호사, 공무원(보건직/간호직), 산업간호사 등 임상 경력을 살릴 수 있는 다양한 길이 열려 있습니다.
                  </p>
                </div>
                 <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    4. 휴식 또는 사직
                  </h3>
                  <p className="!text-sm !my-0">
                    번아웃이 왔다면, 잠시 쉬어가는 것도 중요합니다. 퇴사 후 실업급여를 받으며 재충전의 시간을 갖고, 앞으로의 커리어를 차분히 고민해보는 것도 현명한 방법입니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold">
                퇴사 또는 이직, 실업급여가 궁금하다면?
              </h2>
              <p>
                자발적 퇴사라도 실업급여를 받을 수 있는 조건이 있습니다. <br />
                Moneysalary의 실업급여 가이드에서 당신의 권리를 확인해보세요.
              </p>
              <Link
                href="/guides/unemployment-benefits"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                실업급여 조건 및 신청방법 가이드 📝
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}