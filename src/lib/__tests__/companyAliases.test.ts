// 회사 별칭 데이터 무결성 — companyAliases(화면·검색 공용)·companySearchAliases(검색 전용, NAVER-05)
// (2026-09-26 W2-B e89acb6 · c7566555 가드, 2026-11-02 RL-03 재착지 — 현재 main 기준으로 다시 씀)
//
//  - 객체 리터럴의 중복 키는 JS 가 조용히 덮어쓴다(2026-08-16 etri 사건) — 소스 텍스트에서 키를 센다.
//  - scripts/dart-etl.mjs 는 companyAliases.ts 를 따옴표 친 키만 읽는 정규식(aRe)으로 훑는다 — 검색 전용 목록의
//    키가 따옴표 없이 들어가면 4월 재수집 때 그 별칭이 DART 매칭 후보에서 조용히 빠진다.
//  - 모든 id 가 CompanyRepository 에 실존.
//  - 검색 전용 별칭: 회사명(name.ko·name.en)·화면 별칭(companyAliases)과 같은 표기 금지(대소문자·공백 무시),
//    다른 회사의 회사명·별칭과 같은 표기 금지, 목록 안 중복·빈 문자열·앞뒤 공백 금지.

import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { companyAliases, companySearchAliases } from "@/data/companyAliases";
import { companyAlternateNames, companyRepository } from "@/lib/salary-data/CompanyRepository";
import { companyMetadataInput } from "@/lib/companyPageMetadata";
import { buildCompanyMetadata } from "@/lib/seo";
import CompanyNarrative from "@/components/CompanyNarrative";
import type { CompanyProfile } from "@/types/company";

const SRC = fs.readFileSync(path.join(process.cwd(), "src/data/companyAliases.ts"), "utf8");

/** `export const <name>: Record<string, string[]> = { … };` 본문(중괄호 안) */
function literalBody(exportName: string): string {
  const start = SRC.indexOf(`export const ${exportName}:`);
  expect(start, exportName).toBeGreaterThanOrEqual(0);
  const open = SRC.indexOf("{", SRC.indexOf("=", start));
  let depth = 0;
  let end = open;
  for (let i = open; i < SRC.length; i++) {
    if (SRC[i] === "{") depth++;
    if (SRC[i] === "}") depth--;
    if (depth === 0) {
      end = i;
      break;
    }
  }
  return SRC.slice(open + 1, end);
}

/** 본문의 최상위 키 목록(등장 순, 중복 포함) — 주석 줄과 배열 안 문자열은 지우고 '키:' 만 센다 */
function literalKeys(exportName: string): string[] {
  const body = literalBody(exportName)
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");
  const withoutArrays = body.replace(/\[[^\]]*\]/g, "[]");
  return [...withoutArrays.matchAll(/(?:^|[,{\s])(?:"([^"]+)"|([A-Za-z_$][\w$]*))\s*:/g)].map(
    (m) => m[1] ?? m[2]
  );
}

const LISTS = { companyAliases, companySearchAliases } as const;
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");

describe("중복 키 금지 (etri 사건)", () => {
  it.each(Object.keys(LISTS) as (keyof typeof LISTS)[])("%s 소스에 같은 키가 두 번 나오지 않는다", (name) => {
    const keys = literalKeys(name);
    expect(new Set(keys).size, keys.join(",")).toBe(keys.length);
    // 소스에서 센 키 = 런타임 키 (파서가 키를 놓치지 않았는지)
    expect([...keys].sort()).toEqual(Object.keys(LISTS[name]).sort());
  });
});

describe("scripts/dart-etl.mjs 별칭 정규식(aRe)이 검색 전용 별칭을 전부 읽는다", () => {
  const etl = fs.readFileSync(path.join(process.cwd(), "scripts/dart-etl.mjs"), "utf8");

  it("companySearchAliases 의 모든 키가 따옴표 키라 aRe 에 그대로 잡힌다", () => {
    const m = etl.match(/const aRe = \/(.+)\/g;/);
    expect(m, "dart-etl.mjs 에 aRe 정규식이 있어야 한다").not.toBeNull();
    const aRe = new RegExp(m![1], "g");
    const found = new Map<string, string[]>();
    for (const am of literalBody("companySearchAliases").matchAll(aRe)) {
      found.set(am[1], [...am[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]));
    }
    expect([...found.keys()].sort()).toEqual(Object.keys(companySearchAliases).sort());
    for (const [id, list] of Object.entries(companySearchAliases)) expect(found.get(id), id).toEqual(list);
  });

  it("같은 id 가 두 목록에 다 있어도 ETL 별칭 맵은 덮어쓰지 않고 합친다", () => {
    expect(etl).toContain("aliasMap[am[1]] = [...(aliasMap[am[1]] ?? []), ");
  });
});

describe("실존 id", () => {
  it.each(Object.keys(LISTS) as (keyof typeof LISTS)[])("%s 의 모든 id 가 CompanyRepository 에 있다", (name) => {
    for (const id of Object.keys(LISTS[name])) expect(companyRepository.getById(id), id).toBeDefined();
  });
});

