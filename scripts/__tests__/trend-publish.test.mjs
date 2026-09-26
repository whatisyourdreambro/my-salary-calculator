// node --test scripts/__tests__/trend-publish.test.mjs — 트렌드 브리프 파이프라인 스크립트 (2026-09-26 R5 publisher)
// 오프라인: 네트워크·실제 빌드 없이 가짜 명령 실행기·가짜 fetch·임시 TREND_HOME 으로 상태 기계와 게이트를 검사한다.
// 비밀값·40자리 hex 는 이 파일에 글자로 두지 않고 실행 중에 만든다(브랜치 diff 의 secret-scan 이 이 파일도 훑는다).
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as scan from "../trend-publish/secret-scan.mjs";
import * as daily from "../trend-publish/daily.mjs";
import { checkPreconditions } from "../trend-publish/publish-approved.mjs";
import { extractAssets, pollPage, run as verifyRun, staleChunkCheck } from "../trend-publish/verify-prod.mjs";
import { compareManifests, statusViolations } from "../trend-publish/chunk-diff.mjs";
import { compareSequences, extractAdMarkers } from "../trend-publish/ad-sequence.mjs";
import { checkResources, EXIT_RESOURCE } from "../trend-publish/heavy.mjs";
import { validateAck } from "../trend-publish/review-ack.mjs";
import { numberErrors30d, zombieCohortRatio } from "../trend-publish/decide.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TP = join(ROOT, "scripts", "trend-publish");
const hex = (n, ch = "a") => ch.repeat(n);
const tmp = (p) => mkdtempSync(join(tmpdir(), p));
// 키 붙은 URL 파라미터 이름도 실행 중에 조립한다(이 파일 원문이 브랜치 secret-scan 에 걸리지 않게)
const OC = ["O", "C="].join("");
const SK = ["service", "Key="].join("");
const CK = ["crtfc", "_key="].join("");

// ─────────────────────────────────────────────────────────────
// secret-scan
// ─────────────────────────────────────────────────────────────
test("secret-scan: 40·32자리 hex · OC= · serviceKey · 환경변수 값을 잡고 IndexNow 키 파일은 허용", () => {
  const h40 = hex(40, "b");
  const h32 = hex(32, "c");
  const text = [`const a = "${h40}";`, `k=${h32}`, `https://www.law.go.kr/DRF/lawSearch.do?${OC}someone&target=law`, `https://apis.data.go.kr/x?${SK}${"Z".repeat(20)}`, `${CK}${"q".repeat(40)}`].join("\n");
  const rules = new Set(scan.scanText(text, { file: "src/x.ts" }).map((h) => h.rule));
  for (const r of ["hex40", "hex32", "law-oc", "service-key", "keyed-param"]) assert.ok(rules.has(r), r);
  assert.deepEqual(scan.scanText(h32, { file: `public/${h32}.txt` }), []);
  assert.ok(scan.scanText(h32, { file: "public/other.txt" }).length > 0);
  const secret = `S3cr3t-${"x".repeat(12)}`;
  const env = scan.collectEnvSecrets({ ECOS_API_KEY: secret, LAW_OC: "operator-oc-value", PATH: "/usr/bin", SHORT_KEY: "abc" });
  assert.deepEqual(env.map((e) => e.name).sort(), ["ECOS_API_KEY", "LAW_OC"]);
  const b64 = Buffer.from(secret).toString("base64");
  const hits = scan.scanText(`literal ${secret} and ${encodeURIComponent(secret)} and ${b64}`, { file: "log.txt", envSecrets: env });
  assert.ok(hits.filter((h) => h.rule === "env:ECOS_API_KEY").length >= 2);
  assert.ok(hits.some((h) => h.preview.startsWith(b64.slice(0, 4))));
  // 압축 번들의 속성 대입은 키가 아니다(.next/server/edge-chunks 실측 오탐) — URL 파라미터·줄 머리만
  assert.deepEqual(scan.scanText("w.path=w.pathname+w.search,w.auth=[u.username,u.password].map(de)", { file: ".next/server/edge-chunks/706.js", keyedOnly: true }), []);
  assert.equal(scan.scanText(`x?${CK.replace("crtfc_key", "auth")}${"k".repeat(12)}`, { file: "log.txt" })[0]?.rule, "keyed-param");
  // .next 는 키 붙은 URL 만 — 빌드 해시(hex)는 정상
  assert.deepEqual(scan.scanText(`previewModeId":"${h32}"`, { file: ".next/prerender-manifest.json", keyedOnly: true }), []);
});

