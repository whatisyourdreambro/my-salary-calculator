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
// 방식: 선택적 edge-chunks 및 middleware-manifest가 배정한 파일의 소스맵을 검사한다.
//   Next 15/OpenNext의 Node DSR는 app-paths-manifest와 NFT trace로 참조 서버 청크까지 검사한다.
//   FAIL — /lib\/searchIndex(En)?\.ts|simpleCalculators\// 가 하나라도 있으면 exit 1.
//   INFO — krCompanies_Batch·guidesMeta.generated 는 edge 페이지가 실제로 쓸 수 있어 출력만 한다.
// 사용: `npm run build` 뒤 `node scripts/verify-edge-bundle.mjs [.next 디렉터리]`.
//   산출물·소스맵이 없으면 검사할 수 없으므로 exit 1(통과로 오인하지 않게).

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
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

if (!existsSync(MANIFEST)) {
  console.error(`[edge-bundle] middleware-manifest.json 없음: ${MANIFEST} — 검사 불가.`);
  process.exit(1);
}

// 검사 대상 파일(.next 기준 상대 경로, 확장자 .js) → 그 파일을 쓰는 edge 함수 목록
const targets = new Map();
const addTarget = (file, owner) => {
  file = file.replaceAll("\\", "/");
  if (!file.endsWith(".js")) return;
  const rel = relative(NEXT_DIR, resolve(NEXT_DIR, file));
  if (rel.startsWith("..") || isAbsolute(rel)) throw new Error(`빌드 밖 검사 경로: ${file}`);
  if (!targets.has(file)) targets.set(file, new Set());
  if (owner) targets.get(file).add(owner);
};
if (existsSync(EDGE_CHUNKS) && statSync(EDGE_CHUNKS).isDirectory()) {
  for (const name of readdirSync(EDGE_CHUNKS)) {
    if (name.endsWith(".js")) addTarget(`server/edge-chunks/${name}`, null);
  }
}
try {
  const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
  for (const group of [manifest.functions ?? {}, manifest.middleware ?? {}]) {
    for (const [key, fn] of Object.entries(group)) {
      const owner = fn.page ?? key;
      for (const file of fn.files ?? []) addTarget(file, owner);
    }
  }
  const dsrOwner = "/widget/dsr/route";
  const edgeDsr = Object.entries(manifest.functions ?? {}).some(([key, fn]) => (fn.page ?? key) === dsrOwner);
  if (!edgeDsr) {
    const paths = JSON.parse(readFileSync(join(NEXT_DIR, "server", "app-paths-manifest.json"), "utf8"));
    const entry = paths[dsrOwner];
    if (typeof entry !== "string" || !entry.endsWith(".js")) throw new Error("Node DSR route가 app-paths-manifest에 없음");
    const entryFile = `server/${entry}`;
    addTarget(entryFile, `${dsrOwner} (node)`);
    const tracePath = resolve(NEXT_DIR, `${entryFile}.nft.json`);
    const trace = JSON.parse(readFileSync(tracePath, "utf8"));
    if (!Array.isArray(trace.files)) throw new Error("Node DSR NFT trace files가 배열이 아님");
    for (const dependency of trace.files) {
      const rel = relative(NEXT_DIR, resolve(dirname(tracePath), dependency)).replaceAll("\\", "/");
      // Runtime packages outside .next are handled by the dependency audit, not this app-module gate.
      if (rel.startsWith("server/") && rel.endsWith(".js")) addTarget(rel, `${dsrOwner} (node trace)`);
    }
  }
} catch (error) {
  console.error(`[edge-bundle] 빌드 매니페스트/trace 검사 불가: ${error.message}`);
  process.exit(1);
}

const clean = (s) => s.replaceAll("\\", "/").replace(/^webpack:\/\/[^/]*\//, "");
const generatedWithoutMap = (file) => /(?:^|\/)[^/]*-manifest\.js$/.test(file)
  || ["server/edge-runtime-webpack.js", "server/webpack-runtime.js"].includes(file);
let scanned = 0;
let failures = 0;
const missingMaps = [];
const infoLines = [];

for (const [file, owners] of [...targets].sort(([a], [b]) => a.localeCompare(b))) {
  const mapPath = join(NEXT_DIR, `${file}.map`);
  if (!existsSync(join(NEXT_DIR, file))) {
    if (!generatedWithoutMap(file)) {
      console.error(`FAIL  매니페스트가 참조한 JS 파일 없음: ${file}`);
      failures++;
    }
    continue;
  }
  if (!existsSync(mapPath)) {
    // Framework runtime / generated manifests have no app source maps; all app code must be inspectable.
    if (!generatedWithoutMap(file)) {
      missingMaps.push(file);
      failures++;
    }
    continue;
  }
  let sources;
  try {
    sources = JSON.parse(readFileSync(mapPath, "utf8")).sources;
    if (!Array.isArray(sources) || !sources.length || sources.some((source) => typeof source !== "string")) {
      throw new Error("비어 있거나 올바르지 않은 sources 배열");
    }
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
if (missingMaps.length) {
  console.log(`FAIL  소스맵 없는 앱 JS ${missingMaps.length}개 (검사 공백): ${missingMaps.join(", ")}`);
}

console.log(
  `\n결과: 소스맵 ${scanned}개 검사 — ` +
    (failures
      ? `FAIL ${failures}건. 금지 모듈 또는 검사 불가한 번들이 있습니다. ` +
        "HeaderSearch.tsx 의 typeof window 삼항 가드, widget/dsr 의 simpleCalculators 미import 를 확인하세요."
      : "금지 모듈 0건 (searchIndex·simpleCalculators 없음)"),
);
process.exit(failures ? 1 : 0);
