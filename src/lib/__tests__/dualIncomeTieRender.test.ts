// /calc/dual-income-year-end 결과 카드 — 부부 상호 의료비 동점 문구 (2026-11-01 B25 P4-06, synthesizer correction)
// 화면 기본 예시(300만원)는 동점이 아니므로, 엔진 호출만 종전 기본 100만원(두 사람 3% 문턱 미달 — 실제 동점)으로 바꿔
// 렌더한다. 종전에는 이 상태에서 동점 중 첫 시나리오인 '본인이 결제·공제'가 추천처럼 보였다.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/calc/dual-income-year-end" }));
vi.mock("@/components/AdPlacement", () => ({
  CalcResultAd: () => createElement("div", { "data-test-ad": "result" }),
}));
vi.mock("@/lib/dualIncomeYearEnd2026", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/dualIncomeYearEnd2026")>();
  return {
    ...real,
    calculateDualIncomeYearEnd2026: (input: Parameters<typeof real.calculateDualIncomeYearEnd2026>[0]) =>
      real.calculateDualIncomeYearEnd2026({ ...input, coupleMedical: 1_000_000 }),
  };
});

import DualIncomeYearEndClient from "@/app/calc/dual-income-year-end/Client";

describe("맞벌이 결과 카드 — 부부 상호 의료비 동점 (B25)", () => {
  it("동점이면 본인이 결제·공제 대신 어느 쪽이든 같음을 결과 직하 광고보다 앞에 보여 준다", () => {
    const html = renderToStaticMarkup(createElement(DualIncomeYearEndClient));
    expect(html).toContain("· 부부 상호 의료비 → 어느 쪽이든 같음");
    expect(html).not.toContain("본인이 결제·공제");
    expect(html).not.toContain("배우자가 결제·공제");
    expect(html).toContain(">0원<"); // 절감액 0원 — 종전 기본 화면과 같은 동점 상태
    expect(html.indexOf("어느 쪽이든 같음")).toBeLessThan(html.indexOf('data-test-ad="result"'));
  });
});
