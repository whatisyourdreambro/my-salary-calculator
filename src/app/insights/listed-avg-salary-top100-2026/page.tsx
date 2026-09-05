// /insights/listed-avg-salary-top100-2026 — 데이터 리포트: 공시 평균연봉 TOP 100.
//
// 기자·블로거 인용 타깃(백링크) — "상장사 평균연봉 순위"는 매년 언론이 다루는
// 소재를 전수 데이터로 선점. 모든 수치는 빌드 시 DART 공시 집계(dartReport.ts)
// 단일 소스에서 파생 — 하드코딩 0 (docs/serp-strategy-2026.md 리포트 파이프라인).
// TOP 100 표의 회사명은 /salary-db 페이지 존재 시 내부 링크 — 리포트가
// 회사 페이지 클러스터의 링크 허브 역할을 겸한다.

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { BarChart3, ArrowRight, ShieldCheck } from "lucide-react";
import {
  dartTop100,
  dartIndustryRows,
  dartReportStats,
  DART_INDUSTRY_MIN_COMPANIES,
} from "@/lib/salary-data/dartReport";
import { listedCohortStockCodes } from "@/lib/salary-data/dartLite";
import { getReportBySlug } from "@/data/reportsRegistry";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, datasetLd, articleLd, faqLd } from "@/lib/structuredData";
import PublishedMeta from "@/components/PublishedMeta";
import CitationCopyButton from "@/components/CitationCopyButton";
import { InArticleAd, GuideMidAd, HomeTopAd, MultiplexAd } from "@/components/AdPlacement";
import { CITATION_POLICY_URL, DART_CITATION, reportDataUrls } from "../_lib/reportDatasetMeta";

export const dynamic = "force-static";

const SLUG = "listed-avg-salary-top100-2026";
const PATH = `/insights/${SLUG}`;
const report = getReportBySlug(SLUG)!;
const stats = dartReportStats;

export const metadata: Metadata = buildPageMetadata({
  title: report.title,
  description: report.description,
  path: PATH,
  keywords: report.keywords,
  ogType: "article",
  publishedTime: report.publishedDate,
  modifiedTime: report.updatedDate,
});

function manwonFmt(manwon: number): string {
  const eok = Math.floor(manwon / 10000);
  const rest = manwon % 10000;
  if (eok > 0 && rest > 0) return `${eok}억 ${rest.toLocaleString("ko-KR")}만원`;
  if (eok > 0) return `${eok}억원`;
  return `${rest.toLocaleString("ko-KR")}만원`;
}

const top1 = dartTop100[0];
const heroQuote = `머니샐러리가 금융감독원 전자공시(DART) 사업보고서 ${stats.companyCount.toLocaleString("ko-KR")}곳의 '직원 등의 현황'을 전수 집계한 결과, ${stats.rankYear}년 평균연봉 1위는 ${top1.nameKo}(${manwonFmt(top1.avgSalaryManwon)})로 나타났다.`;
const statQuote = `공시 기준 ${stats.companyCount.toLocaleString("ko-KR")}개사 직원 ${Math.round(stats.totalEmployees / 10000).toLocaleString("ko-KR")}만여 명의 ${stats.rankYear}년 평균연봉은 ${manwonFmt(stats.weightedAvgManwon)}(직원 수 가중), 회사 기준 중앙값은 ${manwonFmt(stats.medianManwon)}이었다.`;

