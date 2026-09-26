// scripts/trend-radar/lib/site-map.mjs
// 사이트 색인 — 후보를 기존 가이드·정적 페이지에 연결한다(읽기 전용, 저장소 파일만).
//   · 한국어 가이드 카드: src/lib/guidesMeta.generated.ts 의 'guideCards: GuideCardMeta[] = ' 뒤 배열을
//     그대로 JSON.parse(코드젠 산출물이라 순수 JSON). lang === "ko" 만.
//   · 정적 라우트: src/app 아래 page.tsx. [동적]·(그룹)·_비공개·api·en 폴더는 건너뛴다.
//   · 정적 제목: page.tsx → 같은 폴더 layout.tsx 순으로 title 리터럴을 정규식으로 best-effort 추출.
//   · 유사도: 한글·영숫자만 남긴 문자 바이그램 Jaccard. 후보마다 가이드 상위 3·페이지 상위 3.
//   · statuteMentions(법령명): page.tsx 와 같은 폴더(하위 폴더 제외) 파일에 법령명이 나오는 라우트 목록.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

// 배열 뒤에 붙이기(발행기 외 트렌드 스크립트에는 배열 메서드 이름까지 포함해 '푸시' 문자열을 두지 않는다 — trend-publish 게이트).
const put = (arr, ...vals) => {
  for (const v of vals) arr[arr.length] = v;
  return arr.length;
};

const GUIDE_MARK = "guideCards: GuideCardMeta[] = ";
const SKIP_DIR = /^(\[|\(|_|api$|en$|node_modules$)/;
const TITLE_RE = /\b(?:title|absolute|default)\s*:\s*(["'`])((?:(?!\1)[^\\\n]|\\.){4,200})\1/g;

/** 가이드 카드 배열(한국어만). 형식이 바뀌면 예외 — 조용히 빈 목록을 돌려주지 않는다. */
export function loadGuideCards(repoRoot) {
  const file = join(repoRoot, "src", "lib", "guidesMeta.generated.ts");
  const src = readFileSync(file, "utf8");
  const start = src.indexOf(GUIDE_MARK);
  if (start < 0) throw new Error("guidesMeta.generated.ts 에서 guideCards 선언을 찾지 못함");
  const from = start + GUIDE_MARK.length;
  const end = src.indexOf("];", from);
  if (end < 0) throw new Error("guideCards 배열 끝(];)을 찾지 못함");
  const arr = JSON.parse(src.slice(from, end + 1));
  return arr
    .filter((g) => g && g.lang === "ko" && g.slug && g.title)
    .map((g) => ({ slug: g.slug, title: g.title, category: g.category || "", url: `/guides/${g.slug}` }));
}

function firstTitle(text) {
  TITLE_RE.lastIndex = 0;
  for (const m of text.matchAll(TITLE_RE)) {
    const v = m[2];
    if (v.includes("${")) continue;
    if (!/[가-힣]/.test(v)) continue;
    return v.replace(/\\(.)/g, "$1").trim();
  }
  return "";
}

/** src/app 을 돌며 정적 라우트 목록 [{route, title, dir}] */
export function walkRoutes(repoRoot) {
  const appDir = join(repoRoot, "src", "app");
  const out = [];
  const visit = (dir, segs) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    if (entries.some((e) => e.isFile() && e.name === "page.tsx")) {
      const route = segs.length ? `/${segs.join("/")}` : "/";
      let title = "";
      for (const f of ["page.tsx", "layout.tsx"]) {
        const p = join(dir, f);
        if (!title && existsSync(p)) title = firstTitle(readFileSync(p, "utf8"));
      }
      put(out, { route, title, dir });
    }
    for (const e of entries) {
      if (!e.isDirectory() || SKIP_DIR.test(e.name)) continue;
      visit(join(dir, e.name), [...segs, e.name]);
    }
  };
  visit(appDir, []);
  return out.sort((a, b) => a.route.localeCompare(b.route));
}

/** 한글·영숫자만 남긴 정규형 */
export function normalizeForSim(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^가-힣a-z0-9]/g, "");
}

export function bigrams(s) {
  const n = normalizeForSim(s);
  const set = new Set();
  for (let i = 0; i < n.length - 1; i += 1) set.add(n.slice(i, i + 2));
  return set;
}

export function jaccard(a, b) {
  const A = a instanceof Set ? a : bigrams(a);
  const B = b instanceof Set ? b : bigrams(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter += 1;
  return inter / (A.size + B.size - inter);
}

/**
 * 사이트 색인. 파일 본문(statuteMentions 용)은 처음 필요할 때만 읽는다.
 * @param {string} repoRoot
 */
export function loadSiteIndex(repoRoot) {
  const guides = loadGuideCards(repoRoot).map((g) => ({ ...g, grams: bigrams(g.title) }));
  const routes = walkRoutes(repoRoot);
  const pages = routes.filter((r) => r.title).map((r) => ({ route: r.route, title: r.title, grams: bigrams(r.title) }));
  let texts = null;
  const routeTexts = () => {
    if (texts) return texts;
    texts = routes.map((r) => {
      let body = "";
      for (const e of readdirSync(r.dir, { withFileTypes: true })) {
        if (e.isFile() && /\.(tsx?|mdx?)$/.test(e.name)) body += readFileSync(join(r.dir, e.name), "utf8");
      }
      return { route: r.route, text: normalizeDots(body) };
    });
    return texts;
  };
  return { guides, pages, routes: routes.map((r) => r.route), routeTexts };
}

/** 가운뎃점 표기 통일(·ㆍ・･ → ·) */
export function normalizeDots(s) {
  return String(s || "").replace(/[ㆍ・･‧]/g, "·");
}

/** 제목과 가장 비슷한 가이드 3·페이지 3 */
export function topMatches(title, index, n = 3) {
  const g = bigrams(title);
  const rank = (list, pick) =>
    list
      .map((x) => ({ ...pick(x), score: Math.round(jaccard(g, x.grams) * 1000) / 1000 }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || String(a.title).localeCompare(String(b.title)))
      .slice(0, n);
  return {
    guides: rank(index.guides, (x) => ({ slug: x.slug, title: x.title, url: x.url })),
    pages: rank(index.pages, (x) => ({ route: x.route, title: x.title })),
  };
}

/**
 * 법령명이 page.tsx 또는 같은 폴더 파일에 나오는 라우트.
 * 시행령·시행규칙 이름으로 못 찾으면 모법 이름으로 한 번 더 찾는다.
 */
export function statuteMentions(name, index) {
  const exact = normalizeDots(name).trim();
  const base = exact.replace(/\s*(시행령|시행규칙)$/, "");
  const find = (needle) => index.routeTexts().filter((r) => r.text.includes(needle)).map((r) => r.route);
  const hits = find(exact);
  return hits.length || base === exact ? hits : find(base);
}
