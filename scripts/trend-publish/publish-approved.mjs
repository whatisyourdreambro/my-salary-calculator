// scripts/trend-publish/publish-approved.mjs — 운영자 승인 브리프 발행 (2026-09-26 R5 publisher)
//
// ★이 파일만 git push 를 한다. 운영자가 채팅에서 브리프별로 승인('발행 <slug>' · '철회 <slug>')한 세션만 실행한다.
//   권한 허용목록에 올리지 않는다 — 실행 때마다 권한 확인 창이 두 번째 확인이 된다. PUBLISH_ENABLED 는 준비·긴급 정지 플래그일 뿐 승인이 아니다.
// 사용:
//   node scripts/trend-publish/publish-approved.mjs --slug <slug> --draft-sha256 <hex> [--manual-purge-ack] [--check-only [--today YYYY-MM-DD]]
//   (--today 는 --check-only 와 함께일 때만 — 실제 반영 경로의 날짜는 언제나 실제 KST 오늘이다. critic fix 2026-09-26:
//    날짜 인자 하나로 첫 발행일·동결·판정일·배포 차단·한도·카드 만료를 건너뛰고 거짓 발행일을 찍지 못하게)
//   node scripts/trend-publish/publish-approved.mjs --slug <slug> --draft-sha256 <hex> --update --draft <고친 초안.json> [--manual-purge-ack]
//   node scripts/trend-publish/publish-approved.mjs --slug <slug> --retire --to <허브 경로> [--manual-purge-ack]
// 사전 조건(하나라도 어기면 아무것도 하지 않고 종료):
//   HALT 없음 · PUBLISH_ENABLED · REVIEWED_UNTIL 유효 · 달력 통과 · 한도 여유 · 결정 대기 없음 · CF_PURGE_OK 또는 --manual-purge-ack ·
//   DEPLOY_HOLD 없음 · origin/main 최신 커밋이 2시간 이상 지남 · 카드 미만료 · 초안 해시 = 보관본 해시 = 인자
//   (--retire 는 되돌리기라 HALT·달력·한도·결정 대기·REVIEWED_UNTIL·PUBLISH_ENABLED 를 보지 않는다 — DEPLOY_HOLD·2시간·Purge 확인만.
//    --update 는 새 URL 이 아니라 한도·결정 대기·동결·첫 발행일을 보지 않는다 — 판정일·배포 배치·로컬 차단은 본다)
// 흐름: 워크트리를 origin/main 으로 → render(오늘 날짜·operator-approved) → 생성 파일 재생성 → 게이트 전부 →
//   커밋 → git push origin HEAD:main (force 없음, 거부되면 멈춤) → verify-prod → 한국어 요약.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  addDays,
  calendarBlocks,
  capViolations,
  cardExpiry,
  defaultDeps,
  draftSha256,
  heavySteps,
  kstToday,
  loadConfig,
  pendingDecisions,
  readFlags,
  readJsonl,
  readTypesConstants,
  resolvePaths,
  reviewedUntilState,
  safeResetWorktree,
  sha256Text,
  updateCalendarBlocks,
  worktreeGuard,
} from "./daily.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_OF_SCRIPT = resolve(HERE, "..", "..");
const readJson = (p, fallback) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : fallback);

/**
 * 사전 조건 — 위반 목록(빈 배열이면 진행). 순수 함수: 테스트가 값을 직접 넣는다.
 * kind: publish | update | retire
 */
