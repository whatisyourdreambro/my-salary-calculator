// /calc/bonus-home-plan 영업이익 실적·시나리오 규칙 회귀 (2026-09-27)
// 기대값은 2026년 1~3분기 누적(삼성 DS부문 249.4조·SK 181.5조, DART 3분기보고서 2026-11-16)에 규칙을 손으로 곱해 0.1조 반올림한 값이다.
// 2026-11-18 N2-calc-21(운영자 승인 2026-11-17): 종전 기준(상반기 삼성 146.7조·SK 98.2조, 보수 × 1.5·기본 × 2)의 기대값을 새 규칙 값으로 바꿨다.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  Q1_Q3_2026_TENTHS,
  SAMSUNG_OP,
  SAMSUNG_OP_HISTORY,
  SAMSUNG_Q2_2026_MILLION,
  SK_OP_2026,
  SK_OP_HISTORY,
  SK_Q2_2026_MILLION,
  toTril1,
} from "@/lib/bonusHome/opActuals";
import { companyScenarioOps, FISCAL_YEARS, PAYOUT_YEARS, q1q3Tril } from "@/lib/bonusHome/scenarios";
import { SK_2026_Q } from "@/lib/guides/bonusKeeperFigures";

describe("영업이익 실적 (DART)", () => {
  it("삼성전자 2025 연간 43.6조 · 2026 1분기 57.2조 · 2분기 89.5조 · 상반기 146.7조", () => {
    expect(toTril1(SAMSUNG_OP.fy2025.millionWon)).toBe(43.6);
    expect(toTril1(SAMSUNG_OP.q1_2026.millionWon)).toBe(57.2);
    expect(toTril1(SAMSUNG_Q2_2026_MILLION)).toBe(89.5);
    expect(toTril1(SAMSUNG_OP.h1_2026.millionWon)).toBe(146.7);
    // 회사 발표 '43조6,011억' = 43,601,051 백만원
    expect(Math.round(SAMSUNG_OP.fy2025.millionWon / 100)).toBe(436_011);
  });

  it("SK하이닉스 2026 분기 실적은 회사 발표값(bonusKeeperFigures.SK_2026_Q, 억원)과 일치", () => {
    expect(Math.round(SK_OP_2026.q1.millionWon / 100)).toBe(SK_2026_Q.q1.opEok);
    expect(Math.round(SK_Q2_2026_MILLION / 100)).toBe(SK_2026_Q.q2.opEok);
    expect(toTril1(SK_OP_2026.h1.millionWon)).toBe(98.2);
  });

  it("시나리오 기준(1~3분기 누적, 삼성은 DS부문)은 0.1조 정수", () => {
    expect(Q1_Q3_2026_TENTHS).toEqual({ samsung: 2494, sk: 1815 });
    expect(q1q3Tril("samsung")).toBe(249.4);
    expect(q1q3Tril("sk")).toBe(181.5);
  });

  it("과거 실적(참고): SK 2021~2025 연간(2023 −7.7 포함) + 2026 상반기·3분기·1~3분기, 삼성 2025 연간 + 2026 상반기·3분기·1~3분기(연결)", () => {
    expect(SK_OP_HISTORY.map((r) => r.tril)).toEqual([12.4, 6.8, -7.7, 23.5, 47.2, 98.2, 83.3, 181.5]);
    expect(SAMSUNG_OP_HISTORY.map((r) => r.tril)).toEqual([43.6, 146.7, 107.4, 254.2]);
    expect(SAMSUNG_OP_HISTORY.some((r) => r.label.startsWith("2024"))).toBe(false);
  });
});

describe("시나리오 규칙 (가정)", () => {
  it("연도 축: 귀속 2026~2030 → 지급 2027~2031", () => {
    expect([...FISCAL_YEARS]).toEqual([2026, 2027, 2028, 2029, 2030]);
    expect([...PAYOUT_YEARS]).toEqual([2027, 2028, 2029, 2030, 2031]);
  });

  it("삼성전자", () => {
    expect(companyScenarioOps("samsung", "conservative")).toEqual([249.4, 174.6, 122.2, 85.5, 59.9]);
    expect(companyScenarioOps("samsung", "base")).toEqual([332.5, 332.5, 332.5, 332.5, 332.5]);
    expect(companyScenarioOps("samsung", "optimistic")).toEqual([332.5, 365.8, 402.4, 442.6, 486.9]);
  });

  it("SK하이닉스", () => {
    expect(companyScenarioOps("sk", "conservative")).toEqual([181.5, 127.1, 88.9, 62.3, 43.6]);
    expect(companyScenarioOps("sk", "base")).toEqual([242, 242, 242, 242, 242]);
    expect(companyScenarioOps("sk", "optimistic")).toEqual([242, 266.2, 292.8, 322.1, 354.3]);
  });
});

// ── 가드: 컨센서스·임의 가정 영업이익을 끌어오지 않는다 ─────────────────────
const SCAN_DIRS = ["src/lib/bonusHome", "src/app/calc/bonus-home-plan"];
function* walk(dir: string): Generator<string> {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (/\.(ts|tsx)$/.test(name)) yield p;
  }
}

describe("가드 — 증권사 컨센서스·임의 가정 영업이익 import 금지", () => {
  it("bonusHome 소스는 psData PROFIT_SCENARIOS·DEFAULT_PROFIT_TRILLION, samsung annualOp 를 쓰지 않는다", () => {
    const files = SCAN_DIRS.flatMap((d) => [...walk(resolve(process.cwd(), d))]);
    expect(files.length).toBeGreaterThan(1);
    for (const f of files) {
      // 주석(설명 문장)은 빼고 코드만 본다 — 규칙 설명에 '컨센서스 250조를 쓰지 않는다'를 적을 수 있게
      const code = readFileSync(f, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .split(/\r?\n/)
        .filter((l) => !/^\s*(\/\/|\*)/.test(l))
        .join("\n");
      expect(code, f).not.toMatch(/PROFIT_SCENARIOS|DEFAULT_PROFIT_TRILLION|initialProfitTrillion|ANNUAL_OP_2026_PRELIM/);
      expect(code, f).not.toMatch(/samsung-bonus\/annualOp/);
    }
  });
});
