// 지주회사 lite 업종 허브 제외 (MISSED-lite-1, 2026-09-29)
// KSIC 64992(지주회사)·649 는 DART 업종 매핑상 '금융'이지만 SK·효성 같은 사업 지주회사다. 업종 허브(companyJobsMap)에서
// 빼서 그 lite 페이지의 마지막 광고 아래 금융·은행 직업 블록을 없앤다. 업종 재분류(광고 위·메타)는 하지 않는다.
import { describe, expect, it } from "vitest";

import { buildCompanyJobsMap } from "@/lib/companyJobsMap";
import { isHoldingCompanyKsic, resolveHub } from "@/lib/companyJobsResolve";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { getListedByStockCode, listedCohort } from "@/lib/salary-data/dartLite";

const map = buildCompanyJobsMap(companyRepository.getAll(), listedCohort);

describe("MISSED-lite-1 지주회사(KSIC 64992·649) lite 는 업종 허브에 넣지 않는다", () => {
  it("판별 규칙", () => {
    expect(isHoldingCompanyKsic("64992")).toBe(true);
    expect(isHoldingCompanyKsic("649")).toBe(true);
    expect(isHoldingCompanyKsic("64999")).toBe(false);
    expect(isHoldingCompanyKsic("64121")).toBe(false);
    expect(isHoldingCompanyKsic(undefined)).toBe(false);
  });

  it("SK·효성·한국앤컴퍼니·동원산업·웅진·GRT·로스웰 lite 는 어느 허브에도 없고, 그 lite 페이지에는 직업 블록이 없다", () => {
    const holding = listedCohort.filter((c) => isHoldingCompanyKsic(c.ksicCode)).map((c) => c.stockCode).sort();
    expect(holding).toEqual(["000240", "004800", "006040", "016880", "034730", "900260", "900290"]);
    for (const code of holding) {
      expect(map.some((h) => h.listed.includes(code)), code).toBe(false);
      expect(resolveHub(`/salary-db/listed/${code}`, map)).toBeNull();
    }
  });

  it("지주회사가 아닌 금융 lite(64999 등)는 허브에 남는다", () => {
    const kept = listedCohort.filter(
      (c) => c.ksicCode?.startsWith("649") && !isHoldingCompanyKsic(c.ksicCode)
    );
    expect(kept.length).toBeGreaterThan(0);
    for (const c of kept) {
      expect(getListedByStockCode(c.stockCode), c.stockCode).not.toBeNull();
      expect(map.some((h) => h.listed.includes(c.stockCode)), c.stockCode).toBe(true);
    }
  });
});
