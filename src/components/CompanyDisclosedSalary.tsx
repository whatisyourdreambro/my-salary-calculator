// src/components/CompanyDisclosedSalary.tsx
//
// 공시 기준 평균연봉 카드 (server component).
// company.disclosed 가 있는 회사만 렌더 — 금융감독원 전자공시(DART) 사업보고서·
// 공공기관 알리오 등 공식 공시(또는 이를 인용한 언론 보도)의 평균연봉을
// 본 DB 직급별 추정치와 분리해 "공식 수치"로 보여주는 권위 차별화 섹션.
// 수치·출처는 데이터 파일의 disclosed 필드에만 기재 — 이 컴포넌트에서
// 추정·가공 금지. 추정치와의 관계는 정직하게 설명한다.
// DART 자동 주입 블록은 disclosed.basis 로 산정 기준을 구분한다(A19, 2026-09-25):
// "reported"(회사 공시 1인평균 기준)만 '공식 수치', "computed"(급여총액÷인원)는 산정치 라벨.

import { ShieldCheck, ExternalLink, Trophy } from "lucide-react";
import type { CompanyProfile } from "@/types/company";
import { getCompanySalaryBasis } from "@/lib/companySalaryBasis";
import { isOfficialDisclosureUrl } from "@/lib/companyMetaDisclosed";
import { displayedDisclosedSource, isCompanyMetaDisclosedLive } from "@/lib/companyMetaGate";
import Link from "@/components/AppLink";

/** 만원 단위 → "1억 5,800만원" 한국식 표기 */
function formatManwon(manwon: number): string {
  const eok = Math.floor(manwon / 10000);
  const rest = manwon % 10000;
  if (eok > 0 && rest > 0)
    return `${eok}억 ${rest.toLocaleString("ko-KR")}만원`;
  if (eok > 0) return `${eok}억원`;
  return `${rest.toLocaleString("ko-KR")}만원`;
}

/** 근속연수 — 소수 1자리까지만 표시 (13.7 → "13.7", 15 → "15") */
function formatTenure(years: number): string {
  const rounded = Math.round(years * 10) / 10;
  return `${rounded}`;
}

type HistoryRow = { fiscalYear: string; avgSalaryManwonRaw: number; employeeCount: number };

/** DART 파생 통계 prop — 전부 연간 급여총액÷인원 산정치 기준 (dartReport.DartCompanyStats) */
type DartStatsProp = {
  /** 산정치(만원)·그 사업연도·직원 수 — reported 카드 이력 표 첫 행용 */
  dartSalaryManwon?: number;
  fiscalYear?: string;
  employeeCount?: number;
  yoyPct: number | null;
  prevSalaryManwon: number | null;
  listedRank: number | null;
  listedTotal: number;
  history?: HistoryRow[];
};

/** 과년도 이력 표 최대 행 수 */
const HISTORY_MAX_ROWS = 3;

/**
 * 이력 표 행. 회사 공시 1인평균 기준(basis "reported") 카드는 헤드라인과 산정 기준이 달라,
 * 전년 대비 배지(산정치 기준)가 가리키는 같은 사업연도 산정치를 표 첫 행에 올린다 — 배지의
 * 두 값이 모두 표에 보이고, 헤드라인과 5% 넘게 벌어진 카드에도 DART 산정치가 병기된다.
 * 행 수는 종전(과년도 이력 최대 3행)과 같게 자른다 — 광고 위 카드 높이 불변
 * (A19 리뷰 정정, 2026-09-25). 수기·computed 카드는 종전 그대로 과년도 이력만.
 */
export function disclosedHistoryRows(
  disclosed: { basis?: "reported" | "computed"; fiscalYear: string },
  dartStats: DartStatsProp | null | undefined,
): HistoryRow[] {
  const history = dartStats?.history ?? [];
  const rowCount = Math.min(history.length, HISTORY_MAX_ROWS);
  if (rowCount === 0) return [];
  if (
    disclosed.basis === "reported" &&
    dartStats?.dartSalaryManwon != null &&
    dartStats.employeeCount != null &&
    dartStats.fiscalYear === disclosed.fiscalYear &&
    !history.some((h) => h.fiscalYear === disclosed.fiscalYear)
  ) {
    const current: HistoryRow = {
      fiscalYear: disclosed.fiscalYear,
      avgSalaryManwonRaw: dartStats.dartSalaryManwon,
      employeeCount: dartStats.employeeCount,
    };
    return [current, ...history].slice(0, rowCount);
  }
  return history.slice(0, rowCount);
}

