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
import { describe, expect, it } from "vitest";
import { companyAliases, companySearchAliases } from "@/data/companyAliases";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";

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
