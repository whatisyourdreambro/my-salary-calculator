import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

// next-on-pages 1.13.16 reads PROJECT ROOT _routes.json, then overwrites the
// output asset. public/_routes.json alone was ignored by the live Sep14 build.
const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
const root = read("../../_routes.json");
const publicCopy = read("../../public/_routes.json");
const publicFile = (path) => new URL(`../../public${path}`, import.meta.url);
const repoFile = (path) => new URL(`../../${path}`, import.meta.url);

// public/ 사본이 아니라 빌드(next-on-pages)가 src/app 라우트를 프리렌더해 .vercel/output/static 에 쓰는
// Worker 우회 파일. public/ 에 두면 동적 라우트가 무효화되는 함정이 있어 public 사본은 없어야 한다.
const BUILD_GENERATED = {
  "/robots.txt": "src/app/robots.ts",
  "/sitemap.xml": "src/app/sitemap.ts",
  "/rss.xml": "src/app/rss.xml/route.ts",
  "/rss-companies.xml": "src/app/rss-companies.xml/route.ts",
};

// public/_headers: 들여쓰기 없는 줄 = 경로, 들여쓴 줄 = 그 경로의 헤더.
const headerRules = (() => {
  const rules = new Map();
  let current = null;
  for (const line of readFileSync(publicFile("/_headers"), "utf8").split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    if (/^\s/.test(line)) {
      rules.get(current).push(line.trim());
    } else {
      current = line.trim();
      rules.set(current, []);
    }
  }
  return rules;
})();

test("adapter input and public routes stay in sync and within Pages limits", () => {
  assert.deepEqual(root, publicCopy);
  assert.equal(root.version, 1);
  assert.deepEqual(root.include, ["/*"]);
  assert.ok(root.include.length + root.exclude.length <= 100);
  assert.equal(new Set(root.exclude).size, root.exclude.length);
});

test("bypass public assets while retaining all HTML and API middleware behavior", () => {
  for (const asset of ["/_next/static/*", "/ads.txt", "/app-ads.txt", "/favicon.ico", "/sw.js", "/manifest.webmanifest", "/manifest.en.webmanifest",
    "/apple-touch-icon.png", "/apple-touch-icon-precomposed.png", "/robots.txt", "/sitemap.xml", "/rss.xml", "/rss-companies.xml"]) {
    assert.ok(root.exclude.includes(asset), `${asset} should bypass Worker`);
  }
  const excluded = (path) => root.exclude.some((pattern) => pattern.endsWith("*")
    ? path.startsWith(pattern.slice(0, -1)) : path === pattern);
  for (const path of ["/", "/work-clock", "/salary/50000000", "/salary/6980-manwon", "/monthly/1900000",
    "/salary-db/netmarble", "/guides/first-home-buyer-loan", "/glossary/실효세율", "/api/og", "/api/feedback", "/en/not-real", "/calc/samsung-bonus"]) {
    assert.equal(excluded(path), false, `${path} must retain Worker routing, redirects and RSC negotiation`);
  }
});

// exclude 된 경로는 Worker 를 거치지 않고 Pages 정적 자산으로만 응답한다. 파일이 없으면
// Next 404 가 아니라 Pages 기본 404(또는 SPA 폴백)로 떨어지므로, 파일 추가와 exclude 등록은 한 몸이어야 한다.
test("every exact exclude is backed by a real static file", () => {
  for (const path of root.exclude.filter((pattern) => !pattern.endsWith("*"))) {
    if (BUILD_GENERATED[path]) continue;
    assert.ok(existsSync(publicFile(path)), `${path} is excluded but public${path} is missing`);
  }
});

// 빌드 생성 파일은 프리렌더돼야 .vercel/output/static 에 실파일이 생긴다(엣지·동적 선언이면 파일이 없어 404).
// 또 미들웨어 matcher 가 원래 제외하던 경로여야 Worker 우회로 www 301·봇 403 을 잃지 않는다.
test("build-generated crawler files bypass the Worker only while they stay static and middleware-free", () => {
  const middleware = readFileSync(repoFile("src/middleware.ts"), "utf8");
  const matcherSource = middleware.match(/"(\/\(\(\?![^"]+)"/)?.[1];
  assert.ok(matcherSource, "middleware matcher pattern not found");
  const middlewareRuns = (path) => new RegExp(`^${matcherSource}$`).test(path);
  assert.equal(middlewareRuns("/"), true, "matcher sanity: HTML paths keep middleware");
  assert.equal(middlewareRuns("/salary-db/netmarble"), true, "matcher sanity: company pages keep middleware");

  for (const [path, source] of Object.entries(BUILD_GENERATED)) {
    assert.ok(root.exclude.includes(path), `${path} should bypass Worker`);
    assert.equal(existsSync(publicFile(path)), false, `public${path} would shadow the ${source} route`);
    const code = readFileSync(repoFile(source), "utf8");
    assert.doesNotMatch(code, /export\s+const\s+(runtime|dynamic|revalidate)\b/, `${source} must stay a build-time prerender`);
    assert.doesNotMatch(code, /from\s+["']next\/headers["']/, `${source} must not read request headers/cookies`);
    assert.equal(middlewareRuns(path), false, `${path} must already be excluded by the middleware matcher`);
    assert.ok(headerRules.get(path)?.some((header) => header.startsWith("Cache-Control: public, max-age=3600")),
      `${path} needs a Cache-Control rule in public/_headers`);
  }
});

test("apple-touch-icon defaults are real 180x180 PNGs with long immutable cache", () => {
  for (const path of ["/apple-touch-icon.png", "/apple-touch-icon-precomposed.png"]) {
    const png = readFileSync(publicFile(path));
    assert.equal(png.subarray(1, 4).toString("latin1"), "PNG", `${path} must be a PNG`);
    assert.equal(png.readUInt32BE(16), 180, `${path} width`);
    assert.equal(png.readUInt32BE(20), 180, `${path} height`);
    assert.deepEqual(headerRules.get(path), ["Cache-Control: public, max-age=31536000, immutable"]);
  }
});
