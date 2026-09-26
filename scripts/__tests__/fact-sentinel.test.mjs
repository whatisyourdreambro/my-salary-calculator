// scripts/fact-sentinel 테스트 (2026-09-26 R5 공식 수치 감시기)
// 실행: node --test scripts/__tests__/fact-sentinel.test.mjs — 오프라인(가짜 fetch), 네트워크 0회.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { CanonicalError, ConfigError, readCanonical, resolveFacts } from "../fact-sentinel/lib/canonical.mjs";
import { applyBlockRule, CLASSES, classifyMention, datesInContext } from "../fact-sentinel/lib/classify.mjs";
import {
  BOK_PORTAL_URL,
  builtinIsAllowed,
  checkBaseRate,
  createBuiltinHttp,
  ecosUrl,
  parseBokPortal,
  parseEcos,
  redactUrl,
  scrub,
  validEcosKey,
} from "../fact-sentinel/lib/live.mjs";
import { checkDocRef, computeRefreshDue, validateSlots } from "../fact-sentinel/lib/report.mjs";
import { createFileSource, findMentions, mapRoute, maskComments, pageDirs, publicPath } from "../fact-sentinel/lib/scan.mjs";
import { main } from "../fact-sentinel/run.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SENTINEL = join(HERE, "..", "fact-sentinel");
const RUN = join(SENTINEL, "run.mjs");
const FX = join(SENTINEL, "fixtures");
const REPO = join(HERE, "..", "..");
const TODAY = "2026-09-26";
const FAKE_KEY = "FAKEKEYFORTESTS12345";

const tmp = (p) => mkdtempSync(join(tmpdir(), `sentinel-${p}-`));
const fx = (name) => readFileSync(join(FX, name), "utf8");
const factsJson = () => JSON.parse(readFileSync(join(SENTINEL, "facts.json"), "utf8"));
const slotsJson = () => JSON.parse(readFileSync(join(SENTINEL, "refresh-slots.json"), "utf8"));

/** 픽스처 모드 한 번 실행 → 보고서 JSON(모듈 수준 캐시). */
let fixtureRun = null;
async function runFixtures() {
  if (fixtureRun) return fixtureRun;
  const out = tmp("fx");
  const lines = [];
  const code = await main(["--fixtures", "--today", TODAY, "--out", out], { stdout: (s) => lines.splice(lines.length, 0, s), stderr: (s) => lines.splice(lines.length, 0, s) });
  const json = JSON.parse(readFileSync(join(out, `sentinel-${TODAY}.json`), "utf8"));
  const md = readFileSync(join(out, `sentinel-${TODAY}.md`), "utf8");
  fixtureRun = { code, json, md, lines, out };
  return fixtureRun;
}
const bokAt = (json, file, line) => json.findings.filter((f) => f.factId === "bok-base-rate" && f.file === file && f.line === line);

// ── 정본 정규식 ──

test("정본: HEAD 의 실제 정본 파일 4개를 정규식으로 읽는다", () => {
  const src = createFileSource(REPO);
  const c = readCanonical((rel) => src.read(rel));
  const v = c.values;
  for (const y of ["2026", "2027"]) {
    assert.equal(typeof v[`minimumWage.${y}.hourly`], "number");
    assert.equal(v[`minimumWage.${y}.monthly`], v[`minimumWage.${y}.hourly`] * v["minimumWage.monthlyHours"]);
  }
  assert.ok(v["minimumWage.2027.hourly"] > v["minimumWage.2026.hourly"]);
  for (const k of ["pension", "health", "longTermCare", "employment", "localIncomeTax"]) {
    for (const y of ["2025", "2026", "2027"]) {
      const x = v[`insurance.${y}.${k}`];
      assert.ok(typeof x === "number" && x > 0 && x < 1, `insurance.${y}.${k}=${x}`);
    }
    assert.match(String(v[`insurance.2027.status.${k}`]), /^(confirmed|provisional)$/);
  }
  assert.ok(v["pensionBase.2026.cap"] > v["pensionBase.2026.floor"]);
  assert.equal(v["pensionBase.2026.capAnnual"], v["pensionBase.2026.cap"] * 12);
  assert.ok(v["pensionBase.2025.cap"] > 0 && v["pensionBase.2025.floor"] > 0);
  assert.ok(v["unemployment.2026.dailyUpper"] > 0);
});