describe("검색 전용 별칭 규칙", () => {
  it("회사명·화면 별칭과 같은 표기·목록 안 중복·빈 문자열·앞뒤 공백이 없다", () => {
    for (const [id, list] of Object.entries(companySearchAliases)) {
      const c = companyRepository.getById(id)!;
      expect(list.length, id).toBeGreaterThan(0);
      const taken = new Set([c.name.ko, c.name.en, ...(companyAliases[id] ?? [])].map(norm));
      const seen = new Set<string>();
      for (const alias of list) {
        expect(alias.trim(), `${id}: '${alias}'`).toBe(alias);
        expect(alias.length, id).toBeGreaterThan(0);
        expect(taken.has(norm(alias)), `${id}: '${alias}' 는 회사명·화면 별칭과 같다`).toBe(false);
        expect(seen.has(norm(alias)), `${id}: '${alias}' 중복`).toBe(false);
        seen.add(norm(alias));
      }
    }
  });

  it("다른 회사의 회사명·화면 별칭·검색 전용 별칭과 같은 표기가 없다 (한 표기는 한 회사만 가리킨다)", () => {
    const owner = new Map<string, string>();
    for (const c of companyRepository.getAll()) {
      for (const label of [c.name.ko, c.name.en, ...(companyAliases[c.id] ?? [])]) {
        if (!owner.has(norm(label))) owner.set(norm(label), c.id);
      }
    }
    const searchOwner = new Map<string, string>();
    for (const [id, list] of Object.entries(companySearchAliases)) {
      for (const alias of list) {
        const other = owner.get(norm(alias));
        expect(other === undefined || other === id, `${id}: '${alias}' 는 ${other} 의 이름·별칭`).toBe(true);
        const prev = searchOwner.get(norm(alias));
        expect(prev === undefined || prev === id, `${id}: '${alias}' 는 ${prev} 의 검색 전용 별칭과 같다`).toBe(true);
        searchOwner.set(norm(alias), id);
      }
    }
  });

  it("회사 객체 searchAliases 는 목록 그대로 주입되고, 목록 없는 회사에는 키가 없다", () => {
    for (const c of companyRepository.getAll()) {
      const list = companySearchAliases[c.id];
      if (list && list.length > 0) expect(c.searchAliases, c.id).toEqual(list);
      else expect("searchAliases" in c, c.id).toBe(false);
    }
  });
});

// ── RL-03 재착지 데이터 (2026-11-02) — 10월 W3-F(6d4ec03c·c7566555)·R6-09(76682c79)·B3(b87746e3) 11곳 ──
const W3F: Record<string, string[]> = {
  kotra: ["코트라", "대한무역투자진흥공사"],
  "kpmg-korea": ["삼정회계법인"],
};
/** 사명 변경 — lig-nex1 은 새 상장명·국문 법인명이 이미 화면 별칭이라 약칭 'LIG D&A' 만 (10월 원안에서 한 표기 뺌) */
const R609_RENAMED: Record<string, string[]> = {
  "lig-nex1": ["LIG D&A"],
  "hdc-hyundai": ["IPARK현대산업개발", "아이파크현대산업개발"],
  ncsoft: ["엔씨"],
  hancom: ["한컴"],
  "doosan-enerbility": ["두산중공업"],
};
const B3_VARIANTS: Record<string, string[]> = {
  "gc-greencross": ["녹십자"],
  "hd-hyundai-oilbank": ["현대오일뱅크"],
  keti: ["KETI"],
  "lotte-chilsung": ["롯데칠성"],
};
/** N2-data-08 2단계(2026-11-18, 운영자 승인 C-3) — 회사명 정정 묶음의 택배 브랜드 통칭 하나 (r4bData2LotteAlias.test.ts) */
const N2_DATA_08: Record<string, string[]> = {
  "lotte-global-logistics": ["롯데택배"],
};
const RELANDED: Record<string, string[]> = { ...W3F, ...R609_RENAMED, ...B3_VARIANTS, ...N2_DATA_08 };
/** 사이트 회사명(name.ko = H1) — 새 사명은 검색 쪽에만 싣고 회사명은 바꾸지 않는다 */
const NAME_KO: Record<string, string> = {
  kotra: "KOTRA",
  "kpmg-korea": "삼정KPMG",
  "lig-nex1": "LIG넥스원",
  "hdc-hyundai": "HDC현대산업개발",
  ncsoft: "엔씨소프트",
  hancom: "한글과컴퓨터",
  "doosan-enerbility": "두산에너빌리티",
  "gc-greencross": "GC녹십자",
  "hd-hyundai-oilbank": "HD현대오일뱅크",
  keti: "한국전자기술연구원",
  "lotte-chilsung": "롯데칠성음료",
  // N2-data-08: 검색 쪽 통칭(롯데택배)과 별개로 회사명 자체를 실제 사명으로 고치는 것은 회사명 정정 커밋 몫
  "lotte-global-logistics": "롯데글로벌로지스틱스",
};
const narrativeOf = (c: CompanyProfile) => renderToStaticMarkup(createElement(CompanyNarrative, { company: c }));

