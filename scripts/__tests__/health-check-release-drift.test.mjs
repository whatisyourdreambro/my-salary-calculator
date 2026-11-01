// 게시 대기 감시(B20 · P1-INFRA-03) — scripts/health-check.mjs 의 운영 커밋 대 main 비교.
// 네트워크 없음: 운영 식별(/.well-known/moneysalary-release.json)은 가짜 fetch 로, git 은 임시 저장소로 돌린다.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import {
  RELEASE_DRIFT_LIMIT_HOURS,
  checkReleaseDrift,
  classifyReleaseDrift,
  collectReleaseDrift,
  gitRunner,
  isDocsPath,
  readReleaseIdentity,
  releaseDriftEnforced,
} from "../health-check.mjs";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const RELEASE_URL = "https://www.moneysalary.com/.well-known/moneysalary-release.json";
const HOUR = 3_600_000;
const NOW = Date.parse("2026-11-09T00:00:00Z"); // 월요일 09:00 KST — 주간 점검 시각
const ago = (hours) => Math.round((NOW - hours * HOUR) / 1000);
const PROD = "a".repeat(40);
const HEAD = "b".repeat(40);
const CI_MAIN = { GITHUB_ACTIONS: "true", GITHUB_REF: "refs/heads/main" };
const FAIL_TAIL = "시간째 미게시 — Actions 'Pages · 승인 후 게시'";
const noFetch = async () => {
  throw new Error("TEST: unexpected request");
};
const noGit = () => {
  throw new Error("TEST: unexpected git");
};

function identity(commit) {
  return {
    schema: "moneysalary-native-pages-release-v1",
    schemaVersion: 1,
    mode: "production",
    adsDisabled: false,
    commit,
    branch: "codex/pages-production",
    buildId: "fixtureBuild_1",
    sourceHash: "1".repeat(64),
    lockHash: "2".repeat(64),
    publicConfigHash: "3".repeat(64),
    sitemapSha256: "4".repeat(64),
    ci: { runId: 11, jobId: 12 },
    approval: { runId: 13, actor: "whatisyourdreambro" },
  };
}

/** 운영 식별을 돌려주는 가짜 요청기 — 받은 요청을 calls 에 남긴다 */
function releaseResponder(calls, body, init = { status: 200, headers: { "content-type": "application/json; charset=utf-8" } }) {
  return async (url, request) => {
    calls.push({ url, request });
    return new Response(typeof body === "string" ? body : JSON.stringify(body), init);
  };
}

/** 커밋 시각을 고정한 임시 git 저장소. 바깥 git 환경 변수(GIT_DIR 등)는 떼어 낸다. */
function fixtureRepo(t) {
  const repo = mkdtempSync(path.join(os.tmpdir(), "msy-release-drift-"));
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  const baseEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")));
  const run = (args, env = {}) =>
    execFileSync("git", args, { cwd: repo, encoding: "utf8", env: { ...baseEnv, ...env }, stdio: ["ignore", "pipe", "pipe"] }).trim();
  run(["init", "-q"]);
  run(["config", "user.email", "t@example.com"]);
  run(["config", "user.name", "t"]);
  const at = (hoursAgo) => {
    const date = `${ago(hoursAgo)} +0000`;
    return { GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date };
  };
  const commit = (hoursAgo, message, files) => {
    for (const [file, text] of Object.entries(files)) {
      mkdirSync(path.dirname(path.join(repo, file)), { recursive: true });
      writeFileSync(path.join(repo, file), text);
    }
    run(["add", "-A"]);
    run(["commit", "-q", "-m", message], at(hoursAgo));
    return run(["rev-parse", "HEAD"]);
  };
  return { repo, run, at, commit, git: gitRunner(repo) };
}

test("isDocsPath: docs/** 와 *.md 만 문서로 뺀다", () => {
  for (const p of ["docs/ops.md", "docs/data/table.json", "docs/workers/x.mjs", "README.md", "AGENTS.md", "fonts/README.md"]) {
    assert.equal(isDocsPath(p), true, p);
  }
  for (const p of ["src/app/page.tsx", "src/docs/page.tsx", "documents/a.ts", "docs", "src/content/post.mdx", ".github/workflows/ci.yml"]) {
    assert.equal(isDocsPath(p), false, p);
  }
});