const faqs = [
  {
    question: "이 순위의 평균연봉은 어떻게 계산했나요?",
    answer:
      "각 회사가 금융감독원 전자공시(DART) 사업보고서 '직원 등의 현황'에 공시한 연간 급여총액을 직원 수로 나눈 값입니다(등기임원 보수 제외). 사업부문·성별로 나뉜 공시는 급여총액 합산 ÷ 인원 합산으로 가중 평균했습니다. 회사가 제출한 공시 원문이 출처이므로 추정치가 아닙니다.",
  },
  {
    question: "어떤 회사들이 집계 대상인가요?",
    answer: `${stats.rankYear} 사업연도 사업보고서를 제출한 상장사와 주요 비상장 공시법인 중, 직원 30명 이상·급여 데이터가 유효한 ${stats.companyCount.toLocaleString("ko-KR")}곳입니다. 사업보고서를 제출하지 않는 비상장사(스타트업 다수)는 포함되지 않습니다.`,
  },
  {
    question: "평균연봉이 실제 내 연봉과 왜 다른가요?",
    answer:
      "공시 평균에는 임원(미등기)·고연차 직원이 포함되고 성과급이 지급된 해에는 값이 크게 뛰므로, 신입·저연차 연봉과는 차이가 큽니다. 직급별 상세는 각 회사의 연봉 DB 페이지에서, 세후 실수령액은 연봉 계산기에서 확인하세요.",
  },
  {
    question: "이 리포트를 기사나 블로그에 인용해도 되나요?",
    answer:
      "네. '머니샐러리' 출처 표기(온라인은 링크 포함 권장)만 해주시면 자유롭게 인용하실 수 있습니다. 본문의 '인용문 복사' 버튼을 누르면 출처가 포함된 문장이 복사됩니다.",
  },
  {
    question: "데이터는 언제 기준이고 얼마나 자주 갱신되나요?",
    answer: `${stats.rankYear} 사업연도 사업보고서(${Number(stats.rankYear) + 1}년 3월 제출분) 기준이며, 수집일은 ${stats.dataDate}입니다. 매년 4월 사업보고서 시즌 후 연 1회 전수 갱신합니다.`,
  },
];

