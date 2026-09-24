// scripts/ad-audit.mjs
// 광고 배치 정적 감사 — "광고를 추가했는데 다른 광고가 조용히 사라지는" 사고를 커밋 전에 검출.
// 배경: AdPlacement.tsx 의 renderedSlotsByPath dedup 은 같은 경로에서 동일 슬롯 2회차를
//       무음 차단한다. page 의 effect 가 layout 보다 먼저 실행되므로 layout 쪽 유닛이 죽는다.
//       2026-08-23 전수 감사에서 이 유형으로 유닛 20+ 소멸을 발견(성과급 계산기 21곳 등).
// 사용:
//   node scripts/ad-audit.mjs          — 전 라우트 스캔 (ERROR 있으면 exit 1)
//   node scripts/ad-audit.mjs --diff   — git diff 기준 "광고 위 새 UI 삽입" 검출 추가
//                                        (2026-08-16 수익 급락 사건 규칙의 자동 게이트)
//                                        + 신설 INFO 검출 2종은 diff 모드에서 "증가분(신규 후보)"만 상세 출력
//   node scripts/ad-audit.mjs --diff --base <ref> — <ref>..작업 트리 전체를 평가(CI: push 는
//                                        github.event.before, PR 은 pull_request.base.sha — ci.yml)
//   node scripts/ad-audit.mjs --verbose — INFO 상세(신설 검출 2종의 file:line 목록 포함)
// --diff 게이트 등급(2026-09-25 개정, 감사 ADS-03 — 9/6~9/19 광고 위 삽입 12건+가 WARN 만 남기고 통과):
//   · 추가된 JSX 줄 바로 아래 2줄 안에 기존 광고 줄 → ERROR(exit 1). 면제는 ad-audit-allow.json 의
//     {file, pattern, reason, approvalId} 항목(운영자 승인 ID 필수)으로만.
//   · 광고 유닛 삭제(대체 추가 없음) → WARN 유지(9/11 PageFooterAds 재배열 등 오탐 이력).
//   · 7) 광고 위 UI 후보(넓은 창) — 추가된 JSX 줄 아래 15줄 안에 중간 광고 없이 기존 광고 태그 →
//     INFO 전용(오탐률 측정 단계, 승격은 운영자 결정 후).
//   · CI 환경(env CI)에서 git diff 자체가 실패하면 exit 2 — 얕은 clone 에서 조용히 통과하던 구멍 차단.
// 신설 INFO 전용 검출(2026-09-05, 10배 계획 adsense-quality-6) — 절대 ERROR/WARN 으로 승격 금지,
// exit 코드 불변, 자동 수정 없음. 후보 목록은 운영자 콘솔 점검(9/7)·승인 큐(수리)로만 흘러간다:
//   5) 우발 클릭 인접 후보 — 광고 태그 ±3줄 안에 button/input/role="tab"/공유·즐겨찾기 버튼
//      (2026-09-25 트리거 확장: ResultSharePanel·PrivateFeedback·select·textarea — 확장 전 기준 수도 병기).
//      AdSlot 자체 마진(1.5rem)·NextActions 자체 mt-8 은 감안 — 래퍼 클래스(mt-2 등)만으로는 미검출.
//   6) fixed 헤더 가림 후보 — min-h-screen 래퍼의 첫 렌더 자식이 광고인데 page 서브트리·조상
//      layout 체인 어디에도 상단 패딩 토큰(pt-2x|pt-[|pt-header|var(--header))이 없음.
//      Header 는 fixed top-0(--header-height 72px), 루트 <main> 은 상단 패딩 없음.
// 한계: AST 파서가 아니라 정규식 휴리스틱이다. 오탐/미탐 가능 — 의도적 예외는
//       scripts/ad-audit-allow.json 에 {route, slot, reason} 으로 등재할 것(reason 필수).
//       --diff 의 광고 위 UI ERROR 예외는 {file, pattern, reason, approvalId}(4개 모두 필수).
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
// --base <ref>: diff 게이트의 기준 커밋(기본 HEAD = 작업 트리 미커밋분만). 이미 커밋된 배치를 사후 평가할 때
// `--diff --base <배치 직전 커밋>` (2026-09-12 리뷰: HEAD 고정이라 커밋 후 실행한 --diff 는 아무 삽입도 보지 못했다).
const BASE_IDX = process.argv.indexOf("--base");
const DIFF_BASE = BASE_IDX > -1 && process.argv[BASE_IDX + 1] ? process.argv[BASE_IDX + 1] : "HEAD";
if (!/^[\w./~^-]+$/.test(DIFF_BASE)) {
  console.error("--base 값이 올바르지 않습니다:", DIFF_BASE);
  process.exit(1);
}
// CI 판정 — GitHub Actions 는 CI=true 를 넣는다. "false"/"0" 은 로컬 취급.
const IN_CI = !!process.env.CI && !/^(0|false)$/i.test(process.env.CI);

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
  // text: 사용처 주변 ±수 줄 컨텍스트 — 조건부(늦은 마운트) 휴리스틱·쿠팡 size 추출용.
  const slots = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let m;
    AD_COMPONENT_RE.lastIndex = 0;
    while ((m = AD_COMPONENT_RE.exec(lines[i]))) {
      slots.push({
        name: m[1],
        line: i + 1,
        text: lines.slice(Math.max(0, i - 1), i + 4).join(" "),
      });
    }
  }
  // import 해석: 상대경로 + "@/" 별칭. .tsx 만 재귀 대상 (광고 JSX 는 .tsx 에만 존재).
  // 정적 import 와 dynamic `import("...")`(next/dynamic 지연 로드 포함) 모두 매칭 —
  // 기존 `import\s` 는 dynamic 형태를 놓쳐 지연 로드된 서브트리의 광고를 미탐했다.
  const imports = [];
  const importRe = /import\s*(?:\(\s*)?[^"'()]*["'](\.{1,2}\/[^"']+|@\/[^"']+)["']/g;
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
        usages.push({ slot, comp: s.name, file: f, line: s.line, text: s.text });
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
// 같은 배열에 항목 2종:
//   A) 슬롯 예외 {route, slot, reason} — 전 라우트 스캔 1)~4) 용(기존).
//   B) 광고 위 UI 예외 {file, pattern, reason, approvalId} — --diff 게이트의 ERROR 면제 전용.
//      file = 리포 상대 경로(정확히 일치), pattern = 추가된 줄(앞뒤 공백 제거)에 적용할 정규식 소스,
//      approvalId = 운영자 승인 ID(예: "A12 2026-09-25"). 넷 중 하나라도 비면 감사 자체를 중단한다.
const allow = [];
const uiAllow = [];
if (fs.existsSync(ALLOW_FILE)) {
  const raw = JSON.parse(fs.readFileSync(ALLOW_FILE, "utf8"));
  const filled = (v) => typeof v === "string" && v.trim() !== "";
  for (const a of raw) {
    if ("file" in a || "pattern" in a || "approvalId" in a) {
      if (!filled(a.file) || !filled(a.pattern) || !filled(a.reason) || !filled(a.approvalId)) {
        console.error(`allowlist(광고 위 UI) 항목에 file/pattern/reason/approvalId 필수: ${JSON.stringify(a)}`);
        process.exit(1);
      }
      let re;
      try {
        re = new RegExp(a.pattern);
      } catch (e) {
        console.error(`allowlist(광고 위 UI) pattern 정규식 오류: ${JSON.stringify(a)} — ${e.message}`);
        process.exit(1);
      }
      uiAllow.push({ ...a, re });
      continue;
    }
    if (!a.route || !a.slot || !a.reason) {
      console.error(`allowlist 항목에 route/slot/reason 필수: ${JSON.stringify(a)}`);
      process.exit(1);
    }
    allow.push(a);
  }
}
const isAllowed = (route, slot) =>
  allow.some((a) => a.route === route && a.slot === slot);

// ---------- 스캔 ----------
const errors = [];
const warns = [];
const infos = [];
const rel = (f) => path.relative(ROOT, f).split(path.sep).join("/");
// 신설 검출 5)·6) 입력 — 라우트별 (page 서브트리, layout 체인 서브트리) 파일 목록.
// SLOT dedup 과 같은 page→layout 해석을 재사용한다(§2-7: layout 이 제공하는 경우 많음).
const routeFiles = []; // {route, page, pageFiles, layoutFiles}

for (const page of findPages(APP)) {
  const route = routeOf(page);
  const pageFiles = collectSubtree(page);
  const pageUse = slotUsages(pageFiles);
  const layoutFiles = ancestorLayouts(page).flatMap((l) => collectSubtree(l));
  const layoutUse = slotUsages(layoutFiles);
  routeFiles.push({ route, page, pageFiles, layoutFiles });

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
  //    ⚠️ 방향 한계: "page 가 이긴다"는 가정은 page 유닛이 첫 렌더에 함께 마운트될
  //    때만 확실하다. showResult 등 조건부로 늦게 마운트되는 유닛은 layout 쪽이
  //    먼저 등록해 반대로 layout 이 이길 수 있다 — 정규식 휴리스틱으로 조건부
  //    렌더가 의심되는 사용처는 INFO 에 '늦은 마운트 — layout 승리 가능' 을 병기.
  const layoutSlots = new Map();
  for (const u of layoutUse.filter((u) => u.slot !== "COUPANG"))
    if (!layoutSlots.has(u.slot)) layoutSlots.set(u.slot, u);
  for (const [slot] of bySlot) {
    if (layoutSlots.has(slot) && !isAllowed(route, slot)) {
      const lu = layoutSlots.get(slot);
      const pu = bySlot.get(slot)[0];
      const lateMount =
        /showResult|&&\s*[(<]|\?\s*[(<]/.test(pu.text || "");
      infos.push(
        `${route}  [${slot}] page(${rel(pu.file)}:${pu.line}) 가 layout(${rel(lu.file)}:${lu.line}) 폴백을 대체${lateMount ? " ※늦은 마운트 — layout 승리 가능" : ""}`
      );
    }
  }

  // 3) 쿠팡 3회+ (dedup 캡 2회 — 3번째부터 무음 차단되어 무의미한 코드)
  const coupangCount = pageUse.concat(layoutUse).filter((u) => u.slot === "COUPANG").length;
  if (coupangCount >= 3 && !isAllowed(route, "COUPANG")) {
    warns.push(`${route}  [COUPANG] ${coupangCount}회 배치 — 캡 2회 초과분은 렌더 안 됨`);
  }

  // 4) 쿠팡 동일 사이즈키 2회 — CoupangBannerCore dedup 은 같은 사이즈 재등록을
  //    무음 차단한다(sizes.includes(sizeKey)). 캡(2회) 이내라도 같은 사이즈 2곳이면
  //    한쪽은 렌더되지 않는다. 신설 검출이므로 INFO(비차단) — ERROR 로 올리면
  //    prebuild 가 기존 배치 상태에서 막힌다. 사이즈 추출은 ±수 줄 정규식 휴리스틱:
  //    size="…" > responsive desktop:"…" > 기본값 leaderboard. 합성 래퍼
  //    (PageFooterAds)는 내부 사이즈 미상이라 제외.
  const coupangSizeOf = (u) => {
    if (u.comp !== "CoupangBanner" && u.comp !== "AffiliateSlot") return null;
    const t = u.text || "";
    const mSize = t.match(/size=["']([A-Za-z0-9_-]+)["']/);
    if (mSize) return mSize[1];
    const mResp = t.match(/desktop:\s*["']([A-Za-z0-9_-]+)["']/);
    if (mResp) return mResp[1];
    return "leaderboard"; // CoupangBannerCore 기본값
  };
  const coupangBySize = new Map();
  for (const u of pageUse.concat(layoutUse).filter((u) => u.slot === "COUPANG")) {
    const key = coupangSizeOf(u);
    if (!key) continue;
    if (!coupangBySize.has(key)) coupangBySize.set(key, []);
    coupangBySize.get(key).push(u);
  }
  for (const [sizeKey, us] of coupangBySize) {
    const uniq = [...new Set(us.map((u) => `${rel(u.file)}:${u.line}`))];
    if (uniq.length >= 2 && !isAllowed(route, "COUPANG")) {
      infos.push(
        `${route}  [COUPANG:${sizeKey}] 동일 사이즈키 ${uniq.length}회 — 뒤쪽 무음 차단: ${uniq.join(" vs ")}`
      );
    }
  }
}

// ---------- 5)·6) 신설 INFO 전용 검출 (승격·자동수정 금지, exit 코드 불변) ----------
// 별도 배열에 담아 기존 INFO 기준선(page→layout 폴백·쿠팡 사이즈키) 집계와 섞이지 않게 한다.
const adjacencyInfos = []; // {file, line, comp, triggerLine, trigger}
const headerInfos = []; // {route, file, line, comp}

const readLines = (f) => {
  try {
    return fs.readFileSync(f, "utf8").split("\n");
  } catch {
    return [];
  }
};
// 주석 줄(JSX {/* */}·// )은 트리거 판정에서 제외 — "공유 섹션" 류 주석 오탐 방지
const isCommentLine = (s) => /^\s*(\{\s*\/\*|\/\/|\/\*|\*)/.test(s);

// 5) 우발 클릭 인접 후보 — 트리거는 실제 상호작용 요소만. 래퍼 마진 클래스(mt-0~2 등)는
//    AdSlot 자체 margin 1.5rem(AdPlacement.tsx AdSlot style)·NextActions 자체 mt-8 이 있어
//    단독 근거로 약하므로 트리거에서 제외한다(검증 노트 1).
// 2026-09-25 트리거 확장(감사 ADS-03): 9/9 이후 30곳에 들어간 ResultSharePanel·PrivateFeedback 과
// 폼 요소 select·textarea 를 추가. 기준선 비교가 끊기지 않게 확장 전 정규식(LEGACY) 집계도 함께 출력한다
// (확장 직전 44건 — docs/ad-experiments.md 기준선 41건 대비 증가분 기록은 B5 문서 배치).
const ADJ_TRIGGER_RE_LEGACY =
  /<button\b|<input\b|role=["']tab["']|<(?:Auto)?ShareSection\b|<ShareButtons\b|<FavoritesButton\b/;
const ADJ_TRIGGER_RE = new RegExp(
  ADJ_TRIGGER_RE_LEGACY.source + "|<ResultSharePanel\\b|<PrivateFeedback\\b|<select\\b|<textarea\\b"
);
const ADJ_WINDOW = 3;
const scannedFiles = new Set();
for (const r of routeFiles) for (const f of r.pageFiles.concat(r.layoutFiles)) scannedFiles.add(f);
const scanAdjacency = (triggerRe) => {
  const out = [];
  for (const f of scannedFiles) {
    const lines = readLines(f);
    for (const s of parseFile(f).slots) {
      const i = s.line - 1;
      let hit = null;
      for (let j = Math.max(0, i - ADJ_WINDOW); j <= Math.min(lines.length - 1, i + ADJ_WINDOW); j++) {
        if (isCommentLine(lines[j])) continue;
        // 같은 줄이면 광고 태그 자체는 제외하고 나머지 텍스트만 검사
        const probe = j === i ? lines[j].replace(AD_COMPONENT_RE, "") : lines[j];
        const m = probe.match(triggerRe);
        if (m) {
          hit = { triggerLine: j + 1, trigger: m[0] };
          break;
        }
      }
      if (hit) out.push({ file: f, line: s.line, comp: s.name, ...hit });
    }
  }
  return out;
};
adjacencyInfos.push(...scanAdjacency(ADJ_TRIGGER_RE));
const adjacencyLegacyCount = scanAdjacency(ADJ_TRIGGER_RE_LEGACY).length;

// 6) fixed 헤더 가림 후보 — page 서브트리(클라 컴포넌트 포함) 안의 `min-h-screen` 래퍼에서
//    첫 렌더 자식을 찾는다. 중간에 pt/py 토큰 없는 순수 래퍼 태그(div/section/main/article)는
//    건너뛴다(py-8 같은 소폭 패딩은 72px 헤더를 못 넘기므로 안전 토큰 아님 — 검증 노트 2).
//    상단 패딩 토큰은 page 서브트리 + 조상 layout 체인 서브트리 전체에서 찾는다.
const TOP_PAD_RE = /\bpt-2[0-9]\b|\bpt-\[|\bpt-header\b|var\(--header/;
const HEADER_WRAPPER_RE = /^\s*<(div|section|main|article)\b[^>]*>\s*$/;
const AD_TAG_RE = new RegExp("^\\s*<(" + Object.keys(SLOT_OF).join("|") + ")\\b");
// 전역 크롬은 패딩 판정에서 제외: Header.tsx 의 pt-header 는 fixed 모바일 메뉴 오버레이,
// Footer.tsx 의 pt-20 은 본문 아래 — 둘 다 광고가 놓이는 본문 흐름의 상단 패딩이 아니다.
const CHROME_RE = /[\\/]components[\\/](Header|Footer)\.tsx$|[\\/]components[\\/]header[\\/]/;
const hasTopPad = (files) =>
  files.some((f) => !CHROME_RE.test(f) && TOP_PAD_RE.test(readLines(f).join("\n")));
const headerSeen = new Set();
for (const r of routeFiles) {
  const chain = r.pageFiles.concat(r.layoutFiles);
  let padded = null; // 지연 계산
  for (const f of r.pageFiles) {
    const lines = readLines(f);
    for (let i = 0; i < lines.length; i++) {
      if (!/\bmin-h-screen\b/.test(lines[i]) || !/^\s*</.test(lines[i])) continue;
      // 여는 태그 끝(>) 까지 전진 (여러 줄 className 대응). 자기 닫힘(/>)이면 자식 없음.
      let k = i;
      while (k < lines.length && !/>\s*$/.test(lines[k])) k++;
      if (k >= lines.length || /\/>\s*$/.test(lines[k])) continue;
      // 첫 렌더 자식 탐색
      let child = -1;
      let hops = 0;
      for (let j = k + 1; j < lines.length; j++) {
        const ln = lines[j];
        if (!ln.trim() || isCommentLine(ln)) continue;
        if (HEADER_WRAPPER_RE.test(ln) && !TOP_PAD_RE.test(ln) && hops < 2) {
          hops++;
          continue;
        }
        child = j;
        break;
      }
      if (child < 0) continue;
      const m = lines[child].match(AD_TAG_RE);
      if (!m) continue;
      if (padded === null) padded = hasTopPad(chain);
      if (padded) continue;
      const key = `${rel(f)}:${child + 1}`;
      if (headerSeen.has(key)) continue;
      headerSeen.add(key);
      headerInfos.push({ route: r.route, file: f, line: child + 1, comp: m[1], hops });
    }
  }
}

// --diff 공통: git diff 실행. 실패(얕은 clone 에 base 커밋 없음·잘못된 ref 등)를 삼키면 diff 가 빈
// 문자열이 되어 게이트가 조용히 통과한다 — CI 에서는 exit 2 로 끊고, 로컬은 WARN 으로 드러낸다.
let diffFailed = false;
const gitDiff = (context) => {
  try {
    // -c core.safecrlf=false: 작업 트리 LF/CRLF 경고(stderr 소음) 억제 — 결과 영향 없음
    return execSync(`git -c core.safecrlf=false diff -U${context} ${DIFF_BASE} -- "src/**/*.tsx"`, {
      cwd: ROOT,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
  } catch (e) {
    console.error(`git diff -U${context} ${DIFF_BASE} 실행 실패:`, e.message);
    if (IN_CI) {
      console.error(
        "CI 에서 diff 기준을 읽지 못함 — 광고 위 UI 게이트를 통과로 처리하지 않는다(exit 2). checkout fetch-depth: 0 과 --base 값을 확인할 것."
      );
      process.exit(2);
    }
    if (!diffFailed) {
      diffFailed = true;
      warns.push(`git diff 실행 실패(--base ${DIFF_BASE}) — 광고 위 UI 게이트가 아무것도 검사하지 못함, --base 값 확인`);
    }
    return "";
  }
};

// --diff: 신설 검출은 "증가분(신규 후보)"만 상세 출력 — git diff -U0 <base> 의 추가 줄 범위와 교차.
//         WARN 계층 추가 없음(INFO 유지). 기준선 후보는 count 줄로만 보인다.
const addedRanges = new Map(); // relFile -> [{from,to}]
if (DIFF_MODE) {
  const d0 = gitDiff(0);
  let cur = "";
  for (const ln of d0.split("\n")) {
    if (ln.startsWith("+++ b/")) {
      cur = ln.slice(6);
      if (!addedRanges.has(cur)) addedRanges.set(cur, []);
    } else if (ln.startsWith("+++ /dev/null")) {
      cur = "";
    }
    const h = cur && ln.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (h) {
      const from = Number(h[1]);
      const len = h[2] === undefined ? 1 : Number(h[2]);
      if (len > 0) addedRanges.get(cur).push({ from, to: from + len - 1 });
    }
  }
}
const isAddedLine = (f, line, slack = 0) => {
  const rs = addedRanges.get(rel(f));
  if (!rs) return false;
  return rs.some((r) => line + slack >= r.from && line - slack <= r.to);
};
const adjacencyNew = adjacencyInfos.filter(
  (a) => isAddedLine(a.file, a.line) || isAddedLine(a.file, a.triggerLine)
);
const headerNew = headerInfos.filter((h) => isAddedLine(h.file, h.line, ADJ_WINDOW));

const fmtAdj = (a) =>
  `${rel(a.file)}:${a.line} <${a.comp}> ↔ ${a.trigger} (:${a.triggerLine}) — AdSlot 자체 마진 1.5rem 감안, 실제 간격은 점검 필요`;
const fmtHdr = (h) =>
  `${h.route}  ${rel(h.file)}:${h.line} <${h.comp}> min-h-screen 첫 자식${h.hops ? `(래퍼 ${h.hops}단 경유)` : ""} — page·layout 체인에 상단 패딩 토큰 없음(헤더 72px fixed)`;

// ---------- --diff: 광고 위 새 UI 삽입 검출 ----------
const adLineRe = new RegExp("<(" + Object.keys(SLOT_OF).join("|") + ")\\b");
// JSX 태그 줄 판정 — `<` 앞이 줄머리·공백·{ ( & | ? : > 일 때만. Array<string>·useState<number> 같은
// 타입 제네릭(`y<`·`e<`)은 제외한다(2026-09-25: ERROR 승격에 맞춰 오탐 축소).
const isJsxLine = (s) => /(^|[\s{(&|?:>])<[A-Za-z]/.test(s);
// 7) 넓은 창용 — 줄이 JSX 여는 태그로 시작할 때만(`<Tag`·`{cond && <Tag`·`{x ? <Tag`). 문단 안 <strong> 같은
// 본문 문구 수정까지 세면 15줄 창이 잡음으로 덮인다(9/8~9/25 이력 재생에서 확인).
const isJsxStartLine = (s) => /^\s*(?:\{[^}]*(?:&&|\?)\s*\(?\s*)?<[A-Za-z]/.test(s);
// 광고 정의 파일 — 7) 넓은 창 후보에서 제외(내부 재배열은 광고 코드 변경 승인 절차가 따로 잡는다)
const AD_DEF_FILE_RE = /AdPlacement\.tsx$|CoupangBanner\.tsx$|CoupangBannerCore\.tsx$|AffiliateSlot\.tsx$|PageFooterAds\.tsx$/;
const UI_ABOVE_WINDOW = 15; // 7) 넓은 창 줄 수
const uiAllowUsed = new Set(); // 실제로 면제에 쓰인 allowlist(광고 위 UI) 항목
const uiAllowHits = []; // ERROR 대신 승인 면제된 건 {file, line, text, adComp, approvalId}
const narrowHitKeys = new Set(); // 2줄 창 적중 광고 "file:line" — 7) 출력에서 ERROR 동일 건 표시용
const uiAboveInfos = []; // 7) {file, line, text, adLine, adComp, addedCount}
if (DIFF_MODE) {
  const lines = gitDiff(2).split("\n");
  // 1패스: 줄마다 {file, hunk, newNo}(새 파일 기준 줄 번호 — 추가·컨텍스트 줄만 유효)를 붙인다.
  // 헤더(---/+++)와 내용 줄('-- ' 로 시작하는 삭제 줄 등)은 헌크 안/밖 상태로 구분한다.
  const meta = [];
  let file = "";
  let inHunk = false;
  let hunk = -1;
  let newNo = 0;
  for (const ln of lines) {
    if (ln.startsWith("diff --git ")) {
      inHunk = false;
      file = "";
      meta.push(null);
      continue;
    }
    if (!inHunk && ln.startsWith("+++ ")) {
      file = ln.startsWith("+++ b/") ? ln.slice(6) : "";
      meta.push(null);
      continue;
    }
    const h = ln.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (h) {
      inHunk = true;
      hunk++;
      newNo = Number(h[1]);
      meta.push(null);
      continue;
    }
    if (!inHunk || !file) meta.push(null);
    else if (ln.startsWith("+") || ln.startsWith(" ")) meta.push({ file, hunk, newNo: newNo++ });
    else if (ln.startsWith("-")) meta.push({ file, hunk, newNo: 0 });
    else meta.push(null); // "\ No newline at end of file" 등
  }
  // 2패스
  for (let i = 0; i < lines.length; i++) {
    const m = meta[i];
    if (!m) continue;
    const ln = lines[i];
    const body = ln.slice(1);
    // (b) 추가된 JSX 줄 바로 아래 2줄(같은 헌크) 안에 기존(컨텍스트) 광고 줄 → ERROR.
    //     승인 면제는 allowlist {file, pattern, reason, approvalId} 만. 같은 광고에 대한 중복 보고는 1건으로.
    if (ln.startsWith("+") && isJsxLine(body) && !isCommentLine(body) && !adLineRe.test(body)) {
      for (let j = i + 1; j <= i + 2 && j < lines.length; j++) {
        const n = meta[j];
        if (!n || n.hunk !== m.hunk) break;
        const next = lines[j];
        if (!next.startsWith(" ") || isCommentLine(next.slice(1))) continue;
        const ad = next.match(adLineRe);
        if (!ad) continue;
        const key = `${m.file}:${n.newNo}`;
        if (narrowHitKeys.has(key)) break;
        narrowHitKeys.add(key);
        const text = body.trim();
        const ok = uiAllow.find((a) => a.file === m.file && a.re.test(text));
        if (ok) {
          uiAllowUsed.add(ok);
          uiAllowHits.push({ file: m.file, line: m.newNo, text, adComp: ad[1], approvalId: ok.approvalId });
        } else {
          errors.push(
            `${m.file}:${m.newNo} 광고 <${ad[1]}>(:${n.newNo}) 직상단에 새 UI 삽입 (${text.slice(0, 60)}…) — 2026-08-16 규칙: 새 UI 는 광고 아래에. 운영자 승인 건만 ad-audit-allow.json {file, pattern, reason, approvalId} 등재`
          );
        }
        break;
      }
    }
    // (d) 광고 줄 삭제만 있고 인접한 추가가 없으면 유닛 소실 의심 — WARN 유지(재배열 오탐 이력)
    if (ln.startsWith("-") && adLineRe.test(ln)) {
      const window = lines.slice(Math.max(0, i - 4), i + 5);
      const readded = window.some((w) => w.startsWith("+") && adLineRe.test(w));
      if (!readded) warns.push(`${m.file}: 광고 유닛 삭제 감지, 대체 추가 없음 — 의도 확인 필요`);
    }
  }

  // 7) 광고 위 UI 후보(넓은 창, INFO 전용) — 추가된 JSX 줄 아래 15줄 안의 첫 광고 태그가 기존 줄이면 후보.
  //    그 사이에 다른 광고가 있으면 그 광고가 "첫 광고"가 되므로 중간 광고 없음 조건이 자동으로 성립한다.
  //    작업 트리 파일을 직접 읽는다(-U0 추가 범위와 같은 새 파일 기준 줄 번호). 광고별 1건으로 묶는다.
  for (const [relFile, ranges] of addedRanges) {
    if (!ranges.length || AD_DEF_FILE_RE.test(relFile)) continue;
    const src = readLines(path.join(ROOT, relFile));
    const added = new Set();
    for (const r of ranges) for (let k = r.from; k <= r.to; k++) added.add(k);
    const byAd = new Map();
    for (const a of [...added].sort((x, y) => x - y)) {
      const t = src[a - 1] || "";
      if (!isJsxStartLine(t) || isCommentLine(t) || adLineRe.test(t)) continue;
      for (let j = a; j < Math.min(src.length, a + UI_ABOVE_WINDOW); j++) {
        if (isCommentLine(src[j])) continue;
        const ad = src[j].match(adLineRe);
        if (!ad) continue;
        if (!added.has(j + 1)) {
          const key = `${relFile}:${j + 1}`;
          const cur = byAd.get(key);
          if (cur) cur.addedCount++;
          else byAd.set(key, { file: relFile, line: a, text: t.trim(), adLine: j + 1, adComp: ad[1], addedCount: 1 });
        }
        break;
      }
    }
    uiAboveInfos.push(...byAd.values());
  }
}

// ---------- 리포트 ----------
console.log(`\n=== 광고 배치 정적 감사${DIFF_MODE ? " (+diff 게이트)" : ""} ===\n`);
for (const e of errors) console.log("ERROR  " + e);
for (const w of warns) console.log("WARN   " + w);
if (process.argv.includes("--verbose")) {
  for (const i of infos) console.log("INFO   " + i);
} else if (infos.length) {
  console.log(
    `INFO   ${infos.length}건 — page→layout 폴백 대체·쿠팡 동일 사이즈키 등 (--verbose 로 상세)`
  );
}
// 신설 INFO 2종 — 안정 count 줄(기준선 비교용) + 상세는 --verbose(전체) 또는 --diff(증가분만).
console.log(
  `INFO   우발 클릭 인접 후보 ${adjacencyInfos.length}건 / fixed 헤더 가림 후보 ${headerInfos.length}건 (INFO 전용 — 수리는 승인 큐, --verbose 상세)`
);
// 트리거 확장 전후 비교 줄 — 기준선(docs/ad-experiments.md) 연속성 유지용
console.log(
  `INFO   우발 클릭 인접 후보 트리거 확장 전(2026-09-25 이전 정규식) ${adjacencyLegacyCount}건 → 확장 후 ${adjacencyInfos.length}건 (+ResultSharePanel·PrivateFeedback·select·textarea)`
);
if (process.argv.includes("--verbose")) {
  for (const a of adjacencyInfos) console.log("INFO   [인접] " + fmtAdj(a));
  for (const h of headerInfos) console.log("INFO   [헤더가림] " + fmtHdr(h));
} else if (DIFF_MODE) {
  console.log(
    `INFO   [diff] 신규 후보 — 우발 클릭 인접 ${adjacencyNew.length}건 / fixed 헤더 가림 ${headerNew.length}건`
  );
  for (const a of adjacencyNew) console.log("INFO   [diff][인접] " + fmtAdj(a));
  for (const h of headerNew) console.log("INFO   [diff][헤더가림] " + fmtHdr(h));
}
if (DIFF_MODE) {
  // 7) 넓은 창 후보 — INFO 전용(오탐률 측정 단계). --verbose 여부와 무관하게 diff 모드면 상세 출력.
  console.log(
    `INFO   [diff] 광고 위 UI 후보(${UI_ABOVE_WINDOW}줄 창, INFO 전용) ${uiAboveInfos.length}건`
  );
  for (const u of uiAboveInfos) {
    const dup = narrowHitKeys.has(`${u.file}:${u.adLine}`) ? " ※2줄 창 ERROR/면제와 동일 건" : "";
    console.log(
      `INFO   [diff][광고위UI] ${u.file}:${u.line} ${u.text.slice(0, 50)} → 기존 <${u.adComp}> :${u.adLine} (${u.adLine - u.line}줄 아래, 추가 JSX ${u.addedCount}줄)${dup}`
    );
  }
  for (const h of uiAllowHits) {
    console.log(`INFO   [diff][승인 면제] ${h.file}:${h.line} <${h.adComp}> 직상단 — approvalId ${h.approvalId}`);
  }
}
if (allow.length) console.log(`\nallowlist ${allow.length}건 적용 (scripts/ad-audit-allow.json)`);
if (uiAllow.length) {
  console.log(
    `allowlist(광고 위 UI 승인 면제) ${uiAllow.length}건 등재${DIFF_MODE ? ` · 이번 diff 에서 사용 ${uiAllowUsed.size}건` : ""}`
  );
}
console.log(
  `\n결과: ERROR ${errors.length}건 / WARN ${warns.length}건${errors.length ? " — 커밋 전 수정 또는 allowlist(사유 필수) 등재" : " — 통과"}`
);
process.exit(errors.length ? 1 : 0);