test("분류기(명세 3건): 같음 = 통과, 문서만 다름 = 통과, 48시간 넘은 사이트 변경 = 실패", () => {
  const same = classifyReleaseDrift({ prod: PROD, head: PROD, changed: [], headTime: ago(500), nowMs: NOW });
  assert.equal(same.state, "same");
  assert.equal(same.ok, true);

  const docs = classifyReleaseDrift({
    prod: PROD,
    head: HEAD,
    changed: ["docs/ops.md", "docs/data/table.json", "README.md", "src/lib/README.md"],
    headTime: ago(200),
    nowMs: NOW,
  });
  assert.equal(docs.state, "docs-only");
  assert.equal(docs.ok, true);
  assert.deepEqual(docs.paths, []);

  const stale = classifyReleaseDrift({
    prod: PROD,
    head: HEAD,
    changed: ["docs/ops.md", "src/app/page.tsx"],
    since: { sha: HEAD, time: ago(49.5) },
    headTime: ago(49.5),
    nowMs: NOW,
  });
  assert.equal(stale.state, "stale");
  assert.equal(stale.ok, false);
  assert.deepEqual(stale.paths, ["src/app/page.tsx"]);
  assert.equal(Math.floor(stale.hours), 49);
  assert.equal(stale.since, HEAD);
});

test("분류기: 48시간 이내 · 정확히 48시간은 통과, 그 뒤는 실패", () => {
  const base = { prod: PROD, head: HEAD, changed: ["src/lib/tax.ts"], nowMs: NOW };
  assert.equal(RELEASE_DRIFT_LIMIT_HOURS, 48);
  const within = classifyReleaseDrift({ ...base, since: { sha: HEAD, time: ago(47) }, headTime: ago(47) });
  assert.equal(within.state, "within");
  assert.equal(within.ok, true);
  assert.equal(classifyReleaseDrift({ ...base, since: { sha: HEAD, time: ago(48) }, headTime: ago(48) }).ok, true);
  assert.equal(classifyReleaseDrift({ ...base, since: { sha: HEAD, time: ago(48.01) }, headTime: ago(48.01) }).ok, false);
  // 시계가 어긋나 커밋 시각이 미래여도 음수 시간이 아니라 0
  assert.equal(classifyReleaseDrift({ ...base, since: { sha: HEAD, time: ago(-2) }, headTime: ago(-2) }).hours, 0);
});

test("분류기: 첫 미게시 커밋을 모르면 HEAD 시각, main 이 운영보다 뒤면 실패가 아니다, 시각 오류는 throw", () => {
  const fallback = classifyReleaseDrift({ prod: PROD, head: HEAD, changed: ["src/a.ts"], since: null, headTime: ago(60), nowMs: NOW });
  assert.equal(fallback.state, "stale");
  assert.equal(fallback.since, HEAD);
  const behind = classifyReleaseDrift({ prod: PROD, head: HEAD, changed: ["src/a.ts"], behind: true, headTime: ago(900), nowMs: NOW });
  assert.equal(behind.state, "behind");
  assert.equal(behind.ok, true);
  assert.throws(() => classifyReleaseDrift({ prod: PROD, head: HEAD, changed: ["src/a.ts"], headTime: Number.NaN, nowMs: NOW }));
});

test("수집기(실제 git): 사이트 변경 뒤에 붙은 문서 커밋이 48시간 시계를 되돌리지 않는다", (t) => {
  const { commit, git } = fixtureRepo(t);
  const prod = commit(100, "base", { "src/a.ts": "a1\n", "docs/x.md": "x1\n" });
  const site = commit(72, "site change", { "src/a.ts": "a2\n" });
  const docs = commit(1, "docs only", { "docs/y.md": "y1\n", "README.md": "r\n" });
  const input = collectReleaseDrift(prod, git);
  assert.equal(input.head, docs);
  assert.deepEqual(input.changed.sort(), ["README.md", "docs/y.md", "src/a.ts"]);
  assert.deepEqual(input.since, { sha: site, time: ago(72) });
  assert.equal(input.headTime, ago(1));
  assert.equal(input.behind, false);
  const verdict = classifyReleaseDrift({ prod, ...input, nowMs: NOW });
  assert.equal(verdict.state, "stale");
  assert.equal(Math.floor(verdict.hours), 72);
  // 같은 이력에서 운영이 사이트 변경까지 게시했다면 남은 차이는 문서뿐 → 통과
  const docsOnly = classifyReleaseDrift({ prod: site, ...collectReleaseDrift(site, git), nowMs: NOW });
  assert.equal(docsOnly.state, "docs-only");
});

