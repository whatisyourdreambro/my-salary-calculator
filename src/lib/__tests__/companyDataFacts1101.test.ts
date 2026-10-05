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

describe("회사 데이터 사실 정정 — 광고 위 같은 폭 이하 (R09 code34-06·code34-07·code32-03)", () => {
  it("티씨케이 사업장은 경기 안성(DART 기업개황 주소 경기도 안성시 미양면) — 경북 영주 아님", () => {
    const c = company("tckorea");
    expect(c.workLife.remoteWork.description).toBe("경기 안성 사업장 중심 근무");
    expect(c.culture.cons).toContain("경기 안성 소재로 정주 여건 제약");
    expect(JSON.stringify(c)).not.toContain("영주");
    expect(notWiderPerWord(c.workLife.remoteWork.description!, "경북 영주 사업장 중심 근무")).toBe(true);
    // 회사 페이지 근무 형태 줄·문화 단점 목록, 비교 페이지 단점 줄(모두 광고 위) — 한글 음절끼리 같은 수로 바꿨다
    expect(notWiderPerWord("경기 안성 소재로 정주 여건 제약", "경북 영주 소재로 정주 여건 제약")).toBe(true);
    expect(outsideFont("경기 안성")).toEqual([]);
  });

  it("스타벅스코리아 — 틀린 지분율 51% 삭제(이마트 67.5%, 2021 추가 인수), 단어만 빠져 더 짧다", () => {
    const d = company("starbucks-korea").description;
    expect(d).toBe("이마트(신세계) 지분 보유 스타벅스 한국법인. 전국 1,900개 매장, 국내 커피 1위 브랜드.");
    expect(d).not.toContain("51%");
    // 종전 문구에서 51% 한 단어만 뺐다 — 남은 단어와 순서는 그대로
    const old = "이마트(신세계) 51% 지분 보유 스타벅스 한국법인. 전국 1,900개 매장, 국내 커피 1위 브랜드.";
    expect(old.split(" ").filter((w) => w !== "51%")).toEqual(d.split(" "));
  });

  it("현대트랜시스·현대위아 인센티브 target/max 는 연 기본급 대비 %(종전 월 기본급 대비 300·500% 오기) — 평균 성과급 비율과 맞는다", () => {
    for (const id of ["hyundai-transys", "hyundai-wia"]) {
      const s = company(id).salary;
      for (const lv of ["entry", "junior", "senior", "lead"] as const) {
        expect(s[lv].incentive.target, `${id} ${lv}`).toBe(25);
        expect(s[lv].incentive.max, `${id} ${lv}`).toBe(42);
      }
      expect(s.executive.incentive.max, id).toBe(50);
      const ratio = ((s.entry.incentive.avgAmount ?? 0) / s.entry.base) * 100;
      expect(ratio, id).toBeGreaterThan(s.entry.incentive.target);
      expect(ratio, id).toBeLessThan(s.entry.incentive.max);
    }
    // 전 회사 incentive 는 연 기본급 대비 % — 100 을 넘는 것은 메리츠화재(최대 300%)뿐(별건)
    const over = companies.filter((c) => c.salary.entry.incentive.max > 100).map((c) => c.id);
    expect(over).toEqual(["meritz-fire"]);
  });
});
