// /insights/entry-salary-by-industry-2026 — 데이터 리포트 1호 (서버 컴포넌트).
//
// 목적: 기자·블로거가 인용할 수 있는 1차 가공 데이터 리포트.
// 인용 1건 = 백링크 1건 (docs/serp-strategy-2026.md 기둥 1).
// 모든 수치는 빌드 시 자체 DB에서 집계 — 하드코딩 금지(데이터 갱신 시 자동 동기화).
import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { ArrowRight, BarChart3 } from "lucide-react";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import {
  entryReportRows,
  entryReportCompanyCount,
  ENTRY_REPORT_MIN_COMPANIES,
} from "@/lib/salary-data/entrySalaryReport";
import { getIndustryMeta } from "@/lib/salary-data/industryTaxonomy";
import { industriesData } from "@/data/industriesData";
import { jobsData } from "@/data/jobsData";
import { getReportBySlug } from "@/data/reportsRegistry";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbLd,
  datasetLd,
  articleLd,
  faqLd,
} from "@/lib/structuredData";
import PublishedMeta from "@/components/PublishedMeta";
import CitationCopyButton from "@/components/CitationCopyButton";
import { HomeTopAd, InArticleAd, GuideMidAd } from "@/components/AdPlacement";
import ChartSection from "./ChartSection";

export const dynamic = "force-static";

const SLUG = "entry-salary-by-industry-2026";
const PATH = `/insights/${SLUG}`;
const MIN_COMPANIES = ENTRY_REPORT_MIN_COMPANIES;
const report = getReportBySlug(SLUG)!;

export const metadata: Metadata = buildPageMetadata({
  title: report.title,
  description: report.description,
  path: PATH,
  keywords: report.keywords,
  ogType: "article",
  publishedTime: report.publishedDate,
  modifiedTime: report.updatedDate,
});

// 만원 단위 표기
function manwon(krw: number): string {
  return `${Math.round(krw / 10000).toLocaleString("ko-KR")}만원`;
}
function manwonNum(krw: number): number {
  return Math.round(krw / 10000);
}

// ── 집계 (순위·회사 수는 entrySalaryReport 단일 소스 — 제목·본문 동기화) ──
function buildReportData() {
  const ranked = entryReportRows;
  const totalCompanies = entryReportCompanyCount;

  // /industry/[slug] 링크: 표준 업종 id → industriesData 프로필 역매핑
  const industryPageByTaxonomy = new Map<string, string>();
  for (const profile of industriesData) {
    for (const tid of profile.industryIds ?? []) {
      if (!industryPageByTaxonomy.has(tid)) {
        industryPageByTaxonomy.set(tid, profile.id);
      }
    }
  }

  // 교차 검증 1 — 공시 연봉(disclosed) 보유 기업: 상위 업종 순서로 최대 6개
  const disclosedRows: Array<{
    companyId: string;
    nameKo: string;
    industryKo: string;
    avgSalaryManwon: number;
    fiscalYear: string;
    source: string;
    sourceUrl?: string;
  }> = [];
  for (const { id, agg } of ranked) {
    if (disclosedRows.length >= 6) break;
    const withDisclosed = agg.rows.find((r) => r.company.disclosed);
    if (!withDisclosed) continue;
    const c = withDisclosed.company;
    disclosedRows.push({
      companyId: c.id,
      nameKo: c.name.ko,
      industryKo: getIndustryMeta(id).ko,
      avgSalaryManwon: c.disclosed!.avgSalaryManwon,
      fiscalYear: c.disclosed!.fiscalYear,
      source: c.disclosed!.source,
      sourceUrl: c.disclosed!.sourceUrl,
    });
  }

  // 교차 검증 2 — 정부 통계(officialStats) 보유 직업 중 금융·개발 관련 3종
  const statJobs = ["fund-manager", "banker", "investment-banker", "software-developer"]
    .map((id) => jobsData.find((j) => j.id === id))
    .filter((j) => j && j.officialStats)
    .slice(0, 3) as Array<(typeof jobsData)[number]>;

  return { ranked, totalCompanies, industryPageByTaxonomy, disclosedRows, statJobs };
}

