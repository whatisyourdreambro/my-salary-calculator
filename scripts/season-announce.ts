// scripts/season-announce.ts
//
// 시즌 URL 등록부(docs/season-urls-2026-27.json) 점검과 발표일 알림 목록 CLI — R6-04 (2026-09-27).
// 규칙은 src/lib/seasonAnnounce.ts 머리 주석. 아무 파일도 쓰지 않고 stdout 으로만 낸다.
//
// 실행 (저장소 루트에서):
//   npx tsx scripts/season-announce.ts check
//       등록부 구조 + 사이트맵(src/app/sitemap.ts default export)·ROUTE_OVERRIDES 대조.
//       rssTablesFeed.ts 가 트리에 있으면 rss-tables 멤버도 대조. 오류가 있으면 exit 1.
//   npx tsx scripts/season-announce.ts event E3
//       그 이벤트의 한국어 Day-0 체크리스트, 수집 요청 후보(10개 이하)·구글 검사 후보(3개 이하),
//       diff 밖 수동 요청 후보(날짜 손잡이 없는 URL), lastmod 손잡이 할 일, 피드 메타 동기화 알림.
//   npx tsx scripts/season-announce.ts diff <prev.xml> <next.xml> [--event E3]
//       배포 전·후 사이트맵의 (loc, lastmod) 차이 = CF 빌드 로그 [indexnow] 제출 목록.
//       --event 를 주면 그 이벤트 후보 중 diff 에 없는 URL 을 둘로 나눈다:
//       날짜 손잡이가 없는 URL = 'diff 밖 수동 요청', 손잡이가 있는 URL = '손잡이 누락' 확인 목록.
//       파일 자리에 build 를 쓰면 이 트리의 빌드 산출물(.next/server/app/sitemap.xml.body)을 읽는다.
//   공통: --registry <경로> 로 다른 등록부 파일.
// 종료 코드: 0 정상 · 1 check 오류 또는 diff 판독 실패 · 2 인자 오류.
// package.json 스크립트로 등록하지 않았다(런타임·빌드 영향 없음 — 발표일에 사람이 돌리는 도구).
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sitemap, { ROUTE_OVERRIDES } from "@/app/sitemap";
import {
  GSC_INSPECT_CAP,
  NAVER_REQUEST_CAP,
  SITE_ORIGIN,
  announceList,
  diffSitemaps,
  parseRegistry,
  registryWarnings,
  requestPlan,
  toEventId,
  toPath,
  validateRegistry,
  type RssTablesMembership,
  type SeasonRegistry,
} from "../src/lib/seasonAnnounce";

const TAG = "[season-announce]";
const DEFAULT_REGISTRY = join("docs", "season-urls-2026-27.json");
const RSS_TABLES_MODULE = join("src", "lib", "rssTablesFeed.ts");
const USAGE = [
  "사용: npx tsx scripts/season-announce.ts <명령> [--registry <경로>]",
  "  check                              등록부 ↔ 사이트맵·ROUTE_OVERRIDES 대조 (오류 시 exit 1)",
  "  event <E0~E12>                     발표일 체크리스트·수집 요청 후보·lastmod 할 일",
  "  diff <prev.xml> <next.xml> [--event E3]",
  "                                     바뀐 lastmod 목록(= [indexnow] 목록)과 수집 요청 순서",
  "                                     파일 대신 build → .next/server/app/sitemap.xml.body",
].join("\n");

function loadRegistry(path: string): SeasonRegistry {
  return parseRegistry(JSON.parse(readFileSync(path, "utf8")));
}

/** sitemap() 항목 → 경로별 lastmod(YYYY-MM-DD) */
function sitemapLastmods(): Map<string, string> {
  const out = new Map<string, string>();
  for (const e of sitemap()) {
    const lm = e.lastModified;
    const iso = lm instanceof Date ? lm.toISOString() : typeof lm === "string" ? lm : "";
    out.set(toPath(e.url), iso.slice(0, 10));
  }
  return out;
}

