// scripts/fact-sentinel/lib/canonical.mjs
// 저장소 정본 상수를 정규식으로 읽는다 — TS import 없이(빌드·tsx 의존 0).
// 대상(2026-09-26 기준 정본 파일):
//   · src/config/minimumWage.ts          MONTHLY_HOURS, MINIMUM_WAGE_<연도> = build(연도, 시급)
//   · src/lib/taxConstants2026.ts        INSURANCE_RATES_2026, PENSION_BASE_2026,
//                                        INSURANCE_RATES_2025_LEGACY, PENSION_BASE_2025_LEGACY
//   · src/lib/taxConstants2027.ts        INSURANCE_RATES_2027(2026 참조 해석), INSURANCE_RATES_2027_STATUS
//   · src/config/unemploymentBenefit.ts  UNEMPLOYMENT_BENEFIT_2026.DAILY_UPPER
// 정규식이 더 이상 맞지 않으면 파일·필드 이름을 담아 CanonicalError 를 던진다(조용한 통과 금지).

export const CANONICAL_FILES = {
  minimumWage: "src/config/minimumWage.ts",
  tax2026: "src/lib/taxConstants2026.ts",
  tax2027: "src/lib/taxConstants2027.ts",
  unemployment: "src/config/unemploymentBenefit.ts",
};

export class CanonicalError extends Error {
  constructor(file, field, detail = "정규식 불일치") {
    super(`정본 파싱 실패: ${file} — ${field} (${detail})`);
    this.name = "CanonicalError";
    this.file = file;
    this.field = field;
  }
}

const RATE_KEYS = {
  NATIONAL_PENSION: "pension",
  HEALTH_INSURANCE: "health",
  LONG_TERM_CARE_RATIO: "longTermCare",
  EMPLOYMENT_INSURANCE: "employment",
  LOCAL_INCOME_TAX_RATIO: "localIncomeTax",
};
const BASE_KEYS = { MAX_MONTHLY: "cap", MIN_MONTHLY: "floor", MAX_ANNUAL: "capAnnual" };

/** 주석 제거(문자열 안의 // 는 정본 파일에 없으므로 단순 처리로 충분). */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/** `export const NAME ... = { ... }` 본문(닫는 중괄호가 줄 맨 앞인 첫 블록). */
function objectBody(src, name, file) {
  const re = new RegExp(`export\\s+const\\s+${name}\\b[^=]*=\\s*\\{([\\s\\S]*?)\\n\\}`);
  const m = re.exec(src);
  if (!m) throw new CanonicalError(file, name, "객체 선언을 찾지 못함");
  return stripComments(m[1]);
}

/** 숫자 식: 1_234_000 · 0.0475 · 6_590_000 * 12 (곱셈·덧셈만). */
export function evalNumericExpr(expr) {
  const s = String(expr).trim();
  if (!/^[\d_.]+(?:\s*[*+]\s*[\d_.]+)*$/.test(s)) return null;
  const sumTerms = s.split("+").map((t) =>
    t
      .split("*")
      .map((f) => Number(f.trim().replace(/_/g, "")))
      .reduce((a, b) => a * b, 1)
  );
  const v = sumTerms.reduce((a, b) => a + b, 0);
  return Number.isFinite(v) ? v : null;
}

function field(body, key, file, objName) {
  const m = new RegExp(`(?:^|[\\s,{])${key}\\s*:\\s*([^,\\n]+?)\\s*,?\\s*$`, "m").exec(body);
  if (!m) throw new CanonicalError(file, `${objName}.${key}`);
  return m[1].trim();
}

function numericField(body, key, file, objName, refs = {}) {
  const raw = field(body, key, file, objName);
  const direct = evalNumericExpr(raw);
  if (direct !== null) return direct;
  const ref = /^([A-Z0-9_]+)\.([A-Z_]+)$/.exec(raw);
  if (ref && refs[ref[1]] && refs[ref[1]][ref[2]] !== undefined) return refs[ref[1]][ref[2]];
  throw new CanonicalError(file, `${objName}.${key}`, `값 해석 불가: ${raw.slice(0, 40)}`);
}

function readRates(src, name, file, refs) {
  const body = objectBody(src, name, file);
  const out = {};
  for (const key of Object.keys(RATE_KEYS)) out[key] = numericField(body, key, file, name, refs);
  return out;
}

function readBase(src, name, file, keys) {
  const body = objectBody(src, name, file);
  const out = {};
  for (const key of keys) out[key] = numericField(body, key, file, name);
  return out;
}

