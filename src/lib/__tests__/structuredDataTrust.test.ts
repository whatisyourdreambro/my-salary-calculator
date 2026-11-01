// G3 구조화 데이터 신뢰 보강 가드 (2026-11-01 운영자 승인 '구글 개선' 4번 — 근거: 11/1 분석 세션 보고서 (b)(c)·(d)).
//  1) 사이트 Organization: sameAs = 공식 네이버 블로그, contactPoint = 고객 지원(/contact·공개 문의 이메일). 그 밖의 사실
//     (전화·주소·사람 이름)은 싣지 않는다. 이메일·문의 페이지가 사이트에 실제로 공개돼 있는지도 소스로 묶는다.
//  2) 정적 페이지 JSON-LD 앱 날짜(홈 WebApplication·계산기 SoftwareApplication dateModified)는 사이트맵 lastmod 와 같은 함수
//     (src/app/sitemap.ts staticRouteLastModified)에서 온다 — 운영 홈 7/16·삼성 성과급 10/9 가 사이트맵 10/19 와 어긋났던 것.
//     같은 한 줄 수정으로 맞는 /calc/hyundai-bonus(9/19 → 사이트맵 9/25)·/calc/year-end-bonus(9/9 → 9/25)도 함께 바꿨다.
//  3) 그 함수는 종전 sitemap() 정적 URL 계산과 같은 값이다(정적 페이지 전부 대조). 상수만 읽어 빌드 시각과 무관하다.
//  4) 문자열로 남은 앱 날짜는 그 페이지 사이트맵 한국 날짜와 같아야 한다 — 새 하드코딩 어긋남을 막는다.
//     Dataset dateModified(데이터 기준일)는 대상이 아니다(scripts/lib/sitemap-freshness.mjs pageRevisionFields 주석과 같은 원칙).
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { organizationLd, softwareApplicationLd, webApplicationLd } from "@/lib/structuredData";
import { STATIC_LAST_MODIFIED, toKstIsoDateTime } from "@/config/siteDates";
import { staticRouteLastModified } from "@/app/sitemap";
import { LAST_UPDATED as SK_HYNIX_LAST_UPDATED } from "@/app/calc/sk-hynix-bonus/psData";
import { appLdDateFields, koreanDay } from "../../../scripts/lib/sitemap-freshness.mjs";

const ROOT = process.cwd();
const APP = join(ROOT, "src", "app");
const SITE = "https://www.moneysalary.com";

type AppLdField = { builder: string; route: string | null; value: string | null };

/** sitemap() 은 지연 require(@/...)를 써서 앱과 같은 tsx 경로 해석으로 실행한다(네트워크 금지, 서버·브라우저 없음).
 *  single = staticRouteLastModified 가 받아 준 경로(정적 라우트)의 값, rejected = 던진 경로 */
function sitemapRows(): { rows: Array<{ path: string; lastModified: string }>; single: Record<string, string>; rejected: string[] } {
  const fixture = `globalThis.fetch=()=>{throw new Error('Network forbidden')};
    const {default:sitemap,staticRouteLastModified}=require('./src/app/sitemap.ts');
    const rows=sitemap().map(row=>({path:new URL(row.url).pathname,lastModified:new Date(row.lastModified).toISOString()}));
    const single={}, rejected=[];
    for (const row of rows) { try { single[row.path]=staticRouteLastModified(row.path).toISOString(); } catch (error) { rejected.push(row.path); } }
    console.log(JSON.stringify({rows,single,rejected}));`;
  return JSON.parse(execFileSync(process.execPath, ["--import", "tsx", "-e", fixture], {
    cwd: ROOT, encoding: "utf8", timeout: 60_000, maxBuffer: 8 * 1024 * 1024,
  }));
}

/** 사이트맵 경로 중 정적 page.tsx 가 그 자리에 있는 것 (동적 [slug] 템플릿은 제외) */
const staticPageFile = (route: string) => join(APP, route === "/" ? "" : route.slice(1), "page.tsx");

