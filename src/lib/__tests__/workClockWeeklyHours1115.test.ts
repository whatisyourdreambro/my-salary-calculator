// /work-clock 주휴수당 '4주 평균 주 소정근로' 기본값 가드 (2026-11-15 감사 app-tools-fun-b04-M02, N2-app-tools-fun-09)
//
// 기본값 '40' 은 applyProfile 에서만 설정을 따랐다. 저장된 단시간 설정(예: 하루 4시간 × 주 5일 = 20시간)을
// 불러와도 40 그대로라, 두 요건을 체크하면 시급 12,000원에서 48,000원이 아니라 96,000원으로 추정했다.
// - 불러오기(저장 설정) · 전체 삭제(기본 설정) 때 applyProfile 과 같은 식으로 맞춘다.
// - 실행 취소는 삭제 직전 값을 그대로 되돌린다(기록 1건 삭제 취소가 직접 고친 값을 덮지 않게).
// 접힌 <details> 안 값이라 첫 화면은 그대로다. 소스 문자열과 계산 함수만 본다.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEFAULT_PAY_PROFILE, estimateWeeklyRestAllowance } from "@/lib/workClock";

const src = readFileSync("src/app/work-clock/WorkClockClient.tsx", "utf8").replace(/\r\n/g, "\n");
const body = (re: RegExp) => {
  const m = re.exec(src);
  expect(m, String(re)).not.toBeNull();
  return m![0];
};

describe("work clock weekly scheduled hours follow the pay profile", () => {
  it("applyProfile keeps its derivation (the reference formula)", () => {
    expect(body(/function applyProfile\(\) \{[\s\S]*?\n  \}/)).toContain(
      "setWeeklyHours(String(Math.min(40, next.dailyHours * next.workDaysPerWeek)));"
    );
  });

  it("loading a saved profile derives the field from it", () => {
    const load = body(/const saved = loadWorkClockState\(\);\n    if \(saved\) \{[\s\S]*?\n    \} else \{/);
    expect(load).toContain("setWeeklyHours(String(Math.min(40, saved.profile.dailyHours * saved.profile.workDaysPerWeek)));");
  });

  it("clearAll resets the field with the default profile (40 h)", () => {
    expect(body(/function clearAll\(\) \{[\s\S]*?\n  \}/)).toContain(
      "setWeeklyHours(String(Math.min(40, DEFAULT_PAY_PROFILE.dailyHours * DEFAULT_PAY_PROFILE.workDaysPerWeek)));"
    );
    expect(String(Math.min(40, DEFAULT_PAY_PROFILE.dailyHours * DEFAULT_PAY_PROFILE.workDaysPerWeek))).toBe("40");
  });

  it("undo snapshots and restores the field value", () => {
    expect(body(/function captureUndo\(\) \{[^\n]*\}/)).toMatch(/weeklyHours \}\); \}$/);
    expect(body(/function restoreDeleted\(\) \{[\s\S]*?\n  \}/)).toContain("setWeeklyHours(undo.weeklyHours);");
  });

  it("a 20 h/week part-timer at 12,000원/h gets 48,000원, not the 40 h figure", () => {
    const base = { ordinaryHourlyPay: 12_000, attendanceConfirmed: true, employmentContinuesThroughRestDay: true };
    const partTime = Math.min(40, 4 * 5);
    expect(estimateWeeklyRestAllowance({ ...base, scheduledWeeklyHours: partTime }).amount).toBe(48_000);
    expect(estimateWeeklyRestAllowance({ ...base, scheduledWeeklyHours: 40 }).amount).toBe(96_000);
  });
});
