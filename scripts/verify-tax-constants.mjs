#!/usr/bin/env node
// 세법 요율 리터럴 드리프트 가드 (2026-08 대규모 점검 도입)
//
// src/** 에서 4대보험 요율·국민연금 상한 리터럴이 정본(taxConstants2026.ts)
// 밖에 하드코딩된 곳을 찾아, 허용목록(tax-constants-allow.json)과 대조한다.
//   - 허용목록에 없는 새 하드코딩 → 실패 (exit 1). 정본 import로 작성할 것.
//   - 허용목록엔 있는데 코드에서 사라짐 → 경고 (목록 갱신 안내).
//
// 2027 요율 개정 시: 이 스크립트를 돌리면 표시용 텍스트를 포함해 갱신해야 할
// 파일 전량이 허용목록으로 정리되어 나온다 (ad-audit.mjs 와 같은 관례).
//
// 사용: npm run verify:tax

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const SRC = join(ROOT, "src");
const ALLOW_PATH = join(ROOT, "scripts", "tax-constants-allow.json");

// 정본 파일 — 리터럴의 유일한 원천
const CANONICAL = "src/lib/taxConstants2026.ts";

// 감시 대상 리터럴 (2026 현행 + 직전 연도 레거시)
const PATTERNS = [
  { name: "국민연금 4.75%", re: /0\.0475\b/ },
  { name: "건강보험 3.595%", re: /0\.03595\b/ },
  { name: "장기요양 13.14%", re: /0\.1314\b/ },
  { name: "건강보험(2025) 3.545%", re: /0\.03545\b/ },
  { name: "장기요양(2025) 12.95%", re: /0\.1295\b/ },
  { name: "연금 상한 월 659만", re: /6[_,]?590[_,]?000/ },
  { name: "연금 상한 연 7,908만", re: /79[_,]?080[_,]?000/ },
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === "__tests__" || name === "node_modules") continue;
      yield* walk(p);
    } else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)) {
      yield p;
    }
  }
}

const allow = JSON.parse(readFileSync(ALLOW_PATH, "utf8"));
const allowSet = new Set(allow.files);

const found = new Map(); // file -> [pattern names]
for (const abs of walk(SRC)) {
  const rel = relative(ROOT, abs).replaceAll("\\", "/");
  if (rel === CANONICAL) continue;
  const text = readFileSync(abs, "utf8");
  const hits = PATTERNS.filter((p) => p.re.test(text)).map((p) => p.name);
  if (hits.length) found.set(rel, hits);
}

let fail = 0;
for (const [file, hits] of [...found.entries()].sort()) {
  if (!allowSet.has(file)) {
    console.error(`[FAIL] 정본 밖 신규 하드코딩: ${file} — ${hits.join(", ")}`);
    fail++;
  }
}
for (const file of allow.files) {
  if (!found.has(file)) {
    console.warn(`[WARN] 허용목록에 있으나 리터럴이 사라짐 (목록에서 제거 가능): ${file}`);
  }
}

console.log(
  `[verify-tax-constants] 검사 완료 — 리터럴 보유 파일 ${found.size}곳 / 허용 ${allow.files.length}곳 / 위반 ${fail}곳`
);
if (fail) {
  console.error(
    "→ 새 코드는 src/lib/taxConstants2026.ts 를 import 하거나, 표시용 텍스트라면 scripts/tax-constants-allow.json 에 사유와 함께 등재하세요."
  );
  process.exit(1);
}
