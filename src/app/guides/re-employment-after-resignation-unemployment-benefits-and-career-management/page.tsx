
import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, FileText, CalendarCheck, UserCheck } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "퇴사 후 재취업, 실업급여와 경력 관리: 공백기를 기회로! (2025년)",
  description:
    "퇴사 후 재취업, 막막하신가요? 실업급여 수급 조건과 신청 방법부터, 공백기 동안 경력을 효과적으로 관리하고 재취업에 성공하는 전략을 알려드립니다. 당신의 공백기를 성장의 기회로 만드세요.",
  openGraph: {
    title: "퇴사 후 재취업, 실업급여와 경력 관리: 공백기를 기회로! (2025년)",
    description:
      "퇴사 후 재취업, 더 이상 두렵지 않습니다. 실업급여와 경력 관리 전략으로 당신의 미래를 설계하세요.",
    images: ["/api/og?title=퇴사 후 재취업, 실업급여와 경력 관리"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "퇴사 후 재취업, 실업급여와 경력 관리: 공백기를 기회로! (2025년)",
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
    "실업급여 수급 조건과 신청 방법부터, 공백기 동안 경력을 효과적으로 관리하고 재취업에 성공하는 전략을 알려드립니다. 당신의 공백기를 성장의 기회로 만드세요.",
};

export default function ReemploymentAfterResignationGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-orange-500 to-red-600 dark:from-gray-900 dark:to-orange-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            퇴사 후 재취업,
            <br /> 실업급여와 경력 관리
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-red-100 dark:text-gray-300">
            새로운 시작을 위한 퇴사, 하지만 막상 재취업을 준비하려니 막막하신가요? 실업급여로 생활 안정을 꾀하고, 공백기 동안 경력을 효과적으로 관리하여 성공적인 재취업을 만드는 전략을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-red-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              퇴사는 새로운 기회를 위한 도전이 될 수도 있지만, 동시에 불안감과 막막함을 동반하기도 합니다. 특히 재취업까지의 공백기 동안 생활비 문제와 경력 단절에 대한 우려는 많은 퇴사자들이 겪는 어려움입니다. 하지만 실업급여 제도를 잘 활용하고, 공백기 동안 경력을 효과적으로 관리한다면, 당신은 충분히 성공적인 재취업을 이룰 수 있습니다. 이 가이드를 통해 퇴사 후 재취업의 모든 것을 파악하고, 당신의 미래를 설계하세요.
            </p>

            <section className="mt-12 bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800">
              <h2 className="!mt-0 !text-2xl font-bold text-brand-red flex items-center gap-2">
                <FileText className="w-6 h-6" />
                실업급여, 당신의 생활을 지켜줍니다!
              </h2>
              <p className="!my-2 text-base">
                실업급여는 고용보험 가입 근로자가 실직하여 재취업 활동을 하는 기간 동안 소정의 급여를 지급하여 생활 안정을 돕고 재취업의 기회를 지원하는 제도입니다. 퇴사 후 생활비 걱정 없이 재취업에 집중할 수 있도록 돕는 중요한 안전망입니다.
              </p>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>수급 조건:</strong> 이직일 이전 18개월 중 고용보험 가입 기간 180일 이상, 비자발적 이직 (자발적 퇴사도 정당한 사유 시 가능)
                </li>
                <li>
                  <strong>신청 방법:</strong> 워크넷 구직 등록 → 수급자격 신청 교육 이수 → 고용센터 방문 및 신청
                </li>
                <li>
                  <strong>지급액 및 기간:</strong> 퇴직 전 평균 임금의 60%, 최소 120일 ~ 최대 270일 (가입 기간 및 연령에 따라 차등)
                </li>
              </ul>
              <Link href="/guides/unemployment-benefits" className="font-semibold text-brand-red hover:underline">
                → 실업급여 완벽 가이드 보기
              </Link>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Briefcase className="w-7 h-7 text-blue-500" />
                공백기를 기회로! 경력 관리 전략
              </h2>
              <p>
                퇴사 후 공백기는 경력 단절이 아닌, 당신의 역량을 강화하고 새로운 기회를 모색하는 '성장의 시간'이 될 수 있습니다.
              </p>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 자기계발 및 역량 강화
                  </h3>
                  <p className="!text-sm !my-0">
                    온라인 강의, 자격증 취득, 스터디 참여 등을 통해 부족했던 역량을 보완하거나 새로운 기술을 습득하세요. 특히 희망 직무와 관련된 역량을 집중적으로 강화하는 것이 중요합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. 사이드 프로젝트 또는 봉사 활동
                  </h3>
                  <p className="!text-sm !my-0">
                    공백기 동안 개인 프로젝트를 진행하거나, 관련 분야의 봉사 활동에 참여하여 실무 경험을 유지하고 포트폴리오를 강화하세요. 이는 면접 시 당신의 열정과 적극성을 보여줄 수 있는 좋은 기회가 됩니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 적극적인 네트워킹
                  </h3>
                  <p className="!text-sm !my-0">
                    업계 세미나, 컨퍼런스, 온라인 커뮤니티 등을 통해 관련 분야 전문가들과 교류하고 정보를 얻으세요. 새로운 채용 기회를 발견하거나, 멘토를 만날 수도 있습니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <UserCheck className="w-6 h-6" /> 이력서/면접, 공백기 이렇게 설명하세요!
              </h2>
              <p className="!my-2 text-base">
                공백기를 단순히 '쉬었다'고 설명하기보다는, 그 기간 동안 무엇을 배우고 성장했는지 구체적으로 이야기하세요. 예를 들어, '공백기 동안 OOO 자격증을 취득하여 직무 전문성을 강화했습니다' 또는 'OOO 프로젝트를 진행하며 문제 해결 능력을 키웠습니다' 와 같이 긍정적이고 적극적인 태도를 보여주는 것이 중요합니다.
              </p>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <CalendarCheck className="w-7 h-7 text-indigo-500" />
                당신의 성공적인 재취업을 응원합니다!
              </h2>
              <p>
                퇴사 후 재취업은 당신의 커리어를 한 단계 성장시킬 수 있는 기회입니다. <br />
                Moneysalary의 커리어 가이드와 함께 당신의 꿈을 현실로 만드세요.
              </p>
              <Link
                href="/guides/job-change-success-strategy-200-percent-use-of-headhunters"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                헤드헌터 200% 활용법 가이드 보기 🚀
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
