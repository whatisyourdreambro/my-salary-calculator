// scripts/health-check.mjs
// 주간 프로덕션 헬스체크 — "사용자에겐 정상, 크롤러에겐 고장" 유형의 조용한 사고를 조기 발견.
// 배경: 2026-08에 /salary 전량 500(수개월 미발견)·edge 전 라우트 일시 404(스텁 워커) 실측.
// 사용: node scripts/health-check.mjs   (모두 통과 시 exit 0, 실패 있으면 exit 1)
// 주의: 브라우저 UA 필수(기본 curl·node UA는 CF가 403 차단). 배포 직후 몇 분간은 전파 중이라
//       오탐 가능 — 실패 시 5분 뒤 1회 재확인 후 판단할 것.
// 시즌 세트(S1-1, 2026-09-11): 프로덕션 /table/2026/annual 의 data-season-key 가 '오늘 키'와
//       같은지 검사한다(경계표 scripts/season-key.mjs = src/lib/seasonKey.ts 사본, 오버라이드는
//       TS 파일에서 읽음).
// 원본/엣지 분리(CRAWL-11, 2026-09-26): 9/25 캐시 규칙 B 이후 HTML 도 엣지에 캐시된다(1h, /salary/* 4h).
//       그래서 시즌 키·날짜 게이트 검사는 두 번 가져온다 — 원본 = ?hc=<실행 시각>(쿼리가 다르면 캐시 키가
//       달라 MISS), 엣지 = 평문 URL. FAIL 문구가 "빌드 미갱신"(원본부터 틀림 → 재생성·재배포)과
//       "퍼지 누락"(원본은 맞고 엣지만 구버전 → CF 퍼지)을 가른다. 두 쪽의 cf-cache-status·Age 를 찍는다.
// 게시 대기 감시(B20, 2026-11-01 운영자 승인 11번): main 에 합쳐졌는데 48시간 넘게 사이트에 게시되지 않은 변경
//       (docs/** · *.md 만 바뀐 경우 제외)이 있으면 FAIL → 주간 ci health 실패 메일. 아래 '게시 대기 감시' 절.

import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve } from "node:path";
import qaHttp from "./lib/qa-production-http.cjs";
import { NATIVE_RELEASE_PATH, validateNativeRelease } from "../cloudflare/pages-native-release.mjs";
import {
  isJanManualWindow,
  isSeasonKeyExpired,
  pickSeasonKey,
  readSeasonKeyOverride,
  resolveSeasonKey,
} from "./season-key.mjs";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 MoneySalary-QA/1.0";
const BASE = "https://www.moneysalary.com";

// ── 시즌 키 기대값 — 오늘(KST) 자동 키, 단 src/lib/seasonKey.ts 의 SEASON_KEY_OVERRIDE 가 우선 ──
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const NOW = new Date();
const SEASON_OVERRIDE = readSeasonKeyOverride(ROOT);
const EXPECTED_SEASON_KEY = resolveSeasonKey(NOW, SEASON_OVERRIDE.override);
const SEASON_MARKER = `data-season-key="${EXPECTED_SEASON_KEY}"`;

// 원본 판정용 캐시 우회 쿼리 — 실행마다 값이 달라 엣지 캐시 키가 새로 생긴다(9/26 실측: ?hc= 는 MISS, 평문은 HIT)
const HC = Date.now();
const withHc = (path) => `${path}${path.includes("?") ? "&" : "?"}hc=${HC}`;

/** 시즌 마커 불일치 시 본문의 실제 키와 기대 키 */
function diagnoseSeasonKey(html) {
  const m = html.match(/data-season-key="([A-Z]{3})"/);
  const live = m ? m[1] : "(속성 없음 — S1-1 미배포?)";
  return (
    `본문 키=${live}, 기대=${EXPECTED_SEASON_KEY}` +
    (SEASON_OVERRIDE.override ? `(오버라이드 ${SEASON_OVERRIDE.override})` : `(자동 ${pickSeasonKey(NOW)})`)
  );
}

