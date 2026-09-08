import { describe, expect, it } from "vitest";
import { formatGuideDate, getGuideModifiedDate } from "@/lib/guideDates";
import { buildCompanyMetadata, buildGuideMetadata } from "@/lib/seo";
import { guides } from "@/lib/guidesContent";

describe("가이드 발행·수정 날짜", () => {
  it("수정일이 없는 과거 글은 실행일과 관계없이 원래 발행일을 유지한다", () => {
    expect(getGuideModifiedDate({ publishedDate: "2026-08-15" })).toBe("2026-08-15");
    expect(formatGuideDate("2026-09-09")).toBe("2026.09.09");
    expect(formatGuideDate("2026-09-09", "en")).toBe("9/9/2026");
  });

  it("Article OG는 원발행일과 실제 수정일을 각각 제공한다", () => {
    const guide = { slug: "example", title: "Example", description: "Example", publishedDate: "2026-05-23", modifiedDate: "2026-09-09" };
    expect(buildGuideMetadata(guide).openGraph).toMatchObject({
      type: "article", publishedTime: "2026-05-23T00:00:00.000Z", modifiedTime: "2026-09-09T00:00:00.000Z",
    });
    expect(buildGuideMetadata({ ...guide, modifiedDate: undefined }).openGraph).toMatchObject({
      publishedTime: "2026-05-23T00:00:00.000Z", modifiedTime: "2026-05-23T00:00:00.000Z",
    });
  });

  it("정본의 날짜는 실재 달력 날짜이며 수정일이 발행일보다 이르지 않다", () => {
    for (const guide of guides) {
      const modified = guide.modifiedDate ?? guide.publishedDate;
      for (const date of [guide.publishedDate, modified]) {
        expect(date, guide.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(new Date(date).toISOString().slice(0, 10), guide.slug).toBe(date);
      }
      expect(modified >= guide.publishedDate, guide.slug).toBe(true);
    }
  });
});

describe("회사 연봉 설명의 추정치 표시", () => {
  it.each([
    { id: "example", name: "예시 회사" },
    { id: "example", name: "예시 회사", averageSalary: 50_000_000, seniorSalary: 80_000_000 },
    { id: "example", name: "예시 회사", averageSalary: 50_000_000, seniorSalary: 80_000_000, juniorSalary: 60_000_000, leadSalary: 100_000_000, hasCareerLevels: true },
  ])("회사 메타 분기 모두 자체 추정을 표시한다: %j", (company) => {
    const metadata = buildCompanyMetadata(company);
    expect(metadata.description).toContain("자체 추정치");
    expect(metadata.description).not.toContain("공식 직급");
    if ("hasCareerLevels" in company) expect(metadata.description).toContain("직급(CL)별 추정 연봉표");
  });
});