test("secret-scan: 값 가리기 — 출력에 원문이 없다 (git 저장소 종단 검사 + HALT)", () => {
  const repo = tmp("scan-repo-");
  const home = tmp("scan-home-");
  try {
    const g = (...a) => execFileSync("git", ["-C", repo, ...a], { stdio: "ignore" });
    g("init", "-q");
    g("config", "user.email", "t@example.com");
    g("config", "user.name", "t");
    writeFileSync(join(repo, "a.txt"), "base\n");
    g("add", ".");
    g("commit", "-qm", "base");
    const secret = `Tok-${"y".repeat(24)}`;
    writeFileSync(join(repo, "a.txt"), `base\nurl https://x.example/?${SK}${secret}\n`);
    const r = spawnSync(process.execPath, [join(TP, "secret-scan.mjs"), "--repo", repo, "--base", "HEAD", "--trend-home", home, "--no-next"], {
      encoding: "utf8",
      env: { ...process.env, DATA_GO_KR_KEY: secret },
    });
    assert.equal(r.status, 1);
    assert.ok(!r.stdout.includes(secret) && !r.stderr.includes(secret), "출력에 비밀값 원문이 없어야 한다");
    assert.ok(existsSync(join(home, "HALT")));
    assert.ok(!readFileSync(join(home, "HALT"), "utf8").includes(secret));
    assert.equal(scan.redact(secret), `${secret.slice(0, 4)}…(${secret.length}자)`);
    // 깨끗한 변경은 통과
    writeFileSync(join(repo, "a.txt"), "base\nclean line\n");
    rmSync(join(home, "HALT"));
    const ok = spawnSync(process.execPath, [join(TP, "secret-scan.mjs"), "--repo", repo, "--base", "HEAD", "--trend-home", home, "--no-next"], { encoding: "utf8" });
    assert.equal(ok.status, 0, ok.stderr);
  } finally {
    rmSync(repo, { recursive: true, force: true });
    rmSync(home, { recursive: true, force: true });
  }
});

// ─────────────────────────────────────────────────────────────
// daily.mjs 상태 기계 — 가짜 TREND_HOME · 가짜 명령 실행기
// ─────────────────────────────────────────────────────────────
function fakeWorktree({ ledger = [] } = {}) {
  const wt = tmp("trend-wt-");
  for (const f of ["scripts/trend-publish/calendar.json", "scripts/trend-publish/config.json", "src/lib/trendBriefs/types.ts"]) {
    mkdirSync(dirname(join(wt, f)), { recursive: true });
    copyFileSync(join(ROOT, f), join(wt, f));
  }
  writeFileSync(join(wt, "scripts/trend-publish/ledger.json"), JSON.stringify(ledger));
  mkdirSync(join(wt, "scripts/trend-radar"), { recursive: true });
  mkdirSync(join(wt, "scripts/fact-sentinel"), { recursive: true });
  writeFileSync(join(wt, "scripts/trend-radar/run.mjs"), "");
  writeFileSync(join(wt, "scripts/fact-sentinel/run.mjs"), "");
  return wt;
}
function fakeHome(flags = {}) {
  const home = tmp("trend-home-");
  for (const [k, v] of Object.entries(flags)) writeFileSync(join(home, k), v);
  return home;
}
const snapshotOperator = (home) => Object.fromEntries(daily.OPERATOR_FLAGS.map((f) => [f, existsSync(join(home, f)) ? readFileSync(join(home, f), "utf8") : null]));

/** 가짜 실행기 — 명령을 기록하고 규칙대로 답한다 */
function fakeRunner(home, { dirty = false, codes = {}, candidates } = {}) {
  const calls = [];
  const run = async (cmd, args) => {
    const line = [cmd, ...args].join(" ");
    calls.splice(calls.length, 0, line);
    if (cmd === "git") {
      if (args.includes("status")) return { code: 0, stdout: dirty ? " M src/x.ts\n" : codes.gitStatus ?? "", stderr: "" };
      if (args.includes("rev-parse") && args.includes("HEAD^{tree}")) return { code: 0, stdout: "tree1234\n", stderr: "" };
      if (args.includes("rev-parse")) return { code: 0, stdout: "base1234\n", stderr: "" };
      return { code: 0, stdout: "", stderr: "" };
    }
    if (line.includes("trend-radar")) {
      // 레이더 계약(scripts/trend-radar/README.md): radar-<날짜>.json 의 candidates[] — link·publishedAt·recommendation
      mkdirSync(join(home, "radar"), { recursive: true });
      const radar = (candidates ?? []).map((c) => ({ id: c.id, src: "moel-policy", ministry: "고용노동부", sourceKind: "보도자료", title: c.title, link: c.url, publishedAt: `${c.publishedDate}T10:00:00+09:00`, cluster: c.cluster, briefEligible: true, score: c.score, recommendation: c.route }));
      writeFileSync(join(home, "radar", "radar-2026-10-13.json"), JSON.stringify({ date: "2026-10-13", candidates: radar }));
      writeFileSync(join(home, "radar", "headlines-2026-10-13.json"), JSON.stringify({ date: "2026-10-13", titles: ["헤드라인은 후보가 아니다"] }));
      return { code: 0, stdout: "", stderr: "" };
    }
    if (line.includes("heavy.mjs")) {
      const name = /logs[\\/]\d{4}-\d{2}-\d{2}-([a-z0-9-]+)\.log/.exec(line)?.[1];
      return { code: codes[name] ?? 0, stdout: `[heavy] ${name}`, stderr: "" };
    }
    return { code: codes.other ?? 0, stdout: "", stderr: "" };
  };
  return { run, calls, now: () => new Date("2026-10-13T01:00:00Z"), log: () => {} };
}
const CAND = { id: "c1", cluster: "social-insurance-rates", route: "new-brief", title: "고용보험 제도개편 방안", url: "https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=1", publishedDate: "2026-10-08", score: 50 };
const cleanup = (...dirs) => dirs.forEach((d) => rmSync(d, { recursive: true, force: true }));

