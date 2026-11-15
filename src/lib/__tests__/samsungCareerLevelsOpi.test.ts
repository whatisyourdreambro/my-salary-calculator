// 삼성전자 회사 페이지 직급표 출처 박스 — DS OPI 0% 는 2023년분뿐 (N2-components-01, components-b02-F01, 2026-11-15)
//
// 종전 문구 '다운사이클 시 OPI 0% 지급 사례 있음(DS 사업부 2023·2024).' 는 2024년분도 0% 로 읽혔다.
// 보도에 따르면 DS 부문 OPI 는 2023년분 0%, 2024년분 14%(뉴시스 2025-01-17), 2025년분 47%(아시아경제 2026-01-16) —
// 사이트의 /calc/samsung-bonus 와 가을 시즌 가이드도 같은 값이다. 박스는 Display2Ad 위라 새 문구는 종전 폭 이하여야 한다
// (숫자·가운뎃점 9자 → 숫자 4자 + 한글 2자).
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import CompanyCareerLevels from "@/components/CompanyCareerLevels";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";

/** 사이트 글꼴 서브셋의 unicode-range 합집합 */
function siteFontCodepoints(): Set<number> {
  const source = readFileSync("src/app/fonts/siteFonts.generated.ts", "utf8");
  const set = new Set<number>();
  for (const range of source.matchAll(/prop: "unicode-range", value: "([^"]+)"/g)) {
    for (const part of range[1].split(",")) {
      const [first, last = first] = part.trim().slice(2).split("-").map((v) => parseInt(v, 16));
      for (let code = first; code <= last; code++) set.add(code);
    }
  }
  return set;
}

describe("삼성전자 직급표 출처 박스 — DS OPI 0% 연도", () => {
  const samsung = companyRepository.getById("samsung-electronics");
  if (!samsung) throw new Error("missing samsung-electronics");
  const html = renderToStaticMarkup(createElement(CompanyCareerLevels, { company: samsung }));

  it("0% 사례를 2023년분으로만 적고 2024년을 넣지 않는다", () => {
    expect(html).toContain("OPI 0% 지급 사례 있음(DS 사업부 2023년분).");
    expect(html).not.toContain("2023·2024");
  });

  it("출처 주석은 렌더되지 않는다 (광고 위 높이 불변)", () => {
    expect(html).not.toContain("newsis");
    expect(html).not.toContain("asiae");
  });

  it("새 괄호 문구는 종전보다 좁고 글꼴 서브셋 안 글자만 쓴다", () => {
    const before = "(DS 사업부 2023·2024).";
    const after = "(DS 사업부 2023년분).";
    const hangul = (s: string) => [...s].filter((ch) => /[가-힣]/.test(ch)).length;
    const digits = (s: string) => [...s].filter((ch) => /[0-9]/.test(ch)).length;
    // 한글 2자(약 2em)가 숫자 4자 + 가운뎃점(약 2.4em)을 대신한다
    expect(hangul(after) - hangul(before)).toBe(2);
    expect(digits(before) - digits(after)).toBe(4);
    expect(after.length).toBeLessThan(before.length);
    const font = siteFontCodepoints();
    expect([...after].filter((ch) => ch.codePointAt(0)! > 127 && !font.has(ch.codePointAt(0)!))).toEqual([]);
  });

  it("다른 회사 페이지에는 삼성 전용 박스 문구가 나오지 않는다", () => {
    const hynix = companyRepository.getById("sk-hynix");
    if (!hynix) throw new Error("missing sk-hynix");
    expect(renderToStaticMarkup(createElement(CompanyCareerLevels, { company: hynix }))).not.toContain("DS 사업부");
  });
});
