// scripts/trend-publish/decide.mjs — 브리프 판정 기록 (2026-09-26 R5 publisher)
//
// 운영자 '결정 <slug> …' 을 세션이 옮겨 적는다:
//   node scripts/trend-publish/decide.mjs --slug <slug> --decision keep|update|retire [--at d28|reviewBy]
//        [--gsc-impr N --naver-clicks N] [--number-error]
//   node scripts/trend-publish/decide.mjs --pilot-verdict continue|halt     (2월 재개 전 D+28 파일럿 판정)
// - TREND_HOME/decisions.jsonl 에 한 줄 추가(daily·publish 의 '결정 대기' 가 이것으로 풀린다).
// - D+28 좀비: GSC 노출 0 + 네이버 클릭 0 → 철회(허브로 308) 권고. 같은 달 발행분의 좀비 비율 ≥ 50% → HALT.
// - 수치 오류(--number-error): 24시간 안에 publish-approved --update 로 고친다. 최근 30일 2건 이상 → HALT(운영자 재승인까지).
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { daysBetween, kstToday, loadConfig, readJsonl, resolvePaths, REPO_OF_SCRIPT } from "./daily.mjs";

const readJson = (p, fallback) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : fallback);

export const ZOMBIE_COHORT_HALT = 0.5;
export const NUMBER_ERRORS_HALT = 2;

/** 같은 달 발행분 가운데 D+28 좀비 비율 (분모 = 그 달 발행 수) */
export function zombieCohortRatio(ledger, decisions, month) {
  const cohort = ledger.filter((e) => e.publishedDate.slice(0, 7) === month);
  if (!cohort.length) return { ratio: 0, zombies: 0, size: 0 };
  const latest = new Map();
  for (const d of decisions) if (d.at === "d28" && d.slug) latest.set(d.slug, d);
  const zombies = cohort.filter((e) => latest.get(e.slug)?.zombie === true).length;
  return { ratio: zombies / cohort.length, zombies, size: cohort.length };
}

/** 최근 30일 수치 오류 건수 */
export function numberErrors30d(decisions, today) {
  return decisions.filter((d) => d.numberError && d.today && daysBetween(d.today, today) <= 30 && daysBetween(d.today, today) >= 0).length;
}

export function main(argv = process.argv, now = new Date()) {
  const get = (n) => {
    const i = argv.indexOf(n);
    return i > -1 ? argv[i + 1] : undefined;
  };
  const { home, wt } = resolvePaths({ trendHome: get("--trend-home"), worktree: get("--worktree") }, loadConfig(REPO_OF_SCRIPT));
  mkdirSync(home, { recursive: true });
  const today = get("--today") ?? kstToday(now);
  const path = join(home, "decisions.jsonl");
  const halt = (reason) => writeFileSync(join(home, "HALT"), `${now.toISOString()} ${reason}\n`, "utf8");

  const pilot = get("--pilot-verdict");
  if (pilot !== undefined) {
    if (!["continue", "halt"].includes(pilot)) {
      console.error("[decide] --pilot-verdict 는 continue 또는 halt");
      return 2;
    }
    appendFileSync(path, `${JSON.stringify({ ts: now.toISOString(), today, decision: "pilot-verdict", value: pilot })}\n`, "utf8");
    if (pilot === "halt") halt("D+28 파일럿 판정: 중지");
    console.log(`[decide] 파일럿 판정 ${pilot} 기록${pilot === "halt" ? " — HALT 작성" : ""}`);
    return 0;
  }

  const slug = get("--slug");
  const decision = get("--decision");
  const at = get("--at");
  if (!slug || !["keep", "update", "retire"].includes(decision ?? "") || (at !== undefined && !["d28", "reviewBy"].includes(at))) {
    console.error("사용: decide.mjs --slug <slug> --decision keep|update|retire [--at d28|reviewBy] [--gsc-impr N --naver-clicks N] [--number-error]");
    return 2;
  }
  const root = existsSync(join(wt, "scripts/trend-publish/ledger.json")) ? wt : REPO_OF_SCRIPT;
  const ledger = readJson(join(root, "scripts/trend-publish/ledger.json"), []);
  const entry = ledger.find((e) => e.slug === slug);
  if (!entry) {
    console.error(`[decide] 원장에 ${slug} 없음`);
    return 1;
  }
  const gscImpr = get("--gsc-impr") === undefined ? null : Number(get("--gsc-impr"));
  const naverClicks = get("--naver-clicks") === undefined ? null : Number(get("--naver-clicks"));
  if (at === "d28" && (gscImpr === null || naverClicks === null)) {
    console.error("[decide] --at d28 은 --gsc-impr 와 --naver-clicks 가 필요(GSC 실적 페이지·네이버 서치어드바이저 콘텐츠 노출)");
    return 2;
  }
  const zombie = at === "d28" && gscImpr === 0 && naverClicks === 0;
  const rec = { ts: now.toISOString(), today, slug, decision, at: at ?? null, gscImpr, naverClicks, numberError: argv.includes("--number-error"), zombie };
  appendFileSync(path, `${JSON.stringify(rec)}\n`, "utf8");
  const decisions = readJsonl(path);
  const lines = [`[decide] ${slug}: ${decision}${at ? ` @${at}` : ""}${zombie ? " — D+28 좀비(노출 0·클릭 0)" : ""}`];
  if (zombie && decision !== "retire") lines.splice(lines.length, 0, "  권고: 좀비는 철회(허브로 308) — '철회 <slug>'");
  const cohort = zombieCohortRatio(ledger, decisions, entry.publishedDate.slice(0, 7));
  if (cohort.size && cohort.ratio >= ZOMBIE_COHORT_HALT) {
    halt(`${entry.publishedDate.slice(0, 7)} 발행분 좀비 ${cohort.zombies}/${cohort.size} ≥ 50%`);
    lines.splice(lines.length, 0, `  HALT: ${entry.publishedDate.slice(0, 7)} 발행분 좀비 ${cohort.zombies}/${cohort.size} (≥ 50%) — 운영자 검토 전까지 중지`);
  }
  const errors = numberErrors30d(decisions, today);
  if (errors >= NUMBER_ERRORS_HALT) {
    halt(`최근 30일 수치 오류 ${errors}건 ≥ ${NUMBER_ERRORS_HALT}`);
    lines.splice(lines.length, 0, `  HALT: 최근 30일 수치 오류 ${errors}건 — 운영자 재승인까지 중지`);
  } else if (rec.numberError) lines.splice(lines.length, 0, "  수치 오류: 24시간 안에 publish-approved.mjs --update 로 고칠 것");
  console.log(lines.join("\n"));
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exit(main());
}
