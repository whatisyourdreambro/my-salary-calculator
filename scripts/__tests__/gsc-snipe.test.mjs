import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";

// 2026-09-28 감사 S28: gsc-snipe 버킷 A 제목 동결·사이트링크 가드.
// 회사 /salary-db/<id> 와 /salary·/monthly/<금액> 은 실행 표에서 빠지고 '제목 변경 금지' 줄로 보이며,
// 순위≤2.5·클릭 0 URL 은 표에 남되 꼬리표가 붙는다. 버킷 B·C 는 그대로. 네트워크 없음.
const SCRIPT = fileURLToPath(new URL("../gsc-snipe.mjs", import.meta.url));
const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const FROZEN_PREFIX = "제목 변경 금지(회사 title 불변 / /salary·/monthly 제목은 2월 결정)";
const SITELINK_NOTE = "(브랜드 사이트링크 추정 — 손대지 말 것)";
const KR_REMINDER = "CTR·순위 판정은 국가=한국 필터 CSV로만(gsc-sniping-log Round 1)";

const tmp = mkdtempSync(join(tmpdir(), "gsc-snipe-"));
after(() => rmSync(tmp, { recursive: true, force: true }));

function run(csvPath, ...flags) {
  const r = spawnSync(process.execPath, [SCRIPT, csvPath, ...flags], { cwd: REPO_ROOT, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
}

/** '## 버킷 X' 부터 다음 '## ' 직전까지 */
function section(out, bucket) {
  const start = out.indexOf(`## 버킷 ${bucket}`);
  assert.notEqual(start, -1, `버킷 ${bucket} 섹션 없음`);
  const next = out.indexOf("\n## ", start + 1);
  return out.slice(start, next === -1 ? undefined : next);
}
const tableRows = (sec) => sec.split("\n").filter((l) => l.startsWith("| ") && !l.startsWith("| 쿼리/페이지"));
const frozenLine = (sec) => sec.split("\n").find((l) => l.startsWith(FROZEN_PREFIX));

function writeCsv(name, header, rows) {
  const p = join(tmp, name);
  writeFileSync(p, "﻿" + [header, ...rows].join("\n") + "\n");
  return p;
}

test("repo 3-month pages export: sk-hynix leaves the actionable bucket A table and shows on the frozen line", () => {
  const out = run("docs/gsc/2026-08-16-full3mo-pages.csv");
  const a = section(out, "A");
  assert.equal(tableRows(a).some((l) => l.includes("/salary-db/sk-hynix")), false);
  assert.match(a, /— 0건/);
  const line = frozenLine(a);
  assert.ok(line, "제목 변경 금지 줄 없음");
  assert.match(line, /— 1건: https:\/\/www\.moneysalary\.com\/salary-db\/sk-hynix$/);
  assert.ok(out.includes(KR_REMINDER));
  // 버킷 B 는 그대로 (/salary-db 목록 페이지)
  assert.equal(tableRows(section(out, "B")).length, 1);
});

test("synthetic pages CSV: frozen paths, static salary-db pages, sitelinks and bucket B", () => {
  const csv = writeCsv("pages.csv", "인기 페이지,클릭수,노출,CTR,게재 순위", [
    "https://www.moneysalary.com/salary-db/sk-hynix,2,109,1.83%,3.2",
    "https://moneysalary.com/salary/49500000,0,300,0%,4.1",
    "https://www.moneysalary.com/monthly/3000000/,1,200,0.5%,5",
    "https://www.moneysalary.com/salary-db/ranking,1,150,0.67%,6",
    "https://www.moneysalary.com/salary-db/listed,1,140,0.71%,6",
    "https://www.moneysalary.com/salary-db/listed/005930,1,130,0.77%,6",
    "https://www.moneysalary.com/salary-db/compare/naver-vs-kakao,1,125,0.8%,6",
    "https://www.moneysalary.com/hub/career,0,180,0%,1.3",
    "https://www.moneysalary.com/calc/foo,1,500,0.2%,6",
    "https://www.moneysalary.com/salary/83000000,1,120,0.83%,12",
  ]);
  const out = run(csv);
  const a = section(out, "A");
  const rows = tableRows(a);
  const inTable = (p) => rows.some((l) => l.startsWith(`| https://www.moneysalary.com${p} `));
  for (const p of ["/salary-db/ranking", "/salary-db/listed", "/salary-db/listed/005930", "/salary-db/compare/naver-vs-kakao", "/calc/foo"]) {
    assert.ok(inTable(p), `${p} 는 실행 표에 남아야 한다`);
  }
  for (const p of ["/salary-db/sk-hynix", "salary/49500000", "/monthly/3000000"]) {
    assert.equal(rows.some((l) => l.includes(p)), false, `${p} 는 실행 표에서 빠져야 한다`);
  }
  assert.match(a, /— 6건/);
  // 사이트링크는 버리지 않고 꼬리표
  const career = rows.find((l) => l.includes("/hub/career"));
  assert.ok(career && career.includes(SITELINK_NOTE), "사이트링크 꼬리표 없음");
  assert.equal(rows.filter((l) => l.includes(SITELINK_NOTE)).length, 1);
  // 동결 줄 = 개수 + 목록 (비 www·끝 슬래시 포함)
  const line = frozenLine(a);
  assert.ok(line, "제목 변경 금지 줄 없음");
  assert.match(line, /— 3건: /);
  for (const u of ["https://www.moneysalary.com/salary-db/sk-hynix", "https://moneysalary.com/salary/49500000", "https://www.moneysalary.com/monthly/3000000/"]) {
    assert.ok(line.includes(u), `${u} 가 동결 줄에 없음`);
  }
  // 버킷 B 는 /salary/[금액] 순위 보강을 그대로 보여 준다 (Round 2 후보 C)
  assert.ok(tableRows(section(out, "B")).some((l) => l.includes("/salary/83000000")));
});

test("frozen line is capped by --top but keeps the full count", () => {
  const csv = writeCsv("many.csv", "인기 페이지,클릭수,노출,CTR,게재 순위", [
    "https://www.moneysalary.com/salary/10000000,1,300,0.3%,4",
    "https://www.moneysalary.com/salary/20000000,1,250,0.4%,4",
    "https://www.moneysalary.com/salary/30000000,1,200,0.5%,4",
  ]);
  const line = frozenLine(section(run(csv, "--top=2"), "A"));
  assert.ok(line);
  assert.match(line, /— 3건: /);
  assert.match(line, /_\.\.\.외 1건_$/);
});

test("query CSV rows are never tagged (keys are not URLs)", () => {
  const csv = writeCsv("queries.csv", "인기 검색어,클릭수,노출,CTR,게재 순위", [
    "머니샐러리,0,150,0%,1.0",
    "/salary/50000000,0,150,0%,3.0",
  ]);
  const out = run(csv);
  const a = section(out, "A");
  const rows = tableRows(a);
  assert.equal(rows.length, 2);
  assert.equal(rows.some((l) => l.includes(SITELINK_NOTE)), false);
  assert.equal(frozenLine(a), undefined);
});
