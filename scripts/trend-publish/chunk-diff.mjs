// scripts/trend-publish/chunk-diff.mjs — 클라이언트 청크 변경 게이트 (2026-09-26 R5 publisher, critic fix 2026-09-26 v2)
//
// 사용:
//   node scripts/trend-publish/chunk-diff.mjs manifest --next <.next> --out <json>
//   node scripts/trend-publish/chunk-diff.mjs compare --base <json> --brief <json> --slug <slug> --next <브리프 .next>
//        [--runtime-exempt <정규식>]… [--metrics <site-metrics.generated.ts> --metrics-base <git ref> --repo <dir>]
//        [--report <json>] [--report-only]
//   node scripts/trend-publish/chunk-diff.mjs status --repo <dir> --allow <정규식>…
// manifest(v2): .next/static/** 마다 {sha256, norm, numless} — 빌드 ID 디렉터리(.next/static/<BUILD_ID>/, 매 빌드 달라짐)는 뺀다.
//   norm    = 정규화한 내용의 해시. webpack 청크 머리의 청크 id 배열, 엔트리 의존 청크 목록 e.O(0,[…]), 동적 로드 n.e(123),
//             파일 이름 속 16자리 내용 해시를 지운다 — 같은 소스를 두 번 빌드해도 청크 id 배열 순서·청크 이름이 바뀌기 때문
//             (2026-09-26 dry-run 실측: 같은 소스 두 번 빌드에 클라이언트 청크 66개 이름·해시가 바뀜).
//   numless = norm 에서 숫자를 모두 # 로 바꾼 해시 — 사이트 수치(GUIDE_COUNT 등)만 바뀐 청크를 알아보는 데 쓴다.
// compare: 청크를 이름이 아니라 내용(norm)으로 짝짓는다. 기준 빌드에 같은 norm 이 있으면 '이름·순서만 바뀜'.
//   norm 이 새로운 청크는 ① 브리프 slug 를 담았거나 ② webpack 런타임(config.chunkDiff.runtimeExempt)이거나
//   ③ 숫자만 바뀌었고(numless 가 기준에 있음) 바뀐 사이트 수치(site-metrics.generated.ts, 기준 커밋 대비)의 새 값을 담았으면 통과.
//   그 밖(날짜 의존 시즌 블록·다른 커밋이 번들을 바꿈)은 실패 — --report-only 면 보고만 하고 0 으로 끝난다.
//   캐시 안전은 이 게이트만이 아니라 ad-sequence · verify:autoads · CF_PURGE_OK/--manual-purge-ack · verify-prod 낡은 청크 검사가 함께 맡는다.
// status: 빌드 뒤 git status — prebuild 생성 파일이 허용목록 밖에서 바뀌면 실패(예: seasonKey.generated.ts 날짜 전환). 독립 단계(prebuild-status).
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const MANIFEST_VERSION = 2;
const sha = (x) => createHash("sha256").update(x).digest("hex");

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

