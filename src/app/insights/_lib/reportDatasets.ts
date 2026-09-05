// src/app/insights/_lib/reportDatasets.ts
//
// /insights 리포트 3편의 원본 데이터 직렬화 (CSV·JSON) — 서버 전용.
// ★dartDisclosed(1.3MB)·companyRepository 를 import 하므로 클라이언트 컴포넌트에서
//   절대 import 금지 (route.ts·테스트 전용).
//
// 원칙 (불변 규칙 §2-5 데이터 추정 금지):
// - 모든 행에 grade(공시·보도·추정)·source 열을 넣는다. 추정치가 섞인 리포트 1호
//   (업종별 초봉)는 estimateIncluded=true 를 행마다 명시 — 인용 역풍 방지.
// - 성과급은 status(paid·tentative·not_paid)를 note·값에서 파생해 병기하고 note 원문도 그대로 싣는다.
// - DART 공시 행은 rceptNo·dartUrl 로 원문 추적 가능하게 한다.
// - 숫자는 리포트 본문과 같은 단위(만원) — 본문과 다운로드 값이 어긋나지 않도록
//   같은 단일 소스(dartReport·bonusData·entrySalaryReport)에서만 파생한다.

import { dartTop100, dartReportStats } from "@/lib/salary-data/dartReport";
import { listedCohortStockCodes } from "@/lib/salary-data/dartLite";
import { dartDisclosed } from "@/data/dart/dartDisclosed";
import { BONUS_PROFILES, type BonusPayout } from "@/data/bonusData";
import {
  entryReportRows,
  entryReportCompanyCount,
  ENTRY_REPORT_MIN_COMPANIES,
} from "@/lib/salary-data/entrySalaryReport";
import { getIndustryMeta } from "@/lib/salary-data/industryTaxonomy";
import { getReportBySlug } from "@/data/reportsRegistry";
import {
  CITATION_POLICY_URL,
  DART_CITATION,
  reportDataUrls,
  temporalCoverageOfYears,
} from "./reportDatasetMeta";

const SITE_URL = "https://www.moneysalary.com";

// ── CSV 직렬화 ────────────────────────────────────────────────
/** UTF-8 BOM — 엑셀이 한글을 깨뜨리지 않도록 (rss 와 달리 CSV 는 BOM 필수) */
export const CSV_BOM = "\uFEFF";

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = typeof v === "boolean" ? (v ? "true" : "false") : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** 헤더 + 행 → BOM 포함 CSV 문자열 (CRLF — 엑셀·윈도 호환) */
export function toCsv(header: string[], rows: unknown[][]): string {
  const lines = [header, ...rows].map((r) => r.map(csvCell).join(","));
  return CSV_BOM + lines.join("\r\n") + "\r\n";
}

// ── 공통 JSON 봉투 ────────────────────────────────────────────
interface DatasetEnvelope<Row> {
  name: string;
  description: string;
  url: string;
  license: string;
  /** 출처 표기 조건 안내 (기계 판독용 라이선스 대신 사이트 정책) */
  licenseNote: string;
  temporalCoverage: string;
  datePublished: string;
  dateModified: string;
  citation: typeof DART_CITATION;
  csvUrl: string;
  /** 열 설명 — 단위·등급 기준 */
  columns: Record<string, string>;
  rowCount: number;
  rows: Row[];
}

function envelope<Row>(
  slug: string,
  temporalCoverage: string,
  columns: Record<string, string>,
  rows: Row[]
): DatasetEnvelope<Row> {
  const report = getReportBySlug(slug);
  if (!report) throw new Error(`reportsRegistry 에 없는 슬러그: ${slug}`);
  return {
    name: report.title,
    description: report.description,
    url: `${SITE_URL}/insights/${slug}`,
    license: CITATION_POLICY_URL,
    licenseNote: "출처를 '머니샐러리'로 표기(온라인은 리포트 링크 포함 권장)하면 자유롭게 인용·재가공할 수 있습니다.",
    temporalCoverage,
    datePublished: report.publishedDate,
    dateModified: report.updatedDate,
    citation: DART_CITATION,
    csvUrl: reportDataUrls(slug).csv,
    columns,
    rowCount: rows.length,
    rows,
  };
}

