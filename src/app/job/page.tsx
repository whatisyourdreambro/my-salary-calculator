import { Metadata } from "next";
import Link from "next/link";
import { jobsData, jobsByCategory, JobCategory } from "@/data/jobsData";
import { buildPageMetadata } from "@/lib/seo";
import { HomeTopAd, InArticleAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd } from "@/lib/structuredData";

export const dynamic = "force-static";

export const metadata: Metadata = buildPageMetadata({
  title: "직업별 연봉 완전 가이드 2026 — 100개 직종 평균 연봉·실수령액",
  description:
    "간호사·의사·공무원·교사·개발자·변호사 등 100개 이상 직업의 2026년 평균 연봉과 신입~경력별 실수령액을 한눈에 확인하세요. 직종별 연봉 비교 및 계산기 제공.",
  path: "/job",
  keywords: [
    "직업별 연봉",
    "직종별 연봉",
    "직업 연봉 비교",
    "간호사 연봉",
    "공무원 연봉",
    "개발자 연봉",
    "의사 연봉",
    "교사 연봉",
    "변호사 연봉",
    "2026 직업 연봉",
  ],
});

const CATEGORY_ORDER: JobCategory[] = [
  "IT/개발",
  "의료",
  "공무원/공공",
  "금융",
  "법률",
  "교육",
  "공학/제조",
  "경영/서비스",
  "미디어/창작",
  "바이오/연구",
];

const CATEGORY_EMOJI: Record<JobCategory, string> = {
  "IT/개발": "💻",
  "의료": "🏥",
  "공무원/공공": "🏛️",
  "금융": "💰",
  "법률": "⚖️",
  "교육": "📚",
  "공학/제조": "⚙️",
  "경영/서비스": "🏢",
  "미디어/창작": "🎬",
  "바이오/연구": "🔬",
};

export default function JobIndexPage() {
  const breadcrumb = autoBreadcrumbLd("/job", {
    overrides: { job: "직업별 연봉" },
  });

  return (
    <>
      <JsonLd data={[breadcrumb]} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <HomeTopAd />
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* 헤더 */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              직업별 연봉 완전 가이드 2026
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              100개 이상 직종의 신입~경력별 평균 연봉과 실수령액을 한눈에 비교하세요.
              2026년 최신 세법 기준 계산기 연동.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
              {CATEGORY_ORDER.map((cat) => (
                <a
                  key={cat}
                  href={`#${cat}`}
                  className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 transition-colors"
                >
                  {CATEGORY_EMOJI[cat]} {cat}
                </a>
              ))}
            </div>
          </div>

          {/* 카테고리별 직업 목록 */}
          {CATEGORY_ORDER.filter((cat) => jobsByCategory[cat]?.length > 0).map((category) => (
            <section key={category} id={category} className="mb-10 scroll-mt-20">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span>{CATEGORY_EMOJI[category]}</span>
                <span>{category}</span>
                <span className="text-sm font-normal text-gray-500">
                  ({jobsByCategory[category].length}개 직업)
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {jobsByCategory[category].map((job) => (
                  <Link
                    key={job.id}
                    href={`/job/${job.id}`}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {job.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                          {job.description.slice(0, 40)}…
                        </p>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          평균 {job.salary.overall.toLocaleString()}만원
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          신입 {job.salary.entry.avg.toLocaleString()}만원~
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          <InArticleAd />
          <CoupangBanner />

          {/* 총 요약 */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              총 <strong className="text-blue-600 dark:text-blue-400">{jobsData.length}개 직업</strong>의
              연봉 데이터를 제공하고 있습니다. 각 직업 페이지에서 신입~경력별 상세 연봉과
              실수령액을 계산해보세요.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
