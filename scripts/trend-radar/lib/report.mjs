// scripts/trend-radar/lib/report.mjs
// 산출물 스키마·검증·한국어 보고서·파일 쓰기·헤드라인 정리(21일).

import { mkdirSync, writeFileSync, readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";

// 배열 뒤에 붙이기(발행기 외 트렌드 스크립트에는 배열 메서드 이름까지 포함해 '푸시' 문자열을 두지 않는다 — trend-publish 게이트).
const put = (arr, ...vals) => {
  for (const v of vals) arr[arr.length] = v;
  return arr.length;
};

/**
 * @typedef {Object} RadarSource
 * @property {string} id
 * @property {boolean} ok
 * @property {number} items           목록에서 읽은 항목 수(제목·링크·날짜)
 * @property {number} ms
 * @property {string} [error]         실패 사유(가림 처리됨)
 * @property {boolean} [skipped]      키 없는 선택 소스(lawdrf)
 * @property {string} [note]
 */

/**
 * @typedef {Object} RadarMatch
 * @property {{slug: string, title: string, url: string, score: number}[]} guides  상위 3
 * @property {{route: string, title: string, score: number}[]} pages               상위 3
 */

/**
 * @typedef {Object} RadarCandidate
 * @property {string} id               sha1(정규화 링크)
 * @property {string} src              소스 id
 * @property {string} ministry
 * @property {string} sourceKind       고시|공포|보도자료|설명자료|입법예고|행정예고|통계|공고
 * @property {string} title
 * @property {string} link
 * @property {string|null} publishedAt ISO +09:00
 * @property {string|null} cluster
 * @property {boolean} briefEligible
 * @property {number} score            0..100
 * @property {{officialKind: number, recency: number, demand: number, calendar: number, trends: number}} scoreParts
 * @property {RadarMatch} matches
 * @property {string[]} hubRoutes
 * @property {'ignore'|'watch'|'update-existing'|'new-brief'} recommendation
 * @property {string} reason           한국어 사유
 * @property {'allowed'|'disallowed'|'unknown'} linkRobots  원문 상세 링크의 robots 판정(추가 요청 없이 캐시로만)
 */

/**
 * @typedef {Object} RadarStatute
 * @property {string} name
 * @property {string} base
 * @property {'공포'} kind
 * @property {string} changeType
 * @property {string} ministry
 * @property {string|null} promulgatedAt
 * @property {string|null} effectiveAt
 * @property {string} serial
 * @property {string} link
 * @property {string[]} routes
 * @property {'update-existing'|'watch'} recommendation
 * @property {string} reason
 */

/**
 * @typedef {Object} RadarOutput  radar-<date>.json
 * @property {string} generatedAt
 * @property {'fixtures'|'live'} mode
 * @property {string} date                 YYYY-MM-DD(KST)
 * @property {RadarSource[]} sources
 * @property {RadarCandidate[]} candidates
 * @property {{id: string, cluster: string, name: string, start: string, end: string, basis: string, sourceUrl: string}[]} calendarUpcoming  14일
 * @property {{id: string, cluster: string, name: string, start: string, end: string}|null} nextEvent  14일 밖이라도 가장 가까운 다음 일정
 * @property {{items: number, financeMatches: number, clusters: string[]}} trends  제목은 싣지 않는다
 * @property {RadarStatute[]} statutes
 * @property {{status: string, note: string}} lawdrf
 * @property {{ms: number, rssMB: number, heapMB: number, requests: number, bytes: number}} cost
 */

export const RECOMMENDATIONS = ["ignore", "watch", "update-existing", "new-brief"];
const ISO_KST = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/;

/** 스키마 검증 — 오류 문자열 배열(비면 정상) */
export function validateRadar(r) {
  const e = [];
  const req = (cond, msg) => {
    if (!cond) put(e, msg);
  };
  req(r && typeof r === "object", "객체 아님");
  if (!r || typeof r !== "object") return e;
  req(typeof r.generatedAt === "string" && !Number.isNaN(Date.parse(r.generatedAt)), "generatedAt");
  req(r.mode === "fixtures" || r.mode === "live", "mode");
  req(/^\d{4}-\d{2}-\d{2}$/.test(r.date || ""), "date");
  req(Array.isArray(r.sources), "sources 배열");
  for (const s of r.sources || []) {
    req(typeof s.id === "string" && typeof s.ok === "boolean" && Number.isInteger(s.items) && typeof s.ms === "number", `source ${s && s.id}`);
    if (s.error !== undefined) req(typeof s.error === "string", `source ${s.id}.error`);
  }
  req(Array.isArray(r.candidates), "candidates 배열");
  for (const c of r.candidates || []) {
    const tag = `candidate ${c && c.id}`;
    req(/^[0-9a-f]{40}$/.test(c.id || ""), `${tag}.id(sha1)`);
    for (const k of ["src", "ministry", "sourceKind", "title", "link", "reason"]) req(typeof c[k] === "string" && c[k].length > 0, `${tag}.${k}`);
    req(/^https:\/\//.test(c.link || ""), `${tag}.link https`);
    req(c.publishedAt === null || ISO_KST.test(c.publishedAt), `${tag}.publishedAt`);
    req(c.cluster === null || typeof c.cluster === "string", `${tag}.cluster`);
    req(typeof c.briefEligible === "boolean", `${tag}.briefEligible`);
    req(typeof c.score === "number" && c.score >= 0 && c.score <= 100, `${tag}.score`);
    req(c.scoreParts && ["officialKind", "recency", "demand", "calendar", "trends"].every((k) => typeof c.scoreParts[k] === "number"), `${tag}.scoreParts`);
    req(c.matches && Array.isArray(c.matches.guides) && Array.isArray(c.matches.pages), `${tag}.matches`);
    req(c.matches && c.matches.guides.length <= 3 && c.matches.pages.length <= 3, `${tag}.matches 상위 3`);
    req(Array.isArray(c.hubRoutes), `${tag}.hubRoutes`);
    req(RECOMMENDATIONS.includes(c.recommendation), `${tag}.recommendation`);
    req(["allowed", "disallowed", "unknown"].includes(c.linkRobots), `${tag}.linkRobots`);
  }
  req(Array.isArray(r.calendarUpcoming), "calendarUpcoming 배열");
  req(r.trends && Number.isInteger(r.trends.items) && Number.isInteger(r.trends.financeMatches) && Array.isArray(r.trends.clusters), "trends");
  req(r.trends && Object.keys(r.trends).every((k) => ["items", "financeMatches", "clusters"].includes(k)), "trends 에 제목 등 추가 필드 금지");
  req(Array.isArray(r.statutes), "statutes 배열");
  req(r.lawdrf && typeof r.lawdrf.status === "string" && typeof r.lawdrf.note === "string", "lawdrf");
  const cost = r.cost || {};
  req(["ms", "rssMB", "heapMB", "requests", "bytes"].every((k) => typeof cost[k] === "number"), "cost");
  return e;
}

const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
const day = (iso) => (iso ? iso.slice(0, 10) : "날짜 미상");
const REC_KO = { "new-brief": "새 글 후보", "update-existing": "기존 페이지 갱신", watch: "관찰", ignore: "제외" };

/** 한국어 보고서(radar-<date>.md) */
export function renderMarkdown(r) {
  const L = [];
  const byRec = (rec) => r.candidates.filter((c) => c.recommendation === rec);
  const okCount = r.sources.filter((s) => s.ok).length;
  const fetched = r.sources.filter((s) => !s.skipped).length;
  put(L, `# 트렌드 레이더 — ${r.date}`);
  put(L, "");
  put(L, `- 모드: ${r.mode === "live" ? "실시간(live)" : "고정 표본(fixtures)"} · 생성: ${r.generatedAt}`);
  put(L, `- 소스 ${okCount}/${fetched} 정상 · 금융 후보 ${r.candidates.length}건 (새 글 후보 ${byRec("new-brief").length} · 갱신 권장 ${byRec("update-existing").length} · 관찰 ${byRec("watch").length} · 제외 ${byRec("ignore").length})`);
  put(L, `- 비용: ${r.cost.ms}ms · 요청 ${r.cost.requests}회 · ${Math.round(r.cost.bytes / 1024)}KB · RSS ${r.cost.rssMB}MB · 힙 ${r.cost.heapMB}MB`);
  put(L, "- 수집 범위: 공식 목록의 제목·링크·날짜만. 본문·상세 페이지·첨부는 가져오지 않습니다. 이 보고서는 글을 쓰지 않습니다.");
  put(L, "");
  put(L, "## 소스 상태");
  put(L, "");
  put(L, "| 소스 | 상태 | 항목 | ms | 비고 |");
  put(L, "|---|---|---:|---:|---|");
  for (const s of r.sources) {
    const st = s.skipped ? "건너뜀" : s.ok ? "정상" : "실패";
    put(L, `| ${esc(s.id)} | ${st} | ${s.items} | ${s.ms} | ${esc(s.error || s.note || "")} |`);
  }
  put(L, "");
  put(L, "## 새 글 후보 top 5");
  put(L, "");
  const nb = byRec("new-brief").slice(0, 5);
  if (!nb.length) put(L, "- 없음 (게이트 기준: 공식 원문·7일 이내·55점 이상·새 글 대상 클러스터·기존 페이지와 중복 아님)");
  else {
    put(L, "| 점수 | 클러스터 | 제목 | 출처 | 발표일 | 이유 |");
    put(L, "|---:|---|---|---|---|---|");
    for (const c of nb) put(L, `| ${c.score} | ${c.cluster} | [${esc(c.title)}](${c.link}) | ${esc(c.ministry)}(${c.sourceKind}) | ${day(c.publishedAt)} | ${esc(c.reason)} |`);
  }
  put(L, "");
  put(L, "## 기존 페이지 갱신 권장");
  put(L, "");
  const up = byRec("update-existing");
  if (!up.length) put(L, "- 없음");
  else {
    put(L, "| 대상 페이지 | 클러스터 | 제목 | 발표일 | 이유 |");
    put(L, "|---|---|---|---|---|");
    for (const c of up) {
      const target = c.hubRoutes.join(", ") || "-";
      put(L, `| ${esc(target)} | ${c.cluster} | [${esc(c.title)}](${c.link}) | ${day(c.publishedAt)} | ${esc(c.reason)} |`);
    }
  }
  put(L, "");
  put(L, "## 관찰");
  put(L, "");
  const w = byRec("watch").slice(0, 15);
  if (!w.length) put(L, "- 없음");
  for (const c of w) put(L, `- [${c.score}] ${c.cluster} · ${esc(c.title)} (${esc(c.ministry)}, ${day(c.publishedAt)}) — ${esc(c.reason)}`);
  if (byRec("watch").length > 15) put(L, `- …외 ${byRec("watch").length - 15}건(JSON 참고)`);
  put(L, "");
  put(L, "## 다가오는 공식 일정 (14일)");
  put(L, "");
  if (!r.calendarUpcoming.length) put(L, `- 14일 안에 등록된 공식 일정 없음${r.nextEvent ? ` (다음: ${r.nextEvent.start} ${esc(r.nextEvent.name)})` : ""}`);
  for (const ev of r.calendarUpcoming) put(L, `- ${ev.start}${ev.end !== ev.start ? `~${ev.end}` : ""} · ${esc(ev.name)} (${esc(ev.basis)}) — ${ev.sourceUrl}`);
  put(L, "");
  put(L, "## 법령 공포 감시");
  put(L, "");
  put(L, `- 상태: ${r.lawdrf.status === "skipped" ? r.lawdrf.note : `${r.lawdrf.status} — ${r.lawdrf.note}`}`);
  for (const s of r.statutes) {
    const routes = s.routes.slice(0, 6).join(", ") + (s.routes.length > 6 ? ` 외 ${s.routes.length - 6}` : "");
    put(L, `- ${s.promulgatedAt} 공포 · [${esc(s.name)}](${s.link}) ${esc(s.changeType)} (${esc(s.ministry)}, 시행 ${s.effectiveAt || "미상"}) → ${REC_KO[s.recommendation]}${routes ? `: ${routes}` : ""}`);
  }
  put(L, "");
  put(L, "## 구글 트렌드 금융 매칭 수");
  put(L, "");
  put(L, `- 트렌드 ${r.trends.items}건 중 금융 클러스터 매칭 ${r.trends.financeMatches}건${r.trends.clusters.length ? ` (부스트 클러스터: ${r.trends.clusters.join(", ")})` : ""}`);
  put(L, "- 트렌드 제목은 부스트(+10)·헤드라인 겹침 게이트에만 쓰고 보고서·작성기에 넘기지 않습니다.");
  put(L, "");
  return L.join("\n");
}

/** headlines-YYYY-MM-DD.json 중 keepDays 보다 오래된 것 삭제 → 삭제한 파일명 */
export function pruneHeadlines(outDir, todayYmd, keepDays = 21) {
  const cut = Date.parse(`${todayYmd}T00:00:00Z`) - keepDays * 86400000;
  const removed = [];
  let names = [];
  try {
    names = readdirSync(outDir);
  } catch {
    return removed;
  }
  for (const n of names) {
    const m = /^headlines-(\d{4}-\d{2}-\d{2})\.json$/.exec(n);
    if (!m) continue;
    if (Date.parse(`${m[1]}T00:00:00Z`) < cut) {
      unlinkSync(join(outDir, n));
      put(removed, n);
    }
  }
  return removed.sort();
}

/** radar-<date>.json · radar-<date>.md · headlines-<date>.json 쓰기 */
export function writeOutputs(outDir, radar, headlines) {
  mkdirSync(outDir, { recursive: true });
  const files = {
    json: join(outDir, `radar-${radar.date}.json`),
    md: join(outDir, `radar-${radar.date}.md`),
    headlines: join(outDir, `headlines-${radar.date}.json`),
  };
  writeFileSync(files.json, `${JSON.stringify(radar, null, 2)}\n`);
  writeFileSync(files.md, `${renderMarkdown(radar)}\n`);
  writeFileSync(files.headlines, `${JSON.stringify(headlines, null, 2)}\n`);
  const pruned = pruneHeadlines(outDir, radar.date, 21);
  return { files, pruned };
}
