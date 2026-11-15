// NAVER-05 검색 전용 별칭 배관 — 가짜 항목을 주입해 흐름만 확인
// (2026-09-26 W2-B e89acb6, 2026-11-02 RL-03 재착지 — B34 의 titleName·nameChange 가 들어간 현재 main 기준으로 다시 씀)
//
// companySearchAliases(src/data/companyAliases.ts)는 사이트 검색 매칭·메타 keywords 꼬리·JSON-LD alternateName 전용이고
// 화면(CompanyNarrative 별칭 문장 등)에는 나오지 않는다. 실제 데이터 규칙(중복 키·실존 id·회사명과 같은 표기 금지)은
// companyAliases.test.ts 가 본다. 여기서는 목록이 비어 있지 않을 때의 동작을 가짜 항목으로 본다:
//  - 별칭 없는 회사("11st")와 화면 별칭 있는 회사("samsung-electronics", aliases ["삼전"])에 가짜 검색 별칭 주입
//    ('삼전' 은 일부러 화면 별칭과 겹치게 — 중복 제거 확인용, 실제 데이터에서는 companyAliases.test 가 금지).

import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const FAKE = vi.hoisted(() => ({
  "11st": ["검색별칭가나"],
  "samsung-electronics": ["검색별칭다라", "삼전"],
}));
vi.mock("@/data/companyAliases", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/data/companyAliases")>();
  return { ...actual, companySearchAliases: { ...actual.companySearchAliases, ...FAKE } };
});

import { companyAliases, companySearchAliases } from "@/data/companyAliases";
import { companyAlternateNames, companyRepository } from "@/lib/salary-data/CompanyRepository";
import { companyMetadataInput, companyPageTitleAndDescription, metadataTitleText } from "@/lib/companyPageMetadata";
import { buildCompanyMetadata } from "@/lib/seo";
import { companyOrganizationLd } from "@/lib/structuredData";
import CompanyNarrative from "@/components/CompanyNarrative";
import type { CompanyProfile } from "@/types/company";
import titleSnapshot from "./fixtures/companyTitles-2026-09-25.json";

const titles = titleSnapshot as Record<string, string>;
const get = (id: string) => companyRepository.getById(id)!;
/** 같은 회사에서 검색 전용 별칭만 뺀 객체 — 종전(배관 전) 입력과 같다 */
const withoutSearch = (c: CompanyProfile): CompanyProfile => ({ ...c, searchAliases: undefined });
const keywordList = (c: CompanyProfile) => String(buildCompanyMetadata(companyMetadataInput(c)).keywords).split(", ");

describe("CompanyRepository 주입", () => {
  it("검색 전용 별칭이 있는 회사만 searchAliases 키를 갖는다 (aliases 는 그대로)", () => {
    expect(get("11st").searchAliases).toEqual(["검색별칭가나"]);
    expect(get("11st").aliases).toBeUndefined();
    expect(get("samsung-electronics").searchAliases).toEqual(["검색별칭다라", "삼전"]);
    expect(get("samsung-electronics").aliases).toEqual(companyAliases["samsung-electronics"]);
    for (const c of companyRepository.getAll()) {
      const listed = (companySearchAliases[c.id] ?? []).length > 0;
      expect("searchAliases" in c, c.id).toBe(listed);
    }
  });

  it("search() 가 검색 전용 별칭(부분·대소문자 무시)으로도 찾는다", () => {
    expect(companyRepository.search("검색별칭가나").map((c) => c.id)).toEqual(["11st"]);
    expect(companyRepository.search("별칭다").map((c) => c.id)).toEqual(["samsung-electronics"]);
    // 종전 매칭(이름·화면 별칭)은 그대로
    expect(companyRepository.search("삼전").map((c) => c.id)).toContain("samsung-electronics");
  });
});

describe("JSON-LD alternateName", () => {
  it("aliases + searchAliases (중복 제거), 검색 별칭이 없으면 aliases 배열 그대로·둘 다 없으면 undefined", () => {
    expect(companyAlternateNames(get("11st"))).toEqual(["검색별칭가나"]);
    expect(companyAlternateNames(get("samsung-electronics"))).toEqual(["삼전", "검색별칭다라"]);
    const plain = companyRepository.getAll().find((c) => !c.aliases && !c.searchAliases)!;
    expect(companyAlternateNames(plain)).toBeUndefined();
    const aliasOnly = companyRepository.getAll().find((c) => c.aliases && !c.searchAliases)!;
    expect(companyAlternateNames(aliasOnly)).toBe(aliasOnly.aliases);
    expect(companyAlternateNames({ aliases: [], searchAliases: [] })).toEqual([]);
    // 빈 배열은 companyOrganizationLd 가 키째 뺀다 — undefined 와 같은 출력
    expect(JSON.stringify(companyOrganizationLd({ name: "x", alternateName: [] }))).toBe(
      JSON.stringify(companyOrganizationLd({ name: "x", alternateName: undefined }))
    );
  });

  it("검색 전용 별칭이 없는 회사의 Organization JSON-LD 는 종전(alternateName: aliases)과 바이트 동일", () => {
    for (const c of companyRepository.getAll()) {
      if (c.searchAliases) continue;
      expect(
        JSON.stringify(companyOrganizationLd({ name: c.name.ko, alternateName: companyAlternateNames(c) })),
        c.id
      ).toBe(JSON.stringify(companyOrganizationLd({ name: c.name.ko, alternateName: c.aliases })));
    }
  });
});

