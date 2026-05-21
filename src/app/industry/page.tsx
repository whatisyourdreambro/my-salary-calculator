import { Metadata } from "next";
import Link from "next/link";
import { industriesData } from "@/data/industriesData";
import { buildPageMetadata } from "@/lib/seo";
import { HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd } from "@/lib/structuredData";
import SiblingHubsNav from "@/components/SiblingHubsNav";

export const dynamic = "force-static";

export const metadata: Metadata = buildPageMetadata({
  title: "산업별 평균 연봉 2026 — IT·금융·의료·제조 업계 연봉 비교",
  description:
    "IT·반도체·금융·의료·자동차·건설·게임 등 15개 산업별 평균 연봉을 한눈에 비교하세요. 2026년 최신 기준 신입~경력별 연봉과 실수령액 계산기 제공.",
  path: "/industry",
  keywords: [
    "산업별 연봉",
    "업계별 연봉",
    "업종별 연봉",
    "IT 업계 연봉",
    "금융권 연봉",
    "의료 업계 연봉",
    "반도체 업계 연봉",
    "산업별 평균 연봉 2026",
  ],
});

const TREND_COLOR = {
  rising: "text-green-600 dark:text-green-400",
  stable: "text-yellow-600 dark:text-yellow-400",
  declining: "text-red-500 dark:text-red-400",
};
const TREND_LABEL = { rising: "↑ 상승", stable: "→ 보합", declining: "↓ 하락" };

export default function IndustryIndexPage() {
  const breadcrumb = autoBreadcrumbLd("/industry", {
    overrides: { industry: "산업별 연봉" },
  });

  const sorted = [...industriesData].sort((a, b) => b.salary.overall - a.salary.overall);

  return (
    <>
      <JsonLd data={[breadcrumb]} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <HomeTopAd />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              산업별 평균 연봉 2026
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              IT·반도체·금융·의료·자동차 등 주요 산업별 연봉을 비교하고 내 업계 위치를 확인하세요.
            </p>
          </div>

          {/* 형제 허브 — 회사·직업·지역 차원으로 분기 */}
          <SiblingHubsNav currentPath="/industry" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((industry) => (
              <Link
                key={industry.id}
                href={`/industry/${industry.id}`}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{industry.emoji}</span>
                    <h2 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {industry.name}
                    </h2>
                  </div>
                  <span className={`text-xs font-medium ${TREND_COLOR[industry.trend]}`}>
                    {TREND_LABEL[industry.trend]}
                  </span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">전체 평균</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {industry.salary.overall.toLocaleString()}만원
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">신입</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {industry.salary.entry.avg.toLocaleString()}만원~
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">시니어</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {industry.salary.senior.avg.toLocaleString()}만원~
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 line-clamp-2">
                  {industry.trendNote}
                </p>
              </Link>
            ))}
          </div>

          <CoupangBanner />
        </div>
      </div>
    </>
  );
}
