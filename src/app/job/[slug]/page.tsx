import { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import { jobsData, getJobById } from "@/data/jobsData";
import { buildPageMetadata } from "@/lib/seo";
import { faqLd, autoBreadcrumbLd, itemListLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import { CalcResultAd, InArticleAd, HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { formatSalaryKorean } from "@/lib/companyContentBuilder";

export const dynamic = "force-static";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return jobsData.map((job) => ({ slug: job.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job = getJobById(params.slug);
  if (!job) return { title: "직업 정보를 찾을 수 없습니다" };

  // CTR 강화(7차): 평균 월급(실수령 추정) 숫자 hook을 description 앞쪽에 배치.
  const monthlyNetEstimate = Math.round((job.salary.overall * 10000) / 12 / 10000 * 0.83);
  return buildPageMetadata({
    title: `${job.name} 연봉 2026 — 평균 ${job.salary.overall.toLocaleString()}만원·월급 약 ${monthlyNetEstimate}만원`,
    description: `${job.name} 평균 연봉 ${job.salary.overall.toLocaleString()}만원, 월 실수령액 약 ${monthlyNetEstimate}만원. 신입 초봉 ${job.salary.entry.avg.toLocaleString()}만원, 3~5년 ${job.salary.junior.avg.toLocaleString()}만원, 10년+ 시니어 ${job.salary.senior.avg.toLocaleString()}만원. 2026 최신 세법 기준 즉시 계산.`,
    path: `/job/${params.slug}`,
    keywords: [
      ...job.keywords,
      `${job.name} 연봉`,
      `${job.name} 월급`,
      `${job.name} 초봉`,
      `${job.name} 신입 연봉`,
      `${job.name} 실수령액`,
    ],
  });
}

// 관련 계산기 버튼 라벨 — 영문 슬러그 → 한글 계산기명 (simpleCalculators 의 title 과 일치)
const CALC_SLUG_LABELS: Record<string, string> = {
  "severance-pay-quick": "퇴직금 간편 계산",
  "overtime-pay-quick": "시간외 수당 계산",
  "night-shift-pay-quick": "야간 근로 수당 계산",
  "earned-income-tax-quick": "근로소득세 간편 계산",
  "income-tax-bracket-sim": "소득세 누진세율 시뮬레이터",
  "corporate-tax-quick": "법인세 간편 계산",
  "annual-leave-pay-quick": "연차수당 계산",
  "stock-capital-gains-quick": "주식 양도세 간편 계산",
  "dividend-tax-quick": "배당소득세 계산",
  "dividend-yield-quick": "배당 수익률 계산",
  "vat-quick": "부가가치세(VAT) 계산",
  "loan-monthly-payment": "대출 월 상환액 계산",
  "loan-total-interest": "대출 총 이자 계산",
  "registration-tax-quick": "등록면허세 계산",
  "real-estate-capital-gains-quick": "부동산 양도세 간편 계산",
  "real-estate-flip-cost": "단기 매매 부대비용",
  "acquisition-tax-quick": "취득세 계산",
};

// 매핑에 없는 슬러그는 기존 변환(영문 노출) fallback
function calcSlugLabel(slug: string): string {
  return CALC_SLUG_LABELS[slug] ?? slug.replace(/-quick$/, "").replace(/-/g, " ");
}

function SalaryBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-1">
      <div
        className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function JobPage({ params }: Props) {
  const job = getJobById(params.slug);
  // GSC 404 출혈 차단(7차): 옛 직업 슬러그 → /job 메인 308
  if (!job) permanentRedirect("/job");

  const maxSalary = job.salary.senior.max;

  const breadcrumb = autoBreadcrumbLd(`/job/${job.id}`, {
    overrides: { job: "직업별 연봉" },
    leafName: job.name,
  });

  const faqSchema = faqLd(
    job.faqs.map((f) => ({ question: f.q, answer: f.a }))
  );

  // related jobs in same category
  const relatedJobs = jobsData
    .filter((j) => j.category === job.category && j.id !== job.id)
    .slice(0, 6);

  // ItemList 스키마 — 같은 카테고리 직무 목록으로 SERP 캐러셀 리치결과 노출 기회 확보.
  const rankSchema =
    relatedJobs.length >= 3
      ? itemListLd({
          name: `${job.category} 직무별 연봉`,
          items: relatedJobs.map((j) => ({
            name: `${j.name} 연봉`,
            url: `/job/${j.id}`,
          })),
        })
      : null;

  // 이 직무를 채용하는 등록 기업 (해석 가능한 id만)
  const relatedCompanies = job.relatedCompanyIds.flatMap((id) => {
    const c = companyRepository.getById(id);
    return c ? [c] : [];
  });

  return (
    <>
      <JsonLd data={[breadcrumb, faqSchema, ...(rankSchema ? [rankSchema] : [])]} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <HomeTopAd />

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* 브레드크럼 */}
          <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1">
            <Link href="/" className="hover:text-blue-600">홈</Link>
            <span>/</span>
            <Link href="/job" className="hover:text-blue-600">직업별 연봉</Link>
            <span>/</span>
            <span className="text-gray-800 dark:text-gray-200">{job.name}</span>
          </nav>

          {/* 헤더 카드 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 mb-2">
                  {job.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {job.name} 연봉 2026
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm leading-relaxed max-w-xl">
                  {job.description}
                </p>
              </div>
              <div className="sm:text-right flex-shrink-0">
                <div className="text-sm text-gray-500 dark:text-gray-400">전체 평균</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {job.salary.overall.toLocaleString()}만원
                </div>
                <Link
                  href={`/salary/${job.salary.overall * 10000}`}
                  className="mt-2 inline-block text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  실수령액 계산 →
                </Link>
              </div>
            </div>
          </div>

          {/* 경력별 연봉 테이블 */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              경력별 평균 연봉
            </h2>
            <div className="space-y-5">
              {[
                { label: "신입 (0~2년)", data: job.salary.entry, href: `/salary/${job.salary.entry.avg * 10000}` },
                { label: "주니어 (3~5년)", data: job.salary.junior, href: `/salary/${job.salary.junior.avg * 10000}` },
                { label: "시니어 (10년+)", data: job.salary.senior, href: `/salary/${job.salary.senior.avg * 10000}` },
              ].map(({ label, data, href }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-400">{data.min.toLocaleString()}~{data.max.toLocaleString()}만원</span>
                      <Link
                        href={href}
                        className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        평균 {data.avg.toLocaleString()}만원
                      </Link>
                    </div>
                  </div>
                  <SalaryBar value={data.avg} max={maxSalary} />
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
              * 2026년 기준 국내 평균 데이터. 기업 규모·지역·성과급에 따라 차이가 있습니다.
            </p>
          </section>

          <CalcResultAd />

          {/* 실수령액 바로 계산 */}
          <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white">
            <h2 className="text-lg font-bold mb-2">세후 실수령액 바로 계산</h2>
            <p className="text-blue-100 text-sm mb-4">
              {job.name} 평균 연봉 {job.salary.overall.toLocaleString()}만원 기준 월 실수령액은 얼마일까요?
              4대보험·소득세 공제 후 정확한 금액을 확인하세요.
            </p>
            <div className="flex flex-wrap gap-2">
              {[job.salary.entry.avg, job.salary.junior.avg, job.salary.senior.avg].map((amt) => (
                <Link
                  key={amt}
                  href={`/salary/${amt * 10000}`}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                >
                  연봉 {amt.toLocaleString()}만원 →
                </Link>
              ))}
            </div>
          </section>

          {/* 자격 요건 */}
          {job.requirements.length > 0 && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                주요 자격 요건
              </h2>
              <ul className="space-y-2">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="mt-0.5 text-blue-500 flex-shrink-0">✓</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <InArticleAd />

          {/* FAQ */}
          {job.faqs.length > 0 && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                자주 묻는 질문
              </h2>
              <div className="space-y-5">
                {job.faqs.map((faq, i) => (
                  <div key={i} className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-4 last:pb-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-sm sm:text-base">
                      Q. {faq.q}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 관련 계산기 */}
          {job.relatedCalcSlugs.length > 0 && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                관련 계산기
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.relatedCalcSlugs.map((slug) => (
                  <Link
                    key={slug}
                    href={`/calc/${slug}`}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    {calcSlugLabel(slug)}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 이 직무 채용 기업 연봉 */}
          {relatedCompanies.length > 0 && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                {job.name} 채용 기업 연봉
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {relatedCompanies.map((c) => (
                  <Link
                    key={c.id}
                    href={`/salary-db/${c.id}`}
                    className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors group"
                  >
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 flex items-center gap-2">
                      <span>{c.logo}</span>
                      <span>{c.name.ko}</span>
                    </span>
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                      신입 {formatSalaryKorean(c.salary.entry.base + (c.salary.entry.incentive.avgAmount || 0))}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 같은 카테고리 직업 */}
          {relatedJobs.length > 0 && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                {job.category} 다른 직업 연봉
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {relatedJobs.map((j) => (
                  <Link
                    key={j.id}
                    href={`/job/${j.id}`}
                    className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors group"
                  >
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                      {j.name}
                    </span>
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                      평균 {j.salary.overall.toLocaleString()}만원
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mt-3 text-center">
                <Link
                  href="/job"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  전체 직업 연봉 보기 →
                </Link>
              </div>
            </section>
          )}

          <CoupangBanner />
        </div>
      </div>
    </>
  );
}
