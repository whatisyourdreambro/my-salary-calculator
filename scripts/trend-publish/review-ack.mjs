// scripts/trend-publish/review-ack.mjs — 주간 점검 기록 (2026-09-26 R5 publisher)
//
// 운영자가 채팅에서 '점검 완료' 라고 하면 세션이 운영자가 확인한 네 가지를 그대로 넣어 실행한다.
//   node scripts/trend-publish/review-ack.mjs --days 7 --gsc-manual-actions none --adsense-policy none --naver-notice none --clicks ok
//   → TREND_HOME/REVIEWED_UNTIL = 오늘 + N일(N ≤ 14) · review-log.jsonl 에 한 줄
// 네 항목 중 하나라도 '문제 있음' 이면 기록하지 않는다 — 대신:
//   node scripts/trend-publish/review-ack.mjs --halt "<사유>"   → TREND_HOME/HALT ('트렌드 중지')
// 확인 위치(런북 §주간 점검): GSC 보안 및 직접 조치 > 직접 조치 · AdSense 정책 센터 · 네이버 서치어드바이저 메시지 ·
// GSC 실적 14일 클릭(-20% 이상 하락 아님)·네이버 30일 클릭(기준선 80% 이상).
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { addDays, kstToday, loadConfig, resolvePaths, REPO_OF_SCRIPT } from "./daily.mjs";

export const REQUIRED = { "--gsc-manual-actions": "none", "--adsense-policy": "none", "--naver-notice": "none", "--clicks": "ok" };

/** 인자 검증 — 위반 목록 (빈 배열이면 기록 가능) */
export function validateAck(argv) {
  const get = (n) => {
    const i = argv.indexOf(n);
    return i > -1 ? argv[i + 1] : undefined;
  };
  const errs = [];
  const days = Number(get("--days"));
  if (!Number.isInteger(days) || days < 1 || days > 14) errs.splice(errs.length, 0, "--days 는 1~14 정수");
  for (const [flag, want] of Object.entries(REQUIRED)) {
    const v = get(flag);
    if (v === undefined) errs.splice(errs.length, 0, `${flag} ${want} 필요(운영자가 직접 확인한 값)`);
    else if (v !== want) errs.splice(errs.length, 0, `${flag}=${v} — 문제가 있으면 기록하지 말고 --halt "<사유>" 로 멈출 것`);
  }
  return { errs, days };
}

export function main(argv = process.argv, now = new Date()) {
  const get = (n) => {
    const i = argv.indexOf(n);
    return i > -1 ? argv[i + 1] : undefined;
  };
  const { home } = resolvePaths({ trendHome: get("--trend-home") }, loadConfig(REPO_OF_SCRIPT));
  mkdirSync(home, { recursive: true });
  const today = get("--today") ?? kstToday(now);
  const halt = get("--halt");
  if (halt !== undefined) {
    if (!halt.trim()) {
      console.error("[review-ack] --halt 에 사유를 적을 것");
      return 2;
    }
    writeFileSync(join(home, "HALT"), `${now.toISOString()} 운영자 중지: ${halt}\n`, "utf8");
    appendFileSync(join(home, "review-log.jsonl"), `${JSON.stringify({ ts: now.toISOString(), today, halt })}\n`, "utf8");
    console.log(`[review-ack] HALT 작성 — 발행·제안 중지 (${halt}). 재개: 원인 해소 뒤 운영자가 HALT 파일을 지운다.`);
    return 0;
  }
  const { errs, days } = validateAck(argv);
  if (errs.length) {
    console.error(["[review-ack] 기록하지 않음:", ...errs.map((e) => `- ${e}`)].join("\n"));
    return 1;
  }
  const until = addDays(today, days);
  writeFileSync(join(home, "REVIEWED_UNTIL"), `${until}\n`, "utf8");
  const entry = { ts: now.toISOString(), today, days, until, gscManualActions: "none", adsensePolicy: "none", naverNotice: "none", clicks: "ok" };
  appendFileSync(join(home, "review-log.jsonl"), `${JSON.stringify(entry)}\n`, "utf8");
  console.log(`[review-ack] 점검 기록 — REVIEWED_UNTIL ${until} (${days}일)${existsSync(join(home, "HALT")) ? " · 주의: HALT 가 아직 있음" : ""}`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exit(main());
}
