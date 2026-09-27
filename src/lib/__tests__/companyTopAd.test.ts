// 회사 상세 상단 신규 유닛 머니샐러리_회사상단(2026-09-27 운영자 승인·발급 — docs/ad-experiments.md 실험 #3) 가드.
//  - 회사 페이지 전수(400+)에서 K1 자리(aside[data-msy-ad="company-upper"])가 정확히 1번, 안에는 CompanyTopAd 하나뿐
//  - 순증 1: 기존 유닛(페이지 끝 HomeTop·결과창·가이드중간·디스플레이2·인아티클·사이드바)은 각 1번 그대로, 멀티플렉스 0
//  - 위치: H1·결과창 광고 아래, 연봉표·가이드중간 광고 위 — 바로 앞은 요약 영역 끝(</main>), 바로 뒤는 연봉표
//  - 예약 높이: aside 클래스(my-12 + 폭별 min-h)와 광고 칸 minHeight 280 고정(점프 링크 CLS 대책 — 줄이면 실패)
//  - env 미설정: 컴포넌트는 아무것도 렌더하지 않고, 회사 페이지에도 빈 자리(aside)가 남지 않는다
//  - 회사 상세에만: 사용처·env 참조·표식이 회사 page.tsx(와 정의 파일 AdPlacement.tsx)에만 있다
//  - ad-audit 가 새 컴포넌트를 안다: AdPlacement 의 export 광고 컴포넌트마다 SLOT_OF 에 같은 env 슬롯으로 등재
//  - 슬롯 ID: .env.production 값 5077529791 · adsense-report UNIT_NAMES 가 env 의 모든 슬롯 ID 를 안다
// 페이지 렌더에서는 광고 컴포넌트를 표식 요소로 대체한다(광고 코드는 건드리지 않는다). env 동작은 실제 컴포넌트로 본다.
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/AdPlacement", async () => {
  const { createElement: h } = await import("react");
  const marker = (name: string) => () => h("i", { "data-test-ad": name });
  return {
    HomeTopAd: marker("HomeTopAd"),
    CalcResultAd: marker("CalcResultAd"),
    ResultAd: marker("CalcResultAd"),
    GuideMidAd: marker("GuideMidAd"),
    SidebarAd: marker("SidebarAd"),
    InArticleAd: marker("InArticleAd"),
    MultiplexAd: marker("MultiplexAd"),
    Display2Ad: marker("Display2Ad"),
    CompanyTopAd: marker("CompanyTopAd"),
  };
});
const { stub } = vi.hoisted(() => ({ stub: () => null }));
vi.mock("@/components/CoupangBanner", () => ({ default: stub }));
vi.mock("@/components/AppLink", () => ({
  default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children),
}));
vi.mock("next/dynamic", () => ({ default: () => stub }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/salary-db/kt",
  useRouter: () => ({ push() {}, replace() {}, prefetch() {} }),
  useSearchParams: () => new URLSearchParams(),
  permanentRedirect: () => {
    throw new Error("redirect");
  },
}));
vi.mock("@/components/ShareButtons", () => ({ default: stub }));
vi.mock("@/components/FavoritesButton", () => ({ default: stub }));
vi.mock("@/components/SalaryLookupTracker", () => ({ default: stub }));
vi.mock("@/components/PrivateFeedback", () => ({ default: stub }));
vi.mock("@/components/RelatedCalculators", () => ({ default: stub }));

import CompanyDetailPage from "@/app/salary-db/[id]/page";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";

const ROOT = process.cwd();
const PAGE_FILE = "src/app/salary-db/[id]/page.tsx";
const AD_FILE = "src/components/AdPlacement.tsx";
const ENV_KEY = "NEXT_PUBLIC_ADSENSE_SLOT_COMPANY_TOP";
const SLOT_ID = "5077529791";
const MARKER = 'data-msy-ad="company-upper"';
const ASIDE_CLASS = "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-12 min-h-[344px] lg:min-h-[324px]";
const adTag = (name: string) => `<i data-test-ad="${name}"></i>`;
const count = (s: string, sub: string) => s.split(sub).length - 1;
const read = (rel: string) => readFileSync(path.join(ROOT, rel), "utf8");

const companies = companyRepository.getAll();
const render = (id: string) =>
  renderToStaticMarkup(
    createElement(CompanyDetailPage as unknown as (p: { params: { id: string } }) => ReactNode, { params: { id } }),
  );
