import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const cli = fileURLToPath(new URL("../adsense-report.mjs", import.meta.url));
// Synthetic fixtures only; public slot identifiers select the CLI's existing unit mapping.
const ids = ["8284703133", "5584143639", "3302558597"];
const unitHeader = "Ad unit,Estimated earnings,Impressions,Clicks";
const datedHeader = `Date,${unitHeader}`;
const beforeDates = ["2026-01-01", "2026-01-02"];
const afterDates = ["2026-01-03", "2026-01-04"];
const provenance = ["--before-period", ...beforeDates, "--after-period", ...afterDates];

function rows(dates, displayClicks = 30) {
  return dates.flatMap((date) => ids.map((id, index) =>
    `${date},${id},${10 + index},1000,${index === 0 ? displayClicks : 30}`));
}
function daily(dates, displayClicks) {
  return [datedHeader, ...rows(dates, displayClicks)].join("\n");
}
function summary(extra = 0) {
  return [unitHeader, ...ids.map((id, index) => `${id},${20 + index + extra},2000,60`)].join("\n");
}
function fixture(t) {
  const parent = path.resolve(tmpdir());
  const dir = mkdtempSync(path.join(parent, "adsense-report-test-"));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(dir)), parent);
    assert.ok(path.basename(dir).startsWith("adsense-report-test-"));
    rmSync(dir, { recursive: true, force: true });
  });
  const write = (name, contents) => {
    const file = path.join(dir, name);
    writeFileSync(file, contents);
    return file;
  };
  const run = (...args) => execFileSync(process.execPath, [cli, ...args, "--md"], { encoding: "utf8" });
  const exp1 = (before, after, ...args) => run("exp1", write("before.csv", before), write("after.csv", after), ...args);
  return { write, run, exp1 };
}
function inconclusive(output, reason) {
  assert.match(output, /^판정: 판정 불가·현상 유지/m);
  assert.doesNotMatch(output, /^판정: 유지$/m);
  assert.match(output, reason);
}

test("dated, complete independent windows can retain an experiment", (t) => {
  const output = fixture(t).exp1(daily([...beforeDates].reverse()), daily(afterDates));
  assert.match(output, /^판정: 유지$/m);
  assert.match(output, /전 2일 · 후 2일/);
  assert.match(output, /2026-01-01~2026-01-02 \(CSV 날짜별 행\)/);
});

test("different cumulative summaries remain inconclusive even with --days", (t) => {
  inconclusive(fixture(t).exp1(summary(), summary(1), "--days", "14", "14"), /날짜 없음/);
});

test("date-less period summaries accept explicit operator-confirmed provenance", (t) => {
  const output = fixture(t).exp1(summary(), summary(1), ...provenance);
  assert.match(output, /^판정: 유지$/m);
  assert.match(output, /운영자 확인 내보내기 기간/);
});

test("renaming or reordering the same input cannot produce a retention verdict", (t) => {
  const content = summary();
  const reordered = [unitHeader, ...content.split("\n").slice(1).reverse()].join("\r\n");
  inconclusive(fixture(t).exp1(content, reordered, ...provenance), /동일 데이터/);
});

test("the same filename is still blocked", (t) => {
  const f = fixture(t);
  const file = f.write("same.csv", summary());
  inconclusive(f.run("exp1", file, file, ...provenance), /동일 파일/);
});

test("dated windows with any shared day are blocked", (t) => {
  inconclusive(fixture(t).exp1(daily(beforeDates), daily(["2026-01-02", "2026-01-03"])), /기간 겹침/);
});

test("date-less declared windows cannot overlap", (t) => {
  inconclusive(fixture(t).exp1(summary(), summary(1), "--before-period", ...beforeDates,
    "--after-period", "2026-01-02", "2026-01-03"), /기간 겹침/);
});

test("reversed chronological windows are blocked", (t) => {
  inconclusive(fixture(t).exp1(daily(afterDates), daily(beforeDates)), /순서 역전/);
});

test("missing whole dates cannot be treated as shorter complete windows", (t) => {
  inconclusive(fixture(t).exp1(daily(["2025-12-29", "2025-12-31"]), daily(afterDates)), /날짜 누락/);
});

test("one unit missing a day is not silently treated as zero", (t) => {
  const incomplete = [datedHeader, ...rows(beforeDates).filter((row) => !row.startsWith(`${beforeDates[0]},${ids[1]}`))].join("\n");
  inconclusive(fixture(t).exp1(incomplete, daily(afterDates)), /CALC_RESULT 날짜 누락/);
});

test("missing comparison units in summaries cannot prove absence of cannibalization", (t) => {
  const incomplete = summary().split("\n").filter((row) => !row.startsWith(ids[2])).join("\n");
  inconclusive(fixture(t).exp1(incomplete, summary(1), ...provenance), /비교 행 누락/);
});

test("a duplicate day/unit cannot inflate the sample", (t) => {
  inconclusive(fixture(t).exp1(`${daily(beforeDates)}\n${rows(beforeDates)[0]}`, daily(afterDates)), /중복 행/);
});

test("invalid calendar dates cannot establish a period", (t) => {
  inconclusive(fixture(t).exp1(daily(["2026-02-29", "2026-02-30"]), daily(["2026-03-03", "2026-03-04"])), /잘못된 날짜/);
});

test("silently skipped unparseable data dates also block a verdict", (t) => {
  inconclusive(fixture(t).exp1(`${daily(beforeDates)}\nbad-date,${ids[0]},10,1000,30`, daily(afterDates)), /해석 불가/);
});

test("standard total rows do not count as incomplete data", (t) => {
  const output = fixture(t).exp1(`${daily(beforeDates)}\nTotal,Total,66,6000,180`, daily(afterDates));
  assert.match(output, /^판정: 유지$/m);
});

test("declared bounds cannot hide missing dates at the edges", (t) => {
  inconclusive(fixture(t).exp1(daily(beforeDates), daily(afterDates), "--before-period", "2025-12-31", "2026-01-02"), /범위 불일치/);
});

test("--days cannot override the verified date count", (t) => {
  inconclusive(fixture(t).exp1(daily(beforeDates), daily(afterDates), "--days", "14", "14"), /일수 불일치/);
});

test("valid periods do not bypass insufficient experimental clicks", (t) => {
  inconclusive(fixture(t).exp1(daily(beforeDates), daily(afterDates, 10)), /후 창 클릭 20 < 50/);
});

test("units, window and join remain usable without exp1 provenance", (t) => {
  const f = fixture(t);
  const units = f.write("units.csv", summary());
  assert.match(f.run("units", units), /날짜 열이 없습니다/);
  const header = "Date,Estimated earnings,Page views,Impressions,Clicks";
  const site = f.write("site.csv", `${header}\n2026-01-01,10,1000,2000,100\n2026-01-02,20,2000,4000,200`);
  const subset = f.write("subset.csv", `${header}\n2026-01-01,2,200,400,20\n2026-01-02,4,400,800,40`);
  const original = readFileSync(site, "utf8");
  assert.match(f.run("window", site, ...beforeDates), /15\.00/);
  assert.match(f.run("join", site, subset, ...beforeDates), /20\.00%/);
  assert.equal(readFileSync(site, "utf8"), original);
});
