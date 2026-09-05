// 홈 시즌 배너 캘린더 회귀 테스트 (2026-09-05 L13a)
//
// jsdom 없음 — src/lib/seasonalCalendar.ts 의 순수 함수만 검증한다.
// 컴포넌트(SeasonalBanner.tsx) 렌더 테스트는 금지 (신규 의존성 최소화).
//
// 배경: find() 첫 매치 규칙이라 days 범위 겹침·순서 실수가 조용히 다른 배너를
// 노출시킨다. 또 10월 항목 부재로 홈 배너가 한 달 비어 있었다(2026-09 감사).

import { describe, expect, it } from "vitest";
import {
  SEASONAL_CALENDAR,
  getCurrentSeasonal,
  getDaysLeft,
} from "@/lib/seasonalCalendar";

/** 로컬 정오 — 타임존 경계와 무관하게 해당 날짜로 고정 */
const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12, 0, 0);

// [라벨, 기대 href, 날짜] — 라벨·href 가 테스트 이름에 찍히도록 순서 고정
const CASES: [string, string, Date][] = [
  ["10/1", "/year-end-tax-preview", at(2026, 10, 1)],
  ["10/15", "/year-end-tax-preview", at(2026, 10, 15)],
  ["10/31", "/year-end-tax-preview", at(2026, 10, 31)],
  ["11/1", "/year-end-tax-2027", at(2026, 11, 1)],
  ["12/15", "/year-end-tax-2027", at(2026, 12, 15)],
  ["1/2", "/year-end-tax-2027", at(2027, 1, 2)],
  ["1/15", "/credit-card-deduction-2026", at(2027, 1, 15)],
  ["1/31", "/credit-card-deduction-2026", at(2027, 1, 31)],
  ["2/1", "/medical-tax-credit-2026", at(2027, 2, 1)],
  ["2/16", "/new-employee-2026", at(2027, 2, 16)],
  ["9/25", "/chuseok-bonus-2026", at(2026, 9, 25)],
  ["9/27", "/property-holding-tax-2026", at(2026, 9, 27)],
];

describe("getCurrentSeasonal — 날짜별 기대 href", () => {
  it.each(CASES)("%s → %s", (_label, href, date) => {
    expect(getCurrentSeasonal(date)?.href).toBe(href);
  });

  it("연중 어느 날도 배너가 비지 않는다 (10월 공백 재발 방지)", () => {
    for (let m = 1; m <= 12; m++) {
      const last = new Date(2026, m, 0).getDate();
      for (let d = 1; d <= last; d++) {
        expect(getCurrentSeasonal(at(2026, m, d)), `${m}/${d}`).not.toBeNull();
      }
    }
  });
});

describe("SEASONAL_CALENDAR — 순서·카피 불변식", () => {
  it("같은 달에서 days 범위 항목이 월 전체 항목보다 앞에 온다 (find 첫 매치)", () => {
    for (let m = 1; m <= 12; m++) {
      const inMonth = SEASONAL_CALENDAR.filter((s) => s.month.includes(m));
      const firstWhole = inMonth.findIndex((s) => !s.days);
      const lastRanged = inMonth.reduce(
        (acc, s, i) => (s.days ? i : acc),
        -1
      );
      if (firstWhole !== -1 && lastRanged !== -1) {
        expect(
          lastRanged,
          `${m}월: days 항목이 월 전체 항목 뒤에 있어 절대 노출되지 않음`
        ).toBeLessThan(firstWhole);
      }
    }
  });

  it("10월 항목: /year-end-tax-preview 단일, 날짜·카운트다운·deadline 없음", () => {
    const oct = SEASONAL_CALENDAR.filter((s) => s.month.includes(10));
    expect(oct).toHaveLength(1);
    const [entry] = oct;
    expect(entry.href).toBe("/year-end-tax-preview");
    expect(entry.deadline).toBeUndefined();
    expect(entry.days).toBeUndefined();
    // 국세청 미리보기 오픈일 미확인 — "10/31", "11월 1일", "10월", "D-3" 류 금지
    const datePattern = /\d{1,2}\/\d{1,2}|\d{1,2}월|\d{1,2}일|D-\d/;
    for (const text of [entry.title, entry.subtitle, entry.cta]) {
      expect(text, text).not.toMatch(datePattern);
    }
  });

  it("11·12·1월 항목이 2027 허브를 가리키고 연도 프레임을 명시한다", () => {
    const hub = SEASONAL_CALENDAR.find(
      (s) => s.month.includes(11) && s.month.includes(12) && s.month.includes(1)
    );
    expect(hub?.href).toBe("/year-end-tax-2027");
    expect(hub?.title).toContain("2027 연말정산(2026년 귀속)");
    expect(
      SEASONAL_CALENDAR.some((s) => s.href === "/year-end-tax-settlement-2026")
    ).toBe(false);
  });
});

describe("getDaysLeft — now 주입", () => {
  it("12/15 정오 기준 12/31 마감은 D-17 (당일 23:59:59 까지 올림)", () => {
    expect(getDaysLeft({ month: 12, day: 31 }, at(2026, 12, 15))).toBe(17);
  });

  it("지난 마감은 null — 배지를 그리지 않는다 (9/26 D-0, 1월 초 D-365 재발 방지)", () => {
    // 추석 항목(days 1~26, 마감 9/25)이 9/26 에 노출될 때 D-0 긴급 배지가 찍히면 안 된다
    expect(getDaysLeft({ month: 9, day: 25 }, at(2026, 9, 26))).toBeNull();
    expect(getDaysLeft({ month: 9, day: 25 }, at(2026, 9, 27))).toBeNull();
    // 11~1월 허브 항목(마감 12/31)을 1월 초에 보면 작년 마감 = 이미 지남
    expect(getDaysLeft({ month: 12, day: 31 }, at(2027, 1, 2))).toBeNull();
    expect(getDaysLeft({ month: 12, day: 31 }, at(2027, 1, 14))).toBeNull();
  });

  it("마감 당일과 창 안의 날짜는 정상 계산된다", () => {
    expect(getDaysLeft({ month: 12, day: 31 }, at(2026, 12, 31))).toBe(1);
    expect(getDaysLeft({ month: 12, day: 31 }, at(2026, 11, 1))).toBe(61);
    expect(getDaysLeft({ month: 9, day: 30 }, at(2026, 8, 20))).toBe(42);
  });

  it("deadline 은 노출 창의 각 달에서 6개월 미만 앞에 있다 (6개월 규칙의 전제)", () => {
    // 창이 해를 넘기는 항목([11,12,1]의 12/31)은 1월에서 '작년 마감'으로 읽혀야 하므로
    // 마감 달보다 뒤인 달(m > deadline.month)은 검사 대상이 아니다.
    for (const s of SEASONAL_CALENDAR) {
      if (!s.deadline) continue;
      for (const m of s.month) {
        const gap = s.deadline.month - m;
        if (gap >= 6) {
          // 1월에서 12/31 을 보는 해 넘김 창 — 12월을 포함하는 창에서만 허용
          expect(s.month).toContain(12);
        } else {
          // 마감은 창의 달과 같거나 그 다음 달(추석 8월 창의 9/25)까지만
          expect(gap).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});