describe("사이트 Organization — 공식 채널·문의처 (G3)", () => {
  it("sameAs 는 공식 네이버 블로그, contactPoint 는 고객 지원(/contact·공개 이메일)만 싣는다", () => {
    expect(organizationLd()).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "머니샐러리",
      url: SITE,
      logo: `${SITE}/logo-full.png`,
      sameAs: ["https://blog.naver.com/www_moneysalary_com"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: `${SITE}/contact`,
        email: "moneysalary.help@gmail.com",
      },
    });
  });

  it("JSON 으로 그대로 직렬화되고, 호출마다 새 배열·객체라 한 페이지의 변경이 다른 페이지로 새지 않는다", () => {
    const first = organizationLd();
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);
    (first.sameAs as string[]).push("https://example.com/");
    (first.contactPoint as Record<string, string>).email = "changed@example.com";
    const second = organizationLd();
    expect(second.sameAs).toEqual(["https://blog.naver.com/www_moneysalary_com"]);
    expect(second.contactPoint.email).toBe("moneysalary.help@gmail.com");
  });

  it("공개되지 않은 사실(전화·주소·사람 이름)은 싣지 않는다", () => {
    const text = JSON.stringify(organizationLd());
    for (const key of ["telephone", "address", "founder", "employee", "member", "person", "Person"]) {
      expect(text, key).not.toContain(`"${key}"`);
    }
  });

  it("문의 이메일과 문의 페이지는 사이트에 이미 공개돼 있다 (개인정보 처리방침 7항·/contact)", () => {
    expect(readFileSync(join(APP, "privacy", "page.tsx"), "utf8")).toContain("이메일 moneysalary.help@gmail.com");
    expect(readFileSync(join(APP, "en", "privacy", "page.tsx"), "utf8")).toContain("moneysalary.help@gmail.com");
    expect(existsSync(join(APP, "contact", "page.tsx"))).toBe(true);
  });
});

describe("JSON-LD 날짜 표기·빌더 (G3)", () => {
  it("toKstIsoDateTime 은 같은 순간을 +09:00 로 쓴다 (한국 자정이 전날 15:00Z 로 보이지 않게)", () => {
    expect(toKstIsoDateTime(new Date("2026-10-19T00:00:00+09:00"))).toBe("2026-10-19T00:00:00+09:00");
    expect(toKstIsoDateTime(new Date("2026-10-18T15:00:00.000Z"))).toBe("2026-10-19T00:00:00+09:00");
    expect(toKstIsoDateTime(STATIC_LAST_MODIFIED)).toBe("2026-07-16T09:00:00+09:00");
    for (const day of ["2026-10-19T00:00:00+09:00", "2026-09-25T00:00:00.000Z", "2026-07-16T00:00:00.000Z"]) {
      expect(new Date(toKstIsoDateTime(new Date(day))).getTime()).toBe(new Date(day).getTime());
    }
    expect(() => toKstIsoDateTime(new Date("not a date"))).toThrow(/Invalid content date/);
  });

  it("softwareApplicationLd: Date 는 한국 시각 ISO, 문자열은 그대로, 없으면 키 없음", () => {
    const base = { name: "t", description: "d", url: "/calc/x" };
    expect(softwareApplicationLd({ ...base, dateModified: new Date("2026-11-01T00:00:00+09:00") }).dateModified).toBe("2026-11-01T00:00:00+09:00");
    expect(softwareApplicationLd({ ...base, dateModified: "2026-11-01" }).dateModified).toBe("2026-11-01");
    expect("dateModified" in softwareApplicationLd(base)).toBe(false);
  });

  it("webApplicationLd 는 날짜를 반드시 받는다 — STATIC_LAST_MODIFIED 기본값으로 되돌아가지 않는다", () => {
    // @ts-expect-error dateModified 필수 (G3)
    expect(() => webApplicationLd()).toThrow();
    expect(webApplicationLd({ dateModified: new Date("2026-10-19T00:00:00+09:00") }).dateModified).toBe("2026-10-19T00:00:00+09:00");
  });
});

