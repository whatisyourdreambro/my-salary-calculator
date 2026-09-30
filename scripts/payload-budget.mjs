// scripts/payload-budget.mjs
//
// 빌드 산출물 페이로드 예산(2026-09-30 WP-01 PC-04) — next build 뒤 .next 만 읽는다. 네트워크·서버 없음.
// 원자료를 어디에도 쓰지 않고 stdout 표로만 낸다.
//
// 사용법: node scripts/payload-budget.mjs --next <.next 경로> [--next <다른 .next> …] [--enforce guides,salary-db,dup]
//   npm run verify:payload  (= --next .next)
//
// 왜: 1차 SEO(seo-int 167d6faa)에서 가이드 RSC 가 +108% 늘었다. 맵 단위 게이트(salaryDbLayoutPayload.test.ts 등)는 통과했지만
//   layout 이 모듈 스코프 맵 전체를 클라이언트 컴포넌트 props 로 넘겨 하위 모든 쪽이 같은 맵을 한 번씩 싣는 구조라,
//   쪽당 합산이 조용히 커졌다. 이 스크립트는 고정 표본 9쪽의 HTML·RSC 를 직접 재서 두 규칙으로 본다.
//
// 규칙 ① 표본별 HTML·RSC brotli(품질 11) 상한 = seo-int 167d6faa 빌드 값 +10%(BUDGETS). main 이 아니라 seo-int 기준인 이유:
//   main 기준이면 10/13 SEO 푸시(가이드 HTML br +40%)가 즉시 실패한다. 정당한 증가는 BUDGETS 를 커밋 본문에 사유와 함께 올린다.
// 규칙 ② 같은 클라이언트 참조(모듈 id + export)의 props(children 제외, 참조 행 풀어서) 직렬화가 2KB 이상이고 params 가 다른
//   표본 2쪽 이상에서 바이트 동일하면 경고 — layout 맵 직렬화(쪽마다 같은 맵 전체)를 정확히 잡는다. 크기만 보는 규칙(3KB)은
//   정상 쪽별 데이터(회사 요약 등)까지 잡아서 쓰지 않는다.
//
// 도입 모드: 처음은 보고 모드(ENFORCE 비어 있음 → 경고만, exit 0).
//   - WP-08(가이드 슬롯 PC-02) 배포일: ENFORCE.families 에 "guides" 를 넣고 guides BUDGETS 를 새 값 +10% 로 다시 잡는다.
//   - WP-09(회사 PC-01) 배포일: ENFORCE.families 에 "salary-db", ENFORCE.duplicateProps = true.
//   --enforce 는 그 전환을 미리 돌려 보는 용도(커밋 없이). 종료 코드는 파이프 없이 직접 읽는다.
// 종료 코드: 0 통과(보고 모드 경고 포함) · 1 강제 규칙 위반, 인자 오류, .next·표본 파일 없음.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { brotliCompressSync, constants } from "node:zlib";
import { fileURLToPath } from "node:url";

/** 고정 표본 9쪽 — family 는 강제 전환 단위, route 는 client-reference-manifest 위치(.next/server/app/<route>/page_…). */
export const SAMPLES = [
  { page: "salary-db/samsung-electronics", template: "salary-db/[id]", route: "salary-db/[id]", family: "salary-db" },
  { page: "salary-db/listed/000020", template: "salary-db/listed/[stockCode]", route: "salary-db/listed/[stockCode]", family: "salary-db" },
  { page: "salary-db/compare/11st-vs-musinsa", template: "salary-db/compare/[slug]", route: "salary-db/compare/[slug]", family: "salary-db" },
  { page: "guides/annual-leave-allowance", template: "guides/[slug]", route: "guides/[slug]", family: "guides" },
  { page: "guides/nurse-salary", template: "guides/[slug]", route: "guides/[slug]", family: "guides" },
  { page: "calc/bmi-quick", template: "calc/[slug]", route: "calc/[slug]", family: "calc" },
  { page: "calc/samsung-bonus", template: "calc/samsung-bonus", route: "calc/samsung-bonus", family: "calc" },
  { page: "salary/50000000", template: "salary/[amount]", route: "salary/[amount]", family: "salary" },
  { page: "index", template: "/", route: "", family: "home" },
];