test("정본: 픽스처 사본에서 정확한 값(2026-09-26 기준)", () => {
  const src = createFileSource(join(FX, "repo"), { fixture: true });
  const v = readCanonical((rel) => src.read(rel)).values;
  assert.equal(v["minimumWage.2026.hourly"], 10320);
  assert.equal(v["minimumWage.2026.monthly"], 2156880);
  assert.equal(v["minimumWage.2027.hourly"], 10700);
  assert.equal(v["minimumWage.2025.hourly"], 10030);
  assert.equal(v["insurance.2026.pension"], 0.0475);
  assert.equal(v["insurance.2027.pension"], 0.05);
  assert.equal(v["insurance.2027.health"], 0.03595); // INSURANCE_RATES_2026 참조 해석
  assert.equal(v["insurance.2027.status.longTermCare"], "provisional");
  assert.equal(v["pensionBase.2026.cap"], 6590000);
  assert.equal(v["pensionBase.2025.cap"], 6370000);
  assert.equal(v["unemployment.2026.dailyUpper"], 68100);
});

test("정본: 정규식이 안 맞으면 파일·필드를 대며 크게 실패한다", () => {
  const src = createFileSource(join(FX, "repo"), { fixture: true });
  const broken = (rel) => {
    const t = src.read(rel);
    return rel.endsWith("unemploymentBenefit.ts") ? t.replace("DAILY_UPPER", "DAILY_CAP") : t;
  };
  assert.throws(() => readCanonical(broken), (e) => e instanceof CanonicalError && e.file === "src/config/unemploymentBenefit.ts" && /DAILY_UPPER/.test(e.field));
  const noYear = (rel) => {
    const t = src.read(rel);
    return rel.endsWith("minimumWage.ts") ? t.replace(/MINIMUM_WAGE_2027/g, "MINIMUM_WAGE_X") : t;
  };
  assert.throws(() => readCanonical(noYear), (e) => e instanceof CanonicalError && e.field === "MINIMUM_WAGE_2027");
});

test("facts.json: 해석·전환·검증", () => {
  const src = createFileSource(join(FX, "repo"), { fixture: true });
  const canon = readCanonical((rel) => src.read(rel));
  const now = resolveFacts(factsJson(), canon, TODAY);
  const mw = now.find((f) => f.id === "minimum-wage-hourly");
  assert.equal(mw.current.value, 10320);
  assert.deepEqual(mw.old.map((o) => o.value), [10030, 9860]);
  assert.deepEqual(mw.upcoming.map((u) => u.value), [10700]);
  // 2027-01-01 이 지나면 10,700 이 현재값, 10,320 은 과거값으로 내려간다
  const later = resolveFacts(factsJson(), canon, "2027-01-02").find((f) => f.id === "minimum-wage-hourly");
  assert.equal(later.current.value, 10700);
  assert.equal(later.old[0].value, 10320);
  assert.equal(later.old[0].to, "2026-12-31");
  const np = now.find((f) => f.id === "national-pension-rate");
  assert.equal(np.current.value, 4.75);
  assert.equal(np.upcoming[0].status, "confirmed");
  // 공식 호스트가 아닌 출처 → 설정 오류
  const bad = factsJson();
  bad.facts[0].source = "https://news.example.com/x";
  assert.throws(() => resolveFacts(bad, canon, TODAY), ConfigError);
  // 검증값과 정본이 다르면 설정 오류
  const bad2 = factsJson();
  bad2.facts.find((f) => f.id === "pension-base-cap").oldValues[0].value = 6380000;
  assert.throws(() => resolveFacts(bad2, canon, TODAY), /검증값/);
});

// ── 분류 골든 ──

test("골든: /savings-interest-2026 L37·L117–126 은 stale(주석 L117 은 언급 제외)", async () => {
  const { json } = await runFixtures();
  const page = "src/app/savings-interest-2026/page.tsx";
  const l37 = bokAt(json, page, 37);
  assert.equal(l37.length, 1);
  assert.equal(l37[0].class, "stale");
  assert.equal(l37[0].found, "2.75%");
  const box = json.findings.filter((f) => f.factId === "bok-base-rate" && f.file === page && f.line >= 117 && f.line <= 126);
  assert.ok(box.length >= 3, `상자 언급 ${box.length}`);
  assert.ok(box.every((f) => f.class === "stale"), JSON.stringify(box.map((f) => [f.line, f.found, f.class])));
  assert.equal(bokAt(json, page, 117).length, 0, "JSX 주석 속 수치는 언급이 아니다");
  assert.equal(bokAt(json, page, 120)[0].class, "stale");
  assert.ok(bokAt(json, page, 123).some((f) => f.found === "2.75%" && f.class === "stale"));
  assert.ok(json.staleRoutes.includes("/savings-interest-2026"));
});

