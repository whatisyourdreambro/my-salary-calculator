import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CompanyProfile, JobLevel } from "@/types/company";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import {
  getComparePairs,
  getComparePairBySlug,
} from "@/lib/salary-data/companyComparePairs";
import { formatSalaryKorean, industryLabelKo } from "@/lib/companyContentBuilder";
import { buildPageMetadata } from "@/lib/seo";
import { autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import { CalcResultAd, HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import Breadcrumbs from "@/components/Breadcrumbs";

export const dynamic = "force-static";
// 화이트리스트 외 슬러그는 생성하지 않는다 (도어웨이 페이지 방지).
export const dynamicParams = false;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getComparePairs().map((p) => ({ slug: p.slug }));
}

const LEVELS: { key: JobLevel; label: string }[] = [
  { key: "entry", label: "신입" },
  { key: "junior", label: "주니어 (3~5년)" },
  { key: "senior", label: "시니어 (10년+)" },
  { key: "lead", label: "리드·팀장" },
  { key: "executive", label: "임원" },
];

function levelTotal(c: CompanyProfile, key: JobLevel): number {
  return c.salary[key].base + (c.salary[key].incentive.avgAmount || 0);
}

function pct(hi: number, lo: number): number {
  if (lo <= 0) return 0;
  return Math.round(((hi - lo) / lo) * 100);
}

/** 두 금액 비교 문구: "{회사}가 약 N% 높음" 또는 "비슷한 수준". */
function compareText(aName: string, aVal: number, bName: string, bVal: number): string {
  const diff = pct(Math.max(aVal, bVal), Math.min(aVal, bVal));
  if (diff < 3) return "두 회사가 비슷한 수준";
  const higher = aVal >= bVal ? aName : bName;
  return `${higher}가 약 ${diff}% 높음`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pair = getComparePairBySlug(params.slug);
  if (!pair) return { title: "회사 비교를 찾을 수 없습니다" };
  const a = companyRepository.getById(pair.aId);
  const b = companyRepository.getById(pair.bId);
  if (!a || !b) return { title: "회사 비교를 찾을 수 없습니다" };

  const aEntry = Math.round(levelTotal(a, "entry") / 10000).toLocaleString("ko-KR");
  const bEntry = Math.round(levelTotal(b, "entry") / 10000).toLocaleString("ko-KR");

  return buildPageMetadata({
    title: `${a.name.ko} vs ${b.name.ko} 연봉 비교 2026 — 초봉·직급별 어디가 높을까`,
    description: `${a.name.ko} 신입 영끌 약 ${aEntry}만원, ${b.name.ko} 약 ${bEntry}만원. ${a.name.ko}와 ${b.name.ko}의 신입·주니어·시니어 직급별 평균 연봉, 워라밸, 복지를 2026년 기준으로 나란히 비교했습니다.`,
    path: `/salary-db/compare/${params.slug}`,
    keywords: [
      `${a.name.ko} ${b.name.ko}`,
      `${a.name.ko} vs ${b.name.ko}`,
      `${a.name.ko} ${b.name.ko} 연봉 비교`,
      `${b.name.ko} ${a.name.ko} 연봉`,
      `${a.name.ko} ${b.name.ko} 비교`,
    ],
  });
}

export default function ComparePage({ params }: Props) {
  const pair = getComparePairBySlug(params.slug);
  if (!pair) notFound();
  const a = companyRepository.getById(pair.aId);
  const b = companyRepository.getById(pair.bId);
  if (!a || !b) notFound();

  const aEntry = levelTotal(a, "entry");
  const bEntry = levelTotal(b, "entry");
  const aSenior = levelTotal(a, "senior");
  const bSenior = levelTotal(b, "senior");
  const entryWinner = aEntry >= bEntry ? a : b;
  const seniorWinner = aSenior >= bSenior ? a : b;
  const aIndustry = industryLabelKo(a.industry);

  const faqItems = [
    {
      question: `${a.name.ko}와 ${b.name.ko} 중 신입 연봉이 더 높은 곳은?`,
      answer: `신입 영끌 연봉(기본급+평균 인센티브) 기준 ${a.name.ko}는 약 ${formatSalaryKorean(
        aEntry
      )}, ${b.name.ko}는 약 ${formatSalaryKorean(bEntry)}입니다. ${compareText(
        a.name.ko,
        aEntry,
        b.name.ko,
        bEntry
      )}입니다.`,
    },
    {
      question: `${a.name.ko}와 ${b.name.ko} 시니어 연봉은 어디가 높나요?`,
      answer: `시니어(10년+) 영끌 연봉은 ${a.name.ko} 약 ${formatSalaryKorean(
        aSenior
      )}, ${b.name.ko} 약 ${formatSalaryKorean(bSenior)} 수준으로 ${compareText(
        a.name.ko,
        aSenior,
        b.name.ko,
        bSenior
      )}입니다.`,
    },
    {
      question: `${a.name.ko}와 ${b.name.ko} 워라밸 비교는?`,
      answer: `평균 주당 실근무시간은 ${a.name.ko} ${a.workLife.weeklyHours.real}시간, ${b.name.ko} ${b.workLife.weeklyHours.real}시간입니다. 연차는 각각 ${a.workLife.vacation.days}일·${b.workLife.vacation.days}일 부여되며, 근무시간이 짧을수록 워라밸이 양호한 편으로 해석할 수 있습니다.`,
    },
  ];

  const breadcrumb = autoBreadcrumbLd(`/salary-db/compare/${params.slug}`, {
    leafName: `${a.name.ko} vs ${b.name.ko} 연봉 비교`,
  });

  return (
    <>
      <JsonLd data={[breadcrumb, faqLd(faqItems)]} />
      <div className="page-width pt-24 pb-3">
        <Breadcrumbs
          path={`/salary-db/compare/${params.slug}`}
          leafName={`${a.name.ko} vs ${b.name.ko}`}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-navy dark:text-canvas-50 mb-3">
          {a.name.ko} vs {b.name.ko} 연봉 비교
        </h1>
        <p className="text-[15px] leading-7 text-muted-blue dark:text-canvas-300 mb-6">
          {aIndustry} 업종의 <strong>{a.name.ko}</strong>와 <strong>{b.name.ko}</strong>의 직급별
          평균 연봉을 나란히 비교합니다. 신입 영끌 연봉 기준{" "}
          <strong className="text-electric">{entryWinner.name.ko}</strong>가 더 높으며, 시니어
          기준으로는 <strong className="text-electric">{seniorWinner.name.ko}</strong>가 앞섭니다.
          아래 표와 분석에서 직급별 격차를 확인하세요.
        </p>

        <HomeTopAd />

        {/* 직급별 비교 표 */}
        <section className="my-6">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-3">
            직급별 영끌 연봉 비교
          </h2>
          <div className="overflow-hidden rounded-2xl border border-canvas-200 dark:border-canvas-700">
            <div className="grid grid-cols-3 bg-canvas-50 dark:bg-canvas-800 text-xs font-bold text-muted-blue dark:text-canvas-300">
              <div className="px-3 py-3">직급</div>
              <div className="px-3 py-3 text-center">{a.name.ko}</div>
              <div className="px-3 py-3 text-center">{b.name.ko}</div>
            </div>
            {LEVELS.map(({ key, label }) => {
              const av = levelTotal(a, key);
              const bv = levelTotal(b, key);
              return (
                <div
                  key={key}
                  className="grid grid-cols-3 border-t border-canvas-100 dark:border-canvas-700 text-sm"
                >
                  <div className="px-3 py-3 font-medium text-navy dark:text-canvas-100">
                    {label}
                  </div>
                  <div
                    className={`px-3 py-3 text-center font-bold ${
                      av >= bv ? "text-electric" : "text-muted-blue dark:text-canvas-300"
                    }`}
                  >
                    {formatSalaryKorean(av)}
                  </div>
                  <div
                    className={`px-3 py-3 text-center font-bold ${
                      bv >= av ? "text-electric" : "text-muted-blue dark:text-canvas-300"
                    }`}
                  >
                    {formatSalaryKorean(bv)}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-faint-blue">
            ※ 영끌 연봉 = 기본급 + 평균 인센티브. 공개 자료 기반 추정치이며 부서·성과에 따라 다를 수 있습니다.
          </p>
        </section>

        {/* 분석 */}
        <section className="my-8 prose prose-slate dark:prose-invert max-w-none text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50">상세 분석</h2>
          <p>
            <strong>신입 비교</strong> — {a.name.ko}의 신입 영끌 연봉은{" "}
            {formatSalaryKorean(aEntry)}, {b.name.ko}는 {formatSalaryKorean(bEntry)}로{" "}
            {compareText(a.name.ko, aEntry, b.name.ko, bEntry)}입니다. 첫 입사 시 받는 보상을
            중시한다면 이 격차를 참고하세요.
          </p>
          <p>
            <strong>시니어 비교</strong> — 경력 10년 이상 시니어급은 {a.name.ko}{" "}
            {formatSalaryKorean(aSenior)}, {b.name.ko} {formatSalaryKorean(bSenior)}로{" "}
            {compareText(a.name.ko, aSenior, b.name.ko, bSenior)}입니다. 장기 커리어 관점에서의
            연봉 상승 여력을 보여줍니다.
          </p>
          <p>
            <strong>워라밸·근무 환경</strong> — 평균 주당 실근무시간은 {a.name.ko}{" "}
            {a.workLife.weeklyHours.real}시간, {b.name.ko} {b.workLife.weeklyHours.real}시간이며,
            연차는 각각 {a.workLife.vacation.days}일·{b.workLife.vacation.days}일입니다. 기업 문화
            점수는 {a.name.ko} {a.culture.score}점, {b.name.ko} {b.culture.score}점(10점 만점)으로
            평가됩니다.
          </p>
        </section>

        <CalcResultAd />

        {/* 개별 회사 상세 링크 */}
        <section className="my-8">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-3">
            각 회사 상세 연봉 보기
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[a, b].map((c) => (
              <Link
                key={c.id}
                href={`/salary-db/${c.id}`}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
              >
                <span className="text-2xl">{c.logo}</span>
                <span>
                  <span className="block text-sm font-bold text-navy dark:text-canvas-50">
                    {c.name.ko} 연봉 상세
                  </span>
                  <span className="block text-xs text-faint-blue">
                    직급별 실수령액·복지·워라밸
                  </span>
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-sm">
            <Link href="/salary-db" className="text-electric font-bold hover:underline">
              ← 회사별 연봉 DB 전체 보기
            </Link>
          </p>
        </section>

        {/* FAQ */}
        <section className="my-8">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
            자주 묻는 질문
          </h2>
          <div className="space-y-4">
            {faqItems.map((faq, i) => (
              <div
                key={i}
                className="bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 rounded-2xl p-5"
              >
                <h3 className="font-bold text-navy dark:text-canvas-50 text-sm mb-2">
                  Q. {faq.question}
                </h3>
                <p className="text-sm leading-7 text-muted-blue dark:text-canvas-300">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        <CoupangBanner
          responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
        />
      </div>
    </>
  );
}
