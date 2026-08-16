// GSC 저격 분석기 — 서치콘솔 성과 내보내기 CSV를 3버킷으로 분류해 마크다운 표 출력.
// 의존성 0 (node 내장만). postbuild와 무관한 수동 도구.
//
// 사용법:
//   node scripts/gsc-snipe.mjs docs/gsc/2026-09-05-queries.csv
//   node scripts/gsc-snipe.mjs docs/gsc/2026-09-05-pages.csv
//
// 버킷 기준 (docs/gsc-sniping-log.md 절차서와 동일):
//   A. 타이틀 개선: 노출≥500 AND CTR<2% AND 순위≤10  → 메타만 수정(동결기에도 허용)
//   B. 순위 보강:   순위 8~20 AND 노출≥300           → FAQ·내부링크·섹션 확장
//   C. 신규 검토:   순위>20 AND 노출≥200             → 격자 확장·신규 페이지(10월 말까지만)
// 우선순위 점수 = 노출 × (목표CTR 4% − 현재CTR), 음수는 0 처리.

import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("사용법: node scripts/gsc-snipe.mjs <GSC 내보내기 CSV 경로>");
  process.exit(1);
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

const raw = readFileSync(file, "utf8").replace(/^﻿/, "");
const rows = parseCsv(raw);
const header = rows[0].map((h) => h.trim().toLowerCase());

// 한국어/영어 UI 내보내기 모두 대응
const col = (names) => header.findIndex((h) => names.some((n) => h.includes(n)));
const iKey = col(["쿼리", "query", "페이지", "page", "url"]);
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

const items = rows.slice(1).map((r) => {
  const impressions = num(r[iImpr]);
  const clicks = iClicks >= 0 ? num(r[iClicks]) : 0;
  // CTR 컬럼이 없으면 클릭/노출로 계산
  const ctr = iCtr >= 0 ? num(r[iCtr]) : impressions > 0 ? (clicks / impressions) * 100 : 0;
  return {
    key: r[iKey],
    clicks,
    impressions,
    ctr,
    position: num(r[iPos]),
  };
});

const TARGET_CTR = 4;
const score = (x) => Math.round(x.impressions * Math.max(0, TARGET_CTR - x.ctr) / 100);

const bucketA = items
  .filter((x) => x.impressions >= 500 && x.ctr < 2 && x.position <= 10)
  .sort((a, b) => score(b) - score(a));
const bucketB = items
  .filter((x) => x.position >= 8 && x.position <= 20 && x.impressions >= 300)
  .sort((a, b) => b.impressions - a.impressions);
const bucketC = items
  .filter((x) => x.position > 20 && x.impressions >= 200)
  .sort((a, b) => b.impressions - a.impressions);

function table(list, cap = 15) {
  if (!list.length) return "_해당 없음_\n";
  const head = "| 쿼리/페이지 | 노출 | 클릭 | CTR | 순위 | 점수 |\n|---|---:|---:|---:|---:|---:|\n";
  return (
    head +
    list
      .slice(0, cap)
      .map(
        (x) =>
          `| ${x.key} | ${x.impressions.toLocaleString()} | ${x.clicks} | ${x.ctr.toFixed(1)}% | ${x.position.toFixed(1)} | ${score(x)} |`
      )
      .join("\n") +
    (list.length > cap ? `\n\n_...외 ${list.length - cap}건_` : "") +
    "\n"
  );
}

console.log(`# GSC 저격 분석 — ${file}`);
console.log(`총 ${items.length}행 · 분석일 기준 상위 15건씩 표시\n`);
console.log(`## 버킷 A — 타이틀 개선 (노출≥500·CTR<2%·순위≤10) — ${bucketA.length}건`);
console.log(table(bucketA));
console.log(`## 버킷 B — 순위 8~20 보강 (노출≥300) — ${bucketB.length}건`);
console.log(table(bucketB));
console.log(`## 버킷 C — 미커버·신규 검토 (순위>20·노출≥200) — ${bucketC.length}건 ★10월 말까지만 실행`);
console.log(table(bucketC));
console.log("→ 라운드당 상위 5건만 실행하고 docs/gsc-sniping-log.md에 기록하세요.");
