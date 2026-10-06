// GSC 저격 분석기 — 서치콘솔 성과 내보내기 CSV를 3버킷으로 분류해 마크다운 표 출력.
// 의존성 0 (node 내장만). postbuild와 무관한 수동 도구.
//
// 사용법:
//   node scripts/gsc-snipe.mjs docs/gsc/2026-09-05-queries.csv
//   node scripts/gsc-snipe.mjs docs/gsc/2026-09-05-pages.csv
//   node scripts/gsc-snipe.mjs <csv> --a-impr=300 --b-impr=150 --c-impr=100
//
// 옵션(전부 선택):
//   --a-impr=N  버킷 A 최소 노출 (기본 100)
//   --b-impr=N  버킷 B 최소 노출 (기본 50)
//   --c-impr=N  버킷 C 최소 노출 (기본 30)
//   --a-ctr=P   버킷 A CTR 상한 % (기본 2)
//   --a-pos=N   버킷 A 순위 상한 (기본 10)
//   --b-pos=A-B 버킷 B 순위 범위 (기본 8-20)
//   --target-ctr=P 점수 계산용 목표 CTR % (기본 4)
//   --top=N     버킷별 표시 행 수 (기본 15)
//
// 버킷 기준 (docs/gsc-sniping-log.md 절차서와 동일, 임계값은 위 플래그로 조정):
//   A. 타이틀 개선: 노출≥A AND CTR<2% AND 순위≤10  → 메타만 수정(company·/salary 제목 제외)
//   B. 순위 보강:   순위 8~20 AND 노출≥B           → FAQ·내부링크·섹션 확장
//   C. 신규 검토:   순위>20 AND 노출≥C             → 격자 확장·신규 페이지(10월 말까지만)
// 우선순위 점수 = 노출 × (목표CTR 4% − 현재CTR), 음수는 0 처리.
//
// ★제목 동결 가드 (2026-09-28 감사 S28) — 버킷 A 에만 적용, 행을 조용히 버리지 않는다:
//   - 회사 페이지 /salary-db/<id>(listed·ranking·compare 제외)와 /salary/<금액>·/monthly/<금액> 은
//     표에서 빼고 표 아래 '제목 변경 금지' 한 줄에 개수·목록으로 보인다. 회사 title 은 2026-07-06 최적화 후
//     재변경 금지(gsc-sniping-log Round 1·회사축 표), /salary·/monthly 제목은 2월 결정(마스터플랜 §8-1).
//   - URL 행 중 순위≤2.5·클릭 0 은 브랜드 검색 사이트링크 추정 — 표에 남기되 '손대지 말 것' 꼬리표.
//   - 버킷 B·C 는 그대로 — /salary/[금액] 순위 보강(Round 2 후보 C)은 제목이 아니라 본문 작업이다.
//   - 페이지 CSV 키는 전체 URL(비 www 행 포함)이라 경로를 뽑아 대조한다. 검색어 CSV 는 태그 없음.
//   - CSV 에 국가 열이 없어 플래그로는 검증할 수 없다 — 국가=한국 필터 내보내기인지는 사람이 확인(안내 1줄 출력).
//
// ★기본 임계값은 2026-09 실측 규모(361일 전체에서 노출≥500 페이지 3개)에 맞춰
//   A 500→100 · B 300→50 · C 200→30 으로 하향한 값이다. 사이트 규모가 커지면
//   플래그로 올려 쓰되, 기준선 비교 시에는 같은 임계값을 명시해 기록할 것.

import { readFileSync } from "node:fs";

const argv = process.argv.slice(2);
const flags = new Map();
const positional = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith("--")) {
    const eq = a.indexOf("=");
    if (eq > 0) {
      flags.set(a.slice(2, eq), a.slice(eq + 1));
    } else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith("--")) {
      flags.set(a.slice(2), argv[++i]);
    } else {
      flags.set(a.slice(2), "true");
    }
  } else {
    positional.push(a);
  }
}

