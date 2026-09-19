import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// next-on-pages 1.13.16 reads PROJECT ROOT _routes.json, then overwrites the
// output asset. public/_routes.json alone was ignored by the live Sep14 build.
const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
const root = read("../../_routes.json");
const publicCopy = read("../../public/_routes.json");

test("adapter input and public routes stay in sync and within Pages limits", () => {
  assert.deepEqual(root, publicCopy);
  assert.equal(root.version, 1);
  assert.deepEqual(root.include, ["/*"]);
  assert.ok(root.include.length + root.exclude.length <= 100);
  assert.equal(new Set(root.exclude).size, root.exclude.length);
});

test("bypass public assets while retaining all HTML and API middleware behavior", () => {
  for (const asset of ["/_next/static/*", "/ads.txt", "/app-ads.txt", "/favicon.ico", "/sw.js", "/manifest.webmanifest", "/manifest.en.webmanifest"]) {
    assert.ok(root.exclude.includes(asset), `${asset} should bypass Worker`);
  }
  const excluded = (path) => root.exclude.some((pattern) => pattern.endsWith("*")
    ? path.startsWith(pattern.slice(0, -1)) : path === pattern);
  for (const path of ["/", "/work-clock", "/salary/50000000", "/salary/6980-manwon", "/monthly/1900000",
    "/salary-db/netmarble", "/guides/first-home-buyer-loan", "/glossary/실효세율", "/api/og", "/api/feedback", "/en/not-real", "/calc/samsung-bonus"]) {
    assert.equal(excluded(path), false, `${path} must retain Worker routing, redirects and RSC negotiation`);
  }
});