test("골든: 가이드식 '2.50%→2.75%→3.00% 추이'와 실제 가이드 발췌 5문장은 stale 0건", async () => {
  const { json } = await runFixtures();
  const hist = json.findings.filter((f) => f.route === "guides:fixture-rate-history-2026");
  assert.ok(hist.length >= 10, `발췌 언급 ${hist.length}`);
  assert.equal(hist.filter((f) => f.class === "stale").length, 0, JSON.stringify(hist.filter((f) => f.class === "stale")));
  const chain = hist.filter((f) => f.line === 11);
  assert.deepEqual(chain.map((f) => [f.found, f.class]), [["2.50%", "historical"], ["2.75%", "historical"], ["3.00%", "ok"]]);
  assert.ok(!json.staleRoutes.includes("/guides/fixture-rate-history-2026"));
});

test("분류: 현재 시제·표지 없음·주석·대출 기준금리·무관한 637만원", async () => {
  const { json } = await runFixtures();
  const unk = json.findings.filter((f) => f.route === "guides:fixture-rate-unknown-2026");
  assert.deepEqual(unk.map((f) => [f.found, f.class]), [["2.75%", "unknown"], ["2.75%", "stale"]]);
  assert.equal(json.findings.filter((f) => f.factId === "pension-base-cap" && f.route === "guides:fixture-rate-unknown-2026").length, 0);
  const np = json.findings.filter((f) => f.file === "src/app/national-pension-fixture/page.tsx");
  assert.ok(np.every((f) => f.line !== 7), "주석 줄 제외");
  assert.deepEqual(np.map((f) => [f.found, f.class]), [["637만원", "historical"], ["659만원", "ok"]]);
  const calc = json.findings.filter((f) => f.file === "src/lib/simpleCalculators/fixtureCalc.ts");
  assert.deepEqual(calc.map((f) => [f.found, f.class]), [["3.00%", "ok"]], "COFIX 등 대출 기준금리 2.75% 는 기준금리 언급이 아니다");
  const wage = json.findings.filter((f) => f.file === "src/components/FixtureWageNote.tsx");
  assert.deepEqual(wage.map((f) => [f.line, f.class]), [[5, "stale"], [7, "historical"], [7, "ok"]]);
});

test("분류: classifyMention·날짜 추출·블록 규칙 단위", () => {
  const fact = { id: "x", unit: "%", current: { value: 3, since: "2026-08-27" } };
  const m = (ctx, extra = {}) => ({ value: 2.75, maskedContext: ctx, meta: false, ...extra });
  assert.equal(classifyMention(m("기준금리는 2.50%→2.75%→3.00% 추이로 올랐다"), fact).class, "historical");
  assert.equal(classifyMention(m("현재 기준금리 2.75%"), fact).class, "stale");
  assert.equal(classifyMention(m("기준금리 2.75%"), fact).class, "unknown");
  assert.equal(classifyMention(m("기준금리 2.75%", { meta: true }), fact).class, "stale");
  assert.equal(classifyMention(m("2026년 7월 기준금리 2.75% 당시"), fact).class, "historical");
  assert.equal(classifyMention({ value: 3, maskedContext: "기준금리 3.00%", meta: false }, fact).class, "ok");
  assert.deepEqual(datesInContext("2026년 7월 16일 · 2025.7.1. · 2024년 · ’25년 · 2026년 8월"), ["2026-07-16", "2025-07-01", "2026-08-31", "2024-12-31", "2025-12-31"]);
  const lines = ["a", "b", "c", "", "d"];
  const fs = [
    { factId: "x", line: 1, class: "stale" },
    { factId: "x", line: 2, class: "historical", reasons: [] },
    { factId: "x", line: 5, class: "historical", reasons: [] },
  ];
  applyBlockRule(fs, lines);
  assert.equal(fs[1].class, "stale");
  assert.deepEqual(fs[1].block, [1, 3]);
  assert.equal(fs[2].class, "historical", "다른 블록은 그대로");
  const withOk = [
    { factId: "x", line: 1, class: "stale" },
    { factId: "x", line: 2, class: "historical", reasons: [] },
    { factId: "x", line: 3, class: "ok" },
  ];
  applyBlockRule(withOk, lines);
  assert.equal(withOk[1].class, "historical", "현재값이 있는 블록은 올리지 않는다");
});

test("스캔: 주석 가림은 문자열 속 // 를 건드리지 않는다", () => {
  const src = 'const u = "https://www.bok.or.kr"; // 기준금리 2.75%\nconst t = `a // b ${x /* c */}`;';
  const { masked, inComment } = maskComments(src);
  assert.ok(masked.includes('"https://www.bok.or.kr"'));
  assert.ok(!masked.includes("2.75%"));
  assert.ok(masked.includes("`a // b ${x "));
  assert.ok(inComment(src.indexOf("2.75%")));
  const { mentions } = findMentions({
    text: "// 기준금리 2.75%\n<p>기준금리 2.75%</p>\n",
    facts: [{ id: "bok", unit: "%", knownValues: [{ value: 2.75 }], patterns: [{ anchor: "기준금리", after: 64 }] }],
  });
  assert.deepEqual(mentions.map((x) => x.line), [2]);
  // 창 끝이 수치 중간을 자르면 수치 끝까지 늘려 읽는다
  const won = findMentions({
    text: "<p>상한 월 6,370,000원</p>\n",
    facts: [{ id: "cap", unit: "원", knownValues: [{ value: 6370000 }], patterns: [{ anchor: "상한", after: 8 }] }],
  });
  assert.deepEqual(won.mentions.map((x) => [x.value, x.found]), [[6370000, "6,370,000원"]]);
});

