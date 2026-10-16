import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { classifyDeployments, commitMatches, isFatalApiError, main } from "../cf-purge-after-deploy.mjs";

// 배포 후 CF 캐시 자동 Purge(승인 A35) — 판정 함수와 main() 흐름을 fetch 스텁으로 검증한다(네트워크 없음).
const SHA = "4d80ce3ef00efac6702a02d450352da9f73f009c";
const OTHER = "e801fd1c15633076f5ace87e7e482408fcb62e2d";

const dep = (commit, name, status, extra = {}) => ({
  id: `id-${commit.slice(0, 6)}-${name}-${status}`,
  short_id: commit.slice(0, 8),
  environment: "production",
  created_on: "2026-09-25T01:00:00.000Z",
  latest_stage: { name, status },
  deployment_trigger: { type: "github:push", metadata: { branch: "main", commit_hash: commit } },
  is_skipped: false,
  ...extra,
});

test("commitMatches: 전체·축약 SHA 접두 일치, 대소문자 무시, 7자 미만·0 SHA 거부", () => {
  assert.equal(commitMatches(SHA, SHA), true);
  assert.equal(commitMatches(SHA.slice(0, 7), SHA), true);
  assert.equal(commitMatches(SHA.toUpperCase(), SHA), true);
  assert.equal(commitMatches(OTHER, SHA), false);
  assert.equal(commitMatches(SHA.slice(0, 6), SHA), false);
  assert.equal(commitMatches("0".repeat(40), "0".repeat(40)), false);
  assert.equal(commitMatches(undefined, SHA), false);
});

test("classifyDeployments: 이 커밋 production 배포 상태 판정", () => {
  assert.equal(classifyDeployments([], SHA).state, "pending");
  assert.equal(classifyDeployments(null, SHA).state, "pending");
  assert.equal(classifyDeployments([dep(SHA, "build", "active")], SHA).state, "pending");
  assert.equal(classifyDeployments([dep(SHA, "deploy", "success")], SHA).state, "success");
  assert.equal(classifyDeployments([dep(SHA, "build", "failure")], SHA).state, "failed");
  assert.equal(classifyDeployments([dep(SHA, "build", "canceled")], SHA).state, "canceled");
  assert.equal(classifyDeployments([dep(SHA, "queued", "idle", { is_skipped: true })], SHA).state, "skipped");
  // preview 배포는 무시
  assert.equal(classifyDeployments([dep(SHA, "deploy", "success", { environment: "preview" })], SHA).state, "pending");
  // 재시도: 같은 커밋의 옛 실패 + 새 성공 → success
  const retried = [
    dep(SHA, "build", "failure", { created_on: "2026-09-25T01:00:00Z" }),
    dep(SHA, "deploy", "success", { created_on: "2026-09-25T01:10:00Z" }),
  ];
  assert.equal(classifyDeployments(retried, SHA).state, "success");
  // 재시도 진행 중: 최신 시도가 active 면 옛 실패로 끊지 않고 pending
  const retrying = [
    dep(SHA, "build", "failure", { created_on: "2026-09-25T01:00:00Z" }),
    dep(SHA, "build", "active", { created_on: "2026-09-25T01:10:00Z" }),
  ];
  assert.equal(classifyDeployments(retrying, SHA).state, "pending");
});

test("classifyDeployments: 이 커밋 배포가 없고 작업 시작 뒤 다른 커밋 배포가 성공하면 superseded", () => {
  const since = Date.parse("2026-09-25T01:05:00Z");
  const before = dep(OTHER, "deploy", "success", { created_on: "2026-09-25T01:00:00Z" });
  const after = dep(OTHER, "deploy", "success", { created_on: "2026-09-25T01:20:00Z" });
  assert.equal(classifyDeployments([before], SHA, since).state, "pending");
  assert.equal(classifyDeployments([after], SHA, since).state, "superseded");
  // sinceMs 미지정이면 대체 판정 안 함
  assert.equal(classifyDeployments([after], SHA).state, "pending");
  // 이 커밋 배포가 있으면 대체 판정보다 우선
  assert.equal(classifyDeployments([after, dep(SHA, "build", "active")], SHA, since).state, "pending");
});

test("isFatalApiError: 인증·권한·프로젝트 오류만 즉시 실패", () => {
  assert.equal(isFatalApiError(401, null), true);
  assert.equal(isFatalApiError(403, null), true);
  assert.equal(isFatalApiError(404, null), true);
  assert.equal(isFatalApiError(400, { errors: [{ code: 10000 }] }), true);
  assert.equal(isFatalApiError(400, { errors: [{ code: 8000007 }] }), true);
  assert.equal(isFatalApiError(500, { errors: [{ code: 10013 }] }), false);
  assert.equal(isFatalApiError(429, null), false);
});

