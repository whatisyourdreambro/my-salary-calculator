/* eslint-disable @typescript-eslint/no-explicit-any -- Plain-object React hook/JSX test runtime; no DOM or network. */
// /calc/annual-leave-days 기준일 하이드레이션 가드 (2026-11-01 감사 SRR-07)
// 정적 HTML 은 서버(빌드)가 넘긴 initialUntil 로 그리고, 방문일은 마운트 뒤 useEffect 에서 한 번만 맞춘다.
// 렌더 중 new Date() 로 기준일을 만들면 정적 HTML(빌드일)과 첫 클라이언트 렌더(방문일)가 어긋난다.
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";
import { entryBasedSchedule, fiscalYearSchedule, totalDays } from "@/lib/annualLeave";

vi.mock("@/components/AdPlacement", () => ({
  CalcResultAd: () => createElement("div", { "data-test-ad": "result" }),
}));
import AnnualLeaveDaysClient from "@/app/calc/annual-leave-days/Client";

const CLIENT = "src/app/calc/annual-leave-days/Client.tsx";
const PAGE = "src/app/calc/annual-leave-days/page.tsx";

/** toISO(new Date()) 호출을 useEffect 콜백 안·밖으로 나눈다 (서식과 무관하게 AST 로) */
function clockReads(src: string) {
  const sf = ts.createSourceFile("Client.tsx", src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const inside: string[] = [];
  const outside: string[] = [];
  const inEffect = (node: ts.Node) => {
    for (let p = node.parent; p; p = p.parent) {
      if (ts.isCallExpression(p) && ts.isIdentifier(p.expression) && p.expression.text === "useEffect") return true;
    }
    return false;
  };
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "toISO") {
      const [arg] = node.arguments;
      if (arg && ts.isNewExpression(arg) && ts.isIdentifier(arg.expression) && arg.expression.text === "Date"
        && (arg.arguments?.length ?? 0) === 0) {
        (inEffect(node) ? inside : outside).push(node.getText(sf));
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return { inside, outside };
}

/** 실제 Client.tsx 를 가짜 훅 런타임으로 실행한다 — 방문일은 인자 없는 new Date() 만 바꾼다 */
function clientRuntime(visitDay: string) {
  const source = ts.transpileModule(readFileSync(CLIENT, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const hooks: any[] = [];
  let cursor = 0;
  let pending: Array<() => void> = [];
  let tree: any;
  const react = {
    useState(initial: any) {
      const index = cursor++;
      hooks[index] ??= { value: typeof initial === "function" ? initial() : initial };
      return [hooks[index].value, (value: any) => {
        hooks[index].value = typeof value === "function" ? value(hooks[index].value) : value;
      }];
    },
    useRef(initial: unknown) { const index = cursor++; return hooks[index] ??= { current: initial }; },
    useMemo(factory: () => unknown, deps: unknown[]) {
      const index = cursor++, previous = hooks[index];
      if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) hooks[index] = { deps, value: factory() };
      return hooks[index].value;
    },
    // 의존성 [] 효과 — 첫 렌더 뒤 한 번만
    useEffect(create: () => void) {
      const index = cursor++;
      if (!hooks[index]) { hooks[index] = { mounted: true }; pending.push(create); }
    },
  };
  class VisitDate extends Date {
    constructor(...args: any[]) {
      super(...((args.length ? args : [`${visitDay}T12:00:00`]) as [string]));
    }
  }
  const element = (type: unknown, props: unknown) => ({ type, props });
  const context = {
    exports: {} as any,
    Date: VisitDate,
    require(name: string) {
      if (name === "react") return react;
      if (name === "react/jsx-runtime") return { jsx: element, jsxs: element };
      if (name === "@/components/AdPlacement") return { CalcResultAd: "CalcResultAd" };
      if (name === "@/lib/annualLeave") return { entryBasedSchedule, fiscalYearSchedule, totalDays };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  };
  vm.runInNewContext(source, context);
  const walk = (node: any): any[] => {
    if (Array.isArray(node)) return node.flatMap(walk);
    return node && typeof node === "object" ? [node, ...walk(node.props?.children)] : [];
  };
  return {
    render(initialUntil: string) { cursor = 0; tree = context.exports.default({ initialUntil }); },
    flushEffects() { const run = pending; pending = []; for (const create of run) create(); },
    untilInput: () => walk(tree).find((node) => node.props?.id === "al-until"),
  };
}

describe("SRR-07 첫 렌더는 서버가 넘긴 initialUntil 그대로", () => {
  it("정적 HTML 의 기준일 칸과 합계가 initialUntil 기준이다 (렌더 시각과 무관)", () => {
    // 렌더 시각을 다른 날로 고정 — 렌더 중 new Date() 를 쓰는 코드라면 2027-03-10 이 찍혀 실패한다
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2027-03-10T12:00:00"));
    try {
      const html = renderToStaticMarkup(createElement(AnnualLeaveDaysClient, { initialUntil: "2026-11-01" }));
      expect(html).toContain('value="2026-11-01"');
      expect(html).not.toContain("2027-03-10");
      expect(html).toContain(`${totalDays(entryBasedSchedule("2023-03-02", "2026-11-01"))}일`);
      expect(html).toContain('data-test-ad="result"');
    } finally {
      vi.useRealTimers();
    }
  });
  it("렌더 중에는 toISO(new Date()) 를 부르지 않는다 — useEffect 안에서만", () => {
    const { inside, outside } = clockReads(readFileSync(CLIENT, "utf8"));
    expect(outside).toEqual([]);
    expect(inside).toHaveLength(1);
  });
  it("page.tsx 는 KST 빌드일을 initialUntil 로 넘긴다", () => {
    const page = readFileSync(PAGE, "utf8");
    expect(page).toMatch(/<AnnualLeaveDaysClient\s+initialUntil=\{buildDayKst\(\)\}\s*\/>/);
    expect(page).toContain("new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)");
  });
});

describe("SRR-07 마운트 뒤 방문일로 한 번 맞춘다 (가짜 훅 런타임, DOM·네트워크 없음)", () => {
  it("첫 클라이언트 렌더는 서버 HTML 과 같고, 효과가 돈 뒤 방문일이 된다", () => {
    const app = clientRuntime("2026-12-15");
    app.render("2026-11-01");
    expect(app.untilInput().props.value).toBe("2026-11-01");
    app.flushEffects();
    app.render("2026-11-01");
    expect(app.untilInput().props.value).toBe("2026-12-15");
  });
  it("사용자가 먼저 고친 기준일은 덮어쓰지 않는다", () => {
    const app = clientRuntime("2026-12-15");
    app.render("2026-11-01");
    app.untilInput().props.onChange({ target: { value: "2025-06-30" } });
    app.flushEffects();
    app.render("2026-11-01");
    expect(app.untilInput().props.value).toBe("2025-06-30");
  });
});
