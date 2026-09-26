#!/usr/bin/env node
// scripts/trend-radar/run.mjs — 트렌드 레이더(하루 1회, 키 없이 동작)
//
// 하는 일: 무료 공식 신호(부처 RSS·목록)를 모아 → 금융 12개 클러스터로 거르고 → 기존 사이트 페이지에
// 연결하고 → 점수를 매겨 → JSON + 한국어 보고서를 낸다.
// 하지 않는 일: 글쓰기, 상세 페이지·본문·첨부 가져오기, 발행, git 조작. 키가 없어도 기본 경로는 전부 돈다.
//
// 사용:
//   node scripts/trend-radar/run.mjs --fixtures --today 2026-09-26      오프라인 고정 표본(결정적)
//   node scripts/trend-radar/run.mjs --live                             실시간(요청 20회 이하)
//   node scripts/trend-radar/run.mjs --live --check-robots              소스 경로별 robots 허용 여부만 출력
//   옵션: --out <dir>(기본 scripts/trend-radar/.cache) · --max-requests N(기본 20) · --today YYYY-MM-DD
// 종료 코드: 0 정상(일부 소스 실패는 기록만) · 1 모든 소스 실패 또는 설정 오류 · 2 사용법 오류
// 선택 env: LAW_OC(국가법령정보 공동활용 등록 ID) — 있으면 법령 공포 감시 1회 추가. 값은 절대 출력하지 않는다.

import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { performance } from "node:perf_hooks";

import { createHttp, redactUrl } from "./lib/http.mjs";
import { isAllowed, isAllowedCached } from "./lib/robots.mjs";
import { parseRss, parseNtsList, parseMoelList, parseGtrends, toKstIso } from "./lib/parse.mjs";
import { compileClusters, validateClusters, classifyTitle, detectKind, clusterById, trendsFinance } from "./lib/filter.mjs";
import { loadSiteIndex, topMatches } from "./lib/site-map.mjs";
import {
  ageHours,
  kstDate,
  calendarMatch,
  upcomingEvents,
  nextEvent,
  scoreCandidate,
  recommend,
} from "./lib/score.mjs";
import { runLawDrf, LAW_DRF_ENDPOINT } from "./lib/lawdrf.mjs";
import { validateRadar, writeOutputs } from "./lib/report.mjs";

// 배열 뒤에 붙이기(발행기 외 트렌드 스크립트에는 배열 메서드 이름까지 포함해 '푸시' 문자열을 두지 않는다 — trend-publish 게이트).
const put = (arr, ...vals) => {
  for (const v of vals) arr[arr.length] = v;
  return arr.length;
};

const HERE = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(HERE, "..", "..");
export const DEFAULT_OUT = join(HERE, ".cache");
export const FIXTURES_DIR = join(HERE, "fixtures");
const SOURCE_KINDS = ["rss", "html-nts", "html-moel", "gtrends", "lawdrf"];
const REC_ORDER = { "new-brief": 0, "update-existing": 1, watch: 2, ignore: 3 };

export const USAGE = `사용법: node scripts/trend-radar/run.mjs (--fixtures | --live) [--today YYYY-MM-DD] [--out <dir>] [--max-requests N] [--check-robots]
  --fixtures       오프라인 고정 표본(scripts/trend-radar/fixtures) — --today 와 함께 쓰면 결정적
  --live           공식 목록 실시간 수집(요청 상한 기본 20)
  --check-robots   소스 경로별 robots 허용/차단만 출력(기본 --live)
  --out <dir>      산출물 폴더(기본 scripts/trend-radar/.cache, git 무시)
종료 코드: 0 정상 · 1 모든 소스 실패/설정 오류 · 2 사용법 오류`;

export class UsageError extends Error {}

export function parseArgs(argv) {
  const o = { mode: null, today: null, out: DEFAULT_OUT, maxRequests: 20, checkRobots: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const val = () => {
      const v = argv[i + 1];
      if (v === undefined || v.startsWith("--")) throw new UsageError(`${a} 값이 없습니다`);
      i += 1;
      return v;
    };
    if (a === "--fixtures" || a === "--live") {
      const m = a.slice(2);
      if (o.mode && o.mode !== m) throw new UsageError("--fixtures 와 --live 는 함께 쓸 수 없습니다");
      o.mode = m;
    } else if (a === "--today") {
      const v = val();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(`${v}T00:00:00Z`))) throw new UsageError(`--today 형식 오류: ${v}`);
      o.today = v;
    } else if (a === "--out") o.out = resolve(val());
    else if (a === "--max-requests") {
      const v = Number(val());
      if (!Number.isInteger(v) || v < 1 || v > 100) throw new UsageError("--max-requests 는 1~100 정수");
      o.maxRequests = v;
    } else if (a === "--check-robots") o.checkRobots = true;
    else if (a === "--help" || a === "-h") o.help = true;
    else throw new UsageError(`알 수 없는 옵션: ${a}`);
  }
  if (!o.help && !o.mode) {
    if (o.checkRobots) o.mode = "live";
    else throw new UsageError("--fixtures 또는 --live 가 필요합니다");
  }
  return o;
}

