// R4 HOME — N2-lib-10 (감사 lib-b08-F03, 2026-11-18): 홈 시즌 배너 D-day 가 하루 많던 문제.
//
// 종전 getDaysLeft 는 마감일 23:59:59 까지 남은 시간을 올림해 배지가 늘 하루 많았다
// (11/15 에 12/31 마감 D-47, 마감 당일 D-1). 표준국어대사전 '디데이' = 작전 계획에서 공격을 시작하기로 예정한 날
// → 그날이 D-day(D-0), 전날이 D-1. 이제 달력 날짜 차이를 쓴다.
//
// 배지는 광고(Display2Ad) 위 홈 시즌 배너 안에 있다. 이 테스트는 '배지 숫자가 종전보다 커지거나 자릿수가 늘어나는 날이 없다'를
// 1년치 전부 확인한다(광고 위 같은 폭 이하 규칙). 렌더는 SeasonalBanner.tsx 의 'D-{daysLeft}' 그대로 — 'D-Day' 같은 넓은 표기로
// 바꾸지 않는다.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { SEASONAL_CALENDAR, getCurrentSeasonal, getDaysLeft } from "@/lib/seasonalCalendar";

const at = (y: number, m: number, d: number, h = 12, min = 0) => new Date(y, m - 1, d, h, min, 0);

/** 종전 구현(비교용) — 2026-11-18 이전 seasonalCalendar.ts 그대로 */
function legacyDaysLeft(deadline: { month: number; day: number }, now: Date): number | null {
  const nowMonth = now.getMonth() + 1;
  const year = deadline.month - nowMonth >= 6 ? now.getFullYear() - 1 : now.getFullYear();
  const target = new Date(year, deadline.month - 1, deadline.day, 23, 59, 59);
  const diff = target.getTime() - now.getTime();
  if (diff < 0) return null;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const originalTz = process.env.TZ;
afterEach(() => {
  if (originalTz === undefined) delete process.env.TZ;
  else process.env.TZ = originalTz;
});

describe("getDaysLeft — 달력 날짜 차이 (N2-lib-10)", () => {
  it("2026-11-15 에 12/31 마감은 D-46 — 하루 중 시각과 무관", () => {
    for (const [h, min] of [[0, 0], [9, 0], [12, 0], [23, 30], [23, 59]]) {
      expect(getDaysLeft({ month: 12, day: 31 }, at(2026, 11, 15, h, min)), `${h}:${min}`).toBe(46);
    }
  });

  it("마감 당일은 D-0, 전날은 D-1, 다음날은 배지 없음(null)", () => {
    const cases: [{ month: number; day: number }, number][] = [
      [{ month: 12, day: 31 }, 2026],
      [{ month: 6, day: 30 }, 2027], // 자동차세 1기분 기한
      [{ month: 9, day: 30 }, 2027], // 재산세 2기분 기한
      [{ month: 5, day: 31 }, 2027], // 종합소득세 신고 기한
      [{ month: 9, day: 25 }, 2026], // 추석 항목 마감
    ];
    for (const [deadline, y] of cases) {
      const label = `${deadline.month}/${deadline.day}`;
      expect(getDaysLeft(deadline, at(y, deadline.month, deadline.day, 0, 0)), `${label} 00:00`).toBe(0);
      expect(getDaysLeft(deadline, at(y, deadline.month, deadline.day, 23, 59)), `${label} 23:59`).toBe(0);
      expect(getDaysLeft(deadline, new Date(y, deadline.month - 1, deadline.day - 1, 12)), `${label} 전날`).toBe(1);
      expect(getDaysLeft(deadline, new Date(y, deadline.month - 1, deadline.day + 1, 0, 0)), `${label} 다음날`).toBeNull();
    }
  });

  it("타임존이 달라도 같은 로컬 날짜면 같은 값", () => {
    const run = () => [at(2026, 11, 15), at(2026, 12, 31, 23, 59), at(2027, 1, 2), at(2026, 8, 20)]
      .map((now) => getDaysLeft({ month: 12, day: 31 }, now) ?? getDaysLeft({ month: 9, day: 30 }, now))
      .join(",");
    process.env.TZ = "Asia/Seoul";
    const seoul = run();
    process.env.TZ = "UTC";
    expect(run()).toBe(seoul);
    process.env.TZ = "America/Los_Angeles";
    expect(run()).toBe(seoul);
  });

  it("1년치 전부: 배너에 보이는 배지는 종전보다 정확히 1 작고(마감 당일 0), 자릿수가 늘어나는 날이 없다", () => {
    let shown = 0;
    for (let i = 0; i < 366; i++) {
      const now = new Date(2026, 10, 1 + i, 12, 0, 0); // 2026-11-01 ~ 2027-11-01
      const seasonal = getCurrentSeasonal(now);
      if (!seasonal?.deadline) continue;
      const next = getDaysLeft(seasonal.deadline, now);
      const prev = legacyDaysLeft(seasonal.deadline, now);
      const label = `${now.getMonth() + 1}/${now.getDate()} ${seasonal.href}`;
      if (prev === null) {
        expect(next, label).toBeNull();
        continue;
      }
      expect(next, label).toBe(prev - 1);
      expect(String(next).length, label).toBeLessThanOrEqual(String(prev).length);
      expect(next!, label).toBeLessThanOrEqual(99); // 배지는 많아야 두 자리('D-60')
      shown++;
    }
    expect(shown).toBeGreaterThan(200);
  });

  it("배지 표기는 그대로 'D-{daysLeft}'·긴급 기준 20 이하 — 넓은 'D-Day' 표기로 바꾸지 않는다", () => {
    const src = readFileSync(resolve(process.cwd(), "src/components/SeasonalBanner.tsx"), "utf8");
    expect(src).toContain("D-{daysLeft}");
    expect(src).toContain("daysLeft !== null && daysLeft <= 20");
    // 주석(머리말의 'D-Day 카운트다운' 설명)은 빼고 코드만 본다
    const code = src.split(/\r?\n/).filter((line) => !/^\s*(?:\/\/|\/?\*)/.test(line)).join("\n");
    expect(code).not.toMatch(/D-Day|D-DAY|디데이/);
  });

  it("마감이 있는 항목은 모두 노출 창 안에서 배지가 0 이상 두 자리 이하", () => {
    for (const s of SEASONAL_CALENDAR) {
      if (!s.deadline) continue;
      for (const m of s.month) {
        const last = new Date(2026, m, 0).getDate();
        const from = s.days?.from ?? 1;
        const to = Math.min(s.days?.to ?? last, last);
        for (let d = from; d <= to; d++) {
          const y = m === 1 ? 2027 : 2026;
          const v = getDaysLeft(s.deadline, at(y, m, d));
          if (v !== null) {
            expect(v, `${s.href} ${m}/${d}`).toBeGreaterThanOrEqual(0);
            expect(v, `${s.href} ${m}/${d}`).toBeLessThanOrEqual(99);
          }
        }
      }
    }
  });
});
