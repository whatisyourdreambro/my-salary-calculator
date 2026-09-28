// 실수령액 역산표(S22, 2026-09-28) — /table/2026/annual 하단 '월 실수령액으로 세전 연봉 역산'
//
// 고정하는 것:
//  (1) 이분법 결과 g 는 만원 단위이고 net(g) ≥ 목표 > net(g − 1만원) — 1만원 안의 경계점
//  (2) 목표가 커지면 연봉도 커진다(단조), 그리고 표에 싣는 9행은 1만원 격자 전수 스캔의
//      '목표 이상이 되는 가장 낮은 연봉'과 같다 — 실수령액이 간이세액표 경계에서 수천원씩 되돌아가도
//      (엄밀한 단조가 아님) 이분법이 더 뒤의 경계점을 고르지 않았음을 증명
//  (3) 표 연봉(2026 요율 고정)과 같은 엔진·기준 — generateAnnualSalaryTableData2026 행과 교차 확인
//  (4) 페이지: 섹션은 Display2Ad·각주보다 아래(광고 위 UI 금지), 행 링크는 정적 /salary 격자 원소,
//      제목·설명 메타 불변, 새 문구는 기본 한글/라틴 폰트 서브셋 안

import { readFileSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/AppLink", () => ({ default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) }));
// 표 목은 interstitial 광고 노드만 그대로 그린다 — 페이지 전체 광고 순서를 보기 위함
vi.mock("@/components/SalaryTable", () => ({
  default: ({ interstitials = [] }: { interstitials?: { node: ReactNode }[] }) =>
    createElement("div", { "data-main-table": "" }, ...interstitials.map((i) => i.node)),
}));
vi.mock("@/components/TableHero", () => ({ default: ({ title }: { title: ReactNode }) => createElement("header", null, createElement("h1", null, title)) }));
vi.mock("@/components/AdPlacement", () => ({
  CalcResultAd: () => createElement("i", { "data-ad": "calc-result" }),
  Display2Ad: () => createElement("i", { "data-ad": "display-2" }),
  HomeTopAd: () => createElement("i", { "data-ad": "home-top" }),
  InArticleAd: () => createElement("i", { "data-ad": "in-article" }),
}));
vi.mock("@/components/FavoritesButton", () => ({ default: () => null }));
vi.mock("@/app/table/2026/SeasonalLinks", () => ({ default: () => null }));

import AnnualPage, { metadata } from "@/app/table/2026/annual/page";
import {
  annualGrossForMonthlyNet2026,
  generateAnnualSalaryTableData2026,
  generateNetToGrossTable2026,
  NET_TO_GROSS_TARGETS_2026,
} from "@/lib/generateData2026";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { INSURANCE_RATES_2026 } from "@/lib/taxConstants2026";
import { SALARY_HREF_MAX_GAP, salaryReportHrefOrNearest } from "@/lib/salaryRedirect";
import { SALARY_STATIC_AMOUNTS } from "@/lib/salaryStaticAmounts.generated";

const MANWON = 10_000;
/** 표와 같은 기준 — 비과세 식대 월 20만원 · 본인 1인 · 자녀 0 · 2026 요율 고정 */
const net = (annual: number) => calculateSalary2026(annual, 200_000, 1, 0, INSURANCE_RATES_2026).netPay;

describe("annualGrossForMonthlyNet2026 — 만원 단위 이분법", () => {
  it("목표는 월 실수령 200·250·300·350·400·450·500·600·700만원", () => {
    expect(NET_TO_GROSS_TARGETS_2026.map((t) => t / MANWON)).toEqual([200, 250, 300, 350, 400, 450, 500, 600, 700]);
  });

  it.each(NET_TO_GROSS_TARGETS_2026.map((t) => [t]))("월 %i원: 만원 단위이고 1만원 안의 경계점", (target) => {
    const g = annualGrossForMonthlyNet2026(target)!;
    expect(g).not.toBeNull();
    expect(g % MANWON).toBe(0);
    expect(net(g)).toBeGreaterThanOrEqual(target);
    expect(net(g - MANWON)).toBeLessThan(target);
  });

  it("목표가 커지면 연봉도 커진다 (9행 + 월 10만원 간격 150~800만원)", () => {
    const official = NET_TO_GROSS_TARGETS_2026.map((t) => annualGrossForMonthlyNet2026(t)!);
    for (let i = 1; i < official.length; i++) expect(official[i]).toBeGreaterThan(official[i - 1]);
    let prev = 0;
    for (let t = 1_500_000; t <= 8_000_000; t += 100_000) {
      const g = annualGrossForMonthlyNet2026(t)!;
      expect(g).toBeGreaterThan(prev);
      prev = g;
    }
  });

  it("표의 9행은 1만원 격자 전수 스캔의 최솟값과 같다 (실수령액 비단조 구간에서도 가장 낮은 연봉)", () => {
    // 실수령액이 엄밀한 단조가 아님을 먼저 확인 — 이 전제가 사라지면 이 테스트의 의미도 바뀐다
    let dips = 0;
    const firstReach = new Map<number, number>();
    let prevNet = net(10_000_000);
    for (let g = 10_000_000; g <= 120_000_000; g += MANWON) {
      const n = net(g);
      if (n < prevNet) dips++;
      prevNet = n;
      for (const t of NET_TO_GROSS_TARGETS_2026) if (!firstReach.has(t) && n >= t) firstReach.set(t, g);
    }
    expect(dips).toBeGreaterThan(0);
    for (const t of NET_TO_GROSS_TARGETS_2026) expect(annualGrossForMonthlyNet2026(t)).toBe(firstReach.get(t));
  });

  it("값 고정 — 엔진·요율이 바뀌면 화면 숫자도 바뀌므로 의도적으로만 갱신", () => {
    expect(generateNetToGrossTable2026().map((r) => [r.monthlyNet / MANWON, r.preTax / MANWON])).toEqual([
      [200, 2662], [250, 3354], [300, 4096], [350, 4886], [400, 5680],
      [450, 6487], [500, 7327], [600, 9091], [700, 10812],
    ]);
  });

  it("위 연봉 표(generateAnnualSalaryTableData2026)와 같은 엔진·기준", () => {
    const rows = new Map(generateAnnualSalaryTableData2026().map((r) => [r.preTax, r.monthlyNet]));
    for (const { monthlyNet, preTax } of generateNetToGrossTable2026()) {
      // 역산 연봉을 감싸는 표의 100만원 행 두 개 사이에 목표가 놓인다
      const below = Math.floor(preTax / 1_000_000) * 1_000_000;
      const above = below + 1_000_000;
      expect(rows.get(below)!).toBeLessThan(monthlyNet);
      expect(rows.get(above)!).toBeGreaterThanOrEqual(monthlyNet);
      expect(rows.get(below)).toBe(net(below));
    }
  });

  it("비정상 목표·탐색 상한 밖은 null, 행 생성기는 null 을 뺀다", () => {
    for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, 1e12]) expect(annualGrossForMonthlyNet2026(bad)).toBeNull();
    expect(generateNetToGrossTable2026([0, 3_000_000, 1e12])).toEqual([{ monthlyNet: 3_000_000, preTax: 40_960_000 }]);
  });

  it("행 링크는 salaryReportHrefOrNearest — 정적 격자 원소이고 역산 연봉과 2% 안", () => {
    for (const { preTax } of generateNetToGrossTable2026()) {
      const href = salaryReportHrefOrNearest(preTax)!;
      expect(href).toMatch(/^\/salary\/\d+$/);
      const amount = Number(href.slice("/salary/".length));
      expect(SALARY_STATIC_AMOUNTS).toContain(amount);
      expect(Math.abs(amount - preTax) / preTax).toBeLessThanOrEqual(SALARY_HREF_MAX_GAP);
    }
  });
});

