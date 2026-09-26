// scripts/trend-publish/ad-sequence.mjs — 광고 순서 게이트 (2026-09-26 R5 publisher)
//
// 사용:
//   node scripts/trend-publish/ad-sequence.mjs extract --next <.next> --pages </,/guides/x,…> --out <json>
//   node scripts/trend-publish/ad-sequence.mjs compare --base <json> --brief <json> --slug <brief slug> [--sibling <3분할 가이드 slug>]
// 프리렌더 HTML(.next/server/app/*.html)에서 광고 표식을 문서 순서대로 뽑는다 — 기존 광고 컴포넌트의 클래스·데이터 속성만 읽는다:
//   AdPlacement: class="ad-container … ad-slot-<kind>" · 쿠팡(CoupangBannerCore): data-coupang-banner-size · 제휴(AffiliateSlot): data-affiliate-offer
// compare: ① 기준 빌드(base)와 브리프 빌드의 게이트 페이지 광고 순서가 같다(브리프가 다른 페이지 광고를 바꾸지 않음)
//          ② 브리프 페이지의 광고 순서가 3분할 형제 가이드와 같다(새 템플릿·새 슬롯 없음)
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const MARKER_RE = /class="([^"]*\bad-container\b[^"]*)"|data-coupang-banner-size="([^"]*)"|data-affiliate-offer="([^"]*)"/g;

/** HTML → 광고 표식 목록 (문서 순서) */
export function extractAdMarkers(html) {
  const out = [];
  for (const m of html.matchAll(MARKER_RE)) {
    if (m[1] !== undefined) out.splice(out.length, 0, `ad:${/\bad-slot-([\w-]+)/.exec(m[1])?.[1] ?? "unknown"}`);
    else if (m[2] !== undefined) out.splice(out.length, 0, `coupang:${m[2]}`);
    else out.splice(out.length, 0, `offer:${m[3]}`);
  }
  return out;
}

export function pageFile(nextDir, route) {
  return route === "/" ? join(nextDir, "server/app/index.html") : join(nextDir, "server/app", `${route.replace(/^\//, "")}.html`);
}

export function extractPages(nextDir, routes) {
  const pages = {};
  for (const r of routes) {
    const f = pageFile(nextDir, r);
    pages[r] = existsSync(f) ? extractAdMarkers(readFileSync(f, "utf8")) : null;
  }
  return pages;
}

/** 비교 — 위반 목록(빈 배열이면 통과) */
export function compareSequences(base, brief, { slug, sibling }) {
  const errs = [];
  const briefRoute = `/guides/${slug}`;
  for (const [route, seq] of Object.entries(base)) {
    if (route === briefRoute) continue;
    const now = brief[route];
    if (seq === null) {
      errs.splice(errs.length, 0, `${route}: 기준 빌드에 프리렌더 HTML 없음`);
      continue;
    }
    if (!now) errs.splice(errs.length, 0, `${route}: 브리프 빌드에 프리렌더 HTML 없음`);
    else if (JSON.stringify(now) !== JSON.stringify(seq)) errs.splice(errs.length, 0, `${route}: 광고 순서 변경 ${JSON.stringify(seq)} → ${JSON.stringify(now)}`);
  }
  const mine = brief[briefRoute];
  if (!mine) errs.splice(errs.length, 0, `${briefRoute}: 브리프 페이지 프리렌더 HTML 없음`);
  else if (!mine.length) errs.splice(errs.length, 0, `${briefRoute}: 광고 표식 0개`);
  if (sibling) {
    const sib = brief[`/guides/${sibling}`];
    if (!sib) errs.splice(errs.length, 0, `/guides/${sibling}: 형제 가이드 프리렌더 HTML 없음`);
    else if (mine && JSON.stringify(mine) !== JSON.stringify(sib)) errs.splice(errs.length, 0, `브리프 광고 순서가 3분할 형제(${sibling})와 다름: ${JSON.stringify(mine)} ≠ ${JSON.stringify(sib)}`);
  }
  return errs;
}

function arg(argv, name) {
  const i = argv.indexOf(name);
  return i > -1 ? argv[i + 1] : undefined;
}

export function main(argv = process.argv) {
  const cmd = argv[2];
  if (cmd === "extract") {
    const nextDir = resolve(arg(argv, "--next") ?? ".next");
    const pages = (arg(argv, "--pages") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const out = arg(argv, "--out");
    if (!pages.length || !out) {
      console.error("사용: ad-sequence.mjs extract --next <dir> --pages </,…> --out <json>");
      return 2;
    }
    const res = extractPages(nextDir, pages);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, `${JSON.stringify(res, null, 2)}\n`, "utf8");
    const missing = Object.entries(res).filter(([, v]) => v === null).map(([k]) => k);
    console.log(`[ad-sequence] ${pages.length}쪽 추출${missing.length ? ` — HTML 없음: ${missing.join(", ")}` : ""}`);
    return missing.length ? 2 : 0;
  }
  if (cmd === "compare") {
    const base = JSON.parse(readFileSync(arg(argv, "--base"), "utf8"));
    const brief = JSON.parse(readFileSync(arg(argv, "--brief"), "utf8"));
    const errs = compareSequences(base, brief, { slug: arg(argv, "--slug"), sibling: arg(argv, "--sibling") });
    if (errs.length) {
      for (const e of errs) console.error(`[ad-sequence] ${e}`);
      return 1;
    }
    console.log("[ad-sequence] 광고 순서 동일 (기준 빌드·3분할 형제)");
    return 0;
  }
  console.error("사용: ad-sequence.mjs extract|compare …");
  return 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exit(main());
}
