import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  BUDGETS,
  DUP_MIN_BYTES,
  ENFORCE,
  SAMPLES,
  budgetVerdicts,
  clientPropsBlobs,
  duplicateProps,
  main,
  moduleSources,
  parseArgs,
  parseFlightRows,
} from "../payload-budget.mjs";

// 2026-09-30 WP-01 PC-04: 빌드 산출물 페이로드 예산. 합성 .next(표본 9쪽)로 규칙 ①·② 와 종료 코드를 검증한다.
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "payload-budget-test-"));
after(() => fs.rmSync(TMP, { recursive: true, force: true }));

const BIG_MAP = Object.fromEntries(Array.from({ length: 60 }, (_, i) => [`slug-${i}`, `<p>보강 ${i} ${"가".repeat(20)}</p>`]));
const SMALL = { a: 1 };

/** 합성 flight — mapStyle: inline(요소 안에 직접) · row(별도 모델 행 참조) · text(T 행 문자열 참조) */
function flight({ mapStyle = "inline", map = BIG_MAP, pageText = "page", ids = [1, 2, 3, 4] } = {}) {
  const [imp, imp2, modelId, textId] = ids.map((n) => n.toString(16));
  const lines = [`${imp}:I[50442,["1","static/chunks/app/x/layout-1.js"],"default"]`, `${imp2}:I[777,["2","static/chunks/app/x/page-2.js"],"default"]`];
  let mapRef;
  let extra = "";
  if (mapStyle === "row") {
    lines.push(`${modelId}:${JSON.stringify(map)}`);
    mapRef = `$${modelId}`;
  } else if (mapStyle === "text") {
    const s = JSON.stringify(map);
    extra = `${textId}:T${Buffer.byteLength(s).toString(16)},${s}`;
    mapRef = `$${textId}`;
  } else mapRef = map;
  const root = ["$", "$L" + imp, null, { map: mapRef, maxWidth: "3xl", children: ["$", "$L" + imp2, null, { text: pageText, children: "x".repeat(3000) }] }];
  lines.push(`0:${JSON.stringify(root)}`);
  return Buffer.from(lines.join("\n") + "\n" + extra);
}

/** 합성 .next — 표본 9쪽. 크기는 html 기본 작게(예산 안), 일부만 부풀린다. */
function makeNext(name, { rsc = () => flight(), html = () => "<html><body>ok</body></html>", drop = [], buildId = true, manifest = true } = {}) {
  const dir = path.join(TMP, name, ".next");
  const app = path.join(dir, "server", "app");
  fs.mkdirSync(app, { recursive: true });
  if (buildId) fs.writeFileSync(path.join(dir, "BUILD_ID"), `build-${name}`);
  for (const s of SAMPLES) {
    if (drop.includes(s.page)) continue;
    const file = path.join(app, s.page);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(`${file}.html`, html(s));
    fs.writeFileSync(`${file}.rsc`, rsc(s));
    if (manifest) {
      const m = path.join(app, s.route, "page_client-reference-manifest.js");
      fs.mkdirSync(path.dirname(m), { recursive: true });
      const body = {
        clientModules: {
          "C:\\\\work\\\\repo\\\\src\\\\components\\\\GuideSupplement.tsx": { id: 50442, name: "*", chunks: [], async: false },
          "C:\\\\work\\\\repo\\\\node_modules\\\\next\\\\dist\\\\client\\\\link.js": { id: "777", name: "*", chunks: [], async: false },
        },
      };
      fs.writeFileSync(m, `globalThis.__RSC_MANIFEST=(globalThis.__RSC_MANIFEST||{});globalThis.__RSC_MANIFEST["/${s.route}/page"]=${JSON.stringify(body).replace(/\\\\\\\\/g, "\\\\")};`);
    }
  }
  return dir;
}

function run(argv) {
  const out = [];
  const err = [];
  const code = main(argv, { stdout: (s) => out.push(s), stderr: (s) => err.push(s), cwd: TMP });
  return { code, stdout: out.join(""), stderr: err.join("") };
}

