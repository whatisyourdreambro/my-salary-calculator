// scripts/ad-audit.mjs
// 광고 배치 정적 감사 — "광고를 추가했는데 다른 광고가 조용히 사라지는" 사고를 커밋 전에 검출.
// 배경: AdPlacement.tsx 의 renderedSlotsByPath dedup 은 같은 경로에서 동일 슬롯 2회차를
//       무음 차단한다. page 의 effect 가 layout 보다 먼저 실행되므로 layout 쪽 유닛이 죽는다.
//       2026-08-23 전수 감사에서 이 유형으로 유닛 20+ 소멸을 발견(성과급 계산기 21곳 등).
// 사용:
//   node scripts/ad-audit.mjs          — 전 라우트 스캔 (ERROR 있으면 exit 1)
//   node scripts/ad-audit.mjs --diff   — git diff 기준 "광고 위 새 UI 삽입" 검출 추가
//                                        (2026-08-16 수익 급락 사건 규칙의 자동 게이트)
// 한계: AST 파서가 아니라 정규식 휴리스틱이다. 오탐/미탐 가능 — 의도적 예외는
//       scripts/ad-audit-allow.json 에 {route, slot, reason} 으로 등재할 것(reason 필수).
// 주의: InArticleAd 는 env NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE 미설정 시 GUIDE_MID 로
//       폴백한다(AdPlacement.tsx). 프로덕션은 설정돼 있어 별개 슬롯으로 취급하지만,
//       env 를 지우면 InArticle(100+곳)과 GuideMid(70+곳)가 같은 슬롯이 되어 페이지마다
//       한쪽이 소멸한다 — IN_ARTICLE env 는 절대 비우지 말 것.

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const SRC = path.join(ROOT, "src");
const APP = path.join(SRC, "app");
const ALLOW_FILE = path.join(ROOT, "scripts", "ad-audit-allow.json");
const DIFF_MODE = process.argv.includes("--diff");

// 컴포넌트 → AdSense 슬롯 매핑 (AdPlacement.tsx 가 정본)
const SLOT_OF = {
  HomeTopAd: ["HOME_TOP"],
  CalcResultAd: ["CALC_RESULT"],
  ResultAd: ["CALC_RESULT"], // alias
  GuideMidAd: ["GUIDE_MID"],
  SidebarAd: ["SIDEBAR"],
  InArticleAd: ["IN_ARTICLE"],
  MultiplexAd: ["MULTIPLEX"],
  Display2Ad: ["DISPLAY_2"],
  PageFooterAds: ["IN_ARTICLE", "HOME_TOP", "COUPANG"], // 합성 래퍼
  CoupangBanner: ["COUPANG"], // 심 경유 — 실제 렌더는 AffiliateSlot(오퍼 무매칭 시 쿠팡 폴백)
  AffiliateSlot: ["COUPANG"], // 직접 사용처 대비 — 폴백이 쿠팡이므로 동일 슬롯 취급
};
const AD_COMPONENT_RE = new RegExp(
  "<(" + Object.keys(SLOT_OF).join("|") + ")\\b",
  "g"
);

// ---------- 파일 파싱 (전역 캐시) ----------
const fileCache = new Map(); // absPath -> { slots: [{name,line}], imports: [absPath] }

function parseFile(absPath) {
  if (fileCache.has(absPath)) return fileCache.get(absPath);
  let text;
  try {
    text = fs.readFileSync(absPath, "utf8");
  } catch {
    const empty = { slots: [], imports: [] };
    fileCache.set(absPath, empty);
    return empty;
  }
  // JSX 사용처만 카운트 (import 만 있는 경우 무시). 조건부 렌더도 dedup 위험 기준으로 사용 취급.
  const slots = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let m;
    AD_COMPONENT_RE.lastIndex = 0;
    while ((m = AD_COMPONENT_RE.exec(lines[i]))) {
      slots.push({ name: m[1], line: i + 1 });
    }
  }
  // import 해석: 상대경로 + "@/" 별칭. .tsx 만 재귀 대상 (광고 JSX 는 .tsx 에만 존재).
  const imports = [];
  const importRe = /import\s[^"']*["'](\.{1,2}\/[^"']+|@\/[^"']+)["']/g;
  let im;
  while ((im = importRe.exec(text))) {
    const spec = im[1];
    let base = spec.startsWith("@/")
      ? path.join(SRC, spec.slice(2))
      : path.resolve(path.dirname(absPath), spec);
    for (const cand of [base + ".tsx", path.join(base, "index.tsx")]) {
      if (fs.existsSync(cand)) {
        imports.push(cand);
        break;
      }
    }
  }
  const parsed = { slots, imports };
  fileCache.set(absPath, parsed);
  return parsed;
}

