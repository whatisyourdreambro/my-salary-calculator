// 루트 metadata.icons 회귀 테스트 (2026-09-26 NAVER-01)
//
// 배경: 네이버 모바일·통합검색이 우리 파비콘으로 구 /icon(₩ 글리프 누락 → 흰 네모)을 계속 썼다.
// 네이버 파비콘 가이드(searchadvisor.naver.com/guide/markup-favicon): href 는 절대 경로 필수,
// 우선순위 shortcut icon > icon > /favicon.ico > apple-touch-icon, 같은 rel 은 한 개만,
// 파비콘 URL 은 자주 바꾸지 말 것.
// layout.tsx 는 폰트·CSS·셸 컴포넌트를 import 해 테스트에서 직접 불러오기 무겁다 — 다른 셸 테스트처럼
// 소스에서 icons 객체 리터럴만 떼어 평가하고, Next 14 가 쓰는 resolveIcons·IconsMetadata 로 실제 <link> 를 렌더한다.

import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement, Fragment, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config.mjs";

const ORIGIN = "https://www.moneysalary.com";
const require = createRequire(import.meta.url);

type IconEntry = { url: string; sizes?: string; type?: string };
type Icons = { shortcut?: IconEntry[]; icon?: IconEntry[]; apple?: IconEntry[] };

/** layout.tsx 의 `icons: { ... }` 객체 리터럴을 괄호 짝으로 떼어 평가한다(값은 문자열 리터럴뿐). */
function readRootIcons(): Icons {
  const source = readFileSync(join(process.cwd(), "src/app/layout.tsx"), "utf8");
  const start = source.indexOf("  icons: {");
  expect(start, "layout.tsx 에 icons 블록 없음").toBeGreaterThan(-1);
  const open = source.indexOf("{", start);
  let depth = 0;
  let end = open;
  for (; end < source.length; end += 1) {
    if (source[end] === "{") depth += 1;
    else if (source[end] === "}") {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  const literal = source.slice(open, end + 1);
  expect(literal).not.toMatch(/[A-Za-z_$][\w$]*\s*\(/); // 함수 호출 없이 리터럴만
  return new Function(`return (${literal});`)() as Icons;
}

const icons = readRootIcons();
const all = (): IconEntry[] => [...(icons.shortcut ?? []), ...(icons.icon ?? []), ...(icons.apple ?? [])];
const pathOf = (url: string) => new URL(url).pathname;

describe("root metadata.icons — 네이버 파비콘 규칙", () => {
  it("shortcut icon 이 favicon.ico 절대 URL 하나로 있다", () => {
    expect(icons.shortcut).toEqual([{ url: `${ORIGIN}/favicon.ico` }]);
  });

  it("모든 아이콘 URL 이 https://www.moneysalary.com/ 로 시작한다", () => {
    expect(all().length).toBe(4);
    for (const entry of all()) {
      expect(entry.url.startsWith(`${ORIGIN}/`), entry.url).toBe(true);
    }
  });

  it("파일 경로는 그대로다 (favicon.ico·favicon.svg·icon-192.png) — 파일도 public/ 에 있다", () => {
    expect(icons.icon?.map((e) => pathOf(e.url))).toEqual(["/favicon.ico", "/favicon.svg"]);
    expect(icons.apple?.map((e) => pathOf(e.url))).toEqual(["/icon-192.png"]);
    expect(icons.icon?.[0]).toMatchObject({ sizes: "any" });
    expect(icons.icon?.[1]).toMatchObject({ type: "image/svg+xml" });
    expect(icons.apple?.[0]).toMatchObject({ sizes: "192x192", type: "image/png" });
    for (const p of new Set(all().map((e) => pathOf(e.url)))) {
      expect(existsSync(join(process.cwd(), "public", p)), `public${p}`).toBe(true);
    }
  });

  it("구 /icon·/apple-icon 308 → /icon-192.png 는 유지한다", async () => {
    const cfg = nextConfig as unknown as {
      redirects: () => Promise<{ source: string; destination: string; permanent: boolean }[]>;
    };
    const list = await cfg.redirects();
    for (const source of ["/icon", "/apple-icon"]) {
      expect(list.find((r) => r.source === source)).toEqual({
        source,
        destination: "/icon-192.png",
        permanent: true,
      });
    }
  });

  it("Next 14 렌더 결과: shortcut icon 이 맨 앞 · 절대 href · shortcut·apple 은 한 개씩", () => {
    const { resolveIcons } = require("next/dist/lib/metadata/resolvers/resolve-icons") as {
      resolveIcons: (icons: Icons) => unknown;
    };
    const { IconsMetadata } = require("next/dist/lib/metadata/generate/icons") as {
      IconsMetadata: (props: { icons: unknown }) => ReactNode;
    };
    const html = renderToStaticMarkup(
      createElement(Fragment, null, IconsMetadata({ icons: resolveIcons(icons) }))
    );
    const links = [...html.matchAll(/<link ([^>]*)\/?>/g)].map((m) => m[1]);
    expect(links[0]).toContain(`rel="shortcut icon" href="${ORIGIN}/favicon.ico"`);
    expect(html).toContain(`<link rel="shortcut icon" href="${ORIGIN}/favicon.ico"/>`);
    expect(html).toContain(`<link rel="apple-touch-icon" href="${ORIGIN}/icon-192.png"`);
    expect(html).not.toMatch(/href="\//);
    const rels = links.map((l) => l.match(/rel="([^"]+)"/)?.[1]);
    expect(rels.filter((r) => r === "shortcut icon")).toHaveLength(1);
    expect(rels.filter((r) => r === "apple-touch-icon")).toHaveLength(1);
  });
});
