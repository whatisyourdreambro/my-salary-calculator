// scripts/trend-publish/gate.ts — 브리프 게이트 (2026-09-26 R5 publisher)
//
// 사용:
//   npx tsx scripts/trend-publish/gate.ts --draft <초안.json> --sources <스냅숏 디렉터리> [--headlines <dir>] [--sentinel <file>]
//        [--mode dryrun|publish] [--today YYYY-MM-DD] [--phase pre|post] [--check-diff <ref>] [--next <dir>] [--repo <dir>]
//        [--trend-home <dir>] [--update] [--candidate-route new-brief|update-existing] [--out <gate.json>]
//   npx tsx scripts/trend-publish/gate.ts --self-test      (합성 픽스처: good 통과·규칙별 실패, 30초·500MB 안)
// pre  = 규칙 전부 + secret-scan + 경로 허용목록(--check-diff 가 있을 때)
// post = pre 규칙 + 프리렌더 허브·정적 페이지 유사도 + rss.xml 크기 투영(.next 필요)
// 출력: 한국어 표 + gate-<slug>.json (TREND_HOME/gates 또는 --out). 종료 코드 0 통과 · 1 규칙 실패 · 2 인프라 오류.
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { koGuides } from "../../src/lib/guidesContent";
import { trendBriefGuides } from "../../src/lib/guides/trend-briefs";
import {
  RULE_IDS,
  daysBetween,
  evaluateDraft,
  fixtureCase,
  kstToday,
  parseVerifyTaxPatterns,
  runRules,
  type BriefFixture,
  type CalendarConfig,
  type HeadlineRecord,
  type LedgerEntry,
  type LocalCalendar,
  type RuleContext,
  type RuleResult,
  type SourceSnapshot,
} from "../../src/lib/trendBriefs/rules";
import { contentEncoded } from "../../src/lib/rssFullText";
import { visibleText, utf8Bytes } from "../../src/lib/trendBriefs/text";
import { CLUSTER_HUBS, RSS_ITEM_OVERHEAD, RSS_PROJECTION_LIMIT, SIMILARITY, validateDraft, type TrendBriefDraft } from "../../src/lib/trendBriefs/types";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_DEFAULT = resolve(HERE, "..", "..");

export class InfraError extends Error {}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  if (i < 0) return undefined;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : "";
}
const readJson = <T>(p: string, fallback: T): T => (existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as T) : fallback);
const sha256 = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");

/** next.config.mjs 의 /guides/<slug> 리디렉트 출발지 slug 목록 */
export function redirectSlugs(repo: string): string[] {
  const cfg = readFileSync(join(repo, "next.config.mjs"), "utf8");
  return [...cfg.matchAll(/source:\s*["']\/guides\/([^"'/:]+)["']/g)].map((m) => m[1]);
}

/** 사이트 경로 존재 여부 — 정적 page.tsx · 가이드 slug · 루트 */
export function routeChecker(repo: string, slugs: readonly string[]): (p: string) => boolean {
  const slugSet = new Set(slugs);
  return (p: string) => {
    if (p === "/") return true;
    const g = /^\/guides\/([^/]+)$/.exec(p);
    if (g) return slugSet.has(decodeURIComponent(g[1]));
    const dir = join(repo, "src/app", ...p.split("/").filter(Boolean));
    return existsSync(join(dir, "page.tsx")) || existsSync(join(dir, "page.ts"));
  };
}

/** 스냅숏 디렉터리(*.json — source-snapshot.ts 출력) */
export function loadSnapshots(dir: string): SourceSnapshot[] {
  if (!existsSync(dir)) throw new InfraError(`스냅숏 디렉터리 없음: ${dir}`);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")) as SourceSnapshot)
    .filter((s) => typeof s.url === "string" && typeof s.text === "string");
}

/**
 * 21일 안의 헤드라인 기록. 레이더(scripts/trend-radar/run.mjs)의 headlines-<날짜>.json {date, titles[]} 를 읽고,
 * 그 밖에 배열 또는 {headlines: [{title?, shingles15?, ts}]} 모양도 받는다. 후보 파일(radar-*.json)은 헤드라인이 아니라 건너뛴다.
 */