// ── 경로 매핑 ──

test("경로 매핑: 페이지·동거 파일·하위 폴더·route group·가이드·계산기·공용", () => {
  const files = ["src/app/page.tsx", "src/app/a/page.tsx", "src/app/(grp)/b/[slug]/page.tsx", "src/app/a/Client.tsx"];
  const pages = pageDirs(files);
  assert.equal(mapRoute("src/app/a/Client.tsx", { pages }), "/a");
  assert.equal(mapRoute("src/app/a/AContent.tsx", { pages }), "/a");
  assert.equal(mapRoute("src/app/a/parts/faq.ts", { pages }), "/a");
  assert.equal(mapRoute("src/app/(grp)/b/[slug]/Client.tsx", { pages }), "/b/[slug]");
  assert.equal(mapRoute("src/app/layout.tsx", { pages }), "/");
  assert.equal(mapRoute("src/app/zzz/x.tsx", { pages: pageDirs(["src/app/a/page.tsx"]) }), "(공용)");
  const g = ["export const g = [", "  {", '    slug: "my-guide-2026",', "    content: `", "<p>x</p>"];
  assert.equal(mapRoute("src/lib/guides/tax-deepdive.ts", { lines: g, line: 5 }), "guides:my-guide-2026");
  assert.equal(mapRoute("src/lib/guidesContent.ts", { lines: g, line: 5 }), "guides:my-guide-2026");
  const c = ["export const E = {", '  "deposit-quick": {', "    details: 'x',"];
  assert.equal(mapRoute("src/lib/simpleCalculators/enrichments.ts", { lines: c, line: 3 }), "/calc/deposit-quick");
  assert.equal(mapRoute("src/components/Foo.tsx", {}), "(공용)");
  assert.equal(publicPath("guides:my-guide-2026"), "/guides/my-guide-2026");
  assert.equal(publicPath("(공용)"), null);
});

test("경로 매핑: 픽스처 실행 결과(Client·하위 폴더·공용·staleShared)", async () => {
  const { json } = await runFixtures();
  const by = (file) => json.findings.find((f) => f.file === file);
  assert.equal(by("src/app/national-pension-fixture/Client.tsx").route, "/national-pension-fixture");
  assert.equal(by("src/app/national-pension-fixture/parts/faq.ts").route, "/national-pension-fixture");
  assert.equal(by("src/components/FixtureWageNote.tsx").route, "(공용)");
  assert.ok(json.staleShared.includes("src/components/FixtureWageNote.tsx"));
  assert.ok(json.staleRoutes.includes("/national-pension-fixture"));
});

// ── 파서 ──

test("ECOS 파서: 잘라낸 실제 응답·변경일·잘림·오류", () => {
  const trimmed = parseEcos(fx("ecos-daily-sample-trimmed.json"));
  assert.equal(trimmed.ok, true);
  assert.equal(trimmed.value, "2.75");
  assert.equal(trimmed.since, null);
  assert.equal(trimmed.sinceBefore, "2026-08-01");
  const change = parseEcos(fx("ecos-daily-change-synthetic.json"));
  assert.deepEqual([change.ok, change.value, change.since, change.latestDate], [true, "3.00", "2026-08-27", "2026-08-30"]);
  const trunc = parseEcos(fx("ecos-daily-sample-truncated.json"));
  assert.equal(trunc.ok, false);
  assert.match(trunc.reason, /잘림/);
  const err = parseEcos(fx("ecos-error-301.json"));
  assert.equal(err.ok, false);
  assert.match(err.reason, /ERROR-301/);
  assert.equal(parseEcos("{not json").ok, false);
});

test("한국은행 누리집 파서: 표 첫 행 = 3.00 / 2026-08-27, 구조 변경은 실패", () => {
  const p = parseBokPortal(fx("bok-baserate.html"));
  assert.deepEqual([p.ok, p.value, p.since], [true, "3.00", "2026-08-27"]);
  assert.equal(p.rows[1].value, 2.75);
  assert.equal(parseBokPortal("<table><tr><td>x</td></tr></table>").ok, false);
  assert.equal(parseBokPortal("<html>no table</html>").ok, false);
});

