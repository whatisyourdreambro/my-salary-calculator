// scripts/stale-status-scan.ts
//
// 상태 문구 신선도 스캔 CLI — '미타결·교섭 중·장기화·예정' 같은 진행형 문구가 오래된 날짜 스탬프와
// 한 줄에 남은 곳을 찾아 파일별 마크다운으로 stdout 에 출력한다. 아무 파일도 쓰지 않는다.
// 판정 규칙·날짜 형식은 src/lib/staleStatusScan.ts 머리 주석 참조 (R4 freshness-scan, 2026-09-26).
//
// 실행: npx tsx scripts/stale-status-scan.ts                    → 오늘(KST) 기준, 30일 초과
//       npx tsx scripts/stale-status-scan.ts --today 2026-09-26 --days 30
//       npx tsx scripts/stale-status-scan.ts --press            → 'YYYY-MM-DD 보도' 스탬프도 날짜로 인정
//       npx tsx scripts/stale-status-scan.ts --fail-on 1        → 1건 이상이면 exit 1 (게이트로 쓸 때)
//       npx tsx scripts/stale-status-scan.ts --root <저장소 경로> → 다른 worktree 스캔
// 종료 코드: 0 = 정상(발견이 있어도 0) · 1 = --fail-on 기준 도달 · 2 = 인자 오류
// package.json 스크립트로 등록하지 않았다(런타임·빌드 영향 없음 — 필요할 때 사람이 돌리는 점검 도구).
import { readdirSync, readFileSync, type Dirent } from "node:fs";
import { join, relative, resolve } from "node:path";

import {
  SCAN_ROOTS,
  formatReport,
  isScannableSourcePath,
  kstDateIso,
  parseCliArgs,
  scanText,
  shouldFail,
  type StaleFinding,
} from "../src/lib/staleStatusScan";

const TAG = "[stale-status-scan]";
const USAGE = [
  "사용: npx tsx scripts/stale-status-scan.ts [--today YYYY-MM-DD] [--days N] [--fail-on N] [--press] [--root DIR]",
  "  --today   기준일 (기본: 오늘 KST)",
  "  --days    경과일 임계, 이보다 오래된 줄만 표시 (기본 30)",
  "  --fail-on 발견 수가 N 이상이면 exit 1 (기본: 항상 exit 0)",
  "  --press   'YYYY-MM-DD 보도' 스탬프도 날짜로 인정",
  "  --root    저장소 루트 (기본: 현재 디렉터리)",
].join("\n");

function* walk(dir: string): Generator<string> {
  let entries: Dirent[];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return; // 루트가 없는 저장소 구성 — 조용히 건너뜀
  }
  for (const e of entries) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.isFile()) yield p;
  }
}

function main(): number {
  const args = parseCliArgs(process.argv.slice(2), kstDateIso(new Date()));
  if (args.kind === "help") {
    console.log(USAGE);
    return 0;
  }
  if (args.kind === "error") {
    console.error(`${TAG} ${args.message}\n${USAGE}`);
    return 2;
  }
  const root = resolve(args.root ?? process.cwd());
  const started = Date.now();
  const findings: StaleFinding[] = [];
  let filesScanned = 0;
  for (const scanRoot of SCAN_ROOTS) {
    for (const abs of walk(join(root, scanRoot))) {
      const rel = relative(root, abs).replace(/\\/g, "/");
      if (!isScannableSourcePath(rel)) continue;
      filesScanned++;
      findings.push(...scanText(readFileSync(abs, "utf8"), rel, { today: args.today, days: args.days, press: args.press }));
    }
  }
  const elapsedMs = Date.now() - started;
  process.stdout.write(
    formatReport(findings, { today: args.today, days: args.days, press: args.press, filesScanned, elapsedMs }),
  );
  return shouldFail(findings.length, args.failOn) ? 1 : 0;
}

process.exitCode = main();
