// /calc/year-end-bonus-tax 귀속연도 정정 회귀 가드 (2026-11-15 N2-calc-01 — calc-b01-M01·calc-b01-F01)
//
// 1) 접힌 FAQ 두 개와 메타·JSON-LD 설명이 '1월에 받으면 다음해 소득'을 전제로 하던 것을 귀속연도 기준으로 정정.
//    근거: 국세청 근로소득 수입시기(급여 = 근로제공일이 속한 연도), 사전-2025-법규소득-1070(2026-03-11 답변 —
//    개인별 지급액이 확정된 뒤 일부를 다음해 이후에 나눠 지급해도 확정된 연도가 귀속연도). 사이트 가이드
//    /guides/bonus-payout-timing-2026 과 같은 결론.
// 2) 두 카드가 현행 포인터(2026) 요율로 계산한다는 공개 문장 — 2027 요율 표시는 연도 정본에서 파생하고,
//    포인터가 2026 일 때만 붙는다(1/1 전환 뒤 자동으로 빠짐).
// 화면 첫 그림(광고 위)에는 변화가 없다: FAQ 는 닫힌 <details>, 나머지는 메타·JSON-LD.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { INSURANCE_RATES_BY_YEAR, rateLabels } from "@/config/currentRates";

const src = readFileSync(resolve(process.cwd(), "src/app/calc/year-end-bonus-tax/page.tsx"), "utf8");
const flat = src.replace(/\s*\r?\n\s*/g, " ");

describe("year-end-bonus-tax 귀속연도 정정 (N2-calc-01)", () => {
  it("접힌 FAQ — 귀속연도 기준·국세청 사전답변 번호, 입금일만 미뤄도 소득 연도는 그대로", () => {
    expect(flat).toContain("보너스가 어느 해 소득인지(귀속연도)가 먼저입니다.");
    expect(flat).toContain("올해 금액이 정해진 보너스는 1월에 입금돼도 올해 연봉에 합산됩니다.");
    expect(flat).toContain("입금일만 다음해로 미룬다고 소득 연도가 바뀌지는 않습니다");
    expect(flat).toContain("사전-2025-법규소득-1070");
    expect(flat).not.toContain("회사가 일부를 다음해로 이연 지급하면 다음해 소득에 합산");
    expect(flat).not.toContain("1월 수령이 유리할 수 있습니다");
  });

  it("메타 설명은 '귀속연도가 기준', JSON-LD 설명은 귀속연도 비교 — 제목은 그대로", () => {
    expect(flat).toContain("지급일이 아니라 귀속연도가 기준입니다. 2026년 누진세율 기준.");
    expect(flat).toContain('description: "귀속연도(올해·다음해)에 따른 보너스 세금·실수령액 차이를 비교 계산합니다."');
    expect(flat).not.toContain("일시 지급과 분할 지급 중 어느 쪽이 절세에 유리한지");
    expect(flat).toContain('name: "연말 보너스 세금 계산기"');
  });

  it("2027 요율 공개 문장은 CURRENT_RATES_YEAR === 2026 일 때만, 요율은 연도 정본에서 파생", () => {
    expect(flat).toMatch(/CURRENT_RATES_YEAR === 2026\s*\?\s*` 두 경우 모두 2026년 4대보험 요율로 계산했으며/);
    expect(flat).toContain("const R27 = rateLabels(INSURANCE_RATES_BY_YEAR[2027]);");
    expect(flat).toContain("2027년 국민연금 ${R27.pension}·장기요양 ${R27.ltcRatio}(건강보험료 대비)");
    // 파생 결과가 확정 요율(국민연금 근로자 5.0%, 장기요양 건보료 대비 13.9%)과 같다
    const r27 = rateLabels(INSURANCE_RATES_BY_YEAR[2027]);
    expect(r27.pension).toBe("5.0%");
    expect(r27.ltcRatio).toBe("13.9%");
  });

  it("'최대 약 0.3%' — 2027 근로자 국민연금 인상분 + 장기요양 인상분이 보너스의 0.3% 를 넘지 않는다", () => {
    const r26 = INSURANCE_RATES_BY_YEAR[2026];
    const r27 = INSURANCE_RATES_BY_YEAR[2027];
    const extra =
      (r27.NATIONAL_PENSION - r26.NATIONAL_PENSION) +
      (r27.HEALTH_INSURANCE * r27.LONG_TERM_CARE_RATIO - r26.HEALTH_INSURANCE * r26.LONG_TERM_CARE_RATIO) +
      (r27.HEALTH_INSURANCE - r26.HEALTH_INSURANCE) +
      (r27.EMPLOYMENT_INSURANCE - r26.EMPLOYMENT_INSURANCE);
    expect(extra).toBeGreaterThan(0.0025);
    expect(extra).toBeLessThanOrEqual(0.003);
  });
});
