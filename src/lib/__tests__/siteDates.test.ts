// src/lib/__tests__/siteDates.test.ts
//
// 신선도 기준일 단일 소스 회귀 가드 (2026-09-05, naver-onpage-2 · L18' 위생 하위 항목).
//  - webApplicationLd dateModified 는 sitemap STATIC_LAST_MODIFIED 와 같은 상수에서 파생
//  - 상수 값은 손으로만 올린다(today() 승격 금지) — 값 고정 스냅샷
import { describe, expect, it } from "vitest";

import {
  STATIC_LAST_MODIFIED,
  STATIC_LAST_MODIFIED_ISO,
  TAX_TABLE_EFFECTIVE_DATE,
} from "@/config/siteDates";
import { webApplicationLd } from "@/lib/structuredData";

describe("siteDates 단일 소스", () => {
  it("STATIC_LAST_MODIFIED 는 sitemap.ts 에서 호이스팅한 값 그대로다 (2026-07-16)", () => {
    expect(STATIC_LAST_MODIFIED_ISO).toBe("2026-07-16");
    expect(STATIC_LAST_MODIFIED.toISOString()).toBe(new Date("2026-07-16").toISOString());
  });

  it("webApplicationLd dateModified 는 STATIC_LAST_MODIFIED 와 일치한다 (datePublished 불변)", () => {
    const ld = webApplicationLd() as { datePublished?: string; dateModified?: string };
    expect(ld.dateModified).toBe(STATIC_LAST_MODIFIED_ISO);
    expect(ld.datePublished).toBe("2024-12-01");
  });

  it("TAX_TABLE_EFFECTIVE_DATE 는 YYYY-MM-DD 문자열이며 실제 반영 커밋일(e0604ae 2026-07-06)이다", () => {
    expect(TAX_TABLE_EFFECTIVE_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(TAX_TABLE_EFFECTIVE_DATE).toBe("2026-07-06");
    expect(Number.isNaN(new Date(TAX_TABLE_EFFECTIVE_DATE).getTime())).toBe(false);
  });
});
