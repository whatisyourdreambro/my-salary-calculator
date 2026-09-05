// /insights 리포트 원본 데이터 라우트(data.csv·data.json) 회귀 테스트 (2026-09-05)
//
// 검증 축:
// 1. GET 핸들러 응답 — 200·Content-Type·Cache-Control public, CSV 는 BOM 으로 시작.
// 2. 헤더 행 — grade/source 열(§2-5 데이터 추정 금지), bonus 의 status, listed 의 rceptNo,
//    entry 의 estimateIncluded(추정 표기 없는 raw 표 내보내기 금지) 가 반드시 존재.
// 3. 행 수 — CSV 데이터 행 수 == JSON rowCount == 빌더 행 수 (본문 표와 같은 단일 소스).
// 4. JSON 봉투 — license 가 사이트 인용 정책 URL, temporalCoverage·citation 채움.
// 5. middleware matcher — 데이터 경로가 제외돼 curl UA 도 통과.

import { describe, expect, it } from "vitest";
import { GET as listedCsv } from "@/app/insights/listed-avg-salary-top100-2026/data.csv/route";
import { GET as listedJson } from "@/app/insights/listed-avg-salary-top100-2026/data.json/route";
import { GET as bonusCsv } from "@/app/insights/bonus-payout-history-2026/data.csv/route";
import { GET as bonusJson } from "@/app/insights/bonus-payout-history-2026/data.json/route";
import { GET as entryCsv } from "@/app/insights/entry-salary-by-industry-2026/data.csv/route";
import { GET as entryJson } from "@/app/insights/entry-salary-by-industry-2026/data.json/route";
import {
  CSV_BOM,
  buildListedRows,
  buildBonusRows,
  buildEntryRows,
  payoutStatus,
  toCsv,
} from "@/app/insights/_lib/reportDatasets";
import {
  CITATION_POLICY_URL,
  REPORT_DATASETS,
  temporalCoverageOfYears,
} from "@/app/insights/_lib/reportDatasetMeta";
import { reportsRegistry } from "@/data/reportsRegistry";
import { config as middlewareConfig } from "@/middleware";

type Handler = () => Promise<Response>;

const CASES: Array<{
  slug: string;
  csv: Handler;
  json: Handler;
  rows: () => unknown[];
  requiredColumns: string[];
}> = [
  {
    slug: "listed-avg-salary-top100-2026",
    csv: listedCsv,
    json: listedJson,
    rows: buildListedRows,
    requiredColumns: ["rank", "company", "avgSalaryManwon", "grade", "source", "rceptNo", "dartUrl"],
  },
  {
    slug: "bonus-payout-history-2026",
    csv: bonusCsv,
    json: bonusJson,
    rows: buildBonusRows,
    requiredColumns: ["company", "year", "basis", "value", "status", "grade", "source", "note"],
  },
  {
    slug: "entry-salary-by-industry-2026",
    csv: entryCsv,
    json: entryJson,
    rows: buildEntryRows,
    requiredColumns: ["rank", "industry", "avgEntryManwon", "grade", "estimateIncluded", "source"],
  },
];

/** CSV 첫 줄(헤더) — 열 이름에 쉼표·따옴표 없음이 전제 */
const headerOf = (csv: string) => csv.replace(CSV_BOM, "").split("\r\n")[0].split(",");
const dataLineCount = (csv: string) =>
  csv.replace(CSV_BOM, "").split("\r\n").filter((l) => l.length > 0).length - 1;

describe("insights 데이터 라우트 — CSV", () => {
  for (const c of CASES) {
    it(`${c.slug}/data.csv — 200·BOM·헤더 열·행 수`, async () => {
      const res = await c.csv();
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toBe("text/csv; charset=utf-8");
      expect(res.headers.get("cache-control")).toMatch(/^public, max-age=\d+/);
      // Response.text() 의 UTF-8 디코더는 선행 BOM 을 제거하므로 바이트로 검사한다 (EF BB BF)
      const bytes = new Uint8Array(await res.arrayBuffer());
      expect(bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf).toBe(true);
      const body = CSV_BOM + new TextDecoder("utf-8").decode(bytes);
      const header = headerOf(body);
      for (const col of c.requiredColumns) expect(header).toContain(col);
      expect(dataLineCount(body)).toBe(c.rows().length);
      expect(c.rows().length).toBeGreaterThan(0);
    });
  }
});

