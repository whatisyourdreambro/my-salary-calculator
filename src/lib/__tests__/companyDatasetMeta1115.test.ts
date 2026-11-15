// 회사 상세 Dataset JSON-LD temporalCoverage·variableMeasured (2026-11-15 SEASONC, app-data-pages ideas[7]) — JSON-LD 만, 화면 불변.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { datasetLd } from "@/lib/structuredData";
import { COMPANY_DATA_YEAR, companyDatasetCoverage, companyDatasetVariables } from "@/lib/companyDatasetMeta";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";

describe("회사 Dataset 시간 범위·측정 변수", () => {
  it("공시 사업연도가 있으면 '사업연도/2026' 구간, 없으면 2026", () => {
    expect(COMPANY_DATA_YEAR).toBe(2026);
    expect(companyDatasetCoverage({ fiscalYear: "2025" })).toBe("2025/2026");
    expect(companyDatasetCoverage({ fiscalYear: "2024" })).toBe("2024/2026");
    expect(companyDatasetCoverage({ fiscalYear: "2024/25 회계연도(2025년 5월 결산)" })).toBe("2024/2026");
    expect(companyDatasetCoverage(undefined)).toBe("2026");
    expect(companyDatasetCoverage({ fiscalYear: "2026" })).toBe("2026");
  });

  it("전 회사가 ISO 8601 연도·구간을 낸다", () => {
    for (const c of companyRepository.getAll()) {
      expect(companyDatasetCoverage(c.disclosed), c.id).toMatch(/^\d{4}(\/2026)?$/);
    }
  });

  it("측정 변수는 화면의 직급 5단계·인센티브·실수령액, 공시가 있을 때만 공시 평균연봉", () => {
    expect(companyDatasetVariables(false)).toEqual(["신입 연봉", "주니어 연봉", "시니어 연봉", "리드 연봉", "임원 연봉", "평균 인센티브", "직급별 실수령액"]);
    expect(companyDatasetVariables(true).at(-1)).toBe("공시 평균연봉");
  });

  it("datasetLd 는 variableMeasured 를 넘길 때만 싣고, 회사 쪽이 두 값을 넘긴다", () => {
    const base = { name: "n", description: "d", url: "/salary-db/x" };
    expect(datasetLd(base)).not.toHaveProperty("variableMeasured");
    expect(datasetLd({ ...base, variableMeasured: [] })).not.toHaveProperty("variableMeasured");
    expect(datasetLd({ ...base, temporalCoverage: "2025/2026", variableMeasured: ["신입 연봉"] })).toMatchObject({ temporalCoverage: "2025/2026", variableMeasured: ["신입 연봉"] });
    const page = readFileSync("src/app/salary-db/[id]/page.tsx", "utf8");
    expect(page).toContain("temporalCoverage: companyDatasetCoverage(company.disclosed),");
    expect(page).toContain("variableMeasured: companyDatasetVariables(Boolean(company.disclosed)),");
  });
});