export function loadConfig(dir = HERE) {
  const read = (f) => JSON.parse(readFileSync(join(dir, f), "utf8"));
  return { sources: read("sources.json").sources, clusters: read("clusters.json"), calendar: read("calendar-events.json") };
}

/** 설정 검증 — 오류 문자열 배열 */
export function validateConfig(cfg, repoRoot = REPO_ROOT) {
  const e = [];
  const ids = new Set();
  for (const s of cfg.sources || []) {
    for (const k of ["id", "kind", "url", "host", "ministry", "defaultKind", "dateFormat", "robotsNote"]) {
      if (typeof s[k] !== "string" || !s[k]) put(e, `sources.${s.id || "?"}.${k} 없음`);
    }
    if (!Number.isInteger(s.maxBytes) || s.maxBytes <= 0) put(e, `sources.${s.id}.maxBytes`);
    if (!SOURCE_KINDS.includes(s.kind)) put(e, `sources.${s.id}.kind 알 수 없음: ${s.kind}`);
    if (ids.has(s.id)) put(e, `sources.${s.id} 중복`);
    ids.add(s.id);
    try {
      const u = new URL(s.url);
      if (u.protocol !== "https:") put(e, `sources.${s.id}.url https 아님`);
      if (u.hostname !== s.host) put(e, `sources.${s.id}.host 가 URL 과 다름`);
    } catch {
      put(e, `sources.${s.id}.url 형식 오류`);
    }
  }
  const keyless = (cfg.sources || []).filter((s) => s.kind !== "lawdrf");
  if (keyless.length !== 12) put(e, `키 없는 소스는 12개여야 함(현재 ${keyless.length})`);
  put(e, ...validateClusters(cfg.clusters, repoRoot));
  const clusterIds = new Set((cfg.clusters.clusters || []).map((c) => c.id));
  for (const ev of cfg.calendar?.events || []) {
    if (!clusterIds.has(ev.cluster)) put(e, `calendar.${ev.id}.cluster 알 수 없음`);
    if (!/^https:\/\//.test(ev.sourceUrl || "")) put(e, `calendar.${ev.id}.sourceUrl`);
    if (!ev.basis || !ev.verifiedAt) put(e, `calendar.${ev.id} basis/verifiedAt 없음`);
    if (ev.recurrence === "yearly" && !(/^\d{2}-\d{2}$/.test(ev.start) && /^\d{2}-\d{2}$/.test(ev.end))) put(e, `calendar.${ev.id} yearly 는 MM-DD`);
    if (ev.recurrence === "once" && !/^\d{4}-\d{2}-\d{2}$/.test(ev.start)) put(e, `calendar.${ev.id} once 는 YYYY-MM-DD`);
    if (ev.recurrence === "dates" && !(Array.isArray(ev.dates) && ev.dates.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)))) put(e, `calendar.${ev.id} dates 형식`);
    if (!["yearly", "once", "dates"].includes(ev.recurrence)) put(e, `calendar.${ev.id}.recurrence`);
  }
  return e;
}

const fixtureName = (s) => (s.kind === "lawdrf" ? "lawdrf.xml" : `${s.id}.${s.kind.startsWith("html") ? "html" : "xml"}`);

/** 고정 표본용 fetch — URL 을 fixtures 파일로 대응(robots 는 robots-<host>.txt, 없으면 404). */
export function fixtureFetch(sources, dir = FIXTURES_DIR) {
  const byUrl = new Map(sources.filter((s) => s.kind !== "lawdrf").map((s) => [s.url, fixtureName(s)]));
  return async (url) => {
    const u = new URL(url);
    let file = null;
    let type = "application/xml; charset=utf-8";
    if (u.pathname === "/robots.txt") {
      file = `robots-${u.hostname}.txt`;
      type = "text/plain; charset=utf-8";
    } else if (`${u.origin}${u.pathname}` === LAW_DRF_ENDPOINT) file = "lawdrf.xml";
    else file = byUrl.get(url) || null;
    if (file && file.endsWith(".html")) type = "text/html; charset=utf-8";
    if (!file || !existsSync(join(dir, file))) return new Response("not found", { status: 404, headers: { "content-type": "text/plain" } });
    return new Response(readFileSync(join(dir, file)), { status: 200, headers: { "content-type": type } });
  };
}

