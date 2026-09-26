// scripts/trend-publish/daily.mjs — 트렌드 브리프 일일 파이프라인 (2026-09-26 R5 publisher)
//
// 예약 작업(운영자 플랜의 Claude)이 하루 한 번 부른다. 원격 저장소로 내보내는 코드는 이 파일에 없다 —
// 발행은 운영자가 채팅에서 '발행 <slug>' 로 승인한 세션의 publish-approved.mjs 만 한다.
//
// 사용: node scripts/trend-publish/daily.mjs <init|prepare|finish|status> [--trend-home <dir>] [--worktree <dir>] [--today YYYY-MM-DD]
//   init --yes          1회 설정: 트렌드 전용 워크트리(origin/main 분리 HEAD) + node_modules 정션 + TREND_HOME 폴더
//   prepare             잠금 → HALT 확인 → 워크트리 동기화(깨끗해야 함, 아니면 HALT) → 새 코드로 재실행 → 레이더·센티널 →
//                       모드 결정(DRYRUN / PROPOSE / 동결 보고) → 후보 선택 → 기준 빌드·목록(청크·광고 순서·자동광고) →
//                       1차+보조 출처 스냅숏 → writer-input.json. 마지막 줄 JSON {status, mode, reason, report, writerInput?, draftPath?}
//   finish --draft <p>  skip 초안이면 종료. 아니면 render --write → gate pre(비밀값·경로 허용목록 포함) → 무거운 16단계(heavy.mjs,
//                       첫 실패에서 멈춤) → DRYRUN: 보고 후 워크트리 원복 / PROPOSE: 로컬 브랜치 trend/<날짜>-<slug> 커밋 +
//                       초안 보관(draftSha256) + 승인 카드. 마지막 줄 JSON {status, reason, card?, gateSummary}
//   status              플래그·모드·결정 대기 요약
// 이 파일은 운영자 파일(docs/drafts·docs/revenue-audit-*·docs/naver-blog-100-*·docs/search-console*·docs/*.zip·hf70.html·
// .wrangler·.claude/settings.local.json)과 운영자 플래그(PUBLISH_ENABLED·REVIEWED_UNTIL·CF_PURGE_OK·DEPLOY_HOLD·
// calendar.local.json)를 쓰지 않는다 — 모든 쓰기는 safeWrite 한 곳을 거친다(테스트가 확인).
// 공용 정책 함수(한도·달력·결정 대기·해시)는 여기서 export — publish-approved·review-ack·decide 가 함께 쓴다.
// rules.ts 의 같은 이름 함수와 결과가 같아야 한다(src/lib/__tests__/trendBriefRules.test.ts 대조).
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const REPO_OF_SCRIPT = resolve(HERE, "..", "..");

