import { describe, expect, it } from "vitest";
import { allCompanies, krCompanies } from "../companies";

describe("company disclosure retention", () => {
  it("keeps the existing Korea Expressway disclosure on the canonical record", () => {
    const canonical = allCompanies.find(company => company.id === "korea-highway");
    expect(canonical?.disclosed).toMatchObject({
      avgSalaryManwon: 9069,
      fiscalYear: "2025",
      avgTenureYears: 16.7,
      sourceUrl: "https://www.alio.go.kr/item/itemReportTerm.do?apbaId=C0183&reportFormRootNo=2060",
    });
    expect(krCompanies.find(company => company.id === "korea-expressway")?.disclosed).toBeUndefined();
  });
});
