// 트렌드 브리프 사양 게이트 (2026-09-26 R5 publisher)
//
// (1) 등록된 브리프 전부(trendBriefGuides — 비어 있으면 공허하게 통과) + (2) 합성 픽스처를 실제로 렌더한 모듈:
//   키퍼형 구조(리드·맨 H2 6개·표·FAQ 3+·3분할·분량·기준일·작성 방식) · 한국어 가이드 전체와 제목 중복 없음 · metaDescription 없음 ·
//   허용 카테고리 · 태그 공식발표해설 · 미래 날짜 없음 · 원장 한도 · 내부 링크 실존.
// (3) 렌더 모듈: guideSpec (5) 소스 탐색기로 본문 템플릿을 찾고(H2·표 개수 일치), 그 템플릿을 평가한 값이 draftToHtml 과 같다.
//     본문에 심은 정본 표기(최저시급·구직급여 상한)는 ${constText(…)} 로 바뀌고, 임시 사본에서 verify:tax 가 통과한다.
// (4) rss.xml 실제 크기 < 620,000B · FeaturedGuides 필터 두 곳 · text.ts splitContentByH2 복제가 원본과 같다.
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import type { Guide } from "@/lib/guidesData";
import { koGuides } from "@/lib/guidesContent";
import { trendBriefGuides } from "@/lib/guides/trend-briefs";
import { extractGuideFaqs } from "@/lib/guideFaq";
import { GET } from "@/app/rss.xml/route";
import { constText, impactCell, impactRows, stripProvisionalDisclosures } from "@/lib/trendBriefs/impacts";
import {
  buildMonthlyFile,
  draftToEntrySource,
  draftToGuide,
  draftToHtml,
  parseMonthlyBlocks,
  removeFromMonthly,
  upsertAggregator,
  upsertMonthly,
} from "@/lib/trendBriefs/render";
import { capViolations, kstToday, parseVerifyTaxPatterns, type LedgerEntry } from "@/lib/trendBriefs/rules";
import { guideSegments, utf8Bytes, visibleText } from "@/lib/trendBriefs/text";
import {
  BRIEF_CATEGORIES,
  HTML_BUDGET_BYTES,
  HTML_MIN_JS_CHARS,
  RSS_PROJECTION_LIMIT,
  TREND_BRIEF_TAG,
  VISIBLE_TEXT,
  type TrendBriefDraft,
} from "@/lib/trendBriefs/types";

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const FX = JSON.parse(read("src/lib/__tests__/fixtures/trendBriefDrafts.json")) as { good: TrendBriefDraft };
const LEDGER = JSON.parse(read("scripts/trend-publish/ledger.json")) as LedgerEntry[];
const TODAY = kstToday();
const koTitles = koGuides.map((g) => g.title);

