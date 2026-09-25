#!/usr/bin/env node
// 세법 요율·최저임금·실업급여 상한 리터럴 드리프트 가드
// (2026-08 대규모 점검 도입 · 2026-09-12 S2-1 SI-08 로 최저임금·실업급여 패턴 확장)
//
// src/** 에서 4대보험 요율·국민연금 상한·최저임금·구직급여 상한 리터럴이 정본
// (taxConstants2026.ts · config/minimumWage.ts · config/unemploymentBenefit.ts)
// 밖에 하드코딩된 곳을 찾아, 허용목록(tax-constants-allow.json)과 대조한다.
//   - 허용목록에 없는 새 하드코딩 → 실패 (exit 1). 정본 import로 작성할 것.
//   - 허용목록엔 있는데 코드에서 사라짐 → 경고 (목록 갱신 안내).
//
// 허용목록 형식 — 두 형식을 섞어 써도 된다:
//   "src/app/foo/page.tsx"                            → 모든 패턴 허용 (구 형식)
//   { "src/app/foo/page.tsx": ["최저시급 10,320"] }    → 나열한 패턴명만 허용
// 표시용 텍스트(설명·FAQ 속 '10,320원' 등)는 허용 대상이지만, 계산·기본값·프리셋은
// 반드시 정본 상수를 import 해야 한다 — 목록에 있는 파일이라도 계산식에 리터럴을
// 새로 넣지 말 것 (목록은 파일 단위라 그런 회귀까지는 잡지 못한다).
//
// 2027 요율·최저임금 개정 시: 이 스크립트를 돌리면 표시용 텍스트를 포함해 갱신해야 할
// 파일 전량이 허용목록으로 정리되어 나온다 (ad-audit.mjs 와 같은 관례).
//
// 현행 요율 포인터 게이트 (2026-09-25 N3 — 1/1 전환 런북 docs/next-upgrade-plan-2026-09-11.md §5):
//   - src/config/currentRates.ts 의 'export const CURRENT_RATES_YEAR: RateYear = YYYY;' 한 줄을 읽는다.
//     형식이 바뀌어 못 찾으면 실패 (런북의 한 줄 전환이 그 형식을 전제).
//   - 포인터가 2027 인데 오늘(KST)이 2027-01-01 전이면 실패 — 이른 전환 방지.
//   - 포인터가 2027 인데 taxConstants2027.ts 의 INSURANCE_RATES_2027_STATUS 에 provisional 이 남아 있으면 실패.
//   - 오늘(KST)이 2027-01-01 이후인데 포인터가 아직 2026 이면 경고 (런북 실행 필요).
//   날짜 모의: VERIFY_TAX_NOW=2027-01-01T00:10:00+09:00 npm run verify:tax
//
// 사용: npm run verify:tax

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const SRC = join(ROOT, "src");
const ALLOW_PATH = join(ROOT, "scripts", "tax-constants-allow.json");

// 정본 파일 — 리터럴의 유일한 원천 (검사 대상에서 제외)
const CANONICAL = new Set([
  "src/lib/taxConstants2026.ts",
  "src/lib/taxConstants2027.ts",
  "src/config/minimumWage.ts",
  "src/config/unemploymentBenefit.ts",
]);

// 감시 대상 리터럴 (2026 현행 + 직전 연도 레거시)
const PATTERNS = [
  { name: "국민연금 4.75%", re: /0\.0475\b/ },
  { name: "건강보험 3.595%", re: /0\.03595\b/ },
  { name: "장기요양 13.14%", re: /0\.1314\b/ },
  { name: "건강보험(2025) 3.545%", re: /0\.03545\b/ },
  { name: "장기요양(2025) 12.95%", re: /0\.1295\b/ },
  { name: "연금 상한 월 659만", re: /6[_,]?590[_,]?000/ },
  { name: "연금 상한 연 7,908만", re: /79[_,]?080[_,]?000/ },
  // 최저임금·실업급여 (2026-09-12). 앞의 \b 는 더 긴 숫자 안의 부분 일치를 막고
  // (예: src/data/dart/dartDisclosed.ts 의 stockCode "068100"), 뒤의 (?![,_]?\d) 는 뒤따르는 숫자뿐 아니라
  // 천 단위 그룹이 이어지는 큰 금액(10,320,000 · 68,100,000)도 거른다 — 뒤가 \b 이면 "10,320" 다음 쉼표에서
  // 단어 경계가 성립해 오탐이었다 (2026-09-12 리뷰 지적).
  // 2027 시급 10,700 은 DART·회사 데이터의 금액값과 겹쳐(자동 재생성 파일이 CI 를
  // 깨뜨릴 수 있음) 감시하지 않는다 — 연도 전환 시 수동 grep 으로 확인.
  { name: "최저시급 10,320", re: /\b10[,_]?320(?![,_]?\d)/ },
  { name: "최저임금 월 2,156,880", re: /\b2[,_]?156[,_]?880(?![,_]?\d)/ },
  { name: "실업급여 일 상한 68,100", re: /\b68[,_]?100(?![,_]?\d)/ },
  { name: "실업급여 일 하한 66,048", re: /\b66[,_]?048(?![,_]?\d)/ },
];
const PATTERN_NAMES = new Set(PATTERNS.map((p) => p.name));

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