export function loadHeadlines(dir: string | undefined, today: string): HeadlineRecord[] {
  if (!dir || !existsSync(dir)) return [];
  const out: HeadlineRecord[] = [];
  const recent = (d: string) => daysBetween(d, today) <= SIMILARITY.headlineWindowDays && daysBetween(d, today) >= -1;
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".json") && !n.startsWith("radar-"))) {
    const raw = JSON.parse(readFileSync(join(dir, f), "utf8")) as unknown;
    if (raw && typeof raw === "object" && !Array.isArray(raw) && Array.isArray((raw as { titles?: unknown[] }).titles)) {
      const r = raw as { date?: string; titles: unknown[] };
      const date = String(r.date ?? /headlines-(\d{4}-\d{2}-\d{2})/.exec(f)?.[1] ?? today).slice(0, 10);
      if (!recent(date)) continue;
      for (const t of r.titles) if (typeof t === "string" && t.trim()) out.splice(out.length, 0, { title: t });
      continue;
    }
    const list = (Array.isArray(raw) ? raw : ((raw as { headlines?: unknown[] }).headlines ?? [])) as { title?: string; shingles15?: number[]; ts?: string }[];
    for (const h of list) {
      const ts = h.ts ? String(h.ts).slice(0, 10) : today;
      if (!recent(ts)) continue;
      out.splice(out.length, 0, { title: h.title, shingles15: h.shingles15 });
    }
  }
  return out;
}

/**
 * 감시기(scripts/fact-sentinel/run.mjs)의 낡은 경로 + config.linkFreshness.staticStale.
 * 인자가 폴더면 그 안의 가장 최근 sentinel-<날짜>.json, 파일이면 그 파일. 형식 {staleRoutes: string[] | {route}[]}.
 */
export function loadStaleRoutes(fileOrDir: string | undefined, config: { linkFreshness?: { staticStale?: string[] } }): string[] {
  const out = [...(config.linkFreshness?.staticStale ?? [])];
  let file = fileOrDir;
  if (file && existsSync(file) && statSync(file).isDirectory()) {
    const latest = readdirSync(file)
      .filter((n) => /^sentinel-\d{4}-\d{2}-\d{2}\.json$/.test(n) || n === "latest.json")
      .sort()
      .reverse()[0];
    file = latest ? join(file, latest) : undefined;
  }
  if (file && existsSync(file)) {
    const raw = JSON.parse(readFileSync(file, "utf8")) as { staleRoutes?: (string | { route: string })[] } | (string | { route: string })[];
    const list = Array.isArray(raw) ? raw : (raw.staleRoutes ?? []);
    for (const x of list) out.splice(out.length, 0, typeof x === "string" ? x : x.route);
  }
  return [...new Set(out)];
}

/** 프리렌더 HTML(.next/server/app/<경로>.html)의 제목·본문 가시 텍스트 */
export function prerenderedPage(nextDir: string, route: string): { key: string; title: string; text: string } | null {
  const file = route === "/" ? join(nextDir, "server/app/index.html") : join(nextDir, "server/app", `${route.replace(/^\//, "")}.html`);
  if (!existsSync(file)) return null;
  const html = readFileSync(file, "utf8");
  const title = (/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "").trim();
  const main = /<main\b[\s\S]*?<\/main>/i.exec(html)?.[0] ?? html;
  const text = visibleText(main.replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, " "));
  return { key: route, title, text };
}

/** rss.xml 최악 투영 — 전문 30편이 모두 이 브리프 크기일 때 */
export function rssProjection(nextDir: string, draft: TrendBriefDraft): { bytes: number; nonFull: number; perItem: number } {
  const body = join(nextDir, "server/app/rss.xml.body");
  if (!existsSync(body)) throw new InfraError(`빌드 피드 없음: ${body} (post 단계는 npm run build 뒤)`);
  const xml = readFileSync(body, "utf8");
  const total = utf8Bytes(xml);
  const enc = [...xml.matchAll(/<content:encoded>[\s\S]*?<\/content:encoded>/g)].reduce((n, m) => n + utf8Bytes(m[0]), 0);
  const ev = evaluateDraft(draft);
  if (!ev) throw new InfraError("초안을 렌더할 수 없음");
  const perItem = utf8Bytes(contentEncoded(ev.html, `https://www.moneysalary.com/guides/${draft.slug}`)) + RSS_ITEM_OVERHEAD;
  const nonFull = total - enc;
  return { bytes: nonFull + 30 * perItem, nonFull, perItem };
}

function table(results: RuleResult[]): string {
  const rows = results.map((r) => `${r.ok ? "통과" : "실패"} | ${r.id.padEnd(20)} | ${r.detail}`);
  return ["결과 | 규칙                 | 내용", "-----|----------------------|-----", ...rows].join("\n");
}

