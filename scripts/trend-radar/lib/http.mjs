// scripts/trend-radar/lib/http.mjs
// 공용 HTTP 계약 — 트렌드 레이더·발행기(publisher)·감시기(sentinel)가 같이 쓴다.
// 원칙(2026-09-26 R5 설계):
//   · 요청은 한 번에 하나(순차) + 호스트별 최소 간격(perHostGapMs) — 공공기관 서버 부담 최소화.
//   · 실행당 요청 상한(maxRequests) — 넘으면 CapError. 재시도는 네트워크 오류일 때 1회만.
//   · 응답 본문은 스트리밍으로 읽다가 maxBytes 를 넘으면 즉시 중단(SizeError).
//   · 리다이렉트는 최대 3회(moef.go.kr → mofe.go.kr 같은 이전 도메인 대응), 각 홉도 요청 1회로 센다.
//   · 키가 든 URL(OC·key·auth·authKey·serviceKey·crtfc_key·ECOS 경로 키)은 https 가 아니면 거부.
//   · 로그는 '[radar] GET host/path status bytes ms' 한 줄. 경로는 redactUrl 을 거치고
//     헤더·본문은 절대 찍지 않는다.
// 의존성 없음(Node 22 내장 fetch/TextDecoder/AbortSignal.timeout).

// 배열 뒤에 붙이기(발행기 외 트렌드 스크립트에는 배열 메서드 이름까지 포함해 '푸시' 문자열을 두지 않는다 — trend-publish 게이트).
const put = (arr, ...vals) => {
  for (const v of vals) arr[arr.length] = v;
  return arr.length;
};

export const RADAR_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) moneysalary-radar/1.0 (+https://www.moneysalary.com/about)";
export const RADAR_UA_TOKEN = "moneysalary-radar";
export const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;
export const REQUEST_TIMEOUT_MS = 20000;
export const MAX_REDIRECTS = 3;

const KEY_PARAMS = ["oc", "key", "auth", "authkey", "servicekey", "crtfc_key"];
const ECOS_HOST = "ecos.bok.or.kr";
const ECOS_PATH_KEY = /^(\/api\/[A-Za-z]+\/)([^/?#]+)/;

export class CapError extends Error {
  constructor(max) {
    super(`요청 상한 ${max}회 초과`);
    this.name = "CapError";
    this.code = "REQUEST_CAP";
  }
}
export class SizeError extends Error {
  constructor(maxBytes) {
    super(`응답이 ${maxBytes} 바이트 상한을 넘어 중단`);
    this.name = "SizeError";
    this.code = "MAX_BYTES";
  }
}
export class InsecureKeyUrlError extends Error {
  constructor() {
    super("키가 든 URL 은 https 로만 요청합니다");
    this.name = "InsecureKeyUrlError";
    this.code = "INSECURE_KEY_URL";
  }
}
export class RedirectError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "RedirectError";
    this.code = "REDIRECT";
  }
}
export class HostNotAllowedError extends Error {
  constructor(host) {
    super(`허용 목록에 없는 호스트: ${host}`);
    this.name = "HostNotAllowedError";
    this.code = "HOST_NOT_ALLOWED";
  }
}

/** URL 에 키 성격의 값이 들어 있는지(쿼리 키 이름 또는 ECOS 경로 키). */
export function urlCarriesKey(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return /[?&](oc|key|auth|authkey|servicekey|crtfc_key)=/i.test(String(url));
  }
  for (const name of u.searchParams.keys()) {
    if (KEY_PARAMS.includes(name.toLowerCase())) return true;
  }
  return u.hostname === ECOS_HOST && ECOS_PATH_KEY.test(u.pathname);
}

/**
 * 로그·보고서용 URL 가림 처리. 키 쿼리 값과 ECOS 경로 키를 *** 로 바꾼다.
 * URL 로 해석되지 않는 문자열도 정규식으로 한 번 더 가린다.
 */
