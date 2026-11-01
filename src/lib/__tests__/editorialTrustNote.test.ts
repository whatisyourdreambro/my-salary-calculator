// '만든 사람과 확인 방법' 상자 (G4, 운영자 승인 2026-11-01 구글 개선 5번 — 돈·세금(YMYL) 신뢰 신호)
//
// 이 테스트가 고정하는 것:
//  1) 내용: 작성자는 /about 운영자 소개와 같은 사실(현직 직장인 1인 운영)만, 실명 없음. 링크는 이미 있는 주소 2개
//     (/about#editorial-method, /contact) — 새 쿼리 주소를 만들지 않는다. 언론 보도가 섞인 성과급 계산기와, 공시 평균급여가
//     보도 인용뿐이고 견줄 DART 값이 없는 회사 페이지는 '공식 자료'라고 쓰지 않는다(그 회사 집합은 서버 데이터로 다시 계산해
//     맞춘다). 회사 페이지는 회사마다 날짜가 달라 날짜 줄이 없다.
//  2) 날짜: 각 대조일은 이미 있는 출처 값(화면 수정일·PublishedMeta·데이터 상수·Dataset dateModified·내용 검토 원장)과 같다.
//     페이지를 실질 수정해 출처 날짜가 바뀌면 여기서 걸린다 — 링크·배치·이 상자만 바뀐 경우에는 대조일을 올리지 않는다.
//  3) 배치: 실제 page·layout 을 서버 렌더하면(광고는 표지 div) 상자는 모든 광고·공유 뒤, 맨 마지막에 1번 나온다.
//     layout 이 children 뒤에 광고를 그리는 계산기·표·회사 페이지는 layout 맨 끝에서만 그린다. 대상 밖 경로는 상자 없음.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement, type AnchorHTMLAttributes, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const location = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({
  usePathname: () => location.pathname,
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
  notFound: () => {
    throw new Error("not-found");
  },
  permanentRedirect: () => {
    throw new Error("redirect");
  },
}));
vi.mock("@/components/AppLink", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => createElement("a", props),
}));
vi.mock("@/components/AdPlacement", () => {
  const ad = (name: string) =>
    function InertAd() {
      return createElement("div", { "data-test-ad": name });
    };
  return {
    HomeTopAd: ad("home-top"),
    InArticleAd: ad("in-article"),
    GuideMidAd: ad("guide-mid"),
    CalcResultAd: ad("result"),
    ResultAd: ad("result"),
    Display2Ad: ad("display2"),
    MultiplexAd: ad("multiplex"),
    SidebarAd: ad("sidebar"),
    CompanyTopAd: ad("company-top"),
  };
});
vi.mock("@/components/CoupangBanner", () => ({ default: () => createElement("div", { "data-test-ad": "coupang" }) }));
vi.mock("@/components/affiliate/AffiliateSlot", () => ({
  OfferSlot: () => createElement("div", { "data-test-ad": "offer" }),
  default: () => createElement("div", { "data-test-ad": "affiliate" }),
}));
vi.mock("@/components/AutoShareSection", () => ({ default: () => createElement("div", { "data-test": "share" }) }));
vi.mock("@/components/FloatingShareBar", () => ({ default: () => createElement("div", { "data-test": "floating-share" }) }));
vi.mock("@/components/ShareSection", () => ({ default: () => createElement("div", { "data-test": "share" }) }));
vi.mock("@/components/ShareButtons", () => ({ default: () => createElement("div", { "data-test": "share" }) }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => createElement("div", { "data-test": "related" }) }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/YearEndTaxCalculator", () => ({ default: () => null }));
vi.mock("@/components/YearEndTaxCluster", () => ({ default: () => null }));
vi.mock("@/app/table/2026/TableTabsNav", () => ({ default: () => null }));
vi.mock("@/app/table/2027/TableTabsNav", () => ({ default: () => null }));
// 홈 계산기 섬(클라이언트, 동적 import)은 마지막 광고 표지만 남긴다 — 실제 마지막 광고(MultiplexAd)가 HomeClient 끝이라는 점은
// 아래 소스 검사가 따로 본다. 섬에 넘기는 서버 블록들은 렌더되지 않으므로 가볍게 비운다.
vi.mock("@/app/HomeClient", () => ({
  default: () => createElement("div", { "data-test": "home-client" }, createElement("div", { "data-test-ad": "multiplex" })),
}));
vi.mock("@/components/FeaturedGuides", () => ({ default: () => null }));
vi.mock("@/components/SocialProof", () => ({ default: () => null }));
vi.mock("@/components/GuideCategories", () => ({ default: () => null }));
vi.mock("@/components/home/HomeToolsSection", () => ({ default: () => null }));
vi.mock("@/components/home/TrafficEnginesNav", () => ({ default: () => null }));

import EditorialTrustNote from "@/components/EditorialTrustNote";
import {
  EDITORIAL_TRUST_AUTHOR,
  EDITORIAL_TRUST_COMPANY,
  EDITORIAL_TRUST_COMPANY_PRESS,
  EDITORIAL_TRUST_PAGES,
  EDITORIAL_TRUST_PRESS_ONLY_COMPANY_IDS,
  EDITORIAL_TRUST_TABLE_2026,
  EDITORIAL_TRUST_TABLE_2027,
  editorialTrustNoteFor,
  formatEditorialTrustDate,
} from "@/lib/editorialTrust";
import { TAX_TABLE_EFFECTIVE_DATE } from "@/config/siteDates";
import { LAST_UPDATED as SK_HYNIX_LAST_UPDATED } from "@/app/calc/sk-hynix-bonus/psData";
import { YEAR_END_LIMITS_SOURCE_NOTE } from "@/lib/yearEndLimits2026";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { dartCompanyStatsById } from "@/lib/salary-data/dartReport";
import { isOfficialDisclosureUrl } from "@/lib/companyMetaDisclosed";
import { pageRevisionFields } from "../../../scripts/lib/sitemap-freshness.mjs";
import HomePage from "@/app/page";
import CalcLayout from "@/app/calc/layout";
import Table2026Layout from "@/app/table/2026/layout";
import Table2027Layout from "@/app/table/2027/layout";
import SalaryDbLayout from "@/app/salary-db/layout";
import YearEndTaxPage from "@/app/year-end-tax/page";
import YearEndTaxPreviewPage from "@/app/year-end-tax-preview/page";
import SocialInsurance2027Page from "@/app/social-insurance-rates-2027/page";
import MinimumWage2027Page from "@/app/minimum-wage-2027/page";
import DependentPage from "@/app/health-insurance-dependent/page";
import PropertyHoldingTaxPage from "@/app/property-holding-tax-2026/page";

const NOTE = 'data-msy-module="editorial-trust-note"';
const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8").replace(/\r\n/g, "\n");
/** JSX·블록·줄 주석을 뺀 소스 — 주석 속 컴포넌트 이름이 순서 판정을 흐리지 않게 */
const code = (file: string) =>
  read(file)
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
const ledger = JSON.parse(read("scripts/sitemap-content-reviews.json")) as {
  routes: Record<string, { contentDate: string }>;
};
const hrefs = (html: string) => [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
const visible = (html: string) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
const TABLE_PATHS = [2026, 2027].flatMap((year) => ["annual", "monthly", "weekly", "hourly"].map((unit) => `/table/${year}/${unit}`));
const TARGET_PAGES = Object.keys(EDITORIAL_TRUST_PAGES).sort();

function renderNote(path: string) {
  return renderToStaticMarkup(createElement(EditorialTrustNote, { path }));
}

function renderLayoutAt(pathname: string, Layout: (props: { children: ReactNode }) => ReactNode) {
  location.pathname = pathname;
  return renderToStaticMarkup(createElement(Layout, null, createElement("main", { "data-test": "page-body" }, "page")));
}

function renderPageAt(pathname: string, Page: () => ReactNode) {
  location.pathname = pathname;
  return visible(renderToStaticMarkup(createElement(Page)));
}

/** 표지가 붙은 section 이 문서의 마지막 요소다(짝 닫는 태그 뒤에는 바깥 닫는 태그만) */
function expectNoteIsLast(html: string) {
  const at = html.indexOf(NOTE);
  expect(at, "상자 없음").toBeGreaterThan(-1);
  expect(html.split(NOTE), "상자가 1번이 아님").toHaveLength(2);
  const start = html.lastIndexOf("<section", at);
  let depth = 0;
  const re = /<section[\s>]|<\/section>/g;
  re.lastIndex = start;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    depth += m[0].startsWith("</") ? -1 : 1;
    if (depth === 0) {
      expect(html.slice(m.index + m[0].length), "상자 뒤에 다른 요소").toMatch(/^(?:<\/[a-z]+>)*$/);
      return;
    }
  }
  throw new Error("상자의 닫는 태그를 찾지 못함");
}

/** 추가 확인: 상자 class 가 렌더 안 다른 section 의 전체 class 목록을 통째로 포함하지 않게 한다(렌더 전체의 section 과 비교).
 *  주의: 실제 자동광고 저장 선택자는 숫자로 끝나는 class·변형 class 를 뺀다(scripts/verify-autoads-paths.mjs keepClass). 그래서
 *  이 검사를 통과해도 상자가 앞 section 의 저장 선택자(예: …>SECTION)에 맞을 수 있다. 그래도 상자는 마지막 형제라 기존 일치 요소의
 *  순번은 바뀌지 않고 끝에 하나가 더해질 뿐이다 — 배치 안전은 expectNoteIsLast 와 아래 소스 검사(마지막 형제)가 지킨다. */
function expectNoSectionSelectorMatchesNote(html: string) {
  const sections = [...html.matchAll(/<section\b([^>]*)>/g)].map((m) => ({
    attrs: m[1],
    classes: (/\bclass="([^"]*)"/.exec(m[1])?.[1] ?? "").split(/\s+/).filter(Boolean),
  }));
  const note = sections.find((s) => s.attrs.includes(NOTE));
  expect(note, "상자 없음").toBeTruthy();
  const own = new Set(note!.classes);
  for (const other of sections) {
    if (other === note) continue;
    expect(other.classes.every((c) => own.has(c)), `section class="${other.classes.join(" ")}" 의 선택자가 상자에도 맞음`).toBe(false);
  }
}

