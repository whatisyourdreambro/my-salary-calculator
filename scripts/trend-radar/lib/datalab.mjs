// scripts/trend-radar/lib/datalab.mjs
// 네이버 데이터랩 검색어 트렌드 부스터(선택) — 2026-09-27 운영자 결정.
//   · env NAVER_CLIENT_ID·NAVER_CLIENT_SECRET 가 둘 다 있고 --live 일 때만. 없으면 '키 없음 — 건너뜀'(점수 영향 없음).
//     키는 daily.mjs 가 저장소 밖 datalab.env.txt 에서 환경변수로 넘긴다(scripts/trend-publish/secret-env.mjs).
//   · 부르는 곳은 아래 DATALAB_ENDPOINT(데이터랩 검색어 트렌드) 하나뿐. 네이버 검색 API(뉴스·블로그·웹문서 등)는
//     약관상 AI 입력·광고 페이지 사용이 막혀 있어 쓰지 않는다 — 테스트가 다른 네이버 경로를 grep 으로 막는다.
//   · 하루(KST) 호출 상한 50회(하드, datalab.json 은 낮추기만). 호출 '전'에 사용량 파일에 기록해서, 도중에 죽어도
//     덜 세지 않는다. 사용량 파일 기본 위치는 TREND_HOME/state(없으면 ~/.moneysalary-trend/state) — 저장소 밖, 기기당 하나.
//   · 한 번 호출에 키워드 그룹 5개(데이터랩 한도). 재시도 없음(호출마다 한도를 쓴다).
//   · 결과는 군집별 '최근 7일 평균 ÷ 그 앞 21일 평균' 배수만 쓴다. 데이터랩 비율은 요청 안에서 최댓값 100 기준으로
//     정규화되므로 군집 사이 크기 비교는 하지 않고, 같은 군집의 시간 변화만 본다.
//   · 결과(배수)는 레이더 점수·보고서에만 쓰고 writer(작성기) 입력·사이트에는 넣지 않는다.
//   · 키는 요청 헤더로만 보낸다. 로그·보고서·파일·오류 문구 어디에도 키나 응답 본문을 남기지 않는다.
//     로그는 '[radar] POST host/path status bytes ms' 한 줄.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// 배열 뒤에 붙이기(발행기 외 트렌드 스크립트에는 배열 메서드 이름까지 포함해 그 단어를 두지 않는다 — trend-publish 게이트).
const put = (arr, ...vals) => {
  for (const v of vals) arr[arr.length] = v;
  return arr.length;
};

const HERE = dirname(fileURLToPath(import.meta.url));
export const DATALAB_CONFIG_FILE = join(HERE, "..", "datalab.json");
export const DATALAB_ENDPOINT = "https://openapi.naver.com/v1/datalab/search";
export const DATALAB_HARD_DAILY_CAP = 50;
export const DATALAB_GROUPS_PER_CALL = 5;
export const DATALAB_MAX_KEYWORDS = 20;
export const DATALAB_MAX_BYTES = 256 * 1024;
export const DATALAB_TIMEOUT_MS = 20000;
export const NO_KEY_NOTE = "키 없음 — 건너뜀";
export const FIXTURE_NOTE = "고정 표본 모드 — 건너뜀";
export const ID_ENV = "NAVER_CLIENT_ID";
export const SECRET_ENV = "NAVER_CLIENT_SECRET";
const YMD = /^\d{4}-\d{2}-\d{2}$/;
const DAY = 86400000;

