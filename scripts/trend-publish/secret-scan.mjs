// scripts/trend-publish/secret-scan.mjs — 비밀값 유출 게이트 (2026-09-26 R5 publisher)
//
// 사용: node scripts/trend-publish/secret-scan.mjs [--repo <dir>] [--base <ref>] [--trend-home <dir>] [--no-next]
// 검사 대상과 패턴 (정책: guardrails security.regexScan · exactValueScan):
//   1) git diff <base> 의 추가 줄 + 추적 안 된 새 파일 + TREND_HOME/logs — 정규식 전부
//      · 40자리 hex · 32자리 hex(IndexNow 키 파일 public/<32hex>.txt 는 예외)
//      · (crtfc_key|auth)=값 · 법령 API OC=값 · serviceKey=값 · X-Naver-Client-Id/Secret 헤더 값
//   2) .next(있을 때, cache 제외)·public — 키가 붙은 URL 패턴만(빌드 해시·previewModeId 같은 hex 는 정상이라 hex 규칙은 걸지 않는다)
//   3) 위 전부 — 지금 환경변수에 있는 비밀값(이름이 KEY·SECRET·TOKEN·PASSWORD·OC 로 끝남)의 원문·URL 인코딩·base64
// 적중하면 exit 1 + TREND_HOME/HALT 작성(사유만 — 값은 절대 쓰지 않는다). 출력은 가린 값(앞 4자 + 길이)만.
// 키는 환경변수로만 받는다 — 이 스크립트도 값을 파일·로그에 남기지 않는다.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const PATTERNS = [
  { id: "hex40", re: /\b[0-9a-f]{40}\b/g, keyed: false },
  { id: "hex32", re: /\b[0-9a-f]{32}\b/g, keyed: false },
  // 앞 글자가 영숫자·'.'·'$' 이면 제외 — 압축된 번들의 속성 대입(w.auth=[u.username…])은 키가 아니다(.next 실측 오탐)
  { id: "keyed-param", re: /(?<![\w.$])(?:crtfc_key|auth)=[^&\s"'<>]{8,}/gi, keyed: true },
  { id: "law-oc", re: /[?&]OC=[^&\s"'<>#]{2,}/g, keyed: true },
  { id: "service-key", re: /(?<![\w.$])serviceKey=[^&\s"'<>]{8,}/gi, keyed: true },
  { id: "naver-header", re: /X-Naver-Client-(?:Id|Secret)\s*[:=]\s*['"][^'"]+/gi, keyed: true },
];
/** IndexNow 키 파일 — 공개 키라 32자리 hex 예외 */
export const INDEXNOW_KEY_FILE = /^public\/[0-9a-f]{32}\.txt$/;
/**
 * 테스트·픽스처 경로의 뻔한 자리표시 값 — 레이더 URL 가림(redact) 테스트·법령 API 합성 픽스처가 일부러 심은 값(OC 값 test ·
 * planted_oc_1, auth 값 A_SECRET 따위). 두 조건을 모두 만족할 때만 키 붙은 URL 규칙에서 뺀다 — hex 규칙과 환경변수 실값 검사는 그대로.
 * (이 주석에도 '이름=값' 모양을 쓰지 않는다 — 이 파일은 테스트 경로가 아니라 스스로 걸린다)
 * (2026-09-26 통합 브랜치 전체 검사에서 레이더 테스트 자리표시 값 14건이 걸림 — 실제 키 모양이 아니다)
 */
export const TEST_FIXTURE_PATH = /^(?:scripts\/__tests__\/|src\/lib\/__tests__\/|scripts\/[\w-]+\/fixtures\/)/;
export const PLACEHOLDER_VALUE = /^(?:test|dummy|example|planted[_a-z0-9]*|raw_secret|[A-Z]{1,3}_SECRET)$/;
const keyedValue = (match) => match.replace(/^[?&]?[\w-]+\s*=\s*/, "");
export const SECRET_ENV_NAME = /(?:^|_)(?:KEY|SECRET|TOKEN|PASSWORD|OC)$/i;
const TEXT_EXT = /\.(?:html?|js|mjs|cjs|json|rsc|body|meta|txt|xml|css|map|md|log|jsonl|ts|tsx)$/i;

/** 값 가리기 — 앞 4자 + 길이 */
export function redact(value) {
  const s = String(value);
  return `${s.slice(0, 4)}…(${s.length}자)`;
}

/** 지금 환경변수의 비밀값과 그 변형(원문·URL 인코딩·base64) */
export function collectEnvSecrets(env = process.env) {
  const out = [];
  for (const [name, value] of Object.entries(env)) {
    if (!value || value.length < 8 || !SECRET_ENV_NAME.test(name)) continue;
    const forms = new Set([value, encodeURIComponent(value), Buffer.from(value, "utf8").toString("base64")]);
    out.splice(out.length, 0, { name, forms: [...forms] });
  }
  return out;
}

/**
 * 텍스트 한 덩어리 검사. file 은 저장소 상대 경로(예외 판정용), keyedOnly 면 키 붙은 URL 패턴만.
 * 반환: [{file, line, rule, preview}] — preview 는 가린 값.
 */
export function scanText(text, { file = "", keyedOnly = false, envSecrets = [] } = {}) {
  const hits = [];
  const lineOf = (idx) => text.slice(0, idx).split("\n").length;
  for (const p of PATTERNS) {
    if (keyedOnly && !p.keyed) continue;
    if (p.id === "hex32" && INDEXNOW_KEY_FILE.test(file)) continue;
    p.re.lastIndex = 0;
    for (const m of text.matchAll(p.re)) {
      if (p.keyed && p.id !== "naver-header" && TEST_FIXTURE_PATH.test(file) && PLACEHOLDER_VALUE.test(keyedValue(m[0]))) continue;
      hits.splice(hits.length, 0, { file, line: lineOf(m.index ?? 0), rule: p.id, preview: redact(m[0]) });
    }
  }
  for (const s of envSecrets) {
    for (const form of s.forms) {
      let at = text.indexOf(form);
      while (at >= 0) {
        hits.splice(hits.length, 0, { file, line: lineOf(at), rule: `env:${s.name}`, preview: redact(form) });
        at = text.indexOf(form, at + form.length);
      }
    }
  }
  return hits;
}

function git(repo, args) {
  return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
}

/** git diff 의 추가 줄 → 파일별 텍스트 */
export function addedLinesByFile(diffText) {
  const out = new Map();
  let file = "";
  for (const line of diffText.split("\n")) {
    if (line.startsWith("+++ ")) {
      file = line.slice(4).replace(/^b\//, "").trim();
      continue;
    }
    if (line.startsWith("+") && !line.startsWith("+++")) out.set(file, `${out.get(file) ?? ""}${line.slice(1)}\n`);
  }
  return out;
}

function* walkFiles(dir, skip = () => false) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (skip(p, name)) continue;
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) yield* walkFiles(p, skip);
    else yield { path: p, size: st.size };
  }
}

/** 전체 검사 — 적중 목록 */
export function runScan({ repo, base, trendHome, includeNext = true, env = process.env }) {
  const envSecrets = collectEnvSecrets(env);
  const hits = [];
  const diff = git(repo, ["diff", "--unified=0", "--no-color", "--no-ext-diff", base]);
  for (const [file, text] of addedLinesByFile(diff)) hits.splice(hits.length, 0, ...scanText(text, { file, envSecrets }));
  const untracked = git(repo, ["ls-files", "--others", "--exclude-standard"]).split("\n").map((s) => s.trim()).filter(Boolean);
  for (const file of untracked) {
    const abs = join(repo, file);
    try {
      if (statSync(abs).size > 4 * 1024 * 1024) continue;
      hits.splice(hits.length, 0, ...scanText(readFileSync(abs, "utf8"), { file, envSecrets }));
    } catch {
      /* 읽을 수 없는 파일은 건너뜀 */
    }
  }
  if (trendHome) {
    for (const f of walkFiles(join(trendHome, "logs"))) {
      if (f.size > 16 * 1024 * 1024) continue;
      hits.splice(hits.length, 0, ...scanText(readFileSync(f.path, "utf8"), { file: `TREND_HOME/${relative(trendHome, f.path).replace(/\\/g, "/")}`, envSecrets }));
    }
  }
  const scanBuilt = (dir, label) => {
    for (const f of walkFiles(dir, (p, name) => name === "cache" || name === "node_modules")) {
      if (!TEXT_EXT.test(f.path) || f.size > 16 * 1024 * 1024) continue;
      const text = readFileSync(f.path, "utf8");
      hits.splice(hits.length, 0, ...scanText(text, { file: `${label}/${relative(dir, f.path).replace(/\\/g, "/")}`, keyedOnly: true, envSecrets }));
    }
  };
  if (includeNext) scanBuilt(join(repo, ".next"), ".next");
  scanBuilt(join(repo, "public"), "public");
  return hits;
}

function arg(argv, name) {
  const i = argv.indexOf(name);
  return i > -1 ? argv[i + 1] : undefined;
}

export function main(argv = process.argv, env = process.env) {
  const repo = resolve(arg(argv, "--repo") ?? process.cwd());
  let base = arg(argv, "--base");
  if (!base) {
    try {
      git(repo, ["rev-parse", "--verify", "origin/main"]);
      base = "origin/main";
    } catch {
      base = "HEAD";
    }
  }
  const trendHome = arg(argv, "--trend-home") ?? env.TREND_HOME;
  let hits;
  try {
    hits = runScan({ repo, base, trendHome, includeNext: !argv.includes("--no-next"), env });
  } catch (e) {
    console.error(`[secret-scan] 검사 실패: ${e.message}`);
    return 2;
  }
  if (!hits.length) {
    console.log(`[secret-scan] 적중 0 (기준 ${base})`);
    return 0;
  }
  for (const h of hits.slice(0, 50)) console.error(`[secret-scan] ${h.file}:${h.line} ${h.rule} ${h.preview}`);
  if (trendHome && existsSync(trendHome)) {
    writeFileSync(join(trendHome, "HALT"), `secret-scan ${new Date().toISOString()} 적중 ${hits.length}건 (${[...new Set(hits.map((h) => h.rule))].join(", ")}) — 값은 기록하지 않음\n`, "utf8");
  }
  console.error(`[secret-scan] 적중 ${hits.length}건 — 커밋·발행 중지${trendHome ? " (HALT 작성)" : ""}`);
  return 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exit(main());
}
