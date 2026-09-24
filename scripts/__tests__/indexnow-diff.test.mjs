import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  HOST,
  parseSitemapEntries,
  readSitemap,
  diffSitemapEntries,
  planSubmission,
} from "../indexnow-diff.mjs";

// 2026-09-25 B7 (SEO-CRAWL-02): postbuild IndexNow 는 변경분만 제출한다.
// 픽스처: prod-sitemap.xml = 직전 배포(운영), build-sitemap.xml = 이번 빌드.
const fixture = (name) =>
  readFileSync(new URL(`./fixtures/indexnow/${name}`, import.meta.url), "utf8");
const base = `https://${HOST}`;
const prodXml = fixture("prod-sitemap.xml");
const buildXml = fixture("build-sitemap.xml");

test("parses (loc, lastmod) pairs, decodes XML entities and drops other hosts", () => {
  const entries = parseSitemapEntries(prodXml);
  assert.equal(entries.size, 7);
  assert.equal(entries.get(`${base}/`), "2026-09-19T00:00:00.000Z");
  assert.equal(entries.has(`${base}/search?q=a&page=2`), true);
  assert.equal([...entries.keys()].some((u) => u.includes("example.com")), false);
});

test("submits only new, lastmod-changed and removed URLs", () => {
  const diff = diffSitemapEntries(parseSitemapEntries(prodXml), parseSitemapEntries(buildXml));
  assert.deepEqual(diff.added, [`${base}/calc/new-page`]);
  assert.deepEqual(diff.changed, [
    `${base}/glossary/%EA%B8%B0%ED%9A%8C%EB%B9%84%EC%9A%A9`,
    `${base}/monthly/1600000`,
  ]);
  assert.deepEqual(diff.removed, [`${base}/salary-db/listed/000000`]);
  // 같은 날짜의 형식 차이(2026-09-19 vs 2026-09-19T00:00:00.000Z)는 변경이 아니다
  assert.equal(diff.changed.includes(`${base}/`), false);
  // changefreq·priority 만 바뀐 URL 은 제출하지 않는다
  assert.equal(diff.changed.includes(`${base}/about`), false);
});

test("plan: changed set is submitted with counts; identical sitemaps submit nothing", () => {
  const build = readSitemap({ body: buildXml });
  const prod = readSitemap({ status: 200, body: prodXml });
  const plan = planSubmission(build, prod);
  assert.equal(plan.submit, true);
  assert.deepEqual(plan.counts, { added: 1, changed: 2, removed: 1, build: 7, prod: 7 });
  assert.equal(plan.urls.length, 4);
  const same = planSubmission(prod, prod);
  assert.equal(same.submit, false);
  assert.equal(same.reason, "변경 없음");
  assert.deepEqual(same.urls, []);
});

test("plan: unreadable production or build sitemap skips submission (no full-list fallback)", () => {
  const build = readSitemap({ body: buildXml });
  const unreadable = [
    readSitemap({ status: 500, body: prodXml }),
    readSitemap({ status: 403, body: "<html>forbidden</html>" }),
    readSitemap({ status: 200, body: "error code: 1102" }),
    readSitemap({ status: 200, body: "<html><title>Worker exceeded resource limits</title></html>" }),
    readSitemap({ status: 200, body: prodXml.slice(0, 500) }),
    readSitemap({ status: 200, body: "" }),
    null,
  ];
  for (const prod of unreadable) {
    if (prod) assert.equal(prod.ok, false);
    const plan = planSubmission(build, prod);
    assert.equal(plan.submit, false);
    assert.deepEqual(plan.urls, []);
  }
  assert.equal(planSubmission(readSitemap({ body: "" }), readSitemap({ body: prodXml })).submit, false);
  assert.equal(planSubmission(null, readSitemap({ body: prodXml })).submit, false);
});

test("a sitemap URL containing the digits 1102 is not mistaken for a Cloudflare 1102 page", () => {
  const r = readSitemap({ status: 200, body: prodXml });
  assert.equal(r.ok, true);
  assert.equal(r.entries.has(`${base}/salary/11020000`), true);
});

test("cap limits the submitted list", () => {
  const plan = planSubmission(readSitemap({ body: buildXml }), readSitemap({ body: prodXml }), { cap: 2 });
  assert.equal(plan.urls.length, 2);
  assert.equal(plan.counts.added + plan.counts.changed + plan.counts.removed, 4);
});

test("--selftest exits 0 and the default postbuild path outside CF production skips with exit 0", () => {
  const script = fileURLToPath(new URL("../indexnow-ping.mjs", import.meta.url));
  const self = spawnSync(process.execPath, [script, "--selftest"], { encoding: "utf8" });
  assert.equal(self.status, 0, self.stderr);
  assert.match(self.stdout, /\[indexnow\] selftest ok/);
  const env = { ...process.env };
  delete env.CF_PAGES;
  delete env.CF_PAGES_BRANCH;
  delete env.INDEXNOW_FORCE;
  const post = spawnSync(process.execPath, [script], { encoding: "utf8", env });
  assert.equal(post.status, 0);
  assert.match(post.stdout, /\[indexnow\] skip \(not CF production build\)/);
});
