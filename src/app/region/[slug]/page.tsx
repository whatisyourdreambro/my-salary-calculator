// src/app/region/[slug]/page.tsx
// 지역별 연봉 상세 페이지 — "{지역} 평균 연봉" 롱테일 검색어 커버

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { regionsData, getRegionById } from "@/data/regionsData";
import { industriesData } from "@/data/industriesData";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { buildPageMetadata } from "@/lib/seo";
import { faqLd, autoBreadcrumbLd } from "@/lib/structuredData";
import { CalcResultAd, InArticleAd, HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import JsonLd from "@/components/JsonLd";

// 지역의 topIndustries(한국어 표시명) → /industry/[id] 매칭.
// 정확 일치 우선, 그 다음 부분 포함(예: "IT·소프트웨어" → "IT").
function findIndustryByName(name: string) {
  const direct = industriesData.find((i) => i.name === name);
  if (direct) return direct;
  const norm = name.replace(/[·\s/\-]/g, "");
  return industriesData.find((i) => {
    const a = i.name.replace(/[·\s/\-]/g, "");
    return a.includes(norm) || norm.includes(a);
  });
}

export const dynamic = "force-static";

export function generateStaticParams() {
  return regionsData.map((region) => ({ slug: region.id }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const region = getRegionById(params.slug);
  if (!region) return { title: "Not Found" };

  return buildPageMetadata({
    title: `${region.nameShort} 평균 연봉 2026 — 신입~경력별 연봉·실수령액`,
    description: `${region.name} 평균 연봉 ${region.salary.overall}만원. 신입 ${region.salary.entry.avg}만원~, 시니어 ${region.salary.senior.avg}만원~. 2026년 최신 기준 실수령액 계산기 제공.`,
    path: `/region/${region.id}`,
    keywords: region.keywords,
  });
}

// 지역 대표 기업명을 회사 DB와 매칭 (정확 일치 또는 별칭).
function resolveCompany(name: string) {
  const norm = (s: string) => s.replace(/\s+/g, "");
  const target = norm(name);
  return companyRepository
    .getAll()
    .find(
      (c) =>
        norm(c.name.ko) === target ||
        (c.aliases?.some((a) => norm(a) === target) ?? false)
    );
}

function OtherRegions({ currentId }: { currentId: string }) {
  const others = regionsData.filter((r) => r.id !== currentId);
  // 연봉 순 정렬 후 5개 샘플 (인접 연봉 범위에서 선택)
  const sorted = [...others].sort((a, b) => b.salary.overall - a.salary.overall);
  const picks: typeof others = [];
  // 상위 2개 + 중간 2개 + 하위 1개
  if (sorted.length > 0) picks.push(sorted[0]);
  if (sorted.length > 1) picks.push(sorted[1]);
  const mid = Math.floor(sorted.length / 2);
  if (sorted[mid] && !picks.find((p) => p.id === sorted[mid].id)) picks.push(sorted[mid]);
  if (sorted[mid + 1] && !picks.find((p) => p.id === sorted[mid + 1].id))
    picks.push(sorted[mid + 1]);
  if (sorted[sorted.length - 1] && !picks.find((p) => p.id === sorted[sorted.length - 1].id))
    picks.push(sorted[sorted.length - 1]);

  return (
    <section className="mt-10">
      <h2 className="text-xl font-black text-navy dark:text-canvas-50 mb-4">
        다른 지역 연봉 비교
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {picks.map((r) => (
          <Link
            key={r.id}
            href={`/region/${r.id}`}
            className="group flex flex-col items-center p-4 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 rounded-2xl hover:border-electric dark:hover:border-electric transition-colors"
          >
            <span className="text-3xl mb-2">{r.emoji}</span>
            <p className="font-bold text-navy dark:text-canvas-50 text-sm group-hover:text-electric transition-colors">
              {r.nameShort}
            </p>
            <p className="text-electric font-black text-lg mt-1">
              {r.salary.overall.toLocaleString("ko-KR")}만원
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function RegionDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const region = getRegionById(params.slug);
  if (!region) notFound();

  const breadcrumbSchema = autoBreadcrumbLd(`/region/${region.id}`, {
    overrides: { region: "지역별 연봉" },
    leafName: region.nameShort,
  });
  const faqSchema = faqLd(region.faqs.map((f) => ({ question: f.q, answer: f.a })));

  // 실수령액 계산기 링크용 원 단위 변환
  const overallWon = region.salary.overall * 10000;
  const entryWon = region.salary.entry.avg * 10000;
  const juniorWon = region.salary.junior.avg * 10000;
  const seniorWon = region.salary.senior.avg * 10000;

  return (
    <main className="w-full min-h-screen bg-canvas pb-20">
      <JsonLd data={[breadcrumbSchema, faqSchema]} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        {/* 브레드크럼 */}
        <nav className="flex items-center gap-2 text-sm text-muted-blue dark:text-canvas-400 mb-8 flex-wrap">
          <Link href="/" className="hover:text-electric transition-colors">
            홈
          </Link>
          <span>/</span>
          <Link href="/region" className="hover:text-electric transition-colors">
            지역별 연봉
          </Link>
          <span>/</span>
          <span className="text-navy dark:text-canvas-50 font-bold">{region.nameShort}</span>
        </nav>

        {/* 헤더 */}
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{region.emoji}</span>
            <div>
              <p className="text-sm font-bold text-muted-blue dark:text-canvas-400 uppercase tracking-wider mb-1">
                {region.name}
              </p>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-canvas-50">
                {region.nameShort} 평균 연봉
              </h1>
            </div>
          </div>

          {/* 전체 평균 + 실수령액 링크 */}
          <div className="bg-gradient-to-r from-electric/10 to-primary/10 dark:from-electric/20 dark:to-primary/20 border border-electric/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-blue dark:text-canvas-300 mb-1">2026년 전체 평균 연봉</p>
              <p className="text-5xl font-black text-electric">
                {region.salary.overall.toLocaleString("ko-KR")}
                <span className="text-2xl font-bold text-muted-blue dark:text-canvas-300 ml-1">만원</span>
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-400 mt-2">{region.trendNote}</p>
            </div>
            <Link
              href={`/salary/${overallWon}`}
              className="inline-flex items-center gap-2 bg-electric text-white font-bold px-6 py-3 rounded-xl hover:bg-electric/90 transition-colors text-sm whitespace-nowrap"
            >
              실수령액 계산 →
            </Link>
          </div>
        </header>

        {/* 상단 광고 */}
        <HomeTopAd />

        {/* 경력별 연봉 3열 카드 */}
        <section className="mt-10">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mb-4">
            경력별 평균 연봉
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 신입 */}
            <div className="bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🌱</span>
                <p className="font-black text-navy dark:text-canvas-50">신입</p>
              </div>
              <p className="text-xs text-muted-blue dark:text-canvas-400 mb-1">경력 0~2년</p>
              <p className="text-3xl font-black text-electric mb-3">
                {region.salary.entry.avg.toLocaleString("ko-KR")}
                <span className="text-sm font-bold text-muted-blue dark:text-canvas-400 ml-1">만원</span>
              </p>
              <div className="text-xs text-muted-blue dark:text-canvas-400 space-y-1">
                <div className="flex justify-between">
                  <span>최소</span>
                  <span className="font-bold text-foreground dark:text-canvas-200">
                    {region.salary.entry.min.toLocaleString("ko-KR")}만원
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>최대</span>
                  <span className="font-bold text-foreground dark:text-canvas-200">
                    {region.salary.entry.max.toLocaleString("ko-KR")}만원
                  </span>
                </div>
              </div>
              <Link
                href={`/salary/${entryWon}`}
                className="mt-4 block text-center text-xs font-bold text-electric hover:underline"
              >
                실수령액 계산 →
              </Link>
            </div>

            {/* 주니어 */}
            <div className="bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 rounded-2xl p-6 ring-2 ring-electric/30">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💼</span>
                <p className="font-black text-navy dark:text-canvas-50">주니어</p>
              </div>
              <p className="text-xs text-muted-blue dark:text-canvas-400 mb-1">경력 3~5년</p>
              <p className="text-3xl font-black text-electric mb-3">
                {region.salary.junior.avg.toLocaleString("ko-KR")}
                <span className="text-sm font-bold text-muted-blue dark:text-canvas-400 ml-1">만원</span>
              </p>
              <div className="text-xs text-muted-blue dark:text-canvas-400 space-y-1">
                <div className="flex justify-between">
                  <span>최소</span>
                  <span className="font-bold text-foreground dark:text-canvas-200">
                    {region.salary.junior.min.toLocaleString("ko-KR")}만원
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>최대</span>
                  <span className="font-bold text-foreground dark:text-canvas-200">
                    {region.salary.junior.max.toLocaleString("ko-KR")}만원
                  </span>
                </div>
              </div>
              <Link
                href={`/salary/${juniorWon}`}
                className="mt-4 block text-center text-xs font-bold text-electric hover:underline"
              >
                실수령액 계산 →
              </Link>
            </div>

            {/* 시니어 */}
            <div className="bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🏆</span>
                <p className="font-black text-navy dark:text-canvas-50">시니어</p>
              </div>
              <p className="text-xs text-muted-blue dark:text-canvas-400 mb-1">경력 10년+</p>
              <p className="text-3xl font-black text-electric mb-3">
                {region.salary.senior.avg.toLocaleString("ko-KR")}
                <span className="text-sm font-bold text-muted-blue dark:text-canvas-400 ml-1">만원</span>
              </p>
              <div className="text-xs text-muted-blue dark:text-canvas-400 space-y-1">
                <div className="flex justify-between">
                  <span>최소</span>
                  <span className="font-bold text-foreground dark:text-canvas-200">
                    {region.salary.senior.min.toLocaleString("ko-KR")}만원
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>최대</span>
                  <span className="font-bold text-foreground dark:text-canvas-200">
                    {region.salary.senior.max.toLocaleString("ko-KR")}만원
                  </span>
                </div>
              </div>
              <Link
                href={`/salary/${seniorWon}`}
                className="mt-4 block text-center text-xs font-bold text-electric hover:underline"
              >
                실수령액 계산 →
              </Link>
            </div>
          </div>
        </section>

        {/* 지역 설명 */}
        <section className="mt-10 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 rounded-2xl p-6">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mb-3">
            {region.nameShort} 연봉 특징
          </h2>
          <p className="text-base leading-7 text-muted-blue dark:text-canvas-300">
            {region.description}
          </p>
        </section>

        {/* 주요 산업 — 매칭되는 /industry/[id]로 cross-link해 PageRank 양방향 흐름 */}
        <section className="mt-8">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mb-4">
            {region.nameShort} 주요 산업
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {region.topIndustries.map((industry, idx) => {
              const matched = findIndustryByName(industry);
              const body = (
                <>
                  <span className="text-xl font-black text-electric opacity-50">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="font-bold text-navy dark:text-canvas-100 flex-1">{industry}</span>
                  {matched && (
                    <span className="text-electric text-sm font-bold">
                      평균 {matched.salary.overall.toLocaleString("ko-KR")}만원 →
                    </span>
                  )}
                </>
              );
              return matched ? (
                <Link
                  key={industry}
                  href={`/industry/${matched.id}`}
                  className="group flex items-center gap-3 p-4 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 rounded-xl hover:border-electric transition-colors"
                >
                  {body}
                </Link>
              ) : (
                <div
                  key={industry}
                  className="flex items-center gap-3 p-4 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 rounded-xl"
                >
                  {body}
                </div>
              );
            })}
          </div>
        </section>

        {/* 대표 기업 */}
        <section className="mt-8">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mb-4">
            {region.nameShort} 대표 기업
          </h2>
          <div className="flex flex-wrap gap-3">
            {region.majorCompanies.map((company) => {
              const matched = resolveCompany(company);
              return matched ? (
                <Link
                  key={company}
                  href={`/salary-db/${matched.id}`}
                  className="px-4 py-2 bg-white dark:bg-canvas-900 border border-electric/30 hover:border-electric rounded-full text-sm font-bold text-navy dark:text-canvas-200 hover:text-electric transition-colors"
                >
                  {company} <span className="text-electric">연봉 →</span>
                </Link>
              ) : (
                <span
                  key={company}
                  className="px-4 py-2 bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 rounded-full text-sm font-bold text-navy dark:text-canvas-200"
                >
                  {company}
                </span>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-blue dark:text-canvas-400">
            기업명을 누르면 해당 회사의 직급별 연봉·실수령액 상세 페이지로 이동합니다.{" "}
            <Link href="/salary-db" className="text-electric font-bold hover:underline">
              전체 회사 DB 검색하기 →
            </Link>
          </p>
        </section>

        {/* 직업 허브 분기 — region이 dead-end 되지 않도록 직업/회사 차원으로 분기 */}
        <section className="mt-8 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 rounded-2xl p-6">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-3">
            {region.nameShort}에서 일자리 찾기
          </h2>
          <p className="text-sm text-muted-blue dark:text-canvas-300 mb-4 leading-6">
            {region.nameShort} 지역의 평균 연봉을 직업별·산업별로 더 자세히 비교해 보세요.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link
              href="/job"
              className="flex items-center gap-2 p-3 bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 rounded-xl hover:border-electric transition-colors"
            >
              <span className="text-electric font-black">→</span>
              <span className="text-sm font-bold text-navy dark:text-canvas-100">직업별 연봉</span>
            </Link>
            <Link
              href="/industry"
              className="flex items-center gap-2 p-3 bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 rounded-xl hover:border-electric transition-colors"
            >
              <span className="text-electric font-black">→</span>
              <span className="text-sm font-bold text-navy dark:text-canvas-100">산업별 연봉</span>
            </Link>
            <Link
              href="/salary-db"
              className="flex items-center gap-2 p-3 bg-canvas-50 dark:bg-canvas-800 border border-canvas-200 dark:border-canvas-700 rounded-xl hover:border-electric transition-colors"
            >
              <span className="text-electric font-black">→</span>
              <span className="text-sm font-bold text-navy dark:text-canvas-100">회사별 연봉</span>
            </Link>
          </div>
        </section>

        {/* 중간 광고 */}
        <div className="mt-10">
          <CalcResultAd />
        </div>

        {/* FAQ 섹션 */}
        <section className="mt-10">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mb-6">
            자주 묻는 질문 — {region.nameShort} 연봉
          </h2>
          <div className="space-y-4">
            {region.faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 rounded-2xl overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-navy dark:text-canvas-50 list-none hover:text-electric transition-colors">
                  <span className="flex items-start gap-3">
                    <span className="text-electric font-black shrink-0">Q.</span>
                    {faq.q}
                  </span>
                  <span className="text-muted-blue dark:text-canvas-400 group-open:rotate-180 transition-transform ml-4 shrink-0">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-6 pt-2 border-t border-canvas-100 dark:border-canvas-700">
                  <div className="flex items-start gap-3 text-muted-blue dark:text-canvas-300 leading-7">
                    <span className="text-electric font-black shrink-0">A.</span>
                    <p>{faq.a}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* 인아티클 광고 */}
        <div className="mt-10">
          <InArticleAd />
        </div>

        {/* 다른 지역 비교 */}
        <OtherRegions currentId={region.id} />

        {/* 쿠팡 배너 */}
        <div className="mt-10">
          <CoupangBanner
            responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
          />
        </div>

        {/* 다음 단계 */}
        <section className="mt-10 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 rounded-2xl p-6">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
            다음 단계 — 직접 계산해보기
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href={`/salary/${overallWon}`}
                className="text-electric hover:underline font-bold"
              >
                → {region.nameShort} 평균 연봉 {region.salary.overall}만원 실수령액 계산
              </Link>
            </li>
            <li>
              <Link href="/region" className="text-electric hover:underline font-bold">
                → 전국 지역별 연봉 비교 리스트
              </Link>
            </li>
            <li>
              <Link href="/salary-db" className="text-electric hover:underline font-bold">
                → 회사별 연봉 DB 검색
              </Link>
            </li>
            <li>
              <Link href="/calc" className="text-electric hover:underline font-bold">
                → 100가지 금융 계산기 둘러보기
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