/**
 * 규칙 ① 상한(바이트, brotli 품질 11, Node 22.19) = seo-int 167d6faa 빌드(2026-09-29 14:20, BUILD_ID r3WJHZIARe6__4Mw3N7Oj)
 * 실측 × 1.1 올림. 주석 = 실측 HTML br / RSC br. 바꿀 때는 커밋 본문에 두 빌드의 표를 붙인다.
 * 참고 main 4ef59a4b(3301 빌드): salary-db 47,073/24,439 · 27,519/11,863 · 29,191/12,994, guides 30,996/13,169 · 30,836/12,347,
 *   calc 23,961/6,852 · 41,138/17,008, salary 27,691/9,851, 홈 29,756/11,949.
 */
export const BUDGETS = {
  "salary-db/samsung-electronics": { htmlBr: 61_741, rscBr: 35_716 }, // 56,128 / 32,469
  "salary-db/listed/000020": { htmlBr: 39_715, rscBr: 21_897 }, // 36,104 / 19,906
  "salary-db/compare/11st-vs-musinsa": { htmlBr: 41_195, rscBr: 23_063 }, // 37,450 / 20,966
  "guides/annual-leave-allowance": { htmlBr: 46_758, rscBr: 26_981 }, // 42,507 / 24,528
  "guides/nurse-salary": { htmlBr: 46_693, rscBr: 26_069 }, // 42,448 / 23,699
  "calc/bmi-quick": { htmlBr: 26_916, rscBr: 7_544 }, // 24,469 / 6,858
  "calc/samsung-bonus": { htmlBr: 44_985, rscBr: 18_403 }, // 40,895 / 16,730
  "salary/50000000": { htmlBr: 31_706, rscBr: 11_788 }, // 28,823 / 10,716
  index: { htmlBr: 32_830, rscBr: 13_218 }, // 29,845 / 12,016
};

/** 강제 전환 — 보고 모드에서는 비워 둔다(위 도입 모드 참조). */
export const ENFORCE = { families: [], duplicateProps: false };

export const DUP_MIN_BYTES = 2048;
export const BROTLI_QUALITY = 11;

export const USAGE = [
  "사용법: node scripts/payload-budget.mjs --next <.next 경로> [--next <다른 .next>] [--enforce guides,salary-db,dup]",
  "  --next P     next build 산출물 폴더(.next). 여러 번 주면 빌드별 표 + 표본별 차이 표",
  "  --enforce L  보고 모드 대신 강제할 것(쉼표): 표본 family(salary-db·guides·calc·salary·home) 또는 dup(규칙 ②)",
].join("\n");

const br = (buf) => brotliCompressSync(buf, { params: { [constants.BROTLI_PARAM_QUALITY]: BROTLI_QUALITY } }).length;
const fmt = (n) => (n == null ? "-" : n.toLocaleString("en-US"));

// ── RSC(flight) 해석 ─────────────────────────────────────────────────────────

/** .rsc 바이트 → 행 Map(id → { tag, body | text }). 'T<hex 길이>,' 텍스트 행은 길이만큼 읽는다. */
export function parseFlightRows(buf) {
  const rows = new Map();
  let p = 0;
  while (p < buf.length) {
    const colon = buf.indexOf(0x3a, p);
    if (colon < 0) break;
    const id = buf.subarray(p, colon).toString();
    let q = colon + 1;
    let tag = "";
    while (q < buf.length && buf[q] >= 0x41 && buf[q] <= 0x5a) tag += String.fromCharCode(buf[q++]);
    if (tag === "T") {
      const comma = buf.indexOf(0x2c, q);
      const len = parseInt(buf.subarray(q, comma).toString(), 16);
      const start = comma + 1;
      rows.set(id, { tag, text: buf.subarray(start, start + len).toString() });
      p = start + len;
      continue;
    }
    const nl = buf.indexOf(0x0a, q);
    const end = nl < 0 ? buf.length : nl;
    rows.set(id, { tag, body: buf.subarray(q, end).toString() });
    p = end + 1;
  }
  return rows;
}

/**
 * 클라이언트 컴포넌트 요소(["$","$L<id>",key,props])마다 { ref, keys, bytes, hash }.
 * ref = I 행의 '모듈 id#export'. props 는 children 을 빼고 '$<id>'·'$@<id>' 참조(모델·텍스트 행)를 풀어 직렬화한다 —
 * 행 번호는 쪽마다 달라도 내용이 같으면 같은 해시가 되게.
 */
