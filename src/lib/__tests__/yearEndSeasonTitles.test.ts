// src/lib/__tests__/yearEndSeasonTitles.test.ts
//
// SEASON-06 (운영자 승인 2026-09-26 10번) — 연말정산 시즌 쪽 제목 '2027 연말정산(2026년 귀속)' 프레임.
// 제목 문자열은 전부 yearEndSeason.ts 헬퍼에서 만든다(12/15 값 교체 슬롯 폐기 — 전환은 2027-03-11 부터만).
// 허브 /year-end-tax-2027(이미 두 연도 병기)과 미리보기 <title>(B1 기각)은 헬퍼를 쓰지 않고 그대로다.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  YEAR_END_FILING_QUERY,
  YEAR_END_TITLE_TAIL,
  yearEndLeadTitle,
  yearEndToolTitle,
} from "@/lib/yearEndSeason";

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

/** [파일, 제목 생성 호출 원문, 기대 제목(2027-03-10 까지)] */
const LEAD: Array<[string, string, string]> = [
  ["src/app/year-end-tax/page.tsx", 'yearEndLeadTitle("환급금 계산기", "즉시 계산")', "2027 연말정산 환급금 계산기(2026년 귀속) — 즉시 계산"],
  ["src/app/year-end-tax-checklist/page.tsx", 'yearEndLeadTitle("체크리스트", "12월 마감 전 점검표")', "2027 연말정산 체크리스트(2026년 귀속) — 12월 마감 전 점검표"],
  ["src/app/year-end-tax-settlement-2026/page.tsx", 'yearEndLeadTitle("성과급 절세 가이드", "12월 전략")', "2027 연말정산 성과급 절세 가이드(2026년 귀속) — 12월 전략"],
];

/** [파일, 계산기 이름] — 제목 = '{이름} — 2026년 귀속·2027 연말정산' */
const TOOL: Array<[string, string]> = [
  ["src/app/credit-card-deduction-2026/page.tsx", "신용카드 소득공제 계산기"],
  ["src/app/medical-tax-credit-2026/page.tsx", "의료비 세액공제 계산기"],
  ["src/app/rent-tax-credit-2026/page.tsx", "월세 세액공제 계산기"],
  ["src/app/donation-tax-credit-2026/page.tsx", "기부금 세액공제 계산기"],
  ["src/app/calc/january-bonus/page.tsx", "13월의 월급 시뮬레이터"],
  ["src/app/calc/dual-income-year-end/page.tsx", "맞벌이 연말정산 몰아주기 계산기"],
  ["src/app/calc/dependent-check/page.tsx", "부양가족 인적공제 판정기"],
  ["src/app/calc/child-deduction/page.tsx", "자녀 인적공제·세액공제 계산기"],
];

const SWITCH_AT_KST = Date.parse("2027-03-11T00:00:00+09:00");

describe("연말정산 시즌 제목 (SEASON-06)", () => {
  it("대표 3쪽은 '2027 연말정산'으로 시작하고 귀속연도를 괄호로 붙인다 — 40자 이내", () => {
    for (const [file, call, expected] of LEAD) {
      expect(read(file), file).toContain(call);
      const args = [...call.matchAll(/"([^"]*)"/g)].map((m) => m[1]);
      const title = yearEndLeadTitle(args[0], args[1]);
      expect(title.startsWith(YEAR_END_FILING_QUERY), title).toBe(true);
      expect(title.length, title).toBeLessThanOrEqual(40);
      if (Date.now() < SWITCH_AT_KST) expect(title).toBe(expected);
    }
  });

  it("정밀 계산기 4쪽·/calc 4쪽은 계산기 이름(검색어)을 앞에, 귀속·신고 꼬리를 뒤에 — 40자 이내", () => {
    for (const [file, name] of TOOL) {
      const src = read(file);
      expect(src, file).toContain(`title: yearEndToolTitle("${name}")`);
      const title = yearEndToolTitle(name);
      expect(title.startsWith(name), title).toBe(true);
      expect(title.endsWith(YEAR_END_TITLE_TAIL), title).toBe(true);
      expect(title.length, title).toBeLessThanOrEqual(40);
    }
    if (Date.now() < SWITCH_AT_KST) expect(YEAR_END_TITLE_TAIL).toBe("2026년 귀속·2027 연말정산");
  });

  it("/calc 4쪽은 이름(OG 카드)·설명을 그대로 두고 제목만 지정한다", () => {
    for (const [file, name] of TOOL.filter(([f]) => f.includes("/calc/"))) {
      const src = read(file);
      expect(src, file).toContain(`name: "${name}",`);
      expect(src, file).toMatch(/buildToolMetadata\(\{/);
    }
  });

  it("허브 제목과 미리보기 <title> 은 헬퍼를 쓰지 않는다 (범위 밖)", () => {
    const hub = read("src/app/year-end-tax-2027/page.tsx");
    expect(hub).not.toMatch(/yearEndLeadTitle|yearEndToolTitle/);
    const preview = read("src/app/year-end-tax-preview/page.tsx");
    expect(preview).toContain('title: "홈택스 연말정산 미리보기 이용법 — 오픈 시점·절차·확인 포인트",');
    expect(preview).not.toMatch(/yearEndLeadTitle|yearEndToolTitle/);
  });
});
