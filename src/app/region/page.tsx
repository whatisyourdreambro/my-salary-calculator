// src/app/region/page.tsx
// 지역별 평균 연봉 허브 페이지 — "서울 평균 연봉", "부산 연봉" 등 지역 검색어 커버

import Link from "next/link";
import type { Metadata } from "next";
import { regionsData } from "@/data/regionsData";
import { buildPageMetadata } from "@/lib/seo";
import { autoBreadcrumbLd } from "@/lib/structuredData";
import { HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import JsonLd from "@/components/JsonLd";
import SiblingHubsNav from "@/components/SiblingHubsNav";

export const dynamic = "force-static";

export const metadata: Metadata = buildPageMetadata({
  title: "지역별 평균 연봉 2026 — 서울·경기·부산·판교 연봉 비교",
  description:
    "서울, 경기, 부산, 판교, 여의도 등 전국 19개 지역 평균 연봉을 한눈에 비교하세요. 신입부터 시니어까지 경력별 연봉과 2026년 최신 실수령액 정보를 제공합니다.",
  path: "/region",
  keywords: [
    "지역별 평균 연봉",
    "서울 평균 연봉",
    "부산 연봉",
    "판교 연봉",
    "지역 연봉 비교",
    "전국 연봉 지도",
  ],
});

const COST_LABEL: Record<string, string> = {
  "very-high": "생활비 매우 높음",
  high: "생활비 높음",
  medium: "생활비 보통",
  low: "생활비 저렴",
};

const COST_COLOR: Record<string, string> = {
  "very-high": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

export default function RegionIndexPage() {
  const breadcrumbLd = autoBreadcrumbLd("/region", {
    overrides: { region: "지역별 연봉" },
  });

  // 연봉 순서로 정렬
  const sorted = [...regionsData].sort((a, b) => b.salary.overall - a.salary.overall);

  return (
    <main className="w-full min-h-screen bg-canvas pb-20">
      <JsonLd data={breadcrumbLd} />

      {/* Hero */}
      <section className="relative pt-28 pb-14 overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-canvas via-white to-blue-50 dark:from-canvas dark:via-canvas-900 dark:to-blue-950 -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10" />

        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-6">
            📍 지역별 연봉 리포트
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-5 leading-[1.15] text-navy dark:text-canvas-50">
            전국 지역별{" "}
            <span className="text-electric">평균 연봉 비교</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-blue dark:text-canvas-300 mb-6 max-w-2xl mx-auto font-medium">
            서울·판교·여의도부터 지방 광역시까지
            <br className="sm:hidden" /> 19개 지역 연봉을 한눈에 비교하세요.
          </p>

          {/* 요약 통계 */}
          <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-muted-blue dark:text-canvas-400">
            <div>
              <span className="text-electric text-2xl font-black">19</span>
              <span className="ml-1">개 지역</span>
            </div>
            <div>
              <span className="text-electric text-2xl font-black">7,500</span>
              <span className="ml-1">만원 최고 (여의도)</span>
            </div>
            <div>
              <span className="text-electric text-2xl font-black">3,400</span>
              <span className="ml-1">만원 전국 평균</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 상단 광고 */}
        <div className="mb-10">
          <HomeTopAd />
        </div>

        {/* 형제 허브 — 회사·직업·산업 차원으로 분기 */}
        <SiblingHubsNav currentPath="/region" />

        {/* 지역 카드 그리드 */}
        <section>
          <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-6">
            지역별 평균 연봉 현황
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sorted.map((region) => (
              <Link
                key={region.id}
                href={`/region/${region.id}`}
                className="group block"
              >
                <div className="h-full bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 rounded-2xl p-6 hover:border-electric dark:hover:border-electric hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                  {/* 헤더 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{region.emoji}</span>
                      <div>
                        <p className="font-black text-navy dark:text-canvas-50 text-lg leading-tight group-hover:text-electric transition-colors">
                          {region.nameShort}
                        </p>
                        <p className="text-xs text-muted-blue dark:text-canvas-400 mt-0.5">
                          {region.name}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${COST_COLOR[region.costOfLiving]}`}
                    >
                      {COST_LABEL[region.costOfLiving]}
                    </span>
                  </div>

                  {/* 평균 연봉 */}
                  <div className="bg-canvas-50 dark:bg-canvas-800 rounded-xl p-4 mb-4">
                    <p className="text-xs text-muted-blue dark:text-canvas-400 mb-1">
                      전체 평균 연봉
                    </p>
                    <p className="text-3xl font-black text-electric">
                      {region.salary.overall.toLocaleString("ko-KR")}
                      <span className="text-base font-bold text-muted-blue dark:text-canvas-400 ml-1">
                        만원
                      </span>
                    </p>
                  </div>

                  {/* 경력별 연봉 */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-blue dark:text-canvas-400">신입</span>
                      <span className="font-bold text-foreground dark:text-canvas-200">
                        {region.salary.entry.avg.toLocaleString("ko-KR")}만원
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-blue dark:text-canvas-400">3~5년차</span>
                      <span className="font-bold text-foreground dark:text-canvas-200">
                        {region.salary.junior.avg.toLocaleString("ko-KR")}만원
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-blue dark:text-canvas-400">시니어(10년+)</span>
                      <span className="font-bold text-foreground dark:text-canvas-200">
                        {region.salary.senior.avg.toLocaleString("ko-KR")}만원
                      </span>
                    </div>
                  </div>

                  {/* 주요 산업 태그 */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {region.topIndustries.slice(0, 3).map((ind) => (
                      <span
                        key={ind}
                        className="text-xs px-2 py-0.5 rounded-full bg-canvas-100 dark:bg-canvas-700 text-muted-blue dark:text-canvas-300"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>

                  {/* 더보기 화살표 */}
                  <div className="mt-4 pt-4 border-t border-canvas-100 dark:border-canvas-700 flex justify-between items-center text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>상세 분석 보기</span>
                    <span>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 중간 광고 + 쿠팡 */}
        <div className="mt-14 mb-10 max-w-3xl mx-auto">
          <CoupangBanner
            responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
          />
        </div>

        {/* 연봉 비교 인사이트 */}
        <section className="mt-10 bg-white dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-700 p-8">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mb-4">
            지역별 연봉, 어디서 얼마나 차이 날까?
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-7 text-muted-blue dark:text-canvas-300">
            <p>
              2026년 기준으로 여의도 금융권 평균 연봉(7,500만원)은 지방 평균(3,400만원)의 두 배를 넘습니다.
              같은 수도권이라도 판교 IT 클러스터(6,200만원)와 인천(3,900만원) 간 격차가 상당하며,
              단순히 수도권에 취업한다고 연봉이 높아지는 것은 아닙니다.
            </p>
            <p>
              지방 광역시 중에서는 울산(4,100만원)이 현대차·현대중공업 생산직 수당 효과로
              서울에 근접한 연봉을 보이며, 세종(4,300만원)은 공무원 밀집 특성상
              안정적 고연봉 구조를 가집니다. 생활비를 감안한 실질 구매력은 수도권 격차보다
              좁아질 수 있으니, 지역 이사 전에 반드시 실수령액 계산기로 비교해보세요.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/salary/48000000"
              className="inline-flex items-center gap-1 text-sm font-bold text-electric hover:underline"
            >
              서울 평균(4,800만원) 실수령액 계산 →
            </Link>
            <Link
              href="/salary/62000000"
              className="inline-flex items-center gap-1 text-sm font-bold text-electric hover:underline"
            >
              판교 평균(6,200만원) 실수령액 계산 →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
