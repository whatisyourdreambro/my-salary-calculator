// scripts/trend-publish/source-snapshot.ts — 공식 출처 원문 스냅숏 (2026-09-26 R5 publisher)
//
// 사용: npx tsx scripts/trend-publish/source-snapshot.ts --url <https 공식 URL> --out <TREND_HOME/snapshots/날짜>
//        [--from-rss <같은 호스트 RSS>] [--id <출처 id>] [--trend-home <dir>]
// - 호스트: BRIEF_CITATION_HOSTS ∩ isOfficialSourceHost (korea.kr 은 개별 페이지만). 그 밖은 거부(exit 1).
// - robots: ../trend-radar/lib/robots.mjs 로 확인(동적 import — 테스트는 스텁 주입). 차단이면 거부.
//   복지부 /board.es · 인사처 /board/board.do 상세 페이지는 robots 가 막으므로 --from-rss 로 허용된 RSS 의 item 본문을 쓴다.
// - 기록: {url, finalUrl, fetchedAt, sha256, bytes, kogl, title, httpStatus, robotsAllowed, text} — TREND_HOME 아래에만 쓴다(저장소 금지).
// - 로그에는 호스트+경로만(쿼리 제외). 뉴스 본문·이미지는 가져오지 않는다(공식 호스트만 허용).
// 종료 코드: 0 성공 · 1 정책 거부(호스트·robots·HTTP≠200) · 2 인프라 오류(네트워크·레이더 모듈 없음).
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isBriefCitationUrl } from "../../src/lib/trendBriefs/rules";

export interface FetchResult {
  status: number;
  finalUrl: string;
  body: string;
}
export interface Net {
  robotsAllowed(url: string): Promise<boolean>;
  fetchText(url: string): Promise<FetchResult>;
}
export interface SnapshotRecord {
  id?: string;
  url: string;
  finalUrl: string;
  fetchedAt: string;
  sha256: string;
  bytes: number;
  kogl: number | null;
  title: string;
  httpStatus: number;
  robotsAllowed: boolean;
  via: "direct" | "rss";
  rssUrl?: string;
  text: string;
}

export class PolicyError extends Error {}