// ─────────────────────────────────────────────────────────────
// 날짜
// ─────────────────────────────────────────────────────────────
const DAY = 86_400_000;
const toMs = (d) => Date.parse(`${d}T00:00:00Z`);
export const addDays = (d, n) => new Date(toMs(d) + n * DAY).toISOString().slice(0, 10);
export const daysBetween = (a, b) => Math.round((toMs(b) - toMs(a)) / DAY);
export const kstToday = (now = new Date()) => new Date(now.getTime() + 9 * 3_600_000).toISOString().slice(0, 10);
export const isIsoDate = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v;
export function isoWeekKey(d) {
  const date = new Date(toMs(d));
  const dow = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dow + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round((date.getTime() - firstThursday.getTime()) / DAY / 7 - (((firstThursday.getUTCDay() + 6) % 7) - 3) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

// ─────────────────────────────────────────────────────────────
// types.ts 상수 읽기 (단일 원천 — 값을 복제하지 않는다)
// ─────────────────────────────────────────────────────────────
export function readTypesConstants(root) {
  const src = readFileSync(join(root, "src/lib/trendBriefs/types.ts"), "utf8");
  const block = /export const HARD_CAPS = \{([\s\S]*?)\} as const;/.exec(src)?.[1];
  const first = /export const FIRST_PUBLISH_NOT_BEFORE = "(\d{4}-\d{2}-\d{2})";/.exec(src)?.[1];
  if (!block || !first) throw new Error("types.ts 에서 HARD_CAPS·FIRST_PUBLISH_NOT_BEFORE 를 읽지 못함");
  const hardCaps = Object.fromEntries([...block.matchAll(/(\w+):\s*(\d+)/g)].map((m) => [m[1], Number(m[2])]));
  return { hardCaps, firstPublishNotBefore: first };
}

// ─────────────────────────────────────────────────────────────
// 한도·달력·결정 대기·REVIEWED_UNTIL (rules.ts 와 같은 결과)
// ─────────────────────────────────────────────────────────────
export function effectiveCaps(hard, config) {
  const out = { ...hard };
  for (const k of Object.keys(hard)) {
    const v = config?.[k];
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) out[k] = Math.min(out[k], v);
  }
  return out;
}

export function capViolations(today, ledger, capsConfig, candidate, hardCaps) {
  const caps = effectiveCaps(hardCaps, capsConfig);
  const entries = ledger.filter((e) => e.slug !== candidate?.slug);
  const reasons = [];
  const sameDay = entries.filter((e) => e.publishedDate === today).length;
  if (sameDay + 1 > caps.perKstDay) reasons.splice(reasons.length, 0, `하루 ${caps.perKstDay}편 한도 (오늘 ${sameDay}편)`);
  const wk = isoWeekKey(today);
  const sameWeek = entries.filter((e) => isoWeekKey(e.publishedDate) === wk).length;
  if (sameWeek + 1 > caps.perIsoWeek) reasons.splice(reasons.length, 0, `주 ${caps.perIsoWeek}편 한도 (${wk} ${sameWeek}편)`);
  const sameMonth = entries.filter((e) => e.publishedDate.slice(0, 7) === today.slice(0, 7)).length;
  if (sameMonth + 1 > caps.perMonth) reasons.splice(reasons.length, 0, `월 ${caps.perMonth}편 한도 (${today.slice(0, 7)} ${sameMonth}편)`);
  const first = entries.map((e) => e.publishedDate).sort()[0] ?? today;
  if (daysBetween(first, today) < 90) {
    const live = entries.filter((e) => e.status === "live").length;
    if (live + 1 > caps.liveFirst90Days) reasons.splice(reasons.length, 0, `첫 90일 게시 ${caps.liveFirst90Days}편 한도 (게시 중 ${live}편)`);
  }
  if (candidate?.primaryUrl || candidate?.primarySha) {
    const sameDoc = entries.filter(
      (e) => (candidate.primaryUrl && e.primary.url === candidate.primaryUrl) || (candidate.primarySha && e.primary.sha256 === candidate.primarySha)
    ).length;
    if (sameDoc + 1 > caps.perSourceDoc) reasons.splice(reasons.length, 0, `공식 문서 1건당 ${caps.perSourceDoc}편 (이미 ${sameDoc}편)`);
  }
  if (candidate?.cluster) {
    const recent = entries.filter((e) => e.cluster === candidate.cluster && daysBetween(e.publishedDate, today) < 30).length;
    if (recent + 1 > caps.perCluster30Days) reasons.splice(reasons.length, 0, `군집 ${candidate.cluster} 30일 ${caps.perCluster30Days}편 (최근 ${recent}편)`);
  }
  return reasons;
}

export function calendarBlocks(today, cal, local, pilotVerdict, firstPublishNotBefore) {
  const reasons = [];
  const add = (r) => reasons.splice(reasons.length, 0, r);
  const first = [cal.firstPublishNotBefore, firstPublishNotBefore].filter(Boolean).sort().reverse()[0];
  if (today < first) add(`첫 발행일 ${first} 이전`);
  for (const f of cal.freezes ?? []) if (today >= f.from && today <= f.to) add(`동결 ${f.from}~${f.to}${f.reason ? ` (${f.reason})` : ""}`);
  for (const w of cal.verdictWindows ?? []) if (today === w.date) add(`판정일 ${w.date}${w.reason ? ` (${w.reason})` : ""}`);
  for (const b of cal.deployBatches ?? []) {
    const end = addDays(b.date, cal.deployBlackoutDaysAfter ?? 2);
    if (today >= b.date && today <= end) add(`배포 배치 ${b.date} + ${cal.deployBlackoutDaysAfter ?? 2}일`);
  }
  for (const x of local?.blackouts ?? []) {
    const from = typeof x === "string" ? x : x.from;
    const to = typeof x === "string" ? x : (x.to ?? x.from);
    if (today >= from && today <= to) add(`calendar.local.json 차단 ${from}${to !== from ? `~${to}` : ""}`);
  }
  if (cal.resumeRequiresPilotVerdictAfter && today > cal.resumeRequiresPilotVerdictAfter && !pilotVerdict) {
    add(`${cal.resumeRequiresPilotVerdictAfter} 이후 재개는 D+28 파일럿 판정 필요`);
  }
  return reasons;
}

export const isFrozen = (today, cal) => (cal.freezes ?? []).some((f) => today >= f.from && today <= f.to);

/** 결정 대기 — 게시 중 글의 D+28 판정·reviewBy 판정이 없으면 */
export function pendingDecisions(today, ledger, decisions) {
  const has = (slug, at) => decisions.some((d) => d.slug === slug && d.at === at);
  const out = [];
  for (const e of ledger.filter((x) => x.status === "live")) {
    if (today >= addDays(e.publishedDate, 28) && !has(e.slug, "d28")) out.splice(out.length, 0, { slug: e.slug, at: "d28", due: addDays(e.publishedDate, 28) });
    if (e.reviewBy && today >= e.reviewBy && !has(e.slug, "reviewBy")) out.splice(out.length, 0, { slug: e.slug, at: "reviewBy", due: e.reviewBy });
  }
  return out;
}

/** REVIEWED_UNTIL 은 오늘 이상·오늘+14일 이하여야 유효 */
export function reviewedUntilState(today, value) {
  if (!value) return { valid: false, reason: "REVIEWED_UNTIL 없음 (review-ack.mjs 로 주간 점검 기록)" };
  const v = String(value).trim();
  if (!isIsoDate(v)) return { valid: false, reason: `REVIEWED_UNTIL 형식 오류: ${v}` };
  if (v < today) return { valid: false, reason: `REVIEWED_UNTIL ${v} 만료` };
  if (v > addDays(today, 14)) return { valid: false, reason: `REVIEWED_UNTIL ${v} 이 14일보다 멀다` };
  return { valid: true, reason: "" };
}

/** 승인 카드 만료일 — 1차 출처 게시일+7일과 카드 날짜+2일 중 이른 날 */
export const cardExpiry = (primaryPublishedDate, cardDate) => [addDays(primaryPublishedDate, 7), addDays(cardDate, 2)].sort()[0];

// ─────────────────────────────────────────────────────────────
// 초안 해시 (types.ts draftSha256 와 같은 값)
// ─────────────────────────────────────────────────────────────
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const keys = Object.keys(value)
      .filter((k) => value[k] !== undefined)
      .sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}
export function draftSha256(draft) {
  const rest = { ...draft };
  delete rest.publishedDate;
  delete rest.modifiedDate;
  delete rest.humanReview;
  rest.sources = (draft.sources ?? []).map((s) => {
    const c = { ...s };
    delete c.fetchedAt;
    return c;
  });
  return createHash("sha256").update(canonicalJson(rest), "utf8").digest("hex");
}
export const sha256Text = (s) => createHash("sha256").update(s, "utf8").digest("hex");

// ─────────────────────────────────────────────────────────────
// TREND_HOME · 플래그 · 안전한 쓰기
// ─────────────────────────────────────────────────────────────
export const FLAG_FILES = ["HALT", "PUBLISH_ENABLED", "REVIEWED_UNTIL", "CF_PURGE_OK", "DEPLOY_HOLD"];
/** 운영자만 쓰는 파일 — daily.mjs 는 절대 쓰지 않는다 */
export const OPERATOR_FLAGS = ["PUBLISH_ENABLED", "REVIEWED_UNTIL", "CF_PURGE_OK", "DEPLOY_HOLD", "calendar.local.json"];
export const OPERATOR_REPO_FILES = [
  /^docs\/drafts\//,
  /^docs\/revenue-audit-/,
  /^docs\/naver-blog-100-/,
  /^docs\/search-console/,
  /^docs\/[^/]*\.zip$/,
  /^hf70\.html$/,
  /^\.wrangler\//,
  /^\.claude\/settings\.local\.json$/,
];
export const HOME_DIRS = ["radar", "sentinel", "snapshots", "builds", "writer", "drafts", "drafts/pending", "cards", "reports", "gates", "logs", "state", "locks", "headlines", "tmp"];

