#!/usr/bin/env node
// scripts/dart-etl.mjs — OpenDART 공시 데이터 ETL (유입 100배 기둥 1)
//
// 사용법:
//   $env:DART_API_KEY = (Get-Content C:\Users\ruby1\.moneysalary-secrets\dart.key -Raw).Trim()
//   node scripts/dart-etl.mjs corp-codes            # ① 전체 corp_code 다운로드·상장사 필터
//   node scripts/dart-etl.mjs match                 # ② 기존 회사 ↔ corp_code 매칭 제안
//   node scripts/dart-etl.mjs fetch [--year 2025]   # ③ 직원현황·기업개황 수집 (캐시)
//   node scripts/dart-etl.mjs emit                  # ④ 집계·검증 → src/data/dart/dartDisclosed.ts
//   node scripts/dart-etl.mjs diff                  # ⑤ 수기 disclosed vs DART 검증 리포트
//   node scripts/dart-etl.mjs all
//
// ★키 보안 (불가침): 키는 env DART_API_KEY 로만 — 이 파일·산출물·로그에 키를
//   절대 남기지 않는다. 로그는 crtfc_key= 값을 마스킹한다.
// ★집계 정본: 급여는 "성별 합계" 행에만 존재 → Σ연간급여총액 ÷ Σ인원 가중평균.
// ★캐시: scripts/.dart-cache/ (gitignore) — 재실행 시 API 호출 생략, --force 로 무시.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CACHE = join(__dirname, ".dart-cache");
const EMP_CACHE = join(CACHE, "emp");
// 과년도 이력 캐시 — 연도별 분리 (emp/ 는 현행 연도 전용이라 불변 유지.
// 2026-08-23 3개년 추이용 신설: fetch-hist --year YYYY → emp-hist/YYYY/{corp}.json)
const EMP_HIST_CACHE = join(CACHE, "emp-hist");
const COMPANY_CACHE = join(CACHE, "company");
const OUT_DIR = join(ROOT, "src", "data", "dart");

const API = "https://opendart.fss.or.kr/api";
const KEY = process.env.DART_API_KEY;

const args = process.argv.slice(2);
const cmd = args[0];
const FORCE = args.includes("--force");
const yearArg = args.includes("--year") ? args[args.indexOf("--year") + 1] : null;

// ── 로그 (키 마스킹) ─────────────────────────────────────────
function log(...parts) {
  const msg = parts.join(" ").replace(/crtfc_key=[0-9a-f]+/g, "crtfc_key=***");
  console.log(`[dart-etl] ${msg}`);
}
function fail(msg) {
  log(`ERROR: ${msg}`);
  process.exit(1);
}

if (!cmd || !["corp-codes", "match", "fetch", "fetch-hist", "emit", "diff", "all"].includes(cmd)) {
  fail("서브커맨드 필요: corp-codes | match | fetch | fetch-hist | emit | diff | all");
}
if (!KEY && cmd !== "match" && cmd !== "emit" && cmd !== "diff") {
  fail("DART_API_KEY 환경변수가 없습니다. 키 파일에서 주입 후 재실행하세요.");
}

for (const d of [CACHE, EMP_CACHE, COMPANY_CACHE]) mkdirSync(d, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function apiJson(path, params, retries = 3) {
  const url = `${API}/${path}?crtfc_key=${KEY}&${new URLSearchParams(params)}`;
  for (let i = 0; i < retries; i++) {
    try {
      // 타임아웃 필수 — 무제한 대기 시 동시성 배치 전체가 행 (2026-08-23 실측)
      const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      if (j.status === "020") fail("일일 호출 한도 초과(020) — 내일 재실행 (캐시 유지됨)");
      if (j.status === "010" || j.status === "011") fail(`키 오류(${j.status}): ${j.message}`);
      return j; // "000" 정상 | "013" 데이터 없음 등은 호출자가 처리
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(1000 * 2 ** i);
    }
  }
}

// ── ZIP 해제 (corpCode.xml — EOCD → central dir → local header) ──
function unzipSingle(buf) {
  // EOCD 시그니처 0x06054b50 를 뒤에서 탐색
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65558); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("ZIP EOCD 없음");
  const cdOffset = buf.readUInt32LE(eocd + 16);
  if (buf.readUInt32LE(cdOffset) !== 0x02014b50) throw new Error("central dir 시그니처 불일치");
  const method = buf.readUInt16LE(cdOffset + 10);
  const compSize = buf.readUInt32LE(cdOffset + 20);
  const localOffset = buf.readUInt32LE(cdOffset + 42);
  if (buf.readUInt32LE(localOffset) !== 0x04034b50) throw new Error("local header 시그니처 불일치");
  const nameLen = buf.readUInt16LE(localOffset + 26);
  const extraLen = buf.readUInt16LE(localOffset + 28);
  const dataStart = localOffset + 30 + nameLen + extraLen;
  const data = buf.subarray(dataStart, dataStart + compSize);
  if (method === 0) return data;
  if (method === 8) return zlib.inflateRawSync(data);
  throw new Error(`지원하지 않는 압축 방식: ${method}`);
}

