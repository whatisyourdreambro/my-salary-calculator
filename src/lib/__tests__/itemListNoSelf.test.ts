// src/lib/__tests__/itemListNoSelf.test.ts
//
// RT-09 (2026-09-25) 회귀 가드 — 상장사 랭킹 페이지의 ItemList JSON-LD 가
// 자기 자신(canonical)을 가리키는 ListItem 을 내보내지 않는다.
// 종전: href 없는 행을 `row.href ?? path` 로 채워 업종 28쪽 972항목 중 608개가
// 페이지 자신을 가리켰다. 이제 자체 페이지가 있는 행만 넣고 position 은 원 순위 유지.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  industryRankings,
  rankingItemListItems,
  topEmployeesRows,
  topRaiseRows,
  topTenureRows,
  type RankingRow,
} from "@/lib/salary-data/dartRanking";
import { itemListLd } from "@/lib/structuredData";

const SITE = "https://www.moneysalary.com";

const pages: { path: string; rows: RankingRow[] }[] = [
  ...industryRankings.map((r) => ({
    path: `/salary-db/listed/industry/${r.industryId}`,
    rows: r.topRows,
  })),
  { path: "/salary-db/listed/top-raise", rows: topRaiseRows },
  { path: "/salary-db/listed/top-tenure", rows: topTenureRows },
  { path: "/salary-db/listed/top-employees", rows: topEmployeesRows },
];

describe("상장사 랭킹 ItemList — 자기참조 ListItem 0건 (RT-09)", () => {
  it("대상 페이지가 실제로 존재한다 (업종 랭킹 + 지표 랭킹 3종)", () => {
    expect(industryRankings.length).toBeGreaterThan(20);
    expect(pages.length).toBe(industryRankings.length + 3);
  });

  it.each(pages)("$path — ListItem url 이 canonical 과 같은 경우 0", ({ path, rows }) => {
    const items = rankingItemListItems(rows.slice(0, 50));
    const ld = itemListLd({ name: path, items });
    for (const el of ld.itemListElement) {
      expect(el.url).not.toBe(`${SITE}${path}`);
      expect(el.url.startsWith(`${SITE}/salary-db/`)).toBe(true);
    }
    // 자체 페이지가 있는 행 수와 정확히 일치 (행 누락·중복 없음)
    expect(items.length).toBe(rows.slice(0, 50).filter((r) => r.href).length);
    expect(ld.numberOfItems).toBe(items.length);
  });

  it("position 은 화면 순위(row.rank)를 그대로 유지한다", () => {
    for (const { rows } of pages) {
      const byName = new Map(rows.map((r) => [r.nameKo, r.rank]));
      for (const item of rankingItemListItems(rows.slice(0, 50))) {
        expect(item.position).toBe(byName.get(item.name));
      }
    }
  });

  it("두 페이지 소스가 `row.href ?? 경로` 폴백을 다시 쓰지 않는다", () => {
    const root = join(__dirname, "..", "..", "app", "salary-db", "listed");
    for (const file of ["MetricRankingView.tsx", join("industry", "[industryId]", "page.tsx")]) {
      const src = readFileSync(join(root, file), "utf8");
      expect(src).not.toMatch(/row\.href\s*\?\?/);
      expect(src).toContain("rankingItemListItems(");
    }
  });
});