test("daily: 모드 결정 — 10/10 전 DRYRUN · 동결 · 배포 배치+2일 · REVIEWED_UNTIL 만료/14일 초과 · D+28 대기 · 한도 · 모두 충족 시 PROPOSE", () => {
  const consts = daily.readTypesConstants(ROOT);
  const calendar = JSON.parse(readFileSync(join(TP, "calendar.json"), "utf8"));
  const flags = { halt: null, publishEnabled: true, reviewedUntil: "2026-10-20", cfPurgeOk: true, deployHold: null };
  const base = { flags, calendar, localCalendar: {}, pilotVerdict: false, ledger: [], decisions: [], consts, config: {} };
  assert.equal(daily.computeMode({ ...base, today: "2026-10-13" }).mode, "PROPOSE");
  const early = daily.computeMode({ ...base, today: "2026-10-05", flags: { ...flags, reviewedUntil: "2026-10-12" } });
  assert.equal(early.mode, "DRYRUN");
  assert.ok(early.reasons.some((r) => r.includes("첫 발행일")));
  assert.equal(daily.computeMode({ ...base, today: "2026-11-15" }).mode, "FREEZE");
  assert.ok(daily.computeMode({ ...base, today: "2026-10-11" }).reasons.some((r) => r.includes("배포 배치")));
  assert.ok(daily.computeMode({ ...base, today: "2026-10-13", flags: { ...flags, reviewedUntil: "2026-10-12" } }).reasons.some((r) => r.includes("만료")));
  assert.ok(daily.computeMode({ ...base, today: "2026-10-13", flags: { ...flags, reviewedUntil: "2026-10-30" } }).reasons.some((r) => r.includes("14일")));
  assert.ok(daily.computeMode({ ...base, today: "2026-10-13", flags: { ...flags, publishEnabled: false } }).reasons.some((r) => r.includes("PUBLISH_ENABLED")));
  const live = { slug: "b1", publishedDate: "2026-09-01", cluster: "year-end-tax", primary: { url: "u", sha256: "s" }, reviewBy: "2026-10-31", status: "live" };
  const pend = daily.computeMode({ ...base, today: "2026-10-13", ledger: [live] });
  assert.equal(pend.mode, "DRYRUN");
  assert.ok(pend.reasons.some((r) => r.includes("결정 대기")));
  assert.equal(daily.computeMode({ ...base, today: "2026-10-13", ledger: [live], decisions: [{ slug: "b1", at: "d28" }] }).mode, "PROPOSE");
  const capped = daily.computeMode({ ...base, today: "2026-10-13", ledger: [{ ...live, slug: "b2", publishedDate: "2026-10-13", reviewBy: "2026-12-12" }] });
  assert.ok(capped.reasons.some((r) => r.includes("하루")));
  assert.equal(daily.cardExpiry("2026-10-08", "2026-10-13"), "2026-10-15");
  assert.equal(daily.cardExpiry("2026-10-12", "2026-10-13"), "2026-10-15");
  assert.equal(daily.cardExpiry("2026-10-06", "2026-10-13"), "2026-10-13");
});

test("daily prepare: HALT · 워크트리 변경 → HALT · 새 코드로 재실행", async () => {
  const wt = fakeWorktree();
  const home = fakeHome({ HALT: "테스트 중지" });
  try {
    const d = fakeRunner(home);
    const r = await daily.prepare({ trendHome: home, worktree: wt, today: "2026-10-13" }, d);
    assert.equal(r.status, "halt");
    assert.equal(d.calls.length, 0, "HALT 면 아무 명령도 실행하지 않는다");
    rmSync(join(home, "HALT"));
    const dirty = fakeRunner(home, { dirty: true });
    const r2 = await daily.prepare({ trendHome: home, worktree: wt, today: "2026-10-13" }, dirty);
    assert.equal(r2.status, "halt");
    assert.ok(existsSync(join(home, "HALT")));
    rmSync(join(home, "HALT"));
    const clean = fakeRunner(home);
    await daily.prepare({ trendHome: home, worktree: wt, today: "2026-10-13" }, clean);
    assert.ok(clean.calls.some((c) => c.includes("checkout --detach origin/main")));
    assert.ok(clean.calls.some((c) => c.includes("reset --hard origin/main")));
    assert.ok(clean.calls.some((c) => c.includes("daily.mjs prepare --reexeced")), "새 코드로 재실행");
  } finally {
    cleanup(wt, home);
  }
});