/** 빌드마다 달라지는 청크 지도 참조를 지운 내용 — 순수 함수(테스트용 export) */
export function normalizeChunk(text) {
  return (
    text
      // 청크 머리 (self.webpackChunk_N_E=self.webpackChunk_N_E||[]).<등록>([[id,…], — id 배열 순서가 빌드마다 다르다
      .replace(/(\(self\.webpackChunk_N_E=self\.webpackChunk_N_E\|\|\[\]\)\.\w+\(\[\[)[\d,]*(\])/, "$1#$2")
      // 엔트리 의존 청크 목록 e.O(0,[id,…],…) — 다른 청크의 id 가 바뀌면 따라 바뀐다
      .replace(/(\.O\(0,\[)[\d,]*(\])/g, "$1#$2")
      // 동적 청크 로드 n.e(123)
      .replace(/\b([A-Za-z_$][\w$]*)\.e\(\d+\)/g, "$1.e(#)")
      // 청크·CSS 파일 이름 속 16자리 내용 해시
      .replace(/[-.][0-9a-f]{16}(\.js|\.css)\b/g, ".#$1")
  );
}
/** 숫자 가리기 — 사이트 수치만 바뀐 청크 판별용 */
export const maskNumbers = (text) => text.replace(/\d+/g, "#");

/** 파일 한 개의 목록 항목 — .js 만 정규화(그 밖은 원본 해시) */
export function fileEntry(rel, buf) {
  const raw = sha(buf);
  if (!rel.endsWith(".js")) return { sha256: raw, norm: raw, numless: raw };
  const n = normalizeChunk(buf.toString("utf8"));
  return { sha256: raw, norm: sha(n), numless: sha(maskNumbers(n)) };
}

export function buildManifest(nextDir) {
  const staticDir = join(nextDir, "static");
  const buildId = existsSync(join(nextDir, "BUILD_ID")) ? readFileSync(join(nextDir, "BUILD_ID"), "utf8").trim() : "";
  const files = {};
  for (const file of walk(staticDir)) {
    const rel = relative(staticDir, file).replace(/\\/g, "/");
    if (buildId && rel.startsWith(`${buildId}/`)) continue;
    files[rel] = fileEntry(rel, readFileSync(file));
  }
  return { version: MANIFEST_VERSION, buildId, files };
}

/** v1(평면 {이름: 해시}) 목록도 받는다 — 그때는 정규화 없이 원본 해시로만 짝짓는다 */
export function manifestFiles(m) {
  if (m && m.version === MANIFEST_VERSION && m.files) return m.files;
  return Object.fromEntries(Object.entries(m ?? {}).map(([k, v]) => [k, { sha256: v, norm: v, numless: v }]));
}

/** site-metrics.generated.ts 의 `export const NAME = 123;` 값 */
export function parseMetrics(text) {
  return Object.fromEntries([...String(text ?? "").matchAll(/export const ([A-Z0-9_]+) = (\d+);/g)].map((m) => [m[1], Number(m[2])]));
}
/** 기준 대비 바뀐 사이트 수치 [{name, from, to}] */
export function metricChanges(currentText, baseText) {
  const cur = parseMetrics(currentText);
  const base = parseMetrics(baseText);
  return Object.keys(cur)
    .filter((k) => base[k] !== undefined && base[k] !== cur[k])
    .map((k) => ({ name: k, from: base[k], to: cur[k] }));
}

/**
 * 기준 목록 대비 브리프 목록 분류. readChunk(name) 은 브리프 빌드의 청크 내용.
 * 돌려주는 errs 가 비어 있으면 통과. changed = 원본 해시가 달라진 파일 수(이름·순서만 바뀐 것 포함).
 */
export function compareManifests(base, brief, { slug, readChunk, runtimeExempt = [], metrics = [] }) {
  const exempt = runtimeExempt.map((s) => (s instanceof RegExp ? s : new RegExp(s)));
  const b = manifestFiles(base);
  const baseNorm = new Set(Object.values(b).map((f) => f.norm));
  const baseNumless = new Set(Object.values(b).map((f) => f.numless));
  const newValues = metrics.map((m) => String(m.to));
  const out = { errs: [], changed: 0, unchanged: 0, renamedOnly: 0, slug: [], runtime: [], metricOnly: [] };
  const add = (list, x) => list.splice(list.length, 0, x);
  for (const [name, f] of Object.entries(manifestFiles(brief))) {
    if (b[name]?.sha256 === f.sha256) {
      out.unchanged++;
      continue;
    }
    out.changed++;
    if (baseNorm.has(f.norm)) {
      out.renamedOnly++;
      continue;
    }
    const leaf = name.split("/").pop();
    if (exempt.some((re) => re.test(leaf))) {
      add(out.runtime, name);
      continue;
    }
    const text = readChunk(name);
    if (slug && text.includes(slug)) {
      add(out.slug, name);
      continue;
    }
    if (baseNumless.has(f.numless) && newValues.some((v) => new RegExp(`(?<![\\d.])${v}(?![\\d.])`).test(text))) {
      add(out.metricOnly, name);
      continue;
    }
    add(out.errs, `${b[name] ? "바뀐" : "새"} 청크에 브리프 slug 없음(사이트 수치만 바뀐 것도 아님): ${name}`);
  }
  return out;
}

/** git status --porcelain 줄 → 허용목록 밖 변경 */
export function statusViolations(porcelain, allow) {
  const res = allow.map((s) => (s instanceof RegExp ? s : new RegExp(s)));
  return porcelain
    .split(/\r?\n/)
    .map((l) => l.slice(3).trim().replace(/^"|"$/g, ""))
    .filter(Boolean)
    .filter((f) => !res.some((re) => re.test(f)));
}

function args(argv, name) {
  const out = [];
  argv.forEach((a, i) => {
    if (a === name && argv[i + 1]) out.splice(out.length, 0, argv[i + 1]);
  });
  return out;
}
const arg = (argv, name) => args(argv, name)[0];

export function main(argv = process.argv) {
  const cmd = argv[2];
  if (cmd === "manifest") {
    const nextDir = resolve(arg(argv, "--next") ?? ".next");
    const out = arg(argv, "--out");
    const m = buildManifest(nextDir);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, `${JSON.stringify(m, null, 2)}\n`, "utf8");
    console.log(`[chunk-diff] 청크 ${Object.keys(m.files).length}개 기록 (v${MANIFEST_VERSION} 정규화 목록)`);
    return 0;
  }
  if (cmd === "compare") {
    const reportOnly = argv.includes("--report-only");
    const nextDir = resolve(arg(argv, "--next") ?? ".next");
    const basePath = arg(argv, "--base");
    const briefPath = arg(argv, "--brief");
    if (!basePath || !briefPath || !existsSync(basePath) || !existsSync(briefPath)) {
      console.error(`[chunk-diff] 목록 파일 없음: --base ${basePath} --brief ${briefPath}`);
      return 2;
    }
    const base = JSON.parse(readFileSync(basePath, "utf8"));
    const brief = JSON.parse(readFileSync(briefPath, "utf8"));
    const slug = arg(argv, "--slug");
    let metrics = [];
    const metricsPath = arg(argv, "--metrics");
    const metricsBase = arg(argv, "--metrics-base");
    if (metricsPath && metricsBase) {
      const repo = resolve(arg(argv, "--repo") ?? process.cwd());
      const rel = relative(repo, resolve(metricsPath)).replace(/\\/g, "/");
      const baseText = execFileSync("git", ["-C", repo, "show", `${metricsBase}:${rel}`], { encoding: "utf8" });
      metrics = metricChanges(readFileSync(metricsPath, "utf8"), baseText);
    }
    const res = compareManifests(base, brief, {
      slug,
      runtimeExempt: args(argv, "--runtime-exempt"),
      metrics,
      readChunk: (name) => readFileSync(join(nextDir, "static", name), "utf8"),
    });
    const summary =
      `바뀐 파일 ${res.changed}개 — 이름·순서만 ${res.renamedOnly} · slug 포함 ${res.slug.length} · 런타임 ${res.runtime.length} · ` +
      `사이트 수치만 ${res.metricOnly.length}${metrics.length ? ` (${metrics.map((m) => `${m.name} ${m.from}→${m.to}`).join(", ")})` : ""} · 그 밖 ${res.errs.length}`;
    const report = arg(argv, "--report");
    if (report) {
      mkdirSync(dirname(report), { recursive: true });
      writeFileSync(report, `${JSON.stringify({ slug, summary, metrics, ...res, baseVersion: base?.version ?? 1 }, null, 2)}\n`, "utf8");
    }
    if (base?.version !== MANIFEST_VERSION) console.error("[chunk-diff] 기준 목록이 v1(정규화 없음) — 기준 빌드 목록을 다시 만들 것");
    if (res.errs.length) {
      for (const e of res.errs.slice(0, 30)) console.error(`[chunk-diff] ${e}`);
      console.error(`[chunk-diff] ${summary}${reportOnly ? " — --report-only: 보고만" : ""}`);
      return reportOnly ? 0 : 1;
    }
    console.log(`[chunk-diff] ${summary} — 통과`);
    return 0;
  }
  if (cmd === "status") {
    const repo = resolve(arg(argv, "--repo") ?? process.cwd());
    const porcelain = execFileSync("git", ["-C", repo, "status", "--porcelain", "--untracked-files=all"], { encoding: "utf8" });
    const bad = statusViolations(porcelain, args(argv, "--allow"));
    if (bad.length) {
      for (const f of bad) console.error(`[chunk-diff] 허용 밖 변경(빌드 전후 생성 파일 포함): ${f}`);
      return 1;
    }
    console.log("[chunk-diff] git status — 허용목록 안");
    return 0;
  }
  console.error("사용: chunk-diff.mjs manifest|compare|status …");
  return 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exit(main());
}
