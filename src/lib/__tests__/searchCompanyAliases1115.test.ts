// 헤더 검색: 회사 별칭·통칭(숨은 검색어) 매칭 고정 (2026-11-15 SEASONA, 감사 lib ideas[6])
// '삼전'·'하닉'·'현차'처럼 회사 이름에 없는 통칭은 종전에 0건이었다. 별칭은 CompanyRepository 가 이미 회사 객체에 넣어 같은
// 청크에 실려 있던 데이터라 새 import 가 없고, 드롭다운에는 제목·설명만 그린다(숨은 검색어는 화면에 없다).
// 검색 데이터 크기: keywords 로 늘어난 JSON 은 79개 회사 약 3.9KB(2026-11-15 측정) — 상한 15KB 를 넘지 않게 고정한다.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { searchEntries, searchIndex } from "@/lib/searchIndex";
import { companyAliases, companySearchAliases } from "@/data/companyAliases";

describe("회사 별칭 검색 (SEASONA lib ideas[6])", () => {
  it.each([
    ["삼전", "/salary-db/samsung-electronics"],
    ["하닉", "/salary-db/sk-hynix"],
    ["현차", "/salary-db/hyundai"],
    ["삼바", "/salary-db/samsung-biologics"],
    ["대우조선", "/salary-db/hanwha-ocean"],
  ])("'%s' → %s 가 첫 결과", (q, href) => {
    expect(searchEntries(q)[0]?.href).toBe(href);
  });

  it("별칭은 회사 항목의 숨은 keywords 에만 — 제목·설명은 그대로", () => {
    const companies = searchIndex.filter((e) => e.category === "회사");
    const withKeywords = companies.filter((e) => e.keywords);
    expect(withKeywords.length).toBeGreaterThan(50);
    expect(searchIndex.filter((e) => e.category !== "회사" && e.keywords)).toEqual([]);
    const hynix = companies.find((e) => e.href === "/salary-db/sk-hynix")!;
    expect(hynix.title).toBe("SK하이닉스");
    for (const alias of companyAliases["sk-hynix"]) expect(hynix.keywords).toContain(alias);
    const kotra = companies.find((e) => e.href === "/salary-db/kotra");
    if (kotra) for (const alias of companySearchAliases["kotra"]) expect(kotra.keywords).toContain(alias);
  });

  it("제목 매칭은 별칭 매칭보다 항상 앞이다 (기존 결과 순서 보존)", () => {
    expect(searchEntries("공무원 실수령")[0]?.href).toBe("/calc/civil-servant-net-pay");
    expect(searchEntries("삼성전자")[0]?.href).toBe("/calc/samsung-bonus");
  });

  it("드롭다운은 제목·설명만 그린다 — keywords 를 화면에 쓰지 않는다", () => {
    const src = readFileSync("src/components/header/HeaderSearch.tsx", "utf8");
    expect(src).not.toContain(".keywords");
  });

  it("검색 데이터 크기: keywords 로 늘어난 JSON 은 15KB 미만", () => {
    const withK = Buffer.byteLength(JSON.stringify(searchIndex));
    const without = Buffer.byteLength(JSON.stringify(searchIndex.map((e) => ({ ...e, keywords: undefined }))));
    expect(withK - without).toBeGreaterThan(0);
    expect(withK - without).toBeLessThan(15 * 1024);
  });
});