describe("RL-03 재착지 목록 — W3-F 2곳 + R6-09 사명 변경 5곳 + B3 4곳 (화면 비노출)", () => {
  it("목록이 정확히 이 12곳(RL-03 11곳 + N2-data-08 1곳)·이 값이다 (별칭 공변량 id 집합 — docs/analytics-measurement.md L10' 절 ②)", () => {
    expect(companySearchAliases).toEqual(RELANDED);
    expect(Object.keys(companySearchAliases)).toHaveLength(12);
  });

  it("회사명(name.ko·H1)은 그대로다", () => {
    expect(Object.keys(NAME_KO).sort()).toEqual(Object.keys(RELANDED).sort());
    for (const [id, ko] of Object.entries(NAME_KO)) expect(companyRepository.getById(id)!.name.ko, id).toBe(ko);
  });

  it("lig-nex1: 화면 별칭(새 상장명·국문 법인명)은 그대로, 검색 전용은 약칭 LIG D&A 하나 — alternateName 은 셋", () => {
    const lig = companyRepository.getById("lig-nex1")!;
    expect(lig.aliases).toEqual(["LIG디펜스앤에어로스페이스", "엘아이지디펜스앤에어로스페이스 주식회사"]);
    expect(lig.searchAliases).toEqual(["LIG D&A"]);
    expect(companyAlternateNames(lig)).toEqual([
      "LIG디펜스앤에어로스페이스",
      "엘아이지디펜스앤에어로스페이스 주식회사",
      "LIG D&A",
    ]);
    // 화면 별칭 문장은 종전 그대로(두 표기만) — 약칭은 본문에 나오지 않는다
    const html = narrativeOf(lig);
    expect(html).toContain("이름·표기로도 검색됩니다");
    expect(html).not.toContain("D&amp;A");
    expect(html).not.toContain("D&A");
  });

  it("kotra: 화면 별칭은 여전히 없고(B34 가드 유지), alternateName·keywords 꼬리에 코트라·대한무역투자진흥공사", () => {
    const kotra = companyRepository.getById("kotra")!;
    expect(kotra.aliases).toBeUndefined();
    expect(kotra.titleName).toBe("코트라");
    expect(companyAlternateNames(kotra)).toEqual(["코트라", "대한무역투자진흥공사"]);
    const keywords = String(buildCompanyMetadata(companyMetadataInput(kotra)).keywords);
    expect(
      keywords.endsWith(", 코트라 연봉, 코트라 초봉, 대한무역투자진흥공사 연봉, 대한무역투자진흥공사 초봉")
    ).toBe(true);
    // 제목 표기(titleName) 키워드 '코트라 연봉' 과 겹쳐도 한 번만
    expect(keywords.split("코트라 연봉").length - 1).toBe(1);
  });

  it("사이트 검색(CompanyRepository.search — /salary-db 목록 필터와 같은 기준)이 그 표기로 해당 회사를 찾는다", () => {
    for (const [id, list] of Object.entries(RELANDED)) {
      for (const a of list) {
        expect(companyRepository.search(a).map((c) => c.id), `${id}: ${a}`).toContain(id);
        expect(companyRepository.search(a.toLowerCase()).map((c) => c.id), `${id}: ${a}`).toContain(id);
      }
    }
    // 10월 검색 시나리오 — 부분 표기·대소문자 무시
    expect(companyRepository.search("lig d&a").map((c) => c.id)).toContain("lig-nex1");
    expect(companyRepository.search("코트라").map((c) => c.id)).toEqual(["kotra"]);
    expect(companyRepository.search("삼정회계").map((c) => c.id)).toEqual(["kpmg-korea"]);
  });

  it("keywords 꼬리·JSON-LD alternateName 에만 들어가고, 제목·description·CompanyNarrative 본문은 그대로다", () => {
    for (const [id, list] of Object.entries(RELANDED)) {
      const c = companyRepository.getById(id)!;
      const alt = companyAlternateNames(c) ?? [];
      for (const a of list) expect(alt, id).toContain(a);
      const withAliases = buildCompanyMetadata(companyMetadataInput(c));
      const without = buildCompanyMetadata(companyMetadataInput({ ...c, searchAliases: undefined }));
      const keywords = String(withAliases.keywords);
      expect(keywords.startsWith(`${String(without.keywords)}, `), `${id}: ${keywords}`).toBe(true);
      for (const a of list) expect(keywords, id).toContain(`${a} 연봉, ${a} 초봉`);
      expect(withAliases.title, id).toEqual(without.title);
      expect(withAliases.description, id).toEqual(without.description);
      expect(withAliases.openGraph, id).toEqual(without.openGraph);
      expect(narrativeOf(c), id).toBe(narrativeOf({ ...c, searchAliases: undefined }));
      // 화면 별칭 문장은 화면 별칭이 있는 회사(lig-nex1)에만 — 검색 전용 별칭이 문장을 만들지 않는다
      expect(narrativeOf(c).includes("이름·표기로도 검색됩니다"), id).toBe(Boolean(c.aliases?.length));
    }
  });
});
