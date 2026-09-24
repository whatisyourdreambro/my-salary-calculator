// 세션 유입 귀속 보호 회귀 가드 (2026-09-25, 감사 승인 항목 4 — GA4 계측 수리 (a))
//
// 배경: GA4 28일(2026-08-27..09-23) 소스/매체 표에 add·remove·compare-page·header_badge·
// toast_dashboard 가 '세션 소스'로 484세션 잡혔다. 전부 bookmark_click·compare_view 의
// 이벤트 파라미터 `source` 값과 정확히 일치 — GA4 는 이벤트의 source/medium/campaign/term/content
// 를 트래픽 소스 필드로 읽어 실제 유입 채널(네이버 등)을 덮어쓴다.
// 사이트 내부 href 에 utm_* 를 붙이는 지점은 0건(공유 withUtm·위젯/임베드 링크는 외부 유입이라 정상).

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RESERVED_TRAFFIC_SOURCE_PARAMS, sanitizeAnalyticsParams } from "../analyticsPrivacy";
import { trackBookmarkClick, trackCompareView, trackEvent } from "../analytics";

afterEach(() => vi.unstubAllGlobals());

function stubGa() {
  const gtag = vi.fn();
  vi.stubGlobal("window", { gtag, location: { href: "https://www.moneysalary.com/salary-db/samsung-electronics" } });
  vi.stubGlobal("location", { pathname: "/salary-db/samsung-electronics" });
  return gtag;
}

describe("custom events never carry GA4 traffic-source parameter names", () => {
  it("renames every reserved key to ui_<key> and keeps the value", () => {
    for (const key of RESERVED_TRAFFIC_SOURCE_PARAMS) {
      const safe = sanitizeAnalyticsParams("bookmark_click", { [key]: "header_badge", target_path: "/dashboard" });
      expect(safe).toEqual({ [`ui_${key}`]: "header_badge", target_path: "/dashboard" });
      expect(Object.keys(safe)).not.toContain(key);
    }
  });

  it("leaves look-alike but non-reserved names such as content_type and ui_source untouched", () => {
    expect(sanitizeAnalyticsParams("share", { content_type: "page", method: "kakao", ui_source: "x" }))
      .toEqual({ content_type: "page", method: "kakao", ui_source: "x" });
  });

  it("bookmark_click and compare_view send ui_source, not source", () => {
    const gtag = stubGa();
    trackBookmarkClick("/dashboard", "add");
    trackBookmarkClick("/dashboard", "header_badge");
    trackCompareView(["kia", "hyundai"], "compare-page");
    expect(gtag.mock.calls.map((call) => call[1])).toEqual(["bookmark_click", "bookmark_click", "compare_view"]);
    for (const [, , params] of gtag.mock.calls) {
      for (const key of RESERVED_TRAFFIC_SOURCE_PARAMS) expect(params).not.toHaveProperty(key);
    }
    expect(gtag.mock.calls[0][2]).toMatchObject({ ui_source: "add", target_path: "/dashboard" });
    expect(gtag.mock.calls[1][2]).toMatchObject({ ui_source: "header_badge" });
    expect(gtag.mock.calls[2][2]).toMatchObject({ ui_source: "compare-page", company_ids: "kia,hyundai", company_count: 2 });
  });

  it("a future caller passing source directly through trackEvent is still remapped", () => {
    const gtag = stubGa();
    trackEvent("some_new_event", { source: "hero", medium: "card" });
    expect(gtag.mock.calls[0][2]).toMatchObject({ ui_source: "hero", ui_medium: "card" });
    expect(gtag.mock.calls[0][2]).not.toHaveProperty("source");
    expect(gtag.mock.calls[0][2]).not.toHaveProperty("medium");
  });
});

describe("internal links do not append utm_* (would restart attribution on every click)", () => {
  // 외부 유입용만 허용: 공유 채널 귀속(withUtm)·임베드/iframe 위젯(타 사이트에 게시되는 링크)
  const ALLOWED = [
    "src/lib/shareChannels.ts",
    "src/app/widget/",
    "src/app/embed/",
  ];
  const ROOT = resolve(process.cwd());
  function walk(dir: string, out: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        if (name === "__tests__" || name === "node_modules") continue;
        walk(full, out);
      } else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)) {
        out.push(full);
      }
    }
    return out;
  }

  it("no source file outside share/widget/embed builds a utm_source/utm_medium/utm_campaign query", () => {
    const offenders: string[] = [];
    for (const file of walk(join(ROOT, "src"))) {
      const rel = relative(ROOT, file).replace(/\\/g, "/");
      if (ALLOWED.some((prefix) => rel.startsWith(prefix))) continue;
      const text = readFileSync(file, "utf8");
      if (/utm_(source|medium|campaign)=/.test(text)) offenders.push(rel);
    }
    expect(offenders).toEqual([]);
  });
});
