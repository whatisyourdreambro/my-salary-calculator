// next.config.mjs redirects() 규칙 회귀 테스트 — Next 가 쓰는 컴파일된 path-to-regexp 로 실제 매칭을 확인한다.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
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

// GUIDES-07 (2026-09-26 운영자 승인 14, W3-A ②): 5/23 대량 배치 중 유입 0(GA4 90일 랜딩 5 미만·네이버 5 미만·GSC 클릭 0)이면서
// 틀린 수치·중복 주제를 담은 가이드 40편을 대표 가이드로 정확 경로 308 통합. 이 표가 통합 지도의 정본이다 — next.config.mjs 와 같이 고칠 것.
describe("next.config redirects — GUIDES-07 guide consolidation", () => {
  const MERGED: Record<string, string> = {
    "july-health-adjust-bonus-1eok-2026": "bonus-health-4-percent-2026",
    "july-health-adjust-bonus-detail-2026": "bonus-health-4-percent-2026",
    "bonus-pension-45-ceiling-590-2026": "four-insurance-ceiling-summary-2026",
    "bonus-employment-09-2026": "four-insurance-ceiling-summary-2026",
    "infertility-medical-20-percent-2026": "implant-dental-medical-deduction-2026",
    "eyewear-herb-implant-medical-2026": "implant-dental-medical-deduction-2026",
    "orthodontics-tax-deduction-2026": "implant-dental-medical-deduction-2026",
    "physical-therapy-tax-2026": "implant-dental-medical-deduction-2026",
    "psychiatry-medical-deduction-2026": "implant-dental-medical-deduction-2026",
    "medical-edu-donation-bonus-year-2026": "medical-edu-donation-limits-2026",
    "medical-edu-donation-concentration-2026": "medical-edu-donation-limits-2026",
    "card-25-before-bonus-2026": "credit-card-deduction-30-40-strategy-2026",
    "card-30-40-percent-bonus-2026": "credit-card-deduction-30-40-strategy-2026",
    "credit-card-deduction-limit-detail-2026": "credit-card-deduction-30-40-strategy-2026",
    "book-concert-museum-deduction-2026": "credit-card-deduction-30-40-strategy-2026",
    "dependent-deduction-bonus-year-2026": "parent-support-deduction-integration-2026",
    "parent-support-bonus-year-2026": "parent-support-deduction-integration-2026",
    "monthly-rent-17-bonus-2026": "monthly-rent-tax-credit",
    "monthly-rent-tax-credit-17-2026": "monthly-rent-tax-credit",
    "housing-25-bonus-2026": "housing-subscription-25man-deduction-2026",
    "insurance-100-bonus-2026": "insurance-100man-limit-2026",
    "disability-insurance-2026": "insurance-100man-limit-2026",
    "irp-before-bonus-payout-2026": "irp-pension-year-end-2026",
    "irp-max-bonus-year-2026": "irp-pension-year-end-2026",
    "irp-eligibility-before-bonus-2026": "irp-pension-year-end-2026",
    "isa-for-bonus-2026": "isa-account-guide",
    "salary-bonus-calc-8step-2026": "income-tax-8-step-bracket-2026",
    "bonus-bracket-jump-2026": "income-tax-8-step-bracket-2026",
    "seeking-job-benefit-2026": "unemployment-benefits-complete",
    "employment-insurance-detail-2026": "unemployment-benefits-complete",
    "side-hustle-n-jab-tax-2026": "side-hustle-tax-2026",
    "executive-severance-limit-bonus-deep-2026": "executive-severance-limit-2026",
    "bonus-rsu-same-year-2026": "it-rsu-vs-cash-bonus-2026",
    "before-vs-after-leave-bonus-2026": "bonus-retire-impact-severance-2026",
    "retire-with-bonus-4insurance-2026": "bonus-retire-impact-severance-2026",
    "year-end-encouragement-vs-bonus-2026": "bonus-vs-incentive-vs-allowance-2026",
    "opi-vs-tai-timing-tax-2026": "samsung-opi-tai-complete-2026",
    "samsung-wage-negotiation-status-2026": "samsung-opi-tai-complete-2026",
    "sk-hynix-ps-bonus-2026": "sk-hynix-ps-history-2026-prospect",
    "religious-donation-100-percent-2026": "donation-tax-credit",
  };
  /** W2-C 통합 금지 목록 — 제휴 오퍼 슬롯 가이드(OFFER_GUIDE_SLUGS)와 함께 확인한다. nurse-salary 는 verify:autoads 기준 페이지 */
  const NEVER_MERGE = [
    "coupang-fulfillment-night-pay-2026",
    "bonus-vs-incentive-vs-allowance-2026",
    "incentive-split-payout-2026",
    "tax-free-meal-commute-2026",
    "nurse-salary",
  ];
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  /** '/guides/<slug>' 뒤에 슬러그 문자가 이어지지 않는 참조 (접두어가 같은 다른 슬러그 오탐 방지) */
  const refRe = (slug: string) => new RegExp(`/guides/${escape(slug)}(?![a-z0-9-])`);
  /** 문자열 리터럴 속 슬러그 ("slug" · 'slug') */
  const quotedRe = (slug: string) => new RegExp(`["'\`]${escape(slug)}["'\`]`);

  it("has 40 retirements, all distinct from their destinations", () => {
    expect(Object.keys(MERGED)).toHaveLength(40);
    for (const [from, to] of Object.entries(MERGED)) expect(from).not.toBe(to);
  });

  it("sends each retired guide to one exact live guide in one hop (with or without a trailing slash)", async () => {
    const list = await rules();
    const { koGuides } = await import("@/lib/guidesContent");
    const live = new Set(koGuides.map((g) => g.slug));
    for (const [from, to] of Object.entries(MERGED)) {
      for (const p of [`/guides/${from}`, `/guides/${from}/`]) {
        const hit = matchOf(list, p);
        expect(hit?.rule.destination, p).toBe(`/guides/${to}`);
        expect(hit?.rule.permanent, p).toBe(true);
      }
      // 원본 가이드 객체는 지워져야 한다 — 남아 있으면 목록·사이트맵·관련 글이 308 주소를 계속 가리킨다
      expect(live.has(from), `${from} is still a live guide`).toBe(false);
      expect(live.has(to), `${to} is not a live guide`).toBe(true);
      expect(MERGED[to], `${to} is itself retired (two hops)`).toBeUndefined();
      expect(matchOf(list, `/guides/${to}`), `${to} is a redirect source`).toBeNull();
    }
  });

  it("matches exact paths only and leaves the English guide paths alone (no English twins)", async () => {
    const list = await rules();
    const { enGuides } = await import("@/lib/guidesContent");
    const en = new Set(enGuides.map((g) => g.slug));
    for (const from of Object.keys(MERGED)) {
      expect(matchOf(list, `/guides/${from}-x`), `${from}-x`).toBeNull();
      expect(matchOf(list, `/guides/${from}/x`), `${from}/x`).toBeNull();
      expect(matchOf(list, `/en/guides/${from}`), `/en/guides/${from}`).toBeNull();
      expect(en.has(from), `${from} has an English twin — decide its /en/ target`).toBe(false);
    }
  });

  it("never retires offer-slot guides, the auto-ads gate page or the keep list", async () => {
    const list = await rules();
    const client = readFileSync(join(process.cwd(), "src/app/guides/[slug]/GuidePageClient.tsx"), "utf8");
    const offerBlock = /OFFER_GUIDE_SLUGS = new Set\(\[([\s\S]*?)\]\)/.exec(client)?.[1] ?? "";
    const offer = [...offerBlock.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    expect(offer.length, "OFFER_GUIDE_SLUGS 를 읽지 못함").toBeGreaterThan(5);
    for (const slug of [...offer, ...NEVER_MERGE]) {
      expect(MERGED[slug], slug).toBeUndefined();
      expect(matchOf(list, `/guides/${slug}`), slug).toBeNull();
    }
  });

  it("leaves no internal link or slug reference to a retired guide", async () => {
    const { guides } = await import("@/lib/guidesContent");
    const { guideSupplements } = await import("@/lib/guides/supplements");
    const bodies = [...guides.map((g) => g.content), ...Object.values(guideSupplements)].join("\n");
    // src 전체(테스트·생성 파일 제외) — 관련 글 지도(crossLink)·카테고리·검색 색인 등의 하드코딩 슬러그.
    // guidesMeta.generated.ts 는 gen-guides-meta 가 guides 에서 다시 만든다.
    const sources: { rel: string; text: string }[] = [];
    const walk = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) {
          if (e.name !== "__tests__") walk(p);
        } else if (/\.(ts|tsx|js|mjs)$/.test(e.name) && e.name !== "guidesMeta.generated.ts") {
          sources.push({ rel: p, text: readFileSync(p, "utf8") });
        }
      }
    };
    walk(join(process.cwd(), "src"));
    expect(sources.length).toBeGreaterThan(100);
    for (const from of Object.keys(MERGED)) {
      expect(refRe(from).test(bodies), `guide body links /guides/${from}`).toBe(false);
      const hits = sources.filter((s) => refRe(from).test(s.text) || quotedRe(from).test(s.text)).map((s) => s.rel);
      expect(hits, from).toEqual([]);
    }
  });

  it("sends the percent-encoded 12억 typo URL (GSC 404) to the live 12eok guide", async () => {
    const list = await rules();
    const { koGuides } = await import("@/lib/guidesContent");
    const hit = matchOf(list, "/guides/one-home-prop-tax-12%EC%96%B5-2026");
    expect(hit?.rule.destination).toBe("/guides/one-home-prop-tax-12eok-2026");
    expect(hit?.rule.permanent).toBe(true);
    expect(koGuides.some((g) => g.slug === "one-home-prop-tax-12eok-2026")).toBe(true);
    // 목적지 자체는 가로채지 않는다
    expect(matchOf(list, "/guides/one-home-prop-tax-12eok-2026")).toBeNull();
  });
});
