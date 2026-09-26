// 트렌드 브리프 — edge 런타임 격리 게이트 (2026-09-26 R5 publisher)
//
// CF Workers 무료 플랜 CPU 10ms(1102 사건) — 브리프 본문·엔진 표가 edge 함수 번들에 실리면 안 된다.
// `export const runtime = 'edge'` 파일마다 정적 import 그래프(@/ · 상대 경로 · export from · 동적 import 문자열)를 따라가
// src/lib/guides/trend-briefs*.ts 와 src/lib/trendBriefs/* 에 닿지 않는지 확인한다.
// (빌드 산출물 쪽 검사는 scripts/verify-edge-bundle.mjs — 이 테스트는 빌드 없이 소스 그래프로 먼저 막는다.)
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

const EDGE_RE = /export\s+const\s+runtime\s*=\s*["']edge["']/;
const edgeFiles = [...walk(SRC)].filter((f) => EDGE_RE.test(readFileSync(f, "utf8")));
const isTrend = (p: string) => /src\/lib\/guides\/trend-briefs[^/]*\.ts$/.test(rel(p)) || rel(p).startsWith("src/lib/trendBriefs/");

describe("트렌드 브리프 — edge 번들 격리", () => {
  it("edge 런타임 파일을 찾는다 (공허하지 않음)", () => {
    expect(edgeFiles.length).toBeGreaterThanOrEqual(10);
    // 그래프가 실제로 따라가는지 — og 라우트는 여러 모듈을 import 한다
    const og = edgeFiles.find((f) => rel(f) === "src/app/api/og/route.tsx");
    expect(og).toBeDefined();
    expect(importGraph(og!).size).toBeGreaterThan(1);
  });

  it("어떤 edge 파일도 trend-briefs*·src/lib/trendBriefs/* 에 닿지 않는다", () => {
    const leaks = edgeFiles.flatMap((f) =>
      [...importGraph(f)].filter(isTrend).map((t) => `${rel(f)} → ${rel(t)}`)
    );
    expect(leaks, "edge 함수가 브리프 본문·엔진을 끌어온다 — 1102(CPU 한도) 위험").toEqual([]);
  });

  it("검사기가 공허하지 않다 — guidesContent 는 trend-briefs 를 끌어온다", () => {
    const g = importGraph(join(SRC, "lib/guidesContent.ts"));
    expect([...g].some(isTrend)).toBe(true);
  });
});
