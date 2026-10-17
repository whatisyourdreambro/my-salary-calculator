// 글별 승인과 현재 Pages 클라우드 발행 준비 상태를 확인한 뒤에만 원격 반영한다.
// scripts/trend-publish/publish-approved.mjs — 운영자 승인 브리프 발행 (2026-09-26 R5 publisher)
//
// 운영자가 채팅에서 브리프별로 승인('발행 <slug>' · '철회 <slug>')한 세션만 실행한다.
// PUBLISH_ENABLED 는 준비·긴급 정지 플래그일 뿐 승인이 아니다.
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
//   커밋 → push main → 승인된 SHA의 GitHub 게시 작업 접수 → 클라우드 CI·Pages·운영 확인·IndexNow.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { parse as parseYaml } from "yaml";
import { assertRetirementTarget } from "./verify-prod.mjs";
import {
  addDays,
  calendarBlocks,
  capViolations,
  cardExpiry,
  defaultDeps,
  draftSha256,
  heavySteps,
  qaBuildCacheDir,
  qaHeavyInputsHash,
  qaHeavyBuildEnvironment,
  kstToday,
  loadConfig,
  pendingDecisions,
  readFlags,
  readJsonl,
  readTypesConstants,
  resolvePaths,
  reviewedUntilState,
  safeResetWorktree,
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
  // Legacy callers still require purge readiness. Native Pages publication is gated
  // by remote PAGES_CLOUD_PUBLISH_ENABLED and uses deployment-aware Pages caching.
  if (!p.cloudPagesReady && !p.flags.cfPurgeOk && !p.manualPurgeAck) add("CF_PURGE_OK 없음 — 자동 Purge(A35)를 확인했거나 --manual-purge-ack(배포 뒤 수동 Purge 약속)가 필요");
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

const REPOSITORY = "whatisyourdreambro/my-salary-calculator";
const API_ROOT = `/repos/${REPOSITORY}`;
const SHA = /^[a-f0-9]{40}$/;
function requireRelease(ok, message) { if (!ok) throw new Error(message); }

// Read-only GitHub API client. Credentials stay in process memory and never enter logs or files.
export function githubReadClient({ env = process.env, fetchFn = globalThis.fetch, credential = spawnSync } = {}) {
  let token;
  return async (endpoint) => {
    requireRelease(endpoint.startsWith(`${API_ROOT}/`) && !/[\r\n#]/.test(endpoint), "GitHub 조회 경로 거부");
    if (!token) {
      token = env.GH_TOKEN || env.GITHUB_TOKEN;
      if (!token) {
        const result = credential("git", ["credential", "fill"], {
          input: "protocol=https\nhost=github.com\n\n", encoding: "utf8", timeout: 10_000,
          windowsHide: true, stdio: ["pipe", "pipe", "ignore"],
          env: { ...env, GIT_TERMINAL_PROMPT: "0", GCM_INTERACTIVE: "Never" },
        });
        requireRelease(result.status === 0, "GitHub 읽기 인증을 사용할 수 없음");
        token = /^password=(.+)$/m.exec(result.stdout || "")?.[1]?.trim();
      }
      requireRelease(typeof token === "string" && token.length > 0 && !/[\r\n]/.test(token), "GitHub 읽기 인증 없음");
    }
    const response = await fetchFn(`https://api.github.com${endpoint}`, {
      method: "GET", redirect: "manual", signal: AbortSignal.timeout(20_000),
      headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28", "user-agent": "MoneySalary-publisher/1.0" },
    });
    requireRelease(response.status === 200, `GitHub 읽기 실패 HTTP ${response.status}`);
    const text = await response.text();
    requireRelease(text.length <= 2_000_000, "GitHub 응답 크기 제한 초과");
    return JSON.parse(text);
  };
}

function sourceContent(record) {
  requireRelease(record?.type === "file" && record.encoding === "base64" && typeof record.content === "string" && record.content.length < 1_500_000, "GitHub 소스 형식 오류");
  return Buffer.from(record.content, "base64").toString("utf8");
}

export async function pagesPublicationReadiness(get, { mode = "cloud" } = {}) {
  requireRelease(["cloud", "local"].includes(mode), "알 수 없는 Pages 발행 방식");
  const variable = mode === "cloud" ? "PAGES_CLOUD_PUBLISH_ENABLED" : "PAGES_LOCAL_PUBLISH_ENABLED";
  const enabled = await get(`${API_ROOT}/actions/variables/${variable}`);
  requireRelease(enabled.name === variable && enabled.value === "true", `${variable}=true 확인 필요`);
  const main = await get(`${API_ROOT}/commits/main`);
  requireRelease(SHA.test(main.sha || ""), "원격 main SHA 확인 실패");
  const workflow = await get(`${API_ROOT}/actions/workflows/ci.yml`);
  requireRelease(workflow.state === "active" && workflow.path === ".github/workflows/ci.yml" && Number.isSafeInteger(workflow.id), "Pages 검증 CI가 활성 상태가 아님");
  const source = parseYaml(sourceContent(await get(`${API_ROOT}/contents/.github/workflows/ci.yml?ref=${main.sha}`)));
  const job = source?.jobs?.verify;
  requireRelease(Array.isArray(source?.on?.push?.branches) && source.on.push.branches.includes("main") && job && !source?.jobs?.["deploy-pages"], "main 검증 전용 CI가 아님");
  requireRelease(!job["continue-on-error"] && String(job.if || "").trim() === "github.event_name != 'schedule' && github.event_name != 'workflow_dispatch'", "Pages 검증 조건 우회 또는 변경");
  const steps = job.steps || [];
  let previousStep = -1;
  for (const command of ["npm run qa:safety", "npm test", "node --test scripts/__tests__/*.test.mjs", "npm run qa:pages:build", "npm run qa:pages:verify"]) {
    const index = steps.findIndex(step => String(step.run || "").trim() === command);
    requireRelease(index > previousStep && !steps[index]?.if && !steps[index]?.["continue-on-error"], "Pages 필수 검증 단계 누락 또는 우회");
    previousStep = index;
  }
  if (mode === "cloud") {
    const policy = sourceContent(await get(`${API_ROOT}/contents/scripts/pages-cloud-dispatch.mjs?ref=${main.sha}`));
    requireRelease(/export\s+const\s+PAGES_CLOUD_DISPATCH_VERSION\s*=\s*1\s*;/.test(policy), "현재 클라우드 Pages 릴리스 정책 버전 없음");
    const publication = await get(`${API_ROOT}/actions/workflows/pages-publish.yml`);
    requireRelease(publication.state === "active" && publication.path === ".github/workflows/pages-publish.yml", "승인 후 게시 워크플로 비활성");
  } else {
    const policy = sourceContent(await get(`${API_ROOT}/contents/scripts/lib/pages-release.mjs?ref=${main.sha}`));
    requireRelease(/export\s+const\s+PAGES_LOCAL_RELEASE_POLICY_VERSION\s*=\s*1\s*;/.test(policy), "기존 로컬 Pages 정책 버전 없음");
    const runner = sourceContent(await get(`${API_ROOT}/contents/scripts/pages-release-local.mjs?ref=${main.sha}`));
    requireRelease(/export\s+const\s+PAGES_LOCAL_ORCHESTRATOR_VERSION\s*=\s*1\s*;/.test(runner), "기존 로컬 Pages 실행기 버전 없음");
  }
  return { mainSha: main.sha, workflowId: workflow.id };
}

export async function waitForPagesVerification(get, { sha, workflowId, attempts = 60, intervalMs = 60_000, sleep = ms => new Promise(resolveSleep => setTimeout(resolveSleep, ms)) }) {
  requireRelease(SHA.test(sha) && Number.isSafeInteger(workflowId), "검증 대기 식별자 오류");
  requireRelease(Number.isInteger(attempts) && attempts >= 1 && attempts <= 60 && Number.isFinite(intervalMs) && intervalMs >= 1000 && intervalMs <= 60_000, "배포 대기 범위 오류");
  for (let index = 0; index < attempts; index++) {
    requireRelease((await get(`${API_ROOT}/commits/main`)).sha === sha, "검증 중 main이 바뀜; 게시 중단");
    const record = await get(`${API_ROOT}/actions/workflows/${workflowId}/runs?event=push&branch=main&head_sha=${sha}&per_page=100`);
    const matches = (record.workflow_runs || []).filter(run => run.head_sha === sha && run.head_branch === "main" && run.event === "push" && run.workflow_id === workflowId);
    const run = matches.sort((a, b) => b.id - a.id)[0];
    if (run) {
      const jobs = await get(`${API_ROOT}/actions/runs/${run.id}/jobs?filter=latest&per_page=100`);
      const verify = (jobs.jobs || []).filter(job => job.name === "verify");
      requireRelease(verify.length <= 1, "중복 verify job; 검증 대기 중단");
      if (verify[0]?.status === "completed") {
        requireRelease(verify[0].conclusion === "success", "CI verify job이 성공하지 않음(건너뜀 포함)");
        requireRelease(Number.isSafeInteger(run.id) && Number.isSafeInteger(verify[0].id), "CI 검증 식별자 오류");
        requireRelease((await get(`${API_ROOT}/commits/main`)).sha === sha, "검증 중 main이 바뀜; 게시 중단");
        return { runId: run.id, jobId: verify[0].id, sha };
      }
      requireRelease(run.status !== "completed", "CI 완료됐지만 verify 성공을 확인하지 못함");
    }
    if (index + 1 < attempts) await sleep(intervalMs);
  }
  throw new Error("정확한 커밋의 CI verify 성공을 제한 시간 안에 확인하지 못함");
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
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    say("[publish] --slug <slug> 가 필요하다");
    return 2;
  }
  if (kind === "retire") {
    try { assertRetirementTarget(slug, arg(argv, "--to")); }
    catch (error) { say(`[publish] 철회 대상 오류: ${error.message} — 변경하지 않음`); return 2; }
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
  // --check-only 는 원격 GET과 로컬 Git 읽기만 한다. 갱신·checkout·reset·빌드·키 파일 로딩 없음.
  const st = await git(["status", "--porcelain", "--untracked-files=normal"]);
  if (st.code !== 0 || st.stdout.trim()) {
    say(`[publish] 트렌드 워크트리가 깨끗하지 않다 — 사람이 확인:\n${st.stdout.trim()}`);
    return 1;
  }
  const remote = await git(["remote", "get-url", "origin"]);
  if (remote.code !== 0 || ![`https://github.com/${REPOSITORY}.git`, `https://github.com/${REPOSITORY}`, `git@github.com:${REPOSITORY}.git`].includes(remote.stdout.trim())) {
    say("[publish] 승인된 GitHub 원격 저장소가 아님 — 변경하지 않음"); return 2;
  }
  const githubGet = deps.githubGet ?? githubReadClient();
  let readiness;
  try { readiness = await pagesPublicationReadiness(githubGet); }
  catch (error) { say(`[publish] Pages 클라우드 발행 준비 미확인: ${error.message} — 변경하지 않음`); return 2; }
  if (!checkOnly) {
    if ((await git(["fetch", "origin", "--prune"])).code !== 0) {
      say("[publish] git fetch 실패 — 변경하지 않음"); return 2;
    }
    const fetched = await git(["rev-parse", "origin/main"]);
    if (fetched.code !== 0 || fetched.stdout.trim() !== readiness.mainSha) {
      say("[publish] 준비 검사 중 main 변경 — 다시 확인 필요"); return 2;
    }
    if ((await git(["checkout", "--detach", readiness.mainSha])).code !== 0) {
      say("[publish] 검증한 main 체크아웃 실패 — 중지"); return 2;
    }
  }
  const head = await git(["rev-parse", "HEAD"]);
  const originSha = head.stdout.trim();
  if (head.code !== 0 || originSha !== readiness.mainSha) {
    say("[publish] 로컬 HEAD가 검증한 원격 main과 다름 — --check-only는 동기화하지 않음"); return 2;
  }
  const ct = Number((await git(["log", "-1", "--format=%ct", originSha])).stdout.trim());
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
  if (kind !== "retire" && draft?.slug !== slug) {
    say("[publish] 승인한 --slug 와 초안 slug 가 다름 — 렌더·빌드·발행하지 않음");
    return 2;
  }
  const primary = (draft?.sources ?? []).find((s) => s.role === "primary") ?? {};
  const preconditions = {
    kind,
    cloudPagesReady: true, // pagesPublicationReadiness above verified the remote cloud switch and workflow
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
  };
  const failures = checkPreconditions(preconditions);
  if (failures.length) {
    say(["[publish] 사전 조건 미충족 — 아무것도 바꾸지 않았다:", ...failures.map((f) => `- ${f}`)].join("\n"));
    return 1;
  }
  if (checkOnly) {
    say("[publish] 사전 조건 통과 (--check-only — 여기서 멈춤)");
    return 0;
  }
  // 승인 경로에서만 선택 키를 메모리에 로딩한다. 준비 검사에서는 읽지 않는다.
  if (deps.secretEnv) deps.secretEnv(config.secretEnvFiles);

  // 3) 기준 빌드 목록(브리프 없는 origin/main) — prepare 가 같은 커밋으로 만들어 두지 않았으면 지금 만든다
  const heavy = (name, cmd) => deps.run(process.execPath, [join(wt, "scripts/trend-publish/heavy.mjs"), cmd, "--cwd", wt, "--log", join(home, "logs", `${today}-publish-${name}.log`), "--trend-home", home],
    { cwd: wt, env: qaHeavyBuildEnvironment(name, wt) });
  if (kind !== "retire" && !existsSync(join(qaBuildCacheDir(home, originSha), "chunks.json"))) {
    const sibling = wtConfig.adSequence?.siblingGuide;
    const pages = [...(wtConfig.adSequence?.gatePages ?? []), ...(sibling ? [`/guides/${sibling}`] : [])].join(",");
    const b = qaBuildCacheDir(home, originSha);
    const base = await heavy("base", `npm run prebuild && npm run qa:pages:build && npm run qa:pages:verify && node scripts/trend-publish/chunk-diff.mjs manifest --next .pages-qa/.next --out "${join(b, "chunks.json")}" && node scripts/trend-publish/ad-sequence.mjs extract --next .pages-qa/.next --pages "${pages}" --out "${join(b, "adseq.json")}"`);
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
    const gate = await run(process.execPath, [tsx, join(wt, "scripts/trend-publish/gate.ts"), "--draft", draftFile, "--sources", snapDir, "--headlines", join(home, "radar"), "--sentinel", join(home, "sentinel"), "--mode", "publish", "--today", today, "--phase", "pre", "--next", ".pages-qa/.next", "--check-diff", originSha, "--repo", wt, "--trend-home", home, ...(kind === "update" ? ["--update"] : []), ...(candidateFile ? ["--candidate", candidateFile] : []), "--out", join(home, "gates", `gate-${slug}-publish-pre.json`)]);
    if (gate.code !== 0) return fail(`gate pre 실패 (exit ${gate.code})\n${gate.stdout.trim().slice(-2000)}`);
  } else {
    const scan = await run(process.execPath, [join(wt, "scripts/trend-publish/secret-scan.mjs"), "--repo", wt, "--next", ".pages-qa/.next", "--base", originSha, "--trend-home", home]);
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
  const reuse = kind === "publish" && archive && archive.heavyInputsHash === qaHeavyInputsHash(originSha, tree);
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
  const subject = kind === "retire" ? `fix(guides): 트렌드 브리프 철회 ${slug} — 허브로 308` : kind === "update" ? `fix(guides): 공식 발표 해설 수정 ${slug}` : `feat(guides): 공식 발표 해설 발행 ${slug}`;
  writeFileSync(msg, [subject, "", kind === "retire" ? `운영자 승인: 철회 ${slug}` : `${title}`, `운영자 승인: ${kind === "retire" ? "철회" : "발행"} ${slug} (초안 해시 ${String(arg(argv, "--draft-sha256") ?? "-").slice(0, 12)})`, "", "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>", ""].join("\n"), "utf8");
  const c = await git(["commit", "-F", msg]);
  if (c.code !== 0) return fail(`커밋 실패: ${c.stderr.trim()}`);
  try {
    const fresh = await pagesPublicationReadiness(githubGet);
    requireRelease(fresh.mainSha === originSha && fresh.workflowId === readiness.workflowId, "검사 중 main 또는 CI 변경");
    requireRelease(kstToday(deps.now()) === today, "검사 중 KST 날짜 변경; 승인 기간 재검사 필요");
    requireRelease(checkPreconditions({ ...preconditions, flags: readFlags(home) }).length === 0, "검사 중 운영자 준비·중지 플래그 변경");
  } catch (error) { say(`[publish] 원격 반영 직전 재확인 실패: ${error.message} — 로컬 커밋만 보존`); return 2; }
  const sent = await git(["push", "origin", "HEAD:main"]);
  if (sent.code !== 0) {
    say(`[publish] 원격 main 이 받아들이지 않았다(exit ${sent.code}) — 다른 커밋이 먼저 올라갔거나 권한 문제. 강제로 밀어 넣지 않는다. 다시 실행하면 최신 main 위에서 처음부터 검사한다.\n${sent.stderr.trim()}`);
    await git(["reset", "--hard", originSha]);
    return 1;
  }
  const pushed = (await git(["rev-parse", "HEAD"])).stdout.trim();

  // 6) 승인된 정확한 SHA만 클라우드에 인계. 접수 이후 이 컴퓨터가 꺼져도 계속된다.
  const handoff = await run(process.execPath, [join(wt, "scripts/pages-cloud-dispatch.mjs"), "--approved-commit", pushed,
    "--article-slug", slug, ...(kind === "retire" ? ["--retirement-to", arg(argv, "--to") ?? ""] : ["--article-marker", title])]);
  if (handoff.code !== 0) {
    say(`[publish] 소스 ${pushed.slice(0, 8)} 반영됨; 클라우드 접수 미확인. dispatch 영수증과 GitHub Actions를 확인하고 자동 재시도하지 말 것.`);
    return 3;
  }
  say(
    [
      `[publish] ${kind === "retire" ? "철회" : kind === "update" ? "수정 발행" : "발행"} 클라우드 접수 — ${slug} (${pushed.slice(0, 8)}), 아직 발행 완료는 아님`,
      handoff.stdout.trim(),
      "이 컴퓨터를 꺼도 GitHub 검사 → 무료 Pages 배포 → 광고 없는 HTTP 검사 → IndexNow가 이어진다. Actions 작업 성공이 완료 기준이다.",
      "다른 세션·워크트리: main 이 바뀌었다 — git fetch origin 후 rebase(또는 main 새로 받기) 하고 작업할 것.",
      kind === "publish" ? `다음 할 일: D+28(${addDays(today, 28)}) 판정 — decide.mjs --slug ${slug} --at d28 …` : "",
    ]
      .filter(Boolean)
      .join("\n")
  );
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().then((code) => process.exit(code));
}
