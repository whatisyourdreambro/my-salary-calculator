// /calc/[slug] SEO 텍스트·정밀 계산기 링크 회귀 게이트 (2026-09-11)
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { allCalculators } from "@/lib/simpleCalculators";
import { calculatorSeoDescription, calculatorSeoTitle, SEO_DESCRIPTION_MAX, SEO_DESCRIPTION_MIN } from "@/lib/simpleCalculators/seoText";
import { PRECISION_TWINS } from "@/lib/simpleCalculators/twins";

describe("calculator SEO title/description", () => {
  it("every title carries a calculator term and stays under 60 chars", () => {
    for (const calc of allCalculators) {
      const title = calculatorSeoTitle(calc);
      expect(title, calc.slug).toMatch(/(계산기|시뮬레이터|시뮬레이션|변환기|환산기|비교기|테스트|판정|체크리스트)/);
      expect(title.length, `${calc.slug}: ${title}`).toBeLessThanOrEqual(60);
      expect(title).not.toMatch(/계산기 계산기|계산 계산기/);
    }
  });

  it("tax/salary/insurance titles carry the year once", () => {
    for (const calc of allCalculators) {
      const title = calculatorSeoTitle(calc);
      const years = (title.match(/20\d\d/g) ?? []).length;
      if (["tax", "salary", "insurance"].includes(calc.category)) expect(years, calc.slug).toBe(1);
      else expect(years, calc.slug).toBeLessThanOrEqual(1);
    }
  });

  it("every description lands in the 60~160 char snippet window", () => {
    for (const calc of allCalculators) {
      const d = calculatorSeoDescription(calc);
      expect(d.length, `${calc.slug}: ${d}`).toBeGreaterThanOrEqual(SEO_DESCRIPTION_MIN);
      expect(d.length, `${calc.slug}: ${d}`).toBeLessThanOrEqual(SEO_DESCRIPTION_MAX);
      expect(d).not.toMatch(/\s{2,}/);
    }
  });
});

describe("precision twins", () => {
  const appDir = path.resolve(process.cwd(), "src/app");
  it("map only registry slugs to existing routes", () => {
    const slugs = new Set(allCalculators.map((c) => c.slug));
    for (const [slug, twin] of Object.entries(PRECISION_TWINS)) {
      expect(slugs.has(slug), `unknown slug ${slug}`).toBe(true);
      expect(twin.href, slug).not.toBe(`/calc/${slug}`);
      const page = path.join(appDir, twin.href.replace(/^\//, ""), "page.tsx");
      expect(existsSync(page), `${slug} → ${twin.href} has no page.tsx`).toBe(true);
    }
  });

  it("client resolver module stays free of data imports", () => {
    const src = readFileSync(path.resolve(process.cwd(), "src/lib/companyJobsResolve.ts"), "utf8");
    expect(src).not.toMatch(/from\s+["']@\/data\//);
    const client = readFileSync(path.resolve(process.cwd(), "src/components/CompanyRelatedJobs.tsx"), "utf8");
    expect(client).toMatch(/companyJobsResolve/);
    expect(client).not.toMatch(/from\s+["']@\/lib\/companyJobsMap["']/);
  });
});
