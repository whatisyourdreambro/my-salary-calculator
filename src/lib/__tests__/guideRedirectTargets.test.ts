// 삭제된 가이드 슬러그 8건의 config 308 목적지 검증 (2026-09-26, GSC 노출 URL 스윕).
// 프로덕션(CF Pages)은 force-static 인 guides/[slug] 의 페이지 폴백 redirect 를 건너뛰어 404 를 낸다.
// 로컬 next start 는 폴백 308 을 주므로 로컬 확인으로는 이 404 가 보이지 않는다 — 규칙과 목적지를 여기서 고정한다.
// 1홉(목적지가 다시 redirect source 가 아님) 검사는 configRedirects.test.ts 가 이미 한다.
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config.mjs";
import { guideCards } from "@/lib/guidesMeta.generated";
import { jobsData } from "@/data/jobsData";
import { allCalculators } from "@/lib/simpleCalculators";

// 매처는 configRedirects.test.ts 와 같은 방식 — Next 가 쓰는 컴파일된 path-to-regexp 로 실제 매칭한다.
const require = createRequire(import.meta.url);
type Key = { name: string | number };
type PathToRegexp = (path: string, keys: Key[], options: { strict: boolean; sensitive: boolean; delimiter: string }) => RegExp;
const { pathToRegexp } = require("next/dist/compiled/path-to-regexp") as { pathToRegexp: PathToRegexp };

type Rule = { source: string; destination: string; permanent: boolean };

async function rules(): Promise<Rule[]> {
  const cfg = nextConfig as unknown as { redirects?: () => Promise<Rule[]> };
  return cfg.redirects ? cfg.redirects() : [];
}

function matchOf(list: Rule[], pathname: string): Rule | null {
  for (const rule of list) {
    const re = pathToRegexp(rule.source, [], { strict: false, sensitive: false, delimiter: "/" });
    if (re.test(pathname)) return rule;
  }
  return null;
}

// 옛 슬러그 → 주제가 이어지는 현재 페이지 (정확 경로 1홉)
const GUIDE_REDIRECTS: Record<string, string> = {
  "hyundai-production-salary": "/salary-db/hyundai",
  "salary-guide-2025": "/guides/salary-guide-2026",
  "public-servant-salary": "/job/civil-servant-9",
  "salary-negotiation-strategy": "/guides/salary-negotiation-secret",
  "developer-roadmap-2026": "/job/software-engineer",
  "compound-interest-magic": "/calc/compound-interest-quick",
  "linkedin-power-up": "/guides/linkedin-networking",
  "sp500-vs-nasdaq": "/guides/etf-beginner",
};

// 이어받을 주제가 없어 의도적으로 404 로 둔다 — 허브(/guides 등)로 보내면 soft 404 로 판정된다.
const INTENTIONAL_GONE: Record<string, string> = {
  "pm-career-path": "PM(프로덕트 매니저) 커리어를 다루는 현행 가이드·직업 페이지가 없다",
  "parking-account-comparison": "파킹통장 상품 비교를 다루는 현행 페이지가 없다(금리는 상품별로 수시 변동)",
  "majority-union-benefits": "과반수 노조 혜택을 다루는 현행 페이지가 없다",
  "startup-vs-large-corp": "1:1 후속 글이 없다 — big-corp-vs-mid-2026 은 세 회사 유형 선택 글이라 부분 일치에 그친다",
};

describe("deleted guide slugs — config 308 targets", () => {
  it("sends each of the 8 deleted slugs to exactly one destination with a permanent redirect", async () => {
    const list = await rules();
    expect(Object.keys(GUIDE_REDIRECTS)).toHaveLength(8);
    for (const [slug, to] of Object.entries(GUIDE_REDIRECTS)) {
      const from = `/guides/${slug}`;
      const hit = matchOf(list, from);
      expect(hit, from).not.toBeNull();
      expect(hit!.source, from).toBe(from);
      expect(hit!.destination, from).toBe(to);
      expect(hit!.permanent, from).toBe(true);
    }
  });

  it("does not shadow a live guide (the old slug has no page any more)", () => {
    const live = new Set(guideCards.map((g) => g.slug));
    for (const slug of Object.keys(GUIDE_REDIRECTS)) {
      expect(live.has(slug), `${slug} is a live guide again — remove its redirect`).toBe(false);
    }
  });

  it("leaves the intentionally gone slugs without any redirect rule", async () => {
    const list = await rules();
    expect(Object.keys(INTENTIONAL_GONE)).toHaveLength(4);
    for (const [slug, reason] of Object.entries(INTENTIONAL_GONE)) {
      expect(reason.length, slug).toBeGreaterThan(0);
      expect(matchOf(list, `/guides/${slug}`), slug).toBeNull();
    }
  });

  it("points every destination at a page that exists", async () => {
    const { companyRepository } = await import("@/lib/salary-data/CompanyRepository");
    const guideSlugs = new Set(guideCards.map((g) => g.slug));
    const companyIds = new Set(companyRepository.getAll().map((c) => c.id));
    const jobIds = new Set(jobsData.map((j) => j.id));
    const calcSlugs = new Set(allCalculators.map((c) => c.slug));
    const staticCalcDir = (slug: string) => existsSync(new URL(`../../app/calc/${slug}/page.tsx`, import.meta.url));

    for (const to of Object.values(GUIDE_REDIRECTS)) {
      const m = to.match(/^\/(guides|salary-db|job|calc)\/([^/]+)$/);
      expect(m, `${to} has an unexpected shape`).not.toBeNull();
      const [, section, id] = m!;
      if (section === "guides") expect(guideSlugs.has(id), to).toBe(true);
      else if (section === "salary-db") expect(companyIds.has(id), to).toBe(true);
      else if (section === "job") expect(jobIds.has(id), to).toBe(true);
      else expect(calcSlugs.has(id) || staticCalcDir(id), to).toBe(true);
    }
  });
});
