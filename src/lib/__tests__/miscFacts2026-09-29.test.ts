// 기타 페이지 사실·정합성 정정 고정 (SEO 신선도 정비 2026-09-29, MI 계열)
//
//  - MI-21 /en/help 방법 검토일 = 실제 방법 정정일(a465c0a, 2026-09-25)
//  - MI-22 /qna 상세 BreadcrumbList 잎 이름 = 화면 빵부스러기(질문 전체, 30자 절단 금지)
//  - MI-23 /tools·/tools/life 근무일수 계산기 설명 = 공휴일 제외 기능 반영(같은 2음절 교체)
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(p, "utf8");

describe("MI-21·MI-22·MI-23", () => {
  it("/en/help 방법 검토일은 25 September 2026", () => {
    const src = read("src/app/en/help/page.tsx");
    expect(src).toContain("Method review: 25 September 2026.");
    expect(src).not.toContain("Method review: 9 September");
  });

  it("/qna 상세 BreadcrumbList 잎 이름은 질문 전체", () => {
    const src = read("src/app/qna/[slug]/page.tsx");
    expect(src).toContain("autoBreadcrumbLd(`/qna/${slug}`, { leafName: item.question })");
    expect(src).not.toContain("item.question.slice(0, 30)");
  });

  it("근무일수 계산기 설명은 휴일 제외", () => {
    for (const p of ["src/app/tools/page.tsx", "src/app/tools/life/page.tsx"]) {
      const src = read(p);
      expect(src, p).toContain('desc: "휴일 제외 영업일 계산"');
      expect(src, p).not.toContain("주말 제외 영업일 계산");
    }
  });
});
