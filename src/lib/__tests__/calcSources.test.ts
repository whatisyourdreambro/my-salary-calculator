// S3-1 출처(sources) 기반 게이트 (2026-09-12) — docs/calc-content-writing-guide-2026-09-12.md 의 규칙을 고정한다.
//  1) index.ts 병합: sources 도 다른 필드와 같은 우선순위(batch 값이 있으면 batch, 없으면 enrichment).
//  2) 202종 전체: sources URL 은 https·파싱 가능·계산기 안에서 중복 없음·제목 있음.
//  3) enrichment 파일(enrichments·ext-a/b/c)에 넣은 sources 는 정확히 2건, 전부 https + OFFICIAL_SOURCE_HOSTS
//     — 콘텐츠 에이전트가 지켜야 하는 게이트. batch 파일(expandedFinance·expandedPractical)의 2026-09-12 기존
//     sources 32종은 호스트 규칙 면제(2·https 만) — 다시 쓰지 않는다. 면제 집합은 더 늘어나면 안 된다.
//  4) enrichment sources 가 batch sources 있는 슬러그를 겨냥하면 병합에서 무음 폐기되므로 실패시킨다.
//  5) 202종 explanation 은 1,200자 이하이고 explanation·FAQ·유의사항에 HTML(<) 이 없다.
//  6) sourcePolicy 헬퍼 단위 검증 + 허용 목록 위생(소문자·중복·공용 2단계 도메인·하위 도메인 중복 금지).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { calculatorSeoDescription, calculatorSeoTitle } from "@/lib/simpleCalculators/seoText";
import { allCalculators, mergeEnrichment, toClientCalculator } from "@/lib/simpleCalculators";
import type { CalculatorDef } from "@/lib/simpleCalculators/types";
import { enrichmentMap, type Enrichment } from "@/lib/simpleCalculators/enrichments";
import { enrichmentsExtA } from "@/lib/simpleCalculators/enrichments-ext-a";
import { enrichmentsExtB } from "@/lib/simpleCalculators/enrichments-ext-b";
import { enrichmentsExtC } from "@/lib/simpleCalculators/enrichments-ext-c";
import { batch1Calculators } from "@/lib/simpleCalculators/batch1";
import { batch2Calculators } from "@/lib/simpleCalculators/batch2";
import { expandedFinanceCalculators } from "@/lib/simpleCalculators/expandedFinance";
import { expandedPracticalCalculators } from "@/lib/simpleCalculators/expandedPractical";
import {
  OFFICIAL_SOURCE_HOSTS,
  isOfficialSourceHost,
  isOfficialSourceUrl,
  sourceHostOf,
  sourceYear,
} from "@/lib/simpleCalculators/sourcePolicy";

const ENRICHMENT_FILES: Array<[string, Record<string, Enrichment>]> = [
  ["enrichments.ts", enrichmentMap],
  ["enrichments-ext-a.ts", enrichmentsExtA],
  ["enrichments-ext-b.ts", enrichmentsExtB],
  ["enrichments-ext-c.ts", enrichmentsExtC],
];

const rawBySlug = new Map<string, CalculatorDef>();
for (const calc of [...batch1Calculators, ...batch2Calculators, ...expandedFinanceCalculators, ...expandedPracticalCalculators]) {
  rawBySlug.set(calc.slug, calc);
}
const mergedEnrichments: Record<string, Enrichment> = Object.assign({}, ...ENRICHMENT_FILES.map(([, map]) => map));

/** 2026-09-12 기준 호스트 규칙 면제 집합 — expandedFinance/Practical 의 해외·기타 출처를 가진 32종. 늘어나면 안 된다. */
const HOST_RULE_EXEMPT_BASELINE = 32;
const EXEMPT_BATCH_SLUGS = new Set([...expandedFinanceCalculators, ...expandedPracticalCalculators].map((c) => c.slug));

const EXPLANATION_MAX_CHARS = 1200;

function syntheticCalc(overrides: Partial<CalculatorDef> = {}): CalculatorDef {
  return {
    slug: "__synthetic__",
    title: "t",
    description: "d",
    category: "tax",
    categoryLabel: "세금",
    keywords: [],
    fields: [],
    compute: () => ({ primary: { label: "x", value: 0 } }),
    ...overrides,
  };
}