/** 시즌 키 "빌드 미갱신" 조치 */
const SEASON_BUILD_FIX =
  "tsx scripts/gen-season-key.ts 실행 후 커밋(또는 src/lib/seasonKey.ts 의 SEASON_KEY_OVERRIDE 설정) → CI 초록 → 운영자 Actions 'Pages · 승인 후 게시'";

// [경로, 기대 상태코드, 본문 필수 문자열(선택), 설명, 마커 불일치 시 진단 함수(선택, html → string),
//  기대 Location 정규식(선택 — 리다이렉트 목적지까지 검사, redirect: "manual" 이라 헤더가 그대로 보인다),
//  기대 Content-Type 정규식(선택)]
const CHECKS = [
  // 핵심 정적 페이지
  ["/", 200, "연봉", "홈"],
  ["/salary-db/samsung-electronics", 200, "금융감독원", "회사 페이지 + 공시 섹션"],
  ["/salary-db/compare/naver-vs-kakao", 200, null, "비교 페이지"],
  ["/calc/samsung-bonus", 200, null, "삼성 성과급 계산기(#1 수익 페이지)"],
  ["/calc/celltrion-bonus", 200, null, "셀트리온 계산기"],
  ["/credit-card-deduction-2026", 200, null, "신용카드 공제 계산기"],
  ["/rent-tax-credit-2026", 200, null, "월세 공제 계산기"],
  ["/medical-tax-credit-2026", 200, null, "의료비 공제 계산기"],
  ["/industry/semiconductor", 200, null, "업종 허브"],
  ["/industry/startup", 200, null, "스타트업 허브"],
  ["/job/nurse", 200, null, "직업 페이지"],
  // /salary 정적 격자 (2026-08 500 사건 재발 감시)
  ["/salary/50000000", 200, "실수령", "연봉 격자 페이지"],
  ["/salary/103000000", 200, null, "연봉 격자(표 행 전용값)"],
  // 9/11 S1-5 부터 미들웨어(resolveSalaryRedirect)가 격자 밖 금액을 가장 가까운 정적 금액으로 308 한다 —
  // 종전 기대값 404 는 그 뒤 주간 점검을 매번 FAIL 시켰다(2026-09-25 B1). 200 이면 정적화 깨짐.
  // 목적지 12,500,000 은 src/lib/__tests__/salaryRedirect.test.ts 가 정적 격자와 대조한다.
  ["/salary/12345678", 308, null, "격자 밖 → 가장 가까운 정적 금액 308", null, /\/salary\/12500000$/],
  // 한글 슬러그 (실존 슬러그만! 임의 슬러그로 바꾸지 말 것 — 2026-08-08 오판 사례)
  ["/glossary/" + encodeURIComponent("국민연금"), 200, null, "글로서리 한글 슬러그"],
  ["/glossary/" + encodeURIComponent("원천징수"), 200, null, "글로서리 한글 슬러그 2"],
  [
    "/qna/" + encodeURIComponent("퇴직금-중간정산-아무-때나-받을-수-있나요"),
    200,
    null,
    "Q&A 한글 슬러그",
  ],
  // edge 워커 생존 감시 (전부 404면 스텁 워커 사고)
  // 2026-09-28 감사 S31: /api/ 는 엣지 캐시 규칙 밖이라 프로브마다 워커가 표를 만든다(새 isolate 면 전 행 세액 계산).
  // 종전 type=annual(2,401행, 로컬 V8 5~7ms)은 CF CPU 10ms 한도(1102)와 여유가 작아, 워커는 살아 있는데 프로브만
  // 503 이 나는 오탐 여지가 있었다 → 가장 가벼운 주급표(57행, 로컬 0.1ms 미만)로 바꿈. 워커 생존 신호라는 목적은 같다.
  ["/api/salary-table?type=weekly", 200, null, "edge API (워커 생존 신호)"],
  [
    "/api/og?type=salary&amount=50000000&net=3300000",
    200,
    null,
    "OG 이미지 (카톡 공유 카드 — 엣지 캐시본)",
  ],
  // OG 실시간 렌더 생존 — 위 항목은 엣지 캐시(24h)가 HIT 로 답해 워커가 죽어도 PASS 할 수 있다.
  // 캐시 우회 쿼리로 워커가 지금 PNG 를 그리는지 본다(1102·503 이면 FAIL).
  [
    withHc("/api/og?type=salary&amount=50000000&net=3300000"),
    200,
    null,
    "OG 이미지 실시간 렌더 (캐시 우회 — 워커 생존)",
    null,
    null,
    /^image\/png\b/,
  ],
  // SEO 인프라
  ["/sitemap.xml", 200, "<loc>", "사이트맵"],
  ["/rss.xml", 200, "<rss", "RSS"],
  ["/robots.txt", 200, null, "robots"],
];