export function readFlags(home) {
  const read = (n) => (existsSync(join(home, n)) ? readFileSync(join(home, n), "utf8").trim() : null);
  return {
    halt: read("HALT"),
    publishEnabled: existsSync(join(home, "PUBLISH_ENABLED")),
    reviewedUntil: read("REVIEWED_UNTIL"),
    cfPurgeOk: existsSync(join(home, "CF_PURGE_OK")),
    deployHold: read("DEPLOY_HOLD"),
  };
}

const inside = (child, parent) => {
  const c = resolve(child);
  const p = resolve(parent);
  return c === p || c.startsWith(p.endsWith(sep) ? p : p + sep);
};

/** 모든 쓰기의 단일 관문 — TREND_HOME 안(운영자 플래그 제외)만 */
export function safeWrite(home, path, content) {
  const abs = resolve(path);
  if (!inside(abs, home)) throw new Error(`[daily] TREND_HOME 밖 쓰기 거부: ${abs}`);
  const relName = abs.slice(resolve(home).length + 1).replace(/\\/g, "/");
  if (OPERATOR_FLAGS.includes(relName)) throw new Error(`[daily] 운영자 파일 쓰기 거부: ${relName}`);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content, "utf8");
}
export const writeHalt = (home, reason) => safeWrite(home, join(home, "HALT"), `${new Date().toISOString()} ${reason}\n`);

export function readJsonl(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}
const readJson = (p, fallback) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : fallback);

export function loadConfig(root) {
  return readJson(join(root, "scripts/trend-publish/config.json"), {});
}

export function resolvePaths(opts, config) {
  return {
    home: resolve(opts.trendHome ?? process.env.TREND_HOME ?? config.trendHome),
    wt: resolve(opts.worktree ?? config.worktree),
    mainRepo: resolve(config.mainRepo ?? REPO_OF_SCRIPT),
  };
}

// ─────────────────────────────────────────────────────────────
// 모드 결정
// ─────────────────────────────────────────────────────────────
/** PROPOSE 는 아래가 모두 참일 때만 — 그 밖은 DRYRUN, 동결 기간은 FREEZE(보고만) */
export function computeMode({ today, flags, calendar, localCalendar, pilotVerdict, ledger, decisions, consts, config }) {
  if (isFrozen(today, calendar)) return { mode: "FREEZE", reasons: calendarBlocks(today, calendar, localCalendar, pilotVerdict, consts.firstPublishNotBefore) };
  const reasons = [];
  const add = (r) => reasons.splice(reasons.length, 0, r);
  if (!flags.publishEnabled) add("PUBLISH_ENABLED 없음(준비 플래그 — 승인 아님)");
  const rv = reviewedUntilState(today, flags.reviewedUntil);
  if (!rv.valid) add(rv.reason);
  for (const r of calendarBlocks(today, calendar, localCalendar, pilotVerdict, consts.firstPublishNotBefore)) add(r);
  const pend = pendingDecisions(today, ledger, decisions);
  if (pend.length) add(`결정 대기 ${pend.length}건 (${pend.map((p) => `${p.slug}@${p.at}`).join(", ")})`);
  for (const r of capViolations(today, ledger, config.caps, undefined, consts.hardCaps)) add(r);
  return { mode: reasons.length ? "DRYRUN" : "PROPOSE", reasons };
}

// ─────────────────────────────────────────────────────────────
// 레이더 후보
// ─────────────────────────────────────────────────────────────
const CLUSTER_ALIASES = {
  "civil-servant-pay-table": "civil-servant-pay",
  "base-rate-decision": "bok-base-rate",
  "base-rate-decision(bok)": "bok-base-rate",
  "national-pension-benefit": "national-pension",
  "parental-leave-benefit": "parental-leave",
};
/** types.ts BRIEF_ELIGIBLE_CLUSTERS 를 읽는다 */
export function readEligibleClusters(root) {
  const src = readFileSync(join(root, "src/lib/trendBriefs/types.ts"), "utf8");
  const block = /export const BRIEF_ELIGIBLE_CLUSTERS[^=]*=\s*\[([\s\S]*?)\];/.exec(src)?.[1] ?? "";
  return [...block.matchAll(/"([a-z-]+)"/g)].map((m) => m[1]);
}

