// src/app/salary-db/listed/industry/[industryId]/page.tsx
//
// 업종별 상장사 공시 연봉 순위 — "{업종} 연봉 순위" 검색 축 (2026-08-30 승인 배치).
// 코호트·집계는 src/lib/salary-data/dartRanking.ts 단일 소스 (상장사 5곳 이상 업종만,
// dynamicParams=false 로 밖은 404 — compare 413 색인 거부 교훈의 고정 코호트 원칙).
// /industry/[slug](추정 기반 업계 소개)와는 "상장사 공시 순위" 타이틀로 검색 의도 분리.
// 광고는 salary-db/layout.tsx 상속 — 이 페이지에 광고 코드 없음 (lite 페이지와 동일).
// 서버 컴포넌트 전용 — dartRanking(dartDisclosed 1.3MB)은 클라 번들 오염 금지.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbLd, faqLd, itemListLd, datasetLd } from "@/lib/structuredData";
import {
  industryRankings,
  getIndustryRanking,
  DART_RANKING_YEAR,
  DART_RANKING_DATE,
  LISTED_TOTAL,
} from "@/lib/salary-data/dartRanking";
import { ShieldCheck, TrendingUp } from "lucide-react";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams(): { industryId: string }[] {
  return industryRankings.map((r) => ({ industryId: r.industryId }));
}

type Props = { params: { industryId: string } };

function fmtManwon(manwon: number): string {
  const eok = Math.floor(manwon / 10000);
  const rest = manwon % 10000;
  if (eok > 0 && rest > 0) return `${eok}억 ${rest.toLocaleString("ko-KR")}만원`;
  if (eok > 0) return `${eok}억원`;
  return `${rest.toLocaleString("ko-KR")}만원`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = getIndustryRanking(params.industryId);
  if (!r) return { title: "페이지를 찾을 수 없습니다", robots: { index: false, follow: false } };
  return buildPageMetadata({
    title: `${r.industryKo} 상장사 연봉 순위 — 공시 평균연봉 ${r.companyCount}곳 (${DART_RANKING_YEAR})`,
    description: `${r.industryKo} 상장사 ${r.companyCount}곳의 DART 사업보고서 공시 평균연봉 순위입니다. 업종 가중 평균 ${fmtManwon(
      r.weightedAvgManwon
    )}·중위 ${fmtManwon(r.medianManwon)} — 추정이 아닌 공시 원값 전수 순위표.`,
    path: `/salary-db/listed/industry/${r.industryId}`,
    keywords: [
      `${r.industryKo} 연봉 순위`,
      `${r.industryKo} 평균연봉`,
      `${r.industryKo} 연봉`,
      "상장사 연봉 순위",
    ],
  });
}