// 원본/엣지 분리 검사 — 빌드 시점에 굳는 값(시즌 키·날짜 게이트)의 교체 감시. 두 번 가져온다:
//   원본 = withHc(path) — 캐시 키가 새로 생겨 MISS, Pages 가 지금 내주는 빌드
//   엣지 = path 그대로 — 방문자·크롤러가 받는 캐시본
// 판정: 원본 틀림 → "빌드 미갱신", 원본 맞음 + 엣지 틀림 → "퍼지 누락".
// 날짜 게이트(예: 10/1 09:10 재빌드) 검사를 추가할 때도 여기에 {path, expect, marker, desc, diagnose, fixBuild} 로 넣는다.
const ORIGIN_EDGE_CHECKS = [
  // 시즌 세트 만료 감시 (S1-1) — 표 페이지 SeasonalLinks 섹션의 data-season-key == 오늘 키.
  // 9/25 규칙 B 부터 이 경로도 엣지 캐시(HTML 1h)된다 — 종전 주석 "이 경로는 엣지 캐시 없음"은 더 이상 사실이 아님.
  {
    path: "/table/2026/annual",
    expect: 200,
    marker: SEASON_MARKER,
    desc: `시즌 세트 키 == 오늘 키 ${EXPECTED_SEASON_KEY} (HTML 엣지 캐시 1h)`,
    diagnose: diagnoseSeasonKey,
    fixBuild: SEASON_BUILD_FIX,
  },
  // 엣지 캐시 경로(/salary/* 14400s)에서도 대조 — 경계일 이후 배포해도 최대 4h 구 세트가 남는 것을 잡는다(2026-09-12 리뷰).
  // 격자 위 금액만 유효(dynamicParams=false) — 5,000만은 정적 격자 고정값.
  {
    path: "/salary/50000000",
    expect: 200,
    marker: SEASON_MARKER,
    desc: `시즌 세트 키 == 오늘 키 ${EXPECTED_SEASON_KEY} (엣지 캐시 경로 /salary/* 4h)`,
    diagnose: diagnoseSeasonKey,
    fixBuild: SEASON_BUILD_FIX,
  },
];

const results = [];
let failed = 0;

/** 한 번 가져오기 — 본문·캐시 헤더까지. 예외는 { error } 로 돌려준다(throw 안 함). */
export async function fetchPage(path, fetchFn = globalThis.fetch) {
  try {
    const res = await qaHttp.fetchProductionQaDocument(BASE + path, {
      fetchFn,
      headers: { "user-agent": UA },
      timeoutMs: 20000,
    });
    return {
      status: res.status,
      text: await res.text(),
      location: res.headers.get("location"),
      contentType: res.headers.get("content-type") ?? "",
      cache: res.headers.get("cf-cache-status"),
      age: res.headers.get("age"),
    };
  } catch (e) {
    return { error: e?.message ?? String(e) };
  }
}

const cacheInfo = (r) => (r.error ? "요청 실패" : `cf-cache-status=${r.cache ?? "-"} Age=${r.age ?? "-"}`);

