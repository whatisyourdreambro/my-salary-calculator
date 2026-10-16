// Measure Wrangler's local dry-run output, never the entire OpenNext cache/node_modules.
// Cloudflare limits verified 2026-10-17: 64 MiB uncompressed; gzip is informational.
// https://developers.cloudflare.com/workers/platform/limits/#worker-size
// Run npm run qa:cf:check first. An explicit directory supports offline fixtures.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIR = resolve(process.argv[2] ?? join(ROOT, ".open-next-qa", ".wrangler-dry-run"));
const EXCLUDE = new Set(["nop-build-log.json", "README.md"]);
// 10진 MB(1MB = 1,000,000B) — MiB 보다 작게 잡아 보수적으로 경고한다.
const MB = 1_000_000;
const WARN_BYTES = 48 * 1024 * 1024;
const LIMIT_BYTES = 64 * 1024 * 1024;
const TOP_N = 5;

if (!existsSync(DIR) || !statSync(DIR).isDirectory()) {
  console.error(`[worker-size] 산출물 디렉터리 없음: ${DIR}`);
  console.error("  npm run qa:cf:check (로컬 dry run) 뒤에 실행하세요.");
  process.exit(1);
}

/** 디렉터리 아래 모든 파일 경로 (재귀) */
function walk(dir) {
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.isFile() && !EXCLUDE.has(ent.name) && !ent.name.endsWith(".map")) out.push(p);
  }
  return out;
}

const fmt = (n) => `${(n / MB).toFixed(2)}MB (${n.toLocaleString("en-US")}B)`;

const rows = walk(DIR).map((p) => {
  const buf = readFileSync(p);
  return { path: relative(DIR, p).split(sep).join("/"), raw: buf.length, gz: gzipSync(buf, { level: 9 }).length };
});
const totalRaw = rows.reduce((s, r) => s + r.raw, 0);
const totalGz = rows.reduce((s, r) => s + r.gz, 0);

console.log(`\n=== Worker 번들 크기 (${DIR}) ===`);
console.log(`파일 ${rows.length}개 (nop-build-log.json 제외; README/source maps 제외)`);
console.log(`비압축 합계: ${fmt(totalRaw)}`);
console.log(`gzip -9 합계: ${fmt(totalGz)}  (참고용) — 비압축 경고선 ${fmt(WARN_BYTES)}, 한도 ${fmt(LIMIT_BYTES)}`);
console.log(`\n상위 ${TOP_N}개 (gzip 기준):`);
for (const r of [...rows].sort((a, b) => b.gz - a.gz).slice(0, TOP_N)) {
  console.log(`  ${String(r.gz.toLocaleString("en-US")).padStart(11)}B gz  ${String(r.raw.toLocaleString("en-US")).padStart(11)}B raw  ${r.path}`);
}

if (totalRaw > WARN_BYTES) {
  const headroom =
    totalRaw > LIMIT_BYTES
      ? `한도 64MiB 를 ${fmt(totalRaw - LIMIT_BYTES)} 초과 — 배포 실패 위험`
      : `한도 64MiB 까지 ${fmt(LIMIT_BYTES - totalRaw)}`;
  console.log(
    `\nWARN  비압축 합계가 경고선 48MiB 를 넘었습니다 (${headroom}). ` +
      "상위 파일의 원인 모듈을 확인하세요 — edge 번들 원인 추적은 node scripts/verify-edge-bundle.mjs.",
  );
} else {
  console.log(`\nOK  경고선까지 여유 ${fmt(WARN_BYTES - totalRaw)} (한도까지 ${fmt(LIMIT_BYTES - totalRaw)})`);
}
process.exit(totalRaw > LIMIT_BYTES ? 1 : 0);
