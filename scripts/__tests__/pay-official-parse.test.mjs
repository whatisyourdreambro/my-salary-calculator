import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";
import {
  DEFAULT_MODULE_2026,
  REPO_ROOT,
  anchorValues,
  compareTables,
  emitTsFragment,
  parsePayPage,
  validatePayTables,
} from "../pay-official-parse.mjs";

// R6-03 2027 봉급표 D-Day 키트 (2026-09-27): 인사혁신처 봉급표 원문 HTML 파서·검증기 가드.
// 픽스처 = 인사혁신처 2026·2025 봉급표 페이지(2026-09-25 저장)에서 별표 3·10·11 표만 남긴 것. 네트워크 없음.
const SCRIPT = fileURLToPath(new URL("../pay-official-parse.mjs", import.meta.url));
const fixturePath = (year) => fileURLToPath(new URL(`./fixtures/pay-official/mpm-${year}.html`, import.meta.url));
const html2026 = readFileSync(fixturePath(2026), "utf8");
const html2025 = readFileSync(fixturePath(2025), "utf8");
const y2026 = parsePayPage(html2026);
const y2025 = parsePayPage(html2025);

const tmp = mkdtempSync(join(tmpdir(), "pay-official-parse-"));
after(() => rmSync(tmp, { recursive: true, force: true }));

const run = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { cwd: REPO_ROOT, encoding: "utf8" });
const clone = (x) => JSON.parse(JSON.stringify(x));
const tablesOnly = (d) => ({ teacher: d.teacher, policeFire: d.policeFire, general: d.general });
const nullMask = (rows) => rows.map((row) => row.map((v, i) => (i === 0 ? v : v === null)));
const writeJson = (name, data) => {
  const file = join(tmp, name);
  writeFileSync(file, JSON.stringify(data));
  return file;
};

test("2026 fixture: the four hand-check anchors match the official table", () => {
  assert.equal(y2026.year, 2026);
  const anchors = Object.fromEntries(anchorValues(y2026).map((a) => [a.label, a.value]));
  assert.deepEqual(anchors, {
    "9급 1호봉": 2133000,
    "경사 1호봉": 2472100,
    "경감 1호봉": 2698600,
    "교원 9호봉": 2495600,
  });
});

test("2026 fixture: teacher has 40 contiguous rows, grids have the r2-l2 shape", () => {
  assert.equal(y2026.teacher.length, 40);
  assert.deepEqual(
    y2026.teacher.map((row) => row[0]),
    Array.from({ length: 40 }, (_, i) => i + 1)
  );
  assert.ok(y2026.teacher.every((row) => row.length === 2 && typeof row[1] === "number"));
  // 경찰·소방 [호봉, 순경…치안정감] 32행 · 일반직 [호봉, 9급…1급] 32행, 없는 호봉은 null
  assert.equal(y2026.policeFire.length, 32);
  assert.ok(y2026.policeFire.every((row) => row.length === 11));
  assert.equal(y2026.general.length, 32);
  assert.ok(y2026.general.every((row) => row.length === 10));
  assert.deepEqual(y2026.policeFire[31], [32, null, null, null, null, 5372500, null, null, null, null, null]);
  assert.deepEqual(y2026.general[31], [32, null, null, null, 4967800, null, null, null, null, null]);
  // 열 방향: 낮은 계급 → 높은 계급 (원문은 치안정감·1급이 왼쪽 — 머리글 이름으로 다시 줄 세움)
  assert.equal(y2026.policeFire[0][1], 2133000);
  assert.equal(y2026.policeFire[0][10], 4905100);
  assert.equal(y2026.general[0][9], 4656100);
  assert.deepEqual(validatePayTables(y2026), []);
  assert.deepEqual(validatePayTables(y2025), []);
});

test("2026 shape equals 2025 shape (row counts, steps and null positions)", () => {
  assert.equal(y2025.year, 2025);
  for (const key of ["teacher", "policeFire", "general"]) {
    assert.equal(y2026[key].length, y2025[key].length, key);
    assert.deepEqual(nullMask(y2026[key]), nullMask(y2025[key]), key);
  }
});

test("2026 >= 2025 in every cell, and the validator agrees", () => {
  let cells = 0;
  for (const key of ["teacher", "policeFire", "general"]) {
    y2026[key].forEach((row, r) =>
      row.slice(1).forEach((v, c) => {
        const prev = y2025[key][r][c + 1];
        if (v === null) return;
        cells++;
        assert.ok(v >= prev, `${key} ${row[0]}호봉 열 ${c + 1}: ${v} < ${prev}`);
      })
    );
  }
  assert.equal(cells, 40 + 289 + 258);
  assert.deepEqual(validatePayTables(y2026, y2025), []);
  // 거꾸로(2025 를 2026 기준으로)는 모든 칸이 작아서 실패
  assert.ok(validatePayTables(y2025, y2026).some((p) => p.includes("< 이전 연도")));
});

