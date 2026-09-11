// scripts/calc-content-audit.ts
//
// S3-1 선행 실측표 (docs/next-upgrade-plan-2026-09-11.md §4) — 간이 계산기 /calc/[slug] 전 종의
// 설명 길이·FAQ 수·출처·유의사항·보일러플레이트(타 슬러그와 글자 단위 동일 본문)·정밀 쌍을 실측한다.
//
// 실행: npx tsx scripts/calc-content-audit.ts                       → stdout 에 Markdown
//       npx tsx scripts/calc-content-audit.ts --out docs/xxx.md     → 파일로 저장(UTF-8, BOM 없음)
//       npx tsx scripts/calc-content-audit.ts --json path.json      → 원시 행(JSON)도 함께 저장
//
// 읽기 전용 — 저장소의 어떤 파일도 수정하지 않는다(--out/--json 지정 경로만 쓴다). 서버 전용 모듈만
// import 하므로 클라이언트 번들과 무관하다. 데이터 원본은 index.ts 병합 결과(allCalculators) 그대로라
// /calc/[slug] 페이지가 실제로 렌더하는 텍스트와 1:1 이다.
//
// 수치 정의
//  - 설명자: explanation 을 공백 정규화(연속 공백→1칸, 앞뒤 제거)한 글자 수. 제목·description·공식·FAQ 제외.
//  - FAQ답변자: faqs[].a 의 정규화 글자 수 합계.
//  - 출처: sources[] 개수. 국내공식 = 호스트가 *.go.kr / *.or.kr (또는 OFFICIAL_KR_HOSTS) 인 URL 수.
//         공식(허용목록) = sourcePolicy.isOfficialSourceUrl(https + OFFICIAL_SOURCE_HOSTS 접미사) 인 URL 수 — S3-1 게이트 기준.
//  - 보일러: explanation / 각 faq.a / 각 caveat 를 정규화 후 SHA-1 → 2개 이상 슬러그가 공유하는 그룹.
//  - 색인: src/app/calc/[slug]/page.tsx 의 규칙 (explanation 있음 && faqs ≥ 3) — 아니면 noindex.

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { allCalculators, getAllSlugs, getCalculatorBySlug, getCalculatorBatch } from "../src/lib/simpleCalculators/index";
import type { CalculatorDef } from "../src/lib/simpleCalculators/types";
import { PRECISION_TWINS } from "../src/lib/simpleCalculators/twins";
import { isOfficialSourceUrl } from "../src/lib/simpleCalculators/sourcePolicy";
import { enrichmentMap, type Enrichment } from "../src/lib/simpleCalculators/enrichments";
import { enrichmentsExtA } from "../src/lib/simpleCalculators/enrichments-ext-a";
import { enrichmentsExtB } from "../src/lib/simpleCalculators/enrichments-ext-b";
import { enrichmentsExtC } from "../src/lib/simpleCalculators/enrichments-ext-c";
import { batch1Calculators } from "../src/lib/simpleCalculators/batch1";
import { batch2Calculators } from "../src/lib/simpleCalculators/batch2";
import { expandedFinanceCalculators } from "../src/lib/simpleCalculators/expandedFinance";
import { expandedPracticalCalculators } from "../src/lib/simpleCalculators/expandedPractical";

// ── 옵션 ─────────────────────────────────────────────────────────────────────

interface Options {
  out?: string;
  json?: string;
}

function parseArgs(argv: string[]): Options {
  const opts: Options = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--out" || arg === "--json") {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${arg} 옵션에는 경로가 필요합니다.`);
      }
      opts[arg === "--out" ? "out" : "json"] = value;
      i++;
    } else if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        "usage: npx tsx scripts/calc-content-audit.ts [--out <markdown path>] [--json <json path>]\n"
      );
      process.exit(0);
    } else {
      throw new Error(`알 수 없는 옵션: ${arg}`);
    }
  }
  return opts;
}

// ── 상수 ─────────────────────────────────────────────────────────────────────

/** 카테고리 표시 순서 = types.ts union 순서 (S3-1 우선 5개가 앞에 온다). */
const CATEGORY_ORDER: CalculatorDef["category"][] = [
  "tax",
  "salary",
  "loan",
  "real-estate",
  "investment",
  "insurance",
  "business",
  "life",
  "health",
  "family",
  "career",
  "currency",
];

