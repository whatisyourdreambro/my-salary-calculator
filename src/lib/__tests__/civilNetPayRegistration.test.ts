// 공무원 월급 실수령액 계산기 등재 회귀 가드 (2026-09-27)
//
// 새 전용 라우트는 헤더 검색·사이트맵·연관 계산기·가이드 역링크 카드에만 등재하고,
// 기존 표면(/calc 디렉터리 카드 목록·기존 페이지의 연관 계산기 4종·202종 레지스트리)은 그대로 둔다.
// 기준 목록은 배포본 adb120cc 에서 뽑은 픽스처(fixtures/civilNetPayRegistryBase-adb120cc.json).

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import base from "./fixtures/civilNetPayRegistryBase-adb120cc.json";
import { getDedicatedCalculatorEntries, searchEntries, searchIndex } from "@/lib/searchIndex";
import { getRelatedCalculators } from "@/lib/relatedCalculators";
import { STATIC_CALC_CARDS } from "@/lib/crossLink";
import { allCalculators } from "@/lib/simpleCalculators";
import { SIMPLE_CALC_COUNT } from "@/config/site";

const ROUTE = "/calc/civil-servant-net-pay";

describe("헤더 검색 등재", () => {
  it("'공무원 실수령'·'공무원 월급' 검색 1순위가 새 계산기", () => {
    expect(searchEntries("공무원 실수령")[0]?.href).toBe(ROUTE);
    expect(searchEntries("공무원 월급")[0]?.href).toBe(ROUTE);
    expect(searchIndex.filter((entry) => entry.href === ROUTE)).toHaveLength(1);
  });

  it("/calc 디렉터리 카드 목록(getDedicatedCalculatorEntries)은 adb120cc 와 같다", () => {
    expect(getDedicatedCalculatorEntries().map((entry) => entry.href)).toEqual(base.dedicatedCalculatorHrefs);
  });
});

describe("연관 계산기", () => {
  it("기존 경로 매핑 87개의 추천 결과는 adb120cc 와 같다", () => {
    const entries = Object.entries(base.relatedByPath as Record<string, string[]>);
    expect(entries.length).toBe(87);
    for (const [path, expected] of entries) {
      expect(getRelatedCalculators(path).map((item) => item.path), path).toEqual(expected);
    }
  });

  it("새 계산기는 salary·tax 카테고리 4종을 받고 자기 자신은 제외", () => {
    const got = getRelatedCalculators(ROUTE).map((item) => item.path);
    expect(got).toHaveLength(4);
    expect(got).not.toContain(ROUTE);
    expect(got[0]).toBe("/");
  });
});

describe("레지스트리·사이트맵", () => {
  it("202종 동결 레지스트리에는 넣지 않는다 (전용 정적 라우트)", () => {
    expect(allCalculators.some((calc) => calc.slug === "civil-servant-net-pay")).toBe(false);
    expect(allCalculators.length).toBe(202);
    expect(SIMPLE_CALC_COUNT).toBe(202);
  });

  it("가이드 역링크 카드는 전용 경로로 링크", () => {
    expect(STATIC_CALC_CARDS["civil-servant-net-pay"]?.href).toBe(ROUTE);
  });

  it("사이트맵 정적 목록과 ROUTE_OVERRIDES 에 등재", () => {
    const src = readFileSync(resolve(process.cwd(), "src/app/sitemap.ts"), "utf8");
    expect(src).toContain(` '${ROUTE}',`);
    expect(src).toMatch(new RegExp(`'${ROUTE}': \\{ lastModified: new Date\\('2026-09-27'\\), priority: 0\\.8, changeFrequency: 'monthly' \\}`));
    const ledger = JSON.parse(readFileSync(resolve(process.cwd(), "scripts/url-ledger.snapshot.json"), "utf8"));
    expect(JSON.stringify(ledger)).toContain(`"${ROUTE}"`);
  });
});
