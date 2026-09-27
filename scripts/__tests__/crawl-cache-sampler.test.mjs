import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  BASE,
  FAMILIES,
  FEED_PATHS,
  NA_MARK,
  OVERLAP_WINDOW_MS,
  QUOTAS,
  UA,
  aggregate,
  aggregateLine,
  applyLimit,
  carriedFromPrev,
  classifyPath,
  feedVerdicts,
  main,
  parseSitemap,
  prevFetchTimes,
  sampleUrls,
} from "../crawl-cache-sampler.mjs";

// 2026-09-27 R6-02: 계열별 층화 표본의 엣지 캐시·5xx 표본기. 네트워크 없이(fetch 주입) 검증한다.
const SCRIPT = fileURLToPath(new URL("../crawl-cache-sampler.mjs", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const TMP = mkdtempSync(path.join(os.tmpdir(), "crawl-sampler-test-"));
after(() => rmSync(TMP, { recursive: true, force: true }));

const PAY_TABLES = [
  "/civil-servant-pay-2026",
  "/civil-servant-pay-2027",
  "/teacher-pay-2026",
  "/police-pay-2026",
  "/firefighter-pay-2026",
  "/military-pay-2026",
];

/** 계열별 모집단이 몫보다 넉넉한 합성 사이트맵 + 잡음(다른 호스트·제외 경로·대체 주소). */
function fixtureXml() {
  const paths = [
    "/",
    "/salary-db",
    "/salary-db/ranking",
    "/salary-db/listed",
    "/salary-db/listed/industry/bank",
    "/salary-db/compare/naver-vs-kakao",
    "/guides",
    "/guides/category/tax",
    "/calc",
    "/job/civil-servant-9",
    "/en/salary/50000000",
    "/glossary/%EA%B8%B0%ED%9A%8C%EB%B9%84%EC%9A%A9",
    "/search?q=a&page=2",
    ...Array.from({ length: 40 }, (_, i) => `/salary-db/company-${i}`),
    ...Array.from({ length: 30 }, (_, i) => `/salary-db/listed/${String(100000 + i * 37)}`),
    ...Array.from({ length: 25 }, (_, i) => `/calc/tool-${i}`),
    ...Array.from({ length: 25 }, (_, i) => `/guides/guide-${i}`),
    ...PAY_TABLES,
    ...Array.from({ length: 12 }, (_, i) => `/salary/${(i + 2) * 5000000}`),
    ...Array.from({ length: 8 }, (_, i) => `/monthly/${(i + 2) * 500000}`),
  ];
  const urls = paths.map(
    (p) =>
      `<url>\n<loc>${BASE}${p.replace(/&/g, "&amp;")}</loc>\n` +
      `<xhtml:link rel="alternate" hreflang="en" href="${BASE}/en${p === "/" ? "" : p.replace(/&/g, "&amp;")}" />\n` +
      `<lastmod>2026-09-19T00:00:00.000Z</lastmod>\n</url>`
  );
  urls.push("<url><loc>https://example.com/calc/other-host</loc></url>");
  urls.push("<url><loc>https://moneysalary.com/calc/apex-host</loc></url>");
  urls.push("<url><loc>http://www.moneysalary.com/calc/plain-http</loc></url>");
  urls.push(`<url><loc>${BASE}/calc/tool-0</loc></url>`); // 중복
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`;
}
const XML = fixtureXml();
const FIXTURE = path.join(TMP, "sitemap-fixture.xml");
writeFileSync(FIXTURE, XML);

/** 9/27 운영 사이트맵과 같은 모집단 크기(회사 430·lite 219·계산기 245·가이드 294·봉급표 6·연봉 316) — 재시드 겹침 검증용. */
function prodLikeXml() {
  const paths = [
    ...Array.from({ length: 430 }, (_, i) => `/salary-db/co-${i}`),
    ...Array.from({ length: 219 }, (_, i) => `/salary-db/listed/${String(200000 + i * 13)}`),
    ...Array.from({ length: 245 }, (_, i) => `/calc/c-${i}`),
    ...Array.from({ length: 294 }, (_, i) => `/guides/g-${i}`),
    ...PAY_TABLES,
    ...Array.from({ length: 316 }, (_, i) => (i % 2 ? `/salary/${(i + 10) * 1000000}` : `/monthly/${(i + 10) * 100000}`)),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
    .map((p) => `<url><loc>${BASE}${p}</loc></url>`)
    .join("\n")}\n</urlset>\n`;
}
const PROD_FIXTURE = path.join(TMP, "sitemap-prodlike.xml");
writeFileSync(PROD_FIXTURE, prodLikeXml());
const HOUR = 3600 * 1000;

const SEPT_28 = Date.parse("2026-09-28T01:00:00Z"); // KST 2026-09-28 10:00
const OCT_20 = Date.parse("2026-10-20T01:00:00Z");

/**
 * 주입 fetch — 엣지 캐시 흉내: 처음 보는 URL 은 MISS(단 warm 집합은 처음부터 HIT), 두 번째부터 HIT.
 * overrides: 경로 → (n번째 요청) => { status, body, type, throw }
 */
function makeStub({ warm = new Set(), overrides = {}, rssTables404 = true } = {}) {
  const seen = new Map();
  const calls = [];
  const fetchStub = async (url, init) => {
    const u = new URL(url);
    const p = u.pathname;
    calls.push({ url, ua: init?.headers?.["user-agent"], redirect: init?.redirect });
    const nth = (seen.get(p) ?? 0) + 1;
    seen.set(p, nth);
    const o = overrides[p]?.(nth);
    if (o?.throw) throw new TypeError("fetch failed");
    const hit = nth > 1 || warm.has(p);
    const headers = { "cf-cache-status": hit ? "HIT" : "MISS" };
    if (hit) headers.age = String(warm.has(p) && nth === 1 ? 1200 : 30);
    if (o) {
      headers["content-type"] = o.type ?? "text/html; charset=utf-8";
      return new Response(o.body ?? "<html><body>err</body></html>", { status: o.status, headers });
    }
    if (p === "/rss-tables.xml" && rssTables404) return new Response("not found", { status: 404, headers: { "content-type": "text/plain" } });
    if (p === "/robots.txt") return new Response("User-agent: *\nAllow: /\n", { status: 200, headers: { ...headers, "content-type": "text/plain" } });
    if (p === "/sitemap.xml") return new Response(XML, { status: 200, headers: { ...headers, "content-type": "application/xml" } });
    if (p.endsWith(".xml"))
      return new Response("<rss><channel></channel></rss>", { status: 200, headers: { ...headers, "content-type": "application/rss+xml" } });
    return new Response(`<!DOCTYPE html><html><body>${p}</body></html>`, {
      status: 200,
      headers: { ...headers, "content-type": "text/html; charset=utf-8" },
    });
  };
  return { fetchStub, calls, seen };
}

/** main 을 네트워크 없이 돌린다 — stdout·stderr·sleep 기록과 함께. */
async function runMain(argv, { stub = makeStub(), clock = SEPT_28, extra = {} } = {}) {
  const out = [];
  const err = [];
  const sleeps = [];
  const events = [];
  let t = 0;
  const code = await main(argv, {
    fetch: async (url, init) => {
      events.push({ kind: "fetch", url });
      return stub.fetchStub(url, init);
    },
    sleep: async (ms) => {
      sleeps.push(ms);
      events.push({ kind: "sleep", ms });
    },
    now: () => (t += 7),
    clock: () => clock,
    stdout: (s) => out.push(s),
    stderr: (s) => err.push(s),
    progress: () => {},
    cwd: TMP,
    ...extra,
  });
  return { code, stdout: out.join(""), stderr: err.join(""), sleeps, events, stub };
}

const lastLine = (s) => s.trimEnd().split(/\r?\n/).pop();

/** 집계 줄에 URL·경로가 없어야 한다(날짜 9/28 과 분수 0/180 같은 숫자/숫자, 겹침 표지 n/a 는 허용). */
function assertNoUrl(line, samplePaths = []) {
  const s = line.split(NA_MARK).join("NA");
  assert.equal(/\bn\/a\b/.test(s), false, `n/a 는 '${NA_MARK}' 로만: ${line}`);
  assert.equal(/:\/\//.test(s), false, line);
  assert.equal(/moneysalary|www\./i.test(s), false, line);
  assert.equal(/\/[A-Za-z%]/.test(s), false, line);
  assert.equal(/\.(xml|txt|html)\b/.test(s), false, line);
  for (const p of samplePaths) assert.equal(line.includes(p), false, `${p} in ${line}`);
}

test("UA is the same browser UA string as scripts/health-check.mjs", () => {
  const hc = readFileSync(path.join(REPO, "scripts", "health-check.mjs"), "utf8");
  assert.ok(hc.includes(`"${UA}"`), "health-check.mjs 의 UA 와 다름");
  assert.match(UA, /^Mozilla\/5\.0 .*Chrome\//);
});

test("classifies 40+ edge-case paths into families", () => {
  const cases = [
    // company
    ["/salary-db/samsung-electronics", "company"],
    ["/salary-db/29cm", "company"],
    ["/salary-db/sk-hynix/", "company"],
    ["/salary-db/naver?tab=bonus", "company"],
    ["/salary-db/%EC%82%BC%EC%84%B1", "company"],
    ["/salary-db/listed-company-x", "company"],
    ["/salary-db/compare", null],
    ["/salary-db/ranking", null],
    ["/salary-db/listed", null],
    ["/salary-db/listed/", null],
    ["/salary-db/submit", null],
    ["/salary-db/compare/naver-vs-kakao", null],
    ["/salary-db", null],
    ["/salary-db/", null],
    ["/salary-db/samsung-electronics/extra", null],
    ["/Salary-DB/samsung-electronics", null],
    // lite
    ["/salary-db/listed/005930", "lite"],
    ["/salary-db/listed/900290", "lite"],
    ["/salary-db/listed/005930/", "lite"],
    ["/salary-db/listed/00593", null],
    ["/salary-db/listed/0059301", null],
    ["/salary-db/listed/0088M0", null],
    ["/salary-db/listed/industry/bank", null],
    // calc
    ["/calc/bonus", "calc"],
    ["/calc/samsung-bonus#result", "calc"],
    ["/calc", null],
    ["/calc/", null],
    ["/calc/bonus/detail", null],
    ["/calculator/bonus", null],
    ["/en/calc/bonus", null],
    // guides
    ["/guides/severance-pay-guide", "guides"],
    ["/guides", null],
    ["/guides/category", null],
    ["/guides/category/tax", null],
    // pay-table
    ["/civil-servant-pay-2026", "pay-table"],
    ["/civil-servant-pay-2027", "pay-table"],
    ["/teacher-pay-2026", "pay-table"],
    ["/police-pay-2026/", "pay-table"],
    ["/firefighter-pay-2026", "pay-table"],
    ["/military-pay-2026", "pay-table"],
    ["/teacher-pay", null],
    ["/nurse-pay-2026", null],
    ["/job/civil-servant-9", null],
    ["/table/2026/annual", null],
    ["/civil-servant-pay-2026/grade-9", null],
    // salary
    ["/salary/50000000", "salary"],
    ["/monthly/3000000", "salary"],
    ["/salary", null],
    ["/monthly", null],
    ["/salary-raise-2026", null],
    ["/salary/50000000/extra", null],
    ["/en/salary/50000000", null],
    // feeds · 기타
    ["/robots.txt", "feeds"],
    ["/sitemap.xml", "feeds"],
    ["/rss.xml", "feeds"],
    ["/rss-companies.xml", "feeds"],
    ["/rss-tables.xml", "feeds"],
    ["/", null],
    ["", null],
    ["salary-db/samsung", null],
    ["https://www.moneysalary.com/calc/bonus", null],
    ["//calc/bonus", null],
    ["/calc//bonus", null],
  ];
  assert.ok(cases.length >= 30);
  for (const [p, want] of cases) assert.equal(classifyPath(p), want, `classifyPath(${JSON.stringify(p)})`);
});

test("parses only this site's https <loc> paths, decodes entities, ignores alternates and duplicates", () => {
  const paths = parseSitemap(XML);
  assert.ok(paths.includes("/search"), "쿼리는 떼고 경로만");
  assert.ok(paths.includes("/salary-db/company-0"));
  assert.equal(paths.filter((p) => p === "/calc/tool-0").length, 1);
  assert.equal(paths.some((p) => p.startsWith("/en")), true, "loc 에 있는 /en 은 경로로 남는다");
  assert.equal(paths.includes("/en/salary-db/company-0"), false, "xhtml:link 대체 주소는 읽지 않는다");
  for (const bad of ["/calc/other-host", "/calc/apex-host", "/calc/plain-http"]) assert.equal(paths.includes(bad), false, bad);
});

test("deterministic stratified sample: same seed → same 60, quotas per family, different seed → different pick", () => {
  const paths = parseSitemap(XML);
  const a = sampleUrls(paths, "2026-09-28");
  const b = sampleUrls([...paths].reverse(), "2026-09-28");
  assert.deepEqual(a.sample, b.sample, "입력 순서와 무관하게 같은 시드면 같은 표본");
  assert.equal(a.sample.length, 60);
  assert.deepEqual(a.shortfall, {});
  assert.deepEqual(a.pools, { company: 40, lite: 30, calc: 25, guides: 25, "pay-table": 6, salary: 20 });
  for (const f of FAMILIES) {
    const got = a.sample.filter((s) => s.family === f);
    assert.equal(got.length, QUOTAS[f], f);
    for (const s of got) {
      assert.equal(classifyPath(s.path), f);
      assert.equal(s.url, BASE + s.path);
    }
  }
  assert.equal(new Set(a.sample.map((s) => s.path)).size, 60, "중복 없음");
  const c = sampleUrls(paths, "2026-09-29");
  assert.notDeepEqual(
    c.sample.map((s) => s.path),
    a.sample.map((s) => s.path)
  );
  // 모집단이 몫보다 작으면 있는 만큼 + shortfall
  const small = sampleUrls(["/teacher-pay-2026", "/calc/a"], "x");
  assert.equal(small.sample.length, 2);
  assert.deepEqual(small.shortfall["pay-table"], { want: 5, got: 1 });
  assert.deepEqual(small.shortfall.company, { want: 20, got: 0 });
});

test("--limit keeps the top-ranked URLs round-robin across families", () => {
  const { sample } = sampleUrls(parseSitemap(XML), "2026-09-28");
  const twelve = applyLimit(sample, 12);
  assert.equal(twelve.length, 12);
  for (const f of FAMILIES) {
    const got = twelve.filter((s) => s.family === f);
    assert.equal(got.length, 2, f);
    assert.deepEqual(
      got.map((s) => s.rank),
      [0, 1]
    );
  }
  assert.equal(applyLimit(sample, 3).length, 3);
  assert.deepEqual(
    applyLimit(sample, 3).map((s) => s.family),
    ["company", "lite", "calc"]
  );
  assert.equal(applyLimit(sample, 1000).length, 60);
});

test("aggregation separates pass 1 (real warmth) from later passes (self-warmed); pacing ≥300ms", async () => {
  const seed = "2026-09-28";
  const { sample } = sampleUrls(parseSitemap(XML), seed);
  const companies = sample.filter((s) => s.family === "company").map((s) => s.path);
  const salaries = sample.filter((s) => s.family === "salary").map((s) => s.path);
  const warm = new Set([...companies.slice(0, 9), ...salaries.slice(0, 3), "/robots.txt"]);
  const outFile = path.join(TMP, "out", "run.json");
  const r = await runMain(
    ["--sitemap-file", FIXTURE, "--seed", seed, "--passes", "3", "--interval", "5", "--label", "D0", "--out", outFile],
    { stub: makeStub({ warm }) }
  );
  assert.equal(r.code, 0, r.stderr);

  // 요청: (60 + 피드 5) × 3, 전부 같은 UA·redirect manual, 캐시 우회 쿼리 없음
  assert.equal(r.stub.calls.length, 65 * 3);
  for (const c of r.stub.calls) {
    assert.equal(c.ua, UA);
    assert.equal(c.redirect, "manual");
    assert.equal(new URL(c.url).search, "");
  }
  // 요청 사이 항상 300ms 이상, pass 사이 5초
  const ev = r.events;
  for (let i = 1; i < ev.length; i++) {
    if (ev[i].kind !== "fetch") continue;
    let gap = 0;
    for (let j = i - 1; j >= 0 && ev[j].kind === "sleep"; j--) gap += ev[j].ms;
    const prevFetch = ev.slice(0, i).some((e) => e.kind === "fetch");
    if (prevFetch) assert.ok(gap >= 300, `fetch #${i} gap ${gap}`);
  }
  assert.equal(r.sleeps.filter((ms) => ms === 5000).length, 2);

  const json = JSON.parse(readFileSync(outFile, "utf8"));
  assert.equal(json.records.length, 195);
  const row = (f) => json.rows.find((x) => x.family === f);
  assert.deepEqual(row("company").p1, { n: 20, hit: 9 });
  assert.deepEqual(row("company").pn, { n: 40, hit: 40 });
  assert.deepEqual(row("company").p1Cache, { HIT: 9, MISS: 11 });
  assert.equal(row("company").ageMedP1, 1200);
  assert.deepEqual(row("salary").p1, { n: 5, hit: 3 });
  assert.deepEqual(row("lite").p1, { n: 10, hit: 0 });
  assert.deepEqual(row("lite").pn, { n: 20, hit: 20 });
  assert.equal(row("lite").ageMedP1, null);
  assert.deepEqual(row("calc").body, { ok: 30, of: 30 });
  assert.equal(row("feeds").urls, 5);

  const line = lastLine(r.stdout);
  assert.equal(line, json.line);
  assert.match(line, /^crawl-sampler 9\/28 D0: pass1 HIT company 45% · lite 0% · calc 0% · guides 0% · pay-table 0% · salary 60% · /);
  assert.match(line, / · pass2\+ HIT 100% · 5xx 0\/180 · 403 0 · net 0 · non200 0 · /);
  assert.match(line, /feeds 4\/5 ok \(rss-tables not yet live\)$/);
  assertNoUrl(line, sample.map((s) => s.path));
  // 표는 계열 6 + feeds 행
  assert.match(r.stdout, /\| company \| 20 \| 60 \| 45% \(9\/20\) \| 100% \(40\/40\) \|/);
  assert.match(r.stdout, /\| feeds \| 5 \| 15 \|/);
  assert.equal(r.stdout.includes("### 이상 요청"), false, "rss-tables 404(공개 전)는 이상 목록에 넣지 않는다");
});

test("5xx and network errors → exit 1, counted per family; aggregate line still URL-free", async () => {
  const seed = "2026-09-28";
  const { sample } = sampleUrls(parseSitemap(XML), seed);
  const calc = sample.find((s) => s.family === "calc").path;
  const guide = sample.find((s) => s.family === "guides").path;
  const lite = sample.find((s) => s.family === "lite").path;
  const stub = makeStub({
    overrides: {
      [calc]: (n) => (n === 2 ? { status: 503 } : null),
      [guide]: (n) => (n === 1 ? { throw: true } : null),
      [lite]: () => ({ status: 403 }),
      "/rss.xml": () => ({ status: 502 }),
    },
  });
  const r = await runMain(["--sitemap-file", FIXTURE, "--seed", seed, "--passes", "2", "--interval", "0"], { stub });
  assert.equal(r.code, 1);
  const line = lastLine(r.stdout);
  assert.match(line, / · 5xx 1\/120 · 403 2 · net 1 · non200 0 · feeds 3\/5 ok \(rss-tables not yet live\) FAIL rss 502$/);
  assertNoUrl(line, sample.map((s) => s.path));
  assert.match(r.stdout, /### 이상 요청 6건/);
  assert.equal(r.sleeps.includes(0), false, "간격 0 이면 pass 사이 추가 대기 없음(요청 간 300ms 는 유지)");

  // 403 만 있으면 exit 0(표·집계 줄에만 드러낸다)
  const only403 = await runMain(["--sitemap-file", FIXTURE, "--seed", seed, "--passes", "1", "--interval", "0"], {
    stub: makeStub({ overrides: { [lite]: () => ({ status: 403 }) } }),
  });
  assert.equal(only403.code, 0);
  assert.match(lastLine(only403.stdout), / · 403 1 · /);
});

test("rss-tables 404 counts as a feed failure from 10/16; live sitemap doubles as its pass-1 record", async () => {
  const stub = makeStub();
  const r = await runMain(["--seed", "2026-10-20", "--passes", "2", "--interval", "1", "--limit", "12"], { stub, clock: OCT_20 });
  assert.equal(r.code, 0, r.stderr);
  // 사이트맵은 표본용 1회 + pass 2 1회 = 2회(pass 1 에서 다시 받지 않는다)
  assert.equal(stub.seen.get("/sitemap.xml"), 2);
  assert.equal(r.stub.calls.length, 1 + (12 + 5) * 2 - 1);
  assert.equal(r.events[0].kind, "fetch", "첫 요청 = 사이트맵");
  assert.equal(r.events[1].kind, "sleep", "사이트맵 다음 요청 전에도 300ms");
  const line = lastLine(r.stdout);
  assert.match(line, /^crawl-sampler 10\/20: /);
  assert.match(line, / · 5xx 0\/24 · /);
  assert.match(line, /feeds 4\/5 ok FAIL rss-tables 404$/);
  assertNoUrl(line);
});

test("feedVerdicts / aggregateLine unit: empty families print '-', marker failure is reported", () => {
  const recs = [
    { pass: 1, family: "feeds", path: "/rss.xml", status: 200, marker: false, cache: "MISS", error: null, ms: 5 },
    { pass: 1, family: "feeds", path: "/robots.txt", status: 200, marker: true, cache: "HIT", age: 3, error: null, ms: 5 },
  ];
  const feeds = feedVerdicts(recs, "2026-09-28");
  assert.deepEqual(
    feeds.map((f) => [f.name, f.verdict, f.reason]),
    [
      ["robots", "ok", undefined],
      ["rss", "fail", "marker"],
    ]
  );
  const line = aggregateLine(aggregate(recs), feeds, { runDate: "2026-09-28" });
  assert.equal(
    line,
    "crawl-sampler 9/28: pass1 HIT company - · lite - · calc - · guides - · pay-table - · salary - · 5xx 0/0 · 403 0 · net 0 · non200 0 · feeds 1/2 ok FAIL rss marker"
  );
  assertNoUrl(line);
});

test("--out inside the repo is refused with exit 2 before any request (lexical and via junction)", async () => {
  const inRepo = path.join(REPO, "docs", "crawl-sampler-should-not-exist.json");
  const r = await runMain(["--out", inRepo, "--sitemap-file", FIXTURE]);
  assert.equal(r.code, 2);
  assert.match(r.stderr, /거부/);
  assert.equal(r.stub.calls.length, 0);
  assert.equal(existsSync(inRepo), false);

  // 상대 경로(cwd = 저장소)도 거부
  const rel = await runMain(["--out", "tmp/x.json", "--dry-run", "--sitemap-file", FIXTURE], { extra: { cwd: REPO } });
  assert.equal(rel.code, 2);

  // 저장소를 가리키는 정션(링크)을 거친 경로도 실제 경로로 판정해 거부
  const link = path.join(TMP, "repo-link");
  let linked = false;
  try {
    symlinkSync(REPO, link, "junction");
    linked = true;
  } catch {
    // 링크를 만들 수 없는 환경이면 이 부분만 건너뛴다
  }
  if (linked) {
    try {
      const viaLink = await runMain(["--out", path.join(link, "scripts", "leak.json"), "--dry-run", "--sitemap-file", FIXTURE]);
      assert.equal(viaLink.code, 2);
      assert.equal(existsSync(path.join(REPO, "scripts", "leak.json")), false);
    } finally {
      // 링크 자체만 지운다(대상 폴더는 건드리지 않음) — 임시 폴더 정리가 링크를 따라가지 않게 먼저 제거
      unlinkSync(link);
    }
  }

  // CLI 로도 exit 2
  const cli = spawnSync(process.execPath, [SCRIPT, "--dry-run", "--sitemap-file", FIXTURE, "--out", inRepo], { encoding: "utf8" });
  assert.equal(cli.status, 2, cli.stderr);
  assert.equal(existsSync(inRepo), false);
});

test("CLI --dry-run --sitemap-file prints 60 URLs across 6 families and makes no request", () => {
  const cli = spawnSync(process.execPath, [SCRIPT, "--dry-run", "--sitemap-file", FIXTURE, "--seed", "2026-09-28"], {
    encoding: "utf8",
  });
  assert.equal(cli.status, 0, cli.stderr);
  const rows = cli.stdout
    .split(/\r?\n/)
    .filter((l) => l.includes(`\t${BASE}/`))
    .map((l) => l.split("\t"));
  assert.equal(rows.length, 60);
  assert.deepEqual([...new Set(rows.map(([f]) => f))], FAMILIES);
  assert.match(cli.stdout, /표본 60개 · 6개 계열/);
  for (const p of FEED_PATHS) assert.equal(cli.stdout.includes(BASE + p), false, "피드는 60 표본 목록에 섞지 않는다");
});

test("bad arguments exit 1 with usage", async () => {
  for (const argv of [["--seed", "2026-13-01"], ["--passes", "0"], ["--interval", "-1"], ["--label", "a/b"], ["--bogus", "1"], ["--limit"], ["--prev"]]) {
    const r = await runMain(argv);
    assert.equal(r.code, 1, argv.join(" "));
    assert.match(r.stderr, /사용법/);
    assert.equal(r.stub.calls.length, 0);
  }
});

// 2026-09-27 수리: 같은 날 두 번째 실행(9/28 C01 전·후). pay-table 은 모집단 6·몫 5 라 재시드로 못 피한다.
test("same-day second run with another seed: pay-table n/a (overlaps earlier run), company keeps a percentage", async () => {
  const paths = parseSitemap(readFileSync(PROD_FIXTURE, "utf8"));
  const s1 = sampleUrls(paths, "2026-09-28").sample; // 첫 실행 = 기본 시드(실행일)
  const s2 = sampleUrls(paths, "2026-09-29").sample; // 두 번째 실행 = 재시드
  const fam = (s, f) => s.filter((x) => x.family === f).map((x) => x.path);
  const shared = (f) => fam(s2, f).filter((p) => fam(s1, f).includes(p));
  // 전제(운영 사이트맵 실측과 같은 모양): pay-table 은 5개 중 4개 이상 공유, company 는 거의 안 겹친다
  assert.ok(shared("pay-table").length >= 4, `pay-table 공유 ${shared("pay-table").length}`);
  assert.ok(shared("company").length * 2 < QUOTAS.company, `company 공유 ${shared("company").length}`);
  const coShared = shared("company");
  const coClean = fam(s2, "company").filter((p) => !coShared.includes(p));
  const warm = new Set(coClean.slice(0, 6)); // 실제 방문·크롤러가 데운 회사 6곳
  const carriedTotal = FAMILIES.reduce((a, f) => a + shared(f).length, 0) + FEED_PATHS.length;
  const coSeg = `company ${Math.round((6 / coClean.length) * 100)}%${coShared.length ? ` (carried ${coShared.length})` : ""} · `;

  // 첫 실행(C01 전): 3 pass 가 표본·피드를 전부 데운다
  const stub = makeStub({ warm }); // 두 실행이 같은 엣지 캐시를 본다
  const prevFile = path.join(TMP, "prev", "pre-c01.json");
  const r1 = await runMain(
    ["--sitemap-file", PROD_FIXTURE, "--passes", "3", "--interval", "0", "--label", "pre-C01", "--out", prevFile],
    { stub, clock: SEPT_28 }
  );
  assert.equal(r1.code, 0, r1.stderr);
  assert.doesNotMatch(r1.stdout, /n\/a|carried|overlap-check|겹침/, "첫 실행에는 겹침 표지가 없다");

  // 두 번째 실행(C01 후, 1시간 뒤 · 같은 날): --seed 변경 + --prev
  const postFile = path.join(TMP, "prev", "post-c01.json");
  const r2 = await runMain(
    ["--sitemap-file", PROD_FIXTURE, "--seed", "2026-09-29", "--passes", "1", "--interval", "0", "--label", "post-C01", "--prev", prevFile, "--out", postFile],
    { stub, clock: SEPT_28 + HOUR }
  );
  assert.equal(r2.code, 0, r2.stderr);
  const line = lastLine(r2.stdout);
  assert.match(line, /^crawl-sampler 9\/28 post-C01: pass1 HIT /);
  assert.ok(line.includes(`pass1 HIT ${coSeg}`), line);
  assert.ok(line.includes("pay-table n/a (overlaps earlier run)"), line);
  assert.equal(line.match(/n\/a/g).length, 1, "n/a 는 pay-table 하나뿐");
  assert.ok(line.endsWith(` · overlap-check prev (carried ${carriedTotal})`), line);
  assertNoUrl(line, s2.map((s) => s.path));
  // 표에도 같은 표지(피드 행도 5/5 겹침이라 n/a)
  assert.ok(r2.stdout.includes(`| pay-table | 5 | 5 | ${NA_MARK} · 겹침 ${shared("pay-table").length}/5 |`), r2.stdout);
  assert.ok(r2.stdout.includes(`| feeds | 5 | 5 | ${NA_MARK} · 겹침 5/5 |`));
  assert.match(r2.stdout, /\| company \| 20 \| 20 \| \d+% \(6\/\d+\)/);
  assert.match(r2.stdout, /⚠ 겹침 점검\(--prev, 앞선 실행 2026-09-28T01:00:00\.000Z\)/);
  // 겹친 pay-table URL 은 첫 실행이 데운 HIT — 빼지 않았다면 pay-table pass1 HIT 가 이 도구 때문에 부풀었다
  const json = JSON.parse(readFileSync(postFile, "utf8"));
  const payShared = new Set(shared("pay-table"));
  const payP1 = json.records.filter((x) => x.pass === 1 && payShared.has(x.path));
  assert.equal(payP1.length, payShared.size);
  assert.ok(payP1.every((x) => x.cache === "HIT"));
  const row = (f) => json.rows.find((x) => x.family === f);
  assert.equal(row("pay-table").p1Na, true);
  assert.equal(row("pay-table").p1Carried, payShared.size);
  assert.deepEqual(row("company").p1, { n: coClean.length, hit: 6 });
  assert.equal(row("company").p1Na, false);
  assert.equal(json.overlap.source, "prev");
  assert.equal(json.overlap.byFamily["pay-table"], payShared.size);
  assert.equal(json.carried.length, carriedTotal);

  // --prev 없이 시드만 바꿔도(같은 날) 기본 시드 실행과의 겹침을 추정해 같은 결과
  const r3 = await runMain(["--sitemap-file", PROD_FIXTURE, "--seed", "2026-09-29", "--passes", "1", "--interval", "0"], {
    stub: makeStub({ warm }),
    clock: SEPT_28 + HOUR,
  });
  assert.equal(r3.code, 0, r3.stderr);
  const line3 = lastLine(r3.stdout);
  assert.ok(line3.includes(`pass1 HIT ${coSeg}`), line3);
  assert.ok(line3.includes("pay-table n/a (overlaps earlier run)"), line3);
  assert.ok(line3.endsWith(` · overlap-check reseed (carried ${carriedTotal})`), line3);
  assert.match(r3.stdout, /⚠ 겹침 점검\(시드 2026-09-29 ≠ 실행일 2026-09-28, --prev 없음\)/);
  assertNoUrl(line3);

  // 4시간이 지난 --prev 는 아무것도 빼지 않는다(재시드여도 --prev 가 우선) → pay-table 도 보통 비율
  const r4 = await runMain(
    ["--sitemap-file", PROD_FIXTURE, "--seed", "2026-09-29", "--passes", "1", "--interval", "0", "--prev", prevFile],
    { stub: makeStub({ warm }), clock: SEPT_28 + OVERLAP_WINDOW_MS }
  );
  assert.equal(r4.code, 0, r4.stderr);
  const line4 = lastLine(r4.stdout);
  assert.ok(line4.includes(`pass1 HIT company 30% · `), line4);
  assert.ok(line4.includes(" · pay-table 0% · "), line4);
  assert.equal(/n\/a|\(carried \d+\) ·/.test(line4), false, line4);
  assert.ok(line4.endsWith(" · overlap-check prev (carried 0)"), line4);

  // 같은 시드로 --prev 를 주면 전 계열 n/a + 시드를 바꾸라는 안내
  const r5 = await runMain(["--sitemap-file", PROD_FIXTURE, "--passes", "1", "--interval", "0", "--prev", prevFile], {
    stub: makeStub(),
    clock: SEPT_28 + HOUR,
  });
  const line5 = lastLine(r5.stdout);
  assert.equal(line5.match(/n\/a \(overlaps earlier run\)/g).length, FAMILIES.length, line5);
  assert.match(r5.stdout, /두 번째 실행은 --seed 를 다른 날짜로/);

  // dry-run 도 겹침 수를 미리 보여 준다(요청 없음)
  const dry = await runMain(["--sitemap-file", PROD_FIXTURE, "--seed", "2026-09-29", "--dry-run", "--prev", prevFile], {
    clock: SEPT_28 + HOUR,
  });
  assert.equal(dry.code, 0, dry.stderr);
  assert.equal(dry.stub.calls.length, 0);
  assert.ok(dry.stdout.includes(`pay-table ${payShared.size}`), dry.stdout);
});

test("overlap threshold: minority carried → percentage over the rest, majority → n/a", () => {
  const rec = (path, cache) => ({ pass: 1, family: "pay-table", path, status: 200, cache, marker: true, error: null, ms: 5, age: null });
  const recs = PAY_TABLES.slice(0, 5).map((p, i) => rec(p, i < 3 ? "HIT" : "MISS"));
  const two = aggregate(recs, { carried: new Set(PAY_TABLES.slice(0, 2)) }).find((r) => r.family === "pay-table");
  assert.deepEqual([two.p1, two.p1Carried, two.p1Na], [{ n: 3, hit: 1 }, 2, false]);
  const three = aggregate(recs, { carried: new Set(PAY_TABLES.slice(0, 3)) }).find((r) => r.family === "pay-table");
  assert.deepEqual([three.p1, three.p1Carried, three.p1Na], [{ n: 2, hit: 0 }, 3, true]);
  const line = (carried) => aggregateLine(aggregate(recs, { carried }), [], { runDate: "2026-09-28" });
  assert.match(line(new Set(PAY_TABLES.slice(0, 2))), / · pay-table 33% \(carried 2\) · /);
  assert.match(line(new Set(PAY_TABLES.slice(0, 3))), / · pay-table n\/a \(overlaps earlier run\) · /);
  assert.match(line(new Set()), / · pay-table 60% · /);

  // --prev 창: 4시간 미만만 겹침(미래 시각도 겹침으로 본다)
  const t0 = SEPT_28;
  const lastAt = new Map([
    ["/a", t0 - OVERLAP_WINDOW_MS + 1],
    ["/b", t0 - OVERLAP_WINDOW_MS],
    ["/c", t0 + 1000],
  ]);
  const targets = ["/a", "/b", "/c", "/d"].map((p) => ({ path: p }));
  assert.deepEqual([...carriedFromPrev(lastAt, t0, targets)], ["/a", "/c"]);
});

test("--prev: refused inside the repo (exit 2), unreadable / dry-run / foreign JSON exit 1, all before any request", async () => {
  const inRepo = await runMain(["--sitemap-file", FIXTURE, "--prev", path.join(REPO, "docs", "metrics-log.md")]);
  assert.equal(inRepo.code, 2);
  assert.match(inRepo.stderr, /거부: --prev/);
  assert.equal(inRepo.stub.calls.length, 0);

  const missing = await runMain(["--prev", path.join(TMP, "no-such.json")]);
  assert.equal(missing.code, 1);
  assert.equal(missing.stub.calls.length, 0);

  const dryFile = path.join(TMP, "prev", "dry.json");
  assert.equal((await runMain(["--sitemap-file", FIXTURE, "--dry-run", "--out", dryFile])).code, 0);
  const fromDry = await runMain(["--prev", dryFile]);
  assert.equal(fromDry.code, 1);
  assert.match(fromDry.stderr, /dry-run/);
  assert.equal(fromDry.stub.calls.length, 0);

  const foreign = path.join(TMP, "prev", "foreign.json");
  writeFileSync(foreign, JSON.stringify({ records: [] }));
  const fromForeign = await runMain(["--prev", foreign]);
  assert.equal(fromForeign.code, 1);
  assert.equal(fromForeign.stub.calls.length, 0);

  // at 이 없는 기록은 finishedAt → runAt 으로 대신한다
  const legacy = prevFetchTimes({
    tool: "crawl-cache-sampler",
    runAt: "2026-09-28T01:00:00.000Z",
    finishedAt: "2026-09-28T01:21:00.000Z",
    records: [{ path: "/teacher-pay-2026" }, { path: "/rss.xml", at: Date.parse("2026-09-28T01:05:00Z") }],
  });
  assert.equal(legacy.lastAt.get("/teacher-pay-2026"), Date.parse("2026-09-28T01:21:00Z"));
  assert.equal(legacy.lastAt.get("/rss.xml"), Date.parse("2026-09-28T01:05:00Z"));
  assert.match(prevFetchTimes({ tool: "crawl-cache-sampler", records: [{ path: "/a" }] }).error, /요청 시각/);
});
