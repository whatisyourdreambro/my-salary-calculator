// scripts/trend-publish/heavy.mjs — 무거운 명령 직렬화 (2026-09-26 R5 publisher, RAM 16GB 기계)
//
// 사용: node scripts/trend-publish/heavy.mjs "<명령>" [--log <파일>] [--cwd <dir>] [--trend-home <dir>] [--min-free-mb N] [--wait-min N]
// 1) 잠금: TREND_HOME/locks/heavy (mkdir 원자적, 45분 넘은 잠금은 깨짐)
// 2) 프로세스 확인: 다른 next build·vitest·tsc·next-on-pages·wrangler 가 돌고 있으면 기다린다
// 3) 여유 메모리 ≥ minFreeMB(config.json) — 모자라면 기다린다
// 대기가 waitMin(기본 config.heavyWaitMin=30분)을 넘으면 exit 75 (daily.mjs 가 'RAM·잠금 부족 SKIP' 으로 처리).
// 명령 출력은 로그 파일에만 쓰고 끝 40줄을 보여 준다. 종료 코드는 명령의 실제 코드 그대로.
import { spawn, execFileSync } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { freemem, platform } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const EXIT_RESOURCE = 75;
export const HEAVY_PROC_RE = /next(?:\.js|\\dist\\bin\\next|\/dist\/bin\/next)?["']?\s+build|vitest|\btsc\b|next-on-pages|wrangler/i;
const STALE_MS = 45 * 60 * 1000;

/** 자원 판정 — 순수 함수 (테스트용) */
export function checkResources({ freeMB, minFreeMB, processes, selfPid }) {
  // 대기 중인 래퍼(heavy.mjs·lockrun.mjs)는 명령줄에 무거운 명령 이름을 담고 있어도 실제로는 자고 있다 — 잠금이 순서를 맡는다
  const busy = processes.filter((p) => p.pid !== selfPid && HEAVY_PROC_RE.test(p.cmd ?? "") && !/heavy\.mjs|lockrun\.mjs/.test(p.cmd ?? ""));
  if (busy.length) return { ok: false, reason: `다른 무거운 프로세스 ${busy.length}개 실행 중 (pid ${busy.map((p) => p.pid).join(",")})` };
  if (freeMB < minFreeMB) return { ok: false, reason: `여유 메모리 ${freeMB}MB < ${minFreeMB}MB` };
  return { ok: true, reason: "" };
}

/** 실행 중인 node 프로세스 명령줄 (Windows: PowerShell CIM, 그 밖: ps) */
export function listProcesses() {
  try {
    if (platform() === "win32") {
      const out = execFileSync(
        "powershell.exe",
        ["-NoProfile", "-Command", "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ForEach-Object { \"$($_.ProcessId)`t$($_.CommandLine)\" }"],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 20_000 }
      );
      return out
        .split(/\r?\n/)
        .filter(Boolean)
        .map((l) => {
          const [pid, ...rest] = l.split("\t");
          return { pid: Number(pid), cmd: rest.join("\t") };
        });
    }
    const out = execFileSync("ps", ["-eo", "pid=,args="], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return out
      .split("\n")
      .filter(Boolean)
      .map((l) => {
        const m = /^\s*(\d+)\s+(.*)$/.exec(l);
        return m ? { pid: Number(m[1]), cmd: m[2] } : null;
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function readConfig() {
  try {
    return JSON.parse(readFileSync(join(HERE, "config.json"), "utf8"));
  } catch {
    return {};
  }
}

function tryLock(dir) {
  try {
    mkdirSync(dir);
    writeFileSync(join(dir, "owner.txt"), `${process.pid} ${new Date().toISOString()}\n`);
    return true;
  } catch {
    try {
      if (Date.now() - statSync(dir).mtimeMs > STALE_MS) rmSync(dir, { recursive: true, force: true });
    } catch {
      /* 무시 */
    }
    return false;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function arg(argv, name) {
  const i = argv.indexOf(name);
  return i > -1 ? argv[i + 1] : undefined;
}

export async function main(argv = process.argv) {
  const cmd = argv[2];
  if (!cmd || cmd.startsWith("--")) {
    console.error('사용: node heavy.mjs "<명령>" [--log <파일>] [--cwd <dir>] [--trend-home <dir>] [--min-free-mb N] [--wait-min N]');
    return 2;
  }
  const cfg = readConfig();
  const trendHome = arg(argv, "--trend-home") ?? process.env.TREND_HOME ?? cfg.trendHome;
  const minFreeMB = Number(arg(argv, "--min-free-mb") ?? cfg.minFreeMB ?? 6144);
  const waitMin = Number(arg(argv, "--wait-min") ?? cfg.heavyWaitMin ?? 30);
  const cwd = resolve(arg(argv, "--cwd") ?? process.cwd());
  const log = arg(argv, "--log") ?? join(trendHome, "logs", `heavy-${Date.now()}.log`);
  mkdirSync(join(trendHome, "locks"), { recursive: true });
  mkdirSync(dirname(log), { recursive: true });
  const lockDir = join(trendHome, "locks", "heavy");
  const deadline = Date.now() + waitMin * 60_000;
  let reason = "";
  let locked = false;
  while (Date.now() < deadline) {
    const res = checkResources({ freeMB: Math.floor(freemem() / 1048576), minFreeMB, processes: listProcesses(), selfPid: process.pid });
    if (res.ok && tryLock(lockDir)) {
      locked = true;
      break;
    }
    reason = res.ok ? "잠금 대기(다른 heavy 실행 중)" : res.reason;
    await sleep(15_000);
  }
  if (!locked) {
    writeFileSync(log, `[heavy] 자원 대기 ${waitMin}분 초과 — ${reason}\n$ ${cmd}\n`);
    console.error(`[heavy] SKIP: 자원 대기 ${waitMin}분 초과 — ${reason}`);
    return EXIT_RESOURCE;
  }
  const out = createWriteStream(log);
  out.write(`$ ${cmd}\n(cwd ${cwd}, ${new Date().toISOString()})\n`);
  try {
    const code = await new Promise((resolveCode) => {
      const child = spawn(cmd, { cwd, shell: true, env: process.env });
      child.stdout.pipe(out, { end: false });
      child.stderr.pipe(out, { end: false });
      child.on("close", (c) => resolveCode(c ?? 1));
      child.on("error", () => resolveCode(1));
    });
    await new Promise((r) => out.end(r));
    const tail = existsSync(log) ? readFileSync(log, "utf8").split(/\r?\n/).slice(-40).join("\n") : "";
    console.log(`${tail}\n[heavy] exit=${code} log=${log}`);
    return code;
  } finally {
    rmSync(lockDir, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().then((code) => process.exit(code));
}