const data = buildReportData();
const top = data.ranked[0];
const bottom = data.ranked[data.ranked.length - 1];
const allEntryMedianKrw = (() => {
  // 전체 중앙값: 업종 중앙값들의 중앙값이 아닌, 집계 대상 회사 전체 기준
  const entries = data.ranked
    .flatMap((x) => x.agg.rows.map((r) => r.entryTotal))
    .sort((a, b) => a - b);
  const mid = Math.floor(entries.length / 2);
  return entries.length % 2 === 1
    ? entries[mid]
    : Math.round((entries[mid - 1] + entries[mid]) / 2);
})();

const heroQuote = `머니샐러리가 국내 ${data.totalCompanies}개사 연봉 데이터를 분석한 결과, 신입 초봉이 가장 높은 업종은 ${getIndustryMeta(top.id).ko}(평균 ${manwon(top.agg.avgEntry)})으로 나타났다.`;
const gapQuote = `${getIndustryMeta(top.id).ko} 업종과 ${getIndustryMeta(bottom.id).ko} 업종의 신입 초봉 격차는 평균 ${(manwonNum(top.agg.avgEntry) - manwonNum(bottom.agg.avgEntry)).toLocaleString("ko-KR")}만원에 달했다.`;

const faqs = [
  {
    question: "이 리포트의 '신입 초봉'은 무엇을 기준으로 하나요?",
    answer:
      "계약 기본급에 평균적으로 지급되는 성과급(인센티브)을 더한 이른바 '영끌 초봉' 기준입니다. 스톡옵션·RSU·사이닝 보너스 등 일회성 보상은 포함하지 않습니다.",
  },
  {
    question: "데이터 출처는 어디인가요?",
    answer:
      "머니샐러리가 채용공고·사업보고서·종사자 후기 등 공개 자료를 바탕으로 구축한 자체 연봉 DB입니다. 개별 회사 수치에는 추정치가 포함되며, 금융감독원 공시 평균연봉과 정부 공식 임금통계는 본문에 출처 링크와 함께 별도 병기했습니다.",
  },
  {
    question: "왜 제가 아는 회사 초봉과 다른가요?",
    answer:
      "업종 평균은 같은 업종 안의 여러 회사를 집계한 값이라 개별 회사·직군·협상 결과에 따른 편차를 반영하지 못합니다. 회사별 상세 수치는 회사 연봉 DB에서 확인하세요.",
  },
  {
    question: "이 리포트를 기사나 블로그에 인용해도 되나요?",
    answer:
      "네. '머니샐러리' 출처 표기(온라인은 링크 포함 권장)만 해주시면 자유롭게 인용하실 수 있습니다. 본문의 '인용문 복사' 버튼을 누르면 출처가 포함된 문장이 복사됩니다.",
  },
  {
    question: "데이터는 얼마나 자주 갱신되나요?",
    answer:
      "회사 연봉 DB는 수시로, 리포트 집계는 분기마다 갱신합니다. 페이지 상단의 최종 갱신일을 확인하세요.",
  },
];