const BATCH_SRC = [{ title: "batch", url: "https://www.investor.gov/a" }];
const ENRICH_SRC = [
  { title: "국세청 — 예시(2026)", url: "https://www.nts.go.kr/a" },
  { title: "법제처 — 예시(2026)", url: "https://www.law.go.kr/b" },
];

describe("sources merge precedence (index.ts mergeEnrichment)", () => {
  it("batch sources win over enrichment sources, like every other merged field", () => {
    const merged = mergeEnrichment(syntheticCalc({ sources: BATCH_SRC }), { sources: ENRICH_SRC });
    expect(merged.sources).toBe(BATCH_SRC);
  });

  it("enrichment sources fill when the batch definition has none", () => {
    const merged = mergeEnrichment(syntheticCalc(), { sources: ENRICH_SRC, explanation: "e" });
    expect(merged.sources).toBe(ENRICH_SRC);
    expect(merged.explanation).toBe("e");
  });

  it("an empty batch array still wins (?? is not ||) and no enrichment returns the definition itself", () => {
    const empty: CalculatorDef["sources"] = [];
    expect(mergeEnrichment(syntheticCalc({ sources: empty }), { sources: ENRICH_SRC }).sources).toBe(empty);
    const calc = syntheticCalc();
    expect(mergeEnrichment(calc, undefined)).toBe(calc);
  });

  it("registry sources equal raw ?? enrichment for every registered slug", () => {
    expect(allCalculators.length).toBe(202);
    for (const calc of allCalculators) {
      const raw = rawBySlug.get(calc.slug);
      expect(raw, calc.slug).toBeDefined();
      expect(calc.sources, calc.slug).toEqual(raw!.sources ?? mergedEnrichments[calc.slug]?.sources);
    }
  });

  it("toClientCalculator carries sources to the client view unchanged", () => {
    for (const calc of allCalculators) {
      expect(toClientCalculator(calc).sources, calc.slug).toEqual(calc.sources);
    }
  });
});

describe("every calculator's sources are well-formed", () => {
  it("https, parseable, non-empty title and unique URL within each calculator", () => {
    const violations: string[] = [];
    for (const calc of allCalculators) {
      const seen = new Set<string>();
      for (const source of calc.sources ?? []) {
        const host = sourceHostOf(source.url);
        if (!host) violations.push(`${calc.slug}: unparseable url ${source.url}`);
        if (!source.url.startsWith("https://")) violations.push(`${calc.slug}: not https ${source.url}`);
        if (!source.title || !source.title.trim()) violations.push(`${calc.slug}: empty title for ${source.url}`);
        if (seen.has(source.url)) violations.push(`${calc.slug}: duplicate url ${source.url}`);
        seen.add(source.url);
      }
    }
    expect(violations).toEqual([]);
  });

  it("the host-rule exemption stays at the 2026-09-12 baseline (expandedFinance/Practical only, at most 32 calculators)", () => {
    const nonOfficial = allCalculators.filter((c) => (c.sources ?? []).some((s) => !isOfficialSourceUrl(s.url)));
    const outsideExempt = nonOfficial.filter((c) => !EXEMPT_BATCH_SLUGS.has(c.slug)).map((c) => c.slug);
    expect(outsideExempt, "batch1/batch2/enrichment sources must be official hosts").toEqual([]);
    expect(nonOfficial.length).toBeLessThanOrEqual(HOST_RULE_EXEMPT_BASELINE);
  });
});