// ---------- main() 흐름 (fetch·console 스텁) ----------
let realFetch;
let realLog;
let logs;
let calls;
beforeEach(() => {
  realFetch = globalThis.fetch;
  realLog = console.log;
  logs = [];
  calls = [];
  console.log = (...a) => logs.push(a.join(" "));
});
afterEach(() => {
  globalThis.fetch = realFetch;
  console.log = realLog;
});

const ENV = {
  CF_API_TOKEN: "test-token-not-real",
  CF_ACCOUNT_ID: "acct123",
  CF_ZONE_ID: "zone456",
  GITHUB_SHA: SHA,
  CF_PURGE_POLL_SECONDS: "0",
  CF_PURGE_SETTLE_SECONDS: "0",
  CF_PURGE_TIMEOUT_MINUTES: "1",
};
const json = (status, body) => ({ status, json: async () => body });
const stubFetch = (listResponses, purgeResponse = json(200, { success: true, result: { id: "p1" } })) => {
  let n = 0;
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (String(url).includes("/purge_cache")) return purgeResponse;
    const r = listResponses[Math.min(n, listResponses.length - 1)];
    n++;
    return r;
  };
};

test("main: 시크릿이 하나라도 없으면 notice 후 0, 네트워크 호출 없음", async () => {
  stubFetch([json(200, { success: true, result: [] })]);
  for (const k of ["CF_API_TOKEN", "CF_ACCOUNT_ID", "CF_ZONE_ID"]) {
    const env = { ...ENV, [k]: "" };
    assert.equal(await main(env), 0);
  }
  assert.equal(calls.length, 0);
  assert.ok(logs.every((l) => l.startsWith("::notice::")));
  assert.ok(logs.every((l) => !l.includes("test-token-not-real")));
});

test("main: 대기 → 배포 성공 → Purge Everything 1회, 0 반환", async () => {
  stubFetch([
    json(200, { success: true, result: [dep(OTHER, "deploy", "success", { created_on: "2020-01-01T00:00:00Z" })] }),
    json(200, { success: true, result: [dep(SHA, "build", "active")] }),
    json(200, { success: true, result: [dep(SHA, "deploy", "success")] }),
  ]);
  assert.equal(await main(ENV), 0);
  const list = calls.filter((c) => c.url.includes("/deployments"));
  const purge = calls.filter((c) => c.url.includes("/purge_cache"));
  assert.equal(list.length, 3);
  assert.ok(list[0].url.includes("/accounts/acct123/pages/projects/my-salary-calculator/deployments?env=production"));
  assert.equal(purge.length, 1);
  assert.ok(purge[0].url.endsWith("/zones/zone456/purge_cache"));
  assert.equal(purge[0].init.method, "POST");
  assert.deepEqual(JSON.parse(purge[0].init.body), { purge_everything: true });
  assert.equal(purge[0].init.headers.Authorization, "Bearer test-token-not-real");
  assert.ok(logs.every((l) => !l.includes("test-token-not-real")), "토큰은 로그에 찍히지 않아야 한다");
});

test("main: 배포 실패면 Purge 없이 1", async () => {
  stubFetch([json(200, { success: true, result: [dep(SHA, "build", "failure")] })]);
  assert.equal(await main(ENV), 1);
  assert.equal(calls.filter((c) => c.url.includes("/purge_cache")).length, 0);
  assert.ok(logs.some((l) => l.startsWith("::error::")));
});

test("main: 응답이 멈춘 요청도 중단되어 전체 대기 제한이 끝나고 Purge 하지 않음", async () => {
  const realTimeout = AbortSignal.timeout;
  let timer;
  try {
    AbortSignal.timeout = (ms) => {
      assert.equal(ms, 15000);
      const controller = new AbortController();
      timer = setTimeout(() => controller.abort(new Error("simulated request timeout")), 5);
      return controller.signal;
    };
    globalThis.fetch = (url, init) => {
      calls.push({ url: String(url), init });
      assert.equal(init.redirect, "error");
      assert.ok(init.signal instanceof AbortSignal);
      return new Promise((_, reject) => {
        init.signal.addEventListener("abort", () => reject(init.signal.reason), { once: true });
      });
    };
    assert.equal(await main({ ...ENV, CF_PURGE_TIMEOUT_MINUTES: "0.000001" }), 1);
    assert.equal(calls.length, 1);
    assert.ok(calls.every((c) => !c.url.includes("/purge_cache")));
    assert.ok(logs.some((l) => l.includes("simulated request timeout")));
    assert.ok(logs.every((l) => !l.includes(ENV.CF_API_TOKEN)));
  } finally {
    clearTimeout(timer);
    AbortSignal.timeout = realTimeout;
  }
});

