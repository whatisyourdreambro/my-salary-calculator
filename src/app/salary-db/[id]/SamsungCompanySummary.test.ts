import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { dartCompanyStatsById } from "@/lib/salary-data/dartReport";
import CompanyDisclosedSalary from "@/components/CompanyDisclosedSalary";
import SamsungCompanySummary, { SamsungSectionAnchor } from "./SamsungCompanySummary";

vi.mock("next/navigation", () => ({ usePathname: () => "/salary-db/samsung-electronics" }));

const samsung = companyRepository.getById("samsung-electronics")!;
const dartSalaryManwon = dartCompanyStatsById.get(samsung.id)?.dartSalaryManwon ?? null;

describe("삼성 회사 페이지의 연봉 기준 요약", () => {
  it("기존 공시 연도·출처와 DB 신입 추정을 구별해 서버 HTML에 제공한다", () => {
    const html = renderToStaticMarkup(createElement(SamsungCompanySummary, { company: samsung, dartSalaryManwon }));
    expect(html).toContain("공시 기준 직원 평균");
    expect(html).toContain(`${samsung.disclosed!.fiscalYear} 사업연도`);
    expect(html).toContain(`${samsung.disclosed!.avgSalaryManwon.toLocaleString("ko-KR")}만원`);
    expect(html).toContain("본 DB 신입 총연봉 추정 · 세전");
    expect(html).toContain(`${((samsung.salary.entry.base + (samsung.salary.entry.incentive.avgAmount || 0)) / 10000).toLocaleString("ko-KR")}만원`);
    expect(html).toContain("CL 표는 보도·공개 자료와 성과급 가정을 반영한 별도 기준");
    const escapedSource = renderToStaticMarkup(createElement("span", null, samsung.disclosed!.source)).slice(6, -7);
    expect(html).toContain(escapedSource);
    expect(html).toContain(`href="${samsung.disclosed!.sourceUrl}"`);
    expect(html).toContain('href="/calc/samsung-bonus"');
    expect(html.indexOf('href="/calc/samsung-bonus"')).toBeLessThan(html.indexOf('href="#samsung-salary-table"'));
  });

  it("기존 공시 카드가 병기하는 DART 괴리를 상단에서도 숨기지 않는다", () => {
    const html = renderToStaticMarkup(createElement(SamsungCompanySummary, { company: samsung, dartSalaryManwon }));
    const card = renderToStaticMarkup(createElement(CompanyDisclosedSalary, { company: samsung, dartSalaryManwon }));
    expect(card.includes("DART 급여총액÷인원 산정치")).toBe(html.includes("DART 급여총액÷인원 산정치"));
    if (card.includes("DART 급여총액÷인원 산정치")) {
      expect(html).toContain(`${dartSalaryManwon!.toLocaleString("ko-KR")}만원`);
    }
  });

  it("공시·CL 자료가 없을 때 수치나 존재하지 않는 도착점을 만들지 않는다", () => {
    const html = renderToStaticMarkup(createElement(SamsungCompanySummary, {
      company: { ...samsung, disclosed: undefined, careerLevels: undefined }, dartSalaryManwon: null,
    }));
    expect(html).toContain("본 DB 신입 총연봉 추정");
    expect(html).not.toContain("공시 기준 직원 평균");
    expect(html).not.toContain('href="#samsung-disclosed-salary"');
    expect(html).not.toContain('href="#samsung-career-levels"');
    expect(html).not.toContain("공시 인용 출처 열기");
  });

  it("DART 산정값 차이가 5%를 넘는 경우에만 차이를 병기한다", () => {
    const near = renderToStaticMarkup(createElement(SamsungCompanySummary, {
      company: samsung, dartSalaryManwon: samsung.disclosed!.avgSalaryManwon * 1.04,
    }));
    const far = renderToStaticMarkup(createElement(SamsungCompanySummary, {
      company: samsung, dartSalaryManwon: 20000,
    }));
    expect(near).not.toContain("DART 급여총액÷인원 산정치");
    expect(far).toContain("DART 급여총액÷인원 산정치는 20,000만원");
  });

  it("다른 회사에는 요약이나 앵커 wrapper DOM을 추가하지 않는다", () => {
    const other = { ...samsung, id: "sk-hynix" };
    expect(renderToStaticMarkup(createElement(SamsungCompanySummary, { company: other, dartSalaryManwon }))).toBe("");
    const child = createElement("section", { className: "existing-layout" }, "기존 표");
    expect(renderToStaticMarkup(createElement(SamsungSectionAnchor, {
      companyId: other.id, id: "samsung-salary-table",
    }, child))).toBe(renderToStaticMarkup(child));
  });

  it("삼성 바로가기 도착점은 키보드 포커스와 헤더 여백을 제공한다", () => {
    for (const id of ["samsung-salary-table", "samsung-career-levels", "samsung-disclosed-salary"]) {
      const html = renderToStaticMarkup(createElement(SamsungSectionAnchor, {
        companyId: samsung.id, id,
      }, createElement("section", null, "기존 자료")));
      expect(html).toContain(`id="${id}" tabindex="-1" class="scroll-mt-28"`);
      expect(html).toContain("<section>기존 자료</section>");
    }
  });
});