// ── 키 가림 ──

test("ECOS 경로 키 가림·키 형식 검증", () => {
  const url = ecosUrl(FAKE_KEY, TODAY, { stat: "722Y001", cycle: "D", item: "0101000" });
  assert.match(url, /\/json\/kr\/1\/100\/722Y001\/D\/20260628\/20260926\/0101000$/);
  const red = redactUrl(url);
  assert.ok(!red.includes(FAKE_KEY));
  assert.match(red, /StatisticSearch\/\*\*\*\/json/);
  assert.ok(!scrub(`오류 ${url} ${FAKE_KEY}`, FAKE_KEY).includes(FAKE_KEY));
  assert.equal(redactUrl("https://ecos.bok.or.kr/api/StatisticSearch/sample/json/kr/1/10/722Y001/D/20260801/20260810/0101000").includes("/sample/"), false);
  assert.equal(validEcosKey(FAKE_KEY), true);
  assert.equal(validEcosKey("sample"), false, "공개 체험 키는 운영 호출에 쓰지 않는다");
  assert.equal(validEcosKey("ABC/../x0123456789"), false);
});

test("키 가림(끝단): --live + 가짜 ECOS — 보고서·로그 어디에도 키 원문 없음", async () => {
  const out = tmp("key");
  const logs = [];
  const seen = [];
  const fetchImpl = async (url) => {
    seen[seen.length] = url;
    if (url.startsWith("https://ecos.bok.or.kr/")) return new Response(fx("ecos-daily-change-synthetic.json"), { status: 200, headers: { "content-type": "application/json" } });
    if (url === "https://www.bok.or.kr/robots.txt") return new Response(fx("bok-robots.txt"), { status: 200 });
    return new Response("x", { status: 404 });
  };
  const code = await main(["--live", "--today", TODAY, "--out", out], {
    env: { ECOS_API_KEY: FAKE_KEY },
    stdout: (s) => logs.splice(logs.length, 0, s),
    stderr: (s) => logs.splice(logs.length, 0, s),
    fetchImpl,
  });
  assert.equal(code, 0);
  const json = readFileSync(join(out, `sentinel-${TODAY}.json`), "utf8");
  const md = readFileSync(join(out, `sentinel-${TODAY}.md`), "utf8");
  const bok = JSON.parse(json).facts.find((f) => f.id === "bok-base-rate");
  assert.equal(bok.live.method, "ecos");
  assert.equal(bok.live.value, "3.00");
  assert.equal(bok.live.ok, true);
  assert.ok(seen.length <= 2, `요청 ${seen.length}회`);
  for (const [name, text] of [["json", json], ["md", md], ["logs", logs.join("\n")]]) {
    assert.ok(!text.includes(FAKE_KEY), `${name} 에 키 원문`);
  }
  for (const f of readdirSync(out)) assert.ok(!readFileSync(join(out, f), "utf8").includes(FAKE_KEY), `${f} 에 키 원문`);
});

// ── 라이브 폴백 순서 ──

function fakeNet(routes) {
  const calls = [];
  const fetchImpl = async (url) => {
    calls[calls.length] = url;
    for (const [pred, res] of routes) if (pred(url)) return typeof res === "function" ? res() : new Response(res.body, { status: res.status || 200 });
    return new Response("nf", { status: 404 });
  };
  const http = createBuiltinHttp({ fetchImpl, log: () => {} });
  return { http, calls };
}
const isEcos = (u) => u.startsWith("https://ecos.bok.or.kr/");
const isRobots = (u) => u === "https://www.bok.or.kr/robots.txt";
const isPortal = (u) => u === BOK_PORTAL_URL;
const bokFact = () => {
  const f = factsJson().facts.find((x) => x.id === "bok-base-rate");
  return { current: f.current, since: f.since, ecos: f.ecos };
};
const ecosOk = [isEcos, { body: readFileSync(join(FX, "ecos-daily-change-synthetic.json")) }];
const robotsOk = [isRobots, { body: readFileSync(join(FX, "bok-robots.txt")) }];
const portalOk = [isPortal, { body: readFileSync(join(FX, "bok-baserate.html")) }];

test("폴백 ①: 키 있음 + ECOS 성공 → ecos, 요청 ≤ 2(robots 캐시 데우기 포함)", async () => {
  const dir = tmp("cache");
  const { http, calls } = fakeNet([ecosOk, robotsOk, portalOk]);
  const r = await checkBaseRate({ fact: bokFact(), env: { ECOS_API_KEY: FAKE_KEY }, today: TODAY, http, isAllowed: builtinIsAllowed, robotsCacheFile: join(dir, "robots.json") });
  assert.equal(r.method, "ecos");
  assert.equal(r.since, "2026-08-27");
  assert.ok(r.requests <= 2);
  assert.ok(isEcos(calls[0]));
  assert.ok(!calls.some(isPortal), "성공하면 누리집 표는 받지 않는다");
});