describe("정적 페이지 JSON-LD 앱 날짜 = 사이트맵 lastmod (G3 단일 소스)", () => {
  let single: Record<string, string> = {};
  let rejected: string[] = [];
  let rows: Array<{ path: string; lastModified: string }> = [];
  /** 사이트맵 경로 가운데 정적 page.tsx 가 그 자리에 있는 것 — 앱 JSON-LD 날짜를 소스로 볼 수 있는 페이지 */
  let pageRows: Array<{ path: string; lastModified: string }> = [];
  beforeAll(() => {
    ({ rows, single, rejected } = sitemapRows());
    pageRows = rows.filter((row) => existsSync(staticPageFile(row.path)));
  }, 90_000);

  it("staticRouteLastModified 는 사이트맵 정적 URL 의 lastModified 와 전부 같다 (홈·성과급 계산기 포함)", () => {
    const accepted = rows.filter((row) => row.path in single);
    expect(accepted.length).toBeGreaterThan(190); // 2026-11-01 정적 블록 197곳 (동결 — 새 URL 없음)
    for (const row of accepted) expect(single[row.path], row.path).toBe(row.lastModified);
    for (const route of ["/", "/calc/samsung-bonus", "/calc/hyundai-bonus", "/calc/year-end-bonus", "/en"]) {
      expect(single[route], route).toBeDefined();
      // vitest 안에서 불러도 같은 값 (페이지가 import 하는 경로 그대로 — sitemap() 의 지연 require 없이 동작)
      expect(staticRouteLastModified(route).toISOString(), route).toBe(single[route]);
    }
  });

  it("사이트맵이 다른 규칙으로 날짜를 정하는 경로는 받지 않고 던진다 (다른 날짜를 조용히 돌려주지 않게)", () => {
    // 정적 page 가 있어도 회사·표·리포트·직업 블록이 날짜를 정하는 곳, 동적 템플릿
    for (const route of ["/salary-db/listed", "/salary-db", "/insights", "/job", "/table/2026/annual", "/salary/50000000", "/salary-db/samsung-electronics"]) {
      expect(rejected, route).toContain(route);
      expect(() => staticRouteLastModified(route), route).toThrow(/사이트맵 정적 라우트가 아님/);
    }
    expect(() => staticRouteLastModified("/no-such-route")).toThrow(/사이트맵 정적 라우트가 아님/);
  });

  it("홈 날짜는 사이트맵 홈 lastmod(2026-10-19 한국 자정)이고 STATIC_LAST_MODIFIED(7/16)가 아니다", () => {
    expect(single["/"]).toBe("2026-10-18T15:00:00.000Z");
    expect(toKstIsoDateTime(staticRouteLastModified("/"))).toBe("2026-10-19T00:00:00+09:00");
    expect(staticRouteLastModified("/").getTime()).not.toBe(STATIC_LAST_MODIFIED.getTime());
  });

  it("sitemap 모듈(사이트맵 데이터 import)은 클라이언트 파일에서 import 하지 않는다", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const abs = join(dir, name);
        if (statSync(abs).isDirectory()) {
          if (name !== "__tests__" && name !== "node_modules") walk(abs);
        } else if (/\.tsx?$/.test(name)) {
          const src = readFileSync(abs, "utf8");
          if (/^\s*["']use client["']/m.test(src.slice(0, 400)) && /from ["'](?:@\/app\/sitemap|\.{1,2}\/(?:\.\.\/)*sitemap)["']/.test(src)) offenders.push(abs);
        }
      }
    };
    walk(join(ROOT, "src"));
    expect(offenders).toEqual([]);
  });

  it("홈·삼성·현대차·성과급 세금 계산기는 자기 경로로 staticRouteLastModified 를 부른다", () => {
    const expected: Record<string, string> = {
      "/": "webApplicationLd",
      "/calc/samsung-bonus": "softwareApplicationLd",
      "/calc/hyundai-bonus": "softwareApplicationLd",
      "/calc/year-end-bonus": "softwareApplicationLd",
    };
    for (const [route, builder] of Object.entries(expected)) {
      const source = readFileSync(staticPageFile(route), "utf8");
      expect(source, route).toContain('import { staticRouteLastModified } from "@/app/sitemap";');
      expect(appLdDateFields(source, staticPageFile(route)) as AppLdField[], route).toEqual([{ builder, route, value: null }]);
    }
  });

  it("정적 page.tsx 의 앱 JSON-LD 날짜는 전부 그 페이지 사이트맵 한국 날짜와 같다 (문자열 하드코딩 어긋남 차단)", () => {
    expect(pageRows.length).toBeGreaterThan(180);
    let literal = 0;
    for (const row of pageRows) {
      const file = staticPageFile(row.path);
      const fields = appLdDateFields(readFileSync(file, "utf8"), file) as AppLdField[];
      for (const field of fields) {
        if (field.route !== null) {
          expect(field.route, `${row.path} staticRouteLastModified 인자`).toBe(row.path);
          expect(single[row.path], `${row.path} 는 staticRouteLastModified 가 받는 정적 라우트여야 한다`).toBe(row.lastModified);
        } else if (field.value !== null) {
          literal++;
          const value = field.value.length === 10 ? `${field.value}T00:00:00+09:00` : field.value;
          expect(koreanDay(value), `${row.path} ${field.builder} dateModified=${field.value}`).toBe(koreanDay(row.lastModified));
        } else {
          // 정적 판정 불가는 개별 확인한 곳만 — SK하이닉스는 psData.LAST_UPDATED(화면 '마지막 갱신'과 같은 상수)
          expect(row.path, "정적 판정 불가 앱 날짜는 이 테스트에서 개별 확인해야 한다").toBe("/calc/sk-hynix-bonus");
          expect(koreanDay(`${SK_HYNIX_LAST_UPDATED}T00:00:00+09:00`)).toBe(koreanDay(row.lastModified));
        }
      }
    }
    // /calc/offer-compare 의 "2026-11-01" 같은 남은 문자열도 사이트맵과 같은 날이다(바꾸지 않은 이유: 어긋나지 않음)
    expect(literal).toBeGreaterThanOrEqual(1);
  });
});
