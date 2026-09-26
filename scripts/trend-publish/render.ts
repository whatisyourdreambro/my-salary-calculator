// scripts/trend-publish/render.ts — 브리프 초안 → 가이드 모듈 (2026-09-26 R5 publisher)
//
// 사용:
//   npx tsx scripts/trend-publish/render.ts --draft <초안.json> [--write] [--today [YYYY-MM-DD]] [--human operator-approved] [--update] [--repo <dir>]
//   npx tsx scripts/trend-publish/render.ts --retire <slug> --to <허브 경로> [--write] [--today [YYYY-MM-DD]] [--repo <dir>]
// 하는 일(--write 일 때만 파일을 쓴다 — 없으면 바뀔 내용을 diff 로 출력):
//   - 초안 검증(validateDraft) → 정본 상수 자동 치환 → src/lib/guides/trend-briefs-YYYY-MM.ts 에 slug 기준 upsert(멱등, CRLF)
//   - 집계 파일 trend-briefs.ts 의 // @trend-imports · // @trend-spread 표식 뒤에 import·spread 한 줄씩(없을 때만)
//   - scripts/trend-publish/ledger.json upsert · src/lib/__tests__/fixtures/trendBriefNumbers.json 에 표 수치 고정
//   - 생성 소스에 verify:tax 감시 리터럴이 남으면 거부(exit 1)
//   --today: 발행일·수정일을 오늘(KST, 또는 준 날짜)로. --update: 발행일은 원장 값 유지, 수정일만 오늘.
//   --retire: 월별 파일에서 항목 제거 + next.config.mjs 에 /guides/<slug> → 허브 308 한 건 + 원장 status retired.
// 종료 코드: 0 성공 · 1 초안·정책 오류 · 2 인프라 오류.
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  monthFileBase,
  removeFromMonthly,
  upsertAggregator,
  upsertMonthly,
  canonicalizeDraft,
  parseMonthlyBlocks,
} from "../../src/lib/trendBriefs/render";
import { impactTable } from "../../src/lib/trendBriefs/impacts";
import { addDays, kstToday, parseVerifyTaxPatterns, type LedgerEntry } from "../../src/lib/trendBriefs/rules";
import { REVIEW_BY_DAYS, validateDraft, type HumanReview, type TrendBriefDraft } from "../../src/lib/trendBriefs/types";

export const PATHS = {
  aggregator: "src/lib/guides/trend-briefs.ts",
  monthly: (month: string) => `src/lib/guides/${monthFileBase(month)}.ts`,
  ledger: "scripts/trend-publish/ledger.json",
  numbers: "src/lib/__tests__/fixtures/trendBriefNumbers.json",
  nextConfig: "next.config.mjs",
  verifyTax: "scripts/verify-tax-constants.mjs",
};

const toCrlf = (s: string) => s.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
const readText = (p: string) => (existsSync(p) ? readFileSync(p, "utf8") : null);

export interface FileChange {
  path: string;
  before: string | null;
  after: string;
}

/** 아주 단순한 줄 diff — 공통 앞·뒤를 빼고 가운데만 보여 준다 */
export function lineDiff(before: string | null, after: string): string {
  const a = (before ?? "").replace(/\r\n/g, "\n").split("\n");
  const b = after.replace(/\r\n/g, "\n").split("\n");
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  let j = 0;
  while (j < a.length - i && j < b.length - i && a[a.length - 1 - j] === b[b.length - 1 - j]) j++;
  const removed = a.slice(i, a.length - j).map((l) => `- ${l.length > 200 ? `${l.slice(0, 200)}…` : l}`);
  const added = b.slice(i, b.length - j).map((l) => `+ ${l.length > 200 ? `${l.slice(0, 200)}…` : l}`);
  return [`@@ 줄 ${i + 1}`, ...removed, ...added].join("\n");
}

function jsonText(v: unknown): string {
  return `${JSON.stringify(v, null, 2)}\n`;
}

