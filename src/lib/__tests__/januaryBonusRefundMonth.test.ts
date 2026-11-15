// /calc/january-bonus 결과 카드 환급 시기 (2026-11-15 N2-calc-06 calc-02-F11)
//
// 소득세법 제137조: 원천징수의무자는 다음 연도 2월분 근로소득을 지급할 때 연말정산한다. 이 페이지의 일정표(2~3월 급여 —
// 환급금 합산)와 FAQ 5(보통 2월 또는 3월 급여)도 같은데, 모든 방문자가 보는 결과 카드만 '1~2월'이었다.
// 결과 카드는 CalcResultAd 위 — 같은 글자 수, 숫자만 바뀜(14px 굵게 170.3px -> 172.7px, 320px 에서도 한 줄).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const client = readFileSync(resolve(process.cwd(), "src/app/calc/january-bonus/Client.tsx"), "utf8");

describe("january-bonus 결과 카드 환급 시기 (calc-02-F11)", () => {
  it("환급·추징 문구 모두 2~3월 월급", () => {
    expect(client).toContain('"2~3월 월급에 환급금 합산 예상"');
    expect(client).toContain('"2~3월 월급에서 추가 차감 예상"');
    expect(client).not.toContain("1~2월 월급");
  });
});