// ── 1) 공시 평균연봉 TOP 100 ───────────────────────────────────
export interface ListedDatasetRow {
  rank: number;
  company: string;
  stockCode: string;
  corpCode: string;
  fiscalYear: string;
  avgSalaryManwon: number;
  employeeCount: number;
  avgTenureYears: number | null;
  industry: string;
  listed: boolean;
  grade: "공시";
  source: string;
  rceptNo: string;
  dartUrl: string;
  pageUrl: string;
}

const LISTED_COLUMNS: Record<string, string> = {
  rank: "평균연봉 순위 (직전 사업연도 단일 기준)",
  company: "회사명 (DART 법인명)",
  stockCode: "종목코드 (비상장은 빈칸)",
  corpCode: "DART 고유번호",
  fiscalYear: "사업연도",
  avgSalaryManwon: "직원 1인 평균 급여액 (만원, 급여총액÷인원, 등기임원 제외)",
  employeeCount: "직원 수 (명)",
  avgTenureYears: "평균 근속연수 (년, 공시 시만)",
  industry: "머니샐러리 표준 업종",
  listed: "상장 여부",
  grade: "데이터 등급 — 공시 (추정치 0)",
  source: "출처",
  rceptNo: "DART 접수번호",
  dartUrl: "DART 공시 원문 URL",
  pageUrl: "머니샐러리 회사 페이지 (있을 때만)",
};

/** corpCode → 랭킹 연도 공시 접수번호 (dartTop100 행에는 rceptNo 가 없어 여기서 역매핑) */
const rceptNoByCorp = new Map<string, string>();
for (const d of dartDisclosed) {
  if (d.fiscalYear === dartReportStats.rankYear && !rceptNoByCorp.has(d.corpCode)) {
    rceptNoByCorp.set(d.corpCode, d.rceptNo);
  }
}

export function buildListedRows(): ListedDatasetRow[] {
  return dartTop100.map((r) => {
    const rceptNo = rceptNoByCorp.get(r.corpCode) ?? "";
    const pagePath = r.companyId
      ? `/salary-db/${r.companyId}`
      : listedCohortStockCodes.has(r.stockCode)
        ? `/salary-db/listed/${r.stockCode}`
        : "";
    return {
      rank: r.rank,
      company: r.nameKo,
      stockCode: r.stockCode,
      corpCode: r.corpCode,
      fiscalYear: dartReportStats.rankYear,
      avgSalaryManwon: r.avgSalaryManwon,
      employeeCount: r.employeeCount,
      avgTenureYears: r.avgTenureYears ?? null,
      industry: r.industryKo,
      listed: r.listed,
      grade: "공시",
      source: `DART 사업보고서 '직원 등의 현황' (${dartReportStats.rankYear} 사업연도, 수집 ${dartReportStats.dataDate})`,
      rceptNo,
      dartUrl: rceptNo ? `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${rceptNo}` : "",
      pageUrl: pagePath ? `${SITE_URL}${pagePath}` : "",
    };
  });
}

export const LISTED_TEMPORAL_COVERAGE = dartReportStats.rankYear;

export function buildListedJson() {
  return envelope("listed-avg-salary-top100-2026", LISTED_TEMPORAL_COVERAGE, LISTED_COLUMNS, buildListedRows());
}

export function buildListedCsv(): string {
  const header = Object.keys(LISTED_COLUMNS);
  return toCsv(
    header,
    buildListedRows().map((r) => header.map((k) => r[k as keyof ListedDatasetRow]))
  );
}

// ── 2) 성과급 실지급률 ─────────────────────────────────────────
export type BonusPayoutStatus = "paid" | "tentative" | "not_paid";

/**
 * 지급 상태 파생 — bonusData 에는 status 필드가 없고(실지급·타결 확정치만 전사)
 * note 문구가 정본이라 여기서만 판정한다. 부결(SK 2026 신체계)은 별도 행이 아니라
 * 2025 실적분 행의 note 에 서술돼 있으므로 note 원문을 함께 싣는다.
 */