test("CLI: prints the four anchors and passes with --prev (HTML or its own --json output)", () => {
  const r = run(fixturePath(2026), "--prev", fixturePath(2025));
  assert.equal(r.status, 0, r.stdout + r.stderr);
  for (const line of ["9급 1호봉", "2,133,000원", "경사 1호봉", "2,472,100원", "경감 1호봉", "2,698,600원", "교원 9호봉", "2,495,600원"]) {
    assert.ok(r.stdout.includes(line), line);
  }
  assert.match(r.stdout, /\[validate\] 통과/);

  const json2025 = join(tmp, "pay-2025.json");
  const w = run(fixturePath(2025), "--json", json2025);
  assert.equal(w.status, 0, w.stdout + w.stderr);
  const saved = JSON.parse(readFileSync(json2025, "utf8"));
  assert.equal(saved.year, 2025);
  assert.deepEqual(tablesOnly(saved), tablesOnly(y2025));
  const p = run(fixturePath(2026), "--prev", json2025);
  assert.equal(p.status, 0, p.stdout + p.stderr);

  const bad = run(fixturePath(2025), "--prev", fixturePath(2026));
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /\[validate\] 문제/);
});

test("validator catches single-cell defects", () => {
  const check = (mutate, pattern, prev = y2025) => {
    const d = clone(y2026);
    mutate(d);
    const problems = validatePayTables(d, prev);
    assert.ok(problems.some((p) => pattern.test(p)), `${pattern}: ${problems.slice(0, 3).join(" / ")}`);
  };
  check((d) => (d.general[0][1] += 50), /100원 단위/);
  check((d) => (d.policeFire[5][3] = d.policeFire[4][3]), /앞 호봉 .* 보다 크지 않음/);
  check((d) => (d.general[31][4] = null), /빈 칸 위치가 이전 연도와 다름/);
  check((d) => (d.general[30][9] = 8001400), /빈 칸 위치가 이전 연도와 다름/);
  check((d) => d.teacher.pop(), /교원: 행 수 39/);
  check((d) => (d.teacher[4][0] = 6), /1부터 빈틈없는 오름차순이 아님/);
  check((d) => (d.policeFire[0][5] = 2600000), /< 이전 연도/);
  check(() => {}, /모든 칸이 이전 연도 표와 같음/, clone(y2026));
});

test("--compare: identical transcriptions exit 0, a single altered cell exits 1", () => {
  const a = writeJson("typed-a.json", tablesOnly(y2026));
  // 메모장 등이 붙이는 BOM 이 있어도 읽는다
  const b = join(tmp, "typed-b.json");
  writeFileSync(b, String.fromCharCode(0xfeff) + JSON.stringify(tablesOnly(y2026)));
  const same = run("--compare", a, b);
  assert.equal(same.status, 0, same.stdout + same.stderr);
  assert.match(same.stdout, /모든 칸에서 같습니다/);

  const altered = clone(tablesOnly(y2026));
  altered.policeFire[2][3] += 100; // 경사 3호봉 한 칸만
  const c = writeJson("typed-c.json", altered);
  const diff = run("--compare", a, c);
  assert.equal(diff.status, 1, diff.stdout + diff.stderr);
  assert.match(diff.stdout, /차이 1칸/);
  assert.match(diff.stdout, /경찰·소방 3행\(3호봉\) 경사: A=2539000 B=2539100/);
  assert.equal(compareTables(tablesOnly(y2026), altered).length, 1);

  // 합의된 입력은 --prev 검증과 --emit-ts 까지 이어진다
  const full = run("--compare", a, b, "--prev", fixturePath(2025), "--emit-ts");
  assert.equal(full.status, 0, full.stdout + full.stderr);
  assert.equal(full.stdout, emitTsFragment(y2026));
});

test("--against-module skips cleanly when the module is absent", () => {
  const missing = join(tmp, "no-such-dir", "payTablesFull2026.ts");
  const r = run(fixturePath(2026), "--against-module", missing);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /\[against-module\] 건너뜀: .* 없음/);

  // 기본 경로(src/lib/payTablesFull2026.ts): 10/14 전에는 건너뜀, 뒤에는 원문과 모든 칸 일치 — 두 상태 모두 0
  const d = run(fixturePath(2026), "--against-module");
  assert.equal(d.status, 0, d.stdout + d.stderr);
  assert.match(d.stdout, existsSync(DEFAULT_MODULE_2026) ? /모든 칸 일치/ : /건너뜀/);
});

