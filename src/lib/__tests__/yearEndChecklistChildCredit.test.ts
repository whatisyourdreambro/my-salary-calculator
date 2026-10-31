// 연말정산 시즌 안내 쪽 자녀세액공제 나이 표기 회귀 가드 (2026-11-01 PKG-20 — STR-03 체크리스트 부분, YE-01)
//
// 2026-04-21 소득세법 개정(법률 제21548호) 부칙 제2조: 2026년 과세기간분 자녀세액공제 연령은 9세 이상이고,
// 2017년생에게는 그 단계 기준을 적용하지 않는다 — 즉 2016년 이전 출생 자녀만 대상(law.go.kr 소득세법 개정문 확인).
// 계산기(childDeduction·dual-income)는 이미 이 기준이다. c09347eb8 의 childDeduction.test.ts 묘사 중
// /year-end-tax-checklist 단언을 이 파일로 옮겼다(/tax-changes-2026·오퍼 비교 단언은 PKG-21 몫).
// - 체크리스트 신혼·출산 항목(광고 위): 만 8세 이상 -> 만 9세 초과(12월 31일 기준 만 나이, 같은 글자 구성).
// - 체크리스트·/year-end-tax·/year-end-tax-settlement-2026 접힌 FAQ: 개정 사실 한 문장(YE-01 은 혼인세액공제 끝 연도 포함).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

const LAW_SENTENCE =
  "자녀세액공제는 2026년 4월 법 개정(법률 제21548호)으로 2026년 귀속 9세 이상(2017년생 제외), 즉 2016년 이전 출생 자녀만 대상";

describe("/year-end-tax-checklist 자녀세액공제 나이 표기 (STR-03)", () => {
  const checklist = read("src/app/year-end-tax-checklist/page.tsx");

  it("문자열 어디에도 개정 전 '만 8세 이상'이 없고 만 9세 초과(2017년생 제외)로 적는다", () => {
    expect(checklist).not.toMatch(/"[^"\n]*만 8세 이상[^"\n]*"/);
    expect(checklist).toContain("만 9세 초과");
    expect(checklist).toContain("2017년생 제외");
  });

  it("광고 위 신혼·출산 항목은 같은 글자 구성으로 만 9세 초과", () => {
    expect(checklist).toContain(
      '"기본공제 대상 자녀·손자녀 중 만 9세 초과 자녀세액공제 확인 (6세 이하 추가 100만원 없음)",',
    );
  });

  it("접힌 FAQ(올해 새로 챙길 항목) 답에 개정 사실 한 문장", () => {
    expect(checklist).toContain(`${LAW_SENTENCE}입니다.`);
  });
});

describe("연말정산 대표 쪽 '달라지는 점' FAQ — 자녀세액공제·혼인세액공제 (YE-01)", () => {
  it.each(["src/app/year-end-tax/page.tsx", "src/app/year-end-tax-settlement-2026/page.tsx"])(
    "%s 접힌 FAQ 에 자녀세액공제 나이 기준과 혼인세액공제 마지막 혼인신고일",
    (file) => {
      const src = read(file);
      expect(src).toContain(
        `${LAW_SENTENCE}이고, 혼인세액공제(1명 50만원)는 2026년 12월 31일 혼인신고분까지 적용됩니다.`,
      );
      expect(src).not.toMatch(/"[^"\n]*만 8세 이상[^"\n]*"/);
    },
  );
});
