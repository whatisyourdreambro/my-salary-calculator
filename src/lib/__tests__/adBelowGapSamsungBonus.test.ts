// 삼성 성과급 개인 결과 광고 아래 간격 가드 (2026-10-05, 운영자 승인 #5 — 광고 아래만 여백, 감사 code5-01)
//
// 배경: Client.tsx 의 개인 결과 CalcResultAd 와 바로 다음 ResultNextLinks 는 둘 다 <div className="space-y-4"> 의 자식이다.
//   .space-y-4 > :not([hidden]) ~ :not([hidden]) (특이도 0,3,0)가 mt-8 을 16px 로 덮고, 광고 컨테이너의 인라인 여백 1.5rem 과
//   병합돼 주 링크가 광고 아래 24px 에 붙어 있었다. 링크 줄 래퍼의 pt-2(패딩은 병합되지 않음)로 24 + 8 = 32px 를 만든다.
// 지키는 것: 광고 바로 다음 요소가 pt-2 를 유지할 것, 부모가 여전히 space-y-4 인지(바뀌면 간격 계산을 다시 할 것),
//   광고 위(결과 카드 쪽)에는 여백을 더하지 않았을 것. 소스 스캔(jsdom 없음) — internalLinkModules.test.ts 와 같은 방식.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(resolve(process.cwd(), "src/app/calc/samsung-bonus/Client.tsx"), "utf8")
  .replace(/\r\n/g, "\n")
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

describe("삼성 성과급 개인 결과 광고 아래 32px", () => {
  const ad = src.indexOf("<CalcResultAd />");

  it("CalcResultAd 는 Client 안에 정확히 1회", () => {
    expect(ad).toBeGreaterThan(-1);
    expect(src.indexOf("<CalcResultAd />", ad + 1)).toBe(-1);
  });

  it("광고 바로 다음 요소는 samsung-personal-next 링크 줄이고 mt-8 pt-2 를 가진다", () => {
    const after = src.slice(ad + "<CalcResultAd />".length);
    const next = /<ResultNextLinks\b[\s\S]*?\/>/.exec(after);
    expect(next).not.toBeNull();
    // 광고와 링크 줄 사이에 다른 JSX 요소가 끼지 않았다(조건부 렌더 괄호만 허용)
    expect(after.slice(0, next!.index).replace(/\{personal\.totalGrossWon > 0 && \(/, "").trim()).toBe("");
    expect(next![0]).toContain('position="samsung-personal-next"');
    expect(next![0]).toMatch(/className="mt-8 pt-2"/);
  });

  it("두 요소의 부모는 space-y-4 — 부모가 바뀌면 margin 병합 계산을 다시 하고 이 가드를 고친다", () => {
    const parentOpen = src.lastIndexOf('<div className="space-y-4">', ad);
    expect(parentOpen).toBeGreaterThan(src.indexOf("function MySalaryCalculator("));
  });

  it("평균 결과(HomeTopAd) 아래 줄은 부모에 space-y 가 없어 mt-8 그대로 32px — 패딩을 더하지 않는다", () => {
    const top = src.indexOf("<HomeTopAd />");
    const after = src.slice(top, src.indexOf("/>", src.indexOf("<ResultNextLinks", top)) + 2);
    expect(after).toContain('className="mt-8"');
    expect(after).toContain('position="samsung-pool-next"');
  });
});
