// scripts/trend-publish/verify-prod.mjs — 발행 후 운영 확인 (2026-09-26 R5 publisher)
//
// 사용: node scripts/trend-publish/verify-prod.mjs --slug <slug> --marker <제목> [--origin https://www.moneysalary.com]
//        [--trend-home <dir>] [--timeout-min 45] [--interval-sec 60]
// 1) /guides/<slug> 를 60초마다(최대 45분) 받아 200 + 제목 표식이 보일 때까지 기다린다(CF Pages 빌드 10~25분).
// 2) /rss.xml · /sitemap.xml 에 새 URL 이 있는지 확인.
// 3) 낡은 청크 감지: /, /calc/samsung-bonus, /guides/nurse-salary HTML 이 가리키는 /_next/static 자산을 최대 40건 GET —
//    404 가 하나라도 있으면 'Purge 필요'. TREND_HOME/CF_PURGE_OK(자동 Purge 설정 확인됨)가 있으면 15분 뒤 한 번 더 확인.
// UA 는 브라우저 문자열 — curl 기본 UA 는 CF 가 403 을 준다. 로그인·폼 없음, 공개 페이지 GET 만.
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

/** HTML 이 가리키는 /_next/static 자산 경로 (중복 제거, 문서 순서) */
export function extractAssets(html) {
  const out = [];
  for (const m of html.matchAll(/(?:src|href)="(\/_next\/static\/[^"?#]+)"/g)) if (!out.includes(m[1])) out.splice(out.length, 0, m[1]);
  return out;
}

async function get(fetchFn, url) {
  try {
    const res = await fetchFn(url, { headers: { "user-agent": UA, "cache-control": "no-cache" }, redirect: "follow" });
    const text = await res.text();
    return { status: res.status, text };
  } catch (e) {
    return { status: 0, text: String(e?.message ?? e) };
  }
}

/** 페이지가 200 + 표식을 보일 때까지 폴링 */
export async function pollPage({ fetchFn, sleep, url, marker, timeoutMs, intervalMs, now = () => Date.now() }) {
  const start = now();
  let tries = 0;
  let last = { status: 0, text: "" };
  for (;;) {
    tries++;
    last = await get(fetchFn, url);
    if (last.status === 200 && last.text.includes(marker)) return { ok: true, tries, status: 200 };
    if (now() - start + intervalMs > timeoutMs) return { ok: false, tries, status: last.status };
    await sleep(intervalMs);
  }
}

/** 낡은 청크 감지 — 자산 GET 최대 maxGets 건, 404 목록 */
export async function staleChunkCheck({ fetchFn, origin, pages, maxGets = 40 }) {
  const missing = [];
  let gets = 0;
  for (const page of pages) {
    const res = await get(fetchFn, `${origin}${page}`);
    if (res.status !== 200) {
      missing.splice(missing.length, 0, `${page} (페이지 HTTP ${res.status})`);
      continue;
    }
    for (const asset of extractAssets(res.text)) {
      if (gets >= maxGets) break;
      gets++;
      const a = await get(fetchFn, `${origin}${asset}`);
      if (a.status === 404) missing.splice(missing.length, 0, asset);
    }
  }
  return { gets, missing };
}

export async function run(opts, deps = {}) {
  const fetchFn = deps.fetchFn ?? globalThis.fetch;
  const sleep = deps.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
  const log = deps.log ?? console.log;
  const origin = opts.origin ?? "https://www.moneysalary.com";
  const lines = [];
  const url = `${origin}/guides/${opts.slug}`;
  const page = await pollPage({ fetchFn, sleep, url, marker: opts.marker, timeoutMs: (opts.timeoutMin ?? 45) * 60_000, intervalMs: (opts.intervalSec ?? 60) * 1000, now: deps.now });
  lines.splice(lines.length, 0, page.ok ? `✔ 새 글 응답 200 + 제목 확인 (${page.tries}회째)` : `✖ ${opts.timeoutMin ?? 45}분 안에 새 글이 보이지 않음 (마지막 HTTP ${page.status}) — CF Pages 빌드 로그 확인`);
  let ok = page.ok;
  for (const feed of ["/rss.xml", "/sitemap.xml"]) {
    const r = await get(fetchFn, `${origin}${feed}`);
    const has = r.status === 200 && r.text.includes(`/guides/${opts.slug}`);
    lines.splice(lines.length, 0, has ? `✔ ${feed} 에 새 URL 있음` : `✖ ${feed} 에 새 URL 없음 (HTTP ${r.status}) — 캐시 만료(최대 1시간) 뒤 다시 확인`);
    ok = ok && has;
  }
  const pages = opts.pages ?? ["/", "/calc/samsung-bonus", "/guides/nurse-salary"];
  let stale = await staleChunkCheck({ fetchFn, origin, pages, maxGets: opts.maxGets ?? 40 });
  if (stale.missing.length && opts.purgeAuto) {
    lines.splice(lines.length, 0, `… 자산 404 ${stale.missing.length}건 — 자동 Purge(A35) 설정 확인됨, ${opts.purgeRecheckMin ?? 15}분 뒤 재확인`);
    await sleep((opts.purgeRecheckMin ?? 15) * 60_000);
    stale = await staleChunkCheck({ fetchFn, origin, pages, maxGets: opts.maxGets ?? 40 });
  }
  if (stale.missing.length) {
    ok = false;
    lines.splice(lines.length, 0, `✖ Purge 필요 — 낡은 HTML 이 없는 청크를 가리킴 (${stale.missing.slice(0, 5).join(", ")}${stale.missing.length > 5 ? " …" : ""}). CF 대시보드 > 캐싱 > 구성 > Purge Everything`);
  } else lines.splice(lines.length, 0, `✔ 낡은 청크 없음 (자산 ${stale.gets}건 확인)`);
  const summary = [`[verify-prod] ${opts.slug}`, ...lines, ok ? "결과: 정상 반영" : "결과: 확인 필요 — 위 ✖ 항목"].join("\n");
  log(summary);
  return { ok, summary, stale };
}

function arg(argv, name) {
  const i = argv.indexOf(name);
  return i > -1 ? argv[i + 1] : undefined;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const argv = process.argv;
  const slug = arg(argv, "--slug");
  const marker = arg(argv, "--marker");
  if (!slug || !marker) {
    console.error("사용: verify-prod.mjs --slug <slug> --marker <제목> [--origin …] [--trend-home …]");
    process.exit(2);
  }
  const trendHome = arg(argv, "--trend-home") ?? process.env.TREND_HOME;
  run({
    slug,
    marker,
    origin: arg(argv, "--origin"),
    timeoutMin: Number(arg(argv, "--timeout-min") ?? 45),
    intervalSec: Number(arg(argv, "--interval-sec") ?? 60),
    purgeAuto: Boolean(trendHome && existsSync(join(trendHome, "CF_PURGE_OK"))),
  }).then((r) => process.exit(r.ok ? 0 : 1));
}