test("main: CF 가 건너뛴 배포면 Purge 없이 0", async () => {
  stubFetch([json(200, { success: true, result: [dep(SHA, "queued", "idle", { is_skipped: true })] })]);
  assert.equal(await main(ENV), 0);
  assert.equal(calls.filter((c) => c.url.includes("/purge_cache")).length, 0);
});

test("main: 토큰 권한 오류(403)는 즉시 1", async () => {
  stubFetch([json(403, { success: false, errors: [{ code: 10000, message: "Authentication error" }] })]);
  assert.equal(await main(ENV), 1);
  assert.equal(calls.length, 1);
});

test("main: 일시 오류(500)는 재시도하고 시간 초과면 1", async () => {
  stubFetch([json(500, { success: false, errors: [{ code: 10013, message: "internal" }] })]);
  assert.equal(await main({ ...ENV, CF_PURGE_TIMEOUT_MINUTES: "0.0002" }), 1);
  assert.ok(calls.length >= 1);
  assert.equal(calls.filter((c) => c.url.includes("/purge_cache")).length, 0);
  assert.ok(logs.some((l) => l.startsWith("::error::") && l.includes("수동 Purge")));
});

test("main: Purge 권한 거부면 1", async () => {
  stubFetch(
    [json(200, { success: true, result: [dep(SHA, "deploy", "success")] })],
    json(403, { success: false, errors: [{ code: 10000, message: "Authentication error" }] })
  );
  assert.equal(await main(ENV), 1);
  assert.equal(calls.filter((c) => c.url.includes("/purge_cache")).length, 1);
});

const VERSION = '11111111-2222-3333-4444-555555555555';
const WORKER_ENV = {
  ...ENV, CF_DEPLOY_TARGET: 'workers', CF_ACCOUNT_ID: 'a'.repeat(32), CF_ZONE_ID: 'b'.repeat(32),
  CF_WORKER_NAME: 'test-worker', CF_RELEASE_TAG: 'release-test', CF_EXPECTED_VERSION_ID: VERSION,
};
const workerDeployment = (id = 'd1') => ({ id, strategy: 'percentage', versions: [{ version_id: VERSION, percentage: 100 }] });
const stubWorker = ({ tag = 'release-test', changeAfter = Infinity, status = 200 } = {}) => {
  let lists = 0;
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url, init });
    if (url.includes('/purge_cache')) return json(status, { success: status === 200 });
    if (url.endsWith('/deployments')) return json(200, { success: true, result: { deployments: [workerDeployment(++lists > changeAfter ? 'd2' : 'd1')] } });
    return json(200, { success: true, result: { id: VERSION, annotations: { 'workers/tag': tag } } });
  };
};

test('Workers main verifies release both before and after settle, then purges once', async () => {
  stubWorker();
  assert.equal(await main(WORKER_ENV), 0);
  assert.equal(calls.filter((call) => call.url.includes('/purge_cache')).length, 1);
  assert.equal(calls.filter((call) => call.url.endsWith('/deployments')).length, 4);
  assert.equal(calls.filter((call) => call.url.includes('/versions/')).length, 2);
  assert.ok(calls.every((call) => !call.url.includes('/pages/')));
  assert.ok(logs.every((line) => !line.includes(ENV.CF_API_TOKEN)));
});

test('Workers wrong release, deployment changed after settle, missing config and unknown mode never purge', async () => {
  for (const options of [{ tag: 'wrong' }, { changeAfter: 2 }]) {
    calls = [];
    stubWorker(options);
    assert.equal(await main({ ...WORKER_ENV, CF_PURGE_TIMEOUT_MINUTES: '0' }), 1);
    assert.equal(calls.filter((call) => call.url.includes('/purge_cache')).length, 0);
  }
  calls = [];
  assert.equal(await main({ ...WORKER_ENV, CF_WORKER_NAME: '' }), 1);
  assert.equal(await main({ ...WORKER_ENV, CF_DEPLOY_TARGET: 'worker-typo' }), 1);
  assert.equal(calls.length, 0);
});

test('Workers purge permission failure stops without repeated POST', async () => {
  stubWorker({ status: 403 });
  assert.equal(await main(WORKER_ENV), 1);
  assert.equal(calls.filter((call) => call.url.includes('/purge_cache')).length, 1);
});