export function checkPreconditions(p) {
  const out = [];
  const add = (s) => out.splice(out.length, 0, s);
  const rollback = p.kind === "retire";
  if (!rollback) {
    if (p.flags.halt) add(`HALT 가 있음: ${p.flags.halt}`);
    if (!p.flags.publishEnabled) add("PUBLISH_ENABLED 없음(준비 플래그)");
    const rv = reviewedUntilState(p.today, p.flags.reviewedUntil);
    if (!rv.valid) add(rv.reason);
    for (const b of p.calendarBlocks ?? []) add(`달력: ${b}`);
    if (p.kind === "publish") for (const c of p.capReasons ?? []) add(`한도: ${c}`);
    if (p.kind === "publish" && (p.pending ?? []).length) add(`결정 대기 ${p.pending.length}건: ${p.pending.map((x) => `${x.slug}@${x.at}`).join(", ")}`);
  }
  if (!p.flags.cfPurgeOk && !p.manualPurgeAck) add("CF_PURGE_OK 없음 — 자동 Purge(A35)를 확인했거나 --manual-purge-ack(배포 뒤 수동 Purge 약속)가 필요");
  if (p.flags.deployHold) add(`DEPLOY_HOLD: ${p.flags.deployHold}`);
  if (!(p.originAgeHours >= p.minOriginAgeHours)) add(`origin/main 최신 커밋이 ${Number(p.originAgeHours ?? 0).toFixed(1)}시간 전 — ${p.minOriginAgeHours}시간 이상 지나야 한다(다른 배포와 겹침 방지)`);
  if (p.kind === "publish") {
    if (!p.archive) add("보관된 초안(drafts/<slug>.json) 없음 — daily PROPOSE 를 거친 브리프만 발행");
    else {
      const expiry = cardExpiry(p.archive.primaryPublishedDate ?? p.archive.cardDate, p.archive.cardDate);
      if (p.today > expiry) add(`승인 카드 만료(${expiry}) — 다음 daily 에서 다시 제안`);
      const c = p.archive.candidate;
      if (!c || typeof c.url !== "string" || typeof c.publishedDate !== "string") add("보관본에 레이더 후보 기록(candidate) 없음 — 1차 출처를 대조할 수 없다. 다음 daily PROPOSE 를 다시 거칠 것");
    }
  }
  if (p.kind !== "retire") {
    if (!p.argSha) add("--draft-sha256 없음");
    else if (p.argSha !== p.recomputedSha) add(`초안 해시 불일치: 인자 ${p.argSha.slice(0, 12)}… ≠ 초안 ${String(p.recomputedSha).slice(0, 12)}…`);
    if (p.kind === "publish" && p.archive && p.archive.draftSha256 !== p.argSha) add("초안 해시가 보관본과 다름 — 카드의 해시로 승인해야 한다");
  }
  return out;
}

function arg(argv, name) {
  const i = argv.indexOf(name);
  return i > -1 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : undefined;
}