describe("insights 데이터 라우트 — JSON 봉투", () => {
  for (const c of CASES) {
    it(`${c.slug}/data.json — license·temporalCoverage·citation·rowCount`, async () => {
      const res = await c.json();
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toBe("application/json; charset=utf-8");
      const data = await res.json();
      expect(data.license).toBe(CITATION_POLICY_URL);
      expect(data.temporalCoverage).toMatch(/^\d{4}(\/\d{4})?$/);
      expect(data.citation.url).toMatch(/^https:\/\/dart\.fss\.or\.kr/);
      expect(data.csvUrl).toBe(`https://www.moneysalary.com/insights/${c.slug}/data.csv`);
      expect(data.rowCount).toBe(c.rows().length);
      expect(data.rows).toHaveLength(data.rowCount);
      // 열 설명은 실제 행의 키와 1:1
      expect(Object.keys(data.columns).sort()).toEqual(Object.keys(data.rows[0]).sort());
    });
  }
});

describe("행 내용 — 추정 금지 규칙 표기", () => {
  it("listed: 전 행 grade=공시, 1위 행에 DART rceptNo·URL 채움", () => {
    const rows = buildListedRows();
    expect(rows.every((r) => r.grade === "공시")).toBe(true);
    expect(rows[0].rank).toBe(1);
    expect(rows[0].rceptNo).toMatch(/^\d{14}$/);
    expect(rows[0].dartUrl).toContain(rows[0].rceptNo);
  });

  it("bonus: basis 는 셋 중 하나이고 value 와 일치, status 는 note·값에서 파생", () => {
    const rows = buildBonusRows();
    for (const r of rows) {
      expect(["percentOfBase", "percentOfSalary", "fixedAmountManwon"]).toContain(r.basis);
      expect(r[r.basis]).toBe(r.value);
      expect(["paid", "tentative", "not_paid"]).toContain(r.status);
    }
    expect(payoutStatus({ year: 2024, scheme: "PS", percentOfBase: 0, source: "x" })).toBe("not_paid");
    expect(
      payoutStatus({ year: 2025, scheme: "x", fixedAmountManwon: 100, note: "2025 잠정합의 — 정액", source: "x" })
    ).toBe("tentative");
    expect(
      payoutStatus({ year: 2025, scheme: "x", percentOfBase: 350, note: "2025 잠정합의 (실제 지급)", source: "x" })
    ).toBe("paid");
    // SK하이닉스 2026 신체계 부결은 2025 실적분 행 note 에 실려야 한다 (별도 행 없음)
    expect(rows.some((r) => r.calcSlug === "sk-hynix-bonus" || /SK하이닉스/.test(r.company))).toBe(true);
    expect(rows.some((r) => /부결/.test(r.note))).toBe(true);
  });

  it("entry: 전 행 estimateIncluded=true·grade=추정 (raw 추정표 내보내기 금지)", () => {
    const rows = buildEntryRows();
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.estimateIncluded === true && r.grade === "추정")).toBe(true);
    expect(rows.every((r) => r.note.includes("추정치 포함"))).toBe(true);
    // 순위는 평균 내림차순
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].avgEntryManwon).toBeGreaterThanOrEqual(rows[i].avgEntryManwon);
    }
  });
});

describe("메타 정합", () => {
  it("REPORT_DATASETS 슬러그는 reportsRegistry 에 전부 존재", () => {
    const registered = new Set(reportsRegistry.map((r) => r.slug));
    for (const d of REPORT_DATASETS) expect(registered.has(d.slug)).toBe(true);
    expect(REPORT_DATASETS).toHaveLength(3);
  });

  it("toCsv — 쉼표·따옴표·줄바꿈 셀 이스케이프, BOM·CRLF", () => {
    const csv = toCsv(["a", "b"], [["x,y", 'he said "hi"'], [null, "line\nbreak"]]);
    expect(csv).toBe(`${CSV_BOM}a,b\r\n"x,y","he said ""hi"""\r\n,"line\nbreak"\r\n`);
  });

  it("temporalCoverageOfYears — 단일/구간", () => {
    expect(temporalCoverageOfYears([2025])).toBe("2025");
    expect(temporalCoverageOfYears([2024, 2026, 2023])).toBe("2023/2026");
  });

  it("middleware matcher — 데이터 경로 제외 (curl UA 403 방지), 리포트 HTML 은 여전히 매칭", () => {
    const pattern = middlewareConfig.matcher[0];
    // Next 가 matcher 를 컴파일하는 방식과 동일: /(<regex>) 를 정규식으로
    const re = new RegExp(`^${pattern.replace(/\\\./g, ".")}$`);
    for (const d of REPORT_DATASETS) {
      expect(re.test(`/insights/${d.slug}/data.csv`)).toBe(false);
      expect(re.test(`/insights/${d.slug}/data.json`)).toBe(false);
      expect(re.test(`/insights/${d.slug}`)).toBe(true);
    }
    expect(re.test("/rss.xml")).toBe(false);
    expect(re.test("/salary-db/samsung-electronics")).toBe(true);
  });
});
