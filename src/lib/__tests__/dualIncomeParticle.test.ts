// /calc/dual-income-year-end 최적 배분 문구의 주격 조사 (2026-11-01 PKG-11 NEW-v05-calc-engines-2)
// 종전 `${SIDE_LABEL[...]}가 결제·공제` 는 기본 입력(자녀 0명, 부부 상호 의료비 100만원)에서 결과 카드(CalcResultAd 위)에
// '서로를 위한 의료비 → 본인가 결제·공제' 로 보였다. 조사를 붙인 SIDE_SUBJECT(본인이·배우자가)로 고쳤다 — 글자 수 같음.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/calc/dual-income-year-end" }));
vi.mock("@/components/AdPlacement", () => ({
  CalcResultAd: () => createElement("div", { "data-test-ad": "result" }),
}));

import DualIncomeYearEndClient from "@/app/calc/dual-income-year-end/Client";

describe("맞벌이 최적 배분 문구 — 주격 조사", () => {
  it("기본 입력 SSR 은 본인이 결제·공제 로 읽힌다", () => {
    const html = renderToStaticMarkup(createElement(DualIncomeYearEndClient));
    expect(html).toContain("서로를 위한 의료비 → 본인이 결제·공제");
    expect(html).not.toContain("본인가");
    // 결과 카드의 배분 문구는 결과 직하 광고보다 앞에 있다 (문구 길이는 종전과 같다)
    expect(html.indexOf("본인이 결제·공제")).toBeLessThan(html.indexOf('data-test-ad="result"'));
  });

  it("본인·배우자 모두 조사가 한 번만 붙는다", () => {
    const src = readFileSync(resolve(process.cwd(), "src/app/calc/dual-income-year-end/Client.tsx"), "utf8");
    expect(src).toContain('const SIDE_SUBJECT: Record<Side, string> = { me: "본인이", sp: "배우자가" };');
    expect(src).toContain("${SIDE_SUBJECT[optimal.assign.coupleMedTo]} 결제·공제");
    expect(src).not.toMatch(/\]\}가 결제·공제/);
    // 종전 문구와 글자 수가 같다 (본인가 → 본인이, 배우자가 → 배우자가)
    expect("본인이 결제·공제".length).toBe("본인가 결제·공제".length);
  });
});
