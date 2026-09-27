// R6-06 (2026-09-27) — /job/[slug] 직업별 SEO 메타 교체 맵(jobSeoOverrides) 가드.
//
// 1) 맵에 없는 직업(지금은 62개 전부)의 generateMetadata 는 종전 템플릿 출력과 deep-equal.
// 2) 픽스처 교체(교수 후보 제목)를 주입하면 title·og:title·twitter:title 이 같은 값이고,
//    길이는 템플릿 이하, 나머지 메타(canonical·keywords·robots)는 그대로.
// 3) 실제 맵 가드: t0 는 2026-10-30 이상(professor·doctor 9/25 변경 + 35일 창),
//    길이 ≤ 템플릿, 금액은 jobsData 값만, 실재 직업 id 만.
// 4) 맵은 generateMetadata 에서만 읽는다 — H1·본문 무접촉.
import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: () => { throw new Error("not found"); },
  permanentRedirect: () => { throw new Error("redirect"); },
}));
vi.mock("@/components/AppLink", () => ({ default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) }));
vi.mock("@/components/AdPlacement", () => ({ CalcResultAd: () => null, GuideMidAd: () => null, HomeTopAd: () => null, InArticleAd: () => null, MultiplexAd: () => null }));
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));
vi.mock("@/components/ShareSection", () => ({ default: () => null }));
vi.mock("@/components/JobOfficialStats", () => ({ default: () => null }));

import type { Metadata } from "next";
import { jobsData, getJobById, type JobProfile } from "@/data/jobsData";
import { buildPageMetadata } from "@/lib/seo";
import { formatManwonKorean } from "@/lib/manwonFormat";
import {
  JOB_SEO_EARLIEST_T0,
  JOB_SEO_OVERRIDES,
  resolveJobMeta,
  type JobSeoOverride,
} from "@/lib/jobSeoOverrides";
import { generateMetadata, generateStaticParams } from "@/app/job/[slug]/page";

const SITE_NAME = "머니샐러리";
type OverrideMap = Readonly<Record<string, JobSeoOverride>>;

// 종전(adb120cc) page.tsx generateMetadata 의 문자열 — 같은 포매터(formatManwonKorean)로 계산
const templateTitle = (job: JobProfile) =>
  `${job.name} 연봉 2026 — 평균 ${formatManwonKorean(job.salary.overall)}·경력별 급여 비교`;
const templateDescription = (job: JobProfile) =>
  `${job.name} 연봉 참고 자료: 평균 ${formatManwonKorean(job.salary.overall)}, 신입 ${formatManwonKorean(job.salary.entry.avg)}, 3~5년 ${formatManwonKorean(job.salary.junior.avg)}, 10년 이상 ${formatManwonKorean(job.salary.senior.avg)}. 자료 기준과 경력별 차이를 확인하고 개인 조건으로 실수령액을 계산하세요.`;
const metadataWith = (job: JobProfile, title: string, description: string): Metadata =>
  buildPageMetadata({
    title,
    description,
    path: `/job/${job.id}`,
    keywords: [
      ...job.keywords,
      `${job.name} 연봉`,
      `${job.name} 월급`,
      `${job.name} 초봉`,
      `${job.name} 신입 연봉`,
      `${job.name} 실수령액`,
    ],
  });
const templateMetadata = (job: JobProfile) => metadataWith(job, templateTitle(job), templateDescription(job));

const absTitle = (meta: Metadata) => (meta.title as { absolute: string }).absolute;

// 금액 표기(억·만원) 토큰 — "8,500만원", "1억 1,000만원", "2억원", "2,345.6만원"
const MONEY_TOKEN = /\d+억(?: [\d,]+(?:\.\d+)?만)?원|[\d,]+(?:\.\d+)?만원/g;
function jobFigures(job: JobProfile): Set<string> {
  const s = job.salary;
  const values = [
    s.overall,
    s.entry.min, s.entry.max, s.entry.avg,
    s.junior.min, s.junior.max, s.junior.avg,
    s.senior.min, s.senior.max, s.senior.avg,
  ];
  const o = job.officialStats;
  if (o) {
    for (const v of [o.medianAnnualManwon, o.lowerQuartileManwon, o.upperQuartileManwon, o.avgAnnualManwon]) {
      if (typeof v === "number") values.push(v);
    }
  }
  return new Set(values.map(formatManwonKorean));
}