/** 모든 광고 표지·공유 표지가 상자보다 앞에 있다 */
function expectAfterEveryAd(html: string, minimumAds: number) {
  const at = html.indexOf(NOTE);
  const ads = [...html.matchAll(/data-test-ad="[^"]+"/g)];
  expect(ads.length).toBeGreaterThanOrEqual(minimumAds);
  for (const ad of ads) expect(ad.index ?? Infinity, ad[0]).toBeLessThan(at);
  for (const share of html.matchAll(/data-test="(?:share|floating-share)"/g)) expect(share.index ?? Infinity).toBeLessThan(at);
  // 상자 안에는 광고가 없다
  expect(html.slice(at)).not.toContain("data-test-ad=");
}

describe("내용: 작성자·확인 방법·대조일·링크", () => {
  it("홈: 전체 마크업(같은 모양의 기준)", () => {
    expect(renderNote("/")).toBe(
      '<section data-msy-module="editorial-trust-note" aria-labelledby="editorial-trust-note-title" class="">' +
        '<div class="ms-surface p-5 sm:p-6">' +
        '<h2 id="editorial-trust-note-title" class="text-base font-bold text-foreground">만든 사람과 확인 방법</h2>' +
        '<dl class="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">' +
        '<div class="sm:flex sm:gap-4"><dt class="shrink-0 font-semibold text-foreground sm:w-32">작성</dt><dd>머니샐러리 편집팀(현직 직장인 1인 운영)</dd></div>' +
        '<div class="sm:flex sm:gap-4"><dt class="shrink-0 font-semibold text-foreground sm:w-32">확인 방법</dt><dd>공식 자료와 대조: 국세청 근로소득 간이세액표, 4대보험 공단 요율 안내</dd></div>' +
        '<div class="sm:flex sm:gap-4"><dt class="shrink-0 font-semibold text-foreground sm:w-32">공식 자료 대조일</dt><dd><time dateTime="2026-09-25">2026.09.25</time></dd></div>' +
        "</dl>" +
        '<p class="mt-2 flex flex-wrap gap-x-5 text-sm">' +
        '<a href="/about#editorial-method" class="inline-flex min-h-11 items-center font-medium text-link underline underline-offset-4">운영 원칙과 수정 기준</a>' +
        '<a href="/contact" class="inline-flex min-h-11 items-center font-medium text-link underline underline-offset-4">오류 제보</a>' +
        "</p></div></section>",
    );
  });

  it.each([...TARGET_PAGES, ...TABLE_PATHS, "/salary-db/samsung-electronics", "/salary-db/meritz-fire"])("%s: 같은 틀 — 작성자·링크 2개·모듈 표지·광고 없음", (path) => {
    const html = renderNote(path);
    expect(html.startsWith(`<section ${NOTE}`)).toBe(true);
    expect(html).toContain(`<dd>${EDITORIAL_TRUST_AUTHOR}</dd>`);
    expect(hrefs(html)).toEqual(["/about#editorial-method", "/contact"]);
    expect(html.match(/<h2 /g)).toHaveLength(1);
    expect(html).not.toContain("data-test-ad=");
    // 끝 슬래시가 있어도 같은 상자
    expect(renderNote(`${path}/`)).toBe(html);
  });

  it("작성자 표기는 /about 운영자 소개의 사실과 같고 실명이 없다", () => {
    expect(EDITORIAL_TRUST_AUTHOR).toBe("머니샐러리 편집팀(현직 직장인 1인 운영)");
    const about = read("src/app/about/page.tsx");
    expect(about).toContain("현직 직장인 1인이 운영");
    // 링크 목적지(#editorial-method)는 /about 에 실제로 있는 '정보를 확인하고 수정하는 기준' 절이다
    expect(about).toContain('id="editorial-method"');
    expect(about).toContain("정보를 확인하고 수정하는 기준");
  });

  it("언론 보도가 섞인 성과급 계산기 2곳은 '공개 자료'·'자료 대조일' — '공식 자료'라고 쓰지 않는다", () => {
    for (const path of ["/calc/samsung-bonus", "/calc/sk-hynix-bonus"]) {
      const html = renderNote(path);
      expect(html, path).toContain("공개 자료와 대조: ");
      expect(html, path).toContain(">자료 대조일</dt>");
      expect(html, path).not.toContain("공식 자료");
      expect(html, path).toContain("언론 보도");
    }
    const official = [...TARGET_PAGES.filter((p) => !p.startsWith("/calc/")), TABLE_PATHS[0], TABLE_PATHS[4]];
    for (const path of official) {
      const html = renderNote(path);
      expect(html, path).toContain("공식 자료와 대조: ");
      expect(html, path).toContain(">공식 자료 대조일</dt>");
    }
  });

  it("회사 페이지는 날짜 줄 없이 공시 인용값과 자체 추정치를 구분한다", () => {
    const html = renderNote("/salary-db/samsung-electronics");
    expect(html).not.toContain("<time");
    expect(html).not.toContain("대조일");
    // 공시는 '공시가 있는 회사는' 조건부 — 공시 평균급여 카드가 없는 회사 페이지에서도 참인 문장(2026-11-02 통합 수정)
    expect(html).toContain(
      '<dd>공식 자료와 대조: 공시가 있는 회사는 사업보고서 등 공시 원문(공시 평균급여), 실수령액은 국세청 근로소득 간이세액표<span class="mt-1 block">직급별 연봉은 공개 자료를 종합한 자체 추정치입니다.</span></dd>',
    );
    // 날짜가 없는 상자도 같은 틀: 작성·확인 방법 2줄
    expect(html.match(/<dt /g)).toHaveLength(2);
  });

  it("회사 상자의 공시 문구는 조건부 — 공시 평균급여 카드가 없는 회사 페이지에서도 참이다", () => {
    // 회사 페이지의 공시 평균급여 카드(CompanyDisclosedSalary)는 disclosed 가 있을 때만 그린다. 그런 카드가 없는 회사가 있는 한
    // 공시 부분은 무조건형으로 쓰면 안 된다. 실수령액(간이세액표) 부분은 모든 회사 페이지에 해당한다.
    const companies = companyRepository.getAll();
    expect(companies.filter((company) => !company.disclosed).length).toBeGreaterThan(0);
    expect(EDITORIAL_TRUST_COMPANY.sources.startsWith("공시가 있는 회사는 ")).toBe(true);
    expect(EDITORIAL_TRUST_COMPANY.sources).toContain("실수령액은 국세청 근로소득 간이세액표");
  });

  it("보도 인용뿐인 회사 집합 = 서버 데이터로 다시 계산한 집합 — 카드 출처가 원문 링크가 아니고 견줄 DART 값이 없는 회사", () => {
    // 회사 페이지(src/app/salary-db/[id]/page.tsx)는 dartCompanyStatsById 의 DART 값으로만 카드 값과 견준다(5% 넘는 차이 병기·
    // 급여총액÷인원 이력 표). 카드 출처가 DART·알리오 원문이 아니고(CompanyDisclosedSalary '보도:' 라벨) 그 값도 없으면 화면에
    // 공시 원문과 견준 흔적이 없다 — 그 회사의 상자는 '공식 자료와 대조: … 공시 원문'이라고 쓰면 안 된다.
    // 상수 집합은 클라이언트 번들에 실리는 모듈이라 회사 데이터 없이 둔다 — 데이터가 바뀌면 여기서 걸린다.
    const recomputed = companyRepository
      .getAll()
      .filter(
        (company) =>
          company.disclosed &&
          !isOfficialDisclosureUrl(company.disclosed.sourceUrl) &&
          !dartCompanyStatsById.has(company.id),
      )
      .map((company) => company.id)
      .sort();
    expect([...EDITORIAL_TRUST_PRESS_ONLY_COMPANY_IDS].sort()).toEqual(recomputed);
  });

  it("보도 인용뿐인 회사는 '공개 자료와 대조' — 공식 자료·공시 원문이라고 쓰지 않고, 날짜 줄 없이 같은 틀", () => {
    expect(EDITORIAL_TRUST_COMPANY_PRESS.official).toBe(false);
    expect(EDITORIAL_TRUST_COMPANY_PRESS.note).toBe(EDITORIAL_TRUST_COMPANY.note);
    for (const id of EDITORIAL_TRUST_PRESS_ONLY_COMPANY_IDS) {
      const path = `/salary-db/${id}`;
      const html = renderNote(path);
      expect(html, path).toContain(
        '<dd>공개 자료와 대조: 공시를 인용한 언론 보도(공시 평균급여), 실수령액은 국세청 근로소득 간이세액표<span class="mt-1 block">직급별 연봉은 공개 자료를 종합한 자체 추정치입니다.</span></dd>',
      );
      expect(html, path).not.toContain("공식 자료");
      expect(html, path).not.toContain("공시 원문");
      expect(html, path).not.toContain("<time");
      expect(html.match(/<dt /g), path).toHaveLength(2);
      // layout 맨 끝에서도 같은 문구 — 배치는 다른 회사와 같다(마지막 형제)
      const inLayout = renderLayoutAt(path, SalaryDbLayout);
      expectNoteIsLast(inLayout);
      expect(inLayout, path).toContain("공개 자료와 대조: 공시를 인용한 언론 보도(공시 평균급여)");
    }
  });

  it("피부양자 판정기는 화면 출처의 조회 월까지만 쓴다", () => {
    expect(renderNote("/health-insurance-dependent")).toContain('<time dateTime="2026-08">2026.08</time>');
  });

  it("대상 밖 경로는 아무것도 그리지 않는다", () => {
    for (const path of [
      null, undefined, "", "/about", "/calc", "/calc/bmi-quick", "/calc/hyundai-bonus", "/calc/samsung-bonus/extra",
      "/salary-db", "/salary-db/listed", "/salary-db/ranking", "/salary-db/compare", "/salary-db/submit",
      "/salary-db/listed/005930", "/salary-db/compare/samsung-electronics-vs-sk-hynix", "/salary-db/samsung-electronics/extra",
      "/table/2026", "/table/2028/annual", "/table/2026/daily", "/table/2026/annual/extra",
      "/year-end-tax-2027", "/minimum-wage-2026", "/social-insurance-rates-2026", "/__proto__", "/constructor", "/toString",
    ]) {
      expect(editorialTrustNoteFor(path), String(path)).toBeNull();
      expect(renderToStaticMarkup(createElement(EditorialTrustNote, { path })), String(path)).toBe("");
    }
  });

  it("경로 해석: 단일 페이지 9곳·표 8종·회사 페이지 전부", () => {
    expect(TARGET_PAGES).toEqual([
      "/", "/calc/samsung-bonus", "/calc/sk-hynix-bonus", "/health-insurance-dependent", "/minimum-wage-2027",
      "/property-holding-tax-2026", "/social-insurance-rates-2027", "/year-end-tax", "/year-end-tax-preview",
    ]);
    for (const path of TARGET_PAGES) expect(editorialTrustNoteFor(path)).toBe(EDITORIAL_TRUST_PAGES[path]);
    for (const path of TABLE_PATHS) {
      expect(editorialTrustNoteFor(path)).toBe(path.startsWith("/table/2026/") ? EDITORIAL_TRUST_TABLE_2026 : EDITORIAL_TRUST_TABLE_2027);
    }
    // 회사 id 가 회사 아닌 경로 이름과 겹치지 않고, 한글 id 는 인코딩돼 와도 회사로 본다(보도 인용뿐인 회사도 같다)
    const companies = companyRepository.getAll();
    expect(companies.length).toBeGreaterThan(400);
    for (const company of companies) {
      const expected = EDITORIAL_TRUST_PRESS_ONLY_COMPANY_IDS.has(company.id) ? EDITORIAL_TRUST_COMPANY_PRESS : EDITORIAL_TRUST_COMPANY;
      expect(editorialTrustNoteFor(`/salary-db/${company.id}`), company.id).toBe(expected);
      expect(editorialTrustNoteFor(`/salary-db/${encodeURIComponent(company.id)}`), company.id).toBe(expected);
    }
    // 보도 인용뿐인 회사 id 는 실제 회사이고, 깨진 인코딩 경로는 예외 없이 일반 회사 상자
    for (const id of EDITORIAL_TRUST_PRESS_ONLY_COMPANY_IDS) expect(companyRepository.getById(id), id).toBeTruthy();
    expect(editorialTrustNoteFor("/salary-db/%E0%A4%A")).toBe(EDITORIAL_TRUST_COMPANY);
  });

  it("날짜 표기는 PublishedMeta 와 같은 점 표기, 형식이 아니면 날짜 줄 없음", () => {
    expect(formatEditorialTrustDate("2026-11-01")).toBe("2026.11.01");
    expect(formatEditorialTrustDate("2026-08")).toBe("2026.08");
    for (const bad of ["", "2026-13-01", "2026-11-1", "2026-11-32", "20261101", "2026/11/01", "2026-00"]) {
      expect(formatEditorialTrustDate(bad), bad).toBeNull();
    }
  });
});

describe("대조일: 이미 있는 출처 값과 같다 (새 날짜를 만들지 않는다)", () => {
  const page = (path: string) => EDITORIAL_TRUST_PAGES[path].checkedOn;
  const revision = (file: string, name: string) =>
    (pageRevisionFields(read(file), file) as Array<{ name: string; value: string | null }>)
      .filter((field) => field.name === name)
      .map((field) => field.value);
  const datasetModified = (file: string) => [...read(file).matchAll(/dateModified: "(\d{4}-\d{2}-\d{2})"/g)].map((m) => m[1]);

  it("홈·2026 표 = A17 간이세액표 재산출일(TAX_TABLE_EFFECTIVE_DATE) = 2026 표 4종 Dataset dateModified", () => {
    expect(page("/")).toBe(TAX_TABLE_EFFECTIVE_DATE);
    expect(EDITORIAL_TRUST_TABLE_2026.checkedOn).toBe(TAX_TABLE_EFFECTIVE_DATE);
    for (const path of TABLE_PATHS.filter((p) => p.startsWith("/table/2026/"))) {
      expect(datasetModified(`src/app${path}/page.tsx`), path).toEqual([EDITORIAL_TRUST_TABLE_2026.checkedOn]);
    }
  });

  it("2027 표 = 2027 표 4종 Dataset dateModified(장기요양 확정 반영 재산출일)", () => {
    for (const path of TABLE_PATHS.filter((p) => p.startsWith("/table/2027/"))) {
      expect(datasetModified(`src/app${path}/page.tsx`), path).toEqual([EDITORIAL_TRUST_TABLE_2027.checkedOn]);
    }
  });

  it("삼성전자 성과급 = 화면 '페이지 수정일', SK하이닉스 성과급 = psData LAST_UPDATED(화면 '마지막 갱신')", () => {
    const shown = [...read("src/app/calc/samsung-bonus/page.tsx").matchAll(/페이지 수정일: <time dateTime="(\d{4}-\d{2}-\d{2})">/g)].map((m) => m[1]);
    expect(shown).toEqual([page("/calc/samsung-bonus")]);
    expect(page("/calc/sk-hynix-bonus")).toBe(SK_HYNIX_LAST_UPDATED);
  });

  it("연말정산 계산기 = 공제 한도표 근거 문단의 최신 기준일 = 내용 검토 원장 날짜", () => {
    const dates = [...YEAR_END_LIMITS_SOURCE_NOTE.matchAll(/\d{4}-\d{2}-\d{2}/g)].map((m) => m[0]).sort();
    expect(dates.at(-1)).toBe(page("/year-end-tax"));
    expect(ledger.routes["/year-end-tax"].contentDate).toBe(page("/year-end-tax"));
  });

  it("연말정산 미리보기 = 내용 검토 원장 날짜(화면 날짜 필드가 없는 페이지)", () => {
    expect(ledger.routes["/year-end-tax-preview"].contentDate).toBe(page("/year-end-tax-preview"));
  });

  it("2027 4대보험 요율·2027 최저임금 = PublishedMeta updatedDate, 보유세 = metadata modifiedTime", () => {
    for (const path of ["/social-insurance-rates-2027", "/minimum-wage-2027"]) {
      const values = revision(`src/app${path}/page.tsx`, "updatedDate");
      expect(values.length, path).toBeGreaterThan(0);
      for (const value of values) expect(value, path).toBe(page(path));
    }
    expect(revision("src/app/property-holding-tax-2026/page.tsx", "modifiedTime")).toEqual([page("/property-holding-tax-2026")]);
  });

  it("피부양자 판정기 = 화면 출처의 '2026년 8월 조회 기준'(일자 기록 없음)", () => {
    const src = read("src/app/health-insurance-dependent/page.tsx");
    expect(src).toContain("국민건강보험공단 피부양자 자격 안내 (2026년 8월 조회 기준)");
    expect(page("/health-insurance-dependent")).toBe("2026-08");
  });

  it("대조일은 그 페이지의 내용 검토일보다 늦을 수 없고, 회사 페이지에는 없다", () => {
    for (const path of [...TARGET_PAGES, ...TABLE_PATHS]) {
      const checked = editorialTrustNoteFor(path)?.checkedOn;
      expect(checked, path).toMatch(/^\d{4}-\d{2}(?:-\d{2})?$/);
      const reviewed = ledger.routes[path]?.contentDate;
      expect(reviewed, `${path} 원장 항목`).toBeTruthy();
      expect(checked! <= reviewed!, `${path}: ${checked} > ${reviewed}`).toBe(true);
    }
    expect(EDITORIAL_TRUST_COMPANY.checkedOn).toBeUndefined();
    expect(EDITORIAL_TRUST_COMPANY_PRESS.checkedOn).toBeUndefined();
  });
});

describe("배치: layout 맨 끝(계산기·표·회사 페이지)", () => {
  it.each(["/calc/samsung-bonus", "/calc/sk-hynix-bonus"])("%s: calc 광고 블록·공유·보도 요약·이어서 볼 내용 뒤 맨 끝", (path) => {
    const html = renderLayoutAt(path, CalcLayout);
    expect(html.indexOf('data-test="page-body"')).toBeLessThan(html.indexOf('data-test-ad="in-article"'));
    expectAfterEveryAd(html, 3);
    for (const box of ['data-msy-module="calc-news-note"', 'data-msy-module="topic-next-steps"']) {
      if (html.includes(box)) expect(html.indexOf(box)).toBeLessThan(html.indexOf(NOTE));
    }
    expectNoteIsLast(html);
    expectNoSectionSelectorMatchesNote(html);
  });

  it.each(["/calc", "/calc/bmi-quick", "/calc/2026-year", "/calc/hyundai-bonus"])("%s: 다른 계산기는 상자 없음", (path) => {
    expect(renderLayoutAt(path, CalcLayout)).not.toContain(NOTE);
  });

  it.each(TABLE_PATHS)("%s: 표 위 광고·본문·PageFooterAds·공유·비교 상자 뒤 맨 끝", (path) => {
    const html = renderLayoutAt(path, path.startsWith("/table/2026/") ? Table2026Layout : Table2027Layout);
    expectAfterEveryAd(html, 4);
    expect(html.indexOf('data-msy-module="salary-table-comparison"')).toBeGreaterThan(-1);
    expect(html.indexOf('data-msy-module="salary-table-comparison"')).toBeLessThan(html.indexOf(NOTE));
    expectNoteIsLast(html);
    expectNoSectionSelectorMatchesNote(html);
    expect(html).toContain(path.startsWith("/table/2026/") ? '<time dateTime="2026-09-25">2026.09.25</time>' : '<time dateTime="2026-11-01">2026.11.01</time>');
  });

  it("표 밖 경로는 상자 없음", () => {
    expect(renderLayoutAt("/table/2026", Table2026Layout)).not.toContain(NOTE);
    expect(renderLayoutAt("/table/2027", Table2027Layout)).not.toContain(NOTE);
  });

  it.each(["/salary-db/samsung-electronics", "/salary-db/sk-hynix", "/salary-db/naver"])("%s: PageFooterAds·직업 링크·공유 뒤 맨 끝", (path) => {
    const html = renderLayoutAt(path, SalaryDbLayout);
    expectAfterEveryAd(html, 3);
    if (html.includes('data-msy-module="job-related"')) {
      expect(html.indexOf('data-msy-module="job-related"')).toBeLessThan(html.indexOf(NOTE));
    }
    expectNoteIsLast(html);
    expectNoSectionSelectorMatchesNote(html);
  });

  it.each(["/salary-db", "/salary-db/ranking", "/salary-db/listed", "/salary-db/listed/005930", "/salary-db/compare/samsung-electronics-vs-sk-hynix"])(
    "%s: 회사 아닌 /salary-db 페이지는 상자 없음",
    (path) => {
      expect(renderLayoutAt(path, SalaryDbLayout)).not.toContain(NOTE);
    },
  );
});

describe("배치: 단일 페이지는 마지막 광고 아래 컨테이너 맨 끝", () => {
  const pages: Array<[string, () => ReactNode, number]> = [
    ["/", HomePage as () => ReactNode, 1],
    ["/year-end-tax", YearEndTaxPage as () => ReactNode, 6],
    ["/year-end-tax-preview", YearEndTaxPreviewPage as () => ReactNode, 5],
    ["/social-insurance-rates-2027", SocialInsurance2027Page as () => ReactNode, 6],
    ["/minimum-wage-2027", MinimumWage2027Page as () => ReactNode, 5],
    ["/health-insurance-dependent", DependentPage as () => ReactNode, 5],
    ["/property-holding-tax-2026", PropertyHoldingTaxPage as () => ReactNode, 6],
  ];

  it.each(pages)("%s", (path, Page, minimumAds) => {
    const html = renderPageAt(path, Page);
    expectAfterEveryAd(html, minimumAds);
    expectNoteIsLast(html);
    expectNoSectionSelectorMatchesNote(html);
    expect(html).toContain(`<dd>${EDITORIAL_TRUST_AUTHOR}</dd>`);
  });
});

describe("소스: 상자는 광고 뒤 마지막 형제, 회사 page.tsx 에는 없음", () => {
  const AD_TAG_SOURCE =
    "<(?:HomeTopAd|CalcResultAd|ResultAd|GuideMidAd|SidebarAd|InArticleAd|MultiplexAd|Display2Ad|CompanyTopAd|PageFooterAds|CoupangBanner|AffiliateSlot|OfferSlot)\\b";
  const AD_TAG = new RegExp(AD_TAG_SOURCE, "g");
  const HAS_AD_TAG = new RegExp(AD_TAG_SOURCE);

  it.each([
    ["src/app/calc/layout.tsx", "<EditorialTrustNoteFromPath", "</>"],
    ["src/app/table/2026/layout.tsx", "<EditorialTrustNoteFromPath", "</>"],
    ["src/app/table/2027/layout.tsx", "<EditorialTrustNoteFromPath", "</>"],
    ["src/app/salary-db/layout.tsx", "<EditorialTrustNoteFromPath", "</>"],
    ["src/app/page.tsx", "<EditorialTrustNote ", "</>"],
    ["src/app/year-end-tax/page.tsx", "<EditorialTrustNote ", "</div></section></main>"],
    ["src/app/year-end-tax-preview/page.tsx", "<EditorialTrustNote ", "</div></div></main>"],
    ["src/app/social-insurance-rates-2027/page.tsx", "<EditorialTrustNote ", "</div></main>"],
    ["src/app/minimum-wage-2027/page.tsx", "<EditorialTrustNote ", "</div></main>"],
    ["src/app/health-insurance-dependent/page.tsx", "<EditorialTrustNote ", "</div></main>"],
    ["src/app/property-holding-tax-2026/page.tsx", "<EditorialTrustNote ", "</div></main>"],
  ] as const)("%s: 모든 광고 태그 뒤, 바로 다음은 닫는 태그", (file, tag, close) => {
    const src = code(file);
    const at = src.indexOf(tag);
    expect(at, `${file} 에 ${tag} 없음`).toBeGreaterThan(-1);
    expect(src.split(tag)).toHaveLength(2);
    const ads = [...src.matchAll(AD_TAG)];
    if (file !== "src/app/page.tsx") expect(ads.length, file).toBeGreaterThan(0);
    for (const ad of ads) expect(ad.index ?? Infinity, `${file}: ${ad[0]} 가 상자 뒤`).toBeLessThan(at);
    const rest = src.slice(src.indexOf("/>", at) + 2).replace(/\s+/g, "");
    expect(rest.startsWith(close), `${file}: 상자 뒤 ${rest.slice(0, 40)}`).toBe(true);
  });

  it("홈: 마지막 광고(MultiplexAd)는 HomeClient 끝이고 그 뒤 본문(HomeSeoSection)에는 광고가 없다", () => {
    const home = code("src/app/HomeClient.tsx");
    const ads = [...home.matchAll(AD_TAG)];
    expect(ads.at(-1)?.[0]).toBe("<MultiplexAd");
    expect(code("src/components/home/HomeSeoSection.tsx")).not.toMatch(HAS_AD_TAG);
    const page = code("src/app/page.tsx");
    expect(page.indexOf("<HomeClient")).toBeLessThan(page.indexOf("<HomeSeoSection"));
    expect(page.indexOf("<FloatingShareBar />")).toBeLessThan(page.indexOf("<EditorialTrustNote "));
  });

  it("회사·상장 lite page.tsx 에는 상자를 두지 않는다(PageFooterAds 위가 된다)", () => {
    for (const file of ["src/app/salary-db/[id]/page.tsx", "src/app/salary-db/listed/[stockCode]/page.tsx"]) {
      expect(read(file), file).not.toContain("EditorialTrustNote");
    }
  });

  it("클라이언트 번들에 실리는 내용 모듈은 상수 모듈만 import 한다", () => {
    const imports = [...read("src/lib/editorialTrust.ts").matchAll(/^import[^;]+from\s+["']([^"']+)["']/gm)].map((m) => m[1]);
    expect(imports).toEqual(["@/config/siteDates"]);
    expect(read("src/components/EditorialTrustNoteFromPath.tsx").startsWith('"use client"')).toBe(true);
  });
});
