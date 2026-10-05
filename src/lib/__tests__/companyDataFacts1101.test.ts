// 회사 데이터 사실 정정 고정 — PKG-25b (2026-11-01 이식)
//
// 원 브랜치 claude/fix-company-1030 의 9ed246a67·70879ebe4·fa8131c1f 가 companyFixes1030.test.ts 에 덧붙였던
// 단언을 이 파일로 옮겼다. companyFixes1030.test.ts 는 PKG-25a 몫이라 두 묶음이 같은 파일을 만지지 않는다.
//
// 광고 위 문구는 띄어쓰기로 나뉜 단어마다 종전 폭 이하로만 바꾼다.
// 폭 서명 = 단어마다 [한글 수, 숫자 수, 그 밖의 글자] (사이트 글꼴 한글 음절 폭은 모두 같다).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";

const companies = companyRepository.getAll();

/** 사이트 글꼴 서브셋 6종의 unicode-range 합집합 — 새 문구에 서브셋 밖 글자가 없어야 한다 */
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
const FONT = siteFontCodepoints();
const outsideFont = (text: string) =>
  [...new Set([...text].filter((ch) => ch.codePointAt(0)! > 127 && !FONT.has(ch.codePointAt(0)!)))];

function company(id: string) {
  const c = companyRepository.getById(id);
  if (!c) throw new Error(`missing company ${id}`);
  return c;
}

/** 단어별 폭 등급 — [한글 수, 숫자 수, 그 밖의 글자 수] */
function wordWidths(text: string): [number, number, number][] {
  return text.split(" ").map((word) => {
    const chars = [...word];
    const hangul = chars.filter((ch) => /[가-힣]/.test(ch)).length;
    const digits = chars.filter((ch) => /[0-9]/.test(ch)).length;
    return [hangul, digits, chars.length - hangul - digits];
  });
}

/** after 의 단어마다 before 보다 넓지 않다(같은 단어 수, 한글·숫자·기타 각각 이하) */
function notWiderPerWord(after: string, before: string): boolean {
  const a = wordWidths(after);
  const b = wordWidths(before);
  return a.length === b.length && a.every(([h, d, o], i) => h <= b[i][0] && d <= b[i][1] && o <= b[i][2]);
}

describe("JYP 소개문 — aespa(SM 소속)를 JYP 아티스트처럼 잇던 오기 (R10 code34-01)", () => {
  it("TWICE·Stray Kids·ITZY 소속사 — 히어로 소개문(광고 위)은 종전보다 짧다", () => {
    const d = company("jyp-entertainment").description;
    expect(d).toBe("TWICE·Stray Kids·ITZY 소속사. 일본·미국 시장 K-pop 수출 강자.");
    expect(d).not.toContain("aespa");
    const old = "TWICE·Stray Kids·ITZY·aespa 경쟁사. 일본·미국 시장 K-pop 수출 강자.";
    expect(d.length).toBeLessThan(old.length);
    // 단어 수가 같고(ITZY·aespa -> ITZY), 단어마다 종전 이하
    expect(notWiderPerWord(d, old)).toBe(true);
    // 새 글자(소속)는 사이트 글꼴 서브셋 안 — 대체 글꼴로 넓어지지 않는다
    expect(outsideFont(d)).toEqual([]);
    expect(company("sm-entertainment").description).toContain("aespa");
  });
});