export async function main(argv = process.argv, deps = defaultDeps()) {
  const slug = arg(argv, "--slug");
  const kind = argv.includes("--retire") ? "retire" : argv.includes("--update") ? "update" : "publish";
  const config = loadConfig(REPO_OF_SCRIPT);
  const { home, wt } = resolvePaths({ trendHome: arg(argv, "--trend-home"), worktree: arg(argv, "--worktree") }, config);
  const say = (s) => deps.log(s);
  const checkOnly = argv.includes("--check-only");
  const realToday = kstToday(deps.now());
  const todayArg = arg(argv, "--today");
  if ((argv.includes("--today") || todayArg) && !checkOnly && todayArg !== realToday) {
    say(`[publish] --today 는 --check-only 와 함께일 때만 쓸 수 있다(실제 오늘 KST ${realToday}) — 아무것도 하지 않았다`);
    return 2;
  }
  const today = checkOnly && todayArg ? todayArg : realToday;
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    say("[publish] --slug <slug> 가 필요하다");
    return 2;
  }
  // 트렌드 워크트리 확인 — 설정 워크트리·연결 워크트리·메인 저장소 아님 (daily.mjs 와 같은 관문)
  const refused = await worktreeGuard(deps, { wt, allowAnyWorktree: deps.allowAnyWorktree === true });
  if (refused) {
    say(`[publish] ${refused}`);
    return 2;
  }
  const run = (cmd, args, cwd = wt) => deps.run(cmd, args, { cwd });
  const git = (args) => run("git", ["-C", wt, ...args]);
  const tsx = join(wt, "node_modules/tsx/dist/cli.mjs");

  // 1) 워크트리 동기화 — 깨끗해야 한다
  if ((await git(["fetch", "origin", "--prune"])).code !== 0) {
    say("[publish] git fetch 실패 — 네트워크 확인 후 다시");
    return 2;
  }
  const st = await git(["status", "--porcelain", "--untracked-files=normal"]);
  if (st.stdout.trim()) {
    say(`[publish] 트렌드 워크트리가 깨끗하지 않다 — 사람이 확인:\n${st.stdout.trim()}`);
    return 1;
  }
  await git(["checkout", "--detach", "origin/main"]);
  await git(["reset", "--hard", "origin/main"]);
  const originSha = (await git(["rev-parse", "HEAD"])).stdout.trim();
  const ct = Number((await git(["log", "-1", "--format=%ct", "origin/main"])).stdout.trim());
  const originAgeHours = Number.isFinite(ct) && ct > 0 ? (deps.now().getTime() / 1000 - ct) / 3600 : 0;

  // 2) 사전 조건
  const flags = readFlags(home);
  const wtConfig = loadConfig(wt);
  const consts = readTypesConstants(wt);
  const ledger = readJson(join(wt, "scripts/trend-publish/ledger.json"), []);
  const decisions = readJsonl(join(home, "decisions.jsonl"));
  const archive = readJson(join(home, "drafts", `${slug}.json`), null);
  let draft = archive?.draft ?? null;
  if (kind === "update") {
    const p = arg(argv, "--draft");
    draft = p && existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
    if (!draft) {
      say("[publish] --update 는 --draft <고친 초안.json> 이 필요하다");
      return 2;
    }
    if (!ledger.some((e) => e.slug === slug && e.status === "live")) {
      say(`[publish] --update: 원장에 게시 중인 ${slug} 가 없다`);
      return 1;
    }
  }
  const primary = (draft?.sources ?? []).find((s) => s.role === "primary") ?? {};
  const failures = checkPreconditions({
    kind,
    today,
    flags,
    calendarBlocks: ((b) => (kind === "update" ? updateCalendarBlocks(b) : b))(calendarBlocks(today, readJson(join(wt, "scripts/trend-publish/calendar.json"), {}), readJson(join(home, "calendar.local.json"), {}), decisions.some((d) => d.decision === "pilot-verdict" && d.value === "continue"), consts.firstPublishNotBefore)),
    capReasons: draft ? capViolations(today, ledger, wtConfig.caps, { cluster: draft.cluster, primaryUrl: primary.url, primarySha: primary.sha256, slug }, consts.hardCaps) : [],
    pending: pendingDecisions(today, ledger, decisions),
    manualPurgeAck: argv.includes("--manual-purge-ack"),
    originAgeHours,
    minOriginAgeHours: wtConfig.publish?.minOriginAgeHours ?? 2,
    archive,
    argSha: arg(argv, "--draft-sha256"),
    recomputedSha: draft ? draftSha256(draft) : null,
  });
  if (failures.length) {
    say(["[publish] 사전 조건 미충족 — 아무것도 바꾸지 않았다:", ...failures.map((f) => `- ${f}`)].join("\n"));
    return 1;
  }
  if (checkOnly) {
    say("[publish] 사전 조건 통과 (--check-only — 여기서 멈춤)");
    return 0;
  }

  // 3) 기준 빌드 목록(브리프 없는 origin/main) — prepare 가 같은 커밋으로 만들어 두지 않았으면 지금 만든다
  const heavy = (name, cmd) => run(process.execPath, [join(wt, "scripts/trend-publish/heavy.mjs"), cmd, "--cwd", wt, "--log", join(home, "logs", `${today}-publish-${name}.log`), "--trend-home", home]);
  if (kind !== "retire" && !existsSync(join(home, "builds", originSha, "chunks.json"))) {
    const sibling = wtConfig.adSequence?.siblingGuide;
    const pages = [...(wtConfig.adSequence?.gatePages ?? []), ...(sibling ? [`/guides/${sibling}`] : [])].join(",");
    const b = join(home, "builds", originSha);
    const base = await heavy("base", `npm run build && node scripts/trend-publish/chunk-diff.mjs manifest --next .next --out "${join(b, "chunks.json")}" && node scripts/trend-publish/ad-sequence.mjs extract --next .next --pages "${pages}" --out "${join(b, "adseq.json")}"`);
    if (base.code !== 0) {
      say(`[publish] 기준 빌드 실패 (exit ${base.code}) — 중지`);
      return base.code === 75 ? 75 : 1;
    }
    // 기준 빌드의 prebuild 가 생성 파일을 바꿨을 수 있다 — 렌더 전에 깨끗한 origin/main 으로(운영자 파일 경로가 보이면 원복 거부 + HALT)
    if (!(await safeResetWorktree(deps, home, wt, originSha))) {
      say("[publish] 기준 빌드 뒤 원복 거부(운영자 파일 경로) — HALT 기록, 중지");
      return 1;
    }
  }

  // 4) 렌더 · 생성 파일 · 게이트
  mkdirSync(join(home, "tmp"), { recursive: true });
  const draftFile = join(home, "tmp", `publish-${slug}.json`);
  if (draft) writeFileSync(draftFile, `${JSON.stringify(draft, null, 2)}\n`, "utf8");
  // 레이더 후보(PROPOSE 보관본) — gate 가 1차 출처 URL·게시일·발표 종류를 writer 선언이 아니라 이 기록과 대조한다
  const candidateFile = kind === "publish" && archive?.candidate ? join(home, "tmp", `publish-${slug}-candidate.json`) : null;
  if (candidateFile) writeFileSync(candidateFile, `${JSON.stringify(archive.candidate, null, 2)}\n`, "utf8");
  const renderArgs =
    kind === "retire"
      ? [tsx, join(wt, "scripts/trend-publish/render.ts"), "--retire", slug, "--to", arg(argv, "--to") ?? "", "--write", "--today", today, "--repo", wt]
      : [tsx, join(wt, "scripts/trend-publish/render.ts"), "--draft", draftFile, "--write", "--today", today, "--human", "operator-approved", "--repo", wt, ...(kind === "update" ? ["--update"] : [])];
  const r = await run(process.execPath, renderArgs);
  if (r.code !== 0) {
    say(`[publish] render 실패 — 중지:\n${(r.stderr || r.stdout).trim()}`);
    await safeResetWorktree(deps, home, wt, originSha);
    return 1;
  }
  const fail = async (msg) => {
    say(`[publish] ${msg} — 중지(원격 반영 안 함)`);
    await safeResetWorktree(deps, home, wt, originSha);
    return 1;
  };
  const snapDir = archive?.snapDir ?? join(home, "snapshots", today);
  if (kind !== "retire") {
    const gate = await run(process.execPath, [tsx, join(wt, "scripts/trend-publish/gate.ts"), "--draft", draftFile, "--sources", snapDir, "--headlines", join(home, "radar"), "--sentinel", join(home, "sentinel"), "--mode", "publish", "--today", today, "--phase", "pre", "--check-diff", originSha, "--repo", wt, "--trend-home", home, ...(kind === "update" ? ["--update"] : []), ...(candidateFile ? ["--candidate", candidateFile] : []), "--out", join(home, "gates", `gate-${slug}-publish-pre.json`)]);
    if (gate.code !== 0) return fail(`gate pre 실패 (exit ${gate.code})\n${gate.stdout.trim().slice(-2000)}`);
  } else {
    const scan = await run(process.execPath, [join(wt, "scripts/trend-publish/secret-scan.mjs"), "--repo", wt, "--base", originSha, "--trend-home", home]);
    if (scan.code !== 0) return fail("secret-scan 적중");
  }
  const allow = (wtConfig.pathAllowlist?.[kind === "retire" ? "retire" : "publish"] ?? []).concat(kind === "retire" ? wtConfig.pathAllowlist?.publish ?? [] : []).map((s) => new RegExp(s));
  /** 변경 파일을 허용목록과 대조해 스테이징 — 생성 파일 재생성 뒤에도 다시 부른다 */
  const stageAllowed = async () => {
    const changed = (await git(["status", "--porcelain", "--untracked-files=all"])).stdout.split(/\r?\n/).map((l) => l.slice(3).trim()).filter(Boolean);
    const outside = changed.filter((f) => !allow.some((re) => re.test(f)));
    if (outside.length) return `허용 밖 변경: ${outside.join(", ")}`;
    if (changed.length) await git(["add", "--", ...changed]);
    return "";
  };
  const staged = await stageAllowed();
  if (staged) return fail(staged);
  const tree = (await git(["write-tree"])).stdout.trim();
  const reuse = kind === "publish" && archive && archive.heavyInputsHash === sha256Text(`${originSha}\n${tree}`);
  if (!reuse) {
    const steps = heavySteps({ slug, originSha, home, wt, config: wtConfig, sibling: wtConfig.adSequence?.siblingGuide, candidate: candidateFile, update: kind === "update" });
    for (const s of steps) {
      if (kind === "retire" && ["prebuild-status", "ad-sequence", "chunk-diff", "gate-post"].includes(s.name)) continue;
      const cmd = s.cmd.replace("{DRAFT}", draftFile).replace("{SOURCES}", snapDir).replace("{MODE}", "publish").replace("{TODAY}", today);
      const h = await heavy(s.name, cmd);
      if (h.code === 75) return fail(`${s.name}: 메모리·잠금 부족 — 나중에 다시`);
      if (h.code !== 0) return fail(`${s.name} 실패 (exit ${h.code}) · 로그 logs/${today}-publish-${s.name}.log`);
    }
    const again = await stageAllowed();
    if (again) return fail(again);
  }

  // 5) 커밋 · 원격 반영
  const title = String(draft?.title ?? slug).replace(/"/g, "");
  const msg = join(home, "tmp", `publish-commit-${slug}.txt`);
  const head = kind === "retire" ? `fix(guides): 트렌드 브리프 철회 ${slug} — 허브로 308` : kind === "update" ? `fix(guides): 공식 발표 해설 수정 ${slug}` : `feat(guides): 공식 발표 해설 발행 ${slug}`;
  writeFileSync(msg, [head, "", kind === "retire" ? `운영자 승인: 철회 ${slug}` : `${title}`, `운영자 승인: ${kind === "retire" ? "철회" : "발행"} ${slug} (초안 해시 ${String(arg(argv, "--draft-sha256") ?? "-").slice(0, 12)})`, "", "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>", ""].join("\n"), "utf8");
  const c = await git(["commit", "-F", msg]);
  if (c.code !== 0) return fail(`커밋 실패: ${c.stderr.trim()}`);
  const sent = await git(["push", "origin", "HEAD:main"]);
  if (sent.code !== 0) {
    say(`[publish] 원격 main 이 받아들이지 않았다(exit ${sent.code}) — 다른 커밋이 먼저 올라갔거나 권한 문제. 강제로 밀어 넣지 않는다. 다시 실행하면 최신 main 위에서 처음부터 검사한다.\n${sent.stderr.trim()}`);
    await git(["reset", "--hard", originSha]);
    return 1;
  }
  const pushed = (await git(["rev-parse", "HEAD"])).stdout.trim();

  // 6) 운영 확인
  const verify =
    kind === "retire"
      ? { code: 0, stdout: "(철회 — /guides/<slug> 308 은 배포 뒤 브라우저로 확인)" }
      : await run(process.execPath, [join(wt, "scripts/trend-publish/verify-prod.mjs"), "--slug", slug, "--marker", title, "--trend-home", home]);
  say(
    [
      `[publish] ${kind === "retire" ? "철회" : kind === "update" ? "수정 발행" : "발행"} 완료 — ${slug} (${pushed.slice(0, 8)})`,
      verify.stdout.trim(),
      verify.code === 0 ? "운영 확인: 정상" : "운영 확인: 위 ✖ 항목을 처리할 것(Purge 필요면 CF 대시보드에서 Purge Everything)",
      "다른 세션·워크트리: main 이 바뀌었다 — git fetch origin 후 rebase(또는 main 새로 받기) 하고 작업할 것.",
      kind === "publish" ? `다음 할 일: D+28(${addDays(today, 28)}) 판정 — decide.mjs --slug ${slug} --at d28 …` : "",
    ]
      .filter(Boolean)
      .join("\n")
  );
  return verify.code === 0 ? 0 : 3;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().then((code) => process.exit(code));
}
