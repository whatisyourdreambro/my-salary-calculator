// 2026-11-15 N2-perf-04 (lens-perf-F09) — 회사 페이지 비공개 의견 폼 지연 로드 가드.
// 회사 페이지 430쪽 가운데 폼을 그리는 곳은 삼성전자 하나라 /salary-db/[id] 만 지연 래퍼(PrivateFeedbackLazy)를 쓴다.
// 래퍼가 Suspense 경계를 만들면(loading 옵션 또는 ssr:false) 클라이언트 전환 때 폼 자리가 비었다가 늦게 나타나
// 그 아래 HomeTopAd·SidebarAd 가 밀린다. 그래서 dynamic() 의 형태와 그 전제가 되는 next 동작을 함께 고정한다.
// 폼 위치(InArticleAd 바로 아래)는 samsungCompanyFeedbackOrder.test.ts 가 지킨다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8").replace(/\r\n/g, "\n");
const stripComments = (src: string) =>
  src.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("PrivateFeedbackLazy", () => {
  const raw = read("src/components/PrivateFeedbackLazy.tsx");
  const code = stripComments(raw);

  it("클라이언트 래퍼이고 dynamic() 을 옵션 없이 한 번만 부른다 (loading·ssr:false 금지 — Suspense 경계가 생김)", () => {
    expect(raw.startsWith('"use client";')).toBe(true);
    expect(code).toContain('import dynamic from "next/dynamic";');
    expect(code.match(/\bdynamic\(/g)).toHaveLength(1);
    expect(code).toContain('const PrivateFeedback = dynamic(() => import("./PrivateFeedback"));');
    expect(code).not.toMatch(/\bloading\b/);
    expect(code).not.toMatch(/\bssr\b/);
    expect(code).not.toContain("Suspense");
    expect(code).toContain("export default function PrivateFeedbackLazy({ target }: { target: FixedFeedbackTarget })");
    expect(code).toContain("return <PrivateFeedback target={target} />;");
  });

  it("전제: next/dynamic 은 ssr 기본값·loading 없음일 때 Suspense 경계를 만들지 않는다 (next 업그레이드 때 다시 확인)", () => {
    const loadable = read("node_modules/next/dist/shared/lib/lazy-dynamic/loadable.js");
    expect(loadable).toContain("const hasSuspenseBoundary = !opts.ssr || !!opts.loading;");
    expect(loadable).toMatch(/const defaultOptions = \{[\s\S]*?loading: null,[\s\S]*?ssr: true[\s\S]*?\};/);
  });
});

describe("가져오는 곳", () => {
  it("회사 페이지는 지연 래퍼를 같은 이름으로 가져오고, 폼 JSX 한 줄은 그대로다", () => {
    const page = read("src/app/salary-db/[id]/page.tsx");
    expect(page).toContain('import PrivateFeedback from "@/components/PrivateFeedbackLazy";');
    expect(page).not.toContain('from "@/components/PrivateFeedback";');
    expect(page.match(/<PrivateFeedback target="samsung_company" \/>/g)).toHaveLength(1);
    expect(page).toMatch(/\{company\.id === "samsung-electronics" && \(\s*<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">\s*<PrivateFeedback target="samsung_company" \/>\s*<\/div>\s*\)\}/);
  });

  it("폼을 늘 그리는 /calc/samsung-bonus·/civil-servant-pay-2027 은 정적 import 그대로", () => {
    expect(read("src/app/calc/samsung-bonus/Client.tsx")).toContain('import PrivateFeedback from "@/components/PrivateFeedback";');
    expect(read("src/app/civil-servant-pay-2027/page.tsx")).toContain('import PrivateFeedback from "@/components/PrivateFeedback";');
  });
});
