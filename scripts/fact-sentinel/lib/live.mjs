// scripts/fact-sentinel/lib/live.mjs
// 한국은행 기준금리 공식값 확인(실행당 요청 최대 2회).
// 순서: ① ECOS Open API(환경변수 ECOS_API_KEY 가 있을 때만, 키는 URL 경로에 들어가므로 로그·보고서에서 가림)
//       ② 키 없이 한국은행 누리집 기준금리 추이 표(robots 확인 — /portal/ 허용 — 뒤 GET 1회, 표 첫 행 파싱)
//       ③ 둘 다 실패하면 저장소 정합성 검사만 하고 보고서에 사유를 남긴다.
// HTTP·robots 는 trend-radar 공용 모듈(../../trend-radar/lib/http.mjs·robots.mjs)을 동적 import 해 쓴다.
// 그 모듈이 아직 없는 브랜치(병합 전)에서는 아래 최소 내장 구현으로 대신한다 — 동작 규칙은 같다
// (순차·요청 상한·https 전용 키 URL·응답 크기 상한·리다이렉트 3회·경로 가림 로그).
// 테스트는 http·isAllowed 를 가짜로 주입한다(네트워크 없음).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export const BOK_PORTAL_URL = "https://www.bok.or.kr/portal/singl/baseRate/list.do?dataSeCd=01&menuNo=200643";
export const BOK_ROBOTS_URL = "https://www.bok.or.kr/robots.txt";
export const ECOS_API_BASE = "https://ecos.bok.or.kr/api/StatisticSearch/";
export const LIVE_HOSTS = ["ecos.bok.or.kr", "www.bok.or.kr"];
export const MAX_REQUESTS = 2;
export const ECOS_LOOKBACK_DAYS = 90;
/** 일별(D) 계열은 주말도 행이 있어 90일 창이면 91행 — 60행 페이지면 최신일이 잘린다. 그래서 100행. */
export const ECOS_ROWS = 100;
export const ROBOTS_CACHE_DAYS = 7;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) moneysalary-radar/1.0 (+https://www.moneysalary.com/about)";
const UA_TOKEN = "moneysalary-radar";

const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
const isoOf = (compact) => `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;

/** ECOS 인증키 형식(영숫자 16~64자). 형식이 다르면 요청하지 않는다(경로 주입 방지). */
export function validEcosKey(key) {
  return typeof key === "string" && /^[A-Za-z0-9]{16,64}$/.test(key);
}

export function ecosUrl(key, todayIso, ecos) {
  const end = new Date(`${todayIso}T00:00:00Z`);
  const start = new Date(end.getTime() - ECOS_LOOKBACK_DAYS * 86400000);
  return `${ECOS_API_BASE}${encodeURIComponent(key)}/json/kr/1/${ECOS_ROWS}/${ecos.stat}/${ecos.cycle}/${ymd(start)}/${ymd(end)}/${ecos.item}`;
}

/** 경로 속 ECOS 키와 키 성격 쿼리 값을 *** 로. */
export function redactUrl(url) {
  return String(url ?? "")
    .replace(/(ecos\.bok\.or\.kr\/api\/[A-Za-z]+\/)[^/?#\s]+/g, "$1***")
    .replace(/([?&](?:OC|key|auth|authKey|serviceKey|crtfc_key)=)[^&#\s]*/gi, "$1***");
}

/** 보고서·로그로 나가는 문자열에서 키 원문을 한 번 더 지운다(안전망). */
export function scrub(text, secret) {
  const s = String(text ?? "");
  if (!secret || secret.length < 4) return redactUrl(s);
  return redactUrl(s.split(secret).join("***").split(encodeURIComponent(secret)).join("***"));
}

/**
 * ECOS StatisticSearch 응답 → 최신값·변경일.
 * @returns {{ok: boolean, value?: string, since?: string|null, sinceBefore?: string, latestDate?: string, reason?: string}}
 */
export function parseEcos(json, ecos = { stat: "722Y001", item: "0101000" }) {
  let data = json;
  if (typeof json === "string") {
    try {
      data = JSON.parse(json);
    } catch {
      return { ok: false, reason: "ECOS 응답 JSON 파싱 실패" };
    }
  }
  if (data && data.RESULT) {
    return { ok: false, reason: `ECOS 오류 ${String(data.RESULT.CODE || "?").slice(0, 20)}` };
  }
  const box = data && data.StatisticSearch;
  const rows = box && Array.isArray(box.row) ? box.row : null;
  if (!rows || !rows.length) return { ok: false, reason: "ECOS 응답에 행 없음" };
  if (Number(box.list_total_count) > rows.length) {
    return { ok: false, reason: `ECOS 응답 잘림(${rows.length}/${box.list_total_count}행)` };
  }
  const clean = rows
    .filter((r) => r && r.STAT_CODE === ecos.stat && r.ITEM_CODE1 === ecos.item && /^\d{8}$/.test(String(r.TIME)))
    .map((r) => ({ time: String(r.TIME), value: Number(r.DATA_VALUE) }))
    .filter((r) => Number.isFinite(r.value))
    .sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));
  if (!clean.length) return { ok: false, reason: "ECOS 응답에 기준금리(722Y001/0101000) 일별 행 없음" };
  const last = clean[clean.length - 1];
  let k = clean.length - 1;
  while (k > 0 && clean[k - 1].value === last.value) k -= 1;
  const out = { ok: true, value: last.value.toFixed(2), latestDate: isoOf(last.time) };
  if (k === 0) {
    out.since = null;
    out.sinceBefore = isoOf(clean[0].time);
  } else out.since = isoOf(clean[k].time);
  return out;
}

/** 한국은행 누리집 '기준금리 추이' 표 → 가장 최근 행. */
export function parseBokPortal(html) {
  const s = String(html || "");
  const table = /<table[\s\S]*?<\/table>/i.exec(s);
  if (!table) return { ok: false, reason: "BOK 표(<table>) 없음" };
  const t = table[0];
  if (!/기준금리/.test(t)) return { ok: false, reason: "BOK 표 머리에 '기준금리' 없음(구조 변경)" };
  const rows = [];
  const re = /<tr[^>]*>\s*<td[^>]*>\s*(\d{4})\s*<\/td>\s*<td[^>]*>\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일\s*<\/td>\s*<td[^>]*>\s*(\d{1,2}(?:\.\d{1,2})?)\s*<\/td>/g;
  for (const m of t.matchAll(re)) {
    rows[rows.length] = { date: `${m[1]}-${pad(Number(m[2]))}-${pad(Number(m[3]))}`, value: Number(m[4]) };
  }
  if (!rows.length) return { ok: false, reason: "BOK 표 행 파싱 실패(구조 변경)" };
  rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return { ok: true, value: rows[0].value.toFixed(2), since: rows[0].date, rows: rows.slice(0, 5) };
}

// ── 최소 내장 HTTP·robots (trend-radar 병합 전 단독 실행용) ──

export function createBuiltinHttp({
  fetchImpl = globalThis.fetch,
  maxRequests = MAX_REQUESTS,
  allowHosts = LIVE_HOSTS,
  maxBytesDefault = 2 * 1024 * 1024,
  log = (line) => console.error(line),
} = {}) {
  const stats = { requests: 0, bytes: 0, byHost: {} };
  let tail = Promise.resolve();
  const carriesKey = (u) => u.hostname === "ecos.bok.or.kr" && /^\/api\/[A-Za-z]+\/[^/]+/.test(u.pathname);
  async function once(url, maxBytes, accept) {
    if (stats.requests >= maxRequests) {
      const e = new Error(`요청 상한 ${maxRequests}회 초과`);
      e.name = "CapError";
      throw e;
    }
    const u = new URL(url);
    if (allowHosts && !allowHosts.includes(u.hostname)) throw new Error(`허용 목록에 없는 호스트: ${u.hostname}`);
    if (carriesKey(u) && u.protocol !== "https:") throw new Error("키가 든 URL 은 https 로만 요청");
    stats.requests += 1;
    stats.byHost[u.host] = (stats.byHost[u.host] || 0) + 1;
    const t0 = Date.now();
    const res = await fetchImpl(url, {
      method: "GET",
      redirect: "manual",
      headers: { "user-agent": UA, accept: accept || "text/html, application/json;q=0.9, */*;q=0.5", "accept-language": "ko-KR,ko;q=0.9" },
      signal: AbortSignal.timeout(20000),
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      log(`[sentinel] GET ${redactUrl(url).replace(/^https?:\/\//, "")} ${res.status} 0 ${Date.now() - t0}`);
      return { redirect: new URL(res.headers.get("location"), url).href };
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength > maxBytes) {
      const e = new Error(`응답이 ${maxBytes} 바이트 상한 초과`);
      e.name = "SizeError";
      throw e;
    }
    stats.bytes += buf.byteLength;
    log(`[sentinel] GET ${redactUrl(url).replace(/^https?:\/\//, "")} ${res.status} ${buf.byteLength} ${Date.now() - t0}`);
    const ct = res.headers.get("content-type") || "";
    const cs = (/charset\s*=\s*["']?([\w-]+)/i.exec(ct) || [])[1] || "utf-8";
    let text;
    try {
      text = new TextDecoder(cs).decode(buf);
    } catch {
      text = new TextDecoder("utf-8").decode(buf);
    }
    return { status: res.status, text, bytes: buf.byteLength, finalUrl: url };
  }
  async function run(url, { maxBytes = maxBytesDefault, accept } = {}) {
    let current = url;
    for (let hop = 0; hop <= 3; hop += 1) {
      const r = await once(current, maxBytes, accept);
      if (!r.redirect) return r;
      current = r.redirect;
    }
    throw new Error("리다이렉트 3회 초과");
  }
  return {
    get(url, opts) {
      const p = tail.then(() => run(url, opts));
      tail = p.catch(() => undefined);
      return p;
    },
    stats,
  };
}

function robotsRules(text, token = UA_TOKEN) {
  const groups = [];
  let cur = null;
  let lastAgent = false;
  for (const raw of String(text || "").split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    const i = line.indexOf(":");
    if (!line || i < 0) continue;
    const key = line.slice(0, i).trim().toLowerCase();
    const value = line.slice(i + 1).trim();
    if (key === "user-agent") {
      if (!cur || !lastAgent) {
        cur = { agents: [], rules: [] };
        groups[groups.length] = cur;
      }
      cur.agents[cur.agents.length] = value.toLowerCase();
      lastAgent = true;
    } else if (key === "allow" || key === "disallow") {
      lastAgent = false;
      if (cur && !(key === "disallow" && value === "")) cur.rules[cur.rules.length] = { allow: key === "allow", pattern: value };
    } else lastAgent = false;
  }
  const exact = groups.filter((g) => g.agents.includes(token));
  return (exact.length ? exact : groups.filter((g) => g.agents.includes("*"))).flatMap((g) => g.rules);
}

function robotsEvaluate(rules, path) {
  let best = null;
  for (const r of rules) {
    let p = r.pattern;
    const anchored = p.endsWith("$");
    if (anchored) p = p.slice(0, -1);
    const re = new RegExp(`^${p.split("*").map((x) => x.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*")}${anchored ? "$" : ""}`);
    if (!re.test(path)) continue;
    if (!best || r.pattern.length > best.pattern.length || (r.pattern.length === best.pattern.length && r.allow)) best = r;
  }
  if (!best) return { allowed: true, rule: "(일치 규칙 없음)" };
  return { allowed: best.allow, rule: `${best.allow ? "Allow" : "Disallow"}: ${best.pattern}` };
}

const builtinRobotsCache = new WeakMap();
export async function builtinIsAllowed(url, { http }) {
  const u = new URL(url);
  let per = builtinRobotsCache.get(http);
  if (!per) {
    per = new Map();
    builtinRobotsCache.set(http, per);
  }
  if (!per.has(u.origin)) {
    per.set(
      u.origin,
      http.get(`${u.origin}/robots.txt`, { maxBytes: 512 * 1024, accept: "text/plain, */*;q=0.5" }).then(
        (r) => (r.status === 200 ? { rules: robotsRules(r.text) } : r.status === 404 ? { all: true } : { none: `robots.txt HTTP ${r.status}` }),
        (e) => ({ none: `robots.txt 조회 실패(${e && e.name ? e.name : "Error"})` })
      )
    );
  }
  const got = await per.get(u.origin);
  if (got.all) return { allowed: true, rule: "robots.txt 404(규칙 없음)" };
  if (got.none) return { allowed: false, rule: `${got.none} — 보수적으로 차단` };
  return robotsEvaluate(got.rules, u.pathname + u.search);
}

/** trend-radar 공용 모듈 우선, 없으면(병합 전) 내장 구현. 모듈이 있는데 깨졌으면 그 오류를 그대로 알린다. */
export async function loadNetDeps() {
  try {
    const http = await import("../../trend-radar/lib/http.mjs");
    const robots = await import("../../trend-radar/lib/robots.mjs");
    if (typeof http.createHttp !== "function" || typeof robots.isAllowed !== "function") {
      throw new Error("trend-radar 모듈 계약 불일치(createHttp·isAllowed)");
    }
    return { createHttp: http.createHttp, isAllowed: robots.isAllowed, impl: "trend-radar" };
  } catch (err) {
    // '모듈 자체가 없음'일 때만 내장 구현으로. 모듈 안의 다른 import 가 깨진 경우는 그대로 알린다.
    const missing = err && err.code === "ERR_MODULE_NOT_FOUND" ? String(err.url || err.message) : "";
    if (/trend-radar[\\/]lib[\\/](?:http|robots)\.mjs/.test(missing)) {
      return { createHttp: createBuiltinHttp, isAllowed: builtinIsAllowed, impl: "builtin" };
    }
    throw err;
  }
}

// ── robots.txt 디스크 캐시(7일) — 키 있는 실행에서 ECOS 가 실패해도 남은 1회로 누리집 폴백이 가능하게 ──

function readRobotsCache(file, nowMs) {
  if (!file) return null;
  try {
    const j = JSON.parse(readFileSync(file, "utf8"));
    if (typeof j.text !== "string" || typeof j.fetchedAt !== "string") return null;
    const age = nowMs - Date.parse(j.fetchedAt);
    if (!(age >= 0 && age < ROBOTS_CACHE_DAYS * 86400000)) return null;
    return j;
  } catch {
    return null;
  }
}

function writeRobotsCache(file, status, text, nowMs) {
  if (!file) return;
  try {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify({ url: BOK_ROBOTS_URL, status, fetchedAt: new Date(nowMs).toISOString(), text }, null, 1));
  } catch {
    /* 캐시는 선택 사항 */
  }
}

/** BOK robots.txt 만 디스크 캐시를 거치는 http 래퍼. 캐시 적중은 요청 수에 들어가지 않는다. */
export function withRobotsCache(http, cacheFile, nowMs) {
  const cached = readRobotsCache(cacheFile, nowMs);
  return {
    cachedRobots: Boolean(cached),
    stats: http.stats,
    async get(url, opts) {
      if (url === BOK_ROBOTS_URL && cached) {
        return { status: cached.status, text: cached.text, bytes: 0, ms: 0, finalUrl: url, fromCache: true };
      }
      const r = await http.get(url, opts);
      if (url === BOK_ROBOTS_URL && (r.status === 200 || r.status === 404)) writeRobotsCache(cacheFile, r.status, r.text, nowMs);
      return r;
    },
  };
}

/**
 * 기준금리 라이브 확인.
 * @param {object} p
 * @param {object} p.fact facts.json 의 bok-base-rate 항목(원형)
 * @param {Record<string,string|undefined>} p.env
 * @param {string} p.today YYYY-MM-DD
 * @param {{get: Function, stats: {requests: number}}} p.http 요청 상한 2 로 만든 http
 * @param {Function} p.isAllowed robots 판정(url, {http}) → {allowed, rule}
 * @param {string} [p.robotsCacheFile]
 * @param {number} [p.nowMs]
 */
export async function checkBaseRate({ fact, env = {}, today, http, isAllowed, robotsCacheFile = null, nowMs = Date.now() }) {
  const key = env.ECOS_API_KEY;
  const attempts = [];
  const h = withRobotsCache(http, robotsCacheFile, nowMs);
  const budget = () => MAX_REQUESTS - (h.stats ? h.stats.requests : 0);
  let result = null;

  if (key !== undefined && key !== "") {
    if (!validEcosKey(key)) {
      attempts[attempts.length] = { method: "ecos", reason: "ECOS_API_KEY 형식 오류(영숫자 16~64자) — 값은 기록하지 않음" };
    } else {
      const url = ecosUrl(key, today, fact.ecos);
      try {
        const r = await h.get(url, { maxBytes: 256 * 1024, accept: "application/json" });
        if (r.status !== 200) attempts[attempts.length] = { method: "ecos", reason: `ECOS HTTP ${r.status}` };
        else {
          const p = parseEcos(r.text, fact.ecos);
          if (p.ok) result = { method: "ecos", value: p.value, since: p.since, sinceBefore: p.sinceBefore, latestDate: p.latestDate, url: redactUrl(url) };
          else attempts[attempts.length] = { method: "ecos", reason: p.reason };
        }
      } catch (err) {
        attempts[attempts.length] = { method: "ecos", reason: scrub(`ECOS 요청 실패(${err && err.name ? err.name : "Error"})`, key) };
      }
      // 성공했고 robots 캐시가 없으면 남은 1회로 캐시를 데운다(다음 실행의 폴백 대비, 주 1회 수준).
      if (result && !h.cachedRobots && budget() >= 1) {
        try {
          await isAllowed(BOK_PORTAL_URL, { http: h });
        } catch {
          /* 선택 사항 */
        }
      }
    }
  }

  if (!result) {
    const need = h.cachedRobots ? 1 : 2;
    if (budget() < need) {
      attempts[attempts.length] = { method: "bok-portal", reason: `요청 상한 ${MAX_REQUESTS}회 — 누리집 폴백에 ${need}회 필요, 남은 ${budget()}회` };
    } else {
      let verdict;
      try {
        verdict = await isAllowed(BOK_PORTAL_URL, { http: h });
      } catch (err) {
        verdict = { allowed: false, rule: `robots 판정 오류(${err && err.name ? err.name : "Error"})` };
      }
      if (!verdict.allowed) {
        attempts[attempts.length] = { method: "bok-portal", reason: `robots 차단: ${verdict.rule}` };
      } else {
        try {
          const r = await h.get(BOK_PORTAL_URL, { maxBytes: 2 * 1024 * 1024, accept: "text/html" });
          if (r.status !== 200) attempts[attempts.length] = { method: "bok-portal", reason: `BOK HTTP ${r.status}` };
          else {
            const p = parseBokPortal(r.text);
            if (p.ok) result = { method: "bok-portal", value: p.value, since: p.since, url: BOK_PORTAL_URL, robots: verdict.rule };
            else attempts[attempts.length] = { method: "bok-portal", reason: `파싱 실패: ${p.reason}` };
          }
        } catch (err) {
          attempts[attempts.length] = { method: "bok-portal", reason: `BOK 요청 실패(${err && err.name ? err.name : "Error"})` };
        }
      }
    }
  }

  const requests = h.stats ? h.stats.requests : 0;
  const clean = attempts.map((a) => ({ method: a.method, reason: scrub(a.reason, key) }));
  if (!result) {
    return { method: "none", value: null, since: null, ok: null, requests, attempts: clean, reason: clean.map((a) => `${a.method}: ${a.reason}`).join(" / ") || "시도 없음" };
  }
  const ok = result.value === Number(fact.current).toFixed(2);
  const sinceOk = result.since ? result.since === fact.since : result.sinceBefore ? fact.since < result.sinceBefore : null;
  return { ...result, url: scrub(result.url, key), ok, sinceOk, requests, attempts: clean };
}
