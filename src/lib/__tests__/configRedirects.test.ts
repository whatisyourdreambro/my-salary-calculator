// next.config.mjs redirects() 규칙 회귀 테스트 — Next 가 쓰는 컴파일된 path-to-regexp 로 실제 매칭을 확인한다.
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config.mjs";

const require = createRequire(import.meta.url);
type Key = { name: string | number };
type PathToRegexp = (path: string, keys: Key[], options: { strict: boolean; sensitive: boolean; delimiter: string }) => RegExp;
const { pathToRegexp } = require("next/dist/compiled/path-to-regexp") as { pathToRegexp: PathToRegexp };

type Rule = { source: string; destination: string; permanent: boolean };

async function rules(): Promise<Rule[]> {
  const cfg = nextConfig as unknown as { redirects?: () => Promise<Rule[]> };
  return cfg.redirects ? cfg.redirects() : [];
}

function matchOf(list: Rule[], pathname: string): { rule: Rule; params: Record<string, string> } | null {
  for (const rule of list) {
    const keys: Key[] = [];
    const re = pathToRegexp(rule.source, keys, { strict: false, sensitive: false, delimiter: "/" });
    const m = pathname.match(re);
    if (!m) continue;
    const params: Record<string, string> = {};
    keys.forEach((k, i) => { params[String(k.name)] = m[i + 1]; });
    return { rule, params };
  }
  return null;
}

describe("next.config redirects — S1-5 SEO hygiene", () => {
  it("/community goes to the Q&A hub with a permanent redirect", async () => {
    const hit = matchOf(await rules(), "/community");
    expect(hit?.rule.destination).toBe("/qna");
    expect(hit?.rule.permanent).toBe(true);
  });

  it("/company/{id} maps to /salary-db/{id} at the config layer", async () => {
    const list = await rules();
    for (const id of ["samsung-electronics", "sk-hynix", "comparex"]) {
      const hit = matchOf(list, `/company/${id}`);
      expect(hit?.rule.destination).toBe("/salary-db/:id");
      expect(hit?.params.id).toBe(id);
    }
  });

  it("leaves the real /company pages alone", async () => {
    const list = await rules();
    for (const p of ["/company/compare", "/company/simulator", "/company/compare/", "/company/simulator/", "/company/compare/samsung-electronics-vs-sk-hynix"]) {
      expect(matchOf(list, p)).toBeNull();
    }
    // 인덱스 /company 자체는 기존 규칙으로 /salary-db 에 간다(의도된 동작, 회귀 방지).
    expect(matchOf(list, "/company")?.rule.destination).toBe("/salary-db");
  });

  it("has no duplicate sources", async () => {
    const sources = (await rules()).map((r) => r.source);
    expect(new Set(sources).size).toBe(sources.length);
  });
});