test("폴백 ②: 키 있음 + ECOS 실패 + robots 캐시 없음 → 요청 상한으로 none", async () => {
  const { http, calls } = fakeNet([[isEcos, { status: 500, body: "err" }], robotsOk, portalOk]);
  const r = await checkBaseRate({ fact: bokFact(), env: { ECOS_API_KEY: FAKE_KEY }, today: TODAY, http, isAllowed: builtinIsAllowed });
  assert.equal(r.method, "none");
  assert.match(r.reason, /ECOS HTTP 500/);
  assert.match(r.reason, /요청 상한/);
  assert.equal(calls.length, 1);
});

test("폴백 ③: 키 있음 + ECOS 실패 + robots 캐시(7일 이내) → bok-portal, 요청 2회", async () => {
  const dir = tmp("cache");
  const cacheFile = join(dir, "robots.json");
  writeFileSync(cacheFile, JSON.stringify({ status: 200, fetchedAt: new Date(Date.parse(`${TODAY}T00:00:00Z`) - 86400000).toISOString(), text: fx("bok-robots.txt") }));
  const { http, calls } = fakeNet([[isEcos, { status: 500, body: "err" }], robotsOk, portalOk]);
  const r = await checkBaseRate({ fact: bokFact(), env: { ECOS_API_KEY: FAKE_KEY }, today: TODAY, http, isAllowed: builtinIsAllowed, robotsCacheFile: cacheFile, nowMs: Date.parse(`${TODAY}T00:00:00Z`) });
  assert.equal(r.method, "bok-portal");
  assert.equal(r.value, "3.00");
  assert.deepEqual(calls.map((u) => (isEcos(u) ? "ecos" : isPortal(u) ? "portal" : u)), ["ecos", "portal"]);
});