/** 키퍼형 구조 위반 목록 (guideSpec keeperViolations 의 브리프판 — metaDescription·기준선 대신 브리프 한도) */
function briefViolations(g: Guide): string[] {
  const v: string[] = [];
  const html = g.content;
  // 분량 한도는 writer 글만 — 렌더가 붙인 결정 전 값 고지 문장은 뺀다(rules.ts structure 와 같은 기준)
  const text = stripProvisionalDisclosures(visibleText(html));
  if (!html.startsWith('<p class="lead">')) v.push("lead 로 시작하지 않음");
  const h2 = [...html.matchAll(/<h2([^>]*)>/g)];
  if (h2.length !== 6 || h2.some((m) => m[1] !== "")) v.push(`맨 <h2> 6개 아님 (${h2.length})`);
  if (!html.includes('<table class="w-full text-sm">')) v.push("표 없음");
  if (extractGuideFaqs(html).length < 3) v.push("FAQ < 3");
  if (html.length < HTML_MIN_JS_CHARS) v.push(`HTML ${html.length} < ${HTML_MIN_JS_CHARS}`);
  if (utf8Bytes(html) > HTML_BUDGET_BYTES) v.push(`HTML ${utf8Bytes(html)}B > ${HTML_BUDGET_BYTES}`);
  if (text.length < VISIBLE_TEXT.min || text.length > VISIBLE_TEXT.max) v.push(`가시 텍스트 ${text.length}`);
  if (guideSegments(html).length !== 3) v.push("3분할 아님");
  if (!html.includes("기준일")) v.push("기준일 없음");
  if (html.includes("검수 완료")) v.push("검수 완료 금지");
  if (!html.includes("이 글은 이렇게 만들었습니다")) v.push("작성 방식 상자 없음");
  if (g.metaDescription !== undefined) v.push("metaDescription 금지");
  if (!(BRIEF_CATEGORIES as readonly string[]).includes(g.category)) v.push(`카테고리 ${g.category}`);
  if (!g.tags.includes(TREND_BRIEF_TAG)) v.push("공식발표해설 태그 없음");
  if (g.publishedDate > TODAY || (g.modifiedDate ?? g.publishedDate) > TODAY) v.push("미래 날짜");
  if ((g.modifiedDate ?? g.publishedDate) < g.publishedDate) v.push("수정일 < 발행일");
  if (koTitles.filter((t) => t === g.title).length > 1) v.push("제목 중복");
  for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) {
    const p = m[1].replace(/\/$/, "") || "/";
    const guide = /^\/guides\/([^/]+)$/.exec(p);
    const ok = p === "/" || (guide ? koGuides.some((x) => x.slug === guide[1]) : existsSync(join(ROOT, "src/app", p, "page.tsx")));
    if (!ok) v.push(`없는 내부 링크 ${p}`);
  }
  return v;
}