test("수집기(실제 git): 오래전에 만든 브랜치 커밋이라도 병합 커밋 시각부터 센다 · 한글 경로", (t) => {
  const { run, at, commit, git } = fixtureRepo(t);
  const prod = commit(200, "base", { "src/a.ts": "a1\n" });
  const mainBranch = run(["rev-parse", "--abbrev-ref", "HEAD"]);
  run(["checkout", "-q", "-b", "feature"]);
  commit(150, "old branch work", { "src/한글.ts": "k1\n" });
  run(["checkout", "-q", mainBranch]);
  run(["merge", "-q", "--no-ff", "-m", "merge feature", "feature"], at(10));
  const merge = run(["rev-parse", "HEAD"]);
  const input = collectReleaseDrift(prod, git);
  assert.deepEqual(input.changed, ["src/한글.ts"]);
  assert.deepEqual(input.since, { sha: merge, time: ago(10) });
  const verdict = classifyReleaseDrift({ prod, ...input, nowMs: NOW });
  assert.equal(verdict.state, "within");
  assert.equal(verdict.ok, true);
});

test("수집기(실제 git): main 이 운영보다 뒤면 behind, 운영 커밋이 clone 에 없으면 throw", (t) => {
  const { run, commit, git } = fixtureRepo(t);
  const old = commit(100, "base", { "src/a.ts": "a1\n" });
  const newer = commit(80, "site change", { "src/a.ts": "a2\n" });
  run(["checkout", "-q", old]);
  const behind = collectReleaseDrift(newer, git);
  assert.equal(behind.behind, true);
  assert.equal(behind.since, null);
  assert.equal(classifyReleaseDrift({ prod: newer, ...behind, nowMs: NOW }).state, "behind");
  assert.throws(() => collectReleaseDrift("c".repeat(40), git));
  assert.throws(() => collectReleaseDrift("not-a-sha", noGit), /형식/);
});

test("운영 식별 읽기: 쿼리 없는 정확한 URL 에 비렌더링 GET 1회, QA UA, 리다이렉트 수동", async () => {
  const calls = [];
  const result = await readReleaseIdentity(releaseResponder(calls, identity(PROD)));
  assert.equal(result.value.commit, PROD);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, RELEASE_URL);
  assert.equal(calls[0].request.method, "GET");
  assert.equal(calls[0].request.redirect, "manual");
  assert.equal(calls[0].request.credentials, "omit");
  assert.match(calls[0].request.headers.get("user-agent"), /MoneySalary-QA\/1\.0/);
});

test("운영 식별 읽기: 404 · 리다이렉트 · 형식 오류 · 과대 응답은 { error } (리다이렉트는 따라가지 않음)", async () => {
  const calls = [];
  const missing = await readReleaseIdentity(releaseResponder(calls, "", { status: 404 }));
  assert.match(missing.error, /status=404/);
  const moved = await readReleaseIdentity(
    releaseResponder(calls, "", { status: 301, headers: { location: "https://example.invalid/release.json" } }),
  );
  assert.match(moved.error, /status=301 Location=https:\/\/example\.invalid/);
  const forged = await readReleaseIdentity(releaseResponder(calls, { ...identity(PROD), adsDisabled: true }));
  assert.match(forged.error, /Invalid native Pages release identity/);
  const broken = await readReleaseIdentity(releaseResponder(calls, "{not json"));
  assert.ok(broken.error);
  const huge = await readReleaseIdentity(releaseResponder(calls, "x".repeat(20000)));
  assert.match(huge.error, /너무 큼/);
  assert.equal(calls.length, 5);
  assert.ok(calls.every(({ url }) => url === RELEASE_URL));
});

test("판정 범위: GitHub Actions 의 refs/heads/main 실행에서만 FAIL 을 낸다", () => {
  assert.equal(releaseDriftEnforced(CI_MAIN), true);
  assert.equal(releaseDriftEnforced({}), false);
  assert.equal(releaseDriftEnforced({ GITHUB_ACTIONS: "true", GITHUB_REF: "refs/heads/feature" }), false);
  assert.equal(releaseDriftEnforced({ GITHUB_REF: "refs/heads/main" }), false);
});

test("점검: 로컬 실행은 운영 커밋 INFO 한 줄만 — git 을 부르지 않고 집계에도 넣지 않는다", async () => {
  const calls = [];
  const result = await checkReleaseDrift({ fetchFn: releaseResponder(calls, identity(PROD)), git: noGit, env: {}, nowMs: NOW });
  assert.equal(result.judged, false);
  assert.equal(result.ok, true);
  assert.equal(result.lines.length, 1);
  assert.match(result.lines[0], /^INFO {2}운영 게시 커밋 aaaaaaa /);
  assert.equal(calls.length, 1);
});