const file = positional[0];
if (!file) {
  console.error("사용법: node scripts/gsc-snipe.mjs <GSC 내보내기 CSV 경로> [--a-impr=100 --b-impr=50 --c-impr=30]");
  process.exit(1);
}

function numFlag(name, fallback) {
  if (!flags.has(name)) return fallback;
  const v = Number(String(flags.get(name)).replace(/[%,\s]/g, ""));
  if (!Number.isFinite(v)) {
    console.error(`--${name} 값이 숫자가 아닙니다: ${flags.get(name)}`);
    process.exit(1);
  }
  return v;
}

const A_IMPR = numFlag("a-impr", 100);
const B_IMPR = numFlag("b-impr", 50);
const C_IMPR = numFlag("c-impr", 30);
const A_CTR = numFlag("a-ctr", 2);
const A_POS = numFlag("a-pos", 10);
const TARGET_CTR = numFlag("target-ctr", 4);
const TOP = numFlag("top", 15);

let B_POS_MIN = 8;
let B_POS_MAX = 20;
if (flags.has("b-pos")) {
  const m = String(flags.get("b-pos")).match(/^(\d+(?:\.\d+)?)\s*[-~]\s*(\d+(?:\.\d+)?)$/);
  if (!m) {
    console.error(`--b-pos 형식은 '8-20' 입니다: ${flags.get("b-pos")}`);
    process.exit(1);
  }
  B_POS_MIN = Number(m[1]);
  B_POS_MAX = Number(m[2]);
}

// 따옴표 대응 CSV 파서 (쿼리에 쉼표 포함 가능)
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (cell !== "" || row.length) {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      }
    } else {
      cell += ch;
    }
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

const raw = readFileSync(file, "utf8").replace(/^\uFEFF/, "");
const rows = parseCsv(raw);
if (!rows.length) {
  console.error("빈 CSV입니다.");
  process.exit(1);
}
// 헤더도 NFC 정규화 — 한글 자모 분해(NFD) 상태면 '검색어' 같은 부분일치가 실패한다.
const header = rows[0].map((h) => h.trim().normalize("NFC").toLowerCase());

// 한국어/영어 UI 내보내기 모두 대응
// ★한국어 검색어 내보내기 헤더는 '인기 검색어'(쿼리 아님) — '검색어' 없으면 인식 실패로 죽는다.
const col = (names) => header.findIndex((h) => names.some((n) => h.includes(n)));
const iKey = col(["검색어", "쿼리", "query", "페이지", "page", "url"]);
const iClicks = col(["클릭", "click"]);
const iImpr = col(["노출", "impression"]);
const iCtr = col(["ctr"]);
const iPos = col(["순위", "position"]);

if (iKey < 0 || iImpr < 0 || iPos < 0) {
  console.error("헤더 인식 실패 — GSC '성과' 화면의 내보내기 CSV인지 확인하세요.");
  console.error("발견된 헤더:", header.join(" | "));
  process.exit(1);
}

const num = (s) => parseFloat(String(s).replace(/[%,\s]/g, "")) || 0;

