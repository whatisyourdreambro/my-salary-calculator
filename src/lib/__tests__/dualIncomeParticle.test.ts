// /calc/dual-income-year-end 최적 배분 문구의 주격 조사 (2026-11-01 PKG-11 NEW-v05-calc-engines-2)
// 종전 `${SIDE_LABEL[...]}가 결제·공제` 는 기본 입력(자녀 0명, 부부 상호 의료비 100만원)에서 결과 카드(CalcResultAd 위)에
// '서로를 위한 의료비 → 본인가 결제·공제' 로 보였다. 조사를 붙인 SIDE_SUBJECT(본인이·배우자가)로 고쳤다 — 글자 수 같음.
// B25 P4-06 (2026-11-01): 머리말을 '서로를 위한'에서 '부부 상호'(입력칸 괄호와 같은 말)로 한 글자 줄였다. '배우자가' 줄도
// 종전 기본 줄 '서로를 위한 의료비 → 본인이 결제·공제' 와 글자 구성(한글 15·공백 5·기호 2)이 같다. 동점이면 '어느 쪽이든 같음'.
// 11/1 통합 스윕 수리: 기본 예시 의료비는 100만원 그대로(두 사람 3% 문턱 미달 — 동점)라 첫 화면은 더 짧은 동점 문구다.
// B25 의 300만원 예시는 '최적 대비' 칸을 넓혀 CalcResultAd 를 320~661px 에서 내려 되돌렸다.
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
  it("기본 입력 SSR 은 동점 문구다 — 본인이 결제·공제 같은 추천처럼 보이지 않는다 (기본 예시 100만원)", () => {
    const html = renderToStaticMarkup(createElement(DualIncomeYearEndClient));
    expect(html).toContain("· 부부 상호 의료비 → 어느 쪽이든 같음");
    expect(html).not.toContain("본인가");
    expect(html).not.toContain("배우자가가");
    expect(html).not.toContain("본인이 결제·공제");
    expect(html).not.toContain("배우자가 결제·공제");
    expect(html).toContain('value="1,000,000"'); // 서로를 위한 의료비 기본값 — 종전과 같다
    expect(html).not.toContain(">+90,000원<"); // 최적 대비 칸은 모두 — (표 너비 불변)
    // 결과 카드의 배분 문구는 결과 직하 광고보다 앞에 있다 (종전 기본 줄보다 짧다 — 아래 테스트)
    expect(html.indexOf("어느 쪽이든 같음")).toBeLessThan(html.indexOf('data-test-ad="result"'));
  });

  it("본인·배우자 모두 조사가 한 번만 붙는다", () => {
    const src = readFileSync(resolve(process.cwd(), "src/app/calc/dual-income-year-end/Client.tsx"), "utf8");
    expect(src).toContain('const SIDE_SUBJECT: Record<Side, string> = { me: "본인이", sp: "배우자가" };');
    expect(src).toContain("${SIDE_SUBJECT[optimal.assign.coupleMedTo]} 결제·공제");
    expect(src).not.toMatch(/\]\}가 결제·공제/);
    // 종전 문구와 글자 수가 같다 (본인가 → 본인이, 배우자가 → 배우자가)
    expect("본인이 결제·공제".length).toBe("본인가 결제·공제".length);
  });

  it("B25 '부부 상호' 줄은 종전 기본 줄과 글자 구성이 같거나 짧고, 동점 문구는 더 짧다 (CalcResultAd 위 결과 카드)", () => {
    const src = readFileSync(resolve(process.cwd(), "src/app/calc/dual-income-year-end/Client.tsx"), "utf8");
    const makeup = (s: string) => ({
      hangul: (s.match(/[가-힣]/g) ?? []).length,
      spaces: (s.match(/ /g) ?? []).length,
      other: s.replace(/[가-힣 ]/g, "").length,
    });
    const oldDefault = "서로를 위한 의료비 → 본인이 결제·공제"; // B25 전 기본 화면 (의료비 100만원 — 동점)
    const spouseLine = "부부 상호 의료비 → 배우자가 결제·공제";
    const tie = "부부 상호 의료비 → 어느 쪽이든 같음";
    expect(makeup(oldDefault)).toEqual({ hangul: 15, spaces: 5, other: 2 });
    expect(makeup(spouseLine)).toEqual(makeup(oldDefault));
    expect(tie.length).toBeLessThan(oldDefault.length);
    expect(makeup(tie).hangul).toBeLessThan(makeup(oldDefault).hangul);
    expect(makeup(tie).other).toBeLessThan(makeup(oldDefault).other);
    expect(src).toContain(`"${tie}"`);
    expect(src).toContain("`부부 상호 의료비 → ${SIDE_SUBJECT[optimal.assign.coupleMedTo]} 결제·공제`");
    expect(src).not.toContain("서로를 위한 의료비 →");
    // 입력칸 이름·기본값은 그대로다 (입력칸 수·라벨·기본 예시 불변)
    expect(src).toContain('label: "서로를 위한 의료비 (부부 상호 지출분)"');
    expect(src).toContain('coupleMedical: "1,000,000",');
  });
});
