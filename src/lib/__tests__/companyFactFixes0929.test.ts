// 회사 페이지 사실 정정 고정 (2026-09-29 SEO 새로고침 — company 묶음)
//
// 모든 정정은 광고 위 제자리 교체다. 폭 규칙:
//  - 표 안(직급별 연봉표 설명 칸)은 table 의 tabular-nums 상속이라 숫자끼리 바꾸면 폭이 같다.
//  - 표 밖 문단·목록은 비례 숫자라 숫자를 바꾸지 않고, 한글 음절은 한글 음절로만 바꾼다
//    (사이트 글꼴 한글 음절 폭은 모두 같다). 띄어쓰기 위치·글자 수·문장부호는 그대로 둔다.
// 문구를 다시 고칠 때는 폭 맞춤(글꼴 단위 합·글자 수)과 1,123폭 광고 위치 스윕을 다시 할 것.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";

/** 사이트 글꼴 서브셋 6종(Latin·Korean·KoreanExtra1~4)의 unicode-range 합집합 */
function siteFontCodepoints(): Set<number> {
  const source = readFileSync("src/app/fonts/siteFonts.generated.ts", "utf8");
  const ranges = [...source.matchAll(/prop: "unicode-range", value: "([^"]+)"/g)];
  const set = new Set<number>();
  for (const range of ranges) {
    for (const part of range[1].split(",")) {
      const [first, last = first] = part.trim().slice(2).split("-").map((v) => parseInt(v, 16));
      for (let code = first; code <= last; code++) set.add(code);
    }
  }
  return set;
}
const FONT = siteFontCodepoints();
function outsideFont(text: string): string[] {
  return [...new Set([...text].filter((ch) => ch.codePointAt(0)! > 127 && !FONT.has(ch.codePointAt(0)!)))];
}

/** 폭 서명 — 띄어쓰기로 나눈 단어마다 [한글 수, 숫자 수, 그 밖의 글자] */
function widthSignature(text: string): string {
  return text
    .split(" ")
    .map((word) => {
      const hangul = [...word].filter((ch) => /[가-힣]/.test(ch)).length;
      const digits = [...word].filter((ch) => /[0-9]/.test(ch)).length;
      const other = [...word].filter((ch) => !/[가-힣0-9]/.test(ch)).join("");
      return `${hangul}/${digits}/${other}`;
    })
    .join(" ");
}

function company(id: string) {
  const c = companyRepository.getById(id);
  if (!c) throw new Error(`missing company ${id}`);
  return c;
}

function careerStep(id: string, label: string) {
  const step = company(id).careerLevels?.flatMap((g) => g.steps).find((s) => s.label === label);
  if (!step) throw new Error(`missing step ${id} ${label}`);
  return step;
}

describe("CM-03 직급별 연봉표 평균 근속 — 2025 사업보고서 값", () => {
  it("카카오 크루 평균 근속은 DART 2025 '6년 3개월'(공시 카드 6.25년과 일치)", () => {
    const step = careerStep("kakao", "크루 (전사 평균)");
    expect(step.description.startsWith("평균 근속 6년3개월. 2025년 사업보고서 기준")).toBe(true);
    expect(step.description).not.toContain("5년6개월");
    expect(company("kakao").disclosed?.avgTenureYears).toBe(6.25);
  });

  it("네이버 팀원 평균 근속은 DART 2025 7.7년(7년8개월)", () => {
    const step = careerStep("naver", "팀원 (전사 평균)");
    expect(step.description.startsWith("평균 근속 7년8개월. 2025년 사업보고서(2026-03 공시)")).toBe(true);
    expect(step.description).not.toContain("7년4개월");
    expect(company("naver").disclosed?.avgTenureYears).toBe(7.7);
  });

  it("숫자만 숫자로 바꿨다 — 표 안 tabular-nums 라 폭 불변", () => {
    expect(widthSignature("평균 근속 6년3개월.")).toBe(widthSignature("평균 근속 5년6개월."));
    expect(widthSignature("평균 근속 7년8개월.")).toBe(widthSignature("평균 근속 7년4개월."));
  });
});

describe("정정 문구는 사이트 글꼴 서브셋 안의 글자만 쓴다", () => {
  it("CM-03", () => {
    expect(outsideFont(careerStep("kakao", "크루 (전사 평균)").description)).toEqual([]);
    expect(outsideFont(careerStep("naver", "팀원 (전사 평균)").description)).toEqual([]);
  });
});