/** 헤더 주석 규칙 1~5 위반 목록 (빈 배열 = 통과) */
function overrideViolations(map: OverrideMap): string[] {
  const out: string[] = [];
  for (const [id, o] of Object.entries(map)) {
    const job = getJobById(id);
    if (!job) { out.push(`${id}: jobsData 에 없는 직업 id`); continue; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(o.t0)) out.push(`${id}: t0 형식(YYYY-MM-DD) 아님 '${o.t0}'`);
    else if (o.t0 < JOB_SEO_EARLIEST_T0) out.push(`${id}: t0 ${o.t0} < ${JOB_SEO_EARLIEST_T0} (35일 창)`);
    if (!o.title.trim() || !o.description.trim()) out.push(`${id}: 빈 title/description`);
    if (o.title.includes(SITE_NAME)) out.push(`${id}: title 에 사이트명 — buildPageMetadata 가 붙인다`);
    if (o.title.length > templateTitle(job).length) out.push(`${id}: title ${o.title.length}자 > 템플릿 ${templateTitle(job).length}자`);
    if (o.description.length > templateDescription(job).length) {
      out.push(`${id}: description ${o.description.length}자 > 템플릿 ${templateDescription(job).length}자`);
    }
    const figures = jobFigures(job);
    for (const token of `${o.title}\n${o.description}`.match(MONEY_TOKEN) ?? []) {
      if (!figures.has(token)) out.push(`${id}: jobsData 에 없는 금액 '${token}'`);
    }
  }
  return out;
}

// 11/2 후보(10/30 읽기에서 CTR < 6.0% 일 때만 실제 맵에 넣는다) — 테스트 전용 픽스처
const PROFESSOR_FIXTURE: OverrideMap = {
  professor: {
    title: "교수 연봉 2026 — 대학교수 평균 8,500만원·직급별 비교",
    description:
      "대학교수 연봉 참고 자료: 평균 8,500만원, 조교수 6,500만원, 부교수 8,000만원, 정교수 1억 1,000만원. 자료 기준과 직급별 차이를 확인하고 개인 조건으로 실수령액을 계산하세요.",
    t0: "2026-11-02",
  },
};

describe("jobSeoOverrides — 빈 맵(휴면)은 템플릿 그대로", () => {
  it("generateStaticParams 는 jobsData 62개 직업 전부", async () => {
    const params = await generateStaticParams();
    expect(jobsData.length).toBe(62);
    expect(params.map((p) => p.slug)).toEqual(jobsData.map((j) => j.id));
  });

  it("맵에 없는 직업(지금은 62개 전부)의 generateMetadata 는 종전 템플릿 출력과 deep-equal", async () => {
    let untouched = 0;
    for (const job of jobsData) {
      const meta = await generateMetadata({ params: { slug: job.id } });
      const o = JOB_SEO_OVERRIDES[job.id];
      if (o) {
        expect(meta, job.id).toEqual(metadataWith(job, o.title, o.description));
      } else {
        expect(meta, job.id).toEqual(templateMetadata(job));
        untouched++;
      }
    }
    expect(untouched).toBe(jobsData.length - Object.keys(JOB_SEO_OVERRIDES).length);
  });

  it("resolveJobMeta: 항목 없으면 base 객체 그대로, 있으면 title·description 만", () => {
    const base = { title: "t", description: "d" };
    expect(resolveJobMeta("professor", base, {})).toBe(base);
    expect(resolveJobMeta("no-such-job", base)).toBe(base);
    // 프로토타입 키에 반응하지 않는다
    expect(resolveJobMeta("toString", base, {})).toBe(base);
    expect(resolveJobMeta("professor", base, PROFESSOR_FIXTURE)).toEqual({
      title: PROFESSOR_FIXTURE.professor.title,
      description: PROFESSOR_FIXTURE.professor.description,
    });
  });
});