test("폴백 ④: 키 없음 → robots 확인 후 표 1회(bok-portal)", async () => {
  const { http, calls } = fakeNet([robotsOk, portalOk]);
  const r = await checkBaseRate({ fact: bokFact(), env: {}, today: TODAY, http, isAllowed: builtinIsAllowed });
  assert.deepEqual([r.method, r.value, r.ok, r.sinceOk, r.requests], ["bok-portal", "3.00", true, true, 2]);
  assert.deepEqual(calls, ["https://www.bok.or.kr/robots.txt", BOK_PORTAL_URL]);
  assert.match(r.robots, /Allow: \/portal\//);
});

test("폴백 ⑤·⑥: robots 차단·표 파싱 실패 → none + 사유", async () => {
  const blocked = fakeNet([[isRobots, { body: "User-agent: *\nDisallow: /\n" }], portalOk]);
  const r1 = await checkBaseRate({ fact: bokFact(), env: {}, today: TODAY, http: blocked.http, isAllowed: builtinIsAllowed });
  assert.equal(r1.method, "none");
  assert.match(r1.reason, /robots 차단/);
  assert.ok(!blocked.calls.some(isPortal));
  const broken = fakeNet([robotsOk, [isPortal, { body: "<html><table><tr><th>다른 표</th></tr></table></html>" }]]);
  const r2 = await checkBaseRate({ fact: bokFact(), env: {}, today: TODAY, http: broken.http, isAllowed: builtinIsAllowed });
  assert.equal(r2.method, "none");
  assert.match(r2.reason, /파싱 실패/);
});

test("폴백 ⑦: 형식이 틀린 키(공개 체험 키 포함)는 ECOS 를 부르지 않고 누리집으로", async () => {
  const { http, calls } = fakeNet([ecosOk, robotsOk, portalOk]);
  const r = await checkBaseRate({ fact: bokFact(), env: { ECOS_API_KEY: "sample" }, today: TODAY, http, isAllowed: builtinIsAllowed });
  assert.equal(r.method, "bok-portal");
  assert.ok(!calls.some(isEcos));
  assert.ok(r.attempts.some((a) => a.method === "ecos" && /형식 오류/.test(a.reason)));
});

test("폴백: 공식값이 facts.json 과 다르면 보고서 맨 위 'FACTS 갱신 필요'", async () => {
  const out = tmp("drift");
  const html = fx("bok-baserate.html").replace("<td>3.00</td>", "<td>3.25</td>").replace("08월 27일", "10월 22일");
  const fetchImpl = async (url) => (url === BOK_PORTAL_URL ? new Response(html, { status: 200 }) : url.endsWith("/robots.txt") ? new Response(fx("bok-robots.txt"), { status: 200 }) : new Response("nf", { status: 404 }));
  const lines = [];
  const code = await main(["--live", "--today", TODAY, "--out", out], { env: {}, stdout: (s) => lines.splice(lines.length, 0, s), stderr: () => {}, fetchImpl });
  assert.equal(code, 0);
  const json = JSON.parse(readFileSync(join(out, `sentinel-${TODAY}.json`), "utf8"));
  assert.match(json.topLines[0], /^FACTS 갱신 필요/);
  assert.ok(readFileSync(join(out, `sentinel-${TODAY}.md`), "utf8").includes("FACTS 갱신 필요"));
  assert.ok(lines.some((l) => l.includes("FACTS 갱신 필요")));
});

// ── 종료 코드·스키마 ──

test("--strict: 픽스처 저장소(stale 있음) → 종료 코드 3, 없으면 0", () => {
  const out = tmp("strict");
  const s = spawnSync(process.execPath, [RUN, "--fixtures", "--strict", "--today", TODAY, "--out", out], { encoding: "utf8" });
  assert.equal(s.status, 3, s.stderr);
  const n = spawnSync(process.execPath, [RUN, "--fixtures", "--today", TODAY, "--out", out], { encoding: "utf8" });
  assert.equal(n.status, 0, n.stderr);
});

test("종료 코드 1: 설정 오류·정본 파싱 오류·잘못된 옵션", () => {
  const dir = tmp("cfg");
  const badFacts = join(dir, "facts.json");
  writeFileSync(badFacts, "{ broken");
  const a = spawnSync(process.execPath, [RUN, "--fixtures", "--facts", badFacts, "--out", dir], { encoding: "utf8" });
  assert.equal(a.status, 1);
  assert.match(a.stderr, /facts\.json JSON 오류/);
  const root = join(dir, "repo");
  mkdirSync(join(root, "src", "config"), { recursive: true });
  writeFileSync(join(root, "src", "config", "minimumWage.ts"), "export const X = 1;\n");
  const b = spawnSync(process.execPath, [RUN, "--root", root, "--out", dir], { encoding: "utf8" });
  assert.equal(b.status, 1);
  assert.match(b.stderr, /정본 파싱 실패: src\/config\/minimumWage\.ts/);
  const c = spawnSync(process.execPath, [RUN, "--fixtures", "--live"], { encoding: "utf8" });
  assert.equal(c.status, 1);
});

test("보고서 스키마: JSON 필드·마크다운(한국어·file:line)", async () => {
  const { code, json, md } = await runFixtures();
  assert.equal(code, 0);
  for (const k of ["generatedAt", "mode", "facts", "findings", "staleRoutes", "refreshDue", "cost"]) assert.ok(k in json, k);
  assert.equal(json.mode, "fixtures");
  for (const f of json.facts) {
    for (const k of ["id", "current", "since", "source", "live"]) assert.ok(k in f, `${f.id}.${k}`);
    assert.match(f.live.method, /^(ecos|bok-portal|none)$/);
    assert.ok("value" in f.live && "ok" in f.live);
  }
  const bok = json.facts.find((f) => f.id === "bok-base-rate");
  assert.deepEqual([bok.current, bok.since, bok.live.method, bok.live.value, bok.live.ok], ["3.00", "2026-08-27", "bok-portal", "3.00", true]);
  for (const f of json.findings) {
    for (const k of ["file", "line", "route", "owner", "factId", "found", "expected", "class", "context"]) assert.ok(k in f, k);
    assert.ok(CLASSES.includes(f.class));
    assert.ok(f.context.length <= 60, f.context);
    assert.equal(typeof f.line, "number");
  }
  assert.ok(Array.isArray(json.staleRoutes) && Array.isArray(json.refreshDue));
  for (const k of ["ms", "rssMB", "files", "requests"]) assert.equal(typeof json.cost[k], "number");
  assert.ok(json.cost.ms < 30000 && json.cost.rssMB < 200);
  assert.ok(json.cost.requests <= 2);
  for (const h of ["## 낡은 숫자 (stale)", "## 확인 필요 (unknown)", "## 다가오는 갱신 슬롯", "## 공식 수치 확인 결과"]) assert.ok(md.includes(h), h);
  assert.ok(md.includes("`src/app/savings-interest-2026/page.tsx:37`"));
});

test("담당 힌트: --owners 목록 파일(guides·oct)", async () => {
  const dir = tmp("own");
  const g = join(dir, "guides-files.txt");
  const o = join(dir, "oct-files.txt");
  writeFileSync(g, "src/lib/guides/fixture-guides.ts\r\n");
  writeFileSync(o, "src/app/savings-interest-2026/page.tsx\n");
  const out = join(dir, "out");
  const code = await main(["--fixtures", "--today", TODAY, "--out", out, "--owners", g, o], { stdout: () => {}, stderr: () => {} });
  assert.equal(code, 0);
  const json = JSON.parse(readFileSync(join(out, `sentinel-${TODAY}.json`), "utf8"));
  assert.ok(json.findings.filter((f) => f.file === "src/lib/guides/fixture-guides.ts").every((f) => f.owner === "guides-workflow"));
  assert.ok(json.findings.filter((f) => f.file === "src/app/savings-interest-2026/page.tsx").every((f) => f.owner === "oct"));
  assert.ok(json.findings.filter((f) => f.file === "src/components/FixtureWageNote.tsx").every((f) => f.owner === null));
});

// ── 갱신 슬롯 ──

test("갱신 슬롯: 30일 창·연말 넘김·문서 근거", () => {
  const slots = slotsJson().slots;
  assert.deepEqual(validateSlots(slotsJson()), []);
  const noDocs = () => {
    throw new Error("x");
  };
  const sep26 = computeRefreshDue(slots, TODAY, noDocs).map((s) => [s.id, s.status]);
  assert.deepEqual(sep26, [["season-set-oct", "진행 중"], ["hometax-preview", "D-29"]]);
  const dec28 = computeRefreshDue(slots, "2026-12-28", noDocs).map((s) => s.id);
  for (const id of ["year-end-calc-recheck", "civil-servant-pay-final", "rates-pointer-0101", "minimum-wage-pointer-0101", "samsung-annual-op", "samsung-opi"]) {
    assert.ok(dec28.includes(id), `${id} ∉ ${dec28}`);
  }
  const jan15 = computeRefreshDue(slots, "2027-01-15", noDocs).find((s) => s.id === "year-end-calc-recheck");
  assert.deepEqual([jan15.start, jan15.end, jan15.status], ["2026-11-01", "2027-01-31", "진행 중"]);
  // 문서 줄 확인: 그 줄 → ok, 옮겨짐 → 새 줄, 파일 없음 → null
  const doc = (rel) => {
    if (rel === "docs/a.md") return "x\n여기 문구\n";
    throw new Error("없음");
  };
  assert.equal(checkDocRef("docs/a.md:2", "여기 문구", doc).ok, true);
  assert.deepEqual(checkDocRef("docs/a.md:1", "여기 문구", doc), { ref: "docs/a.md:1", ok: false, now: "docs/a.md:2", note: "문구가 2행으로 이동" });
  assert.equal(checkDocRef("docs/b.md:1", "x", doc).ok, null);
});

test("갱신 슬롯: 모든 근거 문구가 저장소 문서에 실제로 있다(줄 이동은 허용)", () => {
  const read = (rel) => readFileSync(join(REPO, rel), "utf8");
  for (const s of slotsJson().slots) {
    for (const r of s.docRefs) {
      const c = checkDocRef(r.ref, r.anchor, read);
      assert.ok(c.ok === true || Boolean(c.now), `${s.id}: ${r.ref} '${r.anchor}' → ${JSON.stringify(c)}`);
    }
  }
});

// ── 금지 문자열 ──

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (e === ".cache" || e === "node_modules") continue;
    if (statSync(p).isDirectory()) out.splice(out.length, 0, ...walk(p));
    else out.splice(out.length, 0, p);
  }
  return out;
}

