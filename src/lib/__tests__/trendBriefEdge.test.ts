// 트렌드 브리프 — Workers 요청 경로 의존성 격리 게이트 (2026-09-26 R5 publisher)
//
// OpenNext는 Node 런타임을 Workers용으로 번들한다. 제거된 `runtime = 'edge'` 선언 대신
// 기존 15개 요청 경로와 미들웨어, 새 API·위젯 라우트를 명시적으로 검사한다.
// 각 정적 import 그래프(@/ · 상대 경로 · export from · 동적 import 문자열)를 따라가
// src/lib/guides/trend-briefs*.ts 와 src/lib/trendBriefs/* 에 닿지 않는지 확인한다.
// 이는 요청 경로의 의존성 게이트이며, 최종 OpenNext 공유 번들 전체 크기는 별도 빌드 검사 대상이다.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const rel = (p: string) => relative(ROOT, p).replace(/\\/g, "/");

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === "__tests__" || name === "node_modules") continue;
      yield* walk(p);
    } else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)) yield p;
  }
}

const EXTS = ["", ".ts", ".tsx", ".js", ".mjs", "/index.ts", "/index.tsx", "/index.js"];
function resolveImport(from: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = join(SRC, spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(from), spec);
  else return null; // 패키지
  for (const ext of EXTS) {
    const p = base + ext;
    if (existsSync(p) && statSync(p).isFile()) return p;
  }
  return null;
}

const IMPORT_RE = /(?:import|export)\s+(?:type\s+)?(?:[^'"`;]*?\s+from\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)|require\(\s*["']([^"']+)["']\s*\)/g;

/** 정적 import 그래프 (type-only import 는 번들에 들어가지 않으므로 뺀다) */
function importGraph(entry: string): Set<string> {
  const seen = new Set<string>();
  const stack = [entry];
  while (stack.length) {
    const file = stack.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(IMPORT_RE)) {
      if (/^(?:import|export)\s+type\s/.test(m[0])) continue;
      const spec = m[1] ?? m[2] ?? m[3];
      const target = resolveImport(file, spec);
      if (target && !seen.has(target)) stack.push(target);
    }
  }
  return seen;
}

const REQUIRED_REQUEST_ENTRIES = [
  "src/middleware.ts",
  "src/app/api/contact/route.ts",
  "src/app/api/feedback/route.ts",
  "src/app/api/og/route.tsx",
  "src/app/api/salary-table/route.ts",
  "src/app/widget/bonus/route.ts",
  "src/app/widget/company/route.ts",
  "src/app/widget/dsr/route.ts",
  "src/app/widget/military-pay/route.ts",
  "src/app/widget/minimum-wage/route.ts",
  "src/app/widget/salary/route.ts",
  "src/app/widget/severance/route.ts",
  "src/app/widget/year-end-tax/route.ts",
  "src/app/glossary/[slug]/page.tsx",
  "src/app/qna/[slug]/page.tsx",
  "src/app/share/[data]/page.tsx",
] as const;
const discoveredRoutes = [...walk(SRC)].filter((f) =>
  /^src\/app\/(?:api|widget)\/.*\/route\.tsx?$/.test(rel(f)),
);
const requestFiles = [...new Set([
  ...REQUIRED_REQUEST_ENTRIES.map((file) => join(ROOT, file)),
  ...discoveredRoutes,
])];
const isTrend = (p: string) => /src\/lib\/guides\/trend-briefs[^/]*\.ts$/.test(rel(p)) || rel(p).startsWith("src/lib/trendBriefs/");

describe("트렌드 브리프 — Workers 요청 경로 격리", () => {
  it("기존 요청 경로와 새 API·위젯 라우트를 빠짐없이 검사한다", () => {
    expect(REQUIRED_REQUEST_ENTRIES).toHaveLength(16);
    expect(requestFiles.filter((file) => !existsSync(file)).map(rel)).toEqual([]);
    expect(requestFiles.map(rel)).toEqual(expect.arrayContaining([...REQUIRED_REQUEST_ENTRIES]));
    expect(discoveredRoutes.length).toBeGreaterThanOrEqual(12);
    // 그래프가 실제로 따라가는지 — og 라우트는 여러 모듈을 import 한다
    const og = requestFiles.find((f) => rel(f) === "src/app/api/og/route.tsx");
    expect(og).toBeDefined();
    expect(importGraph(og!).size).toBeGreaterThan(1);
  });

  it("요청 경로가 trend-briefs*·src/lib/trendBriefs/* 에 닿지 않는다", () => {
    const leaks = requestFiles.flatMap((f) =>
      [...importGraph(f)].filter(isTrend).map((t) => `${rel(f)} → ${rel(t)}`)
    );
    expect(leaks, "요청 경로가 불필요한 브리프 본문·엔진을 끌어온다").toEqual([]);
  });

  it("검사기가 공허하지 않다 — guidesContent 는 trend-briefs 를 끌어온다", () => {
    const g = importGraph(join(SRC, "lib/guidesContent.ts"));
    expect([...g].some(isTrend)).toBe(true);
  });
});