async function loadRssTables(root: string): Promise<RssTablesMembership | undefined> {
  const p = join(root, RSS_TABLES_MODULE);
  if (!existsSync(p)) return undefined;
  const mod = (await import(pathToFileURL(p).href)) as {
    FEED_PATHS?: readonly string[];
    PENDING_AFTER_OCT_MERGE?: readonly string[];
  };
  if (!mod.FEED_PATHS) return undefined;
  return { feed: mod.FEED_PATHS, pending: mod.PENDING_AFTER_OCT_MERGE ?? [] };
}

/** 'build' → 이 트리 빌드 산출물의 사이트맵 본문 (indexnow-ping.mjs buildSitemap 과 같은 위치) */
function readSitemapArg(arg: string, root: string): string {
  if (arg !== "build") return readFileSync(resolve(arg), "utf8");
  const dir = join(root, ".next", "server", "app");
  for (const f of readdirSync(dir)) {
    if (!f.startsWith("sitemap.xml")) continue;
    try {
      const body = readFileSync(join(dir, f), "utf8");
      if (body.includes("<loc>")) return body;
    } catch {
      // 디렉터리(sitemap.xml/) — 다음 항목
    }
  }
  throw new Error(".next/server/app 에 sitemap.xml 본문이 없음 — 먼저 빌드");
}

const full = (path: string) => `${SITE_ORIGIN}${path}`;
const numbered = (list: string[]) => list.map((u, i) => `  ${String(i + 1).padStart(2)}. ${u}`);

async function cmdCheck(registry: SeasonRegistry, root: string): Promise<number> {
  const lastmods = sitemapLastmods();
  const overrideKeys = Object.keys(ROUTE_OVERRIDES);
  const overrideDays = new Map<string, string>();
  for (const [key, o] of Object.entries(ROUTE_OVERRIDES)) {
    if (o.lastModified) overrideDays.set(key, o.lastModified.toISOString().slice(0, 10));
  }
  const rssTables = await loadRssTables(root);
  const errors = validateRegistry(registry, lastmods.keys(), overrideKeys, {
    rssTables,
    sitemapLastmods: lastmods,
    overrideDays,
  });
  const warnings = registryWarnings(registry, lastmods.keys(), overrideKeys, lastmods);
  const live = registry.rows.filter((r) => r.status === "live").length;
  const byKind = new Map<string, number>();
  for (const r of registry.rows) byKind.set(r.lastmodHandle.kind, (byKind.get(r.lastmodHandle.kind) ?? 0) + 1);

  console.log(
    `${TAG} 등록부 ${registry.rows.length}행 (live ${live} · 대기 ${registry.rows.length - live}) · 사이트맵 ${lastmods.size} URL · ROUTE_OVERRIDES ${overrideKeys.length}키`,
  );
  console.log(`${TAG} lastmod 손잡이: ${[...byKind].map(([k, n]) => `${k} ${n}`).join(" · ")}`);
  console.log(
    `${TAG} rss-tables: ${rssTables ? `rssTablesFeed.ts 대조함(FEED_PATHS ${rssTables.feed.length})` : "rssTablesFeed.ts 없음 — 멤버 대조 건너뜀"}`,
  );
  const perEvent = Object.keys(registry.events).map((id) => {
    const a = announceList(registry, id as keyof SeasonRegistry["events"]);
    return `${id} ${a.candidates.length}${a.skippedPending.length ? `(+대기 ${a.skippedPending.length})` : ""}`;
  });
  console.log(`${TAG} 이벤트별 후보: ${perEvent.join(" · ")}`);
  for (const w of warnings) console.warn(`[WARN] ${w}`);
  for (const e of errors) console.error(`[FAIL] ${e}`);
  console.log(`${TAG} 오류 ${errors.length} · 경고 ${warnings.length}`);
  return errors.length ? 1 : 0;
}

