import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { isStoredReportData } from "@/lib/reportStoredData";

const state = vi.hoisted(() => ({ values: [] as unknown[], index: 0, effects: [] as (() => void)[] }));
vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return { ...actual,
    useState(initial: unknown) {
      const slot = state.index++;
      return [state.values[slot] ?? initial, (value: unknown) => { state.values[slot] = value; }];
    },
    useEffect(effect: () => void) { state.effects.push(effect); },
    useRef() { return { current: null }; },
  };
});
vi.mock("next/dynamic", () => ({ default: () => () => null }));
vi.mock("@/components/PageFooterAds", () => ({ default: () => null }));
vi.mock("@/components/AdPlacement", () => ({ GuideMidAd: () => null }));
vi.mock("@/components/AppLink", () => ({ default: (props: { href: string; children: unknown }) => createElement("a", { href: props.href }, props.children as string) }));
vi.mock("react-countup", () => ({ default: (props: { end: number }) => createElement("span", null, String(props.end)) }));
vi.mock("lucide-react", () => ({ Info: () => null, BarChart2: () => null, TrendingUp: () => null }));

import ReportPage from "@/app/report/page";

const lastUpdated = "2026-10-03T00:00:00.000Z";
const salary = { annualSalary: 60000000, monthlyNet: 4000000 };
const valid = { salary, lastUpdated };

function renderSaved(raw: string | null) {
  state.values = [null, null, ""]; state.index = 0; state.effects = [];
  const storage = { getItem: vi.fn(() => raw), setItem: vi.fn(), removeItem: vi.fn() };
  vi.stubGlobal("localStorage", storage);
  const shell = ReportPage() as ReactElement<{ children: ReactElement[] }>;
  const Report = shell.props.children[0].type as () => ReactElement;
  Report();
  const effect = state.effects[0]; state.effects = []; effect();
  state.index = 0;
  const html = renderToStaticMarkup(Report());
  vi.unstubAllGlobals();
  return { html, storage };
}

describe("리포트에 실제 표시하는 저장 필드 검사", () => {
  it.each([
    valid,
    { lastUpdated },
    { salary: { annualSalary: 0, monthlyNet: 0 }, lastUpdated },
    { homeLoan: { monthlyPayment: 0 }, lastUpdated },
    { severance: { estimatedSeverancePay: 0 }, lastUpdated },
    { futureSalary: { years: 0, finalSalary: 0 }, lastUpdated },
    { futureSalary: { years: 30, finalSalary: 120000000 }, lastUpdated },
  ])("정상 optional section과 0을 허용한다 (%j)", value => { expect(isStoredReportData(value)).toBe(true); });
  it.each([
    null, [], {}, { salary, lastUpdated: "invalid" },
    { salary: { monthlyNet: 4000000 }, lastUpdated },
    { salary: { ...salary, annualSalary: "bad" }, lastUpdated },
    { salary: { ...salary, monthlyNet: Number.NaN }, lastUpdated },
    { homeLoan: {}, lastUpdated },
    { severance: { estimatedSeverancePay: Number.POSITIVE_INFINITY }, lastUpdated },
    { futureSalary: { years: 1.5, finalSalary: 100000000 }, lastUpdated },
    { futureSalary: { years: 31, finalSalary: 100000000 }, lastUpdated },
  ])("깨진 필드와 계산기 범위 밖 기간을 거부한다 (%j)", value => { expect(isStoredReportData(value)).toBe(false); });
});

describe("실제 리포트의 저장 데이터 로딩과 안내", () => {
  it.each([
    { salary: { monthlyNet: 4000000 }, lastUpdated },
    { salary: { ...salary, annualSalary: "bad" }, lastUpdated },
    { ...valid, homeLoan: {} },
    { salary },
  ])("깨진 자료를 삭제하지 않고 재계산 안내를 표시한다 (%j)", fixture => {
    const { html, storage } = renderSaved(JSON.stringify(fixture));
    expect(html).toContain('role="alert"');
    expect(html).toContain("기존 값은 삭제하지 않았습니다");
    expect(html).not.toMatch(/NaN|undefined|Infinity|Invalid Date/);
    expect(storage.setItem).not.toHaveBeenCalled(); expect(storage.removeItem).not.toHaveBeenCalled();
  });
  it("파싱 실패도 원본을 보존하고 읽기 실패를 안내한다", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { html, storage } = renderSaved("broken json");
    expect(html).toContain("저장된 결과를 읽지 못했습니다");
    expect(storage.setItem).not.toHaveBeenCalled(); expect(storage.removeItem).not.toHaveBeenCalled();
    log.mockRestore();
  });
  it("정상·0급여 리포트를 계속 표시한다", () => {
    for (const fixture of [valid, { salary: { annualSalary: 0, monthlyNet: 0 }, lastUpdated }]) {
      const { html } = renderSaved(JSON.stringify(fixture));
      expect(html).toContain("종합 금융 리포트"); expect(html).not.toContain('role="alert"');
      expect(html).not.toMatch(/NaN|undefined|Infinity|Invalid Date/);
    }
  });
  it("자료가 없는 브라우저에는 일반 시작 안내를 표시한다", () => {
    const { html } = renderSaved(null);
    expect(html).toContain("저장된 리포트가 없습니다"); expect(html).not.toContain('role="alert"');
  });
  it("자체 참고표·상환액 비율·선형 시나리오 범위를 표시한다", () => {
    const { html } = renderSaved(JSON.stringify({ ...valid, homeLoan: { monthlyPayment: 1000000 }, futureSalary: { years: 3, finalSalary: 75000000 } }));
    expect(html).toContain("참고표 상위"); expect(html).toContain("연간 상환액 / 세전 연봉");
    expect(html).toContain("목표 연봉 선형 시나리오"); expect(html).not.toContain("상위 NaN");
  });
});
