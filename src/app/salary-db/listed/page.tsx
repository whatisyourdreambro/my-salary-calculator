// src/app/salary-db/listed/page.tsx
//
// 상장사 공시 연봉 인덱스 허브 — lite 페이지(Phase 1 코호트) 전체 목록.
// 고아 페이지 방지의 핵심 진입로: 코호트 전 URL 이 여기서 1홉으로 연결된다.
// 광고는 salary-db/layout.tsx 상속. 서버 컴포넌트 전용 (dartLite 클라 금지).

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbLd, itemListLd } from "@/lib/structuredData";
import { listedCohort, DART_LITE_DATE } from "@/lib/salary-data/dartLite";
import { industryRankings } from "@/lib/salary-data/dartRanking";
import { ShieldCheck, TrendingUp } from "lucide-react";

export const dynamic = "force-static";

export const metadata: Metadata = buildPageMetadata({
  title: `상장사 공시 평균연봉 ${listedCohort.length}곳 — DART 사업보고서 전수`,
  description: `금융감독원 전자공시(DART) 사업보고서 기준 상장사 ${listedCohort.length}곳의 공시 평균연봉을 업종별로 정리했습니다. 급여총액÷직원 수의 공식 수치 — 추정 0, 월 실수령 환산 제공.`,
  path: "/salary-db/listed",
  keywords: ["상장사 평균연봉", "공시 연봉", "사업보고서 연봉", "DART 연봉"],
});

export default function ListedIndexPage() {
  // 업종별 그룹 (평균연봉 내림차순 유지)
  const byIndustry = new Map<string, typeof listedCohort>();
  for (const c of listedCohort) {
    if (!byIndustry.has(c.industryKo)) byIndustry.set(c.industryKo, []);
    byIndustry.get(c.industryKo)!.push(c);
  }
  const groups = [...byIndustry.entries()].sort((a, b) => b[1].length - a[1].length);

  const crumbs = [
    { name: "홈", path: "/" },
    { name: "회사 연봉 DB", path: "/salary-db" },
    { name: "상장사 공시 연봉", path: "/salary-db/listed" },
  ];

  return (
    <main className="min-h-screen bg-transparent pb-10">
      <JsonLd
        data={[
          breadcrumbLd(crumbs),
          itemListLd({
            name: "상장사 공시 평균연봉",
            items: listedCohort.slice(0, 50).map((c, i) => ({
              position: i + 1,
              name: `${c.nameKo} 평균연봉`,
              url: `/salary-db/listed/${c.stockCode}`,
            })),
          }),
        ]}
      />

      <div className="page-width pt-24 pb-3">
        <Breadcrumbs path="/salary-db/listed" leafName="상장사 공시 연봉" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="mb-8">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-electric/10 px-3 py-1 text-xs font-bold text-electric mb-3">
            <ShieldCheck size={13} aria-hidden="true" />
            DART 사업보고서 공시 — 추정 0
          </p>
          <h1 className="text-2xl sm:text-4xl font-black text-navy leading-tight mb-3">
            상장사 공시 평균연봉 <span className="text-primary">{listedCohort.length}곳</span>
          </h1>
          <p className="text-sm sm:text-[15px] leading-7 text-muted-blue max-w-3xl">
            금융감독원 전자공시(DART) 사업보고서의 「직원 등의 현황」에서 집계한 공식
            평균연봉입니다(급여총액 ÷ 직원 수, 등기임원 제외 — 신입 초봉 아님). 직원 500명
            이상 주요 상장사를 업종별로 정리했으며, 각 페이지에서 월 실수령 환산과 업종 내
            순위를 확인할 수 있습니다. 상세 직급별 연봉 프로필은{" "}
            <Link href="/salary-db" className="font-bold text-electric hover:underline">
              회사 연봉 DB
            </Link>
            , 전체 순위는{" "}
            <Link href="/insights/listed-avg-salary-top100-2026" className="font-bold text-electric hover:underline">
              TOP 100 리포트
            </Link>
            에서 볼 수 있습니다. 데이터 기준일: {DART_LITE_DATE}.
          </p>
        </section>

        {/* 랭킹 페이지군 진입로 (2026-08-30) — 업종별 순위 28종 + 지표 TOP 100 3종 */}
        <section className="mb-10 rounded-2xl border border-canvas-200 bg-white p-5 sm:p-6" aria-labelledby="ranking-nav-heading">
          <h2 id="ranking-nav-heading" className="text-lg font-black text-navy mb-1 inline-flex items-center gap-2">
            <TrendingUp size={18} className="text-electric" aria-hidden="true" />
            상장사 연봉 순위 모아보기
          </h2>
          <p className="text-xs text-muted-blue mb-4">
            업종별 공시 평균연봉 전수 순위와 인상률·근속·규모 TOP 100.
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {industryRankings.map((r) => (
              <Link
                key={r.industryId}
                href={`/salary-db/listed/industry/${r.industryId}`}
                className="rounded-full border border-canvas-200 bg-canvas-50 px-3.5 py-1.5 text-xs font-bold text-navy hover:border-primary transition"
              >
                {r.industryKo} 순위 ({r.companyCount})
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <Link href="/salary-db/listed/top-raise" className="font-bold text-electric hover:underline">
              연봉 인상률 TOP 100 →
            </Link>
            <Link href="/salary-db/listed/top-tenure" className="font-bold text-electric hover:underline">
              평균 근속 TOP 100 →
            </Link>
            <Link href="/salary-db/listed/top-employees" className="font-bold text-electric hover:underline">
              직원 수 TOP 100 →
            </Link>
          </div>
        </section>

        {groups.map(([industryKo, list]) => (
          <section key={industryKo} className="mb-8" aria-label={`${industryKo} 상장사`}>
            <h2 className="text-lg font-black text-navy mb-3">
              {industryKo} <span className="text-sm font-bold text-faint-blue">({list.length}곳)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {list.map((c) => (
                <Link
                  key={c.stockCode}
                  href={`/salary-db/listed/${c.stockCode}`}
                  className="flex items-baseline justify-between gap-2 rounded-xl border border-canvas-200 bg-white px-4 py-3 hover:border-primary transition"
                >
                  <span className="font-bold text-navy text-sm truncate">{c.nameKo}</span>
                  <span className="text-xs font-bold text-muted-blue tabular-nums shrink-0">
                    {c.avgSalaryManwon.toLocaleString("ko-KR")}만원
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
