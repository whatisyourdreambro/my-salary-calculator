import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  INDEXNOW_ENDPOINT,
  NAVER_INDEXNOW_ENDPOINT,
  submitIndexNow,
} from "../indexnow-submit.mjs";

// 2026-09-26 NAVER-03a: postbuild IndexNow 는 api.indexnow.org 에 이어 네이버 IndexNow 에도 같은
// payload 를 직접 POST 한다. 네트워크 없이 fetch 스텁으로 검증한다.
const payload = {
  host: "www.moneysalary.com",
  key: "0123456789abcdef0123456789abcdef",
  keyLocation: "https://www.moneysalary.com/0123456789abcdef0123456789abcdef.txt",
  urlList: [
    "https://www.moneysalary.com/salary-db/samsung-electronics",
    "https://www.moneysalary.com/guides/salary-guide-2026",
  ],
};

/** 호출을 기록하는 fetch 스텁 — respond(url) 가 Response 비슷한 값을 돌려주거나 throw 한다 */
function stubFetch(respond) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return respond(url);
  };
  return { calls, fetchImpl };
}

function collectLog() {
  const lines = [];
  return { lines, log: (line) => lines.push(line) };
}

test("naver endpoint is the one in the Search Advisor IndexNow guide", () => {
  assert.equal(INDEXNOW_ENDPOINT, "https://api.indexnow.org/indexnow");
  assert.equal(NAVER_INDEXNOW_ENDPOINT, "https://searchadvisor.naver.com/indexnow");
});

test("posts the identical payload to api.indexnow.org first, then to Naver", async () => {
  const { calls, fetchImpl } = stubFetch(() => ({ status: 200 }));
  const { lines, log } = collectLog();
  const results = await submitIndexNow(payload, { fetchImpl, log, userAgent: "UA/1" });

  assert.deepEqual(calls.map((c) => c.url), [INDEXNOW_ENDPOINT, NAVER_INDEXNOW_ENDPOINT]);
  for (const { init } of calls) {
    assert.equal(init.method, "POST");
    assert.equal(init.headers["content-type"], "application/json; charset=utf-8");
    assert.equal(init.headers["user-agent"], "UA/1");
    assert.deepEqual(JSON.parse(init.body), payload);
  }
  assert.equal(calls[0].init.body, calls[1].init.body, "두 엔드포인트 본문이 바이트까지 같아야 함");
  assert.deepEqual(
    results.map(({ name, status, ok }) => ({ name, status, ok })),
    [
      { name: "indexnow", status: 200, ok: true },
      { name: "naver", status: 200, ok: true },
    ],
  );
  assert.deepEqual(lines, [
    "[indexnow] submitted 2 changed urls → HTTP 200",
    "[indexnow] naver 200",
  ]);
});

test("a Naver error or non-2xx is non-fatal and logged", async () => {
  for (const [respond, expected] of [
    [
      (url) => {
        if (url === NAVER_INDEXNOW_ENDPOINT) throw new Error("ECONNRESET");
        return { status: 202 };
      },
      "[indexnow] naver error (non-fatal): ECONNRESET",
    ],
    [(url) => ({ status: url === NAVER_INDEXNOW_ENDPOINT ? 429 : 202 }), "[indexnow] naver 429 (non-2xx, non-fatal)"],
  ]) {
    const { calls, fetchImpl } = stubFetch(respond);
    const { lines, log } = collectLog();
    const results = await submitIndexNow(payload, { fetchImpl, log });
    assert.equal(calls.length, 2);
    assert.equal(lines[0], "[indexnow] submitted 2 changed urls → HTTP 202");
    assert.equal(lines[1], expected);
    assert.equal(results[1].ok, false);
  }
});

test("a shared-endpoint failure does not stop the Naver POST", async () => {
  const { calls, fetchImpl } = stubFetch((url) => {
    if (url === INDEXNOW_ENDPOINT) throw new Error("timeout");
    return { status: 200 };
  });
  const { lines, log } = collectLog();
  const results = await submitIndexNow(payload, { fetchImpl, log });
  assert.deepEqual(calls.map((c) => c.url), [INDEXNOW_ENDPOINT, NAVER_INDEXNOW_ENDPOINT]);
  assert.deepEqual(lines, ["[indexnow] error (non-fatal): timeout", "[indexnow] naver 200"]);
  assert.deepEqual(results.map((r) => r.ok), [false, true]);
});

test("an empty urlList posts nothing", async () => {
  for (const urlList of [[], undefined]) {
    const { calls, fetchImpl } = stubFetch(() => ({ status: 200 }));
    const { lines, log } = collectLog();
    const results = await submitIndexNow({ ...payload, urlList }, { fetchImpl, log });
    assert.equal(calls.length, 0);
    assert.deepEqual(results, []);
    assert.match(lines[0], /^\[indexnow\] skip/);
  }
});

test("indexnow-ping.mjs submits through submitIndexNow (no second, unguarded fetch)", () => {
  const src = readFileSync(new URL("../indexnow-ping.mjs", import.meta.url), "utf8");
  assert.match(src, /import \{ submitIndexNow \} from "\.\/indexnow-submit\.mjs";/);
  assert.match(src, /await submitIndexNow\(/);
  assert.doesNotMatch(src, /api\.indexnow\.org\/indexnow"/);
  assert.doesNotMatch(src, /method: "POST"/);
});