async function cmdEvent(registry: SeasonRegistry, raw: string | undefined, root: string): Promise<number> {
  const id = toEventId(raw);
  if (!id) {
    console.error(`${TAG} 이벤트 id 가 필요합니다 (E0~E12): ${raw ?? "(없음)"}\n${USAGE}`);
    return 2;
  }
  const a = announceList(registry, id);
  const lastmods = sitemapLastmods();
  const rssTables = await loadRssTables(root);
  const lines: string[] = [];
  const cal = a.event.calendar.length ? a.event.calendar.join(" · ") : "없음";
  const slots = a.event.w4a.length ? a.event.w4a.join(" · ") : "없음";
  lines.push(`# ${id} ${a.event.name} (예상: ${a.event.expected})`);
  lines.push(`연결: R4 시즌 달력 ${cal} | W4-A 슬롯 ${slots}`);
  lines.push("바꿀 상수·문구·게이트 세부는 위 id 의 원문을 봅니다. 이 도구는 URL·lastmod·알림만 다룹니다.");
  lines.push("");
  lines.push("## Day-0 순서");
  lines.push("1. 1차 출처(공식 원문) URL 을 확인한 뒤 반영 묶음을 적용합니다. 상수·데이터·문자열만, 새 URL 0개.");
  lines.push("2. 아래 'lastmod 손잡이'에서 화면 내용이 실제로 바뀐 URL 만 날짜를 올립니다.");
  lines.push("3. 진행형 상태 문구 점검: npx tsx scripts/stale-status-scan.ts --press");
  lines.push("4. 게이트: tsc · vitest · verify:tax·site·sitemap · ad-audit --diff 0/0 · adpos (광고 위 문구는 폭 맞춤).");
  lines.push("5. 운영 사이트맵을 prev.xml 로 저장 → '메인 푸시' → cf-purge 성공 확인 → 다시 next.xml 로 저장.");
  lines.push(`   curl -s -A "Mozilla/5.0" ${SITE_ORIGIN}/sitemap.xml -o prev.xml (기본 UA 는 403)`);
  lines.push(`6. npx tsx scripts/season-announce.ts diff prev.xml next.xml --event ${id}`);
  lines.push("   → 목록 수가 CF 빌드 로그 '[indexnow] diff: 신규 · 변경 · 삭제' 와 같은지 확인.");
  lines.push(
    `7. 네이버 서치어드바이저 → 요청 → 웹 페이지 수집 요청: diff 목록 + 아래 'diff 밖 수동 요청' 목록(내용이 바뀐 것만), 하루 ${NAVER_REQUEST_CAP}개 이하.`,
  );
  lines.push("   수동 요청 목록은 날짜 손잡이가 없어 diff·[indexnow] 에 나올 수 없는 URL 입니다(성과급 계산기 등).");
  lines.push("   발표 당사 계산기처럼 이번 발표로 바뀐 URL 을 1일차 앞쪽에 두고, 넘치는 diff 목록 뒤쪽은 다음 날로 넘깁니다.");
  lines.push(`   구글 서치콘솔 URL 검사 → 색인 생성 요청: ${GSC_INSPECT_CAP}개 이하 (같은 순서).`);
  lines.push("8. docs/ad-experiments.md 3(c) 공변량 행 + docs/metrics-log.md 한 줄.");
  lines.push("");

  if (a.candidates.length === 0) {
    lines.push("## 수집 요청 후보");
    lines.push("  등록부에서 이 이벤트에 걸린 live URL 이 없습니다 — 수집 요청 없음.");
  } else {
    lines.push(`## 네이버 수집 요청 후보 (${a.naverRequest.length}/${a.candidates.length}, 배포 뒤 6번 diff 로 확정)`);
    lines.push(...numbered(a.naverRequest.map(full)));
    if (a.overflow.length) {
      lines.push(`## 다음 날로 넘길 후보 (${a.overflow.length})`);
      lines.push(...numbered(a.overflow.map(full)));
    }
    lines.push(`## 구글 URL 검사 후보 (${a.gscInspect.length})`);
    lines.push(...numbered(a.gscInspect.map(full)));
    if (a.manualOnly.length) {
      lines.push("");
      lines.push(
        `## diff 밖 수동 요청 후보 ${a.manualOnly.length}개 — 날짜 손잡이가 없어 6번 diff 에 나오지 않음, 내용이 바뀐 것만 7번에서 요청`,
      );
      lines.push(...numbered(a.manualOnly.map(full)));
    }
    lines.push("");
    lines.push("## lastmod 손잡이 (바뀐 URL 만)");
    for (const t of a.lastmodTodo) {
      lines.push(`  - ${t.url} [지금 ${lastmods.get(t.url) ?? "사이트맵에 없음"}]`);
      lines.push(`      ${t.action}`);
    }
  }
  lines.push("");
  lines.push("## 피드");
  if (a.feedMetaSync.length) {
    lines.push(`- rss-tables 멤버 ${a.feedMetaSync.length}개: ${a.feedMetaSync.join(", ")}`);
    lines.push(
      rssTables
        ? "  제목·설명을 바꿨다면 같은 커밋에서 src/lib/rssTablesFeed.ts TABLES_FEED_META 를 맞추고 npx vitest run src/lib/__tests__/rssTablesFeed.test.ts"
        : "  (rssTablesFeed.ts 가 이 트리에 없음 — R4-RSS 배포 뒤부터 TABLES_FEED_META 동기화가 필요합니다)",
    );
    lines.push("  /rss-tables.xml pubDate 는 사이트맵 lastmod 를 그대로 씁니다.");
  } else {
    lines.push("- rss-tables 멤버 없음");
  }
  if (a.rssMembers.length) {
    lines.push(`- /rss.xml 멤버(가이드·리포트) ${a.rssMembers.length}개: ${a.rssMembers.join(", ")}`);
  }
  if (a.skippedPending.length) {
    lines.push("");
    lines.push(`## 아직 live 가 아닌 행 ${a.skippedPending.length}개 (배포됐다면 등록부 status 를 live 로 고친 뒤 다시 실행)`);
    for (const p of a.skippedPending) lines.push(`  - ${p.url} (${p.status})`);
  }
  console.log(lines.join("\n"));
  return 0;
}