export default function IndustryRankingPage({ params }: Props) {
  const r = getIndustryRanking(params.industryId);
  if (!r) notFound();

  const path = `/salary-db/listed/industry/${r.industryId}`;
  const capped = r.companyCount > r.topRows.length;
  const top1 = r.topRows[0];

  const crumbs = [
    { name: "홈", path: "/" },
    { name: "회사 연봉 DB", path: "/salary-db" },
    { name: "상장사 공시 연봉", path: "/salary-db/listed" },
    { name: `${r.industryKo} 순위`, path },
  ];

  const faqItems = [
    {
      question: `${r.industryKo} 상장사 평균연봉은 얼마인가요?`,
      answer: `${DART_RANKING_YEAR} 사업연도 공시 기준 ${r.industryKo} 상장사 ${r.companyCount}곳의 직원 수 가중 평균연봉은 ${fmtManwon(
        r.weightedAvgManwon
      )}, 중위값은 ${fmtManwon(r.medianManwon)}입니다 (직원 합계 ${r.totalEmployees.toLocaleString(
        "ko-KR"
      )}명).`,
    },
    {
      question: `${r.industryKo}에서 평균연봉이 가장 높은 상장사는 어디인가요?`,
      answer: `${top1.nameKo}로, ${DART_RANKING_YEAR} 공시 평균연봉 ${fmtManwon(
        top1.avgSalaryManwon
      )}(직원 ${top1.employeeCount.toLocaleString("ko-KR")}명)입니다.`,
    },
    {
      question: "이 순위는 어떻게 산정되나요?",
      answer: `금융감독원 전자공시(DART) ${DART_RANKING_YEAR} 사업연도 사업보고서 「직원 등의 현황」의 1인 평균 급여액(급여총액÷직원 수, 등기임원 제외)을 그대로 사용합니다. 추정치는 없으며, 신입 초봉이 아니라 전 직급·전 연차 평균입니다. 집계 방식 괴리 플래그가 있는 회사는 제외했습니다.`,
    },
  ];

  const otherIndustries = industryRankings.filter((o) => o.industryId !== r.industryId);

  return (
    <main className="min-h-screen bg-transparent pb-10">
      <JsonLd
        data={[
          breadcrumbLd(crumbs),
          itemListLd({
            name: `${r.industryKo} 상장사 공시 평균연봉 순위`,
            items: r.topRows.slice(0, 50).map((row) => ({
              position: row.rank,
              name: `${row.nameKo} 평균연봉`,
              url: row.href ?? path,
            })),
          }),
          datasetLd({
            name: `${r.industryKo} 상장사 공시 평균연봉 순위 (${DART_RANKING_YEAR})`,
            description: `DART 사업보고서 기준 ${r.industryKo} 상장사 ${r.companyCount}곳의 평균연봉·직원 수·근속연수 순위 데이터`,
            url: path,
            dateModified: DART_RANKING_DATE,
            keywords: [`${r.industryKo} 연봉 순위`, "상장사 평균연봉", "DART 공시"],
          }),
          faqLd(faqItems),
        ]}
      />

      <div className="page-width pt-24 pb-3">
        {/* items 모드 — /salary-db/listed/industry 중간 세그먼트는 실재 페이지가 아니라 404 링크 방지 */}
        <Breadcrumbs items={crumbs} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 히어로 */}
        <section className="mb-8">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-electric/10 px-3 py-1 text-xs font-bold text-electric mb-3">
            <ShieldCheck size={13} aria-hidden="true" />
            DART 사업보고서 공시 — 추정 0
          </p>
          <h1 className="text-2xl sm:text-4xl font-black text-navy leading-tight mb-3">
            {r.industryKo} 상장사 연봉 순위{" "}
            <span className="text-primary">{r.companyCount}곳</span>
          </h1>
          <p className="speakable-summary text-sm sm:text-[15px] leading-7 text-muted-blue max-w-3xl">
            {DART_RANKING_YEAR} 사업연도 사업보고서 공시 기준 {r.industryKo} 상장사{" "}
            {r.companyCount}곳의 평균연봉 순위입니다. 업종 가중 평균은{" "}
            <strong className="text-navy">{fmtManwon(r.weightedAvgManwon)}</strong>, 중위값은{" "}
            <strong className="text-navy">{fmtManwon(r.medianManwon)}</strong>이며, 1위는{" "}
            <strong className="text-navy">{top1.nameKo}</strong>(
            {fmtManwon(top1.avgSalaryManwon)})입니다. 급여총액 ÷ 직원 수의 공식 수치로, 신입
            초봉이 아닌 전 직급 평균입니다.
          </p>
        </section>

        {/* 스탯 카드 */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8" aria-label="업종 핵심 지표">
          <div className="rounded-2xl border border-canvas-200 bg-white p-4">
            <p className="text-xs text-faint-blue mb-1">가중 평균연봉</p>
            <p className="font-black text-navy text-lg leading-tight">{fmtManwon(r.weightedAvgManwon)}</p>
          </div>
          <div className="rounded-2xl border border-canvas-200 bg-white p-4">
            <p className="text-xs text-faint-blue mb-1">중위 연봉</p>
            <p className="font-black text-navy text-lg leading-tight">{fmtManwon(r.medianManwon)}</p>
          </div>
          <div className="rounded-2xl border border-canvas-200 bg-white p-4">
            <p className="text-xs text-faint-blue mb-1">상장사 수</p>
            <p className="font-black text-navy text-lg leading-tight">{r.companyCount}곳</p>
          </div>
          <div className="rounded-2xl border border-canvas-200 bg-white p-4">
            <p className="text-xs text-faint-blue mb-1">직원 합계</p>
            <p className="font-black text-navy text-lg leading-tight">
              {r.totalEmployees.toLocaleString("ko-KR")}명
            </p>
          </div>
        </section>

        {/* 순위표 */}
        <section className="mb-8" aria-labelledby="rank-table-heading">
          <h2 id="rank-table-heading" className="text-lg sm:text-xl font-black text-navy mb-3 inline-flex items-center gap-2">
            <TrendingUp size={18} className="text-electric" aria-hidden="true" />
            {r.industryKo} 공시 평균연봉 순위{capped ? ` TOP ${r.topRows.length}` : ""}
          </h2>
          {capped && (
            <p className="text-xs text-muted-blue mb-3">
              전체 {r.companyCount}곳 중 상위 {r.topRows.length}곳을 표시합니다.
            </p>
          )}
          <div className="overflow-x-auto rounded-2xl border border-canvas-200 bg-white">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-canvas-200 text-left text-xs text-faint-blue">
                  <th className="py-2.5 px-3 font-bold">순위</th>
                  <th className="py-2.5 px-3 font-bold">회사</th>
                  <th className="py-2.5 px-3 font-bold">평균연봉</th>
                  <th className="py-2.5 px-3 font-bold">직원 수</th>
                  <th className="py-2.5 px-3 font-bold">평균 근속</th>
                </tr>
              </thead>
              <tbody>
                {r.topRows.map((row) => (
                  <tr key={row.stockCode || row.nameKo} className="border-b border-canvas-200/60">
                    <td className="py-2 px-3 font-bold text-faint-blue tabular-nums">{row.rank}</td>
                    <td className="py-2 px-3 font-bold text-navy">
                      {row.href ? (
                        <Link href={row.href} className="hover:text-electric hover:underline">
                          {row.nameKo}
                        </Link>
                      ) : (
                        row.nameKo
                      )}
                    </td>
                    <td className="py-2 px-3 tabular-nums font-black text-electric">
                      {fmtManwon(row.avgSalaryManwon)}
                    </td>
                    <td className="py-2 px-3 tabular-nums text-muted-blue">
                      {row.employeeCount.toLocaleString("ko-KR")}명
                    </td>
                    <td className="py-2 px-3 tabular-nums text-muted-blue">
                      {row.avgTenureYears != null ? `${Math.round(row.avgTenureYears * 10) / 10}년` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-8" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-lg font-black text-navy mb-4">자주 묻는 질문</h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details key={item.question} className="group rounded-xl border border-canvas-200 bg-white p-5">
                <summary className="cursor-pointer text-sm font-bold text-navy">{item.question}</summary>
                <p className="faq-answer mt-3 text-sm leading-7 text-muted-blue">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 다른 업종 순위 */}
        <section className="mb-8" aria-labelledby="other-heading">
          <h2 id="other-heading" className="text-lg font-black text-navy mb-4">다른 업종 연봉 순위</h2>
          <div className="flex flex-wrap gap-2">
            {otherIndustries.map((o) => (
              <Link
                key={o.industryId}
                href={`/salary-db/listed/industry/${o.industryId}`}
                className="rounded-full border border-canvas-200 bg-white px-4 py-2 text-sm font-bold text-navy hover:border-primary transition"
              >
                {o.industryKo} ({o.companyCount})
              </Link>
            ))}
          </div>
        </section>

        {/* 지표 랭킹·허브 링크 */}
        <section className="mb-8 rounded-2xl border border-canvas-200 bg-white p-5" aria-labelledby="more-heading">
          <h2 id="more-heading" className="text-sm font-black text-navy mb-3">더 보기</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link href="/salary-db/listed/top-raise" className="font-bold text-electric hover:underline">
              연봉 인상률 TOP 100 →
            </Link>
            <Link href="/salary-db/listed/top-tenure" className="font-bold text-electric hover:underline">
              평균 근속 TOP 100 →
            </Link>
            <Link href="/salary-db/listed/top-employees" className="font-bold text-electric hover:underline">
              직원 수 TOP 100 →
            </Link>
            <Link href="/insights/listed-avg-salary-top100-2026" className="font-bold text-electric hover:underline">
              전체 평균연봉 TOP 100 리포트 →
            </Link>
            <Link href="/salary-db/listed" className="font-bold text-electric hover:underline">
              상장사 공시 연봉 전체 보기 →
            </Link>
          </div>
        </section>

        {/* 방법론·출처 */}
        <section className="mb-4 rounded-2xl border border-canvas-200 bg-canvas-50 p-5" aria-labelledby="method-heading">
          <h2 id="method-heading" className="text-sm font-black text-navy mb-2">데이터 출처·산정 기준</h2>
          <p className="text-xs leading-6 text-muted-blue">
            금융감독원 전자공시시스템(DART) {DART_RANKING_YEAR} 사업연도 사업보고서 「직원 등의
            현황」 기준 — 연간 급여총액 ÷ 직원 수(등기임원 제외). 상장사 전체 모수는{" "}
            {LISTED_TOTAL.toLocaleString("ko-KR")}곳이며, 업종 분류는 표준산업분류(KSIC) 기반
            자체 매핑입니다. <strong className="text-navy">신입 초봉이 아니며</strong>, 성과급
            지급 시점에 따라 연도별 변동이 있을 수 있습니다. 데이터 기준일: {DART_RANKING_DATE}.
          </p>
        </section>
      </div>
    </main>
  );
}