/** 초안 렌더의 파일 변경 목록 (쓰지 않는다) */
export function planRender(
  repo: string,
  input: TrendBriefDraft,
  opts: { today?: string; human?: HumanReview; update?: boolean; now?: Date }
): { changes: FileChange[]; draft: TrendBriefDraft; ledgerEntry: LedgerEntry; taxHits: string[] } {
  const ledgerPath = join(repo, PATHS.ledger);
  const ledger = JSON.parse(readText(ledgerPath) ?? "[]") as LedgerEntry[];
  const prev = ledger.find((e) => e.slug === input.slug);
  let draft: TrendBriefDraft = { ...input };
  // 같은 slug 재사용 금지 — 원장에 다른 날 발행분이나 철회분이 있으면 새 브리프로 덮어쓰지 않는다(같은 날 재렌더는 멱등 허용)
  if (!opts.update && prev && (prev.status !== "live" || prev.publishedDate !== (opts.today ?? input.publishedDate))) {
    throw new Error(`slug ${input.slug} 는 이미 원장에 있다(${prev.publishedDate} ${prev.status}) — 새 브리프는 새 slug, 기존 글 수정은 --update`);
  }
  if (opts.update) {
    if (!prev || prev.status !== "live") throw new Error(`--update: 원장에 게시 중인 ${input.slug} 가 없음`);
    draft = { ...draft, publishedDate: prev.publishedDate, modifiedDate: opts.today ?? draft.modifiedDate };
  } else if (opts.today) {
    draft = { ...draft, publishedDate: opts.today, modifiedDate: opts.today };
  }
  if (opts.human) draft = { ...draft, humanReview: opts.human };
  const month = draft.publishedDate.slice(0, 7);
  const changes: FileChange[] = [];

  // 다른 달 파일에 같은 slug 가 있으면(발행일이 바뀐 재렌더) 거기서 뺀다
  const guidesDir = join(repo, "src/lib/guides");
  for (const f of readdirSync(guidesDir).filter((n) => /^trend-briefs-\d{4}-\d{2}\.ts$/.test(n))) {
    const m = /^trend-briefs-(\d{4}-\d{2})\.ts$/.exec(f)![1];
    if (m === month) continue;
    const text = readFileSync(join(guidesDir, f), "utf8");
    if (parseMonthlyBlocks(text).some((b) => b.slug === draft.slug)) {
      changes.splice(changes.length, 0, { path: `src/lib/guides/${f}`, before: text, after: toCrlf(removeFromMonthly(text, m, draft.slug)) });
    }
  }
  const monthlyPath = PATHS.monthly(month);
  const monthlyBefore = readText(join(repo, monthlyPath));
  const monthlyAfter = toCrlf(upsertMonthly(monthlyBefore, month, draft));
  changes.splice(changes.length, 0, { path: monthlyPath, before: monthlyBefore, after: monthlyAfter });

  const aggBefore = readText(join(repo, PATHS.aggregator));
  if (aggBefore === null) throw new Error(`${PATHS.aggregator} 없음`);
  changes.splice(changes.length, 0, { path: PATHS.aggregator, before: aggBefore, after: toCrlf(upsertAggregator(aggBefore, month)) });

  const primary = draft.sources.find((s) => s.role === "primary")!;
  const ledgerEntry: LedgerEntry = {
    slug: draft.slug,
    publishedDate: draft.publishedDate,
    cluster: draft.cluster,
    eventName: draft.event.name,
    eventKind: draft.event.kind,
    eventStatus: draft.event.status,
    primary: { url: primary.url, sha256: primary.sha256, fetchedAt: primary.fetchedAt, publishedDate: primary.publishedDate },
    sources: draft.sources.map((s) => ({ url: s.url, sha256: s.sha256 })),
    reviewBy: addDays(draft.publishedDate, REVIEW_BY_DAYS),
    status: "live",
    ...(draft.humanReview === "operator-approved" ? { approvedAt: (opts.now ?? new Date()).toISOString() } : {}),
  };
  const nextLedger = [...ledger.filter((e) => e.slug !== draft.slug), ledgerEntry].sort((x, y) =>
    x.publishedDate + x.slug < y.publishedDate + y.slug ? -1 : 1
  );
  const ledgerBefore = readText(ledgerPath);
  changes.splice(changes.length, 0, { path: PATHS.ledger, before: ledgerBefore, after: toCrlf(jsonText(nextLedger)) });

  const numbersPath = join(repo, PATHS.numbers);
  const numbersBefore = readText(numbersPath);
  const numbers = JSON.parse(numbersBefore ?? '{"kinds":{},"briefs":{}}') as { briefs: Record<string, unknown> };
  const { draft: canon } = canonicalizeDraft(draft);
  numbers.briefs = {
    ...numbers.briefs,
    [draft.slug]: { kind: canon.impact.table.kind, params: canon.impact.table.params, rows: impactTable(canon.impact.table.kind, canon.impact.table.params).rows },
  };
  changes.splice(changes.length, 0, { path: PATHS.numbers, before: numbersBefore, after: toCrlf(jsonText(numbers)) });

  const patterns = parseVerifyTaxPatterns(readFileSync(join(repo, PATHS.verifyTax), "utf8"));
  const taxHits = patterns.filter((p) => p.re.test(monthlyAfter)).map((p) => p.name);
  return { changes, draft, ledgerEntry, taxHits };
}