// guideSpec.test.ts (5) 소스 탐색기 복제 — 본문 템플릿 원문을 찾는다
function templateEnd(src: string, start: number): number {
  let i = start;
  while (i < src.length) {
    const c = src[i];
    if (c === "\\") i += 2;
    else if (c === "`") return i;
    else if (c === "$" && src[i + 1] === "{") i = exprEnd(src, i + 2);
    else i++;
  }
  throw new Error("닫히지 않은 템플릿 리터럴");
}
function exprEnd(src: string, start: number): number {
  let depth = 1;
  let i = start;
  while (i < src.length) {
    const c = src[i];
    if (c === "`") {
      i = templateEnd(src, i + 1) + 1;
      continue;
    }
    if (c === '"' || c === "'") {
      i++;
      while (i < src.length && src[i] !== c) i += src[i] === "\\" ? 2 : 1;
      i++;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return i + 1;
    i++;
  }
  throw new Error("닫히지 않은 ${ } 식");
}
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function findContentTemplate(text: string, slug: string): string | null {
  const m = new RegExp(`slug:\\s*["']${escapeRe(slug)}["']`).exec(text);
  if (!m) return null;
  const rest = text.slice(m.index);
  const next = rest.slice(1).search(/slug:\s*["']/);
  const scope = next < 0 ? rest : rest.slice(0, next + 1);
  const c = /\bcontent:\s*(`)/.exec(scope);
  if (!c) return null;
  const s = m.index + c.index + c[0].length;
  return text.slice(s, templateEnd(text, s));
}
const evalTemplate = (body: string) =>
  new Function("impactRows", "impactCell", "constText", `return \`${body}\`;`)(impactRows, impactCell, constText) as string;

describe("(1) 등록된 브리프 (비어 있으면 공허하게 통과)", () => {
  // main 가이드 상태 기준 — 10/9 삼성 DS 특별성과급 소식 1편 추가로 한국어 가이드 295편(종전 294편, 통합 브랜치 8e37ceb8 은 334편)
  it("집계는 guidesContent 의 마지막 spread 이고, 비어 있는 동안 한국어 가이드는 295편", () => {
    const src = read("src/lib/guidesContent.ts").replace(/\r\n/g, "\n");
    expect(src).toContain('import { trendBriefGuides } from "@/lib/guides/trend-briefs";');
    expect(/\.\.\.trendBriefGuides,\n\];/.test(src)).toBe(true);
    if (trendBriefGuides.length === 0) expect(koGuides.length).toBe(295);
  });

  it("각 브리프가 사양을 지킨다", () => {
    const report = trendBriefGuides.map((g) => ({ slug: g.slug, v: briefViolations(koGuides.find((k) => k.slug === g.slug) ?? g) })).filter((r) => r.v.length);
    expect(report).toEqual([]);
  });

  it("원장과 등록이 맞고, 원장 이력이 한도를 지켰다", () => {
    const live = LEDGER.filter((e) => e.status === "live").map((e) => e.slug).sort();
    expect(trendBriefGuides.map((g) => g.slug).sort()).toEqual(live);
    const sorted = [...LEDGER].sort((a, b) => (a.publishedDate + a.slug < b.publishedDate + b.slug ? -1 : 1));
    sorted.forEach((e, i) => {
      const before = sorted.slice(0, i).map((x) => (x.status === "retired" && x.retiredAt && x.retiredAt <= e.publishedDate ? { ...x } : { ...x, status: "live" as const }));
      expect(capViolations(e.publishedDate, before, undefined, { cluster: e.cluster, primaryUrl: e.primary.url, primarySha: e.primary.sha256 }), e.slug).toEqual([]);
    });
  });
});

describe("(2)·(3) 합성 픽스처 렌더 모듈", () => {
  const draft: TrendBriefDraft = { ...FX.good, publishedDate: TODAY, modifiedDate: TODAY };
  const planted: TrendBriefDraft = {
    ...draft,
    effective: {
      ...draft.effective,
      caveats: [...draft.effective.caveats.slice(0, 3), "최저시급 10,320원과 구직급여 1일 상한 68,100원은 이번 방안과 별개로 정해지는 값입니다."],
    },
  };
  const month = TODAY.slice(0, 7);
  const moduleSrc = buildMonthlyFile(month, [{ slug: planted.slug, block: draftToEntrySource(planted), publishedDate: TODAY }]);

  it("렌더 결과가 키퍼형 사양을 지킨다", () => {
    expect(briefViolations(draftToGuide(draft))).toEqual([]);
    expect(briefViolations(draftToGuide(planted))).toEqual([]);
  });

  it("guideSpec (5) 소스 탐색기가 본문 템플릿을 찾고 H2·표 개수가 렌더와 같다", () => {
    const body = findContentTemplate(moduleSrc, planted.slug);
    expect(body).not.toBeNull();
    const html = draftToHtml(planted);
    const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;
    expect(count(body!, /<h2[\s>]/g)).toBe(count(html, /<h2[\s>]/g));
    expect(count(body!, /<table class="w-full text-sm">/g)).toBe(1);
    expect(count(html, /<table class="w-full text-sm">/g)).toBe(1);
    // 보간은 impactRows·impactCell·constText 셋뿐
    const calls = [...body!.matchAll(/\$\{([A-Za-z]+)\(/g)].map((m) => m[1]);
    expect(calls.length).toBeGreaterThan(0);
    expect([...new Set(calls)].filter((c) => !["impactRows", "impactCell", "constText"].includes(c))).toEqual([]);
    // 템플릿을 평가한 값 = draftToHtml (소스와 게이트가 같은 본문을 본다)
    expect(evalTemplate(body!)).toBe(html);
  });

  it("심은 정본 표기는 ${constText(…)} 로 바뀌고 소스에 verify:tax 리터럴이 없다", () => {
    expect(moduleSrc).toContain('${constText("MINIMUM_WAGE_2026_HOURLY")}');
    expect(moduleSrc).toContain('${constText("UNEMPLOYMENT_UPPER_2026")}');
    const html = draftToHtml(planted);
    expect(html).toContain("최저시급 10,320원과 구직급여 1일 상한 68,100원");
    const patterns = parseVerifyTaxPatterns(read("scripts/verify-tax-constants.mjs"));
    expect(patterns.filter((p) => p.re.test(moduleSrc)).map((p) => p.name)).toEqual([]);
  });

  it("임시 사본에서 verify:tax 가 통과한다 (리터럴을 그대로 둔 대조군은 실패)", () => {
    const tmp = mkdtempSync(join(tmpdir(), "trend-vtax-"));
    try {
      for (const f of ["scripts/verify-tax-constants.mjs", "scripts/tax-constants-allow.json", "src/config/currentRates.ts", "src/lib/taxConstants2027.ts", "src/app/calc/samsung-bonus/model.ts"]) {
        mkdirSync(dirname(join(tmp, f)), { recursive: true });
        copyFileSync(join(ROOT, f), join(tmp, f));
      }
      const target = join(tmp, `src/lib/guides/trend-briefs-${month}.ts`);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, moduleSrc);
      const ok = spawnSync(process.execPath, ["scripts/verify-tax-constants.mjs"], { cwd: tmp, encoding: "utf8" });
      expect(ok.status, ok.stderr).toBe(0);
      writeFileSync(target, moduleSrc.replace('${constText("MINIMUM_WAGE_2026_HOURLY")}', "10,320원"));
      const bad = spawnSync(process.execPath, ["scripts/verify-tax-constants.mjs"], { cwd: tmp, encoding: "utf8" });
      expect(bad.status).toBe(1);
      expect(bad.stderr).toContain("trend-briefs-");
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("월별 파일·집계 파일 편집은 멱등이고 철회로 항목이 빠진다", () => {
    const once = upsertMonthly(null, month, draft);
    expect(upsertMonthly(once, month, draft)).toBe(once);
    expect(parseMonthlyBlocks(once).map((b) => b.slug)).toEqual([draft.slug]);
    const other = { ...draft, slug: "synthetic-other-brief-2027", title: "다른 합성 제목 정부안" };
    const two = upsertMonthly(once, month, other);
    expect(parseMonthlyBlocks(two).map((b) => b.slug).sort()).toEqual([draft.slug, other.slug].sort());
    expect(parseMonthlyBlocks(removeFromMonthly(two, month, other.slug)).map((b) => b.slug)).toEqual([draft.slug]);
    expect(removeFromMonthly(two, month, other.slug)).toBe(once);
    const agg = read("src/lib/guides/trend-briefs.ts");
    const a1 = upsertAggregator(agg, month);
    expect(upsertAggregator(a1, month)).toBe(a1);
    expect(a1).toContain(`import { trendBriefs${month.replace("-", "")} } from "./trend-briefs-${month}";`);
    expect(a1).toContain(`  ...trendBriefs${month.replace("-", "")},`);
    const a2 = upsertAggregator(a1, "2026-11");
    const imports = a2.split("\n").filter((l) => l.startsWith("import { trendBriefs"));
    expect(imports).toEqual([...imports].sort());
    // 빈 월별 파일은 impacts import 없이도 유효한 모듈 모양
    expect(buildMonthlyFile(month, [])).not.toContain("@/lib/trendBriefs/impacts");
  });
});

describe("(4) 피드·홈·분할 함수", () => {
  it("실제 rss.xml 이 620,000B 미만 (rssGuidesFeed.test 와 같은 방식)", async () => {
    const xml = await (await GET()).text();
    expect(Buffer.byteLength(xml, "utf8")).toBeLessThan(RSS_PROJECTION_LIMIT);
  });

  it("FeaturedGuides 는 최근·보충 두 체인 모두 브리프를 거른다", () => {
    const src = read("src/components/FeaturedGuides.tsx");
    expect(src).toContain('import { TREND_BRIEF_TAG } from "@/lib/trendBriefs/types";');
    expect((src.match(/\.filter\(\(g\) => !g\.tags\?\.includes\(TREND_BRIEF_TAG\)\)/g) ?? []).length).toBe(2);
  });

  it("text.ts 의 splitContentByH2 복제가 GuidePageClient.tsx 원본과 글자 그대로 같다", () => {
    const fnOf = (src: string) => {
      const s = src.replace(/\r\n/g, "\n");
      const start = s.indexOf("function splitContentByH2(");
      expect(start, "splitContentByH2 없음").toBeGreaterThanOrEqual(0);
      return s.slice(start, s.indexOf("\n}\n", start) + 2);
    };
    expect(fnOf(read("src/lib/trendBriefs/text.ts"))).toBe(fnOf(read("src/app/guides/[slug]/GuidePageClient.tsx")));
  });
});
