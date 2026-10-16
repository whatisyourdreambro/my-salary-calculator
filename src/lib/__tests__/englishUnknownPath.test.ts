// 2026-09-23: /en/[...missing] 정적 전환 이후 알 수 없는 /en/* 는 미들웨어가 영어 404 로 rewrite 한다.
// ENGLISH_STATIC_PATHS 가 실제 src/app/en 트리와 어긋나면 새 영어 페이지가 404 로 rewrite 되므로
// 파일 시스템에서 같은 집합을 만들어 대조한다.
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { EN_GUIDE_SLUGS } from "@/lib/enGuideSlugs";
import { ENGLISH_TOOLS } from "@/lib/englishTools";
import { ENGLISH_STATIC_PATHS, ENGLISH_UNAVAILABLE_PATH, isUnknownEnglishPath } from "@/lib/englishRouteGuard";

import { middleware } from "../../middleware";

const request = (path: string) => new NextRequest(`https://www.moneysalary.com${path}`, { headers: { "user-agent": "Mozilla/5.0" } });

function staticEnglishRoutesFromFs(): string[] {
  const root = join(process.cwd(), "src", "app", "en");
  const found: string[] = [];
  const walk = (dir: string, route: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        if (entry.startsWith("[") || entry.startsWith("(")) continue; // dynamic / group segments
        walk(full, `${route}/${entry}`);
      } else if (entry === "page.tsx") {
        found.push(route);
      }
    }
  };
  walk(root, "/en");
  return found.sort();
}

describe("isUnknownEnglishPath", () => {
  it("keeps ENGLISH_STATIC_PATHS identical to the prerendered /en pages on disk", () => {
    expect([...ENGLISH_STATIC_PATHS].sort()).toEqual(staticEnglishRoutesFromFs());
  });

  it("lets every known English page and detail through", () => {
    for (const path of ENGLISH_STATIC_PATHS) {
      expect(isUnknownEnglishPath(path)).toBe(false);
      expect(isUnknownEnglishPath(`${path}/`)).toBe(false);
    }
    expect(isUnknownEnglishPath(ENGLISH_UNAVAILABLE_PATH)).toBe(false);
    const guide = [...EN_GUIDE_SLUGS][0];
    const tool = ENGLISH_TOOLS[0].slug;
    expect(isUnknownEnglishPath(`/en/guides/${guide}`)).toBe(false);
    expect(isUnknownEnglishPath(`/en/tools/${tool}`)).toBe(false);
    expect(isUnknownEnglishPath(`/en/tools/${tool}/`)).toBe(false);
  });

  it("rewrites unknown English URLs and never touches Korean URLs", () => {
    for (const path of ["/en/nope", "/en/nope-xyz/", "/en/guides/does-not-exist", "/en/tools/does-not-exist", "/en/fun/anything", "/en/guides/a/b", "/en/tools/%256Coan"]) {
      expect(isUnknownEnglishPath(path)).toBe(true);
    }
    for (const path of ["/", "/glossary/x", "/english", "/enx", "/salary/50000000", "/qna/a/b"]) {
      expect(isUnknownEnglishPath(path)).toBe(false);
    }
  });
});

describe("middleware English 404 delivery", () => {
  it.each(["/en/nope-xyz", "/en/guides/missing", "/en/tools/missing", "/en/fun/anything"])("rewrites %s through Next with a real 404 and private/noindex headers", async path => {
    const response = middleware(request(path));
    expect(response.status).toBe(404);
    expect(response.headers.get("x-middleware-rewrite")).toBe(`https://www.moneysalary.com${ENGLISH_UNAVAILABLE_PATH}`);
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.text()).toBe("");
  });

  it("leaves RSC rendering to Next instead of substituting Pages-only HTML assets", async () => {
    const req = new NextRequest("https://www.moneysalary.com/en/nope?_rsc=test", {
      headers: { "user-agent": "Mozilla/5.0", RSC: "1" },
    });
    const response = middleware(req);
    expect(response.status).toBe(404);
    expect(response.headers.get("x-middleware-rewrite")).toBe(`https://www.moneysalary.com${ENGLISH_UNAVAILABLE_PATH}`);
    expect(response.headers.get("content-type")).toBeNull();
    expect(await response.text()).toBe("");
  });

  it("also marks the directly addressed recovery route private and noindex", () => {
    const response = middleware(request(ENGLISH_UNAVAILABLE_PATH));
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("does not touch known English pages or Korean pages", () => {
    for (const path of ["/en", "/en/tools", `/en/tools/${ENGLISH_TOOLS[0].slug}`, "/calc/samsung-bonus"]) {
      const response = middleware(request(path));
      expect(response.headers.get("x-middleware-rewrite")).toBeNull();
      expect(response.status).toBe(200);
    }
  });
});