// page 서브트리 수집 (재귀 깊이 3 — page → Client → 공유 컴포넌트 → 하위)
function collectSubtree(entry, depth = 0, visited = new Set()) {
  if (visited.has(entry) || depth > 3) return [];
  visited.add(entry);
  // 광고 정의 파일 자체는 제외. PageFooterAds 는 SLOT_OF 매핑이 사용처에서 이미
  // 계상하므로 파일 내부로 재귀하면 이중 카운트가 된다 — 제외 필수.
  if (/AdPlacement\.tsx$|CoupangBanner\.tsx$|CoupangBannerCore\.tsx$|AffiliateSlot\.tsx$|PageFooterAds\.tsx$/.test(entry)) return [];
  const { imports } = parseFile(entry);
  const files = [entry];
  for (const imp of imports) files.push(...collectSubtree(imp, depth + 1, visited));
  return files;
}

function slotUsages(files) {
  const usages = []; // {slot, comp, file, line}
  for (const f of files) {
    for (const s of parseFile(f).slots) {
      for (const slot of SLOT_OF[s.name]) {
        usages.push({ slot, comp: s.name, file: f, line: s.line });
      }
    }
  }
  return usages;
}

// ---------- 라우트 열거 ----------
function findPages(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) findPages(p, out);
    else if (e.name === "page.tsx") out.push(p);
  }
  return out;
}

function routeOf(pagePath) {
  const rel = path.relative(APP, path.dirname(pagePath)).split(path.sep).join("/");
  return rel === "" ? "/" : "/" + rel;
}

function ancestorLayouts(pagePath) {
  const layouts = [];
  let dir = path.dirname(pagePath);
  while (dir.length >= APP.length) {
    const l = path.join(dir, "layout.tsx");
    if (fs.existsSync(l)) layouts.push(l);
    if (dir === APP) break;
    dir = path.dirname(dir);
  }
  return layouts;
}

// ---------- allowlist ----------
let allow = [];
if (fs.existsSync(ALLOW_FILE)) {
  allow = JSON.parse(fs.readFileSync(ALLOW_FILE, "utf8"));
  for (const a of allow) {
    if (!a.route || !a.slot || !a.reason) {
      console.error(`allowlist 항목에 route/slot/reason 필수: ${JSON.stringify(a)}`);
      process.exit(1);
    }
  }
}
const isAllowed = (route, slot) =>
  allow.some((a) => a.route === route && a.slot === slot);

// ---------- 스캔 ----------
const errors = [];
const warns = [];
const infos = [];
const rel = (f) => path.relative(ROOT, f).split(path.sep).join("/");

