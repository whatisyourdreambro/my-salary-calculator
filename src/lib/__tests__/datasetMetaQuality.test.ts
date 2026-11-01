// src/lib/__tests__/datasetMetaQuality.test.ts
//
// Dataset JSON-LD 품질 가드 (2026-09-25):
//  - META-11: lite(/salary-db/listed/[stockCode]) description 은 회사 고유 수치로 80자 이상,
//    상장사 지표·업종 랭킹 description 은 템플릿 고정 문구만으로 50자 이상,
//    소방·경찰 봉급표 description 은 Google Dataset 최소 50자 이상.
//  - A23(PROD-14): 회사 페이지·실수령액 표 Dataset 은 인용 정책 URL 을 license 로 싣는다.
//    DART 원자료 파생 lite·랭킹 Dataset 에는 license 를 넣지 않는다(META-11 범위 밖).
//  - G3(2026-11-01 운영자 승인 '구글 개선' 4번): 봉급표 5쪽 Dataset 도 같은 license(공무원보수규정 별표를 사이트가 정리한 표).
//    /calc/bonus-home-plan(한국부동산원 R-ONE 통계 — 제공 기관 이용 조건)은 lite·랭킹처럼 넣지 않는다(citationPolicy.ts).
import { readFileSync, readdirSync, statSync } from "node:fs";
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

  // 상장사 지표 랭킹 3종·업종 랭킹 28종 — 템플릿의 고정 문구만으로도 50자 이상이어야 한다
  // (보간 값 길이와 무관하게 하한 보장, 2026-09-25 리뷰 정정)
  it.each([
    "salary-db/listed/MetricRankingView.tsx",
    "salary-db/listed/industry/[industryId]/page.tsx",
  ])("%s description 템플릿 고정 문구가 50자 이상", (file) => {
    const src = read(file);
    const block = src.slice(src.indexOf("datasetLd({"));
    const m = block.match(/description:\s*`([^`]+)`/);
    expect(m, "datasetLd description 템플릿 리터럴").not.toBeNull();
    const staticText = m![1].replace(/\$\{[^}]*\}/g, "");
    expect(staticText.length).toBeGreaterThanOrEqual(50);
  });
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
    // G3 (2026-11-01) — 봉급표 5쪽
    ...["civil-servant", "police", "firefighter", "military", "teacher"].map((p) => `${p}-pay-2026/page.tsx`),
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
    // G3 (2026-11-01): 한국부동산원 R-ONE 통계 — citation 이 원 출처를 가리키고 사이트 정책을 license 로 붙이지 않는다
    "calc/bonus-home-plan/page.tsx",
  ])("%s (외부 기관 원자료 파생) 에는 license 를 넣지 않는다", (file) => {
    expect(read(file)).not.toMatch(/license:/);
  });

  it("사이트의 모든 datasetLd 호출은 license 를 싣거나 위 제외 목록에 있다 (새 Dataset 이 조용히 빠지지 않게, G3)", () => {
    const excluded = new Set([
      "salary-db/listed/[stockCode]/page.tsx",
      "salary-db/listed/MetricRankingView.tsx",
      "salary-db/listed/industry/[industryId]/page.tsx",
      "calc/bonus-home-plan/page.tsx",
    ]);
    const files: string[] = [];
    const walk = (dir: string, rel = "") => {
      for (const name of readdirSync(dir)) {
        const abs = join(dir, name);
        const r = rel ? `${rel}/${name}` : name;
        if (statSync(abs).isDirectory()) {
          if (name !== "__tests__") walk(abs, r);
        } else if (/\.tsx?$/.test(name) && !/\.test\./.test(name) && read(r).includes("datasetLd({")) files.push(r);
      }
    };
    walk(APP);
    expect(files.length).toBeGreaterThanOrEqual(20);
    for (const file of files) {
      const src = read(file);
      const blocks = src.split("datasetLd({").slice(1).map((rest) => rest.slice(0, rest.indexOf("})")));
      for (const block of blocks) {
        if (excluded.has(file)) expect(block, file).not.toMatch(/license:/);
        else expect(block, file).toMatch(/license: CITATION_POLICY_URL\b/);
      }
    }
  });
});