const renderAll = (ids: string[]) => new Map(ids.map((id) => [id, render(id)]));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("회사 상세 K1 신규 유닛 — 전수 렌더(env 설정)", () => {
  vi.stubEnv(ENV_KEY, SLOT_ID);
  const pages = renderAll(companies.map((c) => c.id));
  vi.unstubAllEnvs();

  it("회사 페이지마다 K1 자리가 1번, 안에는 CompanyTopAd 하나뿐, 예약 클래스 고정", () => {
    expect(companies.length).toBeGreaterThanOrEqual(400);
    const bad: string[] = [];
    for (const [id, html] of pages) {
      const blocks = [...html.matchAll(/<aside\b([^>]*)data-msy-ad="company-upper"([^>]*)>([\s\S]*?)<\/aside>/g)];
      const attrs = blocks.length === 1 ? blocks[0][1] + blocks[0][2] : "";
      if (
        count(html, MARKER) !== 1 ||
        blocks.length !== 1 ||
        blocks[0][3] !== adTag("CompanyTopAd") ||
        !attrs.includes(`class="${ASIDE_CLASS}"`) ||
        !attrs.includes('aria-label="광고"')
      ) {
        bad.push(`${id}: 표식 ${count(html, MARKER)}회, 내용 ${blocks.map((b) => b[3]).join(" | ")} 속성 ${attrs}`);
      }
      if (count(html, adTag("CompanyTopAd")) !== 1) bad.push(`${id}: CompanyTopAd ${count(html, adTag("CompanyTopAd"))}회`);
    }
    expect(bad.slice(0, 20)).toEqual([]);
  });

  it("순증 1 — 기존 유닛은 각 1번 그대로(페이지 끝 HomeTop 포함), 멀티플렉스 0", () => {
    const bad: string[] = [];
    for (const [id, html] of pages) {
      for (const name of ["HomeTopAd", "CalcResultAd", "GuideMidAd", "Display2Ad", "InArticleAd", "SidebarAd"]) {
        if (count(html, adTag(name)) !== 1) bad.push(`${id}: ${name} ${count(html, adTag(name))}회`);
      }
      if (count(html, adTag("MultiplexAd")) !== 0) bad.push(`${id}: Multiplex 배치됨(A4 게이트)`);
      // HomeTop 은 페이지 끝(가이드중간·디스플레이2·인아티클 뒤) 그대로
      if (!(html.indexOf(adTag("InArticleAd")) < html.indexOf(adTag("HomeTopAd")))) bad.push(`${id}: HomeTop 이 페이지 끝이 아님`);
    }
    expect(bad.slice(0, 20)).toEqual([]);
  });

  it("위치: H1·결과창 광고 아래, 연봉표·가이드중간 광고 위 — 앞은 요약 영역 끝, 뒤는 연봉표(다른 광고와 붙지 않음)", () => {
    const bad: string[] = [];
    for (const [id, html] of pages) {
      const upper = html.indexOf(MARKER);
      const start = html.lastIndexOf("<aside", upper);
      const end = html.indexOf("</aside>", upper) + "</aside>".length;
      const h1 = html.indexOf("<h1");
      const result = html.indexOf(adTag("CalcResultAd"));
      const table = html.indexOf('data-msy-module="company-salary-net"');
      const guideMid = html.indexOf(adTag("GuideMidAd"));
      const order = h1 >= 0 && h1 < result && result < upper && upper < table && table < guideMid;
      const beforeOk = html.slice(0, start).endsWith("</main>");
      const after = html.slice(end);
      const afterOk =
        after.startsWith('<section data-msy-module="company-salary-net"') ||
        (id === "samsung-electronics" && after.startsWith('<div id="samsung-salary-table"'));
      if (upper < 0 || !order || !beforeOk || !afterOk) {
        bad.push(`${id}: order=${order} before=${html.slice(start - 40, start)} after=${after.slice(0, 60)}`);
      }
    }
    expect(bad.slice(0, 20)).toEqual([]);
  });
});

