// scripts/trend-radar/lib/filter.mjs
// 금융 주제 필터 — clusters.json 을 정규식으로 컴파일하고 제목을 12개 클러스터 중 하나로 분류한다.
//   · 금융 주제 판정: baseAllow(PoC 정규식) 또는 어느 클러스터 include 에라도 맞으면 통과.
//   · denylist(주식·코인·펀드·전망·정치·연예·스포츠·사고·사망·범죄·재난·보건·복권·신용점수·
//     금리 순위 등)에 걸리면 클러스터가 있어도 ignore.
//   · 여러 클러스터가 맞으면 일치 글자 수 합이 큰 쪽(부처 힌트가 같으면 +2), 동률이면 파일 순서.
//   · 자료 종류(kind)는 제목 규칙(kindRules) → 없으면 소스 기본값(defaultKind).

import { existsSync } from "node:fs";
import { join } from "node:path";

// 배열 뒤에 붙이기(발행기 외 트렌드 스크립트에는 배열 메서드 이름까지 포함해 '푸시' 문자열을 두지 않는다 — trend-publish 게이트).
const put = (arr, ...vals) => {
  for (const v of vals) arr[arr.length] = v;
  return arr.length;
};

export const CLUSTER_IDS = [
  "minimum-wage",
  "social-insurance-rates",
  "civil-servant-pay",
  "tax-law-amendment",
  "year-end-tax",
  "earned-income-credit",
  "bok-base-rate",
  "national-pension",
  "parental-leave",
  "unemployment-benefit",
  "retirement-pension",
  "household-loan-policy",
];
export const NOT_BRIEF_ELIGIBLE = ["tax-law-amendment", "earned-income-credit", "parental-leave"];

/** src/app/<route>/page.tsx 존재 여부 */
export function routeExists(repoRoot, route) {
  const rel = route === "/" ? "" : route.replace(/^\//, "");
  return existsSync(join(repoRoot, "src", "app", ...rel.split("/").filter(Boolean), "page.tsx"));
}

/**
 * clusters.json 검증. 오류 문자열 배열(비면 정상).
 * @param {any} cfg
 * @param {string} [repoRoot] 주면 hubRoutes 실존까지 확인
 */
export function validateClusters(cfg, repoRoot) {
  const errors = [];
  if (!cfg || !Array.isArray(cfg.clusters)) return ["clusters 배열 없음"];
  const ids = cfg.clusters.map((c) => c.id);
  const missing = CLUSTER_IDS.filter((id) => !ids.includes(id));
  const extra = ids.filter((id) => !CLUSTER_IDS.includes(id));
  if (missing.length) put(errors, `누락 클러스터: ${missing.join(", ")}`);
  if (extra.length) put(errors, `정의되지 않은 클러스터: ${extra.join(", ")}`);
  if (new Set(ids).size !== ids.length) put(errors, "클러스터 id 중복");
  for (const key of ["baseAllow", "denylist"]) {
    try {
      new RegExp(cfg[key]);
    } catch (e) {
      put(errors, `${key} 정규식 오류: ${e.message}`);
    }
  }
  for (const r of cfg.kindRules || []) {
    try {
      new RegExp(r.re);
    } catch (e) {
      put(errors, `kindRules(${r.kind}) 정규식 오류: ${e.message}`);
    }
    if (cfg.kindPoints?.[r.kind] === undefined) put(errors, `kindPoints 에 ${r.kind} 없음`);
  }
  for (const c of cfg.clusters) {
    for (const key of ["include", "canonicalReleases"]) {
      try {
        new RegExp(c[key]);
      } catch (e) {
        put(errors, `${c.id}.${key} 정규식 오류: ${e.message}`);
      }
    }
    if (typeof c.briefEligible !== "boolean") put(errors, `${c.id}.briefEligible 이 boolean 아님`);
    else if (NOT_BRIEF_ELIGIBLE.includes(c.id) === c.briefEligible)
      put(errors, `${c.id}.briefEligible 은 ${!NOT_BRIEF_ELIGIBLE.includes(c.id)} 이어야 함`);
    if (!(typeof c.demandWeight === "number" && c.demandWeight >= 0 && c.demandWeight <= 1))
      put(errors, `${c.id}.demandWeight 는 0..1`);
    if (!Array.isArray(c.hubRoutes) || !c.hubRoutes.length) put(errors, `${c.id}.hubRoutes 비어 있음`);
    else if (repoRoot) {
      for (const r of c.hubRoutes) if (!routeExists(repoRoot, r)) put(errors, `${c.id}.hubRoutes ${r} — src/app${r}/page.tsx 없음`);
    }
    if (!c.ministry) put(errors, `${c.id}.ministry 없음`);
  }
  return errors;
}

/** clusters.json → 컴파일된 필터 */
export function compileClusters(cfg) {
  return {
    allow: new RegExp(cfg.baseAllow),
    deny: new RegExp(cfg.denylist, "i"),
    kindRules: (cfg.kindRules || []).map((r) => ({ kind: r.kind, re: new RegExp(r.re) })),
    kindPoints: { ...cfg.kindPoints },
    clusters: cfg.clusters.map((c) => ({
      id: c.id,
      label: c.label || c.id,
      ministry: c.ministry,
      briefEligible: c.briefEligible,
      hubRoutes: [...c.hubRoutes],
      demandWeight: c.demandWeight,
      include: new RegExp(c.include, "g"),
      canonical: new RegExp(c.canonicalReleases),
    })),
  };
}

function matchedChars(re, title) {
  re.lastIndex = 0;
  const seen = new Set();
  let total = 0;
  let first = "";
  for (const m of title.matchAll(re)) {
    if (!first) first = m[0];
    if (seen.has(m[0])) continue;
    seen.add(m[0]);
    total += m[0].length;
  }
  return { total, first };
}

/**
 * 제목 분류.
 * @returns {{allowed: boolean, denied: string|null, cluster: string|null, clusterMatch: string, canonical: string|null}}
 */
export function classifyTitle(title, compiled, { ministry } = {}) {
  const t = String(title || "");
  const deniedM = compiled.deny.exec(t);
  let best = null;
  for (const c of compiled.clusters) {
    const { total, first } = matchedChars(c.include, t);
    if (!total) continue;
    const weight = total + (ministry && c.ministry === ministry ? 2 : 0);
    if (!best || weight > best.weight) best = { c, weight, first };
  }
  const allowed = compiled.allow.test(t) || Boolean(best);
  const canonM = best ? best.c.canonical.exec(t) : null;
  return {
    allowed,
    denied: deniedM ? deniedM[0] : null,
    cluster: best ? best.c.id : null,
    clusterMatch: best ? best.first : "",
    canonical: canonM ? canonM[0] : null,
  };
}

/** 제목 규칙으로 자료 종류 판정, 없으면 소스 기본값. */
export function detectKind(title, defaultKind, compiled) {
  for (const r of compiled.kindRules) if (r.re.test(String(title || ""))) return r.kind;
  return defaultKind;
}

export function clusterById(compiled, id) {
  return compiled.clusters.find((c) => c.id === id) || null;
}

/** 구글 트렌드 제목 중 금융 매칭(허용·비차단·클러스터 있음) → {count, clusters:Set} */
export function trendsFinance(titles, compiled) {
  const clusters = new Set();
  let count = 0;
  for (const title of titles) {
    const r = classifyTitle(title, compiled);
    if (r.allowed && !r.denied && r.cluster) {
      count += 1;
      clusters.add(r.cluster);
    }
  }
  return { count, clusters };
}