test("daily prepare: 동결은 보고만 · 후보 없음 · RAM 부족 SKIP · 정상이면 write", async () => {
  const wt = fakeWorktree();
  const home = fakeHome({ PUBLISH_ENABLED: "", REVIEWED_UNTIL: "2026-10-20" });
  const before = snapshotOperator(home);
  try {
    const frozen = fakeRunner(home);
    const f = await daily.prepare({ trendHome: home, worktree: wt, today: "2026-11-15", noSync: true }, frozen);
    assert.equal(f.status, "freeze-report-only");
    assert.ok(!frozen.calls.some((c) => c.includes("heavy.mjs") || c.includes("trend-radar")), "동결 기간엔 빌드·레이더 없음");
    const none = fakeRunner(home, { candidates: [] });
    assert.equal((await daily.prepare({ trendHome: home, worktree: wt, today: "2026-10-13", noSync: true }, none)).status, "no-candidate");
    const ram = fakeRunner(home, { candidates: [CAND], codes: { "base-build": EXIT_RESOURCE } });
    const r = await daily.prepare({ trendHome: home, worktree: wt, today: "2026-10-13", noSync: true }, ram);
    assert.equal(r.status, "skip");
    assert.match(r.reason, /RAM/);
    const ok = fakeRunner(home, { candidates: [CAND] });
    const w = await daily.prepare({ trendHome: home, worktree: wt, today: "2026-10-13", noSync: true }, ok);
    assert.equal(w.status, "write", w.reason);
    assert.equal(w.mode, "PROPOSE");
    assert.ok(ok.calls.some((c) => c.includes("source-snapshot.ts") && c.includes("--id primary")));
    assert.ok(ok.calls.some((c) => c.includes("secondary-1")));
    assert.ok(existsSync(join(home, "state", "2026-10-13.json")));
    const old = fakeRunner(home, { candidates: [{ ...CAND, publishedDate: "2026-10-01" }] });
    assert.equal((await daily.prepare({ trendHome: home, worktree: wt, today: "2026-10-13", noSync: true }, old)).status, "no-candidate", "1차 출처 7일 초과");
    assert.deepEqual(snapshotOperator(home), before, "운영자 파일 불변");
  } finally {
    cleanup(wt, home);
  }
});

function writeState(home, wt, mode) {
  mkdirSync(join(home, "state"), { recursive: true });
  const snapDir = join(home, "snapshots", "2026-10-13");
  mkdirSync(snapDir, { recursive: true });
  writeFileSync(join(home, "state", "2026-10-13.json"), JSON.stringify({ date: "2026-10-13", mode, originSha: "base1234", candidate: CAND, snapDir }));
  const draft = JSON.parse(readFileSync(join(ROOT, "src/lib/__tests__/fixtures/trendBriefDrafts.json"), "utf8")).good;
  const p = join(home, "draft.json");
  writeFileSync(p, JSON.stringify(draft));
  return { draftPath: p, draft };
}

test("daily finish: skip 초안 · 단계 실패에서 멈춤 · RAM SKIP · DRYRUN 원복 · PROPOSE 커밋·보관·카드", async () => {
  const wt = fakeWorktree();
  const home = fakeHome({ PUBLISH_ENABLED: "", REVIEWED_UNTIL: "2026-10-20" });
  const before = snapshotOperator(home);
  try {
    const { draftPath, draft } = writeState(home, wt, "PROPOSE");
    const skipPath = join(home, "skip.json");
    writeFileSync(skipPath, JSON.stringify({ skip: true, reason: "공식 출처 1건" }));
    assert.equal((await daily.finish({ trendHome: home, worktree: wt, today: "2026-10-13", draft: skipPath }, fakeRunner(home))).status, "skip");

    const failing = fakeRunner(home, { codes: { vitest: 1 } });
    const f = await daily.finish({ trendHome: home, worktree: wt, today: "2026-10-13", draft: draftPath }, failing);
    assert.equal(f.status, "skip");
    assert.match(f.reason, /vitest/);
    assert.ok(!failing.calls.some((c) => c.includes("-build.log")), "실패 뒤 단계는 실행하지 않는다");
    assert.ok(failing.calls.some((c) => c.includes("reset --hard")), "워크트리 원복");

    const ram = fakeRunner(home, { codes: { build: EXIT_RESOURCE } });
    const r = await daily.finish({ trendHome: home, worktree: wt, today: "2026-10-13", draft: draftPath }, ram);
    assert.equal(r.status, "skip");
    assert.match(r.reason, /RAM/);

    writeState(home, wt, "DRYRUN");
    const dry = fakeRunner(home);
    const d = await daily.finish({ trendHome: home, worktree: wt, today: "2026-10-13", draft: draftPath }, dry);
    assert.equal(d.status, "dryrun-pass");
    assert.equal(dry.calls.filter((c) => c.includes("heavy.mjs")).length, 16, "무거운 단계 16개");
    assert.ok(!dry.calls.some((c) => c.includes(" commit ")), "DRYRUN 은 커밋하지 않는다");

    writeState(home, wt, "PROPOSE");
    const prop = fakeRunner(home, { codes: { gitStatus: " M src/lib/guides/trend-briefs.ts\n?? src/lib/guides/trend-briefs-2026-10.ts\n M scripts/trend-publish/ledger.json\n" } });
    const p = await daily.finish({ trendHome: home, worktree: wt, today: "2026-10-13", draft: draftPath }, prop);
    assert.equal(p.status, "proposed", p.reason);
    assert.ok(prop.calls.some((c) => c.includes(`checkout -b trend/2026-10-13-${draft.slug}`)));
    assert.ok(prop.calls.some((c) => c.includes("commit -F")));
    const archive = JSON.parse(readFileSync(join(home, "drafts", `${draft.slug}.json`), "utf8"));
    assert.equal(archive.draftSha256, daily.draftSha256(draft));
    assert.equal(archive.expiry, "2026-10-15");
    const card = readFileSync(p.card, "utf8");
    assert.ok(card.includes(`발행 ${draft.slug}`) && card.includes(archive.draftSha256));
    const msg = readFileSync(join(home, "tmp", `commit-${draft.slug}.txt`), "utf8");
    assert.ok(!msg.includes('"'), "커밋 메시지에 큰따옴표 없음");
    assert.ok(msg.trimEnd().endsWith("Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"));

    writeState(home, wt, "PROPOSE");
    const outside = fakeRunner(home, { codes: { gitStatus: " M src/app/page.tsx\n" } });
    const o = await daily.finish({ trendHome: home, worktree: wt, today: "2026-10-13", draft: draftPath }, outside);
    assert.equal(o.status, "halt", "허용 밖 변경이면 HALT");
    assert.deepEqual(snapshotOperator(home), before, "운영자 파일 불변");
  } finally {
    cleanup(wt, home);
  }
});

