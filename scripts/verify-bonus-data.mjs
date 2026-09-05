// scripts/verify-bonus-data.mjs
// bonusData.ts 전사 정확성 자동 검증 — 각 payout 의 숫자값(percentOfBase /
// percentOfSalary / fixedAmountManwon)이 해당 프로필의 sourceFile 텍스트에
// 실제 등장하는지 확인한다 (전사 오타 검출 + Client.tsx 갱신 시 동기화 게이트).
//
// 사용: node scripts/verify-bonus-data.mjs   — 불일치 있으면 exit 1
//
// 매칭 규칙 (표기 변형 허용):
//   percent 계열  : 값 자체를 검사 — 1050 / 1_050 / 1,050 / 702.8
//   fixedAmountManwon(만원) : 원 단위 ×10,000 형(4_000_000 / 4,000,000 / 4000000)
//                  또는 "400만" 한글 표기형만 인정 (작은 수의 우연 일치 방지를
//                  위해 만원 값 자체의 맨숫자 매칭은 허용하지 않음)
//   숫자 경계     : 더 긴 숫자의 일부(15 in 150_000 등)는 매칭으로 치지 않는다
//
// 한계: AST 파서가 아닌 라인 스캔이다. bonusData.ts 의 각 프로필에서
//       sourceFile 필드가 payouts 배열보다 먼저 와야 한다 (현재 파일 규약).
//
// 2026-09-05 확장 (10배 계획 L13b ①): sourceFile 이 …/Client.tsx 이고 같은 폴더에
//   data.ts(인라인 상수를 분리한 순수 데이터 모듈)가 있으면 두 파일 텍스트를 합쳐
//   검사한다 — 시나리오 % 는 data.ts 로, 본문 안내문의 금액(예: 2,765만원)은
//   Client.tsx JSX 에 남아 있으므로 합산 스캔이 필요하다. sourceFile 값 자체는
//   기존 규약(Client.tsx) 그대로 둔다.

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(
  path.dirname(
    new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")
  ),
  ".."
);
const DATA_FILE = path.join(ROOT, "src", "data", "bonusData.ts");

// ── bonusData.ts 파싱 (라인 스캔) ─────────────────────────────
const dataText = fs.readFileSync(DATA_FILE, "utf8");
const lines = dataText.split(/\r?\n/);

/** @type {{slug:string|null, nameKo:string|null, sourceFile:string|null, field:string, value:number, line:number}[]} */
const numbers = [];
let curSlug = null;
let curName = null;
let curSource = null;
let profileCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const slugM = line.match(/^\s*calcSlug:\s*"([^"]+)"/);
  if (slugM) {
    curSlug = slugM[1];
    profileCount++;
    continue;
  }
  const nameM = line.match(/^\s*nameKo:\s*"([^"]+)"/);
  if (nameM) {
    curName = nameM[1];
    continue;
  }
  const srcM = line.match(/^\s*sourceFile:\s*"([^"]+)"/);
  if (srcM) {
    curSource = srcM[1];
    continue;
  }
  const numM = line.match(
    /^\s*(percentOfBase|percentOfSalary|fixedAmountManwon):\s*([0-9][0-9_]*(?:\.[0-9]+)?)\s*,?\s*$/
  );
  if (numM) {
    numbers.push({
      slug: curSlug,
      nameKo: curName,
      sourceFile: curSource,
      field: numM[1],
      value: Number(numM[2].replace(/_/g, "")),
      line: i + 1,
    });
  }
}

// payout 행 수 = year: 필드 수
const payoutCount = lines.filter((l) => /^\s*year:\s*\d+/.test(l)).length;

if (profileCount === 0 || numbers.length === 0) {
  console.error(
    `[verify-bonus-data] FAIL: bonusData.ts 파싱 결과가 비었습니다 ` +
      `(profiles=${profileCount}, numbers=${numbers.length}) — 필드 순서 규약 확인`
  );
  process.exit(1);
}