describe("/table/2026/annual 역산표 섹션", () => {
  const html = renderToStaticMarkup(createElement(AnnualPage));
  const HEADING = "월 실수령액으로 세전 연봉 역산";

  it("H2 는 Display2Ad·각주 아래(광고 위 새 UI 없음) — 섹션 뒤에는 광고가 없다", () => {
    const h2 = html.indexOf(`>${HEADING}</h2>`);
    expect(h2).toBeGreaterThan(-1);
    expect(h2).toBeGreaterThan(html.indexOf('data-ad="display-2"'));
    expect(h2).toBeGreaterThan(html.indexOf("계산 방식과 적용 조건"));
    expect(html.slice(h2)).not.toContain("data-ad=");
    // 광고 수 불변 (표 interstitial 2 + CalcResult + Display2)
    expect(html.match(/data-ad="/g)).toHaveLength(4);
  });

  it("9행이 역산 연봉과 가까운 /salary 리포트 링크를 싣는다", () => {
    const section = html.slice(html.indexOf(`>${HEADING}</h2>`));
    for (const { monthlyNet, preTax } of generateNetToGrossTable2026()) {
      expect(section).toContain(`월 ${(monthlyNet / MANWON).toLocaleString("ko-KR")}만원`);
      expect(section).toContain(`href="${salaryReportHrefOrNearest(preTax)}"`);
    }
    expect(section).toContain("약 4,096만원");
    expect(section).toContain("약 1억 812만원");
    expect(section.match(/href="\/salary\/\d+"/g)).toHaveLength(NET_TO_GROSS_TARGETS_2026.length);
  });

  it("제목·설명 메타는 그대로", () => {
    expect(metadata.title).toEqual({ absolute: "2026 연봉 실수령액 표 — 2400만~2억 전 구간 세후 월급 한눈에 | 머니샐러리" });
    expect(metadata.description).toBe(
      "연봉 3000만원은 월 약 224만원, 5000만원은 약 357만원, 1억원은 약 653만원으로 추정합니다. 연봉에 포함된 월 비과세 20만원·본인 1명·자녀 0명 기준의 2026년 보험료·세금 공제표입니다. 실제 급여와 다를 수 있습니다."
    );
  });

  it("새 문구는 기본 한글/라틴 폰트 서브셋 안의 글자만 쓴다", () => {
    const source = readFileSync("src/app/fonts/siteFonts.generated.ts", "utf8");
    const ranges = [...source.matchAll(/const (latin|korean) = localFont\(\{[\s\S]*?prop: "unicode-range", value: "([^"]+)"/g)];
    expect(ranges).toHaveLength(2);
    const base = new Set<number>();
    for (const range of ranges) for (const part of range[2].split(",")) {
      const [first, last = first] = part.slice(2).split("-").map((value) => parseInt(value, 16));
      for (let code = first; code <= last; code++) base.add(code);
    }
    const section = html.slice(html.indexOf(`>${HEADING}</h2>`) - 200);
    const missing = [...new Set([...section].filter((char) => char.codePointAt(0)! > 127 && !base.has(char.codePointAt(0)!)))];
    expect(missing).toEqual([]);
  });
});
