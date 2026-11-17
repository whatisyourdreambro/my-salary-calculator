// /calc/samsung-bonus 관련 카드 '시즌 가이드' — 끝난 임금협상 분석 대신 OPI·TAI 가이드로 (R4 SAMSUNG, RL-18 = 10월 895334845 SJ-09a, 2026-11-18)
//
// 2026 임금협상은 5/27 타결로 끝났다. 카드는 GuideMidAd 아래 · CoupangBanner·레이아웃 광고 위에 보이므로 글이 늘지 않게 쓴다:
// 제목 700·14px 163.66px -> 137.55px, 설명 400·12px 252.75px -> 168.30px. 줄 시뮬레이션 320~1920px(1열·sm 2열)에서
// 줄이 느는 폭 0. 이 커밋만 되돌릴 수 있도록 단언을 이 파일에 따로 둔다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";

const flat = readFileSync(resolve(process.cwd(), "src/app/calc/samsung-bonus/page.tsx"), "utf8").replace(/\s*\r?\n\s*/g, " ");

describe("삼성 성과급 관련 카드 — OPI·TAI 가이드 (RL-18 SJ-09a)", () => {
  it("카드가 살아 있는 가이드를 가리키고 제목·설명이 바뀌었다", () => {
    expect(flat).toContain('href="/guides/samsung-opi-tai-complete-2026"');
    expect(flat).toContain("삼성전자 OPI·TAI 2026 </p>");
    expect(flat).toContain("사업부별 지급률·지급 시기·세후 금액 </p>");
    expect(flat).not.toContain('href="/samsung-negotiation-2026"');
    expect(flat).not.toContain("5가지 핵심 쟁점, 직급별 예상 인상폭");
    expect(koGuides.some((g) => g.slug === "samsung-opi-tai-complete-2026")).toBe(true);
  });

  it("카드는 GuideMidAd 아래에 있다", () => {
    expect(flat.indexOf('href="/guides/samsung-opi-tai-complete-2026"')).toBeGreaterThan(flat.indexOf("<GuideMidAd />"));
  });
});