test("--against-module imports a TS module via tsx and compares cell by cell", () => {
  const lit = (rows) => `[\n${rows.map((row) => `  [${row.map((v) => (v === null ? "null" : v)).join(", ")}],`).join("\n")}\n]`;
  const moduleText = (d) =>
    [
      `export const TEACHER_PAY_FULL_2026: ReadonlyArray<readonly [number, number]> = ${lit(d.teacher)};`,
      `export const POLICE_FIRE_PAY_FULL_2026: ReadonlyArray<ReadonlyArray<number | null>> = ${lit(d.policeFire)};`,
      `export const GENERAL_PAY_FULL_2026: ReadonlyArray<ReadonlyArray<number | null>> = ${lit(d.general)};`,
      "",
    ].join("\n");
  const good = join(tmp, "good", "payTablesFull2026.ts");
  const bad = join(tmp, "bad", "payTablesFull2026.ts");
  for (const [file, data] of [
    [good, y2026],
    [bad, (() => { const d = clone(y2026); d.teacher[8][1] = 2495700; return d; })()],
  ]) {
    mkdirSync(join(file, ".."), { recursive: true });
    writeFileSync(file, moduleText(data));
  }
  const ok = run(fixturePath(2026), "--against-module", good);
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(ok.stdout, /모든 칸 일치/);
  const ng = run(fixturePath(2026), "--against-module", bad);
  assert.equal(ng.status, 1, ng.stdout + ng.stderr);
  assert.match(ng.stdout, /교원 9행\(9호봉\) 봉급: 원문=2495600 모듈=2495700/);
  // 2026 이 아닌 페이지로는 대조하지 않는다(사용 오류)
  const wrongYear = run(fixturePath(2025), "--against-module", good);
  assert.equal(wrongYear.status, 2);
});

test("--emit-ts prints only the PAY_FULL_2027 fragment on stdout (report on stderr)", () => {
  const r = run(fixturePath(2026), "--prev", fixturePath(2025), "--emit-ts");
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stderr, /\[anchors\]/);
  assert.ok(!r.stdout.includes("[anchors]"));
  assert.ok(r.stdout.startsWith("  teacher: [\n    [1, 2041500],\n"));
  const obj = new Function(`return {\n${r.stdout}};`)();
  assert.deepEqual(obj, tablesOnly(y2026));
});

test("tables are chosen by caption, not by position; missing or duplicate tables fail loudly", () => {
  const blocks = [...html2026.matchAll(/<table\b[\s\S]*?<\/table>/g)].map((m) => m[0]);
  assert.equal(blocks.length, 3);
  const [general, police, teacher] = blocks;
  // 실제 페이지에는 머리글이 같은 공안직(1급~9급)·국립대학 교원(호봉|봉급) 표가 함께 있다
  const gongan = general
    .replace("일반직공무원과 일반직에 준하는 특정직 및 별정직 공무원 등의 봉급표", "공안업무 등에 종사하는 공무원의 봉급표")
    .replace("2,133,000", "2,133,100");
  const univ = teacher
    .replace("유치원ㆍ초등학교ㆍ중학교ㆍ고등학교 교원 등의 봉급표", "국립대학 교원 등의 봉급표")
    .replace("2,495,600", "2,495,700");
  // 머리글 속 엔티티·폭 없는 공백(&#8203;)도 계급 이름 매칭을 깨지 않는다
  assert.ok(police.includes("<p>순 경</p>"));
  const policeEntities = police.replace("<p>순 경</p>", "<p>순&#8203;경&nbsp;</p>");
  const shuffled = `<h4>2026년 직종별 공무원 봉급표</h4>${univ}${teacher}${gongan}${policeEntities}${general}`;
  assert.deepEqual(tablesOnly(parsePayPage(shuffled)), tablesOnly(y2026));

  assert.throws(() => parsePayPage(`${general}${police}`), /\[별표 11\] 교원 표를 찾지 못했습니다/);
  assert.throws(() => parsePayPage(`${general}${general}${police}${teacher}`), /\[별표 3\] 일반직 표가 2개/);

  const noTeacher = join(tmp, "no-teacher.html");
  writeFileSync(noTeacher, html2026.replace(teacher, ""));
  const r = run(noTeacher);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /교원 표를 찾지 못했습니다/);
});

test("--json refuses a path inside the repository", () => {
  const r = run(fixturePath(2026), "--json", join(REPO_ROOT, "src", "lib", "pay-2026.json"));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /저장소 안에는 쓰지 않습니다/);
  assert.equal(existsSync(join(REPO_ROOT, "src", "lib", "pay-2026.json")), false);
});