async function check([path, expect, marker, desc, diagnose, expectedLocation, expectedType]) {
  const r = await fetchPage(path);
  if (r.error) {
    results.push({ ok: false, path, desc, detail: `요청 실패: ${r.error}` });
    failed++;
    return;
  }
  let ok = r.status === expect;
  let detail = `status=${r.status}(기대 ${expect})`;
  if (!ok && r.location) detail += ` Location=${r.location}`;
  if (ok && expectedLocation && !expectedLocation.test(r.location ?? "")) {
    ok = false;
    detail += ` Location=${r.location ?? "(없음)"} (기대 ${expectedLocation})`;
  }
  if (ok && expectedType && !expectedType.test(r.contentType)) {
    ok = false;
    detail += ` Content-Type=${r.contentType || "(없음)"} (기대 ${expectedType})`;
  }
  if (ok && marker && !r.text.includes(marker)) {
    ok = false;
    detail += ` 본문에 "${marker}" 없음`;
    if (diagnose) detail += ` — ${diagnose(r.text)}`;
  }
  // 캐시 우회 요청은 실제로 MISS 였는지 보이게 캐시 헤더를 함께 찍는다
  const info = path.includes("hc=") ? cacheInfo(r) : "";
  results.push({ ok, path, desc, detail: info ? `${detail} · ${info}` : detail, info });
  if (!ok) failed++;
}

async function checkOriginEdge({ path, expect, marker, desc, diagnose, fixBuild }) {
  const [origin, edge] = await Promise.all([fetchPage(withHc(path)), fetchPage(path)]);
  /** 한쪽 응답 판정 — kind: "error"(요청 실패) · "status"(상태코드) · "marker"(본문 값) */
  const judge = (r) => {
    if (r.error) return { ok: false, kind: "error", why: `요청 실패: ${r.error}` };
    if (r.status !== expect) {
      return {
        ok: false,
        kind: "status",
        why: `status=${r.status}(기대 ${expect})${r.location ? ` Location=${r.location}` : ""}`,
      };
    }
    if (marker && !r.text.includes(marker)) {
      return {
        ok: false,
        kind: "marker",
        why: `본문에 "${marker}" 없음${diagnose ? ` — ${diagnose(r.text)}` : ""}`,
      };
    }
    return { ok: true, kind: "ok", why: "" };
  };
  const o = judge(origin);
  const e = judge(edge);
  const info = `원본(?hc=) ${cacheInfo(origin)} · 엣지 ${cacheInfo(edge)}`;
  // 원본 요청이 HIT 면 캐시 우회가 안 된 것(캐시 규칙이 쿼리를 무시?) — 원본/엣지 구분을 믿을 수 없다
  const bustNote =
    origin.cache === "HIT" ? " (주의: 원본 요청도 HIT — 캐시 우회 실패, 원본/엣지 구분 불확실)" : "";

  let detail = "";
  if (!o.ok) {
    detail =
      o.kind === "marker"
        ? `빌드 미갱신 — 원본부터 틀림: ${o.why}. 조치: ${fixBuild ?? "재빌드·재배포 → CF 캐시 퍼지"}.`
        : `원본 응답 이상 — ${o.why}. 배포·워커 상태부터 확인.`;
  } else if (!e.ok) {
    detail =
      e.kind === "marker"
        ? `퍼지 누락 — 원본은 맞고 엣지 캐시가 구버전: ${e.why}. 조치: CF 캐시 퍼지(이 URL 또는 Purge Everything) 후 재확인` +
          `${edge.age ? ` — 그냥 두면 캐시 만료까지 구버전 노출(현재 Age ${edge.age}s)` : ""}.`
        : `엣지 응답 이상 — 원본은 정상: ${e.why}.`;
  }
  const ok = o.ok && e.ok;
  results.push({ ok, path, desc, detail: `${detail}${bustNote} [${info}]`, info: `${info}${bustNote}` });
  if (!ok) failed++;
}