export function payoutStatus(p: BonusPayout): BonusPayoutStatus {
  const value = p.percentOfBase ?? p.percentOfSalary ?? p.fixedAmountManwon ?? 0;
  const note = p.note ?? "";
  if (value === 0 || /미지급/.test(note)) return "not_paid";
  if (/잠정합의/.test(note) && !/실제 지급|가결|타결|지급 확정/.test(note)) return "tentative";
  return "paid";
}

export interface BonusDatasetRow {
  company: string;
  companyId: string;
  calcSlug: string;
  calcUrl: string;
  year: number;
  scheme: string;
  division: string;
  basis: "percentOfBase" | "percentOfSalary" | "fixedAmountManwon";
  value: number;
  percentOfBase: number | null;
  percentOfSalary: number | null;
  fixedAmountManwon: number | null;
  status: BonusPayoutStatus;
  grade: "공시" | "보도";
  source: string;
  note: string;
}

const BONUS_COLUMNS: Record<string, string> = {
  company: "회사명",
  companyId: "머니샐러리 회사 id (없으면 빈칸)",
  calcSlug: "성과급 계산기 슬러그 (/calc/<slug>)",
  calcUrl: "성과급 계산기 URL",
  year: "지급 연도 (실적 연도가 다르면 note 참조)",
  scheme: "제도명 (TAI·OPI·PS·경영성과급 등 원본 명칭)",
  division: "사업부 (있을 때만)",
  basis: "지급 기준 — percentOfBase(월 기본급 대비 %)·percentOfSalary(연봉 대비 %)·fixedAmountManwon(정액 만원) 중 하나. ★기준이 다른 행끼리 순위 비교 금지",
  value: "basis 기준 값",
  percentOfBase: "월 기본급 대비 % (해당 시)",
  percentOfSalary: "연봉 대비 % (해당 시)",
  fixedAmountManwon: "정액 (만원, 해당 시)",
  status: "지급 상태 — paid(실지급·타결 확정)·tentative(잠정합의)·not_paid(미지급)",
  grade: "데이터 등급 — 공시(사업보고서 확인) 또는 보도(복수 매체 교차 확인)",
  source: "출처 (매체·공시)",
  note: "특이사항 원문 (실적 귀속 연도·부결·재협상 등)",
};

export function buildBonusRows(): BonusDatasetRow[] {
  const rows: BonusDatasetRow[] = [];
  for (const p of BONUS_PROFILES) {
    for (const pay of p.payouts) {
      const basis: BonusDatasetRow["basis"] =
        pay.percentOfBase != null
          ? "percentOfBase"
          : pay.percentOfSalary != null
            ? "percentOfSalary"
            : "fixedAmountManwon";
      rows.push({
        company: p.nameKo,
        companyId: p.companyId ?? "",
        calcSlug: p.calcSlug,
        calcUrl: `${SITE_URL}/calc/${p.calcSlug}`,
        year: pay.year,
        scheme: pay.scheme,
        division: pay.division ?? "",
        basis,
        value: pay[basis] ?? 0,
        percentOfBase: pay.percentOfBase ?? null,
        percentOfSalary: pay.percentOfSalary ?? null,
        fixedAmountManwon: pay.fixedAmountManwon ?? null,
        status: payoutStatus(pay),
        grade: /사업보고서|공시/.test(pay.source) ? "공시" : "보도",
        source: pay.source,
        note: pay.note ?? "",
      });
    }
  }
  // 리포트 본문과 같은 정렬 — 최신 연도 → 회사명
  return rows.sort((a, b) => b.year - a.year || a.company.localeCompare(b.company, "ko"));
}

/** 지급 연도 범위 — ISO 8601 구간 표기 ("2023/2026") */
export const BONUS_TEMPORAL_COVERAGE = temporalCoverageOfYears(
  BONUS_PROFILES.flatMap((p) => p.payouts.map((pay) => pay.year))
);

export function buildBonusJson() {
  return envelope("bonus-payout-history-2026", BONUS_TEMPORAL_COVERAGE, BONUS_COLUMNS, buildBonusRows());
}

