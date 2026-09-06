// src/lib/__tests__/dartCompanyLinks.test.ts
//
// DART 파생 모듈이 만드는 /salary-db/{id} 링크가 실재 라우트인지 회귀 가드.
//
// 배경 (2026-09-06 전수검사):
//   src/data/companies/index.ts 의 dedupeCompanies 는 "한글 회사명 중복"을 이유로
//   회사 50곳을 제거한다(첫 등장만 유지). 그런데 dartRanking·dartReport 는
//   corpCodeMap 의 id 를 그대로 링크로 썼기 때문에, 제거된 쪽 id 15곳
//   (cj-cheiljedang·gs-construction·daewoo-construction·ktng 등)에 대해
//   존재하지 않는 /salary-db/{id} 링크가 나갔다.
//   해당 URL 은 permanentRedirect 경로를 타는데, 응답이 캐시에서 재생될 때
//   (x-nextjs-cache: HIT) Location 헤더가 사라져 "목적지 없는 308"이 된다 —
//   사용자는 오류, 크롤러는 리다이렉트 오류로 처리한다.
//   또한 dartCompanyStatsById 가 제거된 id 로 키를 잡아, 생존 회사 페이지가
//   DART 통계 블록을 통째로 잃고 있었다.
//
// 정본: dartLite.resolveCompanyRouteId() — id 를 실재 라우트 집합과 대조하고,
//       사라진 id 는 같은 한글명의 생존 회사 id 로 승계한다.
import { describe, expect, it } from "vitest";

import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import {
  dartTop100,
  dartIndustryRows,
  dartCompanyStatsById,
} from "@/lib/salary-data/dartReport";
import {
  industryRankings,
  industryRankingByCompanyId,
  topRaiseRows,
  topTenureRows,
  topEmployeesRows,
} from "@/lib/salary-data/dartRanking";
import { resolveCompanyRouteId } from "@/lib/salary-data/dartLite";

const validIds = new Set(companyRepository.getAll().map((c) => c.id));

/** "/salary-db/{id}" 형태만 검사 — lite(/salary-db/listed/…)·null 은 대상 아님 */
function deadFromHrefs(hrefs: (string | null | undefined)[]): string[] {
  const dead: string[] = [];
  for (const href of hrefs) {
    if (!href) continue;
    const m = /^\/salary-db\/([a-z0-9-]+)$/.exec(href);
    if (m && !validIds.has(m[1])) dead.push(href);
  }
  return dead;
}

describe("DART 파생 회사 링크", () => {
  it("TOP100 표의 companyId 가 전부 실재 라우트", () => {
    const dead = deadFromHrefs(
      dartTop100.map((r) => (r.companyId ? `/salary-db/${r.companyId}` : null))
    );
    expect(dead).toEqual([]);
  });

  it("업종 표의 대표 회사 링크가 전부 실재 라우트", () => {
    const dead = deadFromHrefs(
      dartIndustryRows.map((r) =>
        r.topCompany.companyId ? `/salary-db/${r.topCompany.companyId}` : null
      )
    );
    expect(dead).toEqual([]);
  });

  it("랭킹 3종·업종 랭킹의 행 링크가 전부 실재 라우트", () => {
    const hrefs = [
      ...topRaiseRows.map((r) => r.href),
      ...topTenureRows.map((r) => r.href),
      ...topEmployeesRows.map((r) => r.href),
      ...industryRankings.flatMap((ir) => ir.topRows.map((r) => r.href)),
    ];
    expect(deadFromHrefs(hrefs)).toEqual([]);
  });

  it("회사 id 키 맵(통계·업종순위)이 전부 실재 라우트", () => {
    const deadStats = [...dartCompanyStatsById.keys()].filter((k) => !validIds.has(k));
    const deadRank = [...industryRankingByCompanyId.keys()].filter((k) => !validIds.has(k));
    expect({ deadStats, deadRank }).toEqual({ deadStats: [], deadRank: [] });
  });

  it("resolveCompanyRouteId 가 dedupe 로 사라진 id 를 생존 id 로 승계", () => {
    // cj-cheiljedang(제거) → cjcheiljedang(생존, 둘 다 "CJ제일제당")
    expect(validIds.has("cj-cheiljedang")).toBe(false);
    expect(resolveCompanyRouteId("cj-cheiljedang", "CJ제일제당")).toBe("cjcheiljedang");
    // 실재 id 는 그대로
    expect(resolveCompanyRouteId("samsung-electronics", "삼성전자")).toBe(
      "samsung-electronics"
    );
    // 매칭 불가 시 null (호출부가 lite URL·링크 없음으로 폴백)
    expect(resolveCompanyRouteId(undefined, "존재하지않는회사명XYZ")).toBeNull();
  });
});