test("금지 엔드포인트·문자열: 감시기 파일과 이 테스트에 없어야 한다", () => {
  const files = [...walk(SENTINEL), fileURLToPath(import.meta.url)];
  const forbidden = ["fin" + "life", "openapi." + "naver.com", "korea.kr/" + "rss", "datalab." + "naver", "trends.google.com/trends/" + "explore"];
  const mutating = ["pu" + "sh"];
  for (const f of files) {
    const rel = relative(SENTINEL, f).split(sep).join("/");
    const text = readFileSync(f, "utf8").toLowerCase();
    for (const s of forbidden) assert.ok(!text.includes(s), `${rel} 에 금지 문자열 ${s}`);
    for (const s of mutating) assert.ok(!text.includes(s), `${rel} 에 '${s}'`);
    const isFixtureOrTest = rel.startsWith("fixtures/") || f === fileURLToPath(import.meta.url);
    if (!isFixtureOrTest) assert.ok(!/sample/i.test(text), `${rel} 에 ECOS 체험 키 문자열`);
  }
});

test("저장소 오염 없음: 기본 --out 은 .gitignore 대상(.cache/)", () => {
  const gi = readFileSync(join(SENTINEL, ".gitignore"), "utf8");
  assert.match(gi, /^\.cache\/\r?$/m);
});

test.after(() => {
  if (fixtureRun) rmSync(fixtureRun.out, { recursive: true, force: true });
});
