// /calc/samsung-bonus 띄어쓰기 두 곳 — JSX 줄바꿈이 표현식 뒤 공백을 지우던 것 (R4 SAMSUNG, N2-calc-07 calc-04-F13, 2026-11-18)
//
// 종전 HTML: '2026년 1월 30일<!-- -->지급됐으며,' · '사업부를 누르면<!-- -->2026년 상반기'. 문구는 검증안대로 더 짧게
// ('지급됐으며' -> '지급됐고', '실제 발표' -> '발표') — 사이트 글꼴 줄 시뮬레이션 320~1920px 줄이 느는 폭 0.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import TaiCalculator from "@/app/calc/samsung-bonus/TaiCalculator";
import { OPI_LATEST } from "@/app/calc/samsung-bonus/opiData";
import { TAI_LATEST } from "@/app/calc/samsung-bonus/taiData";

const page = readFileSync(resolve(process.cwd(), "src/app/calc/samsung-bonus/page.tsx"), "utf8").replace(/\r\n/g, "\n");
const text = (html: string) => html.replace(/<!-- -->/g, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ");

describe("삼성 성과급 띄어쓰기 (N2-calc-07 calc-04-F13)", () => {
  it("OPI 실지급률 문단: 지급일과 '지급됐고' 사이 공백", () => {
    expect(page).toContain('{OPI_LATEST.payDateLabel}{" "}\n              지급됐고, {OPI_LATEST.sourceNote}에 따른 실제 지급률은 다음과');
    expect(page).not.toContain("지급됐으며, {OPI_LATEST.sourceNote}");
    expect(OPI_LATEST.payDateLabel).toMatch(/일$/);
  });

  it("TAI 미니 계산기 안내: '누르면' 뒤 공백, '실제' 없음(렌더 결과)", () => {
    const html = text(renderToStaticMarkup(createElement(TaiCalculator)));
    expect(html).toContain(`사업부를 누르면 ${TAI_LATEST.periodLabel} 발표 지급률이 적용됩니다.`);
    expect(html).not.toContain("실제 발표 지급률");
  });
});