describe("jobSeoOverrides — 픽스처 교체 주입(교수 후보)", () => {
  afterEach(() => {
    vi.doUnmock("@/lib/jobSeoOverrides");
    vi.resetModules();
  });

  it("title·og:title·twitter:title 이 같고, 길이는 템플릿 이하, 나머지 메타는 그대로", async () => {
    vi.resetModules();
    vi.doMock("@/lib/jobSeoOverrides", async (importOriginal) => {
      const actual = await importOriginal<typeof import("@/lib/jobSeoOverrides")>();
      return {
        ...actual,
        JOB_SEO_OVERRIDES: PROFESSOR_FIXTURE,
        resolveJobMeta: (id: string, base: { title: string; description: string }) =>
          actual.resolveJobMeta(id, base, PROFESSOR_FIXTURE),
      };
    });
    const page = await import("@/app/job/[slug]/page");

    const professor = getJobById("professor")!;
    const fx = PROFESSOR_FIXTURE.professor;
    expect(fx.title.length).toBe(35);
    expect(fx.title.length).toBe(templateTitle(professor).length);
    expect(fx.description.length).toBeLessThanOrEqual(templateDescription(professor).length);

    const meta = await page.generateMetadata({ params: { slug: "professor" } });
    const full = `${fx.title} | ${SITE_NAME}`;
    expect(absTitle(meta)).toBe(full);
    expect(meta.openGraph?.title).toBe(absTitle(meta));
    expect((meta.twitter as { title?: string })?.title).toBe(absTitle(meta));
    expect(meta.description).toBe(fx.description);
    expect(meta.openGraph?.description).toBe(fx.description);
    expect(absTitle(meta).length).toBeLessThanOrEqual(absTitle(templateMetadata(professor)).length);
    expect(meta).toEqual(metadataWith(professor, fx.title, fx.description));

    const base = templateMetadata(professor);
    expect(meta.alternates).toEqual(base.alternates);
    expect(meta.keywords).toEqual(base.keywords);
    expect(meta.robots).toEqual(base.robots);

    // 다른 직업은 템플릿 그대로
    for (const id of ["doctor", "nurse", "elementary-teacher"]) {
      const job = getJobById(id)!;
      expect(await page.generateMetadata({ params: { slug: id } }), id).toEqual(templateMetadata(job));
    }
  });

  it("픽스처는 실제 맵과 같은 가드를 통과한다 (11/2 추가 시 그대로 쓸 수 있는 형태)", () => {
    expect(overrideViolations(PROFESSOR_FIXTURE)).toEqual([]);
  });
});

describe("jobSeoOverrides — 실제 맵 가드", () => {
  it("JOB_SEO_EARLIEST_T0 는 2026-10-30 (professor·doctor 9/25 변경 c32af11f + 35일 창)", () => {
    expect(JOB_SEO_EARLIEST_T0).toBe("2026-10-30");
  });

  it("맵이 비어 있지 않으면 모든 항목의 t0 는 2026-10-30 이상", () => {
    const early = Object.entries(JOB_SEO_OVERRIDES)
      .filter(([, o]) => !(o.t0 >= JOB_SEO_EARLIEST_T0))
      .map(([id, o]) => `${id}:${o.t0}`);
    expect(early).toEqual([]);
  });

  it("실제 맵 항목은 규칙(실재 id·t0·길이·사이트명·jobsData 금액)을 전부 지킨다", () => {
    expect(overrideViolations(JOB_SEO_OVERRIDES)).toEqual([]);
  });

  it("가드는 위반을 실제로 잡는다 (이른 t0·긴 제목·출처 없는 금액·없는 id)", () => {
    const bad: OverrideMap = {
      professor: { ...PROFESSOR_FIXTURE.professor, t0: "2026-10-29" },
      doctor: {
        title: "의사 연봉 2026 — 평균 2억 5,000만원·전문의 개원의 봉직의 경력별 급여 총정리",
        description: "의사 연봉 참고 자료.",
        t0: "2026-11-02",
      },
      "no-such-job": { title: "x", description: "y", t0: "2026-11-02" },
    };
    const v = overrideViolations(bad);
    expect(v.some((s) => s.startsWith("professor: t0 2026-10-29"))).toBe(true);
    expect(v.some((s) => s.startsWith("doctor: title"))).toBe(true);
    expect(v.some((s) => s.includes("'2억 5,000만원'"))).toBe(true);
    expect(v.some((s) => s.startsWith("no-such-job:"))).toBe(true);
  });

  it("맵은 generateMetadata 에서만 읽는다 — H1·본문(JobPage)은 무접촉", () => {
    const src = readFileSync(path.join(process.cwd(), "src/app/job/[slug]/page.tsx"), "utf8");
    const calls = src.split("resolveJobMeta(").length - 1;
    expect(calls).toBe(1);
    const callAt = src.indexOf("resolveJobMeta(");
    expect(callAt).toBeGreaterThan(src.indexOf("export async function generateMetadata"));
    expect(callAt).toBeLessThan(src.indexOf("export default function JobPage"));
    expect(src).not.toMatch(/JOB_SEO_OVERRIDES/);
  });
});