describe("enrichment-file sources gate (content agents)", () => {
  it("every enrichment key targets a registered calculator", () => {
    const orphans = ENRICHMENT_FILES.flatMap(([file, map]) => Object.keys(map).filter((k) => !rawBySlug.has(k)).map((k) => `${k} (${file})`));
    expect(orphans).toEqual([]);
  });

  it("enrichment sources are exactly 2, https, unique and on OFFICIAL_SOURCE_HOSTS", () => {
    const violations: string[] = [];
    for (const [file, map] of ENRICHMENT_FILES) {
      for (const [slug, enrichment] of Object.entries(map)) {
        if (enrichment.sources === undefined) continue;
        const sources = enrichment.sources;
        if (sources.length !== 2) violations.push(`${slug} (${file}): ${sources.length} sources, rule is exactly 2`);
        const urls = new Set(sources.map((s) => s.url));
        if (urls.size !== sources.length) violations.push(`${slug} (${file}): duplicate url`);
        for (const source of sources) {
          if (!source.title.trim()) violations.push(`${slug} (${file}): empty title ${source.url}`);
          if (!isOfficialSourceUrl(source.url)) violations.push(`${slug} (${file}): host not in OFFICIAL_SOURCE_HOSTS or not https — ${source.url}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("enrichment sources never target a slug whose batch definition already has sources (they would be silently dropped)", () => {
    const dead = ENRICHMENT_FILES.flatMap(([file, map]) =>
      Object.entries(map)
        .filter(([slug, e]) => e.sources !== undefined && rawBySlug.get(slug)?.sources !== undefined)
        .map(([slug]) => `${slug} (${file})`)
    );
    expect(dead).toEqual([]);
  });
});

describe("explanation body limits (all 202)", () => {
  it(`explanation is at most ${EXPLANATION_MAX_CHARS} raw characters`, () => {
    const tooLong = allCalculators
      .filter((c) => (c.explanation ?? "").length > EXPLANATION_MAX_CHARS)
      .map((c) => `${c.slug}: ${c.explanation!.length}`);
    expect(tooLong).toEqual([]);
  });

  it("explanation, FAQ text and caveats contain no HTML (<)", () => {
    const html: string[] = [];
    for (const c of allCalculators) {
      if ((c.explanation ?? "").includes("<")) html.push(`${c.slug}: explanation`);
      for (const f of c.faqs ?? []) if (f.q.includes("<") || f.a.includes("<")) html.push(`${c.slug}: faq`);
      for (const v of c.caveats ?? []) if (v.includes("<")) html.push(`${c.slug}: caveat`);
    }
    expect(html).toEqual([]);
  });
});

describe("sourcePolicy", () => {
  const SHARED_SLDS = ["kr", "go.kr", "or.kr", "co.kr", "ne.kr", "re.kr", "pe.kr", "ac.kr"];

  it("allowlist hygiene: lowercase bare hosts, unique, no shared second-level domains, no redundant subdomains", () => {
    const hosts = [...OFFICIAL_SOURCE_HOSTS];
    expect(hosts.length).toBeGreaterThan(0);
    for (const host of hosts) {
      expect(host, host).toMatch(/^[a-z0-9.-]+$/);
      expect(host, host).not.toMatch(/^www\.|\/|:/);
      expect(SHARED_SLDS, host).not.toContain(host);
    }
    expect(new Set(hosts).size).toBe(hosts.length);
    const redundant = hosts.filter((h) => hosts.some((other) => other !== h && h.endsWith(`.${other}`)));
    expect(redundant).toEqual([]);
  });

  it("isOfficialSourceHost matches exact hosts and subdomains only", () => {
    expect(isOfficialSourceHost("nts.go.kr")).toBe(true);
    expect(isOfficialSourceHost("www.nts.go.kr")).toBe(true);
    expect(isOfficialSourceHost("taxlaw.nts.go.kr")).toBe(true);
    expect(isOfficialSourceHost("NTS.GO.KR.")).toBe(true);
    expect(isOfficialSourceHost("fine.fss.or.kr")).toBe(true);
    expect(isOfficialSourceHost("dart.fss.or.kr")).toBe(true);
    expect(isOfficialSourceHost("mods.go.kr")).toBe(true);
    expect(isOfficialSourceHost("nts.go.kr.evil.com")).toBe(false);
    expect(isOfficialSourceHost("notnts.go.kr")).toBe(false);
    expect(isOfficialSourceHost("www.wetax.go.kr")).toBe(false); // *.go.kr is not a blanket rule
    expect(isOfficialSourceHost("www.investor.gov")).toBe(false);
    expect(isOfficialSourceHost("support.microsoft.com")).toBe(false);
    expect(isOfficialSourceHost("")).toBe(false);
  });

  it("isOfficialSourceUrl requires https and an allowlisted host", () => {
    expect(isOfficialSourceUrl("https://www.law.go.kr/법령/근로기준법")).toBe(true);
    expect(isOfficialSourceUrl("https://www.nps.or.kr/jsppage/info/easy/easy_04_01.jsp")).toBe(true);
    expect(isOfficialSourceUrl("http://www.law.go.kr/")).toBe(false);
    expect(isOfficialSourceUrl("https://www.law.go.kr.example.com/")).toBe(false);
    expect(isOfficialSourceUrl("https://www.nts.go.kr@evil.com/")).toBe(false);
    expect(isOfficialSourceUrl("not a url")).toBe(false);
    expect(isOfficialSourceUrl("https://www.investor.gov/x")).toBe(false);
  });

  it("sourceHostOf lowercases the host and returns null for junk", () => {
    expect(sourceHostOf("https://WWW.NTS.go.kr/x")).toBe("www.nts.go.kr");
    expect(sourceHostOf("nope")).toBeNull();
  });

  it("sourceYear prefers the title, takes the latest year, ignores non-year digit runs, falls back to the URL", () => {
    expect(sourceYear({ title: "국세청 — 2026년 귀속 근로소득 간이세액표" })).toBe(2026);
    expect(sourceYear({ title: "근로기준법(2025~2026 개정)" })).toBe(2026);
    expect(sourceYear({ title: "최저임금 10,320원 고시", url: "https://www.minimumwage.go.kr/main.do" })).toBeNull();
    expect(sourceYear({ title: "국민연금 보험료율", url: "https://www.nps.or.kr/notice/2025/rate.do" })).toBe(2025);
    expect(sourceYear({ title: "법령 본문", url: "https://www.law.go.kr/lsInfoP.do?lsiSeq=265430" })).toBeNull();
    expect(sourceYear({ title: "시행일 20260101" })).toBeNull();
    expect(sourceYear({ title: "제목 2024", url: "https://www.nts.go.kr/2026/" })).toBe(2024);
  });
});

describe("details field (S3-1 장문 본문) — 메타 무영향 보장", () => {
  const readSrc = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

  it("mergeEnrichment merges details with batch precedence", () => {
    const base = allCalculators[0];
    const withBatch = { ...base, details: "배치" } as CalculatorDef;
    expect(mergeEnrichment(withBatch, { details: "보강" } as Enrichment).details).toBe("배치");
    const noBatch = { ...base, details: undefined } as CalculatorDef;
    expect(mergeEnrichment(noBatch, { details: "보강" } as Enrichment).details).toBe("보강");
  });

  it("title/description 은 details 유무와 무관하다 (seoText 는 details 를 읽지 않는다)", () => {
    for (const calc of allCalculators) {
      const withDetails: CalculatorDef = { ...calc, details: "가".repeat(900) };
      const stripped: CalculatorDef = { ...calc, details: undefined };
      expect(calculatorSeoDescription(withDetails)).toBe(calculatorSeoDescription(stripped));
      expect(calculatorSeoTitle(withDetails)).toBe(calculatorSeoTitle(calc));
    }
    const seoSrc = readSrc("src/lib/simpleCalculators/seoText.ts");
    expect(seoSrc).not.toContain("details");
  });

  it("details 는 1,200자 이하·HTML 없음 (현재 등록분 전수)", () => {
    for (const calc of allCalculators) {
      if (!calc.details) continue;
      expect(calc.details.length, calc.slug).toBeLessThanOrEqual(1200);
      expect(calc.details, calc.slug).not.toContain("<");
    }
  });

  it("뷰는 details 를 explanation 문단 바로 아래 같은 섹션에 렌더한다 (새 섹션·광고 이동 없음)", () => {
    const view = readSrc("src/components/SimpleCalculatorView.tsx");
    const explIdx = view.indexOf("{calc.explanation}");
    const detailsIdx = view.indexOf("{calc.details && (");
    const guideMidIdx = view.indexOf("{calc.explanation && <GuideMidAd />}");
    expect(explIdx).toBeGreaterThan(-1);
    expect(detailsIdx).toBeGreaterThan(explIdx);
    expect(detailsIdx).toBeLessThan(guideMidIdx);
    expect(view.slice(explIdx, detailsIdx)).not.toContain("<section");
    expect(view).toContain('className="calc-details mt-4 whitespace-pre-line');
    expect(toClientCalculator({ ...allCalculators[0], details: "x" } as CalculatorDef).details).toBe("x");
  });
});