const HERE = dirname(fileURLToPath(import.meta.url));
/** robots 가 상세 페이지를 막는 게시판 — 허용된 RSS 로만 본문을 얻는다 */
const RSS_ONLY = [/^https:\/\/(?:www\.)?mohw\.go\.kr\/board\.es\b/, /^https:\/\/(?:www\.)?mpm\.go\.kr\/(?:[^?#]*\/)?board\/board\.do\b/];

/** 로그용 — 호스트+경로만 */
export const redactUrl = (u: string) => {
  try {
    const x = new URL(u);
    return `${x.host}${x.pathname}`;
  } catch {
    return "(잘못된 URL)";
  }
};

/** 레이더의 robots·http 모듈을 동적으로 불러와 Net 으로 맞춘다 (함수 이름 차이를 흡수) */
export async function loadNet(): Promise<Net> {
  const robotsPath = join(HERE, "..", "trend-radar", "lib", "robots.mjs");
  const httpPath = join(HERE, "..", "trend-radar", "lib", "http.mjs");
  if (!existsSync(robotsPath) || !existsSync(httpPath)) throw new Error("scripts/trend-radar/lib/{robots,http}.mjs 없음 — 레이더 컴포넌트가 먼저 병합돼야 한다");
  const robots = (await import(pathToFileURL(robotsPath).href)) as Record<string, unknown>;
  const http = (await import(pathToFileURL(httpPath).href)) as Record<string, unknown>;
  const pick = (mod: Record<string, unknown>, names: string[]) => {
    for (const n of names) if (typeof mod[n] === "function") return mod[n] as (...a: unknown[]) => Promise<unknown>;
    const d = mod.default as Record<string, unknown> | undefined;
    if (d) for (const n of names) if (typeof d[n] === "function") return d[n] as (...a: unknown[]) => Promise<unknown>;
    return null;
  };
  const allowed = pick(robots, ["robotsAllowed", "isAllowed", "isAllowedByRobots", "checkRobots", "allowed"]);
  const get = pick(http, ["fetchText", "getText", "httpGet", "get", "fetchUrl"]);
  if (!allowed || !get) throw new Error("trend-radar robots/http 모듈의 함수 이름을 찾지 못함 (robotsAllowed·fetchText 계열)");
  return {
    robotsAllowed: async (url) => {
      const v = await allowed(url);
      return typeof v === "boolean" ? v : Boolean((v as { allowed?: boolean })?.allowed);
    },
    fetchText: async (url) => {
      const v = (await get(url)) as Record<string, unknown> | string;
      if (typeof v === "string") return { status: 200, finalUrl: url, body: v };
      return {
        status: Number(v.status ?? v.statusCode ?? 0),
        finalUrl: String(v.finalUrl ?? v.url ?? url),
        body: String(v.body ?? v.text ?? ""),
      };
    },
  };
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", middot: "·", hellip: "…", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’" };
export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

/** HTML → 문단 텍스트 (script·style·noscript 제거, 블록 태그는 줄바꿈) */
export function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1\s*>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<\/?(?:p|div|br|li|tr|h[1-6]|section|article|table|ul|ol|dd|dt)\b[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  )
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

export function detectKogl(html: string): number | null {
  const m = /공공누리\s*(?:제\s*)?([1-4])\s*유형|KOGL\s*Type\s*([1-4])|kogl_?type_?([1-4])|img_opentype0?([1-4])/i.exec(html);
  const v = m ? Number(m[1] ?? m[2] ?? m[3] ?? m[4]) : NaN;
  return Number.isFinite(v) ? v : null;
}

const sha256 = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");
const titleOf = (html: string) => decodeEntities(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "").replace(/\s+/g, " ").trim();

function insideDir(child: string, parent: string): boolean {
  const c = resolve(child);
  const p = resolve(parent);
  return c === p || c.startsWith(p.endsWith(sep) ? p : p + sep);
}

/** 스냅숏 한 건 — 기록을 돌려주고 outDir/<id>.json 에 쓴다 */
export async function snapshotSource(
  opts: { url: string; outDir: string; trendHome: string; fromRss?: string; id?: string; now?: Date },
  injected?: Net
): Promise<SnapshotRecord> {
  if (!isBriefCitationUrl(opts.url)) throw new PolicyError(`허용 호스트 아님(BRIEF_CITATION_HOSTS ∩ 공식 호스트, https, korea.kr 개별 페이지): ${redactUrl(opts.url)}`);
  if (!insideDir(opts.outDir, opts.trendHome)) throw new PolicyError(`--out 은 TREND_HOME 아래여야 한다(저장소에 쓰지 않음): ${opts.outDir}`);
  const net = injected ?? (await loadNet());
  const fetchedAt = (opts.now ?? new Date()).toISOString();
  let record: SnapshotRecord;
  if (RSS_ONLY.some((re) => re.test(opts.url))) {
    if (!opts.fromRss) throw new PolicyError(`robots 가 막는 게시판 상세 페이지 — --from-rss <허용된 RSS> 로만 가져온다: ${redactUrl(opts.url)}`);
    const rss = new URL(opts.fromRss);
    if (rss.protocol !== "https:" || rss.hostname !== new URL(opts.url).hostname) throw new PolicyError("--from-rss 는 같은 호스트의 https RSS 여야 한다");
    if (!(await net.robotsAllowed(opts.fromRss))) throw new PolicyError(`robots 가 RSS 도 막음: ${redactUrl(opts.fromRss)}`);
    const res = await net.fetchText(opts.fromRss);
    if (res.status !== 200) throw new PolicyError(`RSS HTTP ${res.status}: ${redactUrl(opts.fromRss)}`);
    const norm = (u: string) => decodeEntities(u.trim()).replace(/^http:/, "https:");
    const items = [...res.body.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map((m) => m[0]);
    const item = items.find((it) => norm(/<link>([\s\S]*?)<\/link>/i.exec(it)?.[1] ?? "") === norm(opts.url));
    if (!item) throw new PolicyError(`RSS 에서 해당 글(item)을 찾지 못함: ${redactUrl(opts.url)}`);
    const pickTag = (tag: string) => {
      const raw = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(item)?.[1] ?? "";
      const cdata = /^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/.exec(raw)?.[1];
      return cdata ?? decodeEntities(raw);
    };
    const title = htmlToText(pickTag("title"));
    const text = htmlToText(`${title}\n${pickTag("description")}`);
    record = {
      url: opts.url,
      finalUrl: opts.url,
      fetchedAt,
      sha256: sha256(text),
      bytes: Buffer.byteLength(item, "utf8"),
      kogl: detectKogl(item),
      title,
      httpStatus: 200,
      robotsAllowed: true,
      via: "rss",
      rssUrl: opts.fromRss,
      text,
    };
  } else {
    if (!(await net.robotsAllowed(opts.url))) throw new PolicyError(`robots 차단: ${redactUrl(opts.url)}`);
    const res = await net.fetchText(opts.url);
    if (res.status !== 200) throw new PolicyError(`HTTP ${res.status}: ${redactUrl(opts.url)}`);
    if (!isBriefCitationUrl(res.finalUrl)) throw new PolicyError(`리디렉트 도착지가 허용 호스트 밖: ${redactUrl(res.finalUrl)}`);
    const text = htmlToText(res.body);
    record = {
      url: opts.url,
      finalUrl: res.finalUrl,
      fetchedAt,
      sha256: sha256(text),
      bytes: Buffer.byteLength(res.body, "utf8"),
      kogl: detectKogl(res.body),
      title: titleOf(res.body),
      httpStatus: res.status,
      robotsAllowed: true,
      via: "direct",
      text,
    };
  }
  if (opts.id) record.id = opts.id;
  mkdirSync(opts.outDir, { recursive: true });
  const name = (opts.id ?? sha256(opts.url).slice(0, 12)).replace(/[^a-z0-9-]/gi, "-");
  writeFileSync(join(opts.outDir, `${name}.json`), `${JSON.stringify(record, null, 2)}\n`, "utf8");
  return record;
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : undefined;
}

async function main(): Promise<number> {
  const url = arg("--url");
  const out = arg("--out");
  const trendHome = arg("--trend-home") ?? process.env.TREND_HOME;
  if (!url || !out || !trendHome) {
    console.error("사용: source-snapshot.ts --url <https 공식 URL> --out <TREND_HOME/snapshots/날짜> [--from-rss <RSS>] [--id <id>] [--trend-home <dir>]");
    return 2;
  }
  try {
    const rec = await snapshotSource({ url, outDir: out, trendHome, fromRss: arg("--from-rss"), id: arg("--id") });
    console.log(JSON.stringify({ ok: true, url: redactUrl(rec.url), sha256: rec.sha256, bytes: rec.bytes, kogl: rec.kogl, via: rec.via, chars: rec.text.length }));
    return 0;
  } catch (e) {
    const policy = e instanceof PolicyError;
    console.error(`[source-snapshot] ${policy ? "거부" : "오류"}: ${(e as Error).message}`);
    return policy ? 1 : 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().then((code) => process.exit(code));
}
