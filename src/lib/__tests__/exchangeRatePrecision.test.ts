// 환율 영향 계산기 환율 문자열 정밀도 회귀 가드 (2026-10-05 감사 code23-04, 9a898bf61 중 문자열 부분)
// 표본: Frankfurter 2025-10-03 EUR 기준 응답 {"KRW":1649.29,"USD":1.1734} (9a898bf61 작성 시 2026-10-05 조회)
// 과거 환율 요청 방식과 구매력 환산(exchangeMath)은 바꾸지 않았다 — 그쪽은 exchangeMath.test.ts·exchangeRequestLifecycle.test.ts.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { formatRateString } from "@/lib/exchangeRatePrecision";

describe("환율 문자열 — 1 미만은 유효숫자 6자리", () => {
  it("0.000711458… → 0.000711458 (종전 0.0007), 1 이상은 종전과 같은 소수 4자리", () => {
    expect(formatRateString(1.1734 / 1649.29)).toBe("0.000711458");
    expect(formatRateString(1344.6)).toBe("1344.6000");
    expect(formatRateString(9.5)).toBe((9.5).toFixed(4));
    expect(formatRateString(1)).toBe("1.0000");
  });
  it("0·음수·NaN·Infinity 는 0", () => {
    for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) expect(formatRateString(bad)).toBe("0");
  });
  it("가짜 0% 가 사라진다 — 과거·현재 KRW→USD 가 다르면 변동률도 0 이 아니다", () => {
    const past = parseFloat(formatRateString(1.1734 / 1649.29));
    const current = parseFloat(formatRateString(1 / 1344.6));
    const change = (past / current - 1) * 100;
    expect(Math.abs(change)).toBeGreaterThan(1);
    // 종전 toFixed(4): 0.0007 / 0.0007 → 0.00%
    expect(parseFloat((1.1734 / 1649.29).toFixed(4)) / parseFloat((1 / 1344.6).toFixed(4))).toBe(1);
  });
});

describe("컴포넌트가 도우미를 쓴다", () => {
  it("과거·현재 환율 문자열 모두 formatRateString 으로 저장한다", () => {
    const src = readFileSync(resolve(process.cwd(), "src/components/ExchangeRateDisplay.tsx"), "utf8");
    expect(src).toContain("setManualPastRateStr(formatRateString(pastRateValue))");
    expect(src).toContain("setManualCurrentRateStr(formatRateString(currentRateValue))");
    expect(src).not.toMatch(/RateValue\??\.toFixed\(4\)/);
  });
});