describe("env 미설정 — 아무것도 렌더하지 않음", () => {
  it("회사 페이지에 K1 자리(aside)도 CompanyTopAd 도 없다 — 빈 예약 공간이 남지 않음", () => {
    vi.stubEnv(ENV_KEY, "");
    const ids = ["samsung-electronics", "kt", "sk-hynix", ...companies.slice(0, 20).map((c) => c.id)];
    for (const [id, html] of renderAll(ids)) {
      expect(count(html, MARKER), id).toBe(0);
      expect(count(html, adTag("CompanyTopAd")), id).toBe(0);
      expect(count(html, adTag("HomeTopAd")), id).toBe(1);
    }
  });

  it("실제 CompanyTopAd: env 없으면 빈 문자열, 있으면 광고 칸 1개(ad-slot-company-top · 예약 280+라벨 20)", async () => {
    const actual = await vi.importActual<typeof import("@/components/AdPlacement")>("@/components/AdPlacement");
    vi.stubEnv(ENV_KEY, "");
    expect(renderToStaticMarkup(createElement(actual.CompanyTopAd))).toBe("");
    vi.stubEnv(ENV_KEY, SLOT_ID);
    const html = renderToStaticMarkup(createElement(actual.CompanyTopAd));
    expect(count(html, 'class="ad-container ad-slot-company-top"')).toBe(1);
    expect(html).toContain("min-height:300px");
    expect(html).toContain("광고 (Sponsored)");
  });
});

describe("회사 상세에만 · ad-audit·보고 도구가 새 유닛을 안다", () => {
  const listSource = (dir: string, out: string[] = []): string[] => {
    for (const e of readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) {
        if (e.name !== "__tests__") listSource(rel, out);
      } else if (/\.(tsx?|jsx?|mjs)$/.test(e.name) && !/\.test\./.test(e.name)) out.push(rel);
    }
    return out;
  };
  const files = listSource("src");

  it("CompanyTopAd 사용처·env 참조·표식은 회사 상세 page.tsx(+정의 파일)에만, 그 page 를 import 하는 앱 코드는 없다", () => {
    const has = (re: RegExp) => files.filter((f) => re.test(read(f)));
    expect(has(/<CompanyTopAd\b/)).toEqual([PAGE_FILE]);
    expect(read(PAGE_FILE).match(/<CompanyTopAd\b/g)).toHaveLength(1);
    expect(has(new RegExp(ENV_KEY)).sort()).toEqual([PAGE_FILE, AD_FILE].sort());
    expect(has(/company-upper/)).toEqual([PAGE_FILE]);
    expect(has(/salary-db\/\[id\]\/page["']/)).toEqual([]);
  });

  it("ad-audit SLOT_OF 가 AdPlacement 의 export 광고 컴포넌트를 전부 같은 env 슬롯으로 안다(CompanyTopAd → COMPANY_TOP)", () => {
    const audit = read("scripts/ad-audit.mjs");
    const block = audit.slice(audit.indexOf("const SLOT_OF = {"), audit.indexOf("};", audit.indexOf("const SLOT_OF = {")));
    const slotOf = new Map(
      [...block.matchAll(/^\s*(\w+):\s*\[([^\]]*)\]/gm)].map((m) => [m[1], [...m[2].matchAll(/"(\w+)"/g)].map((x) => x[1])]),
    );
    expect(slotOf.get("CompanyTopAd")).toEqual(["COMPANY_TOP"]);
    const ads = read(AD_FILE);
    const comps = [...ads.matchAll(/export function (\w+)\(\)\s*\{([\s\S]*?)\n\}/g)];
    expect(comps.map((m) => m[1])).toContain("CompanyTopAd");
    for (const [, name, body] of comps) {
      const env = body.match(/NEXT_PUBLIC_ADSENSE_SLOT_(\w+)/)?.[1];
      expect(env, name).toBeTruthy();
      expect(slotOf.get(name)?.[0], name).toBe(env);
    }
    for (const [, alias, target] of ads.matchAll(/export const (\w+) = (\w+);/g)) {
      expect(slotOf.get(alias), alias).toEqual(slotOf.get(target));
    }
  });

  it(".env.production 에 발급 슬롯 ID, adsense-report UNIT_NAMES 는 env 의 모든 광고 슬롯 ID 를 안다", () => {
    const env = read(".env.production");
    expect(env).toMatch(new RegExp(`^${ENV_KEY}=${SLOT_ID}\\r?$`, "m"));
    const report = read("scripts/adsense-report.mjs");
    const ids = [...env.matchAll(/^NEXT_PUBLIC_ADSENSE_SLOT_\w+=(\d{10})\r?$/gm)].map((m) => m[1]);
    expect(ids).toContain(SLOT_ID);
    for (const id of ids) expect(report, id).toMatch(new RegExp(`^\\s*${id}: "`, "m"));
  });
});