const sha1 = (s) => createHash("sha1").update(s).digest("hex");

function normalizedLink(link) {
  try {
    const u = new URL(link);
    u.hash = "";
    return u.href.replace(/\/$/, "");
  } catch {
    return String(link);
  }
}

function errText(err) {
  return redactUrl(`${err && err.name ? err.name : "Error"}: ${err && err.message ? err.message : String(err)}`);
}

async function fetchSource(src, http) {
  const t0 = performance.now();
  const status = { id: src.id, ok: false, items: 0, ms: 0 };
  let parsed = null;
  try {
    const robots = await isAllowed(src.url, { http });
    if (!robots.allowed) {
      status.error = `robots 차단(${robots.rule})`;
    } else {
      const res = await http.get(src.url, { maxBytes: src.maxBytes });
      if (res.status !== 200) status.error = `HTTP ${res.status}`;
      else {
        if (src.kind === "rss") parsed = { items: parseRss(res.text) };
        else if (src.kind === "html-nts") parsed = { items: parseNtsList(res.text) };
        else if (src.kind === "html-moel") parsed = { items: parseMoelList(res.text) };
        else if (src.kind === "gtrends") parsed = parseGtrends(res.text);
        status.items = parsed.items.length;
        if (status.items > 0) status.ok = true;
        else status.error = "항목 0건(목록 형식 변경 의심)";
      }
    }
  } catch (err) {
    status.error = errText(err);
  }
  status.ms = Math.round(performance.now() - t0);
  return { status, parsed };
}

/**
 * 목록 항목 1건 → 후보(금융 주제가 아니면 null).
 * @param {{title: string, link: string, publishedAt: string|null, src: {id: string, ministry: string, defaultKind: string}}} it
 * @param {Object} ctx
 * @param {ReturnType<typeof compileClusters>} ctx.compiled
 * @param {any[]} ctx.events
 * @param {number} ctx.nowMs
 * @param {string} ctx.date
 * @param {Set<string>} ctx.trendClusters
 * @param {ReturnType<typeof loadSiteIndex>} ctx.siteIndex
 * @param {{get: Function}} [ctx.http] robots 캐시 조회용(없으면 linkRobots=unknown)
 */
export async function buildCandidate(it, { compiled, events, nowMs, date, trendClusters, siteIndex, http }) {
  const cls = classifyTitle(it.title, compiled, { ministry: it.src.ministry });
  if (!cls.allowed) return null;
  const cluster = cls.cluster ? clusterById(compiled, cls.cluster) : null;
  const kind = detectKind(it.title, it.src.defaultKind, compiled);
  const ageH = ageHours(it.publishedAt, nowMs);
  const calendarHit = cluster ? Boolean(calendarMatch(cluster.id, it.publishedAt ? kstDate(it.publishedAt) : date, events)) : false;
  const trendsHit = cluster ? trendClusters.has(cluster.id) : false;
  const { score, parts } = scoreCandidate(
    { kind, ageH, demandWeight: cluster ? cluster.demandWeight : 0, calendarHit, trendsHit },
    compiled.kindPoints,
  );
  const matches = topMatches(it.title, siteIndex, 3);
  const g0 = matches.guides[0];
  const p0 = matches.pages[0];
  let bestOverlap = null;
  if (g0) bestOverlap = { title: g0.title, score: g0.score, where: "가이드" };
  if (p0 && (!bestOverlap || p0.score > bestOverlap.score)) bestOverlap = { title: p0.title, score: p0.score, where: "페이지" };
  const robots = http ? await isAllowedCached(it.link, { http }).catch(() => null) : null;
  const linkRobots = robots === null ? "unknown" : robots.allowed ? "allowed" : "disallowed";
  const hubRoutes = cluster ? [...cluster.hubRoutes] : [];
  const briefEligible = cluster ? cluster.briefEligible : false;
  const rec = recommend({
    cluster: cls.cluster,
    denied: cls.denied,
    kind,
    score,
    ageH,
    briefEligible,
    canonical: cls.canonical,
    hubRoutes,
    bestOverlap,
    title: it.title,
    publishedAt: it.publishedAt,
    linkRobots,
  });
  return {
    id: sha1(normalizedLink(it.link)),
    src: it.src.id,
    ministry: it.src.ministry,
    sourceKind: kind,
    title: it.title,
    link: it.link,
    publishedAt: it.publishedAt,
    cluster: cls.cluster,
    briefEligible,
    score,
    scoreParts: parts,
    matches,
    hubRoutes,
    recommendation: rec.recommendation,
    reason: rec.reason,
    linkRobots,
  };
}