const KEY_QUERY_RE = /([?&](?:OC|key|auth|authKey|serviceKey|crtfc_key)=)[^&#\s]*/gi;

export function redactUrl(url) {
  const raw = String(url ?? "");
  let u;
  try {
    u = new URL(raw);
  } catch {
    return raw.replace(KEY_QUERY_RE, "$1***").replace(/(\/api\/[A-Za-z]+\/)[^/?#\s]+/, "$1***");
  }
  let pathname = u.pathname;
  if (u.hostname === ECOS_HOST) pathname = pathname.replace(ECOS_PATH_KEY, "$1***");
  const search = u.search.replace(KEY_QUERY_RE, "$1***");
  return `${u.protocol}//${u.host}${pathname}${search}${u.hash}`;
}

/** 로그용 'host/path?query' (가림 처리 후). */
export function logTarget(url) {
  const red = redactUrl(url);
  return red.replace(/^[a-z]+:\/\//i, "");
}

function charsetOf(contentType, bytes) {
  const m = /charset\s*=\s*["']?([\w-]+)/i.exec(contentType || "");
  if (m) return m[1].toLowerCase();
  const head = new TextDecoder("latin1").decode(bytes.subarray(0, Math.min(bytes.length, 1024)));
  const x = /<\?xml[^>]*encoding\s*=\s*["']([\w-]+)["']/i.exec(head) || /<meta[^>]*charset\s*=\s*["']?([\w-]+)/i.exec(head);
  return x ? x[1].toLowerCase() : "utf-8";
}

function decodeBody(bytes, contentType) {
  const cs = charsetOf(contentType, bytes);
  try {
    return new TextDecoder(cs).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

async function readCapped(res, maxBytes) {
  if (!res.body) return new Uint8Array(0);
  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      try {
        await reader.cancel();
      } catch {
        /* 이미 닫힘 */
      }
      throw new SizeError(maxBytes);
    }
    put(chunks, value);
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.byteLength;
  }
  return out;
}

function isNetworkError(err) {
  if (!err) return false;
  if (err.name === "TimeoutError" || err.name === "AbortError") return false;
  if (err instanceof SizeError || err instanceof CapError) return false;
  return err.name === "TypeError" || /fetch failed|ECONNRESET|ECONNREFUSED|ENOTFOUND|EAI_AGAIN|socket/i.test(String(err.message));
}

/**
 * @typedef {Object} HttpResult
 * @property {number} status
 * @property {string} text
 * @property {number} bytes
 * @property {number} ms
 * @property {string} finalUrl
 */

/**
 * @param {Object} [opts]
 * @param {typeof fetch} [opts.fetchImpl]
 * @param {() => number} [opts.now]
 * @param {(ms: number) => Promise<void>} [opts.sleep]
 * @param {number} [opts.maxRequests]
 * @param {number} [opts.perHostGapMs]
 * @param {(line: string) => void} [opts.log]
 * @param {string[]} [opts.allowHosts] 주면 이 호스트(와 하위 도메인 아님, 정확히 일치)만 요청
 */
export function createHttp({
  fetchImpl = globalThis.fetch,
  now = () => Date.now(),
  sleep = (ms) => new Promise((r) => setTimeout(r, ms)),
  maxRequests = 20,
  perHostGapMs = 1000,
  log = (line) => console.log(line),
  allowHosts = null,
} = {}) {
  const lastAt = new Map();
  const stats = { requests: 0, bytes: 0, byHost: {} };
  let tail = Promise.resolve();

  async function waitGap(host) {
    const prev = lastAt.get(host);
    if (prev === undefined) return;
    const wait = prev + perHostGapMs - now();
    if (wait > 0) await sleep(wait);
  }

  async function once(url, { maxBytes, accept }) {
    if (stats.requests >= maxRequests) throw new CapError(maxRequests);
    const u = new URL(url);
    if (allowHosts && !allowHosts.includes(u.hostname)) throw new HostNotAllowedError(u.hostname);
    if (urlCarriesKey(url) && u.protocol !== "https:") throw new InsecureKeyUrlError();
    if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error(`지원하지 않는 프로토콜: ${u.protocol}`);
    await waitGap(u.host);
    stats.requests += 1;
    stats.byHost[u.host] = (stats.byHost[u.host] || 0) + 1;
    const t0 = now();
    try {
      const res = await fetchImpl(url, {
        method: "GET",
        redirect: "manual",
        headers: {
          "user-agent": RADAR_UA,
          accept: accept || "application/rss+xml, application/xml;q=0.9, text/xml;q=0.9, text/html;q=0.8, */*;q=0.5",
          "accept-language": "ko-KR,ko;q=0.9",
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
        try {
          await res.body?.cancel();
        } catch {
          /* 무시 */
        }
        const ms = Math.round(now() - t0);
        log(`[radar] GET ${logTarget(url)} ${res.status} 0 ${ms}`);
        return { redirect: new URL(res.headers.get("location"), url).href, status: res.status, ms };
      }
      const bytes = await readCapped(res, maxBytes);
      const ms = Math.round(now() - t0);
      stats.bytes += bytes.byteLength;
      log(`[radar] GET ${logTarget(url)} ${res.status} ${bytes.byteLength} ${ms}`);
      return {
        status: res.status,
        text: decodeBody(bytes, res.headers.get("content-type")),
        bytes: bytes.byteLength,
        ms,
        finalUrl: url,
      };
    } catch (err) {
      log(`[radar] GET ${logTarget(url)} ERR ${err && err.name ? err.name : "Error"} ${Math.round(now() - t0)}`);
      throw err;
    } finally {
      lastAt.set(u.host, now());
    }
  }

  async function onceWithRetry(url, opts) {
    try {
      return await once(url, opts);
    } catch (err) {
      if (!isNetworkError(err)) throw err;
      return once(url, opts);
    }
  }

  async function run(url, { maxBytes = DEFAULT_MAX_BYTES, accept } = {}) {
    const started = now();
    let current = url;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
      const r = await onceWithRetry(current, { maxBytes, accept });
      if (!r.redirect) return { ...r, ms: Math.round(now() - started), finalUrl: current };
      if (hop === MAX_REDIRECTS) throw new RedirectError(`리다이렉트 ${MAX_REDIRECTS}회 초과`);
      const next = new URL(r.redirect);
      if (urlCarriesKey(url) && next.protocol !== "https:") throw new InsecureKeyUrlError();
      current = next.href;
    }
    throw new RedirectError("리다이렉트 처리 실패");
  }

  return {
    /** @returns {Promise<HttpResult>} */
    get(url, opts) {
      const p = tail.then(() => run(url, opts));
      tail = p.catch(() => undefined);
      return p;
    },
    stats,
  };
}