/**
 * 출처 줄 머리 라벨 (A4', 2026-09-25 L10' 동봉) — 출처가 공시 원문인지 언론 보도 인용인지 밝힌다.
 * L10' 과 같은 빌드 시점 게이트(COMPANY_META_DISCLOSED_DATE) 뒤에서만 쓴다 — 그 전 빌드는 종전 '출처:'
 * 와 종전 출처 문구 그대로(아래 컴포넌트). 순수 함수라 라벨 규칙 테스트는 날짜와 무관하다.
 * 이 카드는 GuideMidAd 위라 출처 줄이 종전('출처: ' + 출처 문구)보다 길어지면 안 된다:
 *  - DART 자동 주입 카드(basis 있음): '출처(공시 원문):' — 같은 게이트에서 표시만 빼는 꼬리
 *    (' — OpenDART 수집', companyMetaGate displayedDisclosedSource — 데이터 문구는 그대로)가 라벨보다
 *    길어 줄이 늘지 않는다
 *  - 수기 카드: 큐레이션 출처 문구는 줄일 수 없어 라벨을 '출처:'와 같은 두 글자로 —
 *    DART·알리오 원문 링크는 '원문:', 그 밖(언론 보도 인용)은 '보도:'
 *  - 링크 없음: 종전 '출처:' 그대로
 * 실측(2026-09-25, 사이트 CSS·서브셋 폰트, 뷰포트 320~1280px 1px 간격): 전 카드 높이 증가 0 —
 * 수기 카드는 전 폭 불변, 주입 카드는 430~554px 폭에서만 한 줄(16px) 줄고 나머지 폭 불변.
 */
export function disclosedSourceLabel(d: {
  basis?: "reported" | "computed";
  sourceUrl?: string;
}): string {
  if (!d.sourceUrl) return "출처:";
  const official = isOfficialDisclosureUrl(d.sourceUrl);
  if (d.basis && official) return "출처(공시 원문):";
  return official ? "원문:" : "보도:";
}

