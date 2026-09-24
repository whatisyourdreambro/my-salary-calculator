// next.config.mjs redirects() 규칙 회귀 테스트 — Next 가 쓰는 컴파일된 path-to-regexp 로 실제 매칭을 확인한다.
import { existsSync } from "node:fs";
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

// B8 (2026-09-25): 옛 URL 404 → 정확 경로 308. 목적지는 실데이터(회사 id·비교 쌍)로 존재를 확인한다.
describe("next.config redirects — B8 legacy URLs", () => {
  const LEGACY_COMPANY: Record<string, string> = {
    "/company/hyundai-motor": "/salary-db/hyundai",
    "/company/lg-energy": "/salary-db/lgensol",
    "/salary-db/hyundai-motor": "/salary-db/hyundai",
    "/salary-db/lg-energy": "/salary-db/lgensol",
  };

  // 2026-08-16 GSC 노출 URL 중 현재 비교 쌍에 없는 7건
  const DEAD_COMPARE: Record<string, string> = {
    "korea-zinc-vs-posco": "/salary-db/compare/posco-vs-korea-zinc",
    "toss-viva-vs-naver-financial": "/salary-db/compare/toss-vs-naver-financial",
    "lx-semicon-vs-samsung-electronics": "/salary-db/lx-semicon",
    "bithumb-vs-toss": "/salary-db/bithumb",
    "korea-sfa-vs-lg-display": "/salary-db/korea-sfa",
    "toss-vs-shinhan-card": "/salary-db/toss",
    "bucketplace-vs-sk-cc": "/salary-db/ohou",
  };

  const PARENTS: Record<string, string> = {
    "/salary": "/table/2026/annual",
    "/monthly": "/table/2026/monthly",
  };

  it("sends the two legacy company ids to their canonical pages before the generic /company rule", async () => {
    const list = await rules();
    for (const [from, to] of Object.entries(LEGACY_COMPANY)) {
      const hit = matchOf(list, from);
      expect(hit?.rule.destination, from).toBe(to);
      expect(hit?.rule.permanent, from).toBe(true);
    }
  });

  it("sends each dead compare URL to one exact destination", async () => {
    const list = await rules();
    for (const [slug, to] of Object.entries(DEAD_COMPARE)) {
      const hit = matchOf(list, `/salary-db/compare/${slug}`);
      expect(hit?.rule.destination, slug).toBe(to);
      expect(hit?.rule.permanent, slug).toBe(true);
    }
  });

  it("points compare redirects at pages that exist and never shadows a live compare pair", async () => {
    const { companyRepository } = await import("@/lib/salary-data/CompanyRepository");
    const { getComparePairs } = await import("@/lib/salary-data/companyComparePairs");
    const ids = new Set(companyRepository.getAll().map((c) => c.id));
    const slugs = new Set(getComparePairs().map((p) => p.slug));
    for (const [slug, to] of Object.entries(DEAD_COMPARE)) {
      // 데이터가 바뀌어 같은 슬러그가 다시 생기면 이 규칙이 실제 페이지를 가린다 → 규칙을 지울 것
      expect(slugs.has(slug), `${slug} is live again`).toBe(false);
      const compare = to.match(/^\/salary-db\/compare\/([^/]+)$/);
      if (compare) expect(slugs.has(compare[1]), to).toBe(true);
      else expect(ids.has(to.replace("/salary-db/", "")), to).toBe(true);
    }
    for (const to of Object.values(LEGACY_COMPANY)) {
      expect(ids.has(to.replace("/salary-db/", "")), to).toBe(true);
    }
    // 옛 id 자체는 회사 페이지가 없어야 규칙이 의미가 있다
    expect(ids.has("hyundai-motor")).toBe(false);
    expect(ids.has("lg-energy")).toBe(false);
  });

  it("redirects only the bare /salary and /monthly parents", async () => {
    const list = await rules();
    for (const [from, to] of Object.entries(PARENTS)) {
      expect(matchOf(list, from)?.rule.destination, from).toBe(to);
      expect(existsSync(new URL(`../../app${to}/page.tsx`, import.meta.url)), to).toBe(true);
      // 상위 경로에 실제 페이지가 생기면 이 규칙이 그 페이지를 가린다
      expect(existsSync(new URL(`../../app${from}/page.tsx`, import.meta.url)), from).toBe(false);
    }
    for (const p of ["/salary/50000000", "/salary/5000-manwon", "/monthly/3000000", "/salaryx", "/monthlyx"]) {
      expect(matchOf(list, p), p).toBeNull();
    }
  });

  it("keeps every old URL of the deleted /company and /salary-db/submit pages on a config 308 (decision 10 stage 2)", async () => {
    const app = (p: string) => existsSync(new URL(`../../app/${p}`, import.meta.url));
    // 도달 불가였던 페이지는 삭제 — 되살리면 config 규칙에 가려 다시 죽은 코드가 된다
    expect(app("company/page.tsx")).toBe(false);
    expect(app("company/[id]/page.tsx")).toBe(false);
    expect(app("salary-db/submit/page.tsx")).toBe(false);
    expect(app("salary-db/submit/layout.tsx")).toBe(false);
    // 실제 페이지는 유지
    expect(app("company/compare/page.tsx")).toBe(true);
    expect(app("company/compare/[slug]/page.tsx")).toBe(true);
    expect(app("company/simulator/page.tsx")).toBe(true);

    const list = await rules();
    const cases: Array<[string, string]> = [
      ["/company", "/salary-db"],
      ["/company/", "/salary-db"],
      ["/salary-db/submit", "/salary-db"],
      ["/salary-db/submit/", "/salary-db"],
      ["/company/samsung-electronics", "/salary-db/samsung-electronics"],
      ["/company/naver/", "/salary-db/naver"],
      ["/company/hyundai-motor", "/salary-db/hyundai"],
      ["/company/lg-energy", "/salary-db/lgensol"],
    ];
    for (const [from, to] of cases) {
      const hit = matchOf(list, from);
      expect(hit, from).not.toBeNull();
      expect(hit!.rule.permanent, from).toBe(true);
      const dest = hit!.rule.destination.replace(/:(\w+)/g, (_, k: string) => hit!.params[k]);
      expect(dest, from).toBe(to);
    }
  });

  it("lands every fixed-destination rule in one hop (the destination is not itself a redirect source)", async () => {
    const list = await rules();
    const fixed = list.filter((r) => !r.destination.includes(":"));
    expect(fixed.length).toBeGreaterThan(100);
    for (const r of fixed) {
      expect(matchOf(list, r.destination), `${r.source} -> ${r.destination}`).toBeNull();
    }
  });
});
