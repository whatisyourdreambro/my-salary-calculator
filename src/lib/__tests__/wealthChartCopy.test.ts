// 자산 성장 차트(WealthChart) 문구 — /salary/[amount] 416쪽·홈과 /calc/2026-year 결과 (N2-components-03, 2026-11-15)
//
// components-b05-F01: 1억 미만 금액이 '월 19.322만원씩'·'2,142.928만' 처럼 소수 셋째 자리 만원으로 찍혔다
// (천 단위 만원으로 잘못 읽힘). 만원 정수로 반올림하고, 문턱은 반올림 값으로 본다 ('10,000만' 대신 '1.0억').
// 차트는 HomeTopAd·GuideMidAd·SidebarAd 위라 문구는 종전 폭 이하로만 바뀐다.
import { describe, expect, it } from "vitest";

import { formatKRW } from "@/components/WealthChart";

describe("WealthChart formatKRW — 1억 미만은 만원 정수", () => {
  it("패키지 고정값", () => {
    expect(formatKRW(1_728_394)).toBe("173만");
    expect(formatKRW(35_000_000)).toBe("3,500만");
    expect(formatKRW(99_995_000)).toBe("1.0억");
    expect(formatKRW(100_000_000)).toBe("1.0억");
  });

  it("억 단위 값과 0 은 종전과 같다", () => {
    expect(formatKRW(1_000_000_000)).toBe("10.0억");
    expect(formatKRW(150_000_000)).toBe("1.5억");
    expect(formatKRW(0)).toBe("0만");
    expect(formatKRW(25_000_000)).toBe("2,500만");
  });

  it("1억 미만 결과에는 소수점이 없고 종전 문자열보다 길지 않다", () => {
    const old = (value: number) =>
      value >= 100000000 ? `${(value / 100000000).toFixed(1)}억` : `${(value / 10000).toLocaleString("ko-KR")}만`;
    for (const value of [1_932_200, 1_728_394, 21_429_280, 22_346_960, 99_994_999, 3_294_800, 12_345, 99_999_999]) {
      const now = formatKRW(value);
      expect(now).not.toMatch(/\d\.\d+만/);
      expect(now.length).toBeLessThanOrEqual(old(value).length);
    }
  });
});
