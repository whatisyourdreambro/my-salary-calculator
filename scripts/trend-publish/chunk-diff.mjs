// scripts/trend-publish/chunk-diff.mjs — 클라이언트 청크 변경 게이트 (2026-09-26 R5 publisher)
//
// 사용:
//   node scripts/trend-publish/chunk-diff.mjs manifest --next <.next> --out <json>
//   node scripts/trend-publish/chunk-diff.mjs compare --base <json> --brief <json> --slug <slug> --next <브리프 .next> [--runtime-exempt <정규식>]…
//   node scripts/trend-publish/chunk-diff.mjs status --repo <dir> --allow <정규식>…
// manifest: .next/static/** {name, sha256} — 빌드 ID 디렉터리(.next/static/<BUILD_ID>/, 매 빌드 달라짐)는 뺀다.
// compare: 새로 생기거나 내용이 바뀐 청크는 모두 브리프 slug 를 담고 있어야 한다(목록·검색 카드 청크).
//          slug 가 없는 청크가 바뀌었다 = 브리프가 아닌 무언가(날짜 의존 시즌 블록·다른 커밋)가 번들을 바꿨다 → 실패.
//          webpack 런타임(청크 해시 지도)은 다른 청크가 바뀌면 따라 바뀌므로 config.chunkDiff.runtimeExempt 로만 예외.
// status: 빌드 뒤 git status — prebuild 생성 파일이 허용목록 밖에서 바뀌면 실패(예: seasonKey.generated.ts 날짜 전환).
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

export function buildManifest(nextDir) {
  const staticDir = join(nextDir, "static");
  const buildId = existsSync(join(nextDir, "BUILD_ID")) ? readFileSync(join(nextDir, "BUILD_ID"), "utf8").trim() : "";
  const out = {};
  for (const file of walk(staticDir)) {
    const rel = relative(staticDir, file).replace(/\\/g, "/");
    if (buildId && rel.startsWith(`${buildId}/`)) continue;
    out[rel] = createHash("sha256").update(readFileSync(file)).digest("hex");
  }
  return out;
}

/** 위반 목록 — readChunk(name) 은 브리프 빌드의 청크 내용 */
export function compareManifests(base, brief, { slug, readChunk, runtimeExempt = [] }) {
  const errs = [];
  const exempt = runtimeExempt.map((s) => (s instanceof RegExp ? s : new RegExp(s)));
  let changed = 0;
  for (const [name, hash] of Object.entries(brief)) {
    if (base[name] === hash) continue;
    changed++;
    const leaf = name.split("/").pop();
    if (exempt.some((re) => re.test(leaf))) continue;
    const text = readChunk(name);
    if (!text.includes(slug)) errs.splice(errs.length, 0, `${base[name] ? "바뀐" : "새"} 청크에 브리프 slug 없음: ${name}`);
  }
  return { errs, changed };
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
    console.log(`[chunk-diff] 청크 ${Object.keys(m).length}개 기록`);
    return 0;
  }
  if (cmd === "compare") {
    const nextDir = resolve(arg(argv, "--next") ?? ".next");
    const base = JSON.parse(readFileSync(arg(argv, "--base"), "utf8"));
    const brief = JSON.parse(readFileSync(arg(argv, "--brief"), "utf8"));
    const slug = arg(argv, "--slug");
    const { errs, changed } = compareManifests(base, brief, {
      slug,
      runtimeExempt: args(argv, "--runtime-exempt"),
      readChunk: (name) => readFileSync(join(nextDir, "static", name), "utf8"),
    });
    if (errs.length) {
      for (const e of errs) console.error(`[chunk-diff] ${e}`);
      return 1;
    }
    console.log(`[chunk-diff] 바뀐·새 청크 ${changed}개 — 모두 브리프 slug 포함(런타임 예외 제외)`);
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