test("fixed 9 samples (spec) each with a seo-int +10% budget; ENFORCE only names known families", () => {
  assert.deepEqual(
    SAMPLES.map((s) => s.page),
    [
      "salary-db/samsung-electronics",
      "salary-db/listed/000020",
      "salary-db/compare/11st-vs-musinsa",
      "guides/annual-leave-allowance",
      "guides/nurse-salary",
      "calc/bmi-quick",
      "calc/samsung-bonus",
      "salary/50000000",
      "index",
    ]
  );
  assert.deepEqual(Object.keys(BUDGETS).sort(), SAMPLES.map((s) => s.page).sort());
  for (const [page, b] of Object.entries(BUDGETS)) {
    assert.ok(Number.isInteger(b.htmlBr) && b.htmlBr > 1000, page);
    assert.ok(Number.isInteger(b.rscBr) && b.rscBr > 1000, page);
  }
  const families = new Set(SAMPLES.map((s) => s.family));
  assert.ok(ENFORCE.families.every((f) => families.has(f)));
  assert.equal(DUP_MIN_BYTES, 2048);
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO, "package.json"), "utf8"));
  assert.equal(pkg.scripts["verify:payload"], "node scripts/payload-budget.mjs --next .next");
});

test("flight rows: T rows are read by byte length (multibyte), I and model rows parsed", () => {
  const s = JSON.stringify({ k: "한글 텍스트\n줄바꿈" });
  const buf = Buffer.from(`1:I[5,[],"default"]\n2:T${Buffer.byteLength(s).toString(16)},${s}3:{"a":1}\n`);
  const rows = parseFlightRows(buf);
  assert.equal(rows.get("1").tag, "I");
  assert.equal(rows.get("2").tag, "T");
  assert.equal(rows.get("2").text, s);
  assert.equal(rows.get("3").body, '{"a":1}');
});

test("client props blobs: children excluded; $row and T-row references resolved so row numbering does not matter", () => {
  const inline = clientPropsBlobs(flight());
  const viaRow = clientPropsBlobs(flight({ mapStyle: "row", ids: [5, 6, 7, 8] }));
  const viaText = clientPropsBlobs(flight({ mapStyle: "text", ids: [9, 10, 11, 12] }));
  const layout = (list) => list.find((b) => b.ref === "50442#default");
  assert.equal(layout(inline).keys, "map,maxWidth");
  assert.equal(layout(inline).hash, layout(viaRow).hash);
  assert.ok(layout(inline).bytes >= DUP_MIN_BYTES);
  // T 행으로 온 값은 문자열이므로 직렬화가 다르다(같은 내용이어도 객체 ≠ 문자열) — 다만 해석은 된다
  assert.ok(layout(viaText).bytes > 1000);
  const page = inline.find((b) => b.ref === "777#default");
  assert.equal(page.keys, "text", "children 은 props 크기에서 뺀다");
  assert.ok(page.bytes < 100);
});

test("rule 2: same ref + identical ≥2KB props on 2+ different samples → one warning; small, unique or different content → none", () => {
  const row = (page, buf) => ({ page, blobs: clientPropsBlobs(buf) });
  const dups = duplicateProps([row("guides/a", flight()), row("guides/b", flight({ mapStyle: "row" })), row("calc/x", flight({ map: SMALL }))]);
  assert.equal(dups.length, 1);
  assert.equal(dups[0].ref, "50442#default");
  assert.deepEqual(dups[0].pages, ["guides/a", "guides/b"]);
  // 쪽마다 다른 내용(정상 쪽별 데이터)은 크기가 커도 경고하지 않는다
  const other = { ...BIG_MAP, extra: "다른 쪽" };
  assert.equal(duplicateProps([row("guides/a", flight()), row("guides/b", flight({ map: other }))]).length, 0);
  // 한 쪽에만 있는 큰 props 도 경고하지 않는다
  assert.equal(duplicateProps([row("guides/a", flight())]).length, 0);
  // 2KB 미만은 같은 내용이어도 경고하지 않는다
  assert.equal(duplicateProps([row("a", flight({ map: SMALL })), row("b", flight({ map: SMALL }))]).length, 0);
});

