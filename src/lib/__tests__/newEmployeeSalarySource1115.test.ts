// N2-app-pages-11 (app-pages-b04-F02, 2026-11-15): /new-employee-salary-2026 첫 문단의 시장 평균 출처 정정 고정.
// 종전 '통계청 발표(2025) 기준 … 약 4,200만원'은 통계청 발표에 없는 수치였다. 경총 2025-01-12 분석(2023년 기준)
// 대졸 정규직 초임 평균 3,675만원 — 한국경제 https://www.hankyung.com/article/202501120596Y
// 문단은 GuideMidAd(첫 광고) 위라 옛 문구보다 좁아야 한다(한글 음절 수 비교는 하한 가드, 실측은 통합 단계 스윕).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const raw = readFileSync(resolve(process.cwd(), "src/app/new-employee-salary-2026/page.tsx"), "utf8");
/** 렌더되는 소스만 본다 — 정정 경위를 적은 // 주석 줄은 뺀다 */
const src = raw.split(/\r?\n/).filter((line) => !/^\s*\/\//.test(line)).join("\n");
/** JSX 텍스트처럼 줄바꿈·들여쓰기를 공백 하나로 접는다 */
const collapse = (s: string) => s.replace(/\s+/g, " ");
const hangul = (s: string) => [...s].filter((c) => /[가-힣]/.test(c)).length;

describe("신입 초봉 2026 첫 문단 — 경총 2023년 기준 대졸 정규직 초임", () => {
  it("경총 분석(2023년 기준) 3,675만원과 약 2배를 쓰고 통계청 4,200만원은 없다", () => {
    const text = collapse(src);
    expect(text).toContain("경총 분석(2023년 기준) 국내 대졸 정규직 초임은 약 3,675만원이지만,");
    expect(text).toContain("시장 평균의 약 2배 수준입니다.");
    expect(src).not.toContain("통계청 발표(2025)");
    expect(src).not.toContain("4,200만원");
    expect(src).not.toContain("1.5~2배");
  });

  it("바꾼 구간은 옛 문구보다 한글 음절·빈칸이 적고 그 밖의 글자는 같다", () => {
    const before = "통계청 발표(2025) 기준 국내 대졸 신입 평균 연봉은 약 4,200만원이지만,";
    const after = "경총 분석(2023년 기준) 국내 대졸 정규직 초임은 약 3,675만원이지만,";
    expect(hangul(after)).toBeLessThan(hangul(before));
    const spaces = (s: string) => s.split(" ").length - 1;
    expect(spaces(after)).toBeLessThan(spaces(before));
    const other = (s: string) => [...s].filter((c) => !/[가-힣 ]/.test(c)).map((c) => (/\d/.test(c) ? "0" : c)).sort().join("");
    expect(other(after)).toBe(other(before));
    expect(hangul("약 2배")).toBe(2);
    expect([..."약 2배"].length).toBeLessThan([..."1.5~2배"].length);
  });

  it("광고 위 날짜는 그대로(2026-05-22) — 날짜 없는 정정", () => {
    expect(src).toContain('<PublishedMeta publishedDate="2026-05-22" updatedDate="2026-05-22" className="mb-2" />');
    expect(src).toContain('modifiedTime: "2026-05-22"');
  });
});