const orphan = numbers.filter((n) => !n.sourceFile);
if (orphan.length > 0) {
  console.error(
    `[verify-bonus-data] FAIL: sourceFile 이전에 등장한 숫자 필드 ${orphan.length}건 ` +
      `(첫 건: ${orphan[0].field} @ line ${orphan[0].line}) — 필드 순서 규약 위반`
  );
  process.exit(1);
}

// ── 숫자 매칭 유틸 ───────────────────────────────────────────
function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 천 단위 구분 표기 생성: 1580000 → "1,580,000" / "1_580_000" */
function grouped(n, sep) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

/** 앞뒤가 다른 숫자의 일부가 아닌지 보장하는 경계 정규식 */
function boundedRe(literal) {
  return new RegExp(
    "(?<![0-9._,])" + escapeRe(literal) + "(?![0-9])(?![._,][0-9])"
  );
}

/** percent 계열 후보 표기들 */
function percentVariants(v) {
  const out = [String(v)];
  if (Number.isInteger(v) && v >= 1000) {
    out.push(grouped(v, ","), grouped(v, "_"));
  }
  return out;
}

/** fixedAmountManwon(만원) 후보 표기들 — ×10,000 원 단위 또는 "N만" */
function manwonVariants(v) {
  const won = v * 10_000;
  const out = [String(won), grouped(won, ","), grouped(won, "_")];
  // "1,580만" / "1580만" 한글 표기 (경계는 검사 시 '만' 포함 리터럴로 처리)
  out.push(String(v) + "만");
  if (Number.isInteger(v) && v >= 1000) out.push(grouped(v, ",") + "만");
  return out;
}

// ── sourceFile 별 검사 ───────────────────────────────────────
const fileCache = new Map();
let dataModuleCount = 0; // Client.tsx 와 합산 스캔한 data.ts 수
function readSource(rel) {
  if (!fileCache.has(rel)) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) {
      fileCache.set(rel, null);
    } else {
      let text = fs.readFileSync(abs, "utf8");
      // Client.tsx + 같은 폴더 data.ts 합산 스캔 (2026-09-05 데이터 모듈 분리 대응)
      if (/[\\/]Client\.tsx$/.test(rel)) {
        const sibling = path.join(path.dirname(abs), "data.ts");
        if (fs.existsSync(sibling)) {
          text += "\n" + fs.readFileSync(sibling, "utf8");
          dataModuleCount++;
        }
      }
      fileCache.set(rel, text);
    }
  }
  return fileCache.get(rel);
}

const mismatches = [];
for (const n of numbers) {
  const text = readSource(n.sourceFile);
  if (text === null) {
    mismatches.push({ ...n, reason: `sourceFile 없음: ${n.sourceFile}` });
    continue;
  }
  const variants =
    n.field === "fixedAmountManwon"
      ? manwonVariants(n.value)
      : percentVariants(n.value);
  const found = variants.some((lit) => boundedRe(lit).test(text));
  if (!found) {
    mismatches.push({
      ...n,
      reason: `원본에 없음 (검사 표기: ${variants.join(" | ")})`,
    });
  }
}

// ── 리포트 ───────────────────────────────────────────────────
const slugs = new Set(numbers.map((n) => n.slug));
const perCompany = new Map();
for (const n of numbers) {
  perCompany.set(n.slug, (perCompany.get(n.slug) || 0) + 1);
}

console.log(
  `[verify-bonus-data] profiles=${profileCount} companies=${slugs.size} ` +
    `payouts=${payoutCount} numericChecks=${numbers.length}`
);
for (const [slug, cnt] of perCompany) {
  console.log(`  - ${slug}: ${cnt} numeric value(s)`);
}
console.log(`  (data.ts 합산 스캔: ${dataModuleCount}개 폴더)`);

if (mismatches.length > 0) {
  console.error(`\n[verify-bonus-data] 불일치 ${mismatches.length}건:`);
  for (const m of mismatches) {
    console.error(
      `  ✗ ${m.nameKo}(${m.slug}) ${m.field}=${m.value} ` +
        `[bonusData.ts:${m.line}] ← ${m.sourceFile}\n    ${m.reason}`
    );
  }
  process.exit(1);
}

console.log(`\n[verify-bonus-data] OK — 불일치 0건`);
process.exit(0);
