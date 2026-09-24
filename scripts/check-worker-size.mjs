// scripts/check-worker-size.mjs
// Cloudflare Worker 번들 압축 크기 추정 — 무료 플랜 Worker 한도 3MB(압축) 근접 경고 (2026-09-25 B1, STAB-05).
//
// 배경: 2026-09-24 로컬 CF 빌드 기준 _worker.js 파일별 gzip -9 합계 2,307,938B(비압축 11.67MB).
//   상위 = 공유 청크(헤더 검색 인덱스 인라인) 751KB·resvg wasm 530KB·widget/dsr 302KB·og 143KB·index.js 109KB.
//   회사·계산기가 늘 때마다 커지는 구조라, 한도를 넘으면 배포 자체가 실패한다.
// 방식: .vercel/output/static/_worker.js 아래 모든 파일을 파일별 gzip -9 해서 합산(nop-build-log.json 제외).
//   CF 가 업로드 때 재는 값의 근사치다(정확한 값은 wrangler 업로드 로그).
// 사용: 로컬 CF 빌드(vercel build → npx @cloudflare/next-on-pages@1.13.16 --skip-build → cp _routes.json public/_routes.json)
//   뒤 수동으로 `node scripts/check-worker-size.mjs [출력 디렉터리]`. CI 필수 게이트가 아니다.
// 종료 코드: 합계가 경고선(2.5MB)을 넘어도 exit 0(WARN 출력만). 산출물이 없으면 exit 1.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIR = resolve(process.argv[2] ?? join(ROOT, ".vercel", "output", "static", "_worker.js"));
const EXCLUDE = new Set(["nop-build-log.json"]);
// 10진 MB(1MB = 1,000,000B) — MiB 보다 작게 잡아 보수적으로 경고한다.
const MB = 1_000_000;
const WARN_BYTES = 2.5 * MB;
const LIMIT_BYTES = 3 * MB;
const TOP_N = 5;

if (!existsSync(DIR) || !statSync(DIR).isDirectory()) {
  console.error(`[worker-size] 산출물 디렉터리 없음: ${DIR}`);
  console.error("  로컬 CF 빌드(vercel build → next-on-pages --skip-build) 뒤에 실행하세요.");
  process.exit(1);
}

/** 디렉터리 아래 모든 파일 경로 (재귀) */
function walk(dir) {
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.isFile() && !EXCLUDE.has(ent.name)) out.push(p);
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
console.log(`파일 ${rows.length}개 (${[...EXCLUDE].join(", ")} 제외)`);
console.log(`비압축 합계: ${fmt(totalRaw)}`);
console.log(`gzip -9 합계: ${fmt(totalGz)}  — 경고선 ${fmt(WARN_BYTES)}, 한도 ${fmt(LIMIT_BYTES)}`);
console.log(`\n상위 ${TOP_N}개 (gzip 기준):`);
for (const r of [...rows].sort((a, b) => b.gz - a.gz).slice(0, TOP_N)) {
  console.log(`  ${String(r.gz.toLocaleString("en-US")).padStart(11)}B gz  ${String(r.raw.toLocaleString("en-US")).padStart(11)}B raw  ${r.path}`);
}

if (totalGz > WARN_BYTES) {
  const headroom =
    totalGz > LIMIT_BYTES
      ? `한도 3MB 를 ${fmt(totalGz - LIMIT_BYTES)} 초과 — 배포 실패 위험`
      : `한도 3MB 까지 ${fmt(LIMIT_BYTES - totalGz)}`;
  console.log(
    `\nWARN  gzip 합계가 경고선 2.5MB 를 넘었습니다 (${headroom}). ` +
      "상위 파일의 원인 모듈을 확인하세요 — edge 번들 원인 추적은 node scripts/verify-edge-bundle.mjs.",
  );
} else {
  console.log(`\nOK  경고선까지 여유 ${fmt(WARN_BYTES - totalGz)} (한도까지 ${fmt(LIMIT_BYTES - totalGz)})`);
}
process.exit(0);
