// 롯데글로벌로지스 검색 전용 통칭 '롯데택배' (N2-data-08 2단계 YES 분기, 운영자 승인 2026-11-18 C-3 — 화면 비노출)
//
// 패키지 YES 분기: 회사명을 실제 사명으로 고치면서 검색 전용 별칭은 택배 브랜드 통칭 '롯데택배' 하나만 더한다
// (새 사명들은 name.ko 가 되므로 별칭으로 둘 수 없다 — 회사명과 같은 별칭 금지 규칙). 사이트 검색·메타 keywords 꼬리·
// JSON-LD alternateName 에만 쓰이고 화면(CompanyNarrative 별칭 문장)에는 나오지 않는다 — 공통 규칙 검사는
// companyAliases.test.ts 의 RL-03 목록(N2_DATA_08 묶음)이 맡는다. 옛 오기 표기(롯데글로벌로지스틱스 등)는 실제 이름이
// 아니어서 별칭으로 싣지 않는다.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { companyAliases, companySearchAliases } from "@/data/companyAliases";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";

describe("N2-data-08 검색 전용 통칭 롯데택배", () => {
  it("lotte-global-logistics 검색 전용 별칭은 롯데택배 하나, 화면 별칭은 없다", () => {
    expect(companySearchAliases["lotte-global-logistics"]).toEqual(["롯데택배"]);
    expect(companyAliases["lotte-global-logistics"]).toBeUndefined();
    const c = companyRepository.getById("lotte-global-logistics")!;
    expect(c.searchAliases).toEqual(["롯데택배"]);
    expect(c.aliases).toBeUndefined();
  });

  it("다른 회사 이름·별칭과 겹치지 않고, 사이트 검색이 이 회사 하나만 찾는다", () => {
    expect(companyRepository.search("롯데택배").map((c) => c.id)).toEqual(["lotte-global-logistics"]);
  });

  it("키는 따옴표로 쓴다(scripts/dart-etl.mjs 별칭 정규식이 따옴표 친 키만 읽는다)", () => {
    expect(readFileSync("src/data/companyAliases.ts", "utf8")).toContain('"lotte-global-logistics": ["롯데택배"],');
  });
});