/** 철회 계획 — 항목 제거 + 308 + 원장 retired */
export function planRetire(repo: string, slug: string, to: string, today: string): FileChange[] {
  if (!/^\/[a-z0-9/-]*$/.test(to)) throw new Error(`--to 는 사이트 경로여야 한다: ${to}`);
  const changes: FileChange[] = [];
  const guidesDir = join(repo, "src/lib/guides");
  let found = false;
  for (const f of readdirSync(guidesDir).filter((n) => /^trend-briefs-\d{4}-\d{2}\.ts$/.test(n))) {
    const month = /^trend-briefs-(\d{4}-\d{2})\.ts$/.exec(f)![1];
    const text = readFileSync(join(guidesDir, f), "utf8");
    if (!parseMonthlyBlocks(text).some((b) => b.slug === slug)) continue;
    found = true;
    changes.splice(changes.length, 0, { path: `src/lib/guides/${f}`, before: text, after: toCrlf(removeFromMonthly(text, month, slug)) });
  }
  if (!found) throw new Error(`월별 파일에서 ${slug} 를 찾지 못함`);

  const cfgPath = join(repo, PATHS.nextConfig);
  const cfg = readFileSync(cfgPath, "utf8");
  if (cfg.includes(`source: "/guides/${slug}"`)) throw new Error(`next.config.mjs 에 이미 /guides/${slug} 리디렉트가 있음`);
  const nl = cfg.includes("\r\n") ? "\r\n" : "\n";
  const anchor = /async redirects\(\) \{\r?\n(\s*)return \[\r?\n/.exec(cfg);
  if (!anchor) throw new Error("next.config.mjs 에서 'async redirects() { return [' 를 찾지 못함");
  const pad = `${anchor[1]}  `;
  const block = [
    `${pad}// 트렌드 브리프 철회 (${today}, 운영자 '철회 ${slug}') — scripts/trend-publish/publish-approved.mjs --retire`,
    `${pad}{`,
    `${pad}  source: "/guides/${slug}",`,
    `${pad}  destination: "${to}",`,
    `${pad}  permanent: true,`,
    `${pad}},`,
  ].join(nl);
  const at = anchor.index + anchor[0].length;
  changes.splice(changes.length, 0, { path: PATHS.nextConfig, before: cfg, after: `${cfg.slice(0, at)}${block}${nl}${cfg.slice(at)}` });

  const ledgerPath = join(repo, PATHS.ledger);
  const ledgerBefore = readFileSync(ledgerPath, "utf8");
  const ledger = JSON.parse(ledgerBefore) as LedgerEntry[];
  const e = ledger.find((x) => x.slug === slug);
  if (!e) throw new Error(`원장에 ${slug} 없음`);
  const next = ledger.map((x) => (x.slug === slug ? { ...x, status: "retired" as const, retiredAt: today, retiredTo: to } : x));
  changes.splice(changes.length, 0, { path: PATHS.ledger, before: ledgerBefore, after: toCrlf(jsonText(next)) });

  const numbersPath = join(repo, PATHS.numbers);
  const numbersBefore = readFileSync(numbersPath, "utf8");
  const numbers = JSON.parse(numbersBefore) as { briefs: Record<string, unknown> };
  if (slug in numbers.briefs) {
    delete numbers.briefs[slug];
    changes.splice(changes.length, 0, { path: PATHS.numbers, before: numbersBefore, after: toCrlf(jsonText(numbers)) });
  }
  return changes;
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  if (i < 0) return undefined;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : "";
}

function applyOrPrint(repo: string, changes: FileChange[], write: boolean): void {
  for (const c of changes) {
    if (c.before === c.after) continue;
    if (write) writeFileSync(join(repo, c.path), c.after, "utf8");
    else console.log(`--- ${c.path}\n${lineDiff(c.before, c.after)}`);
  }
}

export async function main(): Promise<number> {
  const repo = resolve(arg("--repo") || process.cwd());
  const write = process.argv.includes("--write");
  const todayArg = arg("--today");
  const today = todayArg === undefined ? undefined : todayArg || kstToday();
  try {
    const retire = arg("--retire");
    if (retire) {
      const to = arg("--to");
      if (!to) throw new Error("--retire 에는 --to <허브 경로> 가 필요");
      const changes = planRetire(repo, retire, to, today ?? kstToday());
      applyOrPrint(repo, changes, write);
      console.log(JSON.stringify({ ok: true, mode: "retire", slug: retire, to, write, files: changes.map((c) => c.path) }));
      return 0;
    }
    const draftPath = arg("--draft");
    if (!draftPath) throw new Error("--draft <초안.json> 필요");
    const v = validateDraft(JSON.parse(readFileSync(draftPath, "utf8")));
    if (!v.ok) {
      console.error(`[render] 초안 오류:\n- ${v.errors.join("\n- ")}`);
      return 1;
    }
    if (v.skip) {
      console.error(`[render] skip 초안 — 렌더할 것 없음: ${v.skip.reason}`);
      return 1;
    }
    const human = arg("--human");
    if (human && human !== "operator-approved" && human !== "none") throw new Error("--human 은 operator-approved 또는 none");
    const plan = planRender(repo, v.draft, { today, human: (human || undefined) as HumanReview | undefined, update: process.argv.includes("--update") });
    if (plan.taxHits.length) {
      console.error(`[render] 생성 소스에 verify:tax 감시 리터럴: ${plan.taxHits.join(", ")} — 제목·설명·표 파라미터를 고칠 것`);
      return 1;
    }
    applyOrPrint(repo, plan.changes, write);
    console.log(
      JSON.stringify({ ok: true, mode: "render", slug: plan.draft.slug, publishedDate: plan.draft.publishedDate, humanReview: plan.draft.humanReview, write, files: plan.changes.filter((c) => c.before !== c.after).map((c) => c.path) })
    );
    return 0;
  } catch (e) {
    console.error(`[render] 오류: ${(e as Error).message}`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().then((code) => process.exit(code));
}
