import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { industriesData, getIndustryById } from "@/data/industriesData";
import { jobsData } from "@/data/jobsData";
import { buildPageMetadata } from "@/lib/seo";
import { faqLd, autoBreadcrumbLd, itemListLd } from "@/lib/structuredData";
import { getIndustryAggregate } from "@/lib/salary-data/industryAggregates";
import { formatSalaryKorean } from "@/lib/companyContentBuilder";
import JsonLd from "@/components/JsonLd";
import { CalcResultAd, InArticleAd, HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";

export const dynamic = "force-static";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return industriesData.map((ind) => ({ slug: ind.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const industry = getIndustryById(params.slug);
  if (!industry) return { title: "산업 정보를 찾을 수 없습니다" };

  const aggregate = getIndustryAggregate(industry);
  const companyNote = aggregate
    ? ` DB 등록 ${aggregate.count}개사 회사별 연봉 순위 제공.`
    : "";

  return buildPageMetadata({
    title: `${industry.name} 업계 연봉 2026 — 회사별 순위·신입~경력 평균 연봉`,
    description: `${industry.name} 업계 평균 연봉 ${industry.salary.overall.toLocaleString()}만원. 신입 ${industry.salary.entry.avg.toLocaleString()}만원~, 시니어 ${industry.salary.senior.avg.toLocaleString()}만원~ 수준.${companyNote} 2026년 최신 기준 실수령액 계산기 제공.`,
    path: `/industry/${params.slug}`,
    keywords: industry.keywords,
  });
}

const TREND_INFO = {
  rising: { label: "↑ 상승세", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  stable: { label: "→ 보합", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  declining: { label: "↓ 하락세", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
};

export default function IndustryPage({ params }: Props) {
  const industry = getIndustryById(params.slug);
  if (!industry) notFound();

  const aggregate = getIndustryAggregate(industry);

  const breadcrumb = autoBreadcrumbLd(`/industry/${industry.id}`, {
    overrides: { industry: "산업별 연봉" },
    leafName: industry.name,
  });

  const faqSchema = faqLd(industry.faqs.map((f) => ({ question: f.q, answer: f.a })));

  const rankSchema =
    aggregate && aggregate.count >= 3
      ? itemListLd({
          name: `${industry.name} 회사별 연봉 순위`,
          items: aggregate.rows.slice(0, 30).map((row) => ({
            name: row.company.name.ko,
            url: `/salary-db/${row.company.id}`,
          })),
        })
      : null;

  const relatedJobs = jobsData.filter((j) => industry.topJobIds.includes(j.id));

  const relatedIndustries = industriesData
    .filter((i) => i.id !== industry.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  const trendStyle = TREND_INFO[industry.trend];

  return (
    <>
      <JsonLd data={rankSchema ? [breadcrumb, faqSchema, rankSchema] : [breadcrumb, faqSchema]} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <HomeTopAd />

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* 브레드크럼 */}
          <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1">
            <Link href="/" className="hover:text-blue-600">홈</Link>
            <span>/</span>
            <Link href="/industry" className="hover:text-blue-600">산업별 연봉</Link>
            <span>/</span>
            <span className="text-gray-800 dark:text-gray-200">{industry.name}</span>
          </nav>

          {/* 헤더 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">{industry.emoji}</span>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${trendStyle.color}`}>
                    {trendStyle.label}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {industry.name} 업계 연봉 2026
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm leading-relaxed max-w-xl">
                  {industry.description}
                </p>
                <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  {industry.trendNote}
                </p>
              </div>
              <div className="sm:text-right flex-shrink-0">
                <div className="text-sm text-gray-500 dark:text-gray-400">업계 추정 평균</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {industry.salary.overall.toLocaleString()}만원
                </div>
                <Link
                  href={`/salary/${industry.salary.overall * 10000}`}
                  className="mt-2 inline-block text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  실수령액 계산 →
                </Link>
              </div>
            </div>
          </div>

          {/* 경력별 연봉 */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">경력별 평균 연봉</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "신입 (0~2년)", data: industry.salary.entry },
                { label: "주니어 (3~5년)", data: industry.salary.junior },
                { label: "시니어 (10년+)", data: industry.salary.senior },
              ].map(({ label, data }) => (
                <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</div>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {data.avg.toLocaleString()}만원
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {data.min.toLocaleString()}~{data.max.toLocaleString()}만원
                  </div>
                  <Link
                    href={`/salary/${data.avg * 10000}`}
                    className="mt-2 inline-block text-xs text-blue-500 hover:text-blue-700 underline"
                  >
                    실수령액 →
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* 회사별 연봉 순위 — 실제 등록 회사 데이터 집계 */}
          {aggregate && aggregate.count >= 3 && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {industry.name} 회사별 연봉 순위
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                머니샐러리 DB에 등록된 <strong>{industry.name}</strong> 업계{" "}
                <strong className="text-gray-800 dark:text-gray-200">{aggregate.count}개사</strong>의 신입 영끌 연봉
                평균은 <strong className="text-blue-600 dark:text-blue-400">{formatSalaryKorean(aggregate.avgEntry)}</strong>,
                중앙값은 {formatSalaryKorean(aggregate.medianEntry)}, 시니어 평균은{" "}
                {formatSalaryKorean(aggregate.avgSenior)} 수준입니다. 평균 주당 근무시간은 약{" "}
                {aggregate.avgWeeklyHours}시간입니다.
              </p>
              <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700">
                {aggregate.rows.map((row) => (
                  <Link
                    key={row.company.id}
                    href={`/salary-db/${row.company.id}`}
                    className="flex items-center gap-3 px-3 sm:px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <span className="w-6 text-center text-sm font-bold text-gray-400 flex-shrink-0">
                      {row.rank}
                    </span>
                    <span className="text-xl flex-shrink-0">{row.company.logo}</span>
                    <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {row.company.name.ko}
                    </span>
                    <span className="text-right flex-shrink-0">
                      <span className="block text-sm font-bold text-blue-600 dark:text-blue-400">
                        신입 {formatSalaryKorean(row.entryTotal)}
                      </span>
                      <span className="block text-[11px] text-gray-400">
                        시니어 {formatSalaryKorean(row.seniorTotal)}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400 leading-relaxed">
                ※ 신입 영끌 연봉 = 기본급 + 평균 인센티브. 공개 자료 기반 추정치이며 부서·성과·연도에 따라
                실제 금액과 다를 수 있습니다. 2026년 기준.
              </p>
            </section>
          )}

          <CalcResultAd />

          {/* 주요 직업 */}
          {relatedJobs.length > 0 && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                이 업계 주요 직업 연봉
              </h2>
              <div className="space-y-2">
                {relatedJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/job/${job.id}`}
                    className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors group"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                        {job.name}
                      </span>
                      <span className="ml-2 text-xs text-gray-400">{job.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        평균 {job.salary.overall.toLocaleString()}만원
                      </span>
                      <div className="text-xs text-gray-400">
                        신입 {job.salary.entry.avg.toLocaleString()}만원~
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <InArticleAd />

          {/* FAQ */}
          {industry.faqs.length > 0 && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">자주 묻는 질문</h2>
              <div className="space-y-5">
                {industry.faqs.map((faq, i) => (
                  <div key={i} className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-4 last:pb-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-sm sm:text-base">
                      Q. {faq.q}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 다른 업계 */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">다른 업계 연봉 비교</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {relatedIndustries.map((ind) => (
                <Link
                  key={ind.id}
                  href={`/industry/${ind.id}`}
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors group"
                >
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 flex items-center gap-1.5">
                    <span>{ind.emoji}</span>
                    <span>{ind.name}</span>
                  </span>
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                    {ind.salary.overall.toLocaleString()}만원
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-3 text-center">
              <Link href="/industry" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                전체 산업별 연봉 보기 →
              </Link>
            </div>
          </section>

          <CoupangBanner />
        </div>
      </div>
    </>
  );
}