export default function ListedAvgSalaryTop100Report() {
  return (
    <main className="w-full bg-canvas min-h-screen pb-20">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "데이터 리포트", path: "/insights" },
            { name: `${stats.rankYear} 공시 평균연봉 TOP 100`, path: PATH },
          ]),
          datasetLd({
            name: report.title,
            description: report.description,
            url: PATH,
            datePublished: report.publishedDate,
            dateModified: report.updatedDate,
            keywords: report.keywords,
            // 원본 데이터 재사용 통로 — /data.csv·/data.json (2026-09-05). 공시 단일 출처라 citation=DART
            distribution: [
              { encodingFormat: "text/csv", contentUrl: reportDataUrls(SLUG).csv },
              { encodingFormat: "application/json", contentUrl: reportDataUrls(SLUG).json },
            ],
            license: CITATION_POLICY_URL,
            temporalCoverage: stats.rankYear,
            citation: DART_CITATION,
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
            <span>머니샐러리 데이터 리포트 — DART 공시 전수 분석</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4 leading-[1.18]">
            {stats.rankYear} 공시 기준 평균연봉 TOP 100
            <span className="block text-xl sm:text-2xl mt-2 text-electric">
              상장사·공시법인 {stats.companyCount.toLocaleString("ko-KR")}곳 전수 집계
            </span>
          </h1>
          <PublishedMeta
            publishedDate={report.publishedDate}
            updatedDate={report.updatedDate}
            className="mb-6"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="rounded-2xl border border-canvas-200 bg-white p-4">
              <p className="text-xs font-bold text-faint-blue mb-1">평균연봉 1위</p>
              <p className="text-lg font-black text-navy">{top1.nameKo}</p>
              <p className="text-sm font-bold text-electric">
                {manwonFmt(top1.avgSalaryManwon)}
              </p>
            </div>
            <div className="rounded-2xl border border-canvas-200 bg-white p-4">
              <p className="text-xs font-bold text-faint-blue mb-1">전체 가중 평균</p>
              <p className="text-lg font-black text-navy">
                {manwonFmt(stats.weightedAvgManwon)}
              </p>
              <p className="text-sm text-faint-blue">
                직원 {Math.round(stats.totalEmployees / 10000).toLocaleString("ko-KR")}만여 명 기준
              </p>
            </div>
            <div className="rounded-2xl border border-canvas-200 bg-white p-4">
              <p className="text-xs font-bold text-faint-blue mb-1">회사 기준 중앙값</p>
              <p className="text-lg font-black text-navy">{manwonFmt(stats.medianManwon)}</p>
              <p className="text-sm text-faint-blue">{stats.rankYear} 사업연도</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4">
        {/* 핵심 인용문 */}
        <CitationCopyButton quote={heroQuote} quoteId="dart-top1" path={PATH} />

        <InArticleAd />

        {/* TOP 100 표 */}
        <section className="mt-8" aria-labelledby="top100-heading">
          <h2 id="top100-heading" className="text-2xl sm:text-3xl font-black text-navy mb-2">
            평균연봉 TOP 100 — {stats.rankYear} 사업보고서 기준
          </h2>
          <p className="text-sm text-muted-blue mb-4 leading-relaxed">
            급여총액÷직원 수(등기임원 제외) 기준. 회사명을 누르면 직급별 연봉·복지
            상세 페이지로 이동합니다(연봉 DB 등재사).
          </p>
          <div className="overflow-x-auto rounded-2xl border border-canvas-200 bg-white">
            <table className="w-full text-sm border-collapse min-w-[560px]">
              <caption className="sr-only">
                {stats.rankYear} 공시 기준 평균연봉 상위 100개사
              </caption>
              <thead>
                <tr className="border-b-2 border-canvas-200 text-left bg-canvas/50">
                  <th className="py-2.5 px-3 font-bold w-12">순위</th>
                  <th className="py-2.5 px-3 font-bold">회사</th>
                  <th className="py-2.5 px-3 font-bold">평균연봉</th>
                  <th className="py-2.5 px-3 font-bold">직원 수</th>
                  <th className="py-2.5 px-3 font-bold">업종</th>
                </tr>
              </thead>
              <tbody>
                {dartTop100.map((row) => (
                  <tr key={row.corpCode} className="border-b border-canvas-200/60">
                    <td className="py-2 px-3 font-black tabular-nums text-electric">
                      {row.rank}
                    </td>
                    <td className="py-2 px-3 font-bold">
                      {row.companyId ? (
                        <Link
                          href={`/salary-db/${row.companyId}`}
                          className="underline decoration-canvas-200 underline-offset-2 hover:text-electric transition"
                        >
                          {row.nameKo}
                        </Link>
                      ) : listedCohortStockCodes.has(row.stockCode) ? (
                        // lite 페이지(공시 전용) 보유 행 — 코호트 등재분만 링크 (밖은 404)
                        <Link
                          href={`/salary-db/listed/${row.stockCode}`}
                          className="underline decoration-canvas-200 underline-offset-2 hover:text-electric transition"
                        >
                          {row.nameKo}
                        </Link>
                      ) : (
                        row.nameKo
                      )}
                      {!row.listed && (
                        <span className="ml-1 text-[10px] text-faint-blue font-normal">
                          비상장
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 tabular-nums font-bold">
                      {manwonFmt(row.avgSalaryManwon)}
                    </td>
                    <td className="py-2 px-3 tabular-nums">
                      {row.employeeCount.toLocaleString("ko-KR")}명
                    </td>
                    <td className="py-2 px-3 text-faint-blue">{row.industryKo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-8">
          <GuideMidAd />
        </div>

        {/* 업종별 집계 */}
        <section className="mt-8" aria-labelledby="industry-heading">
          <h2 id="industry-heading" className="text-2xl sm:text-3xl font-black text-navy mb-2">
            업종별 공시 평균연봉 — 직원 수 가중
          </h2>
          <p className="text-sm text-muted-blue mb-4 leading-relaxed">
            공시 기업 {DART_INDUSTRY_MIN_COMPANIES}곳 이상 업종만 집계. 가중 평균이라
            대형사 비중이 반영됩니다.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-canvas-200 bg-white">
            <table className="w-full text-sm border-collapse min-w-[560px]">
              <thead>
                <tr className="border-b-2 border-canvas-200 text-left bg-canvas/50">
                  <th className="py-2.5 px-3 font-bold">업종</th>
                  <th className="py-2.5 px-3 font-bold">가중 평균연봉</th>
                  <th className="py-2.5 px-3 font-bold">회사 수</th>
                  <th className="py-2.5 px-3 font-bold">업종 1위</th>
                </tr>
              </thead>
              <tbody>
                {dartIndustryRows.map((row) => (
                  <tr key={row.industryId} className="border-b border-canvas-200/60">
                    <td className="py-2 px-3 font-bold">{row.industryKo}</td>
                    <td className="py-2 px-3 tabular-nums font-bold">
                      {manwonFmt(row.weightedAvgManwon)}
                    </td>
                    <td className="py-2 px-3 tabular-nums">
                      {row.companyCount.toLocaleString("ko-KR")}곳
                    </td>
                    <td className="py-2 px-3">
                      {row.topCompany.companyId ? (
                        <Link
                          href={`/salary-db/${row.topCompany.companyId}`}
                          className="underline decoration-canvas-200 underline-offset-2 hover:text-electric transition"
                        >
                          {row.topCompany.nameKo}
                        </Link>
                      ) : (
                        row.topCompany.nameKo
                      )}{" "}
                      <span className="text-faint-blue tabular-nums">
                        ({manwonFmt(row.topCompany.avgSalaryManwon)})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <CitationCopyButton quote={statQuote} quoteId="dart-stats" path={PATH} />
          </div>
        </section>

        {/* 표 하단 IN_ARTICLE 금지 — 상단(히어로 직하)이 같은 슬롯을 먼저 선점해
            dedup 으로 렌더되지 않던 죽은 유닛 (2026-08-23 ad-audit 적발·제거). */}

        {/* 방법론 */}
        <section
          className="mt-8 rounded-2xl border border-canvas-200 bg-white p-6"
          aria-labelledby="method-heading"
        >
          <h2
            id="method-heading"
            className="text-xl font-black text-navy mb-3 inline-flex items-center gap-2"
          >
            <ShieldCheck className="w-5 h-5 text-electric" aria-hidden />
            방법론 · 신뢰 등급
          </h2>
          <ul className="text-sm text-muted-blue space-y-2 list-disc pl-5 leading-relaxed">
            <li>
              <strong>출처 100% 공시</strong>: 금융감독원 전자공시(DART) 사업보고서
              &lsquo;직원 등의 현황&rsquo; — OpenDART OpenAPI로 {stats.dataDate} 수집.
              추정치 없음.
            </li>
            <li>
              <strong>집계</strong>: 사업부문·성별 구분 행의 연간급여총액 합산 ÷ 인원
              합산 (등기임원 보수 제외). 업종 평균은 직원 수 가중.
            </li>
            <li>
              <strong>모수</strong>: {stats.rankYear} 사업연도 보고서 제출 법인 중 직원
              30명 이상·급여 유효값 {stats.companyCount.toLocaleString("ko-KR")}곳 (연도
              무관 전체 검증 통과 {stats.allValidCount.toLocaleString("ko-KR")}곳).
              집계 방식 간 30% 이상 괴리가 있는 공시는 랭킹에서 제외.
            </li>
            <li>
              <strong>한계</strong>: 공시 평균은 미등기임원·성과급 포함 값으로 신입
              초봉과 다르며, 회사별 산정 기준(중도 입퇴사 처리 등)에 편차가 있을 수
              있습니다. 업종 분류는 한국표준산업분류(KSIC) 기반 자체 매핑입니다.
            </li>
          </ul>
        </section>

        {/* 크로스링크 */}
        <section className="mt-8 grid sm:grid-cols-2 gap-3">
          <Link
            href="/insights/entry-salary-by-industry-2026"
            className="block rounded-2xl border border-canvas-200 bg-white p-5 hover:border-electric transition group"
          >
            <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
              함께 보기 · 리포트
            </p>
            <p className="font-bold text-navy text-sm mb-1">
              2026 업종별 신입 초봉 순위
            </p>
            <p className="text-xs text-muted-blue mb-2">
              이 리포트가 재직자 평균이라면, 초봉 리포트는 신입 기준 — 상호 보완
            </p>
            <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
              보러 가기 <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" aria-hidden />
            </span>
          </Link>
          <Link
            href="/salary-db/ranking"
            className="block rounded-2xl border border-canvas-200 bg-white p-5 hover:border-electric transition group"
          >
            <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
              함께 보기 · 랭킹
            </p>
            <p className="font-bold text-navy text-sm mb-1">대기업 연봉 순위 TOP 30</p>
            <p className="text-xs text-muted-blue mb-2">
              신입 영끌 기준 순위 — 본 리포트의 공시 평균과 다른 각도
            </p>
            <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
              보러 가기 <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" aria-hidden />
            </span>
          </Link>
        </section>

        {/* 관련 링크 직후 멀티플렉스(관련 콘텐츠형) — MULTIPLEX 슬롯은 이 페이지·insights layout(PageFooterAds) 체인 미사용이라 순증, 표 분할 아님 — 전면 최적화 (운영자 지시 2026-09-02) */}
        <div className="mt-8">
          <MultiplexAd />
        </div>

        {/* FAQ */}
        <section className="mt-10" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-black text-navy mb-4">
            자주 묻는 질문
          </h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details
                key={f.question}
                className="group rounded-2xl border border-canvas-200 bg-white p-5"
              >
                <summary className="cursor-pointer font-bold text-navy list-none flex items-start gap-3">
                  <span className="text-electric mt-0.5">Q.</span>
                  <span className="flex-1">{f.question}</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-blue pl-7 faq-answer">
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-10">
          <HomeTopAd />
        </div>
      </div>
    </main>
  );
}