test("daily: 운영자 파일·TREND_HOME 밖 쓰기 거부, 원격 반영 코드 없음", () => {
  const home = tmp("trend-home-");
  try {
    for (const f of daily.OPERATOR_FLAGS) assert.throws(() => daily.safeWrite(home, join(home, f), "x"), /운영자/);
    assert.throws(() => daily.safeWrite(home, join(tmpdir(), "elsewhere.txt"), "x"), /밖/);
    daily.safeWrite(home, join(home, "reports", "ok.md"), "ok");
    const src = readFileSync(join(TP, "daily.mjs"), "utf8");
    assert.equal((src.match(/writeFileSync\(/g) ?? []).length, 1, "쓰기는 safeWrite 한 곳");
    assert.ok(!/push/i.test(src), "daily.mjs 에 push 문자열 없음");
  } finally {
    cleanup(home);
  }
});

test("git push 는 publish-approved.mjs 에만 있다", () => {
  // 정책: 이 폴더에서 'push' 라는 글자 자체를 publish-approved.mjs 에만 둔다 — 배열 추가도 splice 로 쓴다.
  const offenders = readdirSync(TP)
    .filter((f) => /\.(?:mjs|ts|md|json)$/.test(f) && f !== "publish-approved.mjs")
    .filter((f) => /push/i.test(readFileSync(join(TP, f), "utf8")));
  assert.deepEqual(offenders, []);
  const pa = readFileSync(join(TP, "publish-approved.mjs"), "utf8");
  assert.ok(/\["push", "origin", "HEAD:main"\]/.test(pa));
  assert.ok(!/--force|-f\b.*push|push.*--force/.test(pa), "강제 반영 없음");
  // 검색·데이터랩 API 흔적 없음 (정책: 코드·환경변수 이름 금지)
  const all = readdirSync(TP).map((f) => readFileSync(join(TP, f), "utf8")).join("\n");
  assert.ok(!all.includes(["NAVER", "_"].join("")) && !new RegExp(["fin", "life"].join(""), "i").test(all));
});

// ─────────────────────────────────────────────────────────────
// publish-approved 사전 조건
// ─────────────────────────────────────────────────────────────
test("publish-approved: 해시 불일치 · 카드 만료 · origin/main 2시간 미만 · DEPLOY_HOLD · CF_PURGE_OK 없음", () => {
  const flags = { halt: null, publishEnabled: true, reviewedUntil: "2026-10-20", cfPurgeOk: true, deployHold: null };
  const sha = hex(64, "d");
  const base = {
    kind: "publish",
    today: "2026-10-13",
    flags,
    calendarBlocks: [],
    capReasons: [],
    pending: [],
    manualPurgeAck: false,
    originAgeHours: 5,
    minOriginAgeHours: 2,
    archive: { draftSha256: sha, cardDate: "2026-10-13", primaryPublishedDate: "2026-10-08" },
    argSha: sha,
    recomputedSha: sha,
  };
  assert.deepEqual(checkPreconditions(base), []);
  assert.ok(checkPreconditions({ ...base, argSha: hex(64, "e") }).some((x) => x.includes("해시")));
  assert.ok(checkPreconditions({ ...base, recomputedSha: hex(64, "e") }).some((x) => x.includes("해시")));
  assert.ok(checkPreconditions({ ...base, today: "2026-10-16" }).some((x) => x.includes("만료")));
  assert.ok(checkPreconditions({ ...base, originAgeHours: 1.5 }).some((x) => x.includes("2시간")));
  assert.ok(checkPreconditions({ ...base, flags: { ...flags, deployHold: "R4 배포 중" } }).some((x) => x.includes("DEPLOY_HOLD")));
  assert.ok(checkPreconditions({ ...base, flags: { ...flags, cfPurgeOk: false } }).some((x) => x.includes("CF_PURGE_OK")));
  assert.deepEqual(checkPreconditions({ ...base, flags: { ...flags, cfPurgeOk: false }, manualPurgeAck: true }), []);
  assert.ok(checkPreconditions({ ...base, flags: { ...flags, halt: "x" } }).some((x) => x.includes("HALT")));
  assert.ok(checkPreconditions({ ...base, flags: { ...flags, publishEnabled: false } }).some((x) => x.includes("PUBLISH_ENABLED")));
  assert.ok(checkPreconditions({ ...base, calendarBlocks: ["동결"] }).some((x) => x.includes("달력")));
  assert.ok(checkPreconditions({ ...base, pending: [{ slug: "a", at: "d28" }] }).some((x) => x.includes("결정 대기")));
  assert.ok(checkPreconditions({ ...base, archive: null }).some((x) => x.includes("보관")));
  // 수정 발행(--update)은 새 URL 이 아니다 — 한도·결정 대기는 보지 않고, 달력은 판정일·배포 배치·로컬 차단만(호출부가 거른다)
  assert.deepEqual(checkPreconditions({ ...base, kind: "update", archive: null, capReasons: ["하루 1편"], pending: [{ slug: "a", at: "d28" }] }), []);
  assert.deepEqual(daily.updateCalendarBlocks(["동결 2026-11-01~2027-01-31", "첫 발행일 2026-10-10 이전", "판정일 2026-10-09", "배포 배치 2026-10-10 + 2일", "calendar.local.json 차단 2026-10-20"]), [
    "판정일 2026-10-09",
    "배포 배치 2026-10-10 + 2일",
    "calendar.local.json 차단 2026-10-20",
  ]);
  // 철회는 되돌리기 — HALT·달력이 있어도 DEPLOY_HOLD·2시간·Purge 만 본다
  assert.deepEqual(checkPreconditions({ ...base, kind: "retire", flags: { ...flags, halt: "x" }, calendarBlocks: ["동결"], argSha: undefined }), []);
});

// ─────────────────────────────────────────────────────────────
// verify-prod
// ─────────────────────────────────────────────────────────────
function fakeFetch(map) {
  const seen = [];
  const fn = async (url) => {
    seen.splice(seen.length, 0, url);
    const hit = typeof map === "function" ? map(url, seen.length) : map[url];
    const [status, text] = hit ?? [404, "not found"];
    return { status, text: async () => text };
  };
  return { fn, seen };
}

test("verify-prod: 자산 추출 · 낡은 청크(404)·GET 상한 · 폴링 · Purge 뒤 재확인", async () => {
  const O = "https://www.moneysalary.com";
  const html = (n) => Array.from({ length: n }, (_, i) => `<script src="/_next/static/chunks/c${i}.js"></script>`).join("") + '<link href="/_next/static/css/a.css">';
  assert.equal(extractAssets(html(3)).length, 4);
  const pages = ["/", "/calc/samsung-bonus", "/guides/nurse-salary"];
  const ok = fakeFetch((u) => (u.startsWith(`${O}/_next`) ? [200, ""] : [200, html(30)]));
  const r = await staleChunkCheck({ fetchFn: ok.fn, origin: O, pages, maxGets: 40 });
  assert.equal(r.missing.length, 0);
  assert.equal(r.gets, 40, "자산 GET 은 40건 상한");
  const bad = fakeFetch((u) => (u.endsWith("c2.js") ? [404, ""] : u.startsWith(`${O}/_next`) ? [200, ""] : [200, html(3)]));
  const b = await staleChunkCheck({ fetchFn: bad.fn, origin: O, pages: ["/"], maxGets: 40 });
  assert.deepEqual(b.missing, ["/_next/static/chunks/c2.js"]);
  let clock = 0;
  const poll = fakeFetch((u, n) => (n >= 3 ? [200, "<h1>새 글 제목</h1>"] : [404, ""]));
  const p = await pollPage({ fetchFn: poll.fn, sleep: async (ms) => (clock += ms), url: `${O}/guides/x`, marker: "새 글 제목", timeoutMs: 45 * 60_000, intervalMs: 60_000, now: () => clock });
  assert.equal(p.ok, true);
  assert.equal(p.tries, 3);
  const never = fakeFetch(() => [404, ""]);
  clock = 0;
  const n = await pollPage({ fetchFn: never.fn, sleep: async (ms) => (clock += ms), url: `${O}/guides/x`, marker: "m", timeoutMs: 5 * 60_000, intervalMs: 60_000, now: () => clock });
  assert.equal(n.ok, false);
  // 자동 Purge 가 있으면 15분 뒤 한 번 더 — 두 번째엔 정상
  let purged = false;
  const full = fakeFetch((u) => {
    if (u.endsWith("/guides/s")) return [200, "제목"];
    if (u.endsWith("/rss.xml") || u.endsWith("/sitemap.xml")) return [200, "/guides/s"];
    if (u.endsWith("c1.js")) return purged ? [200, ""] : [404, ""];
    if (u.startsWith(`${O}/_next`)) return [200, ""];
    return [200, html(2)];
  });
  const sleeps = [];
  const res = await verifyRun({ slug: "s", marker: "제목", purgeAuto: true, purgeRecheckMin: 15 }, { fetchFn: full.fn, sleep: async (ms) => { sleeps.splice(sleeps.length, 0, ms); purged = true; }, log: () => {}, now: () => 0 });
  assert.equal(res.ok, true);
  assert.ok(sleeps.includes(15 * 60_000));
  purged = false;
  const noAuto = await verifyRun({ slug: "s", marker: "제목", purgeAuto: false }, { fetchFn: full.fn, sleep: async () => {}, log: () => {}, now: () => 0 });
  assert.equal(noAuto.ok, false);
  assert.match(noAuto.summary, /Purge 필요/);
});

// ─────────────────────────────────────────────────────────────
// chunk-diff · ad-sequence · heavy
// ─────────────────────────────────────────────────────────────
test("chunk-diff: 바뀐·새 청크는 slug 를 담아야 하고 런타임만 예외 · git status 허용목록", () => {
  const base = { "chunks/a.js": "1", "chunks/webpack-aaa.js": "2", "css/x.css": "3" };
  const brief = { "chunks/a.js": "1", "chunks/webpack-bbb.js": "9", "chunks/list-new.js": "7", "css/x.css": "3" };
  const read = (n) => (n === "chunks/list-new.js" ? '"slug":"my-brief-2027"' : "no slug");
  assert.deepEqual(compareManifests(base, brief, { slug: "my-brief-2027", readChunk: read, runtimeExempt: ["^webpack-[0-9a-f]+\\.js$"] }).errs, []);
  assert.equal(compareManifests(base, brief, { slug: "my-brief-2027", readChunk: read, runtimeExempt: [] }).errs.length, 1);
  assert.equal(compareManifests(base, { ...brief, "chunks/home.js": "5" }, { slug: "my-brief-2027", readChunk: read, runtimeExempt: ["^webpack-[0-9a-f]+\\.js$"] }).errs.length, 1);
  const allow = JSON.parse(readFileSync(join(TP, "config.json"), "utf8")).pathAllowlist.publish;
  assert.deepEqual(statusViolations(" M src/lib/guides/trend-briefs.ts\n?? src/lib/guides/trend-briefs-2026-10.ts\n M src/lib/guidesMeta.generated.ts\n", allow), []);
  assert.deepEqual(statusViolations(" M src/config/seasonKey.generated.ts\n M src/app/page.tsx\n", allow), ["src/config/seasonKey.generated.ts", "src/app/page.tsx"]);
});

test("ad-sequence: 광고 표식 순서 · 기준 빌드와 동일 · 3분할 형제와 동일", () => {
  const page = '<div class="ad-container ad-slot-guide-mid" style="x"></div><p>본문</p><div class="ad-container ad-in-article ad-slot-fluid"></div><div data-coupang-banner-size="large-portrait"></div><div class="ad-container ad-slot-sidebar"></div>';
  const seq = extractAdMarkers(page);
  assert.deepEqual(seq, ["ad:guide-mid", "ad:fluid", "coupang:large-portrait", "ad:sidebar"]);
  const base = { "/": ["ad:home-top"], "/guides/nurse-salary": seq };
  const brief = { "/": ["ad:home-top"], "/guides/nurse-salary": seq, "/guides/b-2027": seq, "/guides/sib": seq };
  assert.deepEqual(compareSequences(base, brief, { slug: "b-2027", sibling: "sib" }), []);
  assert.equal(compareSequences(base, { ...brief, "/": ["ad:home-top", "ad:result"] }, { slug: "b-2027", sibling: "sib" }).length, 1);
  assert.equal(compareSequences(base, { ...brief, "/guides/b-2027": seq.slice(0, 2) }, { slug: "b-2027", sibling: "sib" }).length, 1);
});

test("heavy: 다른 무거운 프로세스·여유 메모리 판정 (대기 중 래퍼는 무시)", () => {
  assert.equal(checkResources({ freeMB: 8000, minFreeMB: 6144, processes: [], selfPid: 1 }).ok, true);
  assert.match(checkResources({ freeMB: 4000, minFreeMB: 6144, processes: [], selfPid: 1 }).reason, /메모리/);
  assert.equal(checkResources({ freeMB: 8000, minFreeMB: 6144, processes: [{ pid: 2, cmd: "node node_modules/next/dist/bin/next build" }], selfPid: 1 }).ok, false);
  assert.equal(checkResources({ freeMB: 8000, minFreeMB: 6144, processes: [{ pid: 3, cmd: 'node heavy.mjs "npx vitest run"' }], selfPid: 1 }).ok, true);
  assert.equal(checkResources({ freeMB: 8000, minFreeMB: 6144, processes: [{ pid: 1, cmd: "vitest" }], selfPid: 1 }).ok, true);
});

// ─────────────────────────────────────────────────────────────
// review-ack · decide
// ─────────────────────────────────────────────────────────────
test("review-ack: 네 항목 모두 확인·14일 이하만 기록, --halt 는 HALT", () => {
  const ok = ["node", "x", "--days", "7", "--gsc-manual-actions", "none", "--adsense-policy", "none", "--naver-notice", "none", "--clicks", "ok"];
  assert.deepEqual(validateAck(ok).errs, []);
  assert.ok(validateAck(ok.map((a) => (a === "7" ? "15" : a))).errs.length);
  assert.ok(validateAck(ok.map((a, i) => (i === 7 ? "found" : a))).errs.some((e) => e.includes("--halt")));
  assert.ok(validateAck(ok.slice(0, 10)).errs.length, "--clicks 누락");
  const home = tmp("trend-ack-");
  try {
    const r = spawnSync(process.execPath, [join(TP, "review-ack.mjs"), ...ok.slice(2), "--trend-home", home, "--today", "2026-10-13"], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    assert.equal(readFileSync(join(home, "REVIEWED_UNTIL"), "utf8").trim(), "2026-10-20");
    const h = spawnSync(process.execPath, [join(TP, "review-ack.mjs"), "--halt", "GSC 직접 조치 발견", "--trend-home", home], { encoding: "utf8" });
    assert.equal(h.status, 0);
    assert.match(readFileSync(join(home, "HALT"), "utf8"), /직접 조치/);
  } finally {
    cleanup(home);
  }
});

test("decide: D+28 좀비 비율 ≥ 50% · 30일 수치 오류 2건 → HALT", () => {
  const ledger = [
    { slug: "a", publishedDate: "2026-10-13", status: "live" },
    { slug: "b", publishedDate: "2026-10-14", status: "live" },
    { slug: "c", publishedDate: "2026-11-02", status: "live" },
  ];
  assert.deepEqual(zombieCohortRatio(ledger, [{ slug: "a", at: "d28", zombie: true }], "2026-10"), { ratio: 0.5, zombies: 1, size: 2 });
  assert.equal(zombieCohortRatio(ledger, [{ slug: "a", at: "d28", zombie: true }, { slug: "a", at: "d28", zombie: false }], "2026-10").zombies, 0, "최신 판정 기준");
  assert.equal(numberErrors30d([{ numberError: true, today: "2026-10-01" }, { numberError: true, today: "2026-10-20" }, { numberError: true, today: "2026-08-01" }], "2026-10-25"), 2);
  const wt = fakeWorktree({ ledger: [{ slug: "a", publishedDate: "2026-10-13", cluster: "year-end-tax", primary: { url: "u", sha256: "s" }, reviewBy: "2026-12-12", status: "live" }] });
  const home = tmp("trend-decide-");
  try {
    const args = (extra) => [join(TP, "decide.mjs"), "--slug", "a", "--trend-home", home, "--worktree", wt, "--today", "2026-11-10", ...extra];
    const z = spawnSync(process.execPath, args(["--decision", "keep", "--at", "d28", "--gsc-impr", "0", "--naver-clicks", "0"]), { encoding: "utf8" });
    assert.equal(z.status, 0, z.stderr);
    assert.match(z.stdout, /좀비/);
    assert.ok(existsSync(join(home, "HALT")), "1편 코호트 전부 좀비 → HALT");
    rmSync(join(home, "HALT"));
    spawnSync(process.execPath, args(["--decision", "update", "--number-error"]), { encoding: "utf8" });
    assert.ok(!existsSync(join(home, "HALT")) || readFileSync(join(home, "HALT"), "utf8").includes("좀비"));
    if (existsSync(join(home, "HALT"))) rmSync(join(home, "HALT"));
    spawnSync(process.execPath, args(["--decision", "update", "--number-error"]), { encoding: "utf8" });
    assert.match(readFileSync(join(home, "HALT"), "utf8"), /수치 오류|좀비/);
    const lines = readFileSync(join(home, "decisions.jsonl"), "utf8").trim().split("\n");
    assert.equal(lines.length, 3);
    const pv = spawnSync(process.execPath, [join(TP, "decide.mjs"), "--pilot-verdict", "continue", "--trend-home", home], { encoding: "utf8" });
    assert.equal(pv.status, 0);
  } finally {
    cleanup(wt, home);
  }
});