function selfTest(repo: string): number {
  const t0 = Date.now();
  const fx = readJson<BriefFixture>(join(repo, "src/lib/__tests__/fixtures/trendBriefDrafts.json"), null as unknown as BriefFixture);
  const snap = readFileSync(join(repo, "src/lib/__tests__/fixtures/trendBriefSourceSnapshot.txt"), "utf8");
  const base = {
    existingGuides: koGuides.map((g) => ({ key: g.slug, title: g.title, text: visibleText(g.content) })),
    existingSlugs: koGuides.map((g) => g.slug),
    redirectSlugs: redirectSlugs(repo),
    routeExists: routeChecker(repo, koGuides.map((g) => g.slug)),
    taxPatterns: parseVerifyTaxPatterns(readFileSync(join(repo, "scripts/verify-tax-constants.mjs"), "utf8")),
  };
  const lines: string[] = [];
  let bad = 0;
  const good = fixtureCase(fx, snap, sha256, base);
  const goodFails = runRules(good.draft, good.ctx).filter((r) => !r.ok);
  lines.splice(lines.length, 0, `${goodFails.length ? "실패" : "통과"} | good 픽스처 | ${goodFails.map((r) => `${r.id}: ${r.detail}`).join(" · ") || "모든 규칙 통과"}`);
  if (goodFails.length) bad++;
  const covered = new Set<string>();
  for (const c of fx.cases) {
    const x = fixtureCase(fx, snap, sha256, base, c);
    const hit = runRules(x.draft, x.ctx).find((r) => r.id === c.rule);
    const ok = Boolean(hit && !hit.ok);
    covered.add(c.rule);
    if (!ok) bad++;
    lines.splice(lines.length, 0, `${ok ? "통과" : "실패"} | ${c.rule.padEnd(20)} | ${ok ? `심은 위반 검출 — ${hit!.detail.slice(0, 80)}` : "심은 위반을 못 잡음"}`);
  }
  const missing = RULE_IDS.filter((id) => !covered.has(id));
  if (missing.length) {
    bad++;
    lines.splice(lines.length, 0, `실패 | 픽스처 누락 | ${missing.join(", ")}`);
  }
  const ms = Date.now() - t0;
  const mb = Math.round(process.memoryUsage().rss / 1048576);
  console.log(["[gate --self-test] 합성 픽스처", ...lines, `소요 ${ms}ms · RSS ${mb}MB (한도 30,000ms · 500MB)`].join("\n"));
  if (ms > 30_000 || mb > 500) {
    console.error("[gate --self-test] 빠른 모드 한도 초과");
    return 1;
  }
  return bad ? 1 : 0;
}