for (const page of findPages(APP)) {
  const route = routeOf(page);
  const pageFiles = collectSubtree(page);
  const pageUse = slotUsages(pageFiles);
  const layoutUse = slotUsages(
    ancestorLayouts(page).flatMap((l) => collectSubtree(l))
  );

  // 1) page 서브트리 내 동일 AdSense 슬롯 2회 (자기 자신과 충돌)
  const bySlot = new Map();
  for (const u of pageUse.filter((u) => u.slot !== "COUPANG")) {
    if (!bySlot.has(u.slot)) bySlot.set(u.slot, []);
    bySlot.get(u.slot).push(u);
  }
  for (const [slot, us] of bySlot) {
    // 같은 파일 같은 줄 중복 제거 후 실사용 2곳 이상이면 충돌
    const uniq = [...new Set(us.map((u) => `${rel(u.file)}:${u.line}`))];
    if (uniq.length >= 2 && !isAllowed(route, slot)) {
      errors.push(`${route}  [${slot}] page 서브트리 내 2회 → 뒤쪽 소멸: ${uniq.join(" vs ")}`);
    }
  }

  // 2) page ↔ 조상 layout 동일 슬롯 — page 쪽이 이기고 layout 쪽이 양보(dedup)한다.
  //    이는 "페이지가 자체 유닛을 가지면 layout 하단은 폴백으로 물러남" 이라는 사이트 전반의
  //    의도된 패턴이라 INFO 로만 보고한다 (2026-08-23 전수 확인: qna/glossary/salary-db/en 등
  //    수십 라우트가 이 구조). 새 배치가 이 목록을 "늘리는지"는 --diff 게이트로 잡는다.
  const layoutSlots = new Map();
  for (const u of layoutUse.filter((u) => u.slot !== "COUPANG"))
    if (!layoutSlots.has(u.slot)) layoutSlots.set(u.slot, u);
  for (const [slot] of bySlot) {
    if (layoutSlots.has(slot) && !isAllowed(route, slot)) {
      const lu = layoutSlots.get(slot);
      const pu = bySlot.get(slot)[0];
      infos.push(
        `${route}  [${slot}] page(${rel(pu.file)}:${pu.line}) 가 layout(${rel(lu.file)}:${lu.line}) 폴백을 대체`
      );
    }
  }

  // 3) 쿠팡 3회+ (dedup 캡 2회 — 3번째부터 무음 차단되어 무의미한 코드)
  const coupangCount = pageUse.concat(layoutUse).filter((u) => u.slot === "COUPANG").length;
  if (coupangCount >= 3 && !isAllowed(route, "COUPANG")) {
    warns.push(`${route}  [COUPANG] ${coupangCount}회 배치 — 캡 2회 초과분은 렌더 안 됨`);
  }
}

// ---------- --diff: 광고 위 새 UI 삽입 검출 ----------
if (DIFF_MODE) {
  let diff = "";
  try {
    diff = execSync('git diff -U2 HEAD -- "src/**/*.tsx"', {
      cwd: ROOT,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
  } catch (e) {
    console.error("git diff 실행 실패:", e.message);
  }
  const adLineRe = new RegExp("<(" + Object.keys(SLOT_OF).join("|") + ")\\b");
  const lines = diff.split("\n");
  let file = "";
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (ln.startsWith("+++ b/")) file = ln.slice(6);
    // 추가된 줄(비어있지 않은 UI 줄) 바로 아래 2줄 안에 기존(컨텍스트) 광고 줄이 있으면 경고
    if (ln.startsWith("+") && !ln.startsWith("+++") && /<[A-Za-z]/.test(ln) && !adLineRe.test(ln)) {
      for (let j = i + 1; j <= i + 2 && j < lines.length; j++) {
        const next = lines[j];
        if (next.startsWith(" ") && adLineRe.test(next)) {
          warns.push(
            `${file}: 광고 직상단에 새 UI 삽입 감지 (${ln.trim().slice(0, 60)}…) — 2026-08-16 규칙: 새 UI 는 광고 아래에`
          );
          break;
        }
      }
    }
    // 광고 줄 삭제만 있고 인접한 추가가 없으면 유닛 소실 의심
    if (ln.startsWith("-") && !ln.startsWith("---") && adLineRe.test(ln)) {
      const window = lines.slice(Math.max(0, i - 4), i + 5);
      const readded = window.some((w) => w.startsWith("+") && adLineRe.test(w));
      if (!readded) warns.push(`${file}: 광고 유닛 삭제 감지, 대체 추가 없음 — 의도 확인 필요`);
    }
  }
}

// ---------- 리포트 ----------
console.log(`\n=== 광고 배치 정적 감사${DIFF_MODE ? " (+diff 게이트)" : ""} ===\n`);
for (const e of errors) console.log("ERROR  " + e);
for (const w of warns) console.log("WARN   " + w);
if (process.argv.includes("--verbose")) {
  for (const i of infos) console.log("INFO   " + i);
} else if (infos.length) {
  console.log(`INFO   page→layout 폴백 대체 ${infos.length}건 (--verbose 로 상세)`);
}
if (allow.length) console.log(`\nallowlist ${allow.length}건 적용 (scripts/ad-audit-allow.json)`);
console.log(
  `\n결과: ERROR ${errors.length}건 / WARN ${warns.length}건${errors.length ? " — 커밋 전 수정 또는 allowlist(사유 필수) 등재" : " — 통과"}`
);
process.exit(errors.length ? 1 : 0);