export function clientPropsBlobs(buf) {
  const rows = parseFlightRows(buf);
  const imports = new Map();
  const models = new Map();
  const texts = new Map();
  for (const [id, r] of rows) {
    if (r.tag === "I") {
      try {
        imports.set(id, JSON.parse(r.body));
      } catch {
        /* 모르는 형식은 참조 이름만 쓴다 */
      }
    } else if (r.tag === "T") texts.set(id, r.text);
    else if (r.tag === "" && r.body) {
      try {
        models.set(id, JSON.parse(r.body));
      } catch {
        /* 모델이 아닌 행 */
      }
    }
  }
  const resolve = (v, seen = new Set()) => {
    if (typeof v === "string") {
      const m = /^\$@?([0-9a-f]+)$/.exec(v);
      if (m && !seen.has(m[1])) {
        if (texts.has(m[1])) return texts.get(m[1]);
        if (models.has(m[1])) return resolve(models.get(m[1]), new Set([...seen, m[1]]));
      }
      return v;
    }
    if (Array.isArray(v)) return v.map((x) => resolve(x, seen));
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolve(x, seen)]));
    return v;
  };
  const refName = (lid) => {
    const imp = imports.get(lid);
    if (Array.isArray(imp)) return `${imp[0]}#${imp[2] ?? ""}`;
    if (imp && typeof imp === "object") return `${imp.id}#${imp.name ?? ""}`;
    return `$L${lid}`;
  };
  const out = [];
  const walk = (v) => {
    if (Array.isArray(v)) {
      if (v[0] === "$" && typeof v[1] === "string" && /^\$L[0-9a-f]+$/.test(v[1]) && v[3] && typeof v[3] === "object") {
        const props = { ...v[3] };
        delete props.children;
        const blob = JSON.stringify(resolve(props));
        out.push({
          ref: refName(v[1].slice(2)),
          keys: Object.keys(props).sort().join(","),
          bytes: Buffer.byteLength(blob),
          hash: crypto.createHash("sha256").update(blob).digest("hex"),
        });
        if (v[3].children !== undefined) walk(v[3].children);
        return;
      }
      v.forEach(walk);
    } else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  for (const m of models.values()) walk(m);
  return out;
}

/** client-reference-manifest 에서 모듈 id → 소스 경로(src/… 또는 node_modules/…). 없으면 빈 Map. */
export function moduleSources(nextDir, route) {
  const file = path.join(nextDir, "server", "app", route, "page_client-reference-manifest.js");
  const out = new Map();
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return out;
  }
  for (const m of text.matchAll(/"((?:[^"\\]|\\.)+?\.(?:tsx|ts|jsx|js|mjs))":\{"id":"?(\d+)"?/g)) {
    const src = m[1].replace(/\\\\/g, "/");
    const at = src.search(/\/(?:src|node_modules)\//);
    out.set(m[2], at >= 0 ? src.slice(at + 1) : src);
  }
  return out;
}

// ── 측정·판정 ────────────────────────────────────────────────────────────────

/** 한 빌드의 표본 9쪽 측정. 표본 파일이 없으면 error 를 채운다. */
export function measureBuild(nextDir, samples = SAMPLES) {
  const app = path.join(nextDir, "server", "app");
  let buildId = null;
  try {
    buildId = fs.readFileSync(path.join(nextDir, "BUILD_ID"), "utf8").trim();
  } catch {
    return { nextDir, buildId, error: `BUILD_ID 없음 — next build 산출물이 아닙니다: ${nextDir}`, rows: [] };
  }
  const rows = [];
  const names = new Map();
  for (const s of samples) {
    const htmlFile = path.join(app, `${s.page}.html`);
    const rscFile = path.join(app, `${s.page}.rsc`);
    if (!fs.existsSync(htmlFile) || !fs.existsSync(rscFile)) {
      rows.push({ ...s, error: `표본 파일 없음: ${s.page}.html/.rsc` });
      continue;
    }
    const html = fs.readFileSync(htmlFile);
    const rsc = fs.readFileSync(rscFile);
    for (const [id, src] of moduleSources(nextDir, s.route)) if (!names.has(id)) names.set(id, src);
    rows.push({ ...s, html: html.length, htmlBr: br(html), rsc: rsc.length, rscBr: br(rsc), blobs: clientPropsBlobs(rsc) });
  }
  return { nextDir, buildId, rows, names };
}

