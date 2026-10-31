// /calc/housing-subscription 회귀 가드 (2026-10-05 감사 code2-01·code2-03)
// 출처: 조세특례제한법 제87조 제2항(시행 2026.9.18 판, law.go.kr) — 총급여 7천만원 이하, 해당 과세기간 중 주택을
// 소유하지 않은 세대의 세대주 또는 세대주의 배우자, 연 300만원 x 40%. 제3항 — 청년우대형 비과세는 직전 과세기간
// 총급여 3천6백만원 이하(그래서 FAQ 의 '소득 3,600만원 이하' 는 비과세 요건으로 맞다).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { calcHousingSubscriptionSaving } from "@/lib/housingSubscriptionSaving";

describe("절세액 = 정본 엔진 결정세액 차이 + 지방소득세 (1인 가구)", () => {
  // 2026-11-01 엔진이 표준세액공제(13만원) 방식과 비교한다(CALC-02) — 3,000만원은 두 경우 모두 표준세액공제 방식이라
  // 89,100 → 99,756. 2,000만원(6% 구간)과 3,500만원 이상(특별공제 방식, 15% 구간)은 그대로다.
  it("재계산값 — 2,000만 35,640 / 3,000만 99,756 / 3,500만~7,000만 198,000", () => {
    expect(calcHousingSubscriptionSaving(250_000, 20_000_000).taxSaving).toBe(35_640);
    expect(calcHousingSubscriptionSaving(250_000, 30_000_000).taxSaving).toBe(99_756);
    for (const s of [35_000_000, 50_000_000, 55_000_000, 70_000_000]) {
      expect(calcHousingSubscriptionSaving(250_000, s).taxSaving).toBe(198_000);
    }
  });
  it("공제 대상 슬라이더 구간 어디서도 24% 가정값(288,000)이 나오지 않는다", () => {
    for (let s = 20_000_000; s <= 70_000_000; s += 5_000_000) {
      const r = calcHousingSubscriptionSaving(250_000, s);
      expect(r.taxSaving).toBeLessThanOrEqual(198_000);
      expect(r.deduction).toBe(1_200_000);
    }
  });
  it("7천만원 초과는 공제 0, 연 300만원 한도", () => {
    const over = calcHousingSubscriptionSaving(250_000, 75_000_000);
    expect(over.eligibleForDeduction).toBe(false);
    expect(over.taxSaving).toBe(0);
    const big = calcHousingSubscriptionSaving(500_000, 50_000_000);
    expect(big.annualPayment).toBe(3_000_000);
    expect(big.yearlyContribution).toBe(6_000_000);
  });
});

describe("문구", () => {
  const client = readFileSync(resolve(process.cwd(), "src/app/calc/housing-subscription/Client.tsx"), "utf8");
  const page = readFileSync(resolve(process.cwd(), "src/app/calc/housing-subscription/page.tsx"), "utf8");
  const counts = (s: string) => ({
    hangul: [...s].filter((c) => /[가-힣]/.test(c)).length,
    other: [...s].filter((c) => !/[가-힣]/.test(c)).length,
  });
  it("결과 부제 — 한계세율 표기 제거, 글자 수 원문 이하 (결과 광고 위)", () => {
    expect(client).not.toContain("× 한계세율");
    expect(client).not.toContain("marginalRate");
    expect(client).toContain("원 공제 · 지방세 포함");
    const before = counts("소득공제 1,200,000원 × 한계세율 15%");
    const after = counts("1,200,000원 공제 · 지방세 포함");
    expect(after.hangul).toBeLessThanOrEqual(before.hangul);
    expect(after.other).toBeLessThanOrEqual(before.other);
  });
  it("본문 요건 목록 — 7.2만~52.8만 → 0~19.8만 (본문 광고 위, 글자 수 원문 이하)", () => {
    expect(page).toContain("<li>과세표준에 따라 절세액 0~19.8만원</li>");
    const before = counts("한계세율에 따라 절세액 7.2만~52.8만원");
    const after = counts("과세표준에 따라 절세액 0~19.8만원");
    expect(after.hangul).toBeLessThanOrEqual(before.hangul);
    expect(after.other).toBeLessThanOrEqual(before.other);
  });
  it("접힌 FAQ — 1주택 일부 가능 삭제, 과세기간 내내 무주택, 세대주 배우자 포함, 24% 예시 삭제", () => {
    expect(page).not.toContain("1세대 1주택자도 일정 조건");
    expect(page).not.toContain("한계세율 24%면 약 28.8만원");
    expect(page).toContain("세대주의 배우자 포함");
    expect(page).toContain("그해 중에 집을 팔았다면 그해 납입분은 공제되지 않습니다");
    // 청년우대형 비과세 요건 3,600만원은 조특법 제87조 제3항 그대로 — 유지
    expect(page).toContain("소득 3,600만원 이하");
  });
  it("접힌 FAQ 절세 예시 — 엔진 값과 같다 (3,500만~7,000만 19.8만, 3,000만 약 10만)", () => {
    expect(page).toContain("총급여 3,500만~7,000만원에서 절세액이 약 19.8만원(지방소득세 포함), 3,000만원이면 약 10만원입니다");
    expect(page).not.toContain("약 8.9만원");
    for (let s = 35_000_000; s <= 70_000_000; s += 1_000_000) {
      expect(calcHousingSubscriptionSaving(250_000, s).taxSaving).toBe(198_000);
    }
    expect(Math.round(calcHousingSubscriptionSaving(250_000, 30_000_000).taxSaving / 10_000)).toBe(10);
  });
});
