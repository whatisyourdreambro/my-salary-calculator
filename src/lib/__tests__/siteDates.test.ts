// src/lib/__tests__/siteDates.test.ts
//
// 신선도 기준일 단일 소스 회귀 가드 (2026-09-05, naver-onpage-2 · L18' 위생 하위 항목).
//  - 상수 값은 손으로만 올린다(today() 승격 금지) — 값 고정 스냅샷
//  - 홈 WebApplication dateModified 는 G3(2026-11-01)부터 STATIC_LAST_MODIFIED 가 아니라 넘겨받은 날짜
//    (홈 page.tsx 가 sitemap staticRouteLastModified("/") 를 넘긴다 — structuredDataTrust.test.ts 가 사이트맵과 대조)
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

  it("webApplicationLd dateModified 는 넘겨받은 날짜를 한국 시각 ISO 로 싣는다 (datePublished 불변, 기본값 없음)", () => {
    const ld = webApplicationLd({ dateModified: new Date("2026-10-19T00:00:00+09:00") }) as { datePublished?: string; dateModified?: string };
    expect(ld.dateModified).toBe("2026-10-19T00:00:00+09:00");
    expect(ld.dateModified).not.toBe(STATIC_LAST_MODIFIED_ISO);
    expect(ld.datePublished).toBe("2024-12-01");
  });

  it("TAX_TABLE_EFFECTIVE_DATE 는 YYYY-MM-DD 문자열이며 실제 반영 커밋일(A17 간이세액표 엔진 2026-09-25)이다", () => {
    expect(TAX_TABLE_EFFECTIVE_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(TAX_TABLE_EFFECTIVE_DATE).toBe("2026-09-25");
    expect(Number.isNaN(new Date(TAX_TABLE_EFFECTIVE_DATE).getTime())).toBe(false);
  });
});
