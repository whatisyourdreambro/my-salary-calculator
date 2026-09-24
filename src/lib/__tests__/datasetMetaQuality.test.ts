// src/lib/__tests__/datasetMetaQuality.test.ts
//
// Dataset JSON-LD 품질 가드 (2026-09-25):
//  - META-11: lite(/salary-db/listed/[stockCode]) description 은 회사 고유 수치로 80자 이상,
//    소방·경찰 봉급표 description 은 Google Dataset 최소 50자 이상.
//  - A23(PROD-14): 회사 페이지·실수령액 표 Dataset 은 인용 정책 URL 을 license 로 싣는다.
//    DART 원자료 파생 lite·랭킹 Dataset 에는 license 를 넣지 않는다(META-11 범위 밖).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { listedCohort, listedDatasetDescription } from "@/lib/salary-data/dartLite";
import { CITATION_POLICY_URL } from "@/lib/citationPolicy";
import { CITATION_POLICY_URL as INSIGHTS_POLICY_URL } from "@/app/insights/_lib/reportDatasetMeta";

const APP = join(__dirname, "..", "..", "app");
const read = (rel: string) => readFileSync(join(APP, rel), "utf8");

/** datasetLd({ ... }) 블록 안의 description 문자열 리터럴 */
function datasetDescription(src: string): string {
  const block = src.slice(src.indexOf("datasetLd({"));
  const m = block.match(/description:\s*"([^"]+)"/);
  if (!m) throw new Error("datasetLd description 리터럴을 찾지 못함");
  return m[1];
}

describe("Dataset description 길이 (META-11)", () => {
  it("lite 코호트 전 회사 description 이 80자 이상이고 회사명·수치를 담는다", () => {
    expect(listedCohort.length).toBeGreaterThan(150);
    for (const c of listedCohort) {
      const d = listedDatasetDescription(c);
      expect(d.length).toBeGreaterThanOrEqual(80);
      expect(d).toContain(c.nameKo);
      expect(d).toContain(`직원 ${c.employeeCount.toLocaleString("ko-KR")}명`);
      // 산정 기준 명시 — DART 1인평균급여액 필드명으로 부르지 않는다(COMP-04)
      expect(d).toContain("급여총액÷직원 수");
      expect(d).not.toContain("1인 평균 급여액");
    }
  });

  it.each(["firefighter-pay-2026/page.tsx", "police-pay-2026/page.tsx"])(
    "%s description 이 50자 이상",
    (file) => {
      expect(datasetDescription(read(file)).length).toBeGreaterThanOrEqual(50);
    }
  );
});

describe("Dataset license (A23)", () => {
  it("정본 상수가 /insights 인용 정책 URL 과 같다", () => {
    expect(CITATION_POLICY_URL).toBe("https://www.moneysalary.com/insights#citation-policy");
    expect(INSIGHTS_POLICY_URL).toBe(CITATION_POLICY_URL);
  });

  const licensed = [
    "salary-db/[id]/page.tsx",
    ...["2026", "2027"].flatMap((y) =>
      ["annual", "hourly", "monthly", "weekly"].map((k) => `table/${y}/${k}/page.tsx`)
    ),
  ];
  it.each(licensed)("%s Dataset 에 license: CITATION_POLICY_URL", (file) => {
    const src = read(file);
    const block = src.slice(src.indexOf("datasetLd({"));
    expect(block.slice(0, block.indexOf("})"))).toContain("license: CITATION_POLICY_URL");
    expect(src).toContain('from "@/lib/citationPolicy"');
  });

  it.each([
    "salary-db/listed/[stockCode]/page.tsx",
    "salary-db/listed/MetricRankingView.tsx",
    "salary-db/listed/industry/[industryId]/page.tsx",
  ])("%s (DART 원자료 파생) 에는 license 를 넣지 않는다", (file) => {
    expect(read(file)).not.toMatch(/license:/);
  });
});
