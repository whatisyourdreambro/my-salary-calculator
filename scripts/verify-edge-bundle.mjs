// scripts/verify-edge-bundle.mjs
// edge 번들 회귀 게이트 — 서버에서 쓰지 않는 무거운 모듈이 edge 함수 번들에 다시 들어갔는지 소스맵으로 검사 (2026-09-25 B1, STAB-01·STAB-06).
//
// 배경: CF Workers 무료 플랜 CPU 10ms 한도(1102). edge 함수는 요청 처리 중 로드되므로 번들이 크면 콜드 isolate
//   첫 요청의 파싱·컴파일 비용이 곧 CPU 초과다. 2026-09-24 빌드에서
//   (1) 헤더 검색의 클라이언트 전용 import("@/lib/searchIndex") 가 glossary·qna·share·company 공유 청크에
//       인라인(약 2.9MB, 한 번도 실행되지 않음) — HeaderSearch.tsx 의 typeof window 삼항 가드로 제거,
//   (2) widget/dsr 가 모듈 스코프 assert 하나 때문에 계산기 레지스트리 전체(simpleCalculators)를 번들(1.68MB)
//       — 산식을 src/lib/widgets/dsrLimit.ts 로 분리하고 대조는 vitest 로 이전.
//   이 스크립트는 둘의 재발을 잡는다.
// 방식: .next/server/edge-chunks/*.js.map 과, middleware-manifest.json 이 edge 함수·미들웨어에 배정한
//   파일들의 .js.map 에서 sources 를 읽는다.
//   FAIL — /lib\/searchIndex(En)?\.ts|simpleCalculators\// 가 하나라도 있으면 exit 1.
//   INFO — krCompanies_Batch·guidesMeta.generated 는 edge 페이지가 실제로 쓸 수 있어 출력만 한다.
// 사용: `npm run build` 뒤 `node scripts/verify-edge-bundle.mjs [.next 디렉터리]`.
//   산출물·소스맵이 없으면 검사할 수 없으므로 exit 1(통과로 오인하지 않게).

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const NEXT_DIR = resolve(process.argv[2] ?? join(ROOT, ".next"));
const EDGE_CHUNKS = join(NEXT_DIR, "server", "edge-chunks");
const MANIFEST = join(NEXT_DIR, "server", "middleware-manifest.json");

const FAIL_RE = /lib\/searchIndex(En)?\.ts|simpleCalculators\//;
const INFO_RES = [
  ["krCompanies_Batch", /krCompanies_Batch/],
  ["guidesMeta.generated", /guidesMeta\.generated/],
];
const SHOW_MAX = 8;

if (!existsSync(EDGE_CHUNKS) || !statSync(EDGE_CHUNKS).isDirectory()) {
  console.error(`[edge-bundle] edge 청크 디렉터리 없음: ${EDGE_CHUNKS}`);
  console.error("  npm run build 뒤에 실행하세요 (검사 불가 — 통과로 간주하지 않음).");
  process.exit(1);
}

// 검사 대상 파일(.next 기준 상대 경로, 확장자 .js) → 그 파일을 쓰는 edge 함수 목록
const targets = new Map();
const addTarget = (file, owner) => {
  if (!file.endsWith(".js")) return;
  if (!targets.has(file)) targets.set(file, new Set());
  if (owner) targets.get(file).add(owner);
};
for (const name of readdirSync(EDGE_CHUNKS)) {
  if (name.endsWith(".js")) addTarget(`server/edge-chunks/${name}`, null);
}
if (existsSync(MANIFEST)) {
  const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
  for (const group of [manifest.functions ?? {}, manifest.middleware ?? {}]) {
    for (const [key, fn] of Object.entries(group)) {
      const owner = fn.page ?? key;
      for (const file of fn.files ?? []) addTarget(file, owner);
    }
  }
} else {
  console.warn(`WARN  middleware-manifest.json 없음 — edge-chunks 만 검사합니다 (${MANIFEST})`);
}

const clean = (s) => s.replace(/^webpack:\/\/[^/]*\//, "");
let scanned = 0;
let failures = 0;
const missingEdgeChunkMaps = [];
const infoLines = [];

for (const [file, owners] of [...targets].sort(([a], [b]) => a.localeCompare(b))) {
  const mapPath = join(NEXT_DIR, `${file}.map`);
  if (!existsSync(mapPath)) {
    // 매니페스트류(*-manifest.js)는 원래 소스맵이 없다. edge 청크에 맵이 없으면 검사 공백이라 기록한다.
    if (file.startsWith("server/edge-chunks/")) missingEdgeChunkMaps.push(file);
    continue;
  }
  let sources;
  try {
    sources = JSON.parse(readFileSync(mapPath, "utf8")).sources ?? [];
  } catch (e) {
    console.error(`FAIL  소스맵 파싱 실패: ${mapPath} — ${e.message}`);
    failures++;
    continue;
  }
  scanned++;
  const users = owners.size ? ` (사용: ${[...owners].join(", ")})` : "";
  // 원인 파악이 쉽도록 진입점(searchIndex*)을 먼저 보여 준다
  const hits = sources
    .map(clean)
    .filter((s) => FAIL_RE.test(s))
    .sort((a, b) => Number(/searchIndex/.test(b)) - Number(/searchIndex/.test(a)));
  if (hits.length) {
    failures++;
    console.log(`FAIL  ${file}${users} — 금지 모듈 ${hits.length}개:`);
    for (const h of hits.slice(0, SHOW_MAX)) console.log(`        ${h}`);
    if (hits.length > SHOW_MAX) console.log(`        … 외 ${hits.length - SHOW_MAX}개`);
  }
  for (const [label, re] of INFO_RES) {
    const n = sources.filter((s) => re.test(s)).length;
    if (n) infoLines.push(`INFO  ${file}${users} — ${label} ${n}개`);
  }
}

if (scanned === 0) {
  console.error(`[edge-bundle] 읽을 수 있는 소스맵이 없음 (${NEXT_DIR}) — 서버 소스맵 설정을 확인하세요. 검사 불가.`);
  process.exit(1);
}
for (const line of infoLines) console.log(line);
if (missingEdgeChunkMaps.length) {
  console.log(`WARN  소스맵 없는 edge 청크 ${missingEdgeChunkMaps.length}개 (검사 공백): ${missingEdgeChunkMaps.join(", ")}`);
}

console.log(
  `\n결과: 소스맵 ${scanned}개 검사 — ` +
    (failures
      ? `FAIL ${failures}건. 서버에서 쓰지 않는 검색 인덱스·계산기 레지스트리가 edge 번들에 들어갔습니다. ` +
        "HeaderSearch.tsx 의 typeof window 삼항 가드, widget/dsr 의 simpleCalculators 미import 를 확인하세요."
      : "금지 모듈 0건 (searchIndex·simpleCalculators 없음)"),
);
process.exit(failures ? 1 : 0);
