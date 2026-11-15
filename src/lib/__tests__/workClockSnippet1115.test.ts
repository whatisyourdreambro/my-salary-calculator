// /work-clock 검색 설명 — 휴일근로수당·휴일 야간 가산 (2026-11-15 SEASONC, app-tools-fun ideas[7])
// 페이지의 '휴일에 일했다면?'(HolidayPayEstimate) 이 실제로 계산하는 것만 말한다: 휴일근로 8시간 이내 50%·초과분 100%,
// 그 휴일 근로 중 야간(22:00~06:00) 50% 가산 — 근로기준법 제56조 제2항·제3항. 평일 야간수당 일반 계산기는 아니다.
// title 은 바꾸지 않는다(범위 밖). 메타만이라 화면·광고 위치 불변.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("/work-clock 검색 설명", () => {
  const page = readFileSync("src/app/work-clock/page.tsx", "utf8");
  const estimate = readFileSync("src/app/work-clock/HolidayPayEstimate.tsx", "utf8");
  const client = readFileSync("src/app/work-clock/WorkClockClient.tsx", "utf8");
  it("주휴수당과 휴일근로수당·휴일 야간 가산을 법정 가산율로 말한다", () => {
    expect(page).toContain("주휴수당과 휴일근로수당(8시간 이내 50%·초과 100%)·휴일 야간 가산(50%)도 따로 참고 계산합니다.");
    expect(page).toContain('"휴일근로수당 계산"');
    expect(page).toContain('title: "실시간 월급 시계 — 오늘 번 돈·근무 기록·주휴수당"');
  });
  it("설명이 말하는 계산은 이 페이지에 실제로 있다", () => {
    expect(client).toContain("{!isHome && <HolidayPayEstimate");
    expect(estimate).toContain("8시간 이내 휴일근로는 50%, 초과분은 100%, 야간근로는 50%를 가산한 참고 계산입니다.");
    expect(estimate).toContain("그중 야간 근로 (시간)");
  });
});