describe("메타데이터 — keywords 꼬리에만 들어가고 제목·설명은 그대로", () => {
  it("keywords 맨 끝에 '{검색 별칭} 연봉/초봉' 이 붙고, 이미 있는 표기는 한 번만 남는다", () => {
    const k11 = keywordList(get("11st")).join(", ");
    expect(k11.endsWith(", 검색별칭가나 연봉, 검색별칭가나 초봉")).toBe(true);
    const kse = keywordList(get("samsung-electronics")).join(", ");
    // 화면 별칭('삼전') 키워드 뒤에 검색 별칭 키워드 — '삼전' 중복은 한 번만
    expect(kse.endsWith(", 삼전 연봉, 삼전 초봉, 검색별칭다라 연봉, 검색별칭다라 초봉")).toBe(true);
    expect(kse.split("삼전 연봉").length - 1).toBe(1);
  });

  it("전 회사: 검색 별칭을 뺀 keywords 가 그대로 앞부분이고, 꼬리는 그 회사 검색 별칭 키워드뿐이다", () => {
    for (const c of companyRepository.getAll()) {
      const full = keywordList(c);
      const base = keywordList(withoutSearch(c));
      expect(full.slice(0, base.length), c.id).toEqual(base);
      const expectedTail = (c.searchAliases ?? [])
        .flatMap((a) => [`${a} 연봉`, `${a} 초봉`])
        .filter((k, i, arr) => !base.includes(k) && arr.indexOf(k) === i);
      expect(full.slice(base.length), c.id).toEqual(expectedTail);
    }
  });

  it("<title>·description·og 는 검색 별칭과 무관하다 (가짜 주입 회사는 고정 스냅샷 제목 그대로)", () => {
    for (const id of Object.keys(FAKE)) {
      const c = get(id);
      const withAliases = buildCompanyMetadata(companyMetadataInput(c));
      const without = buildCompanyMetadata(companyMetadataInput(withoutSearch(c)));
      expect(metadataTitleText(withAliases.title), id).toBe(titles[id]);
      expect(withAliases.title, id).toEqual(without.title);
      expect(withAliases.description, id).toEqual(without.description);
      expect(withAliases.openGraph, id).toEqual(without.openGraph);
      expect(companyPageTitleAndDescription(c), id).toEqual(companyPageTitleAndDescription(withoutSearch(c)));
    }
  });
});

describe("화면 비노출", () => {
  it("CompanyNarrative 별칭 문장은 aliases 만 — 검색 전용 별칭 문자열이 본문 HTML 에 없다", () => {
    const html11 = renderToStaticMarkup(createElement(CompanyNarrative, { company: get("11st") }));
    expect(html11).not.toContain("검색별칭가나");
    expect(html11).not.toContain("이름·표기로도 검색됩니다");
    const se = get("samsung-electronics");
    const htmlSe = renderToStaticMarkup(createElement(CompanyNarrative, { company: se }));
    expect(htmlSe).not.toContain("검색별칭다라");
    expect(htmlSe).toContain("이름·표기로도 검색됩니다");
    expect(htmlSe).toBe(renderToStaticMarkup(createElement(CompanyNarrative, { company: withoutSearch(se) })));
  });

  it("searchAliases·companySearchAliases·companyAlternateNames 를 읽는 소스는 검색·메타·JSON-LD 경로뿐이다", () => {
    const root = path.join(process.cwd(), "src");
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
          if (e.name !== "__tests__") walk(p);
        } else if (/\.(ts|tsx|mjs|js)$/.test(e.name)) files.push(p);
      }
    };
    walk(root);
    const rel = (p: string) => path.relative(process.cwd(), p).split(path.sep).join("/");
    // 주석은 빼고 코드만 본다 (설명 주석에 이름이 나오는 것은 괜찮다)
    const code = (p: string) =>
      fs
        .readFileSync(p, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:\\])\/\/.*$/gm, "$1");
    const users = (re: RegExp) => files.filter((f) => re.test(code(f))).map(rel).sort();

    expect(users(/\bsearchAliases\b/)).toEqual(
      [
        "src/app/salary-db/SalaryDbClient.tsx",
        "src/app/salary-db/page.tsx",
        "src/lib/companyPageMetadata.ts",
        "src/lib/salary-data/CompanyRepository.ts",
        // 2026-11-15 SEASONA(lib ideas[6]): 헤더 검색 인덱스의 숨은 검색어(keywords) — 검색 경로, 드롭다운에는 그리지 않는다
        "src/lib/searchIndex.ts",
        "src/lib/seo.ts",
        "src/types/company.ts",
      ].sort()
    );
    expect(users(/\bcompanySearchAliases\b/)).toEqual(
      ["src/data/companyAliases.ts", "src/lib/salary-data/CompanyRepository.ts"].sort()
    );
    expect(users(/\bcompanyAlternateNames\b/)).toEqual(
      ["src/app/salary-db/[id]/page.tsx", "src/lib/salary-data/CompanyRepository.ts"].sort()
    );
    // 회사 DB 목록(클라이언트)은 검색 필터에서만 읽는다 — 카드·JSX 렌더 없음
    const client = code(path.join(root, "app/salary-db/SalaryDbClient.tsx"));
    expect(client.match(/\bsearchAliases\b/g)).toHaveLength(2);
    expect(client).toContain("searchAliases?: string[];");
    expect(client).toContain("(c.searchAliases?.some((a) => a.toLowerCase().includes(lowerQuery)) ?? false)");
  });
});
