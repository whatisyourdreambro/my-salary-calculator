// 404(not-found.tsx) 메타·광고 보류 스크립트 게이트 (2026-09-25 B1).
// - 404 는 홈 <title>·robots 'index, follow' 를 물려받지 않는다 (Next 자동 noindex 와 상충 방지).
// - 광고 요청 보류 인라인 스크립트는 바이트 그대로 (게시자 정책 — 콘텐츠 없는 화면 광고 금지).
// - 클라이언트 컴포넌트 import 금지 (Edge 라우트 매니페스트에서 빠져 500 — 2026-09-11).
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { metadata } from "@/app/not-found";
import nextConfig from "../../../next.config.mjs";

const SRC = readFileSync(resolve(process.cwd(), "src/app/not-found.tsx"), "utf8");

describe("not-found metadata", () => {
  it("전용 제목(absolute — layout 템플릿 미적용)과 noindex, follow", () => {
    expect(metadata.title).toEqual({ absolute: "페이지를 찾을 수 없습니다 | 머니샐러리" });
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it("광고 요청 보류 인라인 스크립트가 바이트 그대로 남아 있다", () => {
    expect(SRC).toContain(
      '<script dangerouslySetInnerHTML={{ __html: "(window.adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1;" }} />',
    );
    expect(SRC).toContain('data-page-state="not-found"');
  });

  it("import 는 타입(next)·AppLink·lucide-react 만 — 클라이언트 컴포넌트 직접 import 금지", () => {
    const specifiers = [...SRC.matchAll(/^import\s[^;]*?from\s+"([^"]+)";/gm)].map((m) => m[1]);
    expect(specifiers.sort()).toEqual(["@/components/AppLink", "lucide-react", "next"]);
    expect(SRC).toMatch(/^import type \{ Metadata \} from "next";/m);
    expect(SRC).not.toMatch(/^["']use client["']/m);
  });

  // infra-b02-F01 (2026-11-15): 404 추천 카드는 연도를 쓰지 않는다 — currentRates 를 import 할 수 없어(위 import 가드)
  // 1/1 요율 전환 때 '2026' 이 남는다. 홈 카드 설명은 연도 중립 문구.
  it("추천 카드 설명에 연도 숫자가 없다 (홈 카드 = 세후 실수령액 즉시 계산)", () => {
    expect(SRC).toContain('{ href: "/", label: "연봉 계산기", icon: Home, description: "세후 실수령액 즉시 계산" }');
    const block = SRC.slice(SRC.indexOf("const SUGGESTED_LINKS"), SRC.indexOf("export default function NotFound"));
    expect(block).not.toMatch(/description: "[^"]*20\d\d/);
  });

  // 2026-11-15 infra ideas[6]: 성과급 성수기 대표 착지(/calc/samsung-bonus)를 /fire-calculator 자리에 — 카드 수는 그대로 8개.
  // 404 는 광고 요청을 보류하는 화면이라 움직일 광고가 없다. 링크는 실제 정적 페이지이고 리다이렉트 출발지가 아니어야 한다.
  it("추천 카드 8개는 실제 페이지(리다이렉트 아님)이고 성수기 성과급 계산기를 포함한다", async () => {
    const block = SRC.slice(SRC.indexOf("const SUGGESTED_LINKS"), SRC.indexOf("export default function NotFound"));
    const hrefs = [...block.matchAll(/\{ href: "([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toHaveLength(8);
    expect(new Set(hrefs).size).toBe(8);
    expect(hrefs).toContain("/calc/samsung-bonus");
    expect(hrefs).not.toContain("/fire-calculator");
    expect(SRC).toContain('{ href: "/salary-db", label: "회사별 연봉", icon: Building2, description: "회사 이름으로 연봉 찾기" }');
    type Key = { name: string | number };
    const { pathToRegexp } = createRequire(import.meta.url)("next/dist/compiled/path-to-regexp") as {
      pathToRegexp: (path: string, keys: Key[], options: { strict: boolean; sensitive: boolean; delimiter: string }) => RegExp;
    };
    const cfg = nextConfig as unknown as { redirects?: () => Promise<Array<{ source: string }>> };
    const rules = cfg.redirects ? await cfg.redirects() : [];
    expect(rules.length).toBeGreaterThan(100);
    for (const href of hrefs) {
      expect(existsSync(resolve(process.cwd(), "src/app", `.${href}`, "page.tsx")), href).toBe(true);
      for (const r of rules) {
        expect(pathToRegexp(r.source, [], { strict: false, sensitive: false, delimiter: "/" }).test(href), `${href} <- ${r.source}`).toBe(false);
      }
    }
  });
});