/** S3-1 1차 대상 카테고리 (계획서: 세금·급여·대출·부동산·투자 50종부터). */
const PRIORITY_CATEGORIES = new Set<CalculatorDef["category"]>(["tax", "salary", "loan", "real-estate", "investment"]);

/** 계획서가 지목한 국내 공식 출처 호스트 (접미사 *.go.kr / *.or.kr 도 공식으로 본다). */
const OFFICIAL_KR_HOSTS = [
  "nts.go.kr",
  "hometax.go.kr",
  "moel.go.kr",
  "nps.or.kr",
  "nhis.or.kr",
  "law.go.kr",
  "fss.or.kr",
  "bok.or.kr",
  "kostat.go.kr",
  "kosis.kr",
  "korea.kr",
  "gov.kr",
];

/** 해외 공공기관 접미사 — 계획서 "있어도 해외" 항목을 분리 집계한다. */
const FOREIGN_PUBLIC_SUFFIXES = [".gov", ".gov.uk", ".edu", ".edu.my", ".europa.eu"];

const LENGTH_BUCKETS: Array<{ label: string; min: number; max: number }> = [
  { label: "<200", min: 0, max: 199 },
  { label: "200-400", min: 200, max: 400 },
  { label: "400-600", min: 401, max: 600 },
  { label: "600-1000", min: 601, max: 1000 },
  { label: ">1000", min: 1001, max: Number.POSITIVE_INFINITY },
];

const CANDIDATE_COUNT = 50;
const TOP_GROUPS = 10;

// ── 유틸 ─────────────────────────────────────────────────────────────────────

function normalizeText(text: string): string {
  return text.normalize("NFC").replace(/\s+/g, " ").trim();
}

function charCount(text: string | undefined): number {
  return text ? normalizeText(text).length : 0;
}

