import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  permanentRedirect: () => { throw new Error("redirect"); },
}));
vi.mock("@/components/AppLink", () => ({ default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) }));
vi.mock("@/components/AdPlacement", () => ({ CalcResultAd: () => null, GuideMidAd: () => null, HomeTopAd: () => null, InArticleAd: () => null, MultiplexAd: () => null }));
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));
vi.mock("@/components/ShareSection", () => ({ default: () => null }));

import JobOfficialStats from "@/components/JobOfficialStats";
import JobPage from "@/app/job/[slug]/page";
import { getJobById } from "@/data/jobsData";
import { getRegionById } from "@/data/regionsData";

function schemas(html: string): Array<Record<string, unknown>> {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
}

describe("공식 연봉 자료의 통계 종류", () => {
  it("9급 초임 연 보수를 중위 연봉이나 경력자 평균과의 퍼센트 비교로 표시하지 않는다", () => {
    const job = getJobById("civil-servant-9")!;
    const html = renderToStaticMarkup(createElement(JobOfficialStats, { jobName: job.name, dbOverallManwon: job.salary.overall, stats: job.officialStats! }));
    expect(job.officialStats!.medianAnnualManwon).toBe(3428);
    expect(html).toContain("초임(1호봉) 연 보수");
    expect(html).toContain("3,428만원");
    expect(html).toContain("전체 경력자의 중위 연봉이 아닙니다");
    expect(html).not.toContain("중위 연봉 (상위 50%)");
    expect(html).not.toMatch(/약 \d+% (높은|낮은) 수준/);
  });

  it("9급 페이지의 초임 보수를 Occupation의 median으로 방출하지 않는다", () => {
    const html = renderToStaticMarkup(createElement(JobPage, { params: { slug: "civil-servant-9" } }));
    expect(html).toContain("3,428만원");
    expect(schemas(html).some((schema) => schema["@type"] === "Occupation")).toBe(false);
    expect(schemas(html).some((schema) => schema["@type"] === "FAQPage")).toBe(true);
  });

  it("실제 중위 조사 자료의 카드와 Occupation 중위 금액은 유지한다", () => {
    const html = renderToStaticMarkup(createElement(JobPage, { params: { slug: "nurse" } }));
    expect(html).toContain("중위 연봉 (상위 50%)");
    const occupation = schemas(html).find((schema) => schema["@type"] === "Occupation");
    expect(occupation).toBeDefined();
    const salary = occupation!.estimatedSalary as Array<{ median: number }>;
    expect(salary[0].median).toBe(45000000);
  });

  it("충남 FAQ는 더 높은 세종 참고값이 있는 DB에서 충청권 최고라고 단정하지 않는다", () => {
    const chungnam = getRegionById("chungnam")!;
    const sejong = getRegionById("sejong")!;
    expect(chungnam.salary.overall).toBe(3700);
    expect(sejong.salary.overall).toBe(4300);
    expect(chungnam.faqs[0].a).not.toContain("충청권 중 가장 높");
    expect(chungnam.faqs[0].a).toContain("머니샐러리 DB");
  });
});
