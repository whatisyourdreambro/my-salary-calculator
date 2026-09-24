// src/lib/__tests__/companyRepositoryLastUpdated.test.ts
//
// CompanyRepository.enrich lastUpdated 파생 규칙 회귀 가드 (2026-09-05, naver-onpage-6):
//   lastUpdated = max(데이터 파일 lastUpdated, DART 주입일(주입사만), TAX_TABLE_EFFECTIVE_DATE)
//  - 전 회사가 실수령액 재계산일(TAX_TABLE_EFFECTIVE_DATE, 2026-09-25 A17 간이세액표 엔진) 이상
//  - DART 주입사(수기 disclosed 없음)는 DART_INJECTION_DATE 이상
//  - 데이터 파일 날짜가 더 최신이면 그 값을 유지(max — 하향 금지)
//  - 형식은 기존 데이터와 같은 "YYYY-MM-DD" 문자열, today() 승격 없음
import { describe, expect, it } from "vitest";

import { allCompanies } from "@/data/companies";
import { dartInjection, DART_INJECTION_DATE } from "@/data/dart/dartInjection";
import { TAX_TABLE_EFFECTIVE_DATE } from "@/config/siteDates";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";

const day = (s: string) => new Date(s).getTime();
const rawById = new Map(allCompanies.map((c) => [c.id, c]));
const enriched = companyRepository.getAll();

describe("CompanyRepository lastUpdated 파생", () => {
  it("전 회사 lastUpdated 는 YYYY-MM-DD 이며 TAX_TABLE_EFFECTIVE_DATE 이상이다", () => {
    expect(enriched.length).toBe(allCompanies.length);
    for (const c of enriched) {
      expect(c.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(day(c.lastUpdated)).toBeGreaterThanOrEqual(day(TAX_TABLE_EFFECTIVE_DATE));
    }
  });

  it("DART 주입사(수기 disclosed 없음)는 DART_INJECTION_DATE 이상", () => {
    const injected = enriched.filter((c) => !rawById.get(c.id)?.disclosed && dartInjection[c.id]);
    expect(injected.length).toBeGreaterThan(200);
    for (const c of injected) {
      expect(day(c.lastUpdated)).toBeGreaterThanOrEqual(day(DART_INJECTION_DATE));
      expect(c.disclosed?.sourceUrl).toContain("dart.fss.or.kr");
    }
  });

  it("데이터 파일 날짜가 더 최신이면 그대로 유지(max — 하향 없음), 오래되면 하한으로 승격", () => {
    for (const c of enriched) {
      const raw = rawById.get(c.id)!;
      expect(day(c.lastUpdated)).toBeGreaterThanOrEqual(day(raw.lastUpdated));
      // 주입사 하한 = max(DART 주입일, 실수령액 재계산일) — 두 하한 중 늦은 쪽
      const injectedFloor =
        day(DART_INJECTION_DATE) >= day(TAX_TABLE_EFFECTIVE_DATE) ? DART_INJECTION_DATE : TAX_TABLE_EFFECTIVE_DATE;
      const floor = raw.disclosed || !dartInjection[c.id] ? TAX_TABLE_EFFECTIVE_DATE : injectedFloor;
      const expected = day(raw.lastUpdated) >= day(floor) ? raw.lastUpdated : floor;
      expect(c.lastUpdated).toBe(expected);
    }
  });

  it("today() 승격이 없다 — 어떤 회사도 오늘보다 늦은 날짜를 갖지 않고, 값 집합이 유한하다", () => {
    // "YYYY-MM-DD" 는 UTC 자정으로 파싱돼 KST 오전 9시 전에는 오늘 날짜가 Date.now() 보다 늦다 — 하루 여유
    const now = Date.now() + 86_400_000;
    const values = new Set(enriched.map((c) => c.lastUpdated));
    for (const v of values) expect(day(v)).toBeLessThanOrEqual(now);
    // 파생 규칙상 하한 2종 + 데이터 파일의 최신 값들만 남는다
    expect(values.has(TAX_TABLE_EFFECTIVE_DATE)).toBe(true);
    // DART 주입일은 실수령액 재계산일보다 늦을 때만 하한으로 남는다(지금은 재계산일이 더 늦어 전 회사가 그 값 이상)
    if (day(DART_INJECTION_DATE) > day(TAX_TABLE_EFFECTIVE_DATE)) {
      expect(values.has(DART_INJECTION_DATE)).toBe(true);
    }
    expect([...values].some((v) => day(v) < day(TAX_TABLE_EFFECTIVE_DATE))).toBe(false);
  });
});