/**
 * 레이더 1회 실행.
 * @param {Object} o
 * @param {'fixtures'|'live'} o.mode
 * @param {string|null} [o.today]
 * @param {string} [o.outDir]
 * @param {number} [o.maxRequests]
 * @param {Record<string, string|undefined>} [o.env]
 * @param {typeof fetch} [o.fetchImpl]
 * @param {(line: string) => void} [o.log]
 * @param {string} [o.repoRoot]
 * @param {boolean} [o.write]
 */
export async function runRadar({
  mode,
  today = null,
  outDir = DEFAULT_OUT,
  maxRequests = 20,
  env = process.env,
  fetchImpl,
  log = (l) => console.log(l),
  repoRoot = REPO_ROOT,
  write = true,
} = {}) {
  const t0 = performance.now();
  const cfg = loadConfig();
  const cfgErrors = validateConfig(cfg, repoRoot);
  if (cfgErrors.length) {
    for (const e of cfgErrors) log(`[radar] 설정 오류: ${e}`);
    return { exitCode: 1, radar: null, headlines: null, files: null, configErrors: cfgErrors };
  }
  const compiled = compileClusters(cfg.clusters);
  const events = cfg.calendar.events;
  const siteIndex = loadSiteIndex(repoRoot);
  const nowMs = today ? Date.parse(`${today}T09:00:00+09:00`) : Date.now();
  const date = today || kstDate(nowMs);
  const http = createHttp({
    fetchImpl: fetchImpl || (mode === "fixtures" ? fixtureFetch(cfg.sources) : globalThis.fetch),
    maxRequests,
    perHostGapMs: mode === "fixtures" ? 0 : 1000,
    log,
    allowHosts: [...new Set(cfg.sources.map((s) => s.host))],
  });

  const official = cfg.sources.filter((s) => s.kind !== "gtrends" && s.kind !== "lawdrf");
  const gtrendsSrc = cfg.sources.find((s) => s.kind === "gtrends");
  const sourceStatus = [];
  const raw = [];
  for (const src of official) {
    const { status, parsed } = await fetchSource(src, http);
    put(sourceStatus, status);
    if (parsed) for (const it of parsed.items) put(raw, { ...it, src });
  }

  // 법령 공포 감시(선택). 고정 표본 모드는 가짜 식별자로 fixtures/lawdrf.xml 만 읽는다.
  const law = await runLawDrf({ http, env: mode === "fixtures" ? { LAW_OC: "FIXTURE" } : env, today: date, siteIndex });
  const lawStatus = { id: "lawdrf", ok: law.status === "ok", items: law.rows, ms: law.ms };
  if (law.status === "skipped") Object.assign(lawStatus, { skipped: true, note: law.note });
  else if (law.status === "error") lawStatus.error = law.note;
  else lawStatus.note = law.note;
  log(`[radar] lawdrf: ${law.note}`);

  // 구글 트렌드 — 부스트·헤드라인 전용(제목은 보고서·후보에 넣지 않음)
  let trendTitles = [];
  let newsTitles = [];
  if (gtrendsSrc) {
    const { status, parsed } = await fetchSource(gtrendsSrc, http);
    put(sourceStatus, status);
    if (parsed) {
      trendTitles = parsed.items.map((x) => x.title);
      newsTitles = parsed.newsTitles || [];
    }
  }
  put(sourceStatus, lawStatus);
  const tf = trendsFinance(trendTitles, compiled);

  const byId = new Map();
  const ctx = { compiled, events, nowMs, date, trendClusters: tf.clusters, siteIndex, http };
  for (const it of raw) {
    const c = await buildCandidate(it, ctx);
    if (c && !byId.has(c.id)) byId.set(c.id, c);
  }
  const candidates = [...byId.values()].sort(
    (a, b) =>
      REC_ORDER[a.recommendation] - REC_ORDER[b.recommendation] ||
      b.score - a.score ||
      String(b.publishedAt).localeCompare(String(a.publishedAt)) ||
      a.id.localeCompare(b.id),
  );

  const mem = process.memoryUsage();
  const radar = {
    generatedAt: today ? `${today}T09:00:00+09:00` : toKstIso(nowMs),
    mode,
    date,
    sources: sourceStatus,
    candidates,
    calendarUpcoming: upcomingEvents(date, events, 14),
    nextEvent: nextEvent(date, events),
    trends: { items: trendTitles.length, financeMatches: tf.count, clusters: [...tf.clusters].sort() },
    statutes: law.items,
    lawdrf: { status: law.status, note: law.note },
    cost: {
      ms: Math.round(performance.now() - t0),
      rssMB: Math.round((mem.rss / 1048576) * 10) / 10,
      heapMB: Math.round((mem.heapUsed / 1048576) * 10) / 10,
      requests: http.stats.requests,
      bytes: http.stats.bytes,
    },
  };
  const schemaErrors = validateRadar(radar);
  if (schemaErrors.length) {
    for (const e of schemaErrors) log(`[radar] 스키마 오류: ${e}`);
    return { exitCode: 1, radar, headlines: null, files: null, schemaErrors };
  }
  const headlines = { date, titles: [...new Set([...trendTitles, ...newsTitles])] };
  let files = null;
  let pruned = [];
  if (write) ({ files, pruned } = writeOutputs(outDir, radar, headlines));

  const fetched = sourceStatus.filter((s) => !s.skipped);
  const okCount = fetched.filter((s) => s.ok).length;
  const count = (r) => candidates.filter((c) => c.recommendation === r).length;
  log(
    `[radar] 완료 mode=${mode} date=${date} 소스 ${okCount}/${fetched.length} 정상 · 후보 ${candidates.length}` +
      ` (새 글 ${count("new-brief")} · 갱신 ${count("update-existing")} · 관찰 ${count("watch")} · 제외 ${count("ignore")})` +
      ` · 트렌드 금융 ${tf.count}/${trendTitles.length}`,
  );
  log(`[radar] cost ms=${radar.cost.ms} requests=${radar.cost.requests} bytes=${radar.cost.bytes} rssMB=${radar.cost.rssMB} heapMB=${radar.cost.heapMB}`);
  if (files) log(`[radar] 출력 ${files.json} · ${files.md} · ${files.headlines}${pruned.length ? ` (헤드라인 정리 ${pruned.length}건)` : ""}`);
  return { exitCode: okCount === 0 ? 1 : 0, radar, headlines, files };
}