// ── 게시 대기 감시 (B20 · P1-INFRA-03, 2026-11-01 운영자 승인 11번) ──
// 승인 문구: main 에 합쳐졌는데 48시간 넘게 사이트에 게시되지 않은 변경(문서만 바뀐 경우 제외)이 있으면 월요일 주간
// 점검이 실패 메일을 보낸다. 게시는 운영자가 Actions 'Pages · 승인 후 게시' 를 눌러야만 일어나서, 잊으면 조용히 밀린다.
//   운영 커밋 = /.well-known/moneysalary-release.json 의 commit. 비렌더링 GET 1회(쿼리 없이 — 쿼리가 붙으면 404),
//               형식은 cloudflare/pages-native-release.mjs 의 validateNativeRelease 로 검증.
//   남은 변경 = git diff --name-only <운영> HEAD 에서 docs/** 와 *.md 를 뺀 경로. 없으면 통과(같음 · 문서만 다름).
//   경과 시간 = 운영 커밋 뒤 main 1부모 이력에서 남은 경로를 처음 바꾼 커밋의 커밋 시각(%ct)부터.
//               HEAD 시각만 보면 뒤에 붙은 문서 커밋이 48시간 시계를 되돌린다. 그런 커밋을 못 찾으면 HEAD 시각.
// FAIL 은 GitHub Actions 의 main 실행(ci health — fetch-depth: 0 체크아웃, HEAD = GITHUB_SHA)에서만 낸다. 로컬 ·
// 다른 브랜치 실행은 운영 커밋 INFO 한 줄(오래된 로컬 main 과 비교하면 거짓 경보). 식별 파일을 못 읽거나 운영 커밋을
// git 이력과 비교하지 못하면 WARN 만 — 새 실패 메일 조건은 승인된 '48시간 미게시' 하나뿐이다.
export const RELEASE_DRIFT_LIMIT_HOURS = 48;
const PUBLISH_WORKFLOW = "Pages · 승인 후 게시";
const SHA40 = /^[a-f0-9]{40}$/;

/** 사이트에 안 나가는 문서 경로 — docs/** 와 *.md */
export function isDocsPath(path) {
  return path.startsWith("docs/") || path.endsWith(".md");
}

/**
 * 게시 대기 판정 — 순수 함수(테스트가 합성 입력으로 부른다).
 *   changed  = git diff --name-only <prod> <head> 경로
 *   since    = 운영 뒤 main 1부모 이력에서 남은(문서 제외) 경로를 처음 바꾼 커밋 { sha, time(unix 초) } — 없으면 null
 *   headTime = HEAD 커밋 시각(unix 초) — since 가 null 일 때 대신 쓴다
 *   behind   = 운영 뒤 main 커밋이 0개(HEAD 가 운영 커밋의 조상 — main 되감기)
 * @returns {{ state: "same" | "docs-only" | "behind" | "within" | "stale", ok: boolean, paths: string[],
 *   hours: number | null, since: string | null }}
 */
export function classifyReleaseDrift({
  prod,
  head,
  changed,
  since = null,
  headTime,
  behind = false,
  nowMs,
  limitHours = RELEASE_DRIFT_LIMIT_HOURS,
}) {
  if (prod === head) return { state: "same", ok: true, paths: [], hours: null, since: null };
  const paths = changed.filter((p) => !isDocsPath(p));
  if (!paths.length) return { state: "docs-only", ok: true, paths, hours: null, since: null };
  if (behind) return { state: "behind", ok: true, paths, hours: null, since: null };
  const from = since ?? { sha: head, time: headTime };
  const hours = (nowMs - from.time * 1000) / 3_600_000;
  if (!Number.isFinite(hours)) throw new Error("커밋 시각을 알 수 없음");
  const stale = hours > limitHours;
  return { state: stale ? "stale" : "within", ok: !stale, paths, hours: Math.max(0, hours), since: from.sha };
}

const outputLines = (text) => text.split(/\r?\n/).filter(Boolean);
const unixSeconds = (text) => {
  if (!/^\d+$/.test(text)) throw new Error(`커밋 시각 형식 오류: ${text}`);
  return Number(text);
};

