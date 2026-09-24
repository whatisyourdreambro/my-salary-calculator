// IndexNow 제출 대상 계산 — 순수 함수 모듈 (2026-09-25 B7, SEO-CRAWL-02).
//
// scripts/indexnow-ping.mjs(postbuild)가 쓰고, scripts/__tests__/indexnow-diff.test.mjs 와
// `node scripts/indexnow-ping.mjs --selftest` 가 검증한다. 네트워크·파일 I/O 없음.
//
// 규칙: 빌드 사이트맵(이번 배포)과 운영 사이트맵(직전 배포)의 (loc, lastmod) 쌍을 비교해
//   - 신규 URL(빌드에만 있음)
//   - lastmod 가 바뀐 URL
//   - 사라진 URL(운영에만 있음 — 엔진이 404/308 을 보고 정리하도록)
// 만 제출한다. 바뀐 것이 없으면 제출하지 않는다.
// 어느 한쪽이라도 읽지 못하면(파일 없음·fetch 실패·200 아님·CF 1102 오류 페이지·잘린 XML)
// 제출 자체를 건너뛴다 — 종전의 "운영 사이트맵 전량 제출" 대체 경로는 없앴다(매 배포
// 1,990 URL 재가져가기 → 캐시 안 된 Worker 호출·1102 노출).

export const HOST = "www.moneysalary.com";

const XML_ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'" };
const decodeXml = (s) => s.replace(/&(?:amp|lt|gt|quot|apos);/g, (e) => XML_ENTITIES[e]);

/**
 * 사이트맵 XML → Map<loc, lastmod|null>. 호스트가 다른 loc 는 버린다(IndexNow 는 host 단위).
 * Next 사이트맵은 <url> 안에 <loc>·<xhtml:link>·<lastmod>·<changefreq>·<priority> 를 쓴다.
 */
export function parseSitemapEntries(xml, host = HOST) {
  const entries = new Map();
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const body = m[1];
    const loc = body.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (!loc) continue;
    const url = decodeXml(loc.trim());
    if (!url.startsWith(`https://${host}/`)) continue;
    const lastmod = body.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim() ?? null;
    entries.set(url, lastmod);
  }
  return entries;
}

// CF Workers CPU 한도 초과(1102) 등 Cloudflare 오류 페이지 표식. 본문에 숫자 1102 가 우연히
// 들어갈 수 있으므로(주식 코드·금액 URL) 숫자만으로 판정하지 않는다.
const CF_ERROR_RE = /error(?:\s+code)?:?\s*1102\b|worker exceeded resource limits|cf-error-details/i;

/**
 * 사이트맵 응답 판독 — { ok: true, entries } 또는 { ok: false, reason }.
 * status 가 없으면(빌드 산출물 파일) 200 으로 간주한다.
 */
export function readSitemap({ status = 200, body } = {}) {
  if (status !== 200) return { ok: false, reason: `HTTP ${status}` };
  if (typeof body !== "string" || body.length === 0) return { ok: false, reason: "빈 본문" };
  if (CF_ERROR_RE.test(body)) return { ok: false, reason: "Cloudflare 오류 페이지(1102 등)" };
  if (!body.includes("<urlset") || !body.includes("</urlset>")) {
    return { ok: false, reason: "urlset 아님 또는 잘린 XML" };
  }
  const entries = parseSitemapEntries(body);
  if (entries.size === 0) return { ok: false, reason: "loc 0건" };
  return { ok: true, entries };
}

// lastmod 동등 비교 — 둘 다 날짜로 읽히면 시각 값으로(형식 차이 "2026-09-10" vs
// "2026-09-10T00:00:00.000Z" 는 같은 값), 아니면 문자열로.
function sameLastmod(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  const ta = Date.parse(a);
  const tb = Date.parse(b);
  if (Number.isNaN(ta) || Number.isNaN(tb)) return false;
  return ta === tb;
}

/** prev(운영) → next(빌드) 차이. 각 배열은 정렬돼 있어 로그·테스트가 결정적이다. */
export function diffSitemapEntries(prev, next) {
  const added = [];
  const changed = [];
  const removed = [];
  for (const [url, lastmod] of next) {
    if (!prev.has(url)) added.push(url);
    else if (!sameLastmod(prev.get(url), lastmod)) changed.push(url);
  }
  for (const url of prev.keys()) if (!next.has(url)) removed.push(url);
  return { added: added.sort(), changed: changed.sort(), removed: removed.sort() };
}

/**
 * 제출 계획 — { submit, reason, urls, counts }.
 * build / prod 는 readSitemap() 결과(또는 null = 읽기 실패).
 */
export function planSubmission(build, prod, { cap = 10000 } = {}) {
  if (!build || !build.ok) {
    return { submit: false, reason: `빌드 사이트맵 판독 실패(${build?.reason ?? "없음"})`, urls: [], counts: null };
  }
  if (!prod || !prod.ok) {
    return { submit: false, reason: `운영 사이트맵 판독 실패(${prod?.reason ?? "없음"})`, urls: [], counts: null };
  }
  const diff = diffSitemapEntries(prod.entries, build.entries);
  const counts = {
    added: diff.added.length,
    changed: diff.changed.length,
    removed: diff.removed.length,
    build: build.entries.size,
    prod: prod.entries.size,
  };
  const urls = [...diff.added, ...diff.changed, ...diff.removed];
  if (urls.length === 0) return { submit: false, reason: "변경 없음", urls: [], counts };
  return { submit: true, reason: "변경분", urls: urls.slice(0, cap), counts };
}

export const formatCounts = (c) =>
  c ? `신규 ${c.added} · 변경 ${c.changed} · 삭제 ${c.removed} (빌드 ${c.build} / 운영 ${c.prod})` : "집계 없음";
