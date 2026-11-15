// N2-app-pages-15 (app-pages-b01-F05, 2026-11-15): /auto-tax-2026 계산기에서 전기차를 고르면 경감률 0% 옆 안내가
// '(매년 5%씩 차감, 최대 50%)'·'(3년차부터 경감 시작)'이라 차령 경감이 있는 것처럼 읽혔다. 차령 경감은
// 지방세법 제127조 제1항 제2호 — 제1호(배기량 기준) 비영업용 승용자동차만 대상이고, 전기차는 제3호 '그 밖의 승용자동차'
// 정액(비영업용 10만원)이라 경감이 없다. 안내는 결과 광고(CalcResultAd) 위라 새 문구는 옛 두 문구보다 좁다
// (사이트 글꼴 advance 폭: 151.7px < 158.9px·191.4px). 기본 상태(전기차 아님, 3년차)의 출력은 바뀌지 않는다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AutoTaxClient from "@/app/auto-tax-2026/AutoTaxClient";

const src = readFileSync(resolve(process.cwd(), "src/app/auto-tax-2026/AutoTaxClient.tsx"), "utf8");

describe("/auto-tax-2026 전기차 경감률 안내", () => {
  it("전기차면 '(전기차는 경감 없음)', 아니면 기존 두 안내 그대로", () => {
    expect(src).toContain(
      '경감률: {result.depRate}% {isElectric ? "(전기차는 경감 없음)" : years < 3 ? "(3년차부터 경감 시작)" : `(매년 5%씩 차감, 최대 50%)`}',
    );
    expect(src).toContain("const depRate = isElectric ? 0 : getDepreciationRate(years);");
  });

  it("기본 렌더(전기차 아님·3년차)는 종전과 같은 안내를 낸다", () => {
    const html = renderToStaticMarkup(createElement(AutoTaxClient)).replace(/<!-- -->/g, "");
    expect(html).toContain("경감률: 5% (매년 5%씩 차감, 최대 50%)");
    expect(html).not.toContain("전기차는 경감 없음");
  });

  it("새 전기차 안내는 옛 두 안내보다 글자 수가 적거나 같다(폭 하한 가드)", () => {
    const ev = [..."(전기차는 경감 없음)"].length;
    expect(ev).toBeLessThanOrEqual([..."(3년차부터 경감 시작)"].length);
    expect(ev).toBeLessThan([..."(매년 5%씩 차감, 최대 50%)"].length);
  });
});