/** git 실행기 — 셸 없이, core.quotePath=false(한글 경로를 따옴표 없이 그대로). 실패는 throw. */
export function gitRunner(cwd) {
  return (args) =>
    execFileSync("git", ["-c", "core.quotePath=false", ...args], {
      cwd,
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
}

/**
 * 판정 입력 수집 — git 만 쓴다(네트워크 없음). 운영 커밋이 clone 에 없으면(얕은 clone · 지워진 이력) throw.
 * @param {string} prod 운영 커밋 40자(validateNativeRelease 통과값)
 * @param {(args: string[]) => string} git
 */
export function collectReleaseDrift(prod, git) {
  if (!SHA40.test(prod)) throw new Error("운영 커밋 형식 오류");
  const head = git(["rev-parse", "--verify", "HEAD^{commit}"]).trim();
  if (!SHA40.test(head)) throw new Error(`HEAD 형식 오류: ${head}`);
  git(["cat-file", "-e", `${prod}^{commit}`]);
  const changed = outputLines(git(["diff", "--name-only", prod, head]));
  const headTime = unixSeconds(git(["log", "-1", "--format=%ct", head]).trim());
  const remaining = new Set(changed.filter((p) => !isDocsPath(p)));
  let since = null;
  let behind = false;
  if (prod !== head && remaining.size) {
    // 오래된 순. 커밋마다 1부모 대비 변경 경로를 보고, 남은 경로를 처음 건드린 커밋에서 멈춘다(보통 첫 커밋).
    const commits = outputLines(git(["log", "--first-parent", "--reverse", "--format=%H %ct", `${prod}..${head}`]));
    behind = commits.length === 0;
    for (const row of commits) {
      const [sha, ct] = row.split(" ");
      if (outputLines(git(["diff", "--name-only", `${sha}^1`, sha])).some((p) => remaining.has(p))) {
        since = { sha, time: unixSeconds(ct) };
        break;
      }
    }
  }
  return { head, changed, headTime, since, behind };
}

/** 운영 게시 식별 읽기 — 비렌더링 GET 1회, 리다이렉트는 따라가지 않는다. 실패는 { error } 로 돌려준다(throw 안 함). */
export async function readReleaseIdentity(fetchFn = globalThis.fetch) {
  try {
    const res = await qaHttp.fetchProductionQaDocument(BASE + NATIVE_RELEASE_PATH, {
      fetchFn,
      headers: { "user-agent": UA },
      timeoutMs: 20000,
    });
    if (res.status !== 200) {
      const location = res.headers.get("location");
      await res.body?.cancel().catch(() => {});
      return { error: `status=${res.status}${location ? ` Location=${location}` : ""}` };
    }
    const text = await res.text();
    if (text.length > 16384) return { error: `응답이 너무 큼(${text.length}자)` };
    return { value: validateNativeRelease(JSON.parse(text)) };
  } catch (e) {
    return { error: e?.message ?? String(e) };
  }
}

/** FAIL 판정은 GitHub Actions 의 main 실행에서만(스케줄 · 수동 실행 모두 GITHUB_REF=refs/heads/main 일 때) */
export function releaseDriftEnforced(env = process.env) {
  return env.GITHUB_ACTIONS === "true" && env.GITHUB_REF === "refs/heads/main";
}

/**
 * 게시 대기 점검 — 출력 줄과 판정. judged=false(INFO · WARN)는 PASS/FAIL 집계에 넣지 않는다.
 * 주입(테스트용): fetchFn · git · env · nowMs
 * @returns {Promise<{ judged: boolean, ok: boolean, lines: string[] }>}
 */
export async function checkReleaseDrift({
  fetchFn = globalThis.fetch,
  git = gitRunner(ROOT),
  env = process.env,
  nowMs = NOW.getTime(),
} = {}) {
  const id = await readReleaseIdentity(fetchFn);
  if (id.error) {
    return {
      judged: false,
      ok: true,
      lines: [`WARN  게시 대기 점검 생략 — 운영 게시 식별(${NATIVE_RELEASE_PATH})을 읽지 못함: ${id.error}`],
    };
  }
  const prod = id.value.commit;
  const prod7 = prod.slice(0, 7);
  if (!releaseDriftEnforced(env)) {
    return {
      judged: false,
      ok: true,
      lines: [`INFO  운영 게시 커밋 ${prod7} (빌드 ${id.value.buildId}) — 게시 대기 판정은 GitHub Actions 의 main 주간 점검에서만`],
    };
  }
  let input;
  let verdict;
  try {
    input = collectReleaseDrift(prod, git);
    verdict = classifyReleaseDrift({ prod, ...input, nowMs });
  } catch (e) {
    const why = String(e?.message ?? e).split(/\r?\n/)[0];
    return {
      judged: false,
      ok: true,
      lines: [`WARN  게시 대기 점검 생략 — 운영 커밋 ${prod7} 을 main 이력과 비교하지 못함: ${why}`],
    };
  }
  const head7 = input.head.slice(0, 7);
  const n = verdict.paths.length;
  switch (verdict.state) {
    case "same":
      return { judged: true, ok: true, lines: [`PASS  게시 대기 없음 — 운영 커밋 = main ${head7}`] };
    case "docs-only":
      return {
        judged: true,
        ok: true,
        lines: [`PASS  게시 대기 없음 — main ${head7} 과 운영 ${prod7} 의 차이는 문서(docs/** · *.md)뿐`],
      };
    case "behind":
      return {
        judged: false,
        ok: true,
        lines: [`WARN  게시 대기 판정 불가 — main ${head7} 이 운영 커밋 ${prod7} 보다 뒤(main 되감기?)`],
      };
    case "within":
      return {
        judged: true,
        ok: true,
        lines: [
          `PASS  게시 대기 ${Math.floor(verdict.hours)}시간(${RELEASE_DRIFT_LIMIT_HOURS}시간 이내) — main ${head7}, 운영 ${prod7}, 문서 제외 변경 파일 ${n}개`,
        ],
      };
    default:
      return {
        judged: true,
        ok: false,
        lines: [
          `FAIL 게시 대기: main ${head7} 이 ${Math.floor(verdict.hours)}시간째 미게시 — Actions '${PUBLISH_WORKFLOW}'`,
          `INFO  운영 커밋 ${prod7} · 첫 미게시 변경 ${verdict.since.slice(0, 7)} · 문서 제외 변경 파일 ${n}개 · ` +
            `ci(verify) 초록 확인 뒤 approved_commit=${input.head}`,
        ],
      };
  }
}

// 동시성 5로 실행
async function main() {
const queue = [
  ...CHECKS.map((c) => () => check(c)),
  ...ORIGIN_EDGE_CHECKS.map((c) => () => checkOriginEdge(c)),
];
const PAGE_TOTAL = queue.length;
await Promise.all(
  Array.from({ length: 5 }, async () => {
    while (queue.length) await queue.shift()();
  })
);
// 게시 대기 감시 — 페이지 점검 뒤 1회(운영 식별 GET 1회 + git). 판정한 경우에만 1건으로 센다.
const drift = await checkReleaseDrift();
if (drift.judged && !drift.ok) failed++;
const TOTAL = PAGE_TOTAL + (drift.judged ? 1 : 0);

console.log(`\n=== moneysalary.com 헬스체크 (${TOTAL}건) ===\n`);
for (const r of results) {
  const tail = r.ok ? (r.info ? `— ${r.info}` : "") : `— ${r.detail}`;
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.path}  [${r.desc}] ${tail}`);
}
for (const line of drift.lines) console.log(line);
// 시즌 키 참고 정보 (PASS/FAIL 과 별개 — 사람이 볼 알림)
if (SEASON_OVERRIDE.source !== "file") {
  console.log(
    `INFO  시즌 오버라이드를 읽지 못함(${SEASON_OVERRIDE.source}) — 자동 키 ${EXPECTED_SEASON_KEY} 로 대조함`,
  );
} else if (SEASON_OVERRIDE.override) {
  console.log(`INFO  시즌 오버라이드 활성: ${SEASON_OVERRIDE.override} (자동 키였다면 ${pickSeasonKey(NOW)})`);
}
if (!SEASON_OVERRIDE.override && isJanManualWindow(NOW)) {
  console.log(
    "WARN  1/2 이후인데 JAN 수동 전환 전 — 확인 2건(공무원 2027 확정·간소화 오픈일) 후 " +
      "src/lib/seasonKey.ts SEASON_KEY_OVERRIDE = \"JAN\" → tsx scripts/gen-season-key.ts → 커밋·배포",
  );
}
if (isSeasonKeyExpired(EXPECTED_SEASON_KEY, NOW)) {
  console.log(
    `WARN  시즌 세트 만료 — ${EXPECTED_SEASON_KEY} 세트 유효기간 경과(scripts/season-key.mjs SEASON_EXPIRES_KST). ` +
      "다음 세트 정의 또는 SEASON_KEY_OVERRIDE 변경 전까지 프로덕션은 만료 세트를 노출한다.",
  );
}
console.log(`\n결과: ${TOTAL - failed}/${TOTAL} 통과${failed ? ` — 실패 ${failed}건!` : ""}`);
process.exit(failed ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main();
}