function cmdDiff(registry: SeasonRegistry, args: string[], root: string): number {
  const [prevArg, nextArg] = args;
  if (!prevArg || !nextArg) {
    console.error(`${TAG} diff 에는 파일 두 개가 필요합니다\n${USAGE}`);
    return 2;
  }
  const evIdx = args.indexOf("--event");
  const eventId = evIdx >= 0 ? toEventId(args[evIdx + 1]) : null;
  if (evIdx >= 0 && !eventId) {
    console.error(`${TAG} --event 값이 E0~E12 가 아님: ${args[evIdx + 1] ?? "(없음)"}`);
    return 2;
  }
  const d = diffSitemaps(readSitemapArg(prevArg, root), readSitemapArg(nextArg, root));
  if (!d.ok) {
    console.error(`${TAG} ${d.side === "prev" ? "배포 전" : "배포 후"} 사이트맵 판독 실패: ${d.reason} — indexnow 도 이 경우 제출하지 않습니다`);
    return 1;
  }
  const plan = requestPlan(d, registry, eventId ?? undefined);
  const out: string[] = [];
  out.push(`${TAG} diff: 신규 ${d.added.length} · 변경 ${d.changed.length} · 삭제 ${d.removed.length} (= [indexnow] 목록 ${d.urls.length}개)`);
  if (d.urls.length === 0) {
    out.push(
      `바뀐 lastmod 없음 — diff 수집 요청 없음. 날짜 손잡이가 있는 URL 의 내용을 바꿨다면 lastmod 손잡이를 빠뜨린 것입니다${
        eventId ? "(손잡이 없는 URL 은 아래 수동 요청 목록)" : "(손잡이 없는 URL 은 --event 를 주면 수동 요청 목록으로 나옴)"
      }.`,
    );
  }
  if (d.added.length || d.removed.length) {
    out.push("[WARN] 동결기(11/1~1/31)에는 새 URL·삭제 URL 이 0개여야 합니다 — 의도한 변경인지 확인.");
  }
  plan.naverDays.forEach((day, i) => {
    out.push(`## 네이버 수집 요청 ${i + 1}일차 (${day.length}개)`);
    out.push(...numbered(day));
  });
  if (plan.gscInspect.length) {
    out.push(`## 구글 URL 검사 (${plan.gscInspect.length})`);
    out.push(...numbered(plan.gscInspect));
  }
  if (plan.removed.length) {
    out.push(`## 삭제된 URL (${plan.removed.length}) — 수집 요청 불필요`);
    out.push(...numbered(plan.removed));
  }
  if (plan.outsideRegistry.length) {
    out.push(`[WARN] 등록부 밖에서 바뀐 URL ${plan.outsideRegistry.length}개 — 위 목록 끝에 포함. 의도한 변경인지 확인.`);
  }
  if (eventId) {
    if (plan.manualRequest.length) {
      const lastDay = plan.naverDays[plan.naverDays.length - 1] ?? [];
      const free = plan.naverDays.length ? NAVER_REQUEST_CAP - lastDay.length : NAVER_REQUEST_CAP;
      out.push(
        `## diff 밖 수동 요청 — ${eventId} 후보 중 날짜 손잡이가 없는 URL ${plan.manualRequest.length}개 (내용이 바뀐 것만 골라 요청)`,
      );
      out.push(
        `   diff 목록과 합쳐 하루 ${NAVER_REQUEST_CAP}개 이하 — 발표 당사 계산기를 1일차 앞쪽에, 넘치는 diff 뒤쪽은 다음 날로 (지금 마지막 날 남은 자리 ${free}개).`,
      );
      out.push(...numbered(plan.manualRequest));
    }
    if (plan.eventUnchanged.length) {
      out.push(`## ${eventId} 후보인데 lastmod 가 그대로인 URL ${plan.eventUnchanged.length}개 (날짜 손잡이가 있음 — 내용을 바꿨다면 손잡이 누락)`);
      out.push(...numbered(plan.eventUnchanged));
    }
    if (plan.notInEvent.length) {
      out.push(`[INFO] ${eventId} 후보가 아닌 등록부 URL 이 바뀜 ${plan.notInEvent.length}개: ${plan.notInEvent.map(toPath).join(", ")}`);
    }
  }
  console.log(out.join("\n"));
  return 0;
}

