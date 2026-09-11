// /share 결과 카드의 버튼 행 — 정적 집합 밖 연봉에서도 두 버튼 유지 (2026-09-12 리뷰, S2-2 후속)
//
// ShareableResult 는 /share/[data] 에서 CalcResultAd 바로 위에 놓인 카드다. S2-2(c622d07·54febe1)에서 상세 리포트
// 버튼이 정적 집합 밖(500만 미만·3.5억 초과 — 페이로드는 1조까지 허용)에서 생략되며 카드가 버튼 하나만큼 낮아졌다 —
// 2026-08-16 '광고 위 높이 불변' 규칙 위반. salaryReportHrefOrNearest 가 null 이면 같은 클래스의 버튼을 홈 계산기(/)로
// 연결해 행을 유지한다. 월 소득 환산 결과(regular 아님)는 종전부터 버튼 1개라 그대로 둔다.
// jsdom 없음 — react-dom/server 로 렌더해 버튼 행의 <a> 를 센다.
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/AppLink", () => ({
  default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children),
}));
vi.mock("react-countup", () => ({
  default: ({ end }: { end: number }) => createElement("span", null, String(end)),
}));

import ShareableResult from "@/components/ShareableResult";
import { encodeSalarySharePayload } from "@/lib/salarySharePayload";
import { SALARY_STATIC_AMOUNTS } from "@/lib/salaryStaticAmounts.generated";
import { salaryReportHrefOrNearest } from "@/lib/salaryRedirect";

const PRIMARY_CLS =
  "inline-block py-4 px-8 bg-primary text-primary-foreground font-bold text-lg rounded-lg hover:bg-primary/90 transition-transform transform hover:scale-105 shadow-lg";
const HOME_CLS =
  "inline-block py-4 px-8 bg-accent text-accent-foreground font-bold text-lg rounded-lg hover:bg-accent/90 transition-transform transform hover:scale-105 shadow-lg";

const regularToken = (annualSalary: number) =>
  encodeSalarySharePayload({ annualSalary, nonTaxableAmount: 200_000, dependents: 1, children: 0 })!;
const monthlyToken = (monthlyIncome: number) =>
  encodeSalarySharePayload({ v: 1, taxYear: 2026, incomeType: "part_time", monthlyIncome })!;
const render = (data: string) => renderToStaticMarkup(createElement(ShareableResult, { data }));
/** 카드 안의 <a> — 버튼 행에만 링크가 있다 */
const buttons = (html: string) =>
  [...html.matchAll(/<a href="([^"]+)" class="([^"]+)">([^<]+)<\/a>/g)].map((m) => ({ href: m[1], cls: m[2], label: m[3] }));

const GRID_MIN = SALARY_STATIC_AMOUNTS[0];
const GRID_MAX = SALARY_STATIC_AMOUNTS[SALARY_STATIC_AMOUNTS.length - 1];
const OUT_OF_RANGE = [3_000_000, GRID_MAX + 50_000_000, 1_000_000_000_000];

describe("ShareableResult 버튼 행 — 광고 위 높이 불변", () => {
  it("표본이 실제로 집합 밖이다 (500만 미만·3.5억 초과·페이로드 상한)", () => {
    expect(GRID_MIN).toBeGreaterThan(3_000_000);
    for (const a of OUT_OF_RANGE) {
      expect(a < GRID_MIN || a > GRID_MAX, String(a)).toBe(true);
      expect(salaryReportHrefOrNearest(a), String(a)).toBeNull();
      expect(regularToken(a), `${a} 는 공유 페이로드가 허용해야 한다`).toBeTruthy();
    }
  });

  it("집합 안 연봉: [상세 리포트, 홈] 두 버튼", () => {
    const b = buttons(render(regularToken(50_000_000)));
    expect(b).toHaveLength(2);
    expect(b[0]).toEqual({ href: "/salary/50000000", cls: PRIMARY_CLS, label: "연봉 상세 분석 보기" });
    expect(b[1]).toEqual({ href: "/", cls: HOME_CLS, label: "나의 연봉도 계산해보기 →" });
    // 집합 안이지만 격자 사이 금액은 최근접 페이지로 (종전 동작)
    const near = buttons(render(regularToken(50_300_000)));
    expect(near[0].href).toBe(salaryReportHrefOrNearest(50_300_000));
    expect(near[0].label).toBe("연봉 상세 분석 보기");
  });

  it("집합 밖 연봉: 상세 리포트 자리에 같은 클래스의 홈 계산기 버튼 — 버튼 수·클래스가 집합 안과 같다", () => {
    const inRange = buttons(render(regularToken(50_000_000)));
    for (const a of OUT_OF_RANGE) {
      const b = buttons(render(regularToken(a)));
      expect(b, String(a)).toHaveLength(2);
      expect(b[0], String(a)).toEqual({ href: "/", cls: PRIMARY_CLS, label: "연봉 계산기로 다시 계산" });
      expect(b[1], String(a)).toEqual(inRange[1]);
      expect(b.map((x) => x.cls), `${a}: 클래스 열이 집합 안과 동일`).toEqual(inRange.map((x) => x.cls));
    }
  });

  it("월 소득 환산 결과(regular 아님)는 종전대로 홈 버튼 1개", () => {
    const b = buttons(render(monthlyToken(2_000_000)));
    expect(b).toHaveLength(1);
    expect(b[0]).toEqual({ href: "/", cls: HOME_CLS, label: "나의 연봉도 계산해보기 →" });
  });

  it("소스: 버튼은 regular 분기 하나이고 href 만 null 폴백 — 클래스 문자열은 한 벌", () => {
    const src = readFileSync(resolve(process.cwd(), "src/components/ShareableResult.tsx"), "utf8");
    expect(src).toContain("{result.regular && (");
    expect(src).toContain('href={salaryReportLink ?? "/"}');
    expect(src).toContain('{salaryReportLink ? "연봉 상세 분석 보기" : "연봉 계산기로 다시 계산"}');
    expect(src.split(PRIMARY_CLS).length - 1).toBe(1);
    expect(src).not.toContain("{salaryReportLink && (");
  });
});