/** 가장 최근 레이더 출력(radar/*.json) → 정규화된 후보 목록 */
export function readRadarCandidates(home) {
  const dir = join(home, "radar");
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({ f, t: statSync(join(dir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  if (!files.length) return [];
  const raw = readJson(join(dir, files[0].f), []);
  const list = Array.isArray(raw) ? raw : (raw.candidates ?? raw.items ?? []);
  return list
    .map((c) => ({
      id: String(c.id ?? c.url ?? c.primaryUrl ?? ""),
      cluster: CLUSTER_ALIASES[c.cluster] ?? c.cluster,
      route: c.route ?? c.kind ?? c.action ?? "new-brief",
      title: String(c.title ?? ""),
      url: String(c.url ?? c.primaryUrl ?? ""),
      publishedDate: String(c.publishedDate ?? c.date ?? "").slice(0, 10),
      ministry: c.ministry ? String(c.ministry) : undefined,
      eventKind: c.eventKind ? String(c.eventKind) : undefined,
      score: Number(c.score ?? 0),
      fromRss: c.fromRss ?? c.rssUrl,
    }))
    .filter((c) => c.url.startsWith("https://") && isIsoDate(c.publishedDate));
}

/** 오늘의 후보 — new-brief · 대상 군집 · 원장에 없는 문서 · 군집 30일 공백 · 1차 7일 이내, 점수 순 */
export function pickCandidate(candidates, { today, ledger, eligible }) {
  const ok = candidates.filter(
    (c) =>
      c.route === "new-brief" &&
      eligible.includes(c.cluster) &&
      !ledger.some((e) => e.primary?.url === c.url) &&
      !ledger.some((e) => e.cluster === c.cluster && daysBetween(e.publishedDate, today) < 30) &&
      daysBetween(c.publishedDate, today) <= 7 &&
      daysBetween(c.publishedDate, today) >= 0
  );
  return ok.sort((a, b) => b.score - a.score || (a.publishedDate < b.publishedDate ? 1 : -1))[0] ?? null;
}

// ─────────────────────────────────────────────────────────────
// 명령 실행 (테스트는 가짜 run 을 주입)
// ─────────────────────────────────────────────────────────────
export function realRun(cmd, args, { cwd, env } = {}) {
  return new Promise((resolveRun) => {
    // 셸 없이 실행 — git·node(process.execPath)만 부른다(npm·npx 는 heavy.mjs 가 셸로 실행)
    const child = spawn(cmd, args, { cwd, env: env ?? process.env, shell: false, windowsHide: true });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (d) => (stdout += d));
    child.stderr?.on("data", (d) => (stderr += d));
    child.on("close", (code) => resolveRun({ code: code ?? 1, stdout, stderr }));
    child.on("error", (e) => resolveRun({ code: 127, stdout, stderr: String(e) }));
  });
}
export const defaultDeps = () => ({ run: realRun, now: () => new Date(), log: (s) => process.stdout.write(`${s}\n`) });

const lastJson = (text) => {
  const line = String(text ?? "").trim().split(/\r?\n/).filter(Boolean).at(-1) ?? "";
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
};

function acquireLock(home, name, maxAgeMs) {
  const dir = join(home, name);
  try {
    mkdirSync(dir);
    return dir;
  } catch {
    try {
      if (Date.now() - statSync(dir).mtimeMs > maxAgeMs) {
        rmSync(dir, { recursive: true, force: true });
        mkdirSync(dir);
        return dir;
      }
    } catch {
      /* 무시 */
    }
    return null;
  }
}

/** 무거운 16단계 — 워크트리에서 heavy.mjs 로 하나씩, 첫 실패에서 멈춘다 */
export function heavySteps({ slug, originSha, home, wt, config, sibling }) {
  const b = join(home, "builds", originSha);
  const pages = [...(config.adSequence?.gatePages ?? ["/", "/guides/nurse-salary", "/calc/samsung-bonus"]), `/guides/${slug}`, ...(sibling ? [`/guides/${sibling}`] : [])].join(",");
  const allow = (config.pathAllowlist?.publish ?? []).map((re) => `--allow "${re}"`).join(" ");
  const exempt = (config.chunkDiff?.runtimeExempt ?? []).map((re) => `--runtime-exempt "${re}"`).join(" ");
  return [
    ["prebuild-gens", "npx tsx scripts/gen-guides-meta.ts && npx tsx scripts/gen-site-metrics.ts && npx tsx scripts/gen-salary-amounts.ts && npx tsx scripts/gen-season-key.ts"],
    ["ledger-update", "npm run ledger:update"],
    ["vitest", "npm test"],
    ["node-test", "node --test scripts/__tests__/trend-publish.test.mjs"],
    ["verify-tax", "npm run verify:tax"],
    ["verify-site", "npm run verify:site"],
    ["verify-sitemap", "npm run verify:sitemap"],
    ["eslint", "npx eslint src/lib/guides/trend-briefs.ts src/lib/guides/trend-briefs-*.ts"],
    ["build", "npm run build"],
    ["edge-bundle", "node scripts/verify-edge-bundle.mjs"],
    ["autoads", "npm run verify:autoads"],
    ["qa-quality", "npm run qa:quality"],
    ["ad-audit", "node scripts/ad-audit.mjs --diff --base origin/main"],
    [
      "ad-sequence",
      `node scripts/trend-publish/ad-sequence.mjs extract --next .next --pages "${pages}" --out "${join(b, `brief-${slug}-adseq.json`)}" && node scripts/trend-publish/ad-sequence.mjs compare --base "${join(b, "adseq.json")}" --brief "${join(b, `brief-${slug}-adseq.json`)}" --slug ${slug}${sibling ? ` --sibling ${sibling}` : ""}`,
    ],
    [
      "chunk-diff",
      `node scripts/trend-publish/chunk-diff.mjs manifest --next .next --out "${join(b, `brief-${slug}-chunks.json`)}" && node scripts/trend-publish/chunk-diff.mjs compare --base "${join(b, "chunks.json")}" --brief "${join(b, `brief-${slug}-chunks.json`)}" --slug ${slug} --next .next ${exempt} && node scripts/trend-publish/chunk-diff.mjs status --repo . ${allow}`,
    ],
    ["gate-post", `npx tsx scripts/trend-publish/gate.ts --draft "{DRAFT}" --sources "{SOURCES}" --mode {MODE} --today {TODAY} --phase post --repo . --trend-home "${home}" --out "${join(home, "gates", `gate-${slug}-post.json`)}"`],
  ].map(([name, cmd]) => ({ name, cmd, wt }));
}

async function runHeavy(deps, { home, wt, date, name, cmd }) {
  const log = join(home, "logs", `${date}-${name}.log`);
  return deps.run(process.execPath, [join(wt, "scripts/trend-publish/heavy.mjs"), cmd, "--cwd", wt, "--log", log, "--trend-home", home], { cwd: wt });
}

async function git(deps, wt, args) {
  return deps.run("git", ["-C", wt, ...args], { cwd: wt });
}

function report(home, date, lines) {
  const path = join(home, "reports", `${date}.md`);
  const prev = existsSync(path) ? readFileSync(path, "utf8") : `# 트렌드 브리프 일일 보고 ${date}\n`;
  safeWrite(home, path, `${prev}\n${lines.join("\n")}\n`);
  return path;
}

// ─────────────────────────────────────────────────────────────
// prepare
// ─────────────────────────────────────────────────────────────
export async function prepare(opts, deps = defaultDeps()) {
  const config = loadConfig(opts.worktree ?? REPO_OF_SCRIPT);
  const { home, wt } = resolvePaths(opts, config);
  for (const d of HOME_DIRS) mkdirSync(join(home, d), { recursive: true });
  const today = opts.today ?? kstToday(deps.now());
  const lock = acquireLock(home, "daily.lock", 6 * 3_600_000);
  const out = (o) => ({ mode: null, reason: "", report: null, ...o });
  if (!lock) return out({ status: "skip", reason: "다른 daily 실행 중(daily.lock)" });
  try {
    const flags = readFlags(home);
    if (flags.halt) return out({ status: "halt", reason: `HALT: ${flags.halt}`, report: report(home, today, [`## prepare — 중지(HALT)`, `- ${flags.halt}`]) });

    if (!opts.noSync) {
      const f = await git(deps, wt, ["fetch", "origin", "--prune"]);
      if (f.code !== 0) return out({ status: "skip", reason: "git fetch 실패(네트워크)", report: report(home, today, ["## prepare — fetch 실패로 건너뜀"]) });
      const st = await git(deps, wt, ["status", "--porcelain", "--untracked-files=normal"]);
      if (st.code !== 0 || st.stdout.trim()) {
        writeHalt(home, `트렌드 워크트리가 깨끗하지 않음 — 사람이 확인: ${wt}`);
        return out({ status: "halt", reason: "워크트리 변경 발견 → HALT", report: report(home, today, ["## prepare — 워크트리 변경 발견, HALT 작성", "```", st.stdout.trim().slice(0, 2000), "```"]) });
      }
      await git(deps, wt, ["checkout", "--detach", "origin/main"]);
      await git(deps, wt, ["reset", "--hard", "origin/main"]);
      if (!opts.reexeced) {
        // 방금 맞춘 워크트리의 새 코드로 다시 실행 — 자식은 동기화를 반복하지 않는다(--no-sync)
        const args = [join(wt, "scripts/trend-publish/daily.mjs"), "prepare", "--reexeced", "--no-sync", "--trend-home", home, "--worktree", wt, ...(opts.today ? ["--today", opts.today] : [])];
        rmSync(lock, { recursive: true, force: true });
        const r = await deps.run(process.execPath, args, { cwd: wt });
        return lastJson(r.stdout) ?? out({ status: "error", reason: `재실행 결과를 읽지 못함 (exit ${r.code})` });
      }
    }

    const originSha = (await git(deps, wt, ["rev-parse", "HEAD"])).stdout.trim() || "unknown";
    const consts = readTypesConstants(wt);
    const ledger = readJson(join(wt, "scripts/trend-publish/ledger.json"), []);
    const calendar = readJson(join(wt, "scripts/trend-publish/calendar.json"), {});
    const localCalendar = readJson(join(home, "calendar.local.json"), {});
    const decisions = readJsonl(join(home, "decisions.jsonl"));
    const pilotVerdict = decisions.some((d) => d.decision === "pilot-verdict" && d.value === "continue");
    const wtConfig = loadConfig(wt);
    const m = computeMode({ today, flags, calendar, localCalendar, pilotVerdict, ledger, decisions, consts, config: wtConfig });
    const lines = [`## prepare ${today} — 모드 ${m.mode}`, ...m.reasons.map((r) => `- ${r}`), `- 기준 커밋 ${originSha.slice(0, 8)}`];

    if (m.mode === "FREEZE") {
      const pend = pendingDecisions(today, ledger, decisions);
      lines.splice(lines.length, 0, "- 동결 기간: 초안·빌드 없이 보고만", ...pend.map((p) => `- 결정 대기: ${p.slug} (${p.at}, 기한 ${p.due})`));
      return out({ status: "freeze-report-only", mode: m.mode, reason: m.reasons.join(" · "), report: report(home, today, lines) });
    }

    const substitute = (arr) => arr.map((a) => a.replace("{TREND_HOME}", home));
    for (const [name, spec] of [["radar", wtConfig.radar], ["sentinel", wtConfig.sentinel]]) {
      const cmd = substitute(spec?.cmd ?? []);
      if (!cmd.length || !existsSync(join(wt, cmd[1] ?? ""))) {
        lines.splice(lines.length, 0, `- ${name} 스크립트 없음(${cmd[1] ?? "-"}) — 레이더 컴포넌트 병합 전`);
        return out({ status: "skip", mode: m.mode, reason: `${name} 없음`, report: report(home, today, lines) });
      }
      const r = await deps.run(cmd[0] === "node" ? process.execPath : cmd[0], cmd.slice(1), { cwd: wt });
      if (r.code !== 0) {
        lines.splice(lines.length, 0, `- ${name} 실패 (exit ${r.code})`);
        return out({ status: "skip", mode: m.mode, reason: `${name} 실패`, report: report(home, today, lines) });
      }
    }

    const candidate = pickCandidate(readRadarCandidates(home), { today, ledger, eligible: readEligibleClusters(wt) });
    if (!candidate) {
      lines.splice(lines.length, 0, "- 오늘의 후보 없음(공식 출처·대상 군집·7일·군집 30일 조건)");
      return out({ status: "no-candidate", mode: m.mode, reason: "후보 없음", report: report(home, today, lines) });
    }
    lines.splice(lines.length, 0, `- 후보: [${candidate.cluster}] ${candidate.title} (${candidate.publishedDate})`);

    // 기준 빌드 + 목록 (브리프 빌드와 비교할 대상)
    const b = join(home, "builds", originSha);
    const sibling = wtConfig.adSequence?.siblingGuide;
    const gatePages = [...(wtConfig.adSequence?.gatePages ?? []), ...(sibling ? [`/guides/${sibling}`] : [])].join(",");
    // baseBuild: "always"(기본 — 날짜 의존 블록이 있어 매일 다시 빌드) · "reuse"(같은 커밋 목록이 있으면 재사용)
    const reuseBase = wtConfig.baseBuild === "reuse" && existsSync(join(b, "chunks.json")) && existsSync(join(b, "adseq.json"));
    for (const [name, cmd] of reuseBase ? [] : [
      ["base-build", "npm run build"],
      ["base-manifests", `node scripts/trend-publish/chunk-diff.mjs manifest --next .next --out "${join(b, "chunks.json")}" && node scripts/trend-publish/ad-sequence.mjs extract --next .next --pages "${gatePages}" --out "${join(b, "adseq.json")}"`],
      ["base-autoads", "npm run verify:autoads"],
    ]) {
      const r = await runHeavy(deps, { home, wt, date: today, name, cmd });
      if (r.code === 75) {
        lines.splice(lines.length, 0, `- ${name}: 메모리·잠금 부족으로 오늘 건너뜀(heavy exit 75)`);
        return out({ status: "skip", mode: m.mode, reason: "RAM·잠금 부족", report: report(home, today, lines) });
      }
      if (r.code !== 0) {
        lines.splice(lines.length, 0, `- ${name} 실패 (exit ${r.code}) — origin/main 자체 문제일 수 있음, 로그 logs/${today}-${name}.log`);
        return out({ status: "skip", mode: m.mode, reason: `${name} 실패`, report: report(home, today, lines) });
      }
      if (name === "base-autoads") safeWrite(home, join(b, "autoads.txt"), r.stdout.slice(-4000));
    }

    // 1차 + 보조 출처 스냅숏
    const snapDir = join(home, "snapshots", today);
    const snap = async (url, id, fromRss) =>
      deps.run(process.execPath, [join(wt, "node_modules/tsx/dist/cli.mjs"), join(wt, "scripts/trend-publish/source-snapshot.ts"), "--url", url, "--out", snapDir, "--id", id, "--trend-home", home, ...(fromRss ? ["--from-rss", fromRss] : [])], { cwd: wt });
    const p = await snap(candidate.url, "primary", candidate.fromRss);
    if (p.code !== 0) {
      lines.splice(lines.length, 0, `- 1차 출처 스냅숏 실패 (exit ${p.code}) — robots·HTTP·호스트`);
      return out({ status: "skip", mode: m.mode, reason: "1차 출처 스냅숏 실패", report: report(home, today, lines) });
    }
    const seconds = [
      ...readRadarCandidates(home).filter((c) => c.cluster === candidate.cluster && c.url !== candidate.url).map((c) => c.url),
      ...(wtConfig.clusters?.[candidate.cluster]?.standingSources ?? []),
    ];
    let secondaryOk = 0;
    for (const [i, url] of seconds.slice(0, 3).entries()) {
      const r = await snap(url, `secondary-${i + 1}`);
      if (r.code === 0) secondaryOk++;
      if (secondaryOk >= 1) break;
    }
    if (!secondaryOk) {
      lines.splice(lines.length, 0, "- 보조 공식 출처를 확보하지 못함(2건 이상 규칙) — SKIP");
      return out({ status: "skip", mode: m.mode, reason: "보조 출처 없음", report: report(home, today, lines) });
    }

    const candPath = join(home, "state", `${today}-candidate.json`);
    safeWrite(home, candPath, `${JSON.stringify(candidate, null, 2)}\n`);
    const writerInput = join(home, "writer", today, "writer-input.json");
    const draftPath = join(home, "drafts", "pending", `${today}.json`);
    const wi = await deps.run(
      process.execPath,
      [join(wt, "node_modules/tsx/dist/cli.mjs"), join(wt, "scripts/trend-publish/writer-input.ts"), "--candidate", candPath, "--snapshots", snapDir, "--out", writerInput, "--draft-path", draftPath, "--today", today],
      { cwd: wt }
    );
    if (wi.code !== 0) {
      lines.splice(lines.length, 0, `- writer-input 생성 실패 (exit ${wi.code})`);
      return out({ status: "skip", mode: m.mode, reason: "writer-input 실패", report: report(home, today, lines) });
    }
    safeWrite(home, join(home, "state", `${today}.json`), `${JSON.stringify({ date: today, mode: m.mode, reasons: m.reasons, originSha, candidate, snapDir, writerInput, draftPath }, null, 2)}\n`);
    lines.splice(lines.length, 0, `- writer-input: ${writerInput}`, `- 초안 경로: ${draftPath}`, "- 다음: writer 가 초안(JSON)을 쓰고 `node scripts/trend-publish/daily.mjs finish --draft <초안>`");
    return out({ status: "write", mode: m.mode, reason: m.reasons.join(" · "), report: report(home, today, lines), writerInput, draftPath });
  } finally {
    rmSync(lock, { recursive: true, force: true });
  }
}

// ─────────────────────────────────────────────────────────────
// finish
// ─────────────────────────────────────────────────────────────
export async function finish(opts, deps = defaultDeps()) {
  const config = loadConfig(opts.worktree ?? REPO_OF_SCRIPT);
  const { home, wt } = resolvePaths(opts, config);
  const today = opts.today ?? kstToday(deps.now());
  const res = (o) => ({ reason: "", gateSummary: null, ...o });
  const lock = acquireLock(home, "daily.lock", 6 * 3_600_000);
  if (!lock) return res({ status: "skip", reason: "다른 daily 실행 중(daily.lock)" });
  try {
    const flags = readFlags(home);
    if (flags.halt) return res({ status: "halt", reason: `HALT: ${flags.halt}` });
    const state = readJson(join(home, "state", `${today}.json`), null);
    if (!state) return res({ status: "error", reason: `prepare 상태 없음: state/${today}.json` });
    if (!opts.draft || !existsSync(opts.draft)) return res({ status: "error", reason: `초안 파일 없음: ${opts.draft}` });
    let draft;
    try {
      draft = JSON.parse(readFileSync(opts.draft, "utf8"));
    } catch (e) {
      return res({ status: "error", reason: `초안 JSON 오류: ${e.message}` });
    }
    const lines = [`## finish ${today}`];
    if (draft?.skip === true) {
      lines.splice(lines.length, 0, `- writer skip: ${draft.reason ?? "(사유 없음)"}`);
      report(home, today, lines);
      return res({ status: "skip", reason: `writer skip: ${draft.reason ?? ""}` });
    }
    const slug = String(draft.slug ?? "");
    const head = (await git(deps, wt, ["rev-parse", "HEAD"])).stdout.trim();
    if (state.originSha && head && head !== state.originSha) return res({ status: "error", reason: `워크트리 HEAD 가 prepare 이후 바뀜 (${head.slice(0, 8)} ≠ ${state.originSha.slice(0, 8)}) — prepare 부터 다시` });

    // 모드 재계산(플래그가 바뀌었을 수 있다) — PROPOSE 는 둘 다 PROPOSE 일 때만
    const consts = readTypesConstants(wt);
    const ledger = readJson(join(wt, "scripts/trend-publish/ledger.json"), []);
    const decisions = readJsonl(join(home, "decisions.jsonl"));
    const m = computeMode({
      today,
      flags,
      calendar: readJson(join(wt, "scripts/trend-publish/calendar.json"), {}),
      localCalendar: readJson(join(home, "calendar.local.json"), {}),
      pilotVerdict: decisions.some((d) => d.decision === "pilot-verdict" && d.value === "continue"),
      ledger,
      decisions,
      consts,
      config: loadConfig(wt),
    });
    const mode = state.mode === "PROPOSE" && m.mode === "PROPOSE" ? "PROPOSE" : "DRYRUN";
    const gateMode = mode === "PROPOSE" ? "publish" : "dryrun";
    const tsx = join(wt, "node_modules/tsx/dist/cli.mjs");
    const resetWt = async () => {
      await git(deps, wt, ["reset", "--hard", state.originSha || "origin/main"]);
      await git(deps, wt, ["clean", "-fd"]);
    };

    const render = await deps.run(process.execPath, [tsx, join(wt, "scripts/trend-publish/render.ts"), "--draft", opts.draft, "--write", "--today", today, "--repo", wt], { cwd: wt });
    if (render.code !== 0) {
      lines.splice(lines.length, 0, `- render 거부 (exit ${render.code}): ${(render.stderr || render.stdout).trim().slice(0, 500)}`);
      await resetWt();
      report(home, today, lines);
      return res({ status: "skip", reason: "render 거부" });
    }
    const gatePre = await deps.run(
      process.execPath,
      [tsx, join(wt, "scripts/trend-publish/gate.ts"), "--draft", opts.draft, "--sources", state.snapDir, "--headlines", join(home, "headlines"), "--sentinel", join(home, "sentinel", "latest.json"),
        "--mode", gateMode, "--today", today, "--phase", "pre", "--check-diff", state.originSha || "origin/main", "--repo", wt, "--trend-home", home, "--out", join(home, "gates", `gate-${slug}-pre.json`)],
      { cwd: wt }
    );
    if (gatePre.code !== 0) {
      lines.splice(lines.length, 0, `- gate pre ${gatePre.code === 1 ? "규칙 실패 → SKIP" : "인프라 오류"}`, "```", gatePre.stdout.trim().slice(-3000), "```");
      await resetWt();
      report(home, today, lines);
      return res({ status: gatePre.code === 1 ? "skip" : "error", reason: "gate pre", gateSummary: join(home, "gates", `gate-${slug}-pre.json`) });
    }

    const steps = heavySteps({ slug, originSha: state.originSha, home, wt, config: loadConfig(wt), sibling: loadConfig(wt).adSequence?.siblingGuide });
    for (const s of steps) {
      const cmd = s.cmd.replace("{DRAFT}", opts.draft).replace("{SOURCES}", state.snapDir).replace("{MODE}", gateMode).replace("{TODAY}", today);
      const r = await runHeavy(deps, { home, wt, date: today, name: s.name, cmd });
      if (r.code === 75) {
        lines.splice(lines.length, 0, `- ${s.name}: 메모리·잠금 부족(heavy exit 75) → 오늘 SKIP`);
        await resetWt();
        report(home, today, lines);
        return res({ status: "skip", reason: `RAM·잠금 부족 (${s.name})` });
      }
      if (r.code !== 0) {
        lines.splice(lines.length, 0, `- ${s.name} 실패 (exit ${r.code}) → SKIP · 로그 logs/${today}-${s.name}.log`);
        await resetWt();
        report(home, today, lines);
        return res({ status: "skip", reason: `${s.name} 실패`, gateSummary: join(home, "gates", `gate-${slug}-post.json`) });
      }
      lines.splice(lines.length, 0, `- ${s.name} 통과`);
    }
    const gateSummary = join(home, "gates", `gate-${slug}-post.json`);

    if (mode === "DRYRUN") {
      lines.splice(lines.length, 0, `- DRYRUN 통과 — 커밋 없이 워크트리 원복 (${m.reasons.join(" · ") || "PROPOSE 조건 미충족"})`);
      await resetWt();
      report(home, today, lines);
      return res({ status: "dryrun-pass", reason: m.reasons.join(" · "), gateSummary });
    }

    // PROPOSE — 로컬 브랜치에 커밋, 초안 보관, 승인 카드
    const branch = `trend/${today}-${slug}`;
    await git(deps, wt, ["checkout", "-b", branch]);
    const allow = (loadConfig(wt).pathAllowlist?.publish ?? []).map((s) => new RegExp(s));
    const changed = (await git(deps, wt, ["status", "--porcelain", "--untracked-files=all"])).stdout
      .split(/\r?\n/)
      .map((l) => l.slice(3).trim())
      .filter(Boolean);
    const outside = changed.filter((f) => !allow.some((re) => re.test(f)));
    if (outside.length) {
      writeHalt(home, `PROPOSE 직전 허용 밖 변경: ${outside.join(", ")}`);
      await git(deps, wt, ["checkout", "--detach", state.originSha]);
      await resetWt();
      report(home, today, [...lines, `- 허용 밖 변경 → HALT: ${outside.join(", ")}`]);
      return res({ status: "halt", reason: "허용 밖 변경" });
    }
    await git(deps, wt, ["add", "--", ...changed]);
    const title = String(draft.title ?? slug).replace(/"/g, "");
    const msgPath = join(home, "tmp", `commit-${slug}.txt`);
    safeWrite(
      home,
      msgPath,
      [`feat(guides): 공식 발표 해설 ${slug}`, "", `${title}`, `근거: ${String(draft.event?.ministry ?? "").replace(/"/g, "")} ${String(draft.event?.kind ?? "")} (${String(draft.event?.announcedDate ?? "")})`, "daily.mjs PROPOSE — 운영자 승인 전 로컬 브랜치(원격 반영은 publish-approved.mjs 만).", "", "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>", ""].join("\n")
    );
    const c = await git(deps, wt, ["commit", "-F", msgPath]);
    if (c.code !== 0) {
      report(home, today, [...lines, `- 커밋 실패 (exit ${c.code})`]);
      return res({ status: "error", reason: "커밋 실패" });
    }
    const tree = (await git(deps, wt, ["rev-parse", "HEAD^{tree}"])).stdout.trim();
    const sha = draftSha256(draft);
    const primary = (draft.sources ?? []).find((s) => s.role === "primary") ?? {};
    const expiry = cardExpiry(primary.publishedDate ?? today, today);
    safeWrite(
      home,
      join(home, "drafts", `${slug}.json`),
      `${JSON.stringify({ draft, draftSha256: sha, originSha: state.originSha, treeHash: tree, heavyInputsHash: sha256Text(`${state.originSha}\n${tree}`), cardDate: today, primaryPublishedDate: primary.publishedDate, expiry, branch, snapDir: state.snapDir, gateSummary }, null, 2)}\n`
    );
    const card = join(home, "cards", `${today}-${slug}.md`);
    safeWrite(
      home,
      card,
      [
        `# 발행 승인 카드 — ${title}`,
        "",
        `- slug: \`${slug}\``,
        `- 초안 해시: \`${sha}\``,
        `- 공식 발표: ${draft.event?.ministry ?? ""} ${draft.event?.kind ?? ""} (${draft.event?.announcedDate ?? ""}) — ${draft.event?.status === "proposed" ? "정부안·예고(확정 아님)" : "확정 발표"}`,
        `- 출처: ${(draft.sources ?? []).map((s) => `${s.title} <${s.url}>`).join(" · ")}`,
        `- 로컬 브랜치: \`${branch}\` (원격 반영 안 됨)`,
        `- 카드 만료: ${expiry} (1차 출처 게시일+7일과 카드 날짜+2일 중 이른 날)`,
        `- 게이트: ${gateSummary}`,
        "",
        "## 승인하려면",
        `채팅에 **발행 ${slug}** 라고 쓰면 세션이 아래를 실행한다(원격 반영은 이 명령만, 권한 확인 창이 한 번 더 뜬다):`,
        "",
        "```",
        `node scripts/trend-publish/publish-approved.mjs --slug ${slug} --draft-sha256 ${sha}`,
        "```",
        "",
        "승인은 '발행을 허락한다'는 뜻이다 — 내용 검수 완료가 아니다. 본문에는 '운영자가 발행을 승인했습니다(내용 검수 아님)'으로 표기된다.",
        "",
      ].join("\n")
    );
    lines.splice(lines.length, 0, `- PROPOSE: 로컬 브랜치 ${branch} 커밋, 카드 ${card}`);
    await git(deps, wt, ["checkout", "--detach", state.originSha]);
    report(home, today, lines);
    return res({ status: "proposed", reason: "", card, gateSummary });
  } finally {
    rmSync(lock, { recursive: true, force: true });
  }
}

// ─────────────────────────────────────────────────────────────
// init · status
// ─────────────────────────────────────────────────────────────
export async function init(opts, deps = defaultDeps()) {
  const config = loadConfig(REPO_OF_SCRIPT);
  const { home, wt, mainRepo } = resolvePaths(opts, config);
  const plan = [`TREND_HOME: ${home}`, `워크트리: ${wt} (origin/main 분리 HEAD)`, `node_modules 정션: ${join(wt, "node_modules")} → ${join(mainRepo, "node_modules")}`];
  if (!opts.yes) return { status: "plan", reason: "확인 후 --yes 로 다시 실행", plan };
  for (const d of HOME_DIRS) mkdirSync(join(home, d), { recursive: true });
  if (!existsSync(wt)) {
    const f = await git(deps, mainRepo, ["fetch", "origin"]);
    if (f.code !== 0) return { status: "error", reason: "git fetch 실패", plan };
    const a = await deps.run("git", ["-C", mainRepo, "worktree", "add", "--detach", wt, "origin/main"], { cwd: mainRepo });
    if (a.code !== 0) return { status: "error", reason: `worktree add 실패: ${a.stderr.trim()}`, plan };
  }
  if (!existsSync(join(wt, "node_modules"))) symlinkSync(join(mainRepo, "node_modules"), join(wt, "node_modules"), "junction");
  return { status: "ok", reason: "초기화 완료", plan };
}

export function status(opts) {
  const config = loadConfig(opts.worktree ?? REPO_OF_SCRIPT);
  const { home, wt } = resolvePaths(opts, config);
  const today = opts.today ?? kstToday();
  const flags = readFlags(home);
  const root = existsSync(join(wt, "scripts/trend-publish/ledger.json")) ? wt : REPO_OF_SCRIPT;
  const ledger = readJson(join(root, "scripts/trend-publish/ledger.json"), []);
  const decisions = readJsonl(join(home, "decisions.jsonl"));
  const m = computeMode({
    today,
    flags,
    calendar: readJson(join(root, "scripts/trend-publish/calendar.json"), {}),
    localCalendar: readJson(join(home, "calendar.local.json"), {}),
    pilotVerdict: decisions.some((d) => d.decision === "pilot-verdict" && d.value === "continue"),
    ledger,
    decisions,
    consts: readTypesConstants(root),
    config: loadConfig(root),
  });
  return { status: "ok", mode: m.mode, reason: m.reasons.join(" · "), flags, live: ledger.filter((e) => e.status === "live").length, pending: pendingDecisions(today, ledger, decisions) };
}

export function parseArgs(argv) {
  const get = (n) => {
    const i = argv.indexOf(n);
    return i > -1 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : undefined;
  };
  return {
    cmd: argv[2],
    trendHome: get("--trend-home"),
    worktree: get("--worktree"),
    today: get("--today"),
    draft: get("--draft"),
    reexeced: argv.includes("--reexeced"),
    noSync: argv.includes("--no-sync"),
    yes: argv.includes("--yes"),
  };
}

export async function main(argv = process.argv, deps = defaultDeps()) {
  const opts = parseArgs(argv);
  let result;
  try {
    if (opts.cmd === "prepare") result = await prepare(opts, deps);
    else if (opts.cmd === "finish") result = await finish(opts, deps);
    else if (opts.cmd === "init") result = await init(opts, deps);
    else if (opts.cmd === "status") result = status(opts);
    else result = { status: "error", reason: "사용: daily.mjs init|prepare|finish|status [--trend-home] [--worktree] [--today] [--draft]" };
  } catch (e) {
    result = { status: "error", reason: e.message };
  }
  deps.log(JSON.stringify(result));
  return result.status === "error" ? 2 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().then((code) => process.exit(code));
}