async function main(): Promise<number> {
  const argv = process.argv.slice(2);
  const regIdx = argv.indexOf("--registry");
  const registryPath = resolve(regIdx >= 0 && argv[regIdx + 1] ? argv[regIdx + 1] : DEFAULT_REGISTRY);
  const rest = regIdx >= 0 ? argv.filter((_, i) => i !== regIdx && i !== regIdx + 1) : argv;
  const [cmd, ...args] = rest;
  if (!cmd || cmd === "--help" || cmd === "-h") {
    console.log(USAGE);
    return cmd ? 0 : 2;
  }
  const root = process.cwd();
  let registry: SeasonRegistry;
  try {
    registry = loadRegistry(registryPath);
  } catch (e) {
    console.error(`${TAG} 등록부 읽기 실패 (${registryPath}): ${e instanceof Error ? e.message : String(e)}`);
    return 1;
  }
  switch (cmd) {
    case "check":
      return cmdCheck(registry, root);
    case "event":
      return cmdEvent(registry, args[0], root);
    case "diff":
      return cmdDiff(registry, args, root);
    default:
      console.error(`${TAG} 알 수 없는 명령: ${cmd}\n${USAGE}`);
      return 2;
  }
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((e) => {
    console.error(`${TAG} 오류: ${e instanceof Error ? e.stack ?? e.message : String(e)}`);
    process.exitCode = 1;
  });
