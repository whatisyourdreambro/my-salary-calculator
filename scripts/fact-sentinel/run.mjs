#!/usr/bin/env node
// scripts/fact-sentinel/run.mjs — 공식 수치 감시기(fact sentinel). 보고 전용: 사이트 파일을 절대 수정하지 않는다.
//
// 사용:
//   node scripts/fact-sentinel/run.mjs [--fixtures | --live] [--today YYYY-MM-DD] [--out <dir>]
//        [--owners <목록파일>...] [--strict]
//   (옵션 없음 = 오프라인: 저장소 스캔만, 네트워크 0회)
//   --fixtures  픽스처 저장소(fixtures/repo)와 픽스처 응답으로 실행(네트워크 0회)
//   --live      한국은행 기준금리 공식값 확인(요청 최대 2회: ECOS 키가 있으면 ECOS, 없거나 실패하면 누리집 표)
//   --out       보고서 폴더(기본 scripts/fact-sentinel/.cache — .gitignore 대상. 매일 작업은 TREND_HOME/sentinel)
//   --owners    담당 힌트 목록 파일(한 줄에 경로 하나). 파일명에 guide → guides-workflow, oct → oct.
//   --strict    낡은 숫자(stale)가 하나라도 있으면 종료 코드 3
//   (테스트·점검용) --root <저장소> · --facts <facts.json> · --slots <refresh-slots.json>
// 종료 코드: 0 보고서 작성 · 1 설정/정본 파싱 오류 · 3 --strict 이고 stale 존재
// 예산: 30초·200MB 이내(초과 시 보고서 참고란에 기록).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CANONICAL_FILES, CanonicalError, ConfigError, readCanonical, resolveFacts } from "./lib/canonical.mjs";
import { applyBlockRule, classifyMention } from "./lib/classify.mjs";
import { checkBaseRate, loadNetDeps, LIVE_HOSTS, MAX_REQUESTS } from "./lib/live.mjs";
import { buildReport, computeRefreshDue, validateSlots } from "./lib/report.mjs";
import { createFileSource, findMentions, isScanTarget, loadOwners, mapRoute, pageDirs } from "./lib/scan.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(HERE, "..", "..");
export const FIXTURE_DIR = join(HERE, "fixtures");
const BUDGET_MS = 30000;
const BUDGET_MB = 200;

export function kstToday(nowMs = Date.now()) {
  return new Date(nowMs + 9 * 3600000).toISOString().slice(0, 10);
}

export function parseArgs(argv) {
  const o = { mode: "offline", owners: [], strict: false, today: null, out: null, root: null, facts: null, slots: null };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const val = () => {
      const v = argv[i + 1];
      if (v === undefined || v.startsWith("--")) throw new ConfigError(`${a} 값 없음`);
      i += 1;
      return v;
    };
    if (a === "--fixtures" || a === "--live") {
      const m = a.slice(2);
      if (o.mode !== "offline" && o.mode !== m) throw new ConfigError("--fixtures 와 --live 는 함께 쓸 수 없음");
      o.mode = m;
    } else if (a === "--strict") o.strict = true;
    else if (a === "--today") o.today = val();
    else if (a === "--out") o.out = val();
    else if (a === "--root") o.root = val();
    else if (a === "--facts") o.facts = val();
    else if (a === "--slots") o.slots = val();
    else if (a === "--owners") {
      let n = 0;
      while (argv[i + 1] !== undefined && !argv[i + 1].startsWith("--")) {
        o.owners[o.owners.length] = argv[i + 1];
        i += 1;
        n += 1;
      }
      if (!n) throw new ConfigError("--owners 값 없음");
    } else throw new ConfigError(`알 수 없는 옵션: ${a}`);
  }
  if (o.today && !/^\d{4}-\d{2}-\d{2}$/.test(o.today)) throw new ConfigError(`--today 형식 오류: ${o.today}`);
  return o;
}