function sha1(text: string): string {
  return createHash("sha1").update(text).digest("hex");
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function isOfficialKr(host: string): boolean {
  if (!host) return false;
  if (host.endsWith(".go.kr") || host.endsWith(".or.kr")) return true;
  return OFFICIAL_KR_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
}

function isForeignPublic(host: string): boolean {
  return FOREIGN_PUBLIC_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

function lengthBucket(chars: number): string {
  return LENGTH_BUCKETS.find((b) => chars >= b.min && chars <= b.max)?.label ?? ">1000";
}

function bucketIndex(chars: number): number {
  const idx = LENGTH_BUCKETS.findIndex((b) => chars >= b.min && chars <= b.max);
  return idx < 0 ? LENGTH_BUCKETS.length - 1 : idx;
}

function md(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function pct(part: number, whole: number): string {
  return whole === 0 ? "0.0%" : `${((part / whole) * 100).toFixed(1)}%`;
}

function yn(flag: boolean): string {
  return flag ? "Y" : "-";
}

function kstToday(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// ── 본문 출처 파일 판정 ───────────────────────────────────────────────────────

type TextField = "explanation" | "formula" | "faqs" | "caveats";

const rawBySlug = new Map<string, CalculatorDef>();
const duplicateRawSlugs: string[] = [];
for (const calc of [
  ...batch1Calculators,
  ...batch2Calculators,
  ...expandedFinanceCalculators,
  ...expandedPracticalCalculators,
]) {
  if (rawBySlug.has(calc.slug)) duplicateRawSlugs.push(calc.slug);
  else rawBySlug.set(calc.slug, calc);
}

/** index.ts 병합 순서(뒤가 이김)의 역순 — 실제로 적용되는 enrichment 파일을 찾는다. */
const ENRICHMENT_FILES: Array<[string, Record<string, Enrichment>]> = [
  ["enrichments-ext-c.ts", enrichmentsExtC],
  ["enrichments-ext-b.ts", enrichmentsExtB],
  ["enrichments-ext-a.ts", enrichmentsExtA],
  ["enrichments.ts", enrichmentMap],
];

function textOrigin(slug: string, field: TextField): string {
  const raw = rawBySlug.get(slug);
  if (raw && raw[field] !== undefined) return `${getCalculatorBatch(slug) ?? "?"}.ts`;
  for (const [file, map] of ENRICHMENT_FILES) {
    if (map[slug]?.[field] !== undefined) return file;
  }
  return "-";
}

// ── 보일러플레이트 그룹 ──────────────────────────────────────────────────────

type BoilerplateKind = "explanation" | "faq" | "caveat";

interface BoilerplateGroup {
  id: string;
  kind: BoilerplateKind;
  chars: number;
  sample: string;
  members: string[];
}

interface GroupAccumulator {
  kind: BoilerplateKind;
  text: string;
  members: Set<string>;
}

const groupAcc = new Map<string, GroupAccumulator>();

function registerText(kind: BoilerplateKind, text: string | undefined, slug: string): string | null {
  if (!text) return null;
  const norm = normalizeText(text);
  if (norm.length < 20) return null; // 짧은 상투구("계산 예시입니다." 등)는 판정 대상에서 제외
  const key = `${kind}:${sha1(norm)}`;
  const acc = groupAcc.get(key) ?? { kind, text: norm, members: new Set<string>() };
  acc.members.add(slug);
  groupAcc.set(key, acc);
  return key;
}

// ── 행 계산 ───────────────────────────────────────────────────────────────────

interface Row {
  slug: string;
  title: string;
  category: CalculatorDef["category"];
  categoryLabel: string;
  batchFile: string;
  explanationFile: string;
  faqFile: string;
  descriptionChars: number;
  explanationChars: number;
  explanationBucket: string;
  explanationHasNumber: boolean;
  hasFormula: boolean;
  formulaChars: number;
  faqCount: number;
  faqAnswerChars: number;
  faqAnswerMinChars: number;
  sourcesCount: number;
  officialKrSources: number;
  /** sourcePolicy 허용 목록·https 를 만족하는 URL 수 (S3-1 게이트 기준) */
  allowlistedSources: number;
  foreignPublicSources: number;
  sourceHosts: string[];
  caveatsCount: number;
  explanationGroup: string | null;
  faqGroups: string[];
  caveatGroups: string[];
  boilerplateGroups: string[];
  isBoilerplateMember: boolean;
  hasTwin: boolean;
  twinHref: string | null;
  indexEligible: boolean;
  relatedCount: number;
}

interface PendingKeys {
  explanation: string | null;
  faq: string[];
  caveat: string[];
}

function buildRows(): { rows: Row[]; groups: BoilerplateGroup[] } {
  const slugs = getAllSlugs();
  const pending = new Map<string, PendingKeys>();
  const partial: Array<Omit<Row, "explanationGroup" | "faqGroups" | "caveatGroups" | "boilerplateGroups" | "isBoilerplateMember">> = [];

  for (const slug of slugs) {
    const calc = getCalculatorBySlug(slug);
    if (!calc) continue;
    const explanationKey = registerText("explanation", calc.explanation, slug);
    const faqKeys = (calc.faqs ?? [])
      .map((f) => registerText("faq", f.a, slug))
      .filter((k): k is string => Boolean(k));
    const caveatKeys = (calc.caveats ?? [])
      .map((c) => registerText("caveat", c, slug))
      .filter((k): k is string => Boolean(k));
    pending.set(slug, { explanation: explanationKey, faq: faqKeys, caveat: caveatKeys });

    const sources = calc.sources ?? [];
    const hosts = sources.map((s) => hostOf(s.url));
    const explanationChars = charCount(calc.explanation);
    const faqAnswerLens = (calc.faqs ?? []).map((f) => charCount(f.a));
    const twin = PRECISION_TWINS[slug];

    partial.push({
      slug,
      title: calc.title,
      category: calc.category,
      categoryLabel: calc.categoryLabel,
      batchFile: `${getCalculatorBatch(slug) ?? "?"}.ts`,
      explanationFile: textOrigin(slug, "explanation"),
      faqFile: textOrigin(slug, "faqs"),
      descriptionChars: charCount(calc.description),
      explanationChars,
      explanationBucket: lengthBucket(explanationChars),
      explanationHasNumber: /\d/.test(calc.explanation ?? ""),
      hasFormula: Boolean(calc.formula),
      formulaChars: charCount(calc.formula),
      faqCount: calc.faqs?.length ?? 0,
      faqAnswerChars: faqAnswerLens.reduce((a, b) => a + b, 0),
      faqAnswerMinChars: faqAnswerLens.length ? Math.min(...faqAnswerLens) : 0,
      sourcesCount: sources.length,
      officialKrSources: hosts.filter(isOfficialKr).length,
      allowlistedSources: sources.filter((s) => isOfficialSourceUrl(s.url)).length,
      foreignPublicSources: hosts.filter((h) => !isOfficialKr(h) && isForeignPublic(h)).length,
      sourceHosts: hosts,
      caveatsCount: calc.caveats?.length ?? 0,
      hasTwin: Boolean(twin),
      twinHref: twin?.href ?? null,
      indexEligible: Boolean(calc.explanation && calc.faqs && calc.faqs.length >= 3),
      relatedCount: calc.relatedSlugs?.length ?? 0,
    });
  }

  // 그룹 확정: 2개 이상 슬러그가 공유하는 것만, 크기 내림차순 → 종류 → 글자수 내림차순
  const kindOrder: Record<BoilerplateKind, number> = { explanation: 0, faq: 1, caveat: 2 };
  const groupEntries = [...groupAcc.entries()]
    .filter(([, acc]) => acc.members.size >= 2)
    .sort(([, a], [, b]) => {
      if (b.members.size !== a.members.size) return b.members.size - a.members.size;
      if (kindOrder[a.kind] !== kindOrder[b.kind]) return kindOrder[a.kind] - kindOrder[b.kind];
      return b.text.length - a.text.length;
    });
  const idByKey = new Map<string, string>();
  const groups: BoilerplateGroup[] = groupEntries.map(([key, acc], i) => {
    const id = `B${String(i + 1).padStart(2, "0")}`;
    idByKey.set(key, id);
    return {
      id,
      kind: acc.kind,
      chars: acc.text.length,
      sample: acc.text.length > 70 ? `${acc.text.slice(0, 70)}…` : acc.text,
      members: [...acc.members].sort(),
    };
  });

  const rows: Row[] = partial.map((p) => {
    const keys = pending.get(p.slug)!;
    const explanationGroup = keys.explanation ? (idByKey.get(keys.explanation) ?? null) : null;
    const faqGroups = [...new Set(keys.faq.map((k) => idByKey.get(k)).filter((id): id is string => Boolean(id)))];
    const caveatGroups = [...new Set(keys.caveat.map((k) => idByKey.get(k)).filter((id): id is string => Boolean(id)))];
    const boilerplateGroups = [...new Set([...(explanationGroup ? [explanationGroup] : []), ...faqGroups, ...caveatGroups])];
    return { ...p, explanationGroup, faqGroups, caveatGroups, boilerplateGroups, isBoilerplateMember: boilerplateGroups.length > 0 };
  });

  return { rows, groups };
}

// ── 후보 50종 ─────────────────────────────────────────────────────────────────

const RANKING_RULE = [
  `1) 카테고리 계층: ${[...PRIORITY_CATEGORIES].join("·")} 를 0계층(우선), 나머지를 1계층으로 두고 0계층부터 채운다.`,
  `2) 설명 길이 구간 오름차순: ${LENGTH_BUCKETS.map((b) => b.label).join(" < ")} (짧을수록 먼저).`,
  "3) 출처 수 오름차순 (0건 먼저).",
  "4) 보일러플레이트 멤버(설명·FAQ 답변·유의사항 중 하나라도 타 슬러그와 동일) 우선.",
  "5) 동점이면 설명 글자 수 오름차순 → slug 사전순.",
];

function rankCandidates(rows: Row[]): Row[] {
  return [...rows]
    .sort((a, b) => {
      const tierA = PRIORITY_CATEGORIES.has(a.category) ? 0 : 1;
      const tierB = PRIORITY_CATEGORIES.has(b.category) ? 0 : 1;
      if (tierA !== tierB) return tierA - tierB;
      const bucketA = bucketIndex(a.explanationChars);
      const bucketB = bucketIndex(b.explanationChars);
      if (bucketA !== bucketB) return bucketA - bucketB;
      if (a.sourcesCount !== b.sourcesCount) return a.sourcesCount - b.sourcesCount;
      if (a.isBoilerplateMember !== b.isBoilerplateMember) return a.isBoilerplateMember ? -1 : 1;
      if (a.explanationChars !== b.explanationChars) return a.explanationChars - b.explanationChars;
      return a.slug.localeCompare(b.slug);
    })
    .slice(0, CANDIDATE_COUNT);
}

// ── Markdown ─────────────────────────────────────────────────────────────────

function countBy<T>(items: T[], key: (item: T) => string, order?: string[]): Array<[string, number]> {
  const map = new Map<string, number>();
  for (const item of items) map.set(key(item), (map.get(key(item)) ?? 0) + 1);
  const keys = order ?? [...map.keys()].sort();
  return keys.map((k) => [k, map.get(k) ?? 0]);
}

function renderMarkdown(rows: Row[], groups: BoilerplateGroup[], candidates: Row[], command: string): string {
  const lines: string[] = [];
  const total = rows.length;
  const categoryIndex = new Map(CATEGORY_ORDER.map((c, i) => [c, i]));
  const sortedRows = [...rows].sort((a, b) => {
    const ca = categoryIndex.get(a.category) ?? 99;
    const cb = categoryIndex.get(b.category) ?? 99;
    if (ca !== cb) return ca - cb;
    return a.slug.localeCompare(b.slug);
  });

  // 5줄 헤더
  lines.push("# 간이 계산기 본문 실측표 (S3-1 선행)");
  lines.push("");
  lines.push(`- 생성일: ${kstToday()} (KST) · 스크립트 재실행으로 재생성 가능`);
  lines.push(`- 명령: \`${command}\``);
  lines.push(
    "- 데이터 원본: `src/lib/simpleCalculators/index.ts` 병합 결과(allCalculators) = `batch1.ts`·`batch2.ts`·`expandedFinance.ts`·`expandedPractical.ts`(정의·sources) + `enrichments.ts`·`enrichments-ext-{a,b,c}.ts`(explanation·formula·faqs·caveats·relatedSlugs·sources — batch 값이 있으면 batch 우선) + `twins.ts`(정밀 쌍) · 색인 규칙은 `src/app/calc/[slug]/page.tsx`"
  );
  lines.push(
    "- 수치 의미: 설명자 = explanation 공백 정규화 글자 수(제목·description·공식·FAQ 제외) · FAQ답변자 = faqs[].a 합계 · 출처 = sources[] URL 수, 국내공식 = *.go.kr/*.or.kr 호스트 수, 해외공공 = .gov/.edu 등 · 보일러 = 다른 슬러그와 글자 단위 동일한 설명(E)/FAQ 답변(F)/유의사항(C) 그룹 ID · 색인 = explanation 있음 && FAQ ≥ 3 이면 index, 아니면 noindex · 숫자 = 설명에 숫자(예시 계산) 포함 여부"
  );
  lines.push(
    "- ★ 동결: `<title>`·description(`seoText.ts` 생성분 포함)은 2026-10-09 판정 창까지 무접촉 — S3-1 은 explanation·formula·faqs·caveats·sources 본문 문자열만 수정한다(필드·컴포넌트·라우트 무접촉)."
  );
  lines.push("");

  // (b) 요약 — 표보다 먼저 두어 읽기 쉽게
  lines.push("## 1. 요약");
  lines.push("");
  const withExplanation = rows.filter((r) => r.explanationChars > 0).length;
  const withFormula = rows.filter((r) => r.hasFormula).length;
  const withFaq = rows.filter((r) => r.faqCount > 0).length;
  const withSources = rows.filter((r) => r.sourcesCount > 0).length;
  const withCaveats = rows.filter((r) => r.caveatsCount > 0).length;
  const withTwin = rows.filter((r) => r.hasTwin).length;
  const indexEligible = rows.filter((r) => r.indexEligible).length;
  const withNumber = rows.filter((r) => r.explanationHasNumber).length;
  const boilerplateMembers = rows.filter((r) => r.isBoilerplateMember).length;
  const explanationShared = rows.filter((r) => r.explanationGroup).length;
  const totalSourceUrls = rows.reduce((a, r) => a + r.sourcesCount, 0);
  const officialUrls = rows.reduce((a, r) => a + r.officialKrSources, 0);
  const foreignUrls = rows.reduce((a, r) => a + r.foreignPublicSources, 0);
  const calcsWithOfficial = rows.filter((r) => r.officialKrSources > 0).length;
  const allowlistedUrls = rows.reduce((a, r) => a + r.allowlistedSources, 0);
  const calcsWithAllowlisted = rows.filter((r) => r.allowlistedSources > 0).length;
  const calcsWithTwoAllowlisted = rows.filter((r) => r.allowlistedSources >= 2).length;
  const explChars = rows.map((r) => r.explanationChars).filter((n) => n > 0).sort((a, b) => a - b);
  const median = explChars.length ? explChars[Math.floor(explChars.length / 2)] : 0;
  const mean = explChars.length ? Math.round(explChars.reduce((a, b) => a + b, 0) / explChars.length) : 0;

  lines.push("### 1-1. 총계");
  lines.push("");
  lines.push("| 항목 | 값 |");
  lines.push("|---|---|");
  lines.push(`| 계산기 수 (getAllSlugs) | ${total} |`);
  lines.push(`| explanation 보유 | ${withExplanation} (${pct(withExplanation, total)}) · 중앙값 ${median}자 · 평균 ${mean}자 |`);
  lines.push(`| explanation 에 숫자(예시 계산) 포함 | ${withNumber} (${pct(withNumber, total)}) |`);
  lines.push(`| formula 보유 | ${withFormula} (${pct(withFormula, total)}) |`);
  lines.push(`| faqs 보유 | ${withFaq} (${pct(withFaq, total)}) |`);
  lines.push(`| sources 보유 | ${withSources} (${pct(withSources, total)}) |`);
  lines.push(`| caveats 보유 | ${withCaveats} (${pct(withCaveats, total)}) |`);
  lines.push(`| 정밀 쌍(twins.ts) 보유 | ${withTwin} (${pct(withTwin, total)}) |`);
  lines.push(`| 색인 허용(explanation && FAQ ≥ 3) | ${indexEligible} (${pct(indexEligible, total)}) · noindex ${total - indexEligible} |`);
  lines.push(`| 보일러플레이트 멤버(그룹 1개 이상) | ${boilerplateMembers} (${pct(boilerplateMembers, total)}) · 그중 설명 자체가 공유된 것 ${explanationShared} |`);
  lines.push("");

  lines.push("### 1-2. 설명 길이 분포 (explanation 글자 수)");
  lines.push("");
  lines.push("| 구간 | 수 | 비율 |");
  lines.push("|---|---|---|");
  const noExplanation = rows.filter((r) => r.explanationChars === 0).length;
  for (const [label, count] of countBy(rows, (r) => r.explanationBucket, LENGTH_BUCKETS.map((b) => b.label))) {
    const note = label === "<200" && noExplanation > 0 ? ` (없음 ${noExplanation} 포함)` : "";
    lines.push(`| ${label} | ${count}${note} | ${pct(count, total)} |`);
  }
  lines.push("");

  lines.push("### 1-3. FAQ 수 분포");
  lines.push("");
  lines.push("| FAQ 수 | 계산기 수 | 비율 |");
  lines.push("|---|---|---|");
  for (const [label, count] of countBy(rows, (r) => (r.faqCount >= 5 ? "5+" : String(r.faqCount)), ["0", "1", "2", "3", "4", "5+"])) {
    lines.push(`| ${label} | ${count} | ${pct(count, total)} |`);
  }
  lines.push("");

  lines.push("### 1-4. 출처 수 분포·공식 출처 비중");
  lines.push("");
  lines.push("| 출처 수 | 계산기 수 | 비율 |");
  lines.push("|---|---|---|");
  for (const [label, count] of countBy(rows, (r) => (r.sourcesCount >= 2 ? "2+" : String(r.sourcesCount)), ["0", "1", "2+"])) {
    lines.push(`| ${label} | ${count} | ${pct(count, total)} |`);
  }
  lines.push("");
  lines.push(`- 출처 URL 총 ${totalSourceUrls}건 중 국내 공식(*.go.kr/*.or.kr) ${officialUrls}건 (${pct(officialUrls, totalSourceUrls)}) · 해외 공공(.gov/.edu 등) ${foreignUrls}건 (${pct(foreignUrls, totalSourceUrls)}) · 기타 ${totalSourceUrls - officialUrls - foreignUrls}건`);
  lines.push(`- 국내 공식 출처를 1건 이상 가진 계산기: ${calcsWithOfficial} / ${total} (${pct(calcsWithOfficial, total)})`);
  lines.push(`- 공식 출처 보유(sourcePolicy 허용 목록·https 기준, S3-1 게이트): 계산기 ${calcsWithAllowlisted} / ${total} (${pct(calcsWithAllowlisted, total)}) · 2건 이상 ${calcsWithTwoAllowlisted} · URL ${allowlistedUrls}건`);
  const hostCounts = new Map<string, number>();
  for (const r of rows) for (const h of r.sourceHosts) hostCounts.set(h, (hostCounts.get(h) ?? 0) + 1);
  const hostList = [...hostCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  lines.push(
    `- 발견된 출처 호스트: ${hostList.length ? hostList.map(([h, n]) => `${h}×${n}${isOfficialKr(h) ? "(국내공식)" : isForeignPublic(h) ? "(해외공공)" : ""}`).join(", ") : "없음"}`
  );
  lines.push("");

  lines.push("### 1-5. 카테고리별");
  lines.push("");
  lines.push("| 분류 | 수 | 설명 중앙값(자) | 설명 <600자 | 출처 0건 | 보일러 멤버 | noindex | 정밀 쌍 |");
  lines.push("|---|---|---|---|---|---|---|---|");
  for (const cat of CATEGORY_ORDER) {
    const inCat = rows.filter((r) => r.category === cat);
    if (!inCat.length) continue;
    const lens = inCat.map((r) => r.explanationChars).sort((a, b) => a - b);
    const med = lens[Math.floor(lens.length / 2)];
    lines.push(
      `| ${cat}${PRIORITY_CATEGORIES.has(cat) ? " ★" : ""} | ${inCat.length} | ${med} | ${inCat.filter((r) => r.explanationChars < 600).length} | ${inCat.filter((r) => r.sourcesCount === 0).length} | ${inCat.filter((r) => r.isBoilerplateMember).length} | ${inCat.filter((r) => !r.indexEligible).length} | ${inCat.filter((r) => r.hasTwin).length} |`
    );
  }
  lines.push("");

  lines.push("### 1-6. 본문 위치(파일)별");
  lines.push("");
  lines.push("| explanation 이 있는 파일 | 계산기 수 | 설명 중앙값(자) | 출처 0건 |");
  lines.push("|---|---|---|---|");
  for (const [file, count] of countBy(rows, (r) => r.explanationFile)) {
    const inFile = rows.filter((r) => r.explanationFile === file);
    const lens = inFile.map((r) => r.explanationChars).sort((a, b) => a - b);
    lines.push(`| ${file} | ${count} | ${lens[Math.floor(lens.length / 2)]} | ${inFile.filter((r) => r.sourcesCount === 0).length} |`);
  }
  lines.push("");

  lines.push(`### 1-7. 보일러플레이트 그룹 (총 ${groups.length}개 · 상위 ${Math.min(TOP_GROUPS, groups.length)}개)`);
  lines.push("");
  const kindCounts = countBy(groups, (g) => g.kind, ["explanation", "faq", "caveat"]);
  lines.push(`- 종류별 그룹 수: ${kindCounts.map(([k, n]) => `${k} ${n}`).join(" · ")} (정규화 후 20자 미만 문장은 제외)`);
  lines.push("");
  lines.push("| ID | 종류 | 멤버 수 | 글자 | 본문 앞부분 | 멤버 슬러그 |");
  lines.push("|---|---|---|---|---|---|");
  for (const g of groups.slice(0, TOP_GROUPS)) {
    lines.push(`| ${g.id} | ${g.kind} | ${g.members.length} | ${g.chars} | ${md(g.sample)} | ${g.members.join(", ")} |`);
  }
  if (!groups.length) lines.push("| - | - | 0 | - | (동일 본문 없음) | - |");
  lines.push("");

  // (c) 후보 50종
  lines.push(`## 2. S3-1 후보 ${CANDIDATE_COUNT}종`);
  lines.push("");
  lines.push("정렬 규칙:");
  lines.push("");
  for (const rule of RANKING_RULE) lines.push(`- ${rule}`);
  lines.push("");
  lines.push("| # | 분류 | slug | 제목 | 설명자 | FAQ | 출처 | 보일러 | 색인 | 정밀쌍 | 본문 파일 |");
  lines.push("|---|---|---|---|---|---|---|---|---|---|---|");
  candidates.forEach((r, i) => {
    lines.push(
      `| ${i + 1} | ${r.category} | \`${r.slug}\` | ${md(r.title)} | ${r.explanationChars} | ${r.faqCount} | ${r.sourcesCount} | ${r.boilerplateGroups.join(" ") || "-"} | ${r.indexEligible ? "index" : "noindex"} | ${yn(r.hasTwin)} | ${r.explanationFile} |`
    );
  });
  lines.push("");

  // (a) 전체 표
  lines.push(`## 3. 전체 표 (${total}종 · 분류 순서 = types.ts union → slug)`);
  lines.push("");
  lines.push("| 분류 | slug | 제목 | 본문 파일 | 설명자 | 숫자 | 공식(자) | FAQ | FAQ답변자 | 출처 | 국내공식 | 유의 | 보일러 | 정밀쌍 | 색인 |");
  lines.push("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const r of sortedRows) {
    lines.push(
      `| ${r.category} | \`${r.slug}\` | ${md(r.title)} | ${r.explanationFile} | ${r.explanationChars} | ${yn(r.explanationHasNumber)} | ${r.hasFormula ? r.formulaChars : "-"} | ${r.faqCount} | ${r.faqAnswerChars} | ${r.sourcesCount} | ${r.officialKrSources} | ${r.caveatsCount} | ${r.boilerplateGroups.join(" ") || "-"} | ${yn(r.hasTwin)} | ${r.indexEligible ? "index" : "noindex"} |`
    );
  }
  lines.push("");

  // 데이터 모델 메모
  lines.push("## 4. 데이터 모델 메모 (스크립트 자동 판정)");
  lines.push("");
  lines.push("- `sources` 는 2026-09-12(S3-1 기반)부터 `index.ts` 병합 대상이다 — `calc.sources ?? enrichment.sources`(batch 우선). 출처 0건인 170종은 enrichment 파일(`enrichments.ts`·`enrichments-ext-{a,b,c}.ts`)에 sources 를 넣으면 '공식 계산방법 참고' 블록에 나온다. batch sources 가 있는 32종(`expandedFinance.ts`·`expandedPractical.ts`)은 enrichment sources 가 무시되므로 batch 의 SOURCES 표에서 고친다. 게이트 `src/lib/__tests__/calcSources.test.ts`(enrichment sources = 정확히 2건·https·`sourcePolicy.OFFICIAL_SOURCE_HOSTS`) · 규칙 `docs/calc-content-writing-guide-2026-09-12.md`.");
  lines.push("- `notes` 필드는 없다. 유의사항은 `caveats: string[]`, 결과 해석은 compute 가 돌려주는 `CalculatorResult.note`(본문 아님) 뿐이다.");
  lines.push("- `index.ts` 병합은 `calc.x ?? enrichment.x` — batch 에 값이 있으면 enrichment 는 무시된다(설명 본문 파일 열 참고).");
  const orphanEnrichments = ENRICHMENT_FILES.flatMap(([file, map]) => Object.keys(map).filter((k) => !rawBySlug.has(k)).map((k) => `${k}(${file})`));
  lines.push(`- enrichment 키 중 계산기가 없는 고아 키: ${orphanEnrichments.length ? orphanEnrichments.join(", ") : "없음"}`);
  const enrichmentOverlap = [...rawBySlug.keys()].filter((slug) => ENRICHMENT_FILES.filter(([, map]) => slug in map).length > 1);
  lines.push(`- 두 enrichment 파일에 중복 등록된 슬러그(뒤 파일이 이김): ${enrichmentOverlap.length ? enrichmentOverlap.join(", ") : "없음"}`);
  lines.push(`- batch 배열 내 중복 슬러그: ${duplicateRawSlugs.length ? duplicateRawSlugs.join(", ") : "없음"}`);
  lines.push(`- allCalculators 길이 ${allCalculators.length} = getAllSlugs ${total}`);
  lines.push("");

  return lines.join("\n");
}

// ── main ─────────────────────────────────────────────────────────────────────

function main(): void {
  const started = Date.now();
  const opts = parseArgs(process.argv.slice(2));
  const { rows, groups } = buildRows();
  const candidates = rankCandidates(rows);
  const command = ["npx tsx scripts/calc-content-audit.ts", opts.out ? `--out ${opts.out}` : "", opts.json ? `--json ${opts.json}` : ""]
    .filter(Boolean)
    .join(" ");
  const markdown = renderMarkdown(rows, groups, candidates, command);

  if (opts.json) {
    const target = resolve(process.cwd(), opts.json);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(
      target,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          total: rows.length,
          rankingRule: RANKING_RULE,
          rows,
          boilerplateGroups: groups,
          candidates: candidates.map((r) => r.slug),
        },
        null,
        2
      ) + "\n",
      "utf8"
    );
  }

  if (opts.out) {
    const target = resolve(process.cwd(), opts.out);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, markdown + "\n", "utf8");
    process.stderr.write(
      `[calc-content-audit] ${rows.length} rows · ${groups.length} boilerplate groups · ${candidates.length} candidates → ${opts.out} (${Date.now() - started} ms)\n`
    );
  } else {
    process.stdout.write(markdown + "\n");
  }
}

main();
