import { createElement, cloneElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { calculateRank, salaryData } from "@/lib/salaryData";

type ChartRow = { salaryRange: number; percentage: number };
const observed = vi.hoisted(() => ({ rows: [] as ChartRow[], salaryAxis: (value: number) => String(value) }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("react-countup", () => ({ default: ({ end }: { end: number }) => String(end) }));
vi.mock("@/components/calculators/SalaryRankCalculator", () => ({ default: () => null }));
vi.mock("recharts", () => {
  const childrenOnly = ({ children }: { children?: ReactNode }) => createElement("div", null, children);
  return {
    ResponsiveContainer: childrenOnly,
    BarChart: ({ data, children }: { data: ChartRow[]; children?: ReactNode }) => {
      observed.rows = data;
      return createElement("div", null, children);
    },
    Bar: childrenOnly,
    XAxis: ({ tickFormatter }: { tickFormatter: (value: number) => string }) => {
      observed.salaryAxis = tickFormatter;
      return null;
    },
    YAxis: () => null,
    Cell: () => null,
    Tooltip: ({ content }: { content: ReactElement }) => {
      const row = observed.rows[observed.rows.length - 1];
      return cloneElement(content, {
        active: true,
        label: String(row.salaryRange),
        payload: [{ value: row.percentage }],
      } as Record<string, unknown>);
    },
  };
});

import SalaryRank from "@/components/SalaryRank";
import { metadata } from "@/app/fun/salary-rank/page";

describe("연봉 참고표의 결과와 차트", () => {
  it("모든 참고표 기준점에서 차트 상위 비율이 계산 결과와 일치한다", () => {
    renderToStaticMarkup(createElement(SalaryRank));
    expect(observed.rows).toHaveLength(Object.keys(salaryData["all-all-all-all"].percentiles).length);
    for (const row of observed.rows) {
      const result = calculateRank(row.salaryRange * 10_000, "all-all-all-all");
      expect(row.percentage, `${row.salaryRange}만원`).toBe(result.rank);
    }
    expect(observed.rows[observed.rows.length - 1]).toEqual({ salaryRange: 15_000, percentage: 1 });
    expect(observed.salaryAxis(15_000)).toBe("1.5억");
    expect(observed.salaryAxis(2_200)).toBe("0.22억");
  });

  it("상위 1% 기준점의 툴팁은 참고표 비율을 표시하고 전국 등수를 만들지 않는다", () => {
    const html = renderToStaticMarkup(createElement(SalaryRank));
    expect(html).toContain("참고표 상위 1%");
    expect(html).toContain("자체 참고표 기준");
    expect(html).toContain("공식 통계의 기준연도·원자료는 미확인");
    expect(html).not.toContain("등 이내");
    expect(html).not.toContain("전체 근로자");
  });

  it("검색 설명도 화면과 같은 자체 참고표의 범위를 밝힌다", () => {
    expect(metadata.description).toContain("자체 참고표 기준");
    expect(metadata.description).toContain("공식 전국 순위가 아니며");
    expect(metadata.description).not.toContain("통계청·고용노동부 자료 기반");
  });
});