test("rule 1: over budget → WARN in report mode (exit 0), FAIL only for enforced families (exit 1)", () => {
  const rows = [
    { page: "guides/nurse-salary", family: "guides", htmlBr: BUDGETS["guides/nurse-salary"].htmlBr + 1, rscBr: 10 },
    { page: "index", family: "home", htmlBr: 10, rscBr: 10 },
  ];
  const report = budgetVerdicts(rows);
  assert.equal(report[0].over.length, 1);
  assert.equal(report[0].over[0].what, "htmlBr");
  assert.equal(report[0].enforced, false);
  assert.equal(report[1].over.length, 0);
  assert.equal(budgetVerdicts(rows, { enforce: { families: ["guides"], duplicateProps: false } })[0].enforced, true);
});

test("CLI: report mode exits 0 with warnings; --enforce turns the same findings into exit 1; errors exit 1", () => {
  const ok = makeNext("ok");
  const r = run(["--next", ok]);
  assert.equal(r.code, 0, r.stderr);
  assert.match(r.stdout, /규칙 ② 쪽 간 중복 props.*— 1건\(보고\)/);
  assert.match(r.stdout, /\| 50442#default \| src\/components\/GuideSupplement\.tsx \| map,maxWidth \|/);
  assert.match(r.stdout, /\[verify:payload\] 보고 모드 · 빌드 1 · 강제 위반·오류 0 · 경고 1 → exit 0/);
  assert.equal((r.stdout.match(/\| OK \|/g) ?? []).length, 9);

  assert.equal(run(["--next", ok, "--enforce", "dup"]).code, 1);
  assert.equal(run(["--next", ok, "--enforce", "guides"]).code, 0, "크기 안이면 강제여도 통과");

  // 가이드 HTML 을 예산보다 크게(난수 base64 라 brotli 로 거의 줄지 않는다 — 약 80KB > 상한 약 47KB)
  const noise = crypto.randomBytes(80_000).toString("base64");
  const bigGuide = makeNext("big", { html: (s) => (s.family === "guides" ? `<html><body>${noise}</body></html>` : "<html></html>") });
  const warn = run(["--next", bigGuide]);
  assert.equal(warn.code, 0);
  assert.match(warn.stdout, /\| guides\/nurse-salary \|.*\| WARN HTML br \+\d+\.\d%/);
  const fail = run(["--next", bigGuide, "--enforce", "guides"]);
  assert.equal(fail.code, 1);
  assert.match(fail.stdout, /FAIL\(강제\) HTML br/);
  assert.equal(run(["--next", bigGuide, "--enforce", "salary-db"]).code, 0, "강제하지 않은 템플릿의 초과는 경고");

  // 두 빌드: 차이 표
  const two = run(["--next", ok, "--next", bigGuide]);
  assert.match(two.stdout, /## 빌드 간 차이/);

  // 오류: 표본 없음·BUILD_ID 없음·인자
  assert.equal(run(["--next", makeNext("drop", { drop: ["calc/bmi-quick"] })]).code, 1);
  assert.equal(run(["--next", makeNext("nobuild", { buildId: false })]).code, 1);
  assert.equal(run([]).code, 1);
  assert.equal(run(["--next"]).code, 1);
  assert.equal(run(["--next", ok, "--enforce", "blog"]).code, 1);
  assert.equal(parseArgs(["--next", "a", "--next=b"]).opts.next.length, 2);
});

test("module names come from the client reference manifest (src/… or node_modules/…)", () => {
  const dir = makeNext("names");
  const names = moduleSources(dir, "guides/[slug]");
  assert.equal(names.get("50442"), "src/components/GuideSupplement.tsx");
  assert.equal(names.get("777"), "node_modules/next/dist/client/link.js");
  assert.equal(moduleSources(dir, "no/such/route").size, 0);
});