// ── 숫자 파싱: "37,787" → 37787, "-"/""/"0" → null ──────────
function num(s) {
  if (s == null) return null;
  const t = String(s).replace(/,/g, "").trim();
  if (t === "" || t === "-") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

// ═══════════ ① corp-codes ═══════════
async function corpCodes() {
  const out = join(CACHE, "corpCode.json");
  if (existsSync(out) && !FORCE) {
    log(`corpCode.json 캐시 존재 — 건너뜀 (--force 로 갱신)`);
    return;
  }
  log("corpCode.xml 다운로드 중…");
  const res = await fetch(`${API}/corpCode.xml?crtfc_key=${KEY}`);
  if (!res.ok) fail(`corpCode 다운로드 실패: HTTP ${res.status}`);
  const zip = Buffer.from(await res.arrayBuffer());
  // 오류 응답이 JSON/XML 텍스트로 올 수 있음
  if (zip.length < 1000 && zip.toString("utf8").includes("status")) {
    fail(`corpCode 응답 오류: ${zip.toString("utf8").slice(0, 200)}`);
  }
  const xml = unzipSingle(zip).toString("utf8");
  const entries = [];
  const re = /<list>([\s\S]*?)<\/list>/g;
  const pick = (block, tag) => {
    const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
    return m ? m[1].trim() : "";
  };
  const unlisted = [];
  let m;
  while ((m = re.exec(xml))) {
    const b = m[1];
    const stock = pick(b, "stock_code");
    const entry = {
      corpCode: pick(b, "corp_code"),
      corpName: pick(b, "corp_name"),
      corpNameEn: pick(b, "corp_eng_name") || undefined,
      stockCode: /^\d{6}$/.test(stock) ? stock : "",
      modifyDate: pick(b, "modify_date"),
    };
    if (entry.stockCode) entries.push(entry);
    // 비상장도 이름만 보관 — 기존 회사 매칭 fallback 용
    // (비상장 대형 법인도 사업보고서 제출 시 empSttus 조회 가능: 현대카드·GS칼텍스·발전공기업 등)
    else unlisted.push({ corpCode: entry.corpCode, corpName: entry.corpName });
  }
  writeFileSync(out, JSON.stringify({ downloadedAt: new Date().toISOString().slice(0, 10), entries, unlisted }, null, 1));
  log(`상장사 ${entries.length}곳 + 비상장 ${unlisted.length}곳 저장 → scripts/.dart-cache/corpCode.json`);
}

// ── 기존 회사 데이터 추출 (regex — 사람 검수 전제) ──────────
function normKo(s) {
  return (s || "").replace(/\(주\)|㈜|주식회사|\s/g, "").toLowerCase();
}
function normEn(s) {
  return (s || "")
    .toLowerCase()
    .replace(/co\.?,?\s*ltd\.?|inc\.?|corp(oration)?\.?|company|holdings?/g, "")
    .replace(/[^a-z0-9가-힣]/g, "");
}

function extractExistingCompanies() {
  const dataDir = join(ROOT, "src", "data");
  const files = readdirSync(dataDir).filter(
    (f) => /^krCompanies_Batch\d+\.ts$/.test(f) || f === "seedCompanies.ts" || f === "globalCompanies.ts"
  );
  const companies = [];
  for (const f of files) {
    const src = readFileSync(join(dataDir, f), "utf8");
    // 엔트리 경계: id: "..." 로 시작하는 블록 단위 스캔
    const idRe = /\bid:\s*"([a-z0-9-]+)"/g;
    let m;
    const ids = [];
    while ((m = idRe.exec(src))) ids.push({ id: m[1], at: m.index });
    for (let i = 0; i < ids.length; i++) {
      const block = src.slice(ids[i].at, ids[i + 1] ? ids[i + 1].at : ids[i].at + 4000);
      const ko = block.match(/ko:\s*"([^"]+)"/)?.[1];
      const en = block.match(/en:\s*"([^"]+)"/)?.[1];
      const disclosedM = block.match(/disclosed:\s*\{([\s\S]*?)\n\s*\}/);
      let disclosed = null;
      if (disclosedM) {
        disclosed = {
          avgSalaryManwon: num(disclosedM[1].match(/avgSalaryManwon:\s*([\d_,]+)/)?.[1]?.replace(/_/g, "")),
          fiscalYear: disclosedM[1].match(/fiscalYear:\s*"([^"]+)"/)?.[1] ?? null,
        };
      }
      if (ko) companies.push({ id: ids[i].id, ko, en: en || "", disclosed, file: f });
    }
  }
  // aliases
  const aliasSrc = readFileSync(join(dataDir, "companyAliases.ts"), "utf8");
  const aliasMap = {};
  const aRe = /"([a-z0-9-]+)":\s*\[([^\]]*)\]/g;
  let am;
  while ((am = aRe.exec(aliasSrc))) {
    aliasMap[am[1]] = [...am[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  }
  // 중복 id 제거 (dedupeCompanies와 동일: 첫 번째 유지)
  const seen = new Set();
  const deduped = companies.filter((c) => (seen.has(c.id) ? false : (seen.add(c.id), true)));
  log(`기존 회사 추출: ${deduped.length}곳 (원시 ${companies.length}, 파일 ${files.length}개)`);
  return { companies: deduped, aliasMap };
}

// ═══════════ ② match ═══════════
function match() {
  const corpFile = join(CACHE, "corpCode.json");
  if (!existsSync(corpFile)) fail("corpCode.json 없음 — 먼저 corp-codes 실행");
  const { entries, unlisted = [] } = JSON.parse(readFileSync(corpFile, "utf8"));
  const { companies, aliasMap } = extractExistingCompanies();

  // 비상장 정확 일치 인덱스 (fallback — 사업보고서 제출 여부는 fetch에서 판별)
  const byKoUnlisted = new Map();
  for (const e of unlisted) {
    const k = normKo(e.corpName);
    byKoUnlisted.set(k, byKoUnlisted.has(k) ? "DUP" : e);
  }

  const byKo = new Map();
  const byEn = new Map();
  for (const e of entries) {
    const k = normKo(e.corpName);
    byKo.set(k, byKo.has(k) ? "DUP" : e);
    if (e.corpNameEn) {
      const en = normEn(e.corpNameEn);
      byEn.set(en, byEn.has(en) ? "DUP" : e);
    }
  }

  const auto = {};
  const proposals = [];
  const unmatched = [];
  for (const c of companies) {
    const koHit = byKo.get(normKo(c.ko));
    if (koHit && koHit !== "DUP") {
      auto[c.id] = { corpCode: koHit.corpCode, matchedBy: "auto-exact-ko", dartName: koHit.corpName };
      continue;
    }
    const enHit = c.en ? byEn.get(normEn(c.en)) : null;
    if (enHit && enHit !== "DUP") {
      auto[c.id] = { corpCode: enHit.corpCode, matchedBy: "auto-exact-en", dartName: enHit.corpName };
      continue;
    }
    // 비상장 공시법인 정확 일치 (현대카드·GS칼텍스·발전공기업 등)
    const unHit = byKoUnlisted.get(normKo(c.ko));
    if (unHit && unHit !== "DUP") {
      auto[c.id] = { corpCode: unHit.corpCode, matchedBy: "auto-exact-ko-unlisted", dartName: unHit.corpName };
      continue;
    }
    // 별칭 정확 일치 → 후보 제안 (자동 채택 금지)
    const aliasHits = (aliasMap[c.id] || [])
      .map((a) => byKo.get(normKo(a)))
      .filter((h) => h && h !== "DUP");
    if (aliasHits.length) {
      proposals.push({ id: c.id, ourKo: c.ko, tier: "T3-alias", candidates: aliasHits.map((h) => ({ corpCode: h.corpCode, name: h.corpName, stock: h.stockCode })) });
      continue;
    }
    // 부분 포함 후보 (양방향, 4자 이상)
    const nk = normKo(c.ko);
    const partial = nk.length >= 3
      ? entries.filter((e) => {
          const ek = normKo(e.corpName);
          return ek.includes(nk) || (nk.length >= 4 && nk.includes(ek) && ek.length >= 3);
        }).slice(0, 5)
      : [];
    if (partial.length) {
      proposals.push({ id: c.id, ourKo: c.ko, tier: "T4-partial", candidates: partial.map((h) => ({ corpCode: h.corpCode, name: h.corpName, stock: h.stockCode })) });
    } else {
      unmatched.push({ id: c.id, ourKo: c.ko });
    }
  }

  writeFileSync(join(CACHE, "match-auto.json"), JSON.stringify(auto, null, 1));
  writeFileSync(join(CACHE, "match-proposals.json"), JSON.stringify({ proposals, unmatched }, null, 1));
  log(`자동 매칭(정확 일치): ${Object.keys(auto).length}곳 → match-auto.json`);
  log(`수동 검수 후보: ${proposals.length}곳 → match-proposals.json`);
  log(`무매칭(비상장 등 정상 가능): ${unmatched.length}곳`);
  log(`다음: match-auto/proposals 검수 → src/data/dart/corpCodeMap.ts 작성`);
}

// 수집·집계 대상 = 상장사 전체 + (match-auto 의 비상장 매칭분)
function getTargets() {
  const corpFile = join(CACHE, "corpCode.json");
  if (!existsSync(corpFile)) fail("corpCode.json 없음 — 먼저 corp-codes 실행");
  const { entries } = JSON.parse(readFileSync(corpFile, "utf8"));
  const seen = new Set(entries.map((e) => e.corpCode));
  const add = (corpCode, corpName) => {
    if (!seen.has(corpCode)) {
      seen.add(corpCode);
      entries.push({ corpCode, corpName, stockCode: "", modifyDate: "" });
    }
  };
  const autoFile = join(CACHE, "match-auto.json");
  if (existsSync(autoFile)) {
    const auto = JSON.parse(readFileSync(autoFile, "utf8"));
    for (const m of Object.values(auto)) {
      if (m.matchedBy === "auto-exact-ko-unlisted") add(m.corpCode, m.dartName);
    }
  }
  // corpCodeMap 의 수동 매핑분(비상장 포함)도 수집 대상에 포함
  const mapFile = join(OUT_DIR, "corpCodeMap.ts");
  if (existsSync(mapFile)) {
    const mapSrc = readFileSync(mapFile, "utf8");
    const mRe = /"([a-z0-9-]+)":\s*\{\s*corpCode:\s*"(\d+)"/g;
    let mm;
    while ((mm = mRe.exec(mapSrc))) add(mm[2], mm[1]);
  }
  return entries;
}

// ═══════════ ③ fetch ═══════════
const CONCURRENCY = 4;

async function fetchData() {
  const entries = getTargets();
  const baseYear = Number(yearArg || new Date().getFullYear() - 1);
  let done = 0, skipped = 0, noData = 0, errs = 0;

  async function processOne(e) {
    const empOut = join(EMP_CACHE, `${e.corpCode}.json`);
    if (existsSync(empOut) && !FORCE) { skipped++; return; }
    try {
      let saved = false;
      for (const year of [baseYear, baseYear - 1]) {
        const j = await apiJson("empSttus.json", { corp_code: e.corpCode, bsns_year: String(year), reprt_code: "11011" });
        await sleep(100);
        if (j.status === "000" && Array.isArray(j.list) && j.list.length) {
          writeFileSync(empOut, JSON.stringify({ year, list: j.list }, null, 0));
          saved = true;
          break;
        }
      }
      if (!saved) { noData++; writeFileSync(empOut, JSON.stringify({ year: null, list: [] })); }
      const coOut = join(COMPANY_CACHE, `${e.corpCode}.json`);
      if (!existsSync(coOut)) {
        const c = await apiJson("company.json", { corp_code: e.corpCode });
        await sleep(100);
        writeFileSync(coOut, JSON.stringify(c, null, 0));
      }
    } catch (err) {
      errs++;
      log(`err ${e.corpCode} ${e.corpName}: ${err.message}`);
    }
  }

  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    await Promise.all(entries.slice(i, i + CONCURRENCY).map(processOne));
    done = Math.min(i + CONCURRENCY, entries.length);
    if (done % 200 < CONCURRENCY) log(`fetch ${done}/${entries.length} (cache-skip ${skipped}, no-data ${noData}, err ${errs})`);
  }
  log(`fetch 완료: ${done}곳 (skip ${skipped}, no-data ${noData}, err ${errs})`);
}

// ═══════════ ③-b fetch-hist (과년도 이력 — 3개년 추이용, 2026-08-23) ═══════════
// emp/ (현행 연도)와 분리된 emp-hist/{year}/ 캐시에 저장. 폴백 연도 조회 없음
// (요청 연도 사업보고서만). 기존 fetch·emit의 현행 데이터는 일절 건드리지 않는다.
async function fetchHist() {
  if (!yearArg || !/^\d{4}$/.test(String(yearArg))) fail("fetch-hist 는 --year YYYY 필수");
  const year = String(yearArg);
  const dir = join(EMP_HIST_CACHE, year);
  mkdirSync(dir, { recursive: true });
  const entries = getTargets();
  // ★실측(2026-08-23): opendart는 약 1,000건/창 단위로 허용 후 ECONNRESET 재차단.
  // 동시성 2 + 호출당 250ms 로 창 한도 아래 유지. 연속 에러 30회면 차단 재진입으로
  // 판단하고 조기 종료(에러 고속 소진 방지 — 캐시 재개형이라 다음 실행이 이어감).
  const HIST_CONCURRENCY = 2;
  const HIST_SLEEP_MS = 250;
  const MAX_CONSECUTIVE_ERRS = 30;
  let done = 0, skipped = 0, noData = 0, errs = 0, consecutiveErrs = 0, aborted = false;

  async function processOne(e) {
    const out = join(dir, `${e.corpCode}.json`);
    if (existsSync(out) && !FORCE) { skipped++; return; }
    try {
      const j = await apiJson("empSttus.json", { corp_code: e.corpCode, bsns_year: year, reprt_code: "11011" });
      await sleep(HIST_SLEEP_MS);
      consecutiveErrs = 0;
      if (j.status === "000" && Array.isArray(j.list) && j.list.length) {
        writeFileSync(out, JSON.stringify({ year: Number(year), list: j.list }, null, 0));
      } else {
        noData++;
        writeFileSync(out, JSON.stringify({ year: null, list: [] }));
      }
    } catch (err) {
      errs++;
      consecutiveErrs++;
      if (errs <= 5) log(`hist err ${e.corpCode} ${e.corpName}: ${err.message}`);
    }
  }

  for (let i = 0; i < entries.length; i += HIST_CONCURRENCY) {
    await Promise.all(entries.slice(i, i + HIST_CONCURRENCY).map(processOne));
    done = Math.min(i + HIST_CONCURRENCY, entries.length);
    if (consecutiveErrs >= MAX_CONSECUTIVE_ERRS) {
      aborted = true;
      log(`fetch-hist ${year} 조기 종료 — 연속 에러 ${consecutiveErrs}회(차단 재진입 추정). 캐시 유지, 재실행으로 이어감`);
      break;
    }
    if (done % 200 < HIST_CONCURRENCY) log(`fetch-hist ${year} ${done}/${entries.length} (skip ${skipped}, no-data ${noData}, err ${errs})`);
  }
  log(`fetch-hist ${year} ${aborted ? "중단" : "완료"}: ${done}곳 (skip ${skipped}, no-data ${noData}, err ${errs})`);
  if (aborted) process.exit(3);
}

// ── 집계 (성별합계 행 기반 가중평균) ─────────────────────────
function aggregate(list) {
  const rows = list.map((r) => ({
    headcount: num(r.sm),
    payroll: num(r.fyer_salary_totamt),
    avgPer: num(r.jan_salary_am),
    tenure: num(r.avrg_cnwk_sdytrn),
  }));
  const withPayroll = rows.filter((r) => r.payroll != null && r.headcount != null);
  let totalHead, avgWon;
  if (withPayroll.length) {
    // 정본: 급여총액 보유 행(성별합계)만으로 Σ총액/Σ인원
    totalHead = withPayroll.reduce((s, r) => s + r.headcount, 0);
    avgWon = withPayroll.reduce((s, r) => s + r.payroll, 0) / totalHead;
  } else {
    // fallback: 1인평균 × 인원 가중
    const withAvg = rows.filter((r) => r.avgPer != null && r.headcount != null);
    if (!withAvg.length) return null;
    totalHead = withAvg.reduce((s, r) => s + r.headcount, 0);
    avgWon = withAvg.reduce((s, r) => s + r.avgPer * r.headcount, 0) / totalHead;
  }
  const withTenure = rows.filter((r) => r.tenure != null && r.headcount != null);
  const tenure = withTenure.length
    ? withTenure.reduce((s, r) => s + r.tenure * r.headcount, 0) / withTenure.reduce((s, r) => s + r.headcount, 0)
    : null;
  // 교차 검증(V4): 두 방식 괴리
  let divergence = null;
  const withAvg = rows.filter((r) => r.avgPer != null && r.headcount != null);
  if (withPayroll.length && withAvg.length) {
    const alt = withAvg.reduce((s, r) => s + r.avgPer * r.headcount, 0) / withAvg.reduce((s, r) => s + r.headcount, 0);
    divergence = Math.abs(avgWon - alt) / avgWon;
  }
  return { totalHead, avgWon, tenure, divergence };
}

// ═══════════ ④ emit ═══════════
function emit() {
  const entries = getTargets();
  const results = [];
  const excluded = { V1: 0, V2: 0, V3: 0, V6: 0, "no-cache": 0, "no-data": 0 };
  const v3Queue = [];
  const currentYear = new Date().getFullYear();

  for (const e of entries) {
    const empFile = join(EMP_CACHE, `${e.corpCode}.json`);
    if (!existsSync(empFile)) { excluded["no-cache"]++; continue; }
    const { year, list } = JSON.parse(readFileSync(empFile, "utf8"));
    if (!year || !list.length) { excluded["no-data"]++; continue; }
    const agg = aggregate(list);
    if (!agg || agg.totalHead == null || agg.totalHead < 30) { excluded.V1++; continue; }
    if (agg.avgWon == null || agg.avgWon <= 0) { excluded.V2++; continue; }
    const manwonRaw = agg.avgWon / 10_000;
    if (manwonRaw < 1200 || manwonRaw > 30000) {
      excluded.V3++;
      v3Queue.push({ corpCode: e.corpCode, name: e.corpName, manwonRaw: Math.round(manwonRaw) });
      continue;
    }
    if (year < currentYear - 2) { excluded.V6++; continue; }

    let ksic;
    const coFile = join(COMPANY_CACHE, `${e.corpCode}.json`);
    if (existsSync(coFile)) ksic = JSON.parse(readFileSync(coFile, "utf8")).induty_code || undefined;

    const flags = [];
    if (agg.divergence != null && agg.divergence > 0.3) flags.push("V4-divergence");
    const tenureOk = agg.tenure != null && agg.tenure >= 0 && agg.tenure <= 40;

    results.push({
      corpCode: e.corpCode,
      stockCode: e.stockCode,
      corpNameKo: e.corpName,
      corpNameEn: e.corpNameEn,
      fiscalYear: String(year),
      avgSalaryManwon: Math.round(manwonRaw / 100) * 100,
      avgSalaryManwonRaw: Math.round(manwonRaw),
      employeeCount: agg.totalHead,
      avgTenureYears: tenureOk ? Math.round(agg.tenure * 10) / 10 : undefined,
      rceptNo: list[0].rcept_no,
      ksicCode: ksic,
      ...(flags.length ? { flags } : {}),
    });
  }

  // ── 과년도 이력 병합 (emp-hist/{year}/, 2026-08-23 3개년 추이) ──
  // primary(현행) 수치는 절대 불변 — history 필드만 추가. 각 연도에 primary와
  // 동일한 V1~V3 위생 게이트를 적용하고, 실패 연도는 조용히 제외(추정 금지).
  const histYears = existsSync(EMP_HIST_CACHE)
    ? readdirSync(EMP_HIST_CACHE).filter((d) => /^\d{4}$/.test(d)).sort().reverse()
    : [];
  if (histYears.length) {
    let histAttached = 0;
    for (const r of results) {
      const history = [];
      for (const y of histYears) {
        if (y === r.fiscalYear) continue; // primary 연도 중복 방지
        const f = join(EMP_HIST_CACHE, y, `${r.corpCode}.json`);
        if (!existsSync(f)) continue;
        const { list } = JSON.parse(readFileSync(f, "utf8"));
        if (!list || !list.length) continue;
        const agg = aggregate(list);
        if (!agg || agg.totalHead == null || agg.totalHead < 30) continue;
        if (agg.avgWon == null || agg.avgWon <= 0) continue;
        const manwon = agg.avgWon / 10_000;
        if (manwon < 1200 || manwon > 30000) continue;
        history.push({
          fiscalYear: y,
          avgSalaryManwonRaw: Math.round(manwon),
          employeeCount: agg.totalHead,
        });
      }
      if (history.length) {
        r.history = history; // 최신 연도 우선 정렬 (histYears가 내림차순)
        histAttached++;
      }
    }
    log(`history 병합: ${histYears.join(",")} — ${histAttached}곳에 이력 부착`);
  }

  results.sort((a, b) => b.employeeCount * b.avgSalaryManwonRaw - a.employeeCount * a.avgSalaryManwonRaw);
  mkdirSync(OUT_DIR, { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  const ts = `// AUTO-GENERATED by scripts/dart-etl.mjs — DO NOT EDIT.
// 재생성: node scripts/dart-etl.mjs emit  (데이터 기준일: ${today})
// 집계: 사업보고서 "직원 등의 현황" 성별합계 행의 Σ연간급여총액 ÷ Σ인원 (임원 제외).
// 검증 제외분·사유는 scripts/.dart-cache/run-report.md 참조.

export interface DartDisclosedEntry {
  corpCode: string;
  stockCode: string;
  corpNameKo: string;
  corpNameEn?: string;
  fiscalYear: string;
  /** 100만원 단위 반올림 (표시용, 기존 수기 관례) */
  avgSalaryManwon: number;
  /** 반올림 전 만원 (리포트 정밀 집계용) */
  avgSalaryManwonRaw: number;
  employeeCount: number;
  avgTenureYears?: number;
  rceptNo: string;
  ksicCode?: string;
  flags?: string[];
  /** 과년도 공시 이력 (최신 연도 우선, fetch-hist 수집분 — 추이 표시용) */
  history?: { fiscalYear: string; avgSalaryManwonRaw: number; employeeCount: number }[];
}

export const DART_DATA_DATE = "${today}";

export const dartDisclosed: DartDisclosedEntry[] = ${JSON.stringify(results, null, 1)};
`;
  writeFileSync(join(OUT_DIR, "dartDisclosed.ts"), ts);

  // ── 경량 주입 파일 — corpCodeMap 매칭분만 (클라이언트 번들 보호: 전체
  //    dartDisclosed 600KB 대신 ~360곳 컴팩트 맵. source/note 문구는
  //    CompanyRepository.enrich() 템플릿 생성) ──
  const mapFile = join(OUT_DIR, "corpCodeMap.ts");
  if (existsSync(mapFile)) {
    const mapSrc = readFileSync(mapFile, "utf8");
    const idToCorp = {};
    const mRe = /"([a-z0-9-]+)":\s*\{\s*corpCode:\s*"(\d+)"/g;
    let mm;
    while ((mm = mRe.exec(mapSrc))) idToCorp[mm[1]] = mm[2];
    const byCorp = new Map(results.map((r) => [r.corpCode, r]));
    const inj = {};
    for (const [id, corp] of Object.entries(idToCorp)) {
      const d = byCorp.get(corp);
      if (!d) continue;
      inj[id] = {
        a: d.avgSalaryManwon,
        y: d.fiscalYear,
        e: d.employeeCount,
        r: d.rceptNo,
        ...(d.avgTenureYears != null ? { t: d.avgTenureYears } : {}),
      };
    }
    const injTs = `// AUTO-GENERATED by scripts/dart-etl.mjs — DO NOT EDIT.
// 기존 회사 id → DART 공시 요약 (corpCodeMap 매칭분만, 클라이언트 번들 안전 경량판).
// a=평균연봉(만원, 100만원 반올림) y=사업연도 e=직원수 r=접수번호 t=평균근속(년)
// disclosed 문구 조립은 CompanyRepository.enrich() 참조. 기준일: ${today}

export interface DartInjectionEntry {
  a: number;
  y: string;
  e: number;
  r: string;
  t?: number;
}

export const DART_INJECTION_DATE = "${today}";

export const dartInjection: Record<string, DartInjectionEntry> = ${JSON.stringify(inj, null, 0)};
`;
    writeFileSync(join(OUT_DIR, "dartInjection.ts"), injTs);
    log(`dartInjection.ts: ${Object.keys(inj).length}곳 (corpCodeMap ${Object.keys(idToCorp).length}곳 중 데이터 보유분)`);
  } else {
    log(`corpCodeMap.ts 없음 — dartInjection.ts 생성 건너뜀`);
  }

  const report = [
    `# dart-etl run report (${today})`,
    ``,
    `- 상장사 총: ${entries.length}`,
    `- 산출(검증 통과): ${results.length}`,
    `- 제외: ${JSON.stringify(excluded)}`,
    ``,
    `## V3 수동 확인 큐 (급여 범위 밖 — 단위 오기재 의심)`,
    ...v3Queue.map((q) => `- ${q.corpCode} ${q.name}: ${q.manwonRaw.toLocaleString()}만원`),
  ].join("\n");
  writeFileSync(join(CACHE, "run-report.md"), report);
  log(`emit 완료: ${results.length}건 → src/data/dart/dartDisclosed.ts`);
  log(`제외 분포: ${JSON.stringify(excluded)} — run-report.md 참조`);
}

// ═══════════ ⑤ diff (수기 vs DART 골든 검증) ═══════════
function diffCmd() {
  const mapFile = join(OUT_DIR, "corpCodeMap.ts");
  const dataFile = join(OUT_DIR, "dartDisclosed.ts");
  if (!existsSync(mapFile) || !existsSync(dataFile)) fail("corpCodeMap.ts / dartDisclosed.ts 필요 — match 검수·emit 선행");
  const mapSrc = readFileSync(mapFile, "utf8");
  const map = {};
  const mRe = /"([a-z0-9-]+)":\s*\{\s*corpCode:\s*"(\d+)"/g;
  let mm;
  while ((mm = mRe.exec(mapSrc))) map[mm[1]] = mm[2];

  const dartSrc = readFileSync(dataFile, "utf8");
  const dartArr = JSON.parse(dartSrc.slice(dartSrc.indexOf("= [") + 2, dartSrc.lastIndexOf("];") + 1));
  const byCorp = new Map(dartArr.map((d) => [d.corpCode, d]));

  const { companies } = extractExistingCompanies();
  const rows = [];
  for (const c of companies) {
    if (!c.disclosed?.avgSalaryManwon || !map[c.id]) continue;
    const d = byCorp.get(map[c.id]);
    if (!d) { rows.push(`| ${c.id} | ${c.disclosed.avgSalaryManwon} | — | DART 데이터 없음 |`); continue; }
    const diffPct = ((d.avgSalaryManwonRaw - c.disclosed.avgSalaryManwon) / c.disclosed.avgSalaryManwon) * 100;
    const flag = Math.abs(diffPct) > 10 ? " ⚠️>10%" : "";
    const yearFlag = c.disclosed.fiscalYear && d.fiscalYear > c.disclosed.fiscalYear ? " 📅수기구형" : "";
    rows.push(`| ${c.id} | ${c.disclosed.avgSalaryManwon}(${c.disclosed.fiscalYear}) | ${d.avgSalaryManwonRaw}(${d.fiscalYear}) | ${diffPct.toFixed(1)}%${flag}${yearFlag} |`);
  }
  const report = [
    `# 수기 disclosed vs DART 골든 diff`,
    ``,
    `| id | 수기(만원) | DART Raw(만원) | 차이 |`,
    `|---|---|---|---|`,
    ...rows,
  ].join("\n");
  writeFileSync(join(CACHE, "golden-diff.md"), report);
  log(`golden diff ${rows.length}건 → scripts/.dart-cache/golden-diff.md`);
  const warns = rows.filter((r) => r.includes("⚠️")).length;
  log(warns ? `⚠️ 10% 초과 이탈 ${warns}건 — 배포 전 원인 분류 필수` : `전건 ±10% 이내 ✅`);
}

// ── main ─────────────────────────────────────────────────────
const run = {
  "corp-codes": corpCodes,
  match,
  fetch: fetchData,
  "fetch-hist": fetchHist,
  emit,
  diff: diffCmd,
  all: async () => { await corpCodes(); match(); await fetchData(); emit(); diffCmd(); },
};
await run[cmd]();
