import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { allCompanies } from "@/data/companies";
import { dartInjection } from "@/data/dart/dartInjection";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { buildCompanySalaryFaq, getCompanySalaryBasis } from "@/lib/companySalaryBasis";
import { faqLd } from "@/lib/structuredData";
import CompanyFaq from "@/components/CompanyFaq";
import type { CompanyProfile } from "@/types/company";

const companies = companyRepository.getAll();
const samsung = companyRepository.getById("samsung-electronics")!;
const rawById = new Map(allCompanies.map((company) => [company.id, company]));

describe("회사 평균과 신입 연봉의 자료 기준", () => {
  it("삼성의 공시 평균 15,800만원과 신입 총연봉 추정 5,600만원을 구분한다", () => {
    const basis = getCompanySalaryBasis(samsung, { dartSalaryManwon: 20000 });
    expect(basis.entryBaseWon).toBe(48000000);
    expect(basis.entryIncentiveWon).toBe(8000000);
    expect(basis.entryTotalWon).toBe(56000000);
    expect(basis.disclosed?.avgSalaryManwon).toBe(15800);
    expect(basis.disclosed?.fiscalYear).toBe("2025");
    expect(basis.dartSalaryManwon).toBe(20000);
    expect(basis.hasDartGap).toBe(true);
    const [average, entry] = buildCompanySalaryFaq(samsung);
    expect(average.answer).toContain("2025 사업연도 15,800만원");
    expect(average.answer).not.toContain("5,600만원");
    expect(average.answer).toContain(samsung.disclosed!.source);
    expect(entry.answer).toContain("기본급 추정은 약 4,800만원");
    expect(entry.answer).toContain("세전 총연봉 추정은 약 5,600만원");
    expect(entry.answer).toContain("실제 첫해 금액은 달라집니다");
  });

  it("공시가 없으면 직원 전체 평균을 신입 값이나 DART 인자로 대신하지 않는다", () => {
    const company = { ...samsung, disclosed: undefined };
    const basis = getCompanySalaryBasis(company, { dartSalaryManwon: 20000 });
    expect(basis.disclosed).toBeUndefined();
    expect(basis.hasDartGap).toBe(false);
    const [average, entry] = buildCompanySalaryFaq(company);
    expect(average.answer).toContain("평균연봉 공시 자료는 없습니다");
    expect(average.answer).not.toContain("5,600만원");
    expect(average.answer).not.toContain("20,000만원");
    expect(entry.answer).toContain("5,600만원");
  });

  it("평균 인센티브가 없으면 원래 기본급만 사용하고 다른 보상 항목을 추가하지 않는다", () => {
    const company: CompanyProfile = {
      ...samsung,
      salary: {
        ...samsung.salary,
        entry: {
          ...samsung.salary.entry,
          incentive: { target: 25, max: 50 },
          stock: { type: "RSU", amount: 10000000, vesting: "4 years" },
          signOn: 5000000,
        },
      },
    };
    const before = JSON.stringify(company);
    expect(getCompanySalaryBasis(company).entryTotalWon).toBe(48000000);
    expect(buildCompanySalaryFaq(company)[1].answer).toContain("세전 총연봉 추정은 약 4,800만원");
    expect(JSON.stringify(company)).toBe(before);
  });

  it("원문 회계연도·주의사항·출처를 그대로 보존하고 없는 URL을 만들지 않는다", () => {
    const company = {
      ...samsung,
      disclosed: {
        avgSalaryManwon: 12345.6,
        fiscalYear: "2024/25 회계연도(2025년 5월 결산)",
        source: "기존 자료에 기록한 원문 출처",
        note: "급여총액÷인원 가중 평균, 등기임원 제외",
      },
    };
    const basis = getCompanySalaryBasis(company);
    expect(basis.disclosed).toBe(company.disclosed);
    expect(basis.disclosed?.sourceUrl).toBeUndefined();
    expect(basis.disclosed?.note).toBe(company.disclosed.note);
    const answer = buildCompanySalaryFaq(company)[0].answer;
    expect(answer).toContain(company.disclosed.fiscalYear);
    expect(answer).toContain("12,345.6만원");
    expect(answer).toContain(company.disclosed.source);
    expect(answer).not.toContain("https://");
  });

  it("공시와 DART 값의 차이는 기존 5% 초과 기준으로만 표시한다", () => {
    const company = { ...samsung, disclosed: { ...samsung.disclosed!, avgSalaryManwon: 10000 } };
    for (const dartSalaryManwon of [null, 9500, 10000, 10500]) {
      expect(getCompanySalaryBasis(company, { dartSalaryManwon }).hasDartGap).toBe(false);
    }
    for (const dartSalaryManwon of [9499, 10501]) {
      expect(getCompanySalaryBasis(company, { dartSalaryManwon }).hasDartGap).toBe(true);
    }
    expect(getCompanySalaryBasis({ ...company, disclosed: { ...company.disclosed, avgSalaryManwon: 0 } }, { dartSalaryManwon: 10000 }).hasDartGap).toBe(false);
  });

  it("전체 회사의 원 단위 추정치와 만원 단위 공시 원본을 변경하지 않는다", () => {
    expect(companies.length).toBeGreaterThan(0);
    const before = JSON.stringify(companies);
    for (const company of companies) {
      const basis = getCompanySalaryBasis(company);
      expect(basis.entryTotalWon, company.id).toBe(company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0));
      expect(basis.disclosed, company.id).toBe(company.disclosed);
      const [average, entry] = buildCompanySalaryFaq(company);
      if (company.disclosed) {
        expect(average.answer, company.id).toContain(`${company.disclosed.fiscalYear} 사업연도 ${company.disclosed.avgSalaryManwon.toLocaleString("ko-KR")}만원`);
        expect(average.answer, company.id).toContain(company.disclosed.source);
      } else {
        expect(average.answer, company.id).toContain("평균연봉 공시 자료는 없습니다");
      }
      expect(entry.answer, company.id).toContain(`${Math.round(basis.entryTotalWon / 10000).toLocaleString("ko-KR")}만원`);
    }
    expect(JSON.stringify(companies)).toBe(before);
  });

  it("수기 공시 우선순위와 DART 주입·공시 없음·글로벌 분기를 유지한다", () => {
    const manual = companies.filter((company) => rawById.get(company.id)?.disclosed);
    const injected = companies.filter((company) => !rawById.get(company.id)?.disclosed && dartInjection[company.id]);
    expect(manual.length).toBeGreaterThan(0);
    expect(injected.length).toBeGreaterThan(0);
    expect(companies.some((company) => !company.disclosed)).toBe(true);
    expect(companies.some((company) => company.isGlobal)).toBe(true);
    for (const company of manual) {
      expect(getCompanySalaryBasis(company).disclosed).toBe(rawById.get(company.id)!.disclosed);
    }
    for (const company of injected) {
      const disclosed = getCompanySalaryBasis(company).disclosed!;
      expect(disclosed.avgSalaryManwon).toBe(dartInjection[company.id].a);
      expect(disclosed.fiscalYear).toBe(dartInjection[company.id].y);
      expect(disclosed.sourceUrl).toContain(dartInjection[company.id].r);
      expect(disclosed.note).toContain("연간급여총액÷인원");
    }
  });

  it("서버 FAQ 본문과 구조화 데이터에 같은 질문·답을 사용한다", () => {
    const items = buildCompanySalaryFaq(samsung);
    const markup = renderToStaticMarkup(createElement(CompanyFaq, { companyName: samsung.name.ko, items }));
    const structured = faqLd(items);
    expect((markup.match(/<details/g) ?? []).length).toBe(2);
    expect(structured.mainEntity).toHaveLength(2);
    for (const [index, item] of items.entries()) {
      const escapedAnswer = renderToStaticMarkup(createElement("span", null, item.answer)).slice(6, -7);
      expect(markup).toContain(escapedAnswer);
      expect(structured.mainEntity[index].name).toBe(item.question);
      expect(structured.mainEntity[index].acceptedAnswer.text).toBe(item.answer);
    }
  });
});