/** 규칙 ② — 같은 참조·같은 바이트의 2KB 이상 props 가 서로 다른 표본 2쪽 이상에 있으면 한 건. */
export function duplicateProps(rows, minBytes = DUP_MIN_BYTES) {
  const groups = new Map();
  for (const r of rows) {
    if (!r.blobs) continue;
    for (const b of r.blobs) {
      if (b.bytes < minBytes) continue;
      const key = `${b.ref}\u0000${b.hash}`;
      const g = groups.get(key) ?? { ref: b.ref, keys: b.keys, bytes: b.bytes, pages: new Set() };
      g.pages.add(r.page);
      groups.set(key, g);
    }
  }
  return [...groups.values()]
    .filter((g) => g.pages.size >= 2)
    .map((g) => ({ ...g, pages: [...g.pages] }))
    .sort((a, b) => b.bytes - a.bytes || (a.ref < b.ref ? -1 : 1));
}

/** 규칙 ① 판정 — 표본별 { over: [...], enforced }. */
export function budgetVerdicts(rows, { budgets = BUDGETS, enforce = ENFORCE } = {}) {
  return rows.map((r) => {
    if (r.error) return { page: r.page, error: r.error, over: [], enforced: false };
    const b = budgets[r.page];
    const over = [];
    if (!b) over.push({ what: "budget", note: "상한 없음(BUDGETS 에 표본 추가 필요)" });
    else
      for (const k of ["htmlBr", "rscBr"])
        if (r[k] > b[k]) over.push({ what: k, value: r[k], limit: b[k], pct: ((r[k] / b[k] - 1) * 100).toFixed(1) });
    return { page: r.page, over, enforced: enforce.families.includes(r.family) };
  });
}

export function report(build, { budgets = BUDGETS, enforce = ENFORCE } = {}) {
  const lines = [`## payload-budget — ${build.nextDir} (BUILD_ID ${build.buildId ?? "?"})`, ""];
  if (build.error) return { lines: [...lines, `오류: ${build.error}`], failures: 1, warnings: 0 };
  const verdicts = budgetVerdicts(build.rows, { budgets, enforce });
  let failures = 0;
  let warnings = 0;
  lines.push("규칙 ① 표본별 brotli(품질 11) 상한 = seo-int 167d6faa 빌드 +10%");
  lines.push("");
  lines.push("| 표본 | 템플릿 | HTML | HTML br | 상한 | RSC | RSC br | 상한 | 판정 |");
  lines.push("|---|---|---:|---:|---:|---:|---:|---:|---|");
  build.rows.forEach((r, i) => {
    const v = verdicts[i];
    if (r.error) {
      failures++;
      lines.push(`| ${r.page} | ${r.template} | - | - | - | - | - | - | 오류: ${r.error} |`);
      return;
    }
    const b = budgets[r.page] ?? {};
    let verdict = "OK";
    if (v.over.length) {
      const what = v.over.map((o) => (o.what === "budget" ? o.note : `${o.what === "htmlBr" ? "HTML" : "RSC"} br +${o.pct}%`)).join(", ");
      verdict = v.enforced ? `FAIL(강제) ${what}` : `WARN ${what}`;
      if (v.enforced) failures++;
      else warnings++;
    }
    lines.push(
      `| ${r.page} | ${r.template} | ${fmt(r.html)} | ${fmt(r.htmlBr)} | ${fmt(b.htmlBr)} | ${fmt(r.rsc)} | ${fmt(r.rscBr)} | ${fmt(b.rscBr)} | ${verdict} |`
    );
  });
  const dups = duplicateProps(build.rows);
  lines.push("");
  lines.push(`규칙 ② 쪽 간 중복 props(${fmt(DUP_MIN_BYTES)}B 이상, 서로 다른 표본 2쪽 이상에서 바이트 동일) — ${dups.length}건${enforce.duplicateProps ? "(강제)" : "(보고)"}`);
  if (dups.length) {
    lines.push("");
    lines.push("| 클라이언트 참조 | 소스 | props 키 | 바이트 | 표본 |");
    lines.push("|---|---|---|---:|---|");
    for (const d of dups) {
      const src = build.names?.get(d.ref.split("#")[0]) ?? "-";
      lines.push(`| ${d.ref} | ${src} | ${d.keys} | ${fmt(d.bytes)} | ${d.pages.join(", ")} |`);
    }
    if (enforce.duplicateProps) failures += dups.length;
    else warnings += dups.length;
  }
  return { lines, failures, warnings, verdicts, dups };
}