export function buildBonusCsv(): string {
  const header = Object.keys(BONUS_COLUMNS);
  return toCsv(
    header,
    buildBonusRows().map((r) => header.map((k) => r[k as keyof BonusDatasetRow]))
  );
}

// ── 3) 업종별 신입 초봉 (추정 포함 — 투명 혼합형) ────────────────
export interface EntryDatasetRow {
  rank: number;
  industryId: string;
  industry: string;
  companyCount: number;
  avgEntryManwon: number;
  medianEntryManwon: number;
  topCompany: string;
  topCompanyEntryManwon: number | null;
  topCompanyUrl: string;
  grade: "추정";
  estimateIncluded: true;
  source: string;
  note: string;
}

const ENTRY_NOTE =
  "자체 연봉 DB(채용공고·사업보고서·종사자 후기) 집계 — 개별 회사 수치에 추정치 포함. 각 기업 공식 발표 자료가 아니며, 검증 가능한 공시·정부 통계는 리포트 본문 교차 검증 섹션에 별도 병기";

const ENTRY_COLUMNS: Record<string, string> = {
  rank: "신입 초봉 순위 (업종 평균 내림차순)",
  industryId: "머니샐러리 표준 업종 id",
  industry: "업종명",
  companyCount: `집계 회사 수 (${ENTRY_REPORT_MIN_COMPANIES}개사 이상만 순위화)`,
  avgEntryManwon: "신입 초봉 평균 (만원, 기본급+평균 인센티브)",
  medianEntryManwon: "신입 초봉 중앙값 (만원)",
  topCompany: "업종 내 초봉 1위 회사",
  topCompanyEntryManwon: "초봉 1위 회사 신입 초봉 (만원)",
  topCompanyUrl: "초봉 1위 회사 페이지",
  grade: "데이터 등급 — 추정 (자체 DB 집계, 추정치 포함)",
  estimateIncluded: "추정치 포함 여부 — 항상 true. 공식 발표치가 아님",
  source: "출처",
  note: "집계 한계 안내",
};

const toManwon = (won: number) => Math.round(won / 10000);

export function buildEntryRows(): EntryDatasetRow[] {
  return entryReportRows.map((x, i) => {
    const top = x.agg.topPayer;
    const topRow = top ? x.agg.rows.find((r) => r.company.id === top.id) : undefined;
    return {
      rank: i + 1,
      industryId: x.id,
      industry: getIndustryMeta(x.id).ko,
      companyCount: x.agg.count,
      avgEntryManwon: toManwon(x.agg.avgEntry),
      medianEntryManwon: toManwon(x.agg.medianEntry),
      topCompany: top ? top.name.ko : "",
      topCompanyEntryManwon: topRow ? toManwon(topRow.entryTotal) : null,
      topCompanyUrl: top ? `${SITE_URL}/salary-db/${top.id}` : "",
      grade: "추정",
      estimateIncluded: true,
      source: `머니샐러리 자체 연봉 DB (국내 ${entryReportCompanyCount}개사, 추정치 포함)`,
      note: ENTRY_NOTE,
    };
  });
}

export const ENTRY_TEMPORAL_COVERAGE = "2026";

export function buildEntryJson() {
  return envelope("entry-salary-by-industry-2026", ENTRY_TEMPORAL_COVERAGE, ENTRY_COLUMNS, buildEntryRows());
}

export function buildEntryCsv(): string {
  const header = Object.keys(ENTRY_COLUMNS);
  return toCsv(
    header,
    buildEntryRows().map((r) => header.map((k) => r[k as keyof EntryDatasetRow]))
  );
}

// ── 응답 헬퍼 (route.ts 3×2 공용) ─────────────────────────────
/** 공개 캐시 — 정적 데이터(빌드 시 확정)라 브라우저 1시간·CDN 1일 (rss-companies 와 동일) */
const CACHE_CONTROL = "public, max-age=3600, s-maxage=86400";

export function csvResponse(body: string, filename: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": CACHE_CONTROL,
    },
  });
}

export function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data, null, 1), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": CACHE_CONTROL,
    },
  });
}