const round = (v, d = 10) => Number(Number(v).toFixed(d));

/**
 * @param {(relPath: string) => string} readText 저장소 상대 경로 → 파일 내용(CRLF 허용)
 * @returns {{values: Record<string, number|string>, files: string[]}}
 */
export function readCanonical(readText) {
  const values = {};
  const load = (rel) => {
    let text;
    try {
      text = readText(rel);
    } catch (err) {
      throw new CanonicalError(rel, "(파일)", `읽기 실패: ${err && err.code ? err.code : "오류"}`);
    }
    if (typeof text !== "string") throw new CanonicalError(rel, "(파일)", "읽기 실패");
    return text.replace(/\r\n/g, "\n");
  };

  // ── 최저임금 ──
  const mwFile = CANONICAL_FILES.minimumWage;
  const mw = load(mwFile);
  const hoursM = /export\s+const\s+MONTHLY_HOURS\s*=\s*([\d_]+)\s*;/.exec(mw);
  if (!hoursM) throw new CanonicalError(mwFile, "MONTHLY_HOURS");
  const hours = Number(hoursM[1].replace(/_/g, ""));
  values["minimumWage.monthlyHours"] = hours;
  const years = new Set();
  for (const m of mw.matchAll(
    /export\s+const\s+MINIMUM_WAGE_(\d{4})\s*:\s*MinimumWageYear\s*=\s*build\(\s*(\d{4})\s*,\s*([\d_]+)\s*\)/g
  )) {
    if (m[1] !== m[2]) throw new CanonicalError(mwFile, `MINIMUM_WAGE_${m[1]}`, `연도 불일치(${m[2]})`);
    const hourly = Number(m[3].replace(/_/g, ""));
    values[`minimumWage.${m[1]}.hourly`] = hourly;
    values[`minimumWage.${m[1]}.monthly`] = hourly * hours;
    values[`minimumWage.${m[1]}.yearly`] = hourly * hours * 12;
    years.add(m[1]);
  }
  for (const y of ["2026", "2027"]) {
    if (!years.has(y)) throw new CanonicalError(mwFile, `MINIMUM_WAGE_${y}`);
  }

  // ── 4대보험 요율·연금 기준소득월액 ──
  const t26File = CANONICAL_FILES.tax2026;
  const t26 = load(t26File);
  const r26 = readRates(t26, "INSURANCE_RATES_2026", t26File, {});
  const r25 = readRates(t26, "INSURANCE_RATES_2025_LEGACY", t26File, {});
  const b26 = readBase(t26, "PENSION_BASE_2026", t26File, ["MAX_MONTHLY", "MIN_MONTHLY", "MAX_ANNUAL"]);
  const b25 = readBase(t26, "PENSION_BASE_2025_LEGACY", t26File, ["MAX_MONTHLY", "MIN_MONTHLY"]);

  const t27File = CANONICAL_FILES.tax2027;
  const t27 = load(t27File);
  const r27 = readRates(t27, "INSURANCE_RATES_2027", t27File, { INSURANCE_RATES_2026: r26 });
  const statusBody = objectBody(t27, "INSURANCE_RATES_2027_STATUS", t27File);
  const status = {};
  for (const key of Object.keys(RATE_KEYS)) {
    const raw = field(statusBody, key, t27File, "INSURANCE_RATES_2027_STATUS");
    const s = /^["'](confirmed|provisional)["']$/.exec(raw);
    if (!s) throw new CanonicalError(t27File, `INSURANCE_RATES_2027_STATUS.${key}`, `상태값 해석 불가: ${raw.slice(0, 20)}`);
    status[key] = s[1];
  }

  for (const [key, short] of Object.entries(RATE_KEYS)) {
    values[`insurance.2025.${short}`] = round(r25[key]);
    values[`insurance.2026.${short}`] = round(r26[key]);
    values[`insurance.2027.${short}`] = round(r27[key]);
    values[`insurance.2027.status.${short}`] = status[key];
  }
  for (const [key, short] of Object.entries(BASE_KEYS)) {
    if (b26[key] !== undefined) values[`pensionBase.2026.${short}`] = b26[key];
    if (b25[key] !== undefined) values[`pensionBase.2025.${short}`] = b25[key];
  }
  if (b26.MAX_ANNUAL !== b26.MAX_MONTHLY * 12) {
    throw new CanonicalError(t26File, "PENSION_BASE_2026.MAX_ANNUAL", "월 상한 × 12 와 다름");
  }

  // ── 구직급여 1일 상한 ──
  const ubFile = CANONICAL_FILES.unemployment;
  const ub = load(ubFile);
  const ubBody = objectBody(ub, "UNEMPLOYMENT_BENEFIT_2026", ubFile);
  const ubYear = numericField(ubBody, "YEAR", ubFile, "UNEMPLOYMENT_BENEFIT_2026");
  if (ubYear !== 2026) throw new CanonicalError(ubFile, "UNEMPLOYMENT_BENEFIT_2026.YEAR", `연도 ${ubYear}`);
  values["unemployment.2026.dailyUpper"] = numericField(ubBody, "DAILY_UPPER", ubFile, "UNEMPLOYMENT_BENEFIT_2026");

  return { values, files: Object.values(CANONICAL_FILES) };
}

/** 'minimumWage.2026.hourly' 같은 참조를 값으로. 없으면 null. */
export function resolveCanonicalRef(canonical, ref) {
  const v = canonical.values[ref];
  return v === undefined ? null : v;
}

// ── facts.json 검증·해석 ──

export class ConfigError extends Error {
  constructor(msg) {
    super(`설정 오류: ${msg}`);
    this.name = "ConfigError";
  }
}

/** 사실 출처로 허용하는 공식 호스트(하위 도메인 포함). */
export const OFFICIAL_SOURCE_HOSTS = [
  "bok.or.kr",
  "law.go.kr",
  "nts.go.kr",
  "korea.kr",
  "moef.go.kr",
  "mofe.go.kr",
  "moel.go.kr",
  "mohw.go.kr",
  "fsc.go.kr",
  "fss.or.kr",
  "nps.or.kr",
  "nhis.or.kr",
  "mpm.go.kr",
  "minimumwage.go.kr",
  "ei.go.kr",
];

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const roundTo = (v, d = 6) => Number(Number(v).toFixed(d));

function officialHost(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && OFFICIAL_SOURCE_HOSTS.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

function compilePatterns(fact) {
  if (!Array.isArray(fact.mentionPatterns) || !fact.mentionPatterns.length) {
    throw new ConfigError(`${fact.id}: mentionPatterns 비어 있음`);
  }
  return fact.mentionPatterns.map((p, i) => {
    const mk = (src, what) => {
      if (src === undefined) return null;
      try {
        return new RegExp(src);
      } catch {
        throw new ConfigError(`${fact.id}: mentionPatterns[${i}].${what} 정규식 오류`);
      }
    };
    mk(p.anchor, "anchor");
    if (typeof p.anchor !== "string" || !p.anchor) throw new ConfigError(`${fact.id}: mentionPatterns[${i}].anchor 없음`);
    return {
      anchor: p.anchor,
      after: Number.isFinite(p.after) ? p.after : 48,
      before: Number.isFinite(p.before) ? p.before : 0,
      notBeforeRe: mk(p.notBefore, "notBefore"),
      requireRe: mk(p.require, "require"),
    };
  });
}

/**
 * facts.json → 해석된 사실 목록(오늘 기준 현재값·과거값·예정값).
 * @param {{facts: object[]}} json
 * @param {{values: object}} canonical readCanonical() 결과
 * @param {string} today YYYY-MM-DD
 */
export function resolveFacts(json, canonical, today) {
  if (!json || !Array.isArray(json.facts) || !json.facts.length) throw new ConfigError("facts.json 에 facts 배열 없음");
  if (!ISO.test(today)) throw new ConfigError(`--today 형식 오류: ${today}`);
  const ids = new Set();
  const out = [];
  for (const f of json.facts) {
    if (!f || typeof f.id !== "string" || !/^[a-z0-9-]+$/.test(f.id)) throw new ConfigError("id 누락·형식 오류");
    if (ids.has(f.id)) throw new ConfigError(`${f.id}: id 중복`);
    ids.add(f.id);
    if (f.unit !== "%" && f.unit !== "원") throw new ConfigError(`${f.id}: unit 은 % 또는 원`);
    if (!officialHost(f.source)) throw new ConfigError(`${f.id}: source 가 공식 https 호스트가 아님`);
    if (!f.verifiedAt || !ISO.test(f.verifiedAt)) throw new ConfigError(`${f.id}: verifiedAt 누락`);
    const patterns = compilePatterns(f);
    const base = { id: f.id, label: f.label || f.id, kind: f.kind, unit: f.unit, decimals: f.decimals, source: f.source, verifiedAt: f.verifiedAt, verification: f.verification || "", patterns };

    if (f.kind === "official") {
      const cur = Number(f.current);
      if (!Number.isFinite(cur) || typeof f.current !== "string") throw new ConfigError(`${f.id}: current 는 숫자 문자열`);
      if (!ISO.test(f.since || "")) throw new ConfigError(`${f.id}: since 날짜 형식 오류`);
      const hist = Array.isArray(f.history) ? f.history : [];
      const old = hist.map((h, i) => {
        const v = Number(h.value);
        if (!Number.isFinite(v)) throw new ConfigError(`${f.id}: history[${i}].value 오류`);
        if (h.to && !ISO.test(h.to)) throw new ConfigError(`${f.id}: history[${i}].to 날짜 오류`);
        if (h.to && h.to >= f.since) throw new ConfigError(`${f.id}: history[${i}].to 가 since 이후`);
        return { value: v, from: h.from || null, to: h.to || null };
      });
      if (old.some((o) => Math.abs(o.value - cur) < 1e-9)) throw new ConfigError(`${f.id}: 현재값이 history 에도 있음`);
      if (f.ecos && !(f.ecos.stat && f.ecos.cycle && f.ecos.item)) throw new ConfigError(`${f.id}: ecos 설정 불완전`);
      out[out.length] = { ...base, current: { value: cur, raw: f.current, since: f.since }, old, upcoming: [], ecos: f.ecos || null };
      continue;
    }

    if (f.kind !== "repo") throw new ConfigError(`${f.id}: kind 는 official 또는 repo`);
    const mul = f.multiply === undefined ? 1 : Number(f.multiply);
    if (!Number.isFinite(mul) || mul <= 0) throw new ConfigError(`${f.id}: multiply 오류`);
    const refValue = (ref, where) => {
      const v = resolveCanonicalRef(canonical, ref);
      if (typeof v !== "number") throw new ConfigError(`${f.id}: ${where} canonicalRef '${ref}' 를 정본에서 찾지 못함`);
      return roundTo(v * mul);
    };
    let current = { value: refValue(f.canonicalRef, "canonicalRef"), since: f.since || null, ref: f.canonicalRef };
    if (f.since && !ISO.test(f.since)) throw new ConfigError(`${f.id}: since 날짜 형식 오류`);
    const old = (f.oldValues || []).map((o, i) => {
      let v = null;
      if (o.canonicalRef) v = refValue(o.canonicalRef, `oldValues[${i}]`);
      if (o.value !== undefined) {
        const lit = Number(o.value);
        if (!Number.isFinite(lit)) throw new ConfigError(`${f.id}: oldValues[${i}].value 오류`);
        if (v !== null && Math.abs(v - lit) > 1e-6) {
          throw new ConfigError(`${f.id}: oldValues[${i}] 검증값 ${lit} ≠ 정본 ${o.canonicalRef}=${v}`);
        }
        v = lit;
      }
      if (v === null) throw new ConfigError(`${f.id}: oldValues[${i}] 에 value 또는 canonicalRef 필요`);
      return { value: v, from: o.from || null, to: o.to || null };
    });
    const upcoming = [];
    const nexts = [...(f.next || [])].sort((a, b) => (a.from < b.from ? -1 : 1));
    for (const n of nexts) {
      if (!ISO.test(n.from || "")) throw new ConfigError(`${f.id}: next.from 날짜 오류`);
      const v = refValue(n.canonicalRef, "next");
      const status = n.statusRef ? resolveCanonicalRef(canonical, n.statusRef) : null;
      if (n.from <= today) {
        // 전환일이 지났다 — 종전 현재값은 과거값으로 내려간다.
        if (Math.abs(v - current.value) > 1e-6) {
          const dayBefore = new Date(Date.parse(`${n.from}T00:00:00Z`) - 86400000).toISOString().slice(0, 10);
          old.unshift({ value: current.value, from: current.since, to: dayBefore });
        }
        current = { value: v, since: n.from, ref: n.canonicalRef, status };
      } else {
        upcoming[upcoming.length] = { value: v, from: n.from, ref: n.canonicalRef, status };
      }
    }
    const dedupOld = old.filter((o, i) => Math.abs(o.value - current.value) > 1e-6 && old.findIndex((x) => Math.abs(x.value - o.value) < 1e-6) === i);
    out[out.length] = { ...base, current, old: dedupOld, upcoming, ecos: null };
  }
  for (const f of out) {
    f.knownValues = [{ value: f.current.value, role: "current" }, ...f.old.map((o) => ({ value: o.value, role: "old" }))];
  }
  return out;
}
