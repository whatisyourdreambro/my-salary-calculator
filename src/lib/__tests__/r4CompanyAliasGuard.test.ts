// 화면 별칭 가드 — 다른 회사의 회사명이 화면 별칭에 들어가지 않는다 (N2-data-08 1단계 1b, data-b01-F01 검증자 final_fix 2단계, R4 2026-11-18)
//
// companyAliases(화면 별칭)는 회사 쪽 본문 '…등의 이름·표기로도 검색됩니다. 모두 같은 회사이며' 문장, meta keywords,
// Organization JSON-LD alternateName, 헤더 검색 숨은 검색어로 그대로 나간다. 다른 회사(별도 기록이 있는 회사)의
// name.ko·name.en 과 같은 표기가 들어가면 그 회사를 같은 회사라고 적게 된다(2026-05-22 toss 에 토스뱅크·토스증권이 들어갔던 일,
// RL-19 CM-18 커밋에서 정정). 검색 전용 목록(companySearchAliases)의 같은 규칙은 companyAliases.test.ts 가 이미 본다.
import { describe, expect, it } from "vitest";
import { companyAliases } from "@/data/companyAliases";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";

const norm = (text: string) => text.toLowerCase().replace(/\s+/g, "");

describe("화면 별칭 — 다른 회사의 회사명과 같은 표기 금지 (대소문자·공백 무시)", () => {
  it("companyAliases 의 어떤 별칭도 다른 회사의 name.ko·name.en 과 같지 않다", () => {
    const owners = new Map<string, Set<string>>();
    for (const c of companyRepository.getAll()) {
      for (const name of [c.name.ko, c.name.en]) {
        if (!name) continue;
        const key = norm(name);
        if (!owners.has(key)) owners.set(key, new Set());
        owners.get(key)!.add(c.id);
      }
    }
    const clashes: string[] = [];
    for (const [id, aliases] of Object.entries(companyAliases)) {
      for (const alias of aliases) {
        const others = [...(owners.get(norm(alias)) ?? [])].filter((other) => other !== id);
        if (others.length > 0) clashes.push(`${id}: '${alias}' = ${others.join(", ")}`);
      }
    }
    expect(clashes).toEqual([]);
  });

  it("toss 화면 별칭에 토스뱅크·토스증권이 없고, 두 회사는 각자 기록이 있다", () => {
    expect(companyAliases.toss).toEqual(["Toss", "토스", "비바리퍼블리카"]);
    expect(companyRepository.getById("toss-bank")?.name.ko).toBe("토스뱅크");
    expect(companyRepository.getById("toss-securities")?.name.ko).toBe("토스증권");
  });
});