export async function main(): Promise<number> {
  const repo = resolve(arg("--repo") || REPO_DEFAULT);
  if (process.argv.includes("--self-test")) return selfTest(repo);
  const draftPath = arg("--draft");
  const sourcesDir = arg("--sources");
  if (!draftPath || !sourcesDir) {
    console.error("사용: gate.ts --draft <초안.json> --sources <스냅숏 dir> [--mode dryrun|publish] [--phase pre|post] … | --self-test");
    return 2;
  }
  const mode = (arg("--mode") || "dryrun") as RuleContext["mode"];
  const phase = (arg("--phase") || "pre") as RuleContext["phase"];
  const todayArg = arg("--today");
  const today = todayArg || kstToday();
  const trendHome = arg("--trend-home") || process.env.TREND_HOME || "";
  const config = readJson<Record<string, unknown>>(join(repo, "scripts/trend-publish/config.json"), {});
  const calendar = readJson<CalendarConfig>(join(repo, "scripts/trend-publish/calendar.json"), null as unknown as CalendarConfig);
  const localCalendar = trendHome ? readJson<LocalCalendar>(join(trendHome, "calendar.local.json"), {}) : {};
  const ledger = readJson<LedgerEntry[]>(join(repo, "scripts/trend-publish/ledger.json"), []);
  const decisions = trendHome && existsSync(join(trendHome, "decisions.jsonl")) ? readFileSync(join(trendHome, "decisions.jsonl"), "utf8") : "";
  const pilotVerdict = /"decision":\s*"pilot-verdict"[^\n]*"value":\s*"continue"/.test(decisions);

  const v = validateDraft(JSON.parse(readFileSync(draftPath, "utf8")));
  if (!v.ok) {
    console.log(table([{ id: "schema", ok: false, detail: v.errors.join(" · ") }]));
    return 1;
  }
  if (v.skip) {
    console.log(`[gate] skip 초안 — ${v.skip.reason}`);
    return 1;
  }
  const draft = v.draft;
  const updateOf = process.argv.includes("--update") ? draft.slug : undefined;
  // slug 중복 — render 뒤에는 이 브리프도 koGuides 에 있다. 등록부(trendBriefGuides)에 렌더된 자기 자신 1건을 빼고도
  // 같은 slug 가 남으면(기존 가이드와 충돌) 중복이다. --update 는 자기 자신을 고치는 것이라 예외(rules.ts slug 규칙).
  const slugs = koGuides.map((g) => g.slug);
  const renderedSelf = trendBriefGuides.some((g) => g.slug === draft.slug) ? 1 : 0;
  const othersWithSlug = slugs.filter((s) => s === draft.slug).length - renderedSelf;
  const existingSlugs = [...slugs.filter((s) => s !== draft.slug), ...(othersWithSlug > 0 ? [draft.slug] : [])];
  const nextDir = resolve(repo, arg("--next") || ".next");
  const staticPages: RuleContext["staticPages"] = [];
  const cannibalHubs = (config.cannibalHubs as RuleContext["cannibalHubs"]) ?? [];
  const hub = CLUSTER_HUBS[draft.cluster];
  if (phase === "post") {
    for (const route of [...new Set([hub, ...cannibalHubs.map((h) => h.route), ...draft.calculators.links.map((l) => l.href.split(/[?#]/)[0])])]) {
      const page = prerenderedPage(nextDir, route);
      if (page) staticPages.splice(staticPages.length, 0, page);
    }
    if (!staticPages.length) throw new InfraError(`프리렌더 페이지를 찾지 못함: ${nextDir}`);
  }
  const ctx: RuleContext = {
    mode,
    phase,
    today,
    ledger,
    capsConfig: config.caps as RuleContext["capsConfig"],
    calendar,
    localCalendar,
    pilotVerdict,
    existingGuides: koGuides.filter((g) => g.slug !== draft.slug).map((g) => ({ key: g.slug, title: g.title, text: visibleText(g.content) })),
    staticPages,
    cannibalHubs,
    existingSlugs,
    redirectSlugs: redirectSlugs(repo),
    routeExists: routeChecker(repo, slugs),
    staleRoutes: loadStaleRoutes(arg("--sentinel") || undefined, config as { linkFreshness?: { staticStale?: string[] } }),
    snapshots: loadSnapshots(sourcesDir),
    headlines: loadHeadlines(arg("--headlines") || undefined, today),
    taxPatterns: parseVerifyTaxPatterns(readFileSync(join(repo, "scripts/verify-tax-constants.mjs"), "utf8")),
    tripWires: (config.tripWires as string[]) ?? [],
    candidateRoute: (arg("--candidate-route") || undefined) as RuleContext["candidateRoute"],
    updateOf,
  };
  const results = runRules(draft, ctx);

  if (phase === "pre") {
    const scan = spawnSync(process.execPath, [join(repo, "scripts/trend-publish/secret-scan.mjs"), "--repo", repo, "--base", arg("--check-diff") || "HEAD", ...(trendHome ? ["--trend-home", trendHome] : [])], {
      encoding: "utf8",
    });
    results.splice(results.length, 0, { id: "secret-scan", ok: scan.status === 0, detail: (scan.stdout || scan.stderr || "").trim().split("\n").slice(-1)[0] ?? "", value: scan.status ?? -1, threshold: 0 });
    const ref = arg("--check-diff");
    if (ref) {
      const allow = ((config.pathAllowlist as Record<string, string[]>)?.[process.argv.includes("--retire") ? "retire" : "publish"] ?? []).map((s) => new RegExp(s));
      const diff = spawnSync("git", ["-C", repo, "diff", "--name-only", ref], { encoding: "utf8" });
      const untracked = spawnSync("git", ["-C", repo, "ls-files", "--others", "--exclude-standard"], { encoding: "utf8" });
      if (diff.status !== 0) throw new InfraError(`git diff 실패: ${diff.stderr}`);
      const files = [...diff.stdout.split("\n"), ...untracked.stdout.split("\n")].map((s) => s.trim()).filter(Boolean);
      const outside = files.filter((f) => !allow.some((re) => re.test(f)));
      results.splice(results.length, 0, { id: "path-allowlist", ok: !outside.length, detail: outside.length ? `허용 밖 변경: ${outside.join(", ")}` : `변경 ${files.length}개 모두 허용`, value: outside.length, threshold: 0 });
    }
  } else {
    const p = rssProjection(nextDir, draft);
    results.splice(results.length, 0, {
      id: "rss-projection",
      ok: p.bytes < RSS_PROJECTION_LIMIT,
      detail: `최악 투영 ${p.bytes.toLocaleString("en-US")}B (전문 제외 ${p.nonFull.toLocaleString("en-US")}B + 30 × ${p.perItem.toLocaleString("en-US")}B)`,
      value: p.bytes,
      threshold: RSS_PROJECTION_LIMIT,
    });
  }

  const ok = results.every((r) => r.ok);
  const report = { slug: draft.slug, mode, phase, today, ok, results, generatedAt: new Date().toISOString() };
  const out = arg("--out") || (trendHome ? join(trendHome, "gates", `gate-${draft.slug}.json`) : "");
  if (out) {
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }
  console.log(`[gate] ${draft.slug} · ${mode} · ${phase} · ${today}\n${table(results)}\n${ok ? "통과" : "실패 — SKIP"}${out ? ` (${out})` : ""}`);
  return ok ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main()
    .then((code) => process.exit(code))
    .catch((e) => {
      console.error(`[gate] 인프라 오류: ${(e as Error).message}`);
      process.exit(2);
    });
}