// 페이지 CSV 키(전체 URL)에서 끝 슬래시를 뗀 경로. URL 이 아니면(검색어 CSV) null.
function urlPath(key) {
  if (!/^https?:\/\//i.test(key)) return null;
  try {
    return new URL(key).pathname.replace(/\/+$/, "") || "/";
  } catch {
    return null;
  }
}
// 제목 동결 경로 — 회사 상세(단일 세그먼트, 정적 목록 페이지 제외)와 금액 격자
const FROZEN_TITLE_RES = [/^\/salary-db\/(?!(?:listed|ranking|compare)(?:\/|$))[^/]+$/, /^\/(?:salary|monthly)\/\d+$/];
const FROZEN_LABEL = "제목 변경 금지(회사 title 불변 / /salary·/monthly 제목은 2월 결정)";
const SITELINK_NOTE = " (브랜드 사이트링크 추정 — 손대지 말 것)";

const items = rows.slice(1).map((r) => {
  const impressions = num(r[iImpr]);
  const clicks = iClicks >= 0 ? num(r[iClicks]) : 0;
  // CTR 컬럼이 없으면 클릭/노출로 계산
  const ctr = iCtr >= 0 ? num(r[iCtr]) : impressions > 0 ? (clicks / impressions) * 100 : 0;
  // 키는 NFC로 정규화 — GSC 내보내기에 NFD(자모 분해) 한글 행이 섞여 있어
  // 그대로 두면 정렬·중복 판정·정규식 클러스터 분류가 어긋난다.
  const key = String(r[iKey] ?? "").normalize("NFC");
  const position = num(r[iPos]);
  const path = urlPath(key);
  return {
    key,
    clicks,
    impressions,
    ctr,
    position,
    frozenTitle: path !== null && FROZEN_TITLE_RES.some((re) => re.test(path)),
    sitelink: path !== null && position <= 2.5 && clicks === 0,
  };
});

const score = (x) => Math.round((x.impressions * Math.max(0, TARGET_CTR - x.ctr)) / 100);

const bucketAAll = items
  .filter((x) => x.impressions >= A_IMPR && x.ctr < A_CTR && x.position <= A_POS)
  .sort((a, b) => score(b) - score(a));
// 제목 동결 행은 실행 표에서 빼고 표 아래 한 줄로 따로 보인다
const bucketA = bucketAAll.filter((x) => !x.frozenTitle);
const bucketAFrozen = bucketAAll.filter((x) => x.frozenTitle);
const bucketB = items
  .filter((x) => x.position >= B_POS_MIN && x.position <= B_POS_MAX && x.impressions >= B_IMPR)
  .sort((a, b) => b.impressions - a.impressions);
const bucketC = items
  .filter((x) => x.position > B_POS_MAX && x.impressions >= C_IMPR)
  .sort((a, b) => b.impressions - a.impressions);

function table(list, cap = TOP) {
  if (!list.length) return "_해당 없음_\n";
  const head = "| 쿼리/페이지 | 노출 | 클릭 | CTR | 순위 | 점수 |\n|---|---:|---:|---:|---:|---:|\n";
  return (
    head +
    list
      .slice(0, cap)
      .map(
        (x) =>
          `| ${x.key}${x.sitelink ? SITELINK_NOTE : ""} | ${x.impressions.toLocaleString()} | ${x.clicks} | ${x.ctr.toFixed(1)}% | ${x.position.toFixed(1)} | ${score(x)} |`
      )
      .join("\n") +
    (list.length > cap ? `\n\n_...외 ${list.length - cap}건_` : "") +
    "\n"
  );
}

console.log(`# GSC 저격 분석 — ${file}`);
console.log(
  `총 ${items.length}행 · 버킷별 상위 ${TOP}건 표시 · 임계값 A≥${A_IMPR} · B≥${B_IMPR} · C≥${C_IMPR} (목표CTR ${TARGET_CTR}%)`
);
console.log("CTR·순위 판정은 국가=한국 필터 CSV로만(gsc-sniping-log Round 1)\n");
console.log(`## 버킷 A — 타이틀 개선 (노출≥${A_IMPR}·CTR<${A_CTR}%·순위≤${A_POS}) — ${bucketA.length}건`);
console.log(table(bucketA));
if (bucketAFrozen.length) {
  const shown = bucketAFrozen.slice(0, TOP).map((x) => x.key).join(" · ");
  const more = bucketAFrozen.length > TOP ? ` _...외 ${bucketAFrozen.length - TOP}건_` : "";
  console.log(`${FROZEN_LABEL} — ${bucketAFrozen.length}건: ${shown}${more}\n`);
}
console.log(`## 버킷 B — 순위 ${B_POS_MIN}~${B_POS_MAX} 보강 (노출≥${B_IMPR}) — ${bucketB.length}건`);
console.log(table(bucketB));
console.log(`## 버킷 C — 미커버·신규 검토 (순위>${B_POS_MAX}·노출≥${C_IMPR}) — ${bucketC.length}건 ★10월 말까지만 실행`);
console.log(table(bucketC));
console.log("→ 라운드당 상위 5건만 실행하고 docs/gsc-sniping-log.md에 기록하세요.");