function readJson(path, what) {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    throw new ConfigError(`${what} 읽기 실패: ${path}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new ConfigError(`${what} JSON 오류: ${path}`);
  }
}

/** 픽스처 모드용 가짜 fetch — 픽스처 파일로 응답(네트워크 0회). */
export function fixtureFetch(dir = FIXTURE_DIR) {
  const files = {
    "https://www.bok.or.kr/robots.txt": ["bok-robots.txt", "text/plain; charset=utf-8"],
    "https://www.bok.or.kr/portal/singl/baseRate/list.do?dataSeCd=01&menuNo=200643": ["bok-baserate.html", "text/html;charset=utf-8"],
  };
  return async (url) => {
    const hit = files[url];
    if (!hit) return new Response("not found", { status: 404, headers: { "content-type": "text/plain" } });
    return new Response(readFileSync(join(dir, hit[0])), { status: 200, headers: { "content-type": hit[1] } });
  };
}

export async function main(argv = process.argv.slice(2), { env = process.env, stdout = (s) => console.log(s), stderr = (s) => console.error(s), fetchImpl = null } = {}) {
  const t0 = Date.now();
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (err) {
    stderr(`[sentinel] ${err.message}`);
    return 1;
  }
  const today = opts.today || kstToday();
  const out = resolve(opts.out || join(HERE, ".cache"));
  const fixture = opts.mode === "fixtures";
  const root = resolve(opts.root || (fixture ? join(FIXTURE_DIR, "repo") : REPO_ROOT));
  const notes = [];

  let facts;
  let canonical;
  let slotsJson;
  let owners;
  let source;
  try {
    const factsJson = readJson(opts.facts || join(HERE, "facts.json"), "facts.json");
    slotsJson = readJson(opts.slots || join(HERE, "refresh-slots.json"), "refresh-slots.json");
    const slotErrs = validateSlots(slotsJson);
    if (slotErrs.length) throw new ConfigError(slotErrs.join(" / "));
    source = createFileSource(root, { fixture });
    canonical = readCanonical((rel) => source.read(rel));
    facts = resolveFacts(factsJson, canonical, today);
    try {
      owners = loadOwners(opts.owners);
    } catch (err) {
      throw new ConfigError(`--owners 목록 읽기 실패(${err && err.code ? err.code : "오류"})`);
    }
  } catch (err) {
    if (err instanceof ConfigError || err instanceof CanonicalError) {
      stderr(`[sentinel] ${err.message}`);
      return 1;
    }
    throw err;
  }

  // ── 저장소 스캔 ──
  const all = source.list();
  const pages = pageDirs(all);
  const excluded = new Set(Object.values(CANONICAL_FILES));
  const targets = all.filter((rel) => isScanTarget(rel, excluded));
  const byId = new Map(facts.map((f) => [f.id, f]));
  const findings = [];
  let bytes = 0;
  for (const rel of targets) {
    const text = source.read(rel);
    bytes += text.length;
    const { mentions, lines } = findMentions({ text, facts });
    if (!mentions.length) continue;
    const fileFindings = mentions.map((m) => {
      const c = classifyMention(m, byId.get(m.factId));
      return {
        file: rel,
        line: m.line,
        route: mapRoute(rel, { pages, lines, line: m.line }),
        owner: owners.get(rel) || null,
        factId: m.factId,
        value: m.value,
        found: m.found,
        class: c.class,
        reasons: c.reasons,
        meta: m.meta,
        context: m.display,
      };
    });
    applyBlockRule(fileFindings, lines);
    for (const f of fileFindings) findings[findings.length] = f;
  }

  // ── 공식값 라이브 확인 ──
  let liveResult = null;
  let liveImpl = null;
  const bok = facts.find((f) => f.id === "bok-base-rate");
  if (bok && (opts.mode === "live" || fixture)) {
    try {
      const deps = await loadNetDeps();
      liveImpl = deps.impl;
      const http = deps.createHttp({
        fetchImpl: fetchImpl || (fixture ? fixtureFetch() : globalThis.fetch),
        maxRequests: MAX_REQUESTS,
        allowHosts: LIVE_HOSTS,
        log: (line) => stderr(String(line).replace("[radar]", "[sentinel]")),
      });
      liveResult = await checkBaseRate({
        fact: { ...bok, current: bok.current.raw, since: bok.current.since, ecos: bok.ecos },
        env: fixture ? {} : env,
        today,
        http,
        isAllowed: deps.isAllowed,
        robotsCacheFile: fixture ? null : join(out, "robots-bok.json"),
      });
      if (deps.impl === "builtin") notes[notes.length] = "HTTP·robots: 내장 최소 구현 사용(trend-radar 공용 모듈 병합 전).";
    } catch (err) {
      liveResult = { method: "none", value: null, ok: null, requests: 0, reason: `라이브 확인 오류(${err && err.name ? err.name : "Error"})`, attempts: [] };
    }
    if (liveResult.method === "none") notes[notes.length] = `공식값 확인 실패 → 저장소 정합성 검사만 수행: ${liveResult.reason}`;
  }

  // ── 갱신 슬롯 ──
  const readDoc = (rel) => source.read(rel);
  const refreshDue = computeRefreshDue(slotsJson.slots, today, readDoc);

  findings.sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : a.line - b.line));
  const mem = process.memoryUsage();
  const cost = {
    ms: Date.now() - t0,
    rssMB: Math.round(mem.rss / 1048576),
    heapMB: Math.round(mem.heapUsed / 1048576),
    files: targets.length,
    bytes,
    requests: liveResult ? liveResult.requests || 0 : 0,
  };
  if (cost.ms > BUDGET_MS) notes[notes.length] = `시간 예산 초과: ${cost.ms}ms > ${BUDGET_MS}ms`;
  if (cost.rssMB > BUDGET_MB) notes[notes.length] = `메모리 예산 초과: ${cost.rssMB}MB > ${BUDGET_MB}MB`;

  const { json, md } = buildReport({
    today,
    mode: opts.mode,
    generatedAt: new Date().toISOString(),
    facts,
    liveResult,
    liveImpl,
    canonical,
    findings,
    refreshDue,
    cost,
    notes,
  });
  mkdirSync(out, { recursive: true });
  const jsonPath = join(out, `sentinel-${today}.json`);
  const mdPath = join(out, `sentinel-${today}.md`);
  writeFileSync(jsonPath, JSON.stringify(json, null, 1) + "\n");
  writeFileSync(mdPath, md);
  for (const t of json.topLines) stdout(`[sentinel] ${t}`);
  stdout(`[sentinel] 낡음 ${json.counts.stale} · 확인 필요 ${json.counts.unknown} · 과거 서술 ${json.counts.historical} · 정상 ${json.counts.ok} · 갱신 슬롯 ${refreshDue.length} · ${cost.ms}ms ${cost.rssMB}MB`);
  stdout(`[sentinel] 보고서: ${mdPath}`);
  if (opts.strict && json.counts.stale > 0) return 3;
  return 0;
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().then(
    (code) => {
      process.exitCode = code;
    },
    (err) => {
      console.error(`[sentinel] 예기치 못한 오류: ${err && err.name ? err.name : "Error"} ${err && err.message ? err.message : ""}`);
      process.exitCode = 1;
    }
  );
}
