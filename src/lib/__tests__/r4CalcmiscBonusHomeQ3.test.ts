// N2-calc-21 (R4, 2026-11-18, 운영자 승인 2026-11-17): /calc/bonus-home-plan 영업이익 시나리오 기준을 2026년 상반기에서
// 1~3분기 누적으로(삼성전자는 DS부문). 값은 DART 3분기보고서(2026-11-16 접수)에서 직접 대조한 백만원 단위.
import { describe, expect, it } from "vitest";
import {
  SAMSUNG_DS_OP_2026,
  SAMSUNG_OP,
  SAMSUNG_Q3_2026_MILLION,
  SK_OP_2026,
  SK_Q3_2026_MILLION,
  toTril1,
} from "@/lib/bonusHome/opActuals";
import { Q1_Q3_2026_PROFIT_TRIL } from "@/app/calc/sk-hynix-bonus/psData";

describe("DART 3분기보고서 실적 (opActuals)", () => {
  it("삼성전자 1~3분기 연결 254.2조(254,165,691 백만원) · 3분기 107.4조 · DS부문 1~3분기 249.4조 · DS 3분기 106.5조", () => {
    expect(SAMSUNG_OP.q1q3_2026.millionWon).toBe(254_165_691);
    expect(toTril1(SAMSUNG_OP.q1q3_2026.millionWon)).toBe(254.2);
    expect(SAMSUNG_Q3_2026_MILLION).toBe(107_440_482);
    expect(toTril1(SAMSUNG_Q3_2026_MILLION)).toBe(107.4);
    expect(toTril1(SAMSUNG_DS_OP_2026.q1q3.millionWon)).toBe(249.4);
    expect(toTril1(SAMSUNG_DS_OP_2026.q3.millionWon)).toBe(106.5);
    // DS 는 전사보다 작다(DX·SDC·Harman 몫)
    expect(SAMSUNG_DS_OP_2026.q1q3.millionWon).toBeLessThan(SAMSUNG_OP.q1q3_2026.millionWon);
  });

  it("SK하이닉스 1~3분기 181.5조(181,486,709 백만원)는 뉴스룸 세 분기 합(psData)과 같고 3분기는 83.3조", () => {
    expect(SK_OP_2026.q1q3.millionWon).toBe(181_486_709);
    expect(toTril1(SK_OP_2026.q1q3.millionWon)).toBe(Q1_Q3_2026_PROFIT_TRIL);
    expect(SK_Q3_2026_MILLION).toBe(83_333_818);
    expect(toTril1(SK_Q3_2026_MILLION)).toBe(83.3);
  });

  it("모든 기간에 DART 접수번호(14자리)와 접수일이 있고, 3분기 자료는 2026-11-16 분기보고서", () => {
    const periods = [...Object.values(SAMSUNG_OP), ...Object.values(SAMSUNG_DS_OP_2026), ...Object.values(SK_OP_2026)];
    for (const p of periods) {
      expect(p.source.rcpNo, p.label).toMatch(/^\d{14}$/);
      expect(p.source.filedAt, p.label).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.source.rcpNo.slice(0, 8), p.label).toBe(p.source.filedAt.replaceAll("-", ""));
    }
    expect(SAMSUNG_OP.q1q3_2026.source).toEqual({ doc: "삼성전자 분기보고서 (2026.09)", rcpNo: "20261116001482", filedAt: "2026-11-16" });
    expect(SAMSUNG_DS_OP_2026.q1q3.source).toBe(SAMSUNG_OP.q1q3_2026.source);
    expect(SK_OP_2026.q1q3.source).toEqual({ doc: "SK하이닉스 분기보고서 (2026.09)", rcpNo: "20261116001715", filedAt: "2026-11-16" });
  });
});
