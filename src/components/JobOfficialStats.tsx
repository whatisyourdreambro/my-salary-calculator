// src/components/JobOfficialStats.tsx
// 직업 페이지 "정부 공식 통계" 섹션 — officialStats 있는 직업(52종)만 렌더.
// 워크넷(한국고용정보원) 재직자 조사 등 정부·공공기관 출처의 중위·사분위 연봉을
// 본 DB 추정치와 병기해 권위 신호를 만든다. 데이터: jobsData.ts officialStats.
import { ExternalLink, Landmark } from "lucide-react";
import type { JobOfficialStats as OfficialStats } from "@/data/jobsData";

interface Props {
  jobName: string;
  /** 본 DB의 전체 평균(만원) — 공식 통계와의 관계 설명에 사용 */
  dbOverallManwon: number;
  stats: OfficialStats;
}

const fmt = (n: number) => n.toLocaleString("ko-KR");

export default function JobOfficialStats({ jobName, dbOverallManwon, stats }: Props) {
  const { medianAnnualManwon: median, lowerQuartileManwon: low, upperQuartileManwon: high } = stats;
  const hasRange = low !== undefined && high !== undefined && high > low;
  // 범위 바에서 중위값 마커 위치(%)
  const medianPct = hasRange
    ? Math.min(97, Math.max(3, Math.round(((median - low!) / (high! - low!)) * 100)))
    : 50;
  const gapPct = Math.round(((median - dbOverallManwon) / dbOverallManwon) * 100);

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          정부 공식 통계로 보는 {jobName} 연봉
        </h2>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
        {stats.source} ({stats.year}년 기준)
        {stats.classification ? ` · 통계상 직종명: ${stats.classification}` : ""}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-4 sm:order-2 text-center">
          <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">중위 연봉 (상위 50%)</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{fmt(median)}만원</div>
        </div>
        {low !== undefined && (
          <div className="rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700 p-4 sm:order-1 text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">하위 25%</div>
            <div className="text-xl font-bold text-gray-700 dark:text-gray-200 mt-1">{fmt(low)}만원</div>
          </div>
        )}
        {high !== undefined && (
          <div className="rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700 p-4 sm:order-3 text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">상위 25%</div>
            <div className="text-xl font-bold text-gray-700 dark:text-gray-200 mt-1">{fmt(high)}만원</div>
          </div>
        )}
      </div>

      {hasRange && (
        <div className="mb-5">
          <div className="relative w-full h-2.5 rounded-full bg-gradient-to-r from-gray-200 via-emerald-200 to-emerald-400 dark:from-gray-600 dark:via-emerald-800 dark:to-emerald-500">
            <div
              className="absolute -top-1 w-1.5 h-4.5 rounded bg-emerald-700 dark:bg-emerald-300"
              style={{ left: `${medianPct}%`, height: "1.15rem" }}
              aria-hidden
            />
          </div>
          <div className="flex justify-between text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">
            <span>하위 25% {fmt(low!)}만</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">중위 {fmt(median)}만</span>
            <span>상위 25% {fmt(high!)}만</span>
          </div>
        </div>
      )}

      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        정부 조사 기준 중위 연봉은 본 페이지의 DB 평균({fmt(dbOverallManwon)}만원)
        {gapPct === 0 ? "과 같은 수준" : gapPct > 0 ? `보다 약 ${gapPct}% 높은 수준` : `보다 약 ${Math.abs(gapPct)}% 낮은 수준`}
        입니다. 조사 표본·시점·수당 포함 범위가 달라 차이가 날 수 있으니 두 수치를 함께 참고하세요.
        {stats.avgAnnualManwon ? ` 별도 조사의 평균 연봉은 ${fmt(stats.avgAnnualManwon)}만원입니다.` : ""}
      </p>

      {stats.note && (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 leading-relaxed">※ {stats.note}</p>
      )}

      {stats.sourceUrl && (
        <a
          href={stats.sourceUrl}
          target="_blank"
          rel="nofollow noopener"
          className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300 underline underline-offset-2 hover:opacity-80"
        >
          출처 원문 보기 <ExternalLink className="w-3 h-3" aria-hidden />
        </a>
      )}
    </section>
  );
}
