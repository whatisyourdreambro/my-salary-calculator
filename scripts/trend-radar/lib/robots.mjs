// scripts/trend-radar/lib/robots.mjs
// 공용 robots.txt 판정 — 레이어·발행기·감시기가 같이 쓴다.
// 최소 파서(RFC 9309 핵심만):
//   · User-agent 그룹. 우리 토큰(moneysalary-radar)과 정확히 같은 그룹이 있으면 그것, 없으면 '*'.
//     같은 에이전트 그룹이 여러 개면 합친다. 'User-agent : *'(콜론 앞 공백)·행 끝 '# 주석'도 허용.
//   · Allow/Disallow 최장 일치. 길이가 같으면 Allow 가 이긴다. '*' 와일드카드, '$' 끝 고정.
//   · 빈 Disallow 는 규칙 아님(전체 허용).
// 실패 처리: robots.txt 가 404 일 때만 '허용'. 5xx·타임아웃·기타 오류·요청 상한은 '차단'(보수적).
// 캐시: http 인스턴스(=실행 1회)별·origin 별. 같은 실행에서 같은 호스트는 한 번만 가져온다.

import { RADAR_UA_TOKEN } from "./http.mjs";

// 배열 뒤에 붙이기(발행기 외 트렌드 스크립트에는 배열 메서드 이름까지 포함해 '푸시' 문자열을 두지 않는다 — trend-publish 게이트).
const put = (arr, ...vals) => {
  for (const v of vals) arr[arr.length] = v;
  return arr.length;
};

const cacheByHttp = new WeakMap();

/** robots.txt 본문 → [{agents:[...], rules:[{allow, pattern}]}] */
export function parseRobots(text) {
  const groups = [];
  let current = null;
  let lastWasAgent = false;
  for (const rawLine of String(text || "").split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (key === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] };
        put(groups, current);
      }
      put(current.agents, value.toLowerCase());
      lastWasAgent = true;
    } else if (key === "allow" || key === "disallow") {
      lastWasAgent = false;
      if (!current) continue;
      if (key === "disallow" && value === "") continue;
      put(current.rules, { allow: key === "allow", pattern: value });
    } else {
      lastWasAgent = false;
    }
  }
  return groups;
}

function encodePattern(p) {
  // 비ASCII 문자만 퍼센트 인코딩(URL.pathname 과 같은 표기로 맞춤). *, $ 는 그대로 둔다.
  return p.replace(/[^\x21-\x7e]/g, (ch) => encodeURIComponent(ch));
}

/** robots 패턴 → 정규식(앞에서부터 일치). */
function patternToRegex(pattern) {
  let p = encodePattern(pattern);
  let anchored = false;
  if (p.endsWith("$")) {
    anchored = true;
    p = p.slice(0, -1);
  }
  const body = p
    .split("*")
    .map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`);
}

/** 그룹 선택: 정확히 같은 UA 토큰 그룹(들) 우선, 없으면 '*' 그룹(들). */
export function selectRules(groups, uaToken = RADAR_UA_TOKEN) {
  const token = String(uaToken).toLowerCase();
  const exact = groups.filter((g) => g.agents.includes(token));
  const chosen = exact.length ? exact : groups.filter((g) => g.agents.includes("*"));
  return chosen.flatMap((g) => g.rules);
}

/** 경로(pathname+search) 판정. 최장 일치, 동률이면 Allow. */
export function evaluate(rules, pathWithQuery) {
  let best = null;
  for (const r of rules) {
    if (!patternToRegex(r.pattern).test(pathWithQuery)) continue;
    const len = encodePattern(r.pattern).length;
    if (!best || len > best.len || (len === best.len && r.allow && !best.rule.allow)) {
      best = { len, rule: r };
    }
  }
  if (!best) return { allowed: true, rule: "일치 규칙 없음(허용)" };
  return { allowed: best.rule.allow, rule: `${best.rule.allow ? "Allow" : "Disallow"}: ${best.rule.pattern}` };
}

async function loadRobots(origin, http) {
  try {
    const res = await http.get(`${origin}/robots.txt`, { maxBytes: 512 * 1024, accept: "text/plain, */*;q=0.5" });
    if (res.status === 200) return { kind: "rules", groups: parseRobots(res.text) };
    if (res.status === 404) return { kind: "allow-all", rule: "robots.txt 404(규칙 없음)" };
    return { kind: "deny-all", rule: `robots.txt HTTP ${res.status} — 보수적으로 차단` };
  } catch (err) {
    return { kind: "deny-all", rule: `robots.txt 조회 실패(${err && err.name ? err.name : "Error"}) — 보수적으로 차단` };
  }
}

/**
 * @param {string} url
 * @param {{http: {get: Function}, ua?: string}} ctx
 * @returns {Promise<{allowed: boolean, rule: string}>}
 */
export async function isAllowed(url, { http, ua = RADAR_UA_TOKEN }) {
  const u = new URL(url);
  let perRun = cacheByHttp.get(http);
  if (!perRun) {
    perRun = new Map();
    cacheByHttp.set(http, perRun);
  }
  if (!perRun.has(u.origin)) perRun.set(u.origin, loadRobots(u.origin, http));
  const robots = await perRun.get(u.origin);
  if (robots.kind === "allow-all") return { allowed: true, rule: robots.rule };
  if (robots.kind === "deny-all") return { allowed: false, rule: robots.rule };
  return evaluate(selectRules(robots.groups, ua), u.pathname + u.search);
}

/** 캐시만 보고 판정(추가 요청 없음). 해당 origin 을 아직 안 가져왔으면 null. */
export async function isAllowedCached(url, { http, ua = RADAR_UA_TOKEN }) {
  const u = new URL(url);
  const perRun = cacheByHttp.get(http);
  if (!perRun || !perRun.has(u.origin)) return null;
  return isAllowed(url, { http, ua });
}
