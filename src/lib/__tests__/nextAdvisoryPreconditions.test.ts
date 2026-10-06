// Next 14.2.35 보안 권고 '영향 없음' 판정의 전제 고정 (2026-09-28, docs/security-advisories-2026-09-28.md)
//
// 14.2.35 는 14.x 마지막 판이라 npm audit 의 next 권고 23건은 15.5.24 이상으로 올리기 전에는
// 코드로 고칠 수 없다(업그레이드 창 2027-02, 거버넌스 S26). 그중 다수는 "그 기능을 쓰지 않아서
// 영향 없음"으로 판정했는데, 기능을 하나 넣는 순간 판정이 뒤집힌다. 이 테스트가 깨지면
// 기능을 넣기 전에 업그레이드가 먼저이거나 문서의 판정을 다시 해야 한다는 뜻이다.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config.mjs";

const ROOT = process.cwd();
const SOURCE_EXT = /\.(?:[cm]?js|jsx|ts|tsx)$/;

// 앱 코드만 본다 — 테스트 파일(이 파일 포함)은 번들에 들어가지 않는다.
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name !== "__tests__") out.push(...walk(p));
    } else if (SOURCE_EXT.test(name) && !/\.test\.[cm]?[jt]sx?$/.test(name)) out.push(p);
  }
  return out;
}

const sources = walk(join(ROOT, "src")).map((file) => ({
  rel: relative(ROOT, file),
  text: readFileSync(file, "utf8"),
}));

type Redirect = { source: string; destination: string };
type Config = {
  images?: { unoptimized?: boolean; remotePatterns?: unknown; localPatterns?: unknown; loader?: unknown };
  experimental?: Record<string, unknown>;
  i18n?: unknown;
  rewrites?: unknown;
  redirects?: () => Promise<Redirect[]>;
};
const cfg = nextConfig as unknown as Config;

describe("Next 14.2.35 advisory preconditions", () => {
  // 서버 액션·서버 함수 계열 7건(GHSA-h25m·q4gf·8h8q·m99w·4c39·89xv·955p). 14.2.35 의
  // action-handler 는 서버 액션 매니페스트가 비어 있으면 본문을 읽기 전에 404 로 끝낸다.
  it("defines no Server Actions (no module- or function-level use-server directive)", () => {
    const directive = /^\s*["']use server["'];?\s*$/m;
    expect(sources.filter((s) => directive.test(s.text)).map((s) => s.rel)).toEqual([]);
    expect(cfg.experimental?.serverActions).toBeUndefined();
  });

  // GHSA-gx5p-jg67-6x7h: beforeInteractive 스크립트에 외부 입력이 들어갈 때만 해당.
  it("uses no beforeInteractive scripts", () => {
    expect(sources.filter((s) => s.text.includes("beforeInteractive")).map((s) => s.rel)).toEqual([]);
  });

  // 이미지 최적화 계열 4건(GHSA-9g9p·3x4c·h64f·2xp9) — unoptimized 면 /_next/image 가 돌지 않는다.
  it("keeps the image optimizer off with no remote/local patterns or custom loader", () => {
    expect(cfg.images?.unoptimized).toBe(true);
    expect(cfg.images?.remotePatterns).toBeUndefined();
    expect(cfg.images?.localPatterns).toBeUndefined();
    expect(cfg.images?.loader).toBeUndefined();
  });

  // GHSA-ggv3-7p47-pfv8(rewrites 요청 스머글링)·GHSA-p9j2-gv94-2wf4(외부 목적지 호스트 SSRF/오픈 리다이렉트).
  it("has no rewrites and only same-site redirect destinations", async () => {
    expect(cfg.rewrites).toBeUndefined();
    const redirects = cfg.redirects ? await cfg.redirects() : [];
    expect(redirects.length).toBeGreaterThan(0);
    const external = redirects.filter((r) => !r.destination.startsWith("/") || r.destination.startsWith("//"));
    expect(external.map((r) => `${r.source} -> ${r.destination}`)).toEqual([]);
  });

  // GHSA-36qx-fr4f-26g5: Pages Router + i18n + 미들웨어 인가 조합에서만 해당.
  it("stays App Router only without i18n config", () => {
    expect(cfg.i18n).toBeUndefined();
    expect(existsSync(join(ROOT, "src/pages"))).toBe(false);
    expect(existsSync(join(ROOT, "pages"))).toBe(false);
  });
});