export default function CompanyDisclosedSalary({
  company,
  dartRank,
  dartStats,
  dartSalaryManwon,
  industryLink,
}: {
  company: CompanyProfile;
  /** DART 전수 랭킹 TOP 100 진입 시 순위 — 서버(page)에서 dartTop100 조회 후 전달.
   *  salaryManwon = 순위 산정 기준값(DART 급여총액÷인원 원값, 만원) — 배지에 인라인 병기 */
  dartRank?: { rank: number; companyCount: number; rankYear: string; salaryManwon: number } | null;
  /**
   * DART ETL 원값(급여총액÷인원, 만원) — 서버(page)에서 dartCompanyStatsById 조회 후 전달.
   * 카드 헤드라인(수기 disclosed 값)과 5% 넘게 다를 때만 기존 안내 문장 안에 인라인 병기
   * (새 문단·행 추가 금지 — 광고 위 높이 불변, data-trust-4 2026-09-05). 수치 변경 없음.
   */
  dartSalaryManwon?: number | null;
  /**
   * DART 파생 통계 (인상률 배지·3개년 미니 추이) — 서버(page)에서
   * dartCompanyStatsById 조회 후 전달. 수기 disclosed 와 괴리 10% 초과 시
   * page 에서 null 로 걸러 전달 (라벨 혼선 방지). 2026-08-30 증강 팩 ①.
   * 주입 카드(basis 있음)는 게이트 없이 전달 — reported 카드는 배지·순위에 산정치 기준 라벨을
   * 달고 같은 연도 산정치를 이력 표 첫 행에 올린다 (disclosedHistoryRows, 2026-09-25).
   */
  dartStats?: DartStatsProp | null;
  /**
   * 소속 업종 랭킹 도선 — R2 W1 (2026-08-31). 서버(page)에서
   * industryRankingByCompanyId 조회 후 전달 (랭킹 페이지 실재 업종만).
   */
  industryLink?: { industryId: string; industryKo: string } | null;
}) {
  const { disclosed: d, hasDartGap } = getCompanySalaryBasis(company, { dartSalaryManwon });
  if (!d) return null;

  const koName = company.name.ko;
  // 헤드라인 값과 DART 산정치 괴리 5% 초과 시만 인라인 병기 — 두 값을 투명 공개
  const dartGapClause =
    hasDartGap
      ? `(DART 급여총액÷인원 산정치 ${dartSalaryManwon!.toLocaleString("ko-KR")}만원)`
      : "";
  // 헤드라인이 회사 공시 1인평균 기준인 카드 — 배지·순위(산정치 기준)를 헤드라인에 잇지 않는다.
  // 라벨은 종전 문구보다 짧게: 배지 '(8,184만원 →)' 11자+ → '(급여총액÷인원)' 9자,
  // 순위 'DART 공시 기준' → '산정치 기준' (광고 위 줄바꿈 증가 없음, 2026-09-25 리뷰 정정)
  const reportedBasis = d.basis === "reported";
  const historyRows = disclosedHistoryRows(d, dartStats);
  // A4' 출처 줄 — L10' 과 같은 빌드 시점 게이트. 켜지기 전 빌드는 종전 '출처: ' + 종전 출처 문구 그대로
  // (서버 컴포넌트 정적 프리렌더라 호출 시각 = 빌드 시각)
  const a4Live = isCompanyMetaDisclosedLive();
  const sourceLabel = a4Live ? disclosedSourceLabel(d) : "출처:";
  const sourceText = displayedDisclosedSource(d.source, a4Live);

  return (
    <section data-msy-module="company-disclosed" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
      <div className="rounded-2xl border border-canvas-200 dark:border-canvas-800 bg-white dark:bg-canvas-900 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-black text-navy dark:text-canvas-50 mb-3">
          <ShieldCheck size={18} className="text-electric flex-shrink-0" />
          {/* '공식 수치'는 수기 큐레이션·회사 공시 1인평균 기준에만. 급여총액÷인원 자체 산정치는
              같은 길이 이하의 라벨로 (A19, 2026-09-25 — 광고 위 카드 높이 불변) */}
          {d.basis === "computed"
            ? `${koName} 공시 기준 평균연봉 — 급여총액÷인원 산정치`
            : `${koName} 공시 기준 평균연봉 — 추정이 아닌 공식 수치`}
        </h2>

        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-3">
          <p className="text-2xl sm:text-3xl font-black text-navy dark:text-canvas-50">
            {formatManwon(d.avgSalaryManwon)}
          </p>
          <p className="text-sm font-bold text-electric">
            사업연도 {d.fiscalYear} 기준
          </p>
          {d.avgTenureYears != null && (
            <p className="text-sm font-bold text-muted-blue dark:text-canvas-300">
              평균 근속 {formatTenure(d.avgTenureYears)}년
            </p>
          )}
        </div>

        <p className="text-sm leading-7 text-muted-blue dark:text-canvas-300 mb-3">
          {koName}의 공시 기준 평균연봉(사업연도 {d.fiscalYear})은{" "}
          {d.avgSalaryManwon.toLocaleString("ko-KR")}만원입니다. 금융감독원
          전자공시(DART) 사업보고서·공공기관 알리오 등 공식 공시(또는 이를
          인용한 언론 보도)에 기반한 값으로, 임원 제외 여부·성과급 포함 범위
          등 산정 기준은 출처에 따라 다를 수 있습니다{dartGapClause}. 위 직급별 연봉표는
          신입~임원 직급 구조로 나눈 머니샐러리 DB 추정치라, 전 직급·전
          연차를 한 번에 평균 낸 공시 수치와는 차이가 날 수 있습니다 — 두
          수치를 함께 보면 실제 수준을 더 정확히 가늠할 수 있습니다.
        </p>

        {d.note && (
          <p className="text-xs leading-6 text-muted-blue dark:text-canvas-300 mb-3">
            {d.note}
          </p>
        )}

        {dartStats && dartStats.yoyPct != null && (
          <p className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${
                dartStats.yoyPct >= 0
                  ? "bg-electric/10 text-electric"
                  : "bg-canvas-100 dark:bg-canvas-800 text-navy dark:text-canvas-100"
              }`}
            >
              전년 대비 {dartStats.yoyPct >= 0 ? `+${dartStats.yoyPct}` : dartStats.yoyPct}%
              {reportedBasis ? (
                <span className="font-medium opacity-80">(급여총액÷인원)</span>
              ) : (
                dartStats.prevSalaryManwon != null && (
                  <span className="font-medium opacity-80">
                    ({formatManwon(dartStats.prevSalaryManwon)} →)
                  </span>
                )
              )}
            </span>
            {dartStats.listedRank != null && (
              <span className="text-xs font-bold text-muted-blue dark:text-canvas-300">
                상장 {dartStats.listedTotal.toLocaleString("ko-KR")}곳 중{" "}
                {dartStats.listedRank.toLocaleString("ko-KR")}위 ·{" "}
                {reportedBasis ? "산정치 기준" : "DART 산정 기준"}
              </span>
            )}
          </p>
        )}

        {historyRows.length > 0 && (
          <div className="mb-3 overflow-x-auto">
            <table className="w-full max-w-md text-xs">
              <thead>
                <tr className="border-b border-canvas-200 dark:border-canvas-800 text-left text-faint-blue">
                  <th className="py-1.5 pr-3 font-bold">사업연도</th>
                  {/* 이력 값은 연도별 연간 급여총액÷인원 산정치 — 헤드라인(수기·공시 1인평균)과 기준 구분 (A19) */}
                  <th className="py-1.5 pr-3 font-bold">급여총액÷인원</th>
                  <th className="py-1.5 font-bold">직원 수</th>
                </tr>
              </thead>
              <tbody>
                {historyRows.map((h) => (
                  <tr key={h.fiscalYear} className="border-b border-canvas-100 dark:border-canvas-800/60">
                    <td className="py-1.5 pr-3 font-bold text-navy dark:text-canvas-50">{h.fiscalYear}</td>
                    <td className="py-1.5 pr-3 tabular-nums text-muted-blue dark:text-canvas-300">
                      {formatManwon(h.avgSalaryManwonRaw)}
                    </td>
                    <td className="py-1.5 tabular-nums text-muted-blue dark:text-canvas-300">
                      {h.employeeCount.toLocaleString("ko-KR")}명
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {dartRank && (
          <p className="mb-3">
            <Link
              href="/insights/listed-avg-salary-top100-2026"
              className="inline-flex items-center gap-1.5 rounded-full bg-electric/10 px-3 py-1.5 text-xs font-bold text-electric hover:bg-electric/20 transition-colors"
            >
              <Trophy size={13} className="flex-shrink-0" aria-hidden="true" />
              {dartRank.rankYear} 공시 평균연봉 — 상장사{" "}
              {dartRank.companyCount.toLocaleString("ko-KR")}곳 중{" "}
              <strong>{dartRank.rank}위</strong> · DART 산정{" "}
              {dartRank.salaryManwon.toLocaleString("ko-KR")}만원 기준 · TOP 100 리포트 보기 →
            </Link>
          </p>
        )}

        {/* 업종 랭킹 도선 — R2 W1 (2026-08-31): 최대 유입 페이지 → 랭킹 31종 */}
        {industryLink && (
          <p className="mb-3 flex flex-wrap gap-2">
            <Link
              href={`/salary-db/listed/industry/${industryLink.industryId}`}
              className="inline-flex items-center rounded-full border border-canvas-200 dark:border-canvas-700 px-3 py-1.5 text-xs font-bold text-navy dark:text-canvas-100 hover:border-electric hover:text-electric transition-colors"
            >
              {industryLink.industryKo} 상장사 연봉 순위 →
            </Link>
            <Link
              href="/salary-db/listed/top-raise"
              className="inline-flex items-center rounded-full border border-canvas-200 dark:border-canvas-700 px-3 py-1.5 text-xs font-bold text-navy dark:text-canvas-100 hover:border-electric hover:text-electric transition-colors"
            >
              연봉 인상률 TOP 100 →
            </Link>
          </p>
        )}

        <p className="text-xs text-muted-blue dark:text-canvas-300">
          {sourceLabel}{" "}
          {d.sourceUrl ? (
            <a
              href={d.sourceUrl}
              target="_blank"
              rel="nofollow noopener"
              className="underline underline-offset-2 hover:text-electric transition-colors inline-flex items-center gap-1"
            >
              {sourceText}
              <ExternalLink className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            </a>
          ) : (
            sourceText
          )}
        </p>
      </div>
    </section>
  );
}