/** 두 빌드 이상일 때 표본별 차이(첫 빌드 대비). */
export function compareTable(builds) {
  const [a, ...rest] = builds;
  const lines = ["## 빌드 간 차이(첫 --next 대비, brotli 바이트)", ""];
  const head = ["표본", ...rest.flatMap((_, i) => [`HTML br Δ${i + 2}`, `RSC br Δ${i + 2}`])];
  lines.push(`| ${head.join(" | ")} |`, `|---|${head.slice(1).map(() => "---:").join("|")}|`);
  for (const s of SAMPLES) {
    const ra = a.rows.find((r) => r.page === s.page);
    const cells = rest.flatMap((b) => {
      const rb = b.rows.find((r) => r.page === s.page);
      if (!ra || !rb || ra.error || rb.error) return ["-", "-"];
      const d = (k) => `${rb[k] - ra[k] >= 0 ? "+" : ""}${fmt(rb[k] - ra[k])} (${((rb[k] / ra[k] - 1) * 100).toFixed(1)}%)`;
      return [d("htmlBr"), d("rscBr")];
    });
    lines.push(`| ${s.page} | ${cells.join(" | ")} |`);
  }
  return lines;
}

export function parseArgs(argv) {
  const o = { next: [], enforce: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") {
      o.help = true;
      continue;
    }
    const m = /^--(next|enforce)(?:=(.*))?$/s.exec(a);
    if (!m) return { error: `알 수 없는 인자: ${a}` };
    const v = m[2] ?? argv[++i];
    if (v === undefined || v === "") return { error: `--${m[1]} 값이 없습니다` };
    if (m[1] === "next") o.next.push(v);
    else {
      const items = v.split(",").map((s) => s.trim()).filter(Boolean);
      const families = [...new Set(SAMPLES.map((s) => s.family))];
      const bad = items.filter((x) => x !== "dup" && !families.includes(x));
      if (bad.length) return { error: `--enforce 에 모르는 값: ${bad.join(", ")} (가능: ${families.join(", ")}, dup)` };
      o.enforce = { families: items.filter((x) => x !== "dup"), duplicateProps: items.includes("dup") };
    }
  }
  if (!o.help && !o.next.length) return { error: "--next <.next 경로> 가 필요합니다" };
  return { opts: o };
}

export function main(argv, { stdout = (s) => process.stdout.write(s), stderr = (s) => process.stderr.write(s), cwd = process.cwd() } = {}) {
  const parsed = parseArgs(argv);
  if (parsed.error) {
    stderr(`${parsed.error}\n${USAGE}\n`);
    return 1;
  }
  if (parsed.opts.help) {
    stdout(`${USAGE}\n`);
    return 0;
  }
  const enforce = parsed.opts.enforce ?? ENFORCE;
  const builds = parsed.opts.next.map((p) => measureBuild(path.resolve(cwd, p)));
  let failures = 0;
  let warnings = 0;
  const out = [];
  for (const b of builds) {
    const r = report(b, { enforce });
    out.push(...r.lines, "");
    failures += r.failures;
    warnings += r.warnings;
  }
  if (builds.length > 1 && builds.every((b) => !b.error)) out.push(...compareTable(builds), "");
  const mode = enforce.families.length || enforce.duplicateProps ? `강제: ${[...enforce.families, ...(enforce.duplicateProps ? ["dup"] : [])].join(",")}` : "보고 모드";
  out.push(`[verify:payload] ${mode} · 빌드 ${builds.length} · 강제 위반·오류 ${failures} · 경고 ${warnings} → exit ${failures ? 1 : 0}`);
  stdout(`${out.join("\n")}\n`);
  return failures ? 1 : 0;
}

const isDirectRun = (() => {
  if (!process.argv[1]) return false;
  const a = path.resolve(process.argv[1]);
  const b = fileURLToPath(import.meta.url);
  return process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b;
})();

if (isDirectRun) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (e) {
    process.stderr.write(`payload-budget 예외: ${e?.stack ?? e}\n`);
    process.exitCode = 1;
  }
}
