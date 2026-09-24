// src/lib/__tests__/healthRate2027Freeze.test.ts
//
// 2027 건강보험료율 동결 확정 반영 가드 (2026-09-25, 키트 docs/drafts/health-rate-2027-kit.md 분기 B).
// 근거: 보건복지부 보도자료 2026-09-08(보험정책과) — 2026년 제15차 건정심이 2027년도 건강보험료율을
// 올해와 같은 7.19%로 동결 의결. 2027 장기요양보험료율은 아직 미결정(장기요양위원회 별도 의결).
//
// 지키는 것
// 1) 정본 값: 동결이므로 NET_SALARY_RATES_2027.health 는 2026 정본(0.03595)을 그대로 참조한다.
//    이 값이 바뀌면(예: 착오 인상 반영) 아래 페이지들의 "동결" 문구와 어긋나므로 함께 고쳐야 한다.
// 2) 문구: 2027 요율표·실수령액 표 4종·공통 배너에 "건강보험 미확정/2026 준용" 계열 옛 문구가 남지 않는다.
// 3) 장기요양은 여전히 미확정 고지를 유지한다(지우면 실패 — 12월 고시 전까지 준용 표기 필수).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { NET_SALARY_RATES_2027 } from "@/lib/generateData2027";
import { INSURANCE_RATES_2026 } from "@/lib/taxConstants2026";

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");
// JSX 줄바꿈으로 문장이 쪼개져도 잡히도록 공백을 한 칸으로 접는다
const flat = (rel: string) => read(rel).replace(/\s+/g, " ");

const RATES_PAGE = "src/app/social-insurance-rates-2027/page.tsx";
const TABLE_LAYOUT = "src/app/table/2027/layout.tsx";
const TABLE_PAGES = ["annual", "monthly", "weekly", "hourly"].map(
  (k) => `src/app/table/2027/${k}/page.tsx`
);
const ALL_FILES = [RATES_PAGE, TABLE_LAYOUT, ...TABLE_PAGES, "src/lib/generateData2027.ts"];

// 동결 확정 전(2026-08-30~09-24)에 쓰던 "건강보험 = 미확정·준용" 문구들
const STALE_HEALTH_PHRASES = [
  "건강보험은 확정 전",
  "7.19% (2026 준용)",
  "건강보험(통상",
  "건보는 통상",
  "건강보험·장기요양 요율",
  "건강보험·장기요양은",
  "건강보험·장기요양보험 요율",
  "건강보험·장기요양·산재",
  "건강보험·장기요양 —",
  "건강보험 등 미확정",
  "건강보험은 2026 기준 준용",
  "건강보험·고용보험·소득세(2026 기준 준용)",
  "건보 3.595%=2026 준용",
  "건정심 발표 시 갱신",
];

describe("2027 건강보험료율 동결 확정 (건정심 2026-09-08)", () => {
  it("정본: 2027 건보 근로자 요율은 2026 정본 3.595%를 그대로 참조한다", () => {
    expect(NET_SALARY_RATES_2027.health).toBe(INSURANCE_RATES_2026.HEALTH_INSURANCE);
    expect(NET_SALARY_RATES_2027.health).toBe(0.03595);
  });

  it("장기요양 비율·고용보험은 2027 미결정 — 2026 준용 유지", () => {
    expect(NET_SALARY_RATES_2027.ltcRatio).toBe(INSURANCE_RATES_2026.LONG_TERM_CARE_RATIO);
    expect(NET_SALARY_RATES_2027.employment).toBe(INSURANCE_RATES_2026.EMPLOYMENT_INSURANCE);
  });

  it("옛 '건강보험 미확정·2026 준용' 문구가 2027 페이지 7곳에 남지 않는다", () => {
    const hits: string[] = [];
    for (const file of ALL_FILES) {
      const text = flat(file);
      for (const phrase of STALE_HEALTH_PHRASES) {
        if (text.includes(phrase)) hits.push(`${file}: ${phrase}`);
      }
    }
    expect(hits).toEqual([]);
  });

  it("요율표·표 4종·공통 배너 모두 '동결'을 명시한다", () => {
    const missing = [RATES_PAGE, TABLE_LAYOUT, ...TABLE_PAGES].filter(
      (file) => !flat(file).includes("동결")
    );
    expect(missing).toEqual([]);
  });

  it("요율표 건강보험 카드: 확정 상태·7.19%·근로자/회사 3.595%", () => {
    const text = flat(RATES_PAGE);
    expect(text).toContain('totalRate: "7.19% (2027 동결)"');
    expect(text).toContain('status: "확정 — 2027 동결(2026-09-08 건정심 의결)"');
    expect(text).toMatch(/name: "건강보험", totalRate: "7\.19% \(2027 동결\)", selfRate: "3\.595%", companyRate: "3\.595%"/);
  });

  it("장기요양·산재 미확정 고지는 그대로 남는다", () => {
    const rates = flat(RATES_PAGE);
    expect(rates).toContain('totalRate: "건강보험료의 13.14% (2026 준용)"');
    expect(rates).toContain("미확정(2026 기준 준용):</strong> 장기요양·산재");
    expect(rates).toContain('status: "미확정 — 2027 요율은 통상 12월 고용노동부 고시, 확정 시 갱신"');
    expect(flat(TABLE_LAYOUT)).toContain("미확정(2026 기준 준용):</strong>{\" \"} 장기요양");
  });

  it("표 4종 dataset dateModified 가 동결 반영일로 갱신됐다", () => {
    const stale = TABLE_PAGES.filter((file) => !read(file).includes('dateModified: "2026-09-25"'));
    expect(stale).toEqual([]);
  });
});