const addDays = (ymd, n) => new Date(Date.parse(`${ymd}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);

/** 사용량 파일 기본 경로 — TREND_HOME/state/datalab-usage.json, 없으면 ~/.moneysalary-trend/state/… */
export function defaultUsageFile(env = process.env) {
  const home = env.TREND_HOME && env.TREND_HOME.trim() ? env.TREND_HOME.trim() : join(homedir(), ".moneysalary-trend");
  return join(home, "state", "datalab-usage.json");
}

export function loadDatalabConfig(file = DATALAB_CONFIG_FILE) {
  return JSON.parse(readFileSync(file, "utf8"));
}

/**
 * 설정 검증 — 오류 문자열 배열
 * @param {any} cfg datalab.json
 * @param {{id: string, briefEligible: boolean}[]} clusters 레이더 clusters.json 의 clusters
 */
export function validateDatalabConfig(cfg, clusters) {
  const e = [];
  const byId = new Map((clusters || []).map((c) => [c.id, c]));
  const num = (k, lo, hi) => {
    if (typeof cfg?.[k] !== "number" || !Number.isFinite(cfg[k]) || cfg[k] < lo || cfg[k] > hi) put(e, `datalab.${k} 범위(${lo}~${hi})`);
  };
  num("dailyCap", 0, 1000);
  num("windowDays", 14, 90);
  num("recentDays", 3, 14);
  num("surgeRatio", 1.1, 10);
  num("minRecentRatio", 0, 100);
  num("boost", 0, 10);
  if (cfg && cfg.recentDays >= cfg.windowDays) put(e, "datalab.recentDays 는 windowDays 보다 작아야 함");
  const seen = new Set();
  if (!Array.isArray(cfg?.groups) || !cfg.groups.length) put(e, "datalab.groups 비어 있음");
  for (const g of cfg?.groups || []) {
    const c = byId.get(g.cluster);
    if (!c) put(e, `datalab.groups.${g.cluster} 알 수 없는 군집`);
    else if (!c.briefEligible) put(e, `datalab.groups.${g.cluster} 는 새 글 대상 군집이 아님`);
    if (seen.has(g.cluster)) put(e, `datalab.groups.${g.cluster} 중복`);
    seen.add(g.cluster);
    const kw = Array.isArray(g.keywords) ? g.keywords : [];
    if (!kw.length || kw.length > DATALAB_MAX_KEYWORDS) put(e, `datalab.groups.${g.cluster}.keywords 1~${DATALAB_MAX_KEYWORDS}개`);
    if (kw.some((k) => typeof k !== "string" || !k.trim() || k.length > 40)) put(e, `datalab.groups.${g.cluster}.keywords 형식`);
  }
  return e;
}

/** 실제 하루 상한 — 설정은 하드 상한 50 을 넘을 수 없다 */
export const effectiveDailyCap = (cfg) => Math.max(0, Math.min(DATALAB_HARD_DAILY_CAP, Number.isFinite(cfg?.dailyCap) ? Math.floor(cfg.dailyCap) : DATALAB_HARD_DAILY_CAP));

/** 오늘 사용량 — 날짜가 다르거나 파일이 깨졌으면 0 */
export function readUsage(file, date) {
  try {
    if (!existsSync(file)) return 0;
    const u = JSON.parse(readFileSync(file, "utf8"));
    return u && u.date === date && Number.isInteger(u.calls) && u.calls >= 0 ? u.calls : 0;
  } catch {
    return 0;
  }
}

/** 호출 1회 예약 — 상한 안이면 기록하고 true. 기록할 수 없으면(권한 등) 호출하지 않는다(false) */
export function reserveCall(file, date, cap) {
  const used = readUsage(file, date);
  if (used >= cap) return false;
  try {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, `${JSON.stringify({ date, calls: used + 1 })}\n`);
    return true;
  } catch {
    return false;
  }
}

/** 요청 본문 — endDate 는 어제(오늘 값은 하루가 덜 찼다) */
export function buildRequestBody(groups, endDate, windowDays) {
  return {
    startDate: addDays(endDate, -(windowDays - 1)),
    endDate,
    timeUnit: "date",
    keywordGroups: groups.map((g) => ({ groupName: g.cluster, keywords: g.keywords.slice(0, DATALAB_MAX_KEYWORDS) })),
  };
}

/**
 * 응답 → 군집별 {cluster, recent, prior, change, surge}. 빠진 날짜는 0 으로 본다(데이터랩은 0 인 날을 생략한다).
 * @param {any} json 데이터랩 응답
 * @param {{endDate: string, windowDays: number, recentDays: number, surgeRatio: number, minRecentRatio: number}} o
 */
export function summarizeResults(json, { endDate, windowDays, recentDays, surgeRatio, minRecentRatio }) {
  const out = [];
  const recentFrom = addDays(endDate, -(recentDays - 1));
  const start = addDays(endDate, -(windowDays - 1));
  for (const r of Array.isArray(json?.results) ? json.results : []) {
    if (typeof r?.title !== "string") continue;
    let recentSum = 0;
    let priorSum = 0;
    for (const d of Array.isArray(r.data) ? r.data : []) {
      const p = typeof d?.period === "string" ? d.period.slice(0, 10) : "";
      const v = typeof d?.ratio === "number" && Number.isFinite(d.ratio) && d.ratio >= 0 ? d.ratio : 0;
      if (!YMD.test(p) || p < start || p > endDate) continue;
      if (p >= recentFrom) recentSum += v;
      else priorSum += v;
    }
    const recent = recentSum / recentDays;
    const prior = priorSum / (windowDays - recentDays);
    const change = prior > 0 ? recent / prior : null;
    const surge = recent >= minRecentRatio && (change === null ? recent > 0 : change >= surgeRatio);
    put(out, {
      cluster: r.title,
      recent: Math.round(recent * 100) / 100,
      prior: Math.round(prior * 100) / 100,
      change: change === null ? null : Math.round(change * 100) / 100,
      surge,
    });
  }
  return out;
}

async function readCapped(res, maxBytes) {
  const len = Number(res.headers?.get?.("content-length"));
  if (Number.isFinite(len) && len > maxBytes) throw new Error(`응답이 ${maxBytes} 바이트 상한을 넘음`);
  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.byteLength > maxBytes) throw new Error(`응답이 ${maxBytes} 바이트 상한을 넘음`);
  return buf;
}

const errName = (err) => (err && err.name ? err.name : "Error");

/**
 * 데이터랩 부스터 1회.
 * @param {Object} o
 * @param {'fixtures'|'live'} o.mode
 * @param {Record<string, string|undefined>} o.env
 * @param {string} o.today YYYY-MM-DD(KST)
 * @param {string} [o.usageFile]
 * @param {typeof fetch} [o.fetchImpl]
 * @param {(line: string) => void} [o.log]
 * @param {any} [o.config] datalab.json(기본: 파일)
 * @param {() => number} [o.now]
 * @returns {Promise<{status: 'ok'|'skipped'|'error'|'cap', note: string, calls: number, clusters: string[], rows: any[]}>}
 */
export async function runDatalab({ mode, env = process.env, today, usageFile, fetchImpl = globalThis.fetch, log = (l) => console.log(l), config, now = () => Date.now() }) {
  const empty = (status, note, calls = 0, rows = []) => ({ status, note, calls, clusters: rows.filter((x) => x.surge).map((x) => x.cluster).sort(), rows });
  if (mode !== "live") return empty("skipped", FIXTURE_NOTE);
  const id = typeof env?.[ID_ENV] === "string" ? env[ID_ENV].trim() : "";
  const secret = typeof env?.[SECRET_ENV] === "string" ? env[SECRET_ENV].trim() : "";
  if (!id || !secret) return empty("skipped", NO_KEY_NOTE);
  const cfg = config || loadDatalabConfig();
  const cap = effectiveDailyCap(cfg);
  const file = usageFile || defaultUsageFile(env);
  const endDate = addDays(today, -1);
  const groups = cfg.groups || [];
  const rows = [];
  let calls = 0;
  const u = new URL(DATALAB_ENDPOINT);
  for (let i = 0; i < groups.length; i += DATALAB_GROUPS_PER_CALL) {
    if (!reserveCall(file, today, cap)) {
      return empty("cap", `하루 호출 상한 ${cap}회 도달(또는 사용량 기록 불가) — 이번 실행 ${calls}회 후 중단`, calls, rows);
    }
    calls += 1;
    const body = JSON.stringify(buildRequestBody(groups.slice(i, i + DATALAB_GROUPS_PER_CALL), endDate, cfg.windowDays));
    const t0 = now();
    let res;
    let bytes;
    try {
      res = await fetchImpl(DATALAB_ENDPOINT, {
        method: "POST",
        redirect: "error",
        headers: {
          "content-type": "application/json",
          "x-naver-client-id": id,
          "x-naver-client-secret": secret,
        },
        body,
        signal: AbortSignal.timeout(DATALAB_TIMEOUT_MS),
      });
      bytes = await readCapped(res, DATALAB_MAX_BYTES);
    } catch (err) {
      log(`[radar] POST ${u.host}${u.pathname} ERR ${errName(err)} ${Math.round(now() - t0)}`);
      return empty("error", `요청 실패(${errName(err)})`, calls, rows);
    }
    log(`[radar] POST ${u.host}${u.pathname} ${res.status} ${bytes.byteLength} ${Math.round(now() - t0)}`);
    if (res.status !== 200) {
      const why = res.status === 401 || res.status === 403 ? "인증 실패 — 키 파일 확인" : res.status === 429 ? "네이버 쪽 호출 한도 초과" : `HTTP ${res.status}`;
      return empty("error", why, calls, rows);
    }
    let json;
    try {
      json = JSON.parse(new TextDecoder("utf-8").decode(bytes));
    } catch {
      return empty("error", "응답 JSON 형식 오류", calls, rows);
    }
    put(rows, ...summarizeResults(json, { endDate, windowDays: cfg.windowDays, recentDays: cfg.recentDays, surgeRatio: cfg.surgeRatio, minRecentRatio: cfg.minRecentRatio }));
  }
  const res = empty("ok", "", calls, rows);
  res.note = `호출 ${calls}회(오늘 누적 ${readUsage(file, today)}/${cap}) · 군집 ${rows.length}개 중 급상승 ${res.clusters.length}개`;
  return res;
}