test("점검: CI main 에서 48시간 넘게 미게시면 명세 문구로 FAIL, 다음 줄에 게시할 커밋", async (t) => {
  const { commit, git } = fixtureRepo(t);
  const prod = commit(120, "base", { "src/a.ts": "a1\n" });
  commit(52.5, "site change", { "src/a.ts": "a2\n", "docs/n.md": "n\n" });
  const head = commit(3, "docs only", { "docs/m.md": "m\n" });
  const result = await checkReleaseDrift({ fetchFn: releaseResponder([], identity(prod)), git, env: CI_MAIN, nowMs: NOW });
  assert.equal(result.judged, true);
  assert.equal(result.ok, false);
  assert.equal(result.lines[0], `FAIL 게시 대기: main ${head.slice(0, 7)} 이 52${FAIL_TAIL}`);
  assert.match(result.lines[1], /^INFO {2}운영 커밋 /);
  assert.ok(result.lines[1].includes(`approved_commit=${head}`));
  assert.ok(result.lines[1].includes("문서 제외 변경 파일 1개"));
});

test("점검: CI main 에서 같음 · 문서만 다름 · 48시간 이내는 PASS 1건", async (t) => {
  const { commit, git } = fixtureRepo(t);
  const prod = commit(300, "base", { "src/a.ts": "a1\n" });
  const same = await checkReleaseDrift({ fetchFn: releaseResponder([], identity(prod)), git, env: CI_MAIN, nowMs: NOW });
  assert.deepEqual([same.judged, same.ok], [true, true]);
  assert.match(same.lines[0], /^PASS {2}게시 대기 없음 — 운영 커밋 = main /);
  commit(200, "docs", { "docs/a.md": "a\n" });
  const docs = await checkReleaseDrift({ fetchFn: releaseResponder([], identity(prod)), git, env: CI_MAIN, nowMs: NOW });
  assert.deepEqual([docs.judged, docs.ok], [true, true]);
  assert.match(docs.lines[0], /차이는 문서/);
  commit(5, "fresh site change", { "src/a.ts": "a2\n" });
  const fresh = await checkReleaseDrift({ fetchFn: releaseResponder([], identity(prod)), git, env: CI_MAIN, nowMs: NOW });
  assert.deepEqual([fresh.judged, fresh.ok], [true, true]);
  assert.match(fresh.lines[0], /^PASS {2}게시 대기 5시간\(48시간 이내\)/);
});

test("점검: 식별 파일을 못 읽거나 git 비교가 안 되면 WARN 만 — 새 실패 조건을 만들지 않는다", async () => {
  const unreachable = await checkReleaseDrift({ fetchFn: noFetch, git: noGit, env: CI_MAIN, nowMs: NOW });
  assert.deepEqual([unreachable.judged, unreachable.ok], [false, true]);
  assert.match(unreachable.lines[0], /^WARN {2}게시 대기 점검 생략 — 운영 게시 식별/);
  const shallow = await checkReleaseDrift({
    fetchFn: releaseResponder([], identity(PROD)),
    git: () => {
      throw new Error("fatal: bad object\nsecond line");
    },
    env: CI_MAIN,
    nowMs: NOW,
  });
  assert.deepEqual([shallow.judged, shallow.ok], [false, true]);
  assert.equal(shallow.lines[0], "WARN  게시 대기 점검 생략 — 운영 커밋 aaaaaaa 을 main 이력과 비교하지 못함: fatal: bad object");
});

test("ci.yml health: 전체 이력 체크아웃(fetch-depth 0)으로 health-check 를 돌린다", () => {
  const workflow = parse(readFileSync(path.join(REPO, ".github/workflows/ci.yml"), "utf8"));
  const steps = workflow.jobs.health.steps;
  const checkout = steps.find((step) => String(step.uses || "").startsWith("actions/checkout@"));
  assert.equal(checkout?.with?.["fetch-depth"], 0);
  assert.ok(steps.some((step) => String(step.run || "").includes("node scripts/health-check.mjs")));
});

test("health-check.mjs 는 npm 설치 없이 돈다 — node: 내장과 저장소 상대 경로만 가져온다", () => {
  const source = readFileSync(path.join(REPO, "scripts/health-check.mjs"), "utf8");
  const specifiers = [...source.matchAll(/^import\s[^;]*?from\s+"([^"]+)";/gms)].map((m) => m[1]);
  assert.ok(specifiers.includes("../cloudflare/pages-native-release.mjs"));
  for (const specifier of specifiers) assert.match(specifier, /^(?:node:|\.\.?\/)/, specifier);
  const release = readFileSync(path.join(REPO, "cloudflare/pages-native-release.mjs"), "utf8");
  assert.doesNotMatch(release, /^\s*import\s/m);
});
