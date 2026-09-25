// src/lib/__tests__/yearEndSeasonGuard.test.ts
//
// 연말정산 귀속연도 가드 (SEASON-06, 2026-09-26 W1-A).
// 종전 M07 계획은 12/15 에 YEAR_END_SEASON 을 2027년 귀속으로 바꾸는 '값 교체 슬롯'이었다. 그러면 2026년 소득을
// 정산하는 2027년 1~2월(지급명세서 제출 기한 3월 10일까지) 내내 /year-end-tax 등이 '2027년 귀속'으로 표시된다.
// 2027-03-10(KST)까지의 빌드는 귀속 2026·신고 2027 이어야 한다.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  YEAR_END_ATTRIBUTION_LABEL,
  YEAR_END_FILING_LABEL,
  YEAR_END_SEASON,
} from "@/lib/yearEndSeason";

/** 2027년 귀속 프레임으로 넘어갈 수 있는 첫 시각 */
const SWITCH_AT_KST = Date.parse("2027-03-11T00:00:00+09:00");

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

describe("YEAR_END_SEASON 귀속연도 가드", () => {
  it("2027-03-11 KST 전에는 귀속 2026 · 신고 2027 이다", () => {
    if (Date.now() < SWITCH_AT_KST) {
      expect({ ...YEAR_END_SEASON }).toEqual({ attributionYear: 2026, filingYear: 2027 });
      expect(YEAR_END_ATTRIBUTION_LABEL).toBe("2026년 귀속");
      expect(YEAR_END_FILING_LABEL).toBe("2027년 1~2월 신고");
    } else {
      // 전환 이후에도 과거 귀속으로 되돌아가지 않는다
      expect(YEAR_END_SEASON.attributionYear).toBeGreaterThanOrEqual(2026);
    }
  });

  it("신고연도는 늘 귀속연도 + 1 이다", () => {
    expect(YEAR_END_SEASON.filingYear).toBe(YEAR_END_SEASON.attributionYear + 1);
  });

  it("12/15 값 교체 슬롯 문구가 남아 있지 않다 (전환일은 2027-03-11)", () => {
    const season = read("src/lib/yearEndSeason.ts");
    const limits = read("src/lib/yearEndLimits2026.ts");
    for (const src of [season, limits]) {
      expect(src).not.toMatch(/12\/15/);
      expect(src).toContain("2027-03-11");
    }
    expect(season).toContain("yearEndSeasonGuard.test.ts");
  });
});