/** --check-robots: 소스 경로별 허용/차단 */
export async function checkRobots({ mode = "live", fetchImpl, log = (l) => console.log(l) } = {}) {
  const cfg = loadConfig();
  const http = createHttp({
    fetchImpl: fetchImpl || (mode === "fixtures" ? fixtureFetch(cfg.sources) : globalThis.fetch),
    perHostGapMs: mode === "fixtures" ? 0 : 1000,
    maxRequests: 20,
    log: () => {},
    allowHosts: [...new Set(cfg.sources.map((s) => s.host))],
  });
  const rows = [];
  for (const s of cfg.sources) {
    const target = s.kind === "lawdrf" ? LAW_DRF_ENDPOINT : s.url;
    const r = await isAllowed(target, { http });
    const u = new URL(target);
    put(rows, { id: s.id, allowed: r.allowed, rule: r.rule, target: `${u.host}${u.pathname}${u.search}` });
    log(`${r.allowed ? "allowed   " : "disallowed"} ${s.id.padEnd(13)} ${u.host}${u.pathname}${u.search}  (${r.rule})`);
  }
  log(`[radar] robots 확인 ${rows.filter((r) => r.allowed).length}/${rows.length} 허용 · 요청 ${http.stats.requests}회`);
  return { rows, exitCode: rows.every((r) => r.allowed) ? 0 : 1 };
}

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    if (err instanceof UsageError) {
      console.error(`[radar] ${err.message}\n${USAGE}`);
      process.exit(2);
    }
    throw err;
  }
  if (opts.help) {
    console.log(USAGE);
    process.exit(0);
  }
  if (opts.mode === "fixtures") {
    // 고정 표본 모드는 네트워크를 절대 쓰지 않는다 — 전역 fetch 를 막아 실수로라도 나가지 못하게.
    globalThis.fetch = () => {
      throw new Error("fixtures 모드에서는 네트워크를 쓰지 않습니다");
    };
  }
  if (opts.checkRobots) {
    const { exitCode } = await checkRobots({ mode: opts.mode });
    process.exit(exitCode);
  }
  const { exitCode } = await runRadar({ mode: opts.mode, today: opts.today, outDir: opts.out, maxRequests: opts.maxRequests });
  process.exit(exitCode);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((err) => {
    console.error(`[radar] 예기치 않은 오류: ${errText(err)}`);
    process.exit(1);
  });
}
