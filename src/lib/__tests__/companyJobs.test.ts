// 회사→직업 연봉 내부링크 블록(google-clusters-2) 회귀 테스트
// 1) 배치 게이트: CompanyRelatedJobs 는 salary-db/layout.tsx 에서 PageFooterAds 뒤에만,
//    page.tsx 두 곳에는 부재(광고 위 UI 삽입 금지 2026-08-16 규칙)
// 2) 클라 번들 안전: 컴포넌트가 dartLite/dartDisclosed 를 import 하지 않음
// 3) 직렬화 크기: props 맵 JSON 25KB 미만
// 4) 매핑 정합: 직업 slug 전부 jobsData 존재, 허브당 최대 4건, pathname 해석
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { buildCompanyJobsMap, resolveHub, COMPANY_JOBS_LIMIT } from "@/lib/companyJobsMap";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { listedCohort } from "@/lib/salary-data/dartLite";
import { getJobById } from "@/data/jobsData";
import { industriesData } from "@/data/industriesData";

const ROOT = path.resolve(__dirname, "../../..");
const read = (p: string) => readFileSync(path.join(ROOT, p), "utf8");

describe("CompanyRelatedJobs 배치 게이트 (광고 아래)", () => {
  it("salary-db/layout.tsx 에서 PageFooterAds 뒤에 렌더된다", () => {
    const src = read("src/app/salary-db/layout.tsx");
    const adIdx = src.indexOf("<PageFooterAds");
    const jobsIdx = src.indexOf("<CompanyRelatedJobs");
    expect(adIdx).toBeGreaterThan(-1);
    expect(jobsIdx).toBeGreaterThan(adIdx);
    // 광고 유닛 다음 줄들에 다른 광고가 끼어들지 않았는지(순서 유지)
    expect(src.lastIndexOf("<PageFooterAds")).toBe(adIdx);
  });

  it("page.tsx 두 곳(회사·상장 lite)에는 부재", () => {
    for (const p of [
      "src/app/salary-db/[id]/page.tsx",
      "src/app/salary-db/listed/[stockCode]/page.tsx",
    ]) {
      expect(read(p)).not.toContain("CompanyRelatedJobs");
    }
  });

  it("클라 컴포넌트·순수 맵 모듈은 dartLite/dartDisclosed/CompanyRepository 를 import 하지 않는다", () => {
    const comp = read("src/components/CompanyRelatedJobs.tsx");
    expect(comp.startsWith('"use client"')).toBe(true);
    expect(comp).toContain('data-msy-module="job-related"');
    // 컴포넌트가 companyJobsMap 을 런타임 import 하므로 두 파일 모두 서버 전용 모듈 비참조여야 한다
    const SERVER_ONLY = [
      /from\s+["']@\/lib\/salary-data\/dartLite["']/,
      /from\s+["']@\/data\/dart\/dartDisclosed["']/,
      /from\s+["']@\/lib\/salary-data\/CompanyRepository["']/,
      /from\s+["']@\/data\/companies(\/index)?["']/,
    ];
    for (const src of [comp, read("src/lib/companyJobsMap.ts")]) {
      for (const re of SERVER_ONLY) expect(src).not.toMatch(re);
    }
    // 서버 입력(dartLite)은 layout(서버 컴포넌트)에서만 주입
    const layout = read("src/app/salary-db/layout.tsx");
    expect(layout).toMatch(/buildCompanyJobsMap\(companyRepository\.getAll\(\),\s*listedCohort\)/);
  });
});

describe("companyJobsMap", () => {
  // layout 과 동일 입력 — 실제 props 크기를 측정
  const map = buildCompanyJobsMap(companyRepository.getAll(), listedCohort);

  it("직렬화 크기 25KB 미만 (클라 props 예산)", () => {
    const bytes = Buffer.byteLength(JSON.stringify(map), "utf8");
    expect(bytes).toBeLessThan(25_000);
  });

  it("허브 직업 링크는 jobsData 실재 slug, 허브당 최대 4건, 허브 id 는 industriesData", () => {
    expect(map.length).toBeGreaterThan(0);
    for (const h of map) {
      expect(industriesData.some((p) => p.id === h.id)).toBe(true);
      expect(h.jobs.length).toBeGreaterThan(0);
      expect(h.jobs.length).toBeLessThanOrEqual(COMPANY_JOBS_LIMIT);
      for (const j of h.jobs) {
        const job = getJobById(j.slug);
        expect(job).toBeDefined();
        expect(j.name).toBe(job!.name);
        expect(j.avg).toBe(job!.salary.overall);
      }
    }
  });

  it("회사 id·종목코드는 허브 간 중복 없이 1곳에만 속한다", () => {
    const seenC = new Set<string>();
    const seenL = new Set<string>();
    for (const h of map) {
      for (const c of h.companies) {
        expect(seenC.has(c)).toBe(false);
        seenC.add(c);
      }
      for (const l of h.listed) {
        expect(seenL.has(l)).toBe(false);
        seenL.add(l);
      }
    }
    // 커버리지 하한 — 회사 정본 400+·상장 lite 100+ (매핑 회귀 감지)
    expect(seenC.size).toBeGreaterThan(400);
    expect(seenL.size).toBeGreaterThan(100);
  });

  it("pathname 해석: 회사·lite 만 매칭, 인덱스·ranking·compare·submit·listed 인덱스는 null", () => {
    expect(resolveHub("/salary-db/samsung-electronics", map)?.id).toBe("semiconductor");
    expect(resolveHub("/salary-db/naver/", map)?.id).toBe("it-software");
    const anyListed = map.find((h) => h.listed.length > 0)!;
    expect(resolveHub(`/salary-db/listed/${anyListed.listed[0]}`, map)?.id).toBe(anyListed.id);
    for (const p of [
      "/salary-db",
      "/salary-db/",
      "/salary-db/ranking",
      "/salary-db/compare/samsung-electronics-vs-sk-hynix",
      "/salary-db/submit",
      "/salary-db/listed",
      "/salary-db/listed/industry/semiconductor",
      "/salary-db/listed/top-raise",
      "/job/nurse",
      null,
    ]) {
      expect(resolveHub(p, map)).toBeNull();
    }
  });

  it("한글 슬러그는 인코딩된 pathname 도 매칭 (있는 경우)", () => {
    const ko = map.flatMap((h) => h.companies).find((id) => /[가-힣]/.test(id));
    if (!ko) return; // 한글 id 가 없으면 스킵
    expect(resolveHub(`/salary-db/${encodeURIComponent(ko)}`, map)).not.toBeNull();
  });
});