export default function EntrySalaryByIndustryReport() {
  const chartData = data.ranked.slice(0, 15).map((x) => ({
    name: getIndustryMeta(x.id).ko,
    avgManwon: manwonNum(x.agg.avgEntry),
  }));

  return (
    <main className="w-full bg-canvas min-h-screen pb-20">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "데이터 리포트", path: "/insights" },
            { name: "2026 업종별 신입 초봉 순위", path: PATH },
          ]),
          datasetLd({
            name: report.title,
            description: report.description,
            url: PATH,
            datePublished: report.publishedDate,
            dateModified: report.updatedDate,
            keywords: report.keywords,
          }),
          articleLd({
            title: report.title,
            description: report.description,
            slug: SLUG,
            publishedDate: report.publishedDate,
            modifiedDate: report.updatedDate,
            url: PATH,
          }),
          faqLd(faqs),
        ]}
      />

      {/* Hero */}
      <section className="relative pt-28 pb-10 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-primary/10 -z-10" />
        <div className="max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-electric/20 text-electric font-bold text-sm mb-6">
            <BarChart3 className="w-4 h-4" />
            <span>머니샐러리 데이터 리포트 No.1</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4 leading-[1.18]">
            2026 업종별 신입 초봉 순위
            <span className="block text-xl sm:text-2xl mt-2 text-electric">
              {data.totalCompanies}개사 데이터 분석
            </span>
          </h1>
          <PublishedMeta
            publishedDate={report.publishedDate}
            updatedDate={report.updatedDate}
            className="mb-6"
          />
          {/* 핵심 스탯 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="rounded-2xl border border-canvas-200 bg-white p-4">
              <p className="text-xs font-bold text-faint-blue mb-1">초봉 1위 업종</p>
              <p className="text-lg font-black text-navy">
                {getIndustryMeta(top.id).ko}
              </p>
              <p className="text-sm font-bold text-electric">
                평균 {manwon(top.agg.avgEntry)}
              </p>
            </div>
            <div className="rounded-2xl border border-canvas-200 bg-white p-4">
              <p className="text-xs font-bold text-faint-blue mb-1">
                전체 신입 초봉 중앙값
              </p>
              <p className="text-lg font-black text-navy">
                {manwon(allEntryMedianKrw)}
              </p>
              <p className="text-sm text-faint-blue">국내 {data.totalCompanies}개사 기준</p>
            </div>
            <div className="rounded-2xl border border-canvas-200 bg-white p-4">
              <p className="text-xs font-bold text-faint-blue mb-1">집계 범위</p>
              <p className="text-lg font-black text-navy">
                {data.ranked.length}개 업종
              </p>
              <p className="text-sm text-faint-blue">
                업종별 {MIN_COMPANIES}개사 이상만 순위화
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="page-width max-w-3xl">
        {/* 핵심 요약 — 기자용 한 줄 팩트 */}
        <section className="mb-8">
          <h2 className="text-xl font-black text-navy mb-4">핵심 요약</h2>
          <ul className="space-y-2 text-[15px] leading-[1.8] text-muted-blue font-medium list-disc pl-5">
            <li>
              신입 초봉 1위 업종은{" "}
              <strong className="text-navy">{getIndustryMeta(top.id).ko}</strong>{" "}
              — 소속 {top.agg.count}개사 평균{" "}
              <strong className="text-electric">{manwon(top.agg.avgEntry)}</strong>
            </li>
            <li>
              2위 {getIndustryMeta(data.ranked[1].id).ko}(
              {manwon(data.ranked[1].agg.avgEntry)}) · 3위{" "}
              {getIndustryMeta(data.ranked[2].id).ko}(
              {manwon(data.ranked[2].agg.avgEntry)})
            </li>
            <li>
              최상위 업종과 최하위 업종({getIndustryMeta(bottom.id).ko},{" "}
              {manwon(bottom.agg.avgEntry)})의 평균 초봉 격차는{" "}
              <strong className="text-navy">
                {(
                  manwonNum(top.agg.avgEntry) - manwonNum(bottom.agg.avgEntry)
                ).toLocaleString("ko-KR")}
                만원
              </strong>
            </li>
          </ul>
          <CitationCopyButton
            quote={heroQuote}
            path={PATH}
            quoteId="hero-top-industry"
            className="mt-6"
          />
        </section>

        <div className="mb-8">
          <HomeTopAd />
        </div>

        {/* 방법론 — 투명 혼합형 프레이밍 (필수, 인용 역풍 방지) */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-navy mb-4">집계 방법</h2>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-900 mb-4">
            <strong className="font-bold">⚠️ 안내</strong> · 본 리포트의 업종 평균은
            머니샐러리 자체 연봉 DB를 집계한 값으로, 개별 회사 수치에는 공개
            자료(채용공고·사업보고서·종사자 후기) 기반 <strong>추정치가 포함</strong>
            됩니다. 각 기업의 공식 발표 자료가 아니며, 검증 가능한 공시·정부 통계는
            아래 별도 섹션에 출처와 함께 병기했습니다.
          </div>
          <ul className="space-y-1.5 text-[14px] leading-[1.8] text-muted-blue font-medium list-disc pl-5">
            <li>
              집계 대상: 머니샐러리 회사 연봉 DB{" "}
              {companyRepository.getAll().length}개사 중 순위 업종에 속한 국내
              기업 <strong className="text-navy">{data.totalCompanies}개사</strong>
              (외국계·표준 업종 분류 불가 기업·표본 부족 업종 소속 기업 제외)
            </li>
            <li>
              신입 초봉 = 계약 기본급 + 평균 인센티브 (일회성 보상 제외)
            </li>
            <li>
              업종 분류: 머니샐러리 표준 업종 체계 · 소속 회사{" "}
              {MIN_COMPANIES}개 미만 업종은 표본 부족으로 순위 제외
            </li>
            <li>기준일: {report.updatedDate}</li>
          </ul>
        </section>

        {/* 순위표 */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-navy mb-4">
            업종별 신입 초봉 순위 ({data.ranked.length}개 업종)
          </h2>
          <div className="overflow-hidden rounded-3xl border border-canvas-200 bg-white shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-canvas-200 bg-canvas/60 text-xs font-bold text-faint-blue uppercase tracking-wide">
                  <th className="py-3.5 px-3 w-12 text-center">순위</th>
                  <th className="py-3.5 px-2">업종</th>
                  <th className="py-3.5 px-2 text-right">평균</th>
                  <th className="py-3.5 px-2 text-right hidden sm:table-cell">
                    중앙값
                  </th>
                  <th className="py-3.5 px-3 hidden md:table-cell">초봉 1위 기업</th>
                </tr>
              </thead>
              <tbody>
                {data.ranked.map((x, i) => {
                  const meta = getIndustryMeta(x.id);
                  const pageId = data.industryPageByTaxonomy.get(x.id);
                  return (
                    <tr
                      key={x.id}
                      className="border-b border-canvas-100 last:border-0 hover:bg-canvas/50 transition-colors"
                    >
                      <td className="py-3 px-3 text-center font-black text-navy tabular-nums">
                        {i < 3 ? (
                          <span className="text-lg">{["🥇", "🥈", "🥉"][i]}</span>
                        ) : (
                          i + 1
                        )}
                      </td>
                      <td className="py-3 px-2 font-bold text-navy">
                        {pageId ? (
                          <Link
                            href={`/industry/${pageId}`}
                            className="hover:text-electric transition-colors"
                          >
                            {meta.ko}
                          </Link>
                        ) : (
                          meta.ko
                        )}
                        <span className="block text-[11px] font-medium text-faint-blue">
                          {x.agg.count}개사
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-black text-electric tabular-nums">
                        {manwon(x.agg.avgEntry)}
                      </td>
                      <td className="py-3 px-2 text-right text-muted-blue font-medium tabular-nums hidden sm:table-cell">
                        {manwon(x.agg.medianEntry)}
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell">
                        {x.agg.topPayer && (
                          <Link
                            href={`/salary-db/${x.agg.topPayer.id}`}
                            className="text-[13px] font-bold text-navy hover:text-electric transition-colors"
                          >
                            {x.agg.topPayer.name.ko}
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 차트 — TOP 15 */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-navy mb-4">
            상위 15개 업종 평균 초봉
          </h2>
          <div className="rounded-3xl border border-canvas-200 bg-white p-4 sm:p-6">
            <ChartSection data={chartData} />
          </div>
        </section>

        <div className="mb-10">
          <InArticleAd />
        </div>

        {/* 교차 검증 — 공시·정부통계 (투명 혼합형의 "검증 가능한 1차 출처" 신호) */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-navy mb-2">
            공시·정부 통계로 교차 확인
          </h2>
          <p className="text-[14px] leading-[1.8] text-muted-blue font-medium mb-4">
            위 순위는 자체 DB 집계지만, 아래 수치는 금융감독원 공시(사업보고서)와
            정부 공식 임금통계에서 그대로 가져온 검증 가능한 값입니다. 공시
            평균연봉은 전 직급 평균이라 신입 초봉보다 높습니다.
          </p>
          {data.disclosedRows.length > 0 && (
            <div className="overflow-hidden rounded-3xl border border-canvas-200 bg-white shadow-sm mb-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-canvas-200 bg-canvas/60 text-xs font-bold text-faint-blue uppercase tracking-wide">
                    <th className="py-3 px-3">회사 (업종)</th>
                    <th className="py-3 px-2 text-right">공시 평균연봉</th>
                    <th className="py-3 px-3 text-right hidden sm:table-cell">
                      회계연도
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.disclosedRows.map((row) => (
                    <tr
                      key={row.companyId}
                      className="border-b border-canvas-100 last:border-0"
                    >
                      <td className="py-3 px-3">
                        <Link
                          href={`/salary-db/${row.companyId}`}
                          className="font-bold text-navy hover:text-electric transition-colors"
                        >
                          {row.nameKo}
                        </Link>
                        <span className="text-[12px] text-faint-blue">
                          {" "}
                          ({row.industryKo})
                        </span>
                        {row.sourceUrl && (
                          <a
                            href={row.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-[11px] text-faint-blue underline decoration-dotted truncate max-w-[340px]"
                          >
                            출처: 사업보고서 보도 원문
                          </a>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right font-black text-navy tabular-nums">
                        {row.avgSalaryManwon.toLocaleString("ko-KR")}만원
                      </td>
                      <td className="py-3 px-3 text-right text-muted-blue tabular-nums hidden sm:table-cell">
                        {row.fiscalYear}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {data.statJobs.length > 0 && (
            <ul className="space-y-2 text-[14px] leading-[1.8] text-muted-blue font-medium">
              {data.statJobs.map((job) => (
                <li key={job.id} className="rounded-2xl border border-canvas-200 bg-white p-4">
                  <Link
                    href={`/job/${job.id}`}
                    className="font-bold text-navy hover:text-electric transition-colors"
                  >
                    {job.name}
                  </Link>{" "}
                  — 중위연봉{" "}
                  <strong className="text-navy">
                    {job.officialStats!.medianAnnualManwon.toLocaleString("ko-KR")}
                    만원
                  </strong>{" "}
                  <span className="text-[12px] text-faint-blue">
                    ({job.officialStats!.year},{" "}
                    {job.officialStats!.sourceUrl ? (
                      <a
                        href={job.officialStats!.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-dotted"
                      >
                        정부 공식 통계
                      </a>
                    ) : (
                      "정부 공식 통계"
                    )}
                    )
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 인용 안내 */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-navy mb-2">인용 안내</h2>
          <p className="text-[14px] leading-[1.8] text-muted-blue font-medium mb-4">
            본 리포트는 <strong className="text-navy">출처 표기 시 자유롭게 인용</strong>
            하실 수 있습니다 (온라인 인용 시 링크 포함을 권장합니다). 아래 버튼을
            누르면 출처가 포함된 인용문이 복사됩니다.
          </p>
          <div className="space-y-4">
            <CitationCopyButton
              quote={heroQuote}
              path={PATH}
              quoteId="cite-top-industry"
            />
            <CitationCopyButton quote={gapQuote} path={PATH} quoteId="cite-gap" />
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-navy mb-4">자주 묻는 질문</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details
                key={f.question}
                className="group rounded-2xl border border-canvas-200 bg-white p-4"
              >
                <summary className="cursor-pointer font-bold text-navy text-[15px] list-none flex items-center justify-between">
                  {f.question}
                  <span className="text-faint-blue group-open:rotate-45 transition-transform text-lg leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[14px] leading-[1.8] text-muted-blue font-medium">
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* 크로스링크 — 초봉·연봉 클러스터 순환 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/new-employee-salary-2026"
            className="flex items-center justify-between p-5 rounded-2xl border border-canvas-200 bg-white hover:border-electric transition-colors"
          >
            <span className="font-bold text-navy">
              회사별 신입 초봉 TOP 50
              <span className="block text-xs font-medium text-faint-blue">
                업종이 아닌 개별 회사 기준 순위
              </span>
            </span>
            <ArrowRight className="w-5 h-5 text-electric" />
          </Link>
          <Link
            href="/salary-db/ranking"
            className="flex items-center justify-between p-5 rounded-2xl border border-canvas-200 bg-white hover:border-electric transition-colors"
          >
            <span className="font-bold text-navy">
              대기업 연봉 순위 TOP 30
              <span className="block text-xs font-medium text-faint-blue">
                시니어 총보상 기준 랭킹
              </span>
            </span>
            <ArrowRight className="w-5 h-5 text-electric" />
          </Link>
          <Link
            href="/industry"
            className="flex items-center justify-between p-5 rounded-2xl border border-canvas-200 bg-white hover:border-electric transition-colors"
          >
            <span className="font-bold text-navy">
              업종별 연봉 전체 보기
              <span className="block text-xs font-medium text-faint-blue">
                업종별 상세 페이지·회사 목록
              </span>
            </span>
            <ArrowRight className="w-5 h-5 text-electric" />
          </Link>
          <Link
            href="/"
            className="flex items-center justify-between p-5 rounded-2xl border border-canvas-200 bg-white hover:border-electric transition-colors"
          >
            <span className="font-bold text-navy">
              내 연봉 실수령액 계산
              <span className="block text-xs font-medium text-faint-blue">
                초봉 입력하면 세후 월급 바로 확인
              </span>
            </span>
            <ArrowRight className="w-5 h-5 text-electric" />
          </Link>
        </div>

        <div className="mt-10">
          <GuideMidAd />
        </div>
      </div>
    </main>
  );
}