// 허용목록 → Map<path, null(전 패턴) | Set<패턴명>>
const allow = JSON.parse(readFileSync(ALLOW_PATH, "utf8"));
const allowMap = new Map();
let fail = 0;
for (const entry of allow.files) {
  if (typeof entry === "string") {
    allowMap.set(entry, null);
    continue;
  }
  for (const [file, names] of Object.entries(entry)) {
    if (!Array.isArray(names) || names.length === 0) {
      console.error(`[FAIL] 허용목록 형식 오류: ${file} — 패턴명 배열이 필요합니다`);
      fail++;
      continue;
    }
    for (const n of names) {
      if (!PATTERN_NAMES.has(n)) {
        console.error(`[FAIL] 허용목록 ${file}: 알 수 없는 패턴명 '${n}'`);
        fail++;
      }
    }
    allowMap.set(file, new Set(names));
  }
}

const found = new Map(); // file -> [pattern names]
for (const abs of walk(SRC)) {
  const rel = relative(ROOT, abs).replaceAll("\\", "/");
  if (CANONICAL.has(rel)) continue;
  const text = readFileSync(abs, "utf8");
  const hits = PATTERNS.filter((p) => p.re.test(text)).map((p) => p.name);
  if (hits.length) found.set(rel, hits);
}

for (const [file, hits] of [...found.entries()].sort()) {
  if (!allowMap.has(file)) {
    console.error(`[FAIL] 정본 밖 신규 하드코딩: ${file} — ${hits.join(", ")}`);
    fail++;
    continue;
  }
  const allowed = allowMap.get(file);
  if (allowed) {
    const extra = hits.filter((h) => !allowed.has(h));
    if (extra.length) {
      console.error(`[FAIL] 허용되지 않은 패턴: ${file} — ${extra.join(", ")}`);
      fail++;
    }
  }
}
for (const [file, allowed] of allowMap) {
  const hits = found.get(file);
  if (!hits) {
    console.warn(`[WARN] 허용목록에 있으나 리터럴이 사라짐 (목록에서 제거 가능): ${file}`);
    continue;
  }
  if (allowed) {
    for (const n of allowed) {
      if (!hits.includes(n)) {
        console.warn(`[WARN] 허용목록에 있으나 리터럴이 사라짐 (목록에서 제거 가능): ${file} — ${n}`);
      }
    }
  }
}

// ── 현행 요율 포인터 게이트 (2026-09-25 N3)
const POINTER_PATH = join(ROOT, "src", "config", "currentRates.ts");
const RATES_2027_PATH = join(ROOT, "src", "lib", "taxConstants2027.ts");
const SWITCH_AT = Date.parse("2027-01-01T00:00:00+09:00");
const pointerSrc = readFileSync(POINTER_PATH, "utf8");
const pointerLines = pointerSrc
  .split(/\r?\n/)
  .filter((l) => l.startsWith("export const CURRENT_RATES_YEAR"));
const pointerMatch =
  pointerLines.length === 1 ? /^export const CURRENT_RATES_YEAR: RateYear = (\d{4});$/.exec(pointerLines[0]) : null;
const nowRaw = process.env.VERIFY_TAX_NOW;
const now = nowRaw ? Date.parse(nowRaw) : Date.now();
if (!Number.isFinite(now)) {
  console.error(`[FAIL] VERIFY_TAX_NOW 를 날짜로 읽지 못함: ${nowRaw}`);
  fail++;
} else if (!pointerMatch) {
  console.error(
    "[FAIL] src/config/currentRates.ts 에서 'export const CURRENT_RATES_YEAR: RateYear = YYYY;' 한 줄을 찾지 못함 — 1/1 전환 런북이 이 형식을 전제한다"
  );
  fail++;
} else {
  const year = Number(pointerMatch[1]);
  if (year === 2027 && now < SWITCH_AT) {
    console.error("[FAIL] 현행 요율 포인터가 2027 인데 아직 2027-01-01 00:00 KST 전 — 1/1 00:00 이후 빌드에서만 전환");
    fail++;
  }
  if (year === 2027) {
    // 선언부('export const … = {')에 고정 — 파일 머리 주석의 같은 이름에 걸리면 요율 객체를 읽게 된다
    const statusBlock = /export const INSURANCE_RATES_2027_STATUS\b[\s\S]*?=\s*\{([\s\S]*?)\};/.exec(
      readFileSync(RATES_2027_PATH, "utf8")
    );
    const provisional = statusBlock
      ? [...statusBlock[1].matchAll(/(\w+):\s*"provisional"/g)].map((m) => m[1])
      : ["(INSURANCE_RATES_2027_STATUS 블록 없음)"];
    if (provisional.length) {
      console.error(`[FAIL] 포인터 2027 전환 전 확인 안 된 2027 요율: ${provisional.join(", ")} — taxConstants2027.ts 에서 확정값·confirmed 로 갱신`);
      fail++;
    }
  }
  if (year === 2026 && now >= SWITCH_AT) {
    console.warn(
      "[WARN] 2027-01-01 이 지났는데 현행 요율 포인터가 2026 — docs/next-upgrade-plan-2026-09-11.md §5 1/1 전환 런북 실행"
    );
  }
  console.log(`[verify-tax-constants] 현행 요율 포인터 CURRENT_RATES_YEAR = ${year}`);
}

console.log(
  `[verify-tax-constants] 검사 완료 — 리터럴 보유 파일 ${found.size}곳 / 허용 ${allowMap.size}곳 / 위반 ${fail}곳`
);
if (fail) {
  console.error(
    "→ 새 코드는 정본(src/lib/taxConstants2026.ts · src/lib/taxConstants2027.ts · src/config/currentRates.ts · src/config/minimumWage.ts · src/config/unemploymentBenefit.ts)을 import 하거나, 표시용 텍스트라면 scripts/tax-constants-allow.json 에 사유와 함께 등재하세요."
  );
  process.exit(1);
}
